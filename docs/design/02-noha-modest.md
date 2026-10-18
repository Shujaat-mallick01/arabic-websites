# 02 · دريشة · Dareesha: design plan

Step 1 ("Plan first"), written 2026-09-23. The folder slug stays `02-noha-modest`. The brand was renamed from نُهى · Noha because a same-niche GCC brand already uses that name (§0). Everything else follows row 02 of `00-distinctness-matrix.md`: T structure, Alexandria/Montserrat, story-highlight rail, arrival-date ribbon. The mark changes because the name changed (§4).

---

## 0. Name check

| Name | What turned up (searches and profile checks on 2026-09-23) | Verdict |
|---|---|---|
| نُهى · Noha | Instagram account `@nuhaabaya`, "NUHAABAYA/NOHAABAYA/نهى عبايه": 28.6K followers, abayas, based in Jeddah, delivers worldwide (and so into Bahrain). Same niche, same region. In Latin script, "Noha" search results are also dominated by Shia elegies (nauha) | **Dropped** |
| سِربال · Sirbal | `@serbal.bh`, "سِربال \| serbal": a Bahraini modest-wear shop, 1,952 followers | rejected |
| أَردان · Ardan | `@ardan.bh`, "عَباياتُ أَرْدَان 🇧🇭": a Bahraini abaya shop | rejected |
| طَيّة · Tayya | `@tayya.bh`, "طيّه \| Tayya": an account in Bahrain | rejected |
| سَمْت · Samt | SAMT (samt.ae), a UAE modest-wear house | rejected |
| مِزنة · Mizna | مزنة للأزياء (Qatar); مزنة للتسوق أونلاين (Dubai); muznah-sa (Saudi); a "Mizna" abaya line at laha.ae | rejected |
| ضُحى · Duha / بقشة | doohaa.com (an abaya store) / Boksha (a UAE Khaleeji e-shop) | rejected |
| هُوَيْنا · Huwayna | huwayna.com, "Huwayna \| هُوَيْنَى", is a live wellbeing-coaching practice in Kuwait with an ه logo. It is a different niche, but it is the same rare word, so it was dropped | rejected |
| رَفّة · Raffa, رَيطة · Rayta, نَسَق · Nasaq, غَيمة · Ghayma | `@raffa.abaya` and "rayta online" exist, niche unknown; Nasaq Agency is a UI/UX studio in Kuwait (a competitor of the designer); ghaima.bh and a Shopify store at ghayma.ae exist | rejected (risk) |
| **دريشة · Dareesha** | No clothing or abaya business turned up. `@dareesha` is a private personal account. `@dareesha.bh`, "Dareesha\|دريشة", is a dormant "creative spot" in Bahrain (104 followers, last active 2021; not retail). `@dareesha.abaya`, `.store` and `.kw` do not exist. dareesha.com is parked | **chosen** |

**Queries run:**
- WebSearch: "Noha modest wear abaya Bahrain", "نهى عبايات البحرين انستقرام", "\"Noha\" abaya brand GCC kaftan online store", "\"Noha boutique\" OR \"Noha fashion\" OR \"Noha abayas\"" (KW/SA/UAE/BH), "\"نهى\" بوتيك عبايات جلابيات كفتان متجر", Instagram handle search.
- Candidates were then checked with Arabic and Latin queries (WebSearch, and Brave through WebFetch), Instagram profile fetches, and DNS and domain probes.

**Limitation:** the session's WebSearch budget ran out, and Brave returned HTTP 429, before an engine query for "دريشة" could run. That query is an open question, to run before the build.

---

## 1. Identity

