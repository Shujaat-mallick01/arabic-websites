// Phone parsing per country. Accepts Arabic-Indic digits, spaces, dashes, +CC, 00CC and the national 0.

import { COUNTRY_INFO, normaliseDigits, type CountryCode, type E164, type Lang } from '@aw/core';

export interface PhoneRule {
  /** National significant number length (without the country code or trunk 0). */
  length: number;
  /** Allowed first digits of a mobile number. */
  mobileStarts: string[];
  /** Trunk prefix dialled nationally ('0' in SA, IQ, AE, JO). */
  trunk?: string;
  /** Example as people write it locally. */
  example: string;
  /** Name of the number in the page language. */
  noun: { ar: string; en: string };
  adjective: { ar: string; en: string };
}

export const PHONE_RULES: Record<CountryCode, PhoneRule> = {
  BH: { length: 8, mobileStarts: ['3', '6'], example: '36001234', noun: { ar: 'رقم الجوال', en: 'mobile number' }, adjective: { ar: 'البحريني', en: 'Bahraini' } },
  KW: { length: 8, mobileStarts: ['4', '5', '6', '9'], example: '55001234', noun: { ar: 'رقم الموبايل', en: 'mobile number' }, adjective: { ar: 'الكويتي', en: 'Kuwaiti' } },
  SA: { length: 9, mobileStarts: ['5'], trunk: '0', example: '0551234567', noun: { ar: 'رقم الجوال', en: 'mobile number' }, adjective: { ar: 'السعودي', en: 'Saudi' } },
  IQ: { length: 10, mobileStarts: ['7'], trunk: '0', example: '07701234567', noun: { ar: 'رقم الموبايل', en: 'mobile number' }, adjective: { ar: 'العراقي', en: 'Iraqi' } },
  AE: { length: 9, mobileStarts: ['5'], trunk: '0', example: '0501234567', noun: { ar: 'رقم الموبايل', en: 'mobile number' }, adjective: { ar: 'الإماراتي', en: 'UAE' } },
  QA: { length: 8, mobileStarts: ['3', '5', '6', '7'], example: '55123456', noun: { ar: 'رقم الجوال', en: 'mobile number' }, adjective: { ar: 'القطري', en: 'Qatari' } },
  OM: { length: 8, mobileStarts: ['7', '9'], example: '92123456', noun: { ar: 'رقم الهاتف', en: 'mobile number' }, adjective: { ar: 'العماني', en: 'Omani' } },
  JO: { length: 9, mobileStarts: ['7'], trunk: '0', example: '0791234567', noun: { ar: 'رقم الموبايل', en: 'mobile number' }, adjective: { ar: 'الأردني', en: 'Jordanian' } },
};

export type PhoneError =
  | { code: 'empty' }
  | { code: 'not_digits' }
  | { code: 'wrong_country'; dialCode: string }
  | { code: 'length'; expected: number; got: number; typed: number }
  | { code: 'not_mobile'; starts: string[] };

export type PhoneResult = { ok: true; e164: E164; national: string } | { ok: false; error: PhoneError };

/** Parses what a shopper types into E.164 for one country. */
export function parsePhone(input: string, country: CountryCode): PhoneResult {
  const rule = PHONE_RULES[country];
  const cc = COUNTRY_INFO[country].dialCode;
  let s = normaliseDigits(input).trim();
  if (!s) return { ok: false, error: { code: 'empty' } };
  s = s.replace(/[\s\-().‎‏]/g, '');
  const typedNational = /^(\+|00)/.test(s) ? s.replace(/^(\+|00)/, '').replace(new RegExp(`^${cc}`), '') : s;
  if (s.startsWith('+')) s = s.slice(1);
  else if (s.startsWith('00')) s = s.slice(2);
  else s = `${cc}${rule.trunk && s.startsWith(rule.trunk) ? s.slice(rule.trunk.length) : s}`;
  if (!/^\d+$/.test(s)) return { ok: false, error: { code: 'not_digits' } };
  if (!s.startsWith(cc)) {
    return { ok: false, error: { code: 'wrong_country', dialCode: cc } };
  }
  let national = s.slice(cc.length);
  // People often type +964 07xx…: drop the trunk zero after the country code.
  if (rule.trunk && national.startsWith(rule.trunk) && national.length === rule.length + rule.trunk.length) {
    national = national.slice(rule.trunk.length);
  }
  if (national.length !== rule.length) {
    return { ok: false, error: { code: 'length', expected: rule.length, got: national.length, typed: typedNational.length } };
  }
  if (!rule.mobileStarts.some((p) => national.startsWith(p))) {
    return { ok: false, error: { code: 'not_mobile', starts: rule.mobileStarts } };
  }
  return { ok: true, e164: `+${cc}${national}`, national };
}

