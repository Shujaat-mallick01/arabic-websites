// The cart: a list of lines in guarded storage, with an `aw:cart` event on every change.
// Prices here are for display only; the checkout function re-prices everything from server data.

import type { I18nText, Money } from '@aw/core';
import { siteBlob, storage } from './runtime.ts';

export interface CartLineStored {
  key: string;
  productId: string;
  slug: string;
  title: I18nText;
  image?: string;
  selection: Record<string, string>;
  labels: Array<{ label: I18nText; value: I18nText }>;
  addons?: Record<string, number>;
  qty: number;
  unit: Money;
  /** Line total for display (tiers and add-ons make it differ from unit × qty). */
  total: Money;
  min?: number;
  step?: number;
  max?: number;
}

function key(): string {
  return `aw.cart.${siteBlob().siteId}`;
}

export function lineKey(productId: string, selection: Record<string, string>, addons?: Record<string, number>): string {
  const sel = Object.keys(selection).sort().map((k) => `${k}=${selection[k]}`).join('&');
  const add = addons ? Object.keys(addons).sort().map((k) => `${k}:${addons[k]}`).join(',') : '';
  return `${productId}|${sel}|${add}`;
}

export function readCart(): CartLineStored[] {
  try {
    const raw = storage.get(key());
    const parsed = raw ? (JSON.parse(raw) as CartLineStored[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(lines: CartLineStored[]): void {
  storage.set(key(), JSON.stringify(lines));
  window.dispatchEvent(new CustomEvent('aw:cart', { detail: lines }));
}

export function addLine(line: Omit<CartLineStored, 'key'>): CartLineStored[] {
  const lines = readCart();
  const k = lineKey(line.productId, line.selection, line.addons);
  const hit = lines.find((l) => l.key === k);
  if (hit) {
    const qty = Math.min(hit.qty + line.qty, line.max ?? Infinity);
    Object.assign(hit, { ...line, key: k, qty, total: { minor: line.unit.minor * qty, currency: line.unit.currency } });
  } else {
    lines.push({ ...line, key: k });
  }
  write(lines);
  return lines;
}

export function setQty(k: string, qty: number, total?: Money): CartLineStored[] {
  const lines = readCart();
  const hit = lines.find((l) => l.key === k);
  if (hit) {
    hit.qty = qty;
    hit.total = total ?? { minor: hit.unit.minor * qty, currency: hit.unit.currency };
  }
  write(lines.filter((l) => l.qty > 0));
  return readCart();
}

export function removeLine(k: string): CartLineStored[] {
  write(readCart().filter((l) => l.key !== k));
  return readCart();
}

export function clearCart(): void {
  write([]);
}

export function cartCount(lines = readCart()): number {
  return lines.reduce((n, l) => n + l.qty, 0);
}

export function onCart(fn: (lines: CartLineStored[]) => void): void {
  window.addEventListener('aw:cart', (e) => fn((e as CustomEvent<CartLineStored[]>).detail));
  window.addEventListener('storage', (e) => {
    if (e.key === key()) fn(readCart());
  });
}
