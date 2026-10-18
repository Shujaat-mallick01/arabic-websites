import { describe, expect, it } from 'vitest';
import { money, type ProviderName } from '@aw/core';
import { memoryKv } from '@aw/core/server';
import {
  availableMethods,
  credimaxIndicatorMatches,
  fastPayOrderId,
  fromProviderAmount,
  getProvider,
  hmacSha256Base64,
  hmacSha256Hex,
  mapCheckoutStatus,
  mapMyFatoorahStatus,
  mapPayTabsStatus,
  mapTapStatus,
  myFatoorahSignatureString,
  NotImplementedError,
  PaymentConfigError,
  resolveMode,
  tapHashString,
  toProviderAmount,
  type PayableOrder,
  type PaymentStatus,
  type ProviderDeps,
} from '../src/index.ts';
import { createMockCompleteHandler, createPaymentStatusHandler, createWebhookHandler, kvAttemptStore } from '../src/server/index.ts';

const SITE = 'https://demo.example';

type Route = (url: string, init: RequestInit) => { status?: number; body: unknown } | Promise<Response>;

function fakeFetch(routes: Array<[RegExp, Route]>, log: Array<{ url: string; init: RequestInit }> = []): typeof fetch {
  return (async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = String(input);
    log.push({ url, init });
    for (const [re, fn] of routes) {
      if (re.test(url)) {
        const out = await fn(url, init);
        if (out instanceof Response) return out;
        return new Response(JSON.stringify(out.body), { status: out.status ?? 200 });
      }
    }
    return new Response('{}', { status: 404 });
  }) as typeof fetch;
}

function makeDeps(over: Partial<ProviderDeps> = {}): ProviderDeps {
  const kv = memoryKv();
  return { mode: 'test', env: {}, attempts: kvAttemptStore(kv), siteUrl: SITE, fetch: fakeFetch([]), now: () => new Date('2026-09-23T07:00:00Z'), ...over };
}

const order = (over: Partial<PayableOrder> = {}): PayableOrder => ({
  orderId: 'DR-260923-7K3M',
  siteId: '02',
  purpose: 'order',
  amount: money(28500, 'BHD'),
  description: { ar: 'طلب من دريشة', en: 'Dareesha order' },
  customer: { name: 'Maryam Ali', phone: '+97336001234', email: 'm@example.com' },
  lang: 'ar',
  returnUrl: `${SITE}/pay/return/`,
  cancelUrl: `${SITE}/checkout/`,
  idempotencyKey: 'DR-260923-7K3M:1',
  ...over,
});

describe('amount conversion', () => {
  it('uses each gateway’s wire format', () => {
    const m = money(28500, 'BHD');
    expect(toProviderAmount(m, 'tap')).toBe(28.5);
    expect(toProviderAmount(m, 'myfatoorah')).toBe(28.5);
    expect(toProviderAmount(m, 'moyasar')).toBe(28500);
    expect(toProviderAmount(m, 'credimax')).toBe('28.500');
    expect(toProviderAmount(m, 'paytabs')).toBe('28.500');
    expect(toProviderAmount(m, 'checkout')).toBe(28500);
    expect(toProviderAmount(money(35050, 'SAR'), 'checkout')).toBe(35050);
    expect(toProviderAmount(money(45000, 'IQD'), 'checkout')).toBe(45_000_000);
    expect(toProviderAmount(money(45000, 'IQD'), 'fastpay')).toBe(45000);
  });

  it('enforces Checkout.com’s last-digit-0 rule and currency limits', () => {
    expect(() => toProviderAmount(money(28505, 'BHD'), 'checkout')).toThrow(/ending in 0/);
    expect(() => toProviderAmount(money(1000, 'BHD'), 'fastpay')).toThrow(/IQD/);
    expect(() => toProviderAmount(money(1000, 'IQD'), 'moyasar')).toThrow(/IQD/);
  });

  it('converts provider amounts back', () => {
    expect(fromProviderAmount(28.5, 'BHD', 'tap').minor).toBe(28500);
    expect(fromProviderAmount('250.00', 'IQD', 'fastpay').minor).toBe(250);
    expect(fromProviderAmount(45_000_000, 'IQD', 'checkout').minor).toBe(45000);
    expect(fromProviderAmount(35050, 'SAR', 'moyasar').minor).toBe(35050);
  });
});

