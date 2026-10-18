# Arabic fonts and the logo/OG pipeline: research reference

Research date: **2026-09-23**. Status: input to Step 1 ("Plan first") of `arabic-websites-master-prompt.md`.
Later phases (brand tokens, `packages/brand`, `scripts/new-site.ts`, `scripts/rebrand.ts`) should treat this as the source of truth and re-check anything marked **[L]** or **[A]** before relying on it.

**Evidence tags**
- **[V] Verified.** Checked directly today: read from Google Fonts metadata or the google/fonts repo, measured in the TTF files with fontTools, or run in a Node proof of concept on this machine (Windows 11, Node 22.18.0).
- **[L] Likely.** Strong secondary evidence (vendor docs, a reputable third-party report, or metrics that match exactly) but not reproduced here.
- **[A] Assumption or judgement.** Design recommendations and untested claims.

---

## 0. TL;DR (decisions this research supports)

1. **All 42 families on the checklist exist on Google Fonts, carry the `arabic` subset, and are OFL-1.1** [V]. The Arabic-subset universe on Google Fonts is 57 families [V]. Two newer ones are worth adding to the palette: **Alyamama** (Naskh advertising face, added 2026-02-18) and **Fustat** (Kufi-inspired sans by Gaber and Hosny).
2. **Match alef height to Latin cap height, then check body/x-height (target 0.75–1.0) and stem weight.** Every harmonised bilingual family on Google Fonts that I measured follows this rule, whether its Latin was matched or borrowed (IBM Plex, Noto, Readex/Lexend, Almarai, El Messiri/Philosopher) [V]. §A5 has a measured pairing table.
3. **Coverage traps that affect this brief:**
   - Aref Ruqaa, Reem Kufi (all three), Qahiri, Blaka, Tajawal, Gulzar and Amiri Quran **lack U+066B/U+066C**, the Arabic decimal and thousands separators that `Intl.NumberFormat('ar-BH'|'ar-KW'|'ar-SA'|'ar-IQ')` emits by default [V]. Never set prices in these fonts.
   - **Readex Pro lacks پ چ گ** (U+067E, U+0686, U+06AF) and **Tajawal lacks چ گ** [V]. That matters for Iraqi copy (site 04) and Kuwaiti copy (05, 12, 13) if the dialect is spelled with these letters.
   - **Zain's Arabic-Indic digits are drawn identical to Western digits** [V].
   - **Only 4 of the 57 fonts contain U+20C1, the new Saudi Riyal sign** [V].
4. **Logo pipeline: `harfbuzzjs@1.6.2` (HarfBuzz 14.5.0 wasm) + `bidi-js@1.1.0` → SVG paths.** I verified in this session that it shapes Aref Ruqaa, Amiri with tashkeel, Nastaliq, Readex Pro at wght 400/700, and mixed Arabic/Latin/number lines correctly.
   - **Do not use opentype.js:** 2.0.0 mis-shapes Aref Ruqaa and throws on Amiri and Noto Nastaliq [V].
5. **OG pipeline: compose `og.svg` from the same outlined paths, then rasterise with `@resvg/resvg-wasm@2.6.2`** [V: 1200×630, 42.7 KB PNG].
   - **Do not use satori or `@vercel/og` for Arabic.** satori 0.33.x now shapes with HarfBuzz but has no bidi, so the word order of RTL lines is wrong. It also has no WOFF2 support [V docs] [L behaviour].
   - **Do not rely on resvg's own `<text>` layout.** It ignores `direction="rtl"` when ordering mixed runs, and it ignores variable-font weight [V].
   - For photo-led OG cards, use **Playwright** (`playwright@1.63.0`) as the alternative. `check-all` and the hub screenshots need it anyway [A].
6. **Font files for tooling:** fetch full TTF/VF from **google/fonts at a pinned commit** (`e44c4b011a820c2cbe2fd2cfa8052037d7edb571`, 2026-09-20) [V]. HarfBuzz cannot read WOFF2, so **`@fontsource/*` npm packages (WOFF2/WOFF only) cannot feed the logo pipeline** [V]. Browsers should still get WOFF2 through the Astro Fonts API or Fontsource.

---

## Part A. Arabic font catalogue

### A1. Method

| Step | Source / tool | Result |
|---|---|---|
| Existence, subsets, weights, axes, designers, popularity | `https://fonts.google.com/metadata/fonts` (2.7 MB JSON, 1,946 families) | [V] 57 families list the `arabic` subset |
| Canonical files and licence | `google/fonts` repo `ofl/<slug>/METADATA.pb` (all 57 are under `ofl/`) | [V] filenames, upstream repos |
| Metrics and coverage | TTFs downloaded from the google/fonts repo; fontTools 4.60.1. Variable fonts were instanced at wght=400 | [V] cmap coverage, GSUB/GPOS features, alef height, Arabic body height (median yMax of ص ه م و), alef stem width at mid-height, Latin x/cap height and `n` stem |
| Latin pairing candidates | 140 Latin families (weight 400 TTF from the css2 API) measured the same way | [V] metrics; the pairing choices are [A] |
| Rendering check | harfbuzzjs 1.6.2 → SVG → resvg-wasm → PNG. Specimen sheets inspected visually | [V] shaping correct; found the Qahiri unicase Latin, the Zain digits and the tofu separators |
| Web payload | Fontsource CDN `arabic-400-normal.woff2` / `:vf` `arabic-wght-normal.woff2` sizes | [V] bytes on 2026-09-23 |

"Body" = median yMax of isolated ص ه م و, a stand-in for the Arabic "x-height" (tooth/bowl height). All heights are fractions of the em.

### A2. Master table: the requested families

Legend:
- **Class:** naskh, kufi, ruqaa, nastaliq, geometric sans, humanist sans, display.
- **VF axes** come from the metadata [V]. **Latin** says whether the font has Latin glyphs and whose design they are.
- **Role:** B = fit for body text, H = headings and short UI text, D = display or wordmark only. This column is [A], judged from design intent, metrics and upstream READMEs.
- **Gaps [V]:** `sep` = no U+066B/U+066C; `چگ` = missing tcheh/gaf; `curs` = relies on GPOS cursive attachment, which breaks in shapers without it.
- **LH** = default `line-height: normal` from hhea (asc + desc + gap) [V].
- **woff2** = Arabic subset, weight 400 static / variable [V].
- **Pop** = Google Fonts popularity rank out of 1,946 (lower = more common, so less distinctive) [V].

