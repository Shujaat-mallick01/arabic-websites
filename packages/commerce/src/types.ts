// The normalised commerce model. Every niche's CMS fields become these shapes,
// so one cart, one quote and one checkout serve all of them.

import type { CurrencyCode, GccCountry, I18nText, LocalDate, Money, TimeHM, Weekday } from '@aw/core';

export type ProductOption =
  | {
      kind: 'choice';
      id: string;
      label: I18nText;
      required: boolean;
      display: 'buttons' | 'swatches' | 'select';
      choices: Array<{ id: string; label: I18nText; price?: Money; delta?: Money; stockKey?: string; swatch?: string }>;
    }
  | { kind: 'text'; id: string; label: I18nText; required: boolean; maxLength: number; hint?: I18nText; price?: Money }
  | { kind: 'date'; id: string; label: I18nText; required: boolean; leadDays: number; maxDaysAhead: number }
  | { kind: 'file'; id: string; label: I18nText; required: boolean; maxMb: number }
  | {
      kind: 'addons';
      id: string;
      label: I18nText;
      items: Array<{ id: string; label: I18nText; unitPrice: Money; maxQty: number }>;
    };

export interface QuantityRule {
  min: number;
  step: number;
  max?: number;
  tiers?: Array<{ minQty: number; unitPrice: Money }>;
}

export type Availability = 'in_stock' | 'ready_now' | 'made_to_order' | 'preorder' | 'sold_out';

/** Image reference kept generic: Astro passes ImageMetadata, functions pass nothing. */
export interface ProductImage<Src = unknown> {
  src: Src;
  alt?: I18nText;
}

export interface Product<Src = unknown> {
  id: string;
  slug: string;
  title: I18nText;
  summary: I18nText;
  description: I18nText;
  price: Money;
  compareAt?: Money;
  category: string;
  tags: string[];
  images: ProductImage<Src>[];
  options: ProductOption[];
  quantity: QuantityRule;
  availability: Availability;
  /** Tags that change the lead time, e.g. 'personalised' → 48 h. */
  leadTags: string[];
  /** Niche attributes: notes pyramid, inclusions, serves… */
  attributes: Record<string, unknown>;
  featured?: boolean;
  order?: number;
}

/** What a shopper picked for a line: option id → choice id / text / date / upload key. */
export type Selection = Record<string, string>;

export interface CartLine {
  productId: string;
  selection: Selection;
  qty: number;
  /** Add-on item id → quantity, for an 'addons' option. */
  addons?: Record<string, number>;
}

export interface EtaDays {
  min: number;
  max: number;
}

export interface Zone {
  id: string;
  kind: 'governorate' | 'province' | 'district' | 'area' | 'custom';
  name: I18nText;
  fee: Money;
  freeOver?: Money;
  minOrder?: Money;
  eta: EtaDays;
  codAllowed: boolean;
  active: boolean;
}

export interface DeliverySlot {
  id: string;
  label: I18nText;
  from: TimeHM;
  to: TimeHM;
  capacity?: number;
  days?: Weekday[];
}

export interface DeliveryRules {
  zones: Zone[];
  deliveryDays: Weekday[];
  leadTime: { standardHours: number; byTag: Record<string, number> };
  dateRequired: boolean;
  /** Orders after this time are dispatched on the next delivery day. */
  dispatchCutoff?: TimeHM;
  slots?: DeliverySlot[];
  sameDay?: { cutoff: TimeHM; zones: string[] | 'all'; fee?: Money };
  blackouts?: LocalDate[];
}

export interface ShippingCountry {
  code: GccCountry;
  fee: Money;
  freeOver?: Money;
  eta: EtaDays;
  active: boolean;
}

export interface Branch {
  id: string;
  name: I18nText;
}

export interface FulfilmentRules {
  currency: CurrencyCode;
  delivery?: DeliveryRules;
  shipping?: { countries: ShippingCountry[]; dutiesNote: I18nText };
  pickup?: { branches: Branch[]; readyInHours: number; holdDays: number; fee: Money };
  cod?: { enabled: boolean; fee?: Money; maxOrder?: Money; scope: 'delivery' | 'delivery+pickup'; zones: string[] | 'all' };
  deliveryInfo: I18nText;
}

export interface CheckoutRules {
  minOrder?: Money;
  giftWrap?: { price: Money; cardMaxLength: number };
  notesMaxLength: number;
  /** VAT rate in bps when prices include VAT (0 or undefined: no VAT line). */
  vatBps?: number;
}

export type FulfilmentChoice =
  | { kind: 'delivery'; zoneId: string; date?: LocalDate; slotId?: string }
  | { kind: 'shipping'; country: GccCountry }
  | { kind: 'pickup'; branchId: string; date?: LocalDate };
