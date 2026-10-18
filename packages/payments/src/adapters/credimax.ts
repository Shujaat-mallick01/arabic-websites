// Credimax (Bahrain), Mastercard Gateway Hosted Checkout. No redirect URL: our own interstitial
// page /pay/credimax/ loads checkout.min.js with the MPGS session id. resultIndicator must equal
// the stored successIndicator. Webhook: static `X-Notification-Secret` header.

import type { CurrencyCode, Money } from '@aw/core';
import { CAPABILITIES } from '../capabilities.ts';
import { fromProviderAmount, toProviderAmount } from '../amount.ts';
import type { PaymentEvent, PaymentProvider, PaymentState, ProviderDeps, RefundResult, VerifyContext } from '../types.ts';
import { basicAuth, constantTimeEqual, pick, PaymentError, requestJson, requireEnv, str, WebhookAuthError } from '../util.ts';
import { eventTypeFor, liveGuard, loadAttempt, newAttempt, readRawBody, returnUrlFor, statusFrom, webhookUrl } from './base.ts';

export const CREDIMAX_DEFAULT_HOST = 'https://credimax.gateway.mastercard.com';

export function mapCredimaxStatus(orderStatus: string | undefined, result?: string): PaymentState {
  switch (orderStatus) {
    case 'CAPTURED':
    case 'PURCHASED':
      return 'paid';
    case 'AUTHORIZED':
      return 'authorized';
    case 'REFUNDED':
      return 'refunded';
    case 'PARTIALLY_REFUNDED':
      return 'partially_refunded';
    case 'CANCELLED':
      return 'cancelled';
    case 'FAILED':
    case 'DECLINED':
      return 'failed';
    default:
      return result === 'FAILURE' || result === 'ERROR' ? 'failed' : 'pending';
  }
}

/** True when the return URL's resultIndicator equals the stored successIndicator. */
export function credimaxIndicatorMatches(resultIndicator: string | undefined, successIndicator: string | undefined): boolean {
  return !!resultIndicator && !!successIndicator && constantTimeEqual(resultIndicator, successIndicator);
}

