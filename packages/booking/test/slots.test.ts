import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { money, type HoursSettings } from '@aw/core';
import {
  calendarDays,
  computeDeposit,
  dayStatus,
  generateSlots,
  nextWindow,
  occupiedInterval,
  openWindows,
  type BookingRules,
  type LedgerEntry,
  type Resource,
  type Service,
} from '../src/index.ts';

const t = (ar: string, en = ar) => ({ ar, en });
const riyadh = (iso: string) => new Date(`${iso}+03:00`);
const sar = (n: number) => money(n, 'SAR');

const hours: HoursSettings = {
  weekly: {
    sat: [{ open: '14:00', close: '02:00' }],
    sun: [{ open: '14:00', close: '02:00' }],
    mon: [{ open: '14:00', close: '02:00' }],
    tue: [{ open: '14:00', close: '02:00' }],
    wed: [{ open: '14:00', close: '02:00' }],
    thu: [{ open: '14:00', close: '02:00' }],
    fri: [{ open: '16:00', close: '02:00' }],
  },
  seasons: [],
  exceptions: [],
};

const rules: BookingRules = {
  slotStepMinutes: 30,
  lead: { minMinutes: 180 },
  horizonDays: 45,
  buffers: { beforeMinutes: 0, afterMinutes: 10 },
  blackouts: [{ from: '2026-10-01', to: '2026-10-01' }],
  fullDates: [],
  windows: [],
  deposit: { kind: 'percent', bps: 3000, min: sar(5000), roundUpTo: 100 },
  cancellation: { freeUntilHours: 24, depositRefundable: false },
  holdMinutes: 15,
};

const staff = (id: string, skills: string[], extra: Partial<Resource> = {}): Resource => ({ id, kind: 'staff', name: t(id), capacity: 1, skills, daysOff: [], active: true, ...extra });
const room = (id: string, capacity = 1): Resource => ({ id, kind: 'room', name: t(id), capacity, skills: [], daysOff: [], active: true });

const resources: Resource[] = [staff('reem', ['bridal-makeup', 'evening-makeup']), staff('lama', ['evening-makeup', 'nails']), room('bridal-suite'), room('station', 3)];

const bridal: Service = {
  id: 'bridal',
  slug: 'bridal',
  title: t('باقة العروس'),
  summary: t(''),
  category: 'bridal',
  durationMinutes: 240,
  price: { kind: 'fixed', amount: sar(250000) },
  requires: [{ kind: 'staff', skill: 'bridal-makeup' }, { kind: 'room', resourceIds: ['bridal-suite'] }],
  bookableOnline: true,
};

const evening: Service = { ...bridal, id: 'evening', durationMinutes: 60, requires: [{ kind: 'staff', skill: 'evening-makeup' }, { kind: 'room', resourceIds: ['station'] }] };

const base = { rules, hours, resources, tz: 'Asia/Riyadh' as const, ledger: [] as LedgerEntry[] };

