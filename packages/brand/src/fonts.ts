// Font catalogue with the coverage facts from docs/research/fonts-and-logo-pipeline.md (§A2–A3).
// Checks run in site:sync, rebrand --fonts and check-all.

import type { CountryCode, Dialect } from '@aw/core';
import type { BrandTokens } from './tokens.ts';

export interface ArabicFontInfo {
  family: string;
  class: 'naskh' | 'kufi' | 'ruqaa' | 'sans' | 'display';
  roles: Array<'body' | 'heading' | 'display'>;
  /** Lacks U+066B/U+066C (Arabic decimal and thousands separators). */
  noSeparators?: true;
  /** Lacks چ گ (U+0686, U+06AF). */
  noTchehGaf?: true;
  /** Lacks پ (U+067E). */
  noPeh?: true;
  /** Arabic-Indic digits drawn like Western digits. */
  westernLookingDigits?: true;
  /** Has the Saudi Riyal sign U+20C1. */
  riyalSign?: true;
  /** Variable font axis range for wght, when variable. */
  variableWeights?: [number, number];
  staticWeights?: number[];
  /** Matched Latin partner and the Latin scale that aligns alef with cap height. */
  latin: { primary: string; scale: number };
}

export const ARABIC_FONTS: Record<string, ArabicFontInfo> = {
  'Aref Ruqaa': { family: 'Aref Ruqaa', class: 'ruqaa', roles: ['display'], noSeparators: true, staticWeights: [400, 700], latin: { primary: 'Marcellus', scale: 0.98 } },
  Amiri: { family: 'Amiri', class: 'naskh', roles: ['heading', 'display', 'body'], staticWeights: [400, 700], latin: { primary: 'EB Garamond', scale: 1.06 } },
  'Reem Kufi': { family: 'Reem Kufi', class: 'kufi', roles: ['display', 'heading'], noSeparators: true, variableWeights: [400, 700], latin: { primary: 'Josefin Sans', scale: 1.11 } },
  'El Messiri': { family: 'El Messiri', class: 'sans', roles: ['heading', 'display'], variableWeights: [400, 700], latin: { primary: 'Philosopher', scale: 1.0 } },
  'Readex Pro': { family: 'Readex Pro', class: 'sans', roles: ['body', 'heading'], noTchehGaf: true, noPeh: true, variableWeights: [160, 700], latin: { primary: 'Lexend', scale: 1.06 } },
  'IBM Plex Sans Arabic': { family: 'IBM Plex Sans Arabic', class: 'sans', roles: ['body', 'heading'], staticWeights: [100, 200, 300, 400, 500, 600, 700], latin: { primary: 'IBM Plex Sans', scale: 1.06 } },
  Alexandria: { family: 'Alexandria', class: 'sans', roles: ['body', 'heading', 'display'], variableWeights: [100, 900], latin: { primary: 'Montserrat', scale: 1.17 } },
  Almarai: { family: 'Almarai', class: 'sans', roles: ['body', 'heading'], staticWeights: [300, 400, 700, 800], latin: { primary: 'Outfit', scale: 1.03 } },
  Rubik: { family: 'Rubik', class: 'sans', roles: ['body', 'heading'], variableWeights: [300, 900], latin: { primary: 'Rubik', scale: 1.07 } },
  'Noto Kufi Arabic': { family: 'Noto Kufi Arabic', class: 'sans', roles: ['body', 'heading'], variableWeights: [100, 900], latin: { primary: 'Be Vietnam Pro', scale: 1.03 } },
  'Noto Naskh Arabic': { family: 'Noto Naskh Arabic', class: 'naskh', roles: ['body'], riyalSign: true, variableWeights: [400, 700], latin: { primary: 'Newsreader', scale: 0.99 } },
  'Noto Sans Arabic': { family: 'Noto Sans Arabic', class: 'sans', roles: ['body'], variableWeights: [100, 900], latin: { primary: 'Instrument Sans', scale: 0.99 } },
  'Markazi Text': { family: 'Markazi Text', class: 'naskh', roles: ['body'], variableWeights: [400, 700], latin: { primary: 'Markazi Text', scale: 1.06 } },
  Mada: { family: 'Mada', class: 'sans', roles: ['body'], variableWeights: [200, 900], latin: { primary: 'Source Sans 3', scale: 0.95 } },
  Rakkas: { family: 'Rakkas', class: 'display', roles: ['display'], staticWeights: [400], latin: { primary: 'Young Serif', scale: 0.89 } },
  Kufam: { family: 'Kufam', class: 'kufi', roles: ['body', 'heading', 'display'], variableWeights: [400, 900], latin: { primary: 'Archivo', scale: 1.06 } },
  Marhey: { family: 'Marhey', class: 'display', roles: ['display', 'heading'], variableWeights: [300, 700], latin: { primary: 'Fraunces', scale: 1.05 } },
  Qahiri: { family: 'Qahiri', class: 'kufi', roles: ['display'], noSeparators: true, staticWeights: [400], latin: { primary: 'Cinzel', scale: 1.07 } },
  Zain: { family: 'Zain', class: 'sans', roles: ['body', 'heading'], westernLookingDigits: true, staticWeights: [200, 300, 400, 700, 800, 900], latin: { primary: 'Outfit', scale: 1.0 } },
  Beiruti: { family: 'Beiruti', class: 'sans', roles: ['body', 'heading'], variableWeights: [200, 900], latin: { primary: 'Afacad', scale: 1.04 } },
  Vibes: { family: 'Vibes', class: 'display', roles: ['display'], staticWeights: [400], latin: { primary: 'Italiana', scale: 0.9 } },
  Katibeh: { family: 'Katibeh', class: 'display', roles: ['display'], staticWeights: [400], latin: { primary: 'Libre Caslon Display', scale: 0.99 } },
  Lemonada: { family: 'Lemonada', class: 'display', roles: ['display', 'heading'], variableWeights: [300, 700], latin: { primary: 'Lemon', scale: 1.07 } },
  Alyamama: { family: 'Alyamama', class: 'naskh', roles: ['display', 'heading', 'body'], riyalSign: true, variableWeights: [300, 900], latin: { primary: 'Alegreya', scale: 1.0 } },
  Fustat: { family: 'Fustat', class: 'sans', roles: ['body', 'heading'], variableWeights: [200, 800], latin: { primary: 'Urbanist', scale: 1.08 } },
  Tajawal: { family: 'Tajawal', class: 'sans', roles: ['body'], noSeparators: true, noTchehGaf: true, staticWeights: [200, 300, 400, 500, 700, 800, 900], latin: { primary: 'Alegreya Sans', scale: 1.01 } },
  Cairo: { family: 'Cairo', class: 'sans', roles: ['body'], variableWeights: [200, 1000], latin: { primary: 'Red Hat Display', scale: 1.02 } },
};

