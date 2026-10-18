// Engine presets fix the flow; niche presets fix the vocabulary. Sites combine them; nothing is forked.

import type { EnginePresetId, FacetId, I18nText, ModuleId, NicheId, SchemaOrgType } from '@aw/core';

export interface FlowConfig {
  order: 'whatsapp' | 'checkout' | 'none';
  booking: 'whatsapp-request' | 'calendar-deposit' | 'none';
  enquiry: 'whatsapp' | 'form';
}

export interface EnginePreset {
  id: EnginePresetId;
  engine: 'commerce' | 'booking';
  tier: 'lite' | 'full';
  modules: { required: ModuleId[]; optional: ModuleId[] };
  flows: Partial<FlowConfig>;
}

export const ENGINE_PRESETS: Record<EnginePresetId, EnginePreset> = {
  'commerce.lite': {
    id: 'commerce.lite',
    engine: 'commerce',
    tier: 'lite',
    modules: {
      required: ['catalog', 'categories', 'whatsappOrder', 'pages', 'faq', 'shareLinks'],
      optional: ['reviews', 'gallery', 'lookbook', 'offers', 'stockists', 'branches', 'sizeGuide', 'menuPage', 'seasonalSections', 'estimateBuilder', 'facets', 'hijriDates', 'packages', 'personalisation'],
    },
    flows: { order: 'whatsapp', enquiry: 'whatsapp' },
  },
  'commerce.full': {
    id: 'commerce.full',
    engine: 'commerce',
    tier: 'full',
    modules: {
      required: ['catalog', 'categories', 'cart', 'checkout', 'fulfilment', 'payments', 'ownerDashboard', 'orderNotifications', 'pages', 'faq', 'shareLinks'],
      optional: ['cod', 'pickup', 'deliverySlots', 'stock', 'giftCards', 'facets', 'corporateEnquiry', 'personalisation', 'wrapperPreview', 'sameDayCutoff', 'reviews', 'gallery', 'lookbook', 'offers', 'branches', 'sizeGuide', 'notesPyramid', 'referenceUpload', 'hijriDates'],
    },
    flows: { order: 'checkout', enquiry: 'form' },
  },
  'booking.lite': {
    id: 'booking.lite',
    engine: 'booking',
    tier: 'lite',
    modules: {
      required: ['services', 'bookingRequest', 'pages', 'faq'],
      optional: ['gallery', 'reviews', 'seasonalWindows', 'packages', 'offers', 'hijriDates', 'dailyCap'],
    },
    flows: { booking: 'whatsapp-request', enquiry: 'whatsapp' },
  },
  'booking.full': {
    id: 'booking.full',
    engine: 'booking',
    tier: 'full',
    modules: {
      required: ['services', 'bookingCalendar', 'deposits', 'payments', 'ownerDashboard', 'orderNotifications', 'pages', 'faq'],
      optional: ['resources', 'dailyCap', 'seasonalWindows', 'packages', 'referenceUpload', 'giftCards', 'gallery', 'reviews', 'offers', 'hijriDates'],
    },
    flows: { booking: 'calendar-deposit', enquiry: 'form' },
  },
};

export type SectionId =
  | 'hero'
  | 'categories'
  | 'featured'
  | 'new-arrivals'
  | 'rail'
  | 'campaign'
  | 'gift-cards'
  | 'delivery-table'
  | 'lookbook'
  | 'reviews'
  | 'faq-teaser'
  | 'about'
  | 'services'
  | 'packages'
  | 'booking-cta'
  | 'gallery'
  | 'hours'
  | 'branches'
  | 'notes-explorer'
  | 'menu'
  | 'seasonal'
  | 'estimate'
  | 'tiers'
  | 'occasions'
  | 'shop'
  | 'stockists'
  | 'signature';

export interface NichePreset {
  id: NicheId;
  label: I18nText;
  businessType: SchemaOrgType;
  /** CMS/Zod field packs per collection. */
  fieldPacks: { products?: string[]; services?: string[] };
  /** Niche-only collections. */
  collections: string[];
  modules: { add: ModuleId[]; optional: ModuleId[] };
  facets?: FacetId[];
  defaultSections: SectionId[];
  nouns: { item: I18nText; items: I18nText };
}

const t = (ar: string, en: string): I18nText => ({ ar, en });

