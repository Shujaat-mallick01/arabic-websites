import { WEEKDAYS, rangesForBusinessDay, type HoursSettings } from '@aw/core';

const SAMPLE = { sat: '2026-01-03', sun: '2026-01-04', mon: '2026-01-05', tue: '2026-01-06', wed: '2026-01-07', thu: '2026-01-08', fri: '2026-01-09' } as const;

/** The latest closing time in the weekly table, in business-day minutes (over 1440 = after midnight). */
export function latestClose(h: HoursSettings): number {
  return Math.max(0, ...WEEKDAYS.flatMap((d) => rangesForBusinessDay({ ...h, seasons: [], exceptions: [] }, SAMPLE[d]).map((r) => r.end)));
}
