import { describe, expect, it } from 'vitest';
import { fileURLToPath } from 'node:url';
import { defineSite, money } from '@aw/core';
import { priceLine } from '@aw/commerce';
import { resolvePreset } from '@aw/presets';
import { fixtureSite } from '../../core/test/fixtures.ts';
import { collectionFields, entrySchema, localise, settingsFields, settingsSchema, toBookingRules, toHours, toProduct } from '../src/index.ts';
import { buildServerData } from '../src/server-data.ts';

const anbar = defineSite({
  ...fixtureSite,
  id: '05',
  slug: 'anbar-scent',
  preset: { primary: 'commerce.full', niche: 'perfume' },
  locale: { country: 'KW', currency: 'KWD', timeZone: 'Asia/Kuwait', dialect: 'kuwaiti', audience: 'mixed', numberingSystem: 'arab' },
  features: {},
  payments: { provider: 'myfatoorah', methods: ['knet', 'card', 'apple_pay'], cod: false, primary: 'online' },
});
const resolved = resolvePreset(anbar);
const fixtureDir = fileURLToPath(new URL('./fixture', import.meta.url));

describe('schemas from field definitions', () => {
  it('includes niche packs on products', () => {
    const names = collectionFields('products', resolved).map((f) => f.name);
    expect(names).toEqual(expect.arrayContaining(['title', 'price', 'bottles', 'family', 'notesTop', 'giftWrap', 'occasions']));
    expect(names).not.toContain('sizes');
  });

  it('accepts an Arabic-only draft and rejects bad prices', () => {
    const schema = entrySchema(collectionFields('products', resolved), { currency: 'KWD' });
    const draft = { ar: { title: 'عود', price: '18.000', category: 'oud', family: 'oud', images: [{ src: './a.webp' }] } };
    expect(schema.safeParse(draft).success).toBe(true);
    const bad = schema.safeParse({ ar: { ...draft.ar, price: '18.0005' } });
    expect(bad.success).toBe(false);
    const missingTitle = schema.safeParse({ ar: { ...draft.ar, title: '' } });
    expect(missingTitle.success).toBe(false);
  });

  it('enforces 0.010 price steps only in strict mode', () => {
    const fields = collectionFields('products', resolved);
    const entry = { ar: { title: 'عود', price: '18.005', category: 'oud', family: 'oud', images: [{ src: './a.webp' }] } };
    expect(entrySchema(fields, { currency: 'KWD' }).safeParse(entry).success).toBe(true);
    expect(entrySchema(fields, { currency: 'KWD', strict: true }).safeParse(entry).success).toBe(false);
  });

  it('parses settings with unquoted YAML-style dates and string numbers', () => {
    const schema = settingsSchema(settingsFields('booking', resolved.sections), { currency: 'SAR' });
    const r = schema.parse({ slotStepMinutes: '15', leadMinutes: '180', fullDates: [new Date('2026-10-05T00:00:00Z')], deposit: { kind: 'percent', percent: 30, min: '50.00', roundUpTo: '1.00' } });
    expect(r.fullDates).toEqual(['2026-10-05']);
    expect(r.slotStepMinutes).toBe('15');
    expect(r.leadMinutes).toBe(180);
  });

  it('validates home sections by type', () => {
    const schema = settingsSchema(settingsFields('home', resolved.sections), { currency: 'KWD' });
    expect(schema.safeParse({ sections: [{ type: 'hero', title: { ar: 'عنبر', en: 'Anbar' } }, { type: 'reviews', enabled: false }] }).success).toBe(true);
    expect(schema.safeParse({ sections: [{ type: 'rocket' }] }).success).toBe(false);
  });
});

