// Server-only payment plumbing: attempt store, webhook dedupe, and the HTTP handlers the
// generated Netlify functions export. Order/booking changes are injected through `onStatus`.

import { withEtagRetry, type KvStore } from '@aw/core/server';
import type { ProviderName } from '@aw/core';
import { getProvider } from '../registry.ts';
import { completeMockSession, mockSecret, MOCK_SIGNATURE_HEADER, signMockBody, type MockWebhookBody } from '../adapters/mock.ts';
import type { MockFailureReason, MockOutcome, PaymentAttempt, PaymentAttemptStore, PaymentStatus, ProviderDeps } from '../types.ts';
import { PaymentError, WebhookAuthError } from '../util.ts';

export function kvAttemptStore(kv: KvStore): PaymentAttemptStore {
  const key = (sid: string) => `a/${sid}.json`;
  const refKey = (p: ProviderName, ref: string) => `ref/${p}/${encodeURIComponent(ref)}`;
  return {
    async put(a) {
      const r = await kv.setJSON(key(a.sessionId), a, { onlyIfNew: true });
      if (!r.modified) throw new PaymentError(`Attempt ${a.sessionId} already exists`, 'duplicate_attempt');
      if (a.providerRef) await kv.setJSON(refKey(a.provider, a.providerRef), { sessionId: a.sessionId });
    },
    async get(sid) {
      return (await kv.getJSON<PaymentAttempt>(key(sid)))?.value ?? null;
    },
    async update(sid, patch) {
      const next = await withEtagRetry<PaymentAttempt>(kv, key(sid), (cur) => {
        if (!cur) return undefined;
        const n = { ...cur, ...patch, updatedAt: new Date().toISOString() };
        return { next: n, result: n };
      });
      if (!next) throw new PaymentError(`Unknown payment session ${sid}`, 'unknown_session');
      if (patch.providerRef) await kv.setJSON(refKey(next.provider, patch.providerRef), { sessionId: sid });
      return next;
    },
    async findByProviderRef(p, ref) {
      const hit = await kv.getJSON<{ sessionId: string }>(refKey(p, ref));
      return hit ? ((await kv.getJSON<PaymentAttempt>(key(hit.value.sessionId)))?.value ?? null) : null;
    },
  };
}

/** Webhook dedupe: true the first time an event key is seen. */
export function eventLog(kv: KvStore) {
  return {
    async firstTime(provider: ProviderName, eventKey: string): Promise<boolean> {
      const r = await kv.setJSON(`evt/${provider}/${encodeURIComponent(eventKey)}`, { at: new Date().toISOString() }, { onlyIfNew: true });
      return r.modified;
    },
  };
}

export type StatusSource = 'return' | 'webhook';

export interface PaymentHandlerOptions {
  /** Built per request: env, stores, site URL, fetch, clock. */
  deps: () => Promise<ProviderDeps>;
  kv: () => Promise<KvStore>;
  /** Applies a verified status to the order or booking (idempotent). */
  onStatus: (status: PaymentStatus, source: StatusSource) => Promise<void>;
}

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' };

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function publicStatus(s: PaymentStatus) {
  return { state: s.state, orderId: s.orderId, amountMatches: s.amountMatches, ...(s.failure ? { failure: s.failure } : {}) };
}

async function providerFor(attempt: PaymentAttempt, deps: ProviderDeps) {
  return getProvider(attempt.provider === 'mock' ? (attempt.emulates ?? 'mock') : attempt.provider, deps);
}

/** GET /api/pay/status?s=<sessionId>&<provider return params> — used by the return page. */
export function createPaymentStatusHandler(opts: PaymentHandlerOptions) {
  return async (req: Request): Promise<Response> => {
    if (req.method !== 'GET') return json({ error: 'method' }, 405);
    const url = new URL(req.url);
    const sid = url.searchParams.get('s');
    if (!sid || !/^ps_[0-9a-z]{20}$/.test(sid)) return json({ error: 'bad_session' }, 400);
    const deps = await opts.deps();
    const attempt = await deps.attempts.get(sid);
    if (!attempt) return json({ error: 'not_found' }, 404);
    const returnParams: Record<string, string> = {};
    for (const [k, v] of url.searchParams) if (k !== 's') returnParams[k] = v;
    try {
      const provider = await providerFor(attempt, deps);
      const status = await provider.verifyPayment(sid, { returnParams });
      await opts.onStatus(status, 'return');
      return json(publicStatus(status));
    } catch (e) {
      return json({ error: e instanceof PaymentError ? e.code : 'internal' }, 502);
    }
  };
}

