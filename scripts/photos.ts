// Stock photos from Openverse (CC0 / CC BY, commercial use and modification allowed).
//
//   pnpm photos search <key> "<query>" [--sources=stocksnap,rawpixel,wordpress] [--aspect=tall|wide|square] [--page=1]
//       → .cache/photos/<key>.json and a numbered contact sheet .cache/photos/<key>.png
//   pnpm photos apply <site>
//       → reads sites/<site>/brand/photos.json, downloads each pick, crops, grades with the
//         brand's photo tokens, writes WebP into the content folder and records the credit in
//         sites/<site>/brand/image-credits.json (shown on the site's /credits/ page).
//
// Anonymous Openverse limits are 20 requests/min and 200/day, so results are cached.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import sharp from 'sharp';
import { loadSite, resolveSite, ROOT } from './lib/sites.ts';

const CACHE = join(ROOT, '.cache', 'photos');
mkdirSync(CACHE, { recursive: true });
const UA = { 'user-agent': 'aw-portfolio-builder/1.0 (demo sites; contact via studio)' };

interface Hit {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  creator: string | null;
  creator_url: string | null;
  foreign_landing_url: string;
  license: string;
  license_version: string;
  license_url: string;
  source: string;
  width: number;
  height: number;
}

async function get(url: string, tries = 3): Promise<Response> {
  for (let i = 0; ; i++) {
    const res = await fetch(url, { headers: UA });
    if (res.ok || i >= tries - 1 || (res.status !== 429 && res.status < 500)) return res;
    await new Promise((r) => setTimeout(r, 4000 * (i + 1)));
  }
}

async function fetchImage(hit: Hit, thumb = false): Promise<Buffer> {
  // StockSnap and WordPress serve web-sized files directly; other sources can be huge originals.
  const direct = ['stocksnap', 'wordpress'].includes(hit.source) || (!thumb && hit.width * hit.height < 40e6);
  const url = thumb && !direct ? hit.thumbnail : hit.url;
  const file = join(CACHE, 'img', `${hit.id}${thumb && !direct ? '-t' : ''}.bin`);
  if (existsSync(file)) return readFileSync(file);
  const res = await get(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, buf);
  return buf;
}

async function search(key: string, query: string, flags: Record<string, string>) {
  const qs = new URLSearchParams({
    q: query,
    license_type: 'commercial,modification',
    license: flags.license ?? 'cc0,pdm,by',
    page_size: '20',
    page: flags.page ?? '1',
    mature: 'false',
    ...(flags.sources !== 'any' ? { source: flags.sources ?? 'stocksnap,rawpixel,wordpress' } : {}),
    ...(flags.aspect ? { aspect_ratio: flags.aspect } : {}),
    ...(flags.size ? { size: flags.size } : {}),
  });
  const res = await get(`https://api.openverse.org/v1/images/?${qs}`);
  if (!res.ok) throw new Error(`Openverse ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { result_count: number; results: Hit[] };
  console.log(`${data.result_count} results · limit left: ${res.headers.get('x-ratelimit-available-anon_sustained')}/day`);
  const hits = data.results;
  writeFileSync(join(CACHE, `${key}.json`), JSON.stringify({ query, flags, hits }, null, 1));
  // Contact sheet: 5 columns of 260×320 tiles with the index in the corner.
  const W = 260;
  const H = 320;
  const cols = 5;
  const tiles = await Promise.all(
    hits.map(async (h, i) => {
      try {
        const img = await sharp(await fetchImage(h, true)).resize(W, H, { fit: 'cover' }).toBuffer();
        const label = Buffer.from(`<svg width="${W}" height="${H}"><rect width="58" height="30" fill="#000" opacity=".75"/><text x="8" y="22" font-family="Arial" font-size="20" fill="#fff">${i}</text><text x="${W - 6}" y="${H - 8}" text-anchor="end" font-family="Arial" font-size="13" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke">${h.source} ${h.license} ${h.width}×${h.height}</text></svg>`);
        return { input: await sharp(img).composite([{ input: label }]).toBuffer(), left: (i % cols) * W, top: Math.floor(i / cols) * H };
      } catch (e) {
        console.log(`  ${i}: ${(e as Error).message}`);
        return null;
      }
    }),
  );
  const rows = Math.ceil(hits.length / cols) || 1;
  await sharp({ create: { width: cols * W, height: rows * H, channels: 3, background: '#888' } })
    .composite(tiles.filter((t): t is NonNullable<typeof t> => !!t))
    .png()
    .toFile(join(CACHE, `${key}.png`));
  hits.forEach((h, i) => console.log(`${String(i).padStart(2)} ${h.source.padEnd(10)} ${h.license.padEnd(4)} ${String(h.width).padStart(5)}×${String(h.height).padEnd(5)} ${(h.title ?? "").slice(0, 60)}`));
  console.log(`sheet: ${join(CACHE, `${key}.png`)}`);
}