describe('normalisers', () => {
  it('turns bottle sizes into an absolute-priced choice and keeps attributes', () => {
    const p = toProduct('oud-royal', { ar: { title: 'عود', price: '18.000', category: 'oud', bottles: [{ ml: 30, price: '18.000' }, { ml: 50, price: '26.500' }], family: 'oud', notesTop: ['saffron'] }, en: { title: 'Oud' } }, { currency: 'KWD' });
    expect(p.options[0]).toMatchObject({ kind: 'choice', id: 'bottle', required: true });
    expect(priceLine(p, { selection: { bottle: '50' }, qty: 1 }).total.minor).toBe(26500);
    expect(p.attributes).toMatchObject({ family: 'oud', notes: { top: ['saffron'], heart: [], base: [] } });
  });

  it('builds MOQ, tiers, personalisation and event dates for favours', () => {
    const p = toProduct(
      'box',
      {
        ar: {
          title: 'علبة', price: '1.250', category: 'c', minQty: 25, qtyStep: 5,
          tiers: [{ minQty: 50, unitPrice: '1.100' }, { minQty: 25, unitPrice: '1.250' }],
          personalisation: { enabled: true, price: '0.250', fields: [{ id: 'names', label_ar: 'الأسماء', label_en: 'Names', maxLength: 24, required: true }] },
          eventDate: { enabled: true, leadDays: 10 },
        },
        en: {},
      },
      { currency: 'KWD' },
    );
    expect(p.quantity).toEqual({ min: 25, step: 5, tiers: [{ minQty: 25, unitPrice: money(1250, 'KWD') }, { minQty: 50, unitPrice: money(1100, 'KWD') }] });
    expect(p.leadTags).toEqual(['personalised']);
    expect(priceLine(p, { selection: { names: 'سارة ومحمد' }, qty: 50 }).unit.minor).toBe(1350);
    expect(p.options.find((o) => o.kind === 'date')).toMatchObject({ leadDays: 10 });
    expect(p.title.en).toBe('علبة'); // English falls back to Arabic for drafts
  });

  it('localises entries', () => {
    const e = { ar: { title: 'عود', price: '1.000' }, en: { title: 'Oud', price: undefined } };
    expect(localise(e, 'en')).toEqual({ title: 'Oud', price: '1.000' });
    expect(localise(e, 'ar').title).toBe('عود');
  });

  it('normalises hours and booking rules', () => {
    const h = toHours({ weekly: { thu: [{ open: '14:00', close: '02:00' }] }, seasons: [{ id: 'r', label: { ar: 'رمضان' }, from: '2027-02-08', to: '2027-03-08', all: [{ open: '21:00', close: '03:00' }] }], exceptions: [{ date: '2027-03-09', closed: true }] });
    expect(h.weekly.thu).toEqual([{ open: '14:00', close: '02:00' }]);
    expect(h.weekly.fri).toEqual([]);
    expect(h.seasons[0]?.weekly.all).toEqual([{ open: '21:00', close: '03:00' }]);
    expect(h.exceptions[0]).toMatchObject({ date: '2027-03-09', closed: true });
    const b = toBookingRules({ slotStepMinutes: '15', leadMinutes: 180, dailyCap: { default: 6, thu: 10, fri: 0, unit: 'orders' }, deposit: { kind: 'percent', percent: 30, min: '50.00', roundUpTo: '1.00' } }, 'SAR');
    expect(b.slotStepMinutes).toBe(15);
    expect(b.dailyCap).toEqual({ default: 6, byWeekday: { thu: 10, fri: 0 }, unit: 'orders' });
    expect(b.deposit).toEqual({ kind: 'percent', bps: 3000, min: money(5000, 'SAR'), roundUpTo: 100 });
  });
});

describe('server data', () => {
  it('builds the catalogue and rules from disk without images', () => {
    const data = buildServerData(fixtureDir, anbar, resolved);
    expect(data.products).toHaveLength(1);
    const p = data.products[0]!;
    expect(p.images).toEqual([]);
    expect(p.options.map((o) => o.id)).toEqual(['bottle', 'wrap', 'cardMessage']);
    expect(p.options[1]).toMatchObject({ choices: [{ id: 'none' }, { id: 'gift', delta: money(1500, 'KWD') }] });
    expect(data.fulfilment?.delivery?.zones.map((z) => [z.id, z.name.ar])).toEqual([['hawalli', 'حولي'], ['custom-khiran', 'الخيران']]);
    expect(data.fulfilment?.delivery?.leadTime.byTag).toEqual({ personalised: 48 });
    expect(data.checkout).toEqual({ giftWrap: { price: money(1500, 'KWD'), cardMaxLength: 150 }, notesMaxLength: 300 });
    expect(data.hours.weekly.sat).toEqual([{ open: '10:00', close: '22:00' }]);
    expect(JSON.parse(JSON.stringify(data)).products[0].price).toEqual({ minor: 18000, currency: 'KWD' });
  });
});

describe('select fields', () => {
  it('uses the default for a missing value and rejects unknown options', () => {
    const schema = entrySchema(collectionFields('products', resolved), { currency: 'KWD' });
    const base = { title: 'عود', price: '18.000', category: 'oud', family: 'oud', images: [{ src: './a.webp' }] };
    const ok = schema.parse({ ar: base });
    expect((ok.ar as Record<string, unknown>).availability).toBe('in_stock');
    expect(schema.safeParse({ ar: { ...base, availability: 'maybe' } }).success).toBe(false);
    expect(schema.safeParse({ ar: { ...base, family: undefined } }).success).toBe(false);
  });
});
