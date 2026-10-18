// Owner-editable settings (src/content/settings/*.json). One file per singleton, no i18n panes:
// bilingual strings are inline {ar, en} so both languages sit side by side.

import type { SectionId, SettingsId } from '@aw/presets';
import { f, type Field } from '../fields.ts';
import { timeRangeFields, weeklyHoursFields } from './collections.ts';

const WEEKDAY_OPTIONS: Array<[string, string, string]> = [['sat', 'السبت', 'Sat'], ['sun', 'الأحد', 'Sun'], ['mon', 'الاثنين', 'Mon'], ['tue', 'الثلاثاء', 'Tue'], ['wed', 'الأربعاء', 'Wed'], ['thu', 'الخميس', 'Thu'], ['fri', 'الجمعة', 'Fri']];
const e164 = { pattern: ['^\\+[1-9][0-9]{7,14}$', { ar: 'اكتب الرقم مع مفتاح الدولة، مثل ‎+97336001234', en: 'Include the country code, e.g. +97336001234' }] as [string, { ar: string; en: string }] };

export const SETTINGS_LABELS: Record<SettingsId, { ar: string; en: string }> = {
  general: { ar: 'بيانات المتجر', en: 'Store details' },
  contact: { ar: 'التواصل', en: 'Contact' },
  hours: { ar: 'أوقات العمل', en: 'Opening hours' },
  home: { ar: 'الصفحة الرئيسية', en: 'Home page' },
  seo: { ar: 'الظهور في محركات البحث', en: 'Search appearance' },
  sizes: { ar: 'المقاسات', en: 'Sizes' },
  fulfilment: { ar: 'التوصيل والشحن', en: 'Delivery and shipping' },
  checkout: { ar: 'الطلب والدفع', en: 'Checkout' },
  booking: { ar: 'الحجوزات', en: 'Bookings' },
  notifications: { ar: 'التنبيهات', en: 'Notifications' },
};

const SECTION_LABELS: Record<SectionId, { ar: string; en: string }> = {
  hero: { ar: 'الواجهة الرئيسية', en: 'Hero' },
  categories: { ar: 'الأقسام', en: 'Categories' },
  featured: { ar: 'مختارات', en: 'Featured' },
  'new-arrivals': { ar: 'وصل جديد', en: 'New arrivals' },
  rail: { ar: 'شريط منتجات', en: 'Product rail' },
  campaign: { ar: 'بانر حملة', en: 'Campaign band' },
  'gift-cards': { ar: 'بطاقات الهدايا', en: 'Gift cards' },
  'delivery-table': { ar: 'جدول التوصيل', en: 'Delivery table' },
  lookbook: { ar: 'لوك بوك', en: 'Lookbook' },
  reviews: { ar: 'آراء العملاء', en: 'Reviews' },
  'faq-teaser': { ar: 'أسئلة شائعة', en: 'FAQ teaser' },
  about: { ar: 'نبذة', en: 'About' },
  services: { ar: 'الخدمات', en: 'Services' },
  packages: { ar: 'الباقات', en: 'Packages' },
  'booking-cta': { ar: 'دعوة للحجز', en: 'Booking call to action' },
  gallery: { ar: 'المعرض', en: 'Gallery' },
  hours: { ar: 'أوقات العمل', en: 'Hours' },
  branches: { ar: 'الفروع', en: 'Branches' },
  'notes-explorer': { ar: 'مكتشف المكوّنات', en: 'Notes explorer' },
  menu: { ar: 'المنيو', en: 'Menu' },
  seasonal: { ar: 'أقسام موسمية', en: 'Seasonal' },
  estimate: { ar: 'حاسبة التكلفة', en: 'Estimate builder' },
  tiers: { ar: 'أسعار الكميات', en: 'Quantity tiers' },
  occasions: { ar: 'المناسبات', en: 'Occasions' },
  shop: { ar: 'المتجر الصغير', en: 'Shop' },
  stockists: { ar: 'نقاط البيع', en: 'Stockists' },
  signature: { ar: 'العنصر المميز', en: 'Signature' },
};

