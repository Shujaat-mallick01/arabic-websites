// HTTP handlers for the commerce engine: quote, checkout, order view, stock and gift cards.
// The checkout re-prices everything from server data; client prices are never trusted.

import {
  addMonths,
  COUNTRY_INFO,
  giftCardCode,
  money,
  orderId as newOrderId,
  zonedNow,
  type CountryCode,
  type E164,
  type Lang,
  type Money,
  type PaymentMethodId,
  type SiteConfig,
} from '@aw/core';
import { ADDRESS_FIELDS, parsePhone, phoneErrorMessage, SHIPPING_FIELDS } from '@aw/i18n';
import { availableMethods, getProvider } from '@aw/payments';
import { priceLine, quoteOrder, type CartLine, type FulfilmentChoice } from '@aw/commerce';
import type { Order, OrderLine } from '@aw/commerce/server';
import { createRuntime, json, viewToken, type Runtime, type ServerData } from './runtime.ts';
import { notifyOrder } from './notify.ts';

const DEMO_DAILY_CAP = 30;

interface CheckoutBody {
  kind?: 'order' | 'gift_card';
  lang?: Lang;
  lines?: CartLine[];
  fulfilment?: FulfilmentChoice;
  address?: Record<string, string>;
  customer?: { name?: string; phone?: string; email?: string };
  payment?: 'online' | 'cod';
  method?: PaymentMethodId;
  giftWrap?: boolean;
  giftMessage?: string;
  giftCardCode?: string;
  notes?: string;
  amount?: number;
  recipient?: string;
  message?: string;
  company_website?: string;
  startedAt?: number;
}

type FieldError = { field: string; message: string };

async function readBody(req: Request): Promise<CheckoutBody | null> {
  if (req.method !== 'POST') return null;
  try {
    const b = (await req.json()) as CheckoutBody;
    return b && typeof b === 'object' ? b : null;
  } catch {
    return null;
  }
}

function quoteCtx(rt: Runtime) {
  const now = rt.now();
  const z = zonedNow(rt.site.locale.timeZone, now);
  if (!rt.data.fulfilment) throw new Error('This site has no fulfilment rules');
  return {
    catalog: rt.catalog,
    fulfilment: rt.data.fulfilment,
    checkout: rt.data.checkout ?? { notesMaxLength: 300 },
    siteAllowsCod: !!rt.site.payments?.cod,
    maxQtyPerLine: rt.site.commerce?.cart?.maxQtyPerLine,
    now,
    tz: rt.site.locale.timeZone,
    today: z.date,
  };
}

async function giftCardFor(rt: Runtime, code: string | undefined) {
  if (!code?.trim()) return undefined;
  const card = await (await rt.orders()).giftCards.check(code);
  if (!card || card.expiresOn < zonedNow(rt.site.locale.timeZone, rt.now()).date) return null;
  return { code: card.code, balance: card.balance };
}

function sanitiseText(s: unknown, max: number): string {
  return typeof s === 'string' ? s.replace(/[\u0000-\u0008\u000B-\u001F]/g, '').trim().slice(0, max) : '';
}

function phoneCountry(rt: Runtime, f: FulfilmentChoice | undefined): CountryCode {
  return f?.kind === 'shipping' ? f.country : rt.site.locale.country;
}

