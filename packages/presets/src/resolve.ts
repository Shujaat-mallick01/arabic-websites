// resolvePreset(site): the single place that decides what a site contains.
// Routes, collections, settings, functions and env keys all come from here.

import type { EnginePresetId, ModuleId, NicheId, ProviderName, SiteConfig } from '@aw/core';
import { ENGINE_PRESETS, NICHE_PRESETS, type FlowConfig, type SectionId } from './presets.ts';

export type PageId =
  | 'home' | 'shop' | 'category' | 'product' | 'cart' | 'checkout' | 'order'
  | 'pay-return' | 'pay-mock' | 'pay-credimax' | 'gift-cards'
  | 'services' | 'service' | 'packages' | 'book' | 'booking'
  | 'owner' | 'corporate' | 'gallery' | 'lookbook' | 'branches' | 'branch' | 'stockists'
  | 'size-guide' | 'menu' | 'about' | 'faq' | 'policy' | 'offers' | 'contact' | 'not-found';

export interface RouteDef {
  page: PageId;
  /** Arabic pattern; the English route is '/en' + pattern. */
  pattern: string;
  /** Excluded from the sitemap and indexing. */
  private?: boolean;
}

export type CollectionId =
  | 'products' | 'categories' | 'offers' | 'services' | 'packages' | 'addons' | 'themes' | 'resources'
  | 'notes' | 'wrappers' | 'gallery' | 'reviews' | 'faqs' | 'branches' | 'stockists' | 'pages' | 'settings';

export type SettingsId = 'general' | 'contact' | 'hours' | 'home' | 'seo' | 'sizes' | 'fulfilment' | 'checkout' | 'booking' | 'notifications';

export type FunctionName =
  | 'quote' | 'checkout' | 'order' | 'pay-status' | 'pay-webhook' | 'pay-mock' | 'stock' | 'giftcard'
  | 'availability' | 'booking' | 'upload' | 'owner' | 'enquiry';

export interface FunctionDef {
  name: FunctionName;
  path: string;
  method: 'GET' | 'POST' | 'GET,POST';
  /** Package export that builds the handler: `${module}#${factory}`. */
  handler: { module: string; factory: string };
  rateLimit?: { windowLimit: number; windowSize: number };
}

export interface EnvKeyDef {
  key: string;
  comment: string;
  group: 'mode' | 'required' | 'optional';
  example?: string;
}

export interface ResolvedPreset {
  tier: 'lite' | 'full';
  engines: EnginePresetId[];
  niche: NicheId;
  modules: ReadonlySet<ModuleId>;
  flows: FlowConfig;
  routes: RouteDef[];
  collections: CollectionId[];
  settings: SettingsId[];
  functions: FunctionDef[];
  envKeys: EnvKeyDef[];
  sections: SectionId[];
  fieldPacks: { products: string[]; services: string[] };
  /** Workspace packages the generated functions import. */
  serverPackages: string[];
}

export class PresetError extends Error {
  override name = 'PresetError';
}

