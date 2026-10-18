import { describe, expect, it } from 'vitest';
import { money, type Money } from '@aw/core';
import { translator } from '@aw/i18n';
import {
  addWorkingDays,
  arrivalWindow,
  codAvailability,
  deliveryDates,
  earliestDeliveryDate,
  fromPrice,
  hasVariablePrice,
  leadHoursFor,
  lineIssueMessage,
  priceLine,
  quoteFulfilment,
  quoteOrder,
  sameDayStatus,
  validateLine,
  type DeliveryRules,
  type FulfilmentRules,
  type Product,
  type QuoteContext,
} from '../src/index.ts';

const bhd = (n: number): Money => money(n, 'BHD');
const kwd = (n: number): Money => money(n, 'KWD');
const sar = (n: number): Money => money(n, 'SAR');
const t = (ar: string, en = ar) => ({ ar, en });

function product(p: Partial<Product> & Pick<Product, 'id' | 'price'>): Product {
  return {
    slug: p.id,
    title: t(p.id),
    summary: t(''),
    description: t(''),
    category: 'c',
    tags: [],
    images: [],
    options: [],
    quantity: { min: 1, step: 1 },
    availability: 'in_stock',
    leadTags: [],
    attributes: {},
    ...p,
  };
}

const perfume = product({
  id: 'oud',
  price: kwd(18000),
  options: [
    {
      kind: 'choice',
      id: 'bottle',
      label: t('الحجم', 'Size'),
      required: true,
      display: 'buttons',
      choices: [
        { id: '30', label: t('30 مل'), price: kwd(18000) },
        { id: '50', label: t('50 مل'), price: kwd(26500) },
        { id: '100', label: t('100 مل'), price: kwd(42000) },
      ],
    },
    { kind: 'text', id: 'engrave', label: t('حفر الاسم'), required: false, maxLength: 12, price: kwd(1500) },
  ],
});

const favors = product({
  id: 'box',
  price: kwd(1250),
  quantity: {
    min: 25,
    step: 5,
    max: 500,
    tiers: [
      { minQty: 25, unitPrice: kwd(1250) },
      { minQty: 50, unitPrice: kwd(1100) },
      { minQty: 100, unitPrice: kwd(950) },
    ],
  },
});

const eventPkg = product({
  id: 'pkg',
  price: kwd(350000),
  options: [
    {
      kind: 'addons',
      id: 'addons',
      label: t('إضافات'),
      items: [
        { id: 'balloons', label: t('بالونات'), unitPrice: kwd(25000), maxQty: 4 },
        { id: 'photo', label: t('تصوير'), unitPrice: kwd(80000), maxQty: 1 },
      ],
    },
    { kind: 'date', id: 'eventDate', label: t('تاريخ المناسبة'), required: true, leadDays: 10, maxDaysAhead: 180 },
  ],
});

describe('priceLine', () => {
  it('uses absolute choice prices and paid text options', () => {
    expect(priceLine(perfume, { selection: { bottle: '50' }, qty: 2 }).total.minor).toBe(53000);
    expect(priceLine(perfume, { selection: { bottle: '50', engrave: 'Noor' }, qty: 1 }).unit.minor).toBe(28000);
    expect(priceLine(perfume, { selection: { bottle: '50', engrave: '   ' }, qty: 1 }).unit.minor).toBe(26500);
  });

  it('adds choice deltas to the base price', () => {
    const p = product({
      id: 'abaya',
      price: bhd(32000),
      options: [{ kind: 'choice', id: 'fabric', label: t('القماش'), required: true, display: 'buttons', choices: [{ id: 'crepe', label: t('كريب') }, { id: 'silk', label: t('حرير'), delta: bhd(6500) }] }],
    });
    expect(priceLine(p, { selection: { fabric: 'silk' }, qty: 1 }).total.minor).toBe(38500);
  });

  it('applies tiers at the exact boundaries', () => {
    const unit = (qty: number) => priceLine(favors, { selection: {}, qty }).unit.minor;
    expect(unit(25)).toBe(1250);
    expect(unit(45)).toBe(1250);
    expect(unit(50)).toBe(1100);
    expect(unit(95)).toBe(1100);
    expect(unit(100)).toBe(950);
    expect(priceLine(favors, { selection: {}, qty: 50 }).total.minor).toBe(55000);
  });

  it('adds add-ons once per line, capped at their maximum', () => {
    const r = priceLine(eventPkg, { selection: {}, qty: 1, addons: { balloons: 2, photo: 1 } });
    expect(r.addons.minor).toBe(130000);
    expect(r.total.minor).toBe(480000);
    expect(priceLine(eventPkg, { selection: {}, qty: 1, addons: { balloons: 9 } }).addons.minor).toBe(100000);
  });

  it('knows "from" prices', () => {
    expect(fromPrice(perfume).minor).toBe(18000);
    expect(fromPrice(favors).minor).toBe(950);
    expect(hasVariablePrice(perfume)).toBe(true);
    expect(hasVariablePrice(product({ id: 'x', price: bhd(1000) }))).toBe(false);
  });
});

