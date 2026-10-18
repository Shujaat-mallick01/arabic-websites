// Money is always an integer number of minor units plus a currency.
// Nothing here uses floating point for amounts, and nothing in the UI rounds.

import type { Bps, CurrencyCode, Minor, Money } from './types.ts';
import { normaliseDigits } from './text.ts';

/**
 * App-owned exponent table.
 * IQD uses exponent 0 on purpose (ISO says 3, but nobody prices in fils);
 * adapters convert per gateway.
 */
export const CURRENCIES = {
  BHD: { exponent: 3, step: 10, isoMinor: 3 },
  KWD: { exponent: 3, step: 10, isoMinor: 3 },
  OMR: { exponent: 3, step: 10, isoMinor: 3 },
  JOD: { exponent: 3, step: 10, isoMinor: 3 },
  SAR: { exponent: 2, step: 1, isoMinor: 2 },
  AED: { exponent: 2, step: 1, isoMinor: 2 },
  QAR: { exponent: 2, step: 1, isoMinor: 2 },
  IQD: { exponent: 0, step: 250, isoMinor: 3 },
} as const satisfies Record<CurrencyCode, { exponent: 0 | 2 | 3; step: number; isoMinor: number }>;

export class MoneyError extends Error {
  override name = 'MoneyError';
}

export function exponentOf(currency: CurrencyCode): number {
  const c = CURRENCIES[currency];
  if (!c) throw new MoneyError(`Unknown currency: ${currency}`);
  return c.exponent;
}

/** The smallest price step allowed in content, in minor units (BHD 10 fils, IQD 250 dinars). */
export function stepOf(currency: CurrencyCode): number {
  return CURRENCIES[currency].step;
}

function assertMinor(minor: number): void {
  if (!Number.isSafeInteger(minor)) throw new MoneyError(`Amount must be a safe integer of minor units, got ${minor}`);
}

function assertSame(a: Money, b: Money): void {
  if (a.currency !== b.currency) throw new MoneyError(`Currency mismatch: ${a.currency} vs ${b.currency}`);
}

export function money(minor: Minor, currency: CurrencyCode): Money {
  assertMinor(minor);
  exponentOf(currency);
  return Object.freeze({ minor, currency });
}

export function zero(currency: CurrencyCode): Money {
  return money(0, currency);
}

export interface ParseOptions {
  /** Reject values that are not a multiple of the currency step (e.g. 28.505 BHD, 45100 IQD). */
  strictStep?: boolean;
  /** Allow a leading minus sign. Prices never need it; adjustments might. */
  allowNegative?: boolean;
}

/**
 * Parses a decimal string such as "28.500", "28.5", "28" or "٢٨٫٥".
 * Rejects more decimals than the currency allows. Works on strings only.
 */
export function parseDecimal(input: string | number, currency: CurrencyCode, opts: ParseOptions = {}): Money {
  let s: string;
  if (typeof input === 'number') {
    if (!Number.isFinite(input)) throw new MoneyError(`Not a finite number: ${input}`);
    s = String(input);
    if (/e/i.test(s)) throw new MoneyError(`Number too large or small to be a price: ${input}`);
  } else {
    s = input;
  }
  s = normaliseDigits(s).trim().replace(/[,\s]/g, '');
  const m = /^(-)?(\d+)(?:\.(\d*))?$/.exec(s);
  if (!m) throw new MoneyError(`Not a decimal amount: "${input}"`);
  const [, sign, whole, frac = ''] = m;
  if (sign && !opts.allowNegative) throw new MoneyError(`Negative amounts are not allowed: "${input}"`);
  const exp = exponentOf(currency);
  if (frac.length > exp) {
    // Allow trailing zeros beyond the exponent ("45000.00" IQD, "28.5000" BHD) but nothing else.
    if (!/^0*$/.test(frac.slice(exp))) {
      throw new MoneyError(`${currency} allows ${exp} decimal places, got "${input}"`);
    }
  }
  const fracPadded = (frac + '0'.repeat(exp)).slice(0, exp);
  const minor = Number(whole + fracPadded) * (sign ? -1 : 1);
  assertMinor(minor);
  if (opts.strictStep && minor % stepOf(currency) !== 0) {
    throw new MoneyError(`${currency} prices must be in steps of ${toDecimalString(money(stepOf(currency), currency))}, got "${input}"`);
  }
  return money(minor, currency);
}

