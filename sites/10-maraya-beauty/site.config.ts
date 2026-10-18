// Site 10 · جَلوة · Jalwa — beauty lounge, booking full + gift cards, Jeddah.
// Design plan: docs/design/10-maraya-beauty.md
import { defineSite } from '@aw/core';

export default defineSite({
  schemaVersion: 1,
  id: '10',
  slug: 'maraya-beauty',
  tier: 'full',
  preset: { primary: 'booking.full', niche: 'beauty' },
  locale: {
    country: 'SA',
    currency: 'SAR',
    timeZone: 'Asia/Riyadh',
    dialect: 'hijazi',
    audience: 'women',
    numberingSystem: 'latn',
    weekStart: 'sat',
    weekend: ['fri', 'sat'],
    hijri: { show: 'bookings', calendar: 'islamic-umalqura' },
  },
  features: { resources: true, packages: true, giftCards: true, hijriDates: true, gallery: true, reviews: true },
  booking: { bookingPrefix: 'JL', granularity: 'slot', resourceModel: 'staff+rooms', staffChoice: 'optional' },
  commerce: {
    orderPrefix: 'JLG',
    giftCards: { denominations: [20_000, 50_000, 100_000], validityMonths: 12, redeem: 'both', codePrefix: 'JALWA' },
  },
  payments: { provider: 'moyasar', methods: ['mada', 'apple_pay', 'stc_pay', 'card'], cod: false, primary: 'online' },
  ops: { store: 'blobs', dashboardAuth: 'demo', mailer: 'outbox', retentionDays: 14 },
  layout: {
    hero: 'arch-frame',
    nav: 'bar-start-logo',
    categoryEntry: 'tabs',
    productCard: 'service-ledger',
    grid: 'list',
    imageShape: 'arch',
    rhythm: 'airy',
    whatsapp: 'bottom-bar',
    footer: 'band',
    productPage: 'gallery-sticky',
    sectionVariants: { reviews: 'single-large', faq: 'accordion-plain' },
    signature: 'mirror-arch-frame',
  },
  seo: { indexing: false, businessType: 'BeautySalon', titleTemplate: { ar: '%s · جَلوة', en: '%s · Jalwa' }, priceRange: '$$' },
  analytics: { provider: 'none' },
  demo: { enabled: true, banner: true, priceAsterisk: true, credit: 'demo', contactRouting: 'studio', sampleOrders: true },
  deploy: { url: 'https://jalwa-lounge-demo.netlify.app', netlifySiteName: 'jalwa-lounge-demo' },
  showcase: {
    oneLiner: {
      ar: 'لاونج تجميل بحجز كامل: مواعيد حسب الخبيرة والغرفة، عربون أونلاين، ودوام بعد منتصف الليل.',
      en: 'A beauty lounge with full booking: slots by stylist and room, online deposits, and hours past midnight.',
    },
    highlights: [
      { ar: 'حجز بعربون', en: 'Deposit booking' },
      { ar: 'خبيرات وغرف', en: 'Staff and rooms' },
      { ar: 'التاريخ الهجري', en: 'Hijri dates' },
    ],
    hubOrder: 10,
  },
});
