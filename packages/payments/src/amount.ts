// Amount conversion: one tested rule per gateway. Money stays integer minor units everywhere else.

import { CURRENCIES, money, parseDecimal, toDecimalString, type CurrencyCode, type Money, type ProviderName } from '@aw/core';
import { PaymentError } from './util.ts';

/**
 * - tap, myfatoorah: major decimal number (28.5)
 * - moyasar: minor integer (28500 for BHD)
 * - checkout: minor integer using ISO exponents; 3-decimal currencies must end in 0; IQD ×1000
 * - credimax, paytabs: decimal string ("28.500")
 * - fastpay, zaincash: integer IQD
 */
export function toProviderAmount(m: Money, provider: ProviderName): number | string {
  switch (provider) {
    case 'tap':
    case 'myfatoorah':
      return Number(toDecimalString(m));
    case 'moyasar':
      if (m.currency === 'IQD') throw new PaymentError('Moyasar does not support IQD', 'currency');
      return m.minor;
    case 'checkout': {
      const iso = CURRENCIES[m.currency].isoMinor;
      const ours = CURRENCIES[m.currency].exponent;
      const minor = m.minor * 10 ** (iso - ours);
      if (iso === 3 && minor % 10 !== 0) {
        throw new PaymentError(`Checkout.com needs ${m.currency} amounts ending in 0 (got ${toDecimalString(m)})`, 'amount_format');
      }
      return minor;
    }
    case 'credimax':
    case 'paytabs':
      return toDecimalString(m);
    case 'fastpay':
    case 'zaincash':
      if (m.currency !== 'IQD') throw new PaymentError(`${provider} only supports IQD`, 'currency');
      return m.minor;
    case 'mock':
    case 'cod':
      return m.minor;
  }
}

/** Tap's webhook hashstring formats the amount to the currency's decimals: "3.000" for BHD. */
export function tapHashAmount(amount: number | string, currency: CurrencyCode): string {
  return toFixedExact(String(amount), CURRENCIES[currency].isoMinor === 3 ? 3 : 2);
}

/** Pads or validates a decimal string to exactly `dp` places without floating point. */
export function toFixedExact(s: string, dp: number): string {
  const m = /^(-?\d+)(?:\.(\d*))?$/.exec(s.trim());
  if (!m) throw new PaymentError(`Not a decimal: ${s}`, 'amount_format');
  const frac = (m[2] ?? '').padEnd(dp, '0');
  if (frac.length > dp && !/^0*$/.test(frac.slice(dp))) throw new PaymentError(`Too many decimals for ${dp} dp: ${s}`, 'amount_format');
  return dp === 0 ? m[1]! : `${m[1]}.${frac.slice(0, dp)}`;
}

/** Converts a provider-reported amount back to Money. */
export function fromProviderAmount(value: unknown, currency: CurrencyCode, provider: ProviderName): Money {
  if (value === undefined || value === null || value === '') throw new PaymentError('Missing amount in provider response', 'amount_missing');
  switch (provider) {
    case 'moyasar':
    case 'mock':
    case 'cod':
      return money(Number(value), currency);
    case 'checkout': {
      const iso = CURRENCIES[currency].isoMinor;
      const ours = CURRENCIES[currency].exponent;
      return money(Number(value) / 10 ** (iso - ours), currency);
    }
    default:
      return parseDecimal(String(value), currency);
  }
}
