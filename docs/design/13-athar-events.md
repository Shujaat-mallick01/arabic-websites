# 13 · مُقمِرة · Muqmira: design plan

Slug stays `13-athar-events`. Preset `commerce` · tier `lite` (estimate + WhatsApp booking request). Step 1 plan, written 2026-09-23.
**The allocated name قَمْرة · Qamra is replaced by مُقمِرة · Muqmira** (see §0). The concept, palette, type, hero and signature allocated in `00-distinctness-matrix.md` row 13 carry over unchanged. Row 13 of the matrix still says Qamra and needs the same edit.

---

## 0. Name check

| Checked | Found | Verdict |
|---|---|---|
| WebSearch: `Qamra events Kuwait`, `قمرة لتنسيق المناسبات الكويت`, `"Qamra" event planner…` | Not run: this session's web-search budget was already spent (200/200). The matrix's earlier web pass found nothing in the niche | n/a |
| Instagram `@qamra_events` (direct fetch) | **Exists.** Bio: «تنسيق حفلات حنا · الخبر و الدمام», an event-coordination account in Saudi Arabia's Eastern Province, next door to Kuwait. It is tiny (3 followers) but uses our exact Latin lockup, QAMRA EVENTS | **Collision** (same niche, GCC) |
| `qamra.com` (DNS → Shopify, then fetched) | **قمرة · Qamra**, a Kuwaiti handbag brand: Arabic-first, KWD prices, © 2025 | Same word, same country and same Instagram-shopping audience. Adds to the collision |
| Instagram `@qamra.kw` | Exists, titled «( الليل و القَمره )», a Kuwaiti account built on our exact concept | Adds to the collision |
| `qamra.co` · `qamra.store` · `qamra.net` | Israeli restaurant POS · Indian perfume storefront · redirect to a marine company | Unrelated |
| **مُقمِرة · Muqmira**: DNS for `muqmira.{com,net,co,com.kw,store,shop,sa,ae}`, `muqmirah.com`, `moqmira.com` | **None resolve** | Clear |
| Instagram `@muqmira`, `@muqmira.kw`, `@muqmira_events`, `@muqmirah`, plus a control handle that cannot exist | All four return the same empty login shell as the control, so none has a profile. `@moqmira` is a personal account ("Moqmira Moqmira", no bio, not a business) | **Chosen** |

