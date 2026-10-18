// Field definitions for every entry collection, plus the niche field packs.
// Labels use neutral Arabic (nouns, passive) because owners may be women or men.

import { f, type Field } from '../fields.ts';

const slugHint = { ar: 'حروف إنجليزية صغيرة وأرقام وشرطات فقط، مثل linen-kaftan. لا يُغيَّر بعد النشر لأنه جزء من الرابط.', en: 'Lowercase Latin letters, digits and dashes, e.g. linen-kaftan. Do not change after publishing.' };
const slugPattern: [string, { ar: string; en: string }] = ['^[a-z0-9]+(-[a-z0-9]+)*$', { ar: 'يُسمح بالحروف الإنجليزية الصغيرة والأرقام والشرطة فقط', en: 'Lowercase letters, digits and dashes only' }];

export const common = {
  id: f.hidden('id', { default: '{{uuid_short}}' }),
  slug: f.string('_slug', 'رابط الصفحة (بالإنجليزي)', 'URL slug', { pattern: slugPattern, hint: slugHint }),
  title: f.string('title', 'الاسم', 'Title', { i18n: true, required: true, maxLength: 90 }),
  summary: f.text('summary', 'وصف قصير', 'Summary', { i18n: true, maxLength: 220, hint: { ar: 'سطر أو سطران يظهران تحت الاسم في القوائم.', en: 'One or two lines shown under the name in lists.' } }),
  description: f.markdown('description', 'الوصف الكامل', 'Description', { i18n: true }),
  order: f.number('order', 'ترتيب الظهور', 'Order', { int: true, min: 0, hint: { ar: 'الرقم الأصغر يظهر أولاً.', en: 'Lower numbers show first.' } }),
  featured: f.boolean('featured', 'يظهر في الواجهة', 'Featured', { default: false }),
  images: f.objects('images', 'الصور', 'Images', [
    f.image('src', 'الصورة', 'Image', { required: true }),
    f.string('alt_ar', 'وصف الصورة بالعربي', 'Alt text (Arabic)', { hint: { ar: 'يساعد من يستخدم قارئ الشاشة. اتركه فارغاً ليُستخدم اسم المنتج.', en: 'Leave empty to use the item name.' } }),
    f.string('alt_en', 'وصف الصورة بالإنجليزي', 'Alt text (English)'),
  ], { min: 1, summary: '{{fields.alt_ar}}', hint: { ar: 'الصورة الأولى هي الغلاف. يُفضّل صور طولية بإضاءة طبيعية.', en: 'The first image is the cover.' } }),
};

const availability = f.select('availability', 'التوفر', 'Availability', [
  ['in_stock', 'متوفر', 'In stock'],
  ['ready_now', 'جاهز الآن', 'Ready now'],
  ['made_to_order', 'يُجهَّز حسب الطلب', 'Made to order'],
  ['preorder', 'طلب مسبق', 'Pre-order'],
  ['sold_out', 'نفدت الكمية', 'Sold out'],
], { default: 'in_stock', required: true });

export const productBase: Field[] = [
  common.id,
  common.slug,
  common.title,
  common.summary,
  common.description,
  f.money('price', 'السعر', 'Price', { required: true }),
  f.money('compareAt', 'السعر قبل التخفيض', 'Compare-at price', { hint: { ar: 'اتركه فارغاً إذا لا يوجد تخفيض.', en: 'Leave empty when not on sale.' } }),
  f.relation('category', 'القسم', 'Category', 'categories', { required: true }),
  f.list('tags', 'وسوم', 'Tags', 'string', { hint: { ar: 'كلمات للتصفية مثل new أو gift. بالإنجليزي وبدون مسافات.', en: 'Filter words like new or gift.' } }),
  availability,
  common.featured,
  common.order,
  common.images,
];

