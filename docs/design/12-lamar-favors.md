# 12 · بُقشة · Buqsha Favours: design plan

Step 1 ("Plan first") of `arabic-websites-master-prompt.md`. Written 2026-09-23. The identity comes from row 12 of `00-distinctness-matrix.md`, and this plan refines it. The folder slug stays `12-lamar-favors`, but the brand is renamed (see Name check). Fonts come from `docs/research/fonts-and-logo-pipeline.md`; the stem figures below I measured with fontTools on the Google Fonts TTFs.

## 1. Name check

The WebSearch budget for this session had already run out (200 of 200 calls). Bing, DuckDuckGo, Google, Startpage and Mojeek all returned bot walls or unrelated results when fetched directly. So I checked by fetching likely domains, and I read the one same-niche site I found.

| Checked | Found | Verdict |
|---|---|---|
| `lamar-kw.com` | **Lamar Kuwait**: elevators and maintenance | Unrelated niche (already known) |
| `lamargifts.com` | **Lamar Events & Gifts**. Its menu lists «توزيعات لكل المناسبات، توزيعات بيبي، توزيعات أعراس، توزيعات توجيهي»، تجهيزات العروس, graduation, packaging. Prices are in ILS, WhatsApp is +972 56…, Instagram is `@lamar_gifts_and_flowers` (Palestine) | **Same niche, Arabic-speaking market** |
| `lamarkw.com`, `lamar.com.kw`, `lamar.kw`, `lamarkuwait.com`, `lamarfavors.com`, `lamarfavours.com`, `lamar-favors.com`, `lamarevents.com` | No site | n/a |

**Verdict: rename.** The shop I found is outside the GCC, but it sells exactly this product under the Arabic name this demo would use (لمار للتوزيعات). لمار is also one of the most common Gulf girls' names, and favour shops are often named after a daughter, so a Kuwaiti «توزيعات لمار» Instagram shop is likely. Without search I can't rule one out.

**First replacement, dropped: نِثار · Nithar.** نثار is the classical word for the sweets and coins scattered over wedding guests, so it is literally the wedding favour. Its domains were clear; the only hit was `nithar.net`, a marketing agency, which is an unrelated niche. **But 06 and 08 were renamed to نِثار in parallel.** Three sites can't share it, so 12 takes a different name. The favours site has the most literal claim to نثار; see open questions.

**New name: بُقشة · Buqsha** (Kuwaiti pronunciation *bugsha*). A بقشة is a square of cloth tied up around gifts. In the Kuwaiti wedding الدزة, the groom's family send the bride «البقشة» holding fabric, abayas and jewellery ([ar.wikipedia, ثقافة الكويت](https://ar.wikipedia.org/wiki/%D8%AB%D9%82%D8%A7%D9%81%D8%A9_%D8%A7%D9%84%D9%83%D9%88%D9%8A%D8%AA)). Wiktionary glosses it as "bundle, a cloth tied up for carrying things", from Ottoman Turkish *bohça* ([wiktionary](https://en.wiktionary.org/wiki/%D8%A8%D9%82%D8%B4%D8%A9)).
- **The story:** every favour is a small بقشة, a gift wrapped and tied for each guest to take home.
- **The name fits the mark:** the ribbon bow with its gold knot is the knot that ties the bundle.
- **No clash in the set:** it shares no root or ending with the other twelve names. Banan (11) also starts with ب, but the two words look and sound nothing alike.

| New-name check | Found | Verdict |
|---|---|---|
| `bugsha.com`, `boqsha.com`, `buqsha.kw`, `bugsha.kw`, `buqsha.com.kw`, `bugsha.com.kw`, `buqshakw.com`, `bugshakw.com`, `buqsha.store`, `bugsha.store`, `buqsha.shop`, `bugsha.shop`, `buqsha.co`, `bugsha.co`, `bugsha.net`, `buqshafavours.com` | No site | Clear |
| `buqsha.com`, `buqsha.net` | Both answer with an empty WordPress page: no title, a 404 at `/wp-json/`, no content | Registered but parked, trade unknown. Watch |
| Word usage | البقشة اليمنية is also a former Yemeni coin (1/40 riyal) | Unrelated |

**Mitigation:** the lockup always reads «بُقشة للتوزيعات» / BUQSHA FAVOURS. Handles use `buqsha.favours`, never a bare `buqsha`. Re-run a real search pass before building (see open questions).

## 2. Identity

