// Delivery, shipping, pickup and COD rules. Everything date-relative takes `now` and the site zone,
// so the browser and the functions compute the same answer.

import {
  addDays,
  compare,
  instantOf,
  money,
  parseHM,
  weekdayOf,
  zonedParts,
  type LocalDate,
  type Money,
  type TimeHM,
  type TimeZone,
  type Weekday,
} from '@aw/core';
import type { DeliveryRules, DeliverySlot, EtaDays, FulfilmentChoice, FulfilmentRules, Zone } from './types.ts';

export type FulfilmentIssue =
  | { code: 'zone_unknown' }
  | { code: 'zone_inactive' }
  | { code: 'zone_min_order'; minOrder: Money }
  | { code: 'country_unavailable' }
  | { code: 'branch_unknown' }
  | { code: 'date_required' }
  | { code: 'date_unavailable'; earliest: LocalDate | null }
  | { code: 'slot_required' }
  | { code: 'slot_unavailable' }
  | { code: 'not_offered' };

export interface FulfilmentQuote {
  fee: Money;
  /** Amount still needed for free delivery, when a threshold applies and isn't met. */
  freeShippingGap?: Money;
  eta?: EtaDays;
  issues: FulfilmentIssue[];
}

function feeWithThreshold(fee: Money, freeOver: Money | undefined, subtotal: Money): { fee: Money; gap?: Money } {
  if (!freeOver) return { fee };
  if (compare(subtotal, freeOver) >= 0) return { fee: money(0, fee.currency) };
  return { fee, gap: money(freeOver.minor - subtotal.minor, fee.currency) };
}

export function findZone(rules: FulfilmentRules, zoneId: string): Zone | undefined {
  return rules.delivery?.zones.find((z) => z.id === zoneId);
}

/** Fee and checks for the chosen way of getting the order (dates are checked separately). */
export function quoteFulfilment(rules: FulfilmentRules, choice: FulfilmentChoice, subtotal: Money): FulfilmentQuote {
  const zero = money(0, rules.currency);
  if (choice.kind === 'delivery') {
    if (!rules.delivery) return { fee: zero, issues: [{ code: 'not_offered' }] };
    const zone = findZone(rules, choice.zoneId);
    if (!zone) return { fee: zero, issues: [{ code: 'zone_unknown' }] };
    if (!zone.active) return { fee: zero, issues: [{ code: 'zone_inactive' }] };
    const issues: FulfilmentIssue[] = [];
    if (zone.minOrder && compare(subtotal, zone.minOrder) < 0) issues.push({ code: 'zone_min_order', minOrder: zone.minOrder });
    const { fee, gap } = feeWithThreshold(zone.fee, zone.freeOver, subtotal);
    return { fee, ...(gap ? { freeShippingGap: gap } : {}), eta: zone.eta, issues };
  }
  if (choice.kind === 'shipping') {
    const c = rules.shipping?.countries.find((x) => x.code === choice.country);
    if (!c || !c.active) return { fee: zero, issues: [{ code: 'country_unavailable' }] };
    const { fee, gap } = feeWithThreshold(c.fee, c.freeOver, subtotal);
    return { fee, ...(gap ? { freeShippingGap: gap } : {}), eta: c.eta, issues: [] };
  }
  if (!rules.pickup) return { fee: zero, issues: [{ code: 'not_offered' }] };
  if (!rules.pickup.branches.some((b) => b.id === choice.branchId)) return { fee: zero, issues: [{ code: 'branch_unknown' }] };
  return { fee: rules.pickup.fee, eta: { min: 0, max: 0 }, issues: [] };
}

export type CodRefusal = 'off' | 'scope' | 'zone' | 'max_order';