| # | Family | Class | Weights (static) | Variable axes | Latin (identity) | Role | Gaps / notes | LH | woff2 (ar) | Pop |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Aref Ruqaa** | ruqaa (calligraphic) | 400, 700 | none | yes. AMS Euler-based [V README] | D | `sep`; `curs`; ss01–ss08 | 1.56 | 38 KB | 795 |
| 2 | **Aref Ruqaa Ink** | ruqaa, colour (OT-SVG + COLRv1) | 400, 700 | none | yes (Euler) | D (web only) | as #1. Colour cannot be kept by outlining | 1.56 | 115 KB | 1442 |
| 3 | **Amiri** | naskh (classical Bulaq) | 400, 400i, 700, 700i | none | yes, own serif; metrics ≈ Crimson Text [L] | B (≥18 px) / H | `curs`; very small body (0.328). Heavy payload | 1.76 | 109 KB | 216 |
| 4 | **Reem Kufi** | kufi (Fatimid / early Mushafi) | 400–700 | wght 400–700 | yes. **Josefin Sans** [V README] | D / H | `sep`; cv01–cv03 change most words [V] | 1.50 | 9 KB / 12 KB | 501 |
| 5 | **Reem Kufi Fun** | kufi, colour (COLRv0) | 400–700 | wght 400–700 | Josefin Sans | D | `sep` | 1.50 | 9 KB / 13 KB | 1545 |
| 6 | **Reem Kufi Ink** | kufi, colour (OT-SVG + COLRv1) | 400 | none | Josefin Sans | D (web only) | `sep` | 1.50 | 9 KB | 1567 |
| 7 | **El Messiri** | modern naskh-inspired sans ("brush" curves) | 400–700 | wght 400–700 | yes. **Philosopher** [V README] | H / short B | none | 1.56 | 12 KB / 22 KB | 370 |
| 8 | **Readex Pro** | geometric-humanist sans (Lexend family) | 200–700 | wght 160–700, HEXP 0–100 | yes. **Lexend** [V README] | B / H | **no پ چ گ, no Persian digits** [V] | 1.25 | 10 KB / 23 KB | 260 |
| 9 | **IBM Plex Sans Arabic** | humanist sans | 100–700 (7 statics) | none | yes. IBM Plex Sans (identical metrics) [V] | B / H | none; ss01–ss06 | 1.50 | 43 KB | 191 |
| 10 | **Alexandria** | geometric sans (matched to Montserrat) | 100–900 | wght 100–900 | yes, own, Montserrat-style [V README] | B / H / D | **runs about one weight step heavier than Montserrat**: Alexandria 300 ≈ Montserrat 400 [V measured] | 1.22 | 12.5 KB / 31 KB | 313 |
| 11 | **Almarai** | geometric-humanist sans (Boutros) | 300, 400, 700, 800 | none | yes, own sans | B / H | `latin` only (no latin-ext) | 1.12 | 32 KB | 174 |
| 12 | **Rubik** | rounded geometric sans | 300–900 + italics | wght 300–900 | yes. Rubik | B / H | tight LH | 1.19 | 17 KB / 32 KB | 29 |
| 13 | **Noto Kufi Arabic** | kufi-style geometric sans | 100–900 | wght 100–900 | yes. Noto Sans (identical metrics) | B / H | heavy VF | 1.90 | 44 KB / 124 KB | 221 |
| 14 | **Noto Naskh Arabic** | naskh (text) | 400–700 | wght 400–700 | yes. Noto Serif (identical metrics) | B | has U+20C1 | 1.70 | 53 KB / 94 KB | 252 |
| 15 | **Noto Sans Arabic** | naskh-derived UI sans | 100–900 | wdth 62.5–100, wght 100–900 | yes. Noto Sans | B / UI | very tall default LH | 2.11 | 49 KB / 166 KB | 153 |
| 16 | **Markazi Text** | naskh (text, moderate contrast) | 400–700 | wght 400–700 | yes, own (F. Runge) [V README] | B (editorial) | small on the em (alef 0.512); no U+066A ٪ | 1.20 | 23 KB / 41 KB | 723 |
| 17 | **Lateef** | naskh (SIL, Sindhi/Urdu style) | 200–800 (7 statics) | none | basic SIL Latin | B for Sindhi/Urdu. Not for Gulf brands | tiny on the em (body 0.245) | 1.45 | 62 KB | 598 |
| 18 | **Scheherazade New** | naskh (SIL, traditional) | 400–700 (4 statics) | none | basic SIL Latin | B (long-form, policies) | widest coverage incl. U+20C1 and isolates | 2.04 | 79 KB | 814 |
| 19 | **Harmattan** | West African (Warsh) naskh-sans (SIL) | 400–700 (4 statics) | none | basic SIL Latin | not recommended | small on the em; heavy payload | 1.70 | 136 KB | 1109 |
| 20 | **Mada** | modernist low-contrast sans | 200–900 | wght 200–900 | yes. **Source Sans** [V README] | B / UI | none | 1.30 | 11 KB / 27 KB | 448 |
| 21 | **Changa** | squarish display sans | 200–800 | wght 200–800 | yes, own squat Latin | H / UI | tall LH | 1.84 | 11 KB / 23 KB | 284 |
| 22 | **Lalezar** | heavy poster display (Film-Farsi) | 400 | none | yes, own companion | D | single weight | 1.57 | 52 KB | 385 |
| 23 | **Marhey** | playful hand-lettered display | 300–700 | wght 300–700 | yes, own | D / short H | none | 1.74 | 16 KB / 27 KB | 1209 |
| 24 | **Rakkas** | ruq'ah poster display (1950s–60s film posters) | 400 | none | yes, informal blackletter | D | `curs`; contextual alternates; ss01–ss09 | 1.49 | 26 KB | 634 |
| 25 | **Kufam** | kufi-inspired signage sans | 400–900 + italics | wght 400–900 | yes, own (Original Type) | H / UI / short B | none | 1.30 | 35 KB / 56 KB | 977 |
| 26 | **Baloo Bhaijaan 2** | rounded friendly display sans | 400–800 | wght 400–800 | yes. Baloo 2 (identical metrics) | D / H | none | 1.71 | 21 KB / 38 KB | 854 |
| 27 | **Handjet** | modular / pixel display | 100–900 | wght 100–900, ELGR 1–2, ELSH 0–16 | yes, own | D | novelty | 1.12 | 9 KB / 9 KB | 1383 |
| 28 | **Blaka** | blackletter × kufi display | 400 | none | yes, blackletter | D | `sep`, no ٪ | 1.17 | 10 KB | 1721 |
| 29 | **Qahiri** | kufi (Abdul Qadir manuscript Kufic) | 400 | none | **unicase Kufic Latin: A–Z map to the same glyphs as a–z** [V] | D / wordmark | `sep`; `curs`; `latin` only; ss01/ss02 alter 10 of 12 brand words [V] | 1.13 | 7 KB | 1125 |
| 30 | **Zain** | geometric sans (Boutros, 2024) | 200, 300, 400, 700, 800, 900 (+300i, 400i) | none | yes, own | B / H | **U+0660–0669 identical to 0–9** [V] | 1.66 | 30 KB | 875 |
| 31 | **Beiruti** | compact sans (Boutros, 2024) | 200–900 | wght 200–900 | yes (V. Schnebel) | B / H | short alef (0.631) | 1.20 | 21 KB / 57 KB | 1456 |
| 32 | **Gulzar** | nastaliq (Urdu, typographic) | 400 | none | yes, own | exclude for Gulf Arabic | `sep`; `curs`; biggest payload | 2.70 | 209 KB | 993 |
| 33 | **Playpen Sans Arabic** | handwriting (TypeTogether) | 100–800 | wght 100–800 | yes. Playpen Sans (+ emoji) | D / H (friendly) | `curs` | 1.65 | 41 KB / 98 KB | 1446 |
| 34 | **Vibes** | hairline playful display | 400 | none | yes, own hairline | D (large only) | stem 0.038 em, very thin | 1.79 | 17 KB | 1534 |
| 35 | **Mirza** | naskh (text, KB Studio) | 400–700 (4 statics) | none | yes, own harmonised Latin | B | no U+00A0 glyph (the NBSP inside Intl currency strings falls back) | 1.20 | 41 KB | 1051 |
| 36 | **Katibeh** | naskh headline with a Thuluth flavour | 400 | none | yes, own | D | small body (0.299) | 1.20 | 41 KB | 1215 |
| 37 | **Jomhuria** | very dark stencil-inspired display | 400 | none | yes (Eben Sorkin) | D | **renders tiny: alef 0.454 em. Set about 2× font-size** | 1.00 | 44 KB | 935 |
| 38 | **Lemonada** | rounded naskh with Diwani touches | 300–700 | wght 300–700 | yes. **Lemon** (Tunni) [V README] | D / H | reads large (body 0.605) | 2.00 | 14 KB / 34 KB | 477 |
| 39 | **Noto Nastaliq Urdu** | nastaliq (Urdu) | 400–700 | wght 400–700 | yes. Noto Serif | exclude for Gulf Arabic | `curs`; LH 2.5 | 2.50 | n/m | 307 |
| 40 | **Amiri Quran** | naskh for Quran typesetting | 400 | none | ASCII only | **exclude** (religious text only) | `sep` | 2.45 | n/m | 1248 |
| 41 | *Cairo* (reference) | kufi-ish geometric sans | 200–1000 | wght 200–1000, slnt −11–11 | yes, own | B / H | the overused default | 1.87 | 13 KB / 31 KB | 90 |
| 42 | *Tajawal* (reference) | geometric sans (Boutros) | 200–900 (no 600) | none | yes, own | B / H | `sep`, **no چ گ**; overused | 1.20 | 9 KB | 139 |

