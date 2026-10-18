# 11 · بَنان · Banan: design plan

Step 1 ("Plan first") of `arabic-websites-master-prompt.md`. Written 2026-09-23. The slug stays `11-naqsha-henna`; the brand was already renamed in `00-distinctness-matrix.md` (row 11) because نقشة is a Bahraini company (naqsha.bh) and خضاب is a Saudi henna store. Fonts come from `docs/research/fonts-and-logo-pipeline.md`. Engine terms follow `docs/architecture.md` §4–§5.

## Name check

The WebSearch budget for this session was used up. Google, DuckDuckGo, Mojeek, Ecosia and Qwant all block scripted queries, and Bing returned unrelated filler for every query. So this check covered **Instagram handles** (profile meta, with a known account `@alsukkariya` as a control) and **DNS** (`naqsha.bh` resolving as a control). A general web search and a Sijilat (CR) search are still open (see open questions).

| Checked | Found | Verdict |
|---|---|---|
| 35 henna and art handles: `banan.henna`, `banan_henna`, `bananhenna`, `henna.banan`, `henna_banan`, `banan__henna`, `bananhennaa`, `banan.henna.bh`, `banan_hennabh`, `henna.by.banan`, `hennabybanan`, `7enna_banan`, `banan_7enna`, `banan_mehndi`, `banan.nqsh`, `banan.art`… | Only [`@banan_henna`](https://www.instagram.com/banan_henna/) exists, and it is **empty** (0 posts, 0 followers). Everything else is unregistered | No henna business trades as بنان |
| Shop handles: `banan.store`, `bananstore`, `banan.shop`, `banan_shop` | A Spanish-language «tienda online», an inactive account, and a shop in Izhevsk, Russia | Unrelated, and outside the region |
| Beauty handles: `bananbeauty`, `banan_beauty`, `banan_salon`, `banan.salon` | [`@bananbeauty`](https://www.instagram.com/bananbeauty/) «صالون بنان بيوتي», **Sharq, Kuwait** (792 followers, 69 posts). [`@banan_salon`](https://www.instagram.com/banan_salon/) «صالون بنان للتجميل», **Samail, Oman** (0 posts). [`@banan_beauty`](https://www.instagram.com/banan_beauty/) «بنان للتزين النسائي» (7 posts, no location given) | Adjacent niche (the brief counts salons and henna artists as separate niches), in other GCC countries. **Warning, not a collision** |
| Bahrain handles: `banan.bahrain`, `banan_bahrain`, `banan.bh`, `banan_bh`, `bananbh` | [`@banan.bahrain`](https://www.instagram.com/banan.bahrain/) «Banan», "📍Bahrain · DM for orders · Delivery charge 1 BHD" (47 followers, 33 posts). **I couldn't see its goods without logging in.** The rest are empty or unregistered | Same country; niche unknown. **Must be checked by hand before build** |
| Domains: `banan.bh`, `banan.com.bh`, `bananhenna.com`, `banan-henna.com`, `bananhenna.bh` | No A records | Clear |
| Fallbacks, pre-checked in case Banan has to go: رَقْش · Raqsh, نمنمة · Namnama | [`@raqsh.bh`](https://www.instagram.com/raqsh.bh/) already exists (Bahrain handle, 6 posts); `namnama.com` is live | Neither fallback is better. **Keep Banan** |

**Decision: keep بَنان · Banan**, always locked up as **بنان للحنّاء · BANAN HENNA** so it never stands alone next to the Kuwaiti and Omani salons. The name keeps its story. البنان means fingertips, and «مخضّب البنان» (henna-dyed fingertips) is the classical image of a woman's hand. It is also a girl's name, so it reads like an artist's own studio. In English it sits close to "banana", which is acceptable for an Arabic-first audience because HENNA is always in the lockup.

## Identity

| | |
|---|---|
| Name | **بَنان للحنّاء** · **BANAN HENNA** |
| Positioning (AR) | نقش حنّا بحريني تختارينه بالصورة: شوفي الشغل حسب الستايل، الحقي مواسم العيد والأعراس قبل لا تترس المواعيد، وخذي كونات طازجة من محلّنا الصغير. |
| Positioning (EN) | Bahraini henna you choose by the picture: browse the work by style, catch the Eid and wedding-season booking windows before they fill, and buy fresh cones from our small shop. |
| Audience | Bahraini brides, bridal parties, and women and girls booking henna for Eid, weddings and occasions during the seasonal windows. Also DIY buyers of ready cones. They arrive from Instagram, one-handed, in the evening |
| Preset / tier | `booking.lite` (primary) + `commerce.lite` (cone shop) · niche `henna` · tier `lite` |
| Place | A ladies-only home studio in **Hamad Town** (Northern Governorate); the exact roundabout and house are sent on WhatsApp after confirmation. Home visits cover all four governorates. BHD (3 decimals, 0.010 steps) · `Asia/Bahrain` · numbering `arab` · Hijri shown on bookings (`hijri.show: 'bookings'`, umalqura, labelled «تقريبي») |
| Dialect | Bahraini, feminine and intimate (حبيبتي، موعدج، نقشتج، عندج). Policies are formal-neutral MSA. `locale.dialect: 'khaleeji-bh'`, `audience: 'women'` |

## Palette (L structure, warm: rice paper, henna-stain ink, henna-leaf green)

This is the only site in the set whose ink is a colour rather than a near-black. Photos cover about 45% of the home viewport; the shares below are for the non-photo area.

| Token | Hex | Share | Use |
|---|---|---|---|
| `bg` rice paper | `#F3EADB` | 58% | Page ground; also the 2px gaps in the photo wall |
| `surface` | `#FBF7EF` | 14% | Booking form panel, status strip, shop rows, inputs |
| `ink` henna stain | `#45231A` | 12% | All text, prices, **all Vibes display type**, the cone line, selected-chip fill |
| `muted` | `#6F5446` | 5% | Secondary text, durations, **chip and input borders**, full-day rings |
| `accent` henna leaf | `#556B2F` | 3% | Primary button fill, links, open-day dots, active chip underline in EN nav |
| `accent-hover` | `#44561F` | functional | Button hover and pressed states |
| `on-accent` | `#FBF7EF` | on accent | Button text (same value as `surface`) |
| `line` | `#DDCFB9` | 2% | Decorative hairlines and image placeholders only; never a control border or a text background |
| `deep` | `#2E170F` | 6% | Footer, mobile WhatsApp bottom bar, lightbox ground |
| `on-deep` / `on-deep-muted` | `#F3EADB` / `#C9B8A6` | on deep | Text on deep |
| `error` | `#A3261B` | functional | Validation text and icon, always with a written reason (it sits close to the reddish ink, so it never relies on colour alone) |

**Contrast (WCAG 2.x, computed in node):**

| Pair | Ratio | Needs |
|---|---|---|
| ink / bg · surface · line | 11.67 · 13.03 · 9.08 | 4.5 ✓ |
| muted / bg · surface | 5.80 · 6.48 | 4.5 ✓ |
| accent / bg · surface (links) | 4.99 · 5.57 | 4.5 ✓ |
| on-accent / accent (button) · bg / accent | 5.57 · 4.99 | 4.5 ✓ |
| on-accent / accent-hover | 7.57 | 4.5 ✓ |
| surface / ink (selected chip) | 13.03 | 4.5 ✓ |
| on-deep · surface / deep | 14.13 · 15.78 | 4.5 ✓ |
| on-deep-muted / deep | 8.74 | 4.5 ✓ |
| error / bg · surface | 6.18 · 6.89 | 4.5 ✓ |
| muted as chip/input border / bg · surface | 5.80 · 6.48 | 3.0 non-text ✓ |
| accent open-day dot / bg | 4.99 | 3.0 non-text ✓ |
| focus ring (ink, 2px, 2px offset) / bg | 11.67 | 3.0 ✓ (on photos, a double ring: 2px surface inside, 2px ink outside) |
| accent / deep · muted / deep | 2.83 · 2.43 | **never used** |
| muted / line | 4.52 | passes barely; **not used** |
| line / bg · surface | 1.28 · 1.43 | decorative only |

Vibes strokes are 0.038 em, about 1.8px at 48px. WCAG would allow 3:1 for text that size, but hairline strokes need far more contrast to read, so **Vibes is only ever set in `ink` on `bg`/`surface` (≥11.67), or in `on-deep` on `deep` (14.13)**.

## Type

| Role | Arabic | Latin | Notes |
|---|---|---|---|
| Wordmark and section titles | **Vibes 400** (hairline, 17 KB Arabic subset) | **Italiana 400** (hairline Didone caps) | ≥48px only. Words only («الشغل»، «المواعيد»، «المحل»، «عنّا»); never numbers or prices. Not preloaded, because the LCP is the first wall photo |
| H1–H3, body, UI, prices, forms | **Mada VF**: 300 for lead lines ≥20px, 400 body, 500 UI, prices and chips | **Source Sans 3 VF** 300 / 400 / 500 (Mada's own Latin, per its README) | One 27 KB VF file covers three weights. Latin weights use the same numbers as the Arabic |

**Scale** (px, mobile → desktop). Arabic line-height is 1.8 for body, 1.35 for headings and 1.3 for Vibes; Latin is 1.5 / 1.2 / 1.1:
- Vibes section title 48 → 64 · footer wordmark 56 → 72
- h1 22 → 30 (Mada 500) · lead 20 → 22 (Mada 300) · h2 20 → 24 · h3 17 → 19
- body 17 → 18 · small/meta 15 → 15 · chip label 15 · status strip 16
- card price 17 → 18 · lightbox price 22 → 26

Italiana caps are tracked +0.2em under `:lang(en)` only; Arabic never gets letter-spacing.

**Why this pairing:**
- **Vibes ↔ Italiana.** Both are hairline faces (stem 0.038 / 0.032 em). Alef to cap height is 0.678 / 0.750, so Latin display runs use `--latin-scale-display: 0.90`.
- **Mada ↔ Source Sans 3.** A native pair: alef / cap 0.624 / 0.656, body / x-height 0.74, stem 0.078 / 0.082. Latin body runs use `--latin-scale: 0.95`.
- **The idea.** The display face has the stroke weight of a henna cone's finest line. The low-contrast Mada keeps prices, forms and durations sturdy underneath it.
- **Distinctness.** Mada also appears on 06, but there it is paired with Karla and a heavy Amiri. Here it sits under a hairline display.

**Numerals:**
- Arabic UI uses Arabic-Indic digits through `Intl` `ar-BH`: «٨٫٠٠٠ د.ب.*». Durations read «٤٥ دقيقة».
- English UI uses BHD 8.000.
- Design codes are «ب-٠٧» in Arabic and "B-07" in English. The WhatsApp message carries both, «ب-٠٧ (B-07)», so the owner can match either.
- Phone numbers are Western digits in `<bdi dir="ltr">`.
- Eid dates show Gregorian first, then «≈ ٢٩ رمضان ١٤٤٨ هـ (تقريبي)».

## Logo

- **Arabic wordmark:** «بنان» in Vibes, outlined to SVG through the harfbuzzjs pipeline. The three dots (one under ب, one over each ن) become round **henna dots** about 0.09 em across, 2.4× the stem, like dots piped from a cone. The rest of the letters keep the hairline. Beside it, on the inline-end side and on the same baseline, sits «للحنّاء» in Mada 300 at 28% of the wordmark size.
- **Latin lockup:** BANAN HENNA in Italiana caps, tracked +0.24em, set under the Arabic and as wide as it.
- **Mark (favicon and avatar):** one fingertip drawn as a single continuous hairline, with its tip filled solid (the dyed بنان) and a five-dot henna flower (a centre dot and four petals) on the middle of the finger.
  - At 32px and above, the hairline version.
  - At 16px, a filled fingertip silhouette in ink on a `bg` square, with the flower knocked out in `bg`.
- **Clear space:** 1 x on every side, where x is the height of the ن bowl in the lockup.
- **Minimum size:** the Vibes stem must render at 1.5px or more, so the wordmark's font size is at least 40px. That makes the full lockup at least 160px wide (40 mm in print) and the Arabic-only wordmark at least 120px. Below that, use the mark: hairline at 32px or more, filled at 16px.
- **Variants:** `logo-light` is ink on rice paper. `logo-dark` is `on-deep` on `deep`. The logo is monochrome only; the green is never in the logo.

## Hero: portfolio wall first

**390px** (top to bottom):
1. Demo banner.
2. Header, 56px: the lockup SVG on the inline-start side; ع/EN and the menu on the inline-end side.
3. H1 on one start-aligned line (Mada 500, 22px): «اختاري نقشتج من الصور».
4. **Status strip** (`surface`, 56px, hairline under it). An accent dot and «الحجز مفتوح · موسم الأعراس · أقرب موعد فاضي السبت ٣ أكتوبر», then «المواعيد ←». The 1st is marked full in the demo data and the 2nd is a Friday.
   - When the window is closed: a hollow dot and «الحجز مسكّر الحين · حجز العيد يفتح أول رمضان (تقريباً ٨ فبراير)».
   - It is computed in the browser in `Asia/Bahrain`. The static HTML says only «مواسم الحجز», with a link, and never a stale state.
   - It sticks under the header (condensed to 44px) while the wall scrolls, and releases when the booking section arrives.
5. **Style chips rail:** 44px targets, horizontal scroll, 1px `muted` outline, round ends. «الكل ١٢ · خليجي ٣ · هندي ٢ · سوداني ٢ · ناعم ٣ · عرايس ٣». A tile can carry two styles.
6. **The wall:** 3 columns, edge to edge, 2px gaps, tiles 128.7px square, 0 radius, no text on tiles. The first three tiles load eagerly with `fetchpriority="high"`.
   - Above the fold on an 844px screen: about 4.5 rows.
   - Tapping a tile opens the lightbox (`deep` ground, swipe between tiles) with the code, style, matching service, «من ٨٫٠٠٠ د.ب.*», the duration, and «عجبتج؟ احجزي هالنقشة». That button prefills the booking form (service plus design code) and scrolls to it.
7. **Persistent WhatsApp bar:** a `deep` bottom bar, 56px plus the safe-area inset, reading «احجزي موعدج واتساب». It hides while the booking form's own submit button is on screen.

**1440px** (12-column text grid, 1320px max; the wall is full-bleed):
- Header, 72px: horizontal lockup on the inline-start side. On the inline-end side, the nav (الشغل · المواعيد · المحل · عنّا · الأسئلة), ع/EN and an accent «احجزي واتساب» button.
- A 120px band:
  - Columns 1–6: H1 at 30px plus a one-line lead in Mada 300.
  - Columns 8–12: the status panel, with the status line and the next 7 days as a short run of the cone line with its day dots.
  - The panel condenses to a sticky 48px strip as the wall scrolls.
- The chips rail, start-aligned.
- The wall: **4 columns full-bleed** (about 358px tiles), 3 rows. The first row and about 70% of the second are above a 900px fold.

**Homepage rhythm** (dense wall, minimal text, then booking, then the small shop; text stays in short start-aligned lines):
1. Header
2. H1 and status strip
3. Chips and wall (12 tiles), then «شوفي كل الشغل» linking to `/gallery/` (22 tiles, gallery plus service covers, with `?style=` in the URL)
4. **The cone line** enters as the divider and becomes the timeline. Section «المواعيد» (Vibes):
   - Windows are segments of the line (past ones faded to `line`). The open or next window expands into 21 day dots.
   - Below the line, one legend: «كل نقطة يوم فيه ٤ مواعيد · النقطة الفاضية: اليوم ترس».
   - On desktop, columns 1–5 list the windows with Gregorian and Hijri dates, opening dates and caps, followed by the policy summary. Columns 7–12 hold the form on `surface`.
5. **Booking request form:** service, then people, then a day (tapping a dot on the line picks it), then a time band, then studio or home and governorate. Then name, phone, design code and notes.
   - A running line: «المبلغ التقريبي ٢٩٫٠٠٠ د.ب.*».
   - The button: «أرسلي الطلب واتساب».
6. The cone line as a divider, then «المحل» (Vibes): 8 rows, each with a 96px square thumbnail, name and weight, price, and «اطلبي». Two columns on desktop. Line above the rows: «نسوّي الكونات طازجة على الطلب: تجهز بعد يومين وتوصلج مثلّجة» ("Every cone is mixed fresh to order: ready in two days, delivered frozen").
7. Care strip: a diptych (wet paste, then the stain after 48 h) with three numbered lines of aftercare.
8. Reviews: 4 as a quoted list, labelled «آراء توضيحية».
9. FAQ accordion.
10. Footer (`deep`):
    - weekly hours, with a Ramadan note
    - the studio area
    - home-visit fees
    - links to policies
    - CR «(نموذج)»
    - the Instagram handle as text
    - the demo credit

**Category entry points:** the five style chips (in place of story highlights), repeated as the `/gallery/` filter. English chips read Gulf · Indian · Sudanese · Minimal · Bridal. Vibes titles swap to Italiana at 48px or more.

**Signature: the cone line.** One continuous, hand-drawn hairline stroke: an SVG path, 1.25px, `ink`, `vector-effect: non-scaling-stroke`, with a slight wobble that repeats at section width.
- It divides three sections, then becomes the booking-window timeline.
- **Open day:** an 8px `accent` dot on the line.
- **Full day** (owner-marked): an 8px hollow `muted` ring plus «ترس».
- **Outside a window:** bare line.
- **Today:** the five-dot flower.
- The daily limit is written once per window («٤ مواعيد باليوم، منها عروس وحدة»).
- The timeline is also an `<ol>` of days with text labels («الخميس ١٥ أكتوبر · متاح»), so it never depends on dots or colour.
- It is a new `@aw/ui/signature/cone-line`.

**Shape language:**
- Square photos with 0 radius and 2px gaps.
- Buttons are square-cornered 48px accent fills.
- **The only round shapes** are the 1px outlined chips (outline only; selected = `ink` fill with `surface` text), the henna dots, and the flower. These chips are never filled date pills, which is site 08's device.
- No cards and no shadows.

**Motion:** the cone line draws once, the first time the first divider enters the viewport: a 600ms `stroke-dashoffset` with ease-out, through one IntersectionObserver. Nothing else animates. The lightbox opens instantly, and filtering swaps tiles instantly. Under `prefers-reduced-motion` the line is static.

**Photography:**
- 1:1, top-down, hands (and feet for the Sudanese and bridal styles) on undyed linen close to `bg`, lit by a north window at about 5500K.
- High clarity so the fine lines stay crisp. The fingertips are always in frame.
- No faces, no heavy jewellery, natural nails. Varied skin tones (Bahraini, Sudanese and South Asian clients).
- **Grade:** warmth +6, saturation −5, contrast +6, micro-contrast up, no vignette. The henna hue is protected: a 48-hour stain reads as true brown-maroon, never pushed toward red or orange. Fresh-paste shots are labelled as fresh.
- Source: Unsplash or Pexels (henna hands are plentiful), credited in `docs/image-credits.md`.

## Niche features → engine and config

| Brief feature | Module / config |
|---|---|
| Portfolio gallery by style | `gallery` entries: `code` («ب-٠٧»), `styles[]` (`khaleeji`, `hindi`, `sudani`, `naem`, `arayes`), `part` (hands or feet), `service` (relation), `alt {ar,en}`. `aw-lightbox`, plus a vanilla chip-filter island under 2 KB, with state in `?style=`. Layout: hero `portfolio-wall` (**new variant**; `portfolio-mosaic` implies mixed scales, which is site 12's), `categoryEntry: pill-scroller` styled as outline chips, `imageShape: rect` |
| Seasonal booking windows | `seasonalWindows` → `settings/booking.json → windows[]` (the four below). `openWindows(rules, today)` runs in the browser in `Asia/Bahrain`. The status strip and timeline read the same result. Hijri-driven windows carry `approximate: true`, and the owner confirms them each year |
| Daily limit | Each window has a `dailyCap` (weddings 4, Eids 10), shown as text. Per C21, lite can't count bookings, so the owner marks `fullDates[]` in the CMS. Those days become hollow rings, and the form refuses them. The automatic counter with «باقي ٢» is the **full-tier upsell** (`dailyCap` + Blobs store) |
| Booking request | `bookingRequest` → `aw-booking-form` → `@aw/whatsapp`. Time bands are **derived from `hours.json`** in 3-hour chunks, cross-midnight aware (Ramadan: ٨–١١ م, ١١ م–١ ص), so no new field is needed. A client-side reference «BN-261015-4K7Q» goes in the message (`bookingPrefix: 'BN'`) |
| Service rules | Niche field pack `henna.session`, normalised to `ProductOption[]`: `durationMin`, `perPerson` (a people stepper, 1–8), `leadDays` (bride: 14), `windowOnly` (the quick Eid design exists only in Eid windows), `homeVisit` (a `choice` option with a fee per governorate; brides free), `deposit` (bride: fixed 20.000, **display-only** in lite) |
| Home visits | Fee by governorate: Northern and Southern 5.000 · Capital 7.000 · Muharraq 8.000 · brides 0. On Eid nights, home visits need at least 4 people (validation message «الزيارة بليالي العيد لـ ٤ أشخاص وفوق») |
| Cone shop | Secondary `commerce.lite`: `catalog`, 2 `categories`, `whatsappOrder` per product, `shareLinks`. `availability: 'made_to_order'`, `leadTime.standardHours: 48`, `QuantityRule {min 1, step 1, max 50}`. `settings/fulfilment.json` holds 4 zones plus pickup (below) |
| Hijri and Eid | `hijriDates` is on. Eid dates are CMS data, never computed (architecture §8.4) |
| SEO | JSON-LD `BeautySalon` (from the henna niche) with `openingHoursSpecification` (Ramadan hours emitted with `closes` < `opens`), `areaServed` = 4 governorates, and `hasOfferCatalog` for the services. `Product` + `Offer` in BHD for the cones. `og:locale ar_BH` |
| Analytics | `whatsapp_click {source: wall·lightbox·form·shop·bar}`, `booking_submit {service, window}`, `style_filter {style}` |
| Other layout variants | `nav: bar-start-logo`, `whatsapp: bottom-bar`, `grid: list` + `productCard: thumb-row` (**new**; a 96px square thumbnail with a text row), `footer: band`, `reviews: quote-rail`, `signature: cone-line` (**new**) |

Example WhatsApp request, as the builder writes it:

```
هلا، أبي أحجز موعد حنّا (BN-261015-4K7Q)
• الخدمة: نقشة خليجية · الكفين (٨٫٠٠٠ د.ب للشخص)
• النقشة: ب-٠٣ (B-03) · العدد: ٣
• اليوم: الخميس ١٥ أكتوبر ٢٠٢٦ · المغرب (٦–٩ م)
• المكان: البيت · الرفاع، المحافظة الجنوبية (+٥٫٠٠٠ د.ب)
• المجموع التقريبي: ٢٩٫٠٠٠ د.ب
• الاسم: … · الرقم: …
```

## Operations

**Seasonal windows** (`settings/booking.json`). On 2026-09-23 the demo opens with W1 open.

| Id | Label | Accepts requests | Appointment dates | Daily cap | Approx. |
|---|---|---|---|---|---|
| `wedding-winter` | موسم الأعراس · الشتاء | 2026-09-15 → 2027-01-24 | 2026-10-01 → 2027-01-31 | 4 (1 bride max) | no |
| `eid-fitr` | حنّا عيد الفطر | 2027-02-08 (≈ ١ رمضان) → 2027-03-06 | 2027-03-04 → 03-08 (≈ ٢٥–٢٩ رمضان; the 08th is Eid eve) | 10 | yes |
| `eid-adha` | حنّا عيد الأضحى | 2027-05-01 → 05-13 | 2027-05-12 → 05-15 (≈ ٦–٩ ذو الحجة; the 15th is Arafat, the Eid eve) | 10 | yes |
| `wedding-summer` | موسم الأعراس · الصيف | 2027-03-15 → 09-20 | 2027-05-20 → 09-30 | 4 (1 bride max) | no |

Weddings pause in Ramadan, so between 2027-02-01 and 03-03 nothing is bookable. The form says so and points to the cone shop instead.

- **Blackouts:** 2027-06-14 → 06-15, the official Ashura holiday (≈ ٩–١٠ محرم ١٤٤٩, approximate).
- **Demo `fullDates`:** 2026-10-01, 10-07, 10-08, 10-22. Thursdays fill first.
- **Lead time** 24 h (`lead.minMinutes: 1440`); brides 14 days. **Horizon** 150 days.

**Hours** (`settings/hours.json`, studio, Hamad Town):

| Period | Hours |
|---|---|
| Weekly | Sat–Thu 15:00–22:00 · Fri closed (Fridays inside the Eid windows are open 15:00–23:00) · brides' home visits can start from 10:00 by arrangement |
| Ramadan season (2027-02-08 → 03-08, approx.) | Every day 20:00–**01:00**. This crosses midnight: it is stored as close < open and belongs to the day it opens, so the 00:30 appointment on Friday morning counts toward Thursday's cap |
| Exceptions | Eid al-Fitr eve 2027-03-08: 16:00–**03:00** · Eid al-Fitr 03-09 → 03-10: closed · Arafat 2027-05-15: 15:00–**02:00** · Eid al-Adha 05-16 → 05-17: closed |

**Cone delivery** (`settings/fulfilment.json`):
- Delivery runs Saturday to Thursday.
- Cones are mixed to order and ready in 48 h. Orders placed by 18:00 are delivered the day after they're ready.
- Cones travel frozen in an insulated pouch at no charge.

| Zone | Fee | Free at | Ready to door |
|---|---|---|---|
| Northern (Hamad Town, A'ali, Budaiya) | 1.000 | 10.000 | 3 days |
| Southern (Riffa, Isa Town, Zallaq) | 1.000 | 10.000 | 3 days |
| Capital (Manama, Seef, Sitra) | 1.500 | 10.000 | 3 days |
| Muharraq (Muharraq, Busaiteen, Amwaj) | 2.000 | 10.000 | 3–4 days |
| Pickup from the studio | 0.000 | — | Studio hours, from 48 h after ordering |

**Policies** (formal MSA pages; summaries):
- **Bridal deposit:** 20.000 BHD by BenefitPay transfer within 24 h of confirmation on WhatsApp; otherwise the date is released. It is fully refunded up to 14 days before. After that, the date can be moved once within the same season.
- **Other bookings:** free cancellation up to 24 h before (48 h inside Eid windows). After two no-shows, a 2.000 deposit is required for the next booking.
- **Safety:** natural henna only (henna powder, lemon, sugar, cajeput and lavender oil). **No black henna and no PPD.** A patch test is available on request. No henna for children under 6. Parents are asked about G6PD deficiency («أنيميا الفول»), which is common in Bahrain, before any child's henna.
- **Stain:** the colour depends on skin and aftercare, and this isn't grounds for a refund.
- **Cones:** perishable and not returnable. A cone that arrives spoiled is replaced if reported within 24 h with a photo. Storage: 7 days in the fridge, 3 months in the freezer.
- **Photos and privacy:** hands are photographed for the portfolio only with permission, and faces never. The site has a privacy page and a CR slot.

## Content plan

**Categories (5):**
- Services: نقش المناسبات · العرايس · البنات والأهل.
- Shop: كونات الحنّا · العناية واللوازم.

The five styles are a fixed tag facet, not categories. There are **18 items**: 10 services and 8 products.

| Item (AR · EN) | Detail | Price* |
|---|---|---|
| تخضيب البنان · Dipped fingertips (the classic Gulf style) | 10 fingertips, 15 min | ٢٫٠٠٠ |
| نقشة ناعمة على الأصابع · Minimal finger vine | 20 min | ٢٫٥٠٠ |
| نقشة خليجية · الكفين وجه وظهر · Gulf style, both hands, front and back | 50 min | ٨٫٠٠٠ للشخص |
| نقشة هندية لين الرسغ · Indian style to the wrist, both hands | 75 min | ١٢٫٠٠٠ |
| ستايل سوداني للرجلين · Sudanese-style bold fill, feet (natural henna) | 60 min | ١٠٫٠٠٠ |
| حنّا العروس الكاملة · Full bridal (hands to elbow, feet to mid-calf) | 4–5 h, aftercare kit, free home visit | ٦٥٫٠٠٠ · deposit ٢٠٫٠٠٠ |
| باقة ليلة الحنّا · Henna-night package (bride + 4 family) | about 6 h | ٩٠٫٠٠٠ |
| نقشة العيد السريعة · Quick Eid design, one hand (Eid windows only) | 15 min | ٣٫٠٠٠ |
| حنّا البنات (٦–١٢ سنة) · Girls' henna, ages 6–12 | 10 min | ١٫٥٠٠ |
| كون حنّا طازج ٢٥ غ · Fresh cone, 25 g | — | ٠٫٤٥٠ |
| علبة ١٠ كونات · Box of 10 cones | — | ٤٫٠٠٠ |
| طقم البداية · Starter kit (5 cones, lemon-sugar spray, clove balm, 6 stencils) | — | ٦٫٥٠٠ |

Also in the catalogue: a pro box of 25 cones for ٩٫٥٠٠, a fine nail cone of 10 g for ٠٫٣٥٠, lemon-sugar spray 100 ml for ١٫٥٠٠, clove aftercare balm 30 g for ٢٫٢٠٠, and triple-sifted Rajasthani henna powder 100 g for ٢٫٠٠٠. All prices are multiples of 0.010.

**Gallery (12, codes ب-٠١ → ب-١٢):**
1. Dipped fingertips with a back-of-hand vine (خليجي)
2. A bold leaf vine from the index finger to the wrist (خليجي)
3. Both palms with a rosette centre and fingertip caps (خليجي, عرايس)
4. An Indian full-palm mandala with a lattice to the wrist (هندي)
5. An Indian paisley back of hand with a lace cuff (هندي)
6. Sudanese geometric fill on the feet with an ankle band (سوداني)
7. Sudanese solid finger bands with negative lines (سوداني)
8. One fine vine along the ring finger (ناعم)
9. A dotted wrist bracelet with a tiny flower (ناعم)
10. Bridal hands to the elbow, side by side on linen (عرايس)
11. Bridal feet to mid-calf (عرايس)
12. A diptych of wet paste and the 48-hour stain on the same hand (ناعم; it is also the care strip)

**FAQ (Bahraini):**
1. شلون أعرف إن الحجز مفتوح؟
2. شلون أخلي لون الحنّا يطلع غامق ويطوّل؟
3. تستخدمون حنّا سودة؟ The answer is no, never: natural henna only, and no PPD.
4. تجون البيت؟ وكم رسوم الزيارة؟
5. متى أحط حنّا العرس، وكم العربون؟ The advice is two days before the wedding.
6. شلون أحفظ الكون إذا ما استخدمته على طول؟

**Reviews** (4, labelled «آراء توضيحية»):
- a Riffa bride who had full bridal henna at home two days before the wedding
- an A'ali mother who booked Eid eve at home for herself and three daughters
- an Isa Town university student who orders the 10-cone box to decorate her friends' hands
- a Sudanese resident of Hamad Town who books the Sudanese feet style for Eid al-Adha

## Voice

| Use | Arabic (Bahraini, feminine) | English |
|---|---|---|
| Hero H1 | اختاري نقشتج من الصور | Pick your henna from the photos. |
| Subline | حنّا طبيعية ونقش خليجي وهندي وسوداني وناعم، في الاستوديو بمدينة حمد أو عندج في البيت. الحجز يفتح بمواسم العيد والأعراس بس، فاحجزي موعدج قبل لا تترس الأيام. | Natural henna in Gulf, Indian, Sudanese and minimal styles, at our Hamad Town studio or at your home. Booking opens only for Eid and the wedding seasons, so book before the days fill up. |
| WhatsApp CTA | حبيبتي، احجزي موعدج على الواتساب | Book your appointment on WhatsApp. |
| Lightbox | عجبتج؟ احجزي هالنقشة | Love it? Book this design. |
| Full day | هاليوم ترس | This day is fully booked. |
| Policy (formal-neutral) | يُدفع عربون قدره ٢٠٫٠٠٠ د.ب لتثبيت موعد العروس خلال ٢٤ ساعة من تأكيده عبر واتساب، ويُسترد كاملاً عند الإلغاء قبل الموعد بأربعة عشر يوماً على الأقل، ويجوز بعد ذلك نقل الموعد مرة واحدة داخل الموسم نفسه. | A 20.000 BHD deposit secures a bridal booking and is due within 24 hours of confirmation on WhatsApp. It is refunded in full if the booking is cancelled at least 14 days ahead; after that, the date may be moved once within the same season. |
| Safety (formal-neutral) | لا تُقدَّم خدمة الحناء للأطفال دون السادسة، ويُسأل وليّ الأمر عن نقص إنزيم G6PD قبل أي خدمة للأطفال. ولا تُستخدم الحناء السوداء أو أي صبغة تحتوي على مادة PPD. | We don't apply henna to children under six, and we ask parents about G6PD deficiency first. We never use black henna or any dye containing PPD. |

## Open questions

1. **Name:** open `@banan.bahrain` while logged in to see what it sells. Also run a normal web search for «بنان حناء» and "Banan henna Bahrain", and search Sijilat for a CR named بنان. If the Bahraini account sells henna or beauty services, rename before building (Raqsh and Namnama are already ruled out).
2. **Daily limit in lite:** the cap is shown as a number, and full days are marked by the owner (C21). Is that enough for the demo, or should it be the pitch for the full-tier counter?
3. **Offline deposit:** the bridal deposit is stated in the policy and paid by BenefitPay transfer outside the site. Is it acceptable for a `lite` demo to name a deposit it doesn't collect?
4. **New `@aw/ui` variants:** hero `portfolio-wall`, signature `cone-line`, productCard `thumb-row`.
5. **Native review:** the Bahraini copy (ترس، هالنقشة، عندج) and the wording of the G6PD / Ashura notes.

## Remove before finishing

**The five-dot flower used as list bullets and section-end ornaments.** It is tempting to scatter it through the FAQ, the care steps and the ends of the cone line. Keep it in two places only: the logo mark and the "today" marker on the timeline. Anywhere else it turns the signature into wallpaper and competes with the photos.
