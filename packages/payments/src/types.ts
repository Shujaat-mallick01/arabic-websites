// The provider-agnostic payment interface. The brief's four methods keep their names and
// positional arguments; optional context and an injected attempt store close the gaps.

import type { CountryCode, CurrencyCode, E164, I18nText, Lang, Money, PaymentMethodId, ProviderName } from '@aw/core';

export type { PaymentMethodId, ProviderName } from '@aw/core';

export type PaymentsMode = 'mock' | 'test' | 'live';

/** What the gateway needs to charge, nothing more. */
export interface PayableOrder {
  orderId: string;
  siteId: string;
  purpose: 'order' | 'deposit' | 'balance' | 'gift_card';
  /** What to charge now (total or deposit). */
  amount: Money;
  description: I18nText;
  customer: { name: string; phone: E164; email?: string };
  lang: Lang;
  method?: PaymentMethodId;
  lines?: Array<{ name: string; qty: number; unit: Money }>;
  /** https://<site>/pay/return/ — the adapter appends ?s=<sessionId>. For COD: the order page. */
  returnUrl: string;
  cancelUrl: string;
  idempotencyKey: string;
}

/** A superset of the brief's { redirectUrl, sessionId }. */
export interface PaymentSession {
  sessionId: string;
  redirectUrl: string;
  providerRef?: string;
  expiresAt?: string;
}

export type PaymentState =
  | 'pending'
  | 'requires_action'
  | 'authorized'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'expired'
  | 'refunded'
  | 'partially_refunded';

export interface PaymentStatus {
  sessionId: string;
  orderId: string;
  provider: ProviderName;
  state: PaymentState;
  /** As reported by the provider, converted back to Money. */
  amount: Money;
  amountMatches: boolean;
  providerRef?: string;
  method?: PaymentMethodId;
  failure?: { code: string; message: I18nText };
  checkedAt: string;
}

export type PaymentEventType =
  | 'payment.succeeded'
  | 'payment.failed'
  | 'payment.cancelled'
  | 'payment.expired'
  | 'refund.succeeded'
  | 'refund.pending'
  | 'refund.failed'
  | 'ignored';

export type Authenticity = 'hmac' | 'shared-secret' | 'static-header' | 'jwt' | 'none';

export interface PaymentEvent {
  eventKey: string;
  provider: ProviderName;
  type: PaymentEventType;
  sessionId?: string;
  providerRef?: string;
  authenticity: Authenticity;
  /** Always from a fresh verifyPayment(), never from the payload. */
  status?: PaymentStatus;
  duplicate: boolean;
  receivedAt: string;
}

export interface RefundOptions {
  reason?: string;
  idempotencyKey?: string;
}

export interface RefundResult {
  refundId: string;
  providerRef?: string;
  state: 'succeeded' | 'pending' | 'manual' | 'failed';
  amount: Money;
  failure?: { code: string; message: I18nText };
}

export interface VerifyContext {
  /** tap_id | paymentId | resultIndicator | tran_ref | cko-payment-id | token | order_id … */
  returnParams?: Record<string, string>;
}

export interface ProviderCapabilities {
  label: string;
  countries: CountryCode[];
  currencies: CurrencyCode[];
  methods: PaymentMethodId[];
  launch: 'redirect' | 'interstitial' | 'offline';
  webhookAuth: Authenticity;
  webhookOn: 'all' | 'success-only' | 'none';
  refunds: 'sync' | 'async' | 'manual' | 'none';
  partialRefunds: boolean;
  amountWire: 'major-decimal' | 'minor-integer' | 'decimal-string' | 'integer-major' | 'none';
}

export interface PaymentProvider {
  readonly name: ProviderName;
  readonly capabilities: ProviderCapabilities;
  createPaymentSession(order: PayableOrder): Promise<PaymentSession>;
  verifyPayment(sessionId: string, ctx?: VerifyContext): Promise<PaymentStatus>;
  /** Functions v2 pass a real Request, so raw body bytes are available. */
  handleWebhook(req: Request): Promise<PaymentEvent>;
  /** paymentId = the sessionId of a paid attempt. */
  refund(paymentId: string, amount: Money, opts?: RefundOptions): Promise<RefundResult>;
}

export interface PaymentAttempt {
  sessionId: string;
  orderId: string;
  provider: ProviderName;
  /** The provider a mock attempt emulates. */
  emulates?: ProviderName;
  purpose: PayableOrder['purpose'];
  amount: Money;
  state: PaymentState;
  providerRef?: string;
  method?: PaymentMethodId;
  /** Never sent to the browser. */
  secrets?: { successIndicator?: string };
  payer?: { msisdn?: E164 };
  /** Demo gateway choices (mock only). */
  mock?: { outcome: MockOutcome; reason?: MockFailureReason };
  expiresAt?: string;
  refunded?: Money;
  createdAt: string;
  updatedAt: string;
}

export type MockOutcome = 'success' | 'failure' | 'cancel' | 'timeout' | 'mismatch';
export type MockFailureReason = 'card_declined' | 'insufficient_funds' | 'expired_card';

export interface PaymentAttemptStore {
  /** Write only if new. */
  put(a: PaymentAttempt): Promise<void>;
  get(sessionId: string): Promise<PaymentAttempt | null>;
  update(sessionId: string, patch: Partial<PaymentAttempt>): Promise<PaymentAttempt>;
  findByProviderRef(provider: ProviderName, ref: string): Promise<PaymentAttempt | null>;
}

export interface ProviderDeps {
  mode: PaymentsMode;
  env: Readonly<Record<string, string | undefined>>;
  attempts: PaymentAttemptStore;
  /** https://<site> without a trailing slash. */
  siteUrl: string;
  fetch: typeof fetch;
  now: () => Date;
}

export type ProviderFactory = (deps: ProviderDeps) => PaymentProvider;
