# 07 · حلاوة البَراحة · Halawat Al Baraha: design plan

Step 1 ("Plan first"). Written 2026-09-23. The folder slug stays `07-halawat-al-deera`, since the matrix rule is that slugs survive renames. Allocation source: `00-distinctness-matrix.md`, row 07.

---

## 0. Name check: renamed

**Searched** (2026-09-23): `"حلاوة الديرة"`, `"Halawat Al Deera"`, `"حلاوة الديرة" البحرين حلويات`, `storealdeirh.com متجر الديرة`, `"الديرة" حلويات المحرق`, `"Deera sweets" OR "Al Deera sweets"` (GCC), `"حلويات الديرة"`, `khayrataldiyra`, `"حلا الديرة" OR "حلو الديرة"`.

**Found:**
- **Al. Deerah Sweets Co.** (Fahaheel, Kuwait): a sweets company, listed in a business directory since 2012. Its name is almost the English gloss of حلاوة الديرة. This is the same niche in the same region, so it counts as a **collision**.
- **حلويات خيرات الديرة** (`@khayrataldiyra`, khayrataldiyra.com): sells sweets, chocolate and cakes. TikTok results tie it to Bahrain; the site returned a 503, so its location is not confirmed.
- **متجر الديرة** (storealdeirh.com, Saudi Arabia): a heritage store selling halawa and "حلويات بحريني". Its product titles read "حلاوة … | الديرة".
- Also in the niche: الديرة للشوكلاتة (Sohar, Oman), سمة الديرة (nuts and sweets), ذوق الديرة (KSA), and سما الديرة (a restaurant in Muharraq).

**Verdict:** "الديرة" is a crowded element in GCC sweets names, so the brand is renamed.
- **Rejected:** برنية (the sweet jar). A Jeddah confectionery shop already trades as برنية on HungerStation and Mrsool.
- **Chosen:** **حلاوة البَراحة · Halawat Al Baraha.** البراحة is the open sandy square in the middle of an old Gulf فريج. Neighbours met there, children played there, Eid spilled out into it, and plates of sweets crossed it from house to house. The name keeps "حلاوة", which saves the ح signboard mark and the two-line lockup, and it keeps the neighbourhood meaning.

**Re-check status:** the session's web-search cap (200 of 200) ran out before the new name could be searched.
- There is only a weak signal so far. Node DNS found no records for `halawatalbaraha.com`, `halawatalbaraha.bh`, `halawat-albaraha.com`, `halawatalbarraha.com` or `albarahasweets.com`.
- The lookup itself works: control lookups for `naqsha.bh`, `storealdeirh.com` and `khayrataldiyra.com` all resolved.
- **Re-run the Arabic, Latin and Instagram search before building** (see open questions).

