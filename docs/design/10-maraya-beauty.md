# 10 · جَلوة · Jalwa: design plan

Slug `10-maraya-beauty` (the folder name stays, as in the matrix) · booking `full` + gift cards · Jeddah · SAR · `Asia/Riyadh` · Written 2026-09-23 for Step 1 ("Plan first").
Allocation kept, with three measured refinements: `line` is `#633A47` (was `#5A3440`), the Arabic body ships 400/500 only, and the display face ships as one static 500. The reasons are in §2 and §3.

---

## 0. Name check

The matrix renamed مرايا · Maraya because a Maraya beauty salon trades in Jeddah (a Cobone deal listing). Today's control query found another one, **Al Maraya Beauty Salon** in Al Qasimia, Sharjah (OSM), which backs up the rename.

| Check (2026-09-23) | Result |
|---|---|
| Matrix search (earlier today, same run) | Jalwa was listed as a replacement "checked, nothing in the niche found" |
| WebSearch | **Not available.** The session budget was used up (200 of 200 calls). I fell back to the checks below |
| Bing through WebFetch: `"Jalwa" salon Jeddah` · `جلوة مشغل نسائي جدة` · `"Jalwa beauty"` | First two: "no results". Third: only unrelated Pakistani IT pages. DuckDuckGo (captcha), Brave (429), Mojeek (403), Startpage (bot wall) and Google were all blocked |
| OpenStreetMap Nominatim, SA/AE/KW/BH/QA/OM: `جلوة`, `جلوه`, `Jalwa`, `Jalwah` | Only three residential streets named جلوة in Riyadh, a hill (قارة الجلواء) and a village (منيفة جلوى). **No business.** The same method *does* find salons: `Maraya` returned the Sharjah salon |
| Domains | `jalwa.com` is parked (`/lander`). `jalwa.net` redirects to an Indian online-game site (unrelated). `jalwa.sa`, `jalwa.com.sa`, `jalwabeauty.com` and `jalwalounge.com` don't resolve |
| Instagram `jalwa`, `jalwa.sa`, `jalwabeauty`, `jalwa_beauty`, `jalwasalon`, `jalwa_lounge`, `jalwa_jeddah` | Login wall, so inconclusive |
| Arabic Wikipedia `الجلوة العروس` | Only the wedding custom (Tunisian, Libyan and Egyptian mentions). No brand |

**Verdict: keep جَلوة · Jalwa.** Nothing turned up in the same niche and region. "Jalwa" is also an Urdu/Hindi word ("splendour") used by South Asian businesses, which is a different region and a different niche. Because the proper search budget ran out, this is **not fully verified**. Before the demo goes public, search Instagram by hand for `جلوة` + صالون/مشغل/لاونج and `jalwa` + Jeddah. The adjacent risk is wedding-décor accounts that use the word for a bride's stage. **Fallback name:** صَقيلة · Saqeela ("polished like a mirror"), which has not been checked yet.

## 1. Identity

| | |
|---|---|
| Name | **جَلوة · Jalwa**. Lockup: **جَلوة بيوتي لاونج / JALWA BEAUTY LOUNGE** |
| Meaning | From جلا, which has two senses. جلا الصيقلُ المرآة: to polish a mirror until it shines. جلا العروسَ: to present the bride. **الجَلوة** is the bride's unveiling, a custom known across the Arab world. The mirror from the old name survives in both the word and the signature |
| Positioning | AR: **لاونج تجميل في جدة: تشوفي وقت وسعر كل خدمة، تختاري خبيرتك وغرفتك، وتحجزي موعدك بعربون.** EN: **A Jeddah beauty lounge where you see every service's time and price, choose your stylist and room, and confirm with a deposit.** |
| Audience | Jeddah women aged 20–45 booking hair, nails, lashes and makeup, often late in the evening after work, university or a family visit. Also brides, their mothers and sisters booking ملكة, غُمرة and wedding-day packages weeks ahead |
| Preset / tier | `booking.full` + the `giftCards` module from commerce. Slot calendar that knows staff and rooms, 30% deposit, gift cards, owner dashboard |
| Place | حي الشاطئ, Jeddah (area-level only in the demo), with a women-only entrance and valet · Saudi Arabia · SAR (2 decimals, halalas) · `Asia/Riyadh` (UTC+3, no DST) |
| Dialect | Hijazi, feminine and affectionate (حبيبتي، يا قمر، احجزي، إيش، لسّه، لحد، كِدا). Policy pages are formal-neutral. **دحين** can appear in running copy but never in a headline or CTA, because it is site 09's brand name (Dahheen, also in Jeddah) |