**Additional Arabic-subset families found on Google Fonts [V]** (not on the checklist):

| Family | Class / notes | Axes | Why it matters |
|---|---|---|---|
| **Alyamama** (added 2026-02-18) | Naskh "advertising" face (Mestaratype); Latin from UNAL Ancízar [V README] | wght 300–900 | Fresh and distinctive (pop 1638). **Has U+20C1 Saudi Riyal** and U+FDFC. Strong for the Saudi sites (08, 09, 10) |
| **Fustat** | Manuscript-Kufi-inspired sans (Gaber and Hosny); Latin by Laura Garcia Mut [V README] | wght 200–800 | Modern and web-optimised; 15 KB Arabic subset; good brand plus body face |
| **Estedad** (added 2026-05-12) | Persian-origin sans | wght 100–900 | Alternative UI sans |
| **Vazirmatn** | Persian-origin sans | wght 100–900 | Popular in Iran; avoid the Persian flavour for Gulf copy [A] |
| **Badeen Display** | Ultra-heavy geometric display | none | Loud party/event headlines |
| **Parastoo** | Persian naskh | wght 400–700 | Small on the em (body 0.257) |
| **Cairo Play** | Cairo with playful alternates | slnt, wght | Same overuse issue as Cairo |
| **Blaka Ink / Blaka Hollow** | Colour / outline versions of Blaka | none | Display novelty |
| Alan Sans, Oi, Cascadia Code/Mono, Alkalami, Ruwudu | Latin-first sans; fat display; monospace; West African SIL styles | varies | Not relevant for these brands [A] |

### A3. Coverage facts that constrain the brief [V]

**Number formatting.** Node 22.18 (ICU 77.1, CLDR 47) gives:

| Locale | `Intl.NumberFormat(..., {style:'currency'}).format(25.5)` | Digits | Separators emitted |
|---|---|---|---|
| `ar-BH` / BHD | `‏٢٥٫٥٠٠ د.ب.‏` | Arabic-Indic | U+066B decimal, U+066C grouping, U+200F RLM, U+00A0 |
| `ar-KW` / KWD | `‏٢٥٫٥٠٠ د.ك.‏` | Arabic-Indic | same |
| `ar-SA` / SAR | `‏٢٥٫٥٠ ر.س.‏` | Arabic-Indic | same |
| `ar-IQ` / IQD | `‏٢٦ د.ع.‏` (0 decimals, rounded) | Arabic-Indic | same |
| `ar-AE`, `ar` | `‏25.50 د.إ.‏` | Western | `.` and `,` |
| `ar-BH-u-nu-latn` | `‏25.500 د.ب.‏` | Western | `.` and `,` |

**Glyph coverage across the 57 fonts:**

| Character | Missing from | Consequence |
|---|---|---|
| U+066B / U+066C (Arabic decimal / thousands) | Aref Ruqaa (+Ink), Amiri Quran, Blaka (all 3), Gulzar, Qahiri, Reem Kufi (all 3), Tajawal | Browser falls back per glyph, so prices look broken. The logo/OG shaper would draw .notdef boxes (seen in specimens) |
| U+0686 چ / U+06AF گ | Readex Pro, Tajawal (U+0686 also missing in Alkalami, Ruwudu) | Iraqi/Kuwaiti dialect spellings fall back to another font mid-word, which **breaks joining** [L: HarfBuzz and browsers shape per font run] |
| U+067E پ | Readex Pro | Iraqi loanwords |
| U+20C1 Saudi Riyal sign (Unicode 17.0, 2025-09-09 [L]) | all except Alan Sans, Alyamama, Noto Naskh Arabic, Scheherazade New | Render the symbol as an inline SVG icon with `aria-label="ريال سعودي"`, or use text "ر.س" / "SAR". Node's ICU (Unicode 16) never emits U+20C1 anyway |
| U+FDFC ﷼ (Rial sign) | present in Almarai, Alyamama, Amiri, Estedad, Gulzar, Handjet, Harmattan, IBM Plex Sans Arabic, Jomhuria, Katibeh, Lalezar, Lateef, Marhey, Markazi Text, Mirza, all Noto, Parastoo, Scheherazade New, Vazirmatn, Zain | Not used by the Gulf currencies here |
| U+0660–0669 drawn as Western digits | **Zain** (glyphs `zero.ar`… are identical outlines to `zero`…) | Arabic-Indic formatting "silently" looks Western |

**Decision this forces (for the architecture plan) [A]:**
- Pick the numbering system per site in config: `numberingSystem: "arab" | "latn"`.
- The font that renders prices (body/UI face) must cover U+0660–0669 **and** U+066B/U+066C when `arab` is used.
- Display faces with `sep` gaps may only carry words, never prices.

**Vertical metrics.** Default line boxes range from 1.0 em (Jomhuria) to 2.7 em (Gulzar); Noto Sans Arabic is 2.11 and Scheherazade New 2.04 [V]. Always set explicit `line-height` per role in tokens; never rely on `normal`.

**Relative size on the em.** Arabic may need a size multiplier against a Latin set at the same px [V]. Alef heights: Jomhuria 0.454, Markazi 0.512, Harmattan 0.532, Lateef 0.534, Mirza 0.568, Rakkas 0.594. Alexandria is 0.82 and Reem Kufi 0.80.

### A4. Classification quick lists [A]

- **Premium / couture display (abaya, perfume, chocolate):** Aref Ruqaa, Reem Kufi (cv alternates), Qahiri, Katibeh, El Messiri, Alyamama.
- **Heritage / sweets / henna:** Qahiri, Reem Kufi, Rakkas, Amiri (headings), Aref Ruqaa.
- **Friendly / cakes / favours / events:** Marhey, Lemonada, Playpen Sans Arabic, Baloo Bhaijaan 2, Lalezar (loud), Badeen Display (loud), Vibes (large only).
- **Body / UI sans (prices, forms, product text):**
  - IBM Plex Sans Arabic, Alexandria, Almarai, Noto Kufi Arabic, Fustat, Mada, Beiruti, Kufam, Rubik.
  - Readex Pro only where the copy has no پ چ گ.
  - Zain only with Western digits.
- **Body naskh (editorial, about pages, policies):** Noto Naskh Arabic, Markazi Text (size up), Scheherazade New, Amiri (≥18 px), Mirza, Alyamama.
- **Exclude:** Amiri Quran (religious use), Noto Nastaliq Urdu and Gulzar (Urdu Nastaliq aesthetic), Lateef and Harmattan (regional styles, tiny on the em), Cascadia (monospace), Handjet and Blaka except as a deliberate gimmick.
- **Avoid as the default:** Cairo and Tajawal (brief). Tajawal also fails `sep` and چگ.

### A5. Latin pairing: rule and measured table

**Evidence for the rule [V].** In bilingual families where the Latin was drawn or picked to match the Arabic, **alef height ≈ Latin cap height or ascender**:

