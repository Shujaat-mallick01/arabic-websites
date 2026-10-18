// Function factories for generated netlify/functions/*.mts wrappers: `create*(site, data)`.

import type { SiteConfig } from '@aw/core';
import { createRuntime, json, type Runtime, type ServerData } from './runtime.ts';
import { availabilityHandler, bookingHandler } from './booking-handlers.ts';
import { wrap } from './commerce-handlers.ts';

export * from './runtime.ts';
export * from './mailer.ts';
export * from './notify.ts';
export * from './samples.ts';
export {
  checkoutHandler,
  quoteHandler,
  orderHandler,
  stockHandler,
  giftCardCheckHandler,
  issueGiftCard,
  createQuoteHandler,
  createCheckoutHandler,
  createOrderHandler,
  createStockHandler,
  createGiftCardHandler,
} from './commerce-handlers.ts';
export { applyStatus, createPayStatusFunction, createPayWebhookFunction, createPayMockFunction, isBookingId } from './pay-handlers.ts';
export { availabilityHandler, bookingHandler, bookingCreateHandler, bookingViewHandler, applyBookingPayment } from './booking-handlers.ts';
export { ownerHandler, createOwnerHandler } from './owner.ts';

export const createAvailabilityHandler = wrap(availabilityHandler);
export const createBookingHandler = wrap(bookingHandler);

/** POST /api/upload — a reference photo, already downscaled to WebP/JPEG in the browser (≤ 2 MB). */
export function uploadHandler(rt: Runtime) {
  return async (req: Request): Promise<Response> => {
    if (req.method !== 'POST') return json({ error: 'method' }, 405);
    const buf = new Uint8Array(await req.arrayBuffer());
    if (buf.length === 0 || buf.length > 2_000_000) return json({ error: 'size' }, 413);
    const webp = buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 && buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50;
    const jpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    if (!webp && !jpeg) return json({ error: 'type' }, 415);
    const key = `uploads/${crypto.randomUUID()}.${webp ? 'webp' : 'jpg'}`;
    const kv = await rt.kv('ops');
    if (!kv.setBytes) return json({ error: 'unsupported' }, 501);
    await kv.setBytes(key, buf, webp ? 'image/webp' : 'image/jpeg');
    return json({ key });
  };
}
export const createUploadHandler = wrap(uploadHandler);

/** POST /api/enquiry — corporate and bulk enquiries on full-tier sites (stored + emailed). */
export function enquiryHandler(rt: Runtime) {
  return async (req: Request): Promise<Response> => {
    let b: Record<string, string>;
    try {
      b = (await req.json()) as Record<string, string>;
    } catch {
      return json({ error: 'bad_request' }, 400);
    }
    if (b.company_website) return json({ error: 'rejected' }, 400);
    const fields = Object.fromEntries(Object.entries(b).filter(([k]) => !['company_website', 'startedAt'].includes(k)).slice(0, 20).map(([k, v]) => [k.slice(0, 40), String(v).slice(0, 1000)]));
    if (!fields.name || !fields.phone) return json({ errors: [{ field: 'name', message: 'required' }] }, 422);
    const id = crypto.randomUUID().slice(0, 8);
    await (await rt.kv('ops')).setJSON(`enq/${new Date().toISOString().slice(0, 10)}-${id}.json`, { id, at: new Date().toISOString(), ...fields });
    const owners = rt.data.notifications.ownerEmails;
    if (owners.length) {
      const text = Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join('\n');
      await (await rt.mailer()).send({ to: owners, subject: `استفسار جديد — ${fields.name}`, text, html: `<pre dir="auto" style="font-family:Tahoma,Arial,sans-serif">${text.replace(/</g, '&lt;')}</pre>` });
    }
    return json({ ok: true, id });
  };
}
export const createEnquiryHandler = wrap(enquiryHandler);

export function runtimeFor(site: SiteConfig, data: ServerData): Runtime {
  return createRuntime(site, data);
}
