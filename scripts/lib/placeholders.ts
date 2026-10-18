// Brand-graded placeholder photography: product silhouettes on window-light backdrops with grain.
// The brief allows "abstract/product-silhouette placeholders"; real photos replace these through
// `pnpm images:grade` without touching content files (same file names).

import sharp from 'sharp';

export type Shape =
  | 'kaftan' | 'abaya' | 'set' | 'jalabiya' | 'dress' | 'scarf' | 'trousers'
  | 'bottle' | 'bottle-tall' | 'incense' | 'box' | 'tray' | 'cake' | 'cake-tall' | 'cupcakes'
  | 'mirror' | 'brushes' | 'nails' | 'lashes' | 'chair' | 'henna-hand' | 'cone' | 'favor-box' | 'table' | 'arch-room'
  | 'none';

export interface PlaceholderSpec {
  width: number;
  height: number;
  /** Backdrop colours: top-left light and bottom-right shade. */
  bg: [string, string];
  /** Main object colour and its shadow/fold colour. */
  fill: string;
  fold?: string;
  accent?: string;
  shape: Shape;
  /** 0..1 horizontal position of the object. */
  x?: number;
  /** Object scale relative to the frame height. */
  scale?: number;
  seed?: number;
  /** Light from the inline start (window). */
  light?: 'left' | 'right' | 'top';
  hanger?: boolean;
}

