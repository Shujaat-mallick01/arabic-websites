// Per-country defaults. new-site and the config schema derive currency, zone and weekend from here.

import type { CountryCode, CurrencyCode, Dialect, TimeZone, Weekday } from './types.ts';

export interface CountryInfo {
  currency: CurrencyCode;
  timeZone: TimeZone;
  weekend: Weekday[];
  dialect: Dialect;
  dialCode: string;
  /** VAT rate in bps when prices are VAT-inclusive (0 = no VAT). */
  vatBps: number;
  name: { ar: string; en: string };
}

export const COUNTRY_INFO: Record<CountryCode, CountryInfo> = {
  BH: { currency: 'BHD', timeZone: 'Asia/Bahrain', weekend: ['fri', 'sat'], dialect: 'khaleeji-bh', dialCode: '973', vatBps: 1000, name: { ar: 'البحرين', en: 'Bahrain' } },
  KW: { currency: 'KWD', timeZone: 'Asia/Kuwait', weekend: ['fri', 'sat'], dialect: 'kuwaiti', dialCode: '965', vatBps: 0, name: { ar: 'الكويت', en: 'Kuwait' } },
  SA: { currency: 'SAR', timeZone: 'Asia/Riyadh', weekend: ['fri', 'sat'], dialect: 'najdi', dialCode: '966', vatBps: 1500, name: { ar: 'السعودية', en: 'Saudi Arabia' } },
  IQ: { currency: 'IQD', timeZone: 'Asia/Baghdad', weekend: ['fri', 'sat'], dialect: 'iraqi', dialCode: '964', vatBps: 0, name: { ar: 'العراق', en: 'Iraq' } },
  AE: { currency: 'AED', timeZone: 'Asia/Dubai', weekend: ['sat', 'sun'], dialect: 'msa', dialCode: '971', vatBps: 500, name: { ar: 'الإمارات', en: 'UAE' } },
  QA: { currency: 'QAR', timeZone: 'Asia/Qatar', weekend: ['fri', 'sat'], dialect: 'msa', dialCode: '974', vatBps: 0, name: { ar: 'قطر', en: 'Qatar' } },
  OM: { currency: 'OMR', timeZone: 'Asia/Muscat', weekend: ['fri', 'sat'], dialect: 'msa', dialCode: '968', vatBps: 500, name: { ar: 'عُمان', en: 'Oman' } },
  JO: { currency: 'JOD', timeZone: 'Asia/Amman', weekend: ['fri', 'sat'], dialect: 'msa', dialCode: '962', vatBps: 1600, name: { ar: 'الأردن', en: 'Jordan' } },
};
