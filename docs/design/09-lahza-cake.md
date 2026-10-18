# 09 · دحين · Dahheen: design plan

Slug `09-lahza-cake` (the slug stays, as in the matrix) · commerce `full` · Jeddah · SAR · `Asia/Riyadh` · Written 2026-09-23 for Step 1 ("Plan first").
**Renamed from لحظة · Lahza** (see §0). Everything else in the 00-matrix row stays as allocated, except the logo mark (§4).

---

## 0. Name check

| Searched | Found | Verdict |
|---|---|---|
| `Lahza cake Jeddah`, `"لحظة كيك" جدة`, `Lahza bakery Saudi Arabia instagram`, `"لحظة" حلويات كيك السعودية انستقرام`, `"لحظة" متجر كيك توصيل نفس اليوم`, `Lahza sweets Kuwait/Dubai/Bahrain/Riyadh` | No cake shop called لحظة in KSA or the GCC | |
| `"لحظة" كافيه OR مخبز OR حلا جدة` | **مقهى لحظة كيف · Cafe Moment** ([momo-cafe.com](https://www.momo-cafe.com/)): a café in the Makkah Clock Tower **with Jeddah branches (Abhur, Yacht Club)**. It serves desserts. Our lockup "لحظة كيك" is **one letter away** from "لحظة كيف" | **Collision**: same city, overlapping dessert niche |
| `lahza_cake OR lahzacake OR "lahza cakes"` | **"Lahza Cakes and Cookies"**, an Iranian packaged-cake maker ([donyaieshirin.com](https://donyaieshirin.com/en/)) | Exact trade name in the same product category (not GCC) |
| `"Lahza" Jeddah restaurant OR cafe OR store` | **Lahza**, a restaurant in Dammam ([facebook.com/LahzaRest](https://www.facebook.com/LahzaRest/)) | A Saudi food business with the same name |

Taken together (the Jeddah dessert café, plus "Lahza Cakes" as an existing brand), this is at least as strong as the evidence that got Sukkariya and Maraya renamed in the matrix. **New name: دحين · Dahheen**, the Hijazi word for "now" (from ذا الحين). "دحين كيك" = "cake, now", which says the positioning in the local dialect.
- Re-check of the new name: `"دحين" متجر OR كيك OR حلويات جدة`, `"دحين كيك" OR "كيك دحين" instagram`, `"دحين" تطبيق OR توصيل OR براند السعودية` and `Daheen cake OR bakery Jeddah` found **no business called دحين**. The only hit was a dialect poll ("الحين ولا دحين ولا ذلحين").
- Latin: `"Daheen" brand/app Saudi` found **دهين · Daheen** ([Google Play](https://play.google.com/store/apps/details?id=com.foodtech.daheen)), a Saudi traditional-banquet restaurant app. That's a different Arabic word and a different niche, but to avoid a near-identical Latin name we spell ours **Dahheen**, following the Hijazi pronunciation *daḥḥīn*. The session's search budget ran out before "Dahheen" itself could be searched (see open items).

## 1. Identity

| | |
|---|---|
| Name | **دحين** · **Dahheen**. Lockup: **دحين كيك / DAHHEEN CAKE · JEDDAH** |
| Meaning | "Now" in Hijazi: cakes for right now |
| Positioning | AR: **كيك جاهز في جدة: اطلب قبل ٣ العصر ويوصلك اليوم.** EN: **Ready-made cakes in Jeddah: order before 3 pm and it's at your door today.** |
| Audience | Jeddah residents who need a cake today: last-minute birthdays, office farewells, surprise visits. They're on a phone, in a hurry, and choosing by district fee and the earliest delivery window |
| Preset / tier | commerce `full`: cart, checkout (Moyasar adapter, MockProvider in the demo), district delivery fees, delivery windows with caps, daily stock, orders dashboard |
| Place | Shop and kitchen in حي الروضة, جدة · Saudi Arabia · SAR (2 decimals, stored in halalas) · `Asia/Riyadh` (UTC+3, no DST) |
| Dialect | Hijazi, quick and friendly (دحين، إيش رأيك، يوصلك، كدا، مرّة، لحد). **Unisex rule:** no gendered imperatives. Use nouns and verbal nouns ("إضافة للسلة", "الطلب واتساب"), first-person plural ("نكتب، نوصّل") and undiacritised ـك, which reads as either gender |

## 2. Palette (T structure: tinted ground and accent). Hexes as allocated, unchanged

| Token | Hex | Share | Use |
|---|---|---|---|
| `bg` butter | `#F2DE96` | ~55% | Page ground, masthead, card fill behind cut-outs |
| `surface` cream | `#FAF2D2` | ~15% | Forms, cart drawer, FAQ, text on teal and espresso |
| `ink` | `#231A13` | ~12% | All text, 3px borders, 6px section rules, the card offset shadow |
| `muted` | `#5A4B30` | ~5% | Secondary text, sold-out labels (always struck through, with a text label too) |
| `accent` Red Sea teal | `#0B676C` | ~4% | Primary buttons, links (underlined), selected district and window, focus ring on light grounds. **Never on espresso** |
| `accent-hover` | `#095A5E` | n/a | Hover and pressed teal (surface text on it: 7.09) |
| `line` | `#D6BF6E` | ~2% | Decorative hairlines and table zebra only. Input borders use `ink` |
| `deep` espresso block | `#2B2118` | ~7% | Urgency and reversed blocks: the last-call masthead, the header clock chip, stock tags ("باقي ٣"), the fee panel, the footer |

Urgency is shown by a reversed espresso block, never red. Errors don't use red either: the field border goes to 4px ink, a reversed espresso tag reads "تنبيه", and the message says exactly what to fix. Success uses teal.

**Contrast (WCAG 2.x, computed with node):**

| Pair | Ratio | Needs | Use |
|---|---|---|---|
| ink / bg | 12.75 | 4.5 | body |
| ink / surface | 15.22 | 4.5 | body |
| muted / bg | 6.31 | 4.5 | secondary text |
| muted / surface | 7.53 | 4.5 | secondary text |
| accent / bg | 4.94 | 4.5 | links (underlined), teal text; teal UI vs ground (3:1) |
| accent / surface | 5.90 | 4.5 | links in forms |
| surface on accent | **5.90** | 4.5 | **button text** (bg on accent is 4.94, white 6.62; surface chosen) |
| surface on accent-hover | 7.09 | 4.5 | hover and pressed |
| bg on deep | 11.75 | 4.5 | reversed blocks, butter focus ring on espresso |
| surface on deep | 14.02 | 4.5 | footer body |
| line on deep | 8.65 | 4.5 | secondary text on espresso |
| accent / deep | **2.38** | n/a | **forbidden** |
| line / bg | 1.36 | n/a | decorative only |

## 3. Type

| Role | Arabic | Latin (runs set Latin-first in the stack) |
|---|---|---|
| Display: masthead clock, wordmark, poster heads, big fee numerals | **Alyamama** 800/900 (advertising Naskh, VF 300–900) | **Alegreya** 800, italic 800/900 for accents and the Latin wordmark |
| Body, UI, prices, forms | **Beiruti** 400/600 (compact sans, VF 200–900) | **Afacad** 400/600 |

**Why this pairing** (measured in research §A5):
- **Alyamama ↔ Alegreya:** alef 0.647 against cap 0.646, so the Latin runs at scale 1.00. Body-to-x 0.84; stems 0.069 vs 0.071. Both have calligraphic stress, which suits a loud poster voice.
- **Beiruti ↔ Afacad:** alef 0.631 against cap 0.625, so `--latin-scale: 1.01`. Body-to-x 0.93; stems 0.064 vs 0.066.
- Beiruti's alef is short, so Arabic body text runs 1px larger with line-height 1.65.
- No letter-spacing on Arabic.

**Scale (mobile 390 → desktop 1440):**

| Role | Size |
|---|---|
| Clock | `clamp(88px, 28vw, 400px)` / lh 0.9 (at 390px: digits and seconds ≈ 344px in a 358px row) |
| Poster head (Alyamama 800) | 44 → 96 / 1.1 |
| H1 | 34 → 64 |
| H2 | 26 → 40 |
| H3 (Beiruti 600) | 20 → 24 |
| Body | 17 → 18 / 1.65 |
| UI and labels (Beiruti 600) | 15 → 16 / 1.4 |
| Meta | 14 (Arabic floor) |
| Price (Beiruti 600) | 20 → 22 |
| Fee numerals (Alyamama 900) | 56 → 88 |

**Numerals (verified with fontTools today):**
- `numberingSystem: "arab"` in Arabic, `latn` in English.
- Beiruti and Alyamama both have ٫ ٬ ٪ ، ؟. Prices look like ١٢٥٫٠٠, built from `Intl` `formatToParts('ar-SA')` with the currency part swapped for the **riyal SVG** (`aria-label="ريال سعودي"`). Beiruti lacks U+20C1.
- Alyamama has U+20C1. It may be used only in the big Alyamama fee numerals, with a visually hidden "ريال" next to it.
- **Neither Arabic face has tabular Arabic-Indic digits.** Alyamama's advances run 301–606, and its `tnum` only maps Latin old-style figures. So the clock puts each digit in a fixed cell: `inline-size: 0.62em; text-align: center`, colon cell 0.26em, the whole run `dir="ltr"` and isolated. That is how "oversized tabular numerals" gets built.
- The English clock uses Alegreya with `lining-nums tabular-nums` (verified: 450-unit `.tf` figures; Alegreya's default figures are old-style).
- Afacad's figures are tabular by default.
- Phone numbers and the national short address are shown in Latin digits, isolated, because people copy them into other apps.

## 4. Logo

- **Arabic wordmark:** دحين in Alyamama 900, outlined through the harfbuzzjs pipeline and set tight (no kashida). The ح's long head stroke leads into ـيـ, whose two diamond dots and the ن's diamond dot are Alyamama's own. One colour, espresso, so it prints on box stickers.
- **Latin:** *Dahheen* in Alegreya 900 italic, sitting under the Arabic and aligned to its inline-start. Descriptor line `CAKE · JEDDAH` in Afacad 600 caps, +0.16em tracking (Latin only). Arabic descriptor: كيك · جدة in Beiruti 600.
- **Mark: "the quarter slice."**
  - A butter square with a 3-unit espresso border (on a 48 grid) holds an espresso disc: a cake seen from above.
  - The disc's 12-to-3 quarter is cut and pulled 3 units out along the 1:30 diagonal, and that slice is teal.
  - It reads as a clock at a quarter past and as a slice being served.
  - Variants: dark (a butter disc and cream slice on espresso, no border) and one-colour (the slice outlined).
  - *Why not the allocated "ظ upright as hand":* دحين has no ظ. Its د and ن are already the devices of 06 (a square debossed with د) and 02 (a ن tile), so a letter mark would fail the swap test. No other site has a sector or slice mark (08's mark is stacked layers, side-on).
- **Clear space:** ½ the mark's width on every side.
- **Minimum size:**
  - Lockup: 128px wide on screen, 32mm in print.
  - Wordmark alone: 72px.
  - Mark: 16px. At 24px or smaller the slice gap widens to 2px and the border thins to 1.5px.

## 5. Home page

**Hero at 390px** (header 56, sticky category rail 44):
- **Masthead** on butter, 16px gutters:
  - باقي in Alyamama 800 at 40px, anchored to the start edge.
  - The clock ٠٢:١٤ in Alyamama 900 at about 109px, spanning the width, with the seconds ٣٧ at ⅓ size on the digits' baseline.
  - على آخر طلب اليوم at 28px, anchored to the end edge. Start-top to end-bottom is a deliberate diagonal, not a centred stack.
- Under it, one Beiruti line, "توصيل اليوم لكل أحياء جدة، الرسوم من ١٥ ر.س", and a `اختر حيّك` select (44px). Choosing a district replaces the line with that district's fee and earliest window.
- Next, the **جاهز الآن strip**:
  - About 2.2 cards visible, 168px wide, snap scroll.
  - Each card: 1:1 cut-out on butter, 3px ink border, 4px hard offset shadow.
  - Name (2 lines), price with the riyal icon, and a reversed "باقي ٣" tag.
- **Sticky bottom bar:** `واتساب` (outline) and `السلة · ٢ · ٢٣٧٫٠٠` (teal; items subtotal), 56px, with a 3px ink top rule.

**Hero at 1440px** (content 1320, 60px gutters):
- The header (72) holds the lockup, search, and the header clock chip (hidden while the masthead is on screen), then the category rail (48) between 3px rules.
- **Masthead:** باقي at 96px at the start. The clock digits at 400px fill about 1230px of the 1320 row. على آخر طلب اليوم at 64px at the end, and a small line "آخر طلب لتوصيل اليوم الساعة ٣:٠٠ العصر · الثلاثاء ٢٣ سبتمبر".
- The row below splits in two:
  - At the inline-start, the جاهز الآن strip: 5 cards of 240px, with square 44px prev/next buttons.
  - At the inline-end, a 320px espresso **fee panel**: district select, the 4 zone fees and the next free window. The selected zone gets a butter fill with ink text, because teal is barred on espresso.
- At 1440×900 the strip's top ~200px sits above the fold.

**Category entry points** (top of the page, a text rail with no icons):
- **جاهز الآن (١٤)** · كيك مدوّر · تشيز كيك · صواني المكتب · كب كيك وميني · الإضافات
- Items are split by 3px vertical ink rules, and the active one gets a teal 3px underline.
- "جاهز الآن" is a live stock filter, not a collection.

**Layout rhythm** (poster pattern: big type / tight strip / big type, split by 6px ink rules, with anchoring alternating start and end):
1. Countdown masthead (big type, start→end diagonal)
2. جاهز الآن strip and the district-fee line (tight)
3. **Big type, end-anchored:** "نكتب على الكيكة أي اسم، مجاناً". A static flash photo of piped Arabic writing and the rule line (up to ٢٥ حرف، ٣ ألوان). **No live preview**, which is 06's device.
4. Strip: the best-selling round cakes (tight)
5. **Big type, start-anchored:** "رسوم التوصيل حسب الحي". Four zone rows with Alyamama 900 fee numerals, district names in Beiruti, and a district search.
6. Strip: office trays and cupcake boxes (tight)
7. **Big type, end-anchored:** "فاتك الوقت؟". Explains pickup until 22:30, next-day delivery, and the hours table with its cross-midnight nights.
8. Strip: 4 reviews, labelled **تقييمات توضيحية**
9. FAQ (6), then the espresso footer: hours, address, CR number, VAT number and SBC e-commerce authentication slots, policies, WhatsApp, demo credit

**Shape language:**
- 0 radius everywhere.
- 3px ink borders on cards, inputs and buttons. Buttons are 52px tall.
- The **hard 4px offset shadow sits on product cards only**: `4px 4px 0 ink`, mirrored under `[dir=rtl]` to `-4px 4px 0`. On press it drops to 2px, instantly.
- Section rules are 6px. Numerals are oversized. No icons in circles, no gradients.

**Motion:**
- The clock swaps text once a second from a timer aligned to the second boundary, with no tween. It pauses on `visibilitychange`.
- State changes are instant.
- Strips use native scroll snap. Nothing animates on scroll.
- `prefers-reduced-motion`: HH:MM only, updated on the minute, seconds hidden.

**Photography:**
- Hard midday sun or on-camera flash, crisp 45° shadows, saturated cake colour. Neutral-warm white balance, highlights may clip slightly, no soft window light (that belongs to 08 and 12).
- Products are **1:1 cut-outs on `#F2DE96`** (the card supplies the only shadow). Lifestyle shots are 4:5.
- Sources: Unsplash/Pexels with credits in `docs/image-credits.md`, or generated silhouettes. WebP/AVIF, explicit sizes, lazy below the fold.

## 6. Signature: the cutoff clock

One island (vanilla, <2 KB) renders it in the **masthead, the header chip and checkout**. All times are computed in `Asia/Riyadh` with `Intl`.
- The phone's clock skew is corrected from the `Date` header of a `HEAD /` request.
- The checkout function **re-validates the cutoff on the server**, so a wrong phone clock can't book a same-day window.
- Without JS, a static line fills the same reserved box (no CLS): "آخر طلب لتوصيل اليوم الساعة ٣:٠٠ العصر".

| State | When (Sat–Thu; Fri cutoff 17:00) | Masthead shows |
|---|---|---|
| `sameDay` | 00:00 → cutoff − 30 min | باقي ٠٢:١٤:٣٧ على آخر طلب اليوم |
| `lastCall` | last 30 min | The masthead **inverts to an espresso block**, butter digits, "آخر نص ساعة" |
| `pickupOnly` | cutoff → last pickup (22:30; Thu/Fri 23:30) | باقي ٠٧:١٢ على آخر استلام من المحل. Chip: "التوصيل: بكرة من ١ الظهر". Cards switch to tomorrow's stock |
| `nextDay` | last pickup → 00:00 | No countdown. Big type: "بكرة ١–٣ الظهر" (Fri: "٧–٩ م"). Ordering stays open |

- If the state changes during checkout, a blocking notice appears: "الساعة صارت ٣:٠٠، طلبك بيوصل بكرة ١–٣ الظهر. نكمّل؟". It needs explicit confirmation; nothing moves silently.
- The ticking digits carry no `aria-live`. The container's `aria-label` updates each minute ("باقي ساعتين و١٤ دقيقة…"), and state changes are announced once through a polite live region.

## 7. Niche features → engine config (`sites/09-lahza-cake/site.config.ts`)

```ts
fulfilment: {
  timezone: 'Asia/Riyadh',
  hours: { satWed: ['10:00','23:30'], thu: ['10:00','00:30+1'], fri: ['16:00','00:30+1'] }, // +1 = next calendar day
  sameDay: { cutoff: { default: '15:00', fri: '17:00' }, lastCallMinutes: 30 },          // cutoffClock module
  leadMinutes: { delivery: 120, pickup: 30 },   // prep (writing included) + dispatch
  pickup: { lastBeforeCloseMinutes: 60, payAtCounter: true },
  windows: { default: ['13-15','17-19','19-21','21-23'], fri: ['19-21','21-23'], capPerWindow: 10 },
},
shipping: { mode: 'district', minOrder: 7500, freeOver: { amount: 25000, zones: [1, 2] },  // halalas
  zones: [{ id: 1, fee: 1500 }, { id: 2, fee: 2000 }, { id: 3, fee: 3000 },
          { id: 4, fee: 4500, extraLeadMinutes: 60 }] },   // district lists in CMS (§8)
catalog: { stock: 'daily',                      // per-day counts, reset at opening; "باقي n" at ≤5; 0 → tomorrow only
  writing: { maxChars: 25, countBy: 'grapheme-no-diacritics', colours: ['شوكولاتة','أبيض','وردي'], price: 0 } },
checkout: { fields: ['recipientName','phoneSA','district','shortAddress?','mapLink?','window','surprise','giftNote?'] },
payments: { provider: 'moyasar', fallback: 'tap', mode: 'mock', methods: ['mada','applepay','stcpay','card'] },
```

- **Text on the cake:** allowed on round cakes, cheesecakes and trays, not cupcakes. Limit 25 characters, with a live counter. Arabic, Latin, digits and « » ! ، . are allowed; emoji are blocked.
  - Error example: "الكتابة ٢٩ حرف، والحد ٢٥. اختصرها شوي".
  - The text appears in the cart, the WhatsApp message and a **printable piping ticket** in the orders dashboard.
- **Windows:** a window is offered when `start ≥ now + lead (+ zone extra)` and it is under its cap. A full window shows "مكتمل". Delivery routes are fixed at the cutoff.
- **Stock:** demo stock lives in Netlify Blobs (`stock/2026-09-23.json`, `caps/2026-09-23.json`), and `full` stock goes in Supabase `inventory_daily`. Owners set "كمية اليوم" in the CMS, and the dashboard has a one-tap "خلص".
- **Other fields:**
  - Phone: `05xxxxxxxx` or `+9665…`, normalised to Latin digits for `wa.me`.
  - Surprise toggle: the driver calls the sender, not the recipient.
  - National short address (optional, e.g. `RJHA1234`, 4 letters + 4 digits).
- **Orders dashboard:** today's orders grouped by window, the cake text in large type, and statuses جديد → يُجهَّز → مع السائق → وصل.
- **Test cases for Step 2:**
  - 14:59:59 vs 15:00:00.
  - Friday's 17:00 cutoff.
  - **Friday 00:15:** still Thursday's open session, but Friday same-day delivery is available with 16h 45m on the clock.
  - The zone 4 lead.
  - Stock at 0.
  - The free-delivery threshold is computed on the items subtotal, before the fee.
  - VAT is included; the VAT share is total × 15/115, rounded once to the halala in the engine.
- **SEO:** `Bakery` JSON-LD with `openingHoursSpecification` (closes 00:30 on Thu/Fri), `areaServed` listing the districts, and `Product` offers in SAR. `og:locale` is `ar_SA`, with `en_US` as the alternate.

## 8. Operations

| Day | Shop and pickup | Same-day cutoff | Delivery windows |
|---|---|---|---|
| Sat–Wed | 10:00–23:30 (last pickup 22:30) | 15:00 | ١–٣ م · ٥–٧ م · ٧–٩ م · ٩–١١ م |
| Thu | 10:00–**00:30** (crosses midnight; last pickup 23:30) | 15:00 | same |
| Fri | 16:00–**00:30** (crosses midnight; kitchen from 13:30; last pickup 23:30) | 17:00 | ٧–٩ م · ٩–١١ م |

Online ordering is open 24/7 and always offers the next valid window. The 15:00–17:00 gap is route planning and the second bake.

| Zone | Fee | Districts |
|---|---|---|
| ١ | ١٥٫٠٠ | الروضة، الزهراء، الخالدية، السلامة، النهضة، الفيصلية |
| ٢ | ٢٠٫٠٠ | الشاطئ، النعيم، المحمدية، البساتين، المرجان، الأندلس، الرحاب، الصفا، المروة، الحمراء، مشرفة |
| ٣ | ٣٠٫٠٠ | البلد، الشرفية، البغدادية، الرويس، العزيزية، الربوة، النسيم، الفيحاء، السامر، الأجواد |
| ٤ | ٤٥٫٠٠ | أبحر الشمالية، أبحر الجنوبية، ذهبان، الحمدانية، الصالحية. Lead +60 min, so the ١–٣ window only for orders by 10:00 |

- Free delivery on items of **٢٥٠٫٠٠ or more** in zones 1–2. The delivery minimum is ٧٥٫٠٠. Districts outside the list get pickup or WhatsApp.
- **Policies** (formal Arabic pages):
  - Prices include 15% VAT, with slots for the VAT and CR numbers.
  - Payment is online (mada, Apple Pay, STC Pay, cards). Paying at the counter is for pickup only.
  - **Free cancellation until 2 hours before the window starts.** After that, cakes with writing aren't refunded; others get 50% back.
  - Refunds go to the original method (mada 1–3 business days, cards 7–14).
  - Damage: a photo within 2 hours of delivery gets a replacement or a refund.
  - If the recipient can't be reached for 15 minutes, the cake returns to the shop, with pickup until close or re-delivery at the zone fee.
  - Allergens: all cakes contain gluten, milk and egg, and the kitchen handles nuts. Refrigerate and eat within 48 hours.

## 9. Content plan

**24 products in 5 collections:**
- كيك مدوّر (Round cakes) ×9
- تشيز كيك (Cheesecakes) ×4
- صواني المكتب (Office trays) ×4
- كب كيك وميني (Cupcakes and minis) ×4
- الإضافات (Add-ons) ×3

Round cakes come in 16cm (serves 6–8) and 22cm (serves 12–16).

| Item | Price (SAR, VAT incl.) |
|---|---|
| كيكة الفانيلا والتوت | ١٢٥٫٠٠ / ١٩٥٫٠٠ |
| كيكة الشوكولاتة الغامقة (فدج) | ١٣٩٫٠٠ / ٢١٥٫٠٠ |
| كيكة الحليب بالزعفران والهيل | ١٤٥٫٠٠ / ٢٢٥٫٠٠ |
| ريد فلفت بكريمة الجبن | ١٣٥٫٠٠ / ٢٠٩٫٠٠ |
| تشيز كيك اللوتس (٢٠ سم) | ١٤٩٫٠٠ |
| صينية كيك المكتب ٣٠×٤٠ (٢٤ قطعة، نص فانيلا ونص شوكولاتة) | ٢٧٩٫٠٠ |
| علبة كب كيك ١٢ حبة | ٨٩٫٠٠ |
| شمعة أرقام | ٦٫٠٠ للرقم |

**Worked order (the WhatsApp builder's test fixture):**
- Saffron cake, 22cm: ٢٢٥٫٠٠
- 2 number candles: ١٢٫٠٠
- Items subtotal ٢٣٧٫٠٠, which is under ٢٥٠, so the zone 2 fee applies: ٢٠٫٠٠
- **Total ٢٥٧٫٠٠**, of which VAT ٣٣٫٥٢
- Text on the cake: «كل عام وأنت بخير يا ريم» (23 of 25 characters)

**Gallery (10):**
1. A cut saffron-cardamom slice under flash at 45°
2. Piped Arabic writing on ganache, from above
3. A cake box with a teal sticker handed through a car window at night (hands only)
4. An office desk with a tray cake and paper plates
5. The جاهز الآن display fridge
6. Number candles 2 and 5
7. An open box of 12 cupcakes, from above
8. A delivery bag at a Jeddah apartment door
9. Lotus cheesecake on butter paper with a hard shadow
10. A red velvet slice on a balcony, with rawasheen lattice shadow (the teal story)

**FAQ (Arabic, Hijazi-light):**
1. لو طلبت بعد ٣ العصر، متى توصل الكيكة؟
2. كم رسوم التوصيل لحيّي؟ وفيه توصيل مجاني؟
3. تكتبون على الكيكة؟ كم حرف أقدر أكتب؟
4. أقدر أستلم من المحل بنفسي؟ لحد متى؟
5. الكيك فيه مكسرات أو جلوتين؟ وكيف أحفظه؟
6. أقدر أغيّر الموعد أو ألغي الطلب بعد الدفع؟

**Reviews** (4, each marked **تقييم توضيحي**):
1. هـ.، الشاطئ: an administrative assistant who ordered an office tray at 1:40 pm for a farewell; it arrived 5:30.
2. ع.، النهضة: forgot his sister's birthday, ordered at 2:52 with the clock showing 8 minutes left; it arrived before 8.
3. أم فيصل، أبحر الجنوبية: surprise guests; ordered at 9:50 am, got the ١–٣ window and paid the zone 4 fee.
4. ر.، الزهراء: a student who picked up cupcakes at 10 pm, after the cutoff.

## 10. Voice

| Where | Hijazi (unisex) | English |
|---|---|---|
| Hero headline | **قبل ٣ العصر؟ الكيكة توصلك اليوم.** | Before 3 pm? Your cake arrives today. |
| Subline | كيك جاهز كل يوم، نكتب عليه أي اسم، ونوصّله لحيّك. إيش رأيك في الموجود دحين؟ | Cakes ready every day. We'll write any name on top and bring it to your district. Fancy what's ready right now? |
| WhatsApp CTA | سؤال سريع؟ واتساب، ونرد على طول. | Quick question? WhatsApp us, we reply straight away. |
| After cutoff | فاتك توصيل اليوم؟ الاستلام من المحل متاح لحد ١٠:٣٠ بالليل، والتوصيل بكرة من ١ الظهر. | Missed today's delivery? Pick up at the shop until 10:30 pm, or get it delivered tomorrow from 1 pm. |

Policy pages use formal-neutral Arabic, for example: "تُقبل طلبات التوصيل في اليوم نفسه حتى الساعة ٣:٠٠ مساءً بتوقيت الرياض، ويُحدَّد موعد التوصيل من الفترات المتاحة وقت إتمام الطلب."

## 11. Remove before finishing

**The 6px ink rule between the masthead and the جاهز الآن strip.** The strip's bordered, shadowed cards already make that break. Keep rules only between the big-type sections.

## Open items for review

- Approve the rename لحظة → دحين. If approved, update row 09 and the logo-mark table in `00-distinctness-matrix.md`.
- The spelling "Dahheen" wasn't searched separately (search budget exhausted). The fallback is "Dahhin".
- Confirm the riyal-symbol placement (before or after the figure) against SAMA's usage guidelines at build time.
- Ramadan hours (a cross-midnight override) aren't specified yet.