| | |
|---|---|
| Name | **دريشة · Dareesha**. Lockup descriptor: DAREESHA — MODEST WEAR / دريشة · ملابس محتشمة |
| Meaning | دريشة is the Gulf and Najdi word for a window (from Persian *darīcha*). The brand's Instagram highlights were its shop window, and the site is the same window with a real checkout, "from our window to your door". The word also contains ريشة (a feather), a quiet nod to light, everyday fabrics. Window daylight sets the photography |
| Positioning (EN) | Modest everyday wear with a real cart and checkout, delivered anywhere in the GCC in 2–5 working days. |
| Positioning (AR) | ملابس محتشمة لكل يوم، بسلّة ودفع أونلاين، وتوصلج لأي دولة خليجية خلال 2–5 أيام عمل. |
| Audience | GCC women aged 20–40 who buy everyday modest wear online (kaftans, co-ord sets, jalabiyas, open abayas) for themselves or as gifts. They expect a real cart and card or Apple Pay checkout |
| Preset / tier | commerce `full` (cart, checkout, shipping rules, gift cards, orders dashboard, stock) |
| Place | Studio and pickup counter in Seef, Manama. Ships to BH, SA, KW, AE, QA and OM |
| Currency / numbers | BHD with 3 decimals (1 BHD = 1000 fils; all money is stored as integer fils). Numbering is `latn` in both languages |
| Timezone | Asia/Bahrain. Every cutoff, ETA and opening time is computed in this zone |
| Dialect | Khaleeji-Bahraini with feminine address (ـج: يوصلج، لج، اختاري). The vocabulary stays GCC-neutral: كثير, not وايد or مرة; كيف, not شلون or وش; لين and عشان are fine |

---

## 2. Palette (T structure: dusk-blue mist ground)

| Token | Hex | Share | Used for |
|---|---|---|---|
| `bg` mist | `#DCE5EE` | ~55% | page ground, rails, bands |
| `surface` | `#F3F6FA` | ~22% | borderless cards on the mist, drawer, checkout panels, price chip |
| `ink` | `#16202B` | ~10% | text, selected size squares, WhatsApp button, favicon tile |
| `muted` | `#4A5664` | ~5% | secondary text, input borders (needs 3:1 as a non-text element; it gets 5.87) |
| `deep` | `#22303F` | ~4% | footer band, demo banner |
| `line` | `#C3CFDB` | ~2% | decorative list dividers only, never input borders |
| `accent` ochre | `#7E560F` | ≤3% | primary CTA, 2px active-tab underline, arrival ribbon, sale label, links |
| `accent-press` | `#694609` | state | hover and pressed state of the CTA |
| `accent-on-deep` | `#D9A955` | footer | footer links, the hairline in `logo-dark.svg` |
| `muted-on-deep` | `#A9B6C4` | footer | footer secondary text |
| `error` | `#A3292B` | state | field errors, always shown with text and never by colour alone |

**Contrast** (WCAG 2.x, computed with node):

| Pair | Ratio | Needs |
|---|---|---|
| ink on bg / on surface | **12.92 / 15.19** | 4.5 |
| muted on bg / on surface | **5.87 / 6.90** | 4.5 |
| accent on bg / on surface (links, card ribbon text) | **5.11 / 6.01** | 4.5 |
| surface on accent (CTA, product-page ribbon) | **6.01** (white 6.51) | 4.5 |
| surface on accent-press | **7.81** | 4.5 |
| surface on deep (footer, banner) | **12.40** | 4.5 |
| muted-on-deep / accent-on-deep on deep | **6.51 / 6.24** | 4.5 |
| surface on ink (favicon) | **15.19** | 3 |
| error on bg / on surface | **5.67 / 6.66** | 4.5 |
| accent on bg (2px tab underline, non-text) | **5.11** | 3 |
| focus ring: 2px ink with a 2px surface offset, on bg | **12.92** | 3 |
| line on bg | 1.24 | decorative only |

Every text pair passes AA. Ochre fills only buttons and the product-page ribbon. It never fills a large area.

---

## 3. Type

- **Arabic: Alexandria** (variable font, wght 100–900; Arabic subset 31 KB) for display, body, UI and prices. It covers ٫ ٬ چ گ پ. In the TTF I confirmed `tnum`, `lnum`, `pnum` and `onum` (fontTools, google/fonts @e44c4b0).
- **Latin: Montserrat** (variable font, Latin subset), for the English locale only.
- **Pairing (measured, fonts research §A5):** alef 0.820 against Latin cap 0.700; body height to x-height is 1.01; Alexandria runs one weight step heavier. The rules that follow:
  - EN weight = AR weight + 100.
  - Lowercase Latin runs at the same px as the Arabic, because the x-heights already match.
  - Latin **caps** placed next to Arabic (the lockup, "DAREESHA" in running text) scale ×1.17 so the cap height equals the alef.
