// PayTabs (regional hosts). Hosted Payment Page; query by tran_ref.
// Callback: `Signature` header = HMAC-SHA256 hex of the raw body, keyed with the server key.

import type { CurrencyCode, Money, PaymentMethodId } from '@aw/core';
import { CAPABILITIES } from '../capabilities.ts';
import { fromProviderAmount, toProviderAmount } from '../amount.ts';
import type { PaymentEvent, PaymentProvider, PaymentState, ProviderDeps, RefundResult, VerifyContext } from '../types.ts';
import { constantTimeEqual, hmacSha256Hex, pick, PaymentConfigError, PaymentError, requestJson, requireEnv, str, WebhookAuthError } from '../util.ts';
import { eventTypeFor, loadAttempt, newAttempt, readRawBody, returnUrlFor, statusFrom, webhookUrl } from './base.ts';

export const PAYTABS_HOSTS: Record<string, string> = {
  sa: 'https://secure.paytabs.sa',
  ae: 'https://secure.paytabs.com',
  eg: 'https://secure-egypt.paytabs.com',
  om: 'https://secure-oman.paytabs.com',
  jo: 'https://secure-jordan.paytabs.com',
  kw: 'https://secure-kuwait.paytabs.com',
  iq: 'https://secure-iraq.paytabs.com',
  ma: 'https://secure-morocco.paytabs.com',
  qa: 'https://secure-doha.paytabs.com',
  global: 'https://secure-global.paytabs.com',
};

const METHODS: Partial<Record<PaymentMethodId, string>> = { card: 'creditcard', mada: 'mada', apple_pay: 'applepay', knet: 'knet', stc_pay: 'stcpay', omannet: 'omannet' };

export function mapPayTabsStatus(s: string | undefined): PaymentState {
  switch (s) {
    case 'A':
      return 'paid';
    case 'H':
    case 'P':
      return 'pending';
    case 'C':
    case 'V':
      return 'cancelled';
    case 'X':
      return 'expired';
    default:
      return 'failed'; // D, E
  }
}

