// Brand tokens: the per-site visual layer. Components only ever see these as CSS variables.

import { z } from 'zod';

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a 6-digit hex colour like #1A4A44');

const fontSpec = z.object({
  family: z.string().min(1),
  weights: z.array(z.number().int().min(100).max(1000)).min(1),
  /** OpenType features for CSS and the logo, e.g. ['ss01']. */
  features: z.array(z.string()).default([]),
  variable: z.boolean().default(false),
});

export const tokensSchema = z.object({
  color: z.object({
    /** Page ground. */
    bg: hex,
    /** Cards, drawers, panels on the ground. */
    surface: hex,
    ink: hex,
    /** Secondary text and input borders (≥ 4.5:1 on bg and surface). */
    muted: hex,
    /** Decorative hairlines only. */
    line: hex,
    accent: hex,
    /** Text on accent fills. */
    accentInk: hex,
    /** Hover/pressed accent. */
    accentPress: hex,
    /** Footer and banner band. */
    deep: hex,
    deepInk: hex,
    deepMuted: hex,
    /** Accent used on the deep band (links, hairlines). */
    deepAccent: hex,
    /** Muted metallic for hairlines and type accents only, never gradients. */
    highlight: hex.optional(),
    danger: hex,
    success: hex,
    focus: hex,
    /** Modal backdrop, any CSS colour. */
    scrim: z.string(),
  }),
  usage: z.object({ bg: z.number(), surface: z.number(), ink: z.number(), accent: z.number(), deep: z.number().default(0) }),
  fonts: z.object({
    arabic: z.object({ display: fontSpec, body: fontSpec }),
    latin: z.object({ display: fontSpec, body: fontSpec }),
  }),
  type: z.object({
    /** Arabic body ≥ 16 px on mobile. */
    basePx: z.object({ mobile: z.number().min(15), desktop: z.number().min(15) }),
    /** Modular ratio for headings. */
    scale: z.number().min(1.1).max(1.5),
    lineHeight: z.object({ display: z.number(), heading: z.number(), body: z.number(), ui: z.number() }),
    /** Latin line heights on English pages. */
    lineHeightEn: z.object({ display: z.number(), heading: z.number(), body: z.number() }).optional(),
    /** Alef height ÷ Latin cap height. */
    latinScale: z.number().min(0.8).max(1.3),
    latinTracking: z.object({ caps: z.string(), body: z.string() }),
    weights: z.object({ display: z.number(), heading: z.number(), body: z.number(), ui: z.number(), price: z.number() }),
    /** English pages use the Latin faces one step heavier for some pairings (Alexandria/Montserrat). */
    weightsEn: z.object({ display: z.number(), heading: z.number(), body: z.number(), ui: z.number(), price: z.number() }).optional(),
    /** Display headings in uppercase on English pages (tracking-caps). */
    displayCaseEn: z.enum(['none', 'uppercase']).default('none'),
  }),
  radius: z.object({ control: z.string(), card: z.string(), image: z.string(), pill: z.string() }),
  space: z.object({
    rhythm: z.enum(['airy', 'standard', 'dense']),
    gutterPx: z.object({ mobile: z.number(), desktop: z.number() }),
    maxWidthPx: z.number(),
  }),
  shadow: z.object({ card: z.string(), overlay: z.string() }),
  border: z.object({ width: z.string(), style: z.enum(['solid', 'double', 'dashed']).default('solid') }).default({ width: '1px', style: 'solid' }),
  motion: z.object({ durationMs: z.number(), easing: z.string(), reveal: z.enum(['none', 'fade']) }),
  photo: z.object({
    grade: z.object({
      saturation: z.number(),
      brightness: z.number(),
      warmth: z.number(),
      contrast: z.number(),
      tint: hex.optional(),
      tintStrength: z.number().optional(),
    }),
    aspect: z.object({ card: z.string(), hero: z.string(), heroDesktop: z.string().optional() }),
  }),
});

export type BrandTokensInput = z.input<typeof tokensSchema>;
export type BrandTokens = z.output<typeof tokensSchema>;
export type FontSpec = BrandTokens['fonts']['arabic']['display'];

export class TokensError extends Error {
  override name = 'TokensError';
}

export function defineTokens(input: BrandTokensInput): BrandTokens {
  const r = tokensSchema.safeParse(input);
  if (!r.success) {
    throw new TokensError(`Invalid brand tokens:\n${r.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')}`);
  }
  const total = r.data.usage.bg + r.data.usage.surface + r.data.usage.ink + r.data.usage.accent + r.data.usage.deep;
  if (Math.abs(total - 100) > 0.5) throw new TokensError(`Palette usage must add up to 100 %, got ${total}`);
  return r.data;
}