export const packs: Record<string, Field[]> = {
  'fashion.sizes': [f.select('sizes', 'المقاسات المتوفرة', 'Sizes', [], { multiple: true, hint: { ar: 'القائمة تأتي من إعدادات المقاسات.', en: 'Options come from Settings → Sizes.' } })],
  'fashion.lengths': [f.list('lengths', 'الأطوال المتوفرة (بوصة)', 'Lengths (inches)', 'number', { hint: { ar: 'مثل 54 و56 و58.', en: 'e.g. 54, 56, 58.' } })],
  'fashion.colors': [
    f.objects('colors', 'الألوان', 'Colours', [
      f.string('id', 'رمز اللون (بالإنجليزي)', 'Colour id', { required: true, pattern: slugPattern }),
      f.string('name_ar', 'اسم اللون بالعربي', 'Name (Arabic)', { required: true }),
      f.string('name_en', 'اسم اللون بالإنجليزي', 'Name (English)', { required: true }),
      f.color('hex', 'اللون', 'Swatch', { required: true }),
    ], { summary: '{{fields.name_ar}}' }),
  ],
  'fashion.care': [f.string('fabric', 'القماش', 'Fabric', { i18n: true }), f.text('care', 'العناية', 'Care', { i18n: true }), f.text('fit', 'القصّة والمقاس', 'Fit notes', { i18n: true })],
  'fashion.hemming': [f.boolean('hemming', 'تقصير مجاني على الطول', 'Free hemming', { hint: { ar: 'يضيف يومين للتجهيز، والقطعة المقصّرة لا تُسترجع.', en: 'Adds two days; hemmed pieces are final sale.' } })],
  'perfume.bottles': [f.objects('bottles', 'أحجام العبوة', 'Bottle sizes', [f.number('ml', 'الحجم (مل)', 'Size (ml)', { int: true, required: true, min: 1 }), f.money('price', 'السعر', 'Price', { required: true })], { min: 1, summary: '{{fields.ml}} مل' })],
  'perfume.family': [f.select('family', 'العائلة العطرية', 'Scent family', [['oud', 'عود', 'Oud'], ['amber', 'عنبر', 'Amber'], ['floral', 'زهري', 'Floral'], ['fresh', 'منعش', 'Fresh'], ['musk', 'مسك', 'Musk'], ['woody', 'خشبي', 'Woody'], ['bakhoor', 'بخور', 'Bakhoor']], { required: true })],
  'perfume.notes': [
    f.relation('notesTop', 'مقدمة العطر', 'Top notes', 'notes', { multiple: true }),
    f.relation('notesHeart', 'قلب العطر', 'Heart notes', 'notes', { multiple: true }),
    f.relation('notesBase', 'قاعدة العطر', 'Base notes', 'notes', { multiple: true }),
  ],
  'perfume.concentration': [f.select('concentration', 'التركيز', 'Concentration', [['parfum', 'بارفان', 'Parfum'], ['edp', 'أو دو بارفان', 'Eau de parfum'], ['edt', 'أو دو تواليت', 'Eau de toilette'], ['oil', 'دهن عطر', 'Perfume oil'], ['bakhoor', 'بخور', 'Bakhoor'], ['set', 'طقم هدية', 'Gift set']])],
  giftWrap: [f.boolean('giftWrap', 'يُقدَّم بتغليف هدية', 'Gift wrap available', { default: true })],
  occasion: [f.select('occasions', 'المناسبات', 'Occasions', [['eid', 'العيد', 'Eid'], ['wedding', 'زواج', 'Wedding'], ['graduation', 'تخرج', 'Graduation'], ['newborn', 'مولود', 'Newborn'], ['gift', 'هدية', 'Gift'], ['corporate', 'شركات', 'Corporate']], { multiple: true })],
  'chocolatier.trays': [f.objects('trays', 'أحجام الصواني والعلب', 'Trays and boxes', [f.string('label_ar', 'الاسم بالعربي', 'Label (Arabic)', { required: true }), f.string('label_en', 'الاسم بالإنجليزي', 'Label (English)', { required: true }), f.number('pieces', 'عدد الحبات', 'Pieces', { int: true, min: 1 }), f.money('price', 'السعر', 'Price', { required: true })], { min: 1, summary: '{{fields.label_ar}}' })],
  personalisation: [
    f.object('personalisation', 'التخصيص', 'Personalisation', [
      f.boolean('enabled', 'يقبل التخصيص', 'Enabled', { default: false }),
      f.money('price', 'سعر التخصيص', 'Personalisation price'),
      f.objects('fields', 'الخانات', 'Fields', [
        f.string('id', 'رمز الخانة (بالإنجليزي)', 'Field id', { required: true, pattern: slugPattern }),
        f.string('label_ar', 'عنوان الخانة بالعربي', 'Label (Arabic)', { required: true }),
        f.string('label_en', 'عنوان الخانة بالإنجليزي', 'Label (English)', { required: true }),
        f.number('maxLength', 'أقصى عدد أحرف', 'Max characters', { int: true, min: 1, max: 200, default: 30 }),
        f.boolean('required', 'إجباري', 'Required', { default: false }),
      ], { summary: '{{fields.label_ar}}' }),
    ], { collapsed: true, hint: { ar: 'المنتجات المخصّصة تحتاج مدة تجهيز أطول (من إعدادات التوصيل).', en: 'Personalised items use the longer lead time from delivery settings.' } }),
  ],
  'sweets.sizes': [
    f.select('unit', 'وحدة البيع', 'Sold by', [['piece', 'بالحبة', 'Per piece'], ['tray', 'بالصينية', 'Per tray'], ['box', 'بالعلبة', 'Per box'], ['kg', 'بالكيلو', 'Per kg']], { default: 'tray' }),
    f.objects('sizes', 'الأحجام', 'Sizes', [f.string('label_ar', 'الحجم بالعربي', 'Label (Arabic)', { required: true }), f.string('label_en', 'الحجم بالإنجليزي', 'Label (English)', { required: true }), f.money('price', 'السعر', 'Price', { required: true })], { summary: '{{fields.label_ar}}' }),
  ],
  'cakes.sizes': [f.objects('sizes', 'الأحجام', 'Sizes', [f.string('label_ar', 'الحجم بالعربي', 'Label (Arabic)', { required: true }), f.string('label_en', 'الحجم بالإنجليزي', 'Label (English)', { required: true }), f.number('serves', 'يكفي (أشخاص)', 'Serves', { int: true, min: 1 }), f.money('price', 'السعر', 'Price', { required: true })], { summary: '{{fields.label_ar}}' })],
  'cakes.flavours': [f.objects('flavours', 'النكهات', 'Flavours', [f.string('id', 'رمز النكهة', 'Id', { required: true, pattern: slugPattern }), f.string('label_ar', 'النكهة بالعربي', 'Label (Arabic)', { required: true }), f.string('label_en', 'النكهة بالإنجليزي', 'Label (English)', { required: true }), f.money('delta', 'زيادة على السعر', 'Price add-on')], { summary: '{{fields.label_ar}}' })],
  'cakes.textOnCake': [f.object('textOnCake', 'كتابة على الكيكة', 'Text on cake', [f.boolean('enabled', 'متاحة', 'Enabled', { default: true }), f.number('maxLength', 'أقصى عدد أحرف', 'Max characters', { int: true, min: 5, max: 60, default: 30 })], { collapsed: true })],
  'favors.moq': [f.number('minQty', 'أقل كمية', 'Minimum quantity', { int: true, min: 1, default: 25 }), f.number('qtyStep', 'الزيادة بمضاعفات', 'Quantity step', { int: true, min: 1, default: 5 }), f.number('maxQty', 'أكثر كمية للطلب', 'Maximum quantity', { int: true, min: 1 })],
  'favors.tiers': [f.objects('tiers', 'أسعار الكميات', 'Quantity tiers', [f.number('minQty', 'من كمية', 'From quantity', { int: true, min: 1, required: true }), f.money('unitPrice', 'سعر القطعة', 'Unit price', { required: true })], { summary: '{{fields.minQty}}+', hint: { ar: 'السعر ينزل كلما زادت الكمية. أول سطر يكون أقل كمية.', en: 'Price per piece falls as quantity rises.' } })],
  eventDate: [f.object('eventDate', 'تاريخ المناسبة', 'Event date', [f.boolean('enabled', 'يُطلب تاريخ المناسبة', 'Ask for the event date', { default: true }), f.number('leadDays', 'أقل مدة قبل المناسبة (أيام)', 'Minimum notice (days)', { int: true, min: 0, default: 10 })], { collapsed: true })],
  'events.package': [
    f.list('inclusions_ar', 'يشمل (بالعربي)', 'Includes (Arabic)', 'string'),
    f.list('inclusions_en', 'يشمل (بالإنجليزي)', 'Includes (English)', 'string'),
    f.relation('addons', 'الإضافات المتاحة', 'Available add-ons', 'addons', { multiple: true }),
    f.relation('themes', 'الثيمات المتاحة', 'Available themes', 'themes', { multiple: true }),
    f.string('guests', 'عدد الضيوف', 'Guests', { i18n: true }),
  ],
  referenceImage: [f.boolean('referenceImage', 'يقبل صورة مرجعية', 'Accepts a reference image', { default: true })],
  'beauty.requirements': [
    f.objects('requires', 'يحتاج', 'Requires', [
      f.select('kind', 'النوع', 'Kind', [['staff', 'موظفة', 'Staff'], ['room', 'غرفة', 'Room'], ['station', 'محطة', 'Station']], { required: true }),
      f.string('skill', 'المهارة', 'Skill', { hint: { ar: 'مثل bridal-makeup. يجب أن تطابق مهارة في صفحة الفريق.', en: 'Must match a skill on a team member.' } }),
      f.relation('resourceIds', 'تحديد بالاسم', 'Specific resources', 'resources', { multiple: true }),
    ], { summary: '{{fields.kind}} {{fields.skill}}' }),
  ],
  'henna.styles': [f.select('styles', 'الأنماط', 'Styles', [['khaleeji', 'خليجي', 'Khaleeji'], ['indian', 'هندي', 'Indian'], ['sudanese', 'سوداني', 'Sudanese'], ['minimal', 'ناعم', 'Minimal'], ['bridal', 'عرايس', 'Bridal']], { multiple: true })],
};

