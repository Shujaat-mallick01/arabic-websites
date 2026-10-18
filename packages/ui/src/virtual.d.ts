// Provided by the @aw/astro integration at build time.
declare module 'virtual:aw/config' {
  import type { SiteConfig, StudioConfig } from '@aw/core';
  import type { BrandTokens } from '@aw/brand';
  import type { ResolvedLite } from '@aw/ui/context';
  export const site: SiteConfig;
  export const tokens: BrandTokens;
  export const studio: StudioConfig;
  export const resolved: ResolvedLite;
  export const logos: { main: string; dark: string; mark: string };
}