## 2. Palette (structure D: warm red. Merlot ground, rose-ivory ink, champagne accent)

| Token (→ `BrandTokens.color`) | Hex | Share | Use |
|---|---|---|---|
| `bg` merlot → `surface` | `#2B131A` | 55% | Page ground, header, hero |
| `surface` → `surfaceAlt` | `#3B1E27` | 18% | Menu panel, booking sheet, cards, FAQ, inputs |
| `ink` rose-ivory | `#F6ECE7` | 13% | All body text and headings. Also the focus ring (2px, 2px offset) |
| `muted` | `#CDB3B1` | 5% | Durations, secondary text, 1px borders on inputs and slot chips (the non-text 3:1 rule) |
| `accent` champagne | `#E2C2A8` | 4% | The photo bevel hairlines, primary buttons, selected slot chip, active tab, underlined links. **Always with deep text on it, never ink** (ink on champagne is 1.44) |
| `accent` hover / pressed | `#ECD3BE` / `#D3AE92` | n/a | Button states |
| `line` | **`#633A47`** | 1% | Decorative dividers between service rows. Retuned from `#5A3440`, which only reached 1.43 on the panel colour and missed the 1.5 hairline floor in `site:sync` |
| `deep` → `accentInk` + `surfaceDeep`* | `#1C0B10` | 4% | Text on champagne, the footer band, the gift-card band, the phone booking bar, the sheet backdrop (`rgba(28,11,16,.72)`) |
| `danger` / `success` | `#FFA89E` / `#A9D3B4` | status only | Always with an icon and words. Never used as decoration |

*`BrandTokens.color` has no slot for the matrix's "extra" colour yet (see §11).

**Contrast (WCAG 2.x, computed with node):**

| Text / element | on `bg` | on `surface` | on `deep` | Needs |
|---|---|---|---|---|
| ink | 14.92 | 12.90 | 16.36 | 4.5 |
| muted (text, and input/chip borders) | 8.82 | 7.62 | 9.67 | 4.5 (3 for borders) |
| accent (underlined links, champagne display words) | 10.34 | 8.93 | 11.33 | 4.5 |
| danger / success | 9.37 / 10.46 | 8.10 / 9.04 | n/a | 4.5 |
| line (decorative) | 1.84 | 1.59 | 2.02 | ≥1.5 house rule |

| On-accent pairs | Ratio |
|---|---|
| deep text on champagne button | **11.33** |
| deep on hover `#ECD3BE` | 13.24 |
| deep on pressed `#D3AE92` | 9.27 |
| ink on champagne | **1.44: forbidden** |
| focus ring (ink) against the grounds | ≥12.9 |

Champagne and ink are only 1.44 apart, so links can't rely on colour alone. They are always underlined.

## 3. Type

| Role | Arabic | Latin (Latin face first in the stack) |
|---|---|---|
| Display: H1/H2, section names, the wordmark | **Reem Kufi** 500 with `cv02` (Fatimid kufi). **Words only.** It lacks ٫ ٬, so no number is ever set in it | **Prata** 400 (the only weight); caps tracked +0.12em for eyebrows |
| Body, UI, service names, durations, prices, forms | **IBM Plex Sans Arabic** 400/500 | **IBM Plex Sans** 400/500, served from Plex Sans Arabic's own `latin` subset (same outlines and metrics) |

**Why this pairing** (research §A5, re-measured today):
- Reem Kufi's alef is 0.80; Prata's cap height is 0.80. They align 1:1, so the display runs at `latinScale` 1.00. Both are high-waisted, calm faces: the Fatimid kufi's rhythm next to a Didone's contrast reads as magazine type.
- Plex Arabic's alef is 0.740 and Plex's cap is 0.698, so Latin runs inside body text use **1.06**. It is a superfamily, so the stems match.
- **`cv02` verified with fontTools:** Reem Kufi decomposes ج into the hah skeleton plus a dot in `ccmp`, and `cv02` swaps `hah-ar.init` for `hah-ar.init.2`. So in جلوة it changes the head of the ج. Across headings it also changes the isolated alef, ح/خ, initial and medial ه, ك and م. That is cheap distinctiveness. (`cv01` would change the final و and ة instead; the logo render can compare both.)
- **Payload (Fontsource woff2, measured today):**
  - Arabic pages: Reem Kufi 500 `arabic` (9.2 KB) + Plex Arabic 400/500 `arabic` (42.8 + 45.3 KB) + the Plex `latin` 400 subset for Latin digits (19.2 KB) = **116.5 KB**, under the 120 KB budget.
  - Adding the allocated Plex 600 would push this to about 162 KB, so 600 is dropped. Prices and times are always set at 400, and `font-synthesis-weight: none` stops faux bold.
  - Prata loads only on English pages (about 100 KB total there, including the Arabic 400 file for the language toggle).