export const serviceBase: Field[] = [
  common.id,
  common.slug,
  common.title,
  common.summary,
  common.description,
  f.relation('category', 'القسم', 'Category', 'categories', { required: true }),
  f.number('durationMinutes', 'المدة (دقائق)', 'Duration (minutes)', { int: true, min: 5, required: true }),
  f.select('priceKind', 'نوع السعر', 'Price type', [['fixed', 'سعر ثابت', 'Fixed'], ['from', 'يبدأ من', 'From']], { default: 'fixed' }),
  f.money('price', 'السعر', 'Price', { required: true }),
  f.object('deposit', 'عربون خاص بالخدمة', 'Deposit override', [
    f.select('kind', 'النوع', 'Kind', [['default', 'حسب إعدادات الحجز', 'Use booking settings'], ['none', 'بدون عربون', 'None'], ['fixed', 'مبلغ ثابت', 'Fixed'], ['percent', 'نسبة', 'Percent']], { default: 'default' }),
    f.money('amount', 'المبلغ', 'Amount'),
    f.number('percent', 'النسبة ٪', 'Percent', { min: 0, max: 100 }),
  ], { collapsed: true }),
  f.boolean('bookableOnline', 'يُحجز أونلاين', 'Bookable online', { default: true }),
  common.featured,
  common.order,
  f.objects('images', 'الصور', 'Images', [f.image('src', 'الصورة', 'Image', { required: true }), f.string('alt_ar', 'وصف الصورة بالعربي', 'Alt (Arabic)'), f.string('alt_en', 'وصف الصورة بالإنجليزي', 'Alt (English)')]),
];

