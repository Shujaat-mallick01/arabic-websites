// Reads a site's content from disk (no Astro) with the same schemas, minus image resolution,
// and builds the catalogue and rules that server functions need. Functions never trust client prices.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { COUNTRY_INFO, type SiteConfig } from '@aw/core';
import { DEFAULT_SEED_BY_COUNTRY, type ZoneSeedListId } from '@aw/i18n';
import type { Branch, CheckoutRules, FulfilmentRules, Product } from '@aw/commerce';
import type { BookingRules, Resource, Service } from '@aw/booking';
import type { CollectionId, ResolvedPreset, SettingsId } from '@aw/presets';
import type { HoursSettings } from '@aw/core';
import { collectionFields, collectionFormat, settingsFields } from './defs/index.ts';
import { entrySchema, settingsSchema } from './zod.ts';
import { bi, toBookingRules, toCheckoutRules, toFulfilmentRules, toHours, toMoney, toProduct, toResource, toService, type RawEntry } from './normalise.ts';

export interface ServerData {
  siteId: string;
  currency: SiteConfig['locale']['currency'];
  products: Product[];
  services: Service[];
  resources: Resource[];
  hours: HoursSettings;
  fulfilment: FulfilmentRules | null;
  checkout: CheckoutRules | null;
  booking: BookingRules | null;
  general: Record<string, unknown>;
  contact: Record<string, unknown>;
  notifications: { ownerEmails: string[]; ownerWhatsapp?: string; notifyOn: string[] };
  giftCardDenominations: number[];
  builtAt: string;
}

export class ContentError extends Error {
  override name = 'ContentError';
}

export function zoneListsFor(site: SiteConfig): ZoneSeedListId[] {
  const lists: ZoneSeedListId[] = [];
  const d = DEFAULT_SEED_BY_COUNTRY[site.locale.country];
  if (d) lists.push(d);
  if (site.locale.country === 'SA') lists.push('jeddah-districts');
  return lists;
}

export function readSettingsFile(siteDir: string, id: SettingsId, site: SiteConfig, resolved: ResolvedPreset, strict = false): Record<string, any> {
  const file = join(siteDir, 'src/content/settings', `${id}.json`);
  if (!existsSync(file)) return {};
  const raw = JSON.parse(readFileSync(file, 'utf8'));
  const schema = settingsSchema(settingsFields(id, resolved.sections), { currency: site.locale.currency, strict });
  const r = schema.safeParse(raw);
  if (!r.success) throw new ContentError(`settings/${id}.json: ${r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
  return r.data as Record<string, any>;
}

export function readEntries(siteDir: string, id: Exclude<CollectionId, 'settings' | 'pages'>, site: SiteConfig, resolved: ResolvedPreset, strict = false): Array<{ id: string; data: RawEntry }> {
  const dir = join(siteDir, 'src/content', id);
  if (!existsSync(dir)) return [];
  const fields = collectionFields(id, resolved);
  const format = collectionFormat(id);
  const out: Array<{ id: string; data: RawEntry }> = [];
  for (const name of readdirSync(dir).sort()) {
    const file = join(dir, name, 'index.yml');
    if (!statSync(join(dir, name)).isDirectory() || !existsSync(file)) continue;
    const raw = parseYaml(readFileSync(file, 'utf8')) ?? {};
    if (format === 'yaml-plain') {
      const r = settingsSchema(fields, { currency: site.locale.currency, strict }).safeParse(raw);
      if (!r.success) throw new ContentError(`${id}/${name}: ${r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
      out.push({ id: name, data: { ar: r.data as Record<string, any>, en: {} } });
      continue;
    }
    const r = entrySchema(fields, { currency: site.locale.currency, strict }).safeParse(raw);
    if (!r.success) throw new ContentError(`${id}/${name}: ${r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
    out.push({ id: name, data: r.data as unknown as RawEntry });
  }
  return out;
}

/** Strips images (functions never need them) and converts content to engine models. */
export function buildServerData(siteDir: string, site: SiteConfig, resolved: ResolvedPreset, opts: { strict?: boolean } = {}): ServerData {
  const cur = site.locale.currency;
  const strict = !!opts.strict;
  const settings = (id: SettingsId) => (resolved.settings.includes(id) ? readSettingsFile(siteDir, id, site, resolved, strict) : {});
  const general = settings('general');
  const checkoutRaw = settings('checkout');
  const sizes = settings('sizes');
  const vatBps = general.pricesIncludeVat ? COUNTRY_INFO[site.locale.country].vatBps || undefined : undefined;
  const checkout = resolved.settings.includes('checkout') ? toCheckoutRules(checkoutRaw, cur, vatBps) : null;

  const addons = new Map<string, { title: { ar: string; en: string }; price: ReturnType<typeof toMoney> & {}; maxQty: number }>();
  if (resolved.collections.includes('addons')) {
    for (const e of readEntries(siteDir, 'addons', site, resolved, strict)) {
      addons.set(e.id, { title: bi(e.data, 'title'), price: toMoney(e.data.ar.price, cur)!, maxQty: Number(e.data.ar.maxQty ?? 1) });
    }
  }

  const strip = <T extends { images?: unknown[] }>(x: T): T => ({ ...x, images: [] });

  const products = resolved.collections.includes('products')
    ? readEntries(siteDir, 'products', site, resolved, strict).map((e) =>
        strip(toProduct(e.id, e.data, { currency: cur, sizes: sizes.sizes ? { sizes: sizes.sizes } : undefined, giftWrap: checkout?.giftWrap, addons })),
      )
    : [];
  const services = resolved.collections.includes('services') ? readEntries(siteDir, 'services', site, resolved, strict).map((e) => strip(toService(e.id, e.data, cur))) : [];
  const resources = resolved.collections.includes('resources') ? readEntries(siteDir, 'resources', site, resolved, strict).map((e) => toResource(e.data.ar)) : [];
  const branches: Branch[] = resolved.collections.includes('branches') ? readEntries(siteDir, 'branches', site, resolved, strict).map((e) => ({ id: e.id, name: bi(e.data, 'title') })) : [];

  const fulfilmentRaw = settings('fulfilment');
  const notifications = settings('notifications');
  return {
    siteId: site.id,
    currency: cur,
    products,
    services,
    resources,
    hours: toHours(settings('hours')),
    fulfilment: resolved.settings.includes('fulfilment') ? toFulfilmentRules(fulfilmentRaw, { currency: cur, zoneLists: zoneListsFor(site), branches }) : null,
    checkout,
    booking: resolved.settings.includes('booking') ? toBookingRules(settings('booking'), cur) : null,
    general,
    contact: settings('contact'),
    notifications: { ownerEmails: notifications.ownerEmails ?? [], ...(notifications.ownerWhatsapp ? { ownerWhatsapp: notifications.ownerWhatsapp } : {}), notifyOn: notifications.notifyOn ?? [] },
    giftCardDenominations: site.commerce?.giftCards?.denominations ?? [],
    builtAt: new Date().toISOString(),
  };
}
