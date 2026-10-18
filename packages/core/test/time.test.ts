import { describe, expect, it } from 'vitest';
import {
  addDays,
  diffDays,
  formatHM,
  instantOf,
  isLocalDate,
  isOpenAt,
  nextOpening,
  parseHM,
  rangesForDate,
  toLocalDate,
  validateHours,
  weekdayOf,
  zonedParts,
  type HoursSettings,
} from '../src/index.ts';

describe('calendar helpers', () => {
  it('validates dates', () => {
    expect(isLocalDate('2026-02-28')).toBe(true);
    expect(isLocalDate('2026-02-29')).toBe(false);
    expect(isLocalDate('2028-02-29')).toBe(true);
    expect(isLocalDate('2026-9-1')).toBe(false);
  });

  it('adds days across months and years', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(diffDays('2026-09-23', '2026-10-01')).toBe(8);
  });

  it('knows weekdays', () => {
    expect(weekdayOf('2026-09-24')).toBe('thu');
    expect(weekdayOf('2026-09-28')).toBe('mon');
  });

  it('parses and formats HH:MM', () => {
    expect(parseHM('14:30')).toBe(870);
    expect(() => parseHM('24:00')).toThrow();
    expect(() => parseHM('9:00')).toThrow();
    expect(formatHM(1470)).toBe('00:30');
  });
});

describe('zones', () => {
  it('runs with a machine zone far from the Gulf', () => {
    // vitest.config sets TZ; this guards against someone removing it.
    expect(process.env.TZ).toBeTruthy();
  });

  it('reads wall-clock time in the site zone', () => {
    const instant = new Date('2026-09-23T21:30:00Z');
    expect(zonedParts(instant, 'Asia/Bahrain')).toMatchObject({ date: '2026-09-24', minutes: 30, weekday: 'thu' });
    expect(toLocalDate(instant, 'Asia/Baghdad')).toBe('2026-09-24');
  });

  it('finds the instant for a local time, including after-midnight business minutes', () => {
    expect(instantOf('2026-09-24', 14 * 60, 'Asia/Riyadh').toISOString()).toBe('2026-09-24T11:00:00.000Z');
    expect(instantOf('2026-09-24', 1470, 'Asia/Riyadh').toISOString()).toBe('2026-09-24T21:30:00.000Z');
  });

  it('handles a zone with daylight saving (site 14 in Amman)', () => {
    // Jordan is UTC+3 all year since 2022, so use Cairo-like behaviour through America/New_York instead.
    const t = instantOf('2026-03-08', 3 * 60, 'America/New_York');
    expect(zonedParts(t, 'America/New_York').minutes).toBe(3 * 60);
  });
});

const salon: HoursSettings = {
  weekly: {
    sat: [{ open: '14:00', close: '02:00' }],
    sun: [{ open: '14:00', close: '02:00' }],
    mon: [{ open: '14:00', close: '02:00' }],
    tue: [{ open: '14:00', close: '02:00' }],
    wed: [{ open: '14:00', close: '02:00' }],
    thu: [{ open: '14:00', close: '02:00' }],
    fri: [{ open: '16:00', close: '02:00' }],
  },
  seasons: [
    {
      id: 'ramadan-1448',
      label: { ar: 'رمضان', en: 'Ramadan' },
      from: '2027-02-08',
      to: '2027-03-08',
      weekly: { all: [{ open: '21:00', close: '03:00' }] },
      approximate: true,
    },
  ],
  exceptions: [{ date: '2027-03-09', closed: true }],
};

const riyadh = (iso: string) => new Date(`${iso}+03:00`);

describe('hours crossing midnight', () => {
  it('is open on Friday 01:30 because Thursday runs to 02:00', () => {
    expect(isOpenAt(salon, riyadh('2026-09-25T01:30:00'), 'Asia/Riyadh')).toBe(true);
  });

  it('is closed on Friday 02:30 and Friday 15:00, open Friday 16:00', () => {
    expect(isOpenAt(salon, riyadh('2026-09-25T02:30:00'), 'Asia/Riyadh')).toBe(false);
    expect(isOpenAt(salon, riyadh('2026-09-25T15:00:00'), 'Asia/Riyadh')).toBe(false);
    expect(isOpenAt(salon, riyadh('2026-09-25T16:00:00'), 'Asia/Riyadh')).toBe(true);
  });

  it('applies seasons over weekly hours and exceptions over both', () => {
    expect(rangesForDate(salon, '2027-02-10')).toEqual([{ open: '21:00', close: '03:00' }]);
    expect(isOpenAt(salon, riyadh('2027-02-10T15:00:00'), 'Asia/Riyadh')).toBe(false);
    expect(isOpenAt(salon, riyadh('2027-02-11T02:30:00'), 'Asia/Riyadh')).toBe(true);
    expect(rangesForDate(salon, '2027-03-09')).toEqual([]);
    // The Ramadan tail of 8 March still runs into the early hours of the Eid exception day.
    expect(isOpenAt(salon, riyadh('2027-03-09T02:00:00'), 'Asia/Riyadh')).toBe(true);
  });

  it('finds the next opening', () => {
    const o = nextOpening(salon, riyadh('2026-09-25T03:00:00'), 'Asia/Riyadh');
    expect(o?.date).toBe('2026-09-25');
    expect(o?.opensAt.toISOString()).toBe('2026-09-25T13:00:00.000Z');
    // While open after midnight, the current range (yesterday's) is returned.
    const now = nextOpening(salon, riyadh('2026-09-25T01:00:00'), 'Asia/Riyadh');
    expect(now?.date).toBe('2026-09-24');
  });

  it('validates hours', () => {
    expect(validateHours(salon)).toEqual([]);
    const bad: HoursSettings = {
      ...salon,
      weekly: {
        ...salon.weekly,
        mon: [{ open: '10:00', close: '13:00' }, { open: '12:00', close: '18:00' }],
        // Tuesday's after-midnight tail runs to 02:00, past Wednesday's 01:00 opening.
        wed: [{ open: '01:00', close: '05:00' }],
      },
    };
    const issues = validateHours(bad);
    expect(issues.map((i) => i.path)).toEqual(expect.arrayContaining(['weekly.mon', 'weekly.tue']));
  });
});
