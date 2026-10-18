// Owner notifications: Arabic-first RTL HTML plus a plain-text part.

import { toDecimalString, type I18nText } from '@aw/core';
import type { Order } from '@aw/commerce/server';
import type { Runtime } from './runtime.ts';

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}

const ar = (t: I18nText | undefined) => (t ? t.ar : '');

export async function notifyOrder(rt: Runtime, o: Order, event: 'order.placed' | 'order.paid'): Promise<void> {
  const n = rt.data.notifications;
  if (!n.ownerEmails.length || (n.notifyOn.length && !n.notifyOn.includes(event))) return;
  const name = ar(rt.data.general.name as I18nText) || rt.site.slug;
  const cur = o.pricing.total.currency;
  const lines = o.lines.map((l) => `• ${l.title.ar} × ${l.qty} — ${toDecimalString(l.total)} ${cur}`);
  const title = event === 'order.paid' ? `طلب مدفوع ${o.id}` : `طلب جديد ${o.id}`;
  const text = [
    `${title} — ${name}`,
    ...lines,
    `الإجمالي: ${toDecimalString(o.pricing.total)} ${cur}`,
    `العميل: ${o.customer.name} (${o.customer.phone})`,
    `${rt.site.deploy.url}/owner/`,
  ].join('\n');
  const html = `<div dir="rtl" lang="ar" style="font-family:Tahoma,Arial,sans-serif;font-size:15px;line-height:1.7;color:#16202b">
<h2 style="font-size:18px;margin:0 0 12px">${esc(title)}</h2>
<ul style="padding-inline-start:18px;margin:0 0 12px">${o.lines.map((l) => `<li>${esc(l.title.ar)} × ${l.qty} — <bdi>${toDecimalString(l.total)} ${cur}</bdi></li>`).join('')}</ul>
<p style="margin:0 0 6px"><strong>الإجمالي:</strong> <bdi>${toDecimalString(o.pricing.total)} ${cur}</bdi></p>
<p style="margin:0 0 12px"><strong>العميل:</strong> ${esc(o.customer.name)} — <bdi dir="ltr">${esc(o.customer.phone)}</bdi></p>
<p style="margin:0"><a href="${rt.site.deploy.url}/owner/">فتح لوحة الطلبات</a></p></div>`;
  try {
    await (await rt.mailer()).send({ to: n.ownerEmails, subject: `${title} — ${name}`, text, html });
  } catch {
    /* a failed notification never fails the order */
  }
}
