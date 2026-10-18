import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  add,
  allocateBps,
  CURRENCIES,
  includedVat,
  money,
  MoneyError,
  mul,
  parseDecimal,
  percentToBps,
  sub,
  sum,
  toDecimalString,
  type CurrencyCode,
} from '../src/index.ts';

const ALL = Object.keys(CURRENCIES) as CurrencyCode[];

describe('parseDecimal / toDecimalString', () => {
  it('parses each currency at its exponent', () => {
    expect(parseDecimal('28.500', 'BHD').minor).toBe(28500);
    expect(parseDecimal('28.5', 'BHD').minor).toBe(28500);
    expect(parseDecimal('28', 'KWD').minor).toBe(28000);
    expect(parseDecimal('350.00', 'SAR').minor).toBe(35000);
    expect(parseDecimal('350.5', 'SAR').minor).toBe(35050);
    expect(parseDecimal('45000', 'IQD').minor).toBe(45000);
    expect(parseDecimal('0.010', 'OMR').minor).toBe(10);
  });

  it('accepts Arabic-Indic digits and the Arabic decimal separator', () => {
    expect(parseDecimal('٢٨٫٥٠٠', 'BHD').minor).toBe(28500);
    expect(parseDecimal('۴۵۰۰۰', 'IQD').minor).toBe(45000);
  });

  it('accepts thousands separators and numbers from YAML', () => {
    expect(parseDecimal('1,250.000', 'KWD').minor).toBe(1250000);
    expect(parseDecimal(4.5, 'BHD').minor).toBe(4500);
    expect(parseDecimal(45000, 'IQD').minor).toBe(45000);
  });

  it('rejects more decimals than the currency allows', () => {
    expect(() => parseDecimal('28.5005', 'BHD')).toThrow(MoneyError);
    expect(() => parseDecimal('350.005', 'SAR')).toThrow(MoneyError);
    expect(() => parseDecimal('45000.5', 'IQD')).toThrow(MoneyError);
  });

  it('allows trailing zeros past the exponent', () => {
    expect(parseDecimal('45000.00', 'IQD').minor).toBe(45000);
    expect(parseDecimal('28.5000', 'BHD').minor).toBe(28500);
  });

  it('rejects junk and negatives', () => {
    expect(() => parseDecimal('', 'BHD')).toThrow();
    expect(() => parseDecimal('abc', 'BHD')).toThrow();
    expect(() => parseDecimal('1.2.3', 'BHD')).toThrow();
    expect(() => parseDecimal('-1.000', 'BHD')).toThrow();
    expect(parseDecimal('-1.000', 'BHD', { allowNegative: true }).minor).toBe(-1000);
    expect(() => parseDecimal(1e21, 'BHD')).toThrow();
  });

  it('enforces the content step only in strict mode', () => {
    expect(parseDecimal('28.505', 'BHD').minor).toBe(28505);
    expect(() => parseDecimal('28.505', 'BHD', { strictStep: true })).toThrow(/steps of 0.010/);
    expect(() => parseDecimal('45100', 'IQD', { strictStep: true })).toThrow(/steps of 250/);
    expect(parseDecimal('45250', 'IQD', { strictStep: true }).minor).toBe(45250);
    expect(parseDecimal('12.34', 'SAR', { strictStep: true }).minor).toBe(1234);
  });

  it('formats with the full number of decimals', () => {
    expect(toDecimalString(money(28500, 'BHD'))).toBe('28.500');
    expect(toDecimalString(money(5, 'KWD'))).toBe('0.005');
    expect(toDecimalString(money(35000, 'SAR'))).toBe('350.00');
    expect(toDecimalString(money(7, 'SAR'))).toBe('0.07');
    expect(toDecimalString(money(45000, 'IQD'))).toBe('45000');
    expect(toDecimalString(money(-1500, 'BHD'))).toBe('-1.500');
    expect(toDecimalString(money(0, 'BHD'))).toBe('0.000');
  });

  it('round-trips for every currency (property)', () => {
    for (const cur of ALL) {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 10_000_000_000 }), (minor) => {
          const m = money(minor, cur);
          expect(parseDecimal(toDecimalString(m), cur).minor).toBe(minor);
        }),
        { numRuns: 200 },
      );
    }
  });
});

