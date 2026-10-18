import { describe, expect, it } from 'vitest';
import { defineSite, money, type HoursSettings } from '@aw/core';
import { fixtureSite } from '../../core/test/fixtures.ts';
import { breadcrumbsJsonLd, buildHead, businessJsonLd, jsonLdScript, localePath, openingHoursSpecification, productJsonLd, robotsTxt } from '../src/index.ts';

const site = defineSite(fixtureSite);
const name = { ar: 'دريشة', en: 'Dareesha' };

describe('head', () => {
  it('builds titles, canonicals, hreflang and og:locale', () => {
    const h = buildHead(site, name, { title: 'كفتان نسمة', description: 'كتان مغسول', path: '/products/naseem/' }, 'ar');
    expect(h.title).toBe('كفتان نسمة · دريشة');
    expect(h.canonical).toBe('https://noha-modest-demo.netlify.app/products/naseem/');
    expect(h.alternates).toEqual([
      { hreflang: 'ar-BH', href: 'https://noha-modest-demo.netlify.app/products/naseem/' },
      { hreflang: 'en', href: 'https://noha-modest-demo.netlify.app/en/products/naseem/' },
      { hreflang: 'x-default', href: 'https://noha-modest-demo.netlify.app/products/naseem/' },
    ]);
    expect(h.meta).toContainEqual({ property: 'og:locale', content: 'ar_BH' });
    expect(h.meta).toContainEqual({ property: 'og:locale:alternate', content: 'en_US' });
    expect(h.robots).toBe('noindex, follow'); // demo
  });

  it('uses the brand name alone on the home page and drops noindex when indexing is on', () => {
    const live = defineSite({ ...fixtureSite, seo: { ...fixtureSite.seo, indexing: true } });
    const h = buildHead(live, name, { title: '', description: 'd', path: '/' }, 'en');
    expect(h.title).toBe('Dareesha');
    expect(h.canonical).toBe('https://noha-modest-demo.netlify.app/en/');
    expect(h.robots).toBeUndefined();
    expect(localePath('/', 'en')).toBe('/en/');
  });
});

describe('JSON-LD', () => {
  const hours: HoursSettings = {
    weekly: { sat: [{ open: '14:00', close: '02:00' }], sun: [{ open: '14:00', close: '02:00' }], mon: [], tue: [], wed: [], thu: [{ open: '14:00', close: '02:00' }], fri: [{ open: '16:00', close: '02:00' }] },
    seasons: [],
    exceptions: [],
  };

  it('groups opening hours and keeps cross-midnight closes as-is', () => {
    expect(openingHoursSpecification(hours)).toEqual([
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday', 'Sunday', 'Thursday'], opens: '14:00', closes: '02:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Friday'], opens: '16:00', closes: '02:00' },
    ]);
  });

  it('builds business, product and breadcrumb data', () => {
    const b = businessJsonLd(site, { name, description: { ar: 'ملابس', en: 'Wear' }, hours, address: { ar: 'السيف، المنامة', en: 'Seef, Manama' } }, 'ar');
    expect(b['@type']).toBe('ClothingStore');
    expect(b).toMatchObject({ address: { addressCountry: 'BH' }, currenciesAccepted: 'BHD' });
    const p = productJsonLd(site, { title: { ar: 'كفتان', en: 'Kaftan' }, description: { ar: '', en: '' }, slug: 'naseem', price: money(18500, 'BHD'), availability: 'sold_out', images: ['/_astro/a.webp'] }, 'en');
    expect(p.offers).toMatchObject({ price: '18.500', priceCurrency: 'BHD', availability: 'https://schema.org/OutOfStock' });
    expect(p.url).toBe('https://noha-modest-demo.netlify.app/en/products/naseem/');
    expect(breadcrumbsJsonLd(site, [{ name: 'Home', path: '/' }, { name: 'Shop', path: '/shop/' }], 'en').itemListElement[1]).toMatchObject({ position: 2, item: 'https://noha-modest-demo.netlify.app/en/shop/' });
  });

  it('escapes script content and writes robots.txt without blocking pages', () => {
    const out = jsonLdScript({ a: '</script>' });
    expect(out).not.toContain('<');
    expect(JSON.parse(out)).toEqual({ a: '</script>' });
    expect(robotsTxt(site)).toContain('Disallow: /owner/');
    expect(robotsTxt(site)).toContain('Sitemap: https://noha-modest-demo.netlify.app/sitemap-index.xml');
    expect(robotsTxt(site)).not.toMatch(/Disallow: \/$/m);
  });
});