describe('method matrix', () => {
  it('resolves the documented demo methods', () => {
    expect(availableMethods('BHD', 'tap', ['benefit', 'card', 'apple_pay', 'cod'])).toEqual(['benefit', 'card', 'apple_pay']);
    expect(availableMethods('BHD', 'credimax', ['card', 'apple_pay', 'benefit'])).toEqual(['card', 'apple_pay', 'benefit']);
    expect(availableMethods('IQD', 'fastpay', ['fastpay', 'card'])).toEqual(['fastpay']);
    expect(availableMethods('KWD', 'myfatoorah', ['knet', 'card', 'apple_pay'])).toEqual(['knet', 'card', 'apple_pay']);
    expect(availableMethods('SAR', 'moyasar', ['mada', 'card', 'apple_pay', 'stc_pay'])).toEqual(['mada', 'card', 'apple_pay', 'stc_pay']);
    expect(availableMethods('SAR', 'paytabs', ['mada', 'card', 'apple_pay', 'stc_pay'])).toEqual(['mada', 'card', 'apple_pay', 'stc_pay']);
  });

  it('drops methods the currency or provider cannot take', () => {
    expect(availableMethods('BHD', 'tap', ['knet', 'mada'])).toEqual([]);
    expect(availableMethods('BHD', 'paytabs', ['card'])).toEqual([]); // PayTabs has no Bahrain region
    expect(availableMethods('IQD', 'tap', ['card'])).toEqual([]);
    expect(availableMethods('BHD', null, ['card'])).toEqual([]);
  });
});

describe('mode and registry', () => {
  it('defaults to mock and returns mock wearing the provider’s capabilities', async () => {
    expect(resolveMode({})).toBe('mock');
    expect(resolveMode({ PAYMENTS_MODE: 'live' })).toBe('live');
    const p = await getProvider('credimax', makeDeps({ mode: 'mock' }));
    expect(p.name).toBe('mock');
    expect(p.capabilities.launch).toBe('interstitial');
    expect(p.capabilities.label).toBe('Credimax (mock)');
  });

  it('refuses test-looking credentials in live mode', async () => {
    const cases: Array<[ProviderName, Record<string, string>]> = [
      ['tap', { TAP_SECRET_KEY: 'sk_test_x' }],
      ['moyasar', { MOYASAR_SECRET_KEY: 'sk_test_x' }],
      ['myfatoorah', { MYFATOORAH_API_KEY: 'k', MYFATOORAH_REGION: 'test' }],
      ['checkout', { CHECKOUT_SECRET_KEY: 'sk_sbox_x', CHECKOUT_API_BASE: 'https://abc.api.sandbox.checkout.com' }],
      ['credimax', { CREDIMAX_MERCHANT_ID: 'TEST123', CREDIMAX_API_PASSWORD: 'p', CREDIMAX_MERCHANT_NAME: 'n' }],
      ['fastpay', { FASTPAY_STORE_ID: 's', FASTPAY_STORE_PASSWORD: 'p', FASTPAY_API_BASE: 'https://staging-apigw-merchant.fast-pay.iq' }],
      ['paytabs', { PAYTABS_PROFILE_ID: '1', PAYTABS_SERVER_KEY: 'k', PAYTABS_REGION: 'sa' }],
    ];
    for (const [name, env] of cases) {
      const p = await getProvider(name, makeDeps({ mode: 'live', env }));
      await expect(p.createPaymentSession(order({ amount: name === 'fastpay' ? money(45000, 'IQD') : money(28500, 'BHD') }))).rejects.toBeInstanceOf(PaymentConfigError);
    }
  });

  it('keeps ZainCash as a typed stub', async () => {
    const p = await getProvider('zaincash', makeDeps());
    expect(p.capabilities.currencies).toEqual(['IQD']);
    await expect(p.createPaymentSession(order({ amount: money(45000, 'IQD') }))).rejects.toBeInstanceOf(NotImplementedError);
  });
});

