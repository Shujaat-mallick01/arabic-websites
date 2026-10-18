# Build a portfolio of 13 Arabic demo websites (with CMS, branding and payment-ready architecture)

## Who I am and why this exists

I'm a freelance web designer/developer. I prospect small businesses across the Gulf and Iraq on Instagram and WhatsApp (abaya brands, perfume shops, chocolatiers, bakeries, beauty salons, henna artists, party-favour and event businesses). Almost all of them sell through WhatsApp only and have no website.

My pitch works best when I can send a live demo before they ask for anything. So I need a **portfolio of finished, niche-specific demo sites** I can show instantly, and that I can rebrand into a paying client's real site in under an hour.

Work inside the existing folder: **`arabic websites`**.

**This is not 13 one-off websites.** It's one well-architected system that produces 13 branded sites. Judge every decision by: can I add site 14 tomorrow in under an hour?

## Non-negotiables

1. **Arabic first.** RTL is the default, not an afterthought. `dir="rtl"`, logical CSS properties, Arabic typography, Arabic numerals formatting, Arabic admin UI. English is the secondary language on every site.
2. **Config-driven.** All brand-specific values (name, logo, palette, fonts, copy, products, services, currency, country, dialect, contact details, feature flags) live in one config/content layer per site. Never hardcode brand values into components.
3. **A CMS for every site.** The client must be able to add a product, change a price, upload a photo and edit a page without me.
4. **Payment-ready, not payment-live.** Ship a provider-agnostic payment layer with adapters stubbed for Gulf gateways. Demos run in mock mode. Going live for a real client should mean adding keys and flipping a flag.
5. **Fictional brands.** Invent every brand name, logo, copy and product. Do not use any real business's name, logo or photos. Each demo carries a small "نموذج مبدئي" (demo) marker.
6. **Two base engines, not thirteen codebases.** See architecture.

## Stack

Choose and justify in one short paragraph before you start, but unless you have a strong reason, use:

- **Astro** (static output, first-class i18n and content collections, islands for the interactive parts) + **TypeScript**
- **Tailwind CSS** with RTL-safe logical utilities, plus CSS custom properties for the per-brand token layer
- **pnpm workspaces** monorepo
- **Sveltia CMS** (or Decap CMS if Sveltia gives trouble): Git-based, free, no database, works on Netlify, good media library and i18n. Configure the admin UI in Arabic.
- **Netlify** for hosting, **Netlify Functions** for anything server-side (checkout sessions, webhooks, order emails)
- Optional `full` tier only: **Supabase** (Postgres) for orders, inventory and bookings, behind an interface so the static tier doesn't need it

No heavy UI kits. No component library that imposes its own look, because every site must look different.

## Architecture

```
arabic websites/
  packages/
    ui/              shared primitives: layout, nav, gallery, lightbox, forms, modal, RTL utils
    commerce/        catalog, cart, checkout flow, shipping rules, order builder
    booking/         availability calendar, slot generation, blackout dates, deposits
    whatsapp/        order/booking message builder + wa.me link builder
    payments/        provider interface + adapters (see below)
    i18n/            ar/en dictionaries, number/currency/date formatting, Hijri support
    seo/             meta, OG, JSON-LD builders per business type
    brand/           token system, logo generator primitives, theme application
    cms/             shared Sveltia config fragments + collection schemas
  sites/
    01-layan-abaya/ ... 13-athar-events/
  scripts/
    new-site.ts      scaffolds a new site from a preset in minutes
    rebrand.ts       swaps brand name, palette, fonts, logo and contact details
    check-all.ts     builds every site, runs Lighthouse + a11y + RTL checks
  hub/               the showcase site that links to all demos
  docs/
```

**Two engines cover everything:**

- **Commerce engine:** catalog → product → order. Order can terminate in WhatsApp (tier `lite`) or in a real cart + checkout (tier `full`).
- **Booking engine:** service → availability → appointment. Same two tiers (WhatsApp request vs. real calendar + deposit).

Niches are **presets** over these engines (which modules are on, which fields exist, which flows are enabled), not forks.

## Tiers

Every site declares `tier: "lite" | "full"` in its config, because this mirrors how I sell.

- **lite:** catalog/services + WhatsApp order or booking request + CMS. No cart, no online payment.
- **full:** cart or booking calendar, checkout, payment provider, shipping/delivery rules, orders dashboard, stock or slot limits.

Build at least **five sites at `full`** so I have proof for both offers; the rest can be `lite`.

