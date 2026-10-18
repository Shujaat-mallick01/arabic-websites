import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { defineSite } from '@aw/core';
import { resolvePreset } from '@aw/presets';
import { fixtureSite } from '../../core/test/fixtures.ts';
import { adminIndexHtml, buildCmsConfig, cmsConfigYaml, toWidget, validateCmsConfig } from '../src/index.ts';

const site02 = defineSite({ ...fixtureSite, features: { giftCards: true, stock: true, cod: true, sizeGuide: true, lookbook: true, reviews: true } });
const site10 = defineSite({
  ...fixtureSite,
  id: '10',
  slug: 'maraya-beauty',
  preset: { primary: 'booking.full', niche: 'beauty' },
  locale: { country: 'SA', currency: 'SAR', timeZone: 'Asia/Riyadh', dialect: 'hijazi', audience: 'women', numberingSystem: 'arab' },
  features: { resources: true, packages: true, giftCards: true, gallery: true, reviews: true },
  commerce: { orderPrefix: 'JW' },
  booking: { bookingPrefix: 'JW', granularity: 'slot', resourceModel: 'staff+rooms', staffChoice: 'optional' },
  payments: { provider: 'moyasar', methods: ['mada', 'card', 'apple_pay', 'stc_pay'], cod: false, primary: 'online' },
});

const opts = { repo: 'studio/arabic-websites', root: 'sites/02-noha-modest', brandName: 'دريشة', skipCi: true, sizeOptions: [{ value: 'm', label: 'M' }] };

describe('CMS config', () => {
  for (const [name, site] of [['02', site02], ['10', site10]] as const) {
    it(`validates against Sveltia's JSON Schema (site ${name})`, () => {
      const config = buildCmsConfig(site, resolvePreset(site), opts);
      expect(validateCmsConfig(config)).toEqual([]);
    });
  }

  it('uses entry-relative media, Latin slugs and Arabic labels', () => {
    const config = buildCmsConfig(site02, resolvePreset(site02), opts) as { collections: Array<Record<string, any>>; backend: Record<string, unknown> };
    const products = config.collections.find((c) => c.name === 'products')!;
    expect(products).toMatchObject({ folder: 'sites/02-noha-modest/src/content/products', path: '{{slug}}/index', media_folder: '', slug: '{{fields._slug}}', label: 'المنتجات', i18n: true });
    const price = products.fields.find((f: Record<string, unknown>) => f.name === 'price');
    expect(price).toMatchObject({ widget: 'number', value_type: 'float/string', step: 0.01, after_input: 'د.ب', i18n: false });
    const title = products.fields.find((f: Record<string, unknown>) => f.name === 'title');
    expect(title).toMatchObject({ i18n: true, required: ['ar'] });
    const sizes = products.fields.find((f: Record<string, unknown>) => f.name === 'sizes');
    expect(sizes.options).toEqual([{ value: 'm', label: 'M' }]);
    expect(config.backend).toMatchObject({ name: 'github', skip_ci: true });
    const settings = config.collections.find((c) => c.name === 'settings')!;
    expect(settings.files.map((f: { name: string }) => f.name)).toEqual(expect.arrayContaining(['general', 'fulfilment', 'checkout', 'home']));
  });

  it('uses 250-dinar steps for IQD and serialises to YAML', () => {
    const w = toWidget({ kind: 'money', name: 'price', label: { ar: 'السعر', en: 'Price' } }, { currency: 'IQD', i18nCollection: true });
    expect(w).toMatchObject({ step: 250, after_input: 'د.ع' });
    const yaml = cmsConfigYaml(buildCmsConfig(site10, resolvePreset(site10), { ...opts, root: 'sites/10-maraya-beauty' }));
    expect(yaml.startsWith('# GENERATED')).toBe(true);
    const back = parse(yaml);
    expect(back.collections.map((c: { name: string }) => c.name)).toEqual(expect.arrayContaining(['services', 'resources', 'packages', 'settings']));
  });

  it('writes an admin page that seeds Arabic before loading the pinned CMS', () => {
    const html = adminIndexHtml({ brandName: 'جلوة', ownerDashboard: true });
    expect(html.indexOf("p.locale = 'ar'")).toBeLessThan(html.indexOf('sveltia-cms.js'));
    expect(html).toContain('@sveltia/cms@0.248.0/dist/sveltia-cms.js');
    expect(html).toContain('href="/owner/"');
    expect(html).toContain('<html lang="ar" dir="rtl">');
  });
});