/** Fields every home section may use. Each section component reads what it needs. */
function sectionFields(id: SectionId): Field[] {
  const base: Field[] = [
    f.boolean('enabled', 'ظاهر', 'Visible', { default: true }),
    f.i18nText('eyebrow', 'سطر صغير فوق العنوان', 'Eyebrow'),
    f.i18nText('title', 'العنوان', 'Title', { hint: { ar: 'ضع كلمة بين نجمتين *هكذا* لتظهر بلون مميّز', en: 'Wrap a word in *asterisks* to highlight it' } }),
    f.i18nText('subtitle', 'العنوان الفرعي', 'Subtitle', { multiline: true }),
  ];
  const withCta: Field[] = [f.i18nText('ctaLabel', 'نص الزر', 'Button text'), f.string('ctaHref', 'رابط الزر', 'Button link', { hint: { ar: 'مثل /shop/', en: 'e.g. /shop/' } })];
  const product: Field[] = [
    f.select('filter', 'المنتجات المعروضة', 'Which items', [['featured', 'المختارة', 'Featured'], ['new', 'الأحدث', 'Newest'], ['tag', 'حسب وسم', 'By tag'], ['category', 'حسب قسم', 'By category'], ['under', 'أقل من سعر', 'Under a price']], { default: 'featured' }),
    f.string('value', 'الوسم أو القسم أو السعر', 'Tag, category or price'),
    f.number('limit', 'العدد', 'How many', { int: true, min: 1, max: 24, default: 8 }),
  ];
  switch (id) {
    case 'hero':
      return [...base, ...withCta, f.i18nText('secondaryLabel', 'نص الزر الثاني', 'Second button'), f.string('secondaryHref', 'رابط الزر الثاني', 'Second link'), f.i18nText('priceNote', 'ملاحظة السعر', 'Price note'), f.image('image', 'الصورة', 'Image'), f.image('imageWide', 'صورة الشاشات الكبيرة', 'Wide image'), f.i18nText('imageAlt', 'وصف الصورة', 'Image alt'), f.i18nText('categoriesEyebrow', 'سطر فوق الأقسام', 'Categories eyebrow'), f.i18nText('categoriesTitle', 'عنوان الأقسام', 'Categories title')];
    case 'campaign':
    case 'about':
      return [...base, ...withCta, f.i18nText('priceNote', 'ملاحظة السعر', 'Price note'), f.image('image', 'الصورة', 'Image'), f.i18nText('imageAlt', 'وصف الصورة', 'Image alt')];
    case 'featured':
    case 'new-arrivals':
    case 'rail':
      return [...base, ...product, ...withCta, f.boolean('band', 'خلفية ملوّنة', 'Tinted background')];
    default:
      return [...base, f.number('limit', 'العدد', 'How many', { int: true, min: 1, max: 24 }), ...withCta];
  }
}

export function homeFields(sections: SectionId[]): Field[] {
  return [
    f.typed('sections', 'أقسام الصفحة الرئيسية', 'Home sections', sections.map((s) => ({ name: s, label: SECTION_LABELS[s], fields: sectionFields(s) })), {
      hint: { ar: 'اسحب الأقسام لتغيير ترتيبها، وأخفِ ما لا تحتاجه.', en: 'Drag to reorder; hide what you do not need.' },
    }),
  ];
}

export const generalFields: Field[] = [
  f.i18nText('name', 'اسم المتجر', 'Store name', { required: true }),
  f.i18nText('tagline', 'الشعار النصي', 'Tagline'),
  f.i18nText('shortAbout', 'نبذة قصيرة (تظهر في أسفل الموقع)', 'Short about (footer)', { multiline: true }),
  f.string('crNumber', 'رقم السجل التجاري', 'Commercial registration'),
  f.string('vatNumber', 'الرقم الضريبي', 'VAT number'),
  f.boolean('pricesIncludeVat', 'الأسعار شاملة الضريبة', 'Prices include VAT', { default: true }),
];

