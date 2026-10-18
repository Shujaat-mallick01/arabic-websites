# Distinctness matrix: 13 demo brands

Step 1 ("Plan first") of `arabic-websites-master-prompt.md`. Written 2026-09-23.
This file is the brand allocation for all 13 sites. The per-site `brand.md`, `tokens.ts` and logo lockups get built from it later. Fonts come only from `docs/research/fonts-and-logo-pipeline.md`.

The test from the brief: *if you can swap two sites' logos and nobody notices, you have failed.* Every section below is there to show that test passes.

---

## 1. The 13 identities

Folder slugs stay as given, even where a brand was renamed.

| # | Slug | Brand (AR · EN) | Meaning | Preset / tier | City · currency · TZ | Dialect |
|---|---|---|---|---|---|---|
| 01 | 01-layan-abaya | ليان · Layan | Softness, tenderness, an easy life (from لان) | commerce `lite` | Riffa · BHD · Asia/Bahrain | Bahraini, feminine address |
| 02 | 02-noha-modest | نُهى · Noha | Intellect, good sense (pl. of نُهية); classic girl's name | commerce `full` | Manama (Seef), ships GCC · BHD · Asia/Bahrain | Khaleeji-Bahraini, feminine, GCC-neutral |
| 03 | 03-dar-al-sidra | دار السدرة · Dar Al Sidra | House of the sidr (lote) tree that shades souq courtyards | commerce `full` | Manama (Bab Al Bahrain souq) + Isa Town branch · BHD · Asia/Bahrain | Bahraini |
| 04 | 04-rayman-boutique | رازقي · Raziqi *(renamed)* | Arabian jasmine, Baghdad's summer flower strung into necklaces | commerce `full`, COD primary | Baghdad (Al-Mansour) · IQD · Asia/Baghdad | Iraqi (Baghdadi), feminine |
| 05 | 05-anbar-scent | عنبر · Anbar | Ambergris, the warm base note of Gulf perfumery | commerce `full` | Salmiya · KWD · Asia/Kuwait | Kuwaiti |
| 06 | 06-dar-al-cacao | دار الكاكاو · Dar Al Cacao | House of cacao | commerce `full` | Saar · BHD · Asia/Bahrain | Bahraini |
| 07 | 07-halawat-al-deera | حلاوة الديرة · Halawat Al Deera | Sweetness of the home town (ديرة) | commerce `lite` | Muharraq · BHD · Asia/Bahrain | Bahraini (Muharraqi warmth) |
| 08 | 08-sukkariya-cakes | طبقة · Tabaqa *(renamed)* | A layer, each tier of a cake | booking `full` | Riyadh · SAR · Asia/Riyadh | Najdi-neutral, feminine |
| 09 | 09-lahza-cake | لحظة · Lahza | A moment, cakes for right now | commerce `full` | Jeddah · SAR · Asia/Riyadh | Hijazi |
| 10 | 10-maraya-beauty | جَلوة · Jalwa *(renamed)* | The Hijazi bride's unveiling; from جلا, to polish until it shines (like a mirror) | booking `full` | Jeddah · SAR · Asia/Riyadh | Hijazi, feminine |
| 11 | 11-naqsha-henna | بَنان · Banan *(renamed)* | Fingertips, from the classical image مخضّب البنان (henna-dyed fingertips) | booking `lite` + cone shop | Hamad Town · BHD · Asia/Bahrain | Bahraini, feminine |
| 12 | 12-lamar-favors | لمار · Lamar | Girl's name popularly glossed as "pure gold" | commerce `full` | Hawalli · KWD · Asia/Kuwait | Kuwaiti |
| 13 | 13-athar-events | قَمْرة · Qamra *(renamed)* | A moonlit night (Gulf usage: قعدة بالقمرة), gatherings under the moon | commerce `lite` (estimate + booking request) | Kuwait City · KWD · Asia/Kuwait | Kuwaiti |

That makes nine sites `full` (02, 03, 04, 05, 06, 08, 09, 10, 12), which clears the brief's minimum of five.

### Why five brands were renamed

The brief says not to use any real business's name. A web search on 2026-09-23 turned up these conflicts. A web search can't prove a name is unused, so it only rules names out. The other eight names showed no business with the same name in the same niche and country. Lamar Kuwait is an elevator company and the Al Sidra villas in Diyar Al Muharraq are a housing development; neither sells anything close to these demos, so both names stay.

