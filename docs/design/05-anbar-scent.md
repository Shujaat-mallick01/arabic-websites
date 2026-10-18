# 05 · لطيمة · Latima: design plan

Slug stays `05-anbar-scent`. Preset `commerce` · tier `full`. Step 1 plan, written 2026-09-23.
**The brand is renamed from عنبر · Anbar** (see §0). The concept, palette, type and signature allocated in `00-distinctness-matrix.md` row 05 are unchanged. Only the name and the letter inside the mark change.

---

## 0. Name check

| Searched | Found | Verdict |
|---|---|---|
| `Anbar perfumes Kuwait`, `"Anbar" perfume brand instagram GCC oud`, `"anbar perfumes" OR "anbar parfums" …` | **@anbar_perfumes, "عَنْبَر للعطور"**: an Instagram shop selling French and Gulf perfumes (our exact lockup and positioning). **Al Anbar Perfumes** (@alanbarperfumes): a niche perfume and oud house in Al Ain, UAE, taking WhatsApp orders | **Collision** (same niche, GCC) |
| `عنبر للعطور الكويت` | "عنبر" is a product name at Ajmal, Roja, Kunooz Al Teeb and Omar Center Kuwait | Generic in the niche. Adds to the collision |
| `"Ashhab" perfume`, `أشهب للعطور` (the grey of the finest ambergris) | **Ashhab** is a scent from Al-Jazeera Perfumes (a Kuwaiti house), sold at 130 KWD | Rejected |
| `"Ghaliya" OR "Ghalia" perfume`, `الغالية للعطور` | Al Ghalia is a product at Arabian Oud, Rasasi and Al Rehab | Rejected |
| `نافجة عطور` | No shop found under نافجة, but it is too close to the many **نفحة (Nafha)** perfume shops | Rejected |
| `"Latima" perfume OR perfumes OR parfum`, `لطيمة عطور` | **No perfume business or product under either spelling.** An Al Jazeera piece (11 Jun 2026) confirms the meaning: *اللطيمة* is the Arabs' name for the perfume caravan | **Chosen** |