describe('validateLine', () => {
  const today = '2026-09-23';

  it('reports MOQ, step and max problems', () => {
    expect(validateLine(favors, { productId: 'box', selection: {}, qty: 20 }, today)).toEqual([{ code: 'qty_min', min: 25, diff: 5 }]);
    expect(validateLine(favors, { productId: 'box', selection: {}, qty: 27 }, today)).toEqual([{ code: 'qty_step', step: 5 }]);
    expect(validateLine(favors, { productId: 'box', selection: {}, qty: 505 }, today)).toEqual([{ code: 'qty_max', max: 500 }]);
    expect(validateLine(favors, { productId: 'box', selection: {}, qty: 30 }, today)).toEqual([]);
  });

  it('reports required choices, long text and lead days', () => {
    const issues = validateLine(perfume, { productId: 'oud', selection: { engrave: 'A very long name here' }, qty: 1 }, today);
    expect(issues.map((i) => i.code)).toEqual(['choice_required', 'text_too_long']);
    const soon = validateLine(eventPkg, { productId: 'pkg', selection: { eventDate: '2026-09-30' }, qty: 1 }, today);
    expect(soon).toEqual([{ code: 'date_too_soon', optionId: 'eventDate', label: t('تاريخ المناسبة'), earliest: '2026-10-03' }]);
  });

  it('turns issues into exact Arabic messages', () => {
    const tr = translator({ lang: 'ar', dialect: 'kuwaiti', audience: 'women' });
    const f = { lang: 'ar' as const, date: (d: string) => d, num: (n: number) => String(n).replace(/\d/g, (x) => String.fromCodePoint(0x660 + Number(x))) };
    expect(lineIssueMessage({ code: 'qty_min', min: 25, diff: 5 }, tr, f)).toBe('أقل كمية لهذا المنتج ٢٥ قطعة. زيدي الكمية ٥ قطع على الأقل.');
    expect(lineIssueMessage({ code: 'text_too_long', optionId: 'cakeText', label: t('النص'), got: 34, max: 30 }, tr, f)).toBe('النص طويل: ٣٤ حرفاً والحد ٣٠. احذفي ٤ أحرف.');
  });
});

const bhRules: FulfilmentRules = {
  currency: 'BHD',
  delivery: {
    zones: [
      { id: 'capital', kind: 'governorate', name: t('العاصمة'), fee: bhd(1500), freeOver: bhd(30000), eta: { min: 1, max: 2 }, codAllowed: true, active: true },
      { id: 'southern', kind: 'governorate', name: t('الجنوبية'), fee: bhd(2500), minOrder: bhd(10000), eta: { min: 2, max: 3 }, codAllowed: false, active: true },
      { id: 'closed', kind: 'custom', name: t('مغلقة'), fee: bhd(1000), eta: { min: 1, max: 1 }, codAllowed: true, active: false },
    ],
    deliveryDays: ['sat', 'sun', 'mon', 'tue', 'wed', 'thu'],
    leadTime: { standardHours: 24, byTag: { personalised: 48 } },
    dateRequired: false,
  },
  shipping: { countries: [{ code: 'KW', fee: bhd(5000), freeOver: bhd(60000), eta: { min: 3, max: 5 }, active: true }], dutiesNote: t('') },
  pickup: { branches: [{ id: 'seef', name: t('السيف') }], readyInHours: 4, holdDays: 7, fee: bhd(0) },
  cod: { enabled: true, fee: bhd(500), maxOrder: bhd(80000), scope: 'delivery', zones: 'all' },
  deliveryInfo: t(''),
};