describe('generateSlots', () => {
  it('fits the duration plus buffer inside the opening range, including after midnight', () => {
    const slots = generateSlots({ ...base, date: '2026-09-24', service: evening, now: riyadh('2026-09-23T09:00:00') });
    expect(slots[0]).toMatchObject({ start: 14 * 60, resources: ['reem', 'station'] });
    const last = slots.at(-1)!;
    // Close 02:00 = 1560; 60 min + 10 buffer must end by 1560 → last start 1470 (00:30), on a 30 min step.
    expect(last.start).toBe(1470);
    expect(last.afterMidnight).toBe(true);
    expect(last.startAt).toBe('2026-09-24T21:30:00.000Z');
  });

  it('applies the minimum lead time', () => {
    const slots = generateSlots({ ...base, date: '2026-09-24', service: evening, now: riyadh('2026-09-24T15:10:00') });
    expect(slots[0]?.start).toBe(18 * 60 + 30); // 15:10 + 3 h = 18:10 → 18:30
  });

  it('needs the right skill and the right room', () => {
    const slots = generateSlots({ ...base, date: '2026-09-24', service: bridal, now: riyadh('2026-09-23T09:00:00') });
    expect(slots.every((s) => s.resources[0] === 'reem' && s.resources[1] === 'bridal-suite')).toBe(true);
    const lamaOnly = generateSlots({ ...base, date: '2026-09-24', service: bridal, staffId: 'lama', now: riyadh('2026-09-23T09:00:00') });
    expect(lamaOnly).toEqual([]);
  });

  it('falls back to the next qualified staff member when one is busy', () => {
    const ledger: LedgerEntry[] = [{ id: 'b1', serviceId: 'evening', businessDate: '2026-09-24', startMin: 14 * 60, endMin: 15 * 60 + 10, resources: ['reem', 'station'], status: 'confirmed' }];
    const slots = generateSlots({ ...base, ledger, date: '2026-09-24', service: evening, now: riyadh('2026-09-23T09:00:00') });
    expect(slots[0]).toMatchObject({ start: 14 * 60, resources: ['lama', 'station'] });
  });

  it('ignores expired holds and counts live ones', () => {
    const now = riyadh('2026-09-23T09:00:00');
    const held = (until: string): LedgerEntry => ({ id: 'h', serviceId: 'bridal', businessDate: '2026-09-24', startMin: 14 * 60, endMin: 18 * 60 + 10, resources: ['reem', 'bridal-suite'], status: 'held', holdUntil: until });
    const live = generateSlots({ ...base, ledger: [held('2026-09-23T06:10:00Z')], date: '2026-09-24', service: bridal, now });
    expect(live[0]?.start).toBeGreaterThanOrEqual(18 * 60 + 10);
    const expired = generateSlots({ ...base, ledger: [held('2026-09-23T05:59:00Z')], date: '2026-09-24', service: bridal, now });
    expect(expired[0]?.start).toBe(14 * 60);
  });

  it('respects staff days off and their own hours', () => {
    const r = [staff('reem', ['bridal-makeup'], { daysOff: ['2026-09-24'] }), room('bridal-suite')];
    expect(generateSlots({ ...base, resources: r, date: '2026-09-24', service: bridal, now: riyadh('2026-09-23T09:00:00') })).toEqual([]);
    const evenings = [staff('reem', ['bridal-makeup'], { weekly: { thu: [{ open: '18:00', close: '23:00' }] } }), room('bridal-suite')];
    const s = generateSlots({ ...base, resources: evenings, date: '2026-09-24', service: bridal, now: riyadh('2026-09-23T09:00:00') });
    expect(s.map((x) => x.start)).toEqual([18 * 60, 18 * 60 + 30]); // 4 h + 10 min buffer must end by 23:00
  });

  it('never double-books a resource (property)', () => {
    fc.assert(
      fc.property(fc.array(fc.nat(200), { minLength: 1, maxLength: 40 }), (picks) => {
        const now = riyadh('2026-09-23T09:00:00');
        const ledger: LedgerEntry[] = [];
        for (const p of picks) {
          const svc = p % 3 === 0 ? bridal : evening;
          const slots = generateSlots({ ...base, ledger, date: '2026-09-24', service: svc, now });
          if (!slots.length) continue;
          const s = slots[p % slots.length]!;
          ledger.push({ id: String(ledger.length), serviceId: svc.id, businessDate: '2026-09-24', ...occupiedInterval(rules, s.start, svc.durationMinutes), resources: s.resources, status: 'confirmed' });
        }
        for (const r of resources) {
          const mine = ledger.filter((e) => e.resources.includes(r.id));
          for (let m = 0; m < 26 * 60; m += 5) {
            const load = mine.filter((e) => e.startMin <= m && m < e.endMin).length;
            expect(load).toBeLessThanOrEqual(r.capacity);
          }
        }
      }),
      { numRuns: 60 },
    );
  });
});