- **Stacks:**
  - AR pages: `Alexandria` alone. Its own Montserrat-style Latin and digits keep the weights matched.
  - EN pages: `Montserrat, Alexandria`, so any Arabic word falls through to Alexandria.
- Metric-matched fallbacks come from Astro's `optimizedFallbacks`. The Arabic subset is preloaded on AR pages, Montserrat on EN pages.
- **Letter-spacing** goes only on Latin caps: +0.2em in the wordmark, +0.08em on labels. Never on Arabic.

| Role | AR wght | EN wght | 390px size / line-height | 1440px size / line-height |
|---|---|---|---|---|
| Display (campaign) | 300 | 400 | 34 / 1.35 | 56 / 1.2 |
| H1 (page) | 400 | 500 | 28 / 1.4 | 40 / 1.3 |
| H2 (section) | 400 | 500 | 22 / 1.5 | 28 / 1.4 |
| H3 (name on product page) | 500 | 600 | 18 / 1.6 | 22 / 1.5 |
| Body | 300 | 400 | 16 / 1.85 | 17 / 1.85 |
| Button / UI label | 500 | 600 | 15 / 1.4 | 15 / 1.4 |
| Card name | 400 | 500 | 14 / 1.6 | 15 / 1.6 |
| Price (card / product page) | 500, `tabular-nums lining-nums` | 600 | 15 / 22 | 16 / 26 |
| Ribbon, caption, story label | 500 | 600 | 13 / 1.5 | 14 / 1.5 |

**Numerals: `latn` everywhere.** The checkout serves six countries, and card forms, Apple Pay sheets, courier SMS and phone fields all use Western digits.
- Prices use `Intl.NumberFormat('ar-BH-u-nu-latn',{style:'currency',currency:'BHD'})`. It returns "‏18.500 د.ب.‏"; trim the trailing "." and keep the RLM. That gives **18.500 د.ب** in Arabic and **BHD 18.500** in English.
- Dates are Gregorian with Arabic month names (الأحد، 27 سبتمبر). Hijri is off.
- Prices and phone numbers are wrapped in `<bdi>`.
- The matrix example "يوصلج الكويت الأحد ٢٨ سبتمبر" had Arabic-Indic digits and the wrong weekday (28 September 2026 is a Monday). The corrected form is below.

---

## 4. Logo

- **Arabic wordmark:** دريشة in Alexandria Light (300), outlined with harfbuzzjs. No tashkeel.
  - The three connected letters يشة are kept tight.
  - The ش's three teeth are drawn as true semicircles on one baseline, the one geometric detail the mark reuses.
  - The ش dots stay round and in ink.
- **Latin:** DAREESHA in Montserrat Medium, tracked 0.2em, cap height equal to the alef height.
- **Inline lockup:** Arabic on the right, Latin on the left, split by a short vertical **ochre hairline**: 1px wide, 60% of the alef height, with a gap of 0.5 alef height on each side.
- **Stacked variant** for avatars: Arabic on top, Latin below at 45% of the width.
- **Mark (`logo-mark.svg`, favicon):** a **14px-radius rounded-square tile**, the story-card shape and so a window. Inside it:
  - the ش's three-tooth stroke, drawn monoline across the lower third, like a row of small window arches;
  - its three dots above, as a small triangle.
  - Colours: ink tile with surface strokes. Below 24px the dots are dropped and only the three bumps stay.
  - Other sites' marks are a chocolate د (06), one tall mirror arch (10) and moon dots (13). A row of three low bumps is none of those.
- **Files:** `logo.svg` (ink + ochre hairline), `logo-dark.svg` (for dark grounds: surface + `#D9A955`), `logo-light.svg` (ink only). `og.png` is 1200×630: mist ground, the lockup at the inline-start side, a 9:16 story crop, and "من دريشتنا لين بابج · توصيل لكل الخليج".
- **Clear space:** 1× alef height on all sides of the lockup; 25% of the tile width around the mark.
- **Minimum size:** lockup 120px or 30mm wide; Arabic wordmark alone 64px; mark 16px.

---

## 5. Layout

### Hero: story-highlight rail first

