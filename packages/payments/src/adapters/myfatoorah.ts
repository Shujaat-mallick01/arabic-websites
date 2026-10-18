// MyFatoorah (GCC). v3 create + get; v2 MakeRefund (account currency, finance queue → 'manual').
// Webhook v2: `MyFatoorah-Signature` = base64 HMAC-SHA256 over ordered key=value pairs.

import { COUNTRY_INFO, type CurrencyCode, type Money, type PaymentMethodId } from '@aw/core';
import { CAPABILITIES } from '../capabilities.ts';
import { fromProviderAmount, toProviderAmount } from '../amount.ts';
import type { PayableOrder, PaymentEvent, PaymentProvider, PaymentState, ProviderDeps, RefundResult, VerifyContext } from '../types.ts';
import { constantTimeEqual, hmacSha256Base64, pick, PaymentError, requestJson, requireEnv, str, WebhookAuthError } from '../util.ts';
import { eventTypeFor, liveGuard, loadAttempt, newAttempt, readRawBody, returnUrlFor, statusFrom, webhookUrl } from './base.ts';

export const MYFATOORAH_HOSTS: Record<string, string> = {
  test: 'https://apitest.myfatoorah.com',
  kw: 'https://api.myfatoorah.com',
  bh: 'https://api.myfatoorah.com',
  jo: 'https://api.myfatoorah.com',
  om: 'https://api.myfatoorah.com',
  ae: 'https://api-ae.myfatoorah.com',
  sa: 'https://api-sa.myfatoorah.com',
  qa: 'https://api-qa.myfatoorah.com',
  eg: 'https://api-eg.myfatoorah.com',
};

const METHOD: Partial<Record<PaymentMethodId, string>> = { card: 'CARD', knet: 'KNET', apple_pay: 'APPLE_PAY', google_pay: 'GOOGLE_PAY' };

export function mapMyFatoorahStatus(invoiceStatus: string | undefined, txStatus: string | undefined): PaymentState {
  const inv = (invoiceStatus ?? '').toUpperCase();
  const tx = (txStatus ?? '').toUpperCase();
  if (inv === 'PAID' || tx === 'SUCCESS' || tx === 'SUCCSS') return 'paid';
  if (inv === 'CANCELED' || inv === 'CANCELLED' || tx === 'CANCELED') return 'cancelled';
  if (inv === 'EXPIRED') return 'expired';
  if (tx === 'FAILED') return 'failed';
  if (tx === 'AUTHORIZE') return 'authorized';
  return 'pending';
}

/** Ordered fields for PAYMENT_STATUS_CHANGED (event code 1). Null becomes "". */
export function myFatoorahSignatureString(data: unknown): string {
  const f = (path: string) => `${path}=${str(pick(data, path)) ?? ''}`;
  return [f('Invoice.Id'), f('Invoice.Status'), f('Transaction.Status'), f('Transaction.PaymentId'), f('Invoice.ExternalIdentifier')].join(',');
}

export function buildMyFatoorahPayment(order: PayableOrder, sessionId: string, deps: ProviderDeps) {
  const digits = order.customer.phone.replace(/^\+/, '');
  const info = Object.values(COUNTRY_INFO).find((c) => digits.startsWith(c.dialCode));
  return {
    ...(order.method && METHOD[order.method] ? { PaymentMethod: METHOD[order.method] } : {}),
    Order: {
      Amount: toProviderAmount(order.amount, 'myfatoorah'),
      Currency: order.amount.currency,
      ExternalIdentifier: order.orderId,
      ...(order.lines ? { Items: order.lines.map((l) => ({ Name: l.name.slice(0, 100), Quantity: l.qty, UnitPrice: toProviderAmount(l.unit, 'myfatoorah') })) } : {}),
    },
    Customer: {
      Name: order.customer.name.slice(0, 100),
      ...(order.customer.email ? { Email: order.customer.email } : {}),
      Mobile: { CountryCode: info ? `+${info.dialCode}` : '', Number: info ? digits.slice(info.dialCode.length) : digits },
      Reference: sessionId,
    },
    IntegrationUrls: { Redirection: returnUrlFor(order, sessionId), Webhook: webhookUrl(deps, 'myfatoorah') },
    Language: order.lang.toUpperCase(),
  };
}

