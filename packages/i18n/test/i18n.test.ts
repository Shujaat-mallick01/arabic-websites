import { describe, expect, it } from 'vitest';
import { money } from '@aw/core';
import {
  ADDRESS_FIELDS,
  digits,
  displayPhone,
  formatAddress,
  formatDate,
  formatHijri,
  formatMoney,
  formatTimeRange,
  hijriParts,
  maskPhone,
  parsePhone,
  phoneErrorMessage,
  plural,
  t,
  type FormatLocale,
} from '../src/index.ts';

const RLM = '‏';
const NB = ' ';
const bh: FormatLocale = { country: 'BH', numberingSystem: 'arab', timeZone: 'Asia/Bahrain' };
const bhLatn: FormatLocale = { ...bh, numberingSystem: 'latn' };
const iq: FormatLocale = { country: 'IQ', numberingSystem: 'arab', timeZone: 'Asia/Baghdad' };
const sa: FormatLocale = { country: 'SA', numberingSystem: 'arab', timeZone: 'Asia/Riyadh' };

describe('formatMoney', () => {
  it('prints exact amounts in each locale', () => {
    expect(formatMoney(money(38500, 'BHD'), 'ar', bh)).toBe(`${RLM}٣٨٫٥٠٠${NB}د.ب${RLM}`);
    expect(formatMoney(money(38500, 'BHD'), 'ar', bhLatn)).toBe(`${RLM}38.500${NB}د.ب${RLM}`);
    expect(formatMoney(money(45000, 'IQD'), 'ar', iq)).toBe(`${RLM}٤٥٬٠٠٠${NB}د.ع${RLM}`);
    expect(formatMoney(money(35000, 'SAR'), 'ar', sa)).toBe(`${RLM}٣٥٠٫٠٠${NB}ر.س${RLM}`);
    expect(formatMoney(money(38500, 'BHD'), 'en', bh)).toBe(`BHD${NB}38.500`);
    expect(formatMoney(money(45000, 'IQD'), 'en', iq)).toBe(`IQD${NB}45,000`);
  });

  it('never rounds, even for values a float would mangle', () => {
    expect(formatMoney(money(9_007_199_254_740_991, 'KWD'), 'en', { country: 'KW', numberingSystem: 'latn' })).toBe(
      `KWD${NB}9,007,199,254,740.991`,
    );
    expect(formatMoney(money(5, 'BHD'), 'en', bh)).toBe(`BHD${NB}0.005`);
  });

  it('trims an all-zero fraction only when asked, never rounding', () => {
    const latnSa = { country: 'SA' as const, numberingSystem: 'latn' as const };
    expect(formatMoney(money(45000, 'SAR'), 'en', latnSa, { trimZeroFraction: true })).toBe(`SAR${NB}450`);
    expect(formatMoney(money(45050, 'SAR'), 'en', latnSa, { trimZeroFraction: true })).toBe(`SAR${NB}450.50`);
  });

  it('keeps the dot when asked, and supports bare numbers', () => {
    expect(formatMoney(money(38500, 'BHD'), 'ar', bh, { keepSymbolDot: true })).toBe(`${RLM}٣٨٫٥٠٠${NB}د.ب.${RLM}`);
    expect(formatMoney(money(38500, 'BHD'), 'en', bh, { bare: true })).toBe('38.500');
  });
});

describe('dates', () => {
  it('uses the country month names', () => {
    expect(formatDate('2026-09-24', 'ar', iq)).toBe('الخميس، ٢٤ أيلول');
    expect(formatDate('2026-09-24', 'ar', bh)).toBe('الخميس، ٢٤ سبتمبر');
    expect(formatDate('2026-09-24', 'ar', bhLatn)).toBe('الخميس، 24 سبتمبر');
    expect(formatDate('2026-09-24', 'en', bh)).toBe('Thursday, September 24');
  });

  it('formats Saudi dates in the Gregorian calendar, not the Saudi default', () => {
    expect(formatDate('2026-09-24', 'ar', sa, 'long')).toBe('٢٤ سبتمبر ٢٠٢٦');
  });

  it('formats Hijri dates for display', () => {
    expect(formatHijri('2026-09-24', 'ar', bh)).toBe('١٣ ربيع الآخر ١٤٤٨ هـ');
    expect(hijriParts('2027-02-08', 'Asia/Riyadh')).toEqual({ year: 1448, month: 9, day: 1 });
  });

  it('marks ranges that end after midnight', () => {
    expect(formatTimeRange(14 * 60, 26 * 60, 'en', sa)).toBe('2:00 PM – 2:00 AM (after midnight)');
    expect(formatTimeRange(10 * 60, 21 * 60, 'ar', sa)).toBe('١٠:٠٠ ص – ٩:٠٠ م');
  });

  it('converts digits for the numbering system', () => {
    expect(digits(25, 'ar', bh)).toBe('٢٥');
    expect(digits(25, 'ar', bhLatn)).toBe('25');
    expect(digits(25, 'en', bh)).toBe('25');
  });
});

