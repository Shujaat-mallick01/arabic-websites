// A small static server for a built site: directory indexes, 404 page, correct types.
// Used by screenshots and check-all so results match a static host.

import { createServer, type Server } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.yml': 'text/yaml; charset=utf-8',
};

export type Api = (req: Request) => Promise<Response | null>;

async function toRequest(req: import('node:http').IncomingMessage, base: string): Promise<Request> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v);
  const body = chunks.length && req.method !== 'GET' && req.method !== 'HEAD' ? Buffer.concat(chunks) : undefined;
  return new Request(new URL(req.url ?? '/', base), { method: req.method, headers, ...(body ? { body } : {}) });
}

export function serveDir(dir: string, port = 0, api?: Api): Promise<{ server: Server; url: string }> {
  let base = 'http://127.0.0.1';
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (api && url.pathname.startsWith('/api/')) {
      try {
        const out = await api(await toRequest(req, base));
        if (out) {
          const headers: Record<string, string> = {};
          out.headers.forEach((v, k) => (headers[k] = v));
          res.writeHead(out.status, headers);
          res.end(Buffer.from(await out.arrayBuffer()));
          return;
        }
      } catch (e) {
        res.writeHead(500).end(String(e));
        return;
      }
    }
    let path = normalize(decodeURIComponent(url.pathname)).replace(/^([\\/])+/, '');
    if (path.includes('..')) {
      res.writeHead(400).end();
      return;
    }
    let file = join(dir, path);
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    if (!existsSync(file) && !extname(file)) file = join(dir, path, 'index.html');
    if (!existsSync(file)) {
      const nf = join(dir, '404.html');
      res.writeHead(404, { 'content-type': TYPES['.html']! });
      if (existsSync(nf)) createReadStream(nf).pipe(res);
      else res.end('Not found');
      return;
    }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
    createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      const addr = server.address();
      const p = typeof addr === 'object' && addr ? addr.port : port;
      base = `http://127.0.0.1:${p}`;
      resolve({ server, url: base });
    });
  });
}
