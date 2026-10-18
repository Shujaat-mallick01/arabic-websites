import { describe, expect, it } from 'vitest';
import { fileURLToPath } from 'node:url';
import { memoryKv, type KvStore } from '@aw/core/server';
import { defineSite, money, type SiteConfig } from '@aw/core';
import { resolvePreset } from '@aw/presets';
import { buildServerData } from '@aw/content/server-data';
import site02 from '../../../sites/02-noha-modest/site.config.ts';
import {
  applyStatus,
  bookingHandler,
  checkoutHandler,
  createRuntime,
  orderHandler,
  ownerHandler,
  quoteHandler,
  type Runtime,
  type ServerData,
} from '../src/server/index.ts';
import { createMockCompleteHandler, createPaymentStatusHandler, createWebhookHandler } from '@aw/payments/server';

const dir02 = fileURLToPath(new URL('../../../sites/02-noha-modest', import.meta.url));
const data02 = buildServerData(dir02, site02, resolvePreset(site02)) as unknown as ServerData;
const SITE = 'https://demo.example';
// Sunday 18 October 2026, 10:00 in Bahrain.
const NOW = new Date('2026-10-18T07:00:00Z');

function rig(site: SiteConfig = site02, data: ServerData = data02, env: Record<string, string> = {}) {
  const stores = new Map<string, KvStore>();
  const kvFactory = async (name: string) => {
    if (!stores.has(name)) stores.set(name, memoryKv());
    return stores.get(name)!;
  };
  let rt!: Runtime;
  let webhook: (req: Request) => Promise<Response>;
  const fetchFn = (async (url: RequestInfo | URL, init?: RequestInit) => webhook(new Request(String(url), init))) as typeof fetch;
  rt = createRuntime(site, data, { env: { URL: SITE, ...env }, now: () => NOW, kvFactory, fetch: fetchFn });
  const payOpts = { deps: () => rt.providerDeps(), kv: () => rt.kv('pay'), onStatus: (s: Parameters<typeof applyStatus>[1], src: Parameters<typeof applyStatus>[2]) => applyStatus(rt, s, src) };
  webhook = createWebhookHandler(payOpts);
  const post = (h: (r: Request) => Promise<Response>, path: string, body: unknown) => h(new Request(`${SITE}${path}`, { method: 'POST', body: JSON.stringify(body) }));
  return { rt, post, payOpts };
}

const robe = data02.products.find((p) => p.slug === 'ghaima-home-robe')!;
const sized = robe;
const line = { productId: robe.id, selection: { size: 'm', color: 'grey' }, qty: 1 };
const customer = { name: 'مريم علي', phone: '36001234' };
const address = { area: 'السيف', block: '428', road: '2832', building: '2425' };
const started = NOW.getTime() - 60_000;

