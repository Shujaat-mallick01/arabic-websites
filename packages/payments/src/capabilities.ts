// What each provider can do, and which methods a currency allows. Data, not per-site code.

import type { CurrencyCode, PaymentMethodId, ProviderName } from '@aw/core';
import type { ProviderCapabilities } from './types.ts';

const GCC_CUR: CurrencyCode[] = ['BHD', 'KWD', 'SAR', 'AED', 'QAR', 'OMR'];

export const CAPABILITIES: Record<ProviderName, ProviderCapabilities> = {
  mock: {
    label: 'Mock',
    countries: ['BH', 'KW', 'SA', 'IQ', 'AE', 'QA', 'OM', 'JO'],
    currencies: ['BHD', 'KWD', 'SAR', 'IQD', 'AED', 'QAR', 'OMR', 'JOD'],
    methods: ['card', 'mada', 'apple_pay', 'knet', 'benefit', 'stc_pay', 'omannet', 'qpay', 'zaincash', 'fastpay'],
    launch: 'redirect',
    webhookAuth: 'hmac',
    webhookOn: 'all',
    refunds: 'sync',
    partialRefunds: true,
    amountWire: 'minor-integer',
  },
  cod: {
    label: 'Cash on delivery',
    countries: ['BH', 'KW', 'SA', 'IQ', 'AE', 'QA', 'OM', 'JO'],
    currencies: ['BHD', 'KWD', 'SAR', 'IQD', 'AED', 'QAR', 'OMR', 'JOD'],
    methods: ['cod'],
    launch: 'offline',
    webhookAuth: 'none',
    webhookOn: 'none',
    refunds: 'manual',
    partialRefunds: true,
    amountWire: 'none',
  },
  tap: {
    label: 'Tap Payments',
    countries: ['BH', 'KW', 'SA', 'AE', 'QA', 'OM'],
    currencies: GCC_CUR,
    methods: ['card', 'mada', 'apple_pay', 'knet', 'benefit', 'stc_pay', 'omannet', 'qpay'],
    launch: 'redirect',
    webhookAuth: 'hmac',
    webhookOn: 'success-only',
    refunds: 'sync',
    partialRefunds: true,
    amountWire: 'major-decimal',
  },
  myfatoorah: {
    label: 'MyFatoorah',
    countries: ['KW', 'SA', 'BH', 'AE', 'QA', 'OM', 'JO'],
    currencies: [...GCC_CUR, 'JOD'],
    methods: ['card', 'mada', 'apple_pay', 'knet', 'stc_pay', 'google_pay'],
    launch: 'redirect',
    webhookAuth: 'hmac',
    webhookOn: 'all',
    refunds: 'manual',
    partialRefunds: true,
    amountWire: 'major-decimal',
  },
  moyasar: {
    label: 'Moyasar',
    countries: ['SA'],
    currencies: ['SAR', 'AED', 'BHD', 'KWD', 'QAR'],
    methods: ['card', 'mada', 'apple_pay', 'stc_pay'],
    launch: 'redirect',
    webhookAuth: 'shared-secret',
    webhookOn: 'all',
    refunds: 'sync',
    partialRefunds: true,
    amountWire: 'minor-integer',
  },
  paytabs: {
    label: 'PayTabs',
    countries: ['SA', 'AE', 'OM', 'JO', 'KW', 'IQ', 'QA'],
    currencies: ['SAR', 'AED', 'OMR', 'JOD', 'KWD', 'IQD', 'QAR'],
    methods: ['card', 'mada', 'apple_pay', 'knet', 'stc_pay', 'omannet'],
    launch: 'redirect',
    webhookAuth: 'hmac',
    webhookOn: 'all',
    refunds: 'sync',
    partialRefunds: false,
    amountWire: 'decimal-string',
  },
  checkout: {
    label: 'Checkout.com',
    countries: ['BH', 'KW', 'SA', 'AE', 'QA', 'OM', 'JO', 'IQ'],
    currencies: ['BHD', 'KWD', 'SAR', 'AED', 'QAR', 'OMR', 'JOD', 'IQD'],
    methods: ['card', 'mada', 'apple_pay', 'google_pay', 'knet', 'benefit', 'stc_pay', 'qpay'],
    launch: 'redirect',
    webhookAuth: 'hmac',
    webhookOn: 'all',
    refunds: 'async',
    partialRefunds: true,
    amountWire: 'minor-integer',
  },
  credimax: {
    label: 'Credimax',
    countries: ['BH'],
    currencies: ['BHD'],
    methods: ['card', 'mada', 'apple_pay', 'benefit'],
    launch: 'interstitial',
    webhookAuth: 'static-header',
    webhookOn: 'all',
    refunds: 'sync',
    partialRefunds: true,
    amountWire: 'decimal-string',
  },
  zaincash: {
    label: 'ZainCash',
    countries: ['IQ'],
    currencies: ['IQD'],
    methods: ['zaincash'],
    launch: 'redirect',
    webhookAuth: 'jwt',
    webhookOn: 'success-only',
    refunds: 'manual',
    partialRefunds: false,
    amountWire: 'integer-major',
  },
  fastpay: {
    label: 'FastPay',
    countries: ['IQ'],
    currencies: ['IQD'],
    methods: ['fastpay'],
    launch: 'redirect',
    webhookAuth: 'none',
    webhookOn: 'success-only',
    refunds: 'sync',
    partialRefunds: true,
    amountWire: 'integer-major',
  },
};

