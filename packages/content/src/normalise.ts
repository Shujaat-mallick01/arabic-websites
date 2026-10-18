// CMS data → engine models. This mapping is how one cart and one checkout serve every niche:
// bottle sizes, trays, cake sizes, MOQ tiers and add-ons all become ProductOption + QuantityRule.

import {
  money,
  parseDecimal,
  percentToBps,
  WEEKDAYS,
  type CurrencyCode,
  type HoursSettings,
  type I18nText,
  type Lang,
  type Money,
  type TimeRange,
  type Weekday,
} from '@aw/core';
import { zoneName, type ZoneSeedListId } from '@aw/i18n';
import type { Branch, CheckoutRules, DeliveryRules, FulfilmentRules, Product, ProductImage, ProductOption, QuantityRule, Zone } from '@aw/commerce';
import type { BookingRules, DepositRule, Resource, Service } from '@aw/booking';

type Raw = Record<string, any>;
export interface RawEntry {
  ar: Raw;
  en: Raw;
}

const t = (ar: string, en: string): I18nText => ({ ar, en });

/** English falls back to Arabic so drafts still render; the content check reports the gap. */
export function bi(entry: RawEntry, key: string): I18nText {
  const ar = String(entry.ar[key] ?? '');
  const en = entry.en?.[key];
  return { ar, en: en === undefined || en === null || en === '' ? ar : String(en) };
}

export function hasEnglish(entry: RawEntry, key: string): boolean {
  const v = entry.en?.[key];
  return v !== undefined && v !== null && String(v).trim() !== '';
}

/** The page-language view of an entry: Arabic, or English over Arabic's non-translatable fields. */
export function localise<T extends Raw>(entry: { ar: T; en: Partial<T> }, lang: Lang): T {
  if (lang === 'ar') return entry.ar;
  const out: Raw = { ...entry.ar };
  for (const [k, v] of Object.entries(entry.en ?? {})) if (v !== undefined && v !== null && v !== '') out[k] = v;
  return out as T;
}

export function toMoney(v: unknown, currency: CurrencyCode): Money | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  return parseDecimal(String(v), currency);
}

function must(v: unknown, currency: CurrencyCode, what: string): Money {
  const m = toMoney(v, currency);
  if (!m) throw new Error(`Missing price: ${what}`);
  return m;
}

function inline(v: unknown): I18nText {
  const o = (v ?? {}) as Raw;
  const ar = String(o.ar ?? '');
  return { ar, en: o.en ? String(o.en) : ar };
}

export function images<Src>(list: unknown, title: I18nText): ProductImage<Src>[] {
  const arr = Array.isArray(list) ? list : [];
  return arr
    .filter((i: Raw) => i && i.src)
    .map((i: Raw, n: number) => ({
      src: i.src as Src,
      alt: { ar: i.alt_ar || `${title.ar} — صورة ${n + 1}`, en: i.alt_en || `${title.en} — image ${n + 1}` },
    }));
}

export interface ProductContext {
  currency: CurrencyCode;
  sizes?: { sizes: Array<{ id: string; label: I18nText }> };
  giftWrap?: { price: Money; cardMaxLength: number };
  addons?: Map<string, { title: I18nText; price: Money; maxQty: number }>;
}

