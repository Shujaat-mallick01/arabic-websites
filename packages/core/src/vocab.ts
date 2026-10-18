// Names shared across packages: presets, modules, layout variants, payment methods.
// They live in core so the site config schema can validate them without importing higher packages.

export const ENGINE_PRESETS = ['commerce.lite', 'commerce.full', 'booking.lite', 'booking.full'] as const;
export type EnginePresetId = (typeof ENGINE_PRESETS)[number];

export const NICHES = ['fashion', 'perfume', 'chocolatier', 'sweets', 'cakes', 'beauty', 'henna', 'favors', 'events'] as const;
export type NicheId = (typeof NICHES)[number];

export const MODULES = [
  // shared
  'pages', 'faq', 'reviews', 'gallery', 'lookbook', 'offers', 'branches', 'stockists', 'shareLinks', 'hijriDates',
  // commerce
  'catalog', 'categories', 'facets', 'sizeGuide', 'notesPyramid', 'personalisation', 'wrapperPreview',
  'menuPage', 'seasonalSections', 'estimateBuilder', 'corporateEnquiry', 'sameDayCutoff',
  'whatsappOrder', 'cart', 'checkout', 'fulfilment', 'deliverySlots', 'pickup', 'cod', 'stock', 'giftCards',
  // booking
  'services', 'packages', 'bookingRequest', 'bookingCalendar', 'resources', 'dailyCap', 'seasonalWindows',
  'deposits', 'referenceUpload',
  // runtime
  'payments', 'ownerDashboard', 'orderNotifications',
] as const;
export type ModuleId = (typeof MODULES)[number];

export const PROVIDERS = ['mock', 'cod', 'tap', 'myfatoorah', 'moyasar', 'paytabs', 'checkout', 'credimax', 'zaincash', 'fastpay'] as const;
export type ProviderName = (typeof PROVIDERS)[number];
export type OnlineProvider = Exclude<ProviderName, 'mock' | 'cod'>;

export const PAYMENT_METHODS = [
  'card', 'mada', 'apple_pay', 'google_pay', 'knet', 'benefit', 'benefitpay',
  'stc_pay', 'omannet', 'qpay', 'zaincash', 'fastpay', 'cod',
] as const;
export type PaymentMethodId = (typeof PAYMENT_METHODS)[number];

export const SCHEMA_ORG_TYPES = ['ClothingStore', 'Store', 'Bakery', 'BeautySalon', 'LocalBusiness'] as const;
export type SchemaOrgType = (typeof SCHEMA_ORG_TYPES)[number];

export const FACETS = ['category', 'size', 'color', 'family', 'notes', 'concentration', 'bottleSize', 'occasion', 'price', 'availability', 'material'] as const;
export type FacetId = (typeof FACETS)[number];

// Layout variants. Each name maps to a complete component in @aw/ui.
export const LAYOUT_VARIANTS = {
  hero: [
    'full-bleed-photo', 'split-editorial', 'asymmetric-collage', 'product-spotlight', 'lookbook-strip', 'menu-board',
    'calendar-first', 'portfolio-mosaic', 'estimate-builder', 'cutoff-countdown', 'typographic-statement', 'arch-frame',
    'story-rail', 'branch-console', 'clothes-rail', 'availability-strip', 'occasion-mosaic',
  ],
  nav: ['bar-start-logo', 'bar-centered-logo', 'bottom-tabs', 'minimal-sheet'],
  categoryEntry: ['story-rings', 'story-cards', 'pill-scroller', 'tile-grid', 'text-index', 'tabs'],
  productCard: ['portrait-minimal', 'square-caption', 'overlay-caption', 'menu-row', 'swatch-card', 'service-ledger', 'swing-tag'],
  grid: ['two-col', 'one-col-large', 'masonry', 'list'],
  imageShape: ['rect', 'portrait', 'arch', 'soft', 'circle-crop'],
  productPage: ['gallery-sticky', 'stacked-full-bleed', 'carousel-top'],
  whatsapp: ['floating-pill', 'bottom-bar', 'inline-only'],
  footer: ['columns', 'centered-mark', 'band'],
  rhythm: ['airy', 'standard', 'dense'],
} as const;

export type HeroVariant = (typeof LAYOUT_VARIANTS.hero)[number];
export type NavVariant = (typeof LAYOUT_VARIANTS.nav)[number];
export type CategoryEntryVariant = (typeof LAYOUT_VARIANTS.categoryEntry)[number];
export type ProductCardVariant = (typeof LAYOUT_VARIANTS.productCard)[number];
export type GridVariant = (typeof LAYOUT_VARIANTS.grid)[number];
export type ImageShape = (typeof LAYOUT_VARIANTS.imageShape)[number];
export type ProductPageVariant = (typeof LAYOUT_VARIANTS.productPage)[number];
export type WhatsappVariant = (typeof LAYOUT_VARIANTS.whatsapp)[number];
export type FooterVariant = (typeof LAYOUT_VARIANTS.footer)[number];
export type Rhythm = (typeof LAYOUT_VARIANTS.rhythm)[number];
