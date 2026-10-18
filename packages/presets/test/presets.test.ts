import { describe, expect, it } from 'vitest';
import { defineSite, type SiteConfigInput } from '@aw/core';
import { fixtureSite } from '../../core/test/fixtures.ts';
import { PresetError, resolvePreset } from '../src/index.ts';

const site02 = defineSite({ ...fixtureSite, features: { giftCards: true, stock: true, cod: true, sizeGuide: true, lookbook: true, reviews: true } });

const lite = (over: Partial<SiteConfigInput>): SiteConfigInput => {
  const { payments: _p, ops: _o, ...rest } = fixtureSite;
  return { ...rest, tier: 'lite', preset: { primary: 'commerce.lite', niche: 'fashion' }, features: {}, ...over };
};

describe('resolvePreset', () => {
  it('builds a full commerce site with checkout, payments and the owner dashboard', () => {
    const r = resolvePreset(site02);
    expect(r.tier).toBe('full');
    expect(r.flows).toEqual({ order: 'checkout', booking: 'none', enquiry: 'form' });
    const pages = r.routes.map((x) => x.page);
    expect(pages).toEqual(expect.arrayContaining(['home', 'shop', 'product', 'category', 'cart', 'checkout', 'order', 'pay-return', 'pay-mock', 'owner', 'gift-cards', 'size-guide', 'lookbook', 'about', 'policy', 'faq']));
    expect(pages).not.toContain('book');
    expect(r.functions.map((f) => f.name)).toEqual(expect.arrayContaining(['quote', 'checkout', 'order', 'pay-status', 'pay-webhook', 'pay-mock', 'stock', 'giftcard', 'owner']));
    expect(r.settings).toEqual(expect.arrayContaining(['general', 'contact', 'hours', 'home', 'seo', 'sizes', 'fulfilment', 'checkout', 'notifications']));
    expect(r.collections).toEqual(expect.arrayContaining(['products', 'categories', 'gallery', 'reviews', 'faqs', 'pages', 'settings']));
    expect(r.envKeys.map((e) => e.key)).toEqual(expect.arrayContaining(['PAYMENTS_MODE', 'SESSION_SECRET', 'TAP_SECRET_KEY']));
    expect(r.sections).toEqual(expect.arrayContaining(['hero', 'categories', 'gift-cards', 'delivery-table', 'lookbook']));
  });

  it('builds a lite WhatsApp catalogue with no server functions', () => {
    const r = resolvePreset(defineSite(lite({ features: { sizeGuide: true, stockists: true } })));
    expect(r.tier).toBe('lite');
    expect(r.flows.order).toBe('whatsapp');
    expect(r.functions).toEqual([]);
    expect(r.envKeys).toEqual([]);
    expect(r.routes.map((x) => x.page)).toEqual(expect.arrayContaining(['shop', 'product', 'stockists', 'size-guide']));
    expect(r.routes.map((x) => x.page)).not.toContain('checkout');
  });

  it('combines booking lite with a small shop (site 11)', () => {
    const r = resolvePreset(
      defineSite(lite({ preset: { primary: 'booking.lite', secondary: ['commerce.lite'], niche: 'henna' }, booking: { bookingPrefix: 'BN', granularity: 'day', resourceModel: 'none', staffChoice: 'none' }, features: { seasonalWindows: true } })),
    );
    expect(r.flows).toMatchObject({ order: 'whatsapp', booking: 'whatsapp-request' });
    expect(r.routes.map((x) => x.page)).toEqual(expect.arrayContaining(['book', 'services', 'shop', 'gallery']));
    expect(r.settings).toContain('booking');
  });

  it('gives a salon selling gift cards the checkout and order functions', () => {
    const r = resolvePreset(
      defineSite({ ...fixtureSite, preset: { primary: 'booking.full', niche: 'beauty' }, booking: { bookingPrefix: 'JL', granularity: 'slot', resourceModel: 'staff+rooms', staffChoice: 'optional' }, features: { giftCards: true, resources: true } }),
    );
    expect(r.functions.map((f) => f.name)).toEqual(expect.arrayContaining(['availability', 'booking', 'giftcard', 'checkout', 'order']));
    expect(r.functions.map((f) => f.name)).not.toContain('quote');
    expect(r.routes.map((x) => x.page)).toEqual(expect.arrayContaining(['book', 'booking', 'gift-cards', 'order', 'owner']));
  });

  it('refuses modules the presets do not allow', () => {
    expect(() => resolvePreset(defineSite(lite({ features: { cart: true } })))).toThrow(PresetError);
  });

  it('switches modules off with false and adds the Credimax interstitial', () => {
    const s = defineSite({ ...fixtureSite, features: { reviews: false }, payments: { provider: 'credimax', methods: ['card'], cod: true, primary: 'online' } });
    const r = resolvePreset(s);
    expect(r.modules.has('reviews')).toBe(false);
    expect(r.routes.map((x) => x.page)).toContain('pay-credimax');
    expect(r.envKeys.map((e) => e.key)).toContain('CREDIMAX_NOTIFICATION_SECRET');
  });
});