export function toProduct<Src = unknown>(id: string, entry: RawEntry, ctx: ProductContext): Product<Src> {
  const a = entry.ar;
  const cur = ctx.currency;
  const title = bi(entry, 'title');
  const options: ProductOption[] = [];
  const leadTags: string[] = [];
  const attributes: Record<string, unknown> = {};

  if (Array.isArray(a.sizes) && a.sizes.length && typeof a.sizes[0] === 'string') {
    const labels = new Map((ctx.sizes?.sizes ?? []).map((s) => [s.id, s.label]));
    options.push({
      kind: 'choice', id: 'size', label: t('المقاس', 'Size'), required: true, display: 'buttons',
      choices: (a.sizes as string[]).map((s) => ({ id: s, label: labels.get(s) ?? t(s, s), stockKey: `${id}:${s}` })),
    });
  }
  if (Array.isArray(a.lengths) && a.lengths.length) {
    options.push({ kind: 'choice', id: 'length', label: t('الطول', 'Length'), required: true, display: 'select', choices: (a.lengths as number[]).map((n) => ({ id: String(n), label: t(String(n), `${n}″`) })) });
  }
  if (Array.isArray(a.colors) && a.colors.length) {
    options.push({ kind: 'choice', id: 'color', label: t('اللون', 'Colour'), required: true, display: 'swatches', choices: a.colors.map((c: Raw) => ({ id: c.id, label: t(c.name_ar, c.name_en), swatch: c.hex })) });
  }
  if (a.hemming) {
    options.push({ kind: 'choice', id: 'hem', label: t('التقصير', 'Hemming'), required: false, display: 'buttons', choices: [{ id: 'none', label: t('بدون تقصير', 'No hemming') }, { id: 'hem', label: t('تقصير على طولي', 'Hem to my length') }] });
  }
  if (Array.isArray(a.bottles) && a.bottles.length) {
    options.push({ kind: 'choice', id: 'bottle', label: t('الحجم', 'Size'), required: true, display: 'buttons', choices: a.bottles.map((b: Raw) => ({ id: String(b.ml), label: t(`${b.ml} مل`, `${b.ml} ml`), price: must(b.price, cur, `${id} bottle`) })) });
  }
  if (Array.isArray(a.trays) && a.trays.length) {
    options.push({ kind: 'choice', id: 'tray', label: t('الحجم', 'Size'), required: true, display: 'buttons', choices: a.trays.map((b: Raw, i: number) => ({ id: String(b.pieces ?? i), label: t(b.label_ar, b.label_en), price: must(b.price, cur, `${id} tray`) })) });
  }
  if (Array.isArray(a.sizes) && a.sizes.length && typeof a.sizes[0] === 'object') {
    options.push({
      kind: 'choice', id: 'size', label: t('الحجم', 'Size'), required: true, display: 'buttons',
      choices: a.sizes.map((s: Raw, i: number) => ({ id: `s${i + 1}`, label: t(s.label_ar, s.label_en), price: must(s.price, cur, `${id} size`) })),
    });
    if (a.sizes.some((s: Raw) => s.serves)) attributes.serves = a.sizes.map((s: Raw) => s.serves ?? null);
  }
  if (Array.isArray(a.flavours) && a.flavours.length) {
    options.push({ kind: 'choice', id: 'flavour', label: t('النكهة', 'Flavour'), required: true, display: 'buttons', choices: a.flavours.map((fl: Raw) => ({ id: fl.id, label: t(fl.label_ar, fl.label_en), ...(toMoney(fl.delta, cur) ? { delta: toMoney(fl.delta, cur)! } : {}) })) });
  }
  if (a.textOnCake?.enabled) {
    options.push({ kind: 'text', id: 'cakeText', label: t('الكتابة على الكيكة', 'Text on the cake'), required: false, maxLength: Number(a.textOnCake.maxLength ?? 30) });
  }
  if (a.personalisation?.enabled) {
    const price = toMoney(a.personalisation.price, cur);
    (a.personalisation.fields ?? []).forEach((pf: Raw, i: number) => {
      options.push({ kind: 'text', id: pf.id, label: t(pf.label_ar, pf.label_en), required: !!pf.required, maxLength: Number(pf.maxLength ?? 30), ...(i === 0 && price ? { price } : {}) });
    });
    leadTags.push('personalised');
  }
  if (a.giftWrap && ctx.giftWrap) {
    options.push({ kind: 'choice', id: 'wrap', label: t('التغليف', 'Wrapping'), required: false, display: 'buttons', choices: [{ id: 'none', label: t('بدون تغليف', 'No wrap') }, { id: 'gift', label: t('تغليف هدية', 'Gift wrap'), delta: ctx.giftWrap.price }] });
    options.push({ kind: 'text', id: 'cardMessage', label: t('رسالة البطاقة', 'Card message'), required: false, maxLength: ctx.giftWrap.cardMaxLength });
  }
  if (a.eventDate?.enabled) {
    options.push({ kind: 'date', id: 'eventDate', label: t('تاريخ المناسبة', 'Event date'), required: true, leadDays: Number(a.eventDate.leadDays ?? 0), maxDaysAhead: 365 });
  }
  if (a.referenceImage) {
    options.push({ kind: 'file', id: 'reference', label: t('صورة مرجعية', 'Reference image'), required: false, maxMb: 8 });
  }
  if (Array.isArray(a.addons) && a.addons.length && ctx.addons) {
    const items = (a.addons as string[]).flatMap((aid) => {
      const ad = ctx.addons!.get(aid);
      return ad ? [{ id: aid, label: ad.title, unitPrice: ad.price, maxQty: ad.maxQty }] : [];
    });
    if (items.length) options.push({ kind: 'addons', id: 'addons', label: t('الإضافات', 'Add-ons'), items });
  }

  const quantity: QuantityRule = { min: Number(a.minQty ?? 1), step: Number(a.qtyStep ?? 1), ...(a.maxQty ? { max: Number(a.maxQty) } : {}) };
  if (Array.isArray(a.tiers) && a.tiers.length) {
    quantity.tiers = a.tiers.map((tr: Raw) => ({ minQty: Number(tr.minQty), unitPrice: must(tr.unitPrice, cur, `${id} tier`) })).sort((x: { minQty: number }, y: { minQty: number }) => x.minQty - y.minQty);
  }

  for (const k of ['fabric', 'care', 'fit', 'guests']) if (a[k]) attributes[k] = bi(entry, k);
  for (const k of ['family', 'concentration', 'unit']) if (a[k]) attributes[k] = a[k];
  if (Array.isArray(a.occasions) && a.occasions.length) attributes.occasions = a.occasions;
  if (a.notesTop || a.notesHeart || a.notesBase) attributes.notes = { top: a.notesTop ?? [], heart: a.notesHeart ?? [], base: a.notesBase ?? [] };
  if (Array.isArray(a.inclusions_ar) && a.inclusions_ar.length) attributes.inclusions = { ar: a.inclusions_ar, en: a.inclusions_en?.length ? a.inclusions_en : a.inclusions_ar };
  if (Array.isArray(a.themes) && a.themes.length) attributes.themes = a.themes;
  if (Array.isArray(a.colors) && a.colors.length) attributes.colors = a.colors;

  return {
    id: a.id || id,
    slug: id,
    title,
    summary: bi(entry, 'summary'),
    description: bi(entry, 'description'),
    price: must(a.price, cur, id),
    ...(toMoney(a.compareAt, cur) ? { compareAt: toMoney(a.compareAt, cur)! } : {}),
    category: String(a.category ?? ''),
    tags: Array.isArray(a.tags) ? a.tags.map(String) : [],
    images: images<Src>(a.images, title),
    options,
    quantity,
    availability: a.availability ?? 'in_stock',
    leadTags,
    attributes,
    featured: !!a.featured,
    order: Number(a.order ?? 0),
  };
}

