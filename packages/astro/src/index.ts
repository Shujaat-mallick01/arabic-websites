// awSite(): one call per site turns site.config.ts + brand tokens into the full Astro config.
// sites/NN/astro.config.ts is three lines: export default defineConfig(awSite({ … })).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration, AstroUserConfig } from 'astro';
import { fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import type { SiteConfig, StudioConfig } from '@aw/core';
import { fontVariables, type BrandTokens } from '@aw/brand';
import { resolvePreset, type ResolvedPreset } from '@aw/presets';
import { buildServerData } from '@aw/content/server-data';
import { LANG_SCRIPT, scriptHash } from './lang-script.ts';

export { LANG_SCRIPT, scriptHash } from './lang-script.ts';

export interface AwSiteOptions {
  site: SiteConfig;
  tokens: BrandTokens;
  studio: StudioConfig;
  /** import.meta.url of the site's astro.config.ts */
  root: string | URL;
}

const VIRTUAL = 'virtual:aw/config';
const RESOLVED_VIRTUAL = `\0${VIRTUAL}`;

function siteDirOf(root: string | URL): string {
  const p = fileURLToPath(root);
  return p.replace(/[\\/][^\\/]*$/, '');
}

function readLogo(dir: string, file: string): string {
  const p = join(dir, 'brand', file);
  if (!existsSync(p)) return '';
  // Strip the XML prolog and comments so it can be inlined.
  return readFileSync(p, 'utf8').replace(/<\?xml[^>]*>/, '').replace(/<!--[\s\S]*?-->/g, '').trim();
}

/** Astro Fonts API entries from the tokens; repeated families share one CSS variable. */
export function fontsFor(tokens: BrandTokens) {
  const vars = fontVariables(tokens);
  const entries: Array<{ provider: ReturnType<typeof fontProviders.google>; name: string; cssVariable: string; weights: number[]; subsets: string[]; styles: Array<'normal'>; fallbacks: string[] }> = [];
  const push = (family: string, cssVariable: string, weights: number[], subset: string, _fallback: string) => {
    const hit = entries.find((e) => e.cssVariable === cssVariable);
    if (hit) {
      hit.weights = [...new Set([...hit.weights, ...weights])].sort();
      return;
    }
    // No fallbacks inside the variable: the brand stacks in tokens.css decide the order
    // (Arabic face, then the paired Latin face, then a generic family).
    entries.push({ provider: fontProviders.google(), name: family, cssVariable, weights: [...new Set(weights)].sort(), subsets: subset === 'arabic' ? ['arabic', 'latin'] : [subset], styles: ['normal'], fallbacks: [] });
  };
  const ar = tokens.fonts.arabic;
  const la = tokens.fonts.latin;
  push(ar.display.family, vars.arDisplay, ar.display.weights, 'arabic', 'sans-serif');
  push(ar.body.family, vars.arBody, ar.body.weights, 'arabic', 'sans-serif');
  push(la.display.family, vars.latinDisplay, la.display.weights, 'latin', 'sans-serif');
  push(la.body.family, vars.latinBody, la.body.weights, 'latin', 'sans-serif');
  return entries;
}

function liteResolved(r: ResolvedPreset) {
  return {
    tier: r.tier,
    engines: r.engines,
    niche: r.niche,
    modules: [...r.modules],
    flows: r.flows,
    routes: r.routes,
    collections: r.collections,
    settings: r.settings,
    sections: r.sections,
    functions: r.functions.map((f) => f.name),
  };
}

export function awIntegration(opts: AwSiteOptions, r: ResolvedPreset): AstroIntegration {
  const dir = siteDirOf(opts.root);
  return {
    name: '@aw/astro',
    hooks: {
      'astro:config:setup': ({ injectRoute, injectScript, updateConfig, logger }) => {
        for (const route of r.routes) {
          const entrypoint = `@aw/astro/pages/${route.page}.astro`;
          injectRoute({ pattern: route.pattern, entrypoint, prerender: true });
          injectRoute({ pattern: route.pattern === '/' ? '/en' : `/en${route.pattern}`, entrypoint, prerender: true });
        }
        injectRoute({ pattern: '/404', entrypoint: '@aw/astro/pages/not-found.astro', prerender: true });
        injectRoute({ pattern: '/robots.txt', entrypoint: '@aw/astro/pages/robots.txt.ts', prerender: true });
        if (r.tier === 'full') injectRoute({ pattern: '/_aw/catalog.json', entrypoint: '@aw/astro/pages/catalog.json.ts', prerender: true });

        // The site's stylesheet (Tailwind + brand theme + tokens) on every page.
        const css = join(dir, 'src', 'styles', 'site.css').replace(/\\/g, '/');
        injectScript('page-ssr', `import ${JSON.stringify(css)};`);

        // Generated config for components.
        const code = [
          `export const site = ${JSON.stringify(opts.site)};`,
          `export const tokens = ${JSON.stringify(opts.tokens)};`,
          `export const studio = ${JSON.stringify(opts.studio)};`,
          `export const resolved = ${JSON.stringify(liteResolved(r))};`,
          `export const logos = ${JSON.stringify({ main: readLogo(dir, 'logo.svg'), dark: readLogo(dir, 'logo-dark.svg'), mark: readLogo(dir, 'logo-mark.svg') })};`,
        ].join('\n');
        updateConfig({
          vite: {
            plugins: [
              {
                name: 'aw-virtual-config',
                resolveId(id: string) {
                  return id === VIRTUAL ? RESOLVED_VIRTUAL : undefined;
                },
                load(id: string) {
                  return id === RESOLVED_VIRTUAL ? code : undefined;
                },
              },
            ],
          },
        });

        // Server data for functions: the catalogue and rules, never trusting client prices.
        if (r.tier === 'full') {
          try {
            const data = buildServerData(dir, opts.site, r, { strict: process.env.AW_STRICT_CONTENT === '1' });
            mkdirSync(join(dir, '.aw'), { recursive: true });
            writeFileSync(join(dir, '.aw', 'server-data.json'), JSON.stringify(data));
          } catch (e) {
            logger.error(`Could not build server data: ${(e as Error).message}`);
            throw e;
          }
        }
      },
    },
  };
}

export function awSite(opts: AwSiteOptions): AstroUserConfig {
  const r = resolvePreset(opts.site);
  const privatePaths = r.routes.filter((x) => x.private).map((x) => x.pattern.replace(/\[.*$/, ''));
  return {
    site: opts.site.deploy.url,
    trailingSlash: 'always',
    build: { format: 'directory', inlineStylesheets: 'auto' },
    compressHTML: true,
    devToolbar: { enabled: false },
    i18n: { locales: ['ar', 'en'], defaultLocale: 'ar', routing: { prefixDefaultLocale: false } },
    fonts: fontsFor(opts.tokens) as unknown as AstroUserConfig['fonts'],
    security: {
      csp: {
        algorithm: 'SHA-256',
        directives: [
          "default-src 'self'",
          "img-src 'self' data: blob:",
          "font-src 'self'",
          "connect-src 'self'",
          "form-action 'self'",
          "base-uri 'self'",
          "object-src 'none'",
          "frame-src 'self'",
          "manifest-src 'self'",
        ],
        scriptDirective: { hashes: [scriptHash(LANG_SCRIPT)] },
        styleDirective: { resources: ["'self'", { resource: "'unsafe-inline'", kind: 'attribute' }] },
      },
    },
    vite: { plugins: [tailwindcss()] },
    integrations: [
      awIntegration(opts, r),
      sitemap({
        i18n: { defaultLocale: 'ar', locales: { ar: `ar-${opts.site.locale.country}`, en: 'en' } },
        filter: (page) => {
          const path = new URL(page).pathname.replace(/^\/en(\/|$)/, '/');
          return !privatePaths.some((p) => p !== '/' && path.startsWith(p)) && !path.startsWith('/404');
        },
      }),
    ],
  };
}