interface Pick {
  /** Destination relative to the site's src/content, e.g. products/nasma-kaftan/1.webp */
  dest: string;
  /** "<search key>#<index>" */
  ref: string;
  w: number;
  h: number;
  /** sharp crop position: centre, top, bottom, left, right, entropy, attention, or "x,y" focus 0..1 */
  pos?: string;
  /** Crop tighter than "cover" (2 = a 2× close-up around pos). Implies a focus crop. */
  zoom?: number;
  /** Flip horizontally (useful in RTL layouts so subjects face the text). */
  flip?: boolean;
  /** Skip the brand grade (e.g. already-matched photos). */
  raw?: boolean;
}

export interface Credit {
  file: string;
  title: string;
  creator: string | null;
  creatorUrl: string | null;
  source: string;
  landing: string;
  license: string;
  licenseUrl: string;
  modified: boolean;
}

function hitFor(ref: string): Hit {
  const [key, idx] = ref.split('#');
  const file = join(CACHE, `${key}.json`);
  if (!existsSync(file)) throw new Error(`No cached search "${key}". Run: pnpm photos search ${key} "<query>"`);
  const hit = (JSON.parse(readFileSync(file, 'utf8')).hits as Hit[])[Number(idx)];
  if (!hit) throw new Error(`No result #${idx} in "${key}"`);
  return hit;
}

async function apply(siteArg: string) {
  const name = resolveSite(siteArg);
  const s = await loadSite(name);
  const manifest = join(s.dir, 'brand', 'photos.json');
  const picks = JSON.parse(readFileSync(manifest, 'utf8')) as Pick[];
  const tokens = (await import(`file://${join(s.dir, 'brand', 'tokens.ts').replace(/\\/g, '/')}`)).default;
  const g = tokens.photo?.grade ?? {};
  const credits: Credit[] = [];
  for (const p of picks) {
    const hit = hitFor(p.ref);
    let img = sharp(await fetchImage(hit)).rotate();
    if (p.flip) img = img.flop();
    if (p.zoom && !p.pos?.includes(',')) p.pos = '0.5,0.5';
    const pos = p.pos?.includes(',') ? undefined : (p.pos ?? 'attention');
    if (p.pos?.includes(',')) {
      // Focus point crop: scale to cover, then extract around the focus.
      const meta = await sharp(await fetchImage(hit)).metadata();
      const scale = Math.max(p.w / meta.width!, p.h / meta.height!) * (p.zoom ?? 1);
      const sw = Math.round(meta.width! * scale);
      const sh = Math.round(meta.height! * scale);
      const [fx, fy] = p.pos.split(',').map(Number) as [number, number];
      const left = Math.min(Math.max(0, Math.round(fx * sw - p.w / 2)), sw - p.w);
      const top = Math.min(Math.max(0, Math.round(fy * sh - p.h / 2)), sh - p.h);
      img = img.resize(sw, sh).extract({ left, top, width: p.w, height: p.h });
    } else {
      img = img.resize(p.w, p.h, { fit: 'cover', position: pos === 'entropy' ? sharp.strategy.entropy : pos === 'attention' ? sharp.strategy.attention : (pos as string) });
    }
    if (!p.raw) {
      img = img.modulate({ saturation: g.saturation ?? 1, brightness: g.brightness ?? 1 });
      const c = g.contrast ?? 1;
      if (c !== 1) img = img.linear(c, -(128 * c) + 128);
      const buf = await img.toBuffer();
      const layers: import('sharp').OverlayOptions[] = [];
      if (g.warmth) layers.push({ input: { create: { width: p.w, height: p.h, channels: 4, background: { r: 255, g: 170, b: 90, alpha: Math.min(0.5, Math.abs(g.warmth)) } } }, blend: 'soft-light' });
      if (g.tint && g.tintStrength) {
        const hex = g.tint.replace('#', '');
        layers.push({ input: { create: { width: p.w, height: p.h, channels: 4, background: { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16), alpha: g.tintStrength } } }, blend: 'soft-light' });
      }
      img = sharp(buf).composite(layers);
    }
    const out = join(s.dir, 'src', 'content', p.dest);
    mkdirSync(dirname(out), { recursive: true });
    await img.webp({ quality: 82 }).toFile(out);
    credits.push({ file: p.dest, title: hit.title ?? "", creator: hit.creator, creatorUrl: hit.creator_url, source: hit.source, landing: hit.foreign_landing_url, license: `${hit.license.toUpperCase()} ${hit.license_version}`, licenseUrl: hit.license_url, modified: true });
    console.log(`✓ ${p.dest} ← ${p.ref} (${hit.source} ${hit.license})`);
  }
  writeFileSync(join(s.dir, 'brand', 'image-credits.json'), `${JSON.stringify(credits, null, 2)}\n`);
  console.log(`${credits.length} photos, credits in brand/image-credits.json`);
}

const [cmd, ...rest] = process.argv.slice(2);
const flags = Object.fromEntries(rest.filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('=') as [string, string]));
const args = rest.filter((a) => !a.startsWith('--'));
if (cmd === 'search') await search(args[0]!, args[1]!, flags);
else if (cmd === 'apply') await apply(args[0]!);
else console.log('usage: pnpm photos search <key> "<query>" | pnpm photos apply <site>');
