import { describe, expect, it } from 'vitest';
import { bcp47, defineSite, ogLocale, SiteConfigError, type SiteConfigInput } from '../src/index.ts';
import { fixtureSite } from './fixtures.ts';

describe('defineSite', () => {
  it('accepts a valid config and fills defaults', () => {
    const s = defineSite(fixtureSite);
    expect(s.locale.weekStart).toBe('sat');
    expect(s.locale.weekend).toEqual(['fri', 'sat']);
    expect(s.locale.hijri.show).toBe('never');
    expect(s.layout.sectionVariants).toEqual({});
  });

  it('rejects a currency that does not match the country', () => {
    expect(() => defineSite({ ...fixtureSite, locale: { ...fixtureSite.locale, currency: 'KWD' } })).toThrow(/BH uses BHD/);
  });

  it('rejects a tier that does not match the presets', () => {
    expect(() => defineSite({ ...fixtureSite, tier: 'lite' })).toThrow(/tier must be "full"/);
  });

  it('requires payments and ops on the full tier', () => {
    const { payments: _p, ops: _o, ...rest } = fixtureSite;
    try {
      defineSite(rest as SiteConfigInput);
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(SiteConfigError);
      expect(String(e)).toMatch(/payments config is required/);
      expect(String(e)).toMatch(/ops config is required/);
    }
  });

  it('rejects unknown layout variants and bad slugs', () => {
    expect(() => defineSite({ ...fixtureSite, layout: { ...fixtureSite.layout, hero: 'rainbow' as never } })).toThrow(/layout.hero/);
    expect(() => defineSite({ ...fixtureSite, slug: 'Noha Modest' })).toThrow(/slug/);
  });

  it('requires COD when primary is cod', () => {
    expect(() => defineSite({ ...fixtureSite, payments: { provider: null, methods: [], cod: false, primary: 'cod' } })).toThrow(/cash on delivery/);
  });

  it('derives locale tags', () => {
    expect(bcp47({ country: 'IQ' }, 'ar')).toBe('ar-IQ');
    expect(bcp47({ country: 'IQ' }, 'en')).toBe('en');
    expect(ogLocale({ country: 'KW' }, 'ar')).toBe('ar_KW');
    expect(ogLocale({ country: 'KW' }, 'en')).toBe('en_US');
  });
});
