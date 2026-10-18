// The per-page context every component receives: language, direction, translator and formatters.

import { site, studio, tokens, resolved, logos } from 'virtual:aw/config';
import { bcp47, type E164, type I18nText, type Lang, type LocalDate, type Money } from '@aw/core';
import { digits, displayPhone, formatDate, formatHijri, formatMoney, formatTime, formatTimeRange, translator, type DateStyle, type FormatLocale, type MoneyFormatOptions, type Translator } from '@aw/i18n';
import { localePath } from '@aw/seo';
import type { FlowConfig, PageId, RouteDef, SectionId, SettingsId, CollectionId } from '@aw/presets';

/** The serialisable part of ResolvedPreset that the browser-side build needs. */
export interface ResolvedLite {
  tier: 'lite' | 'full';
  engines: string[];
  niche: string;
  modules: string[];
  flows: FlowConfig;
  routes: RouteDef[];
  collections: CollectionId[];
  settings: SettingsId[];
  sections: SectionId[];
  functions: string[];
}

export interface PageContext {
  lang: Lang;
  dir: 'rtl' | 'ltr';
  site: typeof site;
  tokens: typeof tokens;
  studio: typeof studio;
  resolved: ResolvedLite;
  logos: typeof logos;
  tr: Translator;
  locale: FormatLocale;
  /** Full BCP 47 tag of the page (ar-BH / en). */
  tag: string;
  pick: (t: I18nText | undefined) => string;
  money: (m: Money, opts?: MoneyFormatOptions) => string;
  num: (n: number | string) => string;
  date: (d: LocalDate, style?: DateStyle) => string;
  hijri: (d: LocalDate) => string;
  time: (minutes: number) => string;
  timeRange: (start: number, end: number) => string;
  phone: (e164: string) => string;
  /** Locale-prefixed internal link: href('/shop/') → '/en/shop/' on English pages. */
  href: (path: string) => string;
  /** The same page in the other language. */
  altHref: string;
  path: string;
  has: (module: string) => boolean;
  hasPage: (page: PageId) => boolean;
  /** The WhatsApp number every button uses (the studio's on demos). */
  whatsapp: (siteNumber?: string) => E164;
}

export function langOf(url: URL): Lang {
  return url.pathname === '/en' || url.pathname.startsWith('/en/') ? 'en' : 'ar';
}

/** The path without the /en prefix. */
export function basePath(url: URL): string {
  const p = url.pathname.replace(/^\/en(\/|$)/, '/');
  return p.endsWith('/') ? p : `${p}/`;
}

export function pageContext(url: URL): PageContext {
  const lang = langOf(url);
  const loc: FormatLocale = {
    country: site.locale.country,
    numberingSystem: site.locale.numberingSystem,
    timeZone: site.locale.timeZone,
    hijri: { calendar: site.locale.hijri.calendar },
  };
  const tr = translator({ lang, dialect: site.locale.dialect, audience: site.locale.audience });
  const path = basePath(url);
  const modules = new Set(resolved.modules);
  const pages = new Set(resolved.routes.map((r) => r.page));
  return {
    lang,
    dir: lang === 'ar' ? 'rtl' : 'ltr',
    site,
    tokens,
    studio,
    resolved,
    logos,
    tr,
    locale: loc,
    tag: bcp47(site.locale, lang),
    pick: (t) => (t ? (lang === 'ar' ? t.ar : t.en || t.ar) : ''),
    money: (m, opts) => formatMoney(m, lang, loc, opts),
    num: (n) => digits(n, lang, loc),
    date: (d, style) => formatDate(d, lang, loc, style),
    hijri: (d) => formatHijri(d, lang, loc),
    time: (m) => formatTime(m, lang, loc),
    timeRange: (a, b) => formatTimeRange(a, b, lang, loc),
    phone: (e) => displayPhone(e),
    href: (p) => localePath(p, lang),
    altHref: localePath(path, lang === 'ar' ? 'en' : 'ar'),
    path,
    has: (m) => modules.has(m),
    hasPage: (p) => pages.has(p),
    whatsapp: (n) => (site.demo.enabled && site.demo.contactRouting === 'studio' ? studio.whatsapp : ((n as E164) || studio.whatsapp)),
  };
}
