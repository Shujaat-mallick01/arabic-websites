// pnpm e2e <site> — drives the real purchase or booking flow in Chrome against the built site with
// its API in-process: product → cart → checkout → demo gateway → return → order → owner.
// Screenshots of every step go to .check/e2e/<site>/.

import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, type Page } from 'playwright';
import { resolvePreset } from '@aw/presets';
import { loadSite, resolveSite, ROOT } from './lib/sites.ts';
import { serveDir } from './lib/serve.ts';
import { apiRouter } from './lib/api.ts';

const name = resolveSite(process.argv[2] ?? '');
const s = await loadSite(name);
const r = resolvePreset(s.site);
const out = join(ROOT, '.check', 'e2e', name);
mkdirSync(out, { recursive: true });
process.env.PAYMENTS_MODE = 'mock';
const api = apiRouter(s.dir, s.site);
const { server, url } = await serveDir(join(s.dir, 'dist'), 0, api ?? undefined);
process.env.URL = url;
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors: string[] = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
let step = 0;
const shot = async (label: string) => page.screenshot({ path: join(out, `${String(++step).padStart(2, '0')}-${label}.png`), fullPage: true });
const ok = (cond: unknown, msg: string) => {
  if (!cond) throw new Error(`✗ ${msg}`);
  console.log(`✓ ${msg}`);
};

async function chooseOptions(p: Page) {
  for (const fs of await p.locator('aw-product-form fieldset[data-option]').all()) {
    const radio = fs.locator('input[type=radio]').first();
    if (await radio.count()) await radio.check({ force: true });
  }
  for (const sel of await p.locator('aw-product-form select').all()) {
    const v = await sel.locator('option').nth(1).getAttribute('value');
    if (v) await sel.selectOption(v);
  }
}

try {
  if (r.flows.order === 'checkout') {
    const product = (await (await fetch(`${url}/_aw/catalog.json`)).json()).products.find((p: { availability: string; quantity: { min: number } }) => p.availability !== 'sold_out');
    await page.goto(`${url}/products/${product.slug}/`, { waitUntil: 'networkidle' });
    await chooseOptions(page);
    await page.locator('aw-product-form button[type=submit]').click();
    await page.waitForSelector('#aw-cart[open]');
    await shot('cart-drawer');
    ok((await page.locator('aw-cart-count').textContent())?.trim() !== '', 'item added to the cart');
    await page.goto(`${url}/checkout/`, { waitUntil: 'networkidle' });
    await page.fill('#co-name', 'مريم علي');
    const country = s.site.locale.country;
    const phones: Record<string, string> = { BH: '36001234', KW: '55001234', SA: '0551234567', IQ: '07701234567' };
    await page.fill('#co-phone', phones[country] ?? '36001234');
    for (const input of await page.locator('[data-mode-panel="delivery"] input[required]').all()) await input.fill('12');
    await page.waitForTimeout(400);
    await shot('checkout-filled');
    // First try an invalid phone to see the exact message, then fix it.
    await page.fill('#co-phone', '360012');
    await page.waitForTimeout(3100);
    await page.locator('[data-submit]').click();
    await page.waitForSelector('[data-errors]:not(.hidden)');
    const err = await page.locator('#err-phone').textContent();
    ok(err && /أرقام|digits/.test(err), `phone error explains the fix: "${err}"`);
    await shot('checkout-error');
    await page.fill('#co-phone', phones[country] ?? '36001234');
    await page.locator('[name="payment"][value="online"]').check();
    await page.locator('[data-submit]').click();
    await page.waitForURL(/\/pay\/mock\//);
    await page.waitForFunction(() => document.querySelector('[data-amount]')?.textContent !== '—');
    await shot('mock-gateway');
    await page.locator('[data-go]').click();
    await page.waitForURL(/\/order\//, { timeout: 15000 });
    await page.waitForSelector('[data-found]:not([hidden])');
    await shot('order-page');
    const status = await page.locator('[data-status]').textContent();
    ok(status?.includes('مدفوع') || status?.includes('Paid'), `order is paid (${status})`);
    await page.goto(`${url}/owner/`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-order]');
    await shot('owner');
    ok((await page.locator('[data-order]').count()) > 1, 'owner dashboard lists orders');
  }
  if (errors.length) console.log(`console errors:\n  ${[...new Set(errors)].join('\n  ')}`);
  console.log(`screens: ${out}`);
} finally {
  await browser.close();
  server.close();
}
