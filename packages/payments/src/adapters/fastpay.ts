// FastPay (Iraq, IQD only). Redirect to the FastPay page; verify with the Validate API.
// The IPN is unsigned and success-only: it is only a trigger to call Validate.

import type { E164, Money } from '@aw/core';
import { CAPABILITIES } from '../capabilities.ts';
import { fromProviderAmount, toProviderAmount } from '../amount.ts';
import type { PaymentEvent, PaymentProvider, ProviderDeps, RefundResult } from '../types.ts';
import { pick, PaymentError, requestJson, requireEnv, str } from '../util.ts';
import { eventTypeFor, liveGuard, loadAttempt, newAttempt, readRawBody, returnUrlFor, statusFrom, webhookUrl } from './base.ts';

export const FASTPAY_HOSTS = { staging: 'https://staging-apigw-merchant.fast-pay.iq', production: 'https://apigw-merchant.fast-pay.iq' } as const;

/** FastPay order ids: alphanumeric, 8–32 chars. Our session id without the prefix fits. */
export function fastPayOrderId(sessionId: string): string {
  return sessionId.replace(/^ps_/, '').replace(/[^a-z0-9]/gi, '').slice(0, 32);
}

export function createFastPayProvider(deps: ProviderDeps): PaymentProvider {
  const env = () => {
    const e = requireEnv(deps.env, 'FASTPAY_STORE_ID', 'FASTPAY_STORE_PASSWORD');
    const base = (deps.env.FASTPAY_API_BASE || (deps.mode === 'live' ? FASTPAY_HOSTS.production : FASTPAY_HOSTS.staging)).replace(/\/$/, '');
    liveGuard(deps, 'fastpay', base.includes('staging-'));
    return { base, creds: { store_id: e.FASTPAY_STORE_ID!, store_password: e.FASTPAY_STORE_PASSWORD! } };
  };

  async function verifyPayment(sessionId: string) {
    const { base, creds } = env();
    const a = await loadAttempt(deps, sessionId);
    const r = await requestJson(deps.fetch, `${base}/api/v1/public/pgw/payment/validate`, { method: 'POST', body: { ...creds, order_id: a.providerRef ?? fastPayOrderId(sessionId) } });
    const code = Number(pick(r.body, 'code'));
    const data = pick(r.body, 'data');
    if (code !== 200 || !data) {
      return statusFrom(a, a.state === 'pending' ? 'pending' : a.state, a.amount, deps);
    }
    const success = String(pick(data, 'status')).toLowerCase() === 'success';
    const amount = fromProviderAmount(pick(data, 'received_amount'), 'IQD', 'fastpay');
    const currencyOk = (str(pick(data, 'currency')) ?? 'IQD') === 'IQD';
    const state = success && currencyOk ? 'paid' : 'failed';
    const msisdn = str(pick(data, 'customer_mobile_number'));
    if (state !== a.state || msisdn) await deps.attempts.update(sessionId, { state, ...(msisdn ? { payer: { msisdn: (msisdn.startsWith('+') ? msisdn : `+${msisdn}`) as E164 } } : {}) });
    return statusFrom(a, state, amount, deps);
  }

  return {
    name: 'fastpay',
    capabilities: CAPABILITIES.fastpay,

    async createPaymentSession(order) {
      const { base, creds } = env();
      const attempt = newAttempt(order, 'fastpay', deps);
      const orderId = fastPayOrderId(attempt.sessionId);
      const ret = returnUrlFor(order, attempt.sessionId);
      const r = await requestJson(deps.fetch, `${base}/api/v1/public/pgw/payment/initiation`, {
        method: 'POST',
        body: {
          ...creds,
          order_id: orderId,
          bill_amount: toProviderAmount(order.amount, 'fastpay'),
          currency: 'IQD',
          success_url: ret,
          cancel_url: order.cancelUrl,
          callback_url: webhookUrl(deps, 'fastpay'),
          cart: JSON.stringify((order.lines ?? []).map((l) => ({ name: l.name, qty: l.qty, unit_price: l.unit.minor, sub_total: l.unit.minor * l.qty }))),
        },
      });
      const url = str(pick(r.body, 'data.redirect_uri'));
      if (Number(pick(r.body, 'code')) !== 200 || !url) throw new PaymentError(`FastPay initiation failed (${r.status})`, 'provider_error');
      attempt.providerRef = orderId;
      await deps.attempts.put(attempt);
      return { sessionId: attempt.sessionId, redirectUrl: url, providerRef: orderId };
    },

    verifyPayment,

    async handleWebhook(req): Promise<PaymentEvent> {
      const { text } = await readRawBody(req);
      let orderId: string | undefined;
      try {
        orderId = str(pick(JSON.parse(text), 'order_id')) ?? str(pick(JSON.parse(text), 'merchant_order_id'));
      } catch {
        orderId = new URLSearchParams(text).get('order_id') ?? undefined;
      }
      const attempt = orderId ? await deps.attempts.findByProviderRef('fastpay', orderId) : null;
      if (!attempt) throw new PaymentError(`No attempt for FastPay order ${orderId}`, 'unknown_ref');
      // Unsigned: never trust the payload. Validate with our credentials.
      const status = await verifyPayment(attempt.sessionId);
      return { eventKey: `fastpay:${orderId}:${status.state}`, provider: 'fastpay', type: eventTypeFor(status.state), sessionId: attempt.sessionId, providerRef: orderId, authenticity: 'none', status, duplicate: false, receivedAt: deps.now().toISOString() };
    },

    async refund(paymentId, amount: Money): Promise<RefundResult> {
      const { base, creds } = env();
      const secret = requireEnv(deps.env, 'FASTPAY_REFUND_SECRET_KEY').FASTPAY_REFUND_SECRET_KEY!;
      const a = await loadAttempt(deps, paymentId);
      if (!a.payer?.msisdn) throw new PaymentError('FastPay refunds need the customer’s FastPay number from Validate', 'missing_msisdn');
      const r = await requestJson(deps.fetch, `${base}/api/v1/public/pgw/payment/refund`, {
        method: 'POST',
        body: { ...creds, order_id: a.providerRef, amount: toProviderAmount(amount, 'fastpay'), refund_secret_key: secret, msisdn: a.payer.msisdn },
      });
      const ok = Number(pick(r.body, 'code')) === 200;
      return { refundId: str(pick(r.body, 'data.invoice_id')) ?? `rf_${paymentId}`, state: ok ? 'succeeded' : 'failed', amount };
    },
  };
}
