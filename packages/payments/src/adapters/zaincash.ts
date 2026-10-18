// ZainCash (Iraq). Level L0: typed and documented, but the v2 API details are not verifiable yet
// (docs are behind a challenge page). It refuses to run outside mock mode until built against UAT.

import { CAPABILITIES } from '../capabilities.ts';
import type { PaymentProvider, ProviderDeps } from '../types.ts';
import { NotImplementedError } from '../util.ts';

/**
 * Planned v2 flow (from search snippets, unverified):
 * - POST {ZAINCASH_API_BASE}/oauth2/token (client credentials, ZAINCASH_SCOPE)
 * - POST /api/v2/payment-gateway/transaction/init → redirectUrl
 * - return to success/failure URL with a JWT; verify it and call the Inquiry API
 * - webhooks only in production; reversal API for refunds
 * Env: ZAINCASH_CLIENT_ID, ZAINCASH_CLIENT_SECRET, ZAINCASH_SCOPE, ZAINCASH_API_BASE.
 */
export function createZainCashProvider(_deps: ProviderDeps): PaymentProvider {
  return {
    name: 'zaincash',
    capabilities: CAPABILITIES.zaincash,
    async createPaymentSession() {
      throw new NotImplementedError('ZainCash createPaymentSession');
    },
    async verifyPayment() {
      throw new NotImplementedError('ZainCash verifyPayment');
    },
    async handleWebhook() {
      throw new NotImplementedError('ZainCash handleWebhook');
    },
    async refund() {
      throw new NotImplementedError('ZainCash refund');
    },
  };
}