describe('arithmetic', () => {
  it('adds, subtracts, multiplies and sums exactly', () => {
    const a = money(100, 'BHD');
    const b = money(200, 'BHD');
    expect(add(a, b).minor).toBe(300);
    expect(sub(a, b).minor).toBe(-100);
    expect(mul(money(28500, 'BHD'), 3).minor).toBe(85500);
    // The classic float failure: 0.1 + 0.2
    expect(toDecimalString(add(parseDecimal('0.1', 'SAR'), parseDecimal('0.2', 'SAR')))).toBe('0.30');
    expect(sum([money(1, 'KWD'), money(2, 'KWD'), money(3, 'KWD')], 'KWD').minor).toBe(6);
    expect(sum([], 'KWD').minor).toBe(0);
  });

  it('refuses to mix currencies', () => {
    expect(() => add(money(1, 'BHD'), money(1, 'KWD'))).toThrow(/mismatch/);
    expect(() => sum([money(1, 'BHD')], 'SAR')).toThrow(/mismatch/);
  });

  it('refuses fractional minors and quantities', () => {
    expect(() => money(1.5, 'BHD')).toThrow();
    expect(() => mul(money(100, 'BHD'), 1.5)).toThrow();
  });
});

describe('allocateBps', () => {
  it('rounds a 30 % deposit up to whole riyals', () => {
    // 245.00 SAR × 30 % = 73.50 → 74.00
    const { part, rest } = allocateBps(money(24500, 'SAR'), 3000, 'up-to-step', 100);
    expect(part.minor).toBe(7400);
    expect(rest.minor).toBe(24500 - 7400);
  });

  it('never exceeds the total when rounding up', () => {
    const { part, rest } = allocateBps(money(150, 'SAR'), 9000, 'up-to-step', 100);
    expect(part.minor).toBe(150);
    expect(rest.minor).toBe(0);
  });

  it('half-up and down modes', () => {
    expect(allocateBps(money(1005, 'BHD'), 5000, 'half-up').part.minor).toBe(503);
    expect(allocateBps(money(1005, 'BHD'), 5000, 'down').part.minor).toBe(502);
  });

  it('parts always sum to the total (property)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000_000 }),
        fc.integer({ min: 0, max: 10_000 }),
        fc.constantFrom<'half-up' | 'up-to-step' | 'down'>('half-up', 'up-to-step', 'down'),
        fc.constantFrom(1, 10, 100, 250, 1000),
        (minor, bps, mode, step) => {
          const m = money(minor, 'BHD');
          const { part, rest } = allocateBps(m, bps, mode, step);
          expect(part.minor + rest.minor).toBe(minor);
          expect(part.minor).toBeGreaterThanOrEqual(0);
          expect(rest.minor).toBeGreaterThanOrEqual(0);
        },
      ),
    );
  });

  it('validates arguments', () => {
    expect(() => allocateBps(money(100, 'BHD'), 10_001, 'down')).toThrow();
    expect(() => allocateBps(money(-1, 'BHD'), 100, 'down')).toThrow();
    expect(() => allocateBps(money(100, 'BHD'), 100, 'down', 0)).toThrow();
  });
});

describe('VAT and percent helpers', () => {
  it('computes VAT included in a gross price', () => {
    // 115.00 SAR at 15 % includes 15.00
    expect(includedVat(money(11500, 'SAR'), 1500).minor).toBe(1500);
    // 28.500 BHD at 10 % includes 2.591 (28.5 / 11 = 2.5909…)
    expect(includedVat(money(28500, 'BHD'), 1000).minor).toBe(2591);
  });

  it('converts percents to bps', () => {
    expect(percentToBps(30)).toBe(3000);
    expect(percentToBps(12.5)).toBe(1250);
    expect(() => percentToBps(101)).toThrow();
    expect(() => percentToBps(1.234)).toThrow();
  });
});
