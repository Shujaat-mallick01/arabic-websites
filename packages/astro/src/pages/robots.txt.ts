import type { APIRoute } from 'astro';
import { site } from 'virtual:aw/config';
import { robotsTxt } from '@aw/seo';

export const GET: APIRoute = () => new Response(robotsTxt(site), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
