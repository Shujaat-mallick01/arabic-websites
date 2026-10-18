// Jalwa brand tokens (docs/design/10-maraya-beauty.md §2–§5). Structure D: merlot ground,
// rose-ivory ink, champagne accent (always with deep text on it).
import { defineTokens } from '@aw/brand';

export default defineTokens({
  color: {
    bg: '#2B131A',
    surface: '#3B1E27',
    ink: '#F6ECE7',
    muted: '#CDB3B1',
    line: '#633A47',
    accent: '#E2C2A8',
    accentInk: '#1C0B10',
    accentPress: '#ECD3BE',
    deep: '#1C0B10',
    deepInk: '#F6ECE7',
    deepMuted: '#CDB3B1',
    deepAccent: '#E2C2A8',
    danger: '#FFA89E',
    success: '#A9D3B4',
    focus: '#F6ECE7',
    scrim: 'rgb(28 11 16 / 0.72)',
  },
  usage: { bg: 55, surface: 18, ink: 13, accent: 4, deep: 10 },
  fonts: {
    arabic: {
      display: { family: 'Reem Kufi', weights: [500], features: ['cv02'] },
      body: { family: 'IBM Plex Sans Arabic', weights: [400, 500] },
    },
    latin: {
      display: { family: 'Prata', weights: [400] },
      body: { family: 'IBM Plex Sans', weights: [400, 500] },
    },
  },
  type: {
    basePx: { mobile: 17, desktop: 18 },
    scale: 1.28,
    lineHeight: { display: 1.3, heading: 1.35, body: 1.8, ui: 1.5 },
    lineHeightEn: { display: 1.12, heading: 1.15, body: 1.6 },
    latinScale: 1.0,
    latinTracking: { caps: '0.12em', body: '0' },
    weights: { display: 500, heading: 500, body: 400, ui: 500, price: 400 },
    weightsEn: { display: 400, heading: 400, body: 400, ui: 500, price: 400 },
  },
  radius: { control: '6px', card: '6px', image: '6px', pill: '6px' },
  space: { rhythm: 'airy', gutterPx: { mobile: 16, desktop: 64 }, maxWidthPx: 1312 },
  shadow: { card: 'none', overlay: 'none' },
  motion: { durationMs: 240, easing: 'cubic-bezier(.2,.8,.2,1)', reveal: 'none' },
  photo: {
    grade: { saturation: 0.9, brightness: 0.97, warmth: 0.08, contrast: 1.06, tint: '#2B131A', tintStrength: 0.1 },
    aspect: { card: '3 / 4', hero: '3 / 4', heroDesktop: '4 / 5' },
  },
});