| Slug | Suggested | Problem found | Replacement (checked, nothing in the niche found) |
|---|---|---|---|
| 04 | ريمان · Rayman | "Rayman" in Latin is Ubisoft's game franchise. Women's-clothing Instagram shops already trade as متجر ريمان | رازقي · Raziqi |
| 08 | سكّرية · Sukkariya | "السكرية · Al-Sukkariya Dates" is a Saudi sweets/dates seller on Instagram | طبقة · Tabaqa |
| 10 | مرايا · Maraya | A "Maraya" beauty salon traded in Jeddah (Cobone deal listing): same niche, same city | جَلوة · Jalwa |
| 11 | نقشة · Naqsha | نقشة is a Bahraini company with its own `.bh` domain (naqsha.bh). The fallback خضاب is a Saudi henna store | بَنان · Banan |
| 13 | أثر · Athar | Dar al-Athar al-Islamiyyah is Kuwait's best-known cultural *events* institution. سمر · Samar already runs events in Kuwait. لمّة was clean but too close to لمار (site 12, also Kuwaiti celebrations) | قَمْرة · Qamra |

Sources: [Ubisoft Rayman](https://store.ubisoft.com/us/rayman?lang=en_US), [@reeman_200](https://www.instagram.com/reeman_200/), [@rimanstore_](https://www.instagram.com/rimanstore_/), [@alsukkariya](https://www.instagram.com/alsukkariya/), [Maraya on Cobone](https://www.cobone.com/en/deals/beauty-spa-jeddah/maraya-24oct-straithair%20/28343), [naqsha.bh](https://www.naqsha.bh/), [kedhab-ksa.com](https://kedhab-ksa.com/%D8%AC%D9%85%D9%8A%D8%B9-%D8%A7%D9%84%D9%85%D9%86%D8%AA%D8%AC%D8%A7%D8%AA/c1758822908), [Dar al-Athar al-Islamiyyah](https://darmuseum.org/), [Lamar Kuwait](https://lamar-kw.com/about-us/), [Al Sidra, Diyar Al Muharraq](https://www.diyar.bh/en/properties-list/14/al-sidra).

---

## 2. The matrix

**Value structure codes**
- **L**: light neutral ground, dark ink; the colour comes from the accent only.
- **T**: tinted colour ground, with the accent as its partner.
- **S**: split, a light ground cut by full-width dark colour bands.
- **D**: dark ground, light ink.

| # | Brand | Palette (structure · ground · accent) | Arabic display / body | Latin display / body | Hero archetype | Layout rhythm | Signature element | Shape language |
|---|---|---|---|---|---|---|---|---|
| 01 | Layan | **L** · cool pearl grey · jet ink · oxblood thread | Katibeh (naskh-thuluth) / Noto Sans Arabic | Libre Caslon Display / Instrument Sans | **Lookbook vertical scroll**: one uncropped full-length look per screen, snap-scrolled, caption bar anchored at the bottom | One item per screen, then a staggered 2-col grid offset by half a card | **Length rule**: a tape-measure rail (50–62 in) on the inline-end edge; oxblood marker = chosen length, doubles as size guide | 0 radius, 1px hairlines, 4:5 and 2:3 portraits, full-width bar buttons |
| 02 | Noha | **T** · dusk-blue mist · ink-navy · ochre | Alexandria (geometric) / Alexandria | Montserrat / Montserrat | **Story-highlight rail first**: tall 9:16 highlight cards (جديدنا، كفتانات، أطقم، هدايا…), then one wide campaign band with price | Rail / band / grid / rail, horizontal-first | **Arrival-date ribbon**: a thin ochre strip on every product ("يوصلج الكويت الأحد ٢٨ سبتمبر") with a GCC country switcher | 14px story-card radius, 10px buttons, borderless tone-on-tone cards, 2px ochre tab underline |
| 03 | Dar Al Sidra | **S** · limestone · sidr-green bands · brass hairline | Qahiri (manuscript Kufic, words only) / Fustat | Cinzel / Fustat Latin | **Branch console**: a green band with both branches' live open/closed status, today's hours and "استلام اليوم", beside a big catalogue search with swatch facets | Dense catalogue: sticky facet bar, 2/4-col grid, spec tables, green signage bands between sections | **Pinked swatch chips**: real fabric-texture squares with zigzag (pinking-shear) edges, used as facets, variant pickers and category entries | 2px radius, pinked edges, table rules, brass 1px hairlines |
| 04 | Raziqi | **L** · warm sand · indigo-black ink · Ishtar lapis | El Messiri (modern naskh sans) / Almarai | Philosopher / Outfit | **Clothes-rail shelf**: "وصل جديد" pieces hang from a drawn rail line across the screen, each on a swing tag with its IQD price; COD stamp above | Stacked horizontal rails like shop rails (new, dresses, sets, bags), each headed by a big lapis label; province delivery table | **Swing tag**: every price sits on a lapis hang-tag with a clipped corner and jasmine-shaped hole; the share link lives on the tag | Clip-path notched tags, dashed "string" lines, 8px image radius, 2px lapis outline buttons |
| 05 | Anbar | **D** · smoke slate · ivory ink · amber (+ scent-family fields) | Aref Ruqaa (ruqaa, words only) / Noto Kufi Arabic | Marcellus / Be Vietnam Pro | **Single-object spotlight**: one uncropped bottle on a lit colour field; family tabs (عود، عنبر، زهري، منعش) recolour the field | Slow: one object per viewport, alternating sides, long scent stories | **Blotter strip**: a tall paper scent strip with top/heart/base notes placed along it (the note pyramid, drawn the perfumer's way) | Square images, one 28px-radius light-box field, 1px gold hairlines, no cards |
| 06 | Dar Al Cacao | **D** · cacao brown · cocoa-butter ink · pistachio | Amiri (classical naskh) / Mada | Cormorant Garamond / Karla | **Overhead tray**: full-bleed top-down tray photo; one piece in the grid is a live wrapper that prints the name/date the visitor types | Square tray modules (2×2, 3×3) and a step builder: tray → wrapper → date and slot | **Printed-wrapper preview**: a foil-wrapped square with the customer's names in a band, shown in hero, product and checkout summary | 12px "chocolate square" radius, 1px cocoa gutters, no shadows |
| 07 | Halawat Al Deera | **L** · gypsum white · date-brown ink · terracotta | Rakkas (ruq'ah poster, words only) / Noto Naskh Arabic | Young Serif / Newsreader | **Typographic menu board**: the hero *is* the menu: item, size, price with dotted leaders; one small cut-out of today's tray | Columnar menu lists; seasonal sections (رمضان، العيد، العيد الوطني) as full-width tabs; photos as small insets | **"بكرة" stamp**: a rubber-stamp date showing the earliest order date (tomorrow), on menu and form, and it enforces the 1-day notice | 0 radius, 2px double signboard rules, dotted leaders, stamp rotated −4° |
| 08 | Tabaqa | **T** · lilac · grape-black ink · plum | Marhey (hand-lettered) / Readex Pro | Fraunces (SOFT) / DM Sans | **Availability strip first**: a two-week date strip showing orders left per day; sold-out days struck; tap a day to start | Step flow: date → size/flavour → reference upload → deposit; masonry gallery after | **Candle slots**: each day shows its cap as candles; lit = free, blown out = taken | 24px radii, scalloped (piped-icing) section edges, pill date chips (the only pill system) |
| 09 | Lahza | **T** · butter yellow · espresso ink · Red Sea teal | Alyamama (advertising naskh) / Beiruti | Alegreya / Afacad | **Countdown masthead**: an oversize live clock "باقي ٠٢:١٤ على آخر طلب اليوم" fills the width; "جاهز الآن" strip under it | Poster sections: big type / tight product strip / big type, split by thick espresso rules | **Cutoff clock**: live same-day countdown that flips to "tomorrow" mode after the cutoff | 0 radius, 3px espresso borders, hard 4px offset shadow (the only site with one), oversized tabular numerals |
| 10 | Jalwa | **D** · merlot · rose-ivory ink · champagne | Reem Kufi (Fatimid kufi, cv alternates, words only) / IBM Plex Sans Arabic | Prata / IBM Plex Sans | **Asymmetric editorial split**: tall arched-mirror photo on one side (about 60%), service menu with durations, prices and "next free slot today" on the other | Magazine 7/5 splits alternating sides; long service lists; pull-quote reviews | **Mirror arch**: every photo sits in an arch-topped frame with an offset champagne bevel line | Arch-topped frames, double hairline bevel, 6px radius elsewhere |
| 11 | Banan | **L** · warm rice paper · henna-brown ink · henna-leaf green | Vibes (hairline, ≥48px) / Mada | Italiana / Source Sans 3 | **Portfolio wall first**: an edge-to-edge 3-col wall of henna work with style chips (خليجي، هندي، سوداني، ناعم، عرايس); booking-window status pinned above | Dense photo wall with minimal text, then booking block, then small cone shop | **Cone line**: one continuous hairline henna stroke that divides sections and becomes the seasonal booking-window timeline (dots = open days) | 2px-gap square photo wall, 0 radius on photos, hand-drawn hairline dividers, round-ended 1px outline chips |
| 12 | Lamar | **T** · blush · raisin ink · rosewood | Lemonada (rounded naskh-diwani) / Almarai | Comfortaa / Manrope | **Occasion mosaic**: packed collage of favours at mixed scales; occasion labels on tiles (قرقيعان، مواليد، أعراس، تخرج، شركات) are the entry points | Collage blocks of mixed spans alternating with clean tier tables | **Tier ladder**: a stepped bar showing price per piece falling at 25 / 50 / 100 / 200+; the current quantity lights its step | 4px radius tiles with an inset 1px gold "box-lid" frame, mixed spans |
| 13 | Qamra | **D** · midnight navy · warm ivory ink · moonlight ice | Kufam (kufi signage) / Kufam | Archivo (wdth 125) / Archivo | **Estimate-first configurator**: theme → package → add-ons, with a live total, beside a large photo of the chosen setup | Tool plus sticky summary (column on desktop, bottom tape on phone); long dark portfolio pages per theme | **Receipt tape**: an ivory paper strip with a perforated edge that grows line by line and totals in KWD (3 decimals), ending in "أرسل التقدير واتساب" | 0–2px corners, perforated tape edge, square checkboxes, 1px ice rules on selected options |

### Palette hexes

Every row passes WCAG AA: ink, muted ink and accent each reach at least 4.5:1 on both `bg` and `surface`, and the best text colour on an accent button reaches at least 5.5:1. `line` is for decorative hairlines only; input borders use `muted` so they meet the 3:1 non-text rule.

| # | bg | surface | ink | muted | accent | line | extra |
|---|---|---|---|---|---|---|---|
| 01 | `#E6E7E6` | `#F4F4F3` | `#121212` | `#545555` | `#6A1E24` oxblood | `#C9CBCA` | deep `#0A0A0A` |
| 02 | `#DCE5EE` | `#F3F6FA` | `#16202B` | `#4A5664` | `#7E560F` ochre | `#C3CFDB` | deep `#22303F` |
| 03 | `#F4F4EE` | `#FFFFFB` | `#17221F` | `#545E5A` | `#1A4A44` sidr green | `#B08D57` brass hairline | band `#123530` |
| 04 | `#EBDBBE` | `#F7EFE0` | `#1B1A27` | `#574C3B` | `#2447A8` lapis | `#D3BF99` | deep `#17337A` |
| 05 | `#141619` | `#1E2125` | `#EEE8DE` | `#A39C91` | `#D6953F` amber | `#34383D` | gold hairline `#A8895A`; fields: oud `#3B2A22`, amber `#5A3A17`, floral `#4C2E3A`, fresh `#22403C` |
| 06 | `#2A1B15` | `#3A271F` | `#F4E9DB` | `#C5B19E` | `#AEC274` pistachio | `#57402F` | deep `#1B110C` |
| 07 | `#FBF8F2` | `#F2E9DB` | `#241C16` | `#6B5B4E` | `#AD4926` terracotta | `#DDCEB8` | halwa `#5A2A18` |
| 08 | `#E6E0F2` | `#F8F6FC` | `#261F36` | `#5C5570` | `#6A4690` plum | `#D2CAE3` | deep `#3A2F63` |
| 09 | `#F2DE96` | `#FAF2D2` | `#231A13` | `#5A4B30` | `#0B676C` Red Sea teal | `#D6BF6E` | espresso block `#2B2118` |
| 10 | `#2B131A` | `#3B1E27` | `#F6ECE7` | `#CDB3B1` | `#E2C2A8` champagne | `#5A3440` | deep `#1C0B10` |
| 11 | `#F3EADB` | `#FBF7EF` | `#45231A` | `#6F5446` | `#556B2F` henna leaf | `#DDCFB9` | deep `#2E170F` |
| 12 | `#F5DAD8` | `#FDF5F4` | `#2D1D23` | `#6A545B` | `#9A4467` rosewood | `#E8C6C3` | gold hairline `#B7966A` |
| 13 | `#0F1A2B` | `#172539` | `#F1EEE6` | `#A8B2C0` | `#B9CBE0` moonlight ice | `#2A3A52` | tape paper `#F3EEE3` |

Gold appears only as a hairline (03 brass, 05, 12) or as type accents. No site uses gold fills or gradients.

---

## 3. Checks behind the allocation

### Colour separation (measured)

For every one of the 78 pairs, I computed CIEDE2000 ΔE between the two grounds and between the two accents, then combined them (√(ΔE_bg² + ΔE_accent²)). I retuned accents and grounds within each brand's theme until the worst pair cleared 20.

- **Minimum 21.0, median 52.1.**
- Closest pairs, and the other things that set them apart:
  - **02 / 07** (21.0): a blue-mist tinted ground vs a warm white one, ochre vs terracotta. Also a geometric sans vs a ruq'ah poster face, and a story rail vs a menu board.
  - **08 / 12** (21.0): lilac + plum vs blush + rosewood. Also Marhey vs Lemonada, a calendar vs a collage, and candles vs a ladder.
  - **01 / 07** (21.0): cool grey + jet + oxblood vs warm white + date-brown + terracotta. Also Katibeh vs Rakkas, and a photo lookbook vs a text menu.
  - **01 / 12** (21.3): grey vs pink ground (bg ΔE 11.7).
  - **03 / 09** (21.8): the accents are both teal-green, but 03 is a white page with heavy green bands and 09 is a yellow page with espresso type (bg ΔE 18.9).
- Structure groups:

  | Structure | Sites | Grounds | Accents |
  |---|---|---|---|
  | **L** | 01, 04, 07, 11 | cool grey, tan, warm white, cream | oxblood, lapis, terracotta, green (inks also differ: jet, indigo-black, date brown, henna brown) |
  | **T** | 02, 08, 09, 12 | blue, lilac, yellow, pink | ochre, plum, teal, rosewood |
  | **S** | 03 | limestone | sidr green bands |
  | **D** | 05, 06, 10, 13 | neutral slate, brown, wine, navy | amber, pistachio, champagne, ice |

- No purple-blue gradient anywhere. Each site has one accent.

### Type allocation audit

- **13 different Arabic display faces**, spanning every class the brief asked for:
  - naskh-thuluth (Katibeh)
  - geometric (Alexandria)
  - manuscript Kufic (Qahiri)
  - modern naskh-sans (El Messiri)
  - calligraphic ruqaa (Aref Ruqaa)
  - classical naskh (Amiri)
  - poster ruq'ah (Rakkas)
  - hand-lettered (Marhey)
  - advertising naskh (Alyamama)
  - Fatimid kufi (Reem Kufi)
  - hairline display (Vibes)
  - rounded naskh-diwani (Lemonada)
  - kufi signage sans (Kufam)
- **24 different Latin faces**, with no Latin family on two sites. Every Arabic/Latin pair is a measured pairing from §A5 of the font research.
- **Arabic families on two sites** (the maximum allowed), each time with a different Latin partner:
  - Almarai: 04 with Outfit, 12 with Manrope
  - Mada: 06 with Karla, 11 with Source Sans 3
- Every other Arabic family is used once. Cairo and Tajawal are used nowhere.
- **Glyph-coverage rules applied:**
  - Qahiri, Aref Ruqaa and Reem Kufi lack ٫ ٬, so they carry words only; all prices go in the body face.
  - Readex Pro lacks پ چ گ, so it sits only on 08 (Riyadh), and 08's copy must avoid those letters.
  - The Iraqi and Kuwaiti sites (04, 05, 12, 13) use faces that include چ گ پ.
  - Zain is not used.
  - The Saudi sites (08, 09, 10) render the riyal sign as an SVG icon. Alyamama (09) has U+20C1, but only its display face could use it.
- **Numbering system per site:**
  - `arab`: 01, 03, 05, 06, 07, 09, 11, 13
  - `latn`: 02 (GCC multi-currency checkout), 04 (Iraqi Instagram norm), 08 and 10 (dates and durations), 12 (tier tables)
  - Every price face covers U+0660–0669 and U+066B/U+066C.
- **Size cautions for the display faces:**
  - Katibeh (01) and Vibes (11) are for large sizes only: at least 32px and 48px.
  - Amiri (06) is headings only, at 24px or more. It is a 109 KB payload, so the wordmark ships as outlined SVG.

### Banned-pattern check

- **Centred stacks:** every hero anchors its text to the start edge or sits it on the photo; no hero is a centred text stack.
- **Three identical cards:** none. The repeating units are all different: looks, highlight cards, swatches, tags, trays, menu lines, candles, arches, photo walls, collage tiles and receipt lines.
- **Icons in coloured circles:** none. Round shapes are data glyphs or logo marks, not decoration (the moon disc in 13, the jasmine hole in 04).
- **Fade-up on every section:** none. Each site has at most one small motion idea:

| Site | Motion |
|---|---|
| 01 | Native scroll-snap; length marker slides 200ms |
| 02 | Rail momentum; cart drawer 240ms |
| 03 | 120ms opacity swap on filter results |
| 04 | Tag swings 3° once on add to bag |
| 05 | Colour field crossfades 400ms |
| 06 | Wrapper text updates live, no animation |
| 07 | Static |
| 08 | Chosen day lifts 4px; a candle goes out as its slot is taken |
| 09 | Clock ticks each second, no tween |
| 10 | Booking sheet slides up 240ms |
| 11 | Cone line draws once, 600ms |
| 12 | Ladder bar fills 150ms |
| 13 | Total counts up in ≤300ms; tape lines append in 120ms |

All motion drops to instant or static under `prefers-reduced-motion`.

### Logo marks (for the swap test)

Each mark comes from its own brand's story, and no two share a device:

| Site | Mark |
|---|---|
| 01 | The tall لـ with an oxblood length tick |
| 02 | A monoline ن and damma in a story-card tile |
| 03 | A three-vein sidr leaf in square-Kufic geometry, on a pinked square |
| 04 | A lapis swing tag with a jasmine hole |
| 05 | The Ruqaa ع inside an ambergris-pebble outline |
| 06 | A chocolate square debossed with د |
| 07 | The Rakkas ح on a hanging signboard plaque |
| 08 | Three cake layers with two wavy cream lines |
| 09 | The ظ upright as a clock hand sweeping a quarter arc |
| 10 | A mirror arch with an offset bevel line |
| 11 | A one-stroke fingertip with a five-dot henna flower |
| 12 | A ribbon bow of two mirrored loops with a gold-hairline knot |
| 13 | The ق's two dots as a moon and its reflection across a horizon hairline |

For the logo generator:
- The Latin lockups use 13 different Latin display faces.
- Wordmarks can pull stylistic sets as a cheap extra way to tell them apart: Qahiri `ss01`, Reem Kufi `cv02`, Aref Ruqaa `ss01–ss04`, Amiri `ss01`. The research doc confirms these features change the output.

---

## 4. Why no two sites are swappable

Seven design choices are unique to one site, with no repeats anywhere in the set:
- hero archetype
- signature element
- logo mark
- Arabic display face
- Latin display face
- shape-language device
- motion idea

So any two sites differ on at least those seven axes before colour comes in. On colour, the closest pair still scores 21 on the combined ground and accent distance; the median pair scores 52. The sites that share a value structure are split by ground hue, accent family and ink colour.

Take the two nearest neighbours in niche. **Tabaqa (08)** and **Lahza (09)** are both Saudi cake brands. Tabaqa is a lilac, rounded, hand-lettered booking calendar with candle slots. Lahza is a butter-yellow, square-cornered, 900-weight poster with a live clock. **Layan (01)**, **Noha (02)**, **Dar Al Sidra (03)** and **Raziqi (04)** all sell women's clothing. Their home screens open on four different objects: a snap-scrolled look, a highlight rail, a branch console and a clothes rail. Each is set in a different script class and colour structure.

Swap any two logos and the result breaks at once. The wordmark's face, the mark's device and the colours would all belong to the wrong site.
