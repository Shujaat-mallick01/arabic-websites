import { describe, expect, it } from 'vitest';
import { money } from '@aw/core';
import { bookingMessage, enquiryMessage, orderMessage, sanitise, shareMessage, waLink, type WaContext } from '../src/index.ts';

const layan: WaContext = {
  lang: 'ar',
  dialect: 'khaleeji-bh',
  audience: 'women',
  locale: { country: 'BH', numberingSystem: 'arab', timeZone: 'Asia/Bahrain' },
  businessName: 'ليان',
  demoBrand: 'ليان',
};

const RLM = '‏';
const NB = ' ';
const LRM = '‎';

describe('orderMessage', () => {
  it('matches the documented site 01 message', () => {
    const msg = orderMessage(
      {
        title: 'طلب عباية',
        lines: [
          {
            title: 'عباية كريب سوداء بتطريز يدوي',
            options: [
              { label: 'المقاس', value: 'M' },
              { label: 'الطول', value: '٥٦' },
            ],
            qty: 1,
            unit: money(38500, 'BHD'),
          },
        ],
        total: money(38500, 'BHD'),
        customer: { name: 'مريم', phone: '+97336001234' },
        notes: 'أبيها قبل الخميس',
        url: 'https://layan-abaya-demo.netlify.app/products/black-crepe-embroidered/',
      },
      layan,
    );
    expect(msg).toBe(
      [
        '[نموذج: ليان]',
        'هلا ليان، ودي أطلب:',
        '*طلب عباية*',
        '• عباية كريب سوداء بتطريز يدوي',
        '  المقاس: M · الطول: ٥٦',
        `  الكمية: ١ × ${RLM}٣٨٫٥٠٠${NB}د.ب${RLM}`,
        `المجموع: ${RLM}٣٨٫٥٠٠${NB}د.ب${RLM} (تقديري)`,
        'الاسم: مريم',
        `الجوال: ${LRM}+973 3600 1234`,
        'ملاحظات: أبيها قبل الخميس',
        'https://layan-abaya-demo.netlify.app/products/black-crepe-embroidered/?utm_source=whatsapp',
      ].join('\n'),
    );
  });

  it('builds an English message without dialect', () => {
    const msg = orderMessage(
      { lines: [{ title: 'Linen kaftan', qty: 2, unit: money(18500, 'BHD') }], total: money(37000, 'BHD') },
      { ...layan, lang: 'en', businessName: 'Layan', demoBrand: undefined },
    );
    expect(msg).toBe(`Hello Layan, I would like to order:\n*Order*\n• Linen kaftan\n  Qty: 2 × BHD${NB}18.500\nTotal: BHD${NB}37.000 (estimate)`);
  });

  it('keeps asterisks balanced whatever the customer types', () => {
    const msg = orderMessage({ lines: [{ title: 'Cake *special*' }], notes: 'no nuts * please', customer: { name: '*Sara' } }, layan);
    const stars = msg.match(/\*/g)?.length ?? 0;
    expect(stars).toBe(2); // only the bold title
  });

  it('adds Hijri dates when enabled', () => {
    const msg = orderMessage({ lines: [{ title: 'صينية' }], date: '2026-09-24' }, { ...layan, hijri: true });
    expect(msg).toContain('التاريخ: الخميس، ٢٤ سبتمبر (١٣ ربيع الآخر ١٤٤٨ هـ)');
  });

  it('collapses long orders to fit the URL limit', () => {
    const lines = Array.from({ length: 80 }, (_, i) => ({ title: `منتج رقم ${i} بوصف طويل جداً جداً`, qty: 1, unit: money(1000, 'BHD') }));
    const msg = orderMessage({ lines, notes: 'ملاحظة '.repeat(300) }, layan);
    expect(encodeURIComponent(msg).length).toBeLessThanOrEqual(3800);
    expect(msg).toMatch(/\+ [٠-٩]+ منتجات أخرى/);
    // Round-trips through encoding.
    expect(decodeURIComponent(encodeURIComponent(msg))).toBe(msg);
  });
});

describe('other builders', () => {
  it('builds a booking request in Hijazi with feminine address', () => {
    const msg = bookingMessage(
      {
        service: 'باقة العروس الملكية',
        date: '2026-10-10',
        time: '٤:٠٠ م',
        estimate: money(250000, 'SAR'),
        customer: { name: 'رهف', phone: '+966551234567' },
      },
      { ...layan, dialect: 'hijazi', locale: { country: 'SA', numberingSystem: 'arab', timeZone: 'Asia/Riyadh' }, businessName: 'مرايا', demoBrand: undefined },
    );
    expect(msg.split('\n').slice(0, 3)).toEqual(['السلام عليكم مرايا، أبغى أحجز موعد:', '*طلب حجز*', 'الخدمة: باقة العروس الملكية']);
    expect(msg).toContain(`الجوال: ${LRM}+966 55 123 4567`);
  });

  it('builds enquiry and share messages', () => {
    expect(enquiryMessage({ topic: 'عطر عود ملكي' }, { ...layan, demoBrand: undefined })).toBe('هلا ليان، ودي أسأل عن:\n*عطر عود ملكي*');
    expect(shareMessage({ title: 'عباية', url: 'https://x.example/p/' }, layan)).toBe('شوفوا هذا: عباية\nhttps://x.example/p/');
  });

  it('builds wa.me links', () => {
    expect(waLink('+973 3600 1234', 'هلا')).toBe('https://wa.me/97336001234?text=%D9%87%D9%84%D8%A7');
    expect(waLink(null, 'x')).toBe('https://wa.me/?text=x');
  });

  it('sanitises formatting characters', () => {
    expect(sanitise('a *b* _c ~d')).toBe('a ٭b٭ c -d');
  });
});