describe('quote and checkout (site 02)', () => {
  it('quotes with server prices and the free-delivery gap', async () => {
    const { rt, post } = rig();
    const res = await post(quoteHandler(rt), '/api/quote', { lines: [line], fulfilment: { kind: 'delivery', zoneId: 'capital' } });
    const q = await res.json();
    expect(q.ok).toBe(true);
    expect(q.subtotal).toEqual(money(14500, 'BHD'));
    expect(q.shipping).toEqual(money(1500, 'BHD'));
    expect(q.freeShippingGap).toEqual(money(10500, 'BHD'));
    expect(q.codOffered).toBe(true);
  });

  it('places a cash-on-delivery order and emails the owner (outbox)', async () => {
    const { rt, post } = rig();
    const res = await post(checkoutHandler(rt), '/api/checkout', { lines: [line], fulfilment: { kind: 'delivery', zoneId: 'capital' }, address, customer, payment: 'cod', lang: 'ar', startedAt: started });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.orderId).toMatch(/^DR-261018-/);
    expect(body.redirectUrl).toContain('/order/?o=');
    const o = await (await rt.orders()).get(body.orderId);
    expect(o).toMatchObject({ status: 'placed', payment: { provider: 'cod', state: 'cod' }, pricing: { total: money(16500, 'BHD') } });
    const outbox = await (await rt.mailer()).list();
    expect(outbox[0]?.subject).toContain(body.orderId);
  });

  it('rejects client-side tampering: prices come from the server', async () => {
    const { rt, post } = rig();
    const res = await post(checkoutHandler(rt), '/api/checkout', { lines: [{ ...line, unit: { minor: 1, currency: 'BHD' } }], fulfilment: { kind: 'delivery', zoneId: 'capital' }, address, customer, payment: 'cod', startedAt: started });
    const o = await (await rt.orders()).get((await res.json()).orderId);
    expect(o?.lines[0]?.unit).toEqual(money(14500, 'BHD'));
  });

  it('explains exactly what to fix', async () => {
    const { rt, post } = rig();
    const res = await post(checkoutHandler(rt), '/api/checkout', { lines: [{ productId: sized.id, selection: {}, qty: 1 }], fulfilment: { kind: 'delivery', zoneId: 'capital' }, address: {}, customer: { name: 'م', phone: '3600123' }, payment: 'online', lang: 'ar', startedAt: started });
    expect(res.status).toBe(422);
    const body = await res.json();
    const messages = body.errors.map((e: { message: string }) => e.message).join(' | ');
    expect(messages).toContain('رقم الجوال البحريني ٨ أرقام، والرقم المكتوب فيه ٧ أرقام');
    expect(messages).toContain('اكتب المجمع.');
    expect(body.lineIssues[0].map((i: { code: string }) => i.code)).toEqual(expect.arrayContaining(['choice_required']));
  });

  it('blocks bots: honeypot and time trap', async () => {
    const { rt, post } = rig();
    expect((await post(checkoutHandler(rt), '/api/checkout', { company_website: 'x' })).status).toBe(400);
    expect((await post(checkoutHandler(rt), '/api/checkout', { lines: [line], startedAt: NOW.getTime() - 500 })).status).toBe(429);
  });

  it('refuses cash on delivery for GCC shipping', async () => {
    const { rt, post } = rig();
    const res = await post(checkoutHandler(rt), '/api/checkout', { lines: [line], fulfilment: { kind: 'shipping', country: 'KW' }, address: { city: 'السالمية', line1: 'قطعة 5 شارع 12' }, customer: { name: 'دانة', phone: '+96555001234' }, payment: 'cod', startedAt: started });
    expect(res.status).toBe(422);
    expect((await res.json()).orderIssues).toContainEqual({ code: 'cod_unavailable', reason: 'scope' });
  });
});

describe('online payment end to end (mock gateway)', () => {
  it('checkout → mock success → webhook → paid, and the order page works with its token only', async () => {
    const { rt, post, payOpts } = rig();
    const res = await post(checkoutHandler(rt), '/api/checkout', { lines: [line], fulfilment: { kind: 'shipping', country: 'KW' }, address: { city: 'السالمية', line1: 'قطعة 5 شارع 12' }, customer: { name: 'دانة', phone: '+96555001234' }, payment: 'online', method: 'card', lang: 'en', startedAt: started });
    const { orderId, token, redirectUrl } = await res.json();
    expect(redirectUrl).toMatch(/\/pay\/mock\/\?s=ps_/);
    const s = new URL(redirectUrl).searchParams.get('s')!;
    expect((await (await rt.orders()).get(orderId))?.status).toBe('pending_payment');

    await createMockCompleteHandler(payOpts)(new Request(`${SITE}/api/pay/mock/complete`, { method: 'POST', body: JSON.stringify({ s, outcome: 'success', webhook: 'twice' }) }));
    const o = await (await rt.orders()).get(orderId);
    expect(o?.status).toBe('paid');
    expect(o?.history.map((h) => h.to)).toEqual(['pending_payment', 'paid']);

    const status = await (await createPaymentStatusHandler(payOpts)(new Request(`${SITE}/api/pay/status?s=${s}`))).json();
    expect(status.state).toBe('paid');

    const view = await orderHandler(rt)(new Request(`${SITE}/api/order?o=${orderId}&t=${token}`));
    expect(view.status).toBe(200);
    expect((await view.json()).viewToken).toBeUndefined();
    expect((await orderHandler(rt)(new Request(`${SITE}/api/order?o=${orderId}&t=0000`))).status).toBe(404);
  });

  it('gift card purchase → paid → issued → covers a later order', async () => {
    const { rt, post, payOpts } = rig();
    const res = await post(checkoutHandler(rt), '/api/checkout', { kind: 'gift_card', amount: 50_000, recipient: 'نورة', customer, lang: 'ar', startedAt: started });
    const { orderId, redirectUrl } = await res.json();
    const s = new URL(redirectUrl).searchParams.get('s')!;
    await createMockCompleteHandler(payOpts)(new Request(`${SITE}/x`, { method: 'POST', body: JSON.stringify({ s, outcome: 'success' }) }));
    const o = await (await rt.orders()).get(orderId);
    const code = o?.giftCardPurchase?.issuedCode;
    expect(code).toMatch(/^DRS-/);
    const res2 = await post(checkoutHandler(rt), '/api/checkout', { lines: [line], fulfilment: { kind: 'delivery', zoneId: 'capital' }, address, customer, payment: 'online', giftCardCode: code, startedAt: started });
    const b2 = await res2.json();
    expect(b2.redirectUrl).toContain('/order/?o=');
    const o2 = await (await rt.orders()).get(b2.orderId);
    expect(o2).toMatchObject({ status: 'paid', pricing: { payable: money(0, 'BHD'), giftCard: { applied: money(16000, 'BHD') } } });
    expect((await (await rt.orders()).giftCards.check(code!))?.balance).toEqual(money(34000, 'BHD'));
  });
});