export function toDepositRule(raw: Raw | undefined, currency: CurrencyCode): DepositRule | undefined {
  if (!raw || !raw.kind || raw.kind === 'default') return undefined;
  if (raw.kind === 'none') return { kind: 'none' };
  if (raw.kind === 'fixed') return { kind: 'fixed', amount: must(raw.amount, currency, 'deposit') };
  const roundUp = toMoney(raw.roundUpTo, currency);
  return {
    kind: 'percent',
    bps: percentToBps(Number(raw.percent ?? 0)),
    ...(toMoney(raw.min, currency) ? { min: toMoney(raw.min, currency)! } : {}),
    ...(toMoney(raw.max, currency) ? { max: toMoney(raw.max, currency)! } : {}),
    roundUpTo: roundUp?.minor ?? 1,
  };
}

export function toService<Src = unknown>(id: string, entry: RawEntry, currency: CurrencyCode): Service & { images: ProductImage<Src>[]; description: I18nText; featured: boolean; order: number; options: ProductOption[] } {
  const a = entry.ar;
  const title = bi(entry, 'title');
  const product = toProduct<Src>(id, { ar: { ...a, price: a.price }, en: entry.en }, { currency });
  const deposit = toDepositRule(a.deposit, currency);
  return {
    id: a.id || id,
    slug: id,
    title,
    summary: bi(entry, 'summary'),
    description: bi(entry, 'description'),
    category: String(a.category ?? ''),
    durationMinutes: Number(a.durationMinutes),
    price: { kind: a.priceKind === 'from' ? 'from' : 'fixed', amount: must(a.price, currency, id) },
    requires: (a.requires ?? []).map((r: Raw) => ({ kind: r.kind, ...(r.skill ? { skill: r.skill } : {}), ...(r.resourceIds?.length ? { resourceIds: r.resourceIds } : {}) })),
    ...(deposit ? { deposit } : {}),
    bookableOnline: a.bookableOnline !== false,
    images: images<Src>(a.images, title),
    featured: !!a.featured,
    order: Number(a.order ?? 0),
    options: product.options,
  };
}

