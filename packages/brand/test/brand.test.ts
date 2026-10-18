import { describe, expect, it } from 'vitest';
import { checkContrast, checkFonts, contrastRatio, defineTokens, fluid, fontVariables, missingGlyphClasses, tokensToCss, type BrandTokensInput } from '../src/index.ts';

export const dareesha: BrandTokensInput = {
  color: {
    bg: '#DCE5EE',
    surface: '#F3F6FA',
    ink: '#16202B',
    muted: '#4A5664',
    line: '#C3CFDB',
    accent: '#7E560F',
    accentInk: '#F3F6FA',
    accentPress: '#694609',
    deep: '#22303F',
    deepInk: '#F3F6FA',
    deepMuted: '#A9B6C4',
    deepAccent: '#D9A955',
    danger: '#A3292B',
    success: '#2E6B3F',
    focus: '#16202B',
    scrim: 'rgb(22 32 43 / 0.4)',
  },
  usage: { bg: 55, surface: 22, ink: 15, accent: 3, deep: 5 },
  fonts: {
    arabic: { display: { family: 'Alexandria', weights: [300, 400, 500], variable: true }, body: { family: 'Alexandria', weights: [300, 400, 500], variable: true } },
    latin: { display: { family: 'Montserrat', weights: [400, 500, 600], variable: true }, body: { family: 'Montserrat', weights: [400, 500, 600], variable: true } },
  },
  type: {
    basePx: { mobile: 16, desktop: 17 },
    scale: 1.25,
    lineHeight: { display: 1.35, heading: 1.4, body: 1.85, ui: 1.4 },
    latinScale: 1.17,
    latinTracking: { caps: '0.08em', body: '0' },
    weights: { display: 300, heading: 400, body: 300, ui: 500, price: 500 },
    weightsEn: { display: 400, heading: 500, body: 400, ui: 600, price: 600 },
  },
  radius: { control: '10px', card: '14px', image: '14px', pill: '10px' },
  space: { rhythm: 'airy', gutterPx: { mobile: 16, desktop: 80 }, maxWidthPx: 1280 },
  shadow: { card: 'none', overlay: '0 12px 40px rgb(22 32 43 / 0.18)' },
  motion: { durationMs: 240, easing: 'cubic-bezier(.2,.7,.2,1)', reveal: 'none' },
  photo: { grade: { saturation: 0.98, brightness: 1.02, warmth: -0.04, contrast: 1.02 }, aspect: { card: '3 / 4', hero: '4 / 5', heroDesktop: '16 / 7' } },
};

describe('tokens', () => {
  it('validates and fills defaults', () => {
    const t = defineTokens(dareesha);
    expect(t.border).toEqual({ width: '1px', style: 'solid' });
    expect(t.fonts.arabic.display.features).toEqual([]);
  });

  it('rejects bad hexes and usage that does not add up', () => {
    expect(() => defineTokens({ ...dareesha, color: { ...dareesha.color, ink: 'navy' } })).toThrow(/hex/);
    expect(() => defineTokens({ ...dareesha, usage: { bg: 50, surface: 10, ink: 10, accent: 3 } })).toThrow(/100 %/);
  });
});

describe('contrast', () => {
  it('matches the ratios computed in the design plan', () => {
    expect(contrastRatio('#16202B', '#DCE5EE')).toBeCloseTo(12.92, 1);
    expect(contrastRatio('#4A5664', '#DCE5EE')).toBeCloseTo(5.87, 1);
    expect(contrastRatio('#7E560F', '#DCE5EE')).toBeCloseTo(5.11, 1);
  });

  it('passes AA for the Dareesha palette and catches a failing one', () => {
    expect(checkContrast(defineTokens(dareesha))).toEqual([]);
    const bad = defineTokens({ ...dareesha, color: { ...dareesha.color, muted: '#9AA5B1' } });
    expect(checkContrast(bad).map((i) => i.pair)).toContain('muted on bg');
  });
});

describe('fonts', () => {
  it('accepts Alexandria for Bahrain and rejects Readex Pro for Iraqi copy', () => {
    const t = defineTokens(dareesha);
    expect(checkFonts(t, { country: 'BH', dialect: 'khaleeji-bh', numberingSystem: 'latn' })).toEqual([]);
    const readex = defineTokens({ ...dareesha, fonts: { ...dareesha.fonts, arabic: { display: dareesha.fonts.arabic.display, body: { family: 'Readex Pro', weights: [400] } } } });
    expect(checkFonts(readex, { country: 'IQ', dialect: 'iraqi', numberingSystem: 'arab' }).map((i) => i.level)).toContain('error');
  });

  it('rejects prices in a face without Arabic separators and impossible weights', () => {
    const ruqaa = defineTokens({ ...dareesha, fonts: { ...dareesha.fonts, arabic: { display: { family: 'Aref Ruqaa', weights: [400, 600] }, body: { family: 'Aref Ruqaa', weights: [400] } } } });
    const msgs = checkFonts(ruqaa, { country: 'KW', dialect: 'kuwaiti', numberingSystem: 'arab' }).map((i) => i.message).join('\n');
    expect(msgs).toMatch(/separators/);
    expect(msgs).toMatch(/no weight 600/);
    expect(msgs).toMatch(/cannot carry body text/);
    expect(missingGlyphClasses('Readex Pro', 'چاي گلبي')).toEqual(['چ/گ']);
  });
});

describe('css', () => {
  it('emits brand variables, shares repeated families and sets English overrides', () => {
    const t = defineTokens(dareesha);
    const css = tokensToCss(t);
    expect(css).toContain('--brand-bg: #DCE5EE;');
    expect(css).toContain('--brand-font-body: var(--font-ar-display), var(--font-latin-display), sans-serif;');
    expect(css).toMatch(/:root:lang\(en\) \{[\s\S]*--brand-fw-body: 400;/);
    expect(fontVariables(t).arBody).toBe('--font-ar-display');
  });

  it('builds fluid sizes between 390 and 1440', () => {
    expect(fluid(16, 16)).toBe('16px');
    expect(fluid(16, 17)).toBe('clamp(16px, 15.63px + 0.1vw, 17px)');
    expect(fluid(40, 32)).toMatch(/^clamp\(32px, .* - .*vw, 40px\)$/);
  });
});