export const contactFields: Field[] = [
  f.string('whatsapp', 'رقم الواتساب', 'WhatsApp', { required: true, ...e164 }),
  f.string('phone', 'رقم الهاتف', 'Phone', e164),
  f.string('email', 'البريد الإلكتروني', 'Email'),
  f.string('instagram', 'حساب إنستغرام (بدون @)', 'Instagram handle'),
  f.string('tiktok', 'حساب تيك توك', 'TikTok handle'),
  f.string('snapchat', 'حساب سناب شات', 'Snapchat handle'),
  f.i18nText('address', 'العنوان', 'Address', { multiline: true }),
  f.string('area', 'المنطقة (للخرائط)', 'Area'),
  f.number('lat', 'خط العرض', 'Latitude', { step: 0.0001 }),
  f.number('lng', 'خط الطول', 'Longitude', { step: 0.0001 }),
  f.string('mapsUrl', 'رابط الخريطة', 'Map link'),
];

export const hoursFields: Field[] = [
  f.object('weekly', 'الدوام الأسبوعي', 'Weekly hours', weeklyHoursFields()),
  f.objects('seasons', 'مواسم بدوام مختلف', 'Seasonal hours', [
    f.string('id', 'الرمز', 'Id', { required: true }),
    f.i18nText('label', 'الاسم', 'Label', { required: true }),
    f.date('from', 'من', 'From', { required: true }),
    f.date('to', 'إلى', 'To', { required: true }),
    f.objects('all', 'الدوام اليومي', 'Daily hours', timeRangeFields(), { max: 2 }),
    f.boolean('approximate', 'التواريخ تقريبية (حسب رؤية الهلال)', 'Approximate dates', { default: true }),
  ], { summary: '{{fields.id}}' }),
  f.objects('exceptions', 'أيام استثنائية', 'Exceptions', [
    f.date('date', 'التاريخ', 'Date', { required: true }),
    f.boolean('closed', 'مغلق', 'Closed', { default: true }),
    f.objects('ranges', 'دوام خاص', 'Special hours', timeRangeFields(), { max: 2 }),
    f.i18nText('note', 'السبب', 'Note'),
  ], { summary: '{{fields.date}}' }),
  f.i18nText('note', 'ملاحظة', 'Note', { multiline: true }),
];

export const seoFields: Field[] = [f.i18nText('defaultDescription', 'وصف الموقع لمحركات البحث', 'Default description', { multiline: true, maxLength: 170 }), f.image('shareImage', 'صورة المشاركة', 'Share image')];

export const sizesFields: Field[] = [
  f.objects('sizes', 'المقاسات', 'Sizes', [f.string('id', 'الرمز', 'Id', { required: true }), f.i18nText('label', 'الاسم', 'Label', { required: true }), f.number('order', 'الترتيب', 'Order', { int: true })], { summary: '{{fields.id}}' }),
  f.list('lengths', 'الأطوال (بوصة)', 'Lengths (inches)', 'number'),
];

const zoneKind = f.select('kind', 'النوع', 'Kind', [['governorate', 'محافظة', 'Governorate'], ['province', 'محافظة (العراق)', 'Province'], ['district', 'حي', 'District'], ['area', 'منطقة', 'Area'], ['custom', 'أخرى', 'Custom']], { default: 'governorate' });