function shade(hex: string, amt: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/** Paths are drawn in a 300×400 box, centred at x=150. */
const SHAPES: Record<Exclude<Shape, 'none'>, (c: { fill: string; fold: string; accent: string }) => string> = {
  kaftan: ({ fill, fold }) => `<path d="M150 46c-16 0-26 7-32 16L44 112l16 26 40-20-18 262h136l-18-262 40 20 16-26-74-50c-6-9-16-16-32-16Z" fill="${fill}"/><path d="M150 62c-6 0-11 3-13 8l13 40 13-40c-2-5-7-8-13-8Z" fill="${fold}"/><path d="M118 140l-10 230M182 140l10 230M150 120v250" stroke="${fold}" stroke-width="2" opacity=".5" fill="none"/>`,
  abaya: ({ fill, fold }) => `<path d="M150 44c-15 0-24 6-30 14L70 96l-30 150 22 6 26-120-14 248h152l-14-248 26 120 22-6-30-150-50-38c-6-8-15-14-30-14Z" fill="${fill}"/><path d="M146 62l-16 318h10l14-300ZM154 62l16 318h-10l-14-300Z" fill="${fold}"/><path d="M98 210c30 8 74 8 104 0" stroke="${fold}" stroke-width="5" fill="none"/>`,
  set: ({ fill, fold }) => `<path d="M150 50c-14 0-23 6-28 13l-50 30-14 86 20 4 18-66-6 104h120l-6-104 18 66 20-4-14-86-50-30c-5-7-14-13-28-13Z" fill="${fill}"/><path d="M96 228h108l12 152h-46l-20-120-20 120H84Z" fill="${fold}"/><path d="M150 66v150" stroke="${fold}" stroke-width="2" opacity=".6"/>`,
  jalabiya: ({ fill, fold, accent }) => `<path d="M150 46c-15 0-24 6-30 14L76 92l-26 108 20 6 22-80-12 254h140l-12-254 22 80 20-6-26-108-44-32c-6-8-15-14-30-14Z" fill="${fill}"/><path d="M134 64c4 14 10 22 16 22s12-8 16-22" stroke="${accent}" stroke-width="4" fill="none" stroke-dasharray="3 5"/><path d="M150 86v120" stroke="${accent}" stroke-width="3" stroke-dasharray="2 6"/><path d="M110 150l-6 220M190 150l6 220" stroke="${fold}" stroke-width="2" opacity=".5"/>`,
  dress: ({ fill, fold }) => `<path d="M128 50h44l6 40 30 290H92l30-290Z" fill="${fill}"/><path d="M132 50l-4-10M168 50l4-10" stroke="${fold}" stroke-width="3"/><path d="M150 96v284" stroke="${fold}" stroke-width="2" opacity=".5"/>`,
  scarf: ({ fill, fold }) => `<path d="M80 80c40-30 100-30 140 0 10 60-10 120-30 180-10 40-40 90-40 120-10-40-60-90-70-150-6-50-10-100 0-150Z" fill="${fill}"/><path d="M110 100c20 60 30 140 40 270M190 100c-14 60-24 140-40 270" stroke="${fold}" stroke-width="3" fill="none" opacity=".6"/>`,
  trousers: ({ fill, fold }) => `<path d="M100 60h100l14 320h-56l-8-230-8 230H86Z" fill="${fill}"/><path d="M100 60h100v14H100Z" fill="${fold}"/>`,
  bottle: ({ fill, fold, accent }) => `<rect x="132" y="96" width="36" height="34" rx="4" fill="${accent}"/><rect x="96" y="128" width="108" height="200" rx="18" fill="${fill}" opacity=".92"/><rect x="108" y="140" width="22" height="176" rx="10" fill="#fff" opacity=".18"/><rect x="112" y="210" width="76" height="46" rx="3" fill="${fold}" opacity=".85"/>`,
  'bottle-tall': ({ fill, fold, accent }) => `<path d="M138 60h24v40h-24Z" fill="${accent}"/><path d="M150 100c-36 30-48 80-48 140v90h96v-90c0-60-12-110-48-140Z" fill="${fill}" opacity=".92"/><path d="M118 180c-6 40-6 90 0 140" stroke="#fff" stroke-width="10" opacity=".18" fill="none"/><rect x="118" y="250" width="64" height="36" rx="2" fill="${fold}"/>`,
  incense: ({ fill, fold, accent }) => `<path d="M90 300h120l-14 40H104Z" fill="${fill}"/><ellipse cx="150" cy="300" rx="60" ry="10" fill="${fold}"/><path d="M150 290c-20-40 20-60 0-110 30 30 0 70 20 110" stroke="${accent}" stroke-width="3" fill="none" opacity=".6"/>`,
  box: ({ fill, fold, accent }) => `<path d="M70 170h160v150H70Z" fill="${fill}"/><path d="M60 150h180v28H60Z" fill="${fold}"/><path d="M150 150v170" stroke="${accent}" stroke-width="10"/><path d="M150 150c-30-40-60-20-40 0M150 150c30-40 60-20 40 0" stroke="${accent}" stroke-width="7" fill="none"/>`,
  tray: ({ fill, fold, accent }) => {
    let s = `<rect x="40" y="110" width="220" height="220" rx="14" fill="${fold}"/>`;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) s += `<rect x="${58 + c * 50}" y="${128 + r * 50}" width="38" height="38" rx="8" fill="${(r + c) % 3 === 0 ? accent : fill}"/>`;
    return s;
  },
  cake: ({ fill, fold, accent }) => `<ellipse cx="150" cy="330" rx="110" ry="16" fill="${fold}"/><path d="M60 200h180v120H60Z" fill="${fill}"/><ellipse cx="150" cy="200" rx="90" ry="14" fill="${shade(fill, 18)}"/><path d="M60 214c20 14 40 0 60 12s40 0 60 12 40 0 60 0" stroke="${accent}" stroke-width="6" fill="none"/><circle cx="120" cy="190" r="8" fill="${accent}"/><circle cx="170" cy="188" r="8" fill="${accent}"/>`,
  'cake-tall': ({ fill, fold, accent }) => `<ellipse cx="150" cy="340" rx="100" ry="14" fill="${fold}"/><path d="M70 250h160v86H70ZM90 170h120v80H90ZM110 110h80v60h-80Z" fill="${fill}"/><path d="M70 250h160M90 170h120M110 110h80" stroke="${accent}" stroke-width="5"/><circle cx="150" cy="100" r="9" fill="${accent}"/>`,
  cupcakes: ({ fill, fold, accent }) => [80, 150, 220].map((x, i) => `<path d="M${x - 30} 260h60l-8 60h-44Z" fill="${fold}"/><circle cx="${x}" cy="246" r="34" fill="${i === 1 ? accent : fill}"/>`).join(''),
  mirror: ({ fill, fold, accent }) => `<path d="M90 360V160a60 60 0 0 1 120 0v200Z" fill="${fill}"/><path d="M104 350V164a46 46 0 0 1 92 0v186Z" fill="${fold}"/><path d="M84 360V156a66 66 0 0 1 132 0v204" stroke="${accent}" stroke-width="2" fill="none"/>`,
  brushes: ({ fill, fold, accent }) => [100, 135, 170, 205].map((x, i) => `<path d="M${x - 6} ${120 + i * 12}h12l4 70h-20Z" fill="${accent}"/><rect x="${x - 4}" y="${190 + i * 12}" width="8" height="${130 - i * 12}" rx="3" fill="${i % 2 ? fill : fold}"/>`).join(''),
  nails: ({ fill, fold, accent }) => `<path d="M90 380V230c0-20 16-30 26-30s14 10 14 30v40" fill="${fold}"/>${[110, 140, 170, 200].map((x, i) => `<rect x="${x - 12}" y="${150 + Math.abs(1.5 - i) * 20}" width="24" height="${120}" rx="12" fill="${fold}"/><rect x="${x - 9}" y="${153 + Math.abs(1.5 - i) * 20}" width="18" height="26" rx="9" fill="${i % 2 ? accent : fill}"/>`).join('')}`,
  lashes: ({ fill, fold, accent }) => `<path d="M60 220c40-40 140-40 180 0" stroke="${fold}" stroke-width="10" fill="none"/>${Array.from({ length: 14 }, (_, i) => `<path d="M${74 + i * 11} ${206 - Math.sin((i / 13) * Math.PI) * 22}l${-4 + i * 0.6} -${18 + Math.sin((i / 13) * Math.PI) * 14}" stroke="${fill}" stroke-width="3"/>`).join('')}<ellipse cx="150" cy="232" rx="40" ry="8" fill="${accent}" opacity=".5"/>`,
  chair: ({ fill, fold, accent }) => `<path d="M90 160a60 60 0 0 1 120 0v120H90Z" fill="${fill}"/><path d="M80 270h140v30H80Z" fill="${fold}"/><path d="M96 300l-8 60M204 300l8 60" stroke="${accent}" stroke-width="5"/>`,
  'henna-hand': ({ fill, fold, accent }) => `<path d="M110 380V230l-6-80c0-12 16-12 18 0l8 70V120c0-12 18-12 18 0v100V100c0-12 18-12 18 0v120l4-100c0-12 18-12 18 0v130l18-40c6-10 20-4 16 8l-30 90c-6 30-16 50-16 72Z" fill="${fill}"/><g stroke="${accent}" stroke-width="2.4" fill="none"><circle cx="150" cy="260" r="16"/><circle cx="150" cy="260" r="8"/><path d="M134 290c10 10 22 10 32 0M139 120c4 20 4 40 0 60M175 120c4 20 2 40-2 60M121 160c4 14 4 30 2 44"/></g>`,
  cone: ({ fill, fold, accent }) => `<path d="M120 90l60 0-30 270Z" fill="${fill}"/><path d="M120 90h60l-4 30h-52Z" fill="${fold}"/><path d="M150 360l-2 14" stroke="${accent}" stroke-width="4"/>`,
  'favor-box': ({ fill, fold, accent }) => `<path d="M60 200h80v100H60ZM160 180h90v120h-90Z" fill="${fill}"/><path d="M54 186h92v18H54ZM154 166h102v18H154Z" fill="${fold}"/><path d="M100 186v114M205 166v134" stroke="${accent}" stroke-width="6"/><circle cx="100" cy="182" r="9" fill="${accent}"/><circle cx="205" cy="162" r="9" fill="${accent}"/>`,
  table: ({ fill, fold, accent }) => `<path d="M40 260h220v14H40Z" fill="${fold}"/><path d="M70 274v90M230 274v90" stroke="${fold}" stroke-width="8"/><path d="M110 260v-40c0-16 12-24 20-24h40c8 0 20 8 20 24v40" fill="${fill}"/><circle cx="150" cy="170" r="20" fill="${accent}"/><path d="M60 250c20-30 40-30 60 0M180 250c20-30 40-30 60 0" stroke="${accent}" stroke-width="3" fill="none"/>`,
  'arch-room': ({ fill, fold, accent }) => `<path d="M70 380V170a80 80 0 0 1 160 0v210Z" fill="${fold}"/><path d="M90 380V176a60 60 0 0 1 120 0v204Z" fill="${fill}"/><circle cx="150" cy="140" r="8" fill="${accent}"/><path d="M100 330h100" stroke="${accent}" stroke-width="3"/>`,
};