| Family | Alef | Latin measure |
|---|---|---|
| IBM Plex Sans Arabic | 0.740 | ascender 0.740 |
| Readex / Lexend | 0.740 | ascender 0.740 |
| Noto Sans Arabic | 0.714 | cap 0.714 |
| Almarai | 0.716 | cap 0.716 |
| El Messiri / Philosopher | 0.660 | cap 0.660 |

The Arabic body height falls at **0.73–1.0 × the Latin x-height** (Plex 0.79, Readex 0.79, Noto 0.71, Almarai 0.92, Mada 0.74, Kufam 0.88).

**The rule** [A, derived from that evidence]:
1. Align alef ↔ cap/ascender, within about ±5%. The last column below gives the Latin scale that achieves it.
2. Keep body/x in 0.72–1.05.
3. Match the Arabic alef stem to the Latin `n` stem at the weights you actually use.
4. Match the construction (contrast, terminals) by eye.

The metrics are [V]; the choice of pair is [A].

| Arabic | Latin: primary / alternative | alef / Latin cap | body / x-height | alef stem / `n` stem | Latin scale to align | Note |
|---|---|---|---|---|---|---|
| Aref Ruqaa | **Marcellus** / Cormorant Garamond | 0.687 / 0.700 · (Cormorant 0.625) | 0.98 · (1.26) | 0.082 / 0.085 · (0.057) | 98% · (110%) | Marcellus is a near-perfect metric match. Cormorant gives couture contrast but needs about 110% size and reads lighter |
| Amiri | **EB Garamond** / Cormorant Garamond | 0.695 / 0.653 | 0.81 | 0.060 / 0.070 | 106% | Classical book pairing; Amiri's own Latin is similar (Crimson-like) |
| Reem Kufi (+Fun/Ink) | **Josefin Sans** (its own Latin) / Prata or Tenor Sans | 0.800 / 0.723 | 0.90 | 0.100 / 0.093 | 111% | Prata (cap 0.80) aligns 1:1 for a fashion serif contrast |
| El Messiri | **Philosopher** (its own Latin) / Work Sans | 0.660 / 0.660 | 1.02 | 0.090 / 0.090 | 100% | Exact; Work Sans for body |
| Readex Pro | **Lexend** (own) / Fraunces or DM Sans | 0.740 / 0.700 | 0.79 (Fraunces 0.88) | 0.104 / 0.103 (Fraunces 0.105) | 106% | Fraunces gives a warm bakery pairing with identical stem weight |
| IBM Plex Sans Arabic | **IBM Plex Sans** / IBM Plex Serif | 0.740 / 0.698 | 0.79 | 0.074 / 0.080 | 106% | Superfamily; Serif shares the metrics |
| Alexandria | **Montserrat** (one weight step lighter) / Syne | 0.820 / 0.700 | 1.01 | 0.101 / 0.071 at the same weight | 117% | Pair Alexandria 300 with Montserrat 400, and Alexandria 400 with Montserrat 500–600 [V measured] |
| Almarai | **Outfit** / Manrope | 0.716 / 0.694 | 0.99 | 0.085 / 0.090 | 103% | Clean Gulf-modern |
| Rubik | its own Latin / Nunito | 0.750 / 0.700 | 0.73 | 0.083 / 0.095 | 107% | Built-in Latin reads slightly small |
| Noto Kufi Arabic | **Be Vietnam Pro** / Noto Sans | 0.760 / 0.740 | 0.92 | 0.089 / 0.095 | 103% | |
| Noto Naskh Arabic | **Newsreader** / Source Serif 4 | 0.671 / 0.676 | 0.80 | 0.063 / 0.077 | 99% | Use Newsreader's low-opsz text cut |
| Noto Sans Arabic | **Instrument Sans** / Noto Sans | 0.714 / 0.720 | 0.74 | 0.081 / 0.080 | 99% | |
| Markazi Text | its own Latin / Crimson Pro | 0.512 / 0.483 | 0.83 | 0.057 / 0.078 | 106% | Set the whole Arabic about 115–125% larger than your Latin body size |
| Scheherazade New | **EB Garamond** / Libre Caslon Text | 0.700 / 0.653 | 0.87 | 0.051 / 0.070 | 107% | |
| Mada | **Source Sans 3** (own) / Karla | 0.624 / 0.656 · (Karla 0.628) | 0.74 · (0.75) | 0.078 / 0.082 · (0.078) | 95% · (99%) | |
| Changa | its own Latin / Saira or Chakra Petch | 0.630 / 0.688 | 0.94 | 0.080 / 0.082 | 92% | Techy |
| Lalezar | **DM Serif Display** / Yeseva One | 0.566 / 0.660 | 0.81 | 0.164 / 0.142 | 86% | Both heavy; scale the Latin down |
| Marhey | **Fraunces** (SOFT/WONK) / Grandstander | 0.734 / 0.700 | 0.87 | 0.112 / 0.105 | 105% | |
| Rakkas | its own Latin / Young Serif | 0.594 / 0.670 | 0.90 | 0.110 / 0.145 | 89% | |
| Kufam | its own Latin / Archivo | 0.760 / 0.720 | 0.88 | 0.092 / 0.092 | 106% | |
| Baloo Bhaijaan 2 | **Baloo 2** (own) / Fredoka | 0.672 / 0.613 · (0.688) | 0.78 | 0.076 / n/m | 110% · (98%) | |
| Qahiri | **Cinzel** (caps-only) / Marcellus | 0.747 / 0.700 | 0.53 (Cinzel "x" = small caps) | 0.107 / 0.045 | 107% | Qahiri's own Latin is unicase Kufic. Use Cinzel for an inscriptional contrast |
| Zain | **Outfit** / Poppins | 0.695 / 0.694 | 0.99 | 0.095 / 0.090 | 100% | |
| Beiruti | its own Latin / Afacad | 0.631 / 0.605 · (0.625) | 0.99 · (0.93) | 0.064 / 0.066 | 104% · (101%) | |
| Playpen Sans Arabic | **Playpen Sans** (own) | 0.779 / 0.782 | 0.80 | 0.085 / 0.094 | 100% | |
| Vibes | **Poiret One** / Italiana | 0.678 / 0.750 | 1.09 | 0.038 / 0.032 | 90% | Both hairline; large sizes only |
| Mirza | its own Latin / Crimson Pro | 0.568 / 0.533 · (0.573) | 0.76 · (0.75) | 0.066 / 0.086 · (0.075) | 107% · (99%) | |
| Katibeh | **Libre Caslon Display** / Bellefair | 0.681 / 0.690 | 0.71 | 0.071 / 0.065 | 99% | |
| Lemonada | its own Latin (Lemon) / Comfortaa | 0.775 / 0.726 | 1.01 | 0.111 / 0.122 | 107% | |
| Jomhuria | its own Latin | 0.454 / 0.391 | 0.95 | 0.098 / 0.108 | 116% | Needs about 2× font-size overall |
| Alyamama | **Alegreya** / its own Latin | 0.647 / 0.646 | 0.84 | 0.069 / 0.071 | 100% | |
| Fustat | its own Latin / Urbanist | 0.755 / 0.700 | 0.74 | 0.075 / 0.075 | 108% | |
| Cairo (ref) | Red Hat Display | 0.717 / 0.700 | 1.00 | 0.077 / 0.074 | 102% | |
| Tajawal (ref) | Alegreya Sans | 0.645 / 0.641 | 0.95 | 0.067 / 0.070 | 101% | |

"Latin scale to align" = alef ÷ Latin cap. The CSS consequence is a per-brand token such as `--latin-scale: 1.06` applied to Latin runs or `:lang(en)` [A]. `n/m` means not measurable, because overlapping contours in the variable instance confused the stem probe.