## The 13 sites

Each entry gives: preset, country/currency/dialect, and the features that define the niche. Invent the brand identity for each one; the names below are starting suggestions and you may replace them with better ones.

| # | Brand (suggested) | Preset | Country / currency | Defining features |
|---|---|---|---|---|
| 01 | ليان · Layan Abaya | commerce `lite` | Bahrain, BHD | Collections, sizes and lengths, size guide, WhatsApp order per piece, stockists page |
| 02 | نُهى · Noha Modest | commerce `full` | Bahrain, BHD, ships GCC | Cart, checkout, GCC shipping table, gift cards, orders dashboard |
| 03 | دار السدرة · Dar Al Sidra | commerce `full` | Bahrain, BHD | Large catalog (150+ items), faceted filtering, two branch pages with maps and hours, pick-up-from-branch at checkout |
| 04 | ريمان · Rayman Boutique | commerce `full` | Iraq, IQD | Delivery by province, **cash on delivery** as the primary method, per-product share links, sizes in local terms |
| 05 | عنبر · Anbar Scent | commerce `full` | Kuwait, KWD | Scent families, note pyramid (top/heart/base), bottle sizes, gift sets, bulk/corporate enquiry, occasion gifting |
| 06 | دار الكاكاو · Dar Al Cacao | commerce `full` | Bahrain, BHD | Trays and boxes, personalised printed wrappers (name/date/occasion), delivery date and time slot, lead time rules |
| 07 | حلاوة الديرة · Halawat Al Deera | commerce `lite` | Bahrain, BHD | Permanent menu page, seasonal sections (Ramadan, Eid, National Day), minimum 1-day notice enforced in the form |
| 08 | سكّرية · Sukkariya Cakes | booking `full` | Saudi (Riyadh), SAR | Made-to-order request with reference image upload, booking calendar with a daily order cap, deposit payment |
| 09 | لحظة · Lahza Cake | commerce `full` | Saudi (Jeddah), SAR | Ready-now items, same-day cutoff clock, "text on the cake" field, delivery fee by district |
| 10 | مرايا · Maraya Beauty Lounge | booking `full` | Saudi (Jeddah), SAR | Service menu with durations and prices, bridal packages, staff/room-aware slots, deposit, gift cards |
| 11 | نقشة · Naqsha Henna | booking `lite` + shop | Bahrain, BHD | Portfolio gallery by style, seasonal opening of booking windows (Eid, wedding season), daily limit, small product shop (cones) |
| 12 | لمار · Lamar Favors | commerce `full` | Kuwait, KWD | Minimum order quantities, personalisation fields, event date, tiered bulk pricing, corporate quote request, policy page |
| 13 | أثر · Athar Events | commerce `lite` | Kuwait, KWD | Themes, packages with inclusions, add-ons that update a running estimated total, booking request |

Hours, lead times, shipping tables and policies are all invented but must be internally consistent and realistic for the market.

## Branding you generate

For every site produce, in `sites/<site>/brand/`:

- **`brand.md`** — the brand guideline: positioning in one line, audience, tone of voice in Arabic and English, palette with hex and usage ratios, type scale, logo clear space and minimum size, dos and don'ts, photography direction.
- **`logo.svg`** — a real lockup, not a text placeholder: Arabic wordmark plus Latin wordmark, drawn as vector paths or well-chosen web type converted to outlines. Also `logo-mark.svg` (the icon alone, for favicon and avatar), `logo-light.svg`, `logo-dark.svg`.
- **`favicon.svg` + `og.png`** (1200×630, generated).
- **`tokens.ts`** — palette, type, radius, spacing, shadow tokens applied as CSS custom properties.

**Every site must look clearly different from the other twelve.** Different palettes, different type pairings, different layout rhythms, different hero archetypes. If you can swap two sites' logos and nobody notices, you have failed this requirement.

Arabic type: choose deliberately per brand from Google Fonts. Good candidates include Aref Ruqaa, Amiri, Reem Kufi, El Messiri, Readex Pro, IBM Plex Sans Arabic, Alexandria, Almarai, Rubik, Noto Kufi Arabic. Do not put Cairo and Tajawal on every site; they're the default everyone uses. Pair Arabic and Latin faces with matching weight and x-height so the bilingual toggle doesn't break the design.

## What Gulf audiences actually respond to

These buyers arrive from an Instagram profile on a phone. Design for that:

- **Photography leads.** Large, uncropped product and work imagery; the picture sells, the text supports.
- **Category entry points at the top** of the page, echoing how these brands already use story highlights.
- **Prices visible.** Not "contact for price". Openly published prices are the single biggest upgrade over their current Instagram.
- **WhatsApp everywhere.** A persistent WhatsApp affordance, and a per-product share link, because their sales happen in chat.
- **Calm, premium palettes** (neutrals, deep tones, muted metallics) with one accent. Gold is common but use it as a hairline or type accent, not gradients and glitter.
- **Generous whitespace and large tap targets.** Most sessions are one-handed, on a phone, in the evening.
- **Arabic copy that sounds human.** Local dialect, feminine address where the audience is women, no translated-English stiffness.
- **Trust signals:** policy pages, sizes and care, delivery times, real-looking reviews (clearly marked as sample content), commercial registration slot, branch map.

Avoid: centred text stacks in every section, three identical cards repeated down the page, icons in coloured circles, purple-blue gradients, fade-up animation on every section, and stock photos of people high-fiving.

## Content

- Every site ships **complete, realistic Arabic content**: product/service names, descriptions, prices, policies, FAQs, about page, shipping page, sample reviews, and metadata. No lorem ipsum, no `[placeholder]`, no English-only fallbacks.
- Write each site's Arabic in the right dialect: Bahraini/Khaleeji for Bahrain, Kuwaiti for Kuwait, Najdi-neutral for Riyadh, Hijazi for Jeddah, Iraqi for Iraq. Keep formal-neutral Arabic for policy and legal pages.
- **Content counts per site:** 12–40 products (150+ for site 03), 3–6 collections/categories, 6–12 gallery images, 4 sample reviews, 6 FAQ entries, full policy/shipping/about pages.
- Mark sample reviews visibly as illustrative. I won't present invented testimonials as real.
- **Imagery:** use royalty-free sources (Unsplash/Pexels) with per-site licence attribution in `docs/image-credits.md`, or generate abstract/product-silhouette placeholders. One consistent colour grade per site. Every image: WebP/AVIF, explicit width/height, lazy below the fold. No real brand's photos.

## CMS requirements

- Admin at `/admin`, Arabic UI, RTL, on every site.
- Collections per preset: products/services, collections, offers, gallery, reviews, pages, site settings (contact, hours, shipping table, currency, social links), and orders where the tier has them.
- Field-level Arabic labels and helper text written for a non-technical shop owner.
- Editorial workflow on, media library configured, image uploads auto-resized.
- Preview of what an edit looks like before publishing.
- Authentication documented: GitHub backend for me, Netlify Identity / git-gateway for clients.
- `docs/cms-guide-ar.md`: a short Arabic guide with screenshots for the client ("how to add a product", "how to change a price", "how to close a booking day").

## Payments (provider-agnostic)

In `packages/payments`, define one interface:

```ts
createPaymentSession(order): Promise<{ redirectUrl, sessionId }>
verifyPayment(sessionId): Promise<PaymentStatus>
handleWebhook(req): Promise<PaymentEvent>
refund(paymentId, amount): Promise<RefundResult>
```

Adapters (stubbed, typed, documented, each with its own env keys and test-mode notes):

- **Tap** (BH, KW, SA, AE, QA, OM) — cards, Apple Pay, KNET, BenefitPay, mada
- **MyFatoorah** (GCC) — KNET, BenefitPay, mada, cards
- **Moyasar** (SA) — mada, Apple Pay, STC Pay
- **PayTabs** / **Checkout.com** (regional fallback)
- **Credimax** (BH)
- **ZainCash** and **FastPay** (Iraq)
- **CashOnDelivery** (used as primary for site 04, optional everywhere)
- **MockProvider** — the default in all demos: simulates success, failure, timeout and webhook replay

Rules: per-site config picks the provider by name; currency and country determine which methods render; every amount handled in minor units with correct decimals (BHD/KWD/OMR = 3, SAR/AED/QAR = 2, IQD = 0); never round in the UI layer. Document in `docs/payments.md` exactly what a client must do to go live (merchant account, CR requirement, keys, webhook URL, test cards).

## Cross-cutting requirements