- **Meaning.** قَمِرَت الليلة وأقمرت: the night became moonlit, as in *ليلةٌ مُقمِرة*. That is the same idea as قمرة (gatherings under the moon), in a word no business in the niche uses.
- **Letters.** The ق is kept, so the moon-and-reflection mark still works.
- **Neighbouring names.** It stays clear of Latima (05, Kuwait) and Midad (01), which differ in shape and sound. It is also clear of Lamar (12, Kuwaiti celebrations).
- **Still owed before build.** One web search in each script, and a trade-name lookup with Kuwait's Ministry of Commerce and Industry (MOCI).
- **Sources:** [@qamra_events](https://www.instagram.com/qamra_events/), [qamra.com](https://qamra.com), [@qamra.kw](https://www.instagram.com/qamra.kw/), [qamra.co](https://qamra.co), [qamra.store](https://qamra.store).

## 1. Identity

| | |
|---|---|
| Name | **مُقمِرة · Muqmira** (mook-MEE-ra). Lockup: **مقمرة لتنسيق المناسبات / MUQMIRA EVENTS · KUWAIT** |
| Meaning | "Moonlit." In Kuwait the ملچة (engagement), the غبقة (a late-night Ramadan gathering) and the chalet birthday all happen after dark, in courtyards, diwaniyas and on sea terraces. The brand dresses those nights. |
| Positioning | AR: **تنسيق مناسبات بالكويت وأسعارنا قدّامكم: اختاروا الثيم والباقة والإضافات، شوفوا تقديركم، وأرسلوه واتساب.** EN: *Event styling in Kuwait with prices up front: choose a theme, a package and add-ons, see your estimate, and send it on WhatsApp.* |
| Audience | Kuwaiti families (mostly the mother or sister organising) and company marketing staff. They plan a ملچة, birthday, graduation, newborn reception (استقبال مولود), Gergean or corporate launch, and want a ballpark price before they start a WhatsApp chat. |
| Place | Kuwait City. The studio is in Shuwaikh Industrial (Capital), open for visits by appointment. KWD (3 dp, fils ×1000) · `Asia/Kuwait` · `ar-KW` / `en` · numbering `arab` |
| Engine | `commerce.lite` + `estimateBuilder`, `eventDate`, `shareLinks`, `gallery`, `reviews`, `hijriDates`. The request ends in WhatsApp. No cart and no payment. |
| Dialect | Kuwaiti, festive and clear, using the polite plural address (حيّاكم، شنو المناسبة؟، ودّكم، وياكم، التقدير تقريبي). Policies are in formal-neutral Arabic. |

## 2. Palette (structure D, cool)

| Token | Hex | Area | Use |
|---|---|---|---|
| `bg` | `#0F1A2B` midnight navy | 46% | page ground, photo caption plates |
| (photos) | n/a | 24% | night setups: warm tungsten against blue |
| `surface` | `#172539` | 10% | header, footer, builder step panels, compare table |
| `selected` | `#1E304A` | 1% | fill of a chosen option. **Never the only cue**: the ice rule and a check glyph always appear with it |
| `ink` | `#F1EEE6` warm ivory | 7% | all text on dark |
| `muted` | `#A8B2C0` | 3% | secondary text, inclusions; borders of inputs and checkboxes |
| `accent` | `#B9CBE0` moonlight ice | 2% | primary buttons (label in `bg`), 1px rule on selected options, checked-box fill, underlines on links, focus ring |
| `accent-hover` | `#D3DFEC` | n/a | button hover |
| `line` | `#2A3A52` | <1% | decorative dividers only |
| `tape` · `tape-ink` · `tape-muted` · `tape-rule` | `#F3EEE3` · `#1A2231` · `#565E6C` · `#8E8676` | 7% | the receipt tape and the printed estimate: paper, text, line details, dashed separators |
| `danger` · `tape-danger` · `success` | `#F2A08F` · `#A3321F` · `#9FD3B0` | n/a | validation on dark · on tape · confirmations |

**Contrast (WCAG 2.x, computed with node)**

| Pair | Ratio | Need | | Pair | Ratio | Need |
|---|---|---|---|---|---|---|
| ink / bg | 15.06 | 4.5 ✓ | | tape-ink / tape | 13.78 | 4.5 ✓ |
| ink / surface | 13.32 | 4.5 ✓ | | tape-muted / tape | 5.65 | 4.5 ✓ |
| ink / selected | 11.49 | 4.5 ✓ | | tape label on the `bg` send button | 15.09 | 4.5 ✓ |
| muted / bg · surface · selected | 8.14 · 7.20 · 6.21 | 4.5 ✓ | | tape-danger / tape | 5.98 | 4.5 ✓ |
| accent / bg · surface (links, ring) | 10.54 · 9.32 | 4.5 ✓ | | tape-rule / tape (graphic) | 3.12 | 3 ✓ |
| bg on accent (button label) | 10.54 | 4.5 ✓ | | danger / bg · surface | 8.48 · 7.50 | 4.5 ✓ |
| bg on accent-hover | 12.91 | 4.5 ✓ | | success / bg · surface | 10.32 · 9.13 | 4.5 ✓ |
| accent 1px rule / selected | 8.04 | 3 ✓ | | ink on a ≥72% `bg` scrim over pure white | ≥ 6.01 | 4.5 ✓ |
| muted checkbox border / bg | 8.14 | 3 ✓ | | line / bg · surface | 1.52 · 1.34 | decorative only |

**Rules that follow from the numbers:**
- **Accent vs ink is only 1.43.** Links inside text are always underlined, and selected states always carry the ice rule and a check. Nothing relies on hue alone.
- **Banned pairs:**
  - accent on tape (1.43) and muted on tape (1.85), so the tape uses only its own three inks;
  - accent or muted on raw photos;
  - `line` as a boundary you must see.
- **Focus ring:** 2px accent, offset 2px, on dark. On the tape it is 2px `tape-ink`.
- **Text on photos** sits only on a solid `bg` plate or a scrim of at least 72%.

## 3. Type

| Role | Face | 390px | 1440px | LH |
|---|---|---|---|---|
| H1 (builder hero) | Kufam 800 · Archivo 600 wdth 125 (Latin ×1.06) | 30 | 56 | 1.25 AR / 1.1 EN |
| Theme title (portfolio opener) | Kufam 800 · Archivo 600/125 | 44 | 96 | 1.1 |
| H2 | Kufam 800 · Archivo 600/125 | 24 | 36 | 1.3 |
| Step titles (١ · الثيم), option labels | Kufam 600 · Archivo 600/100 | 18 · 17 | 20 · 18 | 1.4 |
| Body, inclusions | Kufam 400 · Archivo 400/100 | 16 | 17 | 1.8 AR / 1.55 EN |
| Option price | Kufam 600, digit cells | 16 | 17 | 1.4 |
| Tape lines · tape total | Kufam 400/600 · Kufam 800, digit cells | 14 · 26 | 15 · 30 | 1.6 · 1.2 |
| Captions, legal | Kufam 400 | 13 | 13 | 1.7 |

- **Why the pair works** (`fonts-and-logo-pipeline.md` §A5):
  - The metrics match: Kufam alef 0.760 vs Archivo cap 0.720 (Latin at 106%), body/x 0.88, and stems 0.092 / 0.092 at 400.
  - Both are grotesque signage constructions: flat terminals, horizontal stress, low contrast. Archivo's 125 width answers Kufam's wide kufi proportions.
  - The display match (Kufam 800 against Archivo 600/125) is [A]; confirm it on the specimen sheet.
- **Coverage and weights.** Kufam covers ٫ ٬ چ گ پ ٪ and the harakat, all checked in the TTF, so the name can be set as مُقمِرة in text.
  - Kufam is rated "short body" in the research. So long policy pages use 17px, LH 1.9 and a 60ch measure.
- **Payload.**
  - Kufam is used at three weights, so load the Arabic-subset VF (56 KB), which is cheaper than three statics (105 KB).
  - Archivo is a VF (wght 100–900, wdth 62–125) with the Latin subset only.
  - Arabic pages use a Kufam-first stack; Kufam has its own Latin for "EN" and phone digits, so **Archivo is never fetched on Arabic pages**. English pages put Archivo first.
  - Preload only the display face above the fold.
- **Numerals policy.**
  - AR uses `ar-KW-u-nu-arab`: `‏٦٢١٫٥٠٠ د.ك.‏` and `١٬٢٥٠٫٠٠٠ د.ك.` (the exact Intl output, trailing dot included). EN uses `KWD 621.500`.
  - Phone numbers use Latin digits inside `<bdi dir="ltr">`.
- **Measured trap: Kufam's Arabic-Indic digits are proportional** (advances from 292 to 726 units), and its `tnum` maps only Latin digits (0 of its 36 entries are Arabic).
  - `font-variant-numeric` therefore cannot stop the counting total from jittering or align the tape column.
  - **Fix:** the `@aw/ui` `DigitCells` helper wraps each Arabic-Indic digit in an inline-block 0.73em cell, centred. Separators keep their natural width. The whole number carries an `aria-label`, and the cells are `aria-hidden`.
  - Archivo's digits are already 575–577 units wide and it has `tnum`, so English uses plain `tabular-nums`.

## 4. Logo

- **Arabic wordmark.** **مقمرة** in Kufam ExtraBold (800), unvowelled, outlined through the harfbuzzjs pipeline.
  - The medial ق **keeps both dots**, because a single dot would read as ف. They are drawn as two slightly enlarged discs: the moon.
  - A **horizon hairline** runs along the baseline under the ق and extends 1.2 em past the word's end.
  - Below the hairline, directly under the dots, sit the same two dots mirrored as flat-topped half-discs: the reflection.
  - The hairline stroke is 4% of the alef height.
- **Latin line.** **MUQMIRA** in Archivo 600, wdth 125, tracked +0.08em, with its cap height at 40% of the alef height. Below it, **EVENTS · KUWAIT** in Archivo 400, tracked 0.2em.
- **Descriptor and layouts.** The Arabic descriptor لتنسيق المناسبات is set in Kufam 400. The inline lockup (header) is wordmark, then a 1px vertical rule, then the Latin stack. The stacked lockup is for OG and social.
- **Mark (favicon and avatar).** The device alone, in accent on `bg`: a horizon hairline, one full disc above it, and a mirrored half-disc below.
  - At 16–32px the hairline thickens to 2px and the half-disc is 3px tall.
  - It is not a round icon in a circle: the square navy tile carries a moon on a horizon.
- **Clear space and minimum sizes.** Clear space is the alef height of the wordmark on every side, and 25% of the mark's width around the mark. Minimum sizes: full lockup 128px, Arabic wordmark alone 64px, mark 16px.
- **Files.** `logo-light` is ink on `bg`; `logo-dark` is `#0F1A2B` on tape paper, and is used on the printed estimate.

## 5. Layout

**Layout config.**
- `hero: estimate-builder`, `nav: bar-start-logo`, `categoryEntry: text-index` (plus the theme tiles inside the builder), `grid: list`, `imageShape: rect`, `footer: columns`, `signature: receipt-tape`.
- New package variants: `productCard: option-row` and `whatsapp: receipt-tape`. On pages without a builder, WhatsApp uses `bottom-bar`.

**Hero at 390px**
1. The demo banner, then a 56px header: wordmark at the start; الثيمات and the menu at the end.
2. **Photo band.** A full-bleed 16:9 photo (390×219) of the selected theme's setup. It is the LCP image; the default theme's photo is preloaded.
   - A solid navy caption plate sits at the bottom start: theme name and `شوفوا الثيم كامل`.
3. **Headline.** H1 (2 lines, start-aligned) and a one-line muted subline.
4. **Step ١ · الثيم.** An occasion field `شنو المناسبة؟` (a native select: ملچة، عيد ميلاد، تخرج، استقبال مولود، قرقيعان، شركات) that sorts the themes to match.
   - Below it, a snap-scrolling row of six 4:5 theme tiles (104×130) with names.
   - These tiles are the **category entry points**.
5. **Step ٢ · الباقة.** Three stacked option rows (`role=radio`). Each shows name, guests, price, a three-line inclusion preview and `كل اللي داخل الباقة (١٢)`. Soirée is preselected and labelled `الأكثر طلبًا`.
6. **Step ٣ · الإضافات.** Five `<details>` groups, the first one open.
   - Each row: a square checkbox, the label, the unit price, and a quantity stepper that appears once the row is checked.
   - Items already in the chosen package read `ضمن باقتك`.
7. **آخر شي · الموعد والمكان.** Date, area (zone), venue type, guests and name.
8. **Bottom tape.** A 64px ivory strip with a perforated top edge sits over the page from first paint, padded for the safe area.
   - It shows `تقديركم ٣٤٠٫٠٠٠ د.ك.*` and a **أرسل واتساب** button.
   - Tapping the strip expands the whole tape as a bottom-sheet `<dialog>` (up to 85vh).

**Hero at 1440px** (12 columns, max 1360px, 80px header)
- **Header.** The inline lockup at the start. Nav: الثيمات · الباقات والإضافات · أعمالنا · شلون نشتغل · الأسئلة · EN. A WhatsApp text link at the end.
- **Headline.** H1 at 56px across columns 6–12, with the subline under it.
- **Photo (columns 1–5, inline-start).** The selected theme's setup at 4:5, sticky, height `min(calc(100vh − 120px), 820px)`, caption plate at the bottom.
- **Builder (columns 6–9).** Steps ١–٣ and the details step scroll here, as option rows (not cards).
- **Tape (columns 10–12, inline-end).** The receipt tape, sticky at `top: 96px`, 300px wide, growing downward.
- **Behaviour.**
  - The photo swaps **instantly** when the theme changes. The next image is decoded first so nothing flashes.
  - With JS off, the builder renders as the full price list with a plain WhatsApp link.

**Homepage rhythm** (tool first, then proof; dark space and step numbers separate sections)
1. Demo banner and header.
2. Builder hero: photo, steps, tape.
3. **ستة ثيمات، كل واحد بليلته.** A numbered text index (٠١–٠٦, Kufam 800 at 36px) beside one large 16:9 photo. Hovering or focusing a name previews its photo; each name links to `/themes/<slug>/`.
4. **شنو داخل كل باقة.** A checklist table: packages are the columns, inclusions the rows, with square check glyphs and sticky column heads. On phones a segmented switch shows one package at a time.
5. **الإضافات بأسعارها.** The full add-on list in 5 groups (two columns on desktop), with prices end-aligned in digit cells. Each row's `أضف للتقدير` updates the same state as the builder.
6. **شلون نشتغل.** A plain ordered list:
   - ١ ترسلون التقدير
   - ٢ عرض نهائي خلال ٢٤ ساعة
   - ٣ عربون ٥٠٪ يثبّت الموعد
   - ٤ نركّب قبل المناسبة بـ٣ ساعات ونشيل بنفس الليلة
7. **وين نوصل.** The zone fee table, the studio and hours (with the cross-midnight WhatsApp hours), and a map link.
8. Four reviews, labelled `تقييمات توضيحية`. They are set as plain quotes, each with its occasion and area.
9. FAQ (6).
10. Footer: policy links, the CR slot, payment note ("العربون بالكي نت أو تحويل بنكي بعد العرض النهائي"), and the demo credit.

**Theme page `/themes/<slug>/`** (long, dark, photo-led)
1. A full-bleed 16:9 opener, with the title (96/44px), a mood line and `من ١٧٠٫٠٠٠ د.ك.*` on a solid plate.
2. `يناسب:` the matching occasions, as plain text.
3. 8–10 photos alternating one full-bleed 16:9 with a pair of 4:5 images. Captions read like «ملچة · مشرف · باقة السهرة».
4. A per-theme checklist of what each package includes (for example ورد طبيعي أبيض: ياسمين، جوري، أوركيد).
5. `ابدأوا التقدير بثيم ياسمين`, which opens `/?t=jasmine#builder` with the tape prefilled.
6. A big text link to the next theme.

**Signature: the receipt tape**
- **Form.** A narrow ivory strip.
  - The top edge is a straight cut with a row of 3px punched holes every 8px, and the bottom edge is torn. Both are SVG masks, so `bg` shows through.
  - It has 0 radius and no shadow.
- **Contents, from top to bottom:**
  - The header `تقدير مبدئي · مقمرة` and a timestamp (`الأربعاء ٢٣ سبتمبر ٢٠٢٦ · ٩:٤٠ م`, `Asia/Kuwait`).
  - A dashed `tape-rule`.
  - One line per choice: package, theme delta, each add-on as quantity × unit, and setup and transport by zone.
  - A second rule.
  - `المجموع التقديري` in Kufam 800, then `العربون لتثبيت الموعد (٥٠٪)`.
  - The footnote `* التقدير تقريبي، والسعر النهائي نثبّته وياكم`.
  - The **أرسل التقدير واتساب** button: navy on paper, 52px.
- **Worked example** (every figure is computed in fils):

  | Line | KWD |
  |---|---|
  | باقة السهرة | ٣٤٠٫٠٠٠ |
  | ثيم ياسمين (ورد طبيعي) | + ٦٠٫٠٠٠ |
  | قوس ورد طبيعي للمدخل ×١ | ٩٥٫٠٠٠ |
  | ركن قهوة عربية مع قهوجي ×١ | ٤٥٫٠٠٠ |
  | ستارة لمبات دافئة ٣ م ×٢ | ٤٤٫٠٠٠ |
  | بتلات ورد للممر ×١ | ١٧٫٥٠٠ |
  | التركيب والنقل · الأحمدي | ٢٠٫٠٠٠ |
  | **المجموع التقديري** | **٦٢١٫٥٠٠ د.ك.** |
  | العربون ٥٠٪، rounded up to a whole dinar (310.750 → 311.000) | ٣١١٫٠٠٠ د.ك. |

- **Semantics.**
  - The tape is an `<aside>` holding an `<ol>`. It is read-only; choices change only in the builder.
  - The total sits in a `role=status` region that announces once the count settles, e.g. «المجموع التقديري ٦٢١٫٥٠٠ دينار».
- **State in the URL.** The whole estimate lives in the query string (`?t=jasmine&p=soiree&a=flower-arch.1,coffee-corner.1,fairy-curtain.2,petal-aisle.1&z=ahmadi&d=2026-10-15&g=50`). That makes it the share link, and it is the link the WhatsApp message carries.
- **Print.** The print stylesheet prints the tape alone.
- **Where it appears:** the home builder, every theme page (prefilled) and `/packages/`. The WhatsApp message repeats its lines in the same order.

**Shape language.**
- Corners are 0 on photos and the tape, and 2px on buttons, inputs and tiles.
- Checkboxes are 20px squares. Package choices have no round radio dots.
- A selected option gets a 1px ice rule on its inline-start edge, plus a check glyph and the `selected` fill.
- There are no cards and no shadows. Round shapes appear only as the moon in the logo.

**Motion** (the only motion on the site; nothing moves on scroll)
- The total counts up in 300ms or less: rAF over integer fils, ease-out, and it always lands on the exact string.
- A new tape line slides in over 120ms (6px along the block axis, plus opacity). A removed line collapses over 120ms.
- Under `prefers-reduced-motion`, all of it is instant; the live region still announces.

**Photography.**
- **When and what.** Night event photography of setups at blue hour or after dark, **before guests arrive**. Kuwaiti family events are private, so there are no faces, no guests and no children. Hands are fine.
- **Light.** Warm 2700K decor light (lanterns, fairy lights, candles) against a deep-blue ambient. High contrast and rich, but never RGB or neon.
- **Grade.** Shadows tinted toward `#0F1A2B`, warm highlights, saturation −5, 2% grain.
- **Formats.** 16:9 openers at 2400×1350 and 4:5 details and tiles at 1600×2000, all AVIF/WebP. Signs are blank or carry fictional names.
- **Placeholders** until licensed images exist: generated navy fields with warm bokeh and the silhouette of each theme's main structure (arch, canopy, majlis, stage).

## 6. Niche features → engine

| Feature | Module | Config / schema |
|---|---|---|
| Themes | `estimateBuilder` + `themes` collection, route `/themes/<slug>/` | `{slug, name{ar,en}, mood, occasions[], cover16x9, portrait4x5, gallery[], swatches[] (content colours, not tokens), delta:{table, soiree, stage}: Money}` |
| Packages with inclusions | `packages` + field pack `events.package` | `{slug, basePrice, guestsMax, leadDays, coordinatorHours, inclusions: I18nText[], badge?}` → `choice` option `package` with absolute prices |
| Add-ons and running total | `addons` + island `aw-estimate` + `priceLine()` | `{id, group, unitPrice, maxQty, leadDays, includedIn?: {stage: 4}}` → `addons` option. The builder calls `priceLine()`: package + theme delta + Σ(unit × qty beyond the included quantity) + zone fee, **all in integer fils** |
| Setup and transport | `settings/fulfilment.delivery.zones` | Governorate zones plus the `custom` zones "chalets" and "farms/camps" (§7). The fee appears as a tape line, and stays pending until an area is chosen |
| Lead time | `earliestDate()` in `Asia/Kuwait`, computed at runtime | `max(package.leadDays, add-on leadDays)`. Blocked dates are disabled and explained: «التاريخ قريب وايد: باقة الكوشة تحتاج ١٤ يوم على الأقل. أقرب موعد متاح: الأربعاء ٧ أكتوبر.» |
| Evening capacity | `settings/booking.fullDates` + `blackouts` (lite: marked by the owner, no counter) | The owner closes an evening once it has 3 confirmed setups (4 on Thu–Sat). The picker then reads «هالليلة محجوزة بالكامل» |
| Seasonal window | `settings/booking.windows` (flagged `approximate`) | Gergean 1448: the evening of Sun 21 Feb 2027 (≈14 Ramadan). Requests open 7 Jan 2027, Table and Soirée only, capped at 6 setups |
| Deposit (shown, not charged) | `DepositRule` | `{kind:'percent', bps:5000, roundUpTo:1000}` (1000 fils = 1 KWD). It is paid off-site by KNET link or bank transfer after the final quote |
| Guests vs capacity | builder rule | `guests > guestsMax` shows a soft note: «٨٠ ضيف أكثر من سعة باقة السهرة (٦٠). ننصحكم بباقة الكوشة.» |
| Booking request | `@aw/whatsapp.bookingMessage` + `fitToLimit` | The lines as on the tape, then `المجموع: ٦٢١٫٥٠٠ د.ك. (تقديري)` and the deposit; the occasion, guest count and venue; the date with its Hijri equivalent («الخميس ١٥ أكتوبر ٢٠٢٦ (٤ جمادى الأولى ١٤٤٨ هـ تقريبًا)»); name, phone and the share link. Starts with `[نموذج: مقمرة]` |
| Occasions | `categories` (`type: occasion`) | They sort the themes and pre-fill the message. They are **not** tiles, which keeps Lamar's (12) occasion mosaic unique |
| SEO | `seo` | `LocalBusiness` + `OfferCatalog` (packages as `Offer`/`Service`, `priceCurrency: KWD`), `areaServed: KW`, `openingHoursSpecification` (with the cross-midnight close), `BreadcrumbList`, `og:locale ar_KW` + `en_US` |
| Analytics | event layer | `estimate_change` (debounced 2s), `estimate_send`, `theme_view`, `whatsapp_click` |
| CMS (Arabic labels) | `cms` | Collections: الثيمات · الباقات · الإضافات · مناطق التركيب · الليالي المحجوزة · المواسم. "How to close an evening" is one list edit in الليالي المحجوزة |

## 7. Operations

**Hours** (`settings/hours`)
- **Studio visits (by appointment):** Sun–Thu 10:00–18:00, Sat 12:00–18:00, Fri closed.
- **WhatsApp replies:** Sat–Thu 10:00–00:30 and Fri 16:00–00:30. These cross midnight: Thursday's span runs until 00:30 on Friday and belongs to Thursday.
- **Ramadan (a CMS season, approximate):** WhatsApp 13:00–16:00 and 20:00–02:00; studio 20:30–00:30.
- **Crews:** setups begin from 09:00, 3 hours before the event.
  - Removal is included the same night until 01:00, or the next morning 09:00–12:00.
  - Removal after 01:00 is the paid add-on.

**Setup and transport (added to the estimate)**

| Zone | Fee (KWD) |
|---|---|
| العاصمة · حولي | 0.000 (included) |
| الفروانية · مبارك الكبير | 10.000 |
| الأحمدي · الجهراء (residential) | 20.000 |
| Southern chalets: الخيران، بنيدر، الجليعة، الزور، صباح الأحمد البحرية | 35.000 |
| Farms and winter camps: الوفرة، العبدلي، الصبية | 45.000 |

**Lead times**
- Table: 3 days. Soirée: 7 days. Stage: 14 days.
- Fresh flowers, the ice-cream cart and printed backdrops: 5 days. The photo booth and low fog: 3 days.
- Stage bookings are accepted up to 180 days ahead.

**Policies (summary; formal-neutral Arabic on the page)**
- **The estimate isn't an offer.** The final quote comes on WhatsApp within 24 hours of the request (during WhatsApp hours) and is valid for 7 days.
- **Payment.** A 50% deposit fixes the date. The balance is paid on setup day, before work starts. Kuwait has no VAT, so there is no tax line.
- **Cancellation.**
  - 14 days or more before the event: the full deposit is refunded within 7 working days.
  - 7–13 days before: half the deposit is refunded.
  - Under 7 days: the deposit is not refunded, because flowers and prints have been ordered.
  - The date can be changed once, free, with 7 days' notice and subject to availability.
- **Weather.** If dust or rain cancels an outdoor setup on the day, the client gets a free date change within 60 days.
- **Rented items.** Items broken by guests are charged at their listed replacement value; normal wear is not charged.
- **Venues.** Hotel or hall vendor-access fees and parking are paid by the client.
- **Fresh flowers** may be substituted with seasonal flowers of equal value and colour.
- **Photos.** We photograph setups only, never guests. A setup is posted only with the client's consent and without names.
- **CR slot** in the footer: `legal.crNumber`.

## 8. Content plan

**Collections:**
- **الثيمات** (6)
- **الباقات** (3)
- **الإضافات** (14, in 5 groups: ورد · إضاءة · ضيافة · تصوير وتخصيص · خدمة)

That makes **23 priced items**. The occasions taxonomy has 6 entries. No favours or giveaways are sold here; those belong to site 12.

| Item | Detail | Price (KWD) |
|---|---|---|
| باقة الجلسة · Table | Up to 20 guests: a 2.4 m backdrop, a dressed cake/hospitality table, 2 premium arrangements, a welcome sign, LED candles and 6 serving stands. Setup and removal included | 145.000 |
| باقة السهرة · Soirée *(الأكثر طلبًا)* | Up to 60 guests. Everything in Table, plus an entrance arch, 6 guest-table centrepieces, fairy lights or lanterns, an acrylic name sign, a photo corner, linens for 60 and a coordinator for 3 hours | 340.000 |
| باقة الكوشة · Stage | Up to 150 guests. Everything in Soirée, plus a 4 × 2.4 m kosha platform with sofa, a lit aisle, full lighting (4 light curtains), 12 centrepieces and 2 coordinators for 5 hours | 780.000 |
| Theme deltas (Table / Soirée / Stage) | ليلة البحر · Sea Night +0/0/0 · ياسمين · Jasmine +25/60/140 · مجلس السدو · Sadu Majlis +20/35/70 · زهر اللوز · Almond Blossom +10/20/45 · سماء · Starlit Canopy +15/45/90 · واجهة · Façade (corporate) +0/25/60 | from 145.000 |
| قوس ورد طبيعي للمدخل | Fresh-flower entrance arch, max 1, 5-day lead | 95.000 |
| ركن قهوة عربية مع قهوجي | Arabic coffee corner with server (3 h), max 2 | 45.000 |
| ستارة لمبات دافئة ٣ م | Warm light curtain, max 6 (4 included in Stage) | 22.000 |
| مصوّرة (٣ ساعات) | Female photographer for women's events (setup and décor shots), max 1 | 90.000 |

The remaining add-ons:

| Add-on | Price (KWD) |
|---|---|
| Extra fresh centrepiece | 18.000 |
| Petal aisle | 17.500 |
| Brass lanterns ×10 | 15.000 |
| Low fog for the زفة (the bridal procession) | 30.000 |
| Karak station | 35.000 |
| Ice-cream cart (100 cups) | 85.000 |
| Photo booth with prints | 110.000 |
| Printed name or logo backdrop | 65.000 |
| Extra coordinator hour | 10.000 |
| Removal after 1 am | 15.000 |

**Gallery (10):**
1. A Jasmine arch at dusk in an empty courtyard.
2. Sadu floor seating with a brass dallah in a diwaniya.
3. A Sea Night table on a Khiran chalet terrace at blue hour.
4. A Starlit canopy over a graduation dessert table.
5. An Almond Blossom newborn backdrop with a blank acrylic sign.
6. A Gergean corner with woven baskets (no children).
7. A Façade launch wall with a blank logo panel and cool spots.
8. Hands laying a petal aisle.
9. Low fog on an empty kosha.
10. The studio mock-up table with linen swatches.

**FAQ (AR)**
1. التقدير اللي يطلع لي هو السعر النهائي؟
2. كم يوم لازم أحجز قبل المناسبة؟
3. شلون أثبّت الموعد؟ وكم العربون؟
4. توصلون الشاليهات والمزارع؟ وكم رسوم التركيب؟
5. متى تركّبون ومتى تشيلون الديكور؟
6. إذا غيّرت التاريخ أو ألغيت، شنو يصير بالعربون؟

**Sample reviews (each labelled "تقييم توضيحي")**
- **أم عبدالله, Mishref.** Her daughter's ملچة: Jasmine, Soirée. «التقدير اللي أرسلته طلع قريب وايد من العرض النهائي.»
- **نورة, Jahra.** A graduation with the Starlit theme. «رسوم الجهراء كانت واضحة من البداية، ووصلوا قبل بثلاث ساعات.»
- **مريم, marketing coordinator, Sharq.** A product launch with Façade and the logo backdrop. The quote was approved the same day.
- **أم سالم, Khiran.** A Gergean evening at the chalet: Sadu Majlis plus the karak station.

## 9. Voice

| | Kuwaiti | English |
|---|---|---|
| Hero headline | **شنو المناسبة؟ اختاروا الثيم وشوفوا السعر قبل لا تسألون.** | What's the occasion? Pick a theme and see the price before you ask. |
| Subline | ثيم وباقة وإضافات، والمجموع ينحسب قدّامكم أول بأول. التقدير تقريبي، والسعر النهائي نثبّته وياكم على الواتساب. | A theme, a package and add-ons, and the total adds up as you go. The estimate is approximate; we confirm the final price with you on WhatsApp. |
| WhatsApp CTA | **أرسل التقدير واتساب** · حيّاكم، نرد عليكم خلال ساعة بأوقات الدوام. | **Send the estimate on WhatsApp** · You're welcome. We reply within an hour during working hours. |

- **Microcopy.** No add-ons chosen: «ما تبون إضافات؟ عادي، الباقة كاملة بروحها.»
- **Policy register:** «يُثبَّت موعد المناسبة بعد سداد عربون نسبته خمسون بالمئة (٥٠٪) من قيمة العرض النهائي، ويُسدَّد المبلغ المتبقي يوم التركيب قبل بدء العمل. ولا يُعدّ التقدير الظاهر في الموقع عرضًا ملزمًا.»

## 10. Remove before finishing

**Remove the full-width horizon hairline under section headings** (the logo's horizon repeated as a divider).
- Dark space, step numerals and the tape's own perforations already mark every change.
- The horizon then stays where it means something: the wordmark and the favicon.