/** Module → what it adds. Every route also exists under /en/. */
const ROUTES: Partial<Record<ModuleId, RouteDef[]>> = {
  catalog: [{ page: 'shop', pattern: '/shop' }, { page: 'product', pattern: '/products/[slug]' }],
  categories: [{ page: 'category', pattern: '/shop/[category]' }],
  cart: [{ page: 'cart', pattern: '/cart', private: true }],
  checkout: [{ page: 'checkout', pattern: '/checkout', private: true }, { page: 'order', pattern: '/order', private: true }],
  payments: [{ page: 'pay-return', pattern: '/pay/return', private: true }, { page: 'pay-mock', pattern: '/pay/mock', private: true }],
  giftCards: [{ page: 'gift-cards', pattern: '/gift-cards' }],
  services: [{ page: 'services', pattern: '/services' }, { page: 'service', pattern: '/services/[slug]' }],
  packages: [{ page: 'packages', pattern: '/packages' }],
  bookingRequest: [{ page: 'book', pattern: '/book' }],
  bookingCalendar: [{ page: 'book', pattern: '/book' }, { page: 'booking', pattern: '/booking', private: true }],
  ownerDashboard: [{ page: 'owner', pattern: '/owner', private: true }],
  corporateEnquiry: [{ page: 'corporate', pattern: '/corporate' }],
  gallery: [{ page: 'gallery', pattern: '/gallery' }],
  lookbook: [{ page: 'lookbook', pattern: '/lookbook' }],
  branches: [{ page: 'branches', pattern: '/branches' }, { page: 'branch', pattern: '/branches/[slug]' }],
  stockists: [{ page: 'stockists', pattern: '/stockists' }],
  sizeGuide: [{ page: 'size-guide', pattern: '/size-guide' }],
  menuPage: [{ page: 'menu', pattern: '/menu' }],
  pages: [{ page: 'about', pattern: '/about' }, { page: 'policy', pattern: '/policies/[slug]' }, { page: 'contact', pattern: '/contact' }],
  faq: [{ page: 'faq', pattern: '/faq' }],
  offers: [{ page: 'offers', pattern: '/offers' }],
  estimateBuilder: [{ page: 'packages', pattern: '/packages' }, { page: 'book', pattern: '/book' }],
};

const COLLECTIONS: Partial<Record<ModuleId, CollectionId[]>> = {
  catalog: ['products'],
  categories: ['categories'],
  services: ['services', 'categories'],
  packages: ['packages'],
  estimateBuilder: ['packages', 'addons', 'themes'],
  resources: ['resources'],
  notesPyramid: ['notes'],
  wrapperPreview: ['wrappers'],
  gallery: ['gallery'],
  lookbook: ['gallery'],
  reviews: ['reviews'],
  faq: ['faqs'],
  branches: ['branches'],
  stockists: ['stockists'],
  pages: ['pages'],
  offers: ['offers'],
  giftCards: ['products'],
};

const SETTINGS: Partial<Record<ModuleId, SettingsId[]>> = {
  sizeGuide: ['sizes'],
  fulfilment: ['fulfilment'],
  whatsappOrder: ['fulfilment'],
  checkout: ['checkout'],
  bookingRequest: ['booking'],
  bookingCalendar: ['booking'],
  orderNotifications: ['notifications'],
};

const RL = { windowLimit: 30, windowSize: 60 };

const FUNCTIONS: Partial<Record<ModuleId, FunctionDef[]>> = {
  checkout: [
    { name: 'quote', path: '/api/quote', method: 'POST', handler: { module: '@aw/commerce/server', factory: 'createQuoteHandler' }, rateLimit: { windowLimit: 60, windowSize: 60 } },
    { name: 'checkout', path: '/api/checkout', method: 'POST', handler: { module: '@aw/commerce/server', factory: 'createCheckoutHandler' }, rateLimit: { windowLimit: 20, windowSize: 60 } },
    { name: 'order', path: '/api/order', method: 'GET', handler: { module: '@aw/commerce/server', factory: 'createOrderHandler' }, rateLimit: RL },
  ],
  payments: [
    { name: 'pay-status', path: '/api/pay/status', method: 'GET', handler: { module: '@aw/ops/server', factory: 'createPayStatusFunction' }, rateLimit: { windowLimit: 60, windowSize: 60 } },
    { name: 'pay-webhook', path: '/api/pay/webhook/*', method: 'POST', handler: { module: '@aw/ops/server', factory: 'createPayWebhookFunction' } },
    { name: 'pay-mock', path: '/api/pay/mock/complete', method: 'POST', handler: { module: '@aw/ops/server', factory: 'createPayMockFunction' }, rateLimit: RL },
  ],
  stock: [{ name: 'stock', path: '/api/stock', method: 'GET', handler: { module: '@aw/commerce/server', factory: 'createStockHandler' }, rateLimit: { windowLimit: 120, windowSize: 60 } }],
  giftCards: [{ name: 'giftcard', path: '/api/giftcard/check', method: 'POST', handler: { module: '@aw/commerce/server', factory: 'createGiftCardHandler' }, rateLimit: { windowLimit: 10, windowSize: 60 } }],
  bookingCalendar: [
    { name: 'availability', path: '/api/availability', method: 'GET', handler: { module: '@aw/booking/server', factory: 'createAvailabilityHandler' }, rateLimit: { windowLimit: 120, windowSize: 60 } },
    { name: 'booking', path: '/api/booking', method: 'GET,POST', handler: { module: '@aw/booking/server', factory: 'createBookingHandler' }, rateLimit: { windowLimit: 20, windowSize: 60 } },
  ],
  referenceUpload: [{ name: 'upload', path: '/api/upload', method: 'POST', handler: { module: '@aw/booking/server', factory: 'createUploadHandler' }, rateLimit: { windowLimit: 10, windowSize: 60 } }],
  ownerDashboard: [{ name: 'owner', path: '/api/owner/*', method: 'GET,POST', handler: { module: '@aw/ops/server', factory: 'createOwnerHandler' }, rateLimit: { windowLimit: 120, windowSize: 60 } }],
};