export const fulfilmentFields: Field[] = [
  f.object('delivery', 'التوصيل المحلي', 'Local delivery', [
    f.objects('zones', 'المناطق والرسوم', 'Zones and fees', [
      f.string('id', 'رمز المنطقة', 'Zone id', { required: true }),
      zoneKind,
      f.i18nText('name', 'الاسم (للمناطق الإضافية فقط)', 'Name (custom zones)'),
      f.money('fee', 'رسوم التوصيل', 'Fee', { required: true }),
      f.money('freeOver', 'مجاني للطلبات فوق', 'Free over'),
      f.money('minOrder', 'أقل قيمة للطلب', 'Minimum order'),
      f.number('etaMin', 'أقل مدة (أيام عمل)', 'ETA min (working days)', { int: true, min: 0, default: 1 }),
      f.number('etaMax', 'أطول مدة (أيام عمل)', 'ETA max (working days)', { int: true, min: 0, default: 2 }),
      f.boolean('codAllowed', 'الدفع عند الاستلام متاح', 'COD allowed', { default: true }),
      f.boolean('active', 'مفعّلة', 'Active', { default: true }),
    ], { summary: '{{fields.id}} — {{fields.fee}}' }),
    f.select('deliveryDays', 'أيام التوصيل', 'Delivery days', WEEKDAY_OPTIONS, { multiple: true }),
    f.time('dispatchCutoff', 'آخر وقت للطلب ليُشحن نفس اليوم', 'Same-day dispatch cutoff'),
    f.number('leadHours', 'مدة التجهيز العادية (ساعات)', 'Standard lead time (hours)', { int: true, min: 0, default: 24 }),
    f.objects('leadByTag', 'مدد تجهيز خاصة', 'Special lead times', [f.string('tag', 'الوسم', 'Tag', { required: true, hint: { ar: 'مثل personalised للمنتجات المخصّصة.', en: 'e.g. personalised.' } }), f.number('hours', 'الساعات', 'Hours', { int: true, min: 0, required: true })], { summary: '{{fields.tag}}: {{fields.hours}}' }),
    f.boolean('dateRequired', 'يجب اختيار تاريخ التوصيل', 'Delivery date required', { default: false }),
    f.objects('slots', 'فترات التوصيل', 'Delivery slots', [
      f.string('id', 'الرمز', 'Id', { required: true }),
      f.i18nText('label', 'الاسم', 'Label', { required: true }),
      f.time('from', 'من', 'From', { required: true }),
      f.time('to', 'إلى', 'To', { required: true }),
      f.number('capacity', 'عدد الطلبات المسموح', 'Capacity', { int: true, min: 1 }),
      f.select('days', 'الأيام', 'Days', WEEKDAY_OPTIONS, { multiple: true }),
    ], { summary: '{{fields.from}}–{{fields.to}}' }),
    f.object('sameDay', 'التوصيل في نفس اليوم', 'Same-day delivery', [
      f.boolean('enabled', 'متاح', 'Enabled', { default: false }),
      f.time('cutoff', 'آخر وقت للطلب', 'Cutoff'),
      f.money('fee', 'رسوم إضافية', 'Extra fee'),
    ], { collapsed: true }),
    f.list('blackouts', 'أيام بدون توصيل', 'No-delivery dates', 'date'),
  ], { collapsed: false }),
  f.object('shipping', 'الشحن لدول الخليج', 'GCC shipping', [
    f.objects('countries', 'الدول', 'Countries', [
      f.select('code', 'الدولة', 'Country', [['SA', 'السعودية', 'Saudi Arabia'], ['KW', 'الكويت', 'Kuwait'], ['AE', 'الإمارات', 'UAE'], ['QA', 'قطر', 'Qatar'], ['OM', 'عُمان', 'Oman'], ['BH', 'البحرين', 'Bahrain']], { required: true }),
      f.money('fee', 'رسوم الشحن', 'Fee', { required: true }),
      f.money('freeOver', 'مجاني فوق', 'Free over'),
      f.number('etaMin', 'أقل مدة (أيام عمل)', 'ETA min', { int: true, min: 0 }),
      f.number('etaMax', 'أطول مدة (أيام عمل)', 'ETA max', { int: true, min: 0 }),
      f.select('deliveryDays', 'أيام التوصيل في الدولة', 'Courier days', WEEKDAY_OPTIONS, { multiple: true }),
      f.boolean('active', 'مفعّلة', 'Active', { default: true }),
    ], { summary: '{{fields.code}}' }),
    f.i18nText('dutiesNote', 'ملاحظة الجمارك', 'Duties note', { multiline: true }),
  ], { collapsed: true }),
  f.object('pickup', 'الاستلام', 'Pickup', [
    f.boolean('enabled', 'متاح', 'Enabled', { default: false }),
    f.list('branches', 'الفروع (رموز)', 'Branch ids', 'string'),
    f.i18nText('label', 'مكان الاستلام', 'Pickup point'),
    f.number('readyInHours', 'جاهز بعد (ساعات)', 'Ready in (hours)', { int: true, min: 0, default: 4 }),
    f.number('holdDays', 'يُحفظ لمدة (أيام)', 'Held for (days)', { int: true, min: 1, default: 7 }),
    f.money('fee', 'رسوم', 'Fee'),
  ], { collapsed: true }),
  f.object('cod', 'الدفع عند الاستلام', 'Cash on delivery', [
    f.boolean('enabled', 'متاح', 'Enabled', { default: false }),
    f.money('fee', 'رسوم', 'Fee'),
    f.money('maxOrder', 'أقصى قيمة للطلب', 'Maximum order'),
    f.select('scope', 'يشمل', 'Applies to', [['delivery', 'التوصيل فقط', 'Delivery only'], ['delivery+pickup', 'التوصيل والاستلام', 'Delivery and pickup']], { default: 'delivery' }),
  ], { collapsed: true }),
  f.i18nText('deliveryInfo', 'نص معلومات التوصيل', 'Delivery info', { multiline: true }),
];

