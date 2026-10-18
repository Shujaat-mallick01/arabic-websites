// Orders, stock and gift cards on a KV store (Netlify Blobs in production, memory in tests).
// Every write that can race uses conditional writes with ETag retries.

import { withEtagRetry, type KvStore } from '@aw/core/server';
import { money, sub, type E164, type GccCountry, type I18nText, type Lang, type LocalDate, type Money, type PaymentMethodId, type ProviderName } from '@aw/core';

export type OrderStatus =
  | 'pending_payment' | 'payment_failed' | 'placed' | 'paid' | 'confirmed' | 'preparing'
  | 'ready_for_pickup' | 'out_for_delivery' | 'shipped' | 'completed' | 'cancelled'
  | 'refunded' | 'partially_refunded' | 'needs_attention';

export type PaymentStateLite = 'pending' | 'requires_action' | 'authorized' | 'paid' | 'failed' | 'cancelled' | 'expired' | 'refunded' | 'partially_refunded' | 'cod';

export interface OrderLine {
  productId: string;
  slug: string;
  title: I18nText;
  selection: Record<string, string>;
  labels: Array<{ label: I18nText; value: I18nText }>;
  addons?: Record<string, number>;
  qty: number;
  unit: Money;
  total: Money;
}

export type OrderFulfilment =
  | { kind: 'delivery'; zoneId: string; zoneName: I18nText; address: Record<string, string>; date?: LocalDate; slotId?: string }
  | { kind: 'shipping'; country: GccCountry; address: Record<string, string> }
  | { kind: 'pickup'; branchId: string; branchName: I18nText; date?: LocalDate }
  | { kind: 'digital' };

export interface HistoryItem {
  at: string;
  from: OrderStatus | null;
  to: OrderStatus;
  by: 'system' | 'owner' | 'webhook' | 'return';
  note?: string;
}

export interface Order {
  id: string;
  siteId: string;
  kind: 'order' | 'gift_card';
  createdAt: string;
  lang: Lang;
  customer: { name: string; phone: E164; email?: string };
  lines: OrderLine[];
  fulfilment: OrderFulfilment;
  pricing: {
    subtotal: Money;
    shipping: Money;
    codFee?: Money;
    giftWrap?: Money;
    giftCard?: { code: string; applied: Money };
    vatIncluded?: Money;
    total: Money;
    payable: Money;
  };
  payment: { provider: ProviderName; method?: PaymentMethodId; sessionId?: string; state: PaymentStateLite };
  status: OrderStatus;
  history: HistoryItem[];
  notes?: string;
  giftMessage?: string;
  giftCardPurchase?: { amount: Money; recipient: string; message?: string; issuedCode?: string };
  viewToken: string;
  demo: boolean;
}

export interface OrderSummary {
  id: string;
  createdAt: string;
  status: OrderStatus;
  total: Money;
  customerName: string;
  items: number;
  kind: Order['kind'];
  demo: boolean;
}

/** Allowed status changes. Owner actions and payment events both go through this. */
export const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ['paid', 'payment_failed', 'cancelled', 'needs_attention'],
  payment_failed: ['pending_payment', 'paid', 'cancelled'],
  placed: ['confirmed', 'preparing', 'cancelled', 'completed'],
  paid: ['confirmed', 'preparing', 'cancelled', 'refunded', 'partially_refunded', 'completed'],
  confirmed: ['preparing', 'ready_for_pickup', 'out_for_delivery', 'shipped', 'cancelled'],
  preparing: ['ready_for_pickup', 'out_for_delivery', 'shipped', 'cancelled'],
  ready_for_pickup: ['completed', 'cancelled'],
  out_for_delivery: ['completed', 'cancelled'],
  shipped: ['completed'],
  completed: ['refunded', 'partially_refunded'],
  cancelled: ['refunded'],
  refunded: [],
  partially_refunded: ['refunded'],
  needs_attention: ['paid', 'cancelled', 'refunded'],
};