const PROVIDER_ENV: Partial<Record<ProviderName, EnvKeyDef[]>> = {
  tap: [
    { key: 'TAP_SECRET_KEY', group: 'required', comment: 'sk_test_… in test, sk_live_… in live; also the webhook HMAC key' },
    { key: 'TAP_SOURCE_ID', group: 'optional', comment: 'Hosted page source (default src_all)', example: 'src_all' },
  ],
  myfatoorah: [
    { key: 'MYFATOORAH_API_KEY', group: 'required', comment: 'API token from the MyFatoorah portal' },
    { key: 'MYFATOORAH_REGION', group: 'required', comment: 'test | kw | ae | sa | qa | eg', example: 'test' },
    { key: 'MYFATOORAH_WEBHOOK_SECRET', group: 'required', comment: 'Webhook v2 secret from the portal' },
  ],
  moyasar: [
    { key: 'MOYASAR_SECRET_KEY', group: 'required', comment: 'sk_test_… or sk_live_…' },
    { key: 'MOYASAR_WEBHOOK_SECRET_TOKEN', group: 'required', comment: 'The secret token you set in Dashboard → Webhooks' },
  ],
  paytabs: [
    { key: 'PAYTABS_PROFILE_ID', group: 'required', comment: 'Merchant profile id' },
    { key: 'PAYTABS_SERVER_KEY', group: 'required', comment: 'Server key (also the callback HMAC key)' },
    { key: 'PAYTABS_REGION', group: 'required', comment: 'sa | ae | eg | om | jo | kw | iq | qa | global', example: 'sa' },
    { key: 'PAYTABS_PROFILE_KIND', group: 'optional', comment: 'Set to "live" to confirm a live profile' },
  ],
  checkout: [
    { key: 'CHECKOUT_SECRET_KEY', group: 'required', comment: 'sk_sbox_… or sk_…' },
    { key: 'CHECKOUT_API_BASE', group: 'required', comment: 'Merchant subdomain, e.g. https://abcd1234.api.checkout.com' },
    { key: 'CHECKOUT_WEBHOOK_SIGNING_KEY', group: 'required', comment: 'Workflow webhook signing key' },
    { key: 'CHECKOUT_PROCESSING_CHANNEL_ID', group: 'optional', comment: 'Needed when the account has several channels' },
  ],
  credimax: [
    { key: 'CREDIMAX_MERCHANT_ID', group: 'required', comment: 'TEST-prefixed in test' },
    { key: 'CREDIMAX_API_PASSWORD', group: 'required', comment: 'From Merchant Administration' },
    { key: 'CREDIMAX_MERCHANT_NAME', group: 'required', comment: 'Shown on the payment page (≤ 40 chars)' },
    { key: 'CREDIMAX_NOTIFICATION_SECRET', group: 'required', comment: '32-char webhook secret' },
    { key: 'CREDIMAX_API_VERSION', group: 'optional', comment: 'Default 100', example: '100' },
  ],
  fastpay: [
    { key: 'FASTPAY_STORE_ID', group: 'required', comment: 'Store id from the FastPay merchant panel' },
    { key: 'FASTPAY_STORE_PASSWORD', group: 'required', comment: 'Store password' },
    { key: 'FASTPAY_REFUND_SECRET_KEY', group: 'optional', comment: 'Needed for refunds' },
    { key: 'FASTPAY_API_BASE', group: 'optional', comment: 'Default: staging in test, production in live' },
  ],
  zaincash: [
    { key: 'ZAINCASH_CLIENT_ID', group: 'required', comment: 'v2 OAuth client id (adapter not built yet)' },
    { key: 'ZAINCASH_CLIENT_SECRET', group: 'required', comment: 'v2 OAuth client secret' },
  ],
};

