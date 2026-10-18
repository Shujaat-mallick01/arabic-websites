// tokens → CSS custom properties. The generated file is sites/NN/src/styles/tokens.css.

import type { BrandTokens } from './tokens.ts';

const MOBILE = 390;
const DESKTOP = 1440;

function px(n: number): string {
  return `${Math.round(n * 100) / 100}px`;
}

/** Fluid size between the 390 px and 1440 px designs. */
export function fluid(minPx: number, maxPx: number): string {
  if (Math.abs(maxPx - minPx) < 0.01) return px(minPx);
  const slope = (maxPx - minPx) / (DESKTOP - MOBILE);
  const intercept = minPx - slope * MOBILE;
  const sign = slope < 0 ? '-' : '+';
  return `clamp(${px(Math.min(minPx, maxPx))}, ${px(intercept)} ${sign} ${Math.abs(Math.round(slope * 10000) / 100)}vw, ${px(Math.max(minPx, maxPx))})`;
}

export const FONT_VARS = {
  arDisplay: '--font-ar-display',
  arBody: '--font-ar-body',
  latinDisplay: '--font-latin-display',
  latinBody: '--font-latin-body',
} as const;

function genericFor(family: string): string {
  return /Amiri|Naskh|Markazi|Garamond|Caslon|Serif|Newsreader|Alegreya|Fraunces|Prata|Marcellus|Cormorant|Cinzel|Philosopher|Italiana|Katibeh|Young|Alyamama/i.test(family) ? 'serif' : 'sans-serif';
}

/** The CSS variable each font role should use; repeated families share one variable. */
export function fontVariables(t: BrandTokens): Record<keyof typeof FONT_VARS, string> {
  const ar = t.fonts.arabic;
  const la = t.fonts.latin;
  return {
    arDisplay: FONT_VARS.arDisplay,
    arBody: ar.body.family === ar.display.family ? FONT_VARS.arDisplay : FONT_VARS.arBody,
    latinDisplay: FONT_VARS.latinDisplay,
    latinBody: la.body.family === la.display.family ? FONT_VARS.latinDisplay : FONT_VARS.latinBody,
  };
}