- **i18n:** AR default, EN complete. Language toggle persists (guard localStorage in try/catch) and also works via `?lang=en`. Mirror layouts properly; don't just flip text. Test every page in both directions.
- **Dates and numbers:** Gregorian with optional Hijri display, timezone-correct per country (Asia/Bahrain, Asia/Kuwait, Asia/Riyadh, Asia/Baghdad), correct handling of venues whose hours cross midnight (a salon open 14:00–02:00).
- **WhatsApp builder:** one shared module that assembles a complete, readable Arabic message from the user's selections (items, size/quantity, date, name, number, notes, estimated total) and opens `wa.me/<number>?text=…` URL-encoded. Include a hidden honeypot on every form and Arabic validation messages that say exactly what to fix.
- **SEO:** per-page meta, OG/Twitter, `og:locale` per country with `en_US` alternate, canonical, sitemap, robots, and JSON-LD matching the business type (`Store`, `ClothingStore`, `BeautySalon`, `Bakery`, `Product` with `offers`, `LocalBusiness` with `openingHours`, `BreadcrumbList`).
- **Accessibility:** WCAG AA contrast, visible keyboard focus, 44px targets, correct heading order, labelled form fields, `prefers-reduced-motion` respected, alt text in the page language.
- **Performance budget:** Lighthouse mobile ≥ 90 on performance, accessibility, best practices and SEO for every site. LCP under 2.5s on a simulated 4G phone. Ship no unused JS; interactive islands only where needed.
- **Analytics hook:** a no-op-by-default event layer with events for WhatsApp clicks, add-to-cart, checkout start and booking submit, ready to point at Plausible or GA4.
- **Security:** no secrets in the repo, `.env.example` per site, webhook signature verification in the adapters, form spam protection, CSP headers via `netlify.toml`.
- **Demo safeguards:** a dismissible top banner reading "هذا نموذج مبدئي، الصور والأسعار توضيحية"; prices marked with `*` and a footnote; footer credit "نموذج مبدئي من إعداد Shujaat — تصميم وتطوير المواقع"; `noindex` on demos (with a config flag to turn indexing on for a real client).

## Tooling I need

- **`pnpm new-site`** — interactive scaffold: preset, tier, country, currency, brand name → generates a working site with brand tokens, sample content and CMS config.
- **`pnpm rebrand <site> --name --palette --fonts --logo --whatsapp`** — turns a demo into a client-branded site in one command. This is the tool that makes the whole portfolio pay off; make it genuinely work.
- **`pnpm check-all`** — builds all sites, runs Lighthouse, axe accessibility checks, link checking and an RTL smoke test, and prints a table of results.
- **`pnpm dev <site>`**, **`pnpm build <site>`**, **`pnpm deploy <site>`**.
- A **hub site** in `hub/`: a clean gallery of all 13 demos, filterable by niche, each with a screenshot, a one-line description of what the site does, and a link. This is what I send when someone asks "what have you built?" It needs to look better than any of the demos.

## Process (please follow this order)

1. **Plan first.** Write `docs/architecture.md` with the stack decision, the engine/preset model, the config schema, and the payment interface. Write a one-page design plan per site: palette hexes, type pairing, hero archetype, signature element. Show me the plan and the list of 13 brand identities before building.
2. **Build the foundation:** `packages/*`, the scaffold script, and the CMS config, with tests for the money math, slot generation, shipping rules and the WhatsApp builder.
3. **Build two pilots end to end:** one commerce `full` (site 02) and one booking `full` (site 10). Run `check-all` against them, take screenshots at 390px and 1440px in both languages, critique your own output, fix it, and pause for my review.
4. **Then build the remaining eleven**, committing after each one. Keep each site visually distinct; before finishing a site, remove one unnecessary decorative element.
5. **Finish with docs:** `README.md` (what this is, how to run it), `docs/adding-a-site.md`, `docs/rebranding-for-a-client.md`, `docs/payments.md`, `docs/cms-guide-ar.md`, and `docs/handoff-checklist.md` (the steps to transfer domain, hosting, repo and CMS access into a client's own accounts).

Work incrementally and commit often with clear messages. If any instruction here conflicts with something you discover while building, tell me rather than silently choosing.

## Definition of done

- 13 sites build clean, deploy to Netlify, and pass `pnpm check-all`.
- Every site: Arabic default with a complete English version, working CMS at `/admin`, realistic content throughout, its own distinct identity, generated logo and brand guideline.
- Every `full` site: working cart or booking calendar, checkout through MockProvider, correct currency math, shipping or delivery rules applied, orders visible to the owner.
- Payment adapters typed and documented, switchable by config, with going-live steps written down.
- `pnpm new-site` produces a working new site, and `pnpm rebrand` converts a demo to a client brand without touching component code.
- The hub site is live and lists all 13.