**Scale (390 → 1440; explicit line-heights):**

| Role | Arabic | English |
|---|---|---|
| Display H1 | Reem Kufi 40 → 64 / 1.3 | Prata 38 → 60 / 1.12 |
| H2 | 30 → 44 / 1.35 | 28 → 42 / 1.15 |
| H3, service name | Plex 500, 19 → 21 / 1.5 | Plex 500, 18 → 20 / 1.35 |
| Body | Plex 400, 17 → 18 / 1.8 | Plex 400, 17 → 18 / 1.6 |
| Duration and price columns | Plex 400, 17 → 19, tabular | same |
| Pull quote | Plex 400, 24 → 34 / 1.6 | Prata 24 → 34 / 1.35 |
| Meta, captions | Plex 400, 14 / 1.6 (floor) | 14 / 1.5 |

**Numerals:**
- `numberingSystem: "latn"` in both languages. This matches how Jeddah salons publish their menus, and it keeps durations, times and prices in one tabular system.
- **Plex's digits are tabular by default** (all ten advance 600 units, checked in both TTFs), so the duration and price columns line up without `tnum`.
- Riyal: the **SAR symbol is an inline SVG** (`aria-label="ريال سعودي"`) sized to cap height. Neither Plex nor Reem Kufi has U+20C1.
- Time: "5:15 م". After midnight: "12:30 بعد نص الليل".
- Hijri is shown next to booking dates (Umm al-Qura; Thursday 8 October 2026 = "27 ربيع الآخر 1448 هـ").
- Phone numbers are isolated and always in Latin digits.

## 4. Logo

- **Arabic wordmark:** جلوة (no harakat in the logo) in Reem Kufi at wght 500 with `cv02`, outlined through the harfbuzzjs pipeline. It sits inside a tall arch outline (arch height 3.2× the wordmark height, width 0.62× the arch height), on the arch's lower third, like a reflection in a mirror.
- **Bevel:** a second hairline arch, offset 3 units (on a 48-unit grid) up and toward the inline-end. It is the same device as the photo frames.
- **Latin:** **JALWA** in Prata caps, +0.16em tracking, cap height 0.5× the Arabic wordmark. Under it, **BEAUTY LOUNGE** in Plex Sans 500 caps at 0.28× size, +0.28em. The Arabic descriptor بيوتي لاونج is set in Plex Sans Arabic 500.
- **Lockups:**
  - `stacked`: the arch holds جلوة, with JALWA and BEAUTY LOUNGE under the arch base.
  - `inline` (header): the mark, then جلوة with JALWA small beneath it.
  - `mark-only`.
- **Mark (favicon, avatar):** the empty tall arch with its offset bevel line. No letter inside, because 02, 05, 06 and 07 are all letters in shapes. At 24px or smaller, the bevel is dropped. At 16px, it becomes a champagne-filled arch on merlot.
- **Colours:**
  - Dark (default): champagne arch and bevel, rose-ivory wordmarks.
  - Light: all merlot `#2B131A`.
  - One-colour: black, for stamps and receipts.
- **Clear space:** 1 × the ل height of the wordmark around lockups; 0.5 × for the mark alone.
- **Minimum size:** stacked 96px wide (25mm in print), inline 128px (32mm), mark 16px.
- **Don't:** gold gradients, drop shadows, a photo inside the logo arch, stretching the arch, or letter-spacing on the Arabic.

## 5. Home page

