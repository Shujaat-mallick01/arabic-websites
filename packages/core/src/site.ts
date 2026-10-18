// The code-only site configuration (site.config.ts), validated with Zod.

import { z } from 'zod';
import {
  COUNTRIES,
  CURRENCY_CODES,
  DIALECTS,
  TIME_ZONES,
  WEEKDAYS,
} from './types.ts';
import {
  ENGINE_PRESETS,
  FACETS,
  LAYOUT_VARIANTS,
  MODULES,
  NICHES,
  PAYMENT_METHODS,
  PROVIDERS,
  SCHEMA_ORG_TYPES,
} from './vocab.ts';
import { COUNTRY_INFO } from './countries.ts';

export const i18nTextSchema = z.object({ ar: z.string(), en: z.string() });

const weekday = z.enum(WEEKDAYS);

export const localeSchema = z.object({
  country: z.enum(COUNTRIES),
  currency: z.enum(CURRENCY_CODES),
  timeZone: z.enum(TIME_ZONES),
  dialect: z.enum(DIALECTS),
  audience: z.enum(['women', 'men', 'mixed']),
  numberingSystem: z.enum(['arab', 'latn']),
  weekStart: weekday.default('sat'),
  weekend: z.array(weekday).default(['fri', 'sat']),
  hijri: z
    .object({
      show: z.enum(['never', 'dates', 'bookings']),
      calendar: z.enum(['islamic-umalqura', 'islamic-civil']).default('islamic-umalqura'),
    })
    .default({ show: 'never', calendar: 'islamic-umalqura' }),
});

const prefix = z.string().regex(/^[A-Z]{2,5}$/, 'Use 2–5 capital letters');

export const commerceSchema = z.object({
  orderPrefix: prefix,
  cart: z.object({ maxQtyPerLine: z.number().int().positive() }).optional(),
  stock: z.object({ mode: z.enum(['tracked', 'badges-only']), lowStockThreshold: z.number().int().nonnegative() }).optional(),
  giftCards: z
    .object({
      denominations: z.array(z.number().int().positive()).min(1),
      validityMonths: z.number().int().positive(),
      redeem: z.enum(['online', 'in-store', 'both']),
      codePrefix: prefix.or(z.string().regex(/^[A-Z]{2,8}$/)),
    })
    .optional(),
  facets: z.array(z.enum(FACETS)).optional(),
  largeCatalog: z.boolean().optional(),
  personalisation: z.object({ previewTemplate: z.enum(['wrapper', 'none']).optional() }).optional(),
});

export const bookingSchema = z.object({
  bookingPrefix: prefix,
  granularity: z.enum(['day', 'slot']),
  resourceModel: z.enum(['none', 'staff', 'staff+rooms', 'kitchen']),
  staffChoice: z.enum(['none', 'optional', 'required']),
});

export const paymentsSchema = z.object({
  provider: z.enum(PROVIDERS).exclude(['mock', 'cod']).nullable(),
  methods: z.array(z.enum(PAYMENT_METHODS)),
  cod: z.boolean(),
  primary: z.enum(['online', 'cod']),
  statementDescriptor: z.string().max(22).optional(),
});

export const opsSchema = z.object({
  store: z.enum(['blobs', 'supabase', 'memory']),
  dashboardAuth: z.enum(['demo', 'email-otp', 'supabase']),
  mailer: z.enum(['outbox', 'resend']),
  retentionDays: z.number().int().positive().optional(),
});

export const layoutSchema = z.object({
  hero: z.enum(LAYOUT_VARIANTS.hero),
  nav: z.enum(LAYOUT_VARIANTS.nav),
  categoryEntry: z.enum(LAYOUT_VARIANTS.categoryEntry),
  productCard: z.enum(LAYOUT_VARIANTS.productCard),
  grid: z.enum(LAYOUT_VARIANTS.grid),
  imageShape: z.enum(LAYOUT_VARIANTS.imageShape),
  rhythm: z.enum(LAYOUT_VARIANTS.rhythm),
  whatsapp: z.enum(LAYOUT_VARIANTS.whatsapp),
  footer: z.enum(LAYOUT_VARIANTS.footer),
  productPage: z.enum(LAYOUT_VARIANTS.productPage),
  sectionVariants: z.record(z.string(), z.string()).default({}),
  signature: z.string(),
});

export const seoSchema = z.object({
  indexing: z.boolean(),
  businessType: z.enum(SCHEMA_ORG_TYPES),
  titleTemplate: i18nTextSchema,
  priceRange: z.enum(['$', '$$', '$$$']).optional(),
  verification: z.object({ google: z.string().optional(), bing: z.string().optional() }).optional(),
});

export const analyticsSchema = z.discriminatedUnion('provider', [
  z.object({ provider: z.literal('none') }),
  z.object({ provider: z.literal('plausible'), domain: z.string(), scriptOrigin: z.string().url() }),
  z.object({ provider: z.literal('ga4'), measurementId: z.string().regex(/^G-[A-Z0-9]+$/) }),
]);

