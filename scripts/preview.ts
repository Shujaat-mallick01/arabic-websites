// pnpm preview <site> [--port 4300] — serves the built site with its /api/* functions in-process
// (in-memory store, mock payments), so checkout and booking work locally like on Netlify.
import { join } from 'node:path';
import { loadSite, resolveSite } from './lib/sites.ts';
import { serveDir } from './lib/serve.ts';
import { apiRouter } from './lib/api.ts';

const args = process.argv.slice(2);
const name = resolveSite(args[0] ?? '');
const port = Number(args[args.indexOf('--port') + 1] || 0) || 4300 + Number(name.slice(0, 2));
const s = await loadSite(name);
process.env.PAYMENTS_MODE ??= 'mock';
const api = apiRouter(s.dir, s.site);
const { url } = await serveDir(join(s.dir, 'dist'), port, api ?? undefined);
process.env.URL = url;
console.log(`${name} → ${url}${api ? ' (with API, in-memory store, mock payments)' : ''}`);