/** Whether cash on delivery may be offered for this order. */
export function codAvailability(rules: FulfilmentRules, siteAllowsCod: boolean, choice: FulfilmentChoice, total: Money): { ok: true; fee: Money } | { ok: false; reason: CodRefusal } {
  const cod = rules.cod;
  if (!siteAllowsCod || !cod?.enabled) return { ok: false, reason: 'off' };
  if (choice.kind === 'shipping') return { ok: false, reason: 'scope' };
  if (choice.kind === 'pickup' && cod.scope !== 'delivery+pickup') return { ok: false, reason: 'scope' };
  if (choice.kind === 'delivery') {
    const zone = findZone(rules, choice.zoneId);
    if (!zone?.codAllowed) return { ok: false, reason: 'zone' };
    if (cod.zones !== 'all' && !cod.zones.includes(choice.zoneId)) return { ok: false, reason: 'zone' };
  }
  if (cod.maxOrder && compare(total, cod.maxOrder) > 0) return { ok: false, reason: 'max_order' };
  return { ok: true, fee: cod.fee ?? money(0, rules.currency) };
}

/** Lead time in hours for a set of product lead tags: the longest wins. */
export function leadHoursFor(rules: DeliveryRules, tags: Iterable<string>): number {
  let h = rules.leadTime.standardHours;
  for (const t of tags) {
    const v = rules.leadTime.byTag[t];
    if (v !== undefined && v > h) h = v;
  }
  return h;
}

export interface SameDayStatus {
  /** Same-day delivery is still possible today. */
  open: boolean;
  cutoff: TimeHM;
  /** Instant of today's cutoff in the site zone. */
  cutoffAt: Date;
  /** Milliseconds until cutoff (0 when passed). */
  remainingMs: number;
}

export function sameDayStatus(rules: DeliveryRules, now: Date, tz: TimeZone): SameDayStatus | null {
  if (!rules.sameDay) return null;
  const { date, weekday } = zonedParts(now, tz);
  const cutoffAt = instantOf(date, parseHM(rules.sameDay.cutoff), tz);
  const remainingMs = Math.max(0, cutoffAt.getTime() - now.getTime());
  const isDay = rules.deliveryDays.includes(weekday) && !(rules.blackouts ?? []).includes(date);
  return { open: isDay && remainingMs > 0, cutoff: rules.sameDay.cutoff, cutoffAt, remainingMs };
}

function sameDayZone(rules: DeliveryRules, zoneId: string | undefined): boolean {
  if (!rules.sameDay) return false;
  if (rules.sameDay.zones === 'all') return true;
  return zoneId !== undefined && rules.sameDay.zones.includes(zoneId);
}

function slotsFor(rules: DeliveryRules, date: LocalDate): DeliverySlot[] {
  const wd = weekdayOf(date);
  return (rules.slots ?? []).filter((s) => !s.days || s.days.includes(wd));
}

export interface DateOptions {
  now: Date;
  tz: TimeZone;
  leadHours: number;
  zoneId?: string;
  /** All items are ready now (no lead time) — allows same-day before the cutoff. */
  readyNow?: boolean;
  /** Extra closed dates (CMS blackouts plus runtime closures). */
  closed?: LocalDate[];
  horizonDays?: number;
}

export interface DeliveryDate {
  date: LocalDate;
  /** Slot ids still possible on this date (time-wise; capacity is checked by the server). */
  slots: string[];
  sameDay: boolean;
}

/** Bookable delivery dates in order, respecting lead time, delivery days, slots, cutoffs and closures. */
export function deliveryDates(rules: DeliveryRules, opts: DateOptions): DeliveryDate[] {
  const horizon = opts.horizonDays ?? 30;
  const today = zonedParts(opts.now, opts.tz).date;
  const closed = new Set([...(rules.blackouts ?? []), ...(opts.closed ?? [])]);
  const out: DeliveryDate[] = [];
  const same = sameDayStatus(rules, opts.now, opts.tz);
  const sameDayOk = !!(opts.readyNow && same?.open && sameDayZone(rules, opts.zoneId));
  const readyAt = new Date(opts.now.getTime() + opts.leadHours * 3_600_000);
  for (let i = 0; i <= horizon; i++) {
    const date = addDays(today, i);
    if (!rules.deliveryDays.includes(weekdayOf(date)) || closed.has(date)) continue;
    const isToday = i === 0;
    if (isToday && !sameDayOk) continue;
    if (!isToday || !sameDayOk) {
      // Lead time: the day must end after the order is ready.
      const endOfDay = instantOf(date, 24 * 60, opts.tz);
      if (endOfDay.getTime() <= readyAt.getTime()) continue;
    }
    const slots = slotsFor(rules, date).filter((s) => {
      const start = instantOf(date, parseHM(s.from), opts.tz);
      const earliest = isToday && sameDayOk ? opts.now : readyAt;
      return start.getTime() >= earliest.getTime();
    });
    if ((rules.slots?.length ?? 0) > 0 && slots.length === 0) continue;
    out.push({ date, slots: slots.map((s) => s.id), sameDay: isToday && sameDayOk });
  }
  return out;
}

