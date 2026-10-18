// Tap Payments (BH, KW, SA, AE, QA, OM). Redirect via transaction.url; only CAPTURED counts as paid.
// Webhook: `hashstring` header = HMAC-SHA256 hex over selected fields, keyed with the secret API key.

import { COUNTRY_INFO, type CurrencyCode, type Money, type PaymentMethodId } from '@aw/core';
import { CAPABILITIES } from '../capabilities.ts';
import { fromProviderAmount, tapHashAmount, toProviderAmount } from '../amount.ts';
import type { PayableOrder, PaymentEvent, PaymentProvider, PaymentState, ProviderDeps, RefundResult, VerifyContext } from '../types.ts';
import { constantTimeEqual, hmacSha256Hex, pick, PaymentError, requestJson, requireEnv, str, WebhookAuthError } from '../util.ts';
import { eventTypeFor, liveGuard, loadAttempt, newAttempt, readRawBody, returnUrlFor, statusFrom, webhookUrl } from './base.ts';

const BASE = 'https://api.tap.company/v2';

const SOURCE_BY_METHOD: Partial<Record<PaymentMethodId, string>> = {
  benefit: 'src_bh.benefit',
  knet: 'src_kw.knet',
  mada: 'src_sa.mada',
  card: 'src_card',
  omannet: 'src_omannet',
  qpay: 'src_qa.qpay',
};

export function mapTapStatus(s: string | undefined): PaymentState {
  switch (s) {
    case 'CAPTURED':
      return 'paid';
    case 'AUTHORIZED':
      return 'authorized';
    case 'INITIATED':
    case 'IN_PROGRESS':
      return 'pending';
    case 'ABANDONED':
    case 'CANCELLED':
    case 'VOID':
      return 'cancelled';
    case 'TIMEDOUT':
      return 'expired';
    default:
      return 'failed'; // FAILED, DECLINED, RESTRICTED, UNKNOWN
  }
}

function splitPhone(e164: string): { country_code: string; number: string } {
  const digits = e164.replace(/^\+/, '');
  const info = Object.values(COUNTRY_INFO).find((c) => digits.startsWith(c.dialCode));
  return info ? { country_code: info.dialCode, number: digits.slice(info.dialCode.length) } : { country_code: '', number: digits };
}

export function buildTapCharge(order: PayableOrder, sessionId: string, deps: ProviderDeps, sourceDefault: string) {
  const [first, ...rest] = order.customer.name.trim().split(/\s+/);
  return {
    amount: toProviderAmount(order.amount, 'tap'),
    currency: order.amount.currency,
    threeDSecure: true,
    save_card: false,
    description: order.description[order.lang].slice(0, 120),
    reference: { transaction: sessionId, order: order.orderId },
    metadata: { sessionId, orderId: order.orderId, purpose: order.purpose },
    receipt: { email: false, sms: false },
    customer: {
      first_name: first || order.customer.name,
      ...(rest.length ? { last_name: rest.join(' ') } : {}),
      ...(order.customer.email ? { email: order.customer.email } : {}),
      phone: splitPhone(order.customer.phone),
    },
    source: { id: (order.method && SOURCE_BY_METHOD[order.method]) || sourceDefault },
    post: { url: webhookUrl(deps, 'tap') },
    redirect: { url: returnUrlFor(order, sessionId) },
  };
}

/** The exact string Tap hashes for charge/refund webhooks. */
export function tapHashString(p: Record<string, unknown>): string {
  const currency = String(p.currency) as CurrencyCode;
  return (
    `x_id${str(p.id) ?? ''}` +
    `x_amount${tapHashAmount(p.amount as number, currency)}` +
    `x_currency${currency}` +
    `x_gateway_reference${str(pick(p, 'reference.gateway')) ?? ''}` +
    `x_payment_reference${str(pick(p, 'reference.payment')) ?? ''}` +
    `x_status${str(p.status) ?? ''}` +
    `x_created${str(pick(p, 'transaction.created')) ?? ''}`
  );
}

