// The JSON blob each page embeds for islands: locale, currency, brand and the strings they use.

import { arDict, t, type DictKey } from '@aw/i18n';
import type { I18nText } from '@aw/core';
import type { PageContext } from './context.ts';

const PREFIXES = ['cart.', 'product.', 'form.', 'checkout.', 'order.', 'pay.', 'booking.', 'cta.', 'wa.', 'day.', 'hours.', 'nav.cart', 'close', 'loading', 'demo.', 'contact.'];

export function siteBlob(ctx: PageContext, brand: I18nText, whatsapp: string) {
  const strings: Record<string, string> = {};
  for (const key of Object.keys(arDict) as DictKey[]) {
    if (PREFIXES.some((p) => key.startsWith(p))) strings[key] = t(key, { lang: ctx.lang, dialect: ctx.site.locale.dialect, audience: ctx.site.locale.audience });
  }
  return {
    siteId: ctx.site.id,
    slug: ctx.site.slug,
    lang: ctx.lang,
    locale: ctx.locale,
    currency: ctx.site.locale.currency,
    dialect: ctx.site.locale.dialect,
    audience: ctx.site.locale.audience,
    brand,
    demo: ctx.site.demo.enabled,
    whatsapp,
    siteUrl: ctx.site.deploy.url,
    tier: ctx.resolved.tier,
    strings,
  };
}
