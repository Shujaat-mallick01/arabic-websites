// Checkout.com (regional fallback for larger clients). Hosted Payments Page on the merchant subdomain.
// Webhook: `Cko-Signature` = HMAC-SHA256 hex of the raw body. Refunds are async (202).

import { COUNTRY_INFO, type CountryCode, type CurrencyCode, type Money, type PaymentMethodId } from '@aw/core';
import { CAPABILITIES } from '../capabilities.ts';
import { fromProviderAmount, toProviderAmount } from '../amount.ts';
import type { PaymentEvent, PaymentProvider, PaymentState, ProviderDeps, RefundResult, VerifyContext } from '../types.ts';
import { constantTimeEqual, hmacSha256Hex, pick, PaymentError, requestJson, requireEnv, str, WebhookAuthError } from '../util.ts';
import { eventTypeFor, liveGuard, loadAttempt, newAttempt, readRawBody, returnUrlFor, statusFrom } from './base.ts';

const METHODS: Partial<Record<PaymentMethodId, string>> = { card: 'card', apple_pay: 'applepay', google_pay: 'googlepay', knet: 'knet', benefit: 'benefit', stc_pay: 'stcpay', qpay: 'qpay' };

export function mapCheckoutStatus(s: string | undefined): PaymentState {
  switch ((s ?? '').toLowerCase()) {
    case 'captured':
    case 'paid':
    case 'payment received':
      return 'paid';
    case 'authorized':
    case 'card verified':
      return 'authorized';
    case 'declined':
      return 'failed';
    case 'canceled':
    case 'voided':
      return 'cancelled';
    case 'expired':
      return 'expired';
    case 'refunded':
      return 'refunded';
    case 'partially refunded':
      return 'partially_refunded';
    default:
      return 'pending';
  }
}

function countryOfPhone(e164: string): CountryCode {
  const digits = e164.replace(/^\+/, '');
  const hit = (Object.entries(COUNTRY_INFO) as Array<[CountryCode, { dialCode: string }]>).find(([, c]) => digits.startsWith(c.dialCode));
  return hit?.[0] ?? 'BH';
}

