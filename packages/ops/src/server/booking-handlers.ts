// HTTP handlers for the booking engine: availability, booking (hold + deposit), booking view.

import { addDays, bookingId as newBookingId, isLocalDate, money, zonedNow, type Lang, type LocalDate } from '@aw/core';
import { parsePhone, phoneErrorMessage } from '@aw/i18n';
import { getProvider, type PaymentStatus } from '@aw/payments';
import type { StatusSource } from '@aw/payments/server';
import { calendarDays, computeDeposit, dayStatus, generateSlots, occupiedInterval, type DayOverride, type Service } from '@aw/booking';
import { kvBookingStore, type Booking, type BookingStore, type DayRecord } from '@aw/booking/server';
import { json, viewToken, type Runtime } from './runtime.ts';

async function bookings(rt: Runtime): Promise<BookingStore> {
  return kvBookingStore(await rt.kv('bookings'));
}

function rules(rt: Runtime) {
  if (!rt.data.booking) throw new Error('This site has no booking rules');
  return rt.data.booking;
}

function service(rt: Runtime, id: string | null): Service | undefined {
  return rt.data.services.find((s) => s.id === id || s.slug === id);
}

function slotsFor(rt: Runtime, svc: Service, date: LocalDate, day: DayRecord, staffId?: string) {
  return generateSlots({
    date,
    service: svc,
    rules: rules(rt),
    hours: rt.data.hours,
    resources: rt.data.resources,
    ledger: day.bookings,
    now: rt.now(),
    tz: rt.site.locale.timeZone,
    ...(day.override ? { override: day.override } : {}),
    ...(staffId ? { staffId } : {}),
  });
}

/**
 * GET /api/availability?service=&date=          → slots on one business day
 * GET /api/availability?service=&from=&days=14 → day statuses for a calendar strip
 * GET /api/availability?service=&next=3        → the next few free starts (home page chips)
 */
export function availabilityHandler(rt: Runtime) {
  return async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const svc = service(rt, url.searchParams.get('service'));
    const staff = url.searchParams.get('staff') ?? undefined;
    const store = await bookings(rt);
    const today = zonedNow(rt.site.locale.timeZone, rt.now()).date;
    const dayGranularity = rt.site.booking?.granularity === 'day';

    const date = url.searchParams.get('date');
    if (date) {
      if (!isLocalDate(date)) return json({ error: 'bad_date' }, 400);
      const day = await store.day(date);
      const status = dayStatus(date, { rules: rules(rt), hours: rt.data.hours, now: rt.now(), tz: rt.site.locale.timeZone, ledger: day.bookings, ...(day.override ? { override: day.override } : {}) });
      if (dayGranularity || !svc) return json({ date, status, slots: [] });
      return json({ date, status, slots: slotsFor(rt, svc, date, day, staff).map((s) => ({ start: s.start, end: s.end, startAt: s.startAt, afterMidnight: s.afterMidnight, resources: s.resources })) });
    }

    const next = Number(url.searchParams.get('next') ?? 0);
    if (next > 0 && svc) {
      const out: Array<{ date: LocalDate; start: number; startAt: string; afterMidnight: boolean }> = [];
      for (let i = 0; i < 7 && out.length < next; i++) {
        const d = addDays(today, i);
        const day = await store.day(d);
        for (const s of slotsFor(rt, svc, d, day, staff)) {
          if (out.length >= next) break;
          if (out.some((o) => o.date === d && Math.abs(o.start - s.start) < 60)) continue;
          out.push({ date: d, start: s.start, startAt: s.startAt, afterMidnight: s.afterMidnight });
        }
      }
      return json({ next: out });
    }

    const from = url.searchParams.get('from');
    const days = Math.min(Number(url.searchParams.get('days') ?? 14), 62);
    const start = from && isLocalDate(from) ? from : today;
    const overrides: Record<LocalDate, DayOverride> = {};
    const ledger: Booking[] = [];
    for (let i = 0; i < days; i++) {
      const d = addDays(start, i);
      const rec = await store.day(d);
      ledger.push(...rec.bookings);
      if (rec.override) overrides[d] = rec.override;
    }
    const cal = calendarDays(start, days, { rules: rules(rt), hours: rt.data.hours, now: rt.now(), tz: rt.site.locale.timeZone, ledger, overrides });
    return json({ days: cal.map((c) => ({ date: c.date, ...c.status })) });
  };
}

