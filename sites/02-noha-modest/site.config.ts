// Site 02 · دريشة · Dareesha — modest everyday wear, commerce full, Bahrain, ships GCC.
// Design plan: docs/design/02-noha-modest.md
import { defineSite } from '@aw/core';

export default defineSite({
  schemaVersion: 1,
  id: '02',
  slug: 'noha-modest',
  tier: 'full',
  preset: { primary: 'commerce.full', niche: 'fashion' },
  locale: {
    country: 'BH',
    currency: 'BHD',
    timeZone: 'Asia/Bahrain',
    dialect: 'khaleeji-bh',
    audience: 'women',
    numberingSystem: 'latn',
    weekStart: 'sat',
    weekend: ['fri', 'sat'],
    hijri: { show: 'never', calendar: 'islamic-umalqura' },
  },
  features: { giftCards: true, stock: true, cod: true, pickup: true, sizeGuide: true, lookbook: true, reviews: true },
  commerce: {
    orderPrefix: 'DR',
    cart: { maxQtyPerLine: 5 },
    stock: { mode: 'tracked', lowStockThreshold: 3 },
    giftCards: { denominations: [10_000, 25_000, 50_000, 100_000], validityMonths: 12, redeem: 'online', codePrefix: 'DRS' },
  },
  payments: { provider: 'tap', methods: ['benefit', 'card', 'apple_pay'], cod: true, primary: 'online' },
  ops: { store: 'blobs', dashboardAuth: 'demo', mailer: 'outbox', retentionDays: 14 },
  layout: {
    hero: 'story-rail',
    nav: 'bar-start-logo',
    categoryEntry: 'story-cards',
    productCard: 'portrait-minimal',
    grid: 'two-col',
    imageShape: 'portrait',
    rhythm: 'airy',
    whatsapp: 'floating-pill',
    footer: 'columns',
    productPage: 'gallery-sticky',
    sectionVariants: { reviews: 'quote-rail', faq: 'accordion-plain' },
    signature: 'arrival-ribbon',
  },
  seo: { indexing: false, businessType: 'ClothingStore', titleTemplate: { ar: '%s · دريشة', en: '%s · Dareesha' }, priceRange: '$$' },
  analytics: { provider: 'none' },
  demo: { enabled: true, banner: true, priceAsterisk: true, credit: 'demo', contactRouting: 'studio', sampleOrders: true },
  deploy: { url: 'https://dareesha-demo.netlify.app', netlifySiteName: 'dareesha-demo' },
  showcase: {
    oneLiner: {
      ar: 'متجر ملابس محتشمة كامل: سلة ودفع أونلاين وشحن لكل الخليج وبطاقات هدايا ولوحة طلبات.',
      en: 'A full modest-wear store: cart, online payment, GCC-wide shipping, gift cards and an orders dashboard.',
    },
    highlights: [
      { ar: 'شحن لدول الخليج', en: 'GCC shipping' },
      { ar: 'تاريخ وصول مباشر', en: 'Live arrival date' },
      { ar: 'بطاقات هدايا', en: 'Gift cards' },
    ],
    hubOrder: 2,
  },
});