export function createTapProvider(deps: ProviderDeps): PaymentProvider {
  const env = () => {
    const e = requireEnv(deps.env, 'TAP_SECRET_KEY');
    liveGuard(deps, 'tap', e.TAP_SECRET_KEY!.startsWith('sk_test_'));
    return { key: e.TAP_SECRET_KEY!, source: deps.env.TAP_SOURCE_ID || 'src_all' };
  };
  const auth = (key: string) => ({ authorization: `Bearer ${key}` });

  async function verifyPayment(sessionId: string, ctx?: VerifyContext) {
    const { key } = env();
    const a = await loadAttempt(deps, sessionId);
    const chargeId = a.providerRef ?? ctx?.returnParams?.tap_id;
    if (!chargeId) throw new PaymentError('No Tap charge id for this session', 'no_ref');
    const r = await requestJson(deps.fetch, `${BASE}/charges/${encodeURIComponent(chargeId)}`, { method: 'GET', headers: auth(key) });
    if (!r.ok) throw new PaymentError(`Tap charge lookup failed (${r.status})`, 'provider_error');
    const state = mapTapStatus(str(pick(r.body, 'status')));
    const amount = fromProviderAmount(pick(r.body, 'amount'), (str(pick(r.body, 'currency')) ?? a.amount.currency) as CurrencyCode, 'tap');
    if (state !== a.state) await deps.attempts.update(sessionId, { state });
    return statusFrom(a, state, amount, deps);
  }

  return {
    name: 'tap',
    capabilities: CAPABILITIES.tap,

    async createPaymentSession(order) {
      const { key, source } = env();
      const attempt = newAttempt(order, 'tap', deps);
      const body = buildTapCharge(order, attempt.sessionId, deps, source);
      const r = await requestJson(deps.fetch, `${BASE}/charges`, { method: 'POST', headers: { ...auth(key), 'idempotency-key': order.idempotencyKey }, body });
      const url = str(pick(r.body, 'transaction.url'));
      const id = str(pick(r.body, 'id'));
      if (!r.ok || !url || !id) throw new PaymentError(`Tap charge creation failed (${r.status})`, 'provider_error');
      attempt.providerRef = id;
      await deps.attempts.put(attempt);
      return { sessionId: attempt.sessionId, redirectUrl: url, providerRef: id };
    },

    verifyPayment,

    async handleWebhook(req): Promise<PaymentEvent> {
      const { key } = env();
      const { text } = await readRawBody(req);
      const payload = JSON.parse(text) as Record<string, unknown>;
      const expected = await hmacSha256Hex(key, tapHashString(payload));
      if (!constantTimeEqual(req.headers.get('hashstring') ?? '', expected)) throw new WebhookAuthError('Tap hashstring mismatch');
      const ref = str(payload.id)!;
      const attempt = await deps.attempts.findByProviderRef('tap', ref);
      if (!attempt) throw new PaymentError(`No attempt for Tap charge ${ref}`, 'unknown_ref');
      const status = await verifyPayment(attempt.sessionId);
      return { eventKey: `tap:${ref}:${str(payload.status)}`, provider: 'tap', type: eventTypeFor(status.state), sessionId: attempt.sessionId, providerRef: ref, authenticity: 'hmac', status, duplicate: false, receivedAt: deps.now().toISOString() };
    },

    async refund(paymentId, amount: Money, opts): Promise<RefundResult> {
      const { key } = env();
      const a = await loadAttempt(deps, paymentId);
      const r = await requestJson(deps.fetch, `${BASE}/refunds`, {
        method: 'POST',
        headers: auth(key),
        body: { charge_id: a.providerRef, amount: toProviderAmount(amount, 'tap'), currency: amount.currency, reason: opts?.reason ?? 'requested_by_customer', post: { url: webhookUrl(deps, 'tap') } },
      });
      const status = str(pick(r.body, 'status'));
      const state: RefundResult['state'] = !r.ok ? 'failed' : status === 'REFUNDED' ? 'succeeded' : status === 'FAILED' ? 'failed' : 'pending';
      return { refundId: str(pick(r.body, 'id')) ?? `rf_${paymentId}`, providerRef: str(pick(r.body, 'id')), state, amount };
    },
  };
}
