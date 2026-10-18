// WCAG 2.x contrast. site:sync refuses to generate a site whose tokens fail AA.

import type { BrandTokens } from './tokens.ts';

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string): number {
  const n = Number.parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export interface ContrastIssue {
  pair: string;
  ratio: number;
  needs: number;
}

/** Every pair the UI actually uses, with the ratio it needs. */
export function checkContrast(t: BrandTokens): ContrastIssue[] {
  const c = t.color;
  const pairs: Array<[string, string, string, number]> = [
    ['ink on bg', c.ink, c.bg, 4.5],
    ['ink on surface', c.ink, c.surface, 4.5],
    ['muted on bg', c.muted, c.bg, 4.5],
    ['muted on surface', c.muted, c.surface, 4.5],
    ['accent on bg (links)', c.accent, c.bg, 4.5],
    ['accent on surface (links)', c.accent, c.surface, 4.5],
    ['accentInk on accent (buttons)', c.accentInk, c.accent, 4.5],
    ['accentInk on accentPress', c.accentInk, c.accentPress, 4.5],
    ['deepInk on deep (footer)', c.deepInk, c.deep, 4.5],
    ['deepMuted on deep', c.deepMuted, c.deep, 4.5],
    ['deepAccent on deep', c.deepAccent, c.deep, 4.5],
    ['danger on bg', c.danger, c.bg, 4.5],
    ['danger on surface', c.danger, c.surface, 4.5],
    ['success on surface', c.success, c.surface, 4.5],
    ['focus on bg', c.focus, c.bg, 3],
    ['focus on surface', c.focus, c.surface, 3],
    ['muted on bg (input borders)', c.muted, c.bg, 3],
  ];
  const issues: ContrastIssue[] = [];
  for (const [pair, fg, bg, needs] of pairs) {
    const ratio = contrastRatio(fg, bg);
    if (ratio + 1e-9 < needs) issues.push({ pair, ratio: Math.round(ratio * 100) / 100, needs });
  }
  return issues;
}