**Hero at 390px (asymmetric editorial split, stacked):**
- The demo banner (40, dismissible) and header (56): inline lockup at the start; menu and language at the end.
- **Arch photo:** 358 × 478 (3:4) inside 16px gutters, with a 1px champagne line hugging the frame and a 1px bevel line offset 4px (shifted 6px toward the inline-end and 6px up). It is the LCP image: AVIF at 716w, `fetchpriority="high"`.
- **Menu panel** (`surface`, 1px `line` border, 6px radius) overlaps the arch **upward by 72px**. It is inset 12px from each side of the arch, so the arch's lower corners show, like a mirror standing on a vanity. Inside, with 20px padding:
  - H1 **اتجلّي على مهلك، الليل لسّه طويل** (Reem Kufi 40, two lines).
  - The subline (muted, 17).
  - The **category tabs** (§ entry points).
  - Four service rows, each at least 56px tall: the name on the start side, and at the end two tabular columns, **duration** (muted "45 د") and **price** ("من 120" + riyal SVG), with `line` hairlines between rows.
  - **أقرب مواعيد اليوم:** three slot chips (e.g. "5:15 م · 7:45 م · 12:30 بعد نص الليل"). They are 44px tall with 6px radius, rectangles not pills (pills are 08's), and tapping one opens the booking sheet at that slot.
  - The CTA **احجزي موعدك** (champagne, 52px, full width).
- **Sticky bottom bar** (deep, 56px + safe area): "احجزي · أقرب موعد 5:15 م" (champagne) and a WhatsApp outline button. This keeps a CTA on screen when the panel's button is below the fold at 844px.

**Hero at 1440px:**
- Header 72. Content is 1312 wide with 64px margins, on 12 columns with 24px gutters.
- The **arch fills columns 1–7 at the inline-start** (≈744 × 930, 4:5). Its base runs about 130px below the fold at 1440×900, on purpose. The bevel offset is 8px.
- Column 8 is left empty (the magazine margin).
- **Columns 9–12** hold everything else, top-aligned 48px below the arch's top:
  - The H1 at 64.
  - The subline at 20.
  - The tabs.
  - Six service rows with the two tabular columns.
  - The next-slot chips.
  - The CTA, with a text link "اسألينا واتساب" beside it.
- In English everything mirrors (the arch sits at the left) through logical properties only.
- "Next free slot today" is computed in the browser in `Asia/Riyadh` by `aw-slot-picker mode="next"`, which calls `GET /api/availability?from=now&limit=3&category=…`.
  - The static HTML reserves the chip row's height and shows "شوفي المواعيد", so there is no CLS and no stale time.
  - Between 02:00 and 14:00 the row reads "أول موعد اليوم 2:00 م".
  - At 00:40 it still belongs to the previous business day (§7).

**Category entry points** (the top of the page, inside the hero panel, `categoryEntry: 'tabs'`): الشعر · الأظافر · الرموش والحواجب · المكياج · العرايس.
- On phones the row scrolls sideways, with 44px targets.
- The active tab gets champagne text and a 1px champagne arch outline behind the label.
- Switching tabs swaps the rows and the next-slot chips with no animation. Each tab is also a deep link (`/services/#nails`).

**Homepage rhythm** (magazine: 7/5 splits that alternate sides, long tabular lists, pull quotes, wide margins):
1. Demo banner and header.
2. **Hero:** arch at the start, menu panel at the end (above).
3. **العرايس**, reversed 5/7: the packages ledger (3 packages with inclusions, duration, price and a fixed deposit) at the start; an arch photo of the bridal suite at the end. Links: "احجزي تجربة المكياج" and "خدمة العروس في القاعة؟ اسألينا واتساب".
4. **Pull quote 1**, start-anchored and full width: Plex 34, the name and district in muted, the tag **تقييم توضيحي**.
5. **اختاري خبيرتك وغرفتك**, 7/5:
   - At the start, 7 staff arches in a staggered row. Heights alternate 100% and 86%. The photos show **hands at work, not faces**. Each has a name, specialties and her next free slot.
   - At the end, a room list with capacities and the private-room surcharge.
6. **بطاقات الإهداء** on a `deep` band, reversed: an arch-shaped gift card (champagne bevel) and the denominations 200 / 500 / 1000.
7. **Gallery:** a magazine grid of 9 arch-cropped photos in 7/5 pairs, alternating sides, with a lightbox.
8. **Pull quote 2**, end-anchored, linking to all 4 reviews.
9. **Hours and location:** the weekly table with cross-midnight marks, Ramadan hours, a map facade, the women's entrance and valet note.
10. **FAQ:** 6 questions, `accordion-plain`.
11. **Footer** on `deep`: the stacked lockup, CR/VAT slots marked "(نموذج)", policies, and the demo credit.

**Signature: the mirror arch** (`@aw/ui/signature/mirror-arch-frame`, `<ArchFrame bevel="double|none">`):
- The top corners are `border-start-start-radius` and `border-start-end-radius` at 999px, which the browser clamps to an exact semicircle. It uses `overflow: clip`.
- `::before` draws a 1px champagne line at `inset: 0`.
- `::after` draws the offset line, placed with `inset-block-start: -6px; inset-inline-start: 6px` and a 4px outset. Logical properties mean it mirrors in English.
- Where it appears: every photo (3:4 on phones, 4:5 in hero and bridal), the gift card, the booking-confirmation summary (the appointment shown "in the mirror"), the OG image and the logo.
- It is never used on buttons, chips or inputs.
- Focus rings sit outside the clip.

**Shape language:**
- Arch-topped image frames with a double hairline bevel (1px, plus 1px offset by 4px).
- 6px radius on everything else: panels, the sheet's top corners, buttons and chips.
- No shadows. Panels separate by the `line` border and by overlapping.
- No icons in circles, no gradients, no gold fill.

**Motion:**
- The **booking sheet slides up in 240ms** (`cubic-bezier(.2,.8,.2,1)`), with the backdrop fading in over the same 240ms. On phones the sheet is a full-width bottom sheet up to 92svh; on desktop it is 480px wide, anchored at the bottom inline-end.
- Slot chips, tabs and selections respond **instantly**, with no transitions.
- No scroll effects or reveals.
- Under `prefers-reduced-motion`, the sheet and backdrop appear with no animation.
- The sheet is a dialog: it traps focus, Esc closes it, and focus returns to the trigger.

**Photography and grade:**
- Soft beauty light: a large diffused key at about 45° with a reflector fill.
- Warm, true skin tones with the texture kept (no plastic retouching). A slight bloom on highlights.
- Backgrounds desaturated about 30%, with shadows split-toned toward merlot.
- Composed for the arch: the subject in the lower two-thirds, with hair, mirror or wall filling the half-circle.
- **No identifiable client faces.** Use hands, hair from behind, eye and lash crops, tools, and the rooms, as Jeddah salons do on Instagram.
- `photo.grade`: saturation 0.90, brightness 0.97, warmth +8, contrast 1.06, tint `#2B131A` at 10%. The bloom is baked in when assets are prepared.
- Sources: Unsplash/Pexels with credits in `docs/image-credits.md`. WebP/AVIF, explicit sizes, lazy below the fold.

## 6. Niche features → engine

```ts
// sites/10-maraya-beauty/site.config.ts (fields that differ from the §5.9 example in architecture.md)
id: '10', slug: 'maraya-beauty', tier: 'full',
preset: { primary: 'booking.full', niche: 'beauty' },
locale: { country: 'SA', currency: 'SAR', timeZone: 'Asia/Riyadh', dialect: 'hijazi', audience: 'women',
          numberingSystem: 'latn', weekStart: 'sat', weekend: ['fri', 'sat'],
          hijri: { show: 'bookings', calendar: 'islamic-umalqura' } },
features: { resources: true, deposits: true, packages: true, giftCards: true, hijriDates: true,
            gallery: true, reviews: true, shareLinks: true },
booking: { bookingPrefix: 'JL', granularity: 'slot', resourceModel: 'staff+rooms', staffChoice: 'optional' },
commerce: { orderPrefix: 'JLG',
            giftCards: { denominations: [20_000, 50_000, 100_000], validityMonths: 12, redeem: 'both', codePrefix: 'JALWA' } },
payments: { provider: 'moyasar', methods: ['mada', 'apple_pay', 'stc_pay', 'card'], cod: false, primary: 'online' },
layout: { hero: 'arch-frame', nav: 'bar-start-logo', categoryEntry: 'tabs', productCard: 'service-ledger', // new variant
          grid: 'list', imageShape: 'arch', whatsapp: 'bottom-bar', footer: 'band',
          sectionVariants: { reviews: 'single-large', faq: 'accordion-plain' }, signature: 'mirror-arch-frame' },
seo: { indexing: false, businessType: 'BeautySalon', priceRange: '$$',
       titleTemplate: { ar: '%s · جَلوة', en: '%s · Jalwa' } },
deploy: { url: 'https://jalwa-lounge-demo.netlify.app', netlifySiteName: 'jalwa-lounge-demo' },
```

```json
// settings/booking.json
{ "slotStepMinutes": 15, "lead": { "minMinutes": 120 }, "horizonDays": 45,
  "buffers": { "beforeMinutes": 0, "afterMinutes": 10 },
  "blackouts": [{ "from": "2026-12-01", "to": "2026-12-01", "reason": { "ar": "صيانة اللاونج", "en": "Lounge maintenance" } }],
  "fullDates": [], "windows": [],
  "deposit": { "kind": "percent", "percent": 30, "min": "50.00", "roundUpTo": "1.00" },
  "cancellation": { "freeUntilHours": 24, "depositRefundable": false },
  "holdMinutes": 15 }
```

| Brief feature | Module | Concrete config and behaviour |
|---|---|---|
| Service menu with durations and prices | `services`, `categories`, `productCard: service-ledger` | `durationMinutes`, `price {fixed \| from}`. Hair length is a `choice` (قصير / متوسط +40 ر.س +15 د / طويل +80 ر.س +30 د) on blow-dry, colour and keratin. **It needs a `durationDeltaMinutes` on choices** (§11). Each row has a share link (`shareLinks`) |
| Bridal packages | `packages` | 3 packages. `requires: [{staff, skill: bridal-makeup}, {staff, skill: bridal-hair}, {room, resourceIds: [bridal-suite]}]`, so two stylists work in parallel in one room. Fixed deposits: 1,000 / 600 / 500. Lead 7 days, horizon 180 days: **this needs a per-service `leadDays`/`horizonDays` override** (§11) |
| Staff- and room-aware slots | `resources`, `staffChoice: optional` | 7 staff and 5 rooms (§7). A slot is offered only when all of these hold: (a) the venue is open for duration + buffer within the business day; (b) a qualifying staff member (or the one chosen, default "أي خبيرة متاحة") is on shift and free; (c) the room kind has free capacity (or the private room was chosen); (d) start ≥ now + lead; (e) the date is not a blackout or exception. The room is a `choice` (الصالة / الغرفة الخاصة +75) **that maps to a resource requirement** (§11) |
| Deposit | `deposits` → `payments` | 30%, minimum 50.00, rounded **up** to a whole riyal. Moyasar invoice in halalas, `purpose: 'deposit'`. The slot is held for 15 min while paying. The balance is paid at the lounge (mada, Apple Pay, cash) |
| Gift cards | `giftCards` | `/gift-cards/`: pick 200 / 500 / 1000, 2 designs (merlot arch, champagne arch), recipient name, message (≤120 characters). Paid in full online (`purpose: 'gift_card'`). The buyer gets a card page with the code (`JALWA-XXXX-XXXX`) to forward on WhatsApp. Redeemed at the lounge from `/owner/`. **Proposal:** a code can also cover a booking deposit online (`redeem: 'both'` = deposits only) |
| Cross-midnight hours | `@aw/core/time`, hours | 14:00–02:00 belongs to the day it opens. Slots carry `businessDate`. The sheet groups them as العصر 2–5 · المغرب 5–8 · الليل 8–12 · **بعد نص الليل 12–2 (فجر الجمعة)** |
| WhatsApp | `@aw/whatsapp` | Pre-booking question: service, duration, price, preferred day/time, staff/room, name. The confirmation page adds a share: "حجزت في جَلوة: مكياج سهرة · الخميس 8 أكتوبر 9:30 م · الغرفة الخاصة · رقم الحجز JL-B-261008-Q8TD". It also offers an `.ics` download |
| Owner dashboard | `/owner/` | A day view with one lane per **room** (5) and a staff filter. Statuses: `held → confirmed → arrived → completed \| no_show \| cancelled`. Actions: close a day, block a staff member's hours, redeem a gift card, mark a deposit as credit |
| SEO | `@aw/seo` | `BeautySalon`, with `openingHoursSpecification` (Sa–Th 14:00→02:00, Fr 16:00→02:00; closes < opens means the next day), a `hasOfferCatalog` of services priced in SAR, `og:locale ar_SA` + `en_US` |

**Worked booking (the test fixture):**
- مكياج سهرة 450.00 + الغرفة الخاصة 75.00 = **525.00**.
- The 30% deposit is 157.50, which rounds up to **158.00**. The balance at the lounge is 367.00.
- VAT included: 525 × 15/115 = 68.48.
- The slot is Thursday 8 October, 21:30 with جُمانة (her shift runs 16:00–00:00, and the service ends at 22:40 including the buffer). Free changes are open until Wednesday 7 October, 21:30.
- A 00:30 gel manicure the same night is stored under Thursday's business day as minute 1470. It displays as «الخميس 8 أكتوبر · 12:30 بعد نص الليل (فجر الجمعة) · 27 ربيع الآخر 1448 هـ».

## 7. Operations (invented, internally consistent)

| Period | Hours |
|---|---|
| Sat–Thu | **14:00–02:00** (crosses midnight) |
| Fri | **16:00–02:00** (crosses midnight) |
| Ramadan 1448 (≈ 8 Feb–8 Mar 2027, `approximate`) | 21:00–03:00 |
| Eid al-Fitr eve (≈ 8 Mar 2027) | 20:00–04:00 (the Eid rush) |
| Closed | ≈ 9 Mar 2027 (1 Shawwal), ≈ 16 May 2027 (10 Dhu al-Hijjah), 1 Dec 2026 (maintenance) |
| WhatsApp replies | 12:00 until closing |

**Resources:**

| Rooms (capacity) | Staff (skills · shift, one weekly day off each) |
|---|---|
| جناح العروس (1) | ريم: bridal and evening makeup · 14:00–22:00 |
| الصالة (4 chairs: hair and makeup) | هتون: bridal hair, styling · 14:00–22:00 · لمى: colour, keratin · 16:00–00:00 |
| غرفة الأظافر (4 stations) | سارة: nails · 16:00–00:00 · دانة: nails, lashes · 18:00–02:00 |
| غرفة الرموش والحواجب (2 beds) | جُمانة: evening makeup, lashes, brows · 16:00–00:00 |
| الغرفة الخاصة (1; +75.00 for makeup, hair and lashes) | نوف: cuts, blow-dry · 18:00–02:00 |

The room column and the staff column are independent lists; they share rows only to save space.

Friday shifts start at 16:00. After midnight the lounge offers only nails, lashes and blow-dry, which is what the late shift covers. The last start time is close − duration − buffer, on the 15-minute grid: a 60-minute service can start at 00:45 at the latest.

**Lead times:**
- Regular services: 2 hours ahead, up to 45 days out.
- Bridal trial: 2 days ahead.
- Bridal packages: 7 days to 180 days ahead.

**Brides at a hall or home** (request on WhatsApp only, not in the calendar; for the Jalwa and Ghumra packages). A travel fee is added:

| Zone | Districts | Fee (SAR) |
|---|---|---|
| 1 | الشاطئ، الزهراء، النعيم، المحمدية، الروضة، السلامة، الخالدية | 250.00 |
| 2 | الحمراء، الأندلس، مشرفة، البساتين، الفيصلية، الصفا، المروة | 350.00 |
| 3 | الرويس، البغدادية، الشرفية، العزيزية، الربوة، السامر، الأجواد | 450.00 |
| 4 | أبحر الشمالية، أبحر الجنوبية، الحمدانية | 550.00 |

Gift cards are delivered digitally and free. A printed card in an envelope can be collected at the lounge, also free.

**Policies** (formal pages):
- Prices include 15% VAT. CR and VAT slots are marked sample.
- The deposit counts toward the price.
- Free changes and cancellations until 24 h before. The deposit then becomes a **credit valid 60 days**.
- Under 24 h, or a no-show: the deposit is kept.
- Arriving more than 15 min late may shorten or reschedule the service.
- Bridal deposits are non-refundable. The date can be changed once for free if the change is made 30 or more days ahead and the suite is free.
- If the lounge cancels, the refund goes to the original method (mada 1–3 business days, cards 7–14).
- Gift cards: valid 12 months, non-refundable, cannot be exchanged for cash.
- Women only. Girls under 12 need their own booking and an adult with them.
- PDPL note: the booking phone number is used only for this appointment.

## 8. Content plan

**28 services and packages across 5 categories:**
- الشعر ×8
- الأظافر ×6
- الرموش والحواجب ×6
- المكياج ×5
- العرايس ×3 packages

| Item | Duration | Price (SAR, VAT incl.) |
|---|---|---|
| سشوار (بلوّر) | 45 د | من 120 |
| صبغة جذور | 90 د | من 280 |
| كيراتين / بروتين | 180 د | من 850 |
| مناكير وباديكير جل | 105 د | 290 |
| رموش كلاسيك | 90 د | 350 |
| مكياج سهرة | 60 د | 450 |
| مكياج وتسريحة سهرة | 120 د | 690 |
| تجربة مكياج العروس (deducted from a package booked within 30 days) | 120 د | 600 |
| **باقة الجَلوة**: bridal makeup, hair, veil fitting, lashes and a touch-up kit, in the suite | 4 س | 3,800 (deposit 1,000) |
| **باقة الغُمرة**: makeup and hair styled for the Hijazi headdress, for the غمرة night | 3 س | 2,400 (deposit 600) |
| **باقة المِلكة**: soft makeup and hair for the contract night | 2 س 30 د | 1,700 (deposit 500) |

**Gallery (9):**
1. The bridal suite's arched mirror with bulbs and a veil on a hanger
2. Soft blow-dry waves from behind
3. A nude-and-merlot gel manicure on a marble tray
4. A closed eye with classic lashes
5. Brushes and a palette on champagne silk
6. An embroidered Hijazi غمرة headdress, detail only
7. The nail room at night, with four warm lamps
8. A bride's hands holding the bouquet
9. The private room: armchair, mirror and a 1 a.m. lamp

**FAQ (Hijazi):**
1. كم العربون؟ وينخصم من الحساب؟
2. أقدر أغيّر موعدي أو ألغيه؟
3. أقدر أختار الخبيرة والغرفة؟ وإيش الفرق في الغرفة الخاصة؟
4. تسوّوا مكياج العروس في القاعة أو في البيت؟
5. فاتحين لحد متى؟ وأقدر أحجز بعد نص الليل؟
6. كيف أستخدم بطاقة الإهداء؟ وتنفع للعربون؟

**Reviews** (4, each tagged **تقييم توضيحي**):
1. رهف، الشاطئ: a bride who did the trial two weeks before the Jalwa package and liked that the price and deposit were clear from the start.
2. أم فيصل، النعيم: before a wedding, booked makeup for her two daughters and a blow-dry for herself at the same time, with three staff working in parallel.
3. شهد، طالبة: a gel manicure at 12:30 after midnight on Thursday night.
4. بيان، موظفة: a lash refill at 10 p.m. in the private room with the artist she always picks.

## 9. Voice

| Where | Hijazi (feminine) | English |
|---|---|---|
| Hero headline | **اتجلّي على مهلك، الليل لسّه طويل** | Take your time getting ready. The night's still young. |
| Subline | كل خدمة قدّامك بوقتها وسعرها. اختاري خبيرتك وغرفتك، واحجزي بعربون بسيط. فاتحين كل يوم لحد الساعة 2 بالليل. | Every service with its time and price up front. Choose your stylist and your room, and book with a small deposit. Open every day until 2 a.m. |
| WhatsApp CTA | حبيبتي، محتارة إيش تحجزي؟ كلّمينا واتساب ونساعدك تختاري. | Not sure what to book? WhatsApp us and we'll help you choose. |
| Booking confirmed | تمام يا قمر، موعدك محجوز. نشوفك الخميس 9:30 م. | You're booked. See you Thursday at 9:30 pm. |

Policy pages use formal-neutral Arabic, for example: «يُعدّ العربون جزءًا من قيمة الخدمة ويُخصم منها عند الحضور. ويجوز تعديل الموعد أو إلغاؤه دون رسوم قبل 24 ساعة على الأقل من موعده، ويُحوَّل العربون عندئذٍ إلى رصيد صالح لمدة 60 يومًا.»

## 10. Remove before finishing

**The offset bevel line on arches narrower than 160px.** That covers staff thumbnails in the booking sheet, gallery thumbs and the small gift-card preview in the sheet. At that size the second line becomes noise and makes the arch look fussy. Keep it only on the hero, bridal and gallery lead photos, the gift card and the logo.

## 11. Open questions

1. **The name isn't fully verified** (the search budget ran out). Before publishing, check Instagram by hand for `جلوة` + صالون/مشغل/لاونج and `jalwa` Jeddah. The fallback is صَقيلة · Saqeela.
2. **Matrix row 10:** change `line` to `#633A47`, and the weights to Plex Arabic 400/500 and Reem Kufi 500 (the 120 KB budget).
3. **Architecture §5.9 example is out of date.** It needs:
   - slug `maraya-beauty-lounge` → `maraya-beauty`
   - `numberingSystem: 'arab'` → `'latn'`
   - `hero: 'calendar-first'` → `'arch-frame'` and `nav: 'bottom-tabs'` → `'bar-start-logo'`
   - prefixes `MR`/`MARAYA` → `JL`/`JALWA`
   - `lead.minMinutes` 180 → 120
   - gift-card `redeem: 'in-store'` → `'both'` (deposits only)
   - the Royal Bridal 2,500 example → the three packages here
4. **Engine gaps** to confirm in Step 2:
   - `durationDeltaMinutes` on service choices.
   - A per-service `leadDays`/`horizonDays` override.
   - A choice that maps to a resource requirement (room choice).
   - Gift cards covering deposits.
   - Multi-service visits. For v1, one service per booking, plus a "احجزي اللي بعدها" shortcut that pre-selects the slot where the first service ends.
5. **Tokens:** `BrandTokens.color` needs a `surfaceDeep` slot for the matrix's "extra" colour (it is also used by 01, 02, 04, 06, 08 and 11).
6. **Money display:** menus could show whole-riyal prices without `.00` ("450"), while the booking summary and receipts keep 2 decimals ("158.00"). This is a display-only trim when `minor % 100 === 0`, not rounding. It needs a `formatMoney` option.
7. **Riyal symbol:** confirm its placement against SAMA's usage guide at build time. The working assumption is that the symbol sits visually left of the figure in both directions.
8. **`cv02` in the served files:** check that it survives in the Google/Fontsource woff2 used for headings. The wordmark is outlined, so it is safe either way.
9. **Photo policy:** confirm the "no identifiable client faces" rule, with staff shown by their hands, for this and any real salon client.
