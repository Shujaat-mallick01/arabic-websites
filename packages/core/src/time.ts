// Time helpers. Everything is evaluated in an explicit IANA zone through Intl;
// nothing reads the machine's zone and nothing hard-codes +3.

import type { LocalDate, TimeHM, TimeZone, Weekday } from './types.ts';

export class TimeError extends Error {
  override name = 'TimeError';
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const HM_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** JS getUTCDay() order (0 = Sunday). */
const JS_WEEKDAYS: readonly Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function isLocalDate(s: string): boolean {
  const m = DATE_RE.exec(s);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

function partsOfDate(date: LocalDate): [number, number, number] {
  const m = DATE_RE.exec(date);
  if (!m || !isLocalDate(date)) throw new TimeError(`Not a valid date (YYYY-MM-DD): "${date}"`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function fmtDate(y: number, m: number, d: number): LocalDate {
  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Calendar arithmetic, independent of any zone. */
export function addDays(date: LocalDate, n: number): LocalDate {
  const [y, m, d] = partsOfDate(date);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return fmtDate(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

/** Whole days from a to b (b - a). */
export function diffDays(a: LocalDate, b: LocalDate): number {
  const [y1, m1, d1] = partsOfDate(a);
  const [y2, m2, d2] = partsOfDate(b);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
}

export function weekdayOf(date: LocalDate): Weekday {
  const [y, m, d] = partsOfDate(date);
  return JS_WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]!;
}

export function compareDates(a: LocalDate, b: LocalDate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function isBetween(date: LocalDate, from: LocalDate, to: LocalDate): boolean {
  return date >= from && date <= to;
}

/** '14:30' → 870 minutes after midnight. */
export function parseHM(hm: TimeHM): number {
  const m = HM_RE.exec(hm);
  if (!m) throw new TimeError(`Not a valid time (HH:MM, 24-hour): "${hm}"`);
  return Number(m[1]) * 60 + Number(m[2]);
}

export function isTimeHM(s: string): boolean {
  return HM_RE.test(s);
}

/** Minutes (may exceed 1440 for after-midnight times) → 'HH:MM' on a 24-hour clock. */
export function formatHM(minutes: number): TimeHM {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

const dtfCache = new Map<string, Intl.DateTimeFormat>();
function dtf(tz: string): Intl.DateTimeFormat {
  let f = dtfCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    dtfCache.set(tz, f);
  }
  return f;
}

export interface ZonedParts {
  date: LocalDate;
  /** Minutes since local midnight, 0..1439. */
  minutes: number;
  seconds: number;
  weekday: Weekday;
}

/** Wall-clock parts of an instant in a zone. */
export function zonedParts(instant: Date, tz: TimeZone | string): ZonedParts {
  const parts = dtf(tz).formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const y = get('year');
  const mo = get('month');
  const d = get('day');
  const h = get('hour') % 24;
  const mi = get('minute');
  const s = get('second');
  const date = fmtDate(y, mo, d);
  return { date, minutes: h * 60 + mi, seconds: s, weekday: weekdayOf(date) };
}

export function toLocalDate(instant: Date, tz: TimeZone | string): LocalDate {
  return zonedParts(instant, tz).date;
}

export function zonedNow(tz: TimeZone | string, now: Date = new Date()): ZonedParts {
  return zonedParts(now, tz);
}

/** Zone offset in minutes at an instant (local - UTC). */
export function offsetMinutes(instant: Date, tz: TimeZone | string): number {
  const p = zonedParts(instant, tz);
  const [y, m, d] = partsOfDate(p.date);
  const asUtc = Date.UTC(y, m - 1, d, 0, p.minutes, p.seconds);
  return Math.round((asUtc - Math.floor(instant.getTime() / 1000) * 1000) / 60_000);
}

/**
 * The instant at which the wall clock in `tz` shows `date` + `minutes`.
 * `minutes` may exceed 1440 (business-day minutes after midnight).
 */
export function instantOf(date: LocalDate, minutes: number, tz: TimeZone | string): Date {
  const [y, m, d] = partsOfDate(date);
  const guess = Date.UTC(y, m - 1, d, 0, minutes);
  let off = offsetMinutes(new Date(guess), tz);
  let result = guess - off * 60_000;
  // Second pass handles a DST change between the guess and the result.
  const off2 = offsetMinutes(new Date(result), tz);
  if (off2 !== off) {
    off = off2;
    result = guess - off * 60_000;
  }
  return new Date(result);
}