export const categoryFields: Field[] = [
  common.slug,
  common.title,
  common.summary,
  f.image('image', 'صورة القسم', 'Image'),
  common.order,
  f.select('season', 'موسمي', 'Seasonal', [['none', 'طوال السنة', 'All year'], ['ramadan', 'رمضان', 'Ramadan'], ['eid', 'العيد', 'Eid'], ['national-day', 'العيد الوطني', 'National Day']], { default: 'none' }),
  f.date('visibleFrom', 'يظهر من', 'Visible from'),
  f.date('visibleTo', 'يظهر حتى', 'Visible until'),
];

export const packageFields: Field[] = [
  common.id,
  common.slug,
  common.title,
  common.summary,
  common.description,
  f.money('price', 'السعر', 'Price', { required: true }),
  f.list('inclusions_ar', 'يشمل (بالعربي)', 'Includes (Arabic)', 'string'),
  f.list('inclusions_en', 'يشمل (بالإنجليزي)', 'Includes (English)', 'string'),
  f.relation('services', 'الخدمات المشمولة', 'Included services', 'services', { multiple: true }),
  f.relation('addons', 'الإضافات المتاحة', 'Available add-ons', 'addons', { multiple: true }),
  f.relation('themes', 'الثيمات', 'Themes', 'themes', { multiple: true }),
  f.string('guests', 'عدد الضيوف', 'Guests', { i18n: true }),
  f.number('durationMinutes', 'المدة (دقائق)', 'Duration (minutes)', { int: true, min: 0 }),
  common.featured,
  common.order,
  f.image('image', 'الصورة', 'Image'),
];