**390px (AR, RTL)**
1. Demo banner: deep, 36px, dismissible.
2. Header, 56px: wordmark at the inline start. Search, القائمة and the bag (with count) at the inline end.
3. **Story rail.** The first thing on the page is a row of 104×185 cards (9:16), 14px radius, 10px gap, with a 13px/500 label under each.
   - About 3.3 cards show, so the cut-off card signals that the row scrolls.
   - Card order: جديدنا، كفتانات، أطقم، جلابيات، عبايات، هدايا، تخفيضات.
   - The first 3 images load eagerly, at about 15 KB each as AVIF.
4. **Campaign band.** A full-bleed 4:5 window-light photo (390×488) of a model mid-step.
   - A surface panel overlaps the photo's bottom by 48px and aligns to the inline start. It holds the headline (34/300), the subline, a price chip ("الأطقم من 21.500 د.ب*", surface with ink text) and a full-width 48px ochre CTA "تسوّقي الأطقم".
   - This photo is the LCP image: `fetchpriority=high`, 390w and 780w AVIF.

**1440px (1280px container, 80px gutters)**
- Header, 72px: wordmark, then the category tabs (2px ochre underline on the active tab), then at the inline end "التوصيل إلى: البحرين ▾", search and bag.
- The rail shows all 7 cards at 164×292 with 22px gaps. No scrolling and no arrows.
- **Campaign band:** a 1280×560 photo with the model in the inline-end third. The surface text panel is 480px wide, sits in the inline-start bottom corner with a 40px inset, and uses a 56/300 headline. Nothing is centred.

### Homepage rhythm (horizontal-first: rail / band / grid / rail)
1. Story rail (these are the category entry points)
2. Campaign band: co-ord sets
3. **Grid, وصل جديد:** 8 items, 2-up on the phone and 4-up on desktop. 3:4 images with the name and price under the image, plus the mini ribbon.
4. **Rail, تحت 15 د.ب:** 3:4 product cards, about 2.3 visible, scroll-snap.
5. **Band, بطاقات الهدايا:** a surface band with a gift-card visual, amount buttons (10 / 25 / 50 / 100) and the line "أرسليها واتساب أو إيميل".
6. **Grid, كفتانات للبيت والمشاوير:** 4 items.
7. **Band, the GCC delivery list:** 7 plain rows, each with country, fee, free-from amount and the live "يوصل" date. The selected country's row gets a 2px ochre inline-start bar.
8. **Rail, lookbook:** 9:16 gallery cards.
9. **Rail, آراء:** 4 reviews marked **"آراء توضيحية ضمن النموذج"**.
10. FAQ: 3 questions, then a link to all 6, then the WhatsApp line.
11. Footer on the deep band: pages, policies, payment methods (as text), the CR slot, the demo credit, and the "* الأسعار توضيحية" footnote.

**Product page:**
- 3:4 gallery with scroll-snap and a "2/5" counter.
- Name, then price, then the **ribbon**.
- Size squares, 48×48 with 10px radius. Abayas also get a length select.
- A sticky "أضيفي للسلة" bar on the phone.
- "اسألي عن القطعة واتساب" (ink outline button), a share link, and accordions for fabric, care and fit.

**WhatsApp button:** a persistent 52px ink square, 10px radius, at the bottom inline-end, respecting the safe area. It sits above the sticky bar and hides while the drawer is open.

### Signature: the arrival-date ribbon
Each product page shows a full-width strip, at least 40px tall, ochre fill with surface text (6.01:1):
> **يوصلج الكويت بين السبت 26 والأحد 27 سبتمبر** · اطلبي قبل 1:00 الظهر وينشحن اليوم

- The country name is a button that opens a 6-country sheet. Bahrain has an extra "استلام من السيف" pickup option.
- On cards the ribbon has no fill: a 2px ochre top rule plus 13px ochre text on surface ("الكويت · 26–27 سبتمبر").
- It also appears in the cart drawer and in the checkout summary.
- **The chosen country is global.** It is stored in guarded localStorage, pre-fills the checkout country, and defaults from the `navigator.language` region, falling back to BH. There is no IP lookup.
- **It is computed on the client** by a ~2 KB island. The HTML can't hold the date, because it is built once and would go stale. Until the script runs, the static fallback reads "يوصلج الكويت خلال 2–3 أيام عمل".