/** '+97336001234' → '+973 3600 1234' (always Western digits; wrap in an LTR isolate in Arabic). */
export function displayPhone(e164: string): string {
  const digits = e164.replace(/^\+/, '');
  for (const info of Object.values(COUNTRY_INFO)) {
    if (digits.startsWith(info.dialCode)) {
      const nat = digits.slice(info.dialCode.length);
      const groups = nat.length === 8 ? [nat.slice(0, 4), nat.slice(4)] : nat.length === 9 ? [nat.slice(0, 2), nat.slice(2, 5), nat.slice(5)] : [nat.slice(0, 3), nat.slice(3, 6), nat.slice(6)];
      return `+${info.dialCode} ${groups.join(' ')}`;
    }
  }
  return e164;
}

/** Demo privacy: '+973 3••• ••34'. */
export function maskPhone(e164: string): string {
  const shown = displayPhone(e164);
  const chars = [...shown];
  const firstDigitAfterSpace = shown.indexOf(' ') + 1;
  let lastKept = chars.length - 2;
  return chars.map((c, i) => (i > firstDigitAfterSpace && i < lastKept && /\d/.test(c) ? '•' : c)).join('');
}

function arabicDigits(n: number): string {
  return String(n).replace(/\d/g, (d) => String.fromCodePoint(0x0660 + Number(d)));
}

function arabicCount(n: number, one: string, two: string, few: string, many: string): string {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n >= 3 && n <= 10) return `${arabicDigits(n)} ${few}`;
  return `${arabicDigits(n)} ${many}`;
}

/** An error message that says exactly what to fix, using the actual values. */
export function phoneErrorMessage(err: PhoneError, country: CountryCode, lang: Lang): string {
  const rule = PHONE_RULES[country];
  const cc = COUNTRY_INFO[country].dialCode;
  const digitsAr = (n: number) => arabicCount(n, 'رقم واحد', 'رقمان', 'أرقام', 'رقماً');
  if (lang === 'ar') {
    const name = `${rule.noun.ar} ${rule.adjective.ar}`;
    switch (err.code) {
      case 'empty':
        return `اكتب ${rule.noun.ar}. مثال: ${rule.example}`;
      case 'not_digits':
        return `${rule.noun.ar} يتكوّن من أرقام فقط. مثال: ${rule.example}`;
      case 'wrong_country':
        return `${name} يبدأ بمفتاح ${cc}+. اكتب الرقم بدون مفتاح الدولة، مثل ${rule.example}`;
      case 'length': {
        const expected = rule.trunk ? rule.length + 1 : rule.length;
        return `${name} ${digitsAr(expected)}، والرقم المكتوب فيه ${digitsAr(err.typed)}. مثال: ${rule.example}`;
      }
      case 'not_mobile':
        return `${name} يبدأ بـ ${(rule.trunk ?? '') + err.starts.join(' أو ' + (rule.trunk ?? ''))}. مثال: ${rule.example}`;
    }
  }
  const name = `${rule.adjective.en} ${rule.noun.en}`;
  switch (err.code) {
    case 'empty':
      return `Enter your ${rule.noun.en}, e.g. ${rule.example}`;
    case 'not_digits':
      return `Use digits only, e.g. ${rule.example}`;
    case 'wrong_country':
      return `A ${name} starts with +${cc}. Type it without the country code, e.g. ${rule.example}`;
    case 'length': {
      const expected = rule.trunk ? rule.length + 1 : rule.length;
      return `A ${name} has ${expected} digits; you typed ${err.typed}. Example: ${rule.example}`;
    }
    case 'not_mobile':
      return `A ${name} starts with ${err.starts.map((s) => (rule.trunk ?? '') + s).join(' or ')}. Example: ${rule.example}`;
  }
}