/** Exact decimal string with the currency's full number of decimals: 28500 BHD → "28.500". */
export function toDecimalString(m: Money): string {
  assertMinor(m.minor);
  const exp = exponentOf(m.currency);
  const neg = m.minor < 0;
  const digits = String(Math.abs(m.minor));
  if (exp === 0) return (neg ? '-' : '') + digits;
  const padded = digits.padStart(exp + 1, '0');
  const whole = padded.slice(0, -exp);
  const frac = padded.slice(-exp);
  return `${neg ? '-' : ''}${whole}.${frac}`;
}

export function add(a: Money, b: Money): Money {
  assertSame(a, b);
  return money(a.minor + b.minor, a.currency);
}

export function sub(a: Money, b: Money): Money {
  assertSame(a, b);
  return money(a.minor - b.minor, a.currency);
}

export function mul(m: Money, qty: number): Money {
  if (!Number.isSafeInteger(qty)) throw new MoneyError(`Quantity must be an integer, got ${qty}`);
  return money(m.minor * qty, m.currency);
}

export function sum(items: readonly Money[], currency: CurrencyCode): Money {
  let total = 0;
  for (const it of items) {
    if (it.currency !== currency) throw new MoneyError(`Currency mismatch: ${it.currency} vs ${currency}`);
    total += it.minor;
    assertMinor(total);
  }
  return money(total, currency);
}

export function compare(a: Money, b: Money): -1 | 0 | 1 {
  assertSame(a, b);
  return a.minor < b.minor ? -1 : a.minor > b.minor ? 1 : 0;
}

export function isZero(m: Money): boolean {
  return m.minor === 0;
}

export function isNegative(m: Money): boolean {
  return m.minor < 0;
}

export function minMoney(a: Money, b: Money): Money {
  return compare(a, b) <= 0 ? a : b;
}

export function maxMoney(a: Money, b: Money): Money {
  return compare(a, b) >= 0 ? a : b;
}

export function equals(a: Money, b: Money): boolean {
  return a.currency === b.currency && a.minor === b.minor;
}

export type AllocateMode = 'half-up' | 'up-to-step' | 'down';

/**
 * The ONLY place in the system that rounds.
 * Splits `m` into `part` (bps of m) and `rest`, with part + rest === m always.
 * - 'half-up': nearest minor unit, halves away from zero (VAT breakdown).
 * - 'up-to-step': round the part UP to a multiple of `step` minor units (deposits), capped at m.
 * - 'down': truncate (discount display).
 */
export function allocateBps(m: Money, bps: Bps, mode: AllocateMode, step = 1): { part: Money; rest: Money } {
  if (!Number.isSafeInteger(bps) || bps < 0 || bps > 10_000) throw new MoneyError(`bps must be an integer 0..10000, got ${bps}`);
  if (!Number.isSafeInteger(step) || step < 1) throw new MoneyError(`step must be a positive integer, got ${step}`);
  if (m.minor < 0) throw new MoneyError('Cannot allocate a negative amount');
  const total = BigInt(m.minor);
  const num = total * BigInt(bps);
  const den = 10_000n;
  let part: bigint;
  if (mode === 'down') {
    part = num / den;
  } else if (mode === 'half-up') {
    part = (num * 2n + den) / (den * 2n);
  } else {
    const exact = (num + den - 1n) / den; // ceil
    const s = BigInt(step);
    part = ((exact + s - 1n) / s) * s;
  }
  if (part > total) part = total;
  const p = Number(part);
  return { part: money(p, m.currency), rest: money(m.minor - p, m.currency) };
}

/**
 * The VAT already included in a VAT-inclusive price: gross × rate / (1 + rate), half-up.
 * rateBps: 1500 for 15 %.
 */
export function includedVat(gross: Money, rateBps: Bps): Money {
  if (gross.minor < 0) throw new MoneyError('Cannot compute VAT of a negative amount');
  const g = BigInt(gross.minor);
  const r = BigInt(rateBps);
  const num = g * r;
  const den = 10_000n + r;
  const vat = (num * 2n + den) / (den * 2n);
  return money(Number(vat), gross.currency);
}

/** Percent number (30) → bps (3000). Accepts up to 2 decimals (12.5 → 1250). */
export function percentToBps(percent: number): Bps {
  const bps = Math.round(percent * 100);
  if (Math.abs(bps - percent * 100) > 1e-6) throw new MoneyError(`Percent has too many decimals: ${percent}`);
  if (bps < 0 || bps > 10_000) throw new MoneyError(`Percent must be 0..100, got ${percent}`);
  return bps;
}