### Shape, motion, photography
- **Shape:**
  - 14px radius on story cards and product images.
  - 10px radius on buttons, inputs, size squares and the price chip.
  - 0 radius on full-bleed bands.
  - Cards are borderless and tone-on-tone (surface on mist), with no shadows.
  - Hairlines appear only as list dividers.
  - 2px ochre underline on the active tab.
  - **No pills.** No window-pane or mullion decoration either: the window lives in the name and the light, not in ornament.
  - Icons are 1.5px monoline at 24px, never in circles.
- **Motion:**
  - Rails use `scroll-snap-type: x mandatory` with native momentum and `overscroll-behavior-x: contain`. Nothing autoplays.
  - The cart drawer slides in from the **inline-end** edge (left in AR, right in EN) in 240ms `cubic-bezier(.2,.7,.2,1)`, with a 40% ink scrim.
  - Nothing animates on scroll.
  - Under `prefers-reduced-motion` the drawer appears without translating and smooth scrolling is off.
- **Photography:**
  - **Clean, bright daylight from one side, like window light**, with colour-accurate fabric. A grey card goes in every set and colour is checked in sRGB, because true colour cuts returns.
  - Slightly cool mist-blue seamless backdrops that continue the page ground.
  - On-model shots are mid-step, so the hems move.
  - 3:4 for products, with a 9:16 safe area for story crops; 1:1 flat detail crops.
  - One grade across the site: the backdrop is cooled slightly, and the fabric and skin are left neutral with no warm filter.
  - Faces are optional, often cropped at the chin.

---

## 6. Niche features mapped to engine modules

| Brief feature | Module | Config / behaviour |
|---|---|---|
| Cart | `commerce/cart` | Persistent (guarded storage). Drawer. Quantity capped by stock. Line totals in fils. A text line shows how far the cart is from free shipping for the selected country ("باقي لج 6.500 د.ب وتوصيلج للكويت مجاني") |
| Checkout | `commerce/checkout` + `payments` | One page, guest only: contact → address → payment. **Address fields by country:** BH building/road/block; KW area/block/street/avenue/house; SA optional national-address short code; AE emirate/area; QA zone/street/building; OM governorate/wilayat. Phone prefix +973/+965/+966/+971/+974/+968. Order number `DR-260923-0147` |
| Payment | `payments` | Demos use `provider: "mock"`, which offers success, failure, timeout and webhook replay. Live candidate is **Tap** (cards, Apple Pay; Benefit debit for BH; BenefitPay needs the web-SDK island), with **Credimax** as the BH fallback. COD is BH only, up to 60.000. No COD on gift cards |
| GCC shipping table | `commerce/shipping` | Rows in §7. Fields: `feeFils`, `freeOverFils`, `transit:[min,max]`, `deliveryDays`, `cod`, `pickup`. Dispatch runs Sat–Thu with a 13:00 cutoff (Asia/Bahrain); holidays come from the CMS |
| Arrival ribbon | `shipping.eta(now, country, leadDays)` + `ui/ArrivalRibbon` | A pure function with unit tests: cutoff, Friday, a holiday, AE's Mon–Sat week, OM's Sun–Thu week, the hemming lead time |
| Hemming | `commerce/leadtime` | "قصّريها على طولي" (lengths 52–60 in) is free and adds `leadDays: 2` to dispatch; the ETA includes it. Hemmed pieces are final sale |
| Gift cards | `commerce/giftcards` | Amounts 10/25/50/100 BHD, or a custom amount from 5–200 in 0.500 steps. Code `DRS-XXXX-XXXX` (Crockford base32; stored as a hash). Sent by email or WhatsApp link, now or on a chosen date. Partial redemption with the balance kept; valid 12 months; no refund, no shipping. Stored in the Supabase `gift_cards` table (mock repository in demos) |
| Gift wrap | checkout extras | 1.500 BHD. Message up to 200 characters. "إخفاء الأسعار" hides prices on the packing slip |
| Orders dashboard | `commerce/orders` at `/orders` (Netlify Identity, owner role) | **Statuses:** جديد، مدفوع، قيد التجهيز، تم الشحن، تم التسليم، ملغي، مسترجع. **Filters:** status, country, date. **Actions:** add tracking number, WhatsApp the customer (a pre-filled Arabic status message), full or partial refund (`payments.refund`), A6 packing slip, CSV export. There is also a gift-card ledger tab. Demos come seeded with 12 orders across the 6 countries |
| Stock | `commerce/catalog` | Stock is per variant. It is reserved for 30 minutes when a payment session is created. The "باقي 2" label shows at 3 or fewer |
| WhatsApp | `whatsapp` | The "ask about this piece" message includes the product name, link, size, country and ETA. Per-product share uses the Web Share API, falling back to a wa.me link |
| SEO | `seo` | `ClothingStore` (the Seef studio, with `openingHours`), plus `Product` with `offers`, `OfferShippingDetails` per country, `MerchantReturnPolicy` and `BreadcrumbList`. `og:locale` ar_BH with en_US as the alternate |

