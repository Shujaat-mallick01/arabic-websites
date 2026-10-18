// /api/owner/* — everything the shop owner does at runtime: orders, bookings, closing a day,
// stock, gift cards, the demo outbox. Auth: demo (open, PII masked) or email OTP (live default).

import { zonedNow, type SiteConfig } from '@aw/core';
import { maskPhone } from '@aw/i18n';
import { TRANSITIONS, type Order, type OrderStatus, type OrderSummary } from '@aw/commerce/server';
import { BOOKING_TRANSITIONS, type Booking } from '@aw/booking/server';
import type { BookingStatus } from '@aw/booking';
import { createRuntime, json, JSON_HEADERS, type Runtime, type ServerData } from './runtime.ts';
import { bookingStoreFor } from './booking-handlers.ts';
import { sampleOrders } from './samples.ts';

const enc = new TextEncoder();
const COOKIE = 'aw_owner';
const SESSION_DAYS = 30;

async function hmac(secret: string, data: string): Promise<string> {
  const k = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode(data))))).replace(/=+$/, '');
}

async function sha256(s: string): Promise<string> {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s)))].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function authMode(rt: Runtime): 'demo' | 'email-otp' | 'supabase' {
  return ((rt.env.OWNER_AUTH as 'demo' | 'email-otp' | 'supabase' | undefined) ?? rt.site.ops?.dashboardAuth ?? 'demo');
}

async function sessionEmail(rt: Runtime, req: Request): Promise<string | null> {
  const raw = (req.headers.get('cookie') ?? '').split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (!raw) return null;
  const [payload, sig] = decodeURIComponent(raw).split('.');
  if (!payload || !sig || sig !== (await hmac(rt.secret, payload))) return null;
  const { email, exp } = JSON.parse(atob(payload)) as { email: string; exp: number };
  if (exp < Date.now() || !rt.data.notifications.ownerEmails.includes(email)) return null;
  return email;
}

function maskOrder(o: Order): Order {
  return { ...o, customer: { ...o.customer, phone: maskPhone(o.customer.phone) as never, ...(o.customer.email ? { email: o.customer.email.replace(/^(.).*(@.*)$/, '$1•••$2') } : {}) } };
}

function maskBooking(b: Booking): Booking {
  return { ...b, customer: { ...b.customer, phone: maskPhone(b.customer.phone) as never } };
}

async function rateLimited(rt: Runtime, key: string, limit: number, windowMin: number): Promise<boolean> {
  const kv = await rt.kv('ops');
  const k = `auth/rl/${await sha256(key)}.json`;
  const now = Date.now();
  const cur = (await kv.getJSON<number[]>(k))?.value ?? [];
  const recent = cur.filter((t) => now - t < windowMin * 60_000);
  if (recent.length >= limit) return true;
  await kv.setJSON(k, [...recent, now]);
  return false;
}