export const demoSchema = z.object({
  enabled: z.boolean(),
  banner: z.boolean(),
  priceAsterisk: z.boolean(),
  credit: z.enum(['demo', 'designer', 'none']),
  contactRouting: z.enum(['studio', 'site']),
  sampleOrders: z.boolean(),
});

export const deploySchema = z.object({
  url: z.string().regex(/^https:\/\/[^/]+$/, 'Origin only, https, no trailing slash'),
  netlifySiteName: z.string(),
  netlifySiteId: z.string().optional(),
});

export const showcaseSchema = z.object({
  oneLiner: i18nTextSchema,
  highlights: z.array(i18nTextSchema),
  hubOrder: z.number().int(),
});

export const siteSchema = z
  .object({
    schemaVersion: z.literal(1),
    id: z.string().regex(/^\d{2}$/),
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    tier: z.enum(['lite', 'full']),
    preset: z.object({
      primary: z.enum(ENGINE_PRESETS),
      secondary: z.array(z.enum(ENGINE_PRESETS)).optional(),
      niche: z.enum(NICHES),
    }),
    locale: localeSchema,
    features: z.partialRecord(z.enum(MODULES), z.boolean()).default({}),
    commerce: commerceSchema.optional(),
    booking: bookingSchema.optional(),
    payments: paymentsSchema.optional(),
    ops: opsSchema.optional(),
    layout: layoutSchema,
    seo: seoSchema,
    analytics: analyticsSchema,
    demo: demoSchema,
    deploy: deploySchema,
    showcase: showcaseSchema,
  })
  .superRefine((s, ctx) => {
    const info = COUNTRY_INFO[s.locale.country];
    if (info.currency !== s.locale.currency) {
      ctx.addIssue({ code: 'custom', path: ['locale', 'currency'], message: `${s.locale.country} uses ${info.currency}, not ${s.locale.currency}` });
    }
    const presets = [s.preset.primary, ...(s.preset.secondary ?? [])];
    const highest = presets.some((p) => p.endsWith('.full')) ? 'full' : 'lite';
    if (s.tier !== highest) {
      ctx.addIssue({ code: 'custom', path: ['tier'], message: `tier must be "${highest}" for presets ${presets.join(', ')}` });
    }
    const usesCommerce = presets.some((p) => p.startsWith('commerce'));
    const usesBooking = presets.some((p) => p.startsWith('booking'));
    if (usesCommerce && !s.commerce) ctx.addIssue({ code: 'custom', path: ['commerce'], message: 'commerce config is required for a commerce preset' });
    if (usesBooking && !s.booking) ctx.addIssue({ code: 'custom', path: ['booking'], message: 'booking config is required for a booking preset' });
    if (s.tier === 'full') {
      if (!s.payments) ctx.addIssue({ code: 'custom', path: ['payments'], message: 'payments config is required on the full tier' });
      if (!s.ops) ctx.addIssue({ code: 'custom', path: ['ops'], message: 'ops config is required on the full tier' });
    }
    if (s.payments && s.payments.provider === null && !s.payments.cod) {
      ctx.addIssue({ code: 'custom', path: ['payments'], message: 'A site with no online provider must offer cash on delivery' });
    }
    if (s.payments?.primary === 'cod' && !s.payments.cod) {
      ctx.addIssue({ code: 'custom', path: ['payments', 'primary'], message: 'primary is "cod" but cod is off' });
    }
  });

export type SiteConfigInput = z.input<typeof siteSchema>;
export type SiteConfig = z.output<typeof siteSchema>;
export type LocaleConfig = SiteConfig['locale'];
export type LayoutConfig = SiteConfig['layout'];
export type CommerceConfig = NonNullable<SiteConfig['commerce']>;
export type BookingConfig = NonNullable<SiteConfig['booking']>;
export type PaymentsConfig = NonNullable<SiteConfig['payments']>;
export type OpsConfig = NonNullable<SiteConfig['ops']>;
export type DemoConfig = SiteConfig['demo'];

export class SiteConfigError extends Error {
  override name = 'SiteConfigError';
}

/** Validates a site config. Throws a readable error listing every problem. */
export function defineSite(input: SiteConfigInput): SiteConfig {
  const r = siteSchema.safeParse(input);
  if (!r.success) {
    const lines = r.error.issues.map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`);
    throw new SiteConfigError(`Invalid site config${'slug' in input ? ` for "${String(input.slug)}"` : ''}:\n${lines.join('\n')}`);
  }
  return r.data;
}

/** BCP 47 tag for formatting: 'ar-BH' for Arabic pages, 'en' for English. */
export function bcp47(locale: Pick<LocaleConfig, 'country'>, lang: 'ar' | 'en'): string {
  return lang === 'ar' ? `ar-${locale.country}` : 'en';
}

export function ogLocale(locale: Pick<LocaleConfig, 'country'>, lang: 'ar' | 'en'): string {
  return lang === 'ar' ? `ar_${locale.country}` : 'en_US';
}
