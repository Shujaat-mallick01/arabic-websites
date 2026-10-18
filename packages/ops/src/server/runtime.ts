// Server runtime for one site: environment, mode, stores and the mailer, built once per cold start.
// Precedence: environment variable > site.config.ts default. A demo can never switch itself live.

import { blobsKv, memoryKv, type KvStore } from '@aw/core/server';
import type { CurrencyCode, SiteConfig } from '@aw/core';
import type { Product, FulfilmentRules, CheckoutRules } from '@aw/commerce';
import type { BookingRules, Resource, Service } from '@aw/booking';
import type { HoursSettings } from '@aw/core';
import { kvOrderStore, type OrderStore } from '@aw/commerce/server';
import { resolveMode, type PaymentsMode, type ProviderDeps } from '@aw/payments';
import { kvAttemptStore } from '@aw/payments/server';
import { createMailer, type Mailer } from './mailer.ts';

/** What site:sync bundles into every function (built by @aw/content/server-data). */
export interface ServerData {
  siteId: string;
  currency: CurrencyCode;
  products: Product[];
  services: Service[];
  resources: Resource[];
  hours: HoursSettings;
  fulfilment: FulfilmentRules | null;
  checkout: CheckoutRules | null;
  booking: BookingRules | null;
  general: Record<string, any>;
  contact: Record<string, any>;
  notifications: { ownerEmails: string[]; ownerWhatsapp?: string; notifyOn: string[] };
  giftCardDenominations: number[];
}

export type StoreName = 'orders' | 'pay' | 'ops' | 'bookings';

export interface Runtime {
  site: SiteConfig;
  data: ServerData;
  env: Readonly<Record<string, string | undefined>>;
  mode: PaymentsMode;
  storeKind: 'blobs' | 'memory' | 'supabase';
  kv(name: StoreName): Promise<KvStore>;
  orders(): Promise<OrderStore>;
  providerDeps(): Promise<ProviderDeps>;
  mailer(): Promise<Mailer>;
  secret: string;
  now: () => Date;
  catalog: ReadonlyMap<string, Product>;
}

const memoryStores = new Map<string, KvStore>();

function readEnv(): Record<string, string | undefined> {
  const g = globalThis as unknown as { Netlify?: { env: { toObject(): Record<string, string> } } };
  try {
    if (g.Netlify?.env) return { ...process.env, ...g.Netlify.env.toObject() };
  } catch {
    /* fall through */
  }
  return { ...process.env };
}

/** Demo secret used only in mock mode when SESSION_SECRET is unset. */
const DEMO_SECRET = 'aw-demo-session-secret-not-for-production';

export class RuntimeError extends Error {
  override name = 'RuntimeError';
}

export function createRuntime(site: SiteConfig, data: ServerData, overrides: Partial<Pick<Runtime, 'env' | 'now'>> & { kvFactory?: (name: StoreName) => Promise<KvStore>; fetch?: typeof fetch } = {}): Runtime {
  const env = overrides.env ?? readEnv();
  let mode = resolveMode(env);
  // A demo site never runs live payments, whatever the environment says.
  if (site.demo.enabled && mode === 'live') mode = 'test';
  const storeKind = ((env.ORDER_STORE as Runtime['storeKind'] | undefined) ?? site.ops?.store ?? 'blobs');
  const secret = env.SESSION_SECRET || (mode === 'mock' ? DEMO_SECRET : '');
  if (!secret) throw new RuntimeError('SESSION_SECRET must be set outside mock mode');
  if (mode === 'live' && storeKind === 'memory') throw new RuntimeError('ORDER_STORE=memory is not allowed in live mode');

  const kv = async (name: StoreName): Promise<KvStore> => {
    if (overrides.kvFactory) return overrides.kvFactory(name);
    if (storeKind === 'memory') {
      const k = `${site.id}:${name}`;
      if (!memoryStores.has(k)) memoryStores.set(k, memoryKv());
      return memoryStores.get(k)!;
    }
    return blobsKv(`${site.slug}-${name}`);
  };
  const siteUrl = env.URL && env.CONTEXT === 'production' ? env.URL : env.DEPLOY_PRIME_URL || env.URL || site.deploy.url;
  const now = overrides.now ?? (() => new Date());
  let ordersP: Promise<OrderStore> | null = null;
  let mailerP: Promise<Mailer> | null = null;
  return {
    site,
    data,
    env,
    mode,
    storeKind,
    kv,
    secret,
    now,
    catalog: new Map(data.products.map((p) => [p.id, p])),
    orders: () => (ordersP ??= kv('orders').then(kvOrderStore)),
    mailer: () => (mailerP ??= kv('ops').then((k) => createMailer(env, k, site))),
    async providerDeps(): Promise<ProviderDeps> {
      return { mode, env, attempts: kvAttemptStore(await kv('pay')), siteUrl: siteUrl.replace(/\/$/, ''), fetch: overrides.fetch ?? globalThis.fetch.bind(globalThis), now };
    },
  };
}

/** HMAC view token so order links can't be enumerated. */
export async function viewToken(secret: string, id: string): Promise<string> {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(`view:${id}`)));
  return [...sig.slice(0, 12)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' };

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}