export class OrderError extends Error {
  override name = 'OrderError';
  readonly code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

export interface GiftCard {
  code: string;
  initial: Money;
  balance: Money;
  issuedAt: string;
  expiresOn: LocalDate;
  orderId: string;
  recipient?: string;
  ledger: Array<{ at: string; orderId: string; amount: Money }>;
}

export function summarise(o: Order): OrderSummary {
  return { id: o.id, createdAt: o.createdAt, status: o.status, total: o.pricing.total, customerName: o.customer.name, items: o.lines.reduce((n, l) => n + l.qty, 0), kind: o.kind, demo: o.demo };
}

export function kvOrderStore(kv: KvStore) {
  const key = (id: string) => `o/${id}.json`;
  const dayKey = (d: string) => `idx/${d}.json`;

  async function index(o: Order) {
    const day = o.createdAt.slice(0, 10);
    await withEtagRetry<OrderSummary[], void>(kv, dayKey(day), (cur) => {
      const list = (cur ?? []).filter((x) => x.id !== o.id);
      list.push(summarise(o));
      list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      return { next: list, result: undefined };
    });
  }

  async function update(id: string, fn: (o: Order) => Order | undefined): Promise<Order> {
    const out = await withEtagRetry<Order, Order>(kv, key(id), (cur) => {
      if (!cur) throw new OrderError(`Unknown order ${id}`, 'not_found');
      const next = fn(structuredClone(cur));
      if (!next) return { next: cur, result: cur };
      return { next, result: next };
    });
    if (!out) throw new OrderError(`Unknown order ${id}`, 'not_found');
    await index(out);
    return out;
  }

  return {
    async create(o: Order): Promise<Order> {
      const r = await kv.setJSON(key(o.id), o, { onlyIfNew: true });
      if (!r.modified) throw new OrderError(`Order ${o.id} already exists`, 'duplicate');
      await index(o);
      return o;
    },
    async get(id: string): Promise<Order | null> {
      return (await kv.getJSON<Order>(key(id)))?.value ?? null;
    },
    async listDay(day: string): Promise<OrderSummary[]> {
      return (await kv.getJSON<OrderSummary[]>(dayKey(day)))?.value ?? [];
    },
    async listDays(): Promise<string[]> {
      return (await kv.list('idx/')).map((k) => k.slice(4, 14)).sort().reverse();
    },
    /** Validated status change; a no-op when already in that status. */
    async transition(id: string, to: OrderStatus, by: HistoryItem['by'], note?: string): Promise<Order> {
      return update(id, (o) => {
        if (o.status === to) return undefined;
        if (!TRANSITIONS[o.status].includes(to)) throw new OrderError(`Cannot change ${o.id} from ${o.status} to ${to}`, 'bad_transition');
        o.history.push({ at: new Date().toISOString(), from: o.status, to, by, ...(note ? { note } : {}) });
        o.status = to;
        return o;
      });
    },
    /** Idempotent: applies a verified payment state once; late or duplicate events are ignored. */
    async attachPayment(id: string, p: { state: PaymentStateLite; amountMatches: boolean; sessionId: string; method?: PaymentMethodId }, by: HistoryItem['by']): Promise<{ order: Order; changed: boolean }> {
      let changed = false;
      const order = await update(id, (o) => {
        if (o.payment.sessionId && o.payment.sessionId !== p.sessionId && o.status === 'paid') return undefined;
        const before = o.status;
        o.payment = { ...o.payment, state: p.state, sessionId: p.sessionId, ...(p.method ? { method: p.method } : {}) };
        let to: OrderStatus | null = null;
        if (p.state === 'paid' || p.state === 'authorized') to = p.amountMatches ? 'paid' : 'needs_attention';
        else if ((p.state === 'failed' || p.state === 'cancelled' || p.state === 'expired') && before === 'pending_payment') to = 'payment_failed';
        if (to && to !== before && TRANSITIONS[before].includes(to)) {
          o.history.push({ at: new Date().toISOString(), from: before, to, by, ...(to === 'needs_attention' ? { note: 'amount mismatch' } : {}) });
          o.status = to;
          changed = true;
        }
        return o;
      });
      return { order, changed };
    },
    stock: {
      async get(keys: string[]): Promise<Record<string, number | null>> {
        const out: Record<string, number | null> = {};
        for (const k of keys) out[k] = (await kv.getJSON<number>(`stock/${k}.json`))?.value ?? null;
        return out;
      },
      async set(k: string, qty: number): Promise<void> {
        await kv.setJSON(`stock/${k}.json`, Math.max(0, Math.floor(qty)));
      },
      /** Decrements tracked keys; keys with no count are untracked (unlimited). */
      async decrement(lines: Array<{ key: string; qty: number }>): Promise<'ok' | { short: string[] }> {
        const short: string[] = [];
        for (const l of lines) {
          const res = await withEtagRetry<number, boolean>(kv, `stock/${l.key}.json`, (cur) => {
            if (cur === null) return undefined; // untracked
            if (cur < l.qty) return { next: cur, result: false };
            return { next: cur - l.qty, result: true };
          });
          if (res === false) short.push(l.key);
        }
        return short.length ? { short } : 'ok';
      },
    },
    giftCards: {
      async issue(card: GiftCard): Promise<void> {
        const r = await kv.setJSON(`gc/${card.code}.json`, card, { onlyIfNew: true });
        if (!r.modified) throw new OrderError('Gift card code collision', 'duplicate');
      },
      async check(code: string): Promise<GiftCard | null> {
        return (await kv.getJSON<GiftCard>(`gc/${code.trim().toUpperCase()}.json`))?.value ?? null;
      },
      async debit(code: string, amount: Money, orderId: string): Promise<'ok' | 'insufficient' | 'not_found'> {
        const res = await withEtagRetry<GiftCard, 'ok' | 'insufficient' | 'not_found'>(kv, `gc/${code.trim().toUpperCase()}.json`, (cur) => {
          if (!cur) return undefined;
          if (cur.ledger.some((l) => l.orderId === orderId)) return { next: cur, result: 'ok' };
          if (cur.balance.minor < amount.minor) return { next: cur, result: 'insufficient' };
          return { next: { ...cur, balance: sub(cur.balance, amount), ledger: [...cur.ledger, { at: new Date().toISOString(), orderId, amount }] }, result: 'ok' };
        });
        return res ?? 'not_found';
      },
    },
    /** Daily capacity counters for delivery slots (site 06). */
    async reserveSlot(date: LocalDate, slotId: string, limit: number): Promise<'ok' | 'full'> {
      const res = await withEtagRetry<number, 'ok' | 'full'>(kv, `cap/${date}/${slotId}.json`, (cur) => {
        const used = cur ?? 0;
        if (used >= limit) return { next: used, result: 'full' };
        return { next: used + 1, result: 'ok' };
      });
      return res ?? 'ok';
    },
  };
}

export type OrderStore = ReturnType<typeof kvOrderStore>;

export const zeroOf = (m: Money) => money(0, m.currency);
