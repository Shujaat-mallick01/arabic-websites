// Payment functions for a site: they connect verified payment states to orders (and bookings).

import { createMockCompleteHandler, createPaymentStatusHandler, createWebhookHandler, type PaymentHandlerOptions, type StatusSource } from '@aw/payments/server';
import type { PaymentStatus } from '@aw/payments';
import type { SiteConfig } from '@aw/core';
import { createRuntime, json, viewToken, type Runtime, type ServerData } from './runtime.ts';
import { issueGiftCard } from './commerce-handlers.ts';
import { notifyOrder } from './notify.ts';
import { applyBookingPayment } from './booking-handlers.ts';

export function isBookingId(id: string): boolean {
  return /-B-\d{6}-/.test(id);
}

/** Applies a verified status to whatever it pays for. Idempotent. */
export async function applyStatus(rt: Runtime, status: PaymentStatus, source: StatusSource): Promise<void> {
  if (isBookingId(status.orderId)) {
    await applyBookingPayment(rt, status, source);
    return;
  }
  const store = await rt.orders();
  const existing = await store.get(status.orderId);
  if (!existing) return;
  const { order, changed } = await store.attachPayment(status.orderId, { state: status.state, amountMatches: status.amountMatches, sessionId: status.sessionId, ...(status.method ? { method: status.method } : {}) }, source === 'webhook' ? 'webhook' : 'return');
  if (changed && order.status === 'paid') {
    if (order.kind === 'gift_card') await issueGiftCard(rt, order);
    await notifyOrder(rt, order, 'order.paid');
  }
}

function options(rt: Runtime): PaymentHandlerOptions {
  return {
    deps: () => rt.providerDeps(),
    kv: () => rt.kv('pay'),
    onStatus: (s, src) => applyStatus(rt, s, src),
  };
}

function lazy(site: SiteConfig, data: ServerData, make: (rt: Runtime) => (req: Request, ctx?: unknown) => Promise<Response>) {
  let rt: Runtime | null = null;
  return async (req: Request, ctx?: unknown) => {
    try {
      rt ??= createRuntime(site, data);
      return await make(rt)(req, ctx);
    } catch (e) {
      console.error(e);
      return json({ error: 'internal' }, 500);
    }
  };
}

/** GET /api/pay/status — adds the order (or booking) link for the return page. */
export const createPayStatusFunction = (site: SiteConfig, data: ServerData) =>
  lazy(site, data, (rt) => {
    const inner = createPaymentStatusHandler(options(rt));
    return async (req) => {
      const res = await inner(req);
      if (!res.ok) return res;
      const body = (await res.json()) as { orderId: string; state: string };
      const lang = new URL(req.url).searchParams.get('lang') === 'en' ? '/en' : '';
      const token = await viewToken(rt.secret, body.orderId);
      const page = isBookingId(body.orderId) ? 'booking' : 'order';
      return json({ ...body, orderUrl: `${lang}/${page}/?${page === 'order' ? 'o' : 'b'}=${encodeURIComponent(body.orderId)}&t=${token}` });
    };
  });

export const createPayWebhookFunction = (site: SiteConfig, data: ServerData) => lazy(site, data, (rt) => createWebhookHandler(options(rt)));

export const createPayMockFunction = (site: SiteConfig, data: ServerData) =>
  lazy(site, data, (rt) => {
    const inner = createMockCompleteHandler(options(rt));
    return async (req, ctx) => {
      if (req.method === 'GET') {
        if (rt.mode !== 'mock') return json({ error: 'not_found' }, 404);
        const s = new URL(req.url).searchParams.get('s') ?? '';
        const info = /^ps_[0-9a-z]{20}$/.test(s) ? await mockSessionInfo(rt, s) : null;
        return info ? json(info) : json({ error: 'not_found' }, 404);
      }
      return inner(req, ctx as { waitUntil?: (p: Promise<unknown>) => void });
    };
  });

/** GET /api/pay/session?s= — what the demo gateway page shows (amount, provider label, methods). */
export async function mockSessionInfo(rt: Runtime, sessionId: string) {
  const a = await (await rt.providerDeps()).attempts.get(sessionId);
  if (!a) return null;
  return { amount: a.amount, emulates: a.emulates ?? 'mock', orderId: a.orderId, state: a.state, expiresAt: a.expiresAt };
}