function validateCustomer(rt: Runtime, b: CheckoutBody, lang: Lang): { errors: FieldError[]; phone?: E164 } {
  const errors: FieldError[] = [];
  const name = sanitiseText(b.customer?.name, 80);
  if (name.length < 2) errors.push({ field: 'name', message: lang === 'ar' ? 'اكتب الاسم.' : 'Enter your name.' });
  const country = phoneCountry(rt, b.fulfilment);
  const p = parsePhone(String(b.customer?.phone ?? ''), country);
  if (!p.ok) errors.push({ field: 'phone', message: phoneErrorMessage(p.error, country, lang) });
  const email = sanitiseText(b.customer?.email, 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push({ field: 'email', message: lang === 'ar' ? 'البريد الإلكتروني غير مكتمل. مثال: name@example.com' : 'The email address is incomplete, e.g. name@example.com' });
  return { errors, ...(p.ok ? { phone: p.e164 } : {}) };
}

function validateAddress(rt: Runtime, b: CheckoutBody, lang: Lang): { errors: FieldError[]; address: Record<string, string> } {
  const errors: FieldError[] = [];
  const address: Record<string, string> = {};
  const f = b.fulfilment;
  if (!f || f.kind === 'pickup') return { errors, address };
  const fields = f.kind === 'shipping' ? SHIPPING_FIELDS : ADDRESS_FIELDS[rt.site.locale.country];
  for (const field of fields) {
    const v = sanitiseText(b.address?.[field.id], field.maxLength);
    if (field.required && !v) errors.push({ field: `address.${field.id}`, message: lang === 'ar' ? `اكتب ${field.label.ar}.` : `Enter the ${field.label.en.toLowerCase()}.` });
    if (v) address[field.id] = v;
  }
  return { errors, address };
}

async function demoCapReached(rt: Runtime): Promise<boolean> {
  if (!rt.site.demo.enabled) return false;
  const day = zonedNow(rt.site.locale.timeZone, rt.now()).date;
  return (await (await rt.orders()).listDay(day)).filter((o) => o.demo).length >= DEMO_DAILY_CAP;
}

function orderUrl(rt: Runtime, id: string, token: string, lang: Lang, base: string): string {
  return `${base}${lang === 'en' ? '/en' : ''}/order/?o=${encodeURIComponent(id)}&t=${token}`;
}

/** The order's lines with server prices and readable labels. */
function orderLines(rt: Runtime, lines: CartLine[]): OrderLine[] {
  return lines.map((l) => {
    const p = rt.catalog.get(l.productId)!;
    const priced = priceLine(p, l);
    return { productId: p.id, slug: p.slug, title: p.title, selection: l.selection, labels: priced.labels.map((x) => ({ label: x.label, value: x.value })), ...(l.addons ? { addons: l.addons } : {}), qty: l.qty, unit: priced.unit, total: priced.total };
  });
}

async function startPayment(rt: Runtime, o: Order, method: PaymentMethodId | undefined, payable: Money, base: string): Promise<string> {
  const deps = await rt.providerDeps();
  const provider = await getProvider(rt.site.payments?.provider ?? 'mock', deps);
  const session = await provider.createPaymentSession({
    orderId: o.id,
    siteId: rt.site.id,
    purpose: o.kind === 'gift_card' ? 'gift_card' : 'order',
    amount: payable,
    description: { ar: `طلب ${o.id}`, en: `Order ${o.id}` },
    customer: o.customer,
    lang: o.lang,
    ...(method ? { method } : {}),
    lines: o.lines.map((l) => ({ name: l.title[o.lang] || l.title.ar, qty: l.qty, unit: l.unit })),
    returnUrl: `${base}${o.lang === 'en' ? '/en' : ''}/pay/return/`,
    cancelUrl: `${base}${o.lang === 'en' ? '/en' : ''}/checkout/`,
    idempotencyKey: `${o.id}:1`,
  });
  await (await rt.orders()).attachPayment(o.id, { state: 'pending', amountMatches: true, sessionId: session.sessionId, ...(method ? { method } : {}) }, 'system');
  return session.redirectUrl;
}

export function quoteHandler(rt: Runtime) {
  return async (req: Request): Promise<Response> => {
    const b = await readBody(req);
    if (!b) return json({ error: 'bad_request' }, 400);
    const gc = await giftCardFor(rt, b.giftCardCode);
    const q = quoteOrder({ lines: b.lines ?? [], ...(b.fulfilment ? { fulfilment: b.fulfilment } : {}), ...(b.payment ? { payment: b.payment } : {}), giftWrap: !!b.giftWrap, ...(gc ? { giftCard: gc } : {}) }, quoteCtx(rt));
    return json({
      ok: q.ok,
      subtotal: q.subtotal,
      shipping: q.shipping,
      codFee: q.codFee ?? null,
      giftWrap: q.giftWrap ?? null,
      giftCard: q.giftCard ?? (gc === null ? { invalid: true } : null),
      vatIncluded: q.vatIncluded ?? null,
      total: q.total,
      payable: q.payable,
      freeShippingGap: q.freeShippingGap ?? null,
      codOffered: q.codOffered,
      lineIssues: q.lines.map((l) => l.issues),
      lines: q.lines.map((l) => (l.price ? { unit: l.price.unit, total: l.price.total } : null)),
      fulfilmentIssues: q.fulfilmentIssues,
      orderIssues: q.orderIssues,
    });
  };
}

export function checkoutHandler(rt: Runtime) {
  return async (req: Request): Promise<Response> => {
    const b = await readBody(req);
    if (!b) return json({ error: 'bad_request' }, 400);
    // Spam protection: honeypot and a time trap.
    if (b.company_website) return json({ error: 'rejected' }, 400);
    if (typeof b.startedAt === 'number' && rt.now().getTime() - b.startedAt < 3000) return json({ error: 'too_fast' }, 429);
    if (await demoCapReached(rt)) return json({ error: 'demo_cap' }, 429);
    const lang: Lang = b.lang === 'en' ? 'en' : 'ar';
    const base = (await rt.providerDeps()).siteUrl;
    const store = await rt.orders();
    const today = zonedNow(rt.site.locale.timeZone, rt.now()).date;
    const prefix = rt.site.commerce?.orderPrefix ?? 'OR';

    const { errors: customerErrors, phone } = validateCustomer(rt, b, lang);

    if (b.kind === 'gift_card') {
      const cfg = rt.site.commerce?.giftCards;
      const amount = Number(b.amount);
      const okAmount = !!cfg && Number.isSafeInteger(amount) && cfg.denominations.includes(amount);
      const errors = [...customerErrors];
      if (!okAmount) errors.push({ field: 'amount', message: lang === 'ar' ? 'اختر مبلغ البطاقة.' : 'Choose a card amount.' });
      const recipient = sanitiseText(b.recipient, 60);
      if (!recipient) errors.push({ field: 'recipient', message: lang === 'ar' ? 'اكتب اسم المُهدى إليه.' : 'Enter the recipient’s name.' });
      if (errors.length || !phone) return json({ errors }, 422);
      const value = money(amount, rt.site.locale.currency);
      const id = newOrderId(prefix, today);
      const token = await viewToken(rt.secret, id);
      const o: Order = {
        id, siteId: rt.site.id, kind: 'gift_card', createdAt: rt.now().toISOString(), lang,
        customer: { name: sanitiseText(b.customer?.name, 80), phone, ...(b.customer?.email ? { email: sanitiseText(b.customer.email, 120) } : {}) },
        lines: [{ productId: 'gift-card', slug: 'gift-card', title: { ar: 'بطاقة هدية', en: 'Gift card' }, selection: {}, labels: [], qty: 1, unit: value, total: value }],
        fulfilment: { kind: 'digital' },
        pricing: { subtotal: value, shipping: money(0, value.currency), total: value, payable: value },
        payment: { provider: rt.site.payments?.provider ?? 'mock', state: 'pending' },
        status: 'pending_payment',
        history: [{ at: rt.now().toISOString(), from: null, to: 'pending_payment', by: 'system' }],
        giftCardPurchase: { amount: value, recipient, ...(b.message ? { message: sanitiseText(b.message, 200) } : {}) },
        viewToken: token,
        demo: rt.site.demo.enabled,
      };
      await store.create(o);
      const redirectUrl = await startPayment(rt, o, b.method, value, base);
      return json({ orderId: id, token, redirectUrl });
    }

    const gc = await giftCardFor(rt, b.giftCardCode);
    const ctx = quoteCtx(rt);
    const lines = (b.lines ?? []).slice(0, 50).map((l) => ({ productId: String(l.productId), selection: Object.fromEntries(Object.entries(l.selection ?? {}).map(([k, v]) => [k, sanitiseText(v, 120)])), qty: Math.floor(Number(l.qty)), ...(l.addons ? { addons: l.addons } : {}) }));
    const q = quoteOrder({ lines, ...(b.fulfilment ? { fulfilment: b.fulfilment } : {}), payment: b.payment === 'cod' ? 'cod' : 'online', giftWrap: !!b.giftWrap, ...(gc ? { giftCard: gc } : {}) }, ctx);
    const { errors: addressErrors, address } = validateAddress(rt, b, lang);
    const errors = [...customerErrors, ...addressErrors];
    if (gc === null) errors.push({ field: 'giftCard', message: lang === 'ar' ? 'رمز بطاقة الهدية غير صحيح أو منتهي.' : 'The gift card code is invalid or expired.' });
    if (!q.ok || errors.length || !phone || !b.fulfilment) {
      return json({ errors, lineIssues: q.lines.map((l) => l.issues), fulfilmentIssues: q.fulfilmentIssues, orderIssues: q.orderIssues }, 422);
    }
    const online = b.payment !== 'cod';
    if (online && b.method && rt.site.payments) {
      const allowed = availableMethods(rt.site.locale.currency, rt.site.payments.provider, rt.site.payments.methods);
      if (!allowed.includes(b.method)) return json({ errors: [{ field: 'method', message: lang === 'ar' ? 'طريقة الدفع غير متاحة.' : 'That payment method is not available.' }] }, 422);
    }

    // Stock: hold tracked keys now; untracked items are unlimited.
    if (rt.site.commerce?.stock?.mode === 'tracked') {
      const res = await store.stock.decrement(lines.map((l) => ({ key: `${l.productId}${l.selection.size ? `:${l.selection.size}` : ''}`, qty: l.qty })));
      if (res !== 'ok') return json({ errors: [{ field: 'stock', message: lang === 'ar' ? 'بعض القطع خلصت من المخزون. حدّث السلة.' : 'Some items just sold out. Please update your bag.' }], short: res.short }, 409);
    }

    const f = b.fulfilment;
    const fulfilment: Order['fulfilment'] =
      f.kind === 'delivery'
        ? { kind: 'delivery', zoneId: f.zoneId, zoneName: ctx.fulfilment.delivery?.zones.find((z) => z.id === f.zoneId)?.name ?? { ar: f.zoneId, en: f.zoneId }, address, ...(f.date ? { date: f.date } : {}), ...(f.slotId ? { slotId: f.slotId } : {}) }
        : f.kind === 'shipping'
          ? { kind: 'shipping', country: f.country, address }
          : { kind: 'pickup', branchId: f.branchId, branchName: ctx.fulfilment.pickup?.branches.find((x) => x.id === f.branchId)?.name ?? { ar: f.branchId, en: f.branchId }, ...(f.date ? { date: f.date } : {}) };

    // Delivery slot capacity (site 06).
    if (f.kind === 'delivery' && f.date && f.slotId) {
      const slot = ctx.fulfilment.delivery?.slots?.find((s) => s.id === f.slotId);
      if (slot?.capacity && (await store.reserveSlot(f.date, f.slotId, slot.capacity)) === 'full') {
        return json({ errors: [{ field: 'slot', message: lang === 'ar' ? 'هذه الفترة امتلأت للتو. اختر فترة أخرى.' : 'That slot just filled up. Please choose another.' }] }, 409);
      }
    }

    const id = newOrderId(prefix, today);
    const token = await viewToken(rt.secret, id);
    const paidByCard = q.payable.minor === 0;
    const status: Order['status'] = paidByCard ? 'paid' : online ? 'pending_payment' : 'placed';
    const o: Order = {
      id, siteId: rt.site.id, kind: 'order', createdAt: rt.now().toISOString(), lang,
      customer: { name: sanitiseText(b.customer?.name, 80), phone, ...(b.customer?.email ? { email: sanitiseText(b.customer.email, 120) } : {}) },
      lines: orderLines(rt, lines),
      fulfilment,
      pricing: { subtotal: q.subtotal, shipping: q.shipping, ...(q.codFee ? { codFee: q.codFee } : {}), ...(q.giftWrap ? { giftWrap: q.giftWrap } : {}), ...(q.giftCard ? { giftCard: q.giftCard } : {}), ...(q.vatIncluded ? { vatIncluded: q.vatIncluded } : {}), total: q.total, payable: q.payable },
      payment: { provider: online ? (rt.site.payments?.provider ?? 'mock') : 'cod', ...(b.method ? { method: b.method } : online ? {} : { method: 'cod' as const }), state: online ? (paidByCard ? 'paid' : 'pending') : 'cod' },
      status,
      history: [{ at: rt.now().toISOString(), from: null, to: status, by: 'system' }],
      ...(b.notes ? { notes: sanitiseText(b.notes, rt.data.checkout?.notesMaxLength ?? 300) } : {}),
      ...(b.giftMessage ? { giftMessage: sanitiseText(b.giftMessage, rt.data.checkout?.giftWrap?.cardMaxLength ?? 200) } : {}),
      viewToken: token,
      demo: rt.site.demo.enabled,
    };
    await store.create(o);
    if (q.giftCard) await store.giftCards.debit(q.giftCard.code, q.giftCard.applied, id);

    const view = orderUrl(rt, id, token, lang, base);
    if (!online || paidByCard) {
      await notifyOrder(rt, o, paidByCard ? 'order.paid' : 'order.placed');
      return json({ orderId: id, token, redirectUrl: view });
    }
    const redirectUrl = await startPayment(rt, o, b.method, q.payable, base);
    return json({ orderId: id, token, redirectUrl });
  };
}

/** GET /api/order?o=&t= — the customer's view of their order (token-protected). */
export function orderHandler(rt: Runtime) {
  return async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const id = url.searchParams.get('o') ?? '';
    const t = url.searchParams.get('t') ?? '';
    if (!id || !t || t !== (await viewToken(rt.secret, id))) return json({ error: 'not_found' }, 404);
    const o = await (await rt.orders()).get(id);
    if (!o) return json({ error: 'not_found' }, 404);
    const { viewToken: _v, history, ...rest } = o;
    return json({ ...rest, history: history.map((h) => ({ at: h.at, to: h.to })) });
  };
}