export function createCheckoutComProvider(deps: ProviderDeps): PaymentProvider {
  const env = () => {
    const e = requireEnv(deps.env, 'CHECKOUT_SECRET_KEY', 'CHECKOUT_API_BASE');
    liveGuard(deps, 'checkout', e.CHECKOUT_SECRET_KEY!.startsWith('sk_sbox_') || e.CHECKOUT_API_BASE!.includes('.sandbox.'));
    return { auth: { authorization: `Bearer ${e.CHECKOUT_SECRET_KEY}` }, base: e.CHECKOUT_API_BASE!.replace(/\/$/, '') };
  };

  async function verifyPayment(sessionId: string, ctx?: VerifyContext) {
    const { auth, base } = env();
    const a = await loadAttempt(deps, sessionId);
    const payId = ctx?.returnParams?.['cko-payment-id'];
    const url = payId ? `${base}/payments/${encodeURIComponent(payId)}` : `${base}/hosted-payments/${encodeURIComponent(a.providerRef ?? '')}`;
    const r = await requestJson(deps.fetch, url, { method: 'GET', headers: auth });
    if (!r.ok) throw new PaymentError(`Checkout.com lookup failed (${r.status})`, 'provider_error');
    const state = mapCheckoutStatus(str(pick(r.body, 'status')));
    const amount = fromProviderAmount(pick(r.body, 'amount') ?? toProviderAmount(a.amount, 'checkout'), (str(pick(r.body, 'currency')) ?? a.amount.currency) as CurrencyCode, 'checkout');
    if (state !== a.state) await deps.attempts.update(sessionId, { state });
    return statusFrom(a, state, amount, deps, payId ? { providerRef: payId } : {});
  }

  return {
    name: 'checkout',
    capabilities: CAPABILITIES.checkout,

    async createPaymentSession(order) {
      const { auth, base } = env();
      const attempt = newAttempt(order, 'checkout', deps);
      const ret = returnUrlFor(order, attempt.sessionId);
      const r = await requestJson(deps.fetch, `${base}/hosted-payments`, {
        method: 'POST',
        headers: { ...auth, 'cko-idempotency-key': order.idempotencyKey },
        body: {
          amount: toProviderAmount(order.amount, 'checkout'),
          currency: order.amount.currency,
          reference: order.orderId,
          description: order.description[order.lang].slice(0, 100),
          customer: { name: order.customer.name, ...(order.customer.email ? { email: order.customer.email } : {}) },
          billing: { address: { country: countryOfPhone(order.customer.phone) } },
          success_url: ret,
          failure_url: ret,
          cancel_url: order.cancelUrl,
          locale: order.lang === 'ar' ? 'ar' : 'en-GB',
          metadata: { sessionId: attempt.sessionId },
          ...(deps.env.CHECKOUT_PROCESSING_CHANNEL_ID ? { processing_channel_id: deps.env.CHECKOUT_PROCESSING_CHANNEL_ID } : {}),
          ...(order.method && METHODS[order.method] ? { allow_payment_methods: [METHODS[order.method]] } : {}),
        },
      });
      const url = str(pick(r.body, '_links.redirect.href'));
      const id = str(pick(r.body, 'id'));
      if (!r.ok || !url || !id) throw new PaymentError(`Checkout.com session failed (${r.status})`, 'provider_error');
      attempt.providerRef = id;
      await deps.attempts.put(attempt);
      return { sessionId: attempt.sessionId, redirectUrl: url, providerRef: id };
    },

    verifyPayment,

    async handleWebhook(req): Promise<PaymentEvent> {
      const key = requireEnv(deps.env, 'CHECKOUT_WEBHOOK_SIGNING_KEY').CHECKOUT_WEBHOOK_SIGNING_KEY!;
      const { bytes, text } = await readRawBody(req);
      const expected = await hmacSha256Hex(key, bytes);
      if (!constantTimeEqual((req.headers.get('cko-signature') ?? '').toLowerCase(), expected)) throw new WebhookAuthError('Checkout.com signature mismatch');
      const payload = JSON.parse(text) as Record<string, unknown>;
      const sessionRef = str(pick(payload, 'data.metadata.sessionId'));
      const payId = str(pick(payload, 'data.id'));
      const attempt = sessionRef ? await deps.attempts.get(sessionRef) : null;
      if (!attempt) throw new PaymentError('No attempt for Checkout.com event', 'unknown_ref');
      const status = await verifyPayment(attempt.sessionId, payId ? { returnParams: { 'cko-payment-id': payId } } : undefined);
      return { eventKey: `checkout:${str(payload.id)}`, provider: 'checkout', type: eventTypeFor(status.state), sessionId: attempt.sessionId, providerRef: payId, authenticity: 'hmac', status, duplicate: false, receivedAt: deps.now().toISOString() };
    },

    async refund(paymentId, amount: Money, opts): Promise<RefundResult> {
      const { auth, base } = env();
      const a = await loadAttempt(deps, paymentId);
      const payId = a.providerRef;
      const r = await requestJson(deps.fetch, `${base}/payments/${encodeURIComponent(payId ?? '')}/refunds`, {
        method: 'POST',
        headers: { ...auth, ...(opts?.idempotencyKey ? { 'cko-idempotency-key': opts.idempotencyKey } : {}) },
        body: { amount: toProviderAmount(amount, 'checkout'), reference: `${a.orderId}-refund` },
      });
      // 202 Accepted: the refund completes later and arrives as a webhook.
      return { refundId: str(pick(r.body, 'action_id')) ?? `rf_${paymentId}`, providerRef: str(pick(r.body, 'action_id')), state: r.status === 202 || r.ok ? 'pending' : 'failed', amount };
    },
  };
}
