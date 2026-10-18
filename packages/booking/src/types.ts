// The booking engine model: services, resources (staff, rooms, kitchen), rules and the day ledger.

import type { Bps, I18nText, LocalDate, Minor, Money, TimeHM, Weekday } from '@aw/core';
import type { WeeklyHours } from '@aw/core';

export type ResourceKind = 'staff' | 'room' | 'station' | 'kitchen';

export interface Resource {
  id: string;
  kind: ResourceKind;
  name: I18nText;
  /** Parallel bookings this resource can hold. */
  capacity: number;
  /** Service tags it can perform ('bridal-makeup', 'nails', …). */
  skills: string[];
  /** Defaults to venue hours. */
  weekly?: Partial<WeeklyHours>;
  daysOff: LocalDate[];
  active: boolean;
}

export interface ServiceRequirement {
  kind: ResourceKind;
  skill?: string;
  resourceIds?: string[];
}

export type DepositRule =
  | { kind: 'none' }
  | { kind: 'fixed'; amount: Money }
  | { kind: 'percent'; bps: Bps; min?: Money; max?: Money; roundUpTo: Minor };

export interface Service {
  id: string;
  slug: string;
  title: I18nText;
  summary: I18nText;
  category: string;
  durationMinutes: number;
  price: { kind: 'fixed' | 'from'; amount: Money };
  requires: ServiceRequirement[];
  deposit?: DepositRule;
  bookableOnline: boolean;
}

export interface SeasonalWindow {
  id: string;
  label: I18nText;
  /** The form starts accepting requests on this date. */
  opensOn: LocalDate;
  closesOn?: LocalDate;
  /** Appointment dates offered in this window. */
  eventFrom: LocalDate;
  eventTo: LocalDate;
  dailyCap?: number;
}

export interface BookingRules {
  slotStepMinutes: 5 | 10 | 15 | 30 | 60;
  lead: { minMinutes: number; sameDayCutoff?: TimeHM };
  horizonDays: number;
  buffers: { beforeMinutes: number; afterMinutes: number };
  dailyCap?: { default: number; byWeekday?: Partial<Record<Weekday, number>>; unit: 'bookings' | 'orders' | 'guests' };
  blackouts: Array<{ from: LocalDate; to: LocalDate; reason?: I18nText }>;
  /** Lite tier only: days the owner marked as full. */
  fullDates: LocalDate[];
  /** Non-empty ⇒ only dates inside an open window are bookable. */
  windows: SeasonalWindow[];
  deposit: DepositRule;
  cancellation: { freeUntilHours: number; depositRefundable: boolean };
  /** How long a slot is held while the deposit is paid. */
  holdMinutes: number;
}

export type BookingStatus = 'held' | 'pending_payment' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'expired';

/** What slot generation needs to know about an existing booking. */
export interface LedgerEntry {
  id: string;
  serviceId: string;
  businessDate: LocalDate;
  /** Occupied interval in business-day minutes, buffers included. */
  startMin: number;
  endMin: number;
  resources: string[];
  status: BookingStatus;
  holdUntil?: string;
  /** Units counted against the daily cap (orders, guests). Default 1. */
  units?: number;
}

export interface DayOverride {
  closed?: boolean;
  capOverride?: number;
}
