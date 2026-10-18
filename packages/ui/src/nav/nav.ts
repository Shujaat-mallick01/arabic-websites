// Navigation model shared by every header and footer variant.

import type { I18nText } from '@aw/core';
import type { PageContext } from '../context.ts';

export interface NavItem {
  label: string;
  href: string;
  current: boolean;
}

export function isCurrent(ctx: PageContext, href: string): boolean {
  const base = href.replace(/^\/en(\/|$)/, '/');
  return base === '/' ? ctx.path === '/' : ctx.path.startsWith(base);
}

/** Primary links: categories for shops, service groups for salons, then the niche's key pages. */
export function primaryNav(ctx: PageContext, categories: Array<{ id: string; title: I18nText }>, limit = 5): NavItem[] {
  const items: NavItem[] = [];
  const add = (label: string, path: string) => items.push({ label, href: ctx.href(path), current: isCurrent(ctx, path) });
  if (ctx.hasPage('menu')) add(ctx.tr('nav.menu'), '/menu/');
  if (ctx.hasPage('shop') && !ctx.hasPage('menu')) {
    for (const c of categories.slice(0, limit)) add(ctx.pick(c.title), `/shop/${c.id}/`);
  }
  if (ctx.hasPage('services')) add(ctx.tr('nav.services'), '/services/');
  if (ctx.hasPage('packages')) add(ctx.tr('nav.packages'), '/packages/');
  if (ctx.hasPage('book') && ctx.resolved.flows.booking !== 'none') add(ctx.tr('nav.book'), '/book/');
  if (ctx.hasPage('gallery') && !ctx.hasPage('shop')) add(ctx.tr('nav.gallery'), '/gallery/');
  if (ctx.hasPage('gift-cards')) add(ctx.tr('nav.giftCards'), '/gift-cards/');
  return items;
}

/** Secondary links for the menu sheet and footer. */
export function secondaryNav(ctx: PageContext): NavItem[] {
  const items: NavItem[] = [];
  const add = (label: string, path: string) => items.push({ label, href: ctx.href(path), current: isCurrent(ctx, path) });
  if (ctx.hasPage('shop')) add(ctx.tr('nav.shop'), '/shop/');
  if (ctx.hasPage('about')) add(ctx.tr('nav.about'), '/about/');
  if (ctx.hasPage('branches')) add(ctx.tr('nav.branches'), '/branches/');
  if (ctx.hasPage('stockists')) add(ctx.tr('nav.stockists'), '/stockists/');
  if (ctx.hasPage('size-guide')) add(ctx.tr('nav.sizeGuide'), '/size-guide/');
  if (ctx.hasPage('lookbook')) add(ctx.tr('nav.lookbook'), '/lookbook/');
  if (ctx.hasPage('gallery') && ctx.hasPage('shop')) add(ctx.tr('nav.gallery'), '/gallery/');
  if (ctx.hasPage('corporate')) add(ctx.tr('nav.corporate'), '/corporate/');
  if (ctx.hasPage('faq')) add(ctx.tr('nav.faq'), '/faq/');
  if (ctx.hasPage('contact')) add(ctx.tr('nav.contact'), '/contact/');
  return items;
}
