// Line pricing and validation. Pure functions shared by the browser (display) and functions (authority).

import { add, addDays, compare, isLocalDate, money, mul, sum, type I18nText, type LocalDate, type Money } from '@aw/core';
import type { CartLine, Product, ProductOption, QuantityRule } from './types.ts';

export type LineIssue =
  | { code: 'unknown_product' }
  | { code: 'sold_out' }
  | { code: 'choice_required'; optionId: string; label: I18nText }
  | { code: 'choice_invalid'; optionId: string; label: I18nText }
  | { code: 'text_required'; optionId: string; label: I18nText }
  | { code: 'text_too_long'; optionId: string; label: I18nText; got: number; max: number }
  | { code: 'date_required'; optionId: string; label: I18nText }
  | { code: 'date_invalid'; optionId: string; label: I18nText }
  | { code: 'date_too_soon'; optionId: string; label: I18nText; earliest: LocalDate }
  | { code: 'date_too_far'; optionId: string; label: I18nText; latest: LocalDate }
  | { code: 'file_required'; optionId: string; label: I18nText }
  | { code: 'qty_min'; min: number; diff: number }
  | { code: 'qty_step'; step: number }
  | { code: 'qty_max'; max: number }
  | { code: 'addon_invalid'; optionId: string; itemId: string };

/** Base unit price for a quantity: the best matching tier, else the product price. */
export function tierUnitPrice(product: Pick<Product, 'price' | 'quantity'>, qty: number): Money {
  const tiers = [...(product.quantity.tiers ?? [])].sort((a, b) => a.minQty - b.minQty);
  let unit = product.price;
  for (const t of tiers) if (qty >= t.minQty) unit = t.unitPrice;
  return unit;
}

export interface LinePrice {
  unit: Money;
  addons: Money;
  total: Money;
  /** Selected labels for messages and order lines: option label → value label. */
  labels: Array<{ optionId: string; label: I18nText; value: I18nText }>;
}

/**
 * Prices one line. Choice prices: `price` replaces the base unit (bottle size, tray, cake size);
 * `delta` adds to it. Paid text options (personalisation) add their price when filled.
 * Tiers set the base unit by quantity. Add-ons are added once per line, not per unit.
 */
export function priceLine(product: Product, line: Pick<CartLine, 'selection' | 'qty' | 'addons'>): LinePrice {
  let unit = tierUnitPrice(product, line.qty);
  const labels: LinePrice['labels'] = [];
  const zero = money(0, product.price.currency);
  let addonsTotal = zero;
  for (const opt of product.options) {
    const value = line.selection[opt.id];
    if (opt.kind === 'choice') {
      const ch = opt.choices.find((c) => c.id === value);
      if (!ch) continue;
      if (ch.price) unit = ch.price;
      if (ch.delta) unit = add(unit, ch.delta);
      labels.push({ optionId: opt.id, label: opt.label, value: ch.label });
    } else if (opt.kind === 'text') {
      if (value?.trim()) {
        if (opt.price) unit = add(unit, opt.price);
        labels.push({ optionId: opt.id, label: opt.label, value: { ar: value.trim(), en: value.trim() } });
      }
    } else if (opt.kind === 'date') {
      if (value) labels.push({ optionId: opt.id, label: opt.label, value: { ar: value, en: value } });
    } else if (opt.kind === 'addons') {
      const parts: Money[] = [];
      for (const item of opt.items) {
        const q = line.addons?.[item.id] ?? 0;
        if (q > 0) parts.push(mul(item.unitPrice, Math.min(q, item.maxQty)));
      }
      addonsTotal = add(addonsTotal, sum(parts, product.price.currency));
    }
  }
  return { unit, addons: addonsTotal, total: add(mul(unit, line.qty), addonsTotal), labels };
}

export function validateQuantity(rule: QuantityRule, qty: number, maxPerLine?: number): LineIssue[] {
  const issues: LineIssue[] = [];
  if (!Number.isSafeInteger(qty) || qty < rule.min) issues.push({ code: 'qty_min', min: rule.min, diff: Math.max(rule.min - (qty || 0), 1) });
  else if (rule.step > 1 && (qty - rule.min) % rule.step !== 0) issues.push({ code: 'qty_step', step: rule.step });
  const max = Math.min(rule.max ?? Infinity, maxPerLine ?? Infinity);
  if (Number.isFinite(max) && qty > max) issues.push({ code: 'qty_max', max });
  return issues;
}

function validateOption(opt: ProductOption, line: Pick<CartLine, 'selection' | 'addons'>, today: LocalDate): LineIssue[] {
  const v = line.selection[opt.id];
  switch (opt.kind) {
    case 'choice':
      if (!v) return opt.required ? [{ code: 'choice_required', optionId: opt.id, label: opt.label }] : [];
      return opt.choices.some((c) => c.id === v) ? [] : [{ code: 'choice_invalid', optionId: opt.id, label: opt.label }];
    case 'text': {
      const s = v?.trim() ?? '';
      if (!s) return opt.required ? [{ code: 'text_required', optionId: opt.id, label: opt.label }] : [];
      const len = [...s].length;
      return len > opt.maxLength ? [{ code: 'text_too_long', optionId: opt.id, label: opt.label, got: len, max: opt.maxLength }] : [];
    }
    case 'date': {
      if (!v) return opt.required ? [{ code: 'date_required', optionId: opt.id, label: opt.label }] : [];
      if (!isLocalDate(v)) return [{ code: 'date_invalid', optionId: opt.id, label: opt.label }];
      const earliest = addDays(today, opt.leadDays);
      const latest = addDays(today, opt.maxDaysAhead);
      if (v < earliest) return [{ code: 'date_too_soon', optionId: opt.id, label: opt.label, earliest }];
      if (v > latest) return [{ code: 'date_too_far', optionId: opt.id, label: opt.label, latest }];
      return [];
    }
    case 'file':
      return !v && opt.required ? [{ code: 'file_required', optionId: opt.id, label: opt.label }] : [];
    case 'addons':
      for (const [id, q] of Object.entries(line.addons ?? {})) {
        const item = opt.items.find((i) => i.id === id);
        if (!item || !Number.isSafeInteger(q) || q < 0 || q > item.maxQty) return [{ code: 'addon_invalid', optionId: opt.id, itemId: id }];
      }
      return [];
  }
}

/** Every problem with a line, so the form can show them all at once. `today` is in the site zone. */
export function validateLine(product: Product | undefined, line: CartLine, today: LocalDate, maxPerLine?: number): LineIssue[] {
  if (!product) return [{ code: 'unknown_product' }];
  if (product.availability === 'sold_out') return [{ code: 'sold_out' }];
  const issues = validateQuantity(product.quantity, line.qty, maxPerLine);
  for (const opt of product.options) issues.push(...validateOption(opt, line, today));
  return issues;
}

/** Lowest price a shopper can pay for one unit (for "from" labels on cards). */
export function fromPrice(product: Product): Money {
  let low = product.price;
  for (const opt of product.options) {
    if (opt.kind !== 'choice') continue;
    for (const c of opt.choices) {
      if (c.price && compare(c.price, low) < 0) low = c.price;
    }
  }
  for (const t of product.quantity.tiers ?? []) if (compare(t.unitPrice, low) < 0) low = t.unitPrice;
  return low;
}

/** True when the card should say "from": several prices are possible. */
export function hasVariablePrice(product: Product): boolean {
  if ((product.quantity.tiers?.length ?? 0) > 0) return true;
  return product.options.some((o) => o.kind === 'choice' && o.choices.some((c) => c.price || c.delta));
}