export function createMyFatoorahProvider(deps: ProviderDeps): PaymentProvider {
  const env = () => {
    const e = requireEnv(deps.env, 'MYFATOORAH_API_KEY');
    const region = deps.env.MYFATOORAH_REGION || (deps.mode === 'live' ? 'kw' : 'test');
    const host = MYFATOORAH_HOSTS[region];
    if (!host) throw new PaymentError(`Unknown MYFATOORAH_REGION "${region}"`, 'config');
    liveGuard(deps, 'myfatoorah', host.includes('apitest.'));
    return { key: e.MYFATOORAH_API_KEY!, host };
  };
  const auth = (key: string) => ({ authorization: `Bearer ${key}` });

  async function verifyPayment(sessionId: string, ctx?: VerifyContext) {
    const { key, host } = env();
    const a = await loadAttempt(deps, sessionId);
    const paymentId = ctx?.returnParams?.paymentId ?? a.providerRef;
    if (!paymentId) throw new PaymentError('No MyFatoorah payment id', 'no_ref');
    const r = await requestJson(deps.fetch, `${host}/v3/payments/${encodeURIComponent(paymentId)}`, { method: 'GET', headers: auth(key) });
    if (!r.ok) throw new PaymentError(`MyFatoorah lookup failed (${r.status})`, 'provider_error');
    const data = pick(r.body, 'Data');
    const state = mapMyFatoorahStatus(str(pick(data, 'Invoice.Status')), str(pick(data, 'Transaction.Status')));
    // [U] exact amount field: prefer the invoice value, fall back to the base-currency amount.
    const rawAmount = pick(data, 'Invoice.Value') ?? pick(data, 'Amount.ValueInBaseCurrency') ?? pick(data, 'Invoice.Amount');
    const currency = (str(pick(data, 'Invoice.Currency')) ?? str(pick(data, 'Amount.BaseCurrency')) ?? a.amount.currency) as CurrencyCode;
    const amount = rawAmount === undefined ? a.amount : fromProviderAmount(rawAmount, currency, 'myfatoorah');
    if (state !== a.state) await deps.attempts.update(sessionId, { state, providerRef: paymentId });
    return statusFrom({ ...a, providerRef: paymentId }, state, amount, deps);
  }

  return {
    name: 'myfatoorah',
    capabilities: CAPABILITIES.myfatoorah,

    async createPaymentSession(order) {
      const { key, host } = env();
      const attempt = newAttempt(order, 'myfatoorah', deps);
      const r = await requestJson(deps.fetch, `${host}/v3/payments`, { method: 'POST', headers: auth(key), body: buildMyFatoorahPayment(order, attempt.sessionId, deps) });
      const url = str(pick(r.body, 'Data.PaymentURL'));
      if (!r.ok || !url) throw new PaymentError(`MyFatoorah payment creation failed (${r.status})`, 'provider_error');
      attempt.providerRef = str(pick(r.body, 'Data.PaymentId')) ?? str(pick(r.body, 'Data.InvoiceId'));
      await deps.attempts.put(attempt);
      return { sessionId: attempt.sessionId, redirectUrl: url, ...(attempt.providerRef ? { providerRef: attempt.providerRef } : {}) };
    },

    verifyPayment,

    async handleWebhook(req): Promise<PaymentEvent> {
      const secret = requireEnv(deps.env, 'MYFATOORAH_WEBHOOK_SECRET').MYFATOORAH_WEBHOOK_SECRET!;
      const { text } = await readRawBody(req);
      const payload = JSON.parse(text) as Record<string, unknown>;
      const code = Number(pick(payload, 'Event.Code'));
      if (code !== 1) {
        return { eventKey: `myfatoorah:${str(pick(payload, 'Event.Reference')) ?? Date.now()}`, provider: 'myfatoorah', type: 'ignored', authenticity: 'none', duplicate: false, receivedAt: deps.now().toISOString() };
      }
      const data = pick(payload, 'Data');
      const expected = await hmacSha256Base64(secret, myFatoorahSignatureString(data));
      if (!constantTimeEqual(req.headers.get('myfatoorah-signature') ?? '', expected)) throw new WebhookAuthError('MyFatoorah signature mismatch');
      const paymentId = str(pick(data, 'Transaction.PaymentId'));
      const sessionRef = str(pick(data, 'Customer.Reference'));
      const attempt = (sessionRef ? await deps.attempts.get(sessionRef) : null) ?? (paymentId ? await deps.attempts.findByProviderRef('myfatoorah', paymentId) : null);
      if (!attempt) throw new PaymentError('No attempt for MyFatoorah event', 'unknown_ref');
      const status = await verifyPayment(attempt.sessionId, paymentId ? { returnParams: { paymentId } } : undefined);
      return { eventKey: `myfatoorah:${paymentId}:${str(pick(data, 'Transaction.Status'))}`, provider: 'myfatoorah', type: eventTypeFor(status.state), sessionId: attempt.sessionId, providerRef: paymentId, authenticity: 'hmac', status, duplicate: false, receivedAt: deps.now().toISOString() };
    },

    async refund(paymentId, amount: Money, opts): Promise<RefundResult> {
      const { key, host } = env();
      const a = await loadAttempt(deps, paymentId);
      const r = await requestJson(deps.fetch, `${host}/v2/MakeRefund`, {
        method: 'POST',
        headers: auth(key),
        body: { KeyType: 'PaymentId', Key: a.providerRef, Amount: toProviderAmount(amount, 'myfatoorah'), Comment: opts?.reason ?? 'Refund' },
      });
      if (!r.ok || pick(r.body, 'IsSuccess') === false) return { refundId: `rf_${paymentId}`, state: 'failed', amount };
      const ref = str(pick(r.body, 'Data.RefundId'));
      // A refund request goes to MyFatoorah's finance team; it is not instant.
      return { refundId: ref ?? `rf_${paymentId}`, ...(ref ? { providerRef: ref } : {}), state: 'manual', amount };
    },
  };
}