interface BookingBody {
  serviceId?: string;
  date?: string;
  start?: number;
  staffId?: string;
  customer?: { name?: string; phone?: string; email?: string };
  answers?: Record<string, string>;
  notes?: string;
  lang?: Lang;
  company_website?: string;
  startedAt?: number;
}

function clean(s: unknown, max: number): string {
  return typeof s === 'string' ? s.replace(/[\u0000-\u001F]/g, ' ').trim().slice(0, max) : '';
}

/** POST /api/booking — hold a slot (re-checked inside the conditional write), then take the deposit. */
export function bookingCreateHandler(rt: Runtime) {
  return async (req: Request): Promise<Response> => {
    let b: BookingBody;
    try {
      b = (await req.json()) as BookingBody;
    } catch {
      return json({ error: 'bad_request' }, 400);
    }
    if (b.company_website) return json({ error: 'rejected' }, 400);
    if (typeof b.startedAt === 'number' && rt.now().getTime() - b.startedAt < 3000) return json({ error: 'too_fast' }, 429);
    const lang: Lang = b.lang === 'en' ? 'en' : 'ar';
    const svc = service(rt, b.serviceId ?? null);
    const errors: Array<{ field: string; message: string }> = [];
    if (!svc || !svc.bookableOnline) errors.push({ field: 'service', message: lang === 'ar' ? 'اختر الخدمة.' : 'Choose a service.' });
    if (!b.date || !isLocalDate(b.date)) errors.push({ field: 'date', message: lang === 'ar' ? 'اختر التاريخ.' : 'Choose a date.' });
    const name = clean(b.customer?.name, 80);
    if (name.length < 2) errors.push({ field: 'name', message: lang === 'ar' ? 'اكتب الاسم.' : 'Enter your name.' });
    const phone = parsePhone(String(b.customer?.phone ?? ''), rt.site.locale.country);
    if (!phone.ok) errors.push({ field: 'phone', message: phoneErrorMessage(phone.error, rt.site.locale.country, lang) });
    if (errors.length || !svc || !b.date || !phone.ok) return json({ errors }, 422);

    const store = await bookings(rt);
    const r = rules(rt);
    const dayGranularity = rt.site.booking?.granularity === 'day';
    const now = rt.now();
    const date = b.date;
    const price = svc.price.amount;
    const deposit = computeDeposit(price, svc.deposit ?? r.deposit);
    const needsDeposit = deposit.minor > 0;
    const status = needsDeposit ? 'pending_payment' : 'confirmed';
    const id = newBookingId(rt.site.booking?.bookingPrefix ?? 'BK', zonedNow(rt.site.locale.timeZone, now).date);
    const token = await viewToken(rt.secret, id);

    // Built from the day's current bookings inside the conditional write, so a concurrent
    // booking can never get the same staff member or room.
    const build = (day: DayRecord): Booking | null => {
      let slot: { start: number; startAt: string; endAt: string; resources: string[] } | undefined;
      if (dayGranularity) {
        const ok = dayStatus(date, { rules: r, hours: rt.data.hours, now, tz: rt.site.locale.timeZone, ledger: day.bookings, ...(day.override ? { override: day.override } : {}) }).bookable;
        if (!ok) return null;
        slot = { start: 0, startAt: `${date}T00:00:00Z`, endAt: `${date}T00:00:00Z`, resources: [] };
      } else {
        slot = slotsFor(rt, svc, date, day, b.staffId).find((s) => s.start === b.start);
        if (!slot) return null;
      }
      const interval = dayGranularity ? { startMin: 0, endMin: 0 } : occupiedInterval(r, slot.start, svc.durationMinutes);
      return {
        id,
        serviceId: svc.id,
        serviceTitle: svc.title,
        businessDate: date,
        ...interval,
        start: slot.startAt,
        end: slot.endAt,
        resources: slot.resources,
        status,
        ...(needsDeposit ? { holdUntil: new Date(now.getTime() + r.holdMinutes * 60_000).toISOString() } : {}),
        customer: { name, phone: phone.e164, ...(b.customer?.email ? { email: clean(b.customer.email, 120) } : {}) },
        answers: Object.fromEntries(Object.entries(b.answers ?? {}).slice(0, 12).map(([k, v]) => [clean(k, 40), clean(v, 300)])),
        price,
        deposit,
        balance: money(price.minor - deposit.minor, price.currency),
        lang,
        history: [{ at: now.toISOString(), from: null, to: status, by: 'system' }],
        viewToken: token,
        createdAt: now.toISOString(),
        demo: rt.site.demo.enabled,
      };
    };
    const held = await store.hold(date, build);
    if (held === 'conflict') {
      return json({ errors: [{ field: 'slot', message: lang === 'ar' ? 'هذا الموعد انحجز للتو، اختر موعداً آخر.' : 'That time was just booked. Please choose another.' }] }, 409);
    }
    const booking = held;
    const deps = await rt.providerDeps();
    const view = `${deps.siteUrl}${lang === 'en' ? '/en' : ''}/booking/?b=${encodeURIComponent(id)}&t=${token}`;
    if (!needsDeposit) return json({ bookingId: id, token, redirectUrl: view });
    const provider = await getProvider(rt.site.payments?.provider ?? 'mock', deps);
    const session = await provider.createPaymentSession({
      orderId: id,
      siteId: rt.site.id,
      purpose: 'deposit',
      amount: deposit,
      description: { ar: `عربون حجز ${id}`, en: `Deposit for booking ${id}` },
      customer: booking.customer,
      lang,
      returnUrl: `${deps.siteUrl}${lang === 'en' ? '/en' : ''}/pay/return/`,
      cancelUrl: `${deps.siteUrl}${lang === 'en' ? '/en' : ''}/book/`,
      idempotencyKey: `${id}:1`,
    });
    await store.patch(id, (x) => ({ ...x, payment: { provider: rt.site.payments?.provider ?? 'mock', sessionId: session.sessionId, state: 'pending' } }));
    return json({ bookingId: id, token, redirectUrl: session.redirectUrl });
  };
}