describe('phones', () => {
  it('parses local, international and Arabic-Indic input', () => {
    expect(parsePhone('3600 1234', 'BH')).toEqual({ ok: true, e164: '+97336001234', national: '36001234' });
    expect(parsePhone('+973-3600-1234', 'BH')).toMatchObject({ ok: true, e164: '+97336001234' });
    expect(parsePhone('٠٠٩٧٣٣٦٠٠١٢٣٤', 'BH')).toMatchObject({ ok: true, e164: '+97336001234' });
    expect(parsePhone('0551234567', 'SA')).toMatchObject({ ok: true, e164: '+966551234567' });
    expect(parsePhone('07701234567', 'IQ')).toMatchObject({ ok: true, e164: '+9647701234567' });
    expect(parsePhone('+964 0770 123 4567', 'IQ')).toMatchObject({ ok: true, e164: '+9647701234567' });
    expect(parsePhone('96512345', 'KW')).toMatchObject({ ok: true, e164: '+96596512345' });
  });

  it('explains exactly what is wrong', () => {
    const r = parsePhone('3600123', 'BH');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(phoneErrorMessage(r.error, 'BH', 'ar')).toBe('رقم الجوال البحريني ٨ أرقام، والرقم المكتوب فيه ٧ أرقام. مثال: 36001234');
      expect(phoneErrorMessage(r.error, 'BH', 'en')).toBe('A Bahraini mobile number has 8 digits; you typed 7. Example: 36001234');
    }
    const iqShort = parsePhone('0770123456', 'IQ');
    if (!iqShort.ok) expect(phoneErrorMessage(iqShort.error, 'IQ', 'ar')).toContain('١١ رقماً، والرقم المكتوب فيه ١٠ أرقام');
    const landline = parsePhone('17001234', 'BH');
    expect(landline).toMatchObject({ ok: false, error: { code: 'not_mobile' } });
    expect(parsePhone('+96555001234', 'BH')).toMatchObject({ ok: false, error: { code: 'wrong_country' } });
    expect(parsePhone('', 'BH')).toMatchObject({ ok: false, error: { code: 'empty' } });
  });

  it('displays and masks numbers', () => {
    expect(displayPhone('+97336001234')).toBe('+973 3600 1234');
    expect(displayPhone('+966551234567')).toBe('+966 55 123 4567');
    expect(maskPhone('+97336001234')).toBe('+973 3••• ••34');
  });
});

describe('dictionary', () => {
  it('applies dialect and audience overlays in order', () => {
    const base = { lang: 'ar' as const, dialect: 'msa' as const, audience: 'mixed' as const };
    expect(t('cart.add', base)).toBe('أضف إلى السلة');
    expect(t('cart.add', { ...base, audience: 'women' })).toBe('أضيفي إلى السلة');
    expect(t('cart.add', { ...base, dialect: 'khaleeji-bh', audience: 'women' })).toBe('أضيفي للسلة');
    expect(t('cart.add', { ...base, dialect: 'iraqi', audience: 'women' })).toBe('ضيفي للسلة');
    expect(t('cta.orderWhatsapp', { ...base, dialect: 'iraqi', audience: 'women' })).toBe('اطلبي عالواتساب');
    expect(t('wa.greeting', { ...base, dialect: 'iraqi', audience: 'women' })).toBe('هلو');
    expect(t('wa.greeting', { ...base, dialect: 'khaleeji-bh' })).toBe('هلا');
    expect(t('cart.add', { ...base, lang: 'en', dialect: 'iraqi', audience: 'women' })).toBe('Add to bag');
  });

  it('interpolates and lets sites override', () => {
    const ctx = { lang: 'ar' as const, dialect: 'kuwaiti' as const, audience: 'mixed' as const, overrides: { ar: { 'cta.shopNow': 'شوفوا الجديد' } } };
    expect(t('cta.shopNow', ctx)).toBe('شوفوا الجديد');
    expect(t('product.lowStock', ctx, { n: '٢' })).toBe('باقي ٢ فقط');
  });

  it('has Arabic plural forms', () => {
    const forms = { one: 'قطعة واحدة', two: 'قطعتان', few: '{n} قطع', many: '{n} قطعة', other: '{n} قطعة' };
    expect(plural('ar', 1, forms)).toBe('قطعة واحدة');
    expect(plural('ar', 2, forms)).toBe('قطعتان');
    expect(plural('ar', 3, forms, '٣')).toBe('٣ قطع');
    expect(plural('ar', 11, forms, '١١')).toBe('١١ قطعة');
    expect(plural('en', 3, { one: '{n} item', other: '{n} items' })).toBe('3 items');
  });
});

describe('addresses', () => {
  it('requires a landmark in Iraq and formats one line', () => {
    expect(ADDRESS_FIELDS.IQ.find((f) => f.id === 'landmark')?.required).toBe(true);
    expect(formatAddress(ADDRESS_FIELDS.BH, { area: 'السيف', block: '428', road: '2832', building: '2425', flat: '' }, 'ar')).toBe(
      'المنطقة السيف، المجمع 428، الطريق 2832، المبنى / المنزل 2425',
    );
  });
});