describe('fulfilment fees', () => {
  it('applies zone fees, free-over thresholds and minimum orders', () => {
    expect(quoteFulfilment(bhRules, { kind: 'delivery', zoneId: 'capital' }, bhd(10000))).toMatchObject({ fee: { minor: 1500 }, freeShippingGap: { minor: 20000 } });
    expect(quoteFulfilment(bhRules, { kind: 'delivery', zoneId: 'capital' }, bhd(30000)).fee.minor).toBe(0);
    expect(quoteFulfilment(bhRules, { kind: 'delivery', zoneId: 'southern' }, bhd(5000)).issues).toEqual([{ code: 'zone_min_order', minOrder: bhd(10000) }]);
    expect(quoteFulfilment(bhRules, { kind: 'delivery', zoneId: 'closed' }, bhd(5000)).issues).toEqual([{ code: 'zone_inactive' }]);
    expect(quoteFulfilment(bhRules, { kind: 'delivery', zoneId: 'nope' }, bhd(5000)).issues).toEqual([{ code: 'zone_unknown' }]);
  });

  it('uses the GCC shipping table and pickup', () => {
    expect(quoteFulfilment(bhRules, { kind: 'shipping', country: 'KW' }, bhd(20000)).fee.minor).toBe(5000);
    expect(quoteFulfilment(bhRules, { kind: 'shipping', country: 'OM' }, bhd(20000)).issues).toEqual([{ code: 'country_unavailable' }]);
    expect(quoteFulfilment(bhRules, { kind: 'pickup', branchId: 'seef' }, bhd(20000))).toMatchObject({ fee: { minor: 0 }, issues: [] });
    expect(quoteFulfilment(bhRules, { kind: 'pickup', branchId: 'x' }, bhd(20000)).issues).toEqual([{ code: 'branch_unknown' }]);
  });

  it('decides cash on delivery by scope, zone and maximum', () => {
    expect(codAvailability(bhRules, true, { kind: 'delivery', zoneId: 'capital' }, bhd(20000))).toEqual({ ok: true, fee: bhd(500) });
    expect(codAvailability(bhRules, false, { kind: 'delivery', zoneId: 'capital' }, bhd(20000))).toEqual({ ok: false, reason: 'off' });
    expect(codAvailability(bhRules, true, { kind: 'delivery', zoneId: 'southern' }, bhd(20000))).toEqual({ ok: false, reason: 'zone' });
    expect(codAvailability(bhRules, true, { kind: 'shipping', country: 'KW' }, bhd(20000))).toEqual({ ok: false, reason: 'scope' });
    expect(codAvailability(bhRules, true, { kind: 'pickup', branchId: 'seef' }, bhd(20000))).toEqual({ ok: false, reason: 'scope' });
    expect(codAvailability(bhRules, true, { kind: 'delivery', zoneId: 'capital' }, bhd(80010))).toEqual({ ok: false, reason: 'max_order' });
  });
});

const bahrain = (iso: string) => new Date(`${iso}+03:00`);
const jeddah = (iso: string) => new Date(`${iso}+03:00`);