function enginesOf(site: SiteConfig): EnginePresetId[] {
  return [site.preset.primary, ...(site.preset.secondary ?? [])];
}

export function resolvePreset(site: SiteConfig): ResolvedPreset {
  const engines = enginesOf(site);
  const niche = NICHE_PRESETS[site.preset.niche];
  const allowed = new Set<ModuleId>();
  const mods = new Set<ModuleId>();
  for (const e of engines) {
    const p = ENGINE_PRESETS[e];
    p.modules.required.forEach((m) => {
      mods.add(m);
      allowed.add(m);
    });
    p.modules.optional.forEach((m) => allowed.add(m));
  }
  niche.modules.add.forEach((m) => {
    mods.add(m);
    allowed.add(m);
  });
  niche.modules.optional.forEach((m) => allowed.add(m));

  for (const [m, on] of Object.entries(site.features) as Array<[ModuleId, boolean]>) {
    if (on) {
      if (!allowed.has(m)) throw new PresetError(`Module "${m}" is not available for ${engines.join(' + ')} / ${niche.id}`);
      mods.add(m);
    } else {
      mods.delete(m);
    }
  }
  // Payments are needed by any full flow, and by gift cards sold online.
  if (mods.has('giftCards') && engines.some((e) => e.endsWith('.full'))) mods.add('payments');
  if (mods.has('payments')) mods.add('ownerDashboard');

  const tier = engines.some((e) => e.endsWith('.full')) ? 'full' : 'lite';
  const flowParts = engines.map((e) => ENGINE_PRESETS[e].flows);
  const flows: FlowConfig = {
    order: flowParts.find((f) => f.order)?.order ?? 'none',
    booking: flowParts.find((f) => f.booking)?.booking ?? 'none',
    enquiry: tier === 'full' ? 'form' : 'whatsapp',
  };

  const routes: RouteDef[] = [{ page: 'home', pattern: '/' }];
  const seen = new Set(['/']);
  for (const m of mods) {
    for (const r of ROUTES[m] ?? []) {
      if (seen.has(r.pattern)) continue;
      seen.add(r.pattern);
      routes.push(r);
    }
  }
  if (site.payments?.provider === 'credimax' && mods.has('payments')) routes.push({ page: 'pay-credimax', pattern: '/pay/credimax', private: true });

  const collections = new Set<CollectionId>(['settings']);
  for (const m of mods) for (const c of COLLECTIONS[m] ?? []) collections.add(c);
  for (const c of niche.collections) if (c !== 'resources' || mods.has('resources')) collections.add(c as CollectionId);

  const settings = new Set<SettingsId>(['general', 'contact', 'hours', 'home', 'seo']);
  for (const m of mods) for (const s of SETTINGS[m] ?? []) settings.add(s);

  const functions: FunctionDef[] = [];
  const fseen = new Set<string>();
  for (const m of mods) {
    for (const f of FUNCTIONS[m] ?? []) {
      if (fseen.has(f.name)) continue;
      fseen.add(f.name);
      functions.push(f);
    }
  }
  if (mods.has('corporateEnquiry') && tier === 'full') {
    functions.push({ name: 'enquiry', path: '/api/enquiry', method: 'POST', handler: { module: '@aw/ops/server', factory: 'createEnquiryHandler' }, rateLimit: { windowLimit: 5, windowSize: 60 } });
  }

  const envKeys: EnvKeyDef[] = [];
  if (tier === 'full') {
    envKeys.push(
      { key: 'PAYMENTS_MODE', group: 'mode', comment: 'mock | test | live   (unset = mock; live refuses test-looking keys)', example: 'mock' },
      { key: 'ORDER_STORE', group: 'mode', comment: 'blobs | supabase | memory', example: site.ops?.store ?? 'blobs' },
      { key: 'OWNER_AUTH', group: 'mode', comment: 'demo | email-otp | supabase', example: site.ops?.dashboardAuth ?? 'demo' },
      { key: 'MAIL_PROVIDER', group: 'mode', comment: 'outbox | resend', example: site.ops?.mailer ?? 'outbox' },
      { key: 'SESSION_SECRET', group: 'required', comment: '≥ 32 random bytes, base64 (owner sessions, order view tokens)' },
      { key: 'RESEND_API_KEY', group: 'required', comment: 'Needed when MAIL_PROVIDER=resend' },
      { key: 'MAIL_FROM', group: 'required', comment: '"Shop <orders@client-domain>" on a verified domain' },
    );
    if (site.payments?.provider) envKeys.push(...(PROVIDER_ENV[site.payments.provider] ?? []));
    envKeys.push(
      { key: 'MOCK_WEBHOOK_SECRET', group: 'optional', comment: 'Signs demo gateway webhooks (a default is used if unset)' },
      { key: 'SUPABASE_URL', group: 'optional', comment: 'Only with ORDER_STORE=supabase' },
      { key: 'SUPABASE_SERVICE_ROLE_KEY', group: 'optional', comment: 'Only with ORDER_STORE=supabase; server-side only' },
    );
  }

  const sectionPool = new Set<SectionId>(['hero', 'reviews', 'faq-teaser', 'about', 'hours', 'signature', ...niche.defaultSections]);
  if (mods.has('catalog')) ['categories', 'featured', 'new-arrivals', 'rail', 'campaign'].forEach((s) => sectionPool.add(s as SectionId));
  if (mods.has('giftCards')) sectionPool.add('gift-cards');
  if (mods.has('fulfilment')) sectionPool.add('delivery-table');
  if (mods.has('lookbook')) sectionPool.add('lookbook');
  if (mods.has('gallery')) sectionPool.add('gallery');
  if (mods.has('services')) ['services', 'booking-cta'].forEach((s) => sectionPool.add(s as SectionId));
  if (mods.has('packages')) sectionPool.add('packages');
  if (mods.has('branches')) sectionPool.add('branches');
  if (mods.has('stockists')) sectionPool.add('stockists');

  const serverPackages = new Set<string>();
  for (const f of functions) serverPackages.add(f.handler.module.split('/').slice(0, 2).join('/'));
  if (functions.length) ['@aw/core', '@aw/i18n', '@aw/commerce', '@aw/booking', '@aw/payments', '@aw/whatsapp', '@aw/ops'].forEach((p) => serverPackages.add(p));

  return {
    tier,
    engines,
    niche: niche.id,
    modules: mods,
    flows,
    routes,
    collections: [...collections],
    settings: [...settings],
    functions,
    envKeys,
    sections: [...sectionPool],
    fieldPacks: { products: niche.fieldPacks.products ?? [], services: niche.fieldPacks.services ?? [] },
    serverPackages: [...serverPackages].sort(),
  };
}