export const NICHE_PRESETS: Record<NicheId, NichePreset> = {
  fashion: {
    id: 'fashion',
    label: t('عبايات وأزياء', 'Abayas & fashion'),
    businessType: 'ClothingStore',
    fieldPacks: { products: ['fashion.sizes', 'fashion.lengths', 'fashion.colors', 'fashion.care'] },
    collections: [],
    modules: { add: [], optional: ['sizeGuide', 'lookbook', 'stockists'] },
    facets: ['category', 'size', 'color', 'price'],
    defaultSections: ['hero', 'categories', 'new-arrivals', 'rail', 'lookbook', 'reviews', 'faq-teaser'],
    nouns: { item: t('قطعة', 'piece'), items: t('قطع', 'pieces') },
  },
  perfume: {
    id: 'perfume',
    label: t('عطور وبخور', 'Perfume & oud'),
    businessType: 'Store',
    fieldPacks: { products: ['perfume.bottles', 'perfume.family', 'perfume.notes', 'perfume.concentration', 'giftWrap'] },
    collections: ['notes'],
    modules: { add: ['notesPyramid'], optional: ['facets', 'corporateEnquiry', 'personalisation', 'branches'] },
    facets: ['family', 'notes', 'concentration', 'bottleSize', 'price'],
    defaultSections: ['hero', 'categories', 'featured', 'notes-explorer', 'reviews', 'faq-teaser'],
    nouns: { item: t('عطر', 'fragrance'), items: t('عطور', 'fragrances') },
  },
  chocolatier: {
    id: 'chocolatier',
    label: t('شوكولاتة', 'Chocolate'),
    businessType: 'Store',
    fieldPacks: { products: ['chocolatier.trays', 'personalisation'] },
    collections: ['wrappers'],
    modules: { add: ['personalisation'], optional: ['wrapperPreview', 'deliverySlots'] },
    defaultSections: ['hero', 'categories', 'featured', 'signature', 'reviews', 'faq-teaser'],
    nouns: { item: t('علبة', 'box'), items: t('علب', 'boxes') },
  },
  sweets: {
    id: 'sweets',
    label: t('حلويات', 'Sweets'),
    businessType: 'Bakery',
    fieldPacks: { products: ['sweets.sizes'] },
    collections: [],
    modules: { add: [], optional: ['menuPage', 'seasonalSections'] },
    defaultSections: ['hero', 'menu', 'seasonal', 'reviews', 'hours', 'faq-teaser'],
    nouns: { item: t('صنف', 'item'), items: t('أصناف', 'items') },
  },
  cakes: {
    id: 'cakes',
    label: t('كيك', 'Cakes'),
    businessType: 'Bakery',
    fieldPacks: { products: ['cakes.sizes', 'cakes.textOnCake'], services: ['cakes.sizes', 'cakes.flavours', 'referenceImage'] },
    collections: [],
    modules: { add: [], optional: ['sameDayCutoff', 'referenceUpload', 'dailyCap'] },
    defaultSections: ['hero', 'categories', 'featured', 'gallery', 'reviews', 'faq-teaser'],
    nouns: { item: t('كيكة', 'cake'), items: t('كيك', 'cakes') },
  },
  beauty: {
    id: 'beauty',
    label: t('صالون تجميل', 'Beauty salon'),
    businessType: 'BeautySalon',
    fieldPacks: { services: ['beauty.requirements'] },
    collections: ['resources'],
    modules: { add: [], optional: ['resources', 'packages', 'giftCards'] },
    defaultSections: ['hero', 'services', 'packages', 'gallery', 'reviews', 'hours', 'faq-teaser'],
    nouns: { item: t('خدمة', 'service'), items: t('خدمات', 'services') },
  },
  henna: {
    id: 'henna',
    label: t('حنّاء', 'Henna'),
    businessType: 'BeautySalon',
    fieldPacks: { services: ['henna.styles'] },
    collections: [],
    modules: { add: ['gallery'], optional: ['seasonalWindows'] },
    defaultSections: ['hero', 'gallery', 'booking-cta', 'services', 'shop', 'reviews', 'faq-teaser'],
    nouns: { item: t('نقشة', 'design'), items: t('نقوش', 'designs') },
  },
  favors: {
    id: 'favors',
    label: t('توزيعات', 'Favours'),
    businessType: 'Store',
    fieldPacks: { products: ['favors.moq', 'favors.tiers', 'personalisation', 'eventDate'] },
    collections: [],
    modules: { add: ['personalisation'], optional: ['corporateEnquiry'] },
    defaultSections: ['hero', 'occasions', 'featured', 'tiers', 'reviews', 'faq-teaser'],
    nouns: { item: t('توزيعة', 'favour'), items: t('توزيعات', 'favours') },
  },
  events: {
    id: 'events',
    label: t('تنسيق مناسبات', 'Events'),
    businessType: 'LocalBusiness',
    fieldPacks: { products: ['events.package', 'eventDate'] },
    collections: ['themes', 'addons'],
    modules: { add: ['estimateBuilder', 'packages'], optional: [] },
    defaultSections: ['hero', 'estimate', 'packages', 'gallery', 'reviews', 'faq-teaser'],
    nouns: { item: t('باقة', 'package'), items: t('باقات', 'packages') },
  },
};