**CSS mechanics for bilingual stacks [A, standard technique]:**
- Put the **Latin font first**: `font-family: "Marcellus", "Aref Ruqaa", serif`. The Latin file has no Arabic glyphs [V: 0 Arabic-block codepoints in all measured Latin fonts except Cardo, which has 10], so Arabic falls through to the Arabic face while Latin words use the paired Latin.
- Consequences of Latin-first: Western digits and ASCII punctuation come from the Latin face; Arabic-Indic digits and ، ؟ ٫ come from the Arabic face.
- If the Arabic face lacks a character, the browser falls back to the next font. **Mid-word fallback breaks Arabic joining**, hence the coverage checks in §A3.
- Google/Fontsource subset files already carry `unicode-range`, so loading only the Latin subset of the Latin face keeps it from capturing Arabic.
- **Never apply `letter-spacing` to Arabic.** Put tracking tokens under `:lang(en)` or on Latin-only elements. Stretch Arabic with kashida (U+0640, which all tested fonts include) or the `jalt` feature (Aref Ruqaa, Gulzar) instead [A].

### A6. Web delivery notes

- **Astro Fonts API:** the docs present it as a stable feature. Configure it with `fonts: [{ provider: fontProviders.fontsource() | fontProviders.google(), name, cssVariable, weights, styles, subsets, fallbacks, optimizedFallbacks }]` in `astro.config`, and place `<Font cssVariable="--font-x" preload />` in the head. It downloads, caches and self-hosts the files at build time, which keeps `fonts.googleapis.com` out of the CSP [V docs, 2026-09-23]. The exact option names should be re-checked against Astro 7.3.4 while scaffolding [L].
- **Fontsource** has `@fontsource/<id>@5.3.x` for all 42 requested families, plus Fustat and Alyamama; `@fontsource-variable/<id>` exists for the variable ones [V npm]. These packages contain **WOFF2/WOFF only**, split per subset (arabic / latin / latin-ext) [V].
- **Payload.** The Arabic subset of the display face is usually the LCP-critical font:
  - Tiny: Reem Kufi 9 KB, Qahiri 7 KB, Handjet 9 KB, Readex 10 KB, Changa 11 KB, Mada 11 KB, Alexandria 12.5 KB.
  - Heavy: Aref Ruqaa Ink 115 KB, Amiri 109 KB, Harmattan 136 KB, Gulzar 209 KB, Noto Sans Arabic VF 166 KB.

  Prefer statics over VFs when a site uses at most two weights (Noto Kufi static 44 KB vs VF 124 KB) [V sizes; A advice].
- **Colour fonts** (the Ink variants and Reem Kufi Fun) render in colour only in browsers with COLRv1/OT-SVG support. The glyf outlines inside are the monochrome fallback [V: harfbuzzjs drew them]. Test Safari before using them on a live site [A].

---

## Part B. Logo and OG pipeline

### B1. Options and verdicts

| Option | Version (npm/PyPI, 2026-09-23) | Arabic shaping | Bidi | Variable axes | Font formats | Verdict |
|---|---|---|---|---|---|---|
| **harfbuzzjs** (HarfBuzz → wasm) | `harfbuzzjs@1.6.2` (2026-09-21), bundles HarfBuzz **14.5.0** [V] | **Correct** (joining, lam-alef, marks, `curs`, contextual alternates, ss/cv) [V] | **None.** Shapes one directional run at a time; caller must run UAX #9 [V] | Yes, `font.setVariations([new Variation('wght',700)])` [V] | sfnt only (TTF/OTF). **WOFF2 → all glyph IDs 0** [V] | **Use for logos and OG text** |
| **bidi-js** | `bidi-js@1.1.0` (2026-09-06), UAX #9 conformance C1 per README | n/a | Yes: embedding levels and reorder segments | n/a | n/a | **Use with harfbuzzjs** [V] |
| opentype.js | `opentype.js@2.0.0` (2026-05-06) | **Broken**: Aref Ruqaa wrong forms and no cursive attachment; **throws** on Amiri ("lookupType 6 substFormat 1 not yet supported") and on Noto Nastaliq ("…substFormat 2…"); IBM Plex Sans Arabic dropped words [V] | Partial | Yes (2.0 added gvar/avar/HVAR) | TTF/OTF/WOFF | **Do not use** |
| uharfbuzz + fontTools (Python) | `uharfbuzz 0.56.2` (2026-09-21), `fonttools 4.65.0` | Correct (same HarfBuzz) [L] | None (use `python-bidi`) [A] | `font.set_variations({...})` [V source] | sfnt | Viable, but it adds a Python toolchain to a TS monorepo |
| Pillow `ImageDraw.text` | Pillow 11.3.0 installed locally | **No raqm on this machine**: `features.check('raqm') == False`, so Arabic comes out unshaped [V] | no | no | n/a | **Do not use** |
| **resvg** (`@resvg/resvg-wasm` / `@resvg/resvg-js`) | `2.6.2` (2024-03-26; 2.7.0-alpha.x in Jan 2026); the resvg-js main-branch `Cargo.toml` pins Rust resvg 0.34 [V], so it is an old resvg core | Its own `<text>` engine shapes Arabic correctly [V] | **Ignores `direction="rtl"` / `style="direction:rtl"` when ordering mixed runs**: Latin run placed right of Arabic in all 3 variants [V pixel test] | **Ignores `font-weight` and `font-variation-settings` on VFs**: identical ink at 400 and 700 [V] | TTF/OTF buffers | **Use as rasteriser only, fed pre-outlined `<path>`s** |
| satori (and `@vercel/og`) | `satori@0.33.5`; `@vercel/og@1.0.3` depends on satori 0.33.5 + resvg-wasm 2.4.1 [V] | HarfBuzz shaping since **0.33.0 (2026-08-20)** [V release notes] | **"Full Unicode bidirectional layout is not yet supported"** [V README]. RTL PR #745 still open (last updated 2026-06-19) [V]. A third-party report says multi-word Arabic lines come out word-reversed [L] | not documented | TTF/OTF/WOFF; **WOFF2 unsupported** [V README] | **Do not use for Arabic** |
| astro-og-canvas (CanvasKit / Skia paragraph) | `astro-og-canvas@0.13.2`, peer `astro ^5 \|\| ^6 \|\| ^7`, uses `canvaskit-wasm ^0.42.0` [V] | Skia paragraph (HarfBuzz + ICU) [L] | `dir: 'rtl'` option documented [V README] | not tested | TTF (URLs/paths) | Plausible fallback, but a fixed template layout. **Not tested** |
| Playwright screenshot | `playwright@1.63.0` (2026-09-04) | Browser-grade (Chromium HarfBuzz) [L] | Full UAX #9 plus CSS `dir` [L] | Yes, via CSS | WOFF2 etc. | **Alternative for photo-led OG**. Heavy (downloads Chromium), but already needed for `check-all` and hub screenshots [A] |

### B2. What was actually run (proof of concept, session scratchpad)

All of this ran on this machine with Node 22.18.0. The packages were extracted from their npm tarballs into the scratchpad, not installed into the project.

1. **Shaping to SVG.** harfbuzzjs 1.6.2 shaped these lines, and resvg-wasm 2.6.2 rendered them. Visual inspection showed correct output for:
   - `دار الكاكاو` in Aref Ruqaa and Aref Ruqaa Ink (the Ink file gives the monochrome glyf outline)
   - `عَنْبَر · بُخُور وعطور` in Amiri, with harakat placed by GPOS mark positioning
   - `سكّرية للكيك` in Readex Pro at wght 600
   - `نقشة حنّاء` in Reem Kufi Ink
   - `لحظة گاتو چوكليت` in Noto Nastaliq Urdu, with cursive attachment and stacking
   - `Dar Al Cacao` in Cormorant Garamond