/** POST /api/pay/webhook/<provider> */
export function createWebhookHandler(opts: PaymentHandlerOptions) {
  return async (req: Request): Promise<Response> => {
    if (req.method !== 'POST') return json({ error: 'method' }, 405);
    const name = new URL(req.url).pathname.replace(/\/$/, '').split('/').pop() as ProviderName;
    const deps = await opts.deps();
    if (deps.mode === 'mock' && name !== 'mock') return json({ error: 'not_found' }, 404);
    if (deps.mode !== 'mock' && name === 'mock') return json({ error: 'not_found' }, 404);
    let provider;
    try {
      provider = await getProvider(name, deps);
    } catch {
      return json({ error: 'unknown_provider' }, 404);
    }
    try {
      const event = await provider.handleWebhook(req);
      const first = await eventLog(await opts.kv()).firstTime(name, event.eventKey);
      if (!first) return json({ ok: true, duplicate: true });
      if (event.status) await opts.onStatus(event.status, 'webhook');
      return json({ ok: true });
    } catch (e) {
      if (e instanceof WebhookAuthError) return json({ error: 'unauthorised' }, 401);
      // Unknown references are acknowledged so the gateway stops retrying; they are logged.
      if (e instanceof PaymentError && e.code === 'unknown_ref') return json({ ok: true, ignored: true });
      return json({ error: 'internal' }, 500);
    }
  };
}

export type MockWebhookPlan = 'once' | 'twice' | 'out-of-order' | 'delay' | 'never';

export interface MockCompleteBody {
  s: string;
  outcome: MockOutcome;
  reason?: MockFailureReason;
  webhook?: MockWebhookPlan;
}

async function sendMockWebhook(deps: ProviderDeps, body: MockWebhookBody): Promise<void> {
  const text = JSON.stringify(body);
  const sig = await signMockBody(text, mockSecret(deps));
  await deps.fetch(`${deps.siteUrl}/api/pay/webhook/mock`, { method: 'POST', headers: { 'content-type': 'application/json', [MOCK_SIGNATURE_HEADER]: sig }, body: text });
}

/** POST /api/pay/mock/complete — the demo gateway page. 404 unless PAYMENTS_MODE is mock. */
export function createMockCompleteHandler(opts: PaymentHandlerOptions) {
  return async (req: Request, context?: { waitUntil?: (p: Promise<unknown>) => void }): Promise<Response> => {
    const deps = await opts.deps();
    if (deps.mode !== 'mock') return json({ error: 'not_found' }, 404);
    if (req.method !== 'POST') return json({ error: 'method' }, 405);
    let body: MockCompleteBody;
    try {
      body = (await req.json()) as MockCompleteBody;
    } catch {
      return json({ error: 'bad_json' }, 400);
    }
    const outcomes: MockOutcome[] = ['success', 'failure', 'cancel', 'timeout', 'mismatch'];
    if (!body?.s || !outcomes.includes(body.outcome)) return json({ error: 'bad_request' }, 400);
    try {
      const { redirectUrl } = await completeMockSession(deps, body.s, body.outcome, body.reason);
      const plan = body.outcome === 'timeout' ? 'never' : (body.webhook ?? 'once');
      const ev = (n: number): MockWebhookBody => ({ eventId: `${body.s}-${n}`, sessionId: body.s, type: 'payment.updated' });
      const deliver = async () => {
        if (plan === 'once') await sendMockWebhook(deps, ev(1));
        if (plan === 'twice') {
          // Same event id twice: the second one must be recognised as a duplicate.
          await sendMockWebhook(deps, ev(1));
          await sendMockWebhook(deps, ev(1));
        }
        if (plan === 'out-of-order') {
          await sendMockWebhook(deps, ev(2));
          await sendMockWebhook(deps, ev(1));
        }
        if (plan === 'delay') {
          await new Promise((r) => setTimeout(r, 20_000));
          await sendMockWebhook(deps, ev(1));
        }
      };
      if (plan === 'delay' && context?.waitUntil) context.waitUntil(deliver().catch(() => undefined));
      else if (plan !== 'delay') await deliver().catch(() => undefined);
      return json({ redirectUrl });
    } catch (e) {
      return json({ error: e instanceof PaymentError ? e.code : 'internal' }, 400);
    }
  };
}