export function ownerHandler(rt: Runtime) {
  return async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const parts = url.pathname.replace(/^\/api\/owner\/?/, '').split('/').filter(Boolean);
    const mode = authMode(rt);
    const demo = mode === 'demo';
    const ip = req.headers.get('x-nf-client-connection-ip') ?? req.headers.get('x-forwarded-for') ?? 'local';
    const body = async <T>() => {
      try {
        return (await req.json()) as T;
      } catch {
        return {} as T;
      }
    };

    // ── auth ──────────────────────────────────────────────────────────
    if (parts[0] === 'auth') {
      if (demo) return json({ ok: true, demo: true });
      if (parts[1] === 'request' && req.method === 'POST') {
        const { email } = await body<{ email?: string }>();
        const e = String(email ?? '').trim().toLowerCase();
        if (await rateLimited(rt, `${e}|${ip}`, 5, 15)) return json({ error: 'rate_limited' }, 429);
        // Same answer whether or not the address is an owner's, so addresses can't be probed.
        if (rt.data.notifications.ownerEmails.includes(e)) {
          const code = String(crypto.getRandomValues(new Uint32Array(1))[0]! % 1_000_000).padStart(6, '0');
          const kv = await rt.kv('ops');
          await kv.setJSON(`auth/otp/${await sha256(e)}.json`, { hash: await sha256(`${code}|${rt.secret}`), exp: Date.now() + 10 * 60_000, tries: 0 });
          await (await rt.mailer()).send({ to: [e], subject: `رمز الدخول: ${code}`, text: `رمز الدخول إلى لوحة الطلبات: ${code}\nصالح لمدة ١٠ دقائق.`, html: `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;font-size:16px">رمز الدخول إلى لوحة الطلبات:<p style="font-size:28px;letter-spacing:6px"><b>${code}</b></p>صالح لمدة ١٠ دقائق.</div>` });
        }
        return json({ ok: true });
      }
      if (parts[1] === 'verify' && req.method === 'POST') {
        const { email, code } = await body<{ email?: string; code?: string }>();
        const e = String(email ?? '').trim().toLowerCase();
        if (await rateLimited(rt, `v|${e}|${ip}`, 5, 15)) return json({ error: 'rate_limited' }, 429);
        const kv = await rt.kv('ops');
        const k = `auth/otp/${await sha256(e)}.json`;
        const rec = (await kv.getJSON<{ hash: string; exp: number; tries: number }>(k))?.value;
        if (!rec || rec.exp < Date.now() || rec.tries >= 5 || rec.hash !== (await sha256(`${String(code ?? '').trim()}|${rt.secret}`))) {
          if (rec) await kv.setJSON(k, { ...rec, tries: rec.tries + 1 });
          return json({ error: 'invalid_code' }, 401);
        }
        await kv.delete(k);
        const payload = btoa(JSON.stringify({ email: e, exp: Date.now() + SESSION_DAYS * 86_400_000 }));
        const cookie = `${COOKIE}=${encodeURIComponent(`${payload}.${await hmac(rt.secret, payload)}`)}; Path=/api/owner; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DAYS * 86_400}`;
        return new Response(JSON.stringify({ ok: true }), { headers: { ...JSON_HEADERS, 'set-cookie': cookie } });
      }
      if (parts[1] === 'logout') return new Response('{}', { headers: { ...JSON_HEADERS, 'set-cookie': `${COOKIE}=; Path=/api/owner; Max-Age=0` } });
      return json({ error: 'not_found' }, 404);
    }

    const who = demo ? 'demo' : await sessionEmail(rt, req);
    if (!who) return json({ error: 'unauthorised', auth: mode }, 401);
    const mask = demo ? maskOrder : (o: Order) => o;
    const store = await rt.orders();
    const today = zonedNow(rt.site.locale.timeZone, rt.now()).date;

    if (parts[0] === 'me') return json({ user: who, demo, auth: mode, tier: 'full', today, bookings: !!rt.data.booking, commerce: rt.data.products.length > 0 });

    // ── orders ────────────────────────────────────────────────────────
    if (parts[0] === 'orders' && !parts[1]) {
      const days = (await store.listDays()).slice(0, 14);
      let list: OrderSummary[] = [];
      for (const d of days) list.push(...(await store.listDay(d)));
      if (demo && rt.site.demo.sampleOrders) list = [...list, ...sampleOrders(rt).map((o) => ({ id: o.id, createdAt: o.createdAt, status: o.status, total: o.pricing.total, customerName: o.customer.name, items: o.lines.reduce((n, l) => n + l.qty, 0), kind: o.kind, demo: true, sample: true }))];
      const status = url.searchParams.get('status');
      if (status) list = list.filter((o) => o.status === status);
      return json({ orders: list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 200) });
    }
    if (parts[0] === 'orders' && parts[1]) {
      const id = decodeURIComponent(parts[1]);
      const sample = demo ? sampleOrders(rt).find((o) => o.id === id) : undefined;
      const o = sample ?? (await store.get(id));
      if (!o) return json({ error: 'not_found' }, 404);
      if (parts[2] === 'transition' && req.method === 'POST') {
        if (sample) return json({ error: 'sample_readonly' }, 409);
        const { to, note } = await body<{ to?: OrderStatus; note?: string }>();
        if (!to || !TRANSITIONS[o.status].includes(to)) return json({ error: 'bad_transition', allowed: TRANSITIONS[o.status] }, 409);
        return json({ order: mask(await store.transition(id, to, 'owner', note ? String(note).slice(0, 200) : undefined)) });
      }
      return json({ order: mask(o), allowed: TRANSITIONS[o.status], sample: !!sample });
    }

    // ── bookings ──────────────────────────────────────────────────────
    if (parts[0] === 'bookings' && rt.data.booking) {
      const bstore = await bookingStoreFor(rt);
      if (!parts[1]) {
        const from = url.searchParams.get('from') ?? today;
        const days = await bstore.days();
        const out: Booking[] = [];
        for (const d of days.filter((x) => x >= from).slice(0, 31)) out.push(...(await bstore.day(d)).bookings);
        return json({ bookings: out.map((b) => (demo ? maskBooking(b) : b)) });
      }
      if (parts[2] === 'transition' && req.method === 'POST') {
        const { to } = await body<{ to?: BookingStatus }>();
        const b = await bstore.get(decodeURIComponent(parts[1]));
        if (!b || !to || !BOOKING_TRANSITIONS[b.status].includes(to)) return json({ error: 'bad_transition' }, 409);
        return json({ booking: await bstore.transition(b.id, to, 'owner') });
      }
    }
    if (parts[0] === 'days' && parts[1] && req.method === 'POST' && rt.data.booking) {
      const { closed, capOverride } = await body<{ closed?: boolean; capOverride?: number | null }>();
      await (await bookingStoreFor(rt)).setDayOverride(parts[1], { ...(closed !== undefined ? { closed: !!closed } : {}), ...(typeof capOverride === 'number' ? { capOverride } : {}) });
      return json({ ok: true });
    }

    // ── stock, gift cards, outbox ─────────────────────────────────────
    if (parts[0] === 'stock') {
      if (req.method === 'POST') {
        const { key, qty } = await body<{ key?: string; qty?: number }>();
        if (!key || typeof qty !== 'number') return json({ error: 'bad_request' }, 400);
        await store.stock.set(key, qty);
        return json({ ok: true });
      }
      const keys = rt.data.products.flatMap((p) => {
        const size = p.options.find((o) => o.kind === 'choice' && o.id === 'size');
        return size && size.kind === 'choice' ? size.choices.map((c) => `${p.id}:${c.id}`) : [p.id];
      });
      return json({ stock: await store.stock.get(keys.slice(0, 400)) });
    }
    if (parts[0] === 'giftcards' && parts[1]) {
      const card = await store.giftCards.check(decodeURIComponent(parts[1]));
      return card ? json({ card }) : json({ error: 'not_found' }, 404);
    }
    if (parts[0] === 'outbox') return json({ items: await (await rt.mailer()).list(50) });
    return json({ error: 'not_found' }, 404);
  };
}

export const createOwnerHandler = (site: SiteConfig, data: ServerData) => {
  let rt: Runtime | null = null;
  return async (req: Request) => {
    try {
      rt ??= createRuntime(site, data);
      return await ownerHandler(rt)(req);
    } catch (e) {
      console.error(e);
      return json({ error: 'internal' }, 500);
    }
  };
};