export const addonFields: Field[] = [common.slug, common.title, common.summary, f.money('price', 'السعر', 'Price', { required: true }), f.number('maxQty', 'أكثر عدد', 'Max quantity', { int: true, min: 1, default: 1 }), f.string('unit', 'الوحدة', 'Unit', { i18n: true }), common.order, f.image('image', 'الصورة', 'Image')];

export const themeFields: Field[] = [
  common.slug,
  common.title,
  common.summary,
  common.description,
  f.list('swatches', 'ألوان الثيم', 'Theme colours', 'string', { hint: { ar: 'أكواد ألوان مثل #1E2A44.', en: 'Hex colours like #1E2A44.' } }),
  common.order,
  common.images,
];

export const resourceFields: Field[] = [
  f.string('id', 'الرمز (بالإنجليزي)', 'Id', { required: true, pattern: slugPattern }),
  f.select('kind', 'النوع', 'Kind', [['staff', 'موظفة', 'Staff'], ['room', 'غرفة', 'Room'], ['station', 'محطة', 'Station'], ['kitchen', 'مطبخ', 'Kitchen']], { required: true }),
  f.i18nText('name', 'الاسم', 'Name', { required: true }),
  f.i18nText('role', 'الوصف', 'Role'),
  f.number('capacity', 'عدد الحجوزات في نفس الوقت', 'Parallel bookings', { int: true, min: 1, default: 1 }),
  f.list('skills', 'المهارات', 'Skills', 'string', { hint: { ar: 'مثل bridal-makeup و nails. تُستخدم لربط الخدمات.', en: 'Used to match services.' } }),
  f.list('daysOff', 'أيام الإجازة', 'Days off', 'date'),
  f.boolean('active', 'متاح للحجز', 'Active', { default: true }),
  common.order,
  f.image('photo', 'الصورة', 'Photo'),
];

export const noteFields: Field[] = [common.slug, common.title, common.summary, f.select('family', 'العائلة', 'Family', [['oud', 'عود', 'Oud'], ['amber', 'عنبر', 'Amber'], ['floral', 'زهري', 'Floral'], ['fresh', 'منعش', 'Fresh'], ['musk', 'مسك', 'Musk'], ['woody', 'خشبي', 'Woody'], ['spice', 'توابل', 'Spice'], ['fruit', 'فواكه', 'Fruit']]), f.image('image', 'الصورة', 'Image')];

export const wrapperFields: Field[] = [common.slug, common.title, f.color('band', 'لون الشريط', 'Band colour', { required: true }), f.color('ink', 'لون الكتابة', 'Text colour', { required: true }), f.color('foil', 'لون الورق', 'Foil colour', { required: true }), common.order, f.image('image', 'الصورة', 'Image')];

export const galleryFields: Field[] = [
  f.image('image', 'الصورة', 'Image', { required: true }),
  f.string('caption', 'التعليق', 'Caption', { i18n: true }),
  f.string('alt', 'وصف الصورة', 'Alt text', { i18n: true }),
  f.string('style', 'التصنيف', 'Category', { hint: { ar: 'كلمة بالإنجليزي للتصفية، مثل bridal.', en: 'A filter word, e.g. bridal.' } }),
  f.relation('product', 'المنتج المرتبط', 'Linked product', 'products'),
  common.featured,
  common.order,
];

