// Browser runtime shared by islands: the site blob embedded once per page, formatters and strings.

import type { CurrencyCode, Lang, Money } from '@aw/core';
import { formatDate, formatMoney, digits, type FormatLocale } from '@aw/i18n';

export interface SiteBlob {
  siteId: string;
  slug: string;
  lang: Lang;
  locale: FormatLocale;
  currency: CurrencyCode;
  dialect: string;
  audience: string;
  brand: { ar: string; en: string };
  demo: boolean;
  whatsapp: string;
  siteUrl: string;
  tier: 'lite' | 'full';
  strings: Record<string, string>;
}

let cached: SiteBlob | null = null;

export function siteBlob(): SiteBlob {
  if (cached) return cached;
  const el = document.getElementById('aw-site');
  cached = JSON.parse(el?.textContent || '{}') as SiteBlob;
  return cached;
}

export function money(m: Money): string {
  const s = siteBlob();
  return formatMoney(m, s.lang, s.locale);
}

export function num(n: number | string): string {
  const s = siteBlob();
  return digits(n, s.lang, s.locale);
}

export function date(d: string): string {
  const s = siteBlob();
  return formatDate(d, s.lang, s.locale);
}

/** A dictionary string embedded by the server, with {var} interpolation. */
export function str(key: string, vars?: Record<string, string | number>): string {
  const raw = siteBlob().strings[key] ?? key;
  return vars ? raw.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : raw;
}

export function href(path: string): string {
  return siteBlob().lang === 'en' ? (path === '/' ? '/en/' : `/en${path}`) : path;
}

/** Guarded storage: private windows and blocked storage fall back to memory. */
const memory = new Map<string, string>();
export const storage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return memory.get(key) ?? null;
    }
  },
  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      memory.set(key, value);
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      memory.delete(key);
    }
  },
};

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