export function toResource(raw: Raw): Resource & { role: I18nText; order: number } {
  return {
    id: raw.id,
    kind: raw.kind,
    name: inline(raw.name),
    role: inline(raw.role),
    capacity: Number(raw.capacity ?? 1),
    skills: raw.skills ?? [],
    ...(raw.weekly && WEEKDAYS.some((d) => ranges(raw.weekly[d]).length) ? { weekly: Object.fromEntries(WEEKDAYS.map((d) => [d, ranges(raw.weekly[d])])) as Resource['weekly'] } : {}),
    daysOff: raw.daysOff ?? [],
    active: raw.active !== false,
    order: Number(raw.order ?? 0),
  };
}

function ranges(list: unknown): TimeRange[] {
  return Array.isArray(list) ? list.filter((r: Raw) => r?.open && r?.close).map((r: Raw) => ({ open: r.open, close: r.close })) : [];
}

export function toHours(raw: Raw): HoursSettings {
  const weekly = {} as Record<Weekday, TimeRange[]>;
  for (const d of WEEKDAYS) weekly[d] = ranges(raw.weekly?.[d]);
  return {
    weekly,
    seasons: (raw.seasons ?? []).map((s: Raw) => ({ id: s.id, label: inline(s.label), from: s.from, to: s.to, weekly: { all: ranges(s.all) }, approximate: s.approximate !== false })),
    exceptions: (raw.exceptions ?? []).map((e: Raw) => ({ date: e.date, ...(e.closed !== false && !ranges(e.ranges).length ? { closed: true } : { ranges: ranges(e.ranges) }), note: inline(e.note) })),
    ...(raw.note ? { note: inline(raw.note) } : {}),
  };
}

export interface FulfilmentContext {
  currency: CurrencyCode;
  zoneLists: ZoneSeedListId[];
  branches?: Branch[];
}

export function toZones(list: unknown, ctx: FulfilmentContext): Zone[] {
  const arr = Array.isArray(list) ? list : [];
  return arr.map((z: Raw) => {
    const seeded = zoneName(z.id, ctx.zoneLists);
    const custom = inline(z.name);
    return {
      id: z.id,
      kind: z.kind ?? 'governorate',
      name: custom.ar ? custom : seeded ?? t(z.id, z.id),
      fee: must(z.fee, ctx.currency, `zone ${z.id}`),
      ...(toMoney(z.freeOver, ctx.currency) ? { freeOver: toMoney(z.freeOver, ctx.currency)! } : {}),
      ...(toMoney(z.minOrder, ctx.currency) ? { minOrder: toMoney(z.minOrder, ctx.currency)! } : {}),
      eta: { min: Number(z.etaMin ?? 1), max: Number(z.etaMax ?? z.etaMin ?? 2) },
      codAllowed: z.codAllowed !== false,
      active: z.active !== false,
    };
  });
}

export function toDeliveryRules(raw: Raw | undefined, ctx: FulfilmentContext): DeliveryRules | undefined {
  if (!raw || !Array.isArray(raw.zones) || raw.zones.length === 0) return undefined;
  const byTag: Record<string, number> = {};
  for (const lt of raw.leadByTag ?? []) byTag[lt.tag] = Number(lt.hours);
  return {
    zones: toZones(raw.zones, ctx),
    deliveryDays: raw.deliveryDays?.length ? raw.deliveryDays : ['sat', 'sun', 'mon', 'tue', 'wed', 'thu'],
    leadTime: { standardHours: Number(raw.leadHours ?? 24), byTag },
    dateRequired: !!raw.dateRequired,
    ...(raw.dispatchCutoff ? { dispatchCutoff: raw.dispatchCutoff } : {}),
    ...(raw.slots?.length ? { slots: raw.slots.map((s: Raw) => ({ id: s.id, label: inline(s.label), from: s.from, to: s.to, ...(s.capacity ? { capacity: Number(s.capacity) } : {}), ...(s.days?.length ? { days: s.days } : {}) })) } : {}),
    ...(raw.sameDay?.enabled && raw.sameDay.cutoff ? { sameDay: { cutoff: raw.sameDay.cutoff, zones: 'all' as const, ...(toMoney(raw.sameDay.fee, ctx.currency) ? { fee: toMoney(raw.sameDay.fee, ctx.currency)! } : {}) } } : {}),
    blackouts: raw.blackouts ?? [],
  };
}

