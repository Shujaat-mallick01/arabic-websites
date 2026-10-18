# 04 · رازقي · Raziqi Boutique: design plan

Step 1 ("Plan first") of `arabic-websites-master-prompt.md`. Written 2026-09-23. The allocation comes from `00-distinctness-matrix.md` and this plan refines it. The folder slug stays `04-rayman-boutique`.

## 1. Identity

| | |
|---|---|
| Name | **رازقي** · **Raziqi**. Lockup: رازقي بوتيك / RAZIQI BOUTIQUE · BAGHDAD |
| Meaning | Arabian jasmine (*Jasminum sambac*), Baghdad's summer flower that gets strung into necklaces. The brand is small, fragrant and local, and its pieces get handed from friend to friend. |
| Positioning (EN) | Baghdad boutique pieces with the price on every tag, delivered to every governorate, and you pay cash when it arrives. |
| Positioning (AR) | قطع بوتيك بغدادية، سعر كل قطعة مكتوب عليها، توصلچ لأي محافظة وتدفعين كاش من تستلمين. |
| Audience | Iraqi women aged 18–35 in Baghdad and the provinces. They shop from Instagram on their phones, pay cash on delivery, watch prices closely, and send a piece to friends before they buy it. |
| Preset / tier | commerce · `full`. Cash on delivery is the primary payment method |
| Place | Iraq · Baghdad, Al-Mansour (showroom near شارع 14 رمضان) · **IQD** (0 decimals) · `Asia/Baghdad` (UTC+3, no DST) · locale `ar-IQ-u-nu-latn` |
| Dialect | Iraqi Baghdadi, feminine and warm (شگد، هواية حلو، حبيبتي، هسه، دزّي). Copy uses چ گ پ freely. Policy pages are in formal-neutral Arabic. |

**Name check (2026-09-23): the name stays.** I ran nine web searches: "Raziqi" boutique, رازقي بوتيك, رازقي + ملابس/ازياء/فساتين/عبايات/بغداد, "Raziqi/Razqi" + fashion Iraq, and "Raziqi Boutique/store". None found a women's-clothing business called رازقي or Raziqi in Iraq or the GCC. Other businesses do use the word:
- **رازقي كهوة وفرن** (@razqi.iq), a café and bakery in Najaf, Iraq
- **@_razqi**, a gifts-and-flowers Instagram account with 515 followers and no posts since Oct 2023, location not given
- restaurants called رازقي in Muharraq and Saihat, a chalet (@razqi_chalet), a supermarket app, and Yemeni رازقي raisins
- "رزق بوتيك" in Jeddah, which is a different word (رزق)

These are unrelated niches using a common flower or raisin name, so the rule allows it. **Mitigation:** never use the spelling "razqi" for handles or domains; use `raziqi` (for example `@raziqi.boutique`), and always show the Arabic wordmark with بوتيك. The demo also carries the نموذج مبدئي marker.

## 2. Palette (L structure, warm)

| Role | Hex | Share of the page | Use |
|---|---|---|---|
| `bg` sand | `#EBDBBE` | 60% | page ground, rail sections |
| `surface` | `#F7EFE0` | 20% | cards, delivery table, drawers, checkout sheet, text on tags |
| `ink` indigo-black | `#1B1A27` | 10% | text, the rail line (2px), focus ring |
| `muted` | `#574C3B` | 3% | meta text, sizes, input borders, dashed strings |
| `accent` Ishtar lapis | `#2447A8` | 6% | swing tags, rail labels, primary CTA fill, 2px outline buttons, links. This is the only saturated blue accent in the set. |
| `line` | `#D3BF99` | 1% | decorative hairlines only. It is never used for input borders |
| `deep` lapis | `#17337A` | <1% | hover and pressed states, the tag's folded corner, the dark logo ground |
| `error` (functional) | `#9B2C1F` | validation only | form errors, always paired with an icon and text. It is not a brand colour |

No gold, no gradients, no hard offset shadow (site 09 owns that). The tag's depth comes from a folded corner in `deep`.