describe('owner dashboard (demo)', () => {
  it('lists sample and real orders with masked phones and enforces the state machine', async () => {
    const { rt, post } = rig();
    const placed = await (await post(checkoutHandler(rt), '/api/checkout', { lines: [line], fulfilment: { kind: 'delivery', zoneId: 'capital' }, address, customer, payment: 'cod', startedAt: started })).json();
    const owner = ownerHandler(rt);
    const list = await (await owner(new Request(`${SITE}/api/owner/orders`))).json();
    expect(list.orders.length).toBeGreaterThan(10);
    expect(list.orders.some((o: { sample?: boolean }) => o.sample)).toBe(true);
    const detail = await (await owner(new Request(`${SITE}/api/owner/orders/${placed.orderId}`))).json();
    expect(detail.order.customer.phone).toBe('+973 3••• ••34');
    expect(detail.allowed).toContain('confirmed');
    const bad = await owner(new Request(`${SITE}/api/owner/orders/${placed.orderId}/transition`, { method: 'POST', body: JSON.stringify({ to: 'shipped' }) }));
    expect(bad.status).toBe(409);
    const ok = await owner(new Request(`${SITE}/api/owner/orders/${placed.orderId}/transition`, { method: 'POST', body: JSON.stringify({ to: 'confirmed' }) }));
    expect((await ok.json()).order.status).toBe('confirmed');
  });

  it('requires an emailed code when OWNER_AUTH=email-otp', async () => {
    const { rt } = rig(site02, data02, { OWNER_AUTH: 'email-otp' });
    const owner = ownerHandler(rt);
    expect((await owner(new Request(`${SITE}/api/owner/orders`))).status).toBe(401);
    await owner(new Request(`${SITE}/api/owner/auth/request`, { method: 'POST', body: JSON.stringify({ email: 'owner@dareesha.example' }) }));
    const mail = (await (await rt.mailer()).list())[0]!;
    const code = /(\d{6})/.exec(mail.subject)![1]!;
    expect((await owner(new Request(`${SITE}/api/owner/auth/verify`, { method: 'POST', body: JSON.stringify({ email: 'owner@dareesha.example', code: '000000' }) }))).status).toBe(401);
    const res = await owner(new Request(`${SITE}/api/owner/auth/verify`, { method: 'POST', body: JSON.stringify({ email: 'owner@dareesha.example', code }) }));
    const cookie = res.headers.get('set-cookie')!.split(';')[0]!;
    expect((await owner(new Request(`${SITE}/api/owner/orders`, { headers: { cookie } }))).status).toBe(200);
  });
});

