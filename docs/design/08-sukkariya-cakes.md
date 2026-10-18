# 08 · نِثار · Nithar (design plan)

Slug `08-sukkariya-cakes` (the folder name stays) · booking `full` · Riyadh · SAR · `Asia/Riyadh` · Step 1 plan, written 2026-09-23.

> **Renamed again.** The allocated name طبقة · Tabaqa collides with a real Saudi custom-cake business (see §1), so it is replaced by **نِثار · Nithar**. Everything else in the allocation (palette, fonts, candle slots, three-layer mark) carries over. `00-distinctness-matrix.md` row 08 still says Tabaqa and needs the same edit.

---

## 1. Name check

| # | Query | Finding |
|---|---|---|
| 1 | `"Tabaqa" cake Riyadh` | No Tabaqa business. The only near match was "Tabaq Coffee", a café in Dhaka (Bangladeshi phone numbers). Not GCC |
| 2 | `طبقة كيك الرياض` | Only generic "best cakes in Riyadh" lists. No brand |
| 3 | `"Tabaqa" bakery OR cakes Saudi Arabia instagram` | None |
| 4 | `"tabaqa" cake … Dubai OR Kuwait OR Bahrain OR Jeddah` | None |
| 5 | `instagram "tabaqa" …` | @tabaqa.agency (a design agency, unrelated), plus **@tabaqatcafe: Tabaqat Cake Café · طبقات كافيه, Jeddah, ~19K followers** |
| 6–7 | `"طبقات كافيه" جدة`, `"Tabaqat" cafe Jeddah cake` | Confirmed: a café in An Naim, Jeddah where customers build their own layered cakes. Arab News covered it as "Tabaqat, cakes tailor-made"; it is also on HungerStation and on X as @TabaqatCafe |

**Verdict: collision.** It is in the same country and the same niche (custom layered cakes). طبقات is the plural of طبقة, and "Tabaqat" is one letter away from "Tabaqa". The name ط-ب-ق also sits close to "Tabaq". Rejected.

**Replacement: نِثار · Nithar.** In classical usage, النِّثار is the sweets scattered over a bride and the guests at a wedding. In today's kitchens, نثار is the sprinkles and shavings strewn over a cake (نثار شوكولاتة). The name joins celebration and cake, and the ا and ث give the wordmark its candle and sprinkles (§5). It shares no root or initial sound with the other twelve names. The only other ن brand is نُهى (02), and the two look nothing alike.

**Not verified.** This session's WebSearch budget ran out (200 of 200 calls) before Nithar could be searched. Three more candidate searches (أمنية، ليلك، فتيلة) also came back blocked. The name must be re-checked before the build (see §12). Fallbacks, in order:
- فَتيلة · Fateela, "a candle wick", which ties to the candle-slot signature.
- دورين · Dawrain, the Najdi word for a two-tier cake.
- ليلك (lilac) was rejected: it would be a third ل-initial girl's-name brand alongside Layan and Lamar.

