// Minimal declarations for Astro's virtual modules, used only by the repo-wide `pnpm typecheck`.
// Inside a site, Astro's generated types take over.
declare module 'astro:content' {
  import type { ZodType } from 'astro/zod';
  export function defineCollection(config: { loader: unknown; schema?: ZodType | ((ctx: { image: () => ZodType }) => ZodType) }): unknown;
  export function getCollection(name: string, filter?: (entry: any) => boolean): Promise<any[]>;
  export function getEntry(name: string, id: string): Promise<any>;
  export function render(entry: any): Promise<{ Content: any; headings: Array<{ depth: number; slug: string; text: string }> }>;
}
