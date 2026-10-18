// The authoritative order quote. The browser runs it for display; the checkout function runs it
// again with server data and never trusts client prices.

import { add, compare, includedVat, minMoney, money, sub, sum, type LocalDate, type Money, type TimeZone } from '@aw/core';
import { priceLine, validateLine, type LineIssue, type LinePrice } from './pricing.ts';
import {
  codAvailability,
  leadHoursFor,
  quoteFulfilment,
  validateDeliveryDate,
  type CodRefusal,
  type FulfilmentIssue,
} from './fulfilment.ts';
import type { CartLine, CheckoutRules, FulfilmentChoice, FulfilmentRules, Product } from './types.ts';

export interface QuoteInput {
  lines: CartLine[];
  fulfilment?: FulfilmentChoice;
  payment?: 'online' | 'cod';
  giftWrap?: boolean;
  giftCard?: { code: string; balance: Money };
}

export interface QuoteContext {
  catalog: ReadonlyMap<string, Product>;
  fulfilment: FulfilmentRules;
  checkout: CheckoutRules;
  siteAllowsCod: boolean;
  maxQtyPerLine?: number;
  now: Date;
  tz: TimeZone;
  today: LocalDate;
  /** Extra closed delivery dates (runtime closures). */
  closed?: LocalDate[];
}

export type OrderIssue =
  | { code: 'empty' }
  | { code: 'min_order'; minOrder: Money }
  | { code: 'cod_unavailable'; reason: CodRefusal }
  | { code: 'currency_mismatch' };

export interface QuotedLine {
  index: number;
  line: CartLine;
  product?: Product;
  price?: LinePrice;
  issues: LineIssue[];
}

export interface Quote {
  lines: QuotedLine[];
  subtotal: Money;
  shipping: Money;
  codFee?: Money;
  giftWrap?: Money;
  giftCard?: { code: string; applied: Money };
  vatIncluded?: Money;
  total: Money;
  /** What is left to pay after the gift card. */
  payable: Money;
  freeShippingGap?: Money;
  codOffered: boolean;
  fulfilmentIssues: FulfilmentIssue[];
  orderIssues: OrderIssue[];
  ok: boolean;
}

export function quoteOrder(input: QuoteInput, ctx: QuoteContext): Quote {
  const cur = ctx.fulfilment.currency;
  const zero = money(0, cur);
  const lines: QuotedLine[] = input.lines.map((line, index) => {
    const product = ctx.catalog.get(line.productId);
    const issues = validateLine(product, line, ctx.today, ctx.maxQtyPerLine);
    if (!product || issues.some((i) => i.code === 'unknown_product' || i.code === 'sold_out')) return { index, line, product, issues };
    if (product.price.currency !== cur) return { index, line, product, issues: [...issues] };
    return { index, line, product, price: priceLine(product, line), issues };
  });

  const orderIssues: OrderIssue[] = [];
  if (input.lines.length === 0) orderIssues.push({ code: 'empty' });
  if (lines.some((l) => l.product && l.product.price.currency !== cur)) orderIssues.push({ code: 'currency_mismatch' });
  const subtotal = sum(lines.flatMap((l) => (l.price ? [l.price.total] : [])), cur);
  if (ctx.checkout.minOrder && compare(subtotal, ctx.checkout.minOrder) < 0) orderIssues.push({ code: 'min_order', minOrder: ctx.checkout.minOrder });

  let shipping = zero;
  let freeShippingGap: Money | undefined;
  const fulfilmentIssues: FulfilmentIssue[] = [];
  if (input.fulfilment) {
    const fq = quoteFulfilment(ctx.fulfilment, input.fulfilment, subtotal);
    shipping = fq.fee;
    freeShippingGap = fq.freeShippingGap;
    fulfilmentIssues.push(...fq.issues);
    if (input.fulfilment.kind === 'delivery' && ctx.fulfilment.delivery && fq.issues.length === 0) {
      const tags = new Set(lines.flatMap((l) => l.product?.leadTags ?? []));
      const readyNow = lines.length > 0 && lines.every((l) => l.product?.availability === 'ready_now');
      fulfilmentIssues.push(
        ...validateDeliveryDate(ctx.fulfilment.delivery, input.fulfilment, {
          now: ctx.now,
          tz: ctx.tz,
          leadHours: readyNow ? 0 : leadHoursFor(ctx.fulfilment.delivery, tags),
          zoneId: input.fulfilment.zoneId,
          readyNow,
          closed: ctx.closed,
        }),
      );
    }
  }

  const giftWrap = input.giftWrap && ctx.checkout.giftWrap ? ctx.checkout.giftWrap.price : undefined;
  let total = add(add(subtotal, shipping), giftWrap ?? zero);

  let codOffered = false;
  let codFee: Money | undefined;
  if (input.fulfilment) {
    const cod = codAvailability(ctx.fulfilment, ctx.siteAllowsCod, input.fulfilment, total);
    codOffered = cod.ok;
    if (input.payment === 'cod') {
      if (cod.ok) {
        codFee = cod.fee;
        total = add(total, cod.fee);
      } else {
        orderIssues.push({ code: 'cod_unavailable', reason: cod.reason });
      }
    }
  }

  let giftCard: Quote['giftCard'];
  let payable = total;
  if (input.giftCard && input.giftCard.balance.currency === cur && input.giftCard.balance.minor > 0) {
    const applied = minMoney(input.giftCard.balance, total);
    giftCard = { code: input.giftCard.code, applied };
    payable = sub(total, applied);
  }

  const vatIncluded = ctx.checkout.vatBps ? includedVat(total, ctx.checkout.vatBps) : undefined;
  const ok = orderIssues.length === 0 && fulfilmentIssues.length === 0 && lines.every((l) => l.issues.length === 0) && !!input.fulfilment;

  return {
    lines,
    subtotal,
    shipping,
    ...(codFee ? { codFee } : {}),
    ...(giftWrap ? { giftWrap } : {}),
    ...(giftCard ? { giftCard } : {}),
    ...(vatIncluded ? { vatIncluded } : {}),
    total,
    payable,
    ...(freeShippingGap ? { freeShippingGap } : {}),
    codOffered,
    fulfilmentIssues,
    orderIssues,
    ok,
  };
}