Sources: [kuwaityello: Al. Deerah Sweets Co.](https://www.kuwaityello.com/company/17659/Al_Deerah_Sweets_Co) · [@khayrataldiyra](https://www.instagram.com/khayrataldiyra/) · [khayrataldiyra.com](https://khayrataldiyra.com/) · [storealdeirh.com](https://storealdeirh.com/) · [@aldeerachocolate](https://www.instagram.com/aldeerachocolate/) · [برنية on HungerStation](https://hungerstation.com/sa-ar/مطعم/برنية/جده/الشرفية/16458) · [برنية on Mrsool](https://mrsool.co/stores/f08443d23c8dc030b3f09a25cb2ce1fa/%D8%A8%D8%B1%D9%86%D9%8A%D8%A9)

## 1. Identity

| | |
|---|---|
| Name | **حلاوة البَراحة** · **Halawat Al Baraha** · lockup `HALAWAT AL BARAHA · MUHARRAQ SWEETS` |
| Meaning | "The sweetness of the square": the neighbourhood open ground where Eid, weddings and shared plates happened |
| Positioning (AR) | حلوى المحرق مطبوخة على أصولها، اطلبوها قبل بيوم على الواتساب لمجلسكم ورمضانكم وعيدكم. |
| Positioning (EN) | Muharraq sweets made the old way. Order a day ahead on WhatsApp for your majlis, Ramadan and Eid. |
| Audience | Bahraini households, mostly the person hosting (mothers, older sons), ordering halwa, khanfaroosh, rangina, balaleet and gers ogaili for the majlis, Ramadan, Eid and National Day. They order on a phone in the evening for the next day |
| Preset / tier | commerce · `lite` (WhatsApp order, no payment) |
| Place | Muharraq, Bahrain · BHD (3 decimals, minor unit = fils) · `Asia/Bahrain` · `ar-BH`, numbering `arab` |
| Dialect | Bahraini with Muharraqi warmth; unisex plural address (اطلبوا، اختاروا); formal-neutral Arabic for policies |

## 2. Palette (L structure, warm)

| Token | Hex | Usage | Where |
|---|---|---|---|
| `bg` gypsum | `#FBF8F2` | 64% | page ground, text on accent and deep |
| `surface` | `#F2E9DB` | 16% | menu board panel, season band, form |
| `ink` date molasses | `#241C16` | 8% | all text, focus ring |
| `deep` halwa | `#5A2A18` | 5% | footer band and the signboard double rules only |
| `muted` | `#6B5B4E` | 3% | sizes, captions, dotted leaders, input borders |
| `accent` terracotta | `#AD4926` | 3% | the باچر stamp, WhatsApp CTA fill, links, active season-tab rule, logo plaque |
| `line` | `#DDCEB8` | 1% | decorative hairlines only, never input borders |

Bahrain red (`#CE1126`) appears only as *content* inside the National Day panel (packaging in photos, a CMS image). It is never a token.

**Contrast (WCAG 2.x, computed with node):**

| Pair | Ratio | Needs | Use |
|---|---|---|---|
| ink / bg · ink / surface | 15.81 · 13.93 | 4.5 | body, menu lines |
| muted / bg · muted / surface | 6.13 · 5.40 | 4.5 | sizes, captions |
| accent / bg · accent / surface | 5.27 · 4.64 | 4.5 | links, stamp text |
| bg on accent (`on-accent`) | 5.27 | 4.5 | WhatsApp button label |
| bg / deep · surface / deep | 11.14 · 9.81 | 4.5 | footer text |
| deep / bg · deep / surface | 11.14 · 9.81 | 3 | double rules |
| muted / bg (input border) | 6.13 | 3 | non-text |
| ink / bg (focus ring) | 15.81 | 3 | 2px ring with a 2px offset |
| bg / ink | 15.81 | 4.5 | reversed "اليوم" tag |
| white / `#CE1126` · `#CE1126` / bg | 5.63 · 5.31 | 4.5 | National Day content only |
| accent / deep | **2.11** | n/a | **never used**: on deep, the logo plaque turns bg-coloured |

The stamp's distressed-ink texture is applied to its **border only**. The date glyphs stay solid, so the 5.27 and 4.64 ratios hold.

## 3. Type

| Role | Arabic | Latin (EN pages, and Latin runs in AR) |
|---|---|---|
| Display (headings, section and category names, stamp word) | **Rakkas 400**, words only, `ss01` in the wordmark | **Young Serif 400**, at 0.89× the Rakkas px |
| Body, menu items, prices, forms | **Noto Naskh Arabic 400/700** (variable, 94 KB; two statics would be 106 KB) | **Newsreader**, `font-optical-sizing: auto`, wght ≈380 body / 700 prices, at 0.99× |

**Why this pair works:**
- Rakkas alef (0.594) aligns with Young Serif's cap height (0.670) at 89%, and the body/x-height ratio is 0.90.
- Noto Naskh's alef (0.671) matches Newsreader's cap height (0.676) almost exactly, with body/x 0.80.
- Newsreader's `n` stem (0.077) is heavier than Noto Naskh's alef stem (0.063), so the Latin body drops to wght ≈380, tuned by eye on the specimen.
- The pairing is a 1950s–60s ruq'ah signboard with a soft-bracketed signboard serif, plus two text faces for reading.

**Stacks and rules:**
- Font stacks are Latin-first (`"Young Serif", "Rakkas"`), so Rakkas's blackletter Latin never shows.
- Line heights are always explicit, never `normal` (Rakkas defaults to 1.49, Noto Naskh to 1.70).
- No `letter-spacing` on Arabic.

**Scale (px / line-height)**, mobile 390 → desktop 1440:

| Role | Face | Mobile | Desktop |
|---|---|---|---|
| H1 on the board | Rakkas | 40 / 1.2 | 72 / 1.15 |
| Section / season names | Rakkas | 30 / 1.25 | 48 / 1.2 |
| Category strip, tab labels | Rakkas | 20 / 1.3 | 26 / 1.3 |
| Stamp word "باچر" | Rakkas | 28 | 40 |
| Menu item name, price | Noto Naskh 700 | 18 / 1.5 | 22 / 1.5 |
| Size line, body | Noto Naskh 400 | 15 · 17 / 1.8 | 17 · 18 / 1.8 |
| Meta, footnote (minimum) | Noto Naskh 400 | 14 / 1.6 | 14 / 1.6 |

**Numerals:**
- AR pages use `arab` digits everywhere: prices `٥٫٠٠٠`, dates, sizes, the stamp.
- Price columns use `tabular-nums` and sit flush to the end edge. The currency appears once, as a column head ("د.ب"). Each price carries visually hidden "دينار بحريني" plus the `*` demo mark.
- Phone numbers stay Western (`+973 …`) inside `<bdi dir="ltr">`.
- EN pages use `latn` digits and "BD 5.500".
- Preload Rakkas (26 KB) and Noto Naskh (94 KB). Latin files load only through `unicode-range`.

## 4. Logo

- **Arabic wordmark:**
  - حلاوة over البراحة in Rakkas `ss01`, as a two-line shop signboard.
  - حلاوة is set at 1.2× so the two lines share one width. Any remaining gap is closed with kashida after the ح, never tracking.
  - The frame is a double rule in `deep`: two rules each 0.06 A thick with a 0.06 A gap, where A = the alef height of line 2.
- **Latin line:** `HALAWAT AL BARAHA · MUHARRAQ SWEETS` in Young Serif caps, tracked +0.14em, set under the frame at 0.30 A cap height.
- **Mark** (`logo-mark.svg`, favicon): the Rakkas **ح** knocked out of a terracotta rectangular plaque (5:4) hanging from two short cords at the top corners.
  - At 32px and below, the cords are dropped.
  - Dark version: a bg-coloured plaque with a deep-coloured ح (terracotta on deep would be 2.11:1).
- **Clear space:** the full lockup keeps 0.5 A clear on all sides. The mark keeps 25% of the plaque width.
- **Minimum sizes:** full lockup 160px wide; the Latin line is dropped below 160px and the Arabic-only lockup goes down to 110px. Mark 16px. Print: 30 mm.
- All wordmarks are outlined through the harfbuzzjs + bidi-js pipeline (Rakkas needs GPOS `curs`).

## 5. Layout

**Hero archetype, a typographic menu board.** The hero *is* the menu. This is the set's one deliberately text-led site; photos stay small but excellent.

**At 390px:**
1. Demo banner, 40px.
2. Header, 56px: mark plaque (32px) and حلاوة البراحة in Rakkas 22px at the start edge. `EN` and a WhatsApp icon button (both 44×44) at the end edge.
3. The **board**: a `surface` panel inset 16px, with a 6px double `deep` frame and 16px padding. It contains, top to bottom:
   - **Category strip** (the entry points), 48px, scrolls horizontally: `الحلوى · الصواني · مع الچاي · المجالس · المواسم` in Rakkas 20px.
   - **H1 row:** «حلوى المحرق على أصولها» in Rakkas 40px, start-aligned over about 65% of the width. At the end side sits today's tray: a 4:3 cut-out at 132×99. The **باچر stamp** (120×72, rotated −4°) overlaps the cut-out's lower edge.
   - **Subline**, then about **five menu lines** above the fold. Each line has:
     - the name (Noto Naskh 700 18px) over a muted size line
     - a dotted leader on the name baseline
     - the price
     - a 44×44 `+` button with a 2px ink border and 0 radius, which adds the item to the order slip
4. A sticky bottom bar (64px plus the safe-area inset) holds the terracotta button «اطلبوا لباچر على الواتساب». Once items are added it becomes «ورقة الطلب · ٣ أصناف · ١٢٫٥٠٠ د.ب ← كمّلوا», which jumps to `#order`.

**At 1440px:**
- **Header** (72px): the two-line signboard lockup at the start edge; `المنيو · المواسم · التوصيل · عنّا · EN` and a text WhatsApp button at the end edge.
- **Board:** max 1200px, 48px padding.
  - **Top strip:** the category entry points in Rakkas 26px at the start edge. The stamp (200×120, −4°) sits at the end edge and overlaps the frame by 16px.
  - **Next row:** the H1 (Rakkas 72px) spans 7 of 12 columns, with the subline and CTA under it. Today's tray, a 360×270 cut-out, sits in columns 9–12.
  - **Menu:** two columns with a 48px gutter, headed «الحلوى» and «الصواني ومع الچاي». Each column head carries small `الحجم | د.ب` labels, and each column has six leader lines.
  - **Foot strip:** «كل الأسعار بالدينار البحريني · الطلب قبل يوم · استلام من المحرق أو توصيل لكل البحرين» and a link «المنيو الكامل ←».

**Homepage rhythm:**
1. Board hero with the category entry points
2. **Seasons**: full-width tabs رمضان · العيد · العيد الوطني (see §6)
3. **ورقة الطلب**: the order form, with the stamp repeated beside the date field
4. **المجالس**: large-order lines plus one inset photo of the brass-pot halwa
5. **The kitchen**: three short paragraphs and one cut-out
6. **التوصيل**: the zone table set as leader lines, reusing the menu device
7. **Reviews**: four quote lines in one column, labelled «آراء توضيحية»
8. **FAQ**: `<details>` elements
9. **Footer** on `deep`: hours, address, and a CR/سجلي slot («يُضاف عند الإطلاق»)

**Other pages:**
- `/menu`: all four categories as boards
- `/menu/<item>`: sizes, a 4:3 photo up to 420px, ingredients, allergens, keeping time, and a share link
- `/order`, `/delivery`, `/about`, `/gallery`, `/faq`, `/policies`

**Signature: the باچر stamp.** Refined from "بكرة": Bahraini says باچر.
- It is a rubber-stamp date impression with a 3px outer border and a 1px inner border in terracotta, rotated −4°.
- It reads «أقرب طلب · باچر» over «الخميس ٢٤ سبتمبر». After the cutoff it switches to «عقب باچر», and further out it shows the weekday.
- The same `earliestFulfilmentDate()` sets the form's date `min` and its validation, so the stamp *is* the rule.
- It is real text, not an image, in a fixed-size box so there is no layout shift. Without JS it reads «أقرب موعد: بعد يوم من طلبكم».

**Shape language:**
- 0 radius everywhere.
- 2px double signboard rules (`border: 6px double`).
- Dotted leaders are a `muted` 1.5px dot every 6px, `aria-hidden`.
- The rotated stamp border.
- No CSS shadows.

**Motion:** none. The season tab switch is instant, the slip bar appears without a slide, and smooth scrolling is off. `prefers-reduced-motion` has nothing to remove.

**Photography:**
- Warm kitchen tungsten light: glossy halwa, brass and copper pots, saffron.
- Grade: whites neutralised to gypsum (not orange), oranges shifted 3° toward red, saturation −5, blacks lifted +4, fine grain about 6%.
- Everything is 4:3, supplied as background-removed cut-outs on gypsum with a baked contact shadow (≤15%).
- Files are AVIF/WebP with alpha and explicit width/height, lazy below the fold.

## 6. Niche features → engine modules and config

| Brief feature | Module / config |
|---|---|
| **Permanent menu page** | `commerce` catalog: products with `sizes[] {label_ar, label_en, priceFils}` and 4 collections. `hero.variant: "menu-board"`. `ui` gains a `LeaderLine` / `MenuList` primitive. JSON-LD: `Bakery` + `hasMenu → Menu › MenuSection › MenuItem`; item pages add `Product` + `Offer` (`BHD`) |
| **Seasonal sections** | CMS `offers` collection: `season` (`ramadan`, `eid-fitr`, `eid-adha`, `national-day`), `window {opens, lastOrder, serveFrom, serveTo}`, `items[]`. `SeasonTabs` island uses the ARIA tabs pattern; with no JS the sections stack. The default tab is the open window, else the next one. Off-season tabs read «يرجع مع رمضان ١٤٤٨ (حوالي ٨ فبراير ٢٠٢٧)», with Hijri from `islamic-umalqura` and a «حسب رؤية الهلال» note |
| **Minimum 1-day notice in the form** | `commerce/leadTime.ts` → `earliestFulfilmentDate(now, rules, "Asia/Bahrain")`, shared by the stamp and the form. Tests cover: before and after the cutoff, skipping closed dates, category maximums, a visitor in another time zone, and a Ramadan slot that crosses midnight |
| WhatsApp order | `whatsapp` builder: items × size × qty, date + weekday, slot, pickup or zone + fee, estimated total, name, phone, notes; honeypot `website`. The lite tier gets a **multi-item order slip** with no payment and no stock. After opening wa.me the page says «فتحنا لكم الواتساب والرسالة جاهزة، أرسلوها ونرد عليكم خلال ساعة» and never claims the message was sent |
| Share links | Each `/menu/<item>` page has Web Share, falling back to copying the link |
| Analytics | `whatsapp_click`, `slip_add` (maps to add-to-cart), `order_submit` |

```ts
leadTime: { minDays: 1, cutoff: "20:00", perCategory: { majlis: 2 }, perItem: { "watani-50": 3 },
  seasonal: [{ season: "ramadan", cutoff: "23:00" }],
  closedDates: ["2026-12-17", "2027-03-10", "2027-03-11", "2027-05-17", "2027-05-18"] },
delivery: { minOrderFils: 5000, freeOver: { fils: 20000, zones: ["muharraq"] }, zones: [/* §7 */] },
payments: { provider: "none" } // lite; upgrade path to full = Tap/Credimax with BenefitPay
```

Arabic validation messages:
- «أقرب يوم نقدر نجهّز فيه الطلب هو الخميس ٢٤ سبتمبر، اختاروا هذا اليوم أو بعده.»
- «طلبات المجالس تحتاج يومين، أقرب موعد لها الجمعة ٢٥ سبتمبر.»
- «المطبخ مسكّر يوم ١٧ ديسمبر، اختاروا يوم ثاني.»
- «اكتبوا رقم بحريني من ٨ أرقام.»

## 7. Operations (invented, internally consistent)

**Hours (`Asia/Bahrain`):**
- **WhatsApp orders:** daily 09:00–21:00 (Friday 14:00–21:00). The **next-day cutoff is 20:00**.
- **Pickup** in Muharraq (Block 2xx, exact pin added at launch): Saturday–Thursday 10:00–13:00 and 16:00–21:00; Friday 16:00–21:00.
- **Delivery slots:** morning 10:00–13:00 and afternoon 16:00–20:00. Friday has the afternoon slot only.

**Ramadan 1448** (≈8 Feb–8 Mar 2027):
- Orders 12:00–00:30, with a cutoff of 23:00.
- Pickup **19:30–00:30. This window crosses midnight**, so it is stored as `{start: "19:30", end: "00:30", crossesMidnight: true}` on the business day.
- Delivery slots: before iftar 16:00–17:45, and after taraweeh 20:30–23:30.

**Lead times and seasons:**
- **Default:** 1 day.
- **المجالس** items: 2 days, confirmed with a 50% BenefitPay deposit arranged in chat.
- **National Day office plates ×50** (`watani-50`): 3 days.
- **National Day:** pre-orders 1–13 Dec, delivered up to the morning of 16 Dec. The kitchen is closed 17 Dec.
- **Eid al-Fitr** (≈9 Mar 2027 by Umm al-Qura; moon sighting may shift it a day): pre-orders close 27 Ramadan at 23:00. Eid-morning delivery runs 06:30–10:00 on day 1, and the kitchen is closed days 2–3.
- **Eid al-Adha** (≈16 May 2027): pre-orders close 13 May. Morning delivery runs 07:00–10:00 on day 1, and the kitchen is closed days 2–3.

**Delivery (from Muharraq, BHD):**

| Zone | Areas | Fee |
|---|---|---|
| Pickup | Our kitchen, Muharraq | 0.000 |
| المحرق | Muharraq, Hidd, Arad, Busaiteen, Galali, Samaheej, Al Dair | 1.000 (free over 20.000) |
| Muharraq outer | Diyar Al Muharraq, Amwaj | 1.500 |
| Manama | Manama, Seef, Juffair, Adliya, Sanabis, Mahooz | 2.000 |
| Central | Isa Town, Tubli, Sanad, Sitra, Nuwaidrat | 2.500 |
| Outer | Riffa, Hamad Town, A'ali, Budaiya, Saar, Janabiya | 3.000 |
| Far south | Awali, Zallaq, Durrat Al Bahrain, Askar, Jaw | 3.500 |

The minimum order for delivery is 5.000; pickup has no minimum.

**Payment:** cash on pickup or delivery, or BenefitPay once the order is confirmed.

**Policies** (formal-neutral Arabic):
- An order counts as confirmed only after the shop replies on WhatsApp.
- Changes are accepted up to 24h before (48h for majlis orders).
- A deposit is refunded if the order is cancelled at least 24h before, and kept after that because cooking has started.
- Allergens: the kitchen handles nuts, sesame, dairy, eggs and wheat.
- Keeping times: halwa 10 days cool and dry, rangina 5 days, gers ogaili 3 days, khanfaroosh 2 days, balaleet the same day.
- Privacy: form data goes straight into WhatsApp and nothing is stored on the site.

## 8. Content plan

**Collections:** الحلوى (6), الصواني (5), مع الچاي (4), المجالس (4), plus seasonal offers: رمضان (3), العيد (2), العيد الوطني (2). That is **26 items**.

| Example | Collection | Sizes → BHD |
|---|---|---|
| حلوى صفراء بالزعفران | الحلوى | ¼ kg 1.500 · ½ kg 2.750 · 1 kg 5.000 |
| خنفروش بالهيل والزعفران | مع الچاي | dozen 2.000 · tray of 30 4.500 |
| قرص عقيلي | مع الچاي | 22 cm round 3.000 |
| رنقينة بالتمر والسمسم | الصواني | 24 cm 4.000 · 32 cm 7.500 |
| بلاليط بالزعفران مع البيض | الصواني | tray for 4–6 3.500 |
| قدر حلوى المجلس | المجالس | 3 kg 15.000 · 5 kg 24.000 |
| صينية العيد (حلوى، خنفروش، قرص، بلاليط) | العيد | serves 10–12 14.500 |
| علبة الوطني (حلوى حمراء، خنفروش، قرص) | العيد الوطني | box 9.500 (its partner item, صحون الوطني ×٥٠: 50 plates of 80 g halwa, 30.000, 3-day lead) |

AR display renders these as `٥٫٠٠٠`, and every price carries `*`.

**Gallery (10):**
1. Halwa stirred in a copper pot, with steam
2. Saffron and cardamom on a brass tray
3. Khanfaroosh frying
4. Rangina cut into squares
5. The cracked sesame top of gers ogaili
6. Balaleet with an omelette ribbon
7. A dallah and finjan beside a halwa plate
8. Twine-tied boxes stamped with a date
9. Luqaimat with date syrup
10. A National Day tray in red-and-white paper

Licensable photos of these exact sweets are scarce, so some may need commissioned shots or placeholder silhouettes.

**FAQ (AR):**
1. ليش لازم نطلب قبل بيوم؟
2. لين متى نقدر نطلب لباچر؟
3. توصلون لكل مناطق البحرين؟ وكم التوصيل؟
4. كم تقعد الحلوى؟ وشلون نحفظها؟
5. نقدر نطلب كميات كبيرة للمجلس أو العزيمة؟
6. شلون ندفع؟

**Reviews** (4, labelled «آراء توضيحية · نموذج»):
- أم جاسم (Busaiteen): a 5 kg pot for her daughter's ملچة
- عبدالرحمن (Arad): balaleet and khanfaroosh for Eid breakfast
- مريم (Juffair): 50 National Day halwa plates for her office
- حمد (Riffa): saffron halwa every Thursday for his father's majlis

## 9. Voice

| | AR (Bahraini, unisex) | EN |
|---|---|---|
| Hero headline | «حلوى المحرق على أصولها» | "Muharraq sweets, made the old way." |
| Subline | «يا هلا بكم في البراحة. اطلبوا اليوم على الواتساب، ونجهّز طلبكم من باچر لمجلسكم وعزايمكم.» | "Welcome to the square. Order today on WhatsApp and we'll have it ready from tomorrow for your majlis and gatherings." |
| WhatsApp CTA | «اطلبوا لباچر على الواتساب» | "Order for tomorrow on WhatsApp" |

Policy register sample: «تُعدّ الطلبات مؤكدة بعد رد المتجر عبر واتساب، ويجب تقديمها قبل موعد الاستلام أو التوصيل بيوم واحد على الأقل وقبل الساعة الثامنة مساءً بتوقيت البحرين.»

## 10. Remove before finishing

Remove the **vertical double rule between the two desktop menu columns**. The leaders, column heads and the 48px gutter already separate the columns, and a third set of double rules in the hero (after the frame and the tab strip) would crowd the signboard.