---

## 7. Operations (invented, internally consistent)

- **Studio and pickup:** مبنى 2425، طريق 2832، مجمع 428، السيف، المنامة. CR slot: "س.ت 000000-01 (نموذج)". The demo's WhatsApp number is the designer's own (set in config), never a made-up number.
- **Hours:**
  - Sat–Thu 10:00–21:00. Friday 16:00–21:00, WhatsApp only, with no dispatch.
  - **Ramadan: 20:00–01:00.** This crosses midnight and is stored as close = 25:00.
  - Closed on the first day of each Eid.
- **Dispatch:** Sat–Thu. Orders before **13:00** (Asia/Bahrain) ship the same day; later orders ship on the next dispatch day. Hemming adds 2 dispatch days. Pickup orders are ready from 17:00 the same day.

| Destination | Fee (BHD) | Free from | Transit (working days) | Delivery days | Example ETA (ordered Wed 23 Sep, 10:00) |
|---|---|---|---|---|---|
| البحرين | 1.500 (pickup free) | 25.000 | 1 | Sat–Thu | Thu 24 Sep |
| السعودية: الشرقية | 3.000 | 40.000 | 2–3 | Sat–Thu | Sat 26 – Sun 27 |
| السعودية: باقي المناطق | 4.000 | 40.000 | 3–5 | Sat–Thu | Sun 27 – Tue 29 |
| الكويت | 4.000 | 45.000 | 2–3 | Sat–Thu | Sat 26 – Sun 27 |
| الإمارات | 4.000 | 45.000 | 2–4 | Mon–Sat | Fri 25 – Mon 28 |
| قطر | 4.500 | 45.000 | 2–4 | Sat–Thu | Sat 26 – Mon 28 |
| عُمان | 4.500 | 45.000 | 3–5 | Sun–Thu | Mon 28 – Wed 30 |

The ETAs were computed with the ribbon's own algorithm. An order at 15:00 moves Kuwait to 27–28 September; a hemmed order moves it to 28–29 September.

- **Policies (summary):**
  - Exchange or return within 14 days of delivery, unworn with tags attached.
  - Hemmed pieces and shaylas are final sale. Sale items can be exchanged only.
  - Bahrain: one free exchange at the studio, or a courier collection for 1.500.
  - GCC: the customer ships the return, or buys a prepaid label for 4.000.
  - Refunds go to the original payment method within 7 working days of inspection. COD refunds go by bank transfer.
  - Prices include 10% Bahraini VAT. Any import charges at the destination are paid by the recipient.
  - Gift cards are non-refundable and valid for 12 months.

---

## 8. Content

**Collections (5).** Gift cards and sale are rail filters, not collections.

| Collection | Items |
|---|---|
| كفتانات | 8 |
| أطقم | 8 |
| جلابيات | 6 |
| عبايات مفتوحة | 6 |
| أساسيات | 4 |

That is **32 products**, plus a gift-card product with 4 denominations. Sizes run XS–XL, kaftans come in مقاس حر (free size), and open abayas also come in lengths 52–60.

