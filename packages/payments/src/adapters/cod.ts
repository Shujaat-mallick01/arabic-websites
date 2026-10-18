// Cash on delivery: no gateway. The order is "placed" and the owner marks it collected.

import { CAPABILITIES } from '../capabilities.ts';
import type { PayableOrder, PaymentEvent, PaymentProvider, PaymentSession, ProviderDeps, RefundResult } from '../types.ts';
import { PaymentError } from '../util.ts';
import { loadAttempt, newAttempt, statusFrom } from './base.ts';

export function createCodProvider(deps: ProviderDeps): PaymentProvider {
  return {
    name: 'cod',
    capabilities: CAPABILITIES.cod,

    async createPaymentSession(order: PayableOrder): Promise<PaymentSession> {
      const attempt = newAttempt(order, 'cod', deps, { method: 'cod' });
      await deps.attempts.put(attempt);
      // returnUrl is the order page for COD; no ?s= needed.
      return { sessionId: attempt.sessionId, redirectUrl: order.returnUrl };
    },

    async verifyPayment(sessionId: string) {
      const a = await loadAttempt(deps, sessionId);
      return statusFrom(a, a.state, a.amount, deps);
    },

    async handleWebhook(): Promise<PaymentEvent> {
      throw new PaymentError('Cash on delivery has no webhooks', 'no_webhooks');
    },

    async refund(paymentId, amount): Promise<RefundResult> {
      await loadAttempt(deps, paymentId);
      // Cash refunds happen by hand (bank transfer or in store).
      return { refundId: `rf_cod_${paymentId.slice(3, 15)}`, state: 'manual', amount };
    },
  };
}
