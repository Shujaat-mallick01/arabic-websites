// Dareesha brand tokens (docs/design/02-noha-modest.md §2–§5). T structure: dusk-blue mist ground.
import { defineTokens } from '@aw/brand';

export default defineTokens({
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
    arabic: {
      display: { family: 'Alexandria', weights: [300, 400, 500], variable: true },
      body: { family: 'Alexandria', weights: [300, 400, 500], variable: true },
    },
    latin: {
      display: { family: 'Montserrat', weights: [400, 500, 600], variable: true },
      body: { family: 'Montserrat', weights: [400, 500, 600], variable: true },
    },
  },
  type: {
    basePx: { mobile: 16, desktop: 17 },
    scale: 1.25,
    lineHeight: { display: 1.35, heading: 1.4, body: 1.85, ui: 1.4 },
    lineHeightEn: { display: 1.2, heading: 1.3, body: 1.65 },
    latinScale: 1.17,
    latinTracking: { caps: '0.08em', body: '0' },
    weights: { display: 300, heading: 400, body: 300, ui: 500, price: 500 },
    weightsEn: { display: 400, heading: 500, body: 400, ui: 600, price: 600 },
  },
  radius: { control: '10px', card: '14px', image: '14px', pill: '10px' },
  space: { rhythm: 'airy', gutterPx: { mobile: 16, desktop: 80 }, maxWidthPx: 1280 },
  shadow: { card: 'none', overlay: '0 12px 40px rgb(22 32 43 / 0.18)' },
  motion: { durationMs: 240, easing: 'cubic-bezier(.2,.7,.2,1)', reveal: 'none' },
  photo: {
    grade: { saturation: 0.98, brightness: 1.02, warmth: -0.04, contrast: 1.02 },
    aspect: { card: '3 / 4', hero: '4 / 5', heroDesktop: '16 / 7' },
  },
});