describe('delivery dates', () => {
  const choc: DeliveryRules = {
    ...bhRules.delivery!,
    slots: [
      { id: 'am', label: t('صباحاً'), from: '10:00', to: '13:00', capacity: 6 },
      { id: 'pm', label: t('مساءً'), from: '16:00', to: '21:00', capacity: 8 },
    ],
  };

  it('uses the longest lead tag', () => {
    expect(leadHoursFor(choc, [])).toBe(24);
    expect(leadHoursFor(choc, ['personalised', 'other'])).toBe(48);
  });

  it('respects a 24 h lead time and the slot start times', () => {
    // Wed 23 Sep 11:00 → ready Thu 11:00, so Thursday's 10:00 slot is gone but 16:00 remains.
    const d = deliveryDates(choc, { now: bahrain('2026-09-23T11:00:00'), tz: 'Asia/Bahrain', leadHours: 24, horizonDays: 3 });
    expect(d[0]).toEqual({ date: '2026-09-24', slots: ['pm'], sameDay: false });
    // Friday is not a delivery day.
    expect(d.map((x) => x.date)).toEqual(['2026-09-24', '2026-09-26']);
  });

  it('pushes personalised orders 48 h and skips the weekend', () => {
    const e = earliestDeliveryDate(choc, { now: bahrain('2026-09-24T18:00:00'), tz: 'Asia/Bahrain', leadHours: 48 });
    // Thu 18:00 + 48 h = Sat 18:00, after the last slot starts → Sunday.
    expect(e?.date).toBe('2026-09-27');
  });

  it('skips blackout and runtime-closed dates', () => {
    const d = deliveryDates({ ...choc, blackouts: ['2026-09-24'] }, { now: bahrain('2026-09-23T08:00:00'), tz: 'Asia/Bahrain', leadHours: 24, closed: ['2026-09-26'], horizonDays: 4 });
    expect(d.map((x) => x.date)).toEqual(['2026-09-27']);
  });

  it('offers same day before the cutoff only (site 09)', () => {
    const cakes: DeliveryRules = { ...bhRules.delivery!, deliveryDays: ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'], sameDay: { cutoff: '16:00', zones: 'all' } };
    const before = sameDayStatus(cakes, jeddah('2026-09-24T15:30:00'), 'Asia/Riyadh');
    expect(before?.open).toBe(true);
    expect(before?.remainingMs).toBe(30 * 60_000);
    expect(sameDayStatus(cakes, jeddah('2026-09-24T16:00:00'), 'Asia/Riyadh')?.open).toBe(false);
    const d1 = earliestDeliveryDate(cakes, { now: jeddah('2026-09-24T15:30:00'), tz: 'Asia/Riyadh', leadHours: 0, readyNow: true, zoneId: 'x' });
    expect(d1).toMatchObject({ date: '2026-09-24', sameDay: true });
    const d2 = earliestDeliveryDate(cakes, { now: jeddah('2026-09-24T16:10:00'), tz: 'Asia/Riyadh', leadHours: 0, readyNow: true, zoneId: 'x' });
    expect(d2?.date).toBe('2026-09-25');
  });
});

describe('arrival window (site 02 ribbon)', () => {
  const base = { tz: 'Asia/Bahrain' as const, dispatchDays: ['sat', 'sun', 'mon', 'tue', 'wed', 'thu'] as const, cutoff: '13:00' };
  const satThu = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu'] as const;

  it('matches the design plan examples for an order on Wed 23 Sep 10:00', () => {
    const now = bahrain('2026-09-23T10:00:00');
    const w = (transit: { min: number; max: number }, deliveryDays: readonly string[]) =>
      arrivalWindow({ ...base, dispatchDays: [...base.dispatchDays], now, transit, deliveryDays: [...deliveryDays] as never });
    expect(w({ min: 1, max: 1 }, satThu)).toMatchObject({ dispatch: '2026-09-23', from: '2026-09-24', to: '2026-09-24' });
    expect(w({ min: 2, max: 3 }, satThu)).toMatchObject({ from: '2026-09-26', to: '2026-09-27' });
    expect(w({ min: 2, max: 4 }, ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'])).toMatchObject({ from: '2026-09-25', to: '2026-09-28' });
    expect(w({ min: 3, max: 5 }, ['sun', 'mon', 'tue', 'wed', 'thu'])).toMatchObject({ from: '2026-09-28', to: '2026-09-30' });
  });

  it('moves to the next dispatch day after the cutoff and adds hemming days', () => {
    const late = arrivalWindow({ ...base, dispatchDays: [...satThu], now: bahrain('2026-09-23T15:00:00'), transit: { min: 2, max: 3 }, deliveryDays: [...satThu] });
    expect(late).toMatchObject({ dispatch: '2026-09-24', from: '2026-09-27', to: '2026-09-28' });
    const hemmed = arrivalWindow({ ...base, dispatchDays: [...satThu], now: bahrain('2026-09-23T10:00:00'), leadDays: 2, transit: { min: 2, max: 3 }, deliveryDays: [...satThu] });
    expect(hemmed).toMatchObject({ dispatch: '2026-09-26', from: '2026-09-28', to: '2026-09-29' });
  });

  it('adds working days', () => {
    expect(addWorkingDays('2026-09-24', 1, [...satThu])).toBe('2026-09-26');
    expect(addWorkingDays('2026-09-25', 0, [...satThu])).toBe('2026-09-26');
  });
});

describe('quoteOrder', () => {
  const abaya = product({ id: 'abaya', price: bhd(32000), leadTags: [] });
  const catalog = new Map([[abaya.id, abaya]]);
  const ctx: QuoteContext = {
    catalog,
    fulfilment: bhRules,
    checkout: { notesMaxLength: 300, giftWrap: { price: bhd(1500), cardMaxLength: 200 }, vatBps: 1000, minOrder: bhd(5000) },
    siteAllowsCod: true,
    now: bahrain('2026-09-23T10:00:00'),
    tz: 'Asia/Bahrain',
    today: '2026-09-23',
  };

  it('totals lines, delivery, COD fee, gift wrap and VAT', () => {
    const q = quoteOrder({ lines: [{ productId: 'abaya', selection: {}, qty: 1 }], fulfilment: { kind: 'delivery', zoneId: 'capital' }, payment: 'cod', giftWrap: true }, ctx);
    expect(q.ok).toBe(true);
    expect(q.subtotal.minor).toBe(32000);
    expect(q.shipping.minor).toBe(0); // free over 30.000
    expect(q.giftWrap?.minor).toBe(1500);
    expect(q.codFee?.minor).toBe(500);
    expect(q.total.minor).toBe(34000);
    expect(q.vatIncluded?.minor).toBe(3091);
    expect(q.payable.minor).toBe(34000);
  });

  it('applies a gift card up to the total', () => {
    const q = quoteOrder({ lines: [{ productId: 'abaya', selection: {}, qty: 1 }], fulfilment: { kind: 'pickup', branchId: 'seef' }, giftCard: { code: 'G', balance: bhd(50000) } }, ctx);
    expect(q.giftCard?.applied.minor).toBe(32000);
    expect(q.payable.minor).toBe(0);
  });

  it('refuses COD where it is not allowed and flags unknown products', () => {
    const q = quoteOrder({ lines: [{ productId: 'abaya', selection: {}, qty: 1 }, { productId: 'ghost', selection: {}, qty: 1 }], fulfilment: { kind: 'shipping', country: 'KW' }, payment: 'cod' }, ctx);
    expect(q.ok).toBe(false);
    expect(q.orderIssues).toContainEqual({ code: 'cod_unavailable', reason: 'scope' });
    expect(q.lines[1]?.issues).toEqual([{ code: 'unknown_product' }]);
    expect(q.subtotal.minor).toBe(32000);
  });

  it('flags an empty cart and the minimum order', () => {
    expect(quoteOrder({ lines: [] }, ctx).orderIssues).toEqual([{ code: 'empty' }, { code: 'min_order', minOrder: bhd(5000) }]);
  });

  it('validates SAR orders with a same-day date', () => {
    const cake = product({ id: 'cake', price: sar(18500), availability: 'ready_now' });
    const rules: FulfilmentRules = {
      currency: 'SAR',
      delivery: {
        zones: [{ id: 'al-rawdah', kind: 'district', name: t('الروضة'), fee: sar(2500), eta: { min: 0, max: 1 }, codAllowed: false, active: true }],
        deliveryDays: ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'],
        leadTime: { standardHours: 24, byTag: {} },
        dateRequired: true,
        sameDay: { cutoff: '16:00', zones: 'all' },
      },
      deliveryInfo: t(''),
    };
    const base = { ...ctx, catalog: new Map([[cake.id, cake]]), fulfilment: rules, checkout: { notesMaxLength: 200, vatBps: 1500 }, tz: 'Asia/Riyadh' as const };
    const ok = quoteOrder({ lines: [{ productId: 'cake', selection: {}, qty: 1 }], fulfilment: { kind: 'delivery', zoneId: 'al-rawdah', date: '2026-09-24' } }, { ...base, now: jeddah('2026-09-24T12:00:00'), today: '2026-09-24' });
    expect(ok.ok).toBe(true);
    expect(ok.total.minor).toBe(21000);
    const late = quoteOrder({ lines: [{ productId: 'cake', selection: {}, qty: 1 }], fulfilment: { kind: 'delivery', zoneId: 'al-rawdah', date: '2026-09-24' } }, { ...base, now: jeddah('2026-09-24T17:00:00'), today: '2026-09-24' });
    expect(late.fulfilmentIssues).toEqual([{ code: 'date_unavailable', earliest: '2026-09-25' }]);
  });
});