export const checkoutFields: Field[] = [
  f.money('minOrder', 'أقل قيمة للطلب', 'Minimum order'),
  f.object('giftWrap', 'تغليف الهدايا', 'Gift wrap', [f.boolean('enabled', 'متاح', 'Enabled', { default: false }), f.money('price', 'السعر', 'Price'), f.number('cardMaxLength', 'أقصى عدد أحرف للبطاقة', 'Card message length', { int: true, min: 0, default: 200 })], { collapsed: true }),
  f.number('notesMaxLength', 'أقصى عدد أحرف للملاحظات', 'Notes length', { int: true, min: 0, default: 300 }),
  f.string('termsPage', 'صفحة الشروط', 'Terms page', { default: 'terms' }),
  f.i18nText('confirmationNote', 'رسالة بعد الطلب', 'Confirmation note', { multiline: true }),
  f.object('giftCards', 'بطاقات الهدايا', 'Gift cards', [f.i18nText('terms', 'شروط البطاقة', 'Terms', { multiline: true }), f.number('customMin', 'أقل مبلغ مخصّص', 'Custom min', { min: 0 }), f.number('customMax', 'أكبر مبلغ مخصّص', 'Custom max', { min: 0 })], { collapsed: true }),
];

export const bookingFields: Field[] = [
  f.select('slotStepMinutes', 'فاصل المواعيد (دقائق)', 'Slot step (minutes)', [['5', '5', '5'], ['10', '10', '10'], ['15', '15', '15'], ['30', '30', '30'], ['60', '60', '60']], { default: '30' }),
  f.number('leadMinutes', 'أقل مدة قبل الموعد (دقائق)', 'Minimum notice (minutes)', { int: true, min: 0, default: 180 }),
  f.time('sameDayCutoff', 'آخر وقت لحجز نفس اليوم', 'Same-day booking cutoff'),
  f.number('horizonDays', 'يُفتح الحجز لمدة (أيام)', 'Booking horizon (days)', { int: true, min: 1, default: 45 }),
  f.number('bufferBefore', 'وقت تجهيز قبل الموعد (دقائق)', 'Buffer before (minutes)', { int: true, min: 0, default: 0 }),
  f.number('bufferAfter', 'وقت بعد الموعد (دقائق)', 'Buffer after (minutes)', { int: true, min: 0, default: 10 }),
  f.object('dailyCap', 'الحد اليومي', 'Daily cap', [
    f.number('default', 'الحد اليومي', 'Default cap', { int: true, min: 0 }),
    ...WEEKDAY_OPTIONS.map(([id, ar, en]) => f.number(id, `حد ${ar}`, `${en} cap`, { int: true, min: 0 })),
    f.select('unit', 'يُحسب بعدد', 'Counted in', [['bookings', 'الحجوزات', 'Bookings'], ['orders', 'الطلبات', 'Orders'], ['guests', 'الأشخاص', 'Guests']], { default: 'bookings' }),
  ], { collapsed: true }),
  f.objects('blackouts', 'أيام مغلقة', 'Closed dates', [f.date('from', 'من', 'From', { required: true }), f.date('to', 'إلى', 'To', { required: true }), f.i18nText('reason', 'السبب', 'Reason')], { summary: '{{fields.from}} → {{fields.to}}' }),
  f.list('fullDates', 'أيام محجوزة بالكامل', 'Fully booked dates', 'date', { hint: { ar: 'أضف التاريخ عند امتلاء اليوم فيختفي من نموذج الحجز.', en: 'Add a date when the day is full; the form hides it.' } }),
  f.objects('windows', 'فترات الحجز الموسمية', 'Seasonal booking windows', [
    f.string('id', 'الرمز', 'Id', { required: true }),
    f.i18nText('label', 'الاسم', 'Label', { required: true }),
    f.date('opensOn', 'يُفتح الحجز في', 'Opens on', { required: true }),
    f.date('closesOn', 'يُغلق الحجز في', 'Closes on'),
    f.date('eventFrom', 'المواعيد من', 'Appointments from', { required: true }),
    f.date('eventTo', 'المواعيد حتى', 'Appointments to', { required: true }),
    f.number('dailyCap', 'الحد اليومي', 'Daily cap', { int: true, min: 0 }),
  ], { summary: '{{fields.id}}' }),
  f.object('deposit', 'العربون', 'Deposit', [
    f.select('kind', 'النوع', 'Kind', [['none', 'بدون عربون', 'None'], ['fixed', 'مبلغ ثابت', 'Fixed'], ['percent', 'نسبة من السعر', 'Percent']], { default: 'none' }),
    f.money('amount', 'المبلغ الثابت', 'Fixed amount'),
    f.number('percent', 'النسبة ٪', 'Percent', { min: 0, max: 100 }),
    f.money('min', 'أقل عربون', 'Minimum'),
    f.money('max', 'أعلى عربون', 'Maximum'),
    f.money('roundUpTo', 'يُقرَّب لأعلى إلى', 'Round up to'),
  ]),
  f.number('freeCancelHours', 'إلغاء مجاني قبل الموعد بـ (ساعات)', 'Free cancellation (hours)', { int: true, min: 0, default: 24 }),
  f.boolean('depositRefundable', 'العربون يُسترد عند الإلغاء', 'Deposit refundable', { default: false }),
  f.number('holdMinutes', 'مدة حجز الموعد أثناء الدفع (دقائق)', 'Hold while paying (minutes)', { int: true, min: 5, default: 15 }),
  f.objects('locations', 'أماكن الخدمة', 'Service locations', [f.string('id', 'الرمز', 'Id', { required: true }), f.i18nText('label', 'الاسم', 'Label', { required: true }), f.money('fee', 'رسوم إضافية', 'Extra fee')], { summary: '{{fields.id}}' }),
];