export function earliestDeliveryDate(rules: DeliveryRules, opts: DateOptions): DeliveryDate | null {
  return deliveryDates(rules, { ...opts, horizonDays: opts.horizonDays ?? 60 })[0] ?? null;
}

/** Checks a chosen date and slot against the same rules. */
export function validateDeliveryDate(rules: DeliveryRules, choice: { date?: LocalDate; slotId?: string }, opts: DateOptions): FulfilmentIssue[] {
  if (!choice.date) return rules.dateRequired ? [{ code: 'date_required' }] : [];
  const dates = deliveryDates(rules, { ...opts, horizonDays: opts.horizonDays ?? 90 });
  const hit = dates.find((d) => d.date === choice.date);
  if (!hit) return [{ code: 'date_unavailable', earliest: dates[0]?.date ?? null }];
  if ((rules.slots?.length ?? 0) > 0) {
    if (!choice.slotId) return [{ code: 'slot_required' }];
    if (!hit.slots.includes(choice.slotId)) return [{ code: 'slot_unavailable' }];
  }
  return [];
}

/** Adds working days: skips days not in `workingDays` and listed closures. n = 0 returns the date itself (or the next working day). */
export function addWorkingDays(date: LocalDate, n: number, workingDays: Weekday[], closed: LocalDate[] = []): LocalDate {
  const isWorking = (d: LocalDate) => workingDays.includes(weekdayOf(d)) && !closed.includes(d);
  let d = date;
  while (!isWorking(d)) d = addDays(d, 1);
  let left = n;
  while (left > 0) {
    d = addDays(d, 1);
    if (isWorking(d)) left--;
  }
  return d;
}

export interface ArrivalInput {
  now: Date;
  tz: TimeZone;
  dispatchDays: Weekday[];
  /** Orders before this time ship the same dispatch day. */
  cutoff: TimeHM;
  /** Extra dispatch days of preparation (hemming, personalisation). */
  leadDays?: number;
  transit: EtaDays;
  /** Days the courier delivers at the destination. */
  deliveryDays: Weekday[];
  closed?: LocalDate[];
}

/** The "arrives between …" window for a product or cart. */
export function arrivalWindow(input: ArrivalInput): { dispatch: LocalDate; from: LocalDate; to: LocalDate } {
  const { date, minutes, weekday } = zonedParts(input.now, input.tz);
  const closed = input.closed ?? [];
  const canShipToday = input.dispatchDays.includes(weekday) && !closed.includes(date) && minutes < parseHM(input.cutoff);
  let dispatch = canShipToday ? date : addWorkingDays(addDays(date, 1), 0, input.dispatchDays, closed);
  if (input.leadDays) dispatch = addWorkingDays(dispatch, input.leadDays, input.dispatchDays, closed);
  const from = addWorkingDays(addDays(dispatch, input.transit.min === 0 ? 0 : 1), Math.max(0, input.transit.min - 1), input.deliveryDays, closed);
  const to = addWorkingDays(addDays(dispatch, input.transit.max === 0 ? 0 : 1), Math.max(0, input.transit.max - 1), input.deliveryDays, closed);
  return { dispatch, from, to };
}