export function tokensToCss(t: BrandTokens, header = '/* GENERATED from brand/tokens.ts by pnpm site:sync. Do not edit. */'): string {
  const c = t.color;
  const v = fontVariables(t);
  const base = t.type.basePx;
  const s = t.type.scale;
  const size = (steps: number, mobileFactor = 1) => fluid(base.mobile * s ** steps * mobileFactor, base.desktop * s ** steps);
  const w = t.type.weights;
  const we = t.type.weightsEn ?? w;
  const lh = t.type.lineHeight;
  const lhe = t.type.lineHeightEn ?? { display: Math.min(lh.display, 1.15), heading: Math.min(lh.heading, 1.25), body: Math.min(lh.body, 1.6) };
  const dg = genericFor(t.fonts.arabic.display.family);
  const bg = genericFor(t.fonts.arabic.body.family);
  const featuresAr = t.fonts.arabic.display.features.map((f) => `"${f}" 1`).join(', ') || 'normal';
  const rhythm = { airy: 1.35, standard: 1, dense: 0.75 }[t.space.rhythm];

  const lines = [
    header,
    ':root {',
    `  --brand-bg: ${c.bg};`,
    `  --brand-surface: ${c.surface};`,
    `  --brand-ink: ${c.ink};`,
    `  --brand-muted: ${c.muted};`,
    `  --brand-line: ${c.line};`,
    `  --brand-accent: ${c.accent};`,
    `  --brand-accent-ink: ${c.accentInk};`,
    `  --brand-accent-press: ${c.accentPress};`,
    `  --brand-deep: ${c.deep};`,
    `  --brand-deep-ink: ${c.deepInk};`,
    `  --brand-deep-muted: ${c.deepMuted};`,
    `  --brand-deep-accent: ${c.deepAccent};`,
    `  --brand-highlight: ${c.highlight ?? c.accent};`,
    `  --brand-danger: ${c.danger};`,
    `  --brand-success: ${c.success};`,
    `  --brand-focus: ${c.focus};`,
    `  --brand-scrim: ${c.scrim};`,
    // Arabic pages: Arabic face first (its own Latin and digits keep weights matched).
    `  --brand-font-display: var(${v.arDisplay}), var(${v.latinDisplay}), ${dg};`,
    `  --brand-font-body: var(${v.arBody}), var(${v.latinBody}), ${bg};`,
    `  --brand-font-features-display: ${featuresAr};`,
    `  --brand-fs-display: ${size(4, 0.92)};`,
    `  --brand-fs-h1: ${size(3, 0.95)};`,
    `  --brand-fs-h2: ${size(2)};`,
    `  --brand-fs-h3: ${size(1)};`,
    `  --brand-fs-body: ${fluid(base.mobile, base.desktop)};`,
    `  --brand-fs-small: ${fluid(base.mobile / s, base.desktop / s)};`,
    `  --brand-fs-ui: ${fluid(Math.max(15, base.mobile * 0.94), Math.max(15, base.desktop * 0.9))};`,
    `  --brand-lh-display: ${lh.display};`,
    `  --brand-lh-heading: ${lh.heading};`,
    `  --brand-lh-body: ${lh.body};`,
    `  --brand-lh-ui: ${lh.ui};`,
    `  --brand-fw-display: ${w.display};`,
    `  --brand-fw-heading: ${w.heading};`,
    `  --brand-fw-body: ${w.body};`,
    `  --brand-fw-ui: ${w.ui};`,
    `  --brand-fw-price: ${w.price};`,
    `  --brand-latin-scale: ${t.type.latinScale};`,
    `  --brand-radius-control: ${t.radius.control};`,
    `  --brand-radius-card: ${t.radius.card};`,
    `  --brand-radius-image: ${t.radius.image};`,
    `  --brand-radius-pill: ${t.radius.pill};`,
    `  --brand-border-width: ${t.border.width};`,
    `  --brand-border-style: ${t.border.style};`,
    `  --brand-shadow-card: ${t.shadow.card};`,
    `  --brand-shadow-overlay: ${t.shadow.overlay};`,
    `  --brand-gutter: ${fluid(t.space.gutterPx.mobile, t.space.gutterPx.desktop)};`,
    `  --brand-max-width: ${t.space.maxWidthPx}px;`,
    `  --brand-section-gap: ${fluid(48 * rhythm, 96 * rhythm)};`,
    `  --brand-stack-gap: ${fluid(16 * rhythm, 24 * rhythm)};`,
    `  --brand-motion-ms: ${t.motion.durationMs}ms;`,
    `  --brand-motion-ease: ${t.motion.easing};`,
    `  --brand-aspect-card: ${t.photo.aspect.card};`,
    `  --brand-aspect-hero: ${t.photo.aspect.hero};`,
    `  --brand-aspect-hero-desktop: ${t.photo.aspect.heroDesktop ?? t.photo.aspect.hero};`,
    '}',
    ':root:lang(en) {',
    // English pages: Latin face first, Arabic words fall through.
    `  --brand-font-display: var(${v.latinDisplay}), var(${v.arDisplay}), ${genericFor(t.fonts.latin.display.family)};`,
    `  --brand-font-body: var(${v.latinBody}), var(${v.arBody}), ${genericFor(t.fonts.latin.body.family)};`,
    `  --brand-font-features-display: normal;`,
    `  --brand-lh-display: ${lhe.display};`,
    `  --brand-lh-heading: ${lhe.heading};`,
    `  --brand-lh-body: ${lhe.body};`,
    `  --brand-fw-display: ${we.display};`,
    `  --brand-fw-heading: ${we.heading};`,
    `  --brand-fw-body: ${we.body};`,
    `  --brand-fw-ui: ${we.ui};`,
    `  --brand-fw-price: ${we.price};`,
    `  --brand-tracking-caps: ${t.type.latinTracking.caps};`,
    `  --brand-tracking-body: ${t.type.latinTracking.body};`,
    `  --brand-display-case: ${t.type.displayCaseEn};`,
    '}',
    '@media (prefers-reduced-motion: reduce) {',
    '  :root { --brand-motion-ms: 0ms; }',
    '}',
    '',
  ];
  return lines.join('\n');
}