Risks and limits:
- **لطيمة and لطافة (Lattafa) share their first letters.** Lattafa is a very large UAE mass-market house. The two words differ in sound (la-TEE-ma vs lat-TAA-fa) and in shape (ـيمة vs ـافة).
- **The web-search budget ran out after this check** (200/200), so Latima got one pass in each script. A search for Latima on Instagram and in Kuwaiti Ministry of Commerce and Industry (MOCI) trade names is still owed before build.
- Sources: [@anbar_perfumes](https://www.instagram.com/anbar_perfumes/), [@alanbarperfumes](https://www.instagram.com/alanbarperfumes/), [Ashhab, Al-Jazeera Perfumes](https://www.fragrantica.com/perfume/Al-Jazeera-Perfumes/Ashhab-82295.html), [Al Ghalia, Arabian Oud](https://www.fragrantica.com/perfume/Arabian-Oud/Al-Ghalia-21582.html), [Al Jazeera: معجم الطيوب والعطور](https://www.aljazeera.net/amp/culture/2026/6/11/%D9%85%D8%B9%D8%AC%D9%85-%D8%A7%D9%84%D8%B7%D9%8A%D9%88%D8%A8-%D9%88%D8%A7%D9%84%D8%B9%D8%B7%D9%88%D8%B1-%D8%B1%D8%AD%D9%84%D8%A9-%D9%81%D9%8A-%D8%B0%D8%A7%D9%83%D8%B1%D8%A9).

## 1. Identity

| | |
|---|---|
| Name | **لطيمة · Latima**. Lockup: **لطيمة للعطور / LATIMA — PERFUMES · KUWAIT** |
| Meaning | *Al-laṭīma* is the classical word for a caravan carrying musk and perfume, and for a perfumer's pouch. Al-Nu'man ibn al-Mundhir sent one every year to Souq Okaz. It suits a house that brings French and Gulf scents to one counter. Ambergris stays in the brand as its signature base note and as the mark's pebble. |
| Positioning | AR: **بيت عطور كويتي يشرح كل عطر بنوتاته، ويقدّمه بثلاث أحجام، ويوصله جاهزًا للإهداء.** EN: *A Kuwaiti perfume house where every scent is explained by its notes, comes in three bottle sizes, and arrives ready to give.* |
| Audience | Kuwaiti men and women, 25–50. They buy oud-based and French-style perfumes for themselves and as wedding and Eid gifts. Companies order corporate gift sets. |
| Place | Salmiya, Salem Al Mubarak St (one shop) · KWD (3 dp, fils ×1000) · `Asia/Kuwait` · `ar-KW` / `en` · numbering `arab` |
| Dialect | Kuwaiti, unisex and refined (چذي، وايد، مو، لين، وياك). Policies and corporate quotes are in formal-neutral Arabic. |

## 2. Palette (structure D, cool neutral)

| Token | Hex | Area | Use |
|---|---|---|---|
| `bg` | `#141619` smoke slate | 55% | page ground |
| `surface` | `#1E2125` | 10% | header, footer, forms, cart, corporate band |
| `ink` | `#EEE8DE` ivory | 10% | all text; the only text colour allowed on fields |
| `muted` | `#A39C91` | 4% | secondary text on bg/surface; input borders |
| `accent` | `#D6953F` amber | 2% | primary buttons (text `bg`), links, active-tab bar, focus ring |
| `accent-hover` | `#E4AA5C` | n/a | button hover |
| `line` | `#34383D` | <1% | decorative dividers only (1.54:1, never a boundary you must see) |
| `hairline-gold` | `#A8895A` | <1% | 1px only: the logo pebble, blotter zone ticks, spec-table rules. Never a fill |
| `field-oud / -amber / -floral / -fresh` | `#3B2A22` / `#5A3A17` / `#4C2E3A` / `#22403C` | 15% | the light-box only, one per viewport. Radial vignette to 65% field + 35% `bg` at the edges |
| `paper` · `paper-ink` · `paper-label` · `paper-dot` | `#E6DDCC` · `#141619` · `#7A4B12` · `#A86A1E` | 4% | the blotter strip and its text, zone labels and note dots |
| `danger` · `success` | `#F0907F` · `#93C9A3` | n/a | form errors and confirmations on bg/surface |

**Contrast (WCAG 2.x, computed with node)**

| Pair | Ratio | Need | | Pair | Ratio | Need |
|---|---|---|---|---|---|---|
| ink / bg | 14.87 | 4.5 ✓ | | ink / field oud · amber · floral · fresh | 11.19 · 8.40 · 9.80 · 9.23 | 4.5 ✓ |
| ink / surface | 13.26 | 4.5 ✓ | | ink / field vignette edges | 10.64 (amber) – 12.56 (oud) | 4.5 ✓ |
| muted / bg | 6.66 | 4.5 ✓ | | paper-ink / paper | 13.45 | 4.5 ✓ |
| muted / surface | 5.94 | 4.5 ✓ | | paper-label / paper | 5.48 | 4.5 ✓ |
| accent / bg (links) | 7.10 | 4.5 ✓ | | paper-dot / paper (graphic) | 3.28 | 3 ✓ |
| accent / surface | 6.33 | 4.5 ✓ | | danger / bg · surface | 7.77 · 6.93 | 4.5 ✓ |
| bg on accent (button label) | 7.10 | 4.5 ✓ | | success / bg · surface | 9.60 · 8.56 | 4.5 ✓ |
| bg on accent-hover | 8.81 | 4.5 ✓ | | muted input border / surface | 5.94 | 3 ✓ |
| hairline-gold / bg · surface | 5.52 · 4.92 | 3 ✓ | | line / bg | 1.54 | decorative only |

**Banned pairs:**
- These fail and are never used: muted on fields (3.76–5.01), accent on fields (4.01–5.34), accent on paper (1.89).
- Text inside the light-box is `ink` only.
- Focus ring is 2px `accent` on bg/surface, `ink` on fields and `paper-ink` on paper.

## 3. Type

| Role | Face | 390px | 1440px | LH |
|---|---|---|---|---|
| Hero H1 | Aref Ruqaa 400 · Marcellus 400 (Latin ×0.98) | 40 | 72 | 1.25 |
| H2 (spotlight titles) | Aref Ruqaa 400 | 30 | 48 | 1.3 |
| Product name on light-box | Aref Ruqaa 400 | 28 | 40 | 1.3 |
| Family tabs | Aref Ruqaa 400 | 20 | 28 | 1.2 |
| H3, labels | Noto Kufi Arabic 600 · Be Vietnam Pro 600 (Latin ×1.03) | 18 | 20 | 1.6 |
| Body | Noto Kufi Arabic 400 · Be Vietnam Pro 400 | 16 | 17 | 1.8 AR / 1.6 EN |
| Price | Noto Kufi Arabic 600, `tabular-nums` | 18 | 20 | 1.4 |
| Blotter notes · zone labels | Noto Kufi 400 · 600 | 14 · 12 | 15 · 13 | 1.5 |
| Small, legal | Noto Kufi 400 | 13 | 13 | 1.7 |

- **Weights.** Aref Ruqaa **700 appears only in the wordmark**, outlined to SVG, so it is never loaded as a webfont. On-page display uses 400, which matches Marcellus's single weight.
- **Why the pairings work** (measurements from `fonts-and-logo-pipeline.md` §A5):
  - Aref Ruqaa ↔ Marcellus: alef 0.687 vs cap 0.700, body/x 0.98, stem 0.082 vs 0.085 at 400. Both have low-contrast, pen- or chisel-flared terminals.
  - Noto Kufi ↔ Be Vietnam Pro: alef 0.760 vs cap 0.740, body/x 0.92, stem 0.089 vs 0.095. Both are open, geometric and low-contrast.
- **Stacks.** Latin first: `"Marcellus","Aref Ruqaa",serif` and `"Be Vietnam Pro","Noto Kufi Arabic",sans-serif`. Tracking (0.24em) applies to Latin caps under `:lang(en)` only.
- **Payload.** Noto Kufi statics 400 + 600 (2 × 44 KB, not the 124 KB VF) and Aref Ruqaa 400 (38 KB). Only the default family's hero image and Aref Ruqaa are preloaded.
- **Numerals policy.**
  - AR uses `ar-KW` Arabic-Indic: `٢١٫٠٠٠ د.ك`, `٥٠ مل`. EN uses `KWD 21.000`, `50 ml`.
  - Aref Ruqaa and Marcellus carry **words only**: Ruqaa lacks ٫ ٬, so every number is set in Noto Kufi.
  - Phone and order numbers use Western digits in `<bdi dir="ltr">` in both languages, so they can be copied into WhatsApp.
  - Both faces cover چ گ پ for the Kuwaiti spellings.

## 4. Logo

- **Arabic wordmark.** **لطيمة** in Aref Ruqaa Bold, set large, outlined through the harfbuzzjs pipeline. From the specimen, choose the ss01–ss04 combination that gives the most calligraphic ط loop and final ـمة. No kashida, no tracking.
- **Latin line.** **LATIMA** in Marcellus caps tracked 0.24em. Its cap height is 38% of the alef height and it is centred on the wordmark's width. Beneath it sits `PERFUMES · KUWAIT` in Be Vietnam Pro 600 at 0.18em.
- **Arabic descriptor.** للعطور in Noto Kufi 400 on the inline-end of the wordmark baseline.
- **Mark.** The isolated Ruqaa **ط** inside an irregular ambergris-pebble outline drawn as a gold hairline. The ط replaces the matrix's ع; no other site's mark uses ط or a pebble.
  - Favicon at 32px and below: a solid `hairline-gold` pebble with the ط knocked out to `bg`, because a hairline disappears at that size.
- **Clear space and minimum sizes.**
  - Clear space is the ط loop height on all sides of the lockup, and 25% of the mark's width around the mark.
  - Minimum sizes: full lockup 120px or 30mm; Arabic wordmark alone 72px; outline mark 24px; solid mark 16px.
- **Files:** `logo-light` (ink on bg) and `logo-dark` (`#141619` on paper).

## 5. Layout

**Hero at 390px**
- **Header (56px).** Arabic wordmark at the start; bag and menu at the end. The language switch lives in the menu.
- **Family tabs.** A 4-up segmented row, 48px tall: **عود · عنبر · زهري · منعش** in Ruqaa 20. The active tab has ink text and a 2px amber bar at its block-end.
- **Light-box.** 358 × 448 (4:5), 28px radius, filled with the active family's field.
  - One uncropped bottle cut-out, about 60% of the box height, with its floor shadow baked in.
  - Caption at the bottom start: name (Ruqaa 28), then a notes line (زعفران · ورد طائفي · عود), then `من ١٤٫٥٠٠ د.ك*`.
- **Below the box.** Text anchored to the start: H1 (2 lines) and the subline.
  - A full-width amber button: `شوف عطور العنبر`. It follows the active tab.
  - A text link: `ما تدري من وين تبدأ؟ طقم العائلات الأربع ١٤٫٠٠٠ د.ك*`.
- **WhatsApp.** A fixed bottom bar with `كلّمنا واتساب`, padded for the safe area.

**Hero at 1440px**
- **Header (80px).** The full lockup at the start. Nav: العطور · دهن وبخور · أطقم الهدايا · المناسبات · للشركات. At the end: search, bag and EN.
- **Grid.** 12 columns, max 1280px.
- **Text column (columns 1–5, from the start).**
  - A vertical tablist of the 4 families. Each row has a 12px square swatch of the field colour, the name in Ruqaa 28 and a count (`٤ عطور`). The active row gets a 2px amber bar on its inline-start side.
  - Then H1 72, the subline (max 44ch), `من ١٤٫٥٠٠ د.ك*`, a primary and a secondary CTA.
- **Seam (column 6).** A 72px blotter strip for the displayed bottle, tucked half into the light-box edge. Its note labels sit in the gap.
- **Light-box (columns 7–12).** Height `min(80vh, 780px)`, the bottle uncropped. The caption sits inside at the bottom start.
- **Behaviour.** No autoplay. With JS off, the tabs are links to `/families/<slug>`.

**Homepage rhythm** (slow: one object per viewport, sides alternate, generous dark space)
1. Demo banner, then header.
2. Hero spotlight with family tabs (the category entry points, at the top).
3. **دوّر بالنوتة.** One tall blotter carrying 12 popular notes, each placed in its zone. Tapping a note links to `/shop?note=…`.
4. Spotlight: **عنبر الشاطئ**, the house signature. Box on the end side; a two-paragraph scent story, the blotter, three sizes and add-to-bag.
5. Spotlight: **عود الديوانية**, sides swapped.
6. **جاهز للإهداء.**
   - One square photo of the wrapped box.
   - Four promises in a plain list with gold hairlines: box included, card message, prices hidden, delivered to the recipient on the day.
   - An occasion row: زواج · عيد · مولود · تخرج · شكر وتقدير.
7. **Discovery set** in the light-box: 4 × 10 ml plus printed blotters. Its price is credited toward a first 100 ml.
8. **للشركات**, a surface band: minimum 25 sets, a quote within one working day. Formal copy and a link to the form.
9. Four reviews as single-column pull quotes, labelled `تقييمات توضيحية`.
10. The Salmiya shop: address, hours (with a Ramadan note), map link and WhatsApp.
11. Footer: policies, a CR slot, payment method names as text, and the demo credit.

**Product page**
- A 1:1 light-box stage plus three square images: the bottle, the bottle with its box, and an ingredient still-life.
- Name, family, and a **size selector** of 3 segmented buttons, each showing ml and price. Out-of-stock sizes are disabled and read `خلصت`.
- Gift toggle, add to bag, `اسألنا عنه واتساب` and a share link (`?size=50`).
- Specs: longevity, sillage, season, concentration (EDP 18–20%) and the IFRA allergen list.
- The long-form story, then "يشبهه" (similar scents that share a base note).

**Signature: the blotter strip**
- **Form.** A paper strip, 56px wide on mobile and 72px on desktop, with one end cut to a point. The dipped 18% carries a wet stain in the family colour at 35%.
- **Zones.** Gold 1px ticks split it into three zones:
  - **المقدمة**, `أول ١٥ دقيقة`
  - **القلب**, `لين ٣ ساعات`
  - **القاعدة**, `بعد ٣ ساعات`
- **Notes.** A `paper-dot` on the strip marks each note, with a horizontal label beside it. Arabic is never rotated. Tapping a note shows a one-line descriptor.
- **Semantics.** It is a `<dl>` (zone → notes), so screen readers hear "المقدمة: زعفران، هيل".
- **As a filter** on `/shop`: every note sits in its zone as a toggle (`aria-pressed`). The URL is `?note=saffron,taif-rose` and matching is AND.
- **Where it appears:** the hero (desktop), the home "by note" section, every product and the discovery-set print.

**Shape language.**
- Square 1:1 images.
- The 28px light-box is the only rounded shape (hero, spotlights, product stage).
- 1px gold hairlines.
- Buttons are 0-radius, 52px tall.
- No cards, no shadows except the baked bottle floor shadow.

**Motion.**
- The field background crossfades over 400ms `ease-out` between families. The bottle cross-dissolves in place with no translate or scale.
- Nothing else animates: the cart opens without a tween and nothing fades up.
- Under `prefers-reduced-motion`, swaps are instant.

**Photography.**
- **Light.** Low-key chiaroscuro: one hard side light from camera-left (images are never mirrored for RTL), glass highlights, deep shadows.
- **Bottles.** Shot square at 2400px on seamless paper in the family field colour, so the glass picks up the colour. Then cut out, keeping the reflections and floor shadow, and placed on the CSS field. That keeps recolouring and rebranding a CSS change.
- **Ingredient still-lifes** go on slate.
- **Grade.** True blacks, warm highlights, saturation −10, 2% grain.
- **People.** Hands only, no faces.
- **Placeholders** are generated bottle silhouettes until licensed photos exist.

## 6. Niche features → engine

| Feature | Module | Config / schema |
|---|---|---|
| Scent families | `commerce` taxonomy + `brand` tokens | `families: [{slug:"oud", name:{ar:"عود",en:"Oud"}, field:"#3B2A22"}, amber, floral, fresh]`. Each field becomes `--field-<slug>`. `product.family` is required and single. The hero tabs read this list. |
| Note pyramid | `commerce` product schema + `ui/BlotterStrip` | `notes` collection: slug, name ar/en, descriptor. `product.notes: {top[], heart[], base[]}` with 1–4 each. Catalogue filter `?note=`. |
| Bottle sizes | `commerce` variants | Exactly 3 per `type: perfume` (30/50/100 ml), `oil` (3/6/12 ml) and `bukhoor` (25/50/100 g). `{sku, size, unit, priceMinor, stock}`. Fils ×1000, every price a multiple of 10 fils (Checkout.com rule). |
| Gift sets | `commerce` bundle type | `type:"set"`, `components:[{sku, qty}]`, `stockFrom:"components"`: a set sells only while every component is in stock. |
| Gift options | `commerce` checkout extension | `gift:{wrap:[{id:"standard",priceMinor:0},{id:"premium",priceMinor:2000}], cardMessageMax:200, hidePrices:true, recipient:true, deliveryDateMaxDays:14}`. Choose a date only, **no time slots** (slots belong to site 06). |
| Occasion gifting | `cms` collection + catalogue filter | `occasions`: slug, name, curated SKUs, 3 suggested card messages, optional `orderBy` shown with Hijri beside Gregorian. |
| Corporate enquiry | `commerce/quoteRequest` (shared with site 12, different UI) + `whatsapp` + Netlify Function email | `corporate:{minQty:25, sleeveMinQty:50, sleevePriceMinor:750, leadWorkingDays:10, sleeveLeadWorkingDays:14, weekend:["fri","sat"], budgetBands:["8–15","15–30","30+"], advancePct:50, quoteValidDays:14}`. The form rejects dates under the lead time with Arabic validation text and accepts a logo upload (PNG/SVG ≤5 MB). |
| Free samples | order builder | `freeSamples:{count:2, sizeMl:2}`, picked at checkout; they are the basis of the "try before you open" returns rule. |
| Delivery | `commerce` shipping rules | Governorate zones, same-day cutoffs, express, pickup, free threshold, and Friday and Ramadan overrides (§7). |
| Payments | `payments` | Demo: `provider:"mock"`. Live: `tap`. Methods `knet`, `card`, `applepay`, `cod` (cash or KNET-on-delivery, max 100.000 KWD). |
| Stock, orders | `commerce` inventory + Supabase (full tier) | Per-variant stock. Order statuses جديد → قيد التجهيز → مع المندوب → تم التسليم / ملغي. |
| Analytics | event layer | Standard events plus `family_switch`, `note_filter`, `gift_toggle`, `corporate_enquiry_submit`. |
| SEO | `seo` | `Store` + `LocalBusiness.openingHoursSpecification` (with the Ramadan `validFrom`/`validThrough`), `Product` with `AggregateOffer` (low/high over sizes, KWD), `BreadcrumbList`, `og:locale ar_KW` + `en_US`. |

## 7. Operations

- **Shop hours.** Sat–Thu 10:00–22:00 · Fri 16:00–22:00.
- **Ramadan** (dates set in CMS): Sat–Thu 12:00–16:00 plus **20:00–01:30 daily, crossing midnight**. At 00:45 on Sunday, "open now" is resolved from Saturday's span.
- **WhatsApp replies.** 10:00–23:00 (Fri from 14:00).

**Delivery (Kuwait only)**

| Zone | Fee | Same day if ordered by | Otherwise |
|---|---|---|---|
| Hawalli (Salmiya, Jabriya, Rumaithiya, Bayan, Mishref) | 1.000 KWD | 16:00 (Fri 18:00) | next day |
| Capital · Farwaniya · Mubarak Al-Kabeer | 1.500 KWD | 14:00 (no same-day on Fri) | next day |
| Ahmadi · Jahra | 2.000 KWD | none | next day |
| Express, 3 hours (Hawalli, Capital) | 3.000 KWD | orders 10:00–19:00 Sat–Thu | n/a |
| Pick-up, Salmiya shop | free | ready in 2 hours, within shop hours | n/a |

- **Free standard delivery** on subtotals of **25.000 KWD** or more.
- **Delivery windows.** Sat–Thu 12:00–22:00 · Fri 16:00–22:00 · Ramadan 20:30–00:30, with a same-night cutoff at 17:00.
- **Scheduled delivery.** Up to 14 days ahead.
- **Eid.** The CMS `orderBy` defaults to 22:00 two days before Eid for standard delivery; express runs until 19:00 on Eid eve.
- **GCC.** On request by WhatsApp only. Perfume is a flammable liquid, so it goes by road courier at a per-order quote. The engine's GCC table stays off, which keeps site 02 distinct.

**Lead times**
- In-stock items: same or next day, as above.
- Standard or premium wrap and card messages add no time.
- Corporate orders: **10 working days** after quote approval and a 50% advance. **14 days** with printed sleeves (50+ sets). Over 300 sets: by agreement.
- Working days are Sun–Thu.

**Policies (summary, formal-neutral Arabic on the page)**
- **Returns.** A sealed, unopened bottle can be returned within **7 days** of delivery. Customers try the free samples first.
  - Refunds go back to the original method within 7 working days; COD refunds are made by bank transfer.
  - Opened bottles can't be returned, except for a faulty sprayer, which is replaced within 14 days.
- **Delivery damage.** Report it within 24 hours with a photo for a free replacement.
- **Gift receipts.** They carry no prices, and the recipient may exchange a sealed item within 14 days.
- **Our own blends only.** No "inspired-by" copies.
- **Also on the page:** the privacy and terms pages, and a patch-test and allergen notice.
- **Corporate.** Quotes are valid 14 days, with 50% on approval and the balance on delivery.
- **CR number slot** in the footer: `legal.crNumber`.

## 8. Content plan

**Collections (6):** عود · عنبر · زهري · منعش (16 EDPs, 4 per family) · **دهن وبخور** (3 oils + 2 bukhoor) · **أطقم الهدايا** (3 sets).
- That makes **24 products**. The corporate set is quote-only and is not a product.
- Occasions are a separate taxonomy: زواج، عيد، مولود، تخرج، شكر وتقدير، بدون مناسبة.

| Product | Family | Top / Heart / Base | Prices (KWD) |
|---|---|---|---|
| عنبر الشاطئ · Shoreline Amber (house signature) | عنبر | ملح بحري، برغموت / لبان، ياسمين / أكورد عنبر رمادي، مسك أبيض، أرز | 30 ml 14.500 · 50 ml 21.000 · 100 ml 34.000 |
| عود الديوانية · Diwaniya Oud | عود | زعفران، هيل / ورد طائفي / عود، جلد، عنبر | 16.500 · 24.000 · 38.000 |
| ورد الفريج · Fereej Rose | زهري | ليتشي، فلفل وردي / ورد طائفي، ورد دمشقي / مسك، باتشولي | 12.000 · 18.500 · 29.000 |
| مطر الوسم · Wasm Rain | منعش | ليمون أخضر، نعناع / شاي أخضر، زنبق الماء / فيتيفر، مسك أبيض | 11.000 · 16.500 · 26.000 |
| دهن عود هندي معتّق · Aged Indian Oud Oil | عود | مسك، لمسة جلدية / عود، خشب رطب / عنبر، عسل | 3 ml 14.000 · 6 ml 26.000 · 12 ml (tola) 48.000 |
| بخور الغبقة · Ghabga Bukhoor | عنبر | (burn notes on the blotter) | 25 g 5.500 · 50 g 9.500 · 100 g 17.000 |
| طقم العائلات الأربع · Four-Family Discovery Set | all | 4 × 10 ml + 4 printed blotters | 14.000 (credited toward a first 100 ml within 30 days) |
| طقم العرس · Wedding Pair | عود + زهري | Diwaniya Oud 50 ml + Fereej Rose 50 ml, wooden box | 42.000 |

**Gallery (10):**
1. The three sizes side by side on oud-brown seamless.
2. Blotters fanned in a glass.
3. Raw ambergris-like pebble with oud chips on slate.
4. Hands tying the gift ribbon.
5. Taif rose petals on plum paper.
6. An uncapped bottle, side-lit.
7. A mabkhara with a smoke curl.
8. The Salmiya shop counter at night (no people, no signage).
9. The Wedding Pair box open on amber paper.
10. A stack of corporate gifts with blank sleeves.

**FAQ (AR)**
1. شلون أعرف إن العطر يناسبني قبل ما أشتري؟
2. شنو الفرق بين ٣٠ و٥٠ و١٠٠ مل غير السعر؟
3. أقدر أرسل العطر هدية بدون ما تبين الأسعار؟
4. متى يوصل طلبي؟ وفي توصيل نفس اليوم؟
5. أقدر أرجّع العطر إذا ما عجبني؟
6. عندكم هدايا للشركات؟ شنو أقل كمية؟

**Sample reviews (every one labelled "تقييم توضيحي")**
- **أم فهد, Mishref.** Bought the Wedding Pair for her son's wedding. The box and the price-free invoice mattered.
- **عبدالعزيز, Jabriya.** An oud buyer. The blotter matched what he smelled, and he came back for the 12 ml oil.
- **نوف, Salmiya.** Bought the discovery set, then a 100 ml of Wasm Rain using the credit.
- **سارة, HR coordinator, Sharq.** Ordered 60 corporate Eid sets with printed sleeves, delivered on the agreed date.

## 9. Voice

| | Kuwaiti | English |
|---|---|---|
| Hero headline | **اختار عطرك من نوتاته، مو من اسمه.** | Choose your perfume by its notes, not its name. |
| Subline | نشرح لك كل عطر من أول رشّة لين آخر الليل، بثلاث أحجام، ويوصلك جاهز للإهداء. چذي تعرف شنو بتشمّ قبل لا تفتح العلبة. | Every scent explained from the first spray to the end of the night, in three sizes, delivered ready to give. That way you know what you'll smell before you open the box. |
| WhatsApp CTA | محتار بين عطرين؟ وايد يصير… **كلّمنا واتساب** ونختار وياك. | Torn between two? It happens a lot. **Message us on WhatsApp** and we'll choose with you. |

- **Policy register.** Formal-neutral Arabic, for example: «يمكن إرجاع المنتج خلال سبعة (٧) أيام من تاريخ الاستلام، بشرط أن يكون مغلقًا بغلافه الأصلي. ويُعاد المبلغ إلى وسيلة الدفع نفسها خلال سبعة أيام عمل.»
- **Corporate register:** «يسعدنا تزويدكم بعرض سعر خلال يوم عمل واحد من استلام الطلب.»

## 10. Remove before finishing

**Remove the full-width gold hairlines between homepage sections.**
- The alternating light-box sides and the dark space between them already mark each section change.
- Gold then stays only where it carries meaning: the logo pebble, the blotter zone ticks and the product spec table.
