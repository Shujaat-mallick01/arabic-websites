# 06 · نِثار · Nithar: design plan

Step 1 ("Plan first"). Written 2026-09-23. The folder slug stays `06-dar-al-cacao`, since the matrix rule is that slugs survive renames. Allocation source: `00-distinctness-matrix.md`, row 06. Font facts are from `docs/research/fonts-and-logo-pipeline.md`, re-measured in this session where marked **[V]**.

---

## 0. Name check: renamed

**Searched** (2026-09-23):
- WebSearch: `"Dar Al Cacao" chocolate`, `"دار الكاكاو" شوكولاتة`, `Dar Cacao chocolate Bahrain instagram`, `"مصنع دار الكاكاو"`, `"دار الكاكاو" البحرين OR الكويت OR السعودية OR الإمارات`, `"darcacao" OR "dar_cacao" OR "daralcacao"`
- Direct look at `@cacao.bh`

**Found:**
- **cacao house | دار الكاكاو** (`@cacao_house_sa`, also on X and TikTok; listed on horecaway.com as «مصنع دار الكاكاو»): a Saudi chocolate maker that manufactures, supplies and sells chocolate under **exactly this Arabic name**. It is in the same niche and in the GCC, so it counts as a **collision**.
- **CACAO** (`@cacao.bh`, Manama): a Bahraini chocolate and gift-box seller that calls itself a "House of Chocolate". That is the English gloss of دار الكاكاو, in the same niche and the same country.
- Not a conflict: DAR Chocolate (Colorado, bean-to-bar) and The Cacao Factory مصنع الكاكاو (Kuwait) are in the niche but have different names.

**Verdict:** renamed. The rename also stops two Bahraini sites (03 دار السدرة and 06) both starting with «دار».

**Chosen: نِثار · Nithar.** Lisan al-Arab defines النِّثار as "what is scattered by hand, like walnuts, almonds and sugar". It is the sweets thrown over a bride and shared out at a celebration. Today that job is done by the chocolate tray passed round at a ملچة, a newborn visit or a graduation. The name is short (4 letters), easy to say in Latin, and its ث gives the logo its device (§4).

**Re-check status:** the session's WebSearch cap (200 of 200) ran out after three checks on the new name, so the re-check is only partial.
- WebSearch `"Nithar" chocolate` returned only Nhiär (a US vegan brand, different name) and a YouTube channel.
- WebSearch `"نثار" شوكولاتة البحرين انستقرام` returned no نثار shop.
- WebSearch `"Nithar" … sweets gifts` (GCC) returned nothing in the niche.
- Instagram `@nithar` is a personal Thai account with 41 followers and nothing for sale.
- DNS: `nithar.bh`, `nithar.com.bh`, `nitharchocolate.com`, `nithar.shop` and `nitharbh.com` have no records. `nithar.com` answers only with a bare 404 (Kestrel).
- A risk to watch: «نثار الشوكولاتة» is also the Arabic culinary term for chocolate sprinkles. The positioning line leads with the wedding meaning to counter it.
- **Re-run the Arabic, Latin and Instagram search before building** (open questions).