describe('Tap', () => {
  const env = { TAP_SECRET_KEY: 'sk_test_abc' };
  const charge = { id: 'chg_TS01', amount: 3, currency: 'BHD', status: 'CAPTURED', reference: { gateway: 'G1', payment: 'P1' }, transaction: { created: '1695456000000', url: 'https://tap.example/pay' } };

  it('builds the documented hash string with the amount at 3 decimals', () => {
    expect(tapHashString(charge)).toBe('x_idchg_TS01x_amount3.000x_currencyBHDx_gateway_referenceG1x_payment_referenceP1x_statusCAPTUREDx_created1695456000000');
  });

  it('creates a charge, verifies by re-fetching and accepts a signed webhook', async () => {
    const log: Array<{ url: string; init: RequestInit }> = [];
    const deps = makeDeps({
      env,
      fetch: fakeFetch(
        [
          [/\/v2\/charges$/, () => ({ body: { id: 'chg_TS01', status: 'INITIATED', transaction: { url: 'https://tap.example/pay' } } })],
          [/\/v2\/charges\/chg_TS01$/, () => ({ body: { ...charge, amount: 28.5 } })],
        ],
        log,
      ),
    });
    const tap = await getProvider('tap', deps);
    const s = await tap.createPaymentSession(order({ method: 'benefit' }));
    expect(s.redirectUrl).toBe('https://tap.example/pay');
    const sent = JSON.parse(String(log[0]!.init.body));
    expect(sent).toMatchObject({ amount: 28.5, currency: 'BHD', source: { id: 'src_bh.benefit' }, customer: { first_name: 'Maryam', last_name: 'Ali', phone: { country_code: '973', number: '36001234' } } });
    expect(sent.redirect.url).toBe(`${SITE}/pay/return/?s=${s.sessionId}`);
    expect(sent.post.url).toBe(`${SITE}/api/pay/webhook/tap`);

    const status = await tap.verifyPayment(s.sessionId);
    expect(status).toMatchObject({ state: 'paid', amountMatches: true });

    const payload = { ...charge, amount: 28.5 };
    const body = JSON.stringify(payload);
    const good = await hmacSha256Hex(env.TAP_SECRET_KEY, tapHashString(payload));
    const ev = await tap.handleWebhook(new Request(`${SITE}/api/pay/webhook/tap`, { method: 'POST', body, headers: { hashstring: good } }));
    expect(ev).toMatchObject({ type: 'payment.succeeded', authenticity: 'hmac', sessionId: s.sessionId });
    await expect(tap.handleWebhook(new Request(`${SITE}/x`, { method: 'POST', body, headers: { hashstring: 'bad' } }))).rejects.toThrow(/hashstring/);
  });

  it('maps statuses (only CAPTURED is paid)', () => {
    expect(mapTapStatus('CAPTURED')).toBe('paid');
    expect(mapTapStatus('INITIATED')).toBe('pending');
    expect(mapTapStatus('DECLINED')).toBe('failed');
    expect(mapTapStatus('ABANDONED')).toBe('cancelled');
  });
});