export const notificationFields: Field[] = [
  f.list('ownerEmails', 'بريد صاحب المتجر', 'Owner emails', 'string', { hint: { ar: 'تصل عليه تنبيهات الطلبات ويُستخدم لدخول لوحة الطلبات.', en: 'Receives order mail and can log in to the dashboard.' } }),
  f.string('ownerWhatsapp', 'واتساب صاحب المتجر', 'Owner WhatsApp', e164),
  f.select('notifyOn', 'التنبيه عند', 'Notify on', [['order.placed', 'طلب جديد', 'New order'], ['order.paid', 'طلب مدفوع', 'Paid order'], ['booking.confirmed', 'حجز مؤكد', 'Confirmed booking'], ['enquiry', 'استفسار', 'Enquiry']], { multiple: true }),
];

export function settingsFields(id: SettingsId, sections: SectionId[]): Field[] {
  switch (id) {
    case 'general':
      return generalFields;
    case 'contact':
      return contactFields;
    case 'hours':
      return hoursFields;
    case 'home':
      return homeFields(sections);
    case 'seo':
      return seoFields;
    case 'sizes':
      return sizesFields;
    case 'fulfilment':
      return fulfilmentFields;
    case 'checkout':
      return checkoutFields;
    case 'booking':
      return bookingFields;
    case 'notifications':
      return notificationFields;
  }
}