**Contrast (WCAG 2.x, computed with node):**

| Pair | Ratio | Need | |
|---|---|---|---|
| ink on bg / surface | 12.59 / 15.02 | 4.5 | pass |
| muted on bg / surface | 6.16 / 7.34 | 4.5 | pass |
| accent (links, rail labels, outline buttons) on bg / surface | 6.06 / 7.23 | 4.5 | pass |
| deep on bg / surface | 8.60 / 10.26 | 4.5 | pass |
| surface on accent (tag price, primary button text) | 7.23 | 4.5 | pass |
| surface on deep (hover, pressed) | 10.26 | 4.5 | pass |
| white on accent / deep | 8.26 / 11.73 | 4.5 | pass |
| error on bg / surface | 5.56 / 6.63 | 4.5 | pass |
| muted on line (text on the table's zone header) | 4.67 | 4.5 | pass |
| accent tag or input border (muted) against bg (non-text) | 6.06 / 6.16 | 3.0 | pass |
| line on bg / surface | 1.32 / 1.57 | n/a | decorative only |
| ink on accent | 2.08 | n/a | **never used**. The focus ring sits 2px outside buttons, so it contrasts with bg (12.59) |

## 3. Type

| Role | Arabic | Latin (EN pages) |
|---|---|---|
| Display, rail labels, wordmark | **El Messiri** 700 (VF 400–700; 600 for h3) | **Philosopher** 700 (El Messiri's own Latin) |
| Body, UI, prices, tables | **Almarai** 400 / 700, and **800 for tag prices only** | **Outfit** 400 / 600, with 700 for tag prices (same variable file) |

**Coverage (fontTools on the pinned google/fonts TTFs):** El Messiri, Almarai 400 and Almarai 800 all contain پ چ گ ڤ, ٫ and ٬. None of the three has U+200F, so the price formatter strips the RLM that Intl emits. **Almarai's digits are proportional and it has no `tnum`**, so table figures align on their end edge and nothing claims tabular numerals. I shaped رازقي, a شگد line, a چ line and a پ line with HarfBuzz: every joining is correct.

**Why this pairing:** El Messiri's alef and Philosopher's caps are both 0.660 em, and both stems measure 0.090, so they pair at 100%. Almarai (alef 0.716, body/x 0.99, stem 0.085) pairs with Outfit (cap 0.694, stem 0.090) at a Latin scale of **103%** (`--latin-scale: 1.03`). El Messiri's naskh brush curves carry the boutique warmth. Almarai's even, open strokes stay legible at 14px in the evening, on a phone, at low brightness.

| Token | Face / weight | 390px (size / line height) | 1440px | Used for |
|---|---|---|---|---|
| `display` | El Messiri 700 | 40 / 1.3 | 72 / 1.25 | hero H1 (2 lines max) |
| `rail-label` | El Messiri 700, lapis | 34 / 1.15 | 56 / 1.1 | وصل جديد، فساتين، أطقم… |
| `h2` | El Messiri 700 | 26 / 1.35 | 36 / 1.3 | delivery table, FAQ, reviews |
| `h3` | El Messiri 600 | 20 / 1.4 | 24 / 1.4 | product name on the product page |
| `body` | Almarai 400 | 16 / 1.8 | 17 / 1.8 | copy, descriptions |
| `ui` | Almarai 700 | 15 / 1.5 | 15 / 1.5 | buttons, chips, card names |
| `small` | Almarai 400 | 14 / 1.6 | 14 / 1.6 | meta, footnotes (the floor; nothing smaller) |
| `price-tag` | Almarai 800 | 20 / 1 (د.ع at 12) | 22 / 1 (د.ع at 13) | swing tag |
| `price-inline` | Almarai 700 | 16 | 17 | cart, table, checkout |

**Numerals: `latn`** (the Iraqi Instagram norm). The formatter is `Intl.NumberFormat('ar-IQ-u-nu-latn', {style:'currency', currency:'IQD'})`, which returns `‏45,000 د.ع.‏`; `formatToParts` re-renders that as **45,000 د.ع** with the trailing dot and marks removed and the number in `<bdi>`. Money is stored in whole dinars, using the project exponent table with `IQD: 0`. Month names come from `ar-IQ` (أيلول، تشرين الأول), which is correct for Iraq. Hijri is off. **Payload:** El Messiri VF (Arabic subset, 22 KB), Almarai 400 and 700 (32 KB each), and Almarai 800 subset to digits plus `, د ع .` (about 4 KB). Outfit and Philosopher load on `/en` only.

## 4. Logo

- **Arabic wordmark:** رازقي in El Messiri 700, outlined. In this word the ق is in its initial form; El Messiri draws its head as a closed round counter. The head is redrawn as an **open loop, like a tag string tied off**: the counter breaks at its top inline-end, and the stroke thins to half a stem and crosses itself. The two dots stay. The ي return tail stays as drawn.
- **Latin lockup:** "Raziqi" in Philosopher 700, with "BOUTIQUE · BAGHDAD" in Outfit 600 caps, tracked +0.16em, at 30% of the wordmark height. The Arabic descriptor is بوتيك · بغداد in Almarai 700. In the horizontal lockup the mark sits at the inline-start, then the Arabic wordmark, a 1px `muted` rule, and the Latin stack.
- **Mark (favicon, avatar):** a lapis swing tag in a 3:4 portrait, with its top inline-start corner clipped at 45° and the fold shown in `deep`. A **five-petal jasmine blossom** is punched out as the hole, with a short dashed string loop. At 24px and below, the hole becomes a plain circle and the string is dropped.
- **Clear space:** H/2 on every side (H = mark height). For the wordmark alone, use the height of the alef in رازقي. **Minimum sizes:** full lockup 128px wide (32 mm in print), wordmark alone 64px, mark 16px (favicon cut).
- **Files:** `logo-light` has an ink wordmark and a lapis mark on sand. `logo-dark` has a surface wordmark and a surface-outline tag on `deep`.

## 5. Hero, layout, signature

**Hero archetype: clothes-rail shelf.**

- **390px (844 tall):**
  1. Demo banner (36px).
  2. Header (56px): wordmark, cart with count, menu.
  3. **Category tag row** (52px): small notched surface chips with a `muted` outline, scrolling sideways. The chips are وصل جديد، فساتين، أطقم، بلوزات وتنانير، دشاديش وپيجامات، جنط. The active chip is filled lapis.
  4. **COD band**: a flat lapis notched strip, not rotated, reading الدفع كاش عند الاستلام · تفتحين الطرد قبل ما تدفعين. It is deliberately not a rubber stamp; site 07 owns the stamp.
  5. The H1 (2 lines) and a 15px subline, aligned to the start edge.
  6. The **rail**: a 2px ink line runs edge to edge, with small wall brackets at both ends. The وصل جديد pieces hang from it on hooks. Each card is 72vw wide with a 4:5 photo at 8px radius. Its **swing tag** hangs on a dashed string from the top inline-end corner and overlaps the photo edge by about 40%. Below the photo sit the name and the sizes. The next card peeks in about 18vw from the inline-end, which tells the visitor to swipe.
  7. The first card fits completely above the fold (about 800px).
- **1440px (container 1320):**
  1. Header (72px): the category tag chips move into the header row.
  2. Headline row: the H1 (72px) spans 7 columns at the inline-start. The COD band and two CTAs sit at the inline-end: وصل جديد (solid lapis) and دزّيلنا واتساب (2px lapis outline).
  3. The rail line **bleeds past the container to both viewport edges**. Five and a half cards hang from it (248px wide, 24px gaps). The strings have staggered lengths (28/44/36/52px, repeating), so the tags read as hand-hung, not as a grid.
  4. Prev and next outline buttons (44px) sit at the rail ends. The whole rail sits inside the first 900px.

**Homepage rhythm:**
1. Hero rail (وصل جديد).
2. A ruled one-line trust row, not cards: كاش عند الاستلام · تفتحين الطرد قبل الدفع · توصيل لـ19 محافظة.
3. The **فساتين rail**. The big lapis label sits at the inline-start, and the rail line **starts at the label's baseline** and runs to the edge, so the label "holds" the rail. A count and a شوفي الكل link follow.
4. The **أطقم** rail.
5. A **size helper** strip: enter weight and height to get a قياس.
6. The **بلوزات وتنانير** rail.
7. The **جنط وإكسسوارات** rail.
8. The **province delivery table** (§6).
9. Four reviews in two columns, each marked تقييم توضيحي.
10. FAQ (6).
11. Footer: showroom address, hours and map link, WhatsApp, Instagram and Telegram, a commercial registration slot, and the demo credit.

A WhatsApp button stays pinned at the bottom inline-end.

**Signature: the swing tag.** It is the only place a price appears on cards and product pages.
- Build: `clip-path` gives the notched corner, with the fold drawn in `deep`. The jasmine hole is an SVG `mask`. The dashed string is an SVG path in `muted`, `stroke-dasharray: 3 3`.
- Content: the price in Almarai 800 in `surface`, د.ع in small type, and a **share button, 44×44, labelled دزّيها لصديقتچ**. The per-product share link lives on the tag.
- Variants:
  - `sale`: the old price struck through above the new one, both in `surface` (7.23:1)
  - `sold`: surface fill with a muted outline, reading خلصت
  - `low stock`: باقي قطعتين بس, printed under the card, not on the tag

**Shape language:** notched tag corners (10px clip), dashed strings, 8px image radius, 2px lapis outline buttons (min 44px tall), a solid lapis primary button, and a 2px ink rail line. No pills, no circles, no card shadows.

**Motion:**
- Rails use native `scroll-snap-type: x mandatory`, with no carousel JS. The desktop arrows scroll one card.
- On add to bag, the tag **swings 3° once over 300ms**, pivoting on the hole, and the cart count updates through `aria-live`.
- Under `prefers-reduced-motion` there is no swing and arrow scrolling is instant.
- No section fade-ins.

**Photography:**
- Pieces hang on a **lapis-painted rail** against a sand wall, or lie flat on sand linen. On-body shots are cropped at the shoulder, with no faces.
- All 4:5, in punchy warm daylight.
- Grade: white balance +300K warm, saturation and contrast +10, shadows lifted warm brown. Blues are protected in HSL so the lapis stays pure and doesn't drift to teal.
- Sources: Unsplash or Pexels hanger, rail and flat-lay shots, or generated silhouettes on sand. Credits go in `docs/image-credits.md`.

## 6. Niche features → engine modules

| Brief feature | Module / config |
|---|---|
| **Delivery by province** | `commerce.shipping`: `{ type: "zone-table", zones: [...], freeOverMinor: 150000, dispatchCutoff: "14:00", dispatchDays: ["sat","sun","mon","tue","wed","thu"] }`. There are 19 governorates in 6 zones, each keyed by slug (ISO 3166-2:IQ codes kept where they exist). A "محافظتچ؟" picker on the table highlights a row and preselects the governorate at checkout (saved in localStorage inside try/catch). |
| **Cash on delivery (primary)** | `payments: { primary: "cod", methods: ["cod","zaincash","fastpay"], mode: "mock" }`. COD is preselected. `cod.maxOrderMinor: 400000`: above that, a fixed 25,000 IQD deposit is taken through ZainCash or FastPay (MockProvider in the demo), and the courier collects the rest. `cod.refusalRule`: after a second refusal at the door, that phone number must prepay delivery. Checkout shows **تدفعين للمندوب: 78,000 د.ع**. |
| **Per-product share links** | `/p/RZ-114` short codes, generated into Netlify `_redirects` pointing at the canonical product URL, each with its own 1200×630 OG image (photo plus lapis tag and price, built from outlined paths). The tag button calls `navigator.share`, with WhatsApp (`wa.me/?text=`), Telegram and copy link as fallbacks. It fires the `share_click {channel, code}` analytics event and adds `utm_source=share`. |
| **Sizes in local terms** | `sizes.system: "iq-local"`. Chips show numeric sizes (36–46), with the alpha size and a weight range as helper text, and **فري سايز** with "يلبس وزن 52–82 كغ". Dress length is given in cm with the height it suits. The size helper maps weight and height to a size. |
| Checkout address, Iraqi style | Fields: governorate (select), area/district, **أقرب نقطة دالة** (nearest landmark, required), phone matching `^07[3-9]\d{8}$` (+964 also accepted), optional second phone, notes, and a honeypot. Error messages say exactly what to fix: «رقم الموبايل لازم يبدأ بـ 07 ويكون 11 رقم». |
| Orders dashboard | COD pipeline: `new → confirmed (call/WhatsApp) → with_courier → delivered_paid / refused / returned`. Each order records the cash settlement from the courier. |
| Stock | Stock is held per size variant. It is reserved when the order is placed and released after 24h unconfirmed, or on refusal or return. At 2 or fewer, the card shows باقي قطعتين بس. |
| New arrivals | `isNew` = published within 14 days. That drives the hero rail and the chip. |
| SEO | JSON-LD: `ClothingStore` (`paymentAccepted: "Cash"`, `currenciesAccepted: "IQD"`, `openingHoursSpecification`), plus `Product`/`Offer` in IQD and `BreadcrumbList`. `og:locale` is `ar_IQ`, with `en_US` as the alternate. |

## 7. Operations

These details are invented, but they are consistent with each other.

**Hours:**
- Showroom: Sat–Thu 11:00–21:00, Fri 16:00–22:00.
- **Ramadan: 20:30–01:30**. This crosses midnight, so the engine must treat 00:00–01:30 as the previous day's session.
- WhatsApp replies: daily 10:00–23:00.
- Confirmation calls: 10:00–20:00.

**Dispatch:**
- Orders confirmed by 14:00, Sat–Thu, ship that day.
- There is no dispatch on Fridays or official holidays.
- Delivery times are counted in working days from confirmation.
- Unconfirmed orders are cancelled after 24h.

| Zone | Governorates | Fee | Days |
|---|---|---|---|
| بغداد | الكرخ والرصافة | 5,000 د.ع | within 24h |
| أطراف بغداد | أبو غريب، التاجي، المدائن، الطارمية، المحمودية | 6,000 د.ع | 1–2 |
| الوسط | بابل، كربلاء، النجف، واسط، ديالى، القادسية، الأنبار، صلاح الدين | 7,000 د.ع | 2–3 |
| الجنوب | البصرة، ذي قار، ميسان، المثنى | 8,000 د.ع | 2–4 |
| الشمال | نينوى، كركوك | 8,000 د.ع | 3–4 |
| إقليم كردستان | أربيل، السليمانية، دهوك، حلبجة | 10,000 د.ع | 3–5 |

Delivery is free on orders of 150,000 د.ع or more. Worked example: فستان نسمة 45,000 plus بلوزة رازقية 25,000, delivered to البصرة for 8,000, comes to **78,000 د.ع**, paid to the courier.

**Policies (formal Arabic on the policy page):**
- The customer may open the parcel before paying.
- Exchanges (size or colour) are accepted within 3 days of receipt, unworn, **with the Raziqi tag still attached**. The customer pays the delivery fee from the table unless the mistake was ours.
- Refunds are given only for faulty or wrong items, within 7 days, in cash through the courier or by ZainCash.
- Sale items can be exchanged only.
- Pyjamas cannot be returned once the bag is opened.
- All prices are whole dinars in steps of 500 (the CMS validates this).

## 8. Content plan

**Collections (5), 32 products:**
- فساتين (10)
- أطقم (7)
- بلوزات وتنانير (7)
- دشاديش وپيجامات (4)
- جنط وإكسسوارات (4)

وصل جديد is a flag, not a collection.

| Item | Price | Sizes |
|---|---|---|
| فستان «نسمة» كتان مورّد ميدي | 45,000 د.ع | 38–44 |
| فستان «دجلة» ساتان سهرة طويل | 85,000 د.ع | 38–46 |
| طقم «بغدادية» قميص وبنطلون واسع | 55,000 د.ع | فري سايز (52–75 كغ) |
| بلوزة «رازقية» شيفون بأكمام منفوخة | 25,000 د.ع | S–XL |
| تنورة بليسيه طويلة | 28,000 د.ع | فري سايز |
| دشداشة بيت قطن مطرّزة «شناشيل» | 30,000 د.ع | فري سايز |
| طقم پيجامة ستان | 32,000 د.ع | S–XL |
| جنطة كتف «ليلى» | 35,000 د.ع | n/a |

**Gallery (10):**
1. The full new-arrivals rail on the lapis rail
2. A tag close-up showing the jasmine hole
3. نسمة flat on sand linen
4. دجلة satin in raking light
5. A COD parcel with tissue and the lapis seal sticker
6. The courier's hands handing the parcel over
7. A strung jasmine necklace (the brand story)
8. Shanasheel embroidery detail
9. The ليلى bag in the showroom
10. A phone photographing a tag (the sharing moment)

**FAQ:**
1. شلون أطلب؟ لازم أسوي حساب؟
2. أكدر أفتح الطرد وأشوف القطعة قبل ما أدفع؟
3. شگد أجور التوصيل لمحافظتي، وشگد ياخذ وقت؟
4. شلون أعرف قياسي؟
5. إذا القياس ما ضبط، أكدر أبدّل؟
6. أكدر أدفع مقدماً بزين كاش أو فاست پاي؟

**Review personas (illustrative, each marked تقييم توضيحي):**
- زينب, 24, الكرادة: the نسمة dress, delivered the next day
- مريم, 29, البصرة: the بغدادية set, opened the parcel before paying
- ريم, 21, أربيل: the ليلى bag, arrived in 4 days
- رُسُل, 19, a student in الموصل: the رازقية blouse, found through a friend's share link

## 9. Voice

| Where | Arabic (Iraqi) | English |
|---|---|---|
| Hero headline | كل قطعة سعرها عليها، وتدفعين من توصلچ | Every piece wears its price, and you pay when it reaches you. |
| Subline | وصل جديد من المنصور لكل محافظات العراق. شوفي، دزّيها لصديقتچ، واطلبي بلا ما تدفعين شي مقدماً. | New in from Al-Mansour, for every governorate in Iraq. Look, send it to a friend, and order without paying anything up front. |
| WhatsApp CTA | دزّيلنا واتساب حبيبتي | Message us on WhatsApp, love |

Microcopy:
- ضيفيها للسلة (Add to bag)
- دزّيها لصديقتچ (Send it to your friend)
- باقي قطعتين بس (Only two left)
- هواية حلو عليچ (Looks lovely on you), size helper result

Policy tone example: «يحق للعميلة استبدال القطعة خلال ثلاثة أيام من تاريخ الاستلام، بشرط أن تكون غير مستعملة وأن تبقى البطاقة معلّقة بها.»

## 10. Remove before finishing

**The hanger hooks between the rail line and each card.** The rail line and the swing tag already say "shop rail". At 390px the hooks add a busy row of tiny glyphs above every card. If a screenshot of the rail reads clearly without them, delete them.

---

Name-check sources:
- https://www.instagram.com/razqi.iq/
- https://www.instagram.com/_razqi/
- https://www.instagram.com/razqi_chalet/
- https://play.google.com/store/apps/details?id=com.invnty.marketraz
- https://www.razeghigroup.com/ar
- https://www.instagram.com/rizq.bouteque/

Halabja is listed as Iraq's 19th governorate. From memory, parliament approved this in 2025. Re-verify before building.
