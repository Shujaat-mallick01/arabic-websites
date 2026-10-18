// Overlays on the neutral Arabic base. Keep them short: interface microcopy and WhatsApp phrasing only.
// Product copy, about pages and FAQs are written per site in the right dialect; policies stay formal.

import type { Audience, Dialect } from '@aw/core';
import type { DictKey } from './ar.ts';

export type Overlay = Partial<Record<DictKey, string>>;

/** Feminine address (neutral Arabic). Used when audience = women. */
export const women: Overlay = {
  'nav.book': 'احجزي موعدك',
  'cta.orderWhatsapp': 'اطلبي عبر واتساب',
  'cta.askWhatsapp': 'اسألي عبر واتساب',
  'cta.bookWhatsapp': 'أرسلي طلب الحجز عبر واتساب',
  'cta.whatsappChat': 'تواصلي معنا على واتساب',
  'cta.shopNow': 'تسوّقي الآن',
  'cta.book': 'احجزي الآن',
  'product.chooseOption': 'اختاري {option}',
  'cart.add': 'أضيفي إلى السلة',
  'cart.emptyHint': 'تصفّحي المنتجات وأضيفي ما يعجبك.',
  'cart.continue': 'متابعة التسوق',
  'cart.freeShippingLeft': 'أضيفي {amount} ليصبح التوصيل مجانياً',
  'checkout.codHint': 'تدفعين نقداً للمندوب عند استلام الطلب.',
  'checkout.terms': 'بتأكيد الطلب أنتِ توافقين على {link}.',
  'order.sendWhatsapp': 'أرسلي تفاصيل الطلب للمحل عبر واتساب',
  'order.notFound': 'لم نجد هذا الطلب. تأكدي من الرابط.',
  'pay.retry': 'حاولي مرة أخرى',
  'booking.title': 'احجزي موعدك',
  'booking.chooseService': 'اختاري الخدمة',
  'booking.noSlots': 'لا توجد مواعيد متاحة في هذا اليوم. جرّبي يوماً آخر.',
  'booking.taken': 'هذا الموعد انحجز للتو، اختاري موعداً آخر',
  'booking.depositNote': 'تدفعين العربون الآن لتأكيد الموعد، والباقي في الصالون.',
  'form.err.required': 'اكتبي {field}.',
  'form.err.choose': 'اختاري {field}.',
  'form.err.tooLong': 'النص طويل: {got} حرفاً والحد {max}. احذفي {diff} أحرف.',
  'form.err.date': 'اختاري تاريخاً من التقويم.',
  'form.err.dateTooSoon': 'أقرب تاريخ متاح هو {date}. اختاري تاريخاً من {date} وطالع.',
  'form.err.minQty': 'أقل كمية لهذا المنتج {min} قطعة. زيدي الكمية {diff} قطع على الأقل.',
  'form.err.fileTooBig': 'حجم الصورة {got} ميغابايت والحد {max}. جرّبي صورة أصغر أو لقطة شاشة.',
  'form.err.tooFast': 'تم الإرسال بسرعة كبيرة. انتظري ثانيتين وحاولي مرة أخرى.',
  'form.err.network': 'تعذّر الاتصال. تأكدي من الإنترنت وحاولي مرة أخرى.',
  'form.err.generic': 'حدث خطأ غير متوقع. حاولي مرة أخرى.',
};