describe('dayStatus', () => {
  const now = riyadh('2026-09-23T09:00:00');

  it('blocks past, horizon, blackout and closed days', () => {
    expect(dayStatus('2026-09-22', { ...base, now })).toEqual({ bookable: false, reason: 'past' });
    expect(dayStatus('2026-12-01', { ...base, now })).toEqual({ bookable: false, reason: 'horizon' });
    expect(dayStatus('2026-10-01', { ...base, now })).toEqual({ bookable: false, reason: 'blackout' });
    expect(dayStatus('2026-09-25', { ...base, now, override: { closed: true } })).toEqual({ bookable: false, reason: 'closed' });
  });

  it('enforces a daily cap by weekday (site 08)', () => {
    const capRules: BookingRules = { ...rules, dailyCap: { default: 6, byWeekday: { thu: 10, fri: 0 }, unit: 'orders' } };
    const ledger: LedgerEntry[] = Array.from({ length: 6 }, (_, i) => ({ id: `o${i}`, serviceId: 'cake', businessDate: '2026-09-26', startMin: 0, endMin: 0, resources: [], status: 'confirmed' as const }));
    expect(dayStatus('2026-09-26', { ...base, rules: capRules, now, ledger })).toEqual({ bookable: false, reason: 'cap_reached' });
    expect(dayStatus('2026-09-24', { ...base, rules: capRules, now, ledger })).toMatchObject({ bookable: true, cap: 10, remaining: 10 });
    expect(dayStatus('2026-09-25', { ...base, rules: capRules, now, ledger })).toEqual({ bookable: false, reason: 'cap_reached' });
    expect(dayStatus('2026-09-26', { ...base, rules: capRules, now, ledger, override: { capOverride: 8 } })).toMatchObject({ bookable: true, remaining: 2 });
  });

  it('only allows dates inside an open seasonal window (site 11)', () => {
    const henna: BookingRules = {
      ...rules,
      lead: { minMinutes: 0 },
      horizonDays: 120,
      fullDates: ['2027-03-07'],
      windows: [
        { id: 'eid-fitr', label: t('عيد الفطر'), opensOn: '2027-02-01', closesOn: '2027-03-05', eventFrom: '2027-03-06', eventTo: '2027-03-10', dailyCap: 4 },
        { id: 'weddings', label: t('موسم الأعراس'), opensOn: '2026-09-01', eventFrom: '2026-10-01', eventTo: '2026-12-31' },
      ],
    };
    const ctx = { ...base, rules: { ...henna, blackouts: [] }, now };
    expect(openWindows(henna, '2026-09-23').map((w) => w.id)).toEqual(['weddings']);
    expect(nextWindow(henna, '2026-09-23')?.id).toBe('eid-fitr');
    expect(dayStatus('2026-10-05', ctx)).toMatchObject({ bookable: true });
    expect(dayStatus('2026-09-28', ctx)).toEqual({ bookable: false, reason: 'outside_window' });
    const inEid = { ...ctx, now: riyadh('2027-02-10T10:00:00') };
    expect(dayStatus('2027-03-08', inEid)).toMatchObject({ bookable: true, cap: 4 });
    expect(dayStatus('2027-03-07', inEid)).toEqual({ bookable: false, reason: 'full_marked' });
  });

  it('builds calendar runs', () => {
    const days = calendarDays('2026-09-23', 3, { ...base, now });
    expect(days.map((d) => d.status.bookable)).toEqual([true, true, true]);
  });
});

describe('computeDeposit', () => {
  it('rounds a percentage up to whole riyals and applies the minimum', () => {
    expect(computeDeposit(sar(24500), rules.deposit).minor).toBe(7400);
    expect(computeDeposit(sar(10000), rules.deposit).minor).toBe(5000); // 30.00 → min 50.00
    expect(computeDeposit(sar(3000), rules.deposit).minor).toBe(3000); // never above the price
  });

  it('handles fixed and none', () => {
    expect(computeDeposit(sar(250000), { kind: 'fixed', amount: sar(50000) }).minor).toBe(50000);
    expect(computeDeposit(sar(250000), { kind: 'none' }).minor).toBe(0);
    expect(computeDeposit(sar(25000), { kind: 'percent', bps: 5000, min: sar(10000), roundUpTo: 100 }).minor).toBe(12500);
  });
});