export function stockHandler(rt: Runtime) {
  return async (req: Request): Promise<Response> => {
    const keys = (new URL(req.url).searchParams.get('keys') ?? '').split(',').filter(Boolean).slice(0, 60);
    return json(await (await rt.orders()).stock.get(keys));
  };
}

export function giftCardCheckHandler(rt: Runtime) {
  return async (req: Request): Promise<Response> => {
    const b = (await readBody(req)) as { code?: string } | null;
    if (!b?.code) return json({ error: 'bad_request' }, 400);
    const card = await giftCardFor(rt, b.code);
    if (!card) return json({ valid: false });
    return json({ valid: true, balance: card.balance });
  };
}

/** Issues a gift card once its purchase is paid. Idempotent per order. */
export async function issueGiftCard(rt: Runtime, o: Order): Promise<string | undefined> {
  if (o.kind !== 'gift_card' || !o.giftCardPurchase || o.giftCardPurchase.issuedCode) return o.giftCardPurchase?.issuedCode;
  const cfg = rt.site.commerce?.giftCards;
  const store = await rt.orders();
  const today = zonedNow(rt.site.locale.timeZone, rt.now()).date;
  for (let i = 0; i < 3; i++) {
    const code = giftCardCode(cfg?.codePrefix ?? 'GIFT');
    try {
      await store.giftCards.issue({ code, initial: o.giftCardPurchase.amount, balance: o.giftCardPurchase.amount, issuedAt: rt.now().toISOString(), expiresOn: addMonths(today, cfg?.validityMonths ?? 12), orderId: o.id, recipient: o.giftCardPurchase.recipient, ledger: [] });
      const kv = await rt.kv('orders');
      const cur = await kv.getJSON<Order>(`o/${o.id}.json`);
      if (cur) await kv.setJSON(`o/${o.id}.json`, { ...cur.value, giftCardPurchase: { ...cur.value.giftCardPurchase!, issuedCode: code } }, { onlyIfMatch: cur.etag });
      return code;
    } catch {
      /* collision: try another code */
    }
  }
  return undefined;
}

type Factory = (site: SiteConfig, data: ServerData) => (req: Request, context?: unknown) => Promise<Response>;

const wrap = (make: (rt: Runtime) => (req: Request, context?: unknown) => Promise<Response>): Factory => (site, data) => {
  let rt: Runtime | null = null;
  return async (req, context) => {
    try {
      rt ??= createRuntime(site, data);
      return await make(rt)(req, context);
    } catch (e) {
      console.error(e);
      return json({ error: 'internal' }, 500);
    }
  };
};

export const createQuoteHandler = wrap(quoteHandler);
export const createCheckoutHandler = wrap(checkoutHandler);
export const createOrderHandler = wrap(orderHandler);
export const createStockHandler = wrap(stockHandler);
export const createGiftCardHandler = wrap(giftCardCheckHandler);
export { wrap };

export const countryName = (c: CountryCode) => COUNTRY_INFO[c].name;
