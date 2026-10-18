// Prices, options and rules for the browser's display quote. The checkout function re-prices
// everything from server data, so this file only drives what the shopper sees.
import type { APIRoute } from 'astro';
import { getCheckoutRules, getFulfilment, getProducts } from '@aw/ui/data';

export const GET: APIRoute = async () => {
  const products = (await getProducts()).map((p) => ({
    ...p,
    images: p.images.slice(0, 1).map((i) => ({ src: (i.src as { src: string }).src, alt: i.alt })),
    description: { ar: '', en: '' },
  }));
  const body = { products, fulfilment: await getFulfilment(), checkout: await getCheckoutRules() };
  return new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json; charset=utf-8' } });
};