export function createPayTabsProvider(deps: ProviderDeps): PaymentProvider {
  const env = () => {
    const e = requireEnv(deps.env, 'PAYTABS_PROFILE_ID', 'PAYTABS_SERVER_KEY', 'PAYTABS_REGION');
    const host = PAYTABS_HOSTS[e.PAYTABS_REGION!];
    if (!host) throw new PaymentConfigError(`Unknown PAYTABS_REGION "${e.PAYTABS_REGION}"`);
    // Keys don't reveal test vs live, so live mode needs an explicit confirmation.
    if (deps.mode === 'live' && deps.env.PAYTABS_PROFILE_KIND !== 'live') {
      throw new PaymentConfigError('paytabs: set PAYTABS_PROFILE_KIND=live to confirm a live profile');
    }
    return { profileId: Number(e.PAYTABS_PROFILE_ID), key: e.PAYTABS_SERVER_KEY!, host };
  };

  async function query(tranRef: string) {
    const { profileId, key, host } = env();
    const r = await requestJson(deps.fetch, `${host}/payment/query`, { method: 'POST', headers: { authorization: key }, body: { profile_id: profileId, tran_ref: tranRef } });
    if (!r.ok) throw new PaymentError(`PayTabs query failed (${r.status})`, 'provider_error');
    return r.body;
  }

  async function verifyPayment(sessionId: string, ctx?: VerifyContext) {
    const a = await loadAttempt(deps, sessionId);
    const ref = a.providerRef ?? ctx?.returnParams?.tranRef ?? ctx?.returnParams?.tran_ref;
    if (!ref) throw new PaymentError('No PayTabs tran_ref', 'no_ref');
    const body = await query(ref);
    const state = mapPayTabsStatus(str(pick(body, 'payment_result.response_status')));
    const amount = fromProviderAmount(pick(body, 'cart_amount'), (str(pick(body, 'cart_currency')) ?? a.amount.currency) as CurrencyCode, 'paytabs');
    if (state !== a.state) await deps.attempts.update(sessionId, { state });
    return statusFrom(a, state, amount, deps);
  }

  return {
    name: 'paytabs',
    capabilities: CAPABILITIES.paytabs,

    async createPaymentSession(order) {
      const { profileId, key, host } = env();
      const attempt = newAttempt(order, 'paytabs', deps);
      const r = await requestJson(deps.fetch, `${host}/payment/request`, {
        method: 'POST',
        headers: { authorization: key },
        body: {
          profile_id: profileId,
          tran_type: 'sale',
          tran_class: 'ecom',
          cart_id: attempt.sessionId,
          cart_description: order.description[order.lang].slice(0, 128),
          cart_currency: order.amount.currency,
          cart_amount: toProviderAmount(order.amount, 'paytabs'),
          callback: webhookUrl(deps, 'paytabs'),
          return: returnUrlFor(order, attempt.sessionId),
          hide_shipping: true,
          paypage_lang: order.lang,
          customer_details: { name: order.customer.name, phone: order.customer.phone, ...(order.customer.email ? { email: order.customer.email } : {}) },
          ...(order.method && METHODS[order.method] ? { payment_methods: [METHODS[order.method]] } : {}),
        },
      });
      const url = str(pick(r.body, 'redirect_url'));
      const ref = str(pick(r.body, 'tran_ref'));
      if (!r.ok || !url || !ref) throw new PaymentError(`PayTabs payment request failed (${r.status})`, 'provider_error');
      attempt.providerRef = ref;
      await deps.attempts.put(attempt);
      return { sessionId: attempt.sessionId, redirectUrl: url, providerRef: ref };
    },

    verifyPayment,

    async handleWebhook(req): Promise<PaymentEvent> {
      const { key } = env();
      const { bytes, text } = await readRawBody(req);
      const expected = await hmacSha256Hex(key, bytes);
      if (!constantTimeEqual((req.headers.get('signature') ?? '').toLowerCase(), expected)) throw new WebhookAuthError('PayTabs signature mismatch');
      const payload = JSON.parse(text) as Record<string, unknown>;
      const ref = str(payload.tran_ref)!;
      const attempt = (await deps.attempts.findByProviderRef('paytabs', ref)) ?? (str(payload.cart_id) ? await deps.attempts.get(str(payload.cart_id)!) : null);
      if (!attempt) throw new PaymentError(`No attempt for PayTabs ${ref}`, 'unknown_ref');
      const status = await verifyPayment(attempt.sessionId);
      return { eventKey: `paytabs:${ref}:${str(pick(payload, 'payment_result.response_status'))}`, provider: 'paytabs', type: eventTypeFor(status.state), sessionId: attempt.sessionId, providerRef: ref, authenticity: 'hmac', status, duplicate: false, receivedAt: deps.now().toISOString() };
    },

    async refund(paymentId, amount: Money, opts): Promise<RefundResult> {
      const { profileId, key, host } = env();
      const a = await loadAttempt(deps, paymentId);
      const r = await requestJson(deps.fetch, `${host}/payment/request`, {
        method: 'POST',
        headers: { authorization: key },
        body: { profile_id: profileId, tran_type: 'refund', tran_class: 'ecom', cart_id: `${paymentId}-r`, cart_description: opts?.reason ?? 'Refund', cart_currency: amount.currency, cart_amount: toProviderAmount(amount, 'paytabs'), tran_ref: a.providerRef },
      });
      const ok = r.ok && str(pick(r.body, 'payment_result.response_status')) === 'A';
      return { refundId: str(pick(r.body, 'tran_ref')) ?? `rf_${paymentId}`, providerRef: str(pick(r.body, 'tran_ref')), state: ok ? 'succeeded' : 'failed', amount };
    },
  };
}
