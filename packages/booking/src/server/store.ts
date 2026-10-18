// Bookings on a KV store. The unit of concurrency is the business day: every booking of a day
// lives in one record, so two people racing for the last slot can't both win.

import { withEtagRetry, type KvStore } from '@aw/core/server';
import type { E164, I18nText, Lang, LocalDate, Money, PaymentMethodId, ProviderName } from '@aw/core';
import type { BookingStatus, DayOverride, LedgerEntry } from '../types.ts';

export interface Booking extends LedgerEntry {
  serviceTitle: I18nText;
  start: string;
  end: string;
  customer: { name: string; phone: E164; email?: string };
  answers: Record<string, string>;
  price: Money;
  deposit: Money;
  balance: Money;
  lang: Lang;
  payment?: { provider: ProviderName; method?: PaymentMethodId; sessionId?: string; state: string };
  history: Array<{ at: string; from: BookingStatus | null; to: BookingStatus; by: string; note?: string }>;
  viewToken: string;
  createdAt: string;
  demo: boolean;
}

export interface DayRecord {
  bookings: Booking[];
  override?: DayOverride;
}

export class BookingError extends Error {
  override name = 'BookingError';
  readonly code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

export const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  held: ['pending_payment', 'confirmed', 'expired', 'cancelled'],
  pending_payment: ['confirmed', 'expired', 'cancelled'],
  confirmed: ['completed', 'cancelled', 'no_show'],
  completed: [],
  cancelled: [],
  no_show: [],
  expired: ['confirmed'],
};

export function kvBookingStore(kv: KvStore) {
  const dayKey = (d: LocalDate) => `day/${d}.json`;
  const ptrKey = (id: string) => `b/${id}.json`;

  async function dateOf(id: string): Promise<LocalDate | null> {
    return (await kv.getJSON<{ date: LocalDate }>(ptrKey(id)))?.value.date ?? null;
  }

  async function updateBooking(id: string, fn: (b: Booking) => Booking | undefined): Promise<Booking> {
    const date = await dateOf(id);
    if (!date) throw new BookingError(`Unknown booking ${id}`, 'not_found');
    const out = await withEtagRetry<DayRecord, Booking>(kv, dayKey(date), (cur) => {
      const rec = cur ?? { bookings: [] };
      const i = rec.bookings.findIndex((b) => b.id === id);
      if (i < 0) throw new BookingError(`Unknown booking ${id}`, 'not_found');
      const next = fn(structuredClone(rec.bookings[i]!));
      if (!next) return { next: rec, result: rec.bookings[i]! };
      const bookings = [...rec.bookings];
      bookings[i] = next;
      return { next: { ...rec, bookings }, result: next };
    });
    return out!;
  }

  return {
    async day(date: LocalDate): Promise<DayRecord> {
      return (await kv.getJSON<DayRecord>(dayKey(date)))?.value ?? { bookings: [] };
    },
    async get(id: string): Promise<Booking | null> {
      const date = await dateOf(id);
      if (!date) return null;
      return (await this.day(date)).bookings.find((b) => b.id === id) ?? null;
    },
    /**
     * Builds and writes a booking against the day's CURRENT bookings, inside the conditional write.
     * `build` returns null when the slot is gone; then nothing is written and 'conflict' is returned.
     */
    async hold(date: LocalDate, build: (day: DayRecord) => Booking | null): Promise<Booking | 'conflict'> {
      const res = await withEtagRetry<DayRecord, Booking | 'conflict'>(
        kv,
        dayKey(date),
        (cur) => {
          const rec = cur ?? { bookings: [] };
          const b = build(rec);
          if (!b) return { next: rec, result: 'conflict' };
          return { next: { ...rec, bookings: [...rec.bookings, b] }, result: b };
        },
        12,
      );
      if (res && res !== 'conflict') await kv.setJSON(ptrKey(res.id), { date }, { onlyIfNew: true });
      return res ?? 'conflict';
    },
    async transition(id: string, to: BookingStatus, by: string, note?: string): Promise<Booking> {
      return updateBooking(id, (b) => {
        if (b.status === to) return undefined;
        if (!BOOKING_TRANSITIONS[b.status].includes(to)) throw new BookingError(`Cannot change ${id} from ${b.status} to ${to}`, 'bad_transition');
        b.history.push({ at: new Date().toISOString(), from: b.status, to, by, ...(note ? { note } : {}) });
        b.status = to;
        return b;
      });
    },
    async patch(id: string, fn: (b: Booking) => Booking | undefined): Promise<Booking> {
      return updateBooking(id, fn);
    },
    async setDayOverride(date: LocalDate, o: DayOverride): Promise<void> {
      await withEtagRetry<DayRecord, void>(kv, dayKey(date), (cur) => ({ next: { ...(cur ?? { bookings: [] }), override: { ...(cur?.override ?? {}), ...o } }, result: undefined }));
    },
    async days(): Promise<LocalDate[]> {
      return (await kv.list('day/')).map((k) => k.slice(4, 14)).sort();
    },
  };
}

export type BookingStore = ReturnType<typeof kvBookingStore>;
