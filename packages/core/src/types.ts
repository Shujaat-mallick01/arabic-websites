// Shared primitive types. Every package builds on these.

export type Lang = 'ar' | 'en';
export const LANGS = ['ar', 'en'] as const satisfies readonly Lang[];

export interface I18nText {
  ar: string;
  en: string;
}

export const COUNTRIES = ['BH', 'KW', 'SA', 'IQ', 'AE', 'QA', 'OM', 'JO'] as const;
export type CountryCode = (typeof COUNTRIES)[number];

export const GCC_COUNTRIES = ['BH', 'KW', 'SA', 'AE', 'QA', 'OM'] as const;
export type GccCountry = (typeof GCC_COUNTRIES)[number];

export const CURRENCY_CODES = ['BHD', 'KWD', 'OMR', 'JOD', 'SAR', 'AED', 'QAR', 'IQD'] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export const TIME_ZONES = [
  'Asia/Bahrain',
  'Asia/Kuwait',
  'Asia/Riyadh',
  'Asia/Baghdad',
  'Asia/Dubai',
  'Asia/Qatar',
  'Asia/Muscat',
  'Asia/Amman',
] as const;
export type TimeZone = (typeof TIME_ZONES)[number];

/** 'YYYY-MM-DD': a calendar date in the site's time zone. */
export type LocalDate = string;
/** 'HH:MM', 24-hour. */
export type TimeHM = string;

export const WEEKDAYS = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'] as const;
export type Weekday = (typeof WEEKDAYS)[number];

/** '+97336001234': digits only after '+'. */
export type E164 = `+${string}`;
/** Integer minor units (fils, halalas, dinars for IQD). */
export type Minor = number;
/** Basis points: 10000 = 100 %. */
export type Bps = number;
export type Hex = `#${string}`;

export interface Money {
  readonly minor: Minor;
  readonly currency: CurrencyCode;
}

export const DIALECTS = ['khaleeji-bh', 'kuwaiti', 'najdi', 'hijazi', 'iraqi', 'msa'] as const;
export type Dialect = (typeof DIALECTS)[number];

export type Audience = 'women' | 'men' | 'mixed';

/** The studio behind the demos (studio.config.ts at the repo root). */
export interface StudioConfig {
  name: string;
  whatsapp: E164;
  email?: string;
  hubUrl: `https://${string}`;
  credit: I18nText;
  hubIndexing: boolean;
}