| | |
|---|---|
| Name | **بُقشة للتوزيعات** · **BUQSHA FAVOURS** |
| Meaning | The tied cloth bundle of gifts from the Kuwaiti wedding الدزة. Every favour is a small one |
| Positioning (AR) | توزيعات بالاسم في الكويت من 25 حبة، كل ما زادت الكمية نزل سعر الحبة، وعرض سعر الشركات يوصلكم خلال 24 ساعة. |
| Positioning (EN) | Personalised favours in Kuwait from 25 pieces. The more you order, the less each piece costs, and corporate quotes come back within 24 hours. |
| Audience | Kuwaiti mothers, brides, event planners and HR/marketing teams ordering favours in bulk for قرقيعان, newborns, weddings and ملچة, graduations and company events. They arrive from Instagram on a phone and want to know three things: what it costs per piece, the minimum, and whether it arrives in time |
| Preset / tier | commerce · `full`, niche `favors`: cart, checkout, delivery by governorate, orders dashboard with a design-proof step |
| Place | Kuwait · Hawalli studio near شارع تونس (pick-up and sample viewing) · **KWD** (3 decimals, 0.010 steps) · `Asia/Kuwait` · locale `ar-KW-u-nu-latn` |
| Dialect | Kuwaiti, cheerful and practical, with feminine address using ج (لج، اسمج، يوصلج) and the words نطرش، الحين، چم، وايد، زيدي. The corporate band and every policy page use formal-neutral Arabic with plural address (أرسلوا، يصلكم) |

## 3. Palette (T structure: tonal pink)

The hexes are unchanged from the matrix, so the matrix's ΔE figures still hold. The nearest neighbours are 08 at 21.0 and 01 at 21.3; 07 is 27.2 and 04 is 32.7.

