// Opening hours, including ranges that cross midnight.
// A range belongs to the business day it opens on: Thu 14:00–02:00 covers Thu 14:00 → Fri 02:00.

import type { I18nText, LocalDate, TimeHM, TimeZone, Weekday } from './types.ts';
import { WEEKDAYS } from './types.ts';
import { addDays, instantOf, isBetween, parseHM, weekdayOf, zonedParts } from './time.ts';

export interface TimeRange {
  open: TimeHM;
  /** close <= open means the range ends on the next calendar day. '00:00'-'00:00' = 24 hours. */
  close: TimeHM;
}

export type WeeklyHours = Record<Weekday, TimeRange[]>;

export interface HoursSeason {
  id: string;
  label: I18nText;
  from: LocalDate;
  to: LocalDate;
  weekly: Partial<WeeklyHours> & { all?: TimeRange[] };
  approximate: boolean;
}

export interface HoursException {
  date: LocalDate;
  closed?: boolean;
  ranges?: TimeRange[];
  note?: I18nText;
}

export interface HoursSettings {
  weekly: WeeklyHours;
  seasons: HoursSeason[];
  exceptions: HoursException[];
  note?: I18nText;
}

/** A range in business-day minutes: start 0..1439, end may exceed 1440. */
export interface MinuteRange {
  start: number;
  end: number;
}

export function rangeToMinutes(r: TimeRange): MinuteRange {
  const start = parseHM(r.open);
  let end = parseHM(r.close);
  if (end <= start) end += 1440;
  return { start, end };
}

/** Which ranges apply on a business day: exceptions beat seasons, seasons beat the weekly table. */
export function rangesForDate(hours: HoursSettings, date: LocalDate): TimeRange[] {
  const ex = hours.exceptions.find((e) => e.date === date);
  if (ex) {
    if (ex.closed) return [];
    if (ex.ranges) return ex.ranges;
  }
  const wd = weekdayOf(date);
  const season = hours.seasons.find((s) => isBetween(date, s.from, s.to));
  if (season) {
    const byDay = season.weekly[wd];
    if (byDay) return byDay;
    if (season.weekly.all) return season.weekly.all;
  }
  return hours.weekly[wd] ?? [];
}

export function rangesForBusinessDay(hours: HoursSettings, date: LocalDate): MinuteRange[] {
  return rangesForDate(hours, date)
    .map(rangeToMinutes)
    .sort((a, b) => a.start - b.start);
}

/** Is the business open at this instant? Checks today's ranges and yesterday's after-midnight tails. */
export function isOpenAt(hours: HoursSettings, instant: Date, tz: TimeZone | string): boolean {
  const { date, minutes } = zonedParts(instant, tz);
  for (const r of rangesForBusinessDay(hours, date)) {
    if (minutes >= r.start && minutes < r.end) return true;
  }
  const yesterday = addDays(date, -1);
  for (const r of rangesForBusinessDay(hours, yesterday)) {
    if (r.end > 1440 && minutes + 1440 >= r.start && minutes + 1440 < r.end) return true;
  }
  return false;
}

export interface Opening {
  /** Business day the range belongs to. */
  date: LocalDate;
  range: MinuteRange;
  opensAt: Date;
  closesAt: Date;
}

/** The current or next opening range at or after `instant`, searching `horizonDays` ahead. */
export function nextOpening(
  hours: HoursSettings,
  instant: Date,
  tz: TimeZone | string,
  horizonDays = 14,
): Opening | null {
  const { date } = zonedParts(instant, tz);
  for (let i = -1; i <= horizonDays; i++) {
    const d = addDays(date, i);
    for (const r of rangesForBusinessDay(hours, d)) {
      const opensAt = instantOf(d, r.start, tz);
      const closesAt = instantOf(d, r.end, tz);
      if (closesAt.getTime() > instant.getTime()) return { date: d, range: r, opensAt, closesAt };
    }
  }
  return null;
}

export interface HoursIssue {
  path: string;
  message: I18nText;
}

function validateDay(ranges: TimeRange[], path: string, issues: HoursIssue[]): void {
  if (ranges.length > 2) {
    issues.push({ path, message: { ar: 'يُسمح بفترتين كحد أقصى في اليوم.', en: 'At most two ranges per day.' } });
  }
  const mins = ranges.map(rangeToMinutes).sort((a, b) => a.start - b.start);
  for (let i = 1; i < mins.length; i++) {
    if (mins[i]!.start < mins[i - 1]!.end) {
      issues.push({ path, message: { ar: 'الفترات متداخلة في نفس اليوم.', en: 'Ranges overlap on the same day.' } });
    }
  }
}

/** Structural checks. Returns an empty list when the hours are consistent. */
export function validateHours(hours: HoursSettings): HoursIssue[] {
  const issues: HoursIssue[] = [];
  for (const wd of WEEKDAYS) validateDay(hours.weekly[wd] ?? [], `weekly.${wd}`, issues);
  // A cross-midnight close must not run past the next day's first opening.
  for (let i = 0; i < WEEKDAYS.length; i++) {
    const wd = WEEKDAYS[i]!;
    const next = WEEKDAYS[(i + 1) % WEEKDAYS.length]!;
    const tails = (hours.weekly[wd] ?? []).map(rangeToMinutes).filter((r) => r.end > 1440);
    const firstNext = (hours.weekly[next] ?? []).map(rangeToMinutes).sort((a, b) => a.start - b.start)[0];
    for (const t of tails) {
      if (firstNext && t.end - 1440 > firstNext.start) {
        issues.push({
          path: `weekly.${wd}`,
          message: {
            ar: 'وقت الإغلاق بعد منتصف الليل يتجاوز بداية دوام اليوم التالي.',
            en: 'The after-midnight close runs past the next day’s opening.',
          },
        });
      }
    }
  }
  hours.seasons.forEach((s, i) => {
    if (s.from > s.to) {
      issues.push({ path: `seasons.${i}`, message: { ar: 'تاريخ البداية بعد تاريخ النهاية.', en: 'Start date is after end date.' } });
    }
    for (const [k, v] of Object.entries(s.weekly)) if (v) validateDay(v, `seasons.${i}.weekly.${k}`, issues);
  });
  hours.exceptions.forEach((e, i) => {
    if (e.ranges) validateDay(e.ranges, `exceptions.${i}`, issues);
  });
  return issues;
}
