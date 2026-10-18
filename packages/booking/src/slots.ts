// Slot generation and day availability. Pure: the browser shows the same slots the function enforces.

import {
  addDays,
  allocateBps,
  compare,
  instantOf,
  isBetween,
  money,
  parseHM,
  rangesForBusinessDay,
  rangeToMinutes,
  weekdayOf,
  zonedParts,
  type HoursSettings,
  type LocalDate,
  type Money,
  type TimeZone,
} from '@aw/core';
import type { BookingRules, DayOverride, DepositRule, LedgerEntry, Resource, SeasonalWindow, Service } from './types.ts';

/** Entries that still occupy capacity at `now`: confirmed or completed, or holds that haven't expired. */
export function isActive(e: LedgerEntry, now: Date): boolean {
  if (e.status === 'confirmed' || e.status === 'completed') return true;
  if (e.status === 'held' || e.status === 'pending_payment') return !!e.holdUntil && Date.parse(e.holdUntil) > now.getTime();
  return false;
}

/** Windows whose request period is open today. */
export function openWindows(rules: BookingRules, today: LocalDate): SeasonalWindow[] {
  return rules.windows.filter((w) => today >= w.opensOn && (!w.closesOn || today <= w.closesOn));
}

/** The next window that will open, for "booking opens on …" copy. */
export function nextWindow(rules: BookingRules, today: LocalDate): SeasonalWindow | undefined {
  return [...rules.windows].filter((w) => w.opensOn > today).sort((a, b) => (a.opensOn < b.opensOn ? -1 : 1))[0];
}

export type DayStatus =
  | { bookable: true; cap?: number; used: number; remaining?: number; window?: SeasonalWindow }
  | { bookable: false; reason: 'past' | 'lead' | 'horizon' | 'blackout' | 'full_marked' | 'outside_window' | 'closed' | 'cap_reached' | 'no_hours' };

export interface DayContext {
  rules: BookingRules;
  hours?: HoursSettings;
  now: Date;
  tz: TimeZone;
  ledger: LedgerEntry[];
  override?: DayOverride;
}

function capFor(rules: BookingRules, date: LocalDate, window?: SeasonalWindow, override?: DayOverride): number | undefined {
  if (override?.capOverride !== undefined) return override.capOverride;
  if (window?.dailyCap !== undefined) return window.dailyCap;
  if (!rules.dailyCap) return undefined;
  return rules.dailyCap.byWeekday?.[weekdayOf(date)] ?? rules.dailyCap.default;
}

/** Whether a business date can take bookings at all, before looking at slots. */
export function dayStatus(date: LocalDate, ctx: DayContext): DayStatus {
  const { rules, now, tz } = ctx;
  const today = zonedParts(now, tz).date;
  if (date < today) return { bookable: false, reason: 'past' };
  if (date > addDays(today, rules.horizonDays)) return { bookable: false, reason: 'horizon' };
  // Day-level lead: the whole day must not end before the minimum notice.
  const endOfDay = instantOf(date, 24 * 60, tz);
  if (endOfDay.getTime() <= now.getTime() + rules.lead.minMinutes * 60_000) return { bookable: false, reason: 'lead' };
  if (date === today && rules.lead.sameDayCutoff) {
    if (zonedParts(now, tz).minutes >= parseHM(rules.lead.sameDayCutoff)) return { bookable: false, reason: 'lead' };
  }
  if (rules.blackouts.some((b) => isBetween(date, b.from, b.to))) return { bookable: false, reason: 'blackout' };
  if (rules.fullDates.includes(date)) return { bookable: false, reason: 'full_marked' };
  if (ctx.override?.closed) return { bookable: false, reason: 'closed' };
  let window: SeasonalWindow | undefined;
  if (rules.windows.length > 0) {
    window = openWindows(rules, today).find((w) => isBetween(date, w.eventFrom, w.eventTo));
    if (!window) return { bookable: false, reason: 'outside_window' };
  }
  if (ctx.hours && rangesForBusinessDay(ctx.hours, date).length === 0) return { bookable: false, reason: 'no_hours' };
  const cap = capFor(rules, date, window, ctx.override);
  const used = ctx.ledger.filter((e) => e.businessDate === date && isActive(e, now)).reduce((n, e) => n + (e.units ?? 1), 0);
  if (cap !== undefined && used >= cap) return { bookable: false, reason: 'cap_reached' };
  return { bookable: true, ...(cap !== undefined ? { cap, remaining: cap - used } : {}), used, ...(window ? { window } : {}) };
}

export interface Slot {
  /** Business-day minutes; may exceed 1440 after midnight. */
  start: number;
  end: number;
  startAt: string;
  endAt: string;
  /** One resource id per requirement, in requirement order. */
  resources: string[];
  /** The slot starts after midnight (shown as "فجر الجمعة"). */
  afterMidnight: boolean;
}