2. **Variable fonts.** Readex Pro outlines at wght 400 → ink 4640 px, width 337 px. At wght 700 → ink 7063 px, width 357 px [V]. resvg's own `<text>` at 400 gave exactly 4640 px, so the outline pipeline matches resvg's own renderer pixel for pixel.
3. **Bidi.**
   - Shaping `عطور وحلويات سكّرية ٢٥٫٥٠٠ د.ب` as one RTL buffer **reversed the digits** (`٠٠٥,٥٢`): HarfBuzz does no bidi [V].
   - With bidi-js levels → runs → rule L2 run reordering → per-run direction, these rendered correctly: `توصيل لكل مناطق البحرين — Dar Al Cacao`, `علبة ٢٤ حبة: ‏٢٥٫٥٠٠ د.ب.‏` and a WhatsApp line [V].
   - A phone number inside Arabic text (`+973 3612 3456`) is split into three LTR runs laid out right to left. That is correct UAX #9 behaviour and browsers do the same. **Wrapping it in LRI…PDI (U+2066…U+2069) produced a single LTR run** [V].

   The same rule applies to HTML: wrap phone numbers, SKUs and Latin brand names inside Arabic text in `<bdi>` or `<span dir="ltr">` [A].
4. **resvg `<text>` with mixed directions.** Latin mean x = 857 vs Arabic mean x = 453 in all three cases: no `direction`, `direction="rtl"` and `style="direction:rtl"`. So resvg always used an LTR base direction [V].
5. **WOFF2.** `@fontsource/amiri@5.3.0` `amiri-arabic-400-normal.woff2` loaded into `hb.Face` → shaped glyph IDs `[0,0,0]`. The TTF gave `[65,55,63]` [V].
6. **Output size.** A 1200×630 flat-colour OG with Arabic text came to 42,673 bytes as PNG [V].
7. **Stylistic features on the 12 suggested brand names** [V], counting how many names change:

   | Font | Features that change output |
   |---|---|
   | Reem Kufi | cv01 10/12, cv02 7/12, cv03 5/12 |
   | Qahiri | ss01 10/12, ss02 10/12, salt 5/12 |
   | Aref Ruqaa | ss01–ss04 1–3/12 each |
   | Amiri | ss01 2/12 |
   | Rakkas | ss01, ss03 |

   So the logo generator should expose `features: string[]` per wordmark: it is a cheap way to make 13 wordmarks look different.

### B3. harfbuzzjs 1.x API (verified against `dist/index.d.mts` 1.6.2 and MIGRATING.md)

- **ESM only, with top-level await.** `import * as hb from "harfbuzzjs"` initialises the wasm during module load; the dist ends with `init(await createHarfBuzz())`. Scripts must be ESM (`.mjs`/`.mts`, or `"type":"module"`, or run through `tsx`).
- **Classes, not factories:** `new hb.Blob(u8)`, `new hb.Face(blob, index?)` (exposes `.upem`), `new hb.Font(face)`, `new hb.Buffer()`. There is **no `.destroy()`**; objects are freed by a `FinalizationRegistry`.
- **Buffer:**
  - `addText(str)`, `guessSegmentProperties()`, `setDirection(hb.Direction.RTL /*5*/ | hb.Direction.LTR /*4*/)`, `setScript("Arab")`, `setLanguage("ar")`, `setFlags(hb.BufferFlag.…)`.
  - `setFlags` includes `PRODUCE_SAFE_TO_INSERT_TATWEEL` for kashida justification.
  - Results: `getGlyphInfos()`, `getGlyphPositions()`, `getGlyphInfosAndPositions()`.
- **Shaping:** `hb.shape(font, buffer, features?: Feature[])`, with `hb.Feature.fromString("ss01")` or `new hb.Feature("liga", 0)`.
- **Variations:** `font.setVariations([new hb.Variation("wght", 600)])`. This **replaces** all axes; unspecified axes return to default.
  - The v0 object form `{wght: 700}` is gone; the upstream browser example still shows it in a comment, which is stale.
- **Outlines:**
  - `font.glyphToPath(gid)` returns `M/L/Q/C/Z` absolute commands in **font units, y-up** [V source].
  - `font.glyphToJson(gid)` returns `[{type, values}]`.
  - `font.drawGlyph(gid, drawFuncs, data)` gives custom pens. `font.glyphExtents(gid)` gives bounds; `font.hExtents()` gives ascender/descender/lineGap.
- **Output order.** For an RTL buffer the output glyphs are already in **visual left-to-right order**: lay them out by accumulating `xAdvance` and apply `xOffset/yOffset` [V by rendering].
- **Colour fonts.** `face.hasColorPaint()` / `face.hasColorLayers()` and `font.paintGlyph(...)` exist. Outlining Ink/COLR fonts with `glyphToPath` loses the colour. Use the monochrome sibling family for logos [A].
- **Overlaps.** VF outlines often contain overlapping contours. That is harmless with SVG's default `fill-rule: nonzero`, but they show up if you stroke the paths or use them as masks. If needed, remove overlaps offline, for example with fontTools/skia-pathops [A].

### B4. Getting the font files programmatically