export function placeholderSvg(s: PlaceholderSpec): string {
  const { width: w, height: h } = s;
  const fold = s.fold ?? shade(s.fill, -22);
  const accent = s.accent ?? shade(s.fill, 30);
  const seed = s.seed ?? 1;
  const scale = (s.scale ?? 0.78) * (h / 400);
  const cx = (s.x ?? 0.5) * w;
  const ox = cx - 150 * scale;
  const oy = h - 400 * scale - h * 0.04;
  const light = s.light ?? 'left';
  const lg = light === 'left' ? 'x1="0" y1="0" x2="1" y2="0.8"' : light === 'right' ? 'x1="1" y1="0" x2="0" y2="0.8"' : 'x1="0.5" y1="0" x2="0.5" y2="1"';
  const obj = s.shape === 'none' ? '' : SHAPES[s.shape]({ fill: s.fill, fold, accent });
  const hanger = s.hanger ? `<path d="M150 46v-14a10 10 0 1 0-10-10" stroke="${shade(s.bg[1], -60)}" stroke-width="3" fill="none"/><path d="M100 56l50-22 50 22" stroke="${shade(s.bg[1], -60)}" stroke-width="3" fill="none"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" ${lg}><stop offset="0" stop-color="${shade(s.bg[0], 10)}"/><stop offset="1" stop-color="${s.bg[1]}"/></linearGradient>
    <radialGradient id="win" cx="${light === 'right' ? 0.85 : 0.15}" cy="0.1" r="0.9"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="${seed}"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .07 0"/></filter>
    <filter id="soft"><feGaussianBlur stdDeviation="${Math.max(2, w / 120)}"/></filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#win)"/>
  <ellipse cx="${cx}" cy="${h * 0.955}" rx="${120 * scale}" ry="${10 * scale}" fill="#000" opacity=".12" filter="url(#soft)"/>
  <g transform="translate(${ox} ${oy}) scale(${scale})">${hanger}${obj}</g>
  <rect width="100%" height="100%" filter="url(#grain)"/>
</svg>`;
}

export async function writePlaceholder(file: string, s: PlaceholderSpec, quality = 80): Promise<void> {
  await sharp(Buffer.from(placeholderSvg(s))).webp({ quality, effort: 5 }).toFile(file);
}