describe('MyFatoorah', () => {
  it('signs the documented field order with base64 HMAC', async () => {
    const data = { Invoice: { Id: 6409988, Status: 'PAID', ExternalIdentifier: 'asdqwd-f13sdf-fasjkz' }, Transaction: { Status: 'SUCCESS', PaymentId: '07076409988323998875' } };
    const s = myFatoorahSignatureString(data);
    expect(s).toBe('Invoice.Id=6409988,Invoice.Status=PAID,Transaction.Status=SUCCESS,Transaction.PaymentId=07076409988323998875,Invoice.ExternalIdentifier=asdqwd-f13sdf-fasjkz');
    expect(myFatoorahSignatureString({ Invoice: { Id: 1, Status: 'PENDING', ExternalIdentifier: null }, Transaction: { Status: 'FAILED', PaymentId: 'p' } })).toContain('Invoice.ExternalIdentifier=');
    const sig = await hmacSha256Base64('secret', s);
    expect(sig).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  it('maps statuses', () => {
    expect(mapMyFatoorahStatus('PAID', 'SUCCESS')).toBe('paid');
    expect(mapMyFatoorahStatus('PENDING', 'FAILED')).toBe('failed');
    expect(mapMyFatoorahStatus('PENDING', 'InProgress')).toBe('pending');
  });
});

describe('Moyasar', () => {
  it('requires the shared secret token and the live flag', async () => {
    const deps = makeDeps({ mode: 'live', env: { MOYASAR_SECRET_KEY: 'sk_live_x', MOYASAR_WEBHOOK_SECRET_TOKEN: 'tok' } });
    const p = await getProvider('moyasar', deps);
    const req = (b: unknown) => new Request(`${SITE}/x`, { method: 'POST', body: JSON.stringify(b) });
    await expect(p.handleWebhook(req({ secret_token: 'nope', live: true }))).rejects.toThrow(/secret_token/);
    await expect(p.handleWebhook(req({ secret_token: 'tok', live: false }))).rejects.toThrow(/test event/);
  });
});

describe('PayTabs, Checkout.com and Credimax webhooks', () => {
  it('PayTabs verifies the raw-body HMAC', async () => {
    const deps = makeDeps({ env: { PAYTABS_PROFILE_ID: '1', PAYTABS_SERVER_KEY: 'srv', PAYTABS_REGION: 'sa' } });
    const p = await getProvider('paytabs', deps);
    const body = JSON.stringify({ tran_ref: 'TST1', payment_result: { response_status: 'A' } });
    await expect(p.handleWebhook(new Request(`${SITE}/x`, { method: 'POST', body, headers: { signature: 'bad' } }))).rejects.toThrow(/signature/);
    const good = await hmacSha256Hex('srv', body);
    // Signature passes; the unknown tran_ref is then reported.
    await expect(p.handleWebhook(new Request(`${SITE}/x`, { method: 'POST', body, headers: { signature: good } }))).rejects.toThrow(/No attempt/);
    expect(mapPayTabsStatus('A')).toBe('paid');
    expect(mapPayTabsStatus('D')).toBe('failed');
    expect(mapPayTabsStatus('X')).toBe('expired');
  });

  it('Checkout.com verifies Cko-Signature and maps statuses', async () => {
    const deps = makeDeps({ env: { CHECKOUT_SECRET_KEY: 'sk_sbox_1', CHECKOUT_API_BASE: 'https://abc.api.sandbox.checkout.com', CHECKOUT_WEBHOOK_SIGNING_KEY: 'whk' } });
    const p = await getProvider('checkout', deps);
    const body = JSON.stringify({ id: 'evt_1', data: { id: 'pay_1', metadata: { sessionId: 'ps_aaaaaaaaaaaaaaaaaaaa' } } });
    await expect(p.handleWebhook(new Request(`${SITE}/x`, { method: 'POST', body, headers: { 'cko-signature': 'bad' } }))).rejects.toThrow(/signature/);
    const good = await hmacSha256Hex('whk', body);
    await expect(p.handleWebhook(new Request(`${SITE}/x`, { method: 'POST', body, headers: { 'cko-signature': good } }))).rejects.toThrow(/No attempt/);
    expect(mapCheckoutStatus('Captured')).toBe('paid');
    expect(mapCheckoutStatus('Partially Refunded')).toBe('partially_refunded');
  });

  it('Credimax launches via our interstitial and keeps the success indicator server-side', async () => {
    const log: Array<{ url: string; init: RequestInit }> = [];
    const deps = makeDeps({
      env: { CREDIMAX_MERCHANT_ID: 'TEST123', CREDIMAX_API_PASSWORD: 'pw', CREDIMAX_MERCHANT_NAME: 'Dar Al Sidra', CREDIMAX_NOTIFICATION_SECRET: 'n'.repeat(32) },
      fetch: fakeFetch([[/\/session$/, () => ({ body: { session: { id: 'SESSION0002' }, successIndicator: 'abc123' } })]], log),
    });
    const p = await getProvider('credimax', deps);
    const s = await p.createPaymentSession(order());
    expect(s.redirectUrl).toBe(`${SITE}/pay/credimax/?s=${s.sessionId}&cs=SESSION0002`);
    expect(s.redirectUrl).not.toContain('abc123');
    const sent = JSON.parse(String(log[0]!.init.body));
    expect(sent).toMatchObject({ apiOperation: 'INITIATE_CHECKOUT', order: { amount: '28.500', currency: 'BHD' } });
    expect(log[0]!.url).toBe('https://credimax.gateway.mastercard.com/api/rest/version/100/merchant/TEST123/session');
    expect(credimaxIndicatorMatches('abc123', (await deps.attempts.get(s.sessionId))?.secrets?.successIndicator)).toBe(true);
    expect(credimaxIndicatorMatches('zzz', 'abc123')).toBe(false);
    await expect(p.handleWebhook(new Request(`${SITE}/x`, { method: 'POST', body: '{}', headers: { 'x-notification-secret': 'wrong' } }))).rejects.toThrow(/secret/);
  });
});

describe('FastPay', () => {
  it('treats the unsigned IPN only as a trigger to validate, and stores the payer number', async () => {
    const deps = makeDeps({
      env: { FASTPAY_STORE_ID: 's', FASTPAY_STORE_PASSWORD: 'p' },
      fetch: fakeFetch([
        [/initiation$/, () => ({ body: { code: 200, data: { redirect_uri: 'https://staging-pgw.fast-pay.iq/pay?token=t' } } })],
        [/validate$/, () => ({ body: { code: 200, data: { status: 'Success', received_amount: '45000.00', currency: 'IQD', customer_mobile_number: '+9647701234567' } } })],
      ]),
    });
    const p = await getProvider('fastpay', deps);
    const s = await p.createPaymentSession(order({ amount: money(45000, 'IQD') }));
    const ev = await p.handleWebhook(new Request(`${SITE}/x`, { method: 'POST', body: JSON.stringify({ order_id: fastPayOrderId(s.sessionId), status: 'Success', received_amount: '1.00' }) }));
    expect(ev).toMatchObject({ authenticity: 'none', type: 'payment.succeeded' });
    expect(ev.status?.amount.minor).toBe(45000); // from Validate, not from the payload
    expect((await deps.attempts.get(s.sessionId))?.payer?.msisdn).toBe('+9647701234567');
  });
});

describe('MockProvider through the handlers', () => {
  function rig() {
    const kv = memoryKv();
    const applied: Array<{ status: PaymentStatus; source: string }> = [];
    let clock = new Date('2026-09-23T07:00:00Z');
    let webhook: (req: Request) => Promise<Response> = async () => new Response();
    const deps: ProviderDeps = {
      mode: 'mock',
      env: {},
      attempts: kvAttemptStore(kv),
      siteUrl: SITE,
      now: () => clock,
      fetch: (async (url: RequestInfo | URL, init?: RequestInit) => webhook(new Request(String(url), init))) as typeof fetch,
    };
    const opts = { deps: async () => deps, kv: async () => kv, onStatus: async (status: PaymentStatus, source: string) => void applied.push({ status, source }) };
    webhook = createWebhookHandler(opts);
    return { deps, applied, opts, advance: (ms: number) => (clock = new Date(clock.getTime() + ms)) };
  }

  async function start(r: ReturnType<typeof rig>, emulate: ProviderName = 'tap') {
    const p = await getProvider(emulate, r.deps);
    return p.createPaymentSession(order());
  }

  it('success: webhook applies "paid" once even when delivered twice', async () => {
    const r = rig();
    const s = await start(r);
    expect(s.redirectUrl).toBe(`${SITE}/pay/mock/?s=${s.sessionId}`);
    const complete = createMockCompleteHandler(r.opts);
    const res = await complete(new Request(`${SITE}/api/pay/mock/complete`, { method: 'POST', body: JSON.stringify({ s: s.sessionId, outcome: 'success', webhook: 'twice' }) }));
    expect(await res.json()).toEqual({ redirectUrl: `${SITE}/pay/return/?s=${s.sessionId}` });
    expect(r.applied.filter((a) => a.source === 'webhook')).toHaveLength(1);
    expect(r.applied[0]?.status.state).toBe('paid');
    const status = createPaymentStatusHandler(r.opts);
    const body = await (await status(new Request(`${SITE}/api/pay/status?s=${s.sessionId}`))).json();
    expect(body).toMatchObject({ state: 'paid', amountMatches: true, orderId: 'DR-260923-7K3M' });
  });

  it('failure, cancel and amount mismatch', async () => {
    for (const [outcome, state, matches] of [
      ['failure', 'failed', true],
      ['cancel', 'cancelled', true],
      ['mismatch', 'paid', false],
    ] as const) {
      const r = rig();
      const s = await start(r);
      await createMockCompleteHandler(r.opts)(new Request(`${SITE}/x`, { method: 'POST', body: JSON.stringify({ s: s.sessionId, outcome, reason: 'insufficient_funds' }) }));
      expect(r.applied.at(-1)?.status).toMatchObject({ state, amountMatches: matches });
    }
  });

  it('timeout: stays pending, then expires after the mock window', async () => {
    const r = rig();
    const s = await start(r);
    await createMockCompleteHandler(r.opts)(new Request(`${SITE}/x`, { method: 'POST', body: JSON.stringify({ s: s.sessionId, outcome: 'timeout' }) }));
    expect(r.applied).toHaveLength(0);
    const status = createPaymentStatusHandler(r.opts);
    expect(await (await status(new Request(`${SITE}/api/pay/status?s=${s.sessionId}`))).json()).toMatchObject({ state: 'pending' });
    r.advance(3 * 60_000);
    expect(await (await status(new Request(`${SITE}/api/pay/status?s=${s.sessionId}`))).json()).toMatchObject({ state: 'expired' });
  });

  it('rejects unsigned mock webhooks and refuses the mock endpoint outside mock mode', async () => {
    const r = rig();
    const s = await start(r);
    const hook = createWebhookHandler(r.opts);
    const res = await hook(new Request(`${SITE}/api/pay/webhook/mock`, { method: 'POST', body: JSON.stringify({ eventId: 'e', sessionId: s.sessionId }), headers: { 'x-mock-signature': 'forged' } }));
    expect(res.status).toBe(401);
    const live = { ...r.opts, deps: async () => ({ ...r.deps, mode: 'live' as const }) };
    expect((await createMockCompleteHandler(live)(new Request(`${SITE}/x`, { method: 'POST', body: '{}' }))).status).toBe(404);
    expect((await createWebhookHandler(live)(new Request(`${SITE}/api/pay/webhook/mock`, { method: 'POST', body: '{}' }))).status).toBe(404);
  });

  it('refunds: sync for Tap emulation, pending for Checkout.com, manual for MyFatoorah', async () => {
    for (const [emulate, expected] of [
      ['tap', 'succeeded'],
      ['checkout', 'pending'],
      ['myfatoorah', 'manual'],
    ] as const) {
      const r = rig();
      const p = await getProvider(emulate, r.deps);
      const s = await p.createPaymentSession(order());
      await createMockCompleteHandler(r.opts)(new Request(`${SITE}/x`, { method: 'POST', body: JSON.stringify({ s: s.sessionId, outcome: 'success', webhook: 'never' }) }));
      await p.verifyPayment(s.sessionId);
      const rf = await p.refund(s.sessionId, money(10000, 'BHD'));
      expect(rf.state).toBe(expected);
      await expect(p.refund(s.sessionId, money(99999, 'BHD'))).rejects.toThrow(/exceeds/);
    }
  });

  it('rejects malformed session ids on the status endpoint', async () => {
    const r = rig();
    const res = await createPaymentStatusHandler(r.opts)(new Request(`${SITE}/api/pay/status?s=../../etc`));
    expect(res.status).toBe(400);
  });
});