| Source | What you get | Verified |
|---|---|---|
| **google/fonts GitHub raw, pinned SHA** (recommended) | Full unsubsetted **TTF / variable TTF** exactly as Google ships it, plus `OFL.txt` and `METADATA.pb`. Pattern: `https://raw.githubusercontent.com/google/fonts/<sha>/ofl/<slug>/<filename>`, where slug is the family lowercased with non-alphanumerics removed. URL-encode `[`, `]` and `,` in VF names, e.g. `ReadexPro%5BHEXP%2Cwght%5D.ttf`. Current main: **`e44c4b011a820c2cbe2fd2cfa8052037d7edb571`** (2026-09-20) | [V] Node `fetch` and curl both work on this machine. Python `urllib` fails TLS here because a local Avast HTTPS-scanning certificate breaks Python's strict verification, so use Node |
| Google Fonts css2 API with a non-browser User-Agent | Node's default `fetch` UA or curl gets `src: url(…/s/amiri/v30/….ttf) format('truetype')`: one full-cmap static TTF per requested weight. VF ranges come back as per-weight statics | [V] **Undocumented UA-sniffing; do not build on it** |
| Google Fonts Developer API `webfonts/v1/webfonts?key=…&family=…&capability=VF` | JSON with TTF URLs (`capability=VF` returns variable files and axes; `WOFF2` returns WOFF2) | [V docs] Needs an API key |
| Fontsource API `https://api.fontsource.org/v1/fonts/<id>` | Per-subset URLs for woff2/woff/**ttf**, e.g. `https://cdn.jsdelivr.net/fontsource/fonts/amiri@latest/arabic-400-normal.ttf` (319 KB). Variable axes at `/v1/variable/<id>` | [V] Subset TTFs **split Arabic and Latin into separate files**, which is awkward for bilingual lockups |
| `@fontsource/*` / `@fontsource-variable/*` npm | WOFF2/WOFF only | [V] Right for the website; **unusable by HarfBuzz** |

Licence: all 57 are OFL-1.1 [V].
- The OFL FAQ 1.1 explicitly allows logos and graphics, and the resulting artwork need not be OFL (FAQ 1.1.1) [V].
- Self-hosting as webfonts is fine (FAQ 2.1). Subsetting counts as modification (FAQ 2.6), which matters only if a Reserved Font Name applies (Aref Ruqaa's RFN is "EURM10") [V].
- Keep `OFL.txt` next to any committed font binaries [A].

### B5. Recommended pipeline (concrete)

It runs at **authoring time** from `pnpm new-site` / `pnpm rebrand` (and a standalone `pnpm brand:render <site>`). Outputs are committed to `sites/<site>/brand/`, so Netlify builds need no browser and no font downloads. Everything below is pure JS/wasm and also runs on Netlify if per-page OG images are wanted later [A].

```
site config (brand.fonts, palette, name ar/en, features, lockup template)
   │
   ├─ 1. fonts:fetch  ──► .cache/fonts/<slug>/<file>.ttf  + OFL.txt   (google/fonts @ pinned SHA; sha256 recorded)
   │
   ├─ 2. text-to-path (packages/brand/src/text/)
   │       harfbuzzjs 1.6.2  ← shaping, variations, OpenType features (ss/cv/dlig/jalt)
   │       bidi-js 1.1.0     ← UAX #9 levels, run split, rule L2 reorder (only needed for mixed lines)
   │       → { d (SVG path, y-down), width, ascent, descent, bbox }
   │
   ├─ 3. lockup (packages/brand/src/logo/)
   │       templates: stacked | inline-rtl | mark-only ; clear-space = k × Arabic alef height
   │       → logo.svg, logo-light.svg, logo-dark.svg, logo-mark.svg, favicon.svg  (svgo 4.1.0, keep viewBox/title)
   │
   └─ 4. og (packages/brand/src/og/)
           og.svg template (1200×630, safe margins ≥ 64px) ← outlined logo + outlined tagline (greedy wrap by measured widths)
           → @resvg/resvg-wasm 2.6.2 → og.png (assert < 300 KB) ; same path for apple-touch-icon.png (180×180)
```

**Reference implementation.** Condensed from the verified proof of concept; the file layout is a suggestion.

```js
// packages/brand/src/text/shape.mjs   — ESM (harfbuzzjs 1.x uses top-level await)
import fs from "node:fs";
import * as hb from "harfbuzzjs";
import bidiFactory from "bidi-js";
const bidi = bidiFactory();
const cache = new Map();

export function loadFont(file, variations = {}) {           // file = TTF/OTF (NOT woff2)
  const key = file + JSON.stringify(variations);
  if (!cache.has(key)) {
    const face = new hb.Face(new hb.Blob(fs.readFileSync(file)));
    const font = new hb.Font(face);
    const v = Object.entries(variations).map(([t, n]) => new hb.Variation(t, n));
    if (v.length) font.setVariations(v);
    cache.set(key, { font, upem: face.upem });
  }
  return cache.get(key);
}

// One single-direction run → SVG path in px, baseline at y=0, pen starting at x=0, y-down.
export function shapeRun(text, { file, variations, features = [] }, size, rtl) {
  const { font, upem } = loadFont(file, variations);
  const buf = new hb.Buffer();
  buf.addText(text);
  buf.guessSegmentProperties();
  buf.setDirection(rtl ? hb.Direction.RTL : hb.Direction.LTR);
  hb.shape(font, buf, features.map((f) => hb.Feature.fromString(f)));
  const s = size / upem;
  let x = 0, d = "";
  for (const g of buf.getGlyphInfosAndPositions()) {          // visual order already
    const p = font.glyphToPath(g.codepoint);                  // font units, y-UP
    if (p) d += xform(p, s, (x + (g.xOffset ?? 0)) * s, -(g.yOffset ?? 0) * s);
    x += g.xAdvance ?? 0;
  }
  const e = font.hExtents();
  return { d, width: x * s, ascent: e.ascender * s, descent: -e.descender * s };
}

function xform(d, s, tx, ty) {                                // bake scale + y-flip + translate
  return d.replace(/([MLQCZ])([^MLQCZ]*)/g, (_, c, a) => {
    if (c === "Z") return "Z";
    const n = a.split(/[ ,]+/).filter(Boolean).map(Number), o = [];
    for (let i = 0; i < n.length; i += 2) o.push(`${r(n[i] * s + tx)},${r(-n[i + 1] * s + ty)}`);
    return c + o.join(" ");
  });
}
const r = (v) => Math.round(v * 100) / 100;

const isAr = (c) => (c >= 0x600 && c <= 0x6ff) || (c >= 0x750 && c <= 0x77f) || (c >= 0x8a0 && c <= 0x8ff) || (c >= 0xfb50 && c <= 0xfdff) || (c >= 0xfe70 && c <= 0xfeff);
const isLa = (c) => (c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a) || (c >= 0xc0 && c <= 0x24f);
const CONTROLS = /[‎‏؜‪-‮⁦-⁩]/g;

// Mixed-direction, mixed-font single line. fonts = { arabic: {file,variations,features}, latin: {...} }
export function layoutLine(text, fonts, size, baseDir = "rtl") {
  const { levels } = bidi.getEmbeddingLevels(text, baseDir);
  let runs = [], cur = null, last = baseDir === "rtl" ? "arabic" : "latin";
  [...text].forEach((ch, i) => {                               // BMP-only assumption (true for Arabic/Latin)
    const cp = ch.codePointAt(0);
    const script = isAr(cp) ? "arabic" : isLa(cp) ? "latin" : last; // digits/neutrals inherit
    if (isAr(cp) || isLa(cp)) last = script;
    if (!cur || cur.level !== levels[i] || cur.script !== script) runs.push((cur = { level: levels[i], script, text: "" }));
    cur.text += ch;
  });
  runs = runs.map((q) => ({ ...q, text: q.text.replace(CONTROLS, "") })).filter((q) => q.text);
  const max = Math.max(...runs.map((q) => q.level));           // UAX #9 rule L2 on runs
  const minOdd = Math.min(...runs.map((q) => q.level).filter((l) => l % 2), max + 1);
  for (let l = max; l >= minOdd; l--)
    for (let i = 0; i < runs.length; ) {
      if (runs[i].level < l) { i++; continue; }
      let j = i; while (j < runs.length && runs[j].level >= l) j++;
      runs.splice(i, j - i, ...runs.slice(i, j).reverse()); i = j;
    }
  let x = 0, svg = "";
  for (const q of runs) {
    const o = shapeRun(q.text, fonts[q.script], size, q.level % 2 === 1);
    svg += `<path transform="translate(${r(x)},0)" d="${o.d}"/>`;
    x += o.width;
  }
  return { svg, width: x };
}
```

```js
// packages/brand/src/og/render.mjs
import fs from "node:fs";
import { createRequire } from "node:module";
import { initWasm, Resvg } from "@resvg/resvg-wasm";
const require = createRequire(import.meta.url);
await initWasm(fs.readFileSync(require.resolve("@resvg/resvg-wasm/index_bg.wasm"))); // subpath is exported [V]
export const svgToPng = (svg, width = 1200) =>
  new Resvg(svg, { fitTo: { mode: "width", value: width } }).render().asPng();       // no <text> ⇒ no font config needed
```

**Rules for the generator [A unless noted]:**
- **Every glyph must be a path.** No `<text>` in `logo*.svg`, `favicon.svg` or `og.svg`, because resvg's text engine mis-orders mixed lines and ignores VF weight [V].
- **Validate coverage before shaping.** If `font.glyph(cp)` is `undefined` for any code point, fail loudly rather than emitting `.notdef` boxes, which the specimens showed happens silently [V].
- **Wrap numbers, phones and Latin names inside Arabic strings in LRI…PDI** before layout.
- **Accessibility.** `<svg role="img" aria-labelledby="t"><title id="t">ليان · Layan Abaya</title>…`. Use `fill="currentColor"` only in variants meant to be inlined; the standalone light/dark files get explicit colours.
- **Latin tracking.** Apply it by adding a fixed advance between Latin glyphs. **Never track Arabic.** To stretch Arabic, insert U+0640 or enable `jalt`.
- **OG content.** Brand wordmark plus one Arabic tagline, at most 2 lines, right-aligned, with ≥64 px margins. Keep `og.png` under **300 KB**:
  - Meta's WhatsApp doc says under 600 KB, at least 300 px wide and aspect ratio 4:1 or less [V].
  - Several practitioner guides report that WhatsApp drops previews above ~300 KB [L].
- **Favicon.** Build `favicon.svg` from `logo-mark.svg` (square viewBox). Also emit `apple-touch-icon.png` at 180×180 through the same renderer, since Safari's SVG favicon support is not assumed [A].
- **Determinism.** Pin the google/fonts SHA and the npm versions, and record each font file's sha256 in the site's brand config so a rebrand is reproducible.

**When to switch to Playwright for OG [A].** Use it when the card needs a photograph with CSS effects, multi-line paragraph layout, or should be literally "a crop of the hero":
1. `page.setViewportSize({ width: 1200, height: 630 })`
2. `page.setContent(html)` using the site's own tokens and WOFF2 fonts
3. `await page.evaluate(() => document.fonts.ready)`
4. `page.screenshot({ type: "png" })`, or JPEG to stay under 300 KB with photos

### B6. Python alternative (not recommended for this repo) [V API, L behaviour]

- `uharfbuzz` 0.56.2: `hb.Blob.from_file_path`, `hb.Face`, `hb.Font`, `hb.Buffer().add_str()`, `guess_segment_properties()`, `hb.shape(font, buf, {"ss01": True})`, `buf.glyph_infos` / `buf.glyph_positions`.
- `Font.set_variations({"wght": 600})` and `Font.draw_glyph_with_pen(gid, pen)` accept fontTools pens (e.g. `fontTools.pens.svgPathPen.SVGPathPen`).
- Rasterise with `resvg_py` 0.5.0 or Playwright.
- Bidi still has to be done separately.
- This machine has Python 3.13, fontTools 4.60.1 and Pillow 11.3 **without raqm**; uharfbuzz is not installed [V].

---

## Part C. Gotchas checklist (for build phases)

1. **Per-site numbering system.** Default Arabic-Indic output needs U+066B/U+066C in the price font. Do not set prices in Aref Ruqaa, Reem Kufi*, Qahiri, Blaka*, Tajawal or Gulzar; avoid Zain for Arabic-Indic digits.
2. **Dialect letters.** Iraqi and Kuwaiti copy using چ گ پ must not be set in Readex Pro or Tajawal. Run a CI glyph-coverage check that tests each site's full content corpus against its fonts' cmaps; fontTools or harfbuzzjs `font.glyph()` can do it.
3. **Saudi Riyal.** Use an SVG icon, or "ر.س" / "SAR"; U+20C1 is in only 4 families.
4. **Bidi.** Explicit isolation (`<bdi>`, `dir="ltr"`, LRI/PDI) for phone numbers, prices mixed with Latin, SKUs and Latin brand names in Arabic sentences.
5. **Line heights.** Set per role in tokens; `normal` varies from 1.0 to 2.7 em across fonts.
6. **Weight equivalence.** Alexandria is one step heavier than Montserrat; always check stems when mixing families.
7. **Colour fonts.** Ink/Fun variants are for web headings only, and only after cross-browser testing; logos use the monochrome sibling.
8. **Tool inputs.** Tooling needs TTF/OTF; the web gets WOFF2. Do not point harfbuzzjs or satori at WOFF2.
9. **Never use satori, `@vercel/og`, opentype.js or Pillow-without-raqm for Arabic output.**
10. **Environment.** Python HTTPS on this machine is intercepted by the Avast certificate; use Node `fetch` or curl for downloads.

---

## Sources

Google Fonts data
- Family metadata JSON: https://fonts.google.com/metadata/fonts (fetched 2026-09-23)
- google/fonts repo, METADATA.pb files (e.g. https://raw.githubusercontent.com/google/fonts/main/ofl/arefruqaa/METADATA.pb); commit `e44c4b011a820c2cbe2fd2cfa8052037d7edb571`: https://github.com/google/fonts
- DESCRIPTION files: https://raw.githubusercontent.com/google/fonts/main/ofl/reemkufi/DESCRIPTION.en_us.html, https://raw.githubusercontent.com/google/fonts/main/ofl/qahiri/DESCRIPTION.en_us.html, https://raw.githubusercontent.com/google/fonts/main/ofl/almarai/DESCRIPTION.en_us.html, https://raw.githubusercontent.com/google/fonts/main/ofl/rubik/DESCRIPTION.en_us.html
- Developer API: https://developers.google.com/fonts/docs/developer_api

Upstream font READMEs (Latin identity and design intent)
- https://github.com/aliftype/aref-ruqaa · https://github.com/aliftype/reem-kufi · https://github.com/aliftype/amiri · https://github.com/aliftype/mada · https://github.com/aliftype/qahiri
- https://github.com/Gue3bara/El-Messiri · https://github.com/Gue3bara/Lemonada · https://github.com/Gue3bara/Alexandria · https://github.com/Gue3bara/Blaka
- https://github.com/ThomasJockin/readexpro · https://github.com/BornaIz/markazitext · https://github.com/BornaIz/Lalezar · https://github.com/namelatype/Marhey · https://github.com/originaltype/kufam
- https://github.com/Tarobish/Mirza · https://github.com/Tarobish/Katibeh · https://github.com/Tarobish/Jomhuria · https://github.com/zeynepakay/Rakkas · https://github.com/googlefonts/changa-vf
- https://github.com/Mestaratype/AlYamama · https://github.com/Kief-Type-Foundry/Fustat · https://github.com/simoncozens/Gulzar · https://github.com/bluemix/vibes-typeface · https://github.com/TypeTogether/Playpen-Sans

Shaping and rendering
- harfbuzzjs: https://github.com/harfbuzz/harfbuzzjs · MIGRATING: https://github.com/harfbuzz/harfbuzzjs/blob/main/MIGRATING.md · typings: https://cdn.jsdelivr.net/npm/harfbuzzjs@1.6.2/dist/index.d.mts · npm: https://www.npmjs.com/package/harfbuzzjs
- bidi-js: https://github.com/lojjic/bidi-js
- opentype.js README and releases: https://github.com/opentypejs/opentype.js · https://github.com/opentypejs/opentype.js/releases
- uharfbuzz: https://github.com/harfbuzz/uharfbuzz · https://pypi.org/project/uharfbuzz/
- satori README: https://github.com/vercel/satori/blob/main/README.md · releases (0.33.0 "Add HarfBuzz text shaping"): https://github.com/vercel/satori/releases · PR #735: https://github.com/vercel/satori/pull/735 · RTL PR #745 (open): https://github.com/vercel/satori/pull/745 · issue #74: https://github.com/vercel/satori/issues/74
- Third-party report of reversed Arabic word order in next/og: https://github.com/athoskoranis/COMPASSIT/pull/24
- resvg-js (Cargo.toml → resvg 0.34): https://github.com/thx/resvg-js · https://www.npmjs.com/package/@resvg/resvg-wasm
- astro-og-canvas: https://www.npmjs.com/package/astro-og-canvas
- Playwright screenshots: https://playwright.dev/docs/screenshots

Web delivery, licensing, platform constraints
- Astro Fonts guide: https://docs.astro.build/en/guides/fonts/
- Fontsource API example: https://api.fontsource.org/v1/fonts/amiri · docs: https://fontsource.org/docs
- OFL FAQ: https://openfontlicense.org/ofl-faq/
- WhatsApp link previews (Meta): https://developers.facebook.com/documentation/business-messaging/whatsapp/link-previews · practical 300 KB limit: https://www.opengraph.to/articles/og-image-too-large
- Saudi Riyal sign / Unicode 17: https://en.wikipedia.org/wiki/Saudi_riyal_sign · https://www.johndcook.com/blog/2025/09/10/new-symbols-in-unicode-17/
