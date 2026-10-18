# 03 · كُنار · Kunar: design plan

Step 1 ("Plan first") of `arabic-websites-master-prompt.md`. Written 2026-09-23. The slug stays `03-dar-al-sidra`, but the brand is renamed (see Name check). Fonts come from `docs/research/fonts-and-logo-pipeline.md`. The identity is allocated in `00-distinctness-matrix.md`, row 03.

## Name check

"Sidra" is already a crowded brand word in the Gulf abaya niche, so the suggested name had to go.

| Searched | Found | Verdict |
|---|---|---|
| `"Dar Al Sidra" fabrics abaya Bahrain` | No exact match. There is an "Atelier Sidra" boutique and a "Sidra Abaya" product (UAE) | Warning sign |
| `"دار السدرة" أقمشة عبايات` | **عبايات سدرة · SIDRA ABAYA**, a Saudi e-store selling ready abayas at 399–490 SAR ([sidra-abaya.com](https://sidra-abaya.com/)). **دار سِدرة**, returned for the same abaya query ([dar-sadr-a.com](https://dar-sadr-a.com/), which gave a 403 when fetched). **السدرة** as a fabric line at a Saudi fabric house ([taqitex.com](https://taqitex.com/%D8%A7%D9%84%D8%B3%D8%AF%D8%B1%D8%A9/p735176826)) | **Collision: same niche, same region** |
| `"Dar Al Sidra" OR "Dar Alsidra" instagram abaya…` | **AL SIDRA LUXURY ABAYA**, Dubai ([alsidraabaya.com](https://alsidraabaya.com/)); AL Sidra Hijab, Pune | Collision (GCC) |
| `"دار السدرة" البحرين` | مطعم ومقهى السدرة, a Bahraini restaurant ([bahrain.com](https://www.bahrain.com/ar/enjoy-a-bahraini-evening-at-al-sedra-restaurant-and-cafe)) | Different niche, but the same word in the same country |
| **New name:** `"كنار" أقمشة OR عبايات البحرين`; `"Kunar" OR "Knar" OR "Kanar" abaya OR fabrics OR boutique Bahrain/Kuwait/Saudi`; `متجر "كنار" … عبايات OR أقمشة OR شيلات` | Nothing trading as كنار in fabrics or abayas. The nearest hit is **متجر كنان للعبايات** (Saudi, [kinan_ksa](https://www.pinterest.com/kinan_ksa/)), which is a different word | **Clear** (see open questions) |

**كُنار (Kunar)** is the Gulf word for the fruit of the sidr tree, and people also say شجرة الكنار for the tree itself (*Ziziphus spina-christi*). It keeps the original story: the tree that shades Bahraini courtyards and souq corners ([example usage](https://www.youtube.com/watch?v=Q-x93hDEnY0), [KUNA](https://www.kuna.net.kw/ArticleDetails.aspx?id=2597090&language=en)). The sidr-green palette and the sidr-leaf mark stay. The rename also drops a second Bahraini "Dar…" brand, which would have sat next to 06 Dar Al Cacao.

## Identity

| | |
|---|---|
| Name | **كُنار للأقمشة والعبايات** · **KUNAR, FABRICS & ABAYAS** |
| Positioning (AR) | قماش المنامة أونلاين: أكثر من ١٥٠ كريب وجورجيت وشيلة، فلتري بالوزن واللون واستلمي من أقرب فرع. |
| Positioning (EN) | Manama's fabric house online: 150+ crepes, georgettes and shaylas you can filter by weight and colour, then collect from your nearest branch. |
| Audience | Bahraini women and abaya tailors who buy abaya fabric by the yard (crepe, nida, georgette, chiffon, silk), shaylas and ready abayas. They check stock before driving to the souq |
| Preset / tier | commerce · `full` (cart, pick-up or delivery checkout, stock per branch, orders dashboard) |
| Place | Branch 1: Manama, Bab Al Bahrain souq (fabric lane). Branch 2: Isa Town, the popular market. BHD (3 decimals) · `Asia/Bahrain` · numbering `arab` |
| Dialect | Bahraini, in a practical merchant voice with feminine address (ـج forms: لج، قماشج). The tailor section uses neutral address. Policies are formal-neutral |

## Palette (S structure: limestone split by sidr-green bands)

| Token | Hex | Share | Use |
|---|---|---|---|
| `bg` limestone | `#F4F4EE` | 50% | Page ground. It stays neutral so fabric colour reads true |
| `surface` | `#FFFFFB` | 15% | Cards, spec tables, inputs |
| `sunken` | `#E9EAE2` | 5% | Sticky facet bar, table headers, the photo card behind the swatch grid |
| `deep` band | `#123530` | 16% | Header, branch console, section signage bands, footer |
| `ink` | `#17221F` | 7% | Text, prices, the 2px ring on a selected swatch |
| `muted` | `#545E5A` | 3% | Specs, secondary text, **input borders** |
| `accent` sidr green | `#1A4A44` | 3% | Links, primary button fill, selected facet text. Hover is `deep` |
| `on-deep` | `#F4F4EE` | on bands | Type on bands (same value as `bg`) |
| `on-deep-muted` | `#A9BDB6` | on bands | Hours and secondary lines on bands |
| `line` brass | `#B08D57` | <1% | **1px decorative hairline only**: band top edges and logo rules. Never text, never a control border |
| `rule` | `#D8DBD2` | <1% | Row rules in tables. Rows are also separated by 12px padding, so the rule is never the only divider |
| `error` | `#9E2F22` | functional | Validation text and icon, always with a written reason |

"Open" and "closed" never rely on colour. Open is a filled limestone square plus the words «مفتوح الآن». Closed is a hollow square plus «مسكّر · يفتح ٤:٠٠ م».

**Contrast (WCAG 2.x, computed in node):**

| Pair | Ratio | Needs |
|---|---|---|
| ink / bg · surface · sunken | 14.80 · 16.30 · 13.49 | 4.5 ✓ |
| muted / bg · surface · sunken | 6.09 · 6.70 · 5.55 | 4.5 ✓ |
| accent / bg · surface · sunken (links, selected) | 9.03 · 9.94 · 8.23 | 4.5 ✓ |
| surface text on accent button | 9.94 | 4.5 ✓ |
| on-deep / deep (band text, Qahiri signage) | 12.06 | 4.5 ✓ |
| surface / deep | 13.28 | 4.5 ✓ |
| on-deep-muted / deep · accent | 6.75 · 5.05 | 4.5 ✓ |
| error / bg · surface | 6.60 · 7.27 | 4.5 ✓ |
| muted as input border / surface | 6.70 | 3.0 non-text ✓ |
| focus ring: ink on light · limestone on deep | 14.80 · 12.06 | 3.0 ✓ |
| brass / bg · deep | 2.80 · 4.31 | decorative only (no requirement) |
| rule / bg | 1.27 | decorative only |

## Type

| Role | Arabic | Latin | Notes |
|---|---|---|---|
| Wordmark and section signs | **Qahiri 400 with `ss01`** (manuscript Kufic, 7 KB) | **Cinzel 600–700** (inscriptional caps) | Words only. Qahiri lacks ٫ ٬ and its Latin is unicase Kufic, so no numbers or Latin ever go in Qahiri |
| H1–H3, body, UI, prices, specs | **Fustat 400 / 600** (VF 200–800, 15 KB Arabic subset) | Fustat's own Latin (Laura Garcia Mut) | Prices at 600. Turn on `tnum` for spec columns if Fustat has it (check when scaffolding); otherwise align the numeric columns to the end edge |

**Scale** (px, mobile → desktop; Arabic line-height 1.7 for body and 1.3 for headings, Latin 1.5 / 1.2):
sign (Qahiri) 30 → 44 · h1 28 → 40 · h2 22 → 28 · h3 18 → 20 · body 16 → 17 · spec/small 14 → 14 · card price 17 → 18 · PDP price 24 → 30 · Latin sign (Cinzel caps, +0.12em tracking, `:lang(en)` only) at 1.07× the Arabic size.

**Why this pairing:** Qahiri is angular and horizontal, like a painted souq signboard. Cinzel is the Latin equivalent of an inscription. The alef-to-cap ratio is 0.747 / 0.700, so Latin runs use `--latin-scale: 1.07`. Cinzel's stem is much lighter (0.045 vs 0.107), so the Latin sits under the Arabic at 700 weight and about half its size, as a deliberate small-caps subtitle rather than an equal partner. Fustat is a Kufi-derived sans, so body and display share a skeleton. Its own Latin matches its stems exactly (0.075 / 0.075), with Latin scale 1.08 for mixed runs. Font stacks put the Latin font first, and Arabic never gets letter-spacing.

**Numerals:** Arabic pages use Arabic-Indic digits via `Intl` `ar-BH` (١٢٫٥٠٠ د.ب). English pages use Western digits (BHD 12.500). Phone numbers and SKU codes are always Western digits inside `<bdi dir="ltr">`. Specs read «١٩٠ غ/م² · عرض ١٤٧ سم (٥٨ إنش)».

## Logo

- **Arabic wordmark:** «كنار» in Qahiri `ss01`, outlined to SVG paths through the harfbuzzjs pipeline. The long horizontal ك–ن baseline is stretched with kashida so the word sits wide, like a shop sign.
- **Latin lockup:** KUNAR in Cinzel 700 caps, tracked +0.18em, centred under the Arabic between two 1px brass hairlines. Below that sits a Fustat 400 line: «أقمشة وعبايات · FABRICS & ABAYAS».
- **Mark (favicon and avatar):** a three-veined sidr leaf drawn on a 7×7 square-Kufic grid (orthogonal steps, with veins as negative channels), inside a square whose edges are pinked (zigzag). At 16px the pinking drops to 3 teeth per side and the veins to one.
- **Clear space:** 1 k on every side, where k is the height of the Qahiri ك in the lockup. The hairlines count as part of the lockup.
- **Minimum size:** full lockup 112px wide (30 mm in print). Arabic-only wordmark 64px. Mark 16px.
- **Variants:** `logo-light` is ink on limestone. `logo-dark` is limestone on `deep` with brass hairlines.

## Hero: the branch console

**390px:**
1. Demo banner.
2. `deep` header band (56px): mark and «كنار» on the inline-start side; WhatsApp, cart and ع/EN on the inline-end side.
3. A limestone block:
   - One-line H1.
   - A full-width 56px search field: «دوري: كريب أسود، ندى ياباني، شيلة شيفون…».
   - A horizontal rail of six **pinked texture chips** (كريب، ندى، جورجيت، شيفون، حرير، شيلات), 64px squares, each labelled with its count.
4. The **branch console band** (`deep`, brass hairline on top), which starts about 430px down and is fully visible on an 844px screen. It holds two rows. Each row has:
   - a 64px storefront thumbnail
   - the status square plus text
   - the branch name
   - today's two shifts
   - «استلام اليوم لين ٧:٣٠ م»
   - two 44px buttons: الخريطة and اتصلي

**1440px (12-column grid, 1320px max):**
- **Inline-start 7 columns on limestone:**
  - kicker «سوق المنامة · مدينة عيسى»
  - H1 at 40px
  - a 64px search field
  - a row of 6 texture chips at 72px
  - a row of 12 flat colour chips at 40px (colour families)
  - a three-way weight toggle: خفيف / متوسط / ثقيل

  Submitting any of these opens `/catalogue?…` with those facets already set.
- **Inline-end 5 columns:** the `deep` console, bleeding to the viewport edge. It has:
  - a 4:3 blue-hour photo of the Bab Al Bahrain storefront
  - two branch rows
  - the line «نقصّ القماش ونجهّزه خلال ساعة ونص»

**Homepage rhythm:** each major section opens with a full-width green signage band carrying its name in Qahiri.
1. Header band
2. Console hero
3. **Shop by fabric (تسوقي حسب الخامة):** six large pinked texture tiles with counts and «من ١٫٦٥٠ د.ب/ياردة»
4. Band «وصل هالأسبوع»: an 8-item grid (2 columns on phone, 4 on desktop). Each card has:
   - a 1:1 overhead photo
   - the name
   - a spec row «١٩٠ غ · ١٤٧ سم · مطفي»
   - the price per yard
   - availability for each branch, as text with a square
5. Band «حسب الوزن»: a three-row table (weight, feel, season, count) that links into the facets
6. **Colour card:** 24 Korean-crepe colours as pinked chips, each marked with which branch has stock
7. Band «للخياطين»: a bolt-price table and a WhatsApp quote button
8. Ready abayas strip (4 pieces)
9. Band «فروعنا»: both branches, each with a static map image linking out, a weekly hours table and a parking note
10. Illustrative reviews set as a quoted list
11. FAQ accordion
12. Footer (`deep`): CR number slot, policies, payment marks, WhatsApp

**Catalogue:** a sticky facet bar. On phones it holds the fibre chip rail plus a «فلترة (٣)» button that opens a bottom sheet. On desktop it becomes a 3-column side rail next to a 4-across grid. Results replace each other with a 120ms opacity swap.

**Signature: pinked swatch chips.** These are real fabric-texture squares clipped with a zigzag `clip-path`, and they have three jobs:
- facets (`role="checkbox"`, `aria-pressed`)
- the colour picker on product pages
- category entry points

Each fibre has one grayscale texture tile of about 4 KB. Colour chips tint that tile with `background-blend-mode: multiply`, so 24 colours cost no extra images. The selected state is a 2px ink ring plus a ✓ glyph, and every chip has a visible text label.

**Shape:** 2px radius; pinked edges on swatches only; table rules; brass 1px hairlines on band tops.

**Motion:** none is decorative. Filter results swap with a 120ms opacity change, and the facet bar is sticky. Under `prefers-reduced-motion` the swap is instant.

**Photography:**
- **Fabric:** flat, even, colour-accurate 5000K light; 1:1 overhead shots on a neutral 18% grey card, with one macro of the weave per family.
- **Drapes and abayas:** 4:5, on a dress form against the same grey.
- **Branches:** exteriors at blue hour, under warm souq lights.
- **Grade:** the only warm grade is on branch exteriors; fabric is never graded.

## Niche features → engine and config

| Brief feature | Module / config |
|---|---|
| 150+ catalogue | `commerce.catalog`: a `family` entry holds shared specs (fibre, `gsm`, `widthCm`, finish, opacity, origin, `boltYards`), and each `sku` is one colour with a `colourFamily` and a hex for its chip. **156 SKUs across 36 families** |
| Faceted filtering | A facet index JSON built at build time (about 8 KB gzipped) and a vanilla-TS island (under 8 KB). Facets: fibre, colour family (12), weight class (خفيف <120, متوسط 120–180, ثقيل >180 g/m²), finish, opacity, origin, width, price, branch stock, «استلام اليوم». State lives in the URL (`?fibre=crepe&colour=navy&branch=isa`) so filtered links can be shared on WhatsApp |
| Sold by the yard | `unit: "yard"`, `qtyStep: 0.5`, `minQty: 1`, stored as integer `qtyHalfYards`. The CMS only accepts per-yard prices in multiples of 10 fils, so a half yard always comes to whole fils (3.250 × 2.5 = 8.125). JSON-LD `UnitPriceSpecification` with `unitCode: "YRD"` |
| Tailor pricing | `commerce.tieredPricing` per SKU: 1–9 yards list price, 10+ yards −5%, full bolt −12%. It is shown as three columns in the spec table (ياردة / ١٠+ / طاقة), not as a ladder |
| Two branch pages | `branches` collection: address, geo, map URL, phone, WhatsApp, weekly split shifts, holiday overrides, `pickupCutoffMin`, `prepMin: 90`. A live open/closed island runs in `Asia/Bahrain`, with the static weekly table as the no-JS fallback. JSON-LD: one `Store` per branch with `openingHoursSpecification` |
| Pick-up at checkout | `fulfilment: ["pickup","delivery"]`. Ready time = max(now, next shift open) + 90 min, and it must fall no later than 30 min before closing; otherwise it rolls to the next shift. A branch without enough stock is disabled with the reason: «متوفر ١٫٥ ياردة بس في مدينة عيسى» |
| Stock per branch | `inventory(sku, branch, halfYards)`: Supabase in the full tier, static JSON in the demo. «كمية محدودة» shows under 5 yards |
| Payments | `provider: "mock"`, with `tap` for live (BenefitPay, cards, Apple Pay) and `credimax` as the alternative. `payAtBranch: true` reuses the CashOnDelivery adapter in pick-up mode |
| Swatches | A «عيّنة» add-on: up to 5 free at the branch, or a 5-piece pack delivered for 1.000 BHD |
| Orders dashboard | Statuses: جديد → يتم القص → جاهز للاستلام → تم الاستلام / أُلغي. Paid orders are held 3 days; unpaid pay-at-branch holds lapse after 48 h |
| WhatsApp | A share link on every product (name, colour, yards, URL), a «احجزي لي» message that includes the branch, and a tailor quote message |

## Operations

**Hours:**

| Branch | Sat–Thu | Fri | Same-day pick-up: order by | Ramadan |
|---|---|---|---|---|
| Bab Al Bahrain | 09:00–13:00 · 16:00–21:30 | 16:00–21:30 | 19:30 | 10:00–14:00 · 20:00–**00:30** (crosses midnight: stored as close < open, and it counts as the previous day's shift) |
| Isa Town | 09:30–13:00 · 16:30–22:00 | closed | 20:00 | 10:00–14:00 · 20:00–**00:30** |

**Delivery** (Bahrain only, by courier, Saturday to Thursday):
- Orders placed before 14:00 arrive the next day between 10:00 and 20:00.
- Fees: Capital 1.500 · Muharraq 1.500 · Northern 2.000 · Southern 2.000 BHD.
- Free at 25.000 BHD and above.
- Swatch pack: 1.000 BHD flat.

**Policies:**
- Cut fabric can't be returned or exchanged unless it has a weave defect reported within 3 days with a photo.
- Ready abayas and shaylas that are unworn and tagged can be exchanged within 7 days. Refunds go back to the original method within 14 days.
- Screen colours vary, so customers should request a swatch.
- Cuts include a 2 cm allowance.
- The site has a CR slot and a privacy page.

## Content plan

**Collections (6, 156 SKUs):** كريب 48 · ندى 28 · جورجيت وشيفون 38 · حرير وساتان 12 · شيلات 20 · عبايات جاهزة 10.

| Item (AR · EN) | Spec | Price |
|---|---|---|
| كريب كوري مطفي · أسود فاحم · Korean matte crepe, jet | 190 g/m² · 147 cm | ٣٫٢٥٠ د.ب/ياردة · طاقة ٥٠ ياردة ١٤٣٫٠٠٠ |
| ندى ياباني فاخر · كحلي ليلي · Japanese nida, night navy | 160 g/m² · 150 cm | ٤٫٨٠٠ |
| كريب حريري ثقيل · رمادي فحمي · Heavy silky crepe, charcoal | 230 g/m² · 147 cm | ٥٫٤٠٠ |
| جورجيت ناعم · بيج رملي · Soft georgette, sand | 120 g/m² · 150 cm | ٢٫٤٠٠ |
| شيفون كوري للشيلات · وردي ترابي · Korean chiffon, dusty rose | 70 g/m² · 150 cm | ١٫٦٥٠ |
| كريب دي شين حرير طبيعي ١٦ مومي · عاجي · Silk crêpe de chine, ivory | 68 g/m² · 114 cm | ١٣٫٩٠٠ |
| شيلة جورجيت بحافة رولو · أسود · Georgette shayla, rolled hem | 180×70 cm | ٢٫٧٥٠ للحبة |
| عباية كريب ندى بكم واسع · أسود · Nida-crepe abaya, wide sleeve | lengths 52–60 | ٢٨٫٠٠٠ |

**Gallery (10):**
1. crepe bolts shelved by colour at Bab Al Bahrain
2. a macro of the nida weave
3. georgette held to the light to show its opacity
4. a folded stack of chiffon shaylas
5. the cutting table with pinking shears
6. the 24-colour crepe card
7. a tailor chalk-marking black crepe
8. a ready abaya on a dress form (4:5)
9. the Bab Al Bahrain storefront at blue hour
10. the Isa Town interior

**FAQ:**
1. شلون أعرف القماش متوفر في أي فرع؟
2. كم ياردة أحتاج للعباية؟ The answer is a table for 147 cm fabric: length ٥٢–٥٤ → ٣ ياردات · ٥٦–٥٨ → ٣٫٥ · ٦٠ → ٤, plus ٠٫٥ for a wide sleeve.
3. أقدر آخذ عيّنة قبل لا أشتري؟
4. إذا طلبت أونلاين متى أستلم من الفرع؟
5. تبدلون القماش بعد القص؟
6. عندكم سعر خاص للخياطين والطاقة الكاملة؟

**Reviews** (4, labelled «مراجعات توضيحية»):
- a tailor from Sitra who buys full bolts
- an Isa Town university student buying chiffon shaylas
- a Muharraq mother collecting Eid fabric in Manama
- a Riffa boutique owner ordering swatch packs

## Voice

| Use | Arabic (Bahraini) | English |
|---|---|---|
| Hero H1 | اختاري قماشج من البيت، واستلميه من أقرب فرع | Choose your fabric at home. Collect it at the nearest branch. |
| Subline | أكثر من ١٥٠ كريب وندى وجورجيت وشيلة. فلتري بالوزن واللون، وشوفي الكمية في كل فرع قبل لا تطلعين. | 150+ crepes, nidas, georgettes and shaylas. Filter by weight and colour, and see each branch's stock before you head out. |
| WhatsApp CTA | تبين نحجز لج اللون؟ كلمينا واتساب | Want us to hold the colour? Message us on WhatsApp. |
| Tailors | للخياطين: سعر الطاقة مكتوب جنب كل قماش | Tailors: the full-bolt price is listed next to every fabric. |
| Policy (formal-neutral) | لا تُستبدل الأقمشة ولا تُسترجع بعد قصّها، إلا إذا ظهر فيها عيب في النسيج وأُبلغ عنه خلال ثلاثة أيام من الاستلام مع صورة واضحة. | Cut fabric can't be exchanged or refunded unless it has a weave defect, reported within three days of collection with a clear photo. |

## Remove before finishing

**The pinked zigzag on the bottom edges of the green bands.** Pinking belongs to the swatches. Repeating it on every band blurs the signature and adds noise to a dense catalogue. Keep the band edges straight and let the brass hairline do the work.
