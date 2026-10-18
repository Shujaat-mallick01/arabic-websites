// Illustrative orders for demo dashboards ("طلب توضيحي"), generated from the real catalogue so a
// prospect sees a believable day. Deterministic, read-only, never stored.

import { addDays, money, mul, sum, zonedNow, type E164 } from '@aw/core';
import type { Order, OrderStatus } from '@aw/commerce/server';
import type { Runtime } from './runtime.ts';

const NAMES = ['مريم', 'نوف', 'دانة', 'شيخة', 'فاطمة', 'هيا', 'ريم', 'سارة', 'لولوة', 'منيرة', 'جود', 'العنود'];
const STATUSES: OrderStatus[] = ['paid', 'preparing', 'placed', 'shipped', 'completed', 'paid', 'out_for_delivery', 'confirmed', 'completed', 'ready_for_pickup', 'cancelled', 'completed'];

export function sampleOrders(rt: Runtime): Order[] {
  const products = rt.data.products.filter((p) => p.availability !== 'sold_out');
  if (!products.length) return [];
  const today = zonedNow(rt.site.locale.timeZone, rt.now()).date;
  const cur = rt.data.currency;
  const zones = rt.data.fulfilment?.delivery?.zones ?? [];
  const countries = rt.data.fulfilment?.shipping?.countries ?? [];
  return NAMES.map((name, i) => {
    const a = products[(i * 7) % products.length]!;
    const b = products[(i * 11 + 3) % products.length]!;
    const qtyA = a.quantity.min;
    const lines = [a, ...(i % 3 === 0 ? [b] : [])].map((p, k) => {
      const qty = k === 0 ? qtyA : p.quantity.min;
      return { productId: p.id, slug: p.slug, title: p.title, selection: {}, labels: [], qty, unit: p.price, total: mul(p.price, qty) };
    });
    const subtotal = sum(lines.map((l) => l.total), cur);
    const fulfilmentOf = (): Order['fulfilment'] => (ship ? { kind: 'shipping', country: ship.code, address: { city: '—' } } : zone ? { kind: 'delivery', zoneId: zone.id, zoneName: zone.name, address: {} } : { kind: 'digital' });
    const ship = i % 4 === 1 && countries.length ? countries[i % countries.length]! : null;
    const zone = zones[i % Math.max(zones.length, 1)];
    const shipping = ship ? ship.fee : zone?.fee ?? money(0, cur);
    const date = addDays(today, -Math.floor(i / 3));
    const status = STATUSES[i]!;
    const cod = !ship && i % 5 === 2 && !!rt.site.payments?.cod;
    return {
      id: `${rt.site.commerce?.orderPrefix ?? 'OR'}-${date.slice(2).replace(/-/g, '')}-S${String(i + 1).padStart(3, '0')}`,
      siteId: rt.site.id,
      kind: 'order',
      createdAt: `${date}T${String(9 + (i % 10)).padStart(2, '0')}:${String((i * 17) % 60).padStart(2, '0')}:00.000Z`,
      lang: i % 4 === 3 ? 'en' : 'ar',
      customer: { name, phone: `+${rt.site.locale.country === 'IQ' ? '9647' : '9733'}${String(6000000 + i * 1311).slice(0, 7)}` as E164 },
      lines,
      fulfilment: fulfilmentOf(),
      pricing: { subtotal, shipping, total: sum([subtotal, shipping], cur), payable: sum([subtotal, shipping], cur) },
      payment: { provider: cod ? 'cod' : (rt.site.payments?.provider ?? 'mock'), state: cod ? 'cod' : 'paid' },
      status: cod && status === 'paid' ? 'placed' : status,
      history: [{ at: `${date}T09:00:00.000Z`, from: null, to: status, by: 'system', note: 'طلب توضيحي' }],
      viewToken: '',
      demo: true,
    } satisfies Order;
  });
}