export function toFulfilmentRules(raw: Raw, ctx: FulfilmentContext): FulfilmentRules {
  const delivery = toDeliveryRules(raw.delivery, ctx);
  const countries = (raw.shipping?.countries ?? []) as Raw[];
  return {
    currency: ctx.currency,
    ...(delivery ? { delivery } : {}),
    ...(countries.length
      ? {
          shipping: {
            countries: countries.map((c) => ({ code: c.code, fee: must(c.fee, ctx.currency, `shipping ${c.code}`), ...(toMoney(c.freeOver, ctx.currency) ? { freeOver: toMoney(c.freeOver, ctx.currency)! } : {}), eta: { min: Number(c.etaMin ?? 2), max: Number(c.etaMax ?? c.etaMin ?? 5) }, active: c.active !== false })),
            dutiesNote: inline(raw.shipping?.dutiesNote),
          },
        }
      : {}),
    ...(raw.pickup?.enabled
      ? {
          pickup: {
            branches: ctx.branches?.length ? ctx.branches.filter((b) => !raw.pickup.branches?.length || raw.pickup.branches.includes(b.id)) : [{ id: 'main', name: inline(raw.pickup.label).ar ? inline(raw.pickup.label) : t('المحل', 'Shop') }],
            readyInHours: Number(raw.pickup.readyInHours ?? 4),
            holdDays: Number(raw.pickup.holdDays ?? 7),
            fee: toMoney(raw.pickup.fee, ctx.currency) ?? money(0, ctx.currency),
          },
        }
      : {}),
    ...(raw.cod?.enabled
      ? {
          cod: {
            enabled: true,
            ...(toMoney(raw.cod.fee, ctx.currency) ? { fee: toMoney(raw.cod.fee, ctx.currency)! } : {}),
            ...(toMoney(raw.cod.maxOrder, ctx.currency) ? { maxOrder: toMoney(raw.cod.maxOrder, ctx.currency)! } : {}),
            scope: raw.cod.scope === 'delivery+pickup' ? 'delivery+pickup' : 'delivery',
            zones: 'all' as const,
          },
        }
      : {}),
    deliveryInfo: inline(raw.deliveryInfo),
  };
}

export function toCheckoutRules(raw: Raw, currency: CurrencyCode, vatBps: number | undefined): CheckoutRules {
  return {
    ...(toMoney(raw.minOrder, currency) ? { minOrder: toMoney(raw.minOrder, currency)! } : {}),
    ...(raw.giftWrap?.enabled && toMoney(raw.giftWrap.price, currency) ? { giftWrap: { price: toMoney(raw.giftWrap.price, currency)!, cardMaxLength: Number(raw.giftWrap.cardMaxLength ?? 200) } } : {}),
    notesMaxLength: Number(raw.notesMaxLength ?? 300),
    ...(vatBps ? { vatBps } : {}),
  };
}

export function toBookingRules(raw: Raw, currency: CurrencyCode): BookingRules {
  const cap = raw.dailyCap;
  const byWeekday: Partial<Record<Weekday, number>> = {};
  for (const d of WEEKDAYS) if (cap?.[d] !== undefined && cap[d] !== null && cap[d] !== '') byWeekday[d] = Number(cap[d]);
  const hasCap = cap && (cap.default !== undefined && cap.default !== null && cap.default !== '' || Object.keys(byWeekday).length);
  return {
    slotStepMinutes: Number(raw.slotStepMinutes ?? 30) as BookingRules['slotStepMinutes'],
    lead: { minMinutes: Number(raw.leadMinutes ?? 0), ...(raw.sameDayCutoff ? { sameDayCutoff: raw.sameDayCutoff } : {}) },
    horizonDays: Number(raw.horizonDays ?? 45),
    buffers: { beforeMinutes: Number(raw.bufferBefore ?? 0), afterMinutes: Number(raw.bufferAfter ?? 0) },
    ...(hasCap ? { dailyCap: { default: Number(cap.default ?? 9999), byWeekday, unit: cap.unit ?? 'bookings' } } : {}),
    blackouts: (raw.blackouts ?? []).map((b: Raw) => ({ from: b.from, to: b.to, reason: inline(b.reason) })),
    fullDates: raw.fullDates ?? [],
    windows: (raw.windows ?? []).map((w: Raw) => ({ id: w.id, label: inline(w.label), opensOn: w.opensOn, ...(w.closesOn ? { closesOn: w.closesOn } : {}), eventFrom: w.eventFrom, eventTo: w.eventTo, ...(w.dailyCap !== undefined ? { dailyCap: Number(w.dailyCap) } : {}) })),
    deposit: toDepositRule(raw.deposit, currency) ?? { kind: 'none' },
    cancellation: { freeUntilHours: Number(raw.freeCancelHours ?? 24), depositRefundable: !!raw.depositRefundable },
    holdMinutes: Number(raw.holdMinutes ?? 15),
  };
}