/** GET /api/booking?b=&t= — the customer's view of their booking. */
export function bookingViewHandler(rt: Runtime) {
  return async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const id = url.searchParams.get('b') ?? '';
    const t = url.searchParams.get('t') ?? '';
    if (!id || t !== (await viewToken(rt.secret, id))) return json({ error: 'not_found' }, 404);
    const b = await (await bookings(rt)).get(id);
    if (!b) return json({ error: 'not_found' }, 404);
    const { viewToken: _v, resources: _r, ...rest } = b;
    return json(rest);
  };
}

export function bookingHandler(rt: Runtime) {
  const create = bookingCreateHandler(rt);
  const view = bookingViewHandler(rt);
  return (req: Request) => (req.method === 'POST' ? create(req) : view(req));
}

/** Deposit payment → confirm; failure or expiry → free the slot. Idempotent. */
export async function applyBookingPayment(rt: Runtime, status: PaymentStatus, _source: StatusSource): Promise<void> {
  const store = await bookings(rt);
  const b = await store.get(status.orderId);
  if (!b) return;
  await store.patch(b.id, (x) => ({ ...x, payment: { ...(x.payment ?? { provider: status.provider }), state: status.state, sessionId: status.sessionId, ...(status.method ? { method: status.method } : {}) } }));
  if ((status.state === 'paid' || status.state === 'authorized') && status.amountMatches && (b.status === 'pending_payment' || b.status === 'held' || b.status === 'expired')) {
    await store.transition(b.id, 'confirmed', 'payment');
    return;
  }
  if ((status.state === 'failed' || status.state === 'cancelled' || status.state === 'expired') && (b.status === 'pending_payment' || b.status === 'held')) {
    await store.transition(b.id, 'expired', 'payment', status.state);
  }
}

export { bookings as bookingStoreFor };
