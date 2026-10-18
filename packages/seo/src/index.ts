// Page metadata and JSON-LD. Never emits Review/AggregateRating (sample reviews are illustrative)
// or FAQ rich results.

import { bcp47, ogLocale, toDecimalString, WEEKDAYS, type HoursSettings, type I18nText, type Lang, type Money, type SiteConfig, type Weekday } from '@aw/core';

export interface PageMeta {
  /** Page title without the brand suffix ('' for the home page). */
  title: string;
  description: string;
  /** Path without the /en prefix, with a trailing slash: '/products/linen-kaftan/'. */
  path: string;
  /** Absolute or root-relative image URL for og:image. */
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'product' | 'article';
  noindex?: boolean;
}

export interface HeadTags {
  title: string;
  description: string;
  canonical: string;
  alternates: Array<{ hreflang: string; href: string }>;
  robots?: string;
  meta: Array<{ name?: string; property?: string; content: string }>;
}

export function localePath(path: string, lang: Lang): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return lang === 'en' ? (clean === '/' ? '/en/' : `/en${clean}`) : clean;
}

function abs(origin: string, p: string): string {
  return /^https?:\/\//.test(p) ? p : `${origin}${p.startsWith('/') ? '' : '/'}${p}`;
}

export function buildHead(site: SiteConfig, brandName: I18nText, page: PageMeta, lang: Lang): HeadTags {
  const origin = site.deploy.url;
  const name = brandName[lang] || brandName.ar;
  const title = page.title ? site.seo.titleTemplate[lang].replace('%s', page.title).replace('{name}', name) : name;
  const canonical = abs(origin, localePath(page.path, lang));
  const alternates = [
    { hreflang: bcp47(site.locale, 'ar'), href: abs(origin, localePath(page.path, 'ar')) },
    { hreflang: 'en', href: abs(origin, localePath(page.path, 'en')) },
    { hreflang: 'x-default', href: abs(origin, localePath(page.path, 'ar')) },
  ];
  const noindex = page.noindex || !site.seo.indexing;
  const meta: HeadTags['meta'] = [
    { property: 'og:type', content: page.type ?? 'website' },
    { property: 'og:site_name', content: name },
    { property: 'og:title', content: title },
    { property: 'og:description', content: page.description },
    { property: 'og:url', content: canonical },
    { property: 'og:locale', content: ogLocale(site.locale, lang) },
    { property: 'og:locale:alternate', content: ogLocale(site.locale, lang === 'ar' ? 'en' : 'ar') },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: page.description },
  ];
  const image = page.image ?? '/og.png';
  meta.push({ property: 'og:image', content: abs(origin, image) }, { name: 'twitter:image', content: abs(origin, image) });
  if (page.imageAlt) meta.push({ property: 'og:image:alt', content: page.imageAlt });
  if (site.seo.verification?.google) meta.push({ name: 'google-site-verification', content: site.seo.verification.google });
  return { title, description: page.description, canonical, alternates, ...(noindex ? { robots: 'noindex, follow' } : {}), meta };
}

const SCHEMA_DAYS: Record<Weekday, string> = { sat: 'Saturday', sun: 'Sunday', mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday' };

/** Groups identical ranges across days. A close earlier than open spans the next day under schema.org semantics. */
export function openingHoursSpecification(hours: HoursSettings) {
  const groups = new Map<string, { opens: string; closes: string; days: string[] }>();
  for (const d of WEEKDAYS) {
    for (const r of hours.weekly[d] ?? []) {
      const key = `${r.open}-${r.close}`;
      const g = groups.get(key) ?? { opens: r.open, closes: r.close, days: [] };
      g.days.push(SCHEMA_DAYS[d]);
      groups.set(key, g);
    }
  }
  return [...groups.values()].map((g) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: g.days, opens: g.opens, closes: g.closes }));
}

