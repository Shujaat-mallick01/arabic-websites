// Readable WhatsApp messages and wa.me links. One builder per intent; every builder
// produces the same shape: demo tag, greeting, bold title, items, details, estimate, link.

import { LRM, type Audience, type Dialect, type Lang, type LocalDate, type Money } from '@aw/core';
import {
  digits,
  displayPhone,
  formatDate,
  formatHijri,
  formatMoney,
  t,
  type FormatLocale,
  type TContext,
} from '@aw/i18n';

export interface WaContext {
  lang: Lang;
  dialect: Dialect;
  audience: Audience;
  locale: FormatLocale;
  /** Business name used in the greeting ("هلا ليان، …"). */
  businessName?: string;
  /** Demo sites prefix "[نموذج: <brand>]" so the studio inbox shows which demo sent it. */
  demoBrand?: string;
  /** Show a Hijri date next to Gregorian dates. */
  hijri?: boolean;
}

export interface Detail {
  label: string;
  value: string;
}

export interface MessageLine {
  title: string;
  /** Selected options, e.g. size and length. */
  options?: Detail[];
  qty?: number;
  unit?: Money;
  /** Line total when it differs from unit × qty (tiers, add-ons). */
  total?: Money;
}

export interface Customer {
  name?: string;
  phone?: string;
}

export interface OrderMessageInput {
  /** Bold heading noun, e.g. "طلب عباية". Defaults to the dictionary's "طلب". */
  title?: string;
  lines: MessageLine[];
  total?: Money;
  date?: LocalDate;
  time?: string;
  fulfilment?: string;
  extra?: Detail[];
  customer?: Customer;
  notes?: string;
  url?: string;
}

export interface BookingMessageInput {
  title?: string;
  service: string;
  options?: Detail[];
  date?: LocalDate;
  time?: string;
  extra?: Detail[];
  lines?: MessageLine[];
  estimate?: Money;
  customer?: Customer;
  notes?: string;
  url?: string;
}

export interface EnquiryMessageInput {
  topic?: string;
  details?: Detail[];
  customer?: Customer;
  notes?: string;
  url?: string;
}

/** WhatsApp treats *, _ and ~ as formatting. Neutralise them in user and catalogue text. */
export function sanitise(text: string): string {
  return text
    .replace(/\*/g, '٭')
    .replace(/(^|\s)_(\S)/g, '$1$2')
    .replace(/~/g, '-')
    .replace(/\r\n?/g, '\n')
    .trim();
}

function tctx(ctx: WaContext): TContext {
  return { lang: ctx.lang, dialect: ctx.dialect, audience: ctx.audience };
}

function money(m: Money, ctx: WaContext): string {
  return formatMoney(m, ctx.lang, ctx.locale);
}

function withUtm(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set('utm_source', 'whatsapp');
    return u.toString();
  } catch {
    return url;
  }
}

function header(ctx: WaContext, introKey: 'wa.orderIntro' | 'wa.bookingIntro' | 'wa.enquiryIntro' | 'wa.askAbout'): string[] {
  const out: string[] = [];
  const tc = tctx(ctx);
  if (ctx.demoBrand) out.push(`[${t('wa.demo', tc)}: ${sanitise(ctx.demoBrand)}]`);
  const greet = t('wa.greeting', tc);
  const sep = ctx.lang === 'ar' ? '،' : ',';
  const who = ctx.businessName ? ` ${sanitise(ctx.businessName)}` : '';
  out.push(`${greet}${who}${sep} ${t(introKey, tc)}`);
  return out;
}

function dateText(date: LocalDate, ctx: WaContext): string {
  let s = formatDate(date, ctx.lang, ctx.locale);
  if (ctx.hijri) s += ` (${formatHijri(date, ctx.lang, ctx.locale)})`;
  return s;
}

function lineText(l: MessageLine, ctx: WaContext): string[] {
  const tc = tctx(ctx);
  const out = [`• ${sanitise(l.title)}`];
  const opts = (l.options ?? []).filter((o) => o.value.trim());
  if (opts.length) out.push(`  ${opts.map((o) => `${sanitise(o.label)}: ${sanitise(o.value)}`).join(' · ')}`);
  if (l.qty !== undefined || l.unit) {
    const qty = digits(l.qty ?? 1, ctx.lang, ctx.locale);
    const unit = l.unit ? ` × ${money(l.unit, ctx)}` : '';
    const total = l.total ? ` = ${money(l.total, ctx)}` : '';
    out.push(`  ${t('wa.qty', tc)}: ${qty}${unit}${total}`);
  }
  return out;
}

function customerLines(c: Customer | undefined, ctx: WaContext): string[] {
  if (!c) return [];
  const tc = tctx(ctx);
  const out: string[] = [];
  if (c.name?.trim()) out.push(`${t('wa.name', tc)}: ${sanitise(c.name)}`);
  if (c.phone?.trim()) {
    const p = c.phone.startsWith('+') ? displayPhone(c.phone) : c.phone.trim();
    out.push(`${t('wa.phone', tc)}: ${LRM}${p}`);
  }
  return out;
}

