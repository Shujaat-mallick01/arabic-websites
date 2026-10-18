// Errors, signature helpers (Web Crypto, so they run in functions and tests alike) and small shared helpers.

import type { I18nText } from '@aw/core';

export class PaymentError extends Error {
  override name = 'PaymentError';
  constructor(
    message: string,
    readonly code: string,
    readonly userMessage?: I18nText,
  ) {
    super(message);
  }
}

export class NotImplementedError extends PaymentError {
  override name = 'NotImplementedError';
  constructor(what: string) {
    super(`${what} is not implemented yet (typed stub). Use PAYMENTS_MODE=mock.`, 'not_implemented');
  }
}

export class PaymentConfigError extends PaymentError {
  override name = 'PaymentConfigError';
  constructor(message: string) {
    super(message, 'config');
  }
}

export class WebhookAuthError extends PaymentError {
  override name = 'WebhookAuthError';
  constructor(message: string) {
    super(message, 'webhook_auth');
  }
}

const enc = new TextEncoder();

async function hmac(key: string, data: string | Uint8Array): Promise<Uint8Array> {
  const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = typeof data === 'string' ? enc.encode(data) : data;
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, bytes as BufferSource));
}

export async function hmacSha256Hex(key: string, data: string | Uint8Array): Promise<string> {
  return [...(await hmac(key, data))].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hmacSha256Base64(key: string, data: string | Uint8Array): Promise<string> {
  const bytes = await hmac(key, data);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

/** Constant-time string comparison (length leaks, content doesn't). */
export function constantTimeEqual(a: string, b: string): boolean {
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  const n = Math.max(x.length, y.length);
  for (let i = 0; i < n; i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

export function requireEnv(env: Readonly<Record<string, string | undefined>>, ...keys: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  const missing: string[] = [];
  for (const k of keys) {
    const v = env[k];
    if (!v) missing.push(k);
    else out[k] = v;
  }
  if (missing.length) throw new PaymentConfigError(`Missing environment variables: ${missing.join(', ')}`);
  return out;
}

export function withQuery(url: string, params: Record<string, string>): string {
  const u = new URL(url);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return u.toString();
}

export interface JsonResponse<T = unknown> {
  status: number;
  ok: boolean;
  body: T;
}

/** fetch + JSON with a readable error. */
export async function requestJson<T = Record<string, unknown>>(
  f: typeof fetch,
  url: string,
  init: { method: string; headers?: Record<string, string>; body?: unknown; form?: Record<string, string> },
): Promise<JsonResponse<T>> {
  const headers: Record<string, string> = { accept: 'application/json', ...init.headers };
  let body: string | undefined;
  if (init.form) {
    headers['content-type'] = 'application/x-www-form-urlencoded';
    body = new URLSearchParams(init.form).toString();
  } else if (init.body !== undefined) {
    headers['content-type'] = 'application/json';
    body = JSON.stringify(init.body);
  }
  const res = await f(url, { method: init.method, headers, ...(body !== undefined ? { body } : {}) });
  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = { raw: text };
  }
  return { status: res.status, ok: res.ok, body: parsed as T };
}

export function basicAuth(user: string, password: string): string {
  return `Basic ${btoa(`${user}:${password}`)}`;
}

/** Reads a dotted path from unknown JSON. */
export function pick(obj: unknown, path: string): unknown {
  let cur: unknown = obj;
  for (const k of path.split('.')) {
    if (cur === null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur;
}

export function str(v: unknown): string | undefined {
  return v === undefined || v === null ? undefined : String(v);
}

export const FAILURE_MESSAGES: Record<string, I18nText> = {
  card_declined: { ar: 'رُفضت البطاقة. جرّب بطاقة أخرى أو طريقة دفع ثانية.', en: 'The card was declined. Try another card or payment method.' },
  insufficient_funds: { ar: 'الرصيد غير كافٍ.', en: 'Insufficient funds.' },
  expired_card: { ar: 'البطاقة منتهية الصلاحية.', en: 'The card has expired.' },
  cancelled: { ar: 'تم إلغاء الدفع.', en: 'The payment was cancelled.' },
  failed: { ar: 'لم تتم عملية الدفع.', en: 'The payment did not go through.' },
  expired: { ar: 'انتهت مهلة الدفع.', en: 'The payment session expired.' },
};
