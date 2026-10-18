// pnpm shots <site> [paths…] — screenshots of a built site at 390 and 1440, Arabic and English.
// Output: .check/screens/<site>/<name>-<width>-<lang>.png

import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { resolveSite, ROOT, SITES_DIR } from './lib/sites.ts';
import { serveDir } from './lib/serve.ts';

const args = process.argv.slice(2);
const name = resolveSite(args[0] ?? '');
const paths = args.slice(1).filter((a) => !a.startsWith('--'));
const full = args.includes('--full');
const widths = args.includes('--mobile') ? [390] : args.includes('--desktop') ? [1440] : [390, 1440];
const langs = args.includes('--ar') ? ['ar'] : args.includes('--en') ? ['en'] : ['ar', 'en'];
const list = paths.length ? paths : ['/'];

const out = join(ROOT, '.check', 'screens', name);
mkdirSync(out, { recursive: true });
const { server, url } = await serveDir(join(SITES_DIR, name, 'dist'));
const browser = await chromium.launch({ channel: 'chrome' });
try {
  for (const width of widths) {
    const ctx = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const errors: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    page.on('pageerror', (e) => errors.push(e.message));
    for (const lang of langs) {
      for (const p of list) {
        const target = `${url}${lang === 'en' ? (p === '/' ? '/en/' : `/en${p}`) : p}`;
        await page.goto(target, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        const file = join(out, `${p.replace(/\//g, '_').replace(/^_|_$/g, '') || 'home'}-${width}-${lang}.png`);
        await page.screenshot({ path: file, fullPage: full });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        console.log(`${file}${overflow > 0 ? `  ⚠ horizontal overflow ${overflow}px` : ''}`);
      }
    }
    if (errors.length) console.log(`console errors at ${width}:\n  ${[...new Set(errors)].join('\n  ')}`);
    await ctx.close();
  }
} finally {
  await browser.close();
  server.close();
}