export interface SlotInput extends DayContext {
  date: LocalDate;
  service: Service;
  resources: Resource[];
  hours: HoursSettings;
  /** Preferred staff member; restricts staff requirements to this id. */
  staffId?: string;
}

function resourceRanges(r: Resource, hours: HoursSettings, date: LocalDate): Array<{ start: number; end: number }> | null {
  if (!r.weekly) return null; // follows venue hours
  const wd = weekdayOf(date);
  const day = r.weekly[wd];
  if (!day) return null;
  return day.map(rangeToMinutes);
}

function overlaps(a0: number, a1: number, b0: number, b1: number): boolean {
  return a0 < b1 && b0 < a1;
}

/** Bookable start times for a service on a business date, with a concrete resource for each requirement. */
export function generateSlots(input: SlotInput): Slot[] {
  const status = dayStatus(input.date, input);
  if (!status.bookable) return [];
  const { rules, service, now, tz, date } = input;
  const step = rules.slotStepMinutes;
  const before = rules.buffers.beforeMinutes;
  const after = rules.buffers.afterMinutes;
  const dur = service.durationMinutes;
  const earliestAt = now.getTime() + rules.lead.minMinutes * 60_000;
  const active = input.ledger.filter((e) => e.businessDate === date && isActive(e, now));

  const candidatesFor = (req: Service['requires'][number]) =>
    input.resources.filter(
      (r) =>
        r.active &&
        r.kind === req.kind &&
        !r.daysOff.includes(date) &&
        (!req.skill || r.skills.includes(req.skill)) &&
        (!req.resourceIds || req.resourceIds.includes(r.id)) &&
        (req.kind !== 'staff' || !input.staffId || r.id === input.staffId),
    );
  const pools = service.requires.map(candidatesFor);
  if (pools.some((p) => p.length === 0)) return [];

  const free = (r: Resource, occ0: number, occ1: number, taken: string[]): boolean => {
    const own = resourceRanges(r, input.hours, date);
    if (own && !own.some((rg) => occ0 >= rg.start && occ1 <= rg.end)) return false;
    const load = active.filter((e) => e.resources.includes(r.id) && overlaps(occ0, occ1, e.startMin, e.endMin)).length;
    const alsoNow = taken.filter((id) => id === r.id).length;
    return load + alsoNow < r.capacity;
  };

  const slots: Slot[] = [];
  for (const range of rangesForBusinessDay(input.hours, date)) {
    for (let start = range.start; start + dur <= range.end; start += step) {
      const occ0 = start - before;
      const occ1 = start + dur + after;
      if (occ0 < range.start || occ1 > range.end) continue;
      const startAt = instantOf(date, start, tz);
      if (startAt.getTime() < earliestAt) continue;
      const picked: string[] = [];
      let ok = true;
      for (const pool of pools) {
        const r = pool.find((c) => free(c, occ0, occ1, picked));
        if (!r) {
          ok = false;
          break;
        }
        picked.push(r.id);
      }
      if (!ok) continue;
      slots.push({
        start,
        end: start + dur,
        startAt: startAt.toISOString(),
        endAt: instantOf(date, start + dur, tz).toISOString(),
        resources: picked,
        afterMidnight: start >= 1440,
      });
    }
  }
  return slots;
}

/** The occupied interval a new booking will take in the ledger. */
export function occupiedInterval(rules: BookingRules, start: number, durationMinutes: number): { startMin: number; endMin: number } {
  return { startMin: start - rules.buffers.beforeMinutes, endMin: start + durationMinutes + rules.buffers.afterMinutes };
}

/** Deposit for a price: fixed, or a percentage rounded UP to `roundUpTo`, clamped to min/max and never above the price. */
export function computeDeposit(price: Money, rule: DepositRule): Money {
  if (rule.kind === 'none') return money(0, price.currency);
  if (rule.kind === 'fixed') return compare(rule.amount, price) > 0 ? price : rule.amount;
  let { part } = allocateBps(price, rule.bps, 'up-to-step', Math.max(1, rule.roundUpTo));
  if (rule.min && compare(part, rule.min) < 0) part = rule.min;
  if (rule.max && compare(part, rule.max) > 0) part = rule.max;
  if (compare(part, price) > 0) part = price;
  return part;
}

export interface CalendarDay {
  date: LocalDate;
  status: DayStatus;
}

/** A run of days for the calendar UI. */
export function calendarDays(from: LocalDate, count: number, ctx: DayContext & { overrides?: Record<LocalDate, DayOverride> }): CalendarDay[] {
  const out: CalendarDay[] = [];
  for (let i = 0; i < count; i++) {
    const date = addDays(from, i);
    out.push({ date, status: dayStatus(date, { ...ctx, override: ctx.overrides?.[date] ?? ctx.override }) });
  }
  return out;
}
