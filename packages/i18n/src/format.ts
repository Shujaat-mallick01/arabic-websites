// Number, money, date and time formatting. Exact: money goes to Intl as a decimal string,
// so nothing is ever rounded in the UI.

import {
  exponentOf,
  instantOf,
  toDecimalString,
  type CountryCode,
  type Lang,
  type LocalDate,
  type Money,
  type TimeZone,
} from '@aw/core';

export interface FormatLocale {
  country: CountryCode;
  numberingSystem: 'arab' | 'latn';
  timeZone: TimeZone;
  hijri?: { calendar: 'islamic-umalqura' | 'islamic-civil' };
}

/** 'ar-BH' (+ '-u-nu-latn' when the site uses Western digits in Arabic) or 'en'. */
export function intlLocale(loc: Pick<FormatLocale, 'country' | 'numberingSystem'>, lang: Lang): string {
  if (lang === 'en') return 'en';
  return loc.numberingSystem === 'latn' ? `ar-${loc.country}-u-nu-latn` : `ar-${loc.country}`;
}

const nfCache = new Map<string, Intl.NumberFormat>();
function nf(locale: string, opts: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = locale + JSON.stringify(opts);
  let f = nfCache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, opts);
    nfCache.set(key, f);
  }
  return f;
}

export interface MoneyFormatOptions {
  /** Keep Intl's trailing dot on Arabic abbreviations ("د.ب."). Default false → "د.ب". */
  keepSymbolDot?: boolean;
  /** Hide the currency symbol (just the number). */
  bare?: boolean;
  /** Display-only: drop an all-zero fraction (450.00 → 450). Never rounds. */
  trimZeroFraction?: boolean;
}

/**
 * Exact money formatting.
 * ar-BH: "‏٣٨٫٥٠٠ د.ب‏"   ar-BH latn: "‏38.500 د.ب‏"   en: "BHD 38.500"
 */
export function formatMoney(m: Money, lang: Lang, loc: Pick<FormatLocale, 'country' | 'numberingSystem'>, opts: MoneyFormatOptions = {}): string {
  const fullExp = exponentOf(m.currency);
  const exp = opts.trimZeroFraction && m.minor % 10 ** fullExp === 0 ? 0 : fullExp;
  const locale = intlLocale(loc, lang);
  const decimal = exp === fullExp ? toDecimalString(m) : String(m.minor / 10 ** fullExp);
  const f = opts.bare
    ? nf(locale, { minimumFractionDigits: exp, maximumFractionDigits: exp })
    : nf(locale, { style: 'currency', currency: m.currency, minimumFractionDigits: exp, maximumFractionDigits: exp });
  // Intl accepts exact decimal strings (ES2023 Intl.NumberFormat v3).
  let out = f.format(decimal as unknown as number);
  if (!opts.keepSymbolDot && lang === 'ar') out = out.replace(/\.(‏?)$/, '$1');
  return out;
}

export function formatNumber(n: number, lang: Lang, loc: Pick<FormatLocale, 'country' | 'numberingSystem'>, opts: Intl.NumberFormatOptions = {}): string {
  return nf(intlLocale(loc, lang), opts).format(n);
}

/** Digits only, in the page's numbering system (quantities, counters). */
export function digits(n: number | string, lang: Lang, loc: Pick<FormatLocale, 'country' | 'numberingSystem'>): string {
  const s = String(n);
  if (lang === 'en' || loc.numberingSystem === 'latn') return s;
  return s.replace(/\d/g, (d) => String.fromCodePoint(0x0660 + Number(d)));
}

const dtfCache = new Map<string, Intl.DateTimeFormat>();
function dtf(locale: string, opts: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = locale + JSON.stringify(opts);
  let f = dtfCache.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, opts);
    dtfCache.set(key, f);
  }
  return f;
}

function noonOf(date: LocalDate, tz: TimeZone): Date {
  // Noon local time is safely inside the calendar day in every zone.
  return instantOf(date, 12 * 60, tz);
}

export type DateStyle = 'long' | 'short' | 'weekday-long' | 'day-month' | 'weekday';

const DATE_STYLES: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  long: { day: 'numeric', month: 'long', year: 'numeric' },
  short: { day: 'numeric', month: 'short' },
  'weekday-long': { weekday: 'long', day: 'numeric', month: 'long' },
  'day-month': { day: 'numeric', month: 'long' },
  weekday: { weekday: 'long' },
};

/** Gregorian date in the page language. Uses the full country locale (ar-IQ prints أيلول, ar-BH prints سبتمبر). */
export function formatDate(date: LocalDate, lang: Lang, loc: FormatLocale, style: DateStyle = 'weekday-long'): string {
  const base = intlLocale(loc, lang);
  const locale = lang === 'ar' ? `${base}${base.includes('-u-') ? '-' : '-u-'}ca-gregory` : base;
  return dtf(locale, { ...DATE_STYLES[style], timeZone: loc.timeZone }).format(noonOf(date, loc.timeZone));
}

/** Hijri date for display only, e.g. "١٣ ربيع الآخر ١٤٤٨ هـ". */
export function formatHijri(date: LocalDate, lang: Lang, loc: FormatLocale): string {
  const cal = loc.hijri?.calendar ?? 'islamic-umalqura';
  const base = intlLocale(loc, lang);
  const locale = `${base}${base.includes('-u-') ? '-' : '-u-'}ca-${cal}`;
  return dtf(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: loc.timeZone }).format(noonOf(date, loc.timeZone));
}

export interface HijriParts {
  year: number;
  month: number;
  day: number;
}

export function hijriParts(date: LocalDate, tz: TimeZone, calendar: 'islamic-umalqura' | 'islamic-civil' = 'islamic-umalqura'): HijriParts {
  const parts = dtf(`en-u-ca-${calendar}-nu-latn`, { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: tz }).formatToParts(noonOf(date, tz));
  const get = (t: string) => Number.parseInt(parts.find((p) => p.type === t)?.value ?? '', 10);
  return { year: get('year'), month: get('month'), day: get('day') };
}

/** Business-day minutes (may exceed 1440) → "٤:٠٠ م" / "4:00 PM". */
export function formatTime(minutes: number, lang: Lang, loc: FormatLocale): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  const d = new Date(Date.UTC(2000, 0, 1, Math.floor(m / 60), m % 60));
  return dtf(intlLocale(loc, lang), { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }).format(d);
}

/** An opening range, marking after-midnight closes: "٢:٠٠ م – ٢:٠٠ ص (بعد منتصف الليل)". */
export function formatTimeRange(start: number, end: number, lang: Lang, loc: FormatLocale): string {
  const a = formatTime(start, lang, loc);
  const b = formatTime(end, lang, loc);
  const crosses = end > 1440;
  const sep = ' – ';
  if (!crosses) return `${a}${sep}${b}`;
  return lang === 'ar' ? `${a}${sep}${b} (بعد منتصف الليل)` : `${a}${sep}${b} (after midnight)`;
}