export interface BusinessInput {
  name: I18nText;
  description: I18nText;
  phone?: string;
  email?: string;
  address?: I18nText;
  area?: string;
  geo?: { lat: number; lng: number };
  hours?: HoursSettings;
  logo?: string;
  image?: string;
  sameAs?: string[];
}

export function businessJsonLd(site: SiteConfig, b: BusinessInput, lang: Lang) {
  const origin = site.deploy.url;
  return {
    '@context': 'https://schema.org',
    '@type': site.seo.businessType,
    '@id': `${origin}/#business`,
    name: b.name[lang] || b.name.ar,
    description: b.description[lang] || b.description.ar,
    url: abs(origin, localePath('/', lang)),
    ...(b.logo ? { logo: abs(origin, b.logo) } : {}),
    image: abs(origin, b.image ?? '/og.png'),
    ...(b.phone ? { telephone: b.phone } : {}),
    ...(b.email ? { email: b.email } : {}),
    ...(site.seo.priceRange ? { priceRange: site.seo.priceRange } : {}),
    currenciesAccepted: site.locale.currency,
    ...(b.address?.ar
      ? { address: { '@type': 'PostalAddress', streetAddress: b.address[lang] || b.address.ar, ...(b.area ? { addressLocality: b.area } : {}), addressCountry: site.locale.country } }
      : { areaServed: { '@type': 'Country', name: site.locale.country } }),
    ...(b.geo ? { geo: { '@type': 'GeoCoordinates', latitude: b.geo.lat, longitude: b.geo.lng } } : {}),
    ...(b.hours ? { openingHoursSpecification: openingHoursSpecification(b.hours) } : {}),
    ...(b.sameAs?.length ? { sameAs: b.sameAs } : {}),
  };
}

const AVAILABILITY: Record<string, string> = {
  in_stock: 'https://schema.org/InStock',
  ready_now: 'https://schema.org/InStock',
  made_to_order: 'https://schema.org/MadeToOrder',
  preorder: 'https://schema.org/PreOrder',
  sold_out: 'https://schema.org/OutOfStock',
};

export function productJsonLd(site: SiteConfig, p: { title: I18nText; description: I18nText; slug: string; price: Money; availability: string; images: string[]; category?: string }, lang: Lang) {
  const url = abs(site.deploy.url, localePath(`/products/${p.slug}/`, lang));
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.title[lang] || p.title.ar,
    description: p.description[lang] || p.description.ar,
    url,
    image: p.images.map((i) => abs(site.deploy.url, i)),
    ...(p.category ? { category: p.category } : {}),
    brand: { '@id': `${site.deploy.url}/#business` },
    offers: {
      '@type': 'Offer',
      url,
      price: toDecimalString(p.price),
      priceCurrency: p.price.currency,
      availability: AVAILABILITY[p.availability] ?? AVAILABILITY.in_stock,
      seller: { '@id': `${site.deploy.url}/#business` },
    },
  };
}

export function serviceJsonLd(site: SiteConfig, s: { title: I18nText; summary: I18nText; slug: string; price: Money; durationMinutes: number }, lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.title[lang] || s.title.ar,
    description: s.summary[lang] || s.summary.ar,
    url: abs(site.deploy.url, localePath(`/services/${s.slug}/`, lang)),
    provider: { '@id': `${site.deploy.url}/#business` },
    offers: { '@type': 'Offer', price: toDecimalString(s.price), priceCurrency: s.price.currency },
  };
}

export function breadcrumbsJsonLd(site: SiteConfig, trail: Array<{ name: string; path: string }>, lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: abs(site.deploy.url, localePath(t.path, lang)) })),
  };
}

/** Demos rely on noindex (meta + header), not on robots.txt blocking. */
export function robotsTxt(site: SiteConfig): string {
  return ['User-agent: *', 'Disallow: /admin/', 'Disallow: /owner/', 'Disallow: /api/', 'Disallow: /pay/', 'Allow: /', '', `Sitemap: ${site.deploy.url}/sitemap-index.xml`, ''].join('\n');
}

/** Escapes JSON for a <script type="application/ld+json"> body. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}