/** Which currencies a method can be used with at all. */
const METHOD_CURRENCIES: Partial<Record<PaymentMethodId, CurrencyCode[]>> = {
  knet: ['KWD'],
  benefit: ['BHD'],
  benefitpay: ['BHD'],
  mada: ['SAR'],
  stc_pay: ['SAR'],
  omannet: ['OMR'],
  qpay: ['QAR'],
  zaincash: ['IQD'],
  fastpay: ['IQD'],
  apple_pay: ['BHD', 'KWD', 'SAR', 'AED', 'QAR'],
  google_pay: ['BHD', 'KWD', 'SAR', 'AED', 'QAR', 'OMR', 'JOD'],
};

/** IQD can only be paid by these methods (card only through PayTabs-Iraq or Checkout.com). */
const IQD_PROVIDERS_FOR_CARD: ProviderName[] = ['paytabs', 'checkout', 'mock'];

export function methodAllowed(method: PaymentMethodId, currency: CurrencyCode, provider: ProviderName): boolean {
  if (method === 'cod') return true;
  const allowed = METHOD_CURRENCIES[method];
  if (allowed && !allowed.includes(currency)) return false;
  if (currency === 'IQD' && method === 'card' && !IQD_PROVIDERS_FOR_CARD.includes(provider)) return false;
  return true;
}

/**
 * The methods to show at checkout: the site's wish list ∩ currency rules ∩ provider capabilities.
 * 'cod' is handled separately by the fulfilment rules.
 */
export function availableMethods(currency: CurrencyCode, provider: ProviderName | null, wanted: readonly PaymentMethodId[]): PaymentMethodId[] {
  if (!provider) return [];
  const caps = CAPABILITIES[provider];
  if (!caps.currencies.includes(currency)) return [];
  return wanted.filter((m) => m !== 'cod' && caps.methods.includes(m) && methodAllowed(m, currency, provider));
}

/** Neutral text badges for methods (no trademark logos in demos). */
export const METHOD_LABELS: Record<PaymentMethodId, { ar: string; en: string }> = {
  card: { ar: 'بطاقة ائتمان', en: 'Card' },
  mada: { ar: 'مدى', en: 'mada' },
  apple_pay: { ar: 'Apple Pay', en: 'Apple Pay' },
  google_pay: { ar: 'Google Pay', en: 'Google Pay' },
  knet: { ar: 'كي نت', en: 'KNET' },
  benefit: { ar: 'بنفت', en: 'BENEFIT' },
  benefitpay: { ar: 'بنفت باي', en: 'BenefitPay' },
  stc_pay: { ar: 'STC Pay', en: 'STC Pay' },
  omannet: { ar: 'عمان نت', en: 'OmanNet' },
  qpay: { ar: 'QPay', en: 'QPay' },
  zaincash: { ar: 'زين كاش', en: 'ZainCash' },
  fastpay: { ar: 'فاست باي', en: 'FastPay' },
  cod: { ar: 'الدفع عند الاستلام', en: 'Cash on delivery' },
};