| Item | Price |
|---|---|
| كفتان «نسمة»، كتان مغسول (mist, sand, olive) | 18.500 |
| كفتان «رملة»، قطن مطبوع | 14.750 |
| طقم «مشوار»: قميص طويل وبنطلون واسع، كريب | 24.000 |
| طقم «عصرية»، تريكو ناعم | 21.500 |
| جلابية «غرزة»، قطن بتطريز يدوي بخيط أوكر | 27.500 |
| عباية مفتوحة «السيف»، كريب ياباني بحزام (تقصير مجاني) | 32.000 → sale 25.600 |
| فستان داخلي بلا أكمام، جيرسيه | 7.250 |
| شيلة جورجيت | 3.500 |
| بطاقة هدية | 10.000 / 25.000 / 50.000 / 100.000 |

**Gallery (9 shots):**
1. A linen kaftan mid-step in side window light on a mist seamless, hem swinging.
2. A co-ord set on a shaded Seef walkway at 9 a.m. (no shopfronts in frame).
3. An open abaya from the back, walking away, belt tie moving.
4. Ochre embroidery on a jalabiya neckline (1:1).
5. A crepe cuff with a covered button (1:1).
6. Five kaftans folded in a stack, in their colourways.
7. The packing table: tissue, the gift card and a mailer with a printed arrival card.
8. Sitting on a deep window seat in the knit set.
9. Pinning a shayla at a mirror, face turned away.

**FAQ (Arabic):**
1. كم يوم يحتاج طلبي عشان يوصل لدولتي؟
2. كم رسوم التوصيل، ومتى يصير مجاني؟
3. كيف أختار مقاسي، وتقصّرون العباية على طولي؟
4. أقدر أبدّل أو أرجّع القطعة؟
5. كيف تشتغل بطاقة الهدية؟
6. أي طرق دفع عندكم، وفيه دفع عند الاستلام؟

**Review personas (illustrative, labelled as such on the site):**

| Persona | Bought | Review |
|---|---|---|
| مريم، المحرق | كفتان نسمة | "طلبت الأربعاء الصبح ووصلني الخميس، واللون نفس الصورة." |
| نوف، الرياض | طقم مشوار | "المقاس طلع مثل الجدول بالضبط، والقماش ما يتجعّد بالشنطة." |
| دانة، الكويت | a gift card for her sister | "أرسلتها واتساب واختارت اللي تبيه بنفسها." |
| شيخة، العين | عباية السيف, hemmed | "قصّروها على طولي ووصلت باليوم اللي كتبوه." |

---

## 9. Voice

| | Arabic (Khaleeji, feminine) | English |
|---|---|---|
| Hero headline | **لبس يومج، من دريشتنا لين بابج.** | Your everyday wear, from our window to your door. |
| Subline | كفتانات وأطقم وعبايات مفتوحة بأسعار واضحة ومقاسات مضبوطة. اختاري دولتج ونقول لج أي يوم يوصلج طلبج. | Kaftans, co-ord sets and open abayas with clear prices and true sizing. Pick your country and we'll tell you the day your order arrives. |
| WhatsApp CTA | محتارة في المقاس؟ راسلينا واتساب | Not sure about your size? Message us on WhatsApp. |

Policy pages use formal-neutral Arabic, for example: «يحق للعميلة طلب الاستبدال أو الاسترجاع خلال أربعة عشر يومًا من تاريخ الاستلام، شريطة أن تكون القطعة غير مستخدمة وبملصقاتها الأصلية.»

---

## 10. Remove before finishing

**The ochre hairline in the header lockup.** At a 56–72px header height it reads as a stray line next to the ochre tab underline. The header should show only the Arabic and Latin wordmark; the hairline stays in the logo files, the OG card and the footer.

## Open questions
1. Run one full engine search for "دريشة" and "Dareesha" in fashion before the build. It was blocked today by the search budget and rate limits.
2. KNET and mada usually settle in KWD and SAR. Can Kuwaiti and Saudi shoppers use them when the store charges in BHD through Tap? If not, those shoppers get cards and Apple Pay only.
3. VAT on sales to other GCC states (Bahrain may zero-rate them as exports) and destination import VAT. For now the plan shows one VAT-inclusive price everywhere.
4. Should the site show an approximate price in the shopper's own currency, or stay BHD-only? The plan currently stays BHD-only.
5. Courier working days per country (especially the UAE's Mon–Sat week) need confirming with the client's real carrier.