function detailLines(d: Detail[] | undefined): string[] {
  return (d ?? []).filter((x) => x.value.trim()).map((x) => `${sanitise(x.label)}: ${sanitise(x.value)}`);
}

interface Parts {
  head: string[];
  lines: MessageLine[];
  middle: string[];
  tail: string[];
  notes?: string;
  url?: string;
}

function render(p: Parts, ctx: WaContext, keepLines: number, notesMax: number): string {
  const tc = tctx(ctx);
  const out = [...p.head];
  const shown = p.lines.slice(0, keepLines);
  for (const l of shown) out.push(...lineText(l, ctx));
  const hidden = p.lines.length - shown.length;
  if (hidden > 0) out.push(t('wa.moreItems', tc, { n: digits(hidden, ctx.lang, ctx.locale) }));
  out.push(...p.middle, ...p.tail);
  if (p.notes?.trim()) {
    let n = sanitise(p.notes);
    if (n.length > notesMax) n = `${n.slice(0, Math.max(0, notesMax - 1))}…`;
    out.push(`${t('wa.notes', tc)}: ${n}`);
  }
  if (p.url) out.push(withUtm(p.url));
  return out.join('\n');
}

/** Keeps the encoded wa.me URL under the limit by collapsing items, then shortening notes. */
function fit(p: Parts, ctx: WaContext, maxEncoded: number): string {
  let keep = p.lines.length;
  let notesMax = 1000;
  let msg = render(p, ctx, keep, notesMax);
  while (encodeURIComponent(msg).length > maxEncoded) {
    if (keep > 1) keep--;
    else if (notesMax > 40) notesMax = Math.floor(notesMax / 2);
    else break;
    msg = render(p, ctx, keep, notesMax);
  }
  return msg;
}

export const DEFAULT_MAX_ENCODED = 3800;

export function orderMessage(input: OrderMessageInput, ctx: WaContext, maxEncoded = DEFAULT_MAX_ENCODED): string {
  const tc = tctx(ctx);
  const head = [...header(ctx, 'wa.orderIntro'), `*${sanitise(input.title ?? t('wa.orderTitle', tc))}*`];
  const middle: string[] = [];
  if (input.total) middle.push(`${t('wa.total', tc)}: ${money(input.total, ctx)} ${t('wa.estimate', tc)}`);
  if (input.date) middle.push(`${t('wa.date', tc)}: ${dateText(input.date, ctx)}`);
  if (input.time) middle.push(`${t('wa.time', tc)}: ${sanitise(input.time)}`);
  if (input.fulfilment) middle.push(`${t('wa.fulfilment', tc)}: ${sanitise(input.fulfilment)}`);
  middle.push(...detailLines(input.extra));
  return fit({ head, lines: input.lines, middle, tail: customerLines(input.customer, ctx), notes: input.notes, url: input.url }, ctx, maxEncoded);
}

export function bookingMessage(input: BookingMessageInput, ctx: WaContext, maxEncoded = DEFAULT_MAX_ENCODED): string {
  const tc = tctx(ctx);
  const head = [...header(ctx, 'wa.bookingIntro'), `*${sanitise(input.title ?? t('wa.bookingTitle', tc))}*`];
  head.push(`${t('wa.service', tc)}: ${sanitise(input.service)}`);
  head.push(...detailLines(input.options));
  const middle: string[] = [];
  if (input.date) middle.push(`${t('wa.date', tc)}: ${dateText(input.date, ctx)}`);
  if (input.time) middle.push(`${t('wa.time', tc)}: ${sanitise(input.time)}`);
  middle.push(...detailLines(input.extra));
  if (input.estimate) middle.push(`${t('wa.total', tc)}: ${money(input.estimate, ctx)} ${t('wa.estimate', tc)}`);
  return fit({ head, lines: input.lines ?? [], middle, tail: customerLines(input.customer, ctx), notes: input.notes, url: input.url }, ctx, maxEncoded);
}

export function enquiryMessage(input: EnquiryMessageInput, ctx: WaContext, maxEncoded = DEFAULT_MAX_ENCODED): string {
  const head = header(ctx, input.topic ? 'wa.askAbout' : 'wa.enquiryIntro');
  if (input.topic) head.push(`*${sanitise(input.topic)}*`);
  return fit({ head, lines: [], middle: detailLines(input.details), tail: customerLines(input.customer, ctx), notes: input.notes, url: input.url }, ctx, maxEncoded);
}

/** Text for sharing a product with a friend (no greeting to the shop). */
export function shareMessage(input: { title: string; price?: Money; url: string }, ctx: WaContext): string {
  const tc = tctx(ctx);
  const price = input.price ? ` — ${money(input.price, ctx)}` : '';
  return `${t('wa.shareIntro', tc)} ${sanitise(input.title)}${price}\n${input.url}`;
}

/** https://wa.me/<digits>?text=<encoded>. Without a number it opens the contact picker (sharing). */
export function waLink(e164: string | null, text: string): string {
  const num = e164 ? e164.replace(/\D/g, '') : '';
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}