export function createCredimaxProvider(deps: ProviderDeps): PaymentProvider {
  const env = () => {
    const e = requireEnv(deps.env, 'CREDIMAX_MERCHANT_ID', 'CREDIMAX_API_PASSWORD', 'CREDIMAX_MERCHANT_NAME');
    liveGuard(deps, 'credimax', e.CREDIMAX_MERCHANT_ID!.toUpperCase().startsWith('TEST'));
    const host = (deps.env.CREDIMAX_GATEWAY_HOST || CREDIMAX_DEFAULT_HOST).replace(/\/$/, '');
    const version = deps.env.CREDIMAX_API_VERSION || '100';
    const mid = e.CREDIMAX_MERCHANT_ID!;
    return {
      base: `${host}/api/rest/version/${version}/merchant/${encodeURIComponent(mid)}`,
      auth: { authorization: basicAuth(`merchant.${mid}`, e.CREDIMAX_API_PASSWORD!) },
      name: e.CREDIMAX_MERCHANT_NAME!.slice(0, 40),
    };
  };

  async function verifyPayment(sessionId: string, ctx?: VerifyContext) {
    const { base, auth } = env();
    const a = await loadAttempt(deps, sessionId);
    // The browser's resultIndicator is only a hint (see credimaxIndicatorMatches); the order lookup decides.
    void ctx;
    const orderRef = a.providerRef ?? a.sessionId;
    const r = await requestJson(deps.fetch, `${base}/order/${encodeURIComponent(orderRef)}`, { method: 'GET', headers: auth });
    if (!r.ok && r.status !== 404) throw new PaymentError(`Credimax order lookup failed (${r.status})`, 'provider_error');
    const state = r.status === 404 ? 'pending' : mapCredimaxStatus(str(pick(r.body, 'status')), str(pick(r.body, 'result')));
    const rawAmount = pick(r.body, 'amount') ?? pick(r.body, 'totalCapturedAmount');
    const amount = rawAmount === undefined ? a.amount : fromProviderAmount(rawAmount, (str(pick(r.body, 'currency')) ?? 'BHD') as CurrencyCode, 'credimax');
    if (state !== a.state) await deps.attempts.update(sessionId, { state });
    return statusFrom(a, state, amount, deps);
  }

  return {
    name: 'credimax',
    capabilities: CAPABILITIES.credimax,

    async createPaymentSession(order) {
      const { base, auth, name } = env();
      const attempt = newAttempt(order, 'credimax', deps);
      const orderRef = attempt.sessionId; // unique per attempt
      const r = await requestJson(deps.fetch, `${base}/session`, {
        method: 'POST',
        headers: auth,
        body: {
          apiOperation: 'INITIATE_CHECKOUT',
          interaction: {
            operation: 'PURCHASE',
            returnUrl: returnUrlFor(order, attempt.sessionId),
            cancelUrl: order.cancelUrl,
            merchant: { name },
            locale: order.lang === 'ar' ? 'ar_BH' : 'en_US',
          },
          order: {
            id: orderRef,
            reference: order.orderId,
            amount: toProviderAmount(order.amount, 'credimax'),
            currency: order.amount.currency,
            description: order.description[order.lang].slice(0, 127),
            notificationUrl: webhookUrl(deps, 'credimax'),
          },
        },
      });
      const mpgsSession = str(pick(r.body, 'session.id'));
      const successIndicator = str(pick(r.body, 'successIndicator'));
      if (!r.ok || !mpgsSession || !successIndicator) throw new PaymentError(`Credimax session failed (${r.status})`, 'provider_error');
      attempt.providerRef = orderRef;
      attempt.secrets = { successIndicator };
      await deps.attempts.put(attempt);
      // The MPGS session id is meant for the browser; the success indicator never leaves the server.
      return {
        sessionId: attempt.sessionId,
        redirectUrl: `${deps.siteUrl}/pay/credimax/?s=${attempt.sessionId}&cs=${encodeURIComponent(mpgsSession)}`,
        providerRef: orderRef,
      };
    },

    verifyPayment,

    async handleWebhook(req): Promise<PaymentEvent> {
      const secret = requireEnv(deps.env, 'CREDIMAX_NOTIFICATION_SECRET').CREDIMAX_NOTIFICATION_SECRET!;
      if (!constantTimeEqual(req.headers.get('x-notification-secret') ?? '', secret)) throw new WebhookAuthError('Credimax notification secret mismatch');
      const { text } = await readRawBody(req);
      const payload = JSON.parse(text) as Record<string, unknown>;
      const ref = str(pick(payload, 'order.id'));
      const attempt = ref ? await deps.attempts.findByProviderRef('credimax', ref) : null;
      if (!attempt) throw new PaymentError(`No attempt for Credimax order ${ref}`, 'unknown_ref');
      const status = await verifyPayment(attempt.sessionId);
      const notificationId = req.headers.get('x-notification-id') ?? `${ref}:${status.state}`;
      return { eventKey: `credimax:${notificationId}`, provider: 'credimax', type: eventTypeFor(status.state), sessionId: attempt.sessionId, providerRef: ref, authenticity: 'static-header', status, duplicate: false, receivedAt: deps.now().toISOString() };
    },

    async refund(paymentId, amount: Money): Promise<RefundResult> {
      const { base, auth } = env();
      const a = await loadAttempt(deps, paymentId);
      const txId = `rf-${Date.now().toString(36)}`;
      const r = await requestJson(deps.fetch, `${base}/order/${encodeURIComponent(a.providerRef ?? a.sessionId)}/transaction/${txId}`, {
        method: 'PUT',
        headers: auth,
        body: { apiOperation: 'REFUND', transaction: { amount: toProviderAmount(amount, 'credimax'), currency: amount.currency } },
      });
      const ok = r.ok && str(pick(r.body, 'result')) === 'SUCCESS';
      return { refundId: txId, providerRef: txId, state: ok ? 'succeeded' : 'failed', amount };
    },
  };
}
