// Build-time data access for pages and components. Everything is read through Astro's content
// layer (validated by the generated schemas) and normalised into the engine models.

import { getCollection, getEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { site, resolved } from 'virtual:aw/config';
import { COUNTRY_INFO, money, type HoursSettings, type I18nText } from '@aw/core';
import { zoneName, DEFAULT_SEED_BY_COUNTRY, type ZoneSeedListId } from '@aw/i18n';
import type { Branch, CheckoutRules, FulfilmentRules, Product } from '@aw/commerce';
import type { BookingRules, Resource, Service } from '@aw/booking';
import type { SettingsId } from '@aw/presets';
import {
  bi,
  toBookingRules,
  toCheckoutRules,
  toFulfilmentRules,
  toHours,
  toMoney,
  toProduct,
  toResource,
  toService,
  type RawEntry,
} from '@aw/content';

export type Img = ImageMetadata;
export type Raw = Record<string, any>;

export interface Entry {
  id: string;
  data: RawEntry;
}

const cache = new Map<string, Promise<unknown>>();
function once<T>(key: string, fn: () => Promise<T>): Promise<T> {
  let p = cache.get(key) as Promise<T> | undefined;
  if (!p) {
    p = fn();
    cache.set(key, p);
  }
  return p;
}

const cur = site.locale.currency;

export function zoneLists(): ZoneSeedListId[] {
  const lists: ZoneSeedListId[] = [];
  const d = DEFAULT_SEED_BY_COUNTRY[site.locale.country];
  if (d) lists.push(d);
  if (site.locale.country === 'SA') lists.push('jeddah-districts');
  return lists;
}

export function zoneLabel(id: string): I18nText {
  return zoneName(id, zoneLists()) ?? { ar: id, en: id };
}

export async function getSettings(id: SettingsId): Promise<Raw> {
  return once(`s:${id}`, async () => {
    try {
      const e = await getEntry(`s-${id}`, id);
      return (e?.data ?? {}) as Raw;
    } catch {
      return {};
    }
  });
}

async function entries(name: string): Promise<Entry[]> {
  return once(`c:${name}`, async () => {
    if (!resolved.collections.includes(name as never)) return [];
    try {
      const list = await getCollection(name);
      return list.map((e: { id: string; data: RawEntry }) => ({ id: e.id, data: e.data }));
    } catch {
      return [];
    }
  });
}

const byOrder = <T extends { order?: number }>(a: T, b: T) => (a.order ?? 0) - (b.order ?? 0);

export interface Category {
  id: string;
  title: I18nText;
  summary: I18nText;
  image?: Img;
  order: number;
  season: string;
  visibleFrom?: string;
  visibleTo?: string;
}

export async function getCategories(): Promise<Category[]> {
  return once('categories', async () =>
    (await entries('categories'))
      .map((e) => ({
        id: e.id,
        title: bi(e.data, 'title'),
        summary: bi(e.data, 'summary'),
        ...(e.data.ar.image ? { image: e.data.ar.image as Img } : {}),
        order: Number(e.data.ar.order ?? 0),
        season: e.data.ar.season ?? 'none',
        ...(e.data.ar.visibleFrom ? { visibleFrom: e.data.ar.visibleFrom } : {}),
        ...(e.data.ar.visibleTo ? { visibleTo: e.data.ar.visibleTo } : {}),
      }))
      .sort(byOrder),
  );
}

export async function getCheckoutRules(): Promise<CheckoutRules> {
  return once('checkout-rules', async () => {
    const general = await getSettings('general');
    const vat = general.pricesIncludeVat ? COUNTRY_INFO[site.locale.country].vatBps || undefined : undefined;
    return toCheckoutRules(await getSettings('checkout'), cur, vat);
  });
}

export async function getAddons() {
  return once('addons', async () =>
    (await entries('addons')).map((e) => ({ id: e.id, title: bi(e.data, 'title'), summary: bi(e.data, 'summary'), unit: bi(e.data, 'unit'), price: toMoney(e.data.ar.price, cur)!, maxQty: Number(e.data.ar.maxQty ?? 1), order: Number(e.data.ar.order ?? 0), image: e.data.ar.image as Img | undefined })).sort(byOrder),
  );
}

export async function getProducts(): Promise<Product<Img>[]> {
  return once('products', async () => {
    const sizes = await getSettings('sizes');
    const checkout = await getCheckoutRules();
    const addons = new Map((await getAddons()).map((a) => [a.id, { title: a.title, price: a.price, maxQty: a.maxQty }]));
    return (await entries('products'))
      .map((e) => toProduct<Img>(e.id, e.data, { currency: cur, sizes: sizes.sizes ? { sizes: sizes.sizes.map((s: Raw) => ({ id: s.id, label: s.label })) } : undefined, giftWrap: checkout.giftWrap, addons }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  });
}

export async function getProduct(slug: string): Promise<Product<Img> | undefined> {
  return (await getProducts()).find((p) => p.slug === slug);
}

export type ServiceItem = Awaited<ReturnType<typeof toService<Img>>>;

export async function getServices(): Promise<ServiceItem[]> {
  return once('services', async () => (await entries('services')).map((e) => toService<Img>(e.id, e.data, cur)).sort(byOrder));
}

export async function getResources(): Promise<Array<Resource & { role: I18nText; order: number; photo?: Img }>> {
  return once('resources', async () => (await entries('resources')).map((e) => ({ ...toResource(e.data.ar), ...(e.data.ar.photo ? { photo: e.data.ar.photo as Img } : {}) })).sort(byOrder));
}

export async function getPackages() {
  return once('packages', async () =>
    (await entries('packages'))
      .map((e) => ({
        id: e.id,
        title: bi(e.data, 'title'),
        summary: bi(e.data, 'summary'),
        description: bi(e.data, 'description'),
        price: toMoney(e.data.ar.price, cur)!,
        inclusions: { ar: (e.data.ar.inclusions_ar ?? []) as string[], en: ((e.data.ar.inclusions_en?.length ? e.data.ar.inclusions_en : e.data.ar.inclusions_ar) ?? []) as string[] },
        services: (e.data.ar.services ?? []) as string[],
        addons: (e.data.ar.addons ?? []) as string[],
        themes: (e.data.ar.themes ?? []) as string[],
        guests: bi(e.data, 'guests'),
        durationMinutes: Number(e.data.ar.durationMinutes ?? 0),
        featured: !!e.data.ar.featured,
        order: Number(e.data.ar.order ?? 0),
        image: e.data.ar.image as Img | undefined,
      }))
      .sort(byOrder),
  );
}

function simple(name: string) {
  return async () =>
    (await entries(name))
      .map((e) => ({ id: e.id, entry: e.data, order: Number(e.data.ar.order ?? 0), featured: !!e.data.ar.featured }))
      .sort(byOrder);
}

export const getGallery = () => once('gallery', simple('gallery'));
export const getReviews = () => once('reviews', simple('reviews'));
export const getFaqs = () => once('faqs', simple('faqs'));
export const getStockists = () => once('stockists', simple('stockists'));
export const getOffers = () => once('offers', simple('offers'));
export const getNotes = () => once('notes', simple('notes'));
export const getThemes = () => once('themes', simple('themes'));
export const getWrappers = () => once('wrappers', simple('wrappers'));
export const getBranchEntries = () => once('branches', simple('branches'));

export async function getBranches(): Promise<Branch[]> {
  return (await getBranchEntries()).map((b) => ({ id: b.id, name: bi(b.entry, 'title') }));
}

export async function getHours(): Promise<HoursSettings> {
  return once('hours', async () => toHours(await getSettings('hours')));
}

export async function getFulfilment(): Promise<FulfilmentRules> {
  return once('fulfilment', async () => toFulfilmentRules(await getSettings('fulfilment'), { currency: cur, zoneLists: zoneLists(), branches: await getBranches() }));
}

export async function getBookingRules(): Promise<BookingRules> {
  return once('booking-rules', async () => toBookingRules(await getSettings('booking'), cur));
}

/** Pages (about, policies, size guide): the entry for one language, falling back to Arabic. */
export async function getPage(slug: string, lang: 'ar' | 'en') {
  const all = await allPages();
  const hit = all.find((p: { id: string }) => p.id === `${slug}.${lang}`) ?? all.find((p: { id: string }) => p.id === `${slug}.ar`);
  return hit as { id: string; data: Raw; body?: string } | undefined;
}

function allPages() {
  return once('pages', async () => {
    if (!resolved.collections.includes('pages')) return [];
    try {
      return await getCollection('pages');
    } catch {
      return [];
    }
  });
}

export async function getPages(lang: 'ar' | 'en') {
  const all = await allPages();
  const slugs = new Set(all.map((p: { id: string }) => p.id.replace(/\.(ar|en)$/, '')));
  const out: Array<{ slug: string; title: string; kind: string; order: number }> = [];
  for (const slug of slugs) {
    const ar = all.find((p: { id: string }) => p.id === `${slug}.ar`) as { data: Raw } | undefined;
    const own = all.find((p: { id: string }) => p.id === `${slug}.${lang}`) as { data: Raw } | undefined;
    if (!ar) continue;
    out.push({ slug, title: (own ?? ar).data.title, kind: ar.data.kind ?? 'policy', order: Number(ar.data.order ?? 0) });
  }
  return out.sort((a, b) => a.order - b.order);
}

/** A tiny zero for components that need one. */
export const zeroMoney = money(0, cur);
