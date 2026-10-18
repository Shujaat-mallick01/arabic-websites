// Finds sites by '02', 'noha', 'noha-modest' or '02-noha-modest', and loads their config.

import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import type { SiteConfig, StudioConfig } from '@aw/core';
import type { BrandTokens } from '@aw/brand';

export const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
export const SITES_DIR = join(ROOT, 'sites');

export function listSiteDirs(): string[] {
  if (!existsSync(SITES_DIR)) return [];
  return readdirSync(SITES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^\d{2}-/.test(d.name) && existsSync(join(SITES_DIR, d.name, 'site.config.ts')))
    .map((d) => d.name)
    .sort();
}

export function resolveSite(query: string): string {
  const q = query.trim().toLowerCase().replace(/^sites[\\/]/, '');
  const dirs = listSiteDirs();
  const hit =
    dirs.find((d) => d === q) ??
    dirs.find((d) => d.slice(0, 2) === q.padStart(2, '0')) ??
    dirs.find((d) => d.slice(3) === q) ??
    dirs.filter((d) => d.includes(q));
  if (typeof hit === 'string') return hit;
  if (Array.isArray(hit) && hit.length === 1) return hit[0]!;
  if (Array.isArray(hit) && hit.length > 1) throw new Error(`"${query}" matches several sites: ${hit.join(', ')}`);
  throw new Error(`No site matches "${query}". Sites: ${dirs.join(', ') || '(none)'}`);
}

export interface LoadedSite {
  dir: string;
  name: string;
  site: SiteConfig;
  tokens: BrandTokens;
}

export async function loadSite(name: string): Promise<LoadedSite> {
  const dir = join(SITES_DIR, name);
  const site = (await import(pathToFileURL(join(dir, 'site.config.ts')).href)).default as SiteConfig;
  const tokens = (await import(pathToFileURL(join(dir, 'brand', 'tokens.ts')).href)).default as BrandTokens;
  return { dir, name, site, tokens };
}

export async function loadStudio(): Promise<StudioConfig> {
  return (await import(pathToFileURL(join(ROOT, 'studio.config.ts')).href)).default as StudioConfig;
}

/** Sites given on the command line, or all with --all. */
export function sitesFromArgs(args: string[]): string[] {
  if (args.includes('--all') || args.length === 0) return listSiteDirs();
  return args.filter((a) => !a.startsWith('--')).map(resolveSite);
}