Sources: [@tabaqatcafe](https://www.instagram.com/tabaqatcafe/) · [Arab News: Tabaqat, cakes tailor-made](https://www.arabnews.pk/node/1383296/saudi-arabia) · [HungerStation: Tabaqat, An Naim](https://hungerstation.com/sa-en/restaurant/jeddah/an-naim/57990) · [X @TabaqatCafe](https://x.com/TabaqatCafe) · [Tabaq Coffee, Facebook (Dhaka)](https://www.facebook.com/tabaqcoffee/)

## 2. Identity

| | |
|---|---|
| Name | **نِثار** · **Nithar**. Lockup: نِثار · كيك حسب الطلب · الرياض / **nithar** CAKE STUDIO · RIYADH |
| Positioning (AR) | كيك حسب الطلب في الرياض: اختاري يوم باقي فيه مكان، ارفعي صورة فكرتك، وثبّتيه بعربون. |
| Positioning (EN) | Custom cakes in Riyadh: pick a day that still has room, upload your idea, and hold it with a deposit. |
| Audience | Riyadh mothers and hosts ordering for birthdays, graduations, gender reveals and ملكة/weddings. They arrive from Instagram on a phone, usually in the evening, with a Pinterest or Instagram screenshot and a date already in mind |
| Preset / tier | booking `full`: calendar, daily cap in capacity units, reference upload, 50% deposit, district delivery, bookings dashboard |
| Locale | Saudi Arabia · Riyadh · SAR (2 decimals, minor unit = halala) · `Asia/Riyadh` · `numberingSystem: "latn"` · Gregorian dates with optional Hijri (Umm al-Qura) |
| Dialect | Najdi-neutral, feminine address (وش ودّك؟، احجزي يومك، نسوي، علّمينا). Policy pages are in formal-neutral Arabic. **No پ چ گ anywhere in the copy**, because Readex Pro lacks them; CI runs a glyph-coverage check on the content corpus |

## 3. Palette: structure T, tonal (the only purple-family site)

| Role | Hex | Share | Where |
|---|---|---|---|
| `bg` lilac | `#E6E0F2` | 52% | Page ground |
| `surface` | `#F8F6FC` | 26% | Strip band, step panels, inputs, on-accent text |
| `ink` grape-black | `#261F36` | 9% | Text, candle sticks |
| `muted` | `#5C5570` | 4% | Secondary text, sold-out dates, input borders, smoke curls |
| `accent` plum | `#6A4690` | 4% | Primary buttons, links, selected day, candle flames, focus ring |
| `line` | `#D2CAE3` | 2% | Decorative hairlines and scallop shadows only. Never behind text |
| `deep` | `#3A2F63` | 3% | Footer band, the deposit summary card |
| Support: `accent-hover` | `#573878` | – | Button hover and pressed |
| Support: `accent-tint` | `#DCD0EE` | – | Selected size/flavour card fill |
| Support: `on-deep-accent` | `#CDB9EC` | – | Links and selected states on `deep` |
| Support: `danger` | `#9A2445` | – | Validation messages only (always with an icon and text) |

Contrast (WCAG 2.x, computed with node):

| Pair | Ratio | Use | Pass |
|---|---|---|---|
| ink / bg · ink / surface | 12.25 · 14.70 | body | AA |
| ink / accent-tint | 10.74 | selected card text | AA |
| muted / bg · muted / surface | 5.46 · 6.55 | secondary text, sold-out chips | AA |
| muted / accent-tint | 4.79 | helper text in selected card | AA |
| accent / bg · accent / surface | 5.64 · 6.77 | links, chip labels | AA |
| surface / accent · surface / accent-hover | 6.77 · 8.73 | button text | AA |
| surface / deep · bg / deep | 11.08 · 9.23 | footer and deposit card | AA |
| on-deep-accent / deep | 6.65 | footer links | AA |
| danger / bg · danger / surface | 6.01 · 7.22 | errors | AA |
| muted border / surface | 6.55 | inputs (non-text needs 3:1) | AA |
| accent flame / surface | 6.77 | candle state (graphic needs 3:1) | AA |
| muted / line | **4.45** | **forbidden**: no text on `line` fills | – |

Rules:
- A candle's state never relies on colour alone. A lit candle has a flame. A taken one has no flame and a smoke curl. Every chip also carries the text "باقي 2" or "اكتمل".
- No gradients anywhere. No gold.

## 4. Type

| Role | Arabic | Latin | AR mobile → desktop | EN mobile → desktop | Line-height |
|---|---|---|---|---|---|
| H1 | Marhey 600 | Fraunces 600, SOFT 100, WONK 1 | 34 → 60 | 36 → 64 | 1.35 AR / 1.1 EN |
| H2 | Marhey 600 | Fraunces 600 | 26 → 40 | 28 → 42 | 1.4 / 1.15 |
| H3, panel titles | Readex Pro 600 | DM Sans 600 | 20 → 24 | 21 → 25 | 1.5 / 1.3 |
| Body | Readex Pro 400 | DM Sans 400 | 16 → 17 | 17 → 18 | 1.75 / 1.6 |
| UI, labels, chip text | Readex Pro 400/600 | DM Sans 400/600 | 15 | 15 → 16 | 1.5 |
| Small (legal, captions) | Readex Pro 400 | DM Sans 400 | 14 | 14 | 1.6 |
| Date numeral, step numbers | – | Fraunces 600 (digits) | 26 → 30 · 40 → 56 | same | 1 |
| Prices | – | DM Sans 600 (digits) + riyal SVG | 18 → 20 | same | 1.3 |

Why this pairing (measured, fonts §A5):
- **Marhey ↔ Fraunces:** alef 0.734 against cap 0.700, so the Latin scale is 1.05. Body-to-x-height ratio 0.87; stems 0.112 / 0.105. Both are soft, rounded and a little wobbly; WONK gives Fraunces the hand-made lean that Marhey's lettering has.
- **Readex Pro ↔ DM Sans:** alef 0.740 against cap 0.700 (scale 1.06); ratio 0.79; stems 0.104 / 0.103, near-identical.
- Token: `--latin-scale: 1.06` on `:lang(en)` runs. Marhey is used only for H1/H2 and the occasion labels, never for UI.

Loading:
- **Marhey:** the variable font, Arabic subset, 27 KB, covering 500–700.
- **Readex Pro:** static 400 and 600, about 10 KB each.
- **DM Sans:** 400 and 600, Latin subset.
- **Fraunces:** an instance pinned at wght 600, SOFT 100, WONK 1, Latin subset, built with the fontTools instancer. Measure it; the target is under 40 KB.
- The Latin italic appears only in the outlined wordmark, so it never ships as a web font.

Numerals policy: `latn` everywhere, in dates, prices, candle counts and phone numbers. Formatting uses `Intl.NumberFormat('ar-SA-u-nu-latn')`, which gives `1,180.00` and `157.50`. Stacks are Latin-first (`"DM Sans","Readex Pro"`; `"Fraunces","Marhey"`), so every digit is drawn by the Latin face and never falls back mid-word. Month names are Gregorian as Saudis write them (سبتمبر، أكتوبر). The Hijri date shows as a secondary line on the selected day only (السبت 26 سبتمبر · 15 ربيع الآخر 1448). The riyal sign is an inline SVG with `aria-label="ريال سعودي"`; WhatsApp text uses "ر.س". The allocation's "باقي ٢" therefore renders as **"باقي 2"**. Never letter-space Arabic.

## 5. Logo

- **Arabic wordmark:** نثار in Marhey 700, outlined through the harfbuzzjs pipeline.
  - The **ا upright becomes a candle**: a rounded stick with a plum teardrop flame above it.
  - The **three dots of ث become three sprinkle capsules** at −20°, 10° and 35°.
  - The wordmark has no tashkeel; the kasra appears only in running text.
- **Latin wordmark:** `nithar` in Fraunces Italic 600, SOFT 100, WONK 1, lowercase, at 105% so its cap line meets the alef. The dot of the i is the same teardrop flame.
- **Descriptors:** «كيك حسب الطلب · الرياض» in Readex 400. "CAKE STUDIO · RIYADH" in DM Sans 600 caps, tracked +0.12em (Latin only).
- **Lockups:**
  - Horizontal: mark · Arabic · Latin, with a hairline divider.
  - Stacked: Arabic over Latin, both start-aligned.
- **Mark (favicon, avatar):** a rounded square (radius 22% of its side) holding three equal cake layers split by two wavy cream lines, plum on lilac. At 16 px the waves straighten into two 1.5 px gaps.
- **Clear space:** the flame height, about 0.25 × the wordmark cap height, on all sides.
- **Minimum size:** lockup 120 px wide (28 mm in print), wordmark 28 px tall, mark 16 px.
- **Variants:** `logo-dark` is surface on `deep`; `logo-light` is ink and plum on surface.

## 6. Home page

**Hero archetype: availability strip first.** The first thing on the page is two weeks of real capacity, not a photo.

**390 px** (from top):
1. Demo banner (dismissible, 36 px).
2. Header, 56 px: mark and wordmark at the start edge; EN toggle and a WhatsApp icon button (44 px) at the end.
3. H1 «احجزي يومك قبل لا تنطفي شموعه» in Marhey 34, two lines, start-aligned.
4. Subline in Readex 16, muted.
5. One line: «أقرب يوم تقدرين تحجزينه: السبت 26 سبتمبر».
6. **Strip band:** a full-bleed `surface` band with scalloped top and bottom edges.
   - 14 vertical pill chips, 68 × 132 px, 8 px gaps, x scroll-snap. About 4.6 are visible, which shows there is more to scroll.
   - Each chip shows: weekday (Readex 13), date numeral (Fraunces 26), month (12), a row of 4–6 candles (8 × 22 px each), then «باقي 2» (13/600).
   - A full day strikes its numeral, blows out every candle and reads «اكتمل».
   - A Friday reads «إجازة» with no candles.
7. A one-line legend («شمعة مولّعة = مكان فاضي») and a text button, «التقويم كامل», which opens the month view.
8. The occasion picker (§6 entry points).
9. The first masonry photo peeks above the fold.
10. Once a day is chosen, a bottom bar appears (with safe-area padding): a plum button «كمّلي ليوم الأحد 27», 52 px tall, and a 52 px WhatsApp square.

**1440 px:** 12 columns, 1200 px maximum, 24 px gutters.
- Row A: the H1 (Marhey 60), subline and earliest-date line fill cols 1–8, bottom-aligned. Cols 10–12 hold a 4:5 photo (288 × 360) of this week's cake, radius 24.
- Row B: the strip band runs full-bleed, with all 14 chips in one row (76 × 152 px each, 1,168 px in total). A «التقويم كامل» link sits at the inline end.
- There is no carousel and no centred stack.

**Section order:**
1. Hero strip.
2. Occasion picker.
3. **Step panels**, stacked, each a `surface` panel with radius 24 and 48 px of vertical breathing room. On desktop the title and help text sit in cols 1–4 and the controls in cols 5–12.
   - ① يومك: mirrors the strip, and adds the month calendar and a pickup/delivery slot.
   - ② الحجم والنكهة: size cards with servings, candle weight and a from-price; flavour list; decoration level.
   - ③ فكرتك: up to 3 reference photos, an optional Pinterest/Instagram link, the «الكتابة على الكيكة» field and notes.
   - ④ العربون: summary on `deep`, pickup or district, deposit and balance, pay.
4. **Masonry gallery**: 3 columns on desktop, 2 on phone. Every tile links «اطلبي زيها», which prefills steps ② and ③.
5. Price guide table.
6. Delivery zones and hours.
7. Four reviews, marked illustrative.
8. FAQ (6).
9. Footer on `deep` with a scalloped top edge: contact, hours, CR and VAT slots, policies, demo credit.

**Category entry points:** «وش المناسبة؟», a row of five 16px-radius buttons (not pills) placed straight under the strip:
- ميلاد · أطفال · تخرّج · مواليد · ملكة وزواج.
- Each button carries its design count («تخرّج · 4»).
- Choosing one filters the size and design suggestions in ② and the gallery. There are no icons.

**Signature: candle slots.** A day's cap is drawn as candles: lit (ink stick with a plum flame) means free, blown out (no flame, muted smoke curl) means taken.
- A 2-tier cake uses 2 candles and a 3-tier uses 3.
- The same SVG appears at three sizes:
  - strip, 8 × 22 px
  - month calendar, 14 × 38 px
  - confirmation, 24 × 64 px, captioned «طفّينا شمعتك، يومك محجوز».
- Each chip's accessible name reads «الأحد 27 سبتمبر، باقي 3 من 4».
- The strip is a horizontal `listbox`. ArrowLeft means the next day in RTL. Full and closed days carry `aria-disabled`.

**Shape language:**
- 24 px radii on panels and photos; 16 px on buttons; 14 px on inputs.
- **Scalloped piped-icing edges** made with a CSS `mask` of radial-gradient scallops (12 px radius, 24 px period), used only on the strip band and the footer top.
- **Pill chips are reserved for dates**, the only pill system in the set.
- One soft plum shadow (`0 10px 18px -10px rgb(58 47 99/.35)`), used only on the lifted day.

**Motion:**
- The chosen day lifts 4 px (translateY, 150 ms ease-out).
- When a hold succeeds, the flame fades out (opacity, 200 ms).
- Nothing else animates.
- Under `prefers-reduced-motion`, both changes are instant.

**Photography:**
- High-key, diffused and bright, on pastel lilac seamless paper.
- Cakes shot straight on at eye level, at 4:5. Masonry mixes in 1:1 piping close-ups.
- Grade: +0.5 EV, shadows lifted toward `#D9D2E8`, cool 5600 K so the whites read lilac-white, −10 saturation except on the cake.
- Hands only, no faces. WebP/AVIF, explicit width and height.

## 7. Niche features → engine

| Brief feature | Module | Config (concrete) |
|---|---|---|
| Daily order cap | `packages/booking` capacity | `capacityUnits {sat:4, sun:4, mon:4, tue:4, wed:4, thu:6, fri:0}` · `unitsBySize {s6:1, m8:1, l10:1, tier2:2, tier3:3}` · overrides: graduation season 2027-06-01..06-25 `+1` per day. Counter in Netlify Blobs `caps/2026-09-27.json`, written with `onlyIfMatch` ETag |
| Lead time | booking rules | `leadDays {s6:3, m8:3, l10:3, tier2:7, tier3:10}`, decoration `fancy:5`, the larger value wins · `cutoffLocal "21:00"` (after 21:00, add a day) · `horizonDays 60` · `stripDays 14`. If the chosen day is too soon, the message says so: «الكيكة ثلاث أدوار تحتاج 10 أيام، أقرب يوم لها السبت 3 أكتوبر» |
| Blackouts | booking + `packages/i18n` Hijri | Fridays; 1–3 Shawwal and 10–12 Dhu al-Hijjah, computed with Umm al-Qura (1448: 9–11 Mar and 16–18 May 2027) and confirmed by the owner in the CMS «أيام مقفلة» collection |
| Hold during payment | booking | `holdMinutes 15`. The candle shows as taken while held, and the hold is released if the payment is not verified |
| Reference image upload | Netlify Function `/api/reference` | Up to 3 images, jpeg/png/webp/heic. The client downscales to a 1600 px long edge, WebP q0.8 (under 1.5 MB; the function limit is 4.5 MB). Stored privately in Blobs `refs/<bookingId>/<n>.webp` and deleted 30 days after pickup. Plus an optional URL field and a honeypot |
| Deposit | `packages/booking` deposit → `packages/payments` | `deposit {percent:50, base:"items"}`. Prices are whole riyals, so 50% is always exact in halalas (51000 → 25500). The balance and delivery are paid at handover (mada, cash, or a payment link) |
| Payment | `packages/payments` | Demo `mock`; live `moyasar` (Saudi-only; invoice amount in halalas) with Tap as the alternative. SA/SAR methods: mada, Visa/Mastercard, Apple Pay, STC Pay |
| Delivery by district | `packages/commerce` delivery rules | District → zone → fee (§8), plus `tierSetupFeeMinor 9000` for 2–3 tier cakes. Slots 16–18, 18–20 and 20–22; pickup is free |
| WhatsApp | `packages/whatsapp` | Two templates, pre-booking questions and post-deposit confirmation (booking ref `NTH-0927-03`, date, size, flavour, text on the cake, photo count, total, deposit, balance) |
| Owner dashboard | `/admin/bookings` (Netlify Identity) | Day list drawn as candles, with bookings, reference thumbnails and statuses (`held → deposit_paid → design_confirmed → baking → ready → collected`, plus `cancelled`/`refunded`). «إقفال اليوم» and «زيادة شمعة» write Blobs overrides that apply instantly; the base caps live in the CMS |
| SEO | `packages/seo` | `Bakery` with `openingHoursSpecification`, a `Product` + `Offer` (SAR, e.g. `"510.00"`) per design, `BreadcrumbList`, `og:locale ar_SA` with an `en_US` alternate |

## 8. Operations (invented, internally consistent)

**Hours:**
- Studio pickup counter, حي الياسمين (north Riyadh): **Sat–Wed 16:00–23:00, Thu 16:00–00:30** (crosses midnight; stored as `close < open ⇒ next day`, so 00:15 on Friday is still Thursday's shift). **Fri closed**: it is the team's day off, so Friday parties collect on Thursday night, which is why Thursday has 6 candles and runs late.
- WhatsApp replies: Sat–Thu 10:00–22:00.
- **Ramadan:** Sat–Thu 20:30–02:00 (crosses midnight), cap 5 per day.
- **Eid al-Fitr and Eid al-Adha:** closed for three days each.

**Lead times:** 3 days for single-tier cakes, 5 for فاخر decoration, 7 for 2-tier, 10 for 3-tier. The daily cutoff is 21:00. On 23 Sep before 21:00, the earliest day is **Sat 26 Sep**.

**Delivery (VAT-inclusive, SAR):**

| Zone | Districts (sample) | Fee |
|---|---|---|
| شمال | الياسمين، النرجس، الملقا، الصحافة، العارض، القيروان، حطين، الربيع | 30.00 |
| وسط | العليا، الورود، المروج، الملك فهد، المرسلات، التعاون، الغدير، النخيل | 40.00 |
| شرق | الروضة، القدس، الحمراء، قرطبة، اليرموك، غرناطة، المونسية، النهضة | 50.00 |
| غرب | عرقة، ظهرة لبن، السويدي، نمار، لبن | 60.00 |
| جنوب | الشفا، العزيزية، الدار البيضاء، المنصورة، بدر | 70.00 |
| 2–3 tier | Delivery by the studio driver with setup at the venue | zone fee + 90.00 |

**Policies** (formal Arabic on the page):
- **Deposit and balance:** the 50% deposit holds the day; the balance is due at handover.
- **Final quote:** confirmed on WhatsApp within 3 working hours of the booking. If the customer declines it, the deposit is refunded in full (mada 24 h to 3 business days; cards 7–14).
- **Cancellation:** 7 or more days before, full deposit refund. 3–6 days before, 50% of the deposit. Under 72 h, no refund.
- **Changes:** one free date change if it is 5 or more days away and the new day has candles left. Size and flavour can change until 72 h before.
- **Allergens:** the kitchen handles nuts, gluten, dairy and eggs. A gluten-free sponge is available in 6 and 8 inch for +40.
- **Storage:** refrigerate, and eat within 48 h.
- **Reference photos:** used only for the order and deleted after 30 days (PDPL notice). The cake is shared on Instagram only if the customer ticks the consent box.
- **Prices:** include 15% VAT. CR and VAT-number slots in the footer carry clearly-sample values.

## 9. Content plan

**Occasions (5 collections):**
- ميلاد (6)
- أطفال (5)
- تخرّج (4)
- مواليد وكشف الجنس (4)
- ملكة وزواج (5)

That is **24 designs**, each bookable as shown or as a base for the customer's own photo.

**Base prices (بسيط decoration included):**

| Size | Serves | Base | Candles | Lead |
|---|---|---|---|---|
| 6 inch | 8–10 | 280 | 1 | 3 d |
| 8 inch | 15–20 | 420 | 1 | 3 d |
| 10 inch | 25–30 | 590 | 1 | 3 d |
| Two tiers (دورين) 6+8 | 30–35 | 980 | 2 | 7 d |
| Three tiers 6+8+10 | 55–65 | 1,650 | 3 | 10 d |

Surcharges:
- Decoration, per tier: متوسط +90, فاخر +220.
- Flavour, per tier: زعفران وهيل +30, فستق حلبي وورد +40.
- Add-ons: name topper (acrylic) 45 · 12 matching cupcakes 150 · gold number candle 15 · surprise-colour filling 35.

**Example designs (from-price, SAR):**

| Design | Details | Price |
|---|---|---|
| غيمة لافندر | 8 inch lilac ombré, متوسط | 510 |
| تخرّجت! | 10 inch red velvet, sugar cap and scroll | 680 |
| ولد ولا بنت؟ | 6 inch, surprise filling | 315 |
| ملكة بيضاء | Two tiers, sugar roses, فاخر | 1,420 |
| حديقة الزفاف | Three tiers, fresh flowers, متوسط | 1,920 |
| ميني بالاسم | 6 inch, piped name | 280 |
| سيارة السباق | 10 inch kids, sugar model, فاخر | 810 |
| تقطير زعفران | 8 inch saffron-cardamom drip | 540 |

Deposit examples: 510 → **255.00**; 315 → **157.50**; 1,420 → **710.00**.

**Gallery (10):**
- lilac ombré buttercream
- white two-tier ملكة cake with sugar roses
- graduation-cap cake
- gender-reveal slice (pink/blue inside)
- race-car kids' cake
- piped scallop border close-up
- saffron drip with pistachio crumb
- three-tier garden cake at a venue
- box of 12 matching cupcakes
- acrylic name topper on a 6 inch cake

**FAQ:**
1. كم يوم قبل لازم أحجز؟
2. أقدر أرسل صورة من بنترست أو انستقرام وتسوونها نفسها؟
3. كم العربون، ومتى أدفع الباقي؟
4. أبي أغيّر اليوم أو ألغي، وش أسوي؟
5. توصلون لكل أحياء الرياض؟ وكم التوصيل؟
6. عندكم كيك بدون جلوتين أو يناسب الحساسية؟

**Reviews (4 personas, badged «تقييم توضيحي، نموذج»):**
- **أم فيصل (النرجس):** race-car cake for her son's 5th birthday, made from a Pinterest photo.
- **نوف (الملقا):** her own graduation cake.
- **هيا (الياسمين):** a gender-reveal cake.
- **العنود (حطين):** a two-tier cake for her sister's ملكة.

## 10. Voice

| | Arabic (Najdi-neutral, feminine) | English |
|---|---|---|
| Hero headline | احجزي يومك قبل لا تنطفي شموعه | Book your day before its candles go out. |
| Subline | نسوي كم كيكة بس كل يوم. اختاري اليوم، ارفعي صورة فكرتك، وثبّتي حجزك بعربون. | We only make a few cakes a day. Pick the day, upload your idea, and hold it with a deposit. |
| WhatsApp CTA | وش ودّك؟ علّمينا واتساب | Not sure yet? Tell us on WhatsApp. |
| Confirmation | طفّينا شمعتك، يومك محجوز | We've blown out your candle. Your day is booked. |

Policy, shipping and privacy pages use formal-neutral Arabic, for example: «يُسترد العربون كاملًا عند الإلغاء قبل موعد الاستلام بسبعة أيام أو أكثر».

## 11. Remove before finishing

**Cut the scalloped edges from the four step panels.** Piped icing on every panel turns the booking flow into frosting and competes with the candles. Keep scallops only on the strip band and the footer top.

## 12. Open questions

1. Re-run the name check for نِثار · Nithar (`"نثار كيك"`, `"Nithar cake"`, `nithar` on Instagram in the GCC). The search budget ran out before it could be verified. Fallbacks are فتيلة, then دورين.
2. `00-distinctness-matrix.md` §1, the rename table and the logo-mark list still say Tabaqa.
3. The allocation's «باقي ٢» becomes «باقي 2» under the `latn` numbering rule. Confirm.
4. Friday closed, with a Thursday shift running to 00:30: confirm, or open Friday 16:00–23:00 with 4 candles.
5. Reference photos in private Blobs with 30-day deletion: confirm this is acceptable under Saudi PDPL for real clients. For demos, uploads could be discarded after the mock confirmation.