export const reviewFields: Field[] = [
  f.string('name', 'الاسم', 'Name', { i18n: true, required: true }),
  f.string('city', 'المدينة', 'City', { i18n: true }),
  f.string('item', 'ما تم شراؤه', 'Bought', { i18n: true }),
  f.text('body', 'الرأي', 'Review', { i18n: true, required: true, maxLength: 400 }),
  f.number('rating', 'التقييم', 'Rating', { int: true, min: 1, max: 5, default: 5 }),
  common.order,
];

export const faqFields: Field[] = [
  f.string('question', 'السؤال', 'Question', { i18n: true, required: true }),
  f.markdown('answer', 'الجواب', 'Answer', { i18n: true, required: true }),
  f.string('topic', 'الموضوع', 'Topic', { hint: { ar: 'مثل delivery أو payment أو sizes.', en: 'e.g. delivery, payment, sizes.' } }),
  common.featured,
  common.order,
];

export const branchFields: Field[] = [
  common.slug,
  common.title,
  f.text('address', 'العنوان', 'Address', { i18n: true }),
  f.string('area', 'المنطقة', 'Area', { i18n: true }),
  f.string('phone', 'الهاتف', 'Phone'),
  f.number('lat', 'خط العرض', 'Latitude', { step: 0.0001 }),
  f.number('lng', 'خط الطول', 'Longitude', { step: 0.0001 }),
  f.string('mapsUrl', 'رابط الخريطة', 'Map link'),
  f.boolean('pickup', 'استلام من الفرع', 'Pickup point', { default: true }),
  f.object('hours', 'أوقات خاصة بالفرع', 'Branch hours', weeklyHoursFields(), { collapsed: true }),
  common.order,
  f.image('image', 'الصورة', 'Image'),
];

export const stockistFields: Field[] = [
  common.title,
  f.string('city', 'المدينة', 'City', { i18n: true }),
  f.text('address', 'العنوان', 'Address', { i18n: true }),
  f.text('note', 'ملاحظة', 'Note', { i18n: true }),
  f.string('mapsUrl', 'رابط الخريطة', 'Map link'),
  common.order,
];

export const offerFields: Field[] = [
  common.title,
  common.summary,
  f.string('badge', 'الشارة', 'Badge', { i18n: true }),
  f.string('href', 'الرابط', 'Link', { hint: { ar: 'مثل /shop/sale/', en: 'e.g. /shop/sale/' } }),
  f.date('startsOn', 'يبدأ', 'Starts'),
  f.date('endsOn', 'ينتهي', 'Ends'),
  common.order,
  f.image('image', 'الصورة', 'Image'),
];

export const pageFields: Field[] = [
  f.string('title', 'العنوان', 'Title', { i18n: true, required: true }),
  f.text('description', 'وصف للبحث', 'Meta description', { i18n: true, maxLength: 170 }),
  f.select('kind', 'نوع الصفحة', 'Kind', [['about', 'من نحن', 'About'], ['policy', 'سياسة', 'Policy'], ['size-guide', 'دليل المقاسات', 'Size guide'], ['custom', 'صفحة أخرى', 'Other']], { default: 'policy' }),
  common.order,
  f.image('image', 'صورة', 'Image'),
];

export function timeRangeFields(): Field[] {
  return [f.time('open', 'يفتح', 'Opens', { required: true }), f.time('close', 'يغلق', 'Closes', { required: true, hint: { ar: 'إذا كان الإغلاق بعد منتصف الليل اكتب الوقت كما هو، مثل 02:00.', en: 'After midnight? Enter it as is, e.g. 02:00.' } })];
}

export function weeklyHoursFields(): Field[] {
  const days: Array<[string, string, string]> = [['sat', 'السبت', 'Saturday'], ['sun', 'الأحد', 'Sunday'], ['mon', 'الاثنين', 'Monday'], ['tue', 'الثلاثاء', 'Tuesday'], ['wed', 'الأربعاء', 'Wednesday'], ['thu', 'الخميس', 'Thursday'], ['fri', 'الجمعة', 'Friday']];
  return days.map(([id, ar, en]) => f.objects(id, ar, en, timeRangeFields(), { max: 2, summary: '{{fields.open}}–{{fields.close}}', hint: { ar: 'اتركه فارغاً إذا كان اليوم إجازة.', en: 'Leave empty when closed.' } }));
}