export interface FontIssue {
  level: 'error' | 'warning';
  message: string;
}

/** Dialects whose everyday spelling uses چ گ پ (Iraqi گلبي، چاي; Kuwaiti چذي). */
const DIALECTS_WITH_TCHEH: Dialect[] = ['iraqi', 'kuwaiti'];

/** Coverage and suitability rules for one site's fonts. */
export function checkFonts(t: BrandTokens, locale: { country: CountryCode; dialect: Dialect; numberingSystem: 'arab' | 'latn' }): FontIssue[] {
  const issues: FontIssue[] = [];
  const body = ARABIC_FONTS[t.fonts.arabic.body.family];
  const display = ARABIC_FONTS[t.fonts.arabic.display.family];
  for (const [role, spec, info] of [
    ['body', t.fonts.arabic.body, body],
    ['display', t.fonts.arabic.display, display],
  ] as const) {
    if (!info) {
      issues.push({ level: 'warning', message: `Arabic ${role} font "${spec.family}" is not in the catalogue; coverage unchecked` });
      continue;
    }
    if (role === 'body' && !info.roles.includes('body')) {
      issues.push({ level: 'error', message: `"${info.family}" is a ${info.roles.join('/')} face and cannot carry body text` });
    }
    if (DIALECTS_WITH_TCHEH.includes(locale.dialect) && (info.noTchehGaf || info.noPeh) && role === 'body') {
      issues.push({ level: 'error', message: `"${info.family}" lacks چ گ پ, which ${locale.dialect} copy uses; joining would break mid-word` });
    }
    const weights = spec.weights;
    if (info.variableWeights) {
      const [lo, hi] = info.variableWeights;
      for (const w of weights) if (w < lo || w > hi) issues.push({ level: 'error', message: `"${info.family}" has no weight ${w} (range ${lo}–${hi})` });
    } else if (info.staticWeights) {
      for (const w of weights) if (!info.staticWeights.includes(w)) issues.push({ level: 'error', message: `"${info.family}" has no weight ${w} (available ${info.staticWeights.join(', ')})` });
    }
  }
  if (body && locale.numberingSystem === 'arab') {
    if (body.noSeparators) issues.push({ level: 'error', message: `Prices use the body face; "${body.family}" lacks the Arabic decimal/thousands separators` });
    if (body.westernLookingDigits) issues.push({ level: 'error', message: `"${body.family}" draws Arabic-Indic digits like Western ones; use numberingSystem 'latn' or another body face` });
  }
  for (const f of [t.fonts.arabic.body.family, t.fonts.arabic.display.family]) {
    if (f === 'Cairo' || f === 'Tajawal') issues.push({ level: 'warning', message: `"${f}" is the overused default; the brief asks for a deliberate choice` });
  }
  return issues;
}

/** Characters missing from a font for a given text corpus (for the content check). */
export function missingGlyphClasses(family: string, corpus: string): string[] {
  const info = ARABIC_FONTS[family];
  if (!info) return [];
  const missing: string[] = [];
  if (info.noSeparators && /[٫٬]/.test(corpus)) missing.push('U+066B/U+066C');
  if (info.noTchehGaf && /[چگ]/.test(corpus)) missing.push('چ/گ');
  if (info.noPeh && /پ/.test(corpus)) missing.push('پ');
  return missing;
}
