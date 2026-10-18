# 01 · مِداد · Midad: design plan

Step 1 ("Plan first") of `arabic-websites-master-prompt.md`, written 2026-09-23. The folder slug stays `01-layan-abaya`, following the matrix rule that slugs survive renames. Font facts come from `docs/research/fonts-and-logo-pipeline.md` (§A2, §A3, §A5). Contrast ratios and `Intl` strings in this file were computed in Node 22.18 today.

---

## 1. Identity

### Name check: renamed from ليان · Layan to مِداد · Midad

A web search can only rule a name out; it can't prove a name is unused.

| Searched | Found | Verdict |
|---|---|---|
| `Layan abaya Bahrain`, `ليان عبايات البحرين انستقرام`, `"Layan" abayas instagram GCC store` | Several abaya shops already trade under the name: [@layan.abayya "LAYAN ABAYA \| ليـان عباية"](https://www.instagram.com/layan.abayya/) (7.4K followers), [@layan_abaya_](https://www.instagram.com/layan_abaya_/) (Nizwa, Oman), [@layan.abayas](https://www.instagram.com/layan.abayas/?hl=en), and [Layaan Collection](https://layaancollection.com/en-us). "Layan Abaya" is also a product name at [Posh Abaya](https://www.poshabaya.ae/products/black-layan-crepe-abaya-with-clean-minimal-design) (UAE) and other stores | **Rejected.** Same niche, same region |
| `Sadeel abaya`, `سديل عبايات` (سديل, from سَدَل الثوب, "to let a garment hang") | [sadeelabaya.com](https://sadeelabaya.com/en), [@sadeel.abaya](https://www.instagram.com/sadeel.abaya/) (19K followers), the Salla store [isadeel](https://salla.sa/isadeel), and سَدل at [sadal-ksa.com](https://sadal-ksa.com/en/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B3%D8%AF%D9%84/c62280806) | **Rejected** |
| `مداد عبايات`, `Midad abaya`, `Midad Bahrain`, `"midad"` + fashion/boutique/modest/abayat, `"مداد"` + أزياء/بوتيك/عباية | No abaya, modest-wear or fashion business uses the name. The only hits are in unrelated fields: [Midad Library](https://www.bahrainyellow.com/company/15419/Midad_Library) (books, Jidhafs), and [Midad Real Estate](https://midad.com.sa/en/) and [Midad Energy](https://www.midadenergy.com/) (both Saudi). "Mida Abaya" is an Indonesian product with a different spelling | **Adopted** |

### Brand profile

| | |
|---|---|
| **Name** | مِداد · **Midad** (lockup: مداد · عبايات / MIDAD, ABAYAS · BAHRAIN) |
| **Meaning** | Ink: the pure black of the scribe's inkwell. The root م‌د‌د means "to extend", and in calligraphy the stretched connecting stroke (kashida, تطويل) is itself called مدّ. So the name says the two things the brand sells: black, and length. It also fits the display face, Katibeh, whose name means "a woman who writes" |
| **Positioning (AR)** | عبايات سودا للدوام وكل يوم، نفصّلها على طولج بالإنش، وتطلبينها قطعة قطعة على الواتساب. |
| **Positioning (EN)** | Everyday black abayas cut to your exact length, ordered piece by piece on WhatsApp. |
| **Audience** | Bahraini women aged 22–45 buying everyday and occasion black abayas. Mothers and adult daughters often order together, one piece at a time, on WhatsApp, arriving from Instagram on a phone |
| **Preset / tier** | commerce · `lite`: catalogue plus a WhatsApp order per piece and the CMS. No cart and no online payment |
| **Place** | A showroom in East Riffa (الرفاع الشرقي, Southern Governorate). Delivers across Bahrain and ships to the GCC |
| **Currency / time** | BHD, 3 decimals (minor unit = fils). Timezone Asia/Bahrain (UTC+3, no daylight saving) |
| **Dialect** | Bahraini Khaleeji with feminine address (اطلبيها، مقاسج، طولج، يوصلج باچر). Policies are in formal-neutral Arabic |

---

## 2. Palette (structure L: cool pearl ground, jet ink, one oxblood thread)

The palette is near-monochrome so the black fabric in the photos carries the page. Oxblood is the thread: it appears **only** on the length marker, the WhatsApp CTA bar and underlined text links.

| Token | Hex | Used for | Share of page |
|---|---|---|---|
| `bg` | `#E6E7E6` | Page ground (pearl grey) | 55% |
| `surface` | `#F4F4F3` | Caption bars, sheets, form fields, the length band | 20% |
| `ink` | `#121212` | Text, active chip fill, icons, focus ring | 12% |
| `muted` | `#545555` | Secondary text, rail ticks and labels, input borders | 5% |
| `line` | `#C9CBCA` | Decorative 1px hairlines and the demo-banner ground. Never a control boundary | 4% |
| `deep` | `#0A0A0A` | Footer and the photo lightbox | 3% |
| `accent` (oxblood) | `#6A1E24` | Length marker, WhatsApp CTA bar, text links. Nothing else | ≤1% |
| `muted-on-deep` | `#9A9C9B` | Secondary text in the footer and lightbox | (inside `deep`) |
| `accent-on-deep` | `#C0646A` | The oxblood tick in `logo-dark` and the rail marker inside the lightbox | trace |

### Contrast (WCAG 2.x relative luminance)

| Pair | Ratio | Needs | Pass |
|---|---|---|---|
| ink on bg / on surface | **15.11 / 17.02** | 4.5 | ✓ |
| muted on bg / on surface | **6.03 / 6.80** | 4.5 | ✓ |
| accent (links, marker label) on bg / on surface | **9.29 / 10.46** | 4.5 | ✓ |
| surface text on the accent CTA bar | **10.46** | 4.5 | ✓ |
| surface text on an ink-filled active chip | **17.02** | 4.5 | ✓ |
| surface / bg text on deep (footer) | **17.99 / 15.97** | 4.5 | ✓ |
| muted-on-deep on deep | **7.17** | 4.5 | ✓ |
| accent-on-deep on deep | **4.97** | 4.5 | ✓ |
| ink / muted text on line (demo banner) | **11.49 / 4.59** | 4.5 | ✓ |
| Non-text: oxblood marker on bg | 9.29 | 3 | ✓ |
| Non-text: muted input border on surface | 6.80 | 3 | ✓ |
| Non-text: ink focus ring (2px, 2px offset) on bg | 15.11 | 3 | ✓ |
| line on bg / on surface | 1.32 / 1.48 | n/a | decorative only |
| accent on deep / on ink | 1.72 / 1.63 | n/a | **forbidden pairings**: use `accent-on-deep` on dark grounds |

---

## 3. Type

| Role | Arabic | Latin (per §A5) | Payload (Arabic subset) |
|---|---|---|---|
| Display: wordmark, H1/H2, look names | **Katibeh 400**, a naskh headline face with a Thuluth flavour. **Only at 32px or more**, because its body height is small (0.299 em) | **Libre Caslon Display 400**. Caps tracked +0.18em for the wordmark and short labels; sentence case for English headings | 41 KB static, preloaded |
| Body, UI, prices, lengths | **Noto Sans Arabic 400 / 600**, two statics | **Instrument Sans 400 / 600** | 2 × ~49 KB statics rather than the 166 KB VF |

**Why this pairing:**
- **Katibeh with Libre Caslon Display.** Katibeh's alef is 0.681 em and Caslon's cap height is 0.690, so the Latin scale is 99%. Body/x-height is 0.71 and stems are 0.071 vs 0.065. Both are high-contrast display cuts with broad-nib stress.
- **Noto Sans Arabic with Instrument Sans.** Alef 0.714 vs cap 0.720 (99%). Stems 0.081 vs 0.080, so the two give the same colour on the page. Body/x-height is 0.74.
- **Result:** `--latin-scale: 0.99`, so both scripts use the same px values. Only the line-height changes by language.

**Type scale**

| Role | Mobile (390px) | Desktop (1440px) |
|---|---|---|
| H1: first look and page titles, Katibeh | 40 / 1.3 | 72 / 1.2 |
| H2 and look names, Katibeh | 32 / 1.35 | 48 / 1.3 |
| H3 and product names in grids, Noto 600 | 19 / 1.6 | 22 / 1.55 |
| Body, Noto 400 | 17 / 1.75 | 18 / 1.75 |
| Meta and chips, Noto 400/600 | 15 / 1.6 | 15 / 1.6 |
| Price, Noto 600 | 20 / 1.3 | 24 / 1.3 |
| Rail labels, Noto 600 | 13 / 1 | 14 / 1 |

- **English line heights:** display 1.1, body 1.55.
- **Explicit line heights everywhere.** Noto Sans Arabic's `normal` is 2.11.

**Arabic type rules:**
- Never apply `letter-spacing` to Arabic. Tracking tokens live under `:lang(en)` only.
- Stretch Arabic with the kashida and nothing else.

**Numerals policy: `numberingSystem: "arab"`**
- **Prices:** Arabic-Indic digits with ٫ and ٬, straight from `Intl.NumberFormat('ar-BH', {style:'currency', currency:'BHD'})`. That call returns `‏٢٢٫٠٠٠ د.ب.‏`. English pages show `BHD 22.000`.
- **Which face sets numbers:** Katibeh never sets numbers. Prices, lengths and dates are always set in Noto Sans Arabic, which covers U+0660–0669 and U+066B/066C.
- **Rail labels:** use tabular figures if Noto's `tnum` covers the Arabic-Indic digits. Otherwise each label gets a fixed-width box. Check this while scaffolding.
- **Latin-script values** (phone numbers `+973 …` and product codes such as `MD-102`) are set as LTR isolates (`<bdi dir="ltr">`).
- **Dates** are Gregorian (`الخميس، ٢٤ سبتمبر`). Hijri is off by default and is used only to date the Ramadan hours.

---

## 4. Logo concept

**Arabic wordmark: مـــداد in Katibeh, outlined with the harfbuzzjs → SVG pipeline**
- **The kashida.** م→د is the word's only joining pair, and the kashida sits there. It is stretched until it is **exactly as long as the alef is tall**, so the horizontal "tape" and the vertical "hang" match.
- **Drawing the stretch.** Draw it as one continuous path, not as repeated U+0640, so there are no seams.
- **The alef.** It is the free-standing, tallest stroke, like an abaya on a hook. It stands on a short **oxblood horizontal tick** at its foot (the length marker): 2.5× the alef's stem wide and 0.5× the stem thick.
- **Colour.** No dots or ornaments beyond the letters. Ink everywhere; the only colour is the tick.

**Latin lockup**
- **MIDAD** in Libre Caslon Display caps. The cap height is 0.30× the alef height.
- It is tracked (+0.18em minimum) so the word spans **exactly the kashida's length**. It sits under the kashida with a gap of half a cap height.
- Descriptor line, full lockup only and dropped below a 240px lockup width: `عبايات · البحرين / ABAYAS · BAHRAIN` in Instrument Sans 600 caps, tracked +0.2em.

**Mark (favicon and avatar)**
- The alef alone on its oxblood tick, in a square.
- **Light version:** ink alef on `#E6E7E6`.
- **Dark version:** `#F4F4F3` alef with an `accent-on-deep` tick on `#0A0A0A`.
- **16px and 32px favicons are hand-tuned:** the alef is 3px wide and the tick 2px tall.
- It is the only mark in the set that is a single upright letter standing on a coloured baseline tick. It is different from 09's ظ clock hand, which sweeps an arc.

**Clear space and minimum sizes**
- Let x = the alef height in the lockup. Keep **0.5x** clear on every side of the lockup, and 25% of the box around the mark.
- **Minimum sizes:**
  - Full lockup: 140px wide, or 30 mm in print.
  - Arabic-only wordmark: 72px wide.
  - Mark: 16px.

**Files**
- `logo-light.svg` (for light grounds) and `logo-dark.svg` (for dark grounds).
- `og.png`: a 4:5 look on the start side, with the lockup on `bg`.

---

## 5. Hero, layout rhythm and signature

### Hero: lookbook vertical scroll (the first look is the hero; no banner)

**At 390 × 844** (Safari's small viewport is about 664px tall):
- **Sticky top, 92px, on `bg` with a hairline under it:**
  - A header row (48px) with the mark and Arabic wordmark at the start (right), and at the end the EN toggle plus a 44 × 44 menu.
  - The collection chip rail (44px) under it.
- **Each look is one section**, `100svh − 92px` tall, with `scroll-snap-align: start`.
- **Photo.** An uncropped 4:5 full-length portrait, about 302 × 378 on look 1 and 325 × 406 on later looks. It is anchored to the start edge with a 16px gutter.
- **Length rail.** It runs down the remaining inline-end strip (left): 28px visual width, 44px hit area, the same height as the photo.
- **Caption bar.** It sits below the photo on `surface`, anchored to the section bottom:
  - Row 1: the look name in Katibeh 32 («دواة»), with the price at the end in Noto 600 20 (`٢٢٫٠٠٠ د.ب.*`).
  - Row 2: meta in muted 15 (`نِدا · جاهزة ٥٢–٥٨ · تفصيل ٥٠–٦٢`).
  - Row 3: a full-width 52px oxblood bar, «اطلبيها واتساب · طول ٥٦». The length appears once she has set it.
- **Look 1 only** adds the H1 above row 1, in Katibeh 40: «عبايتج على طولج، بالإنش.»

**At 1440 × ~800:**
- **Sticky top, 112px:** a 64px header (lockup at the start; nav: المجموعات، دليل المقاسات، وين تلقينا، الأسئلة; EN toggle; a WhatsApp text link), then a 48px chip rail.
- **Grid.** Sections are about 688px tall on a 12-column grid, 1280px max, with 24px gutters.
- **Photo.** 4:5 at 512 × 640, filling columns 12→7 from the start edge.
- **Caption column.** Columns 6→3, bottom-aligned: the H1 (look 1, Katibeh 72), then the look name (Katibeh 48), meta, price (24), and a CTA bar as wide as the column.
- **Pause.** Columns 2→1 stay empty.
- **Length rail.** Fixed to the viewport's inline-end edge (40px visual, 56px hit area). Its "ready" ticks update per look through one small IntersectionObserver island.
- **In English (LTR)** the whole layout mirrors: photo on the left, rail on the right.

### Homepage, in order
1. Dismissible demo banner (`line` ground, ink text): «هذا نموذج مبدئي، الصور والأسعار توضيحية».
2. Header, plus the sticky collection chips.
3. **Lookbook**: six looks, one per screen. Look 1 carries the H1.
4. **Length band** (`surface`): «حطي طولج مرة وحدة». A −/+ stepper, a big Noto 600 numeral (٥٦), a mini height-to-length table and a link to the size guide. Whatever she sets here drives the rail on every page.
5. **Collections**: a slow two-column staggered grid, **offset by half a card** (the inline-end column drops by half a card).
   - 2:3 images with the name and price below. No borders; a hairline under each text block.
   - Four pieces each from يومية and دوام, plus «كل اليومية (٨)» links.
   - At 1440 the grid is 1040px max with 48px gutters.
6. **Pause**: 96px on mobile and 160px on desktop of plain `bg`, with one Katibeh line: «أسود صافي، مثل المداد.» (the removal candidate in §10).
7. **أم وبنت**: two 2:3 photos side by side, each with its own per-piece CTA, plus a note on free delivery from ٤٥٫٠٠٠.
8. **How to order**: three numbered, hairline-ruled rows aligned to the start edge (not cards): اختاري القطعة ← حطي طولج ومقاسج ← أرسليها واتساب.
9. **Delivery and timing**: the zone table from §7, and ready vs cut-to-length times.
10. **Four reviews**, labelled «آراء توضيحية: نموذج مبدئي».
11. **Stockists teaser**: three rows and a link.
12. **FAQ**: six items using `<details>`, with no JavaScript.
13. **Footer** on `deep`:
    - Hours and the address.
    - CR slot: «السجل التجاري: ١٢٣٤٥٦-١ (رقم توضيحي)».
    - The `*` price footnote.
    - Credit line: «نموذج مبدئي من إعداد Shujaat — تصميم وتطوير المواقع».

**Everywhere except the lookbook,** where every caption bar already has a CTA, a persistent WhatsApp button sits at the bottom of the inline-start side: a 56px ink square.

### Category entry points
- The sticky chip rail reads **الكل · يومية · دوام · مناسبات · أم وبنت · شيلات**. It scrolls horizontally at 390.
- **Chip style:** square ends, text on a 1px `line` box. The active chip is ink-filled with surface text. No pills; pills are site 08's system.
- **Behaviour:** on the home page each chip is an anchor to that collection's first look, with no JavaScript. On other pages the chips link to the collection pages.

### Signature element: the length rule
- **Anatomy**
  - A 1px `muted` vertical line on the inline-end edge of the lookbook, collection and product pages.
  - A 6px tick every inch from **٥٠ at the top to ٦٢ at the bottom** (longer = lower, like a hem dropping). Labels sit every 2 inches.
  - Ready-stock lengths (٥٢–٥٨) get solid ticks and cut-to-length ones get hollow ticks, with the legend «جاهزة / تفصيل».
- **The marker**
  - A 16 × 2px oxblood bar with a square oxblood tag showing «٥٦» in surface text.
  - It slides with `transform` in 200ms.
- **Interaction**
  - The rail is `role="slider"` with `aria-orientation="vertical"`, min 50 and max 62. Arrow keys move it ±1 and PageUp/PageDown ±2. It can be dragged.
  - 44 × 44 − / + buttons sit at each end.
  - Its `aria-valuetext` reads, for example, «٥٦ إنش، جاهزة، توصيل يوم العمل التالي» or «٦٠ إنش، تفصيل خلال ٣ أيام عمل».
- **What changes as it moves**
  - The value is stored per viewer (`midad:length` in localStorage, wrapped in try/catch; the page still works without it).
  - It fills in the CTA label and the WhatsApp message.
  - It switches the lead-time line between ready and cut-to-length.
- **It is also the size guide.**
  - A «كيف أقيس؟» control at the top of the rail opens a sheet with how to measure and the width chart.
  - On `/size-guide` the same rail is drawn full height with each label annotated, e.g. «٥٦ ← ١٦٣–١٦٨ سم».
- **Drift guards**
  - Lead time is given as "next working day" or "3 working days", never a computed date ribbon (that is site 02).
  - Fabrics are text options, never swatches (that is site 03).
  - No stamps (07) and no tags (04).

### Shape and motion
- **Shape:**
  - 0 radius everywhere and 1px hairlines.
  - Tall 4:5 and 2:3 images with no frames and no shadows.
  - Buttons are full-width bars, 52px tall with square ends. Chips and size buttons are 44px squares.
- **Motion:**
  - `scroll-snap-type: y proximity` on the page root, with snap points only on `.look`. `proximity` rather than `mandatory` so the non-snapping sections below scroll freely.
  - The marker moves in 200ms. There are no entrance animations.
- **Under `prefers-reduced-motion`:** snap is off (`scroll-snap-type: none`), the marker jumps instantly, and smooth scroll is off.

### Photography and grade
- **Framing**
  - Every shot is full-length and uncropped: feet visible, about 8% headroom.
  - Shoot against pale lime-plaster walls with the floor visible.
  - Camera at hip height, 85mm equivalent, so there's no leg distortion.
  - Faces are optional or turned away. Mothers and daughters are shot from behind, walking.
- **Grade**
  - Soft overcast daylight at about 5600K, neutral-cool.
  - True blacks (about RGB 14–18) with the weave still visible.
  - Shadows lifted about 5%, saturation −20, no warm cast.
- **Export**
  - 4:5 at 1080 × 1350 and 720 × 900; 2:3 at 800 × 1200.
  - AVIF and WebP with explicit width and height.
  - The first look is `fetchpriority="high"`; everything below it is lazy.

---

## 6. Niche features mapped to engine modules

| Brief feature | Module | Concrete behaviour and config |
|---|---|---|
| Collections | `commerce` catalogue | Five collections, and a product can belong to several (أم وبنت is curated from the others). `look: { order, photo4x5 }` on a product puts it in the lookbook |
| Sizes and lengths | `commerce` variants | `size`: S/M/L/XL (width). `length`: 50–62 in, step 1. `readyLengths` per product (default [52, 54, 56, 58]). **The price is the same for every length.** A length in `readyLengths` is ready; any other length is cut to length |
| Size guide | `ui` length-rule island + CMS `settings.sizeChart` | The heights-to-lengths chart and the width chart. The rail renders both |
| Lead-time rules | `commerce` lead time | Order cutoff 18:00 Asia/Bahrain. Working days are Saturday to Thursday. Ready: 1 day. Cut to length: 3 days. Occasion pieces: 5 days. Seasonal stop for cut-to-length orders: 20 Ramadan |
| WhatsApp order per piece | `whatsapp` builder | Template `order-piece`, with a session reference (`M-0923-47`) so pieces sent one after another are grouped and charged one delivery fee. Honeypot on the form. Validation such as «اختاري المنطقة عشان نحسب لج التوصيل» |
| Per-product share link | `whatsapp` share | «أرسليها لبنتج»: `wa.me/?text=` carrying the product URL, with no length preset |
| Delivery | `commerce` shipping table | The zones in §7, free from 45.000, GCC rows. In `lite` the fee is only added to the estimate in the message |
| Deposit | `commerce` deposit, `mode: manual` | 5.000 for cut-to-length and 10.000 for occasion pieces, via BenefitPay. It is a line in the message; no payment session is created |
| Stockists page | `commerce` locations (same schema as site 03's branches) | `kind: showroom \| stockist \| popup`, area, map link, hours, lengths stocked |
| Hours | `i18n` hours | Weekly hours plus a seasonal override that crosses midnight (Ramadan) |
| SEO | `seo` | `ClothingStore` with `openingHoursSpecification`, including the Ramadan override via `validFrom`/`validThrough`. `Product` with an `Offer` (`priceCurrency: BHD`, `price: "22.000"`). `BreadcrumbList` |
| Payments | `payments` | `provider: null` (lite). BenefitPay, cash on delivery and bank transfer appear as text only |

```ts
// sites/01-layan-abaya/site.config.ts (excerpt, to reconcile with docs/architecture.md)
brand: { nameAr: 'مداد', nameEn: 'Midad' }, preset: 'commerce', tier: 'lite',
locale: { country: 'BH', currency: 'BHD', minorUnits: 3, numberingSystem: 'arab', timeZone: 'Asia/Bahrain', hijri: false },
variants: { size: ['S','M','L','XL'], length: { unit: 'in', min: 50, max: 62, step: 1, readyDefault: [52,54,56,58], priceDelta: 0 } },
leadTime: { cutoff: '18:00', workDays: ['sat','sun','mon','tue','wed','thu'], readyDays: 1, cutDays: 3, occasionCutDays: 5 },
deposit: { mode: 'manual', method: 'benefitpay', cutMinor: 5000, occasionMinor: 10000 },
order: { channel: 'whatsapp', mode: 'per-piece', sessionRef: true },
modules: { lookbook: true, lengthRule: true, sizeGuide: true, stockists: true, cart: false, checkout: false, payments: false },
```

**CMS collections** (Arabic labels):
- products, with fields including «الأطوال الجاهزة بالمخزن» and «يظهر في اللوك بوك؟»
- collections
- offers
- gallery
- reviews
- pages
- stockists
- settings: WhatsApp number, hours with a seasonal override, delivery zones, lead times, size-chart rows

---

## 7. Operations (invented, internally consistent)

**Hours (Asia/Bahrain)**
- **Showroom, East Riffa:** Saturday to Thursday 10:00–13:00 and 16:30–21:30; Friday 16:30–21:30.
- **WhatsApp replies:** Saturday to Thursday 09:00–23:00; Friday 14:00–23:00.
- **Ramadan 1448** (1 Ramadan = 8 Feb 2027 and 1 Shawwal = 9 Mar 2027, Umm al-Qura via `Intl`; the owner confirms the dates in the CMS each year): **daily 20:00–01:00, which crosses midnight.**
  - The open-now logic treats 00:00–01:00 as part of the previous day's session.
  - JSON-LD emits `opens 20:00, closes 01:00`.
- **Eid al-Fitr:** closed on days 1–2.

**Lead times**
- **Ready lengths** (the product's `readyLengths`, any size):
  - Confirmed on WhatsApp by 18:00: delivered the next working day.
  - After 18:00: the working day after that.
  - Showroom pick-up: the same day from 16:30.
- **Cut to length** (50, 60, 62, or any odd inch from 51 to 61): 3 working days of tailoring, then delivery. Needs a **5.000 BHD deposit** via BenefitPay before cutting starts.
- **Occasion pieces:** always cut to order, in 5 working days, with a **10.000 BHD deposit**.
- **Pre-Eid cutoff:** the last cut-to-length orders are taken on 20 Ramadan.
- **Hem alteration:** free within 7 days of delivery.

**Delivery (Bahrain; fees in BHD with 3 decimals)**

| Zone | Areas | Fee | When |
|---|---|---|---|
| Pick-up | Showroom, East Riffa | ٠٫٠٠٠ | Same day from 16:30 |
| Riffa and nearby | East and West Riffa, Al Buhair, Al Hajiyat, Bu Kowarah, Awali, Isa Town | ١٫٠٠٠ | Next working day |
| Rest of Bahrain | Manama, Muharraq and Diyar, Northern Governorate, Hamad Town, A'ali, Sitra, Saar, Budaiya, Amwaj | ١٫٥٠٠ | Next working day |
| Far south | Zallaq, Durrat Al Bahrain, Askar, Jaw, Al Dur | ٢٫٠٠٠ | 1–2 working days |
| Free | Bahrain orders from ٤٥٫٠٠٠ (for example a mother-and-daughter pair) | ٠٫٠٠٠ | as above |
| Saudi Arabia (courier) | Any city | ٤٫٥٠٠ | 3–5 working days, prepaid |
| Kuwait, UAE, Qatar, Oman | Any city | ٦٫٠٠٠ | 4–7 working days, prepaid |

The free-delivery threshold applies only inside Bahrain. Cut-to-length days are added to the shipping time.

**Payment (off-site)**
- Inside Bahrain: BenefitPay, or cash on delivery for ready pieces. Deposits are paid by BenefitPay.
- GCC: paid in full up front by BenefitPay or bank transfer.

**Policies (summary)**
- **Ready pieces:** can be exchanged within 3 days of receipt if unworn with the tag attached.
- **Cut-to-length pieces:** exchanged only for a tailoring error, in which case they are re-cut free.
- **Refunds:** only for manufacturing defects, within 7 days, to the original payment method.
- **Deposits:** non-refundable once cutting has started.
- **Failed delivery:** after two failed attempts, the third attempt costs 1.000.
- **Privacy:** the WhatsApp number is used only for the order.

---

## 8. Content plan

**Catalogue size and collections**
- **24 products:** يومية (everyday) 8, دوام (work) 6, مناسبات (occasions) 6, شيلات (shaylas) 4.
- **أم وبنت (mother and daughter):** six pieces (three pairs) curated from يومية and دوام.
- **Naming:** pieces are named after the scribe's tools and scripts, following from the brand name.

| Piece | Collection | Fabric / cut | Ready lengths | Price |
|---|---|---|---|---|
| «سطر» | يومية | Plain crepe, straight cut | ٥٢–٥٨ | ١٨٫٠٠٠ د.ب. |
| «دواة» | يومية · أم وبنت | Nida, side pockets, hidden zip | ٥٢–٥٨ | ٢٢٫٠٠٠ د.ب. |
| «هامش» | يومية | Summer linen blend, side slits | ٥٤، ٥٦ | ٢٤٫٠٠٠ د.ب. |
| «قلم» | دوام · أم وبنت | Open front with self belt, dropped shoulder | ٥٢–٥٨ | ٢٦٫٠٠٠ د.ب. |
| «حِبر» | مناسبات | Bisht cut, wide sleeves, satin trim | cut to length only | ٣٢٫٠٠٠ د.ب. |
| «ثُلث» | مناسبات | Black-on-black embroidery in a Thuluth-inspired geometric pattern (**no words**) | cut to length only | ٤٥٫٠٠٠ د.ب. |
| «رُقعة» | مناسبات | Beaded cuffs in matte black beads | cut to length only | ٥٨٫٠٠٠ د.ب. |
| Shayla «نقطة» | شيلات | Matching chiffon, 180 × 70 cm | n/a | ٤٫٥٠٠ د.ب. |

**Gallery (10 subjects)**
1. «سطر», full-length front against plaster
2. Mother and daughter walking away in a courtyard
3. A hem cut to length resting on a flat sandal
4. Crepe vs nida weave macro
5. «رُقعة» cuff beads
6. «ثُلث» sleeve pattern
7. A tailor's tape and chalk mark at ٥٦ on black fabric
8. The East Riffa showroom rail, hung by length
9. A shayla folded over a pale oak hanger
10. Packaging: grey tissue, an oxblood thread tie and a length tag

**FAQ (Arabic, dialect)**
1. شلون أعرف طولي بالإنش؟ (قيسي من أعلى الكتف جنب الرقبة لين الأرض وأنتي لابسة نعالج المعتاد)
2. طولي مو موجود بالجاهز، كم ياخذ التفصيل؟
3. كم التوصيل؟ وتوصلون برا البحرين؟
4. أقدر أبدّل القطعة إذا ما ناسبتني؟
5. شلون أدفع؟ وليش فيه عربون للتفصيل؟
6. العباية تبهت مع الغسيل؟ شلون أغسلها؟ (على بارد ٣٠°، بالمقلوب، بدون مبيّض، وتجفيف بالظل)

**Sample reviews (four personas, all labelled illustrative)**
1. **أم محمد, 48, East Riffa.** Her length is 60, which she could never find ready-made; she ordered «قلم» cut to length.
2. **نوف, 23, student, Isa Town.** Bought «سطر» in 54, ready stock, delivered the next day.
3. **مريم and her daughter شهد, Muharraq.** Two «دواة», in 56 and 52, delivered free.
4. **هيا, 34, Al Khobar.** «ثُلث» for her sister's wedding, shipped to Saudi Arabia.

**Stockists**
- The showroom in East Riffa: the full range, a mirror and hem pinning.
- «رفّ ٣٣٨», a concept store in Adliya: يومية in ٥٤ and ٥٦.
- «بيت الدكّة», Old Muharraq: مناسبات and shaylas.
- A Friday winter bazaar in Riffa, November to March.
- «زاوية الخبر», Al Khobar: ٥٦ and ٥٨.
- All of these are fictional and marked as illustrative.

---

## 9. Voice

| Line | Arabic (Bahraini, feminine) | English |
|---|---|---|
| Hero headline | عبايتج على طولج، بالإنش. | Your abaya, at your length. To the inch. |
| Subline | حطي طولج مرة وحدة، ونفصّل لج أي عباية على قدّج. الجاهز يوصلج باچر، والتفصيل خلال ٣ أيام. | Set your length once and we'll cut any abaya to fit you. Ready lengths arrive tomorrow; cut-to-length takes 3 working days. |
| WhatsApp CTA | اطلبيها واتساب · طول ٥٦ | Order on WhatsApp · length 56 |

**Voice rules**
- **Display lines avoid چ and گ.** They appear only in body text, which is set in Noto.
- **The WhatsApp message opens:** «هلا مداد، أبي هالقطعة:», followed by the piece, code, size, length (ready or cut), price, area and fee, estimated total, the session reference and the product link.

**Policy register (formal-neutral):** «يُقبل استبدال القطع ذات الأطوال الجاهزة خلال ثلاثة أيام من تاريخ الاستلام، بشرط ألا تكون قد استُعملت وأن تبقى بطاقتها مثبتة، ولا تُستبدل القطع المفصّلة على الطول إلا إذا ثبت خطأ في التنفيذ، وعندها يُعاد تفصيلها دون مقابل.»

---

## 10. Remove before finishing

**The Katibeh line in the whitespace pause** (homepage item 6, «أسود صافي، مثل المداد.»). The pause works as empty `bg` on its own. The line repeats what the name and the hero headline already say, and it adds a third Katibeh moment between two photo-led sections. Keep the whitespace and drop the line, unless the 390px screenshot review shows the pause reading as a gap in loading.
