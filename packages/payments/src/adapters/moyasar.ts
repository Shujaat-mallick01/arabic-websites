// Moyasar (Saudi merchants). Hosted invoice → redirect. Amounts in minor units.
// Webhook: shared `secret_token` in the JSON body (no HMAC) + `live` flag check, then re-fetch.

import type { CurrencyCode, Money } from '@aw/core';
import { CAPABILITIES } from '../capabilities.ts';
import { fromProviderAmount, toProviderAmount } from '../amount.ts';
import type { PaymentEvent, PaymentProvider, PaymentState, ProviderDeps, RefundResult } from '../types.ts';
import { basicAuth, constantTimeEqual, pick, PaymentError, requestJson, requireEnv, str, WebhookAuthError } from '../util.ts';
import { eventTypeFor, liveGuard, loadAttempt, newAttempt, readRawBody, returnUrlFor, statusFrom, webhookUrl } from './base.ts';

const BASE = 'https://api.moyasar.com/v1';

export function mapMoyasarInvoiceStatus(s: string | undefined): PaymentState {
  switch (s) {
    case 'paid':
      return 'paid';
    case 'initiated':
    case 'on_hold':
      return 'pending';
    case 'failed':
      return 'failed';
    case 'canceled':
    case 'voided':
      return 'cancelled';
    case 'expired':
      return 'expired';
    case 'refunded':
      return 'refunded';
    default:
      return 'pending';
  }
}

export function createMoyasarProvider(deps: ProviderDeps): PaymentProvider {
  const env = () => {
    const e = requireEnv(deps.env, 'MOYASAR_SECRET_KEY');
    liveGuard(deps, 'moyasar', e.MOYASAR_SECRET_KEY!.startsWith('sk_test_'));
    return { auth: { authorization: basicAuth(e.MOYASAR_SECRET_KEY!, '') } };
  };

  async function fetchInvoice(id: string) {
    const r = await requestJson(deps.fetch, `${BASE}/invoices/${encodeURIComponent(id)}`, { method: 'GET', headers: env().auth });
    if (!r.ok) throw new PaymentError(`Moyasar invoice lookup failed (${r.status})`, 'provider_error');
    return r.body;
  }

  async function verifyPayment(sessionId: string) {
    const a = await loadAttempt(deps, sessionId);
    if (!a.providerRef) throw new PaymentError('No Moyasar invoice id', 'no_ref');
    const inv = await fetchInvoice(a.providerRef);
    const state = mapMoyasarInvoiceStatus(str(pick(inv, 'status')));
    const amount = fromProviderAmount(pick(inv, 'amount'), (String(pick(inv, 'currency') ?? a.amount.currency).toUpperCase()) as CurrencyCode, 'moyasar');
    if (state !== a.state) await deps.attempts.update(sessionId, { state });
    return statusFrom(a, state, amount, deps);
  }

  return {
    name: 'moyasar',
    capabilities: CAPABILITIES.moyasar,

    async createPaymentSession(order) {
      const { auth } = env();
      const attempt = newAttempt(order, 'moyasar', deps);
      const r = await requestJson(deps.fetch, `${BASE}/invoices`, {
        method: 'POST',
        headers: auth,
        body: {
          amount: toProviderAmount(order.amount, 'moyasar'),
          currency: order.amount.currency,
          description: order.description[order.lang].slice(0, 120),
          callback_url: webhookUrl(deps, 'moyasar'),
          success_url: returnUrlFor(order, attempt.sessionId),
          back_url: order.cancelUrl,
          metadata: { sessionId: attempt.sessionId, orderId: order.orderId },
        },
      });
      const url = str(pick(r.body, 'url'));
      const id = str(pick(r.body, 'id'));
      if (!r.ok || !url || !id) throw new PaymentError(`Moyasar invoice creation failed (${r.status})`, 'provider_error');
      attempt.providerRef = id;
      await deps.attempts.put(attempt);
      return { sessionId: attempt.sessionId, redirectUrl: url, providerRef: id };
    },

    verifyPayment,

    async handleWebhook(req): Promise<PaymentEvent> {
      const secret = requireEnv(deps.env, 'MOYASAR_WEBHOOK_SECRET_TOKEN').MOYASAR_WEBHOOK_SECRET_TOKEN!;
      const { text } = await readRawBody(req);
      const payload = JSON.parse(text) as Record<string, unknown>;
      if (!constantTimeEqual(str(payload.secret_token) ?? '', secret)) throw new WebhookAuthError('Moyasar secret_token mismatch');
      if (deps.mode === 'live' && payload.live !== true) throw new WebhookAuthError('Moyasar test event sent to a live site');
      const invoiceId = str(pick(payload, 'data.invoice_id'));
      const sessionRef = str(pick(payload, 'data.metadata.sessionId'));
      const attempt = (sessionRef ? await deps.attempts.get(sessionRef) : null) ?? (invoiceId ? await deps.attempts.findByProviderRef('moyasar', invoiceId) : null);
      if (!attempt) throw new PaymentError('No attempt for Moyasar event', 'unknown_ref');
      const status = await verifyPayment(attempt.sessionId);
      return { eventKey: `moyasar:${str(payload.id)}`, provider: 'moyasar', type: eventTypeFor(status.state), sessionId: attempt.sessionId, providerRef: attempt.providerRef, authenticity: 'shared-secret', status, duplicate: false, receivedAt: deps.now().toISOString() };
    },

    async refund(paymentId, amount: Money): Promise<RefundResult> {
      const { auth } = env();
      const a = await loadAttempt(deps, paymentId);
      const inv = await fetchInvoice(a.providerRef!);
      const payments = (pick(inv, 'payments') as Array<Record<string, unknown>> | undefined) ?? [];
      const paid = payments.find((p) => p.status === 'paid' || p.status === 'captured');
      if (!paid) return { refundId: `rf_${paymentId}`, state: 'failed', amount };
      const r = await requestJson(deps.fetch, `${BASE}/payments/${encodeURIComponent(String(paid.id))}/refund`, { method: 'POST', headers: auth, body: { amount: toProviderAmount(amount, 'moyasar') } });
      return { refundId: `rf_${String(paid.id)}`, providerRef: String(paid.id), state: r.ok ? 'succeeded' : 'failed', amount };
    },
  };
}
