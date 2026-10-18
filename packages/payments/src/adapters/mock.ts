// MockProvider: the default on every demo. Emulates any provider's capabilities, simulates success,
// failure, cancel, timeout and amount mismatch, and receives real signed webhooks.

import { money, type Money, type ProviderName } from '@aw/core';
import { CAPABILITIES } from '../capabilities.ts';
import type {
  MockFailureReason,
  MockOutcome,
  PayableOrder,
  PaymentEvent,
  PaymentProvider,
  PaymentSession,
  PaymentStatus,
  ProviderDeps,
  RefundOptions,
  RefundResult,
} from '../types.ts';
import { FAILURE_MESSAGES, constantTimeEqual, hmacSha256Hex, PaymentError, WebhookAuthError } from '../util.ts';
import { eventTypeFor, loadAttempt, newAttempt, readRawBody, statusFrom } from './base.ts';

export const DEFAULT_MOCK_SECRET = 'aw-demo-mock-webhook-secret';
export const MOCK_SIGNATURE_HEADER = 'x-mock-signature';
/** Demo sessions expire quickly so the timeout path is visible. */
export const MOCK_SESSION_MINUTES = 2;

export interface MockWebhookBody {
  eventId: string;
  sessionId: string;
  type: 'payment.updated' | 'refund.updated';
  /** Only for the "mismatched amount" scenario: what the fake gateway claims was charged. */
  claimedAmountMinor?: number;
}

export function mockSecret(deps: Pick<ProviderDeps, 'env'>): string {
  return deps.env.MOCK_WEBHOOK_SECRET || DEFAULT_MOCK_SECRET;
}

export async function signMockBody(body: string, secret: string): Promise<string> {
  return hmacSha256Hex(secret, body);
}

export function createMockProvider(deps: ProviderDeps, emulate: ProviderName = 'mock'): PaymentProvider {
  const capabilities = { ...CAPABILITIES[emulate], label: `${CAPABILITIES[emulate].label} (mock)` };

  async function verifyPayment(sessionId: string): Promise<PaymentStatus> {
    const a = await loadAttempt(deps, sessionId);
    if (a.state === 'refunded' || a.state === 'partially_refunded') return statusFrom(a, a.state, a.amount, deps);
    const outcome = a.mock?.outcome;
    const now = deps.now().getTime();
    let status: PaymentStatus;
    if (!outcome || outcome === 'timeout') {
      const expired = a.expiresAt !== undefined && Date.parse(a.expiresAt) <= now;
      status = statusFrom(a, expired ? 'expired' : 'pending', a.amount, deps);
    } else if (outcome === 'success') {
      status = statusFrom(a, 'paid', a.amount, deps);
    } else if (outcome === 'mismatch') {
      status = statusFrom(a, 'paid', money(Math.max(0, a.amount.minor - stepDown(a.amount)), a.amount.currency), deps);
    } else if (outcome === 'cancel') {
      status = statusFrom(a, 'cancelled', a.amount, deps);
    } else {
      const reason: MockFailureReason = a.mock?.reason ?? 'card_declined';
      status = statusFrom(a, 'failed', a.amount, deps, { failure: { code: reason, message: FAILURE_MESSAGES[reason]! } });
    }
    if (status.state !== a.state) await deps.attempts.update(sessionId, { state: status.state });
    return status;
  }

  return {
    name: 'mock',
    capabilities,

    async createPaymentSession(order: PayableOrder): Promise<PaymentSession> {
      const expiresAt = new Date(deps.now().getTime() + MOCK_SESSION_MINUTES * 60_000).toISOString();
      const attempt = newAttempt(order, 'mock', deps, { emulates: emulate, expiresAt });
      attempt.providerRef = `mock_${attempt.sessionId.slice(3)}`;
      await deps.attempts.put(attempt);
      return {
        sessionId: attempt.sessionId,
        redirectUrl: `${deps.siteUrl}/pay/mock/?s=${attempt.sessionId}`,
        providerRef: attempt.providerRef,
        expiresAt,
      };
    },

    verifyPayment,

    async handleWebhook(req: Request): Promise<PaymentEvent> {
      const { text } = await readRawBody(req);
      const sig = req.headers.get(MOCK_SIGNATURE_HEADER) ?? '';
      const expected = await signMockBody(text, mockSecret(deps));
      if (!constantTimeEqual(sig, expected)) throw new WebhookAuthError('Mock webhook signature mismatch');
      const body = JSON.parse(text) as MockWebhookBody;
      const status = await verifyPayment(body.sessionId);
      return {
        eventKey: `mock:${body.eventId}`,
        provider: 'mock',
        type: eventTypeFor(status.state),
        sessionId: body.sessionId,
        providerRef: status.providerRef,
        authenticity: 'hmac',
        status,
        duplicate: false,
        receivedAt: deps.now().toISOString(),
      };
    },

    async refund(paymentId: string, amount: Money, _opts?: RefundOptions): Promise<RefundResult> {
      const a = await loadAttempt(deps, paymentId);
      if (a.state !== 'paid' && a.state !== 'partially_refunded') throw new PaymentError('Only paid payments can be refunded', 'not_paid');
      const already = a.refunded?.minor ?? 0;
      if (amount.minor <= 0 || already + amount.minor > a.amount.minor) throw new PaymentError('Refund exceeds the paid amount', 'refund_too_large');
      const total = already + amount.minor;
      const kind = capabilities.refunds;
      const state: RefundResult['state'] = kind === 'async' ? 'pending' : kind === 'manual' ? 'manual' : 'succeeded';
      if (state === 'succeeded') {
        await deps.attempts.update(paymentId, {
          refunded: money(total, a.amount.currency),
          state: total === a.amount.minor ? 'refunded' : 'partially_refunded',
        });
      }
      return { refundId: `rf_${a.sessionId.slice(3, 15)}_${total}`, state, amount };
    },
  };
}

function stepDown(m: Money): number {
  return m.currency === 'IQD' ? 250 : m.currency === 'SAR' || m.currency === 'AED' || m.currency === 'QAR' ? 100 : 1000;
}

/** Records the shopper's choice on the demo gateway page. Returns where to send the browser. */
export async function completeMockSession(
  deps: ProviderDeps,
  sessionId: string,
  outcome: MockOutcome,
  reason?: MockFailureReason,
): Promise<{ redirectUrl: string }> {
  const a = await loadAttempt(deps, sessionId);
  if (a.provider !== 'mock') throw new PaymentError('Not a mock session', 'not_mock');
  if (a.state !== 'pending') return { redirectUrl: `${deps.siteUrl}/pay/return/?s=${sessionId}` };
  await deps.attempts.update(sessionId, { mock: { outcome, ...(reason ? { reason } : {}) } });
  return { redirectUrl: `${deps.siteUrl}/pay/return/?s=${sessionId}` };
}