Sources: [@cacao_house_sa](https://www.instagram.com/cacao_house_sa/?hl=en) · [X @cacao_house_sa](https://x.com/cacao_house_sa) · [horecaway: مصنع دار الكاكاو](https://horecaway.com/viewcompany.jsp?id=3608%3F) · [@cacao.bh](https://www.instagram.com/cacao.bh/?hl=en) · [The Cacao Factory Kuwait](https://www.facebook.com/cacaofactory.kw/) · [DAR Chocolate](https://www.darchocolate.art/) · [Nhiär](https://nhiar.com/) · [maajim: نثار](https://www.maajim.com/dictionary/%D9%86%D8%AB%D8%A7%D8%B1)

## 1. Identity

| | |
|---|---|
| Name | **نِثار** · **Nithar** · lockup `نِثار / NITHAR · CHOCOLATIER` |
| Meaning | The sweets scattered at a wedding and shared at a celebration (classical النِّثار) |
| Positioning (AR) | صواني وبوكسات شوكولاتة بحرينية، أساميكم مطبوعة على كل حبّة، وتوصلكم باليوم والساعة اللي تختارونها. |
| Positioning (EN) | Bahraini chocolate trays and boxes with your names printed on every piece, delivered on the day and time you choose. |
| Audience | Bahraini families and companies ordering trays and boxes for a ملچة or wedding, a newborn visit, graduations, القرقاعون and Eid. The wrappers are printed with names or dates, and the order is delivered to a set time, often to a hall. The person who orders is usually the host (mothers, sisters, the groom's family) or an office HR person. They order on a phone, 2 to 10 days ahead |
| Preset / tier | commerce · `full` (cart, checkout, MockProvider, slots with capacity, orders dashboard) |
| Place | Saar, Northern Governorate, Bahrain · BHD (3 decimals, minor unit = fils) · `Asia/Bahrain` (UTC+3, no DST) · `ar-BH`, numbering `arab` |
| Dialect | Bahraini, warm and celebratory (مبروك، حيّاكم، تبون، ويّاكم، طرّش). Plural unisex address (اختاروا، اطلبوا), because families and companies both order. Formal-neutral Arabic for policies |

## 2. Palette (D structure, warm)

| Token | Hex | Usage | Where |
|---|---|---|---|
| `bg` cacao | `#2A1B15` | 60% | page ground |
| `surface` | `#3A271F` | 18% | builder panels, product tiles' text area, inputs, table rows |
| `deep` | `#1B110C` | 8% | header, footer, sticky order bar, corporate band, tray lining behind the hero grid |
| `ink` cocoa butter | `#F4E9DB` | 8% | all text; also the default printed band |
| `muted` | `#C5B19E` | 3% | captions, piece counts, lead-time line, **input and chip borders** |
| `accent` pistachio | `#AEC274` | 2% | primary CTA fill, selected size, band or slot, focus ring, active step number |
| `line` | `#57402F` | 1% | 1px cocoa gutters inside grid modules and dividers only, **never input borders** |
| `error` | `#F0A08A` | functional | validation text and icon only |

`on-accent` = `deep` `#1B110C`. The WhatsApp button is **not** green: it is a 1px `muted` outline with an `ink` glyph, so pistachio stays the single accent.

**Wrapper-preview content colours.** These are used only inside the printed-wrapper SVG, never as UI tokens:
- **Foil:** silver `#C9C9C4`. It is the only foil sold. Matte gold was dropped because the set keeps gold as a hairline only.
- **Bands:** عاجي `#F4E9DB` · وردي `#EBC9CC` · سماوي `#C6DAE8` · فستقي `#D3DDAE`, all printed in `#2A1B15`. كاكاو `#3A271F` is printed in `#F4E9DB`.
- **Logo only:** on ivory grounds, the pistachio square in the light logo becomes `#6F8238`.

**Contrast (WCAG 2.x, computed with node):**

| Pair | Ratio | Needs | Use |
|---|---|---|---|
| ink / bg · ink / surface · ink / deep | 13.84 · 11.76 · 15.48 | 4.5 | body, headings, footer |
| muted / bg · muted / surface · muted / deep | 8.02 · 6.82 · 8.97 | 4.5 | captions, lead-time line |
| accent / bg · accent / surface · accent / deep | 8.51 · 7.23 · 9.51 | 4.5 | selected labels, links, "available" slot text |
| deep on accent (`on-accent`) | 9.51 | 4.5 | CTA label «اختاروا الصينية» |
| error / bg · error / surface | 7.98 · 6.78 | 4.5 | validation messages |
| muted / surface (input border) · accent / bg (2px focus ring) | 6.82 · 8.51 | 3 | non-text |
| print `#2A1B15` on bands ivory · rose · sky · pistachio | 13.84 · 10.87 · 11.53 · 11.63 | 4.5 | the customer's typed text |
| ivory print on cacao band | 11.76 | 4.5 | corporate wrappers |
| silver foil / bg · / surface | 9.98 · 8.48 | 3 | piece outline reads against the page |
| logo pistachio `#6F8238` / ivory | 3.56 | 3 | light-ground logo square |
| line / bg · line / surface | 1.72 · 1.46 | n/a | **decorative gutters only** |
| cocoa foil `#6B4A35` / bg | **2.10** | 3 | **rejected**, so there is no cocoa foil |

## 3. Type

| Role | Arabic | Latin (EN pages, and Latin runs in AR) |
|---|---|---|
| Display (H1 to H3, section and occasion names) | **Amiri 700**, `font-feature-settings: "ss01","ss02"`, **24px minimum** | **Cormorant Garamond 500** at 1.13× the Amiri px; **600 italic** for the wordmark and EN pull lines |
| Body, UI, prices, forms, printed wrapper text | **Mada VF 400/600** | **Karla VF 400/600** at 0.99×, `tabular-nums` for prices |

**Measured [V]** (fontTools 4.60.1 on google/fonts @ `e44c4b0`; Karla's VF has overlapping contours, so stems were read as the union):

| Pair | Arabic alef / body / stem | Latin cap / x / `n` stem | Scale | body ÷ scaled x | Stem at scale |
|---|---|---|---|---|---|
| Amiri 700 ↔ Cormorant 500 | 0.709 / 0.346 / 0.078 | 0.625 / 0.386 / 0.068 | 1.13 | 0.79 | 0.078 ↔ **0.077** (600 would be 0.092, too heavy; 600 italic is 0.081, fine for the wordmark) |
| Mada 400 ↔ Karla 400 | 0.624 / 0.360 / 0.078 | 0.628 / 0.479 / 0.078 | 0.99 | 0.76 | 0.078 ↔ **0.077** |
| Mada 600 ↔ Karla 600 | 0.624 / 0.394 / 0.113 | 0.643 / 0.485 / 0.108 | 0.99 | 0.82 | 0.113 ↔ 0.105 |

**Why this pair works:**
- Amiri is Bulaq naskh and Cormorant is a Garamond display cut. Both are calligraphic, high-contrast and bracketed: a classical confectioner's pair for the headings.
- Mada and Karla are both low-contrast sans faces with near-identical metrics. Mada's own Latin (Source Sans) belongs to site 11, so Karla gives 06 its own EN voice.

**Features [V], from Amiri's `stylisticsets.fea`:**
- `ss01` lowers the dot of a ب-type letter that follows ر or و (for example «وبه»).
- `ss02` gives medial م + final ا a special join (for example «السماء»، «كمان»).
- Neither feature touches «نثار», so the wordmark gets its identity from the ث device instead (§4).
- Mada's Arabic-Indic and Western digits are all 497 units wide, so they are tabular by default.

**Payload [V]:**
- An Amiri Bold subset (Arabic letters, چ گ پ ڤ ی, digits, ٫٬ ، ؛ ؟, ZWNJ/ZWJ/LRM/RLM, and the features `ccmp init medi fina rlig liga locl mark mkmk curs kern ss01 ss02`) comes to **≈45 KB** with brotli. That is an upper bound; WOFF2 is smaller. Both fonts ship as build-time subsets.
- The Mada VF subset is **≈17 KB**. Preload both.
- The Latin files load only through `unicode-range`.
- CI runs the glyph-coverage check over the whole content corpus, including CMS text, so no character falls back to another font mid-word.

**Stacks and rules:**
- Stacks are Latin-first: `"Cormorant Garamond","Amiri",serif` and `"Karla","Mada",sans-serif`.
- Line heights are always explicit, never `normal` (Amiri defaults to 1.76, Mada to 1.30).
- No `letter-spacing` on Arabic. Karla caps labels are tracked +0.14em under `:lang(en)` only.

**Scale (px / line-height)**, mobile 390 → desktop 1440:

| Role | Face | Mobile | Desktop |
|---|---|---|---|
| H1 hero | Amiri 700 | 34 / 1.35 | 64 / 1.25 |
| H2 section | Amiri 700 | 28 / 1.4 | 44 / 1.3 |
| H3 product, step, occasion row | Amiri 700 | 24 / 1.45 | 30 / 1.4 |
| Price | Mada 600 | 18 / 1.3 | 20 / 1.3 |
| Buttons, chips, nav | Mada 600 | 16 / 1.25 | 16 / 1.25 |
| Body | Mada 400 | 17 / 1.75 | 18 / 1.75 |
| Caption, lead-time line | Mada 400 | 15 / 1.6 | 15 / 1.6 |
| Footnote `*` (minimum) | Mada 400 | 14 / 1.6 | 14 / 1.6 |
| Wrapper print line 1 · line 2 | Mada 600 · 400 | 15% · 11% of the piece side, auto-fit down to 10% · 8% | same |

**Numerals:**
- AR pages use `arab` everywhere: `‏٢٤٫٠٠٠ د.ب.‏` [V, from `Intl` `ar-BH`], dates like «الجمعة ٢٥ سبتمبر», piece counts like «٦٤ حبّة · ٨×٨».
- EN pages use `latn`: "BHD 24.000".
- Every price carries `*` and a visually hidden «دينار بحريني».
- Phone numbers stay `+973 …` inside `<bdi dir="ltr">`.
- **The date line on the wrapper** has its own toggle (١٦/١٠/٢٠٢٦ ↔ 16/10/2026), because many Bahraini families print Western digits. It is printed exactly as chosen.
- Hijri appears only on seasonal notes (`islamic-umalqura`, marked «حسب رؤية الهلال»).

## 4. Logo

- **Arabic wordmark:** «نِثار» in Amiri Bold, outlined through the harfbuzzjs + bidi-js pipeline, with the kasra kept.
  - **The ث device:** shape both «نثار» and «نٮار» (U+066E dotless beh, present in Amiri Bold [V]).
  - The difference between the two outlines gives the three dot positions. Each rhombic naskh dot is replaced by a small **rounded square** of equal area, with a corner radius of ⅛ of its side: three chocolate pieces "scattered" over the tooth.
  - The top square is pistachio; the other two are the wordmark colour.
- **Latin line:** "Nithar" in Cormorant Garamond 600 italic, with its cap height equal to the Amiri alef (1.13×). Under it, `CHOCOLATIER · SAAR` in Karla 600 caps, tracked +0.18em, at 0.3 A (A = the alef height of «نثار»).
- **Lockups:**
  - Horizontal (header): Arabic at the start edge, then a 1px `line`-coloured vertical rule, then the Latin.
  - Stacked (footer, OG, packaging): Arabic over Latin.
- **Mark** (`logo-mark.svg`, favicon): a rounded square with a corner radius of ⅛ of its side. It has one inner deboss line inset 10% (the moulded edge of a chocolate) and the same three-square ث triangle in its upper-middle, with the top square in pistachio.
  - This replaces the matrix's "square debossed with د". A ن in a square was avoided because it would echo 02's "ن in a story-card tile".
  - Below 32px the inner line is dropped. At 16px the three squares are 3px each.
- **Colour versions:**
  - `logo-dark.svg`: `ink` on `bg`, pistachio `#AEC274`.
  - `logo-light.svg`: `#2A1B15` on ivory, pistachio `#6F8238`.
  - One-colour versions: all ink.
- **Clear space:** the lockup keeps 0.5 A clear on all sides; the mark keeps 25% of its side.
- **Minimum sizes:** horizontal lockup 140px wide; the Arabic-only wordmark goes down to 72px wide (its alef ≈24px, matching Amiri's floor). Mark 16px. Print: 25 mm.

## 5. Layout

**Hero archetype, an overhead tray with live personalisation.** The first screen is a top-down tray of chocolates. One piece in it is a live wrapper that prints whatever the visitor types.

**How the tray is built.** The hero "photo" is a composed grid, not a single flat photo, because a flipped photo would mirror the printed names in EN:
- A full-bleed, 1:1 top-down photo of an empty dark-walnut tray, lined in `deep`, is the background. It is preloaded as AVIF, ≈25 KB.
- On it sits a CSS grid of square pieces. The grid sets `gap:1px` on a `line`-coloured background, which draws the cocoa gutters exactly.
- Most cells are graded 1:1 photos of unwrapped bonbons (one pistachio-topped).
- Two cells are static printed wrappers with sample names.
- One cell is the **live piece**. Grid columns follow `dir`, so "column 1" is always the column next to the text column, in AR and in EN.

**At 390px:**
1. Demo banner, 40px.
2. Header, 56px, on `deep`: horizontal lockup (start edge); cart with count and menu at the end edge (44×44 each).
3. **Occasion rail** (the entry points), 48px, scrolls horizontally: `الكل · ملچة وعرس · مواليد · تخرّج · قرقاعون · عيد · شركات`. Chips are Mada 600 16px with a 1px `muted` border and a 12px radius, not pills.
4. **Tray:** 390×390, a 3×3 grid of ≈121px cells inside a 12px tray rim.
   - The **live piece is row 3, column 2**, bottom centre.
   - Bottom row on purpose: when the keyboard opens and the page scrolls to the field, the bottom row stays visible above it, so the visitor sees their names print while typing.
5. On `bg`, with a 16px gutter:
   - H1 «أساميكم على كل حبّة» (Amiri 34px, one line).
   - Subline (Mada 17px).
   - Field: label «جرّبوا أساميكم على الحبّة», 52px tall, placeholder «مثلاً: سلمان ونورة», counter «باقي ٧ أحرف».
   - A CTA row: «اختاروا الصينية» (pistachio, full width minus a 52×52 WhatsApp outline button).
   - Lead-time line (muted, 15px): «أقرب توصيل للحبّات المطبوعة: الجمعة ٢٥ سبتمبر من ٤ العصر».
6. Above the fold (≈664px of viewport), the visitor sees the header, the rail, the whole tray and the start of the H1.

**At 1440px:**
- **Header** (72px): lockup at the start edge; `الصواني · البوكسات · حبّات بالعدد · المناسبات · التوصيل · الشركات` next to it. `EN`, WhatsApp and cart sit at the end edge.
- **Occasion rail:** a 52px strip under the header, left unscrolled.
- **Hero split:**
  - The text column takes the start 664px, with 64px of padding.
  - The tray takes a 776×776 box that bleeds off the end edge. It is a 4 × 4 grid of ≈187px cells (776 − 24px rims − 3 gutters, ÷ 4), with a sliver of a fifth column cut off at the edge, so the tray reads as larger than the screen.
  - The **live piece is row 3, column 1**: the start-most column, touching the text column.
  - The field sits on the same row as the live piece, so the eye moves sideways from typing to printing.
  - Text column, top to bottom: eyebrow «شوكولاتة من سار» (Mada 600 15px, muted), H1 (Amiri 64px), subline (Mada 20px), the field with a «سطر · سطرين» toggle, both CTAs, the lead-time line, and «الصواني من ١٤٫٥٠٠ د.ب*».
- The hero is 72 + 52 + 776 = 900px tall, exactly one viewport at 1440×900.

**Homepage rhythm.** Square tray modules alternate with rows, a table and one band, so no card set repeats:
1. Header, occasion rail, and the tray hero.
2. **الصواني والبوكسات**:
   - Mobile: a 2×2 module of 1:1 photo tiles. Each tile has the name, «٦٤ حبّة · ٨×٨» and the price.
   - Desktop: a 3×3 module. Cell 9 is a text cell: «مقاس خاص أو فوق ١٠٠ حبّة؟ حيّاكم واتساب».
3. **كيف يوصلكم**: one sentence, not cards: «١ الصينية ← ٢ نص الغلاف ← ٣ اليوم والساعة». The lead-time rule sits in the line under it, with a link to `/delivery`.
4. **المناسبات**: six list rows. Each row has:
   - a 64px mini piece in that occasion's default band (ملچة · عاجي «سلمان ونورة», مواليد · سماوي/وردي «حيّاكم في زيارة محمد», تخرّج · فستقي «دفعة ٢٠٢٦», قرقاعون · وردي, عيد · عاجي «عساكم من عواده», شركات · كاكاو)
   - the occasion name (Amiri 24px), a suggestion line (sizes, minimum) and an arrow link.
5. **الحشوات**: a 3×2 square module of cross-section photos (6 fillings), each with its name and any surcharge.
6. **من مناسباتكم**: a 3×3 gallery (1px gutters, 12px radius) with a lightbox.
7. **Reviews**: a 2×2 module headed «آراء توضيحية». Each quote sits beside a 64px mini piece carrying that customer's printed text.
8. **التوصيل والمواعيد**: a real `<table>` of zones and fees, the slot times, and the summer note.
9. **FAQ**: six `<details>`.
10. **الشركات**: one band on `deep`. Logo-printed pieces from 300, with «اطلبوا عرض سعر».
11. **Footer** on `deep`: stacked lockup, hours (with the Ramadan note), «سار، المحافظة الشمالية» with a map link, WhatsApp, policy links, a CR slot «يُضاف عند الإطلاق», and the demo credit.

**Other pages:**
- `/trays`, `/boxes`, `/pieces`, `/season`: square grids with size and occasion filters.
- `/p/<slug>`: the order builder (below) and a share link.
- `/cart`, `/checkout`, `/order/<id>`, `/occasions/<id>`, `/delivery`, `/corporate`, `/about` (the Saar kitchen), `/faq`, `/policies/*`, `/admin`.
- **Sticky mobile bar** (64px plus the safe-area inset): «السلة · ٢ · ٢٦٫٧٨٠ د.ب ← الدفع» and a WhatsApp icon.

**Order builder.** It runs as three `<fieldset>` steps on the product page. A step change moves focus to the next legend, and finished steps collapse to a summary line with «تعديل»:
1. **الصينية:** the size picker draws each option as a literal n×n mini-grid (3×3 … 10×10). Fillings: «مشكّل» or up to 3, split evenly.
2. **نص الغلاف:** line 1, line 2, band (five mini pieces as radio buttons), and the date-digit toggle. The live piece is 240px here, and the preview uses the printing font, so «اللي تشوفونه هو اللي ينطبع».
3. **اليوم والساعة:**
   - A 14-day list picker with 44px buttons. Dates before the earliest one are disabled, with the reason shown.
   - Slots are buttons. A full slot is struck through and reads «ممتلئ». There are no "N left" counts; those belong to 08.
   - Then pickup or zone, the hall exact-time option and the address.

**Signature: the printed-wrapper preview.**
- It is a 1:1 SVG: silver foil, one inset fold line, and a band across the middle 40% in the chosen colour, with line 1 (Mada 600) and line 2 (Mada 400) centred on the band as they would be printed.
- **Auto-fit:** the font size steps down 1px per overflow, from 15% to 10% of the side. Past that, input stops at `maxChars`.
- **It appears in:** the hero, the product gallery (first square, default text «اسمكم هنا»), the builder, cart lines (48px), the checkout summary (96px), the confirmation page, occasion rows and reviews.
- **Accessibility:** the SVG is `aria-hidden`. The field's own value carries the text, and a polite `<output>` announces «باقي ٧ أحرف» only after 800ms idle.

**Shape language:**
- A chocolate square's corner is **⅛ of its side, capped at 12px**. So tiles, photos, inputs, buttons and chips get 12px, and the 48px mini pieces get 6px.
- There is one strict square grid on an 8px base. Every multi-item module is n×n or 2×1 inside it.
- Gutters are 1px `line` gaps. No borders on tiles, no shadows, no gradients; depth comes from the tone steps `deep` → `bg` → `surface`.

**Motion:**
- The wrapper text re-renders on every `input` event, with no tween and no debounce.
- Step changes, the slot selection and the add-to-cart confirmation row are instant.
- Smooth scroll is off. `prefers-reduced-motion` has nothing to remove, which is the point.
- The earliest-date line recomputes on load and when the tab regains focus. It is **not** a ticking clock (that is 09's signature).

**Photography:**
- Moody top-down light, all 1:1: warm tungsten (≈3200K look), soft top light from a large overhead source falling off toward the edges, on dark walnut, cacao-stained wood and raw linen.
- Grade:
  - Blacks lifted to ≈`#1B110C`, so photos sit into `bg`.
  - Highlights capped at cocoa butter (no pure white).
  - Global saturation −25%, but yellow-greens (hue 70–100°) are left untouched, so pistachio is the one vivid colour.
  - No grain, no vignette filter.
- Subjects are pieces, hands and trays; no faces.
- Files are AVIF/WebP with width and height set, lazy below the fold. Credits go in `docs/image-credits.md`.

## 6. Niche features → engine modules and config

| Brief feature | Module / config |
|---|---|
| **Trays and boxes** | `commerce` catalog. Each product has `size {n, pieces: n²}` (n = 3, 4, 5, 6, 8, 10), `fillings[]` (at most 3, split evenly, with a per-piece surcharge in fils), `packaging` (`box`, `tray`, `tray-lid`) and `stock` for plain boxes. There are 5 collections. `hero.variant: "tray-grid"`. JSON-LD: `Store` + `openingHoursSpecification`; `Product` + `Offer` (`BHD`, `"24.000"`); `BreadcrumbList`; `FAQPage` |
| **Personalised printed wrappers** | New shared **`commerce/personalisation`** module, also used by 09 (text on the cake) and 12 (favour fields). It holds the field schema, charset validation, emoji rejection, `maxChars` and auto-fit metrics. The `WrapperPiece` island renders the SVG. Data is saved on the line item as `personalisation {line1, line2, band, digits}`. The owner dashboard exports a per-day **labels CSV** for the label printer |
| **Delivery date and time slot** | **`commerce/deliverySlots`**: slots generated per weekday, zones and fees, the hall exact-time add-on, and capacity per slot. In `full` tier, a Netlify Function `reserve-slot` holds a slot for 15 minutes when checkout starts (Supabase `slot_holds`); the demo uses a seeded JSON. One delivery date and slot per order. If a new cart item needs a later date, the page says so and moves the order date |
| **Lead-time rules** | **`commerce/leadTime`**, shared with 07, 09 and 12: `earliestDelivery(now, cart, rules, "Asia/Bahrain")`. It counts production days (Friday is not one), adds a day at 150+ printed pieces, routes 600+ pieces to a quote, and skips closed dates. The same function drives the hero line, the date picker's `min` and checkout validation. Tests cover: before and after 14:00, the Friday skip, the 150-piece bump, the Ramadan 22:30–00:30 slot that crosses midnight, a visitor browsing from another time zone, and a closed date |
| Cart, checkout, payment | `commerce` cart and checkout, then `payments` **MockProvider** in the demo. The live target is Tap (BENEFIT debit `src_bh.benefit`, cards, Apple Pay; the BenefitPay wallet needs the Tap Web SDK island), with Credimax as the alternative (a separate BENEFIT MID). Amounts are in fils. Every price and surcharge is a multiple of 10 fils, so Checkout.com's "last digit 0" rule also holds |
| Orders dashboard | Owner view grouped by delivery day, then slot. Each line shows the printed text, band, proof status (`بانتظار الصورة · أُرسلت · معتمدة`) and zone. CMS `orders` is read-only |
| WhatsApp | The `whatsapp` builder: for custom sizes, corporate orders, a fallback from any product, and the proof photo thread. Per-product share links use Web Share, falling back to copying the link. Honeypot field `website` |
| Corporate | Quote form: pieces (minimum 300), logo upload (Netlify Forms into the media library), date. A 7-day lead time |
| Analytics | `whatsapp_click`, `add_to_cart`, `checkout_start`, `wrapper_preview_typed` (once per session), `slot_full_shown` |

```ts
personalisation: {
  fields: [{ id: "line1", label_ar: "الأسامي", maxChars: 18, required: true },
           { id: "line2", label_ar: "التاريخ أو المناسبة", maxChars: 20 }],
  charset: ["arabic", "latin", "digits", " &-/.·"], emoji: false,
  bands: ["ivory", "rose", "sky", "pistachio", "cacao"], foil: "silver", digitsToggle: true,
  proof: { whatsappPhotoFrom: { pieces: 64, corporate: true }, autoApproveAfterHours: 3 } },
leadTime: { cutoff: "14:00", productionDays: ["sat","sun","mon","tue","wed","thu"],
  days: { printed: 2, plain: 1 }, pickupSameDay: ["plain"], perCollection: { corporate: 7 },
  bumps: [{ minPieces: 150, days: 3 }], quoteOnly: { minPieces: 600 },
  closedDates: ["2027-03-10", "2027-03-11", "2027-05-17", "2027-05-18"] },
delivery: { slots: { satThu: ["10-12","12-14","16-18","18-20","20-22"], fri: ["16-18","18-20","20-22"] },
  capacity: { perSlot: 5, hallExactPerSlot: 2, printedPiecesPerDay: 1200 },
  hallExactTime: { feeFils: 3000, windowMin: 15 }, freeOver: { fils: 40000, exceptZones: ["far-south"] },
  zones: [/* §7 */] },
payments: { provider: "mock", live: "tap", cod: false }, tax: { vatIncluded: true, rate: 0.10 },
```

**Arabic validation messages** (each says exactly what to fix):
- «السطر الأول أطول من ١٨ حرف بـ ٣ أحرف، اختصروه شوي.»
- «الإيموجي ما ينطبع على الغلاف، شيلوه وكمّلوا.»
- «أقرب يوم نقدر نوصّل فيه هالصينية هو الأحد ٢٧ سبتمبر، اختاروا هذا اليوم أو بعده.»
- «فترة ٦–٨ المسا يوم الجمعة ١٦ أكتوبر ممتلئة، جرّبوا ٨–١٠ أو يوم ثاني.»
- «اكتبوا رقم بحريني من ٨ أرقام.»

## 7. Operations (invented, internally consistent)

**Hours (`Asia/Bahrain`):**
- **Shop and pickup, Saar:** Saturday–Thursday 09:00–13:00 and 16:00–21:30; Friday 16:00–21:30.
- **WhatsApp replies:** daily 09:00–22:00.
- Online orders are open around the clock. The 14:00 cutoff only decides which day counts as production day 1.

**Lead times.** Printed items need **2 production days** (Saturday–Thursday) before the delivery day. An order placed before 14:00 counts that day as production day 1. [V weekdays]
- Wednesday 23 September at 11:00 → production Wednesday and Thursday → earliest delivery **Friday 25 September**, from 16:00.
- Wednesday at 15:00, or Thursday 24 September at 10:00 → production Thursday, then Saturday (Friday is skipped) → **Sunday 27 September**.
- **150+ printed pieces in one order:** 3 production days.
- **Corporate** (300+ pieces): 7 days. **600+ pieces:** quote only.
- **Plain ready boxes:** pickup the same day, delivery the next day, limited by stock.
- **Edits** to wrapper text or the slot are accepted until the same cutoff that a new order for that date would face. The edit window *is* the lead-time rule.

**Capacity:**
- 1,200 printed pieces per day.
- 5 deliveries per slot; at most 2 of them hall exact-time.
- A slot shows «ممتلئ» when full.

**Seasons** (Umm al-Qura estimates; the owner edits them in the CMS, «حسب رؤية الهلال»):
- **Ramadan 1448** (≈8 February–8 March 2027):
  - Shop 11:00–14:00 and **20:00–01:00, which crosses midnight**. It is stored as `{open:"20:00", close:"01:00", crossesMidnight:true}` on the business day.
  - Delivery slots: 13:00–15:00, 16:00–17:45 (before iftar), 20:30–22:30 and **22:30–00:30**.
- **القرقاعون** (night of 15 Ramadan, ≈21–22 February 2027): pouch pre-orders close on 10 Ramadan; deliveries run on 13–14 Ramadan.
- **Eid al-Fitr** (≈9 March 2027): pre-orders close 25 Ramadan. Eid-morning delivery runs 08:00–12:00 on day 1. Closed on days 2–3 (10 and 11 March).
- **Eid al-Adha** (≈16 May 2027): the same pattern, closed 17 and 18 May.

**Delivery from Saar (BHD):**

| Zone | Areas | Fee |
|---|---|---|
| Pickup | Our shop, Saar | 0.000 |
| North, near | Saar, Janabiya, Budaiya, Bani Jamra, Diraz, Al Qurayyah, Maqaba, Hajar | 1.000 |
| Manama | Manama, Seef, Sanabis, Juffair, Adliya, Mahooz, Jidhafs, Burhama | 1.500 |
| Central and Riffa | Isa Town, Tubli, Sanad, Sitra, Riffa, A'ali, Hamad Town, Buhair | 2.000 |
| Muharraq | Muharraq, Hidd, Arad, Busaiteen, Galali, Samaheej, Diyar Al Muharraq, Amwaj | 2.500 |
| Far south | Awali, Zallaq, Durrat Al Bahrain, Askar, Jaw, Sakhir | 3.500 |
| Hall exact time | Any zone, ±15 min, with a named contact at the hall | +3.000 |

- Delivery is free on orders of **40.000 or more** in every zone except the far south, which stays at 3.500.
- There is no minimum order.
- **Summer (May–September):** insulated bags with ice packs, and the evening slots are suggested for outdoor halls.

**Payment:**
- BENEFIT debit, Visa/Mastercard and Apple Pay at checkout (Mock in the demo).
- **No cash on delivery**, because printed goods are made to order.
- Prices include 10% VAT (`tax.vatIncluded`; shown only if the client is VAT-registered).

**Policies** (formal-neutral Arabic; pages: terms, delivery, returns, privacy):
- **Printing:** text is printed exactly as submitted, and spelling is not corrected.
- **Proof photo:** trays of 64+ pieces and all corporate orders get a proof photo on WhatsApp. If there is no reply within 3 hours, printing proceeds as submitted.
- **Cancellation:** personalised orders cannot be cancelled or refunded once printing has started. Before that, the full amount is refunded to the original method.
- **Damage or error:** report it with a photo within 2 hours of delivery. The affected pieces are replaced or refunded.
- **Missed delivery:** the driver waits 10 minutes and calls. A second delivery costs the zone fee again.
- **Storage:** 16–20°C, away from sun, not in the fridge. Filled pieces keep 3 weeks, solid pieces 2 months.
- **Allergens:** pistachio, hazelnut, almond, milk, soy lecithin, and gluten in the biscuit filling.
- **Privacy:** order data is kept for fulfilment only. Card data never touches the site.

## 8. Content plan

**Collections (5, 20 products):**
- الصواني (6)
- البوكسات (5; 4 printed, 1 plain ready box)
- حبّات بالعدد (3)
- المواسم: رمضان، القرقاعون، العيد (4)
- الشركات (2; quote)

**Fillings:** حليب وبندق · داكن ٧٠٪ · فستق حلبي (+0.040 per piece) · تمر وهيل · زعفران وحليب (+0.030) · كراميل بملح البحر.

| Example | Collection | BHD |
|---|---|---|
| بوكس ٩ حبّات مطبوعة (٣×٣) | البوكسات | 3.900 |
| بوكس ١٦ حبّة مطبوعة (٤×٤) | البوكسات | 6.500 |
| بوكس ٢٥ حبّة مطبوعة (٥×٥) | البوكسات | 9.750 |
| صينية ٣٦ حبّة (٦×٦)، خشب جوز | الصواني | 14.500 |
| صينية ٦٤ حبّة (٨×٨) بغطاء أكريليك | الصواني | 24.000 |
| صينية المِلچة ١٠٠ حبّة (١٠×١٠) مع لوحة أسامي محفورة | الصواني | 38.500 |
| حبّات مطبوعة بالعدد (أقل طلب ٥٠) | حبّات بالعدد | 0.280 per piece (50 = 14.000) |
| كيس قرقاعون: ٦ حبّات مطبوعة ومكسّرات (أقل طلب ٢٠) | المواسم | 1.250 per pouch |

- Bulk economy comes only from the bigger square sizes (0.433 per piece in a 3×3 box → 0.385 per piece in the 10×10 tray, wooden tray and engraved plate included). There is **no tier ladder**, which is 12's signature.
- **Worked cart** (it is also the WhatsApp sample):
  - صينية ٦٤ حبّة, half فستق and half تمر وهيل: 24.000 + 32 × 0.040 = **25.280**.
  - Delivery to Manama: 1.500.
  - Total **26.780**.

**Gallery (10):**
1. A 10×10 wedding tray on walnut, ivory bands «خالد ونوف»
2. A newborn tray, sky bands, beside a closed incense burner
3. Graduation boxes, pistachio bands «دفعة ٢٠٢٦»
4. Gergaoon pouches in a palm-frond basket
5. A pistachio piece cut in half
6. Hands folding silver foil in the Saar kitchen
7. A sheet of printed band labels, close up
8. Corporate pieces on cacao bands
9. An Eid 5×5 box with dates and cardamom pods scattered around it (نثار)
10. The 8×8 acrylic-lid tray, closed, with a ribbon

**FAQ (AR):**
1. كم يوم قبل لازم نطلب؟
2. كم حرف نقدر نكتب على الغلاف؟ ونقدر نكتب بالإنجليزي؟
3. تطرشون لنا صورة الطباعة قبل لا تطبعون؟
4. توصلون للقاعة في وقت محدد؟
5. شلون نحفظ الشوكولاتة في الصيف؟
6. نقدر نغيّر النص أو الموعد بعد الدفع؟

**Reviews** (4, labelled «آراء توضيحية · نموذج», each with a mini piece showing its printed text):
- أم محمد (Hamad Town): a 64-piece newborn tray, sky bands «حيّاكم في زيارة محمد»
- نوف (Busaiteen): the ملچة 100-piece tray, delivered to the hall on time
- يوسف (Riffa): 25 boxes of 9 for his graduating class
- مريم, HR at a company in Seef: 300 logo pieces for Eid

## 9. Voice

| | AR (Bahraini, unisex plural) | EN |
|---|---|---|
| Hero headline | «أساميكم على كل حبّة» | "Your names on every piece." |
| Subline | «شوكولاتة من سار، نطبع عليها أساميكم وتاريخ فرحتكم، وتوصلكم باليوم والساعة اللي تبونها.» | "Chocolate from Saar, printed with your names and your big day, delivered on the day and at the hour you want." |
| WhatsApp CTA | «حيّاكم واتساب، نرتّبها ويّاكم» | "Message us on WhatsApp and we'll plan it with you." |
| Confirmation | «مبروك مقدّماً! وصلنا طلبكم رقم ١٠٤٢، ونطرّش لكم صورة الطباعة قبل لا نبدأ.» | "Congratulations in advance! We've got order 1042 and will send you a print proof before we start." |

WhatsApp message sample:

```
مرحبا نثار، حاب أطلب:
• صينية ٦٤ حبّة (٨×٨): فستق، تمر وهيل ... ٢٥٫٢٨٠ د.ب
  الغلاف: «سلمان ونورة» / «١٦/١٠/٢٠٢٦»، شريط عاجي
• التوصيل: الجمعة ١٦ أكتوبر، ٦–٨ المسا، المنامة ... ١٫٥٠٠ د.ب
المجموع التقريبي: ٢٦٫٧٨٠ د.ب
```

The customer's name, number and notes are added from the form fields.

Policy register sample: «تُطبع النصوص كما وردت في الطلب، ولا يمكن إلغاء الطلبات المخصّصة أو استرداد قيمتها بعد بدء الطباعة. ويُعدّ الطلب مؤكداً بعد إتمام الدفع.»

## 10. Remove before finishing

Remove the **crimped-foil edge texture** (fine radial crimp lines) on the wrapper SVGs, both the static and the live ones. The silver square, the fold line and the printed band already read as a wrapped chocolate at 48px and at 240px. The crimp adds path weight to every wrapper instance (hero, builder, cart, occasion rows, reviews) and competes with the typed names, which are the point.

## 11. Open questions

1. Re-run the name search for «نثار» / Nithar (Arabic, Latin, Instagram) once search is available again; this session's budget ran out.
2. The matrix needs updating for row 06: the name, and the logo-mark row, which changes from "square debossed with د" to "ث dots as three chocolate squares on a debossed square".
3. `commerce/personalisation` is proposed as a module shared with 09 and 12. Confirm this in `docs/architecture.md`.
4. The composed tray grid (photos plus SVG pieces) is chosen over a single photo, for RTL/LTR correctness. Check the look at the pilot stage.
5. The demo WhatsApp number should be the portfolio owner's (`contact.whatsapp`), so prospects can test the order message end to end.