| Token | Hex | Share | Use |
|---|---|---|---|
| `bg` blush | `#F5DAD8` | 52% | Page ground, collage backgrounds, table header rows |
| `surface` ivory-blush | `#FDF5F4` | 24% | Tables, buy panel, form fields, tile label plates, **2px collage gutters** |
| `ink` raisin | `#2D1D23` | 6% | Text, prices, focus ring, stepper glyphs |
| `deep` (= ink as a ground) | `#2D1D23` | 8% | Corporate quote band, footer, dark logo |
| `muted` | `#6A545B` | 4% | Meta text, quantity labels, **input borders and ladder-step outlines** |
| `accent` rosewood | `#9A4467` | 5% | Primary button fill, links, the **lit ladder step**, selected-choice ring |
| `accent-hover` | `#7E3453` | functional | Hover and pressed states |
| `on-accent` | `#FDF5F4` | on accent | Button text, the lit step's price |
| `on-deep-muted` | `#D9BFC3` | on deep | Secondary lines on the corporate band and footer |
| `line` | `#E8C6C3` | 1% | Decorative table rules. Every table row also gets 12px padding, so the rule is never the only divider |
| `hairline-gold` | `#B7966A` | <1% | **Only** the 1px inset box-lid frame on collage tiles and the logo knot. Never text, never a control border, never a fill |
| `error` | `#9C3B12` | functional | Validation text, always with an icon and a written reason (ΔE 26 from rosewood, so it doesn't read as the accent) |
| `success` | `#2F6B45` | functional | «تم اعتماد التصميم» and paid states, always with ✓ and text |

**Contrast (WCAG 2.x, computed in node):**

| Pair | Ratio | Needs |
|---|---|---|
| ink / bg · surface | 12.12 · 14.90 | 4.5 ✓ |
| muted / bg · surface | 5.24 · 6.45 | 4.5 ✓ |
| accent / bg · surface (links, outline buttons) | 4.68 · 5.75 | 4.5 ✓ |
| on-accent / accent (primary button, lit step) | 5.75 | 4.5 ✓ |
| on-accent / accent-hover · accent-hover / bg | 7.81 · 6.35 | 4.5 ✓ |
| surface / deep · bg / deep (band text) | 14.90 · 12.12 | 4.5 ✓ |
| on-deep-muted / deep | 9.29 | 4.5 ✓ |
| error / bg · surface | 5.22 · 6.41 | 4.5 ✓ |
| success / bg · surface | 4.80 · 5.90 | 4.5 ✓ |
| muted as input border or step outline / surface · bg | 6.45 · 5.24 | 3.0 non-text ✓ |
| lit step (accent) against bg | 4.68 | 3.0 non-text ✓ |
| focus ring: ink on light · surface on deep | 12.12 · 14.90 | 3.0 ✓ |
| gold / bg · surface · deep | 2.10 · 2.58 · 5.78 | decorative only |
| line / bg · surface | 1.20 · 1.47 | decorative only |
| ink on accent · accent on deep | 2.59 · 2.59 | **never used**. Buttons on the deep band are `bg` filled with ink text (12.12) |

Tile labels never sit directly on a photo. They go on a `surface` plate with ink text (14.90), so contrast doesn't depend on the image.

## 4. Type

| Role | Arabic | Latin (EN pages) |
|---|---|---|
| H1, H2, occasion tile labels | **Lemonada 500** (VF 300–700; Arabic subset 14 KB). Words only, never prices | **Comfortaa 700** |
| Wordmark | Lemonada 600, outlined | Comfortaa 700, lowercase `buqsha` |
| H3, body, UI, prices, tables | **Almarai 400 / 700** | **Manrope 500 / 700** |

**Why this pairing (measured):**
- **Alignment.** Lemonada's alef reaches 0.775 em and Comfortaa's cap height is 0.781, so `--latin-scale-display: 0.99`. Almarai's alef (0.716) matches Manrope's cap (0.720), so the body scale is `1.00`.
- **Stems.** Lemonada is heavy: its alef stem is 0.110 at 400, 0.138 at 500 and 0.164 at 600. Comfortaa tops out at 700, where its stem is 0.102. That is why this plan moves the Latin display from the matrix's 600 to **700**, and keeps Arabic headings at 500, not 600. The Latin still sits about 25% lighter, but Comfortaa is monoline and reads close.
- **Body stems.** Almarai 400 (0.086) matches Manrope 500 (0.090), and Almarai 700 (0.122) matches Manrope 700 (0.122). So the matrix's Manrope 400/600 becomes **500/700**.
- **Shape.** Both display faces are rounded, the way ribbon and sugared almonds are round. Both body faces are clean Gulf-modern sans.

**Coverage:** Lemonada and Almarai 400/700 both contain چ گ پ ڤ and ٫ ٬, so Kuwaiti spellings like «چم حبة» shape inside one font.

**Scale** (px, 390 → 1440). Arabic line-heights are explicit. Lemonada's dots rise to 0.93 em and its descenders drop to −0.44, so it never goes under 1.45.

| Token | Face | 390 | 1440 |
|---|---|---|---|
| `display` (hero H1, max 2 lines) | Lemonada 500 | 30 / 1.5 | 52 / 1.45 |
| `h2` | Lemonada 500 | 24 / 1.5 | 34 / 1.45 |
| `tile` (occasion label) | Lemonada 500 | 16 / 1.45 | 22 / 1.45 |
| `h3` / product name | Almarai 700 | 20 / 1.5 | 24 / 1.45 |
| `body` | Almarai 400 | 17 / 1.8 | 18 / 1.8 |
| `ui` (buttons, chips, stepper) | Almarai 700 | 16 / 1.4 | 16 / 1.4 |
| `small` (floor) | Almarai 400 | 14 / 1.6 | 14 / 1.6 |
| `step-price` (ladder) | Almarai 700, digits from Manrope 700 `tnum` | 16 | 18 |
| `total` (buy panel, cart) | same | 24 / 1.2 | 30 / 1.2 |

**Numerals: `latn`** (the matrix's choice: tier tables, quantities, per-piece prices).
- The formatter is `Intl.NumberFormat('ar-KW-u-nu-latn', {style:'currency', currency:'KWD'})`, which returns `‏0.450 د.ك.‏`. `formatToParts` re-renders that as **0.450 د.ك** inside `<bdi>`, with the RLM and the trailing dot stripped. English pages show **KWD 0.450**.
- Font stacks are Latin-first (`"Manrope", "Almarai"`), so even on Arabic pages the Western digits come from Manrope. **Almarai's digits are proportional and it has no `tnum`, but Manrope has `tnum`,** so tier tables use `font-variant-numeric: tabular-nums` and the decimals line up. Arabic pages therefore also load a Manrope 700 digits subset (`U+0030-0039, U+002C, U+002E, U+002B`, about 3 KB).
- Dates are Gregorian (`ar-KW`: «السبت 3 أكتوبر»). The card can optionally carry a Hijri date (`islamic-umalqura`).
- Preload Lemonada (H1) and Almarai 400. Comfortaa and the full Manrope load on `/en` only.

## 5. Logo

- **Arabic wordmark:** «بقشة» in Lemonada 600, outlined to paths with harfbuzzjs. The four letters join into one unbroken stroke, like a length of ribbon.
  - The final ـة's bowl is drawn as **one loop of a tied bow**.
  - A short **ribbon swash** trails from that loop, under the word toward the inline-end, and ends in a V-notched cut like a trimmed ribbon. (This replaces the matrix's swash off the ر tail, because the name has no ر.)
  - The ش's dots and the ة's dots stay as Lemonada draws them.
- **Latin lockup:** `buqsha` in Comfortaa 700 lowercase; its round b, q and a bowls echo the bow loops. Below it sits «FAVOURS · KUWAIT» in Manrope 700 caps, tracked +0.16em, at 28% of the wordmark height. The Arabic descriptor «للتوزيعات» is set in Almarai 700.
  - Horizontal lockup: mark, then Arabic wordmark, then a 1px `muted` rule, then the Latin stack.
  - Stacked lockup: mark above the Arabic wordmark, with the Latin under it.
- **Mark (favicon, avatar):** the knot that ties a بقشة. It is a ribbon bow made of two mirrored teardrop loops and two short V-notched tails in rosewood. The knot is a small rounded square outlined by a 1px gold hairline. At 24px and below, the knot becomes solid raisin and the gold is dropped, because a hairline doesn't survive at that size. The favicon sets the mark on a blush square with 4px radius.
- **Clear space:** k on every side, where k is the height of the ق head in the wordmark. The swash counts as part of the lockup.
- **Minimum size:** full horizontal lockup 128px wide (32 mm in print). Arabic wordmark alone 64px. Mark 16px.
- **Variants:**
  - `logo-light`: raisin wordmark, rosewood bow and gold knot, on blush.
  - `logo-dark`: surface wordmark and bow on `deep`, with a gold knot (5.78:1, which stays visible).
- **OG image (1200×630):** four mosaic tiles on the inline-end side. On the inline-start side: the wordmark, «من 25 حبة», and a static tier ladder.

## 6. Hero, layout, signature

**Hero archetype: occasion mosaic.** The page opens on a packed, asymmetric collage of favours seen from above, like a gift table. Every tile is an entry point, and none is filler.

**390px (844 tall):**
1. Demo banner (36px).
2. Header (56px): the bow mark and «بقشة» on the inline-start side. On the inline-end side, three 44px buttons: واتساب، السلة (with count), ع/EN. The menu lives in the footer and in the `/shop/` occasion rail.
3. **Headline block** (start-aligned, 16px gutters):
   - the H1 in 2 lines
   - one 15px Almarai line: «من 25 حبة · نطرش لج التصميم قبل الطباعة»
4. **Mosaic.** It runs edge to edge: a 4-column grid with square cells (about 96px) and **2px surface gutters**. The spans:

   | | c1 | c2 | c3 | c4 |
   |---|---|---|---|---|
   | r1 | قرقيعان | قرقيعان | مواليد | مواليد |
   | r2 | قرقيعان | قرقيعان | أعراس وملچة | تخرج |
   | r3 | شركات | شركات | أعراس وملچة | الكل |

   - قرقيعان is 2×2 with a 1:1 photo and is the LCP image (`fetchpriority="high"`, AVIF at 400w and 800w).
   - مواليد and شركات are 2×1 (2:1 crops), أعراس وملچة is 1×2 (1:2), and تخرج and الكل are 1×1.
   - Each tile has a 4px radius and an **inset 1px gold box-lid frame** 5px in from the edge.
   - Each tile has a surface **label plate** at its bottom inline-start corner, sitting across the frame line like a sticker on a box lid. It shows the occasion in Lemonada 16px. The 2×2 tile adds a second line: «من 0.500 د.ك للحبة».
   - The whole tile is the link.
   - The mosaic is about 292px tall.
5. **Tier strip** (72px, on surface). The first appearance of the signature: «مثال: علبة قرقيعان شفافة», followed by a static 4-step ladder (25+ 0.650 · 50+ 0.600 · 100+ 0.550 · 200+ 0.500).
6. Everything down to here ends at about 600px. A 48px WhatsApp button stays pinned at the bottom inline-end: a square with 4px radius, the glyph and the word واتساب. No pill.

**1440px (container 1320px, 12 columns):**
- **Header (72px):** wordmark; nav (المناسبات، الأسعار حسب الكمية، الشركات، التوصيل، الأسئلة); cart; WhatsApp; ع/EN.
- **Inline-start 4 columns:**
  - the H1 at 52px
  - the subline
  - two CTAs: «اختاري المناسبة» (solid rosewood) and «عرض سعر للشركات» (2px rosewood outline)
  - a static tier ladder for the bestseller
  - a live line: «أقرب تاريخ لمناسبتج: السبت 3 أكتوبر»
- **Inline-end 8 columns:** the mosaic, **bleeding to the viewport edge**. It is a 6×3 grid of square cells (about 153px) with 2px gutters:

  | | c1 | c2 | c3 | c4 | c5 | c6 |
  |---|---|---|---|---|---|---|
  | r1 | قرقيعان | قرقيعان | مواليد | مواليد | مواليد | أعراس |
  | r2 | قرقيعان | قرقيعان | تخرج | توزيعة الأسبوع | توزيعة الأسبوع | أعراس |
  | r3 | شركات | شركات | تخرج | الكل | الكل | الكل |

  - The spans are: قرقيعان 2×2, مواليد 3×1, أعراس وملچة 1×2, تخرج 1×2, توزيعة الأسبوع 2×1 (a featured product, chosen in the CMS), شركات 2×1, الكل 3×1 («28 توزيعة · تصفحي الكل»).
  - The whole hero sits in the first 640px.

**Homepage rhythm.** Collage blocks alternate with calm tables:
1. Banner and header.
2. **Mosaic** and the tier strip.
3. **«الأسعار حسب الكمية»:** a calm table of 6 bestsellers with columns 25+ / 50+ / 100+ / 200+.
   - Tabular numerals.
   - Header row on `bg`, body on `surface`, rows linking to the product.
   - At 390px each row stacks: the name on one line, then 4 price cells.
4. **Seasonal collage:** mixed-span product tiles for the featured occasion, chosen in the CMS. It shows «موسم الأعراس والملچة» from September to December and switches to قرقيعان in January and February. Each tile carries a label plate with the name and «من X».
5. **«شلون نشتغل»:** four start-aligned steps with numbers, separated by rules. No cards and no icons.
   - اختاري التوزيعة والكمية
   - اكتبي الاسم والتاريخ
   - نطرش لج التصميم واتساب وتعتمدينه
   - يوصلج قبل المناسبة بيوم
6. **Corporate quote band** (`deep`, formal-neutral):
   - the heading and three facts: من 100 حبة، شعاركم على كل قطعة، عرض السعر خلال 24 ساعة
   - a 4-field mini form: company, mobile, quantity, event date
   - «أرسلوا الطلب», which opens the full `/corporate/` form with these fields filled, and «أو راسلونا واتساب»
7. **Collage «من طاولتنا»:** 7 gallery tiles in mixed spans, with a lightbox.
8. **Delivery table:** 6 governorates, their fees, the free-delivery threshold, and the live earliest-date line.
9. **Reviews (4):** each is labelled «مراجعة توضيحية» and shows the order size and the tier reached (for example «150 حبة · 1.050 د.ك للحبة»).
10. FAQ accordion (6).
11. Footer (`deep`): CR slot, policies, KNET, Visa/Mastercard and Apple Pay marks, WhatsApp, Instagram as text, and the demo credit.

**Product page:**
- **390px:** a mini collage (4:5 main photo, then two 1:1 below it: a close-up and a quantity shot of 25+ pieces lined up). Then the name, the **tier ladder**, the stepper, the personalisation fields, the event date, and a sticky bottom bar with the total and «أضيفي للسلة».
- **1440px:** a 7/5 split. The collage takes 7 columns and the buy panel takes 5 columns and is sticky.

**Signature: the tier ladder.** An `<ol>` of 4 steps (25+ · 50+ · 100+ · 200+). Each step is a bar whose height is proportional to its unit price, so the steps go **down** in reading direction. Every step has a qty label (muted) and a price (ink, `tnum`).
- The current quantity's step is **lit**: accent fill, on-accent price, `aria-current="true"`.
- The other steps are surface with a 1px muted outline.
- A 4px track under the steps **fills in 150ms** to the current quantity, on a log-like scale with 25, 50, 100 and 200 as equal segments.
- An `aria-live="polite"` line announces the change: «سعر الحبة الحين 0.650 د.ك · زيدي 15 حبة ويصير 0.600».
- **Where it appears:**
  - the full ladder on the product page
  - a 24px mini ladder on cards and cart lines (lit step plus «من 0.500 عند 200+»)
  - the static version in the hero strip and the OG image

**Shape language:**
- 4px radius on tiles, buttons, inputs and plates.
- Mixed tile spans (1×1, 2×1, 1×2, 2×2) with 2px ivory gutters.
- The inset gold box-lid frame on **collage tiles only**.
- Ladder steps with 2px top corners.
- Tables with rules and padding.
- No shadows, no pills (08 owns pills), no stamps (07), no live wrapper preview (06).

**Motion:** only the ladder track (150ms `cubic-bezier(.2,.7,.3,1)`). The lit step and the numbers change instantly, with no count-up (13 owns that). Collage tiles never animate, not even a hover zoom. Under `prefers-reduced-motion` the track jumps with no transition.

**Photography:**
- Light, airy top-down flat-lays on blush and ivory linen, lit by soft window light from one side, with shadows falling toward the inline-end.
- Colour stays pastel-true: ribbon and sugared-almond colours must match the product.
- **Every product gets 3 crops:** 1:1 flat-lay, 4:5 detail (name tag legible), and 2:1 «بالكمية» (25+ pieces in rows, because that shot sells bulk). Collage tiles also use 1:2 crops.
- Hands only, never faces.
- Grade tokens: saturation 0.95, brightness 1.04, warmth +0.02, contrast 0.94, tint `#F5DAD8` at 5%.
- Sources: Unsplash or Pexels flat-lays, or generated favour silhouettes on linen. Credits go in `docs/image-credits.md`.

## 7. Niche features → engine and config

| Brief feature | Module / config |
|---|---|
| **Minimum order quantity** | `favors.moq` field pack → `QuantityRule { min: 25, step: 5, max: 500 }`. The stepper moves by 5. A typed 33 snaps to 35 with «الكمية تزيد 5 حبات كل مرة (25، 30، 35…)». Below the minimum: «أقل كمية لهذا التوزيع 25 حبة». Above 500 the stepper stops at «أكثر من 500 حبة؟ اطلبوا عرض سعر للشركات» (`cart.maxQtyPerLine: 500`) |
| **Tiered bulk pricing** | `favors.tiers`: `[{minQty:25, unitPrice:1500}, {50,1350}, {100,1200}, {200,1100}]` in fils. CMS `step: 0.010` (C26). `/api/quote` recomputes on the server and never trusts client prices. **`tierScope: "product"`** adds up lines of the same product, so twins' names (2 × 50) price at the 100+ tier. check-all rules: tiers strictly decrease, the first `minQty` equals `min`, and every threshold is a multiple of `step`. JSON-LD: one `Offer` per tier with `UnitPriceSpecification` and `eligibleQuantity {minValue, unitCode:"H87"}` |
| **Personalisation fields** | `personalisation` pack → `text` options: الاسم (max 20), سطر ثاني (max 30, e.g. «الحمد لله على السلامة»); `choice` options: لون الشريطة (5 swatches, selected = 2px accent ring + ✓), تصميم البطاقة (4 templates), لغة البطاقة (عربي / English / الاثنين), التاريخ على البطاقة (ميلادي / هجري). Lead tag `personalised`. Corporate products add the `referenceImage` pack → `file` option «شعار الشركة» (PNG/SVG/PDF ≤ 10 MB) via `referenceUpload` (`/api/upload`) |
| **Event date** | `eventDate` pack → `date` option `{ required: true, leadDays: 10, maxDaysAhead: 180 }`. Engraved acrylic or wood and logo items use `leadDays: 14`. **One event date per order**: the cart rejects a second date with «كل طلب لمناسبة وحدة». The delivery date defaults to the last working day before the event (a Friday event delivers Thursday), and the customer can move it earlier, never later. Gergean items need a **fixed** date (see open questions) |
| **Corporate quote request** | `corporateEnquiry` → `/corporate/` plus the home band. Full tier: POST `/api/enquiry`, stored and shown in `/owner/`, with `notifyOn: ["enquiry"]`. Fields: company, contact person, mobile, email, quantity range, budget per piece, event date, logo upload, notes, plus a honeypot. The page states the SLA: «خلال 24 ساعة، من السبت إلى الخميس». A WhatsApp fallback message is built by `@aw/whatsapp` |
| **Policy page** | `pages` → `/policies/custom-orders/` (formal-neutral), plus delivery, privacy and terms. `checkout.termsPage = "custom-orders"`, with a required checkbox: «قرأت سياسة الطلبات المخصّصة» |
| Delivery | `fulfilment.delivery.zones`: 6 × `kind: "governorate"` (§8), each with `freeOver: 60000`. `deliveryDays: sat–thu`. `slots` with `capacity` (§8). `pickup`: the Hawalli studio, fee 0, in the same windows |
| Payments | `provider: "myfatoorah"`, methods `knet, card, apple_pay`. The demo runs on `mock`. Full payment at checkout. No COD, because personalised stock can't be resold |
| Orders dashboard | Statuses: جديد → بانتظار اعتماد التصميم → معتمد · قيد التجهيز → جاهز → خرج للتوصيل / جاهز للاستلام → تم التسليم · ملغي. An order is **flagged** when its proof is still unapproved after 48 h and the event is under 7 days away |
| WhatsApp | The order message includes: product, qty, tier price, names, ribbon, event date and total. There is a per-product share link and an owner-side proof template: «هذا التصميم لطلبج N-…، إذا تمام ردي بكلمة: معتمد» |
| Availability | `made_to_order` for everything. A seasonal «اكتمل حجز القرقيعان» appears when the Gergean delivery slots are full |

## 8. Operations

These details are invented, but they are consistent with each other.

**Hours (`Asia/Kuwait`):**
- **Studio** (pick-up and viewing samples):
  - Sat–Thu 10:00–13:00 · 16:30–21:30
  - Fri closed
- **WhatsApp replies:** daily 10:00–22:00.
- **Ramadan:**
  - Sat–Thu 12:00–15:00 · 20:00–**00:30**. This crosses midnight: it is stored as close < open, and 00:00–00:30 counts as the previous day's shift.
  - In the Gergean delivery week (Sat 13 – Thu 18 Feb 2027) the Friday also opens 20:00–00:30, entered as an exception.

**Lead times:**
- The event must be at least 10 days after the order (14 for engraved and logo items). On 23 Sep 2026 the earliest date is **Sat 3 Oct**.
- The design proof arrives on WhatsApp within 24 h (Sat–Thu).
- Production takes 5–7 working days after the proof is approved.
- If approval takes more than 48 h, the delivery date may move, and the customer is told.
- A shorter deadline goes to WhatsApp: «كلمينا ونشوف».
- **Gergean 1448:** Kuwait celebrates on the nights of 13–15 Ramadan. By Umm al-Qura that is Sat 20 – Mon 22 Feb 2027; the owner confirms each year (`approximate: true`).
  - Gergean items carry the fixed event date Sat 20 Feb.
  - With their 14-day lead, the last order is Sat 6 Feb.
  - Deliveries run Sat 13 – Thu 18 Feb.
- **National Day and Liberation Day** (25–26 Feb) are the corporate peak. Quotes for them should be in by 1 Feb.

**Delivery (Sat–Thu, on the chosen date):**

| Governorate | Fee | Note |
|---|---|---|
| حولي · Hawalli | 1.500 د.ك | Or free pick-up from the studio |
| العاصمة · Capital | 2.000 د.ك | |
| الفروانية · Farwaniya | 2.000 د.ك | |
| مبارك الكبير · Mubarak Al-Kabeer | 2.000 د.ك | |
| الأحمدي · Ahmadi | 3.000 د.ك | |
| الجهراء · Jahra | 3.000 د.ك | |

- Delivery is **free when the items total 60.000 د.ك or more.**
- **Slots:**
  - normally: morning 10:00–14:00 (capacity 8) and evening 16:00–21:00 (capacity 10)
  - Ramadan: 13:00–16:00 (8) and 20:00–23:30 (12)
  - Gergean week: the owner raises the capacities in the CMS
- **Chocolate** travels in cool bags from May to September.
- **Worked examples:**
  - 35 clear Gergean tubs × 0.650 = 22.750, plus Hawalli 1.500 = **24.250 د.ك**. The ladder prompts «زيدي 15 حبة ويصير سعر الحبة 0.600» (50 pieces = 30.000).
  - 100 almond boxes × 1.200 = **120.000 د.ك**, delivered free.
- **Checkout address, Kuwaiti style:**
  - fields: governorate, area, قطعة, street, جادة (optional), house or building, floor/flat, الرقم الآلي للعنوان (optional)
  - mobile must match `^[4569]\d{7}$` (+965 is also accepted); the error reads «رقم الموبايل 8 أرقام ويبدأ بـ 4 أو 5 أو 6 أو 9»

**Policies** (formal Arabic on the page):
- A personalised order is final once the customer approves the design. Before approval it can be cancelled for a full refund to the original method within 7 working days.
- The customer checks the spelling on the proof.
- If the pieces differ from the approved proof, arrive damaged or arrive short, we reprint or refund those pieces. The customer must report it within 48 h of delivery, with photos.
- We add **2 free spare pieces for every 50** to cover breakage.
- Printed colours may vary slightly from the screen.
- Edible items list their allergens (nuts, milk, gluten) and a best-before date.
- A failed delivery is rescheduled for the zone fee.
- Corporate quotes are valid for 7 days.
- The site has a CR slot «(نموذج)» and a privacy page.

## 9. Content plan

**Collections (5, 28 products):**
- قرقيعان 6
- مواليد 7
- أعراس وملچة 6
- تخرج 4
- شركات 5

Prices are per piece at 25+ / 50+ / 100+ / 200+.

| Item (AR · EN) | Occasion | Tiers (د.ك) | Lead |
|---|---|---|---|
| كيس قرقيعان قماش بالاسم، محشي حلاو وبيذان · Named cloth Gergean bag, filled | قرقيعان | 1.250 / 1.150 / 1.050 / 0.950 | fixed date |
| علبة قرقيعان شفافة بشريطة وتاغ اسم · Clear Gergean tub, ribbon and name tag | قرقيعان | 0.650 / 0.600 / 0.550 / 0.500 | fixed date |
| علبة شوكولاتة صغيرة بتاغ اسم المولود ووزنه · Mini chocolate box, baby's name and weight tag | مواليد | 0.550 / 0.500 / 0.450 / 0.400 | 10 d |
| شمعة بجرّة زجاج وغطاء خشب محفور · Glass-jar candle, engraved wooden lid | مواليد | 1.750 / 1.600 / 1.450 / 1.300 | 14 d |
| علبة ملبّس لوز بغطاء أكريليك محفور بالأسماء · Sugared almonds, engraved acrylic lid | أعراس وملچة | 1.500 / 1.350 / 1.200 / 1.100 | 14 d |
| قارورة ماي ورد 30 مل بتاغ مذهّب · 30 ml rose-water bottle, gold-foil tag | أعراس وملچة | 1.100 / 1.000 / 0.900 / 0.800 | 10 d |
| كوب تخرج مطبوع «خريجة 2027» مع شوكولاتة · Printed graduation mug with chocolates | تخرج | 1.950 / 1.800 / 1.650 / 1.500 | 10 d |
| دفتر كرافت A6 بشعار الشركة مع قلم · Kraft A6 notebook and pen, company logo | شركات | 2.750 / 2.500 / 2.250 / 2.000 | 14 d |

**Gallery (10):**
1. A Gergean table from above, with named cloth bags in rows.
2. Newborn chocolate boxes fanned on ivory linen.
3. A macro of an engraved acrylic lid with Arabic names.
4. Open almond boxes with foil tags.
5. Graduation mugs and tassels as a flat-lay.
6. A stack of kraft notebooks with debossed logos.
7. Hands tying rosewood ribbon at the studio table.
8. A fan of printed name tags.
9. A tray of 100 pieces wrapped for delivery.
10. Candle jars with wooden lids in window light.

**FAQ:**
1. شنو أقل كمية أقدر أطلبها؟ The answer: 25 حبة, then steps of 5.
2. چم يوم تحتاجون قبل المناسبة؟ The answer: 10 days, 14 for engraving.
3. أقدر أشوف التصميم قبل الطباعة؟
4. توصلون لكل مناطق الكويت؟ وچم التوصيل؟
5. أقدر أغيّر الاسم أو ألغي الطلب بعد ما أدفع؟
6. عندكم أسعار للشركات والكميات الكبيرة؟

**Reviews** (4, each labelled «مراجعة توضيحية»):
- **أم فهد، السلوى:** 150 Gergean bags for her children's classes and the neighbours' diwaniya, at 1.050 each.
- **نوف، الجابرية:** 100 newborn boxes, with the proof approved on WhatsApp within minutes.
- **دلال، a party planner in مشرف:** 250 almond boxes for a ملچة, at the 200+ tier.
- **An HR coordinator at an investment company in شرق:** 300 notebooks for a National Day staff event. Her quote came back the next morning.

## 10. Voice

| Use | Arabic (Kuwaiti) | English |
|---|---|---|
| Hero H1 | توزيعاتج بالاسم، وكل ما زدتي الكمية نزل سعر الحبّة | Favours with your name on them. The more you order, the less each piece costs. |
| Subline | هلا والله! من 25 حبة لكل مناسبة: قرقيعان، مواليد، أعراس وملچة، تخرج. اكتبي الاسم والتاريخ، ونطرش لج التصميم على الواتساب قبل لا نطبع. | Welcome! From 25 pieces for every occasion: Gergean, newborns, weddings, melchas and graduations. Type the name and date, and we'll WhatsApp you the design before we print. |
| WhatsApp CTA | چم حبة تبين؟ كلمينا واتساب | How many pieces do you need? Message us on WhatsApp. |
| Ladder nudge | زيدي 15 حبة ويصير سعر الحبة 0.600 د.ك | Add 15 more and each piece drops to KWD 0.600. |
| Proof promise | ما نطبع شي قبل ما تعتمدين التصميم | We print nothing until you approve the design. |
| Corporate band (formal-neutral) | للشركات والجهات: أرسلوا الكمية وتاريخ الفعالية والشعار، ويصلكم عرض السعر خلال 24 ساعة. | For companies and organisations: send the quantity, event date and logo, and your quote arrives within 24 hours. |
| Policy (formal-neutral) | تُعدّ الطلبات المخصّصة نهائية بعد اعتماد العميل للتصميم، ولا يمكن إلغاؤها أو استرجاعها، إلا إذا اختلفت القطع المستلمة عن التصميم المعتمد أو وصلت تالفة. | Personalised orders are final once the customer approves the design. They can't be cancelled or refunded unless the pieces differ from the approved design or arrive damaged. |

## 11. Remove before finishing

**The ribbon swash on the header wordmark.** At 390px the header wordmark is about 28px tall. The swash turns into a squiggle there, and it pushes the lockup into the cart and WhatsApp buttons. The bow mark already says "favour". Keep the swash in `logo.svg`, the footer lockup and the OG image, and use the plain wordmark in the header. Compare header screenshots with and without it; if the brand still reads without it, delete it.

## Open questions

1. **Confirm the rename** Lamar → Buqsha. WebSearch was exhausted, so run `"بقشة" توزيعات`, `"بقشة" الكويت`, `buqsha OR bugsha instagram kuwait` and a lookup of who owns `buqsha.com` before scaffolding.
2. **Three-way name clash in the set:** 06, 08 and my first pick for 12 all landed on نِثار independently. 12 now uses بقشة. نثار literally *is* the wedding favour, so if 06 and 08 both need new names anyway, 12 could take نثار back. The rest of this plan works with either name, apart from the wordmark detail.
3. If the rename is accepted, `00-distinctness-matrix.md` §1 (rename table, row 12, and the لمّة note under 13) and `architecture.md` §4.5 need the new name.
4. **Engine additions this plan assumes:**
   - `tierScope: "product"`
   - `date` option `fixedDates` (for Gergean)
   - one event date per order
   - a proof-approval status in `/owner/`
   - an owner-issued payment link that turns a corporate quote into an order (MyFatoorah invoice link through `createPaymentSession`)
5. **Font weights changed from the matrix,** based on the stem measurements: Latin display Comfortaa **700** (was 600) and Latin body Manrope **500/700** (was 400/600). Please confirm.
