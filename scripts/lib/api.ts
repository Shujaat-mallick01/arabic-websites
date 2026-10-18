// In-process API for local previews and end-to-end checks: routes /api/* to the same handler
// factories the generated Netlify functions use, with an in-memory store.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SiteConfig } from '@aw/core';
import { resolvePreset } from '@aw/presets';
import * as ops from '@aw/ops/server';

type Handler = (req: Request, ctx?: unknown) => Promise<Response>;

export function apiRouter(siteDir: string, site: SiteConfig): ((req: Request) => Promise<Response | null>) | null {
  const r = resolvePreset(site);
  if (!r.functions.length) return null;
  const dataFile = join(siteDir, '.aw', 'server-data.json');
  if (!existsSync(dataFile)) throw new Error(`Missing ${dataFile}. Build the site first.`);
  const data = JSON.parse(readFileSync(dataFile, 'utf8'));
  process.env.ORDER_STORE ??= 'memory';
  const routes = r.functions.map((f) => {
    const factory = (ops as unknown as Record<string, (s: SiteConfig, d: unknown) => Handler>)[f.handler.factory];
    if (!factory) throw new Error(`Unknown handler ${f.handler.factory}`);
    const prefix = f.path.endsWith('/*') ? f.path.slice(0, -1) : null;
    return { match: (p: string) => (prefix ? p.startsWith(prefix) : p === f.path || p === `${f.path}/`), handler: factory(site, data) };
  });
  return async (req) => {
    const path = new URL(req.url).pathname;
    const hit = routes.find((x) => x.match(path));
    return hit ? hit.handler(req, { waitUntil: () => undefined }) : null;
  };
}