describe('bookings', () => {
  const salon = defineSite({
    ...(site02 as never as Parameters<typeof defineSite>[0]),
    id: '10',
    slug: 'jalwa',
    preset: { primary: 'booking.full', niche: 'beauty' },
    locale: { country: 'SA', currency: 'SAR', timeZone: 'Asia/Riyadh', dialect: 'hijazi', audience: 'women', numberingSystem: 'latn' },
    features: { resources: true },
    booking: { bookingPrefix: 'JL', granularity: 'slot', resourceModel: 'staff+rooms', staffChoice: 'optional' },
    commerce: undefined,
    payments: { provider: 'moyasar', methods: ['mada', 'card'], cod: false, primary: 'online' },
  });
  const every = [{ open: '14:00', close: '02:00' }];
  const data: ServerData = {
    siteId: '10',
    currency: 'SAR',
    products: [],
    services: [{ id: 'evening', slug: 'evening', title: { ar: 'مكياج سهرة', en: 'Evening makeup' }, summary: { ar: '', en: '' }, category: 'makeup', durationMinutes: 60, price: { kind: 'fixed', amount: money(45000, 'SAR') }, requires: [{ kind: 'staff', skill: 'makeup' }], bookableOnline: true }],
    resources: [{ id: 'reem', kind: 'staff', name: { ar: 'ريم', en: 'Reem' }, capacity: 1, skills: ['makeup'], daysOff: [], active: true }],
    hours: { weekly: { sat: every, sun: every, mon: every, tue: every, wed: every, thu: every, fri: every }, seasons: [], exceptions: [] },
    fulfilment: null,
    checkout: null,
    booking: { slotStepMinutes: 15, lead: { minMinutes: 120 }, horizonDays: 45, buffers: { beforeMinutes: 0, afterMinutes: 10 }, blackouts: [], fullDates: [], windows: [], deposit: { kind: 'percent', bps: 3000, min: money(5000, 'SAR'), roundUpTo: 100 }, cancellation: { freeUntilHours: 24, depositRefundable: false }, holdMinutes: 15 },
    general: { name: { ar: 'جلوة', en: 'Jalwa' } },
    contact: {},
    notifications: { ownerEmails: [], notifyOn: [] },
    giftCardDenominations: [],
  };

  it('lets exactly one of ten simultaneous bookings take the last slot', async () => {
    const { rt } = rig(salon, data);
    const h = bookingHandler(rt);
    const body = (i: number) => JSON.stringify({ serviceId: 'evening', date: '2026-10-20', start: 18 * 60, customer: { name: `عميلة ${i}`, phone: `05512345${String(i).padStart(2, '0')}` }, startedAt: started });
    const results = await Promise.all(Array.from({ length: 10 }, (_, i) => h(new Request(`${SITE}/api/booking`, { method: 'POST', body: body(i) }))));
    expect(results.filter((r) => r.status === 200)).toHaveLength(1);
    expect(results.filter((r) => r.status === 409)).toHaveLength(9);
  });

  it('takes a 30% deposit rounded up and confirms on payment', async () => {
    const { rt, payOpts } = rig(salon, data);
    const res = await bookingHandler(rt)(new Request(`${SITE}/api/booking`, { method: 'POST', body: JSON.stringify({ serviceId: 'evening', date: '2026-10-20', start: 21 * 60 + 30, customer: { name: 'رهف', phone: '0551234567' }, lang: 'ar', startedAt: started }) }));
    const { bookingId, token, redirectUrl } = await res.json();
    expect(bookingId).toMatch(/^JL-B-261018-/);
    const s = new URL(redirectUrl).searchParams.get('s')!;
    await createMockCompleteHandler(payOpts)(new Request(`${SITE}/x`, { method: 'POST', body: JSON.stringify({ s, outcome: 'success' }) }));
    const view = await (await bookingHandler(rt)(new Request(`${SITE}/api/booking?b=${bookingId}&t=${token}`))).json();
    expect(view).toMatchObject({ status: 'confirmed', deposit: money(13500, 'SAR'), balance: money(31500, 'SAR') });
  });
});