export const dialects: Partial<Record<Dialect, Overlay>> = {
  'khaleeji-bh': {
    'cart.empty': 'السلة فاضية',
    'wa.greeting': 'هلا',
    'wa.orderIntro': 'ودي أطلب:',
    'wa.bookingIntro': 'ودي أحجز موعد:',
    'wa.enquiryIntro': 'عندي سؤال:',
    'wa.askAbout': 'ودي أسأل عن:',
    'wa.shareIntro': 'شوفوا هذا:',
  },
  kuwaiti: {
    'cart.empty': 'السلة فاضية',
    'wa.greeting': 'هلا',
    'wa.orderIntro': 'أبي أطلب:',
    'wa.bookingIntro': 'أبي أحجز:',
    'wa.enquiryIntro': 'عندي سؤال:',
    'wa.askAbout': 'أبي أسأل عن:',
    'wa.shareIntro': 'شوفوا هذا:',
  },
  najdi: {
    'cart.empty': 'السلة فاضية',
    'wa.greeting': 'السلام عليكم',
    'wa.orderIntro': 'ودي أطلب:',
    'wa.bookingIntro': 'ودي أحجز:',
    'wa.enquiryIntro': 'عندي استفسار:',
    'wa.askAbout': 'ودي أسأل عن:',
    'wa.shareIntro': 'شوفوا هذا:',
  },
  hijazi: {
    'cart.empty': 'السلة فاضية',
    'wa.greeting': 'السلام عليكم',
    'wa.orderIntro': 'أبغى أطلب:',
    'wa.bookingIntro': 'أبغى أحجز موعد:',
    'wa.enquiryIntro': 'عندي استفسار:',
    'wa.askAbout': 'أبغى أسأل عن:',
    'wa.shareIntro': 'شوفوا هذا:',
  },
  iraqi: {
    'cart.empty': 'السلة فارغة',
    'wa.greeting': 'هلو',
    'wa.orderIntro': 'أريد أطلب:',
    'wa.bookingIntro': 'أريد أحجز:',
    'wa.enquiryIntro': 'عندي سؤال:',
    'wa.askAbout': 'أريد أسأل عن:',
    'wa.shareIntro': 'شوفوا هذا:',
  },
};

export const dialectAudience: Partial<Record<`${Dialect}+${Audience}`, Overlay>> = {
  'khaleeji-bh+women': {
    'cart.add': 'أضيفي للسلة',
    'cta.orderWhatsapp': 'اطلبي على الواتساب',
    'cta.askWhatsapp': 'اسألينا على الواتساب',
    'cart.emptyHint': 'تصفّحي وأضيفي اللي يعجبج.',
    'cart.freeShippingLeft': 'باقي لج {amount} ويصير توصيلج مجاني',
    'cart.freeShippingReached': 'توصيلج مجاني لهذا الطلب',
  },
  'kuwaiti+women': {
    'cart.add': 'ضيفيها للسلة',
    'cta.orderWhatsapp': 'اطلبي على الواتساب',
    'cta.askWhatsapp': 'اسألينا على الواتساب',
    'cart.emptyHint': 'تصفّحي وضيفي اللي يعجبج.',
    'cart.freeShippingLeft': 'باقي لج {amount} ويصير التوصيل ببلاش',
    'cart.freeShippingReached': 'التوصيل ببلاش لهالطلب',
  },
  'najdi+women': {
    'cart.add': 'أضيفي للسلة',
    'cta.orderWhatsapp': 'اطلبي على الواتساب',
    'cta.askWhatsapp': 'اسألينا على الواتساب',
    'cart.freeShippingLeft': 'باقي لك {amount} ويصير التوصيل مجاني',
  },
  'hijazi+women': {
    'cart.add': 'أضيفي للسلة',
    'cta.orderWhatsapp': 'اطلبي على الواتساب',
    'cta.askWhatsapp': 'اسألينا على الواتساب',
    'cart.freeShippingLeft': 'باقي لك {amount} ويصير التوصيل مجاني',
  },
  'iraqi+women': {
    'cart.add': 'ضيفي للسلة',
    'cta.orderWhatsapp': 'اطلبي عالواتساب',
    'cta.askWhatsapp': 'اسألينا عالواتساب',
    'cart.emptyHint': 'تصفّحي وضيفي اللي يعجبچ.',
    'cart.freeShippingLeft': 'باقيلچ {amount} ويصير التوصيل مجاني',
    'checkout.codHint': 'تدفعين كاش للمندوب من يوصلچ الطلب.',
  },
};
