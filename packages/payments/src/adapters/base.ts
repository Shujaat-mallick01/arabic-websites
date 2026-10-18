// Shared adapter helpers: attempts, status objects, event types and the live-mode guard.

import { sessionId as newSessionId, type Money, type ProviderName } from '@aw/core';
import type {
  PayableOrder,
  PaymentAttempt,
  PaymentEventType,
  PaymentState,
  PaymentStatus,
  ProviderDeps,
} from '../types.ts';
import { FAILURE_MESSAGES, PaymentConfigError, PaymentError, withQuery } from '../util.ts';

export function newAttempt(order: PayableOrder, provider: ProviderName, deps: ProviderDeps, extra: Partial<PaymentAttempt> = {}): PaymentAttempt {
  const now = deps.now().toISOString();
  return {
    sessionId: newSessionId(),
    orderId: order.orderId,
    provider,
    purpose: order.purpose,
    amount: order.amount,
    state: 'pending',
    ...(order.method ? { method: order.method } : {}),
    createdAt: now,
    updatedAt: now,
    ...extra,
  };
}

export function returnUrlFor(order: PayableOrder, sessionId: string): string {
  return withQuery(order.returnUrl, { s: sessionId });
}

export function webhookUrl(deps: ProviderDeps, provider: ProviderName): string {
  return `${deps.siteUrl}/api/pay/webhook/${provider}`;
}

export function statusFrom(
  attempt: PaymentAttempt,
  state: PaymentState,
  amount: Money,
  deps: ProviderDeps,
  extra: Partial<PaymentStatus> = {},
): PaymentStatus {
  const amountMatches = amount.currency === attempt.amount.currency && amount.minor === attempt.amount.minor;
  const failure =
    state === 'failed' || state === 'cancelled' || state === 'expired'
      ? extra.failure ?? { code: state, message: FAILURE_MESSAGES[state] ?? FAILURE_MESSAGES.failed! }
      : extra.failure;
  return {
    sessionId: attempt.sessionId,
    orderId: attempt.orderId,
    provider: attempt.provider,
    state,
    amount,
    amountMatches,
    ...(attempt.providerRef ? { providerRef: attempt.providerRef } : {}),
    ...(attempt.method ? { method: attempt.method } : {}),
    checkedAt: deps.now().toISOString(),
    ...extra,
    ...(failure ? { failure } : {}),
  };
}

export function eventTypeFor(state: PaymentState): PaymentEventType {
  switch (state) {
    case 'paid':
    case 'authorized':
      return 'payment.succeeded';
    case 'failed':
      return 'payment.failed';
    case 'cancelled':
      return 'payment.cancelled';
    case 'expired':
      return 'payment.expired';
    case 'refunded':
    case 'partially_refunded':
      return 'refund.succeeded';
    default:
      return 'ignored';
  }
}

/** In live mode, refuse credentials that look like test ones. */
export function liveGuard(deps: ProviderDeps, provider: ProviderName, looksTest: boolean): void {
  if (deps.mode === 'live' && looksTest) {
    throw new PaymentConfigError(`${provider}: PAYMENTS_MODE=live but the credentials look like test credentials`);
  }
}

export async function loadAttempt(deps: ProviderDeps, sessionId: string): Promise<PaymentAttempt> {
  const a = await deps.attempts.get(sessionId);
  if (!a) throw new PaymentError(`Unknown payment session ${sessionId}`, 'unknown_session');
  return a;
}

export async function readRawBody(req: Request): Promise<{ bytes: Uint8Array; text: string }> {
  const buf = new Uint8Array(await req.arrayBuffer());
  return { bytes: buf, text: new TextDecoder().decode(buf) };
}
