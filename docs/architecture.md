# Architecture: one system, thirteen Arabic sites

Status: **Step 1 plan, awaiting your review** · Written 2026-09-23 · Nothing is scaffolded yet.
Inputs: `arabic-websites-master-prompt.md` (the brief) and the four research notes in `docs/research/`. Where this document and my memory disagree, the research notes win, and every non-obvious fact below points back to them:

- `astro-netlify.md` (cited as **[AN §x]**)
- `cms.md` (**[CMS §x]**)
- `payments.md` (**[PAY §x]**)
- `fonts-and-logo-pipeline.md` (**[FONT §x]**)

**Labels used in this document**

| Label | Meaning |
|---|---|
| **DECIDED** | I have chosen. Later agents build it as written. You can still overrule it. |
| **NEEDS USER DECISION** | It changes what you sell, what it costs, or what a client experiences. I give a recommendation, but I need your answer before Step 2 relies on it. |
| **NEEDS USER ACTION** | Something only you can do, such as installing software, creating accounts or giving a phone number. |
| **SPIKE Sn** | An assumption to prove on day 1 of Step 2, before any code depends on it (list in §14.2). |

---

## 0. Decisions at a glance

1. **Stack:**
   - Astro 7.3 with pure static output and no adapter, TypeScript 6, and Tailwind 4.3 with logical utilities.
   - A pnpm 12 workspace.
   - Sveltia CMS on the GitHub backend.
   - Netlify hosting, with standalone Netlify Functions for the full tier.
   - Netlify Blobs as the default order and booking store; Supabase is an optional adapter.
2. **One site = data plus assets, zero components.** A site folder holds:
   - `site.config.ts`
   - `brand/`
   - `src/content/`
   - generated glue files
   Every component, page and function lives in `packages/*`. A site picks an **engine preset** (`commerce.lite`, `commerce.full`, `booking.lite`, `booking.full`), a **niche preset** and **layout variants**. Those three choices decide which routes, CMS fields, flows and functions exist.
3. **Content on disk** is the one format that Sveltia writes and Astro reads:
   - Entries are one YAML file per entry holding both `ar:` and `en:`, with images beside it under `src/`, so Astro can produce AVIF/WebP.
   - Long pages are a Markdown pair (`index.ar.md` and `index.en.md`).
   - Settings are bilingual JSON singletons.
4. **Orders never go into Git.** Runtime data (orders, bookings, stock, gift-card balances, payment attempts) lives in a store behind interfaces. Owners see it at `/owner/`, a dashboard separate from the CMS. The CMS holds only the rules: fees, zones, slots, caps, blackouts and lead times.
5. **Payments:**
   - The brief's four methods keep their names and positional arguments. Each gains an optional context argument, and each adapter gets an injected payment-attempt store.
   - Money is integer minor units, using an app-owned exponent table: BHD, KWD, OMR and JOD are 3; SAR, AED and QAR are 2; **IQD is 0 on purpose**.
   - Every webhook is followed by a status re-fetch from the provider.
   - Demos always run MockProvider.
6. **i18n:**
   - Arabic lives at `/` and English at `/en/`, with identical ASCII slugs.
   - `?lang=en` and the saved preference are handled by a ~0.5 KB inline head script, because static hosting cannot do it reliably [AN §5.2].
   - Anything date-relative (open now, earliest delivery date, same-day cutoff, seasonal visibility) is computed **in the browser, in the site's time zone**, never at build time.
7. **Brand:**
   - `tokens.ts` generates CSS custom properties, which Tailwind v4 maps through `@theme inline` to semantic utilities.
   - Fonts are self-hosted through the Astro Fonts API.
   - Logos and OG images are shaped with HarfBuzz and bidi-js into outlined SVG paths, then rasterised with resvg [FONT §B5].
8. **Tooling:**
   - `pnpm new-site` clones the nearest same-niche demo and re-brands it.
   - `pnpm rebrand` may only write inside an allow-list of data and asset paths (§12.4).
   - `pnpm check-all` builds, audits and prints one table.
   - `pnpm deploy` is a pnpm built-in, so our command is **`pnpm run deploy <site>`**, also available as **`pnpm ship <site>`** (§2, C3).

### What I need from you before Step 2

| # | Question | My recommendation |
|---|---|---|
| D1 | **Netlify plan.** The Free tier gives 300 credits a month for the whole team, and each production deploy costs 15, so about 20 deploys a month across all 14 sites. When credits run out, **every site pauses** [AN §4.4]. | Stay on Free, but develop on a `dev` branch (branch deploys cost 0 credits) and promote each site to production once it is finished. Upgrade to Personal ($9/mo) only for the month(s) of Steps 3–4 if the queue gets tight. Put client sites in the client's own Netlify team (§12.8). |
| D2 | **How clients log in to the CMS.** Sveltia supports neither Git Gateway nor Identity. Each client needs a free GitHub account (plus 2FA) and a collaborator invite [CMS §3.2]. | Accept it, and document it in Arabic with screenshots. A client who refuses gets Decap + Decap Turbo (English, left-to-right admin, paid) for that client only. Re-evaluate when Sveltia v1.0 "Additions" ships (late 2026). |
| D3 | **Order store for live full-tier clients.** The brief says Supabase, but Supabase Free **pauses after 7 idle days** [AN §9.2]. | Netlify Blobs by default for demos *and* small live clients (free, no pausing, same vendor). Supabase is an adapter for clients who need reporting and will pay for Pro ($25/mo). |
| D4 | **"Preview before publishing"** can only be a real deploy preview after 1–3 minutes, not an instant in-editor render of the site [CMS §3.4]. | Client repos: editorial workflow **on** for products, services and pages (Save → preview link → Publish); simple publish for settings. Demo monorepo: workflow **off**. Promise clients "a preview link before it goes live", not "instant preview". |
| D5 | **BenefitPay (the wallet app).** It is only available as a Tap client-side SDK. Redirect checkouts in Bahrain get BENEFIT debit cards, other cards and Apple Pay [PAY §3]. | v1 sells BENEFIT debit + cards + Apple Pay for Bahrain. The BenefitPay wallet is a later add-on (a Tap SDK island). |
| D6 | **Who owns a client's repo and hosting after handoff.** | The client owns both: the site is extracted from the monorepo into its own GitHub repo and its own Netlify team. You are a collaborator, and maintenance is a paid retainer (§12.5). |
| D7 | **Your details for the demos and the hub.** For safety, every demo's WhatsApp and phone button must go to a number you control (§11.6). | Give me the WhatsApp number (E.164), the studio name to show on the hub (default "Shujaat"), and whether the hub may be indexed by Google (default yes). |
| D8 | **Credit line on finished client sites.** | Default to a small "تصميم وتطوير: Shujaat" link. Choose `none` per client if they object. |

**NEEDS USER ACTION before Step 2:**
- Install **Node 24.21.0 LTS**. Lighthouse 13 refuses Node 22.18 [AN §1.1].
- Run `npm i -g pnpm@12.5.1`, which needs no admin rights [AN §1.3].
- Create a **private** GitHub repo for the monorepo and a Netlify team.
- Later, register one GitHub OAuth App for CMS sign-in (§6.8).

---

## 1. Stack decision

**DECIDED:** **Astro 7.3 (static output, no adapter) + TypeScript 6 + Tailwind CSS 4.3 + pnpm 12 workspaces + Sveltia CMS + Netlify (static hosting, standalone Functions, Blobs).** I kept the brief's defaults because each one still holds up in September 2026.

- **Astro:** pages ship as HTML with near-zero JavaScript, which is what the Lighthouse ≥ 90 budget on a 4G phone needs. Its content layer reads the YAML/JSON that a Git CMS writes, and it validates the data with Zod. Its i18n routing supports an unprefixed Arabic default. Its image pipeline produces AVIF/WebP from files under `src/`.
- **Tailwind v4:** logical utilities make RTL the default. `@theme inline` lets one set of components wear thirteen brands through CSS variables.
- **Sveltia:** the only free Git CMS with an Arabic, right-to-left admin. Decap has neither [CMS §2].
- **Netlify Functions:** plain fetch-style handlers that map directly onto the payment interface. They stay independent of Astro's adapter release cycle, and they don't change the image pipeline [AN §3].

I rejected three alternatives:
- The Astro Netlify adapter: it would route images through Netlify's CDN, which prefers WebP, and it would couple the lite and full tiers.
- Svelte or Preact islands: vanilla custom elements plus nanostores cost 0 KB of framework.
- Supabase as the demo store: its free projects pause.

### 1.1 Pinned versions (checked on npm, 2026-09-23)

| Package / tool | Pin | Where | Notes |
|---|---|---|---|
| Node.js | **24.21.0** (`.nvmrc`), `engines.node >=22.19` | root | Current LTS "Krypton". Netlify reads `.nvmrc`, and Functions follow the build's Node version [AN §3.1] |
| pnpm | **12.5.1** (`"packageManager": "pnpm@12.5.1"`) | root | Must be an exact version. Corepack can run pnpm 12, which fetches its native binary [verified in the pnpm 12.5.1 changelog] |
| astro | 7.3.4 | sites, hub, `@aw/astro` | node ≥ 22.12; Vite 8 / Rolldown; Zod 4 |
| @astrojs/sitemap | 3.7.4 | `@aw/astro` | |
| @astrojs/check | 0.9.10 | root dev | peer TypeScript ≤ 6 |
| typescript | **^6.0.3** (not 7.x) | root | TypeScript 7 breaks `@astrojs/check` [AN §1.1] |
| tailwindcss / @tailwindcss/vite | 4.3.3 | `@aw/astro` | |
| sharp | 0.35.4 | root dev (explicit) | An optional dependency of astro that pnpm needs declared [AN §7] |
| zod | ^4.5.4 (npm latest is 4.6.5; resolves to astro's copy) | `@aw/core` | Scripts validate site configs outside Astro too |
| nanostores / @nanostores/persistent | 1.5.3 / 1.3.5 | `@aw/commerce`, `@aw/ui` | |
| @netlify/functions | 6.0.0 | full-tier sites | Types for `Context` and `Config` |
| @netlify/blobs | 11.1.0 | `@aw/core/server` | |
| @netlify/vite-plugin | 3.0.1 | `@aw/astro` (dev) | Emulates Functions, Blobs, headers and redirects in `astro dev` (SPIKE S5) |
| netlify-cli | 27.8.1 | root dev | Deploys with `--filter` |
| @sveltia/cms | 0.218.3, loaded from `unpkg.com/@sveltia/cms@0.218.3/dist/sveltia-cms.js` | `/admin` | **Exact pin** (pre-1.0 minors can break). Bump deliberately with a smoke test [CMS §3.9] |
| @sveltia/cms (dev) | 0.218.3 | `@aw/cms` | Only for its `CmsConfig` type and JSON Schema |
| yaml | 2.9.1 | `@aw/cms`, scripts | Deterministic YAML output |
| ajv | 8.20.0 | scripts | Validates the generated CMS config against Sveltia's schema |
| harfbuzzjs / bidi-js | 1.6.2 / 1.1.0 | `@aw/brand` (authoring) | Logo and OG text shaping [FONT §B3] |
| @resvg/resvg-wasm | 2.6.2 | `@aw/brand` (authoring) | Rasterises paths only, never `<text>` |
| svgo | 4.1.0 | `@aw/brand` | |
| magicast | 0.5.5 | scripts | AST-safe edits of `site.config.ts` in rebrand/extract |
| @clack/prompts | 1.8.1 | scripts | Interactive prompts for `new-site` |
| tsx | 4.23.15 | root dev | Runs `scripts/*.ts` |
| vitest | 5.0.1 | root dev | |
| fast-check | 4.10.2 | root dev | Property tests for money and slots |
| playwright / @axe-core/playwright | 1.63.0 / 4.13.0 | root dev | `channel: 'chrome'` uses the installed Chrome 153, so no browser download |
| lighthouse / chrome-launcher | 13.5.0 / 1.2.1 | root dev | Needs Node ≥ 22.19. Fallback is `lighthouse@12.8.2` |
| linkinator | 8.1.0 | root dev | |
| @supabase/supabase-js | 2.117.1 | `@aw/commerce/server/supabase` (optional) | Loaded only when `ORDER_STORE=supabase` |

`pnpm-workspace.yaml` settings. Since pnpm 11, `.npmrc` is for auth only [AN §1.3]:

```yaml
packages: ["packages/*", "sites/*", "hub"]
allowBuilds: { sharp: true, esbuild: true }
shellEmulator: true          # sh-style scripts behave identically on Windows (pnpm 12 setting)
# minimumReleaseAge stays at its 1-day default (supply-chain safety). If a pin is <24 h old, wait or pin the previous patch.
```

The repo root also gets:
- `.gitattributes` with `* text=auto eol=lf`, plus binary rules for png, webp and avif.
- `tsconfig.base.json` with `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax` and `moduleResolution: "bundler"`.
- A root `vitest.config.ts` that uses `projects`.

---

## 2. Conflicts between the brief and reality

The brief says "tell me rather than silently choosing". Every row cites its evidence. Rows marked **NEEDS USER DECISION** are summarised in §0 as D1–D8.

### 2.1 Hosting and deployment

| # | Brief | Reality | Resolution | Status |
|---|---|---|---|---|
| C1 | 13 sites plus the hub on Netlify, with owners publishing CMS edits | On Free, credits are pooled per team: 300 a month, 15 per production deploy. Exhaustion pauses every site. By default, one commit rebuilds all 14 sites (210 credits) [AN §4.4] | Generated per-site `ignore` commands (mandatory). Develop on the `dev` branch, where branch deploys cost 0. Promote to production deliberately. Use `[skip netlify]` for bulk content commits. Client sites go to the client's own team. Consider Personal ($9) during Steps 3–4 | **NEEDS USER DECISION (D1)** |
| C2 | "CSP headers via netlify.toml" | Netlify merges every matching header rule. A strict `/*` CSP also lands on `/admin/` and breaks the CMS [AN §10] | Three layers: an Astro hash-based `<meta>` CSP on pages; CMS-compatible hardening on `/*`; a Sveltia policy on `/admin/*` (§11.5) | DECIDED |
| C3 | `pnpm deploy <site>` | `deploy` is a **pnpm built-in**. Verified in the pnpm 12.5.1 changelog | `pnpm run deploy <site>`, plus the alias `pnpm ship <site>`. None of `dev`, `build`, `check-all`, `new-site`, `rebrand`, `extract`, `ship` or `go-live` appears among pnpm 12's commands | DECIDED |
| C4 | `pnpm check-all` on this machine | Lighthouse 13 needs Node ≥ 22.19 (you have 22.18). TypeScript 7 breaks `@astrojs/check`. pnpm is not installed [AN §1] | Node 24.21.0, pinned TypeScript ^6, pinned pnpm 12.5.1 | **NEEDS USER ACTION** |
| C5 | Project folder `arabic websites` | Paths with spaces are a historical Astro/Vite failure mode, and your user folder has a space too [AN §1.2] | SPIKE S1 on day 1. Fallback: `subst A: "C:\Users\Shujaat Mallick\Desktop\arabic websites"` and work from `A:\` | SPIKE S1 |
| C6 | Lighthouse SEO ≥ 90 on every site **and** `noindex` on demos | Lighthouse's `is-crawlable` audit fails on `noindex`, which pulls the SEO score well below 90 | check-all runs Lighthouse with `skipAudits: ['is-crawlable']` on demo sites, **and** separately asserts that `noindex` *is* present (meta tag + `X-Robots-Tag`). Live sites run the full audit | DECIDED |

### 2.2 CMS

| # | Brief | Reality | Resolution | Status |
|---|---|---|---|---|
| C7 | "Netlify Identity / git-gateway for clients" | Sveltia supports neither and never will. Git Gateway is deprecated. Identity itself still exists [CMS §3.2] | Clients sign in with GitHub through Netlify's OAuth provider (one OAuth App), on their own repo. The Sveltia Authenticator Worker is the backup if a site leaves Netlify | **NEEDS USER DECISION (D2)** |
| C8 | "Sveltia (or Decap if Sveltia gives trouble)" | Decap has no Arabic UI and no RTL (open since 2018) [CMS §2] | No general Decap fallback. Content stays Decap-readable, and `@aw/cms` keeps a `target: 'sveltia' \| 'decap'` switch for the per-client Turbo escape hatch | DECIDED |
| C9 | "Configure the admin UI in Arabic" | Sveltia ignores `locale`, follows the browser, and ~11% of UI strings are still English [CMS §3.7] | `public/admin/index.html` pre-seeds `sveltia-cms.prefs.locale = 'ar'` before the script loads. check-all verifies it | DECIDED, SPIKE S3 |
| C10 | "orders" as a CMS collection | A Git CMS can't hold runtime orders: customer data in Git history, a rebuild per order, no atomic counters [CMS §3.10] | A runtime store plus `/owner/` dashboard (§10). The CMS holds rules only | DECIDED |
| C11 | "Preview of an edit before publishing" | Neither CMS renders the real Astro site in the editor [CMS §3.4] | Deploy previews under the editorial workflow in client repos. The editor pane gets the site's CSS via `registerPreviewStyle`. No duplicated React templates in v1 | **NEEDS USER DECISION (D4)** |
| C12 | "Editorial workflow on" everywhere | GitHub/GitLab only. In the 13-site monorepo, CMS branches and PR lists may collide between sites, and each draft adds build steps [CMS §3.3] | Workflow **off** in the demo monorepo. In client repos, **on** per collection for catalogue content, simple publish for settings | DECIDED (with D4) |
| C13 | "Image uploads auto-resized" + all images WebP/AVIF | CMS processing outputs WebP only. AVIF must come from Astro, which never optimises `public/` [CMS §3.6, AN §7] | Sveltia converts uploads to WebP (HEIC too). Media sits entry-relative under `src/`, and Astro's `<Picture>` emits AVIF and WebP | DECIDED |
| C14 | One monorepo, "clients edit without me" | A Git CMS gives the editor write access to the **whole repo** [CMS §4.8] | Clients never edit the monorepo. `pnpm extract` creates the client's own repo at handoff (§12.5) | **NEEDS USER DECISION (D6)** |
| C15 | "Shared Sveltia config fragments" | A static admin page can't import TypeScript at runtime [CMS §3.9] | TypeScript builders in `@aw/cms` generate each site's `public/admin/config.yml` | DECIDED |
| C16 | (implied) An admin page in Astro | Sveltia discourages `src/pages/admin.astro` because the local workflow reload-loops [CMS §2] | A static `public/admin/index.html` | DECIDED |
| C17 | Treating the CMS as stable | Sveltia is a pre-1.0 beta, maintained essentially by one person [CMS §1] | Exact version pin, a scheduled bump, a CMS smoke test in check-all, and Decap-readable content | DECIDED |
| C18 | "How to close a booking day" through the CMS | A CMS edit means a rebuild: 1–3 min and 15 credits on the client's team | Planned closures (holidays) stay in the CMS. Full tier also gets an instant **runtime close-day** switch in `/owner/` | DECIDED |

### 2.3 Orders and data

| # | Brief | Reality | Resolution | Status |
|---|---|---|---|---|
| C19 | Supabase for full-tier orders, bookings and inventory | Free projects pause after 7 days of inactivity, and only 2 active projects are allowed [AN §9.2] | Blobs by default (demos and small clients). Supabase adapter optional, on Pro | **NEEDS USER DECISION (D3)** |
| C20 | `verifyPayment(sessionId)` for a static tier | Most gateways verify with their own id, a return parameter or a stored secret (Credimax `successIndicator`, FastPay refunds need the msisdn) [PAY §11] | A persisted `PaymentAttempt` in the store. Only full-tier sites have payments, and they all have a store | DECIDED |
| C21 | "Daily limit" on site 11 (booking **lite**) | Lite has no runtime store, so a counter can't be enforced | Lite: the owner marks full days in the CMS (`fullDates`), and the form hides them. An automatic counter is the full-tier upsell | DECIDED |

### 2.4 Front-end and i18n

| # | Brief | Reality | Resolution | Status |
|---|---|---|---|---|
| C22 | `?lang=en` works | Netlify query rules match only when `lang` is the **only** parameter. Instagram and WhatsApp links add `utm_*`, `fbclid` and `igsh` [AN §5.2] | A ~0.5 KB blocking inline head script, with the language cookie written so CDN rules can be added later | DECIDED |
| C23 | Tailwind "start-/end-" utilities | `start-*`/`end-*` are deprecated since Tailwind 4.2 [AN §11.3] | `inset-s-*` / `inset-e-*`, plus a check-all lint that bans physical *and* deprecated classes | DECIDED |
| C24 | "Arabic numerals formatting" | This is ambiguous. `Intl` prints Arabic-Indic digits for ar-BH, ar-KW, ar-SA and ar-IQ, but Western digits for ar-AE and plain `ar` [FONT §A3] | Per-site `numberingSystem: 'arab' \| 'latn'`, **default `'arab'`** in Arabic UI. English UI is always `latn`. Phone numbers are always Western digits in an LTR isolate | DECIDED (say if you prefer Western digits) |

### 2.5 Payments

| # | Brief | Reality | Resolution | Status |
|---|---|---|---|---|
| C25 | IQD has 0 decimals | ISO 4217 says 3. `Intl`, FastPay and ZainCash use whole dinars. Checkout.com wants ×1000 [PAY §1.3] | The app table says IQD = 0 (a documented deviation). Conversion happens per gateway inside the adapters | DECIDED |
| C26 | BHD/KWD prices at any fils | Checkout.com rejects 3-decimal amounts whose last digit isn't 0 [PAY §1.4] | Content rule: BHD/KWD prices use **0.010 steps** (CMS `step: 0.01`). check-all enforces it | DECIDED |
| C27 | MyFatoorah `SendPayment/ExecutePayment/...` | Those are "Old Integration". v3 (`POST /v3/payments`) is current; refunds are still v2 `MakeRefund` [PAY §4] | Adapter uses v3, plus v2 for refunds | DECIDED |
| C28 | `createPaymentSession → { redirectUrl, sessionId }` | Credimax returns no URL; its script opens the page. BenefitPay needs Tap's SDK [PAY §8, §3] | `redirectUrl` may point at our own interstitial `/pay/credimax/?s=…`. BenefitPay is deferred | DECIDED, **D5** |
| C29 | "Webhook signature verification in the adapters" | Moyasar puts a shared token in the body, FastPay's notification is **unsigned** and fires on success only, Credimax sends a static header, and ZainCash is unknown [PAY §2] | Verify whatever each provider offers, **then always re-fetch the status** from the provider API. `PaymentEvent.authenticity` records which kind of check passed | DECIDED |
| C30 | BenefitPay under Tap and MyFatoorah | Tap offers it only through a web SDK. MyFatoorah is unconfirmed. PayTabs has no Bahrain region [PAY §2] | Bahrain providers: Tap (default), Credimax or MyFatoorah. PayTabs is not used for BH | DECIDED |

### 2.6 Typography and branding

| # | Brief | Reality | Resolution | Status |
|---|---|---|---|---|
| C31 | Readex Pro as a candidate | No پ چ گ, which breaks Iraqi and Kuwaiti dialect words [FONT §A3] | Not allowed as a text face on sites 04, 05, 12 or 13. check-all runs a glyph-coverage test against each site's full content | DECIDED |
| C32 | Aref Ruqaa and Reem Kufi as candidates | They lack the Arabic decimal and thousands separators (U+066B/U+066C), so prices would render broken [FONT §A3] | Display faces may carry words only. Prices always use the body face (`priceRole: 'body'`), which must pass coverage | DECIDED |
| C33 | Pair Arabic and Latin by "x-height" | Arabic has no x-height. Matched families align the alef with the Latin cap height [FONT §A5] | The pairing table in [FONT §A5] plus a `--latin-scale` token | DECIDED |
| C34 | "Web type converted to outlines" for logos | Colour fonts lose their colour when outlined, and satori and opentype.js mis-shape Arabic [FONT §B1] | Monochrome font siblings only; HarfBuzz and bidi-js → paths; resvg as rasteriser | DECIDED |
| C35 | Invented brand names (non-negotiable 5) | Short Arabic names like لمار or عنبر very likely exist as real Instagram shops | Before building each site, a name-collision check (Instagram, Google Maps, commercial registers) is part of the design-plan review. Demo URLs always contain `-demo` | DECIDED (process) |

---

## 3. Monorepo layout

```
arabic websites/
  package.json              root scripts (§12.1), "packageManager": "pnpm@12.5.1", engines
  pnpm-workspace.yaml       packages/*, sites/*, hub  (+ settings in §1.1)
  .nvmrc                    24.21.0
  .gitattributes            * text=auto eol=lf
  tsconfig.base.json
  vitest.config.ts          projects: packages/*, scripts
  studio.config.ts          YOUR identity: studio name, WhatsApp, hub URL, credit text (D7)
  packages/
    core/        types, Zod schemas, defineSite(), money, time and hours, ids, KV store (server)
    i18n/        dictionaries (ar base + dialect/address overlays + en), formatters, Hijri, phone, geo seeds
    brand/       token schema → CSS, theme.css, contrast checks, font catalogue, logo/OG pipeline, photo grade
    ui/          Astro components: shell, nav/footer variants, hero archetypes, sections, forms, gallery, lightbox, islands
    commerce/    catalog normalisation, options, pricing, cart, fulfilment rules, order builder, gift cards, stock; server/
    booking/     services and resources, slot generation, caps, windows, deposits, booking builder; server/
    whatsapp/    message builders + wa.me link builder
    payments/    PaymentProvider interface, registry, method matrix, amount conversion, adapters, mock gateway
    ops/         owner dashboard (pages + API), owner auth, mailer, notification templates, enquiries
    seo/         meta, OG, hreflang, JSON-LD builders, robots, sitemap options
    cms/         Sveltia config builders, field packs, Arabic labels/hints, admin index.html template
    content/     Astro collection definitions from the preset, localise() normaliser, content checks, server-data builder
    presets/     engine presets, niche presets, resolvePreset(), starter content packs, site templates
    astro/       the `awSite()` Astro integration: i18n, routes, fonts, CSP, sitemap, images, Tailwind, dev emulation
  sites/
    01-layan-abaya/ … 13-athar-events/     (slugs final after the design-plan review)
  hub/                      the showcase site (@aw/hub)
  scripts/                  run with tsx: new-site, rebrand, extract, sync, check-all, run (dev/build/deploy), brand-render, fonts-fetch, images-grade, hub-screens, lib/
  docs/
  .cache/fonts/             gitignored: pinned google/fonts TTFs + OFL + sha256 [FONT §B4]
  .check/                   gitignored: reports, screenshots, Lighthouse JSON
```

### 3.1 Rules every package follows

- **Packages ship TypeScript source, with no build step.** `exports` point at `./src/*.ts` or `.astro` files [AN §4.2]. Subpath exports mark where code may run:
  - `.` is isomorphic pure logic (safe in the browser, in functions and in tests).
  - `./client` is browser-only: custom elements and nanostores.
  - `./server` is functions-only: stores and handlers. It may use `node:` APIs and secrets.
  - `./components/*` holds `.astro` files, used at build time only.
- **The dependency direction is fixed** (no cycles). check-all fails on any import that breaks it:
  - `core` ← `i18n` ← {`brand`, `whatsapp`, `seo`, `payments`} ← {`commerce`, `booking`} ← `ops` ← `ui` ← `content`/`cms`/`presets` ← `astro` ← sites and hub.
  - `./client` and `.astro` files must never import `*/server`.
- **No brand values in packages.** No hex colours, font names, brand names, phone numbers or currency literals outside `core/money` tables. A check-all lint enforces this with an allow-list.
- **Package naming.** Packages are named `@aw/<name>`; sites are named `@aw/site-NN-slug`. Each site's `package.json` declares every workspace package its functions import, so the Netlify bundler can resolve them [AN §4.5].

### 3.2 Package responsibilities and public API

Signatures are abbreviated. The types they use are defined in §5 and §9.

| Package | Responsibility | Public API (main exports) |
|---|---|---|
| `@aw/core` | Shared types and schemas; money; time; ids; a minimal KV store for server code | `defineSite(cfg): SiteConfig` (validates with Zod) · `siteSchema` · money: `money(minor, cur)`, `parseDecimal(str, cur): Money` (rejects excess decimals), `toDecimalString(m)`, `add`, `sub`, `mul(m, qty)`, `sum(ms)`, `allocateBps(m, bps, rounding)`, `compare`, `isZero` · `CURRENCIES` (the exponent table) · time: `zonedNow(tz)`, `toLocalDate(instant, tz)`, `instantOf(date, minutes, tz)`, `addDays(date, n)`, `weekdayOf(date)`, `parseHM` · hours: `isOpenAt(hours, instant, tz)`, `nextOpening(...)`, `rangesForBusinessDay(hours, date)` · ids: `orderId(prefix, date)`, `sessionId()`, `shortCode()` · `./server`: `KvStore` interface + `blobsKv(storeName)` + `memoryKv()` with `getJSON`, `setJSON(onlyIfNew / onlyIfMatch)`, `list(prefix)`, `withEtagRetry(fn)` |
| `@aw/i18n` | Words and formats | `t(key, lang, site)` with fallback order site override → dialect+audience overlay → base · `plural(lang, n, forms)` · `formatMoney(m, lang, locale)` (exact, never rounds) · `formatNumber` · `formatDate(date, lang, locale, {hijri})` · `formatTimeRange(range, lang)` (marks after-midnight) · `hijriParts(date)` · `normaliseDigits(str)` (Arabic-Indic and Persian → ASCII) · `phone.parse(str, country): E164 \| PhoneError` · `phone.display(e164)` · `address.fields(country)` · `geo.zones(country)` (seed lists: BH and KW governorates, Iraqi governorates, Jeddah and Riyadh districts, GCC countries) · `bcp47(locale, lang)` |
| `@aw/brand` | Brand tokens and brand assets | `defineTokens(t): BrandTokens` · `tokensToCss(tokens): string` · `theme.css` (the `@theme inline` map) · `checkContrast(tokens): Issue[]` · `fontCatalogue` (coverage flags from [FONT §A2–A3]) · `checkCoverage(fonts, corpus): Missing[]` · `renderBrand(siteDir)` → logo.svg, logo-light.svg, logo-dark.svg, logo-mark.svg, favicon.svg, og.png, apple-touch-icon.png · `gradePhoto(input, grade)` |
| `@aw/ui` | All visual components; brand-agnostic through semantic utilities only | Layout: `BaseLayout`, `SkipLink`, `DemoBanner`, `Nav{BarStart,BarCentered,BottomTabs,MinimalSheet}`, `Footer{Columns,CenteredMark,Band}` · `Hero/*` (archetypes, §7.4) · `sections/*` (each with variants) · `ProductCard{…}` · `Price` (adds `*` in demos) · `Picture` wrapper · `Gallery`, `Lightbox` · `Modal`/`Drawer` (`<dialog>`) · `WhatsAppCta` · `LangToggle` · `Icon` (inline SVG, `flip` flag for directional icons) · forms: `Form`, `Field`, `PhoneField`, `DateField` (site TZ, min/max at runtime), `ErrorSummary` · `./client`: `aw-form`, `aw-drawer`, `aw-lightbox`, `aw-share`, `aw-date`, `aw-countdown`, `track()` (analytics) |
| `@aw/commerce` | Commerce engine | `normaliseProduct(raw, niche): Product` · `resolveOptions(product)` · `priceLine(product, selection, qty): Money` (tiers, MOQ, add-ons, absolute/delta choice prices) · `validateSelection(...)` → Arabic/English errors · `quoteOrder(input, rules, catalog): Quote` (shipping, COD fee, gift cards, totals, deposit) · `fulfilmentOptions(address, rules, now)` · `earliestDate(product, rules, now, tz)` · `./client`: `cart` store, `aw-add-to-cart`, `aw-cart-drawer`, `aw-checkout`, `aw-facets`, `aw-estimate` · `./server`: `createQuoteHandler`, `createCheckoutHandler`, `createOrderHandler`, `createStockHandler`, `createGiftCardHandler`, `OrderStore` + `blobsOrderStore` / `memoryOrderStore` / `supabaseOrderStore` · `./components/*` (pages: shop, category, product, cart, checkout, order status) |
| `@aw/booking` | Booking engine | `generateSlots(input): Slot[]` (pure) · `dayCapacity(date, rules, ledger)` · `openWindows(rules, today)` · `computeDeposit(price, rule, currency): Money` · `validateBookingRequest(...)` · `./client`: `aw-calendar`, `aw-slot-picker`, `aw-booking-form`, `aw-upload` · `./server`: `createAvailabilityHandler`, `createBookingHandler`, `createUploadHandler`, `BookingStore` + `blobsBookingStore` / `memoryBookingStore` / `supabaseBookingStore` · `./components/*` (services, service detail, book, booking status) |
| `@aw/whatsapp` | Readable messages and links | `orderMessage(input, ctx): string` · `bookingMessage` · `enquiryMessage` · `shareMessage(product, url)` · `waLink(e164, text): string` · `fitToLimit(msg, maxEncoded)` · `ctx = { lang, dialect, audience, locale, demoPrefix? }` |
| `@aw/payments` | Provider-agnostic payments (§9) | The types in §9.3 · `getProvider(name, deps)` · `providerNames` · `availableMethods(locale, provider, wanted)` · `toProviderAmount(m, provider)` · `verify.hmacSha256Hex`, `verify.hmacSha256Base64`, `verify.constantTimeEqual` · adapters `mock`, `cod`, `tap`, `myfatoorah`, `moyasar`, `paytabs`, `checkout`, `credimax`, `fastpay`, `zaincash` · `./server`: `createPaymentStatusHandler`, `createWebhookHandler`, `createMockCompleteHandler`, `PaymentAttemptStore`, `EventLog` · `./components/MockGateway.astro`, `CredimaxInterstitial.astro` |
| `@aw/ops` | Everything the owner sees at runtime | `./components/OwnerDashboard.astro` · `./client`: `aw-owner-app` (lists, detail, status changes, close day, stock, gift cards, outbox) · `./server`: `createOwnerHandler` (router for `/api/owner/*`), `OwnerAuth` (`demo`, `email-otp`, `supabase`), `Mailer` (`outbox`, `resend`), `notify.orderPlaced`, `notify.bookingConfirmed`, `notify.otp`, `createEnquiryHandler` · email templates (RTL HTML + text) |
| `@aw/seo` | Metadata | `buildHead(page, site, lang): HeadTags` (title, description, canonical, hreflang, og, twitter, robots) · `jsonLd.business(site, settings)` · `jsonLd.product(product, lang, site)` · `jsonLd.service(...)` · `jsonLd.breadcrumbs(trail)` · `jsonLd.offerCatalog(...)` · `robotsTxt(site)` · `sitemapOptions(site)` |
| `@aw/cms` | Sveltia configuration | `buildCmsConfig(resolved, site, { target: 'sveltia' \| 'decap', contentRoot }): CmsConfig` · field packs (`fields.product.fashion`, `fields.product.perfume`, …) · `labels.ar` (neutral-address hints) · `adminIndexHtml(site)` (Arabic pre-seed, pinned script, `app_title`, `nc-root` link to `/owner/`) · `validateCmsConfig(cfg)` (Ajv against Sveltia's schema) |
| `@aw/content` | Content layer glue | `defineCollections(site)` (used by each site's `src/content.config.ts`) · schema factories generated from the same field packs as the CMS · `localise(data, lang, nonI18nKeys)` · `checkContent(siteDir)` (English completeness, price steps, image sizes, glyph coverage corpus) · `buildServerData(siteDir)` → `.aw/server-data.json` (catalog prices, options, rules for functions) |
| `@aw/presets` | The engine/preset model (§4) | `enginePresets`, `nichePresets` · `resolvePreset(site): ResolvedPreset` · `moduleArtifacts` (module → routes, collections, settings, functions, islands) · `starterPacks/<niche>/` (only for a niche with no demo yet) |
| `@aw/astro` | One integration per site | `awSite(site): AstroUserConfig` sets `site`, `trailingSlash: 'always'`, `build.format: 'directory'`, `compressHTML: true`, `session: false`, `i18n`, fonts, `security.csp` (incl. the language-script hash), sitemap, Tailwind and Netlify dev plugins. It also includes `awIntegration(site)`, which injects the engine routes and emits server data in dev/build |

### 3.3 Anatomy of a site folder

Everything is data, assets or generated glue. `G` = generated by `pnpm site:sync`: never hand-edited, and check-all fails on drift.

```
sites/02-noha-modest/
  package.json                 name @aw/site-02-noha-modest; deps on the @aw/* it uses
  site.config.ts               code-only config (§5), edited by new-site/rebrand/you
  astro.config.ts              3 lines: export default defineConfig(awSite(site))
  src/content.config.ts        1 line:  export const collections = defineCollections(site)
  src/styles/site.css          @import "tailwindcss"; @import "@aw/brand/theme.css"; @import "./tokens.css"; @source "../../../../packages";
  src/styles/tokens.css        G  from brand/tokens.ts
  src/content/**               CMS-owned content (§6)
  brand/
    tokens.ts                  palette, type, radius, spacing, shadow, motion, photo grade
    logo.json                  wordmark text, fonts, OpenType features, lockup template
    brand.md                   guideline (hand-written prose + G sections between markers)
    logo.svg logo-light.svg logo-dark.svg logo-mark.svg favicon.svg og.png apple-touch-icon.png
  public/
    admin/index.html           G  Sveltia loader + Arabic pre-seed
    admin/config.yml           G  from @aw/cms builders
    favicon.svg, apple-touch-icon.png, og.png    G  copied from brand/
  netlify/functions/*.mts      G  thin wrappers (full tier only), literal `config.path`
  netlify.toml                 G  build, ignore, functions, headers, environment contexts
  .env.example                 G  exactly the keys this site's modules and provider need
  .aw/                         gitignored: server-data.json (built by the integration)
```

There are no per-site components. A site that needs a structure nobody has built gets a new **variant** in `@aw/ui`, which every later site can reuse. The check-all lint fails if a `.astro`, `.tsx` or `.css` file other than `site.css` appears under `sites/*/src/`.

---

## 4. Engine / preset model

### 4.1 Concepts

- **Engine preset**: one of `commerce.lite`, `commerce.full`, `booking.lite` or `booking.full`. It fixes the *flow* and its *infrastructure*: how an order or booking ends (WhatsApp vs checkout/payment) and which functions and settings exist.
- **Niche preset**: `fashion`, `perfume`, `chocolatier`, `sweets`, `cakes`, `beauty`, `henna`, `favors` or `events`. It fixes the *vocabulary*:
  - field packs (which CMS fields a product or service has),
  - extra collections, facets and default sections,
  - schema.org business type,
  - copy nouns, and the starter content pack.
- **Composition**: a site has one **primary** engine preset and optional **secondary** presets. For example:
  - Site 11 is `booking.lite` + `commerce.lite` (the cone shop).
  - Site 10 is `booking.full` + the `giftCards` module from commerce.
- **Site overrides**: `features` in `site.config.ts` switches individual modules on or off, within what the presets allow.
- **Resolution** is a pure function:

  ```ts
  resolvePreset(site: SiteConfig): ResolvedPreset
  ```

  Everything downstream reads **only** `ResolvedPreset`:
  - `@aw/astro`: which routes to inject.
  - `@aw/content`: which collections and schemas exist.
  - `@aw/cms`: which collections and fields the admin shows.
  - `site:sync`: which function wrappers, env keys and headers to generate.
  - `@aw/ui`: which home sections are allowed.
  - `check-all`: which pages and flows to test.

  So a preset is data, and switching it changes behaviour with no code edits.

### 4.2 Types

```ts
// packages/presets/src/types.ts
export type EnginePresetId = 'commerce.lite' | 'commerce.full' | 'booking.lite' | 'booking.full';
export type NicheId = 'fashion' | 'perfume' | 'chocolatier' | 'sweets' | 'cakes' | 'beauty' | 'henna' | 'favors' | 'events';

export type ModuleId =
  // shared
  | 'pages' | 'faq' | 'reviews' | 'gallery' | 'lookbook' | 'offers' | 'branches' | 'stockists' | 'shareLinks' | 'hijriDates'
  // commerce
  | 'catalog' | 'categories' | 'facets' | 'sizeGuide' | 'notesPyramid' | 'personalisation' | 'wrapperPreview'
  | 'menuPage' | 'seasonalSections' | 'estimateBuilder' | 'corporateEnquiry' | 'sameDayCutoff'
  | 'whatsappOrder' | 'cart' | 'checkout' | 'fulfilment' | 'deliverySlots' | 'pickup' | 'cod' | 'stock' | 'giftCards'
  // booking
  | 'services' | 'packages' | 'bookingRequest' | 'bookingCalendar' | 'resources' | 'dailyCap' | 'seasonalWindows'
  | 'deposits' | 'referenceUpload'
  // runtime
  | 'payments' | 'ownerDashboard' | 'orderNotifications';

export type FlowConfig = {
  order?: 'whatsapp' | 'checkout';
  booking?: 'whatsapp-request' | 'calendar-deposit' | 'calendar-confirm';
  enquiry?: 'whatsapp' | 'form';
};

export interface EnginePreset {
  id: EnginePresetId;
  engine: 'commerce' | 'booking';
  tier: 'lite' | 'full';
  modules: { required: ModuleId[]; optional: ModuleId[] };
  flows: FlowConfig;
}

export interface NichePreset {
  id: NicheId;
  label: I18nText;
  businessType: SchemaOrgType;                 // §11.4
  fieldPacks: Partial<Record<CollectionId, FieldPackId[]>>;
  collections: CollectionId[];                 // niche-only collections, e.g. 'notes', 'wrappers', 'themes'
  modules: { add: ModuleId[]; optional: ModuleId[] };
  facets?: FacetId[];
  defaultSections: SectionId[];                // home composition seed
  nouns: { item: I18nText; items: I18nText; order: I18nText };   // e.g. عباية/عبايات, كيكة/كيك
  starterPack: string;                         // content pack used only when no same-niche demo exists
}

export interface ResolvedPreset {
  tier: 'lite' | 'full';
  engines: EnginePresetId[];                   // primary first
  niche: NicheId;
  modules: ReadonlySet<ModuleId>;
  flows: Required<FlowConfig>;
  routes: RouteDef[];                          // pattern + entrypoint (package .astro) + locales
  collections: CollectionDef[];                // name, folder, format, i18n structure, fields (field packs merged)
  settings: SettingsId[];                      // which JSON singletons exist
  functions: FunctionDef[];                    // name, path, method, handler factory import, rateLimit
  islands: IslandId[];                         // custom elements to bundle
  envKeys: EnvKeyDef[];                        // for .env.example
  sections: SectionId[];                       // allowed home sections (CMS `types` list)
}
```

### 4.3 Module → artifacts

This is the lookup table `moduleArtifacts` encodes. Every route also exists under `/en/`.

| Module | Routes | Collections / settings | Functions (`/api/...`) | Islands |
|---|---|---|---|---|
| catalog, categories | `/shop/`, `/shop/<category>/`, `/products/<slug>/` | `products`, `categories` | — | `aw-share` |
| facets | on `/shop/` | (facet values from products) | — | `aw-facets` (reads `/_aw/facets.json`) |
| whatsappOrder | on product page | `settings/contact` | — | `aw-wa-order` |
| cart, checkout, fulfilment, cod, pickup, deliverySlots | `/cart/`, `/checkout/`, `/order/` | `settings/fulfilment`, `settings/checkout` | `quote` (POST `/api/quote`), `checkout` (POST `/api/checkout`), `order` (GET `/api/order`) | `aw-cart-drawer`, `aw-checkout` |
| payments | `/pay/return/`, `/pay/mock/`, `/pay/credimax/` (when provider = credimax) | — | `pay-status` (GET `/api/pay/status`), `pay-webhook` (POST `/api/pay/webhook/:provider`), `pay-mock` (POST `/api/pay/mock/complete`) | `aw-pay-return`, `aw-mock-gateway` |
| stock | badges on cards and product page | — | `stock` (GET `/api/stock`) | `aw-stock` |
| giftCards | `/gift-cards/` | `settings/checkout.giftCards` | `giftcard` (POST `/api/giftcard/check`) | — |
| services, packages | `/services/`, `/services/<slug>/`, `/packages/` | `services`, `packages`, `categories` | — | — |
| bookingRequest (lite) | `/book/` | `settings/booking` | — | `aw-booking-form` → WhatsApp |
| bookingCalendar, resources, dailyCap, deposits | `/book/`, `/booking/` (status) | `settings/booking`, `resources` | `availability` (GET), `booking` (POST `/api/booking`) | `aw-calendar`, `aw-slot-picker` |
| referenceUpload | inside `/book/` or product page | — | `upload` (POST `/api/upload`) | `aw-upload` (client-side downscale to WebP) |
| seasonalWindows | inside `/book/` | `settings/booking.windows` | — | (runtime window filter) |
| ownerDashboard, orderNotifications | `/owner/` | `settings/notifications` | `owner` (`/api/owner/*`, including auth) | `aw-owner-app` |
| corporateEnquiry | `/corporate/` | — | `enquiry` (full tier) or WhatsApp (lite) | `aw-form` |
| gallery, lookbook | `/gallery/`, `/lookbook/` | `gallery` | — | `aw-lightbox` |
| branches | `/branches/`, `/branches/<slug>/` | `branches` | — | `aw-map-facade` |
| stockists | `/stockists/` | `stockists` | — | — |
| sizeGuide | `/size-guide/` | `pages/size-guide`, `settings/sizes` | — | — |
| menuPage, seasonalSections | `/menu/` | `products`, with `unit`; categories with `season` | — | (runtime season filter) |
| estimateBuilder | `/packages/`, `/book/` | `packages`, `addons`, `themes` | — | `aw-estimate` |
| notesPyramid | on product page, `/shop/` filters | `notes` | — | — |
| personalisation, wrapperPreview | on product page | `wrappers` | — | `aw-wrapper-preview` |
| sameDayCutoff | header strip, product page | `settings/fulfilment.delivery.sameDay` | — | `aw-countdown` |
| pages, faq, reviews, offers | `/about/`, `/faq/`, `/policies/<slug>/`, `/offers/` | `pages`, `faqs`, `reviews`, `offers` | — | — |

Always present: `/`, `/en/`, `/404/`, `/admin/` (static), `robots.txt`, `sitemap-index.xml`.

### 4.4 Engine presets as data

```ts
// packages/presets/src/engines.ts
export const enginePresets = {
  'commerce.lite': {
    id: 'commerce.lite', engine: 'commerce', tier: 'lite',
    modules: { required: ['catalog', 'categories', 'whatsappOrder', 'pages', 'faq', 'shareLinks'],
               optional: ['reviews', 'gallery', 'lookbook', 'offers', 'stockists', 'branches', 'sizeGuide',
                          'menuPage', 'seasonalSections', 'estimateBuilder', 'facets', 'hijriDates'] },
    flows: { order: 'whatsapp', enquiry: 'whatsapp' },
  },
  'commerce.full': {
    id: 'commerce.full', engine: 'commerce', tier: 'full',
    modules: { required: ['catalog', 'categories', 'cart', 'checkout', 'fulfilment', 'payments', 'ownerDashboard',
                          'orderNotifications', 'pages', 'faq', 'shareLinks'],
               optional: ['cod', 'pickup', 'deliverySlots', 'stock', 'giftCards', 'facets', 'corporateEnquiry',
                          'personalisation', 'wrapperPreview', 'sameDayCutoff', 'reviews', 'gallery', 'lookbook',
                          'offers', 'branches', 'sizeGuide', 'notesPyramid', 'referenceUpload', 'hijriDates'] },
    flows: { order: 'checkout', enquiry: 'form' },
  },
  'booking.lite': {
    id: 'booking.lite', engine: 'booking', tier: 'lite',
    modules: { required: ['services', 'bookingRequest', 'pages', 'faq'],
               optional: ['gallery', 'reviews', 'seasonalWindows', 'packages', 'offers', 'hijriDates'] },
    flows: { booking: 'whatsapp-request', enquiry: 'whatsapp' },
  },
  'booking.full': {
    id: 'booking.full', engine: 'booking', tier: 'full',
    modules: { required: ['services', 'bookingCalendar', 'deposits', 'payments', 'ownerDashboard',
                          'orderNotifications', 'pages', 'faq'],
               optional: ['resources', 'dailyCap', 'seasonalWindows', 'packages', 'referenceUpload', 'giftCards',
                          'gallery', 'reviews', 'offers', 'hijriDates'] },
    flows: { booking: 'calendar-deposit', enquiry: 'form' },
  },
} satisfies Record<EnginePresetId, EnginePreset>;
```

A niche preset, abbreviated:

```ts
// packages/presets/src/niches/perfume.ts
export const perfume = defineNiche({
  id: 'perfume', label: { ar: 'عطور وبخور', en: 'Perfume & oud' }, businessType: 'Store',
  fieldPacks: { products: ['perfume.bottles', 'perfume.family', 'perfume.notes', 'perfume.concentration', 'giftWrap'] },
  collections: ['notes'],
  modules: { add: ['notesPyramid'], optional: ['facets', 'corporateEnquiry', 'personalisation'] },
  facets: ['family', 'notes', 'concentration', 'bottleSize', 'price'],
  defaultSections: ['hero', 'categories', 'featured', 'notes-explorer', 'gift-sets', 'reviews', 'faq-teaser'],
  nouns: { item: { ar: 'عطر', en: 'fragrance' }, items: { ar: 'عطور', en: 'fragrances' }, order: { ar: 'طلب', en: 'order' } },
  starterPack: 'perfume',
});
```

**Field packs** give the owner niche-friendly CMS fields. `normaliseProduct()` then turns each niche's fields into the generic engine model (`ProductOption[]` + `QuantityRule`, §5.7). That mapping is how one cart and one checkout serve every niche:

| Field pack | Owner edits (CMS) | Normalised to |
|---|---|---|
| `fashion.sizes` | Multi-select from `settings/sizes` (local terms, e.g. Iraqi سمول/ميديم) | `choice` option `size` |
| `fashion.lengths` | Multi-select of lengths (52–62 in) | `choice` option `length` |
| `perfume.bottles` | List `{ml, price}` | `choice` option `bottle` with absolute prices |
| `perfume.notes` | top / heart / base → relation to `notes` | attributes (pyramid), facet |
| `chocolatier.trays` | List `{pieces, price}` | `choice` option `tray` |
| `personalisation` | Toggle + field list `{label, maxLength}` (name, date, occasion) | `text` options + lead tag `personalised` |
| `cakes.sizes` | List `{label, serves, price}` | `choice` option `size` |
| `cakes.textOnCake` | Toggle + max length | `text` option `cakeText` |
| `favors.moq` + `favors.tiers` | Minimum quantity, step, `{minQty, unitPrice}` list | `QuantityRule` with tiers |
| `events.package` | Inclusions list, base price, add-on relations | `addons` option + attributes |
| `giftWrap` | Toggle + wrap price + card message length | `choice` option `wrap` + `text` option `cardMessage` |
| `eventDate` | Toggle + lead days | `date` option |
| `referenceImage` | Toggle | `file` option |

### 4.5 The thirteen sites

Countries, currencies and dialects come from the brief. Providers are chosen so that every adapter family appears at least once in the portfolio. The **design plan** (a separate Step-1 deliverable) owns names, palettes, type and archetypes. If it renames a brand, only `slug` changes.

| # | Slug | Presets (primary + secondary) | Niche | Tier | Country · currency · TZ · dialect · audience | Order/booking ends in | Fulfilment | Payments (demo: mock) | Defining modules |
|---|---|---|---|---|---|---|---|---|---|
| 01 | `layan-abaya` | commerce.lite | fashion | lite | BH · BHD · Asia/Bahrain · khaleeji-bh · women | WhatsApp, per piece (size + length in message) | Stated on delivery page | — | sizes + lengths, sizeGuide, stockists, lookbook, shareLinks |
| 02 | `noha-modest` | commerce.full | fashion | full | BH · BHD · Asia/Bahrain · khaleeji-bh · women | Cart → checkout | Delivery (4 governorates) + GCC shipping table | tap: benefit, card, apple_pay · COD in Bahrain | giftCards (online redeem), stock, sizeGuide, lookbook |
| 03 | `dar-al-sidra` | commerce.full | perfume (oud and bakhoor house; the brief doesn't name the goods, so the design plan may switch to `fashion`) | full | BH · BHD · Asia/Bahrain · khaleeji-bh · mixed | Cart → checkout | Delivery + **pickup from 2 branches** | credimax (interstitial): card, apple_pay, benefit · COD | 150+ items, facets, branches (maps, hours), stock, `deferRender` |
| 04 | `rayman-boutique` | commerce.full | fashion | full | IQ · IQD · Asia/Baghdad · iraqi · women | Cart → checkout | Delivery by governorate (Iraq seed list), landmark field | **cod (primary)** + fastpay; zaincash stubbed | Local size terms, prominent share links, whole-dinar prices (IQD steps of 250) |
| 05 | `anbar-scent` | commerce.full | perfume | full | KW · KWD · Asia/Kuwait · kuwaiti · mixed | Cart → checkout | Delivery (6 governorates) | myfatoorah: knet, card, apple_pay | notesPyramid, bottle sizes, gift sets, giftWrap + card, occasion filter, corporateEnquiry |
| 06 | `dar-al-cacao` | commerce.full | chocolatier | full | BH · BHD · Asia/Bahrain · khaleeji-bh · mixed | Cart → checkout | Delivery **date + time slot** (slot capacity), lead time 24 h / 48 h personalised | tap: benefit, card, apple_pay | Trays/boxes, personalisation (name/date/occasion), wrapperPreview |
| 07 | `halawat-al-deera` | commerce.lite | sweets | lite | BH · BHD · Asia/Bahrain · khaleeji-bh · mixed | WhatsApp order form with a date (≥ tomorrow, site TZ) | Pickup or delivery named in message | — | menuPage, seasonalSections (Ramadan, Eid, National Day), minimum 1-day notice |
| 08 | `sukkariya-cakes` | booking.full | cakes (made to order) | full | SA · SAR · Asia/Riyadh · najdi · women | Calendar request + **deposit** | Pickup or Riyadh-district delivery, chosen in the request | tap: mada, card, apple_pay, stc_pay | referenceUpload, **daily order cap** (by weekday), deposit 50% (min 100 SAR), lead 2 days |
| 09 | `lahza-cake` | commerce.full | cakes (ready now) | full | SA · SAR · Asia/Riyadh (Jeddah) · hijazi · women | Cart → checkout | Delivery fee **by Jeddah district**, **same-day cutoff** | paytabs (KSA region): mada, card, apple_pay, stc_pay | sameDayCutoff clock, text-on-cake option, "ready now" availability |
| 10 | `maraya-beauty-lounge` | booking.full + giftCards | beauty | full | SA · SAR · Asia/Riyadh (Jeddah) · hijazi · women | Calendar **slot** + deposit | In salon | moyasar: mada, card, apple_pay, stc_pay | Services with durations, bridal packages, **staff + rooms**, deposits, gift cards (in-salon redeem), hours 14:00–02:00 |
| 11 | `naqsha-henna` | booking.lite + commerce.lite (shop) | henna | lite | BH · BHD · Asia/Bahrain · khaleeji-bh · women | WhatsApp booking request; WhatsApp cone order | Home visit or studio | — | Portfolio by style, **seasonal booking windows** (Eid, wedding season), owner-marked full days, small shop |
| 12 | `lamar-favors` | commerce.full | favors | full | KW · KWD · Asia/Kuwait · kuwaiti · women | Cart → checkout | Delivery (6 governorates), event-date lead time 10 days | myfatoorah: knet, card, apple_pay | MOQ, tiered bulk pricing, personalisation, eventDate, corporateEnquiry, custom-order policy |
| 13 | `athar-events` | commerce.lite | events | lite | KW · KWD · Asia/Kuwait · kuwaiti · mixed | WhatsApp booking request with a running estimate | Venue setup | — | Themes, packages + inclusions, add-ons, estimateBuilder, eventDate |

**Nine sites are `full`** (02, 03, 04, 05, 06, 08, 09, 10, 12). The brief asks for at least five. Checkout.com is typed and documented but used by no demo; it is the regional fallback for larger clients.

---

## 5. Site config schema

### 5.1 Principles

- **Two homes, split by who edits:**
  - **Code-only** configuration lives in `site.config.ts` and `brand/*`. That covers identity, wiring, tier, provider names, layout and flags. It is written by `new-site`, `rebrand` or you, and it is type-checked.
  - **Owner-editable** configuration lives in `src/content/settings/*.json`. That covers business facts and rules the shop changes (fees, hours, caps, contact details). It is written by the CMS and validated by Zod at build.
- **On disk vs in code:**
  - Money is written by the CMS as a **decimal string** (`"1.500"`). It becomes `Money` through `parseDecimal`, which fails the build on too many decimals or an off-step price.
  - Percentages are stored as numbers (`30`) and become `Bps` (3000).
  - Bilingual text is `{ "ar": "…", "en": "…" }`.
- **Secrets are never in either place.** They go in Netlify environment variables, with `.env.example` generated per site.
- **Precedence at runtime** (functions): environment variable > `site.config.ts` default. Examples are `PAYMENTS_MODE`, `ORDER_STORE`, `OWNER_AUTH` and `MAIL_PROVIDER`. A demo repo can never switch itself to `live`.

### 5.2 Primitive types

```ts
// packages/core/src/types/primitives.ts
export type Lang = 'ar' | 'en';
export type I18nText = { ar: string; en: string };
export type CountryCode = 'BH' | 'KW' | 'SA' | 'IQ' | 'AE' | 'QA' | 'OM' | 'JO';
export type GccCountry = 'BH' | 'KW' | 'SA' | 'AE' | 'QA' | 'OM';
export type CurrencyCode = 'BHD' | 'KWD' | 'OMR' | 'JOD' | 'SAR' | 'AED' | 'QAR' | 'IQD';
export type TimeZone = 'Asia/Bahrain' | 'Asia/Kuwait' | 'Asia/Riyadh' | 'Asia/Baghdad'
                     | 'Asia/Dubai' | 'Asia/Qatar' | 'Asia/Muscat' | 'Asia/Amman';
export type LocalDate = string;   // 'YYYY-MM-DD', a calendar date IN THE SITE'S TIME ZONE (Zod regex + validity check)
export type TimeHM = string;      // 'HH:MM' 24-hour, '00:00'..'23:59'
export type Weekday = 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri';
export type E164 = `+${string}`;  // '+97336001234', digits only after '+'
export type Minor = number;       // integer minor units; Number.isSafeInteger is asserted on every construction
export type Bps = number;         // basis points: 10000 = 100 %
export type Hex = `#${string}`;
export interface Money { readonly minor: Minor; readonly currency: CurrencyCode }
export interface ImageRef { src: ImageMetadata; alt?: I18nText }  // `src` resolved by Astro image(); alt falls back to entry title
```

### 5.3 `SiteConfig` (code-only)

```ts
// packages/core/src/types/site.ts
export interface SiteConfig {
  schemaVersion: 1;
  id: `${number}${number}`;           // '02' (hub order, ports, order prefixes)
  slug: string;                       // 'noha-modest', /^[a-z0-9-]+$/
  tier: 'lite' | 'full';              // must equal the highest tier among the presets
  preset: { primary: EnginePresetId; secondary?: EnginePresetId[]; niche: NicheId };
  locale: LocaleConfig;
  features: Partial<Record<ModuleId, boolean>>;   // only overrides; defaults come from the presets
  commerce?: CommerceConfig;
  booking?: BookingConfig;
  payments?: PaymentsConfig;          // required when modules include 'payments'
  ops?: OpsConfig;                    // required when modules include 'ownerDashboard'
  layout: LayoutConfig;               // §7.4
  seo: SeoConfig;
  analytics: AnalyticsConfig;
  demo: DemoConfig;
  deploy: DeployConfig;
  showcase: ShowcaseConfig;           // what the hub says about this site
}

export type Dialect = 'khaleeji-bh' | 'kuwaiti' | 'najdi' | 'hijazi' | 'iraqi' | 'msa';
export interface LocaleConfig {
  country: CountryCode;
  currency: CurrencyCode;             // must be in CURRENCIES; cross-checked with country
  timeZone: TimeZone;
  dialect: Dialect;                   // marketing microcopy + WhatsApp templates; policy pages are always 'msa'
  audience: 'women' | 'men' | 'mixed';// 'women' → feminine imperatives (أضيفي، اطلبي); 'mixed' → neutral phrasing
  numberingSystem: 'arab' | 'latn';   // digits in the Arabic UI (English UI is always 'latn')
  weekStart: Weekday;                 // calendar grid; default 'sat'
  weekend: Weekday[];                 // ['fri','sat'] for BH/KW/SA/IQ; used for business-day ETAs
  hijri: { show: 'never' | 'dates' | 'bookings'; calendar: 'islamic-umalqura' | 'islamic-civil' };
}
// Derived, not stored: bcp47 'ar-BH' | 'en', ogLocale 'ar_BH' | 'en_US', hreflang 'ar-BH' | 'en'.

export interface CommerceConfig {
  orderPrefix: string;                // 'NH' → order ids 'NH-260923-7K3M'
  cart?: { maxQtyPerLine: number };
  stock?: { mode: 'tracked' | 'badges-only'; lowStockThreshold: number };
  giftCards?: { denominations: Minor[]; validityMonths: number; redeem: 'online' | 'in-store' | 'both'; codePrefix: string };
  facets?: FacetId[];
  largeCatalog?: boolean;             // 150+ items: deferRender, WebP-only grid thumbnails (site 03)
  personalisation?: { previewTemplate?: 'wrapper' | 'none' };
}

export interface BookingConfig {
  bookingPrefix: string;              // 'MR' → 'MR-B-261010-Q8TD'
  granularity: 'day' | 'slot';        // code-level shape; the numbers live in settings/booking.json
  resourceModel: 'none' | 'staff' | 'staff+rooms' | 'kitchen';
  staffChoice: 'none' | 'optional' | 'required';
}

export type ProviderName = 'mock' | 'cod' | 'tap' | 'myfatoorah' | 'moyasar' | 'paytabs' | 'checkout' | 'credimax' | 'zaincash' | 'fastpay';
export type OnlineProvider = Exclude<ProviderName, 'mock' | 'cod'>;
export type PaymentMethodId = 'card' | 'mada' | 'apple_pay' | 'google_pay' | 'knet' | 'benefit' | 'benefitpay'
                            | 'stc_pay' | 'omannet' | 'qpay' | 'zaincash' | 'fastpay' | 'cod';
export interface PaymentsConfig {
  provider: OnlineProvider | null;    // gateway this site goes live with (null = COD only)
  methods: PaymentMethodId[];         // wish list; filtered by the method matrix (§9.5) and provider capabilities
  cod: boolean;                       // offer CashOnDelivery (its rules live in settings/fulfilment.json → cod)
  primary: 'online' | 'cod';          // preselected option (04: 'cod')
  statementDescriptor?: string;
  // The mode is NOT here: PAYMENTS_MODE env (mock | test | live); unset means 'mock'.
}

export interface OpsConfig {
  store: 'blobs' | 'supabase' | 'memory';            // default; env ORDER_STORE overrides
  dashboardAuth: 'demo' | 'email-otp' | 'supabase'; // default; env OWNER_AUTH overrides
  mailer: 'outbox' | 'resend';                      // default; env MAIL_PROVIDER overrides
  retentionDays?: number;                           // demo purge window (default 14)
}

export type SchemaOrgType = 'ClothingStore' | 'Store' | 'Bakery' | 'BeautySalon' | 'LocalBusiness';
export interface SeoConfig {
  indexing: boolean;                  // false → <meta name="robots" content="noindex"> + X-Robots-Tag: noindex
  businessType: SchemaOrgType;
  titleTemplate: I18nText;            // '%s · {name}' ({name} from settings/general.json)
  priceRange?: '$' | '$$' | '$$$';
  verification?: { google?: string; bing?: string };
}

export type AnalyticsConfig =
  | { provider: 'none' }
  | { provider: 'plausible'; domain: string; scriptOrigin: string }
  | { provider: 'ga4'; measurementId: `G-${string}` };

export interface DemoConfig {
  enabled: boolean;                   // master switch for the four safeguards below
  banner: boolean;                    // "هذا نموذج مبدئي، الصور والأسعار توضيحية"
  priceAsterisk: boolean;             // `*` on every price + footnote
  credit: 'demo' | 'designer' | 'none';
  contactRouting: 'studio' | 'site';  // 'studio' = every WhatsApp/tel goes to studio.config.ts (§11.6)
  sampleOrders: boolean;              // seed /owner/ with illustrative orders
}

export interface DeployConfig {
  url: `https://${string}`;           // canonical origin: 'https://noha-modest-demo.netlify.app'
  netlifySiteName: string;
  netlifySiteId?: string;             // for `pnpm run deploy`
}

export interface ShowcaseConfig { oneLiner: I18nText; highlights: I18nText[]; hubOrder: number }
```

### 5.4 Owner-editable settings (`src/content/settings/*.json`)

Each file is a Sveltia **file collection** with **no i18n panes**. Bilingual strings are inline `{ar, en}` objects, shown side by side, so the JSON stays flat for rebrand and Decap. The resolved types:

```ts
// settings/general.json: "بيانات المتجر"
export interface GeneralSettings {
  name: I18nText;                     // display name (the logo text is in brand/logo.json)
  tagline: I18nText;
  shortAbout: I18nText;               // footer/about teaser
  crNumber?: string;                  // commercial registration; demos render "(نموذج)"
  vatNumber?: string;
  pricesIncludeVat: boolean;          // SA 15 %, BH 10 % → shows "الأسعار شاملة الضريبة"; KW/IQ: no note
}

// settings/contact.json: "التواصل"
export interface ContactSettings {
  whatsapp: E164;                     // demos: overridden by studio number (§11.6)
  phone?: E164;
  email?: string;                     // demos use *.example addresses
  instagram?: string; tiktok?: string; snapchat?: string; x?: string;  // handles; demos render as text, not links
  address?: I18nText;                 // single-location businesses (multi-branch → branches collection)
  geo?: { lat: number; lng: number }; // area-level precision in demos
  mapsUrl?: string;
}

// settings/hours.json: "أوقات العمل"
export interface TimeRange { open: TimeHM; close: TimeHM }  // close <= open ⇒ closes on the NEXT calendar day
export type WeeklyHours = Record<Weekday, TimeRange[]>;     // [] = closed; at most 2 ranges (split shifts)
export interface HoursSettings {
  weekly: WeeklyHours;
  seasons: Array<{                    // Ramadan hours etc.; overrides `weekly` between from..to
    id: string; label: I18nText; from: LocalDate; to: LocalDate;
    weekly: Partial<WeeklyHours> & { all?: TimeRange[] };
    approximate: boolean;             // Hijri-driven dates the owner confirms each year
  }>;
  exceptions: Array<{ date: LocalDate; closed?: true; ranges?: TimeRange[]; note?: I18nText }>;
  note?: I18nText;
}

// settings/fulfilment.json: "التوصيل والشحن" (commerce)
export interface EtaDays { min: number; max: number }       // business days; 0 = same day
export interface Zone {
  id: string;                         // seed id ('capital', 'al-rawdah', 'baghdad') or 'custom-…'
  kind: 'governorate' | 'province' | 'district' | 'area' | 'custom';
  name?: I18nText;                    // required for 'custom'; seeds provide names otherwise
  fee: Money; freeOver?: Money; minOrder?: Money;
  eta: EtaDays; codAllowed: boolean; active: boolean;
}
export interface FulfilmentSettings {
  delivery?: {
    zones: Zone[];
    deliveryDays: Weekday[];
    leadTime: { standardHours: number; byTag: Record<string, number> };  // { personalised: 48 }
    dateRequired: boolean;
    slots?: Array<{ id: string; label: I18nText; from: TimeHM; to: TimeHM; capacity?: number; days?: Weekday[] }>;
    sameDay?: { cutoff: TimeHM; zones: string[] | 'all'; fee?: Money };
  };
  shipping?: {                        // cross-border GCC table (flat per country; weight tiers are out of scope)
    countries: Array<{ code: GccCountry; fee: Money; freeOver?: Money; eta: EtaDays; active: boolean }>;
    dutiesNote: I18nText;
  };
  pickup?: { branches: string[]; readyInHours: number; holdDays: number; fee: Money };
  cod?: { enabled: boolean; fee?: Money; maxOrder?: Money; scope: 'delivery' | 'delivery+pickup'; zones: string[] | 'all' };
  deliveryInfo: I18nText;             // lite sites: the text shown instead of a checkout
}

// settings/checkout.json: "الطلب والدفع" (full commerce)
export interface CheckoutSettings {
  minOrder?: Money;
  giftWrap?: { price: Money; cardMaxLength: number };
  notesMaxLength: number;
  termsPage: string;                  // pages/<slug>
  giftCards?: { designs: ImageRef[]; terms: I18nText };
  confirmationNote: I18nText;         // shown on /order/
}

// settings/booking.json: "الحجوزات"
export type DepositRule =
  | { kind: 'none' }
  | { kind: 'fixed'; amount: Money }
  | { kind: 'percent'; bps: Bps; min?: Money; max?: Money; roundUpTo: Minor };  // SAR: 100 (= 1.00 SAR)
export interface SeasonalWindow {
  id: string; label: I18nText;
  opensOn: LocalDate;                 // the form starts accepting requests
  closesOn?: LocalDate;
  eventFrom: LocalDate; eventTo: LocalDate;   // appointment dates offered in this window
  dailyCap?: number;
}
export interface BookingRules {
  slotStepMinutes: 5 | 10 | 15 | 30 | 60;
  lead: { minMinutes: number; sameDayCutoff?: TimeHM };
  horizonDays: number;
  buffers: { beforeMinutes: number; afterMinutes: number };
  dailyCap?: { default: number; byWeekday?: Partial<Record<Weekday, number>>; unit: 'bookings' | 'orders' | 'guests' };
  blackouts: Array<{ from: LocalDate; to: LocalDate; reason?: I18nText }>;   // planned closures
  fullDates: LocalDate[];             // LITE ONLY: owner-marked full days (no runtime counter)
  windows: SeasonalWindow[];          // non-empty ⇒ ONLY dates inside an open window are bookable
  deposit: DepositRule;               // site default; services may override
  cancellation: { freeUntilHours: number; depositRefundable: boolean };
  holdMinutes: number;                // slot hold while paying the deposit (default 15)
}

// settings/notifications.json: "التنبيهات" (full tier)
export interface NotificationSettings {
  ownerEmails: string[];              // receive order mail AND may log in to /owner/ (email-otp)
  ownerWhatsapp?: E164;               // shown in the dashboard as a quick link; no automatic sending (§10.6)
  notifyOn: Array<'order.placed' | 'order.paid' | 'booking.confirmed' | 'enquiry'>;
}

// settings/home.json: "الصفحة الرئيسية"
export interface HomeSettings {
  sections: Array<{ type: SectionId; enabled: boolean } & Record<string, unknown>>; // types limited to ResolvedPreset.sections
}

// settings/seo.json: "الظهور في محركات البحث"
export interface SeoSettings { defaultDescription: I18nText; shareImage?: ImageRef }

// settings/sizes.json: "المقاسات" (fashion)
export interface SizeSettings { sizes: Array<{ id: string; label: I18nText; order: number }>; lengths?: number[] }
```

**Resources** (staff and rooms) are an entry collection, because the owner adds and removes people:

```ts
// src/content/resources/<id>/index.yml
export interface Resource {
  id: string;
  kind: 'staff' | 'room' | 'station' | 'kitchen';
  name: I18nText;
  capacity: number;                   // parallel bookings this resource can hold
  skills: string[];                   // service tags it can perform ('bridal-makeup', 'nails', ...)
  weekly?: Partial<WeeklyHours>;      // defaults to venue hours
  daysOff: LocalDate[];
  active: boolean;
  photo?: ImageRef;
}
export interface ServiceRequirement { kind: Resource['kind']; skill?: string; resourceIds?: string[] }
```

### 5.5 `BrandTokens` (code-only, `brand/tokens.ts`)

```ts
export interface FontSpec {
  family: string;                     // Google Fonts family name
  weights: number[];                  // only weights actually used
  features?: string[];                // e.g. ['ss01'] (logo + CSS font-feature-settings)
  variable?: boolean;
}
export interface BrandTokens {
  color: {
    surface: Hex; surfaceAlt: Hex; ink: Hex; inkMuted: Hex; hairline: Hex;
    accent: Hex; accentInk: Hex;      // accentInk = text on accent (AA against accent)
    highlight?: Hex;                  // muted metallic, hairlines and type accents only, never gradients
    success: Hex; danger: Hex; focus: Hex; scrim: string;
  };
  usage: { surface: number; ink: number; accent: number; highlight?: number };   // % for brand.md; sums to 100
  fonts: {
    arabic: { display: FontSpec; body: FontSpec };
    latin: { display: FontSpec; body: FontSpec };
    priceRole: 'body';                // literal: prices never use the display face (C32)
  };
  type: {
    basePx: { mobile: number; desktop: number };           // Arabic body ≥ 17 px on mobile
    scale: number;                                          // modular ratio 1.2 to 1.333
    lineHeight: { display: number; heading: number; body: number; ui: number };  // explicit, never 'normal'
    latinScale: number;                                     // alef ÷ Latin cap, from [FONT §A5]
    latinTracking: { caps: string; body: string };          // applied only under :lang(en) / Latin runs
    weights: { heading: number; body: number; ui: number };
  };
  radius: { control: string; card: string; image: string; pill: string };
  space: { rhythm: 'airy' | 'standard' | 'dense'; gutterPx: { mobile: number; desktop: number }; maxWidthPx: number };
  shadow: { card: string; overlay: string };                // 'none' allowed
  motion: { durationMs: number; easing: string; reveal: 'none' | 'fade' };  // reduced motion forces 'none'
  photo: { grade: PhotoGrade; aspect: { card: string; hero: string } };
}
export interface PhotoGrade { saturation: number; brightness: number; warmth: number; contrast: number; tint?: Hex; tintStrength?: number }
```

### 5.6 Where each field lives, and who edits it

| Data | File | Format | Edited by |
|---|---|---|---|
| Identity, tier, presets, locale, currency, TZ, dialect, numbering, features, provider and methods, ops defaults, layout variants, SEO indexing, analytics, demo flags, deploy ids, showcase | `site.config.ts` | TS (`defineSite`, Zod-validated) | Code only (new-site, rebrand, you) |
| Palette, fonts, type scale, radius, spacing, shadow, motion, photo grade | `brand/tokens.ts` | TS | Code only (rebrand, designer) |
| Logo text, fonts, features, lockup | `brand/logo.json` | JSON | Code only (rebrand) |
| Brand guideline | `brand/brand.md` | MD (+ generated sections) | You; rebrand regenerates the marked sections |
| Studio identity (your name, WhatsApp, hub URL, credit text) | `studio.config.ts` (repo root) | TS | You |
| Business name, tagline, CR, VAT note | `settings/general.json` | JSON | **CMS** |
| WhatsApp, phone, email, social, address, map | `settings/contact.json` | JSON | **CMS** |
| Hours, seasons, exceptions | `settings/hours.json` | JSON | **CMS** |
| Zones, fees, free-over thresholds, ETAs, slots, lead times, same-day cutoff, GCC table, pickup, COD rules | `settings/fulfilment.json` | JSON | **CMS** (zone *ids* are seeded by code; the owner edits fees and on/off, and can add custom zones) |
| Minimum order, gift wrap, gift-card designs | `settings/checkout.json` | JSON | **CMS** |
| Booking step, lead, horizon, caps, blackouts, full days, windows, deposit %, cancellation | `settings/booking.json` | JSON | **CMS** |
| Staff and rooms | `resources/<id>/index.yml` | YAML | **CMS** |
| Owner emails, owner WhatsApp | `settings/notifications.json` | JSON | **CMS** |
| Home section order, visibility, hero content | `settings/home.json` | JSON | **CMS** (section *variants* are code-only) |
| Default meta description, share image | `settings/seo.json` | JSON | **CMS** |
| Catalog, services, pages, gallery, reviews, FAQs, … | `src/content/<collection>/**` | YAML / MD | **CMS** (§6) |
| Secrets (gateway keys, `SESSION_SECRET`, mail keys, Supabase keys) | Netlify env; `.env` locally (gitignored) | env | You / client |
| Runtime data: orders, bookings, attempts, stock counts, gift-card balances, closed-day overrides, outbox | Blobs (or Supabase) | JSON | Functions + `/owner/` |

### 5.7 Engine data model (normalised, used by UI, functions and tests)

```ts
export type ProductOption =
  | { kind: 'choice'; id: string; label: I18nText; required: boolean; display: 'buttons' | 'swatches' | 'select';
      choices: Array<{ id: string; label: I18nText; price?: Money; delta?: Money; stockKey?: string }> }
  | { kind: 'text'; id: string; label: I18nText; required: boolean; maxLength: number; hint?: I18nText; price?: Money }
  | { kind: 'date'; id: string; label: I18nText; required: boolean; leadDays: number; maxDaysAhead: number }
  | { kind: 'file'; id: string; label: I18nText; required: boolean; maxMb: number }
  | { kind: 'addons'; id: string; label: I18nText; items: Array<{ id: string; label: I18nText; unitPrice: Money; maxQty: number }> };
export interface QuantityRule { min: number; step: number; max?: number; tiers?: Array<{ minQty: number; unitPrice: Money }> }
export type Availability = 'in_stock' | 'ready_now' | 'made_to_order' | 'preorder' | 'sold_out';
export interface Product {
  id: string; slug: string; title: I18nText; summary: I18nText; description: I18nText;
  price: Money; compareAt?: Money; category: string; tags: string[]; images: ImageRef[];
  options: ProductOption[]; quantity: QuantityRule; availability: Availability;
  leadTags: string[];                 // e.g. 'personalised' → settings lead time
  attributes: Record<string, unknown>;// niche attributes (notes pyramid, inclusions, serves, ...)
}
export interface Service {
  id: string; slug: string; title: I18nText; summary: I18nText; description: I18nText; category: string;
  durationMinutes: number; price: { kind: 'fixed' | 'from'; amount: Money };
  requires: ServiceRequirement[]; deposit?: DepositRule; bookableOnline: boolean;
  images: ImageRef[]; options: ProductOption[];
}
```

### 5.8 Filled example: site 02 (commerce full, Bahrain)

The layout values are illustrative; the design plan for site 02 decides them.

```ts
// sites/02-noha-modest/site.config.ts
import { defineSite } from '@aw/core';

export default defineSite({
  schemaVersion: 1,
  id: '02',
  slug: 'noha-modest',
  tier: 'full',
  preset: { primary: 'commerce.full', niche: 'fashion' },
  locale: {
    country: 'BH', currency: 'BHD', timeZone: 'Asia/Bahrain',
    dialect: 'khaleeji-bh', audience: 'women', numberingSystem: 'arab',
    weekStart: 'sat', weekend: ['fri', 'sat'],
    hijri: { show: 'never', calendar: 'islamic-umalqura' },
  },
  features: { giftCards: true, stock: true, cod: true, sizeGuide: true, lookbook: true, reviews: true },
  commerce: {
    orderPrefix: 'NH',
    cart: { maxQtyPerLine: 5 },
    stock: { mode: 'tracked', lowStockThreshold: 2 },
    giftCards: { denominations: [20_000, 30_000, 50_000, 100_000], validityMonths: 12, redeem: 'online', codePrefix: 'NOHA' },
  },
  payments: { provider: 'tap', methods: ['benefit', 'card', 'apple_pay'], cod: true, primary: 'online' },
  ops: { store: 'blobs', dashboardAuth: 'demo', mailer: 'outbox', retentionDays: 14 },
  layout: {
    hero: 'split-editorial', nav: 'bar-start-logo', categoryEntry: 'story-rings',
    productCard: 'portrait-minimal', grid: 'two-col', imageShape: 'portrait', rhythm: 'airy',
    whatsapp: 'floating-pill', footer: 'columns', productPage: 'gallery-sticky',
    sectionVariants: { reviews: 'quote-rail', faq: 'accordion-plain' },
    signature: 'fabric-swatch-strip',
  },
  seo: { indexing: false, businessType: 'ClothingStore', titleTemplate: { ar: '%s · {name}', en: '%s · {name}' }, priceRange: '$$' },
  analytics: { provider: 'none' },
  demo: { enabled: true, banner: true, priceAsterisk: true, credit: 'demo', contactRouting: 'studio', sampleOrders: true },
  deploy: { url: 'https://noha-modest-demo.netlify.app', netlifySiteName: 'noha-modest-demo' },
  showcase: {
    oneLiner: {
      ar: 'متجر أزياء محتشمة كامل: سلة ودفع إلكتروني وشحن خليجي وبطاقات هدايا ولوحة طلبات.',
      en: 'A full modest-fashion store: cart, online payment, GCC shipping, gift cards and an orders dashboard.',
    },
    highlights: [{ ar: 'شحن لدول الخليج', en: 'GCC shipping' }, { ar: 'بطاقات هدايا', en: 'Gift cards' }],
    hubOrder: 2,
  },
});
```

```json
// sites/02-noha-modest/src/content/settings/fulfilment.json  (CMS-edited; money as decimal strings)
{
  "delivery": {
    "zones": [
      { "id": "capital",  "kind": "governorate", "fee": "1.500", "freeOver": "30.000", "eta": { "min": 1, "max": 2 }, "codAllowed": true, "active": true },
      { "id": "muharraq", "kind": "governorate", "fee": "1.500", "freeOver": "30.000", "eta": { "min": 1, "max": 2 }, "codAllowed": true, "active": true },
      { "id": "northern", "kind": "governorate", "fee": "2.000", "freeOver": "30.000", "eta": { "min": 1, "max": 2 }, "codAllowed": true, "active": true },
      { "id": "southern", "kind": "governorate", "fee": "2.500", "freeOver": "30.000", "eta": { "min": 2, "max": 3 }, "codAllowed": true, "active": true }
    ],
    "deliveryDays": ["sat", "sun", "mon", "tue", "wed", "thu"],
    "leadTime": { "standardHours": 24, "byTag": {} },
    "dateRequired": false
  },
  "shipping": {
    "countries": [
      { "code": "SA", "fee": "4.500", "freeOver": "60.000", "eta": { "min": 3, "max": 5 }, "active": true },
      { "code": "KW", "fee": "5.000", "freeOver": "60.000", "eta": { "min": 3, "max": 5 }, "active": true },
      { "code": "AE", "fee": "5.000", "freeOver": "60.000", "eta": { "min": 3, "max": 6 }, "active": true },
      { "code": "QA", "fee": "5.000", "freeOver": "60.000", "eta": { "min": 3, "max": 6 }, "active": true },
      { "code": "OM", "fee": "5.500", "freeOver": "60.000", "eta": { "min": 4, "max": 7 }, "active": true }
    ],
    "dutiesNote": { "ar": "قد تُفرض رسوم جمركية حسب بلد الوصول ويدفعها المستلم.", "en": "Import duties may apply in the destination country and are paid by the recipient." }
  },
  "cod": { "enabled": true, "fee": "0.500", "maxOrder": "80.000", "scope": "delivery", "zones": "all" },
  "deliveryInfo": { "ar": "التوصيل داخل البحرين خلال يوم إلى يومين عمل.", "en": "Delivery within Bahrain in 1–2 working days." }
}
```

### 5.9 Filled example: site 10 (booking full, Jeddah, cross-midnight hours)

```ts
// sites/10-maraya-beauty-lounge/site.config.ts (abridged to the fields that differ in shape from site 02)
export default defineSite({
  schemaVersion: 1, id: '10', slug: 'maraya-beauty-lounge', tier: 'full',
  preset: { primary: 'booking.full', niche: 'beauty' },
  locale: {
    country: 'SA', currency: 'SAR', timeZone: 'Asia/Riyadh', dialect: 'hijazi', audience: 'women',
    numberingSystem: 'arab', weekStart: 'sat', weekend: ['fri', 'sat'],
    hijri: { show: 'bookings', calendar: 'islamic-umalqura' },
  },
  features: { resources: true, deposits: true, packages: true, giftCards: true, hijriDates: true, gallery: true },
  booking: { bookingPrefix: 'MR', granularity: 'slot', resourceModel: 'staff+rooms', staffChoice: 'optional' },
  commerce: {                      // only the gift-card module of commerce is active on this site
    orderPrefix: 'MRG',
    giftCards: { denominations: [20_000, 50_000, 100_000], validityMonths: 12, redeem: 'in-store', codePrefix: 'MARAYA' },
  },
  payments: { provider: 'moyasar', methods: ['mada', 'card', 'apple_pay', 'stc_pay'], cod: false, primary: 'online' },
  ops: { store: 'blobs', dashboardAuth: 'demo', mailer: 'outbox' },
  layout: { hero: 'calendar-first', nav: 'bottom-tabs', /* … */ signature: 'mirror-arch-frame' },
  seo: { indexing: false, businessType: 'BeautySalon', titleTemplate: { ar: '%s · {name}', en: '%s · {name}' } },
  analytics: { provider: 'none' },
  demo: { enabled: true, banner: true, priceAsterisk: true, credit: 'demo', contactRouting: 'studio', sampleOrders: true },
  deploy: { url: 'https://maraya-lounge-demo.netlify.app', netlifySiteName: 'maraya-lounge-demo' },
  showcase: { /* … */ hubOrder: 10 },
});
```

```json
// settings/hours.json: 14:00–02:00 crosses midnight; Friday opens later; Ramadan 1448 hours (approximate)
{
  "weekly": {
    "sat": [{ "open": "14:00", "close": "02:00" }], "sun": [{ "open": "14:00", "close": "02:00" }],
    "mon": [{ "open": "14:00", "close": "02:00" }], "tue": [{ "open": "14:00", "close": "02:00" }],
    "wed": [{ "open": "14:00", "close": "02:00" }], "thu": [{ "open": "14:00", "close": "02:00" }],
    "fri": [{ "open": "16:00", "close": "02:00" }]
  },
  "seasons": [
    { "id": "ramadan-1448", "label": { "ar": "رمضان", "en": "Ramadan" }, "from": "2027-02-08", "to": "2027-03-08",
      "weekly": { "all": [{ "open": "21:00", "close": "03:00" }] }, "approximate": true }
  ],
  "exceptions": [
    { "date": "2027-03-09", "closed": true, "note": { "ar": "أول أيام عيد الفطر", "en": "First day of Eid al-Fitr" } }
  ]
}
```

(The dates are Umm al-Qura via `Intl`: 1 Ramadan 1448 = 2027-02-08, 1 Shawwal = 2027-03-09. They are `approximate` because the official moon sighting can shift them by a day.)

```json
// settings/booking.json
{
  "slotStepMinutes": 15,
  "lead": { "minMinutes": 180 },
  "horizonDays": 45,
  "buffers": { "beforeMinutes": 0, "afterMinutes": 10 },
  "blackouts": [ { "from": "2026-12-01", "to": "2026-12-01", "reason": { "ar": "صيانة الصالون", "en": "Salon maintenance" } } ],
  "fullDates": [],
  "windows": [],
  "deposit": { "kind": "percent", "percent": 30, "min": "50.00", "roundUpTo": "1.00" },
  "cancellation": { "freeUntilHours": 24, "depositRefundable": false },
  "holdMinutes": 15
}
```

```yaml
# src/content/resources/bridal-suite/index.yml  (operational data: NO i18n panes, inline {ar, en} like settings)
id: bridal-suite
kind: room
name: { ar: جناح العروس, en: Bridal suite }
capacity: 1
skills: [bridal-makeup, bridal-hair]
daysOff: []
active: true
# src/content/resources/reem/index.yml has kind: staff, name { ar: ريم, en: Reem }, capacity: 1, skills: [bridal-makeup, evening-makeup]
```

```yaml
# src/content/services/royal-bridal-package/index.yml  (entry collection, single_file i18n)
ar:
  id: sv9k2m
  title: باقة العروس الملكية
  summary: مكياج وتسريحة العروس مع تجهيز في جناح خاص
  description: …
  category: bridal
  durationMinutes: 240
  price: { kind: fixed, amount: "2500.00" }
  deposit: { kind: fixed, amount: "500.00" }
  requires:
    - { kind: staff, skill: bridal-makeup }
    - { kind: room, resourceIds: [bridal-suite] }
  bookableOnline: true
  images: [{ src: ./cover.webp }]
en:
  title: Royal Bridal Package
  summary: Bridal makeup and hair, prepared in a private suite
  description: …
```

---

## 6. Content model

### 6.1 Collections per preset

The formats: **Y** = YAML `single_file` i18n (`<folder>/<slug>/index.yml`, media beside it). **M** = Markdown `multiple_files` (`pages/<slug>/index.ar.md` + `index.en.md`, media beside them). **J** = JSON file collection (no i18n panes; inline `{ar,en}`).

| Folder (`src/content/…`) | CMS label | Format | commerce.lite | commerce.full | booking.lite | booking.full | Niche / module |
|---|---|---|---|---|---|---|---|
| `products` | المنتجات | Y | ● | ● | shop module | giftCards (card designs only) | all commerce |
| `categories` | الأقسام | Y | ● | ● | ● (styles/services) | ● | |
| `offers` | العروض | Y | ○ | ○ | ○ | ○ | |
| `services` | الخدمات | Y | | | ● | ● | beauty, henna, cakes (08) |
| `packages` | الباقات | Y | ○ | | ○ | ○ | events (13), bridal (10) |
| `addons` | الإضافات | Y | ○ | | | | events (13) |
| `themes` | الثيمات | Y | ○ | | | | events (13) |
| `resources` | الفريق والغرف | YAML, no i18n panes (inline `{ar,en}`) | | | | ○ | beauty (10) |
| `notes` | المكوّنات العطرية | Y | | ○ | | | perfume (03, 05) |
| `wrappers` | تصاميم الأغلفة | Y | | ○ | | | chocolatier (06) |
| `gallery` | معرض الصور | Y | ○ | ○ | ● | ● | lookbook (01, 02); portfolio by style (11) |
| `reviews` | آراء العملاء (توضيحية) | Y | ● | ● | ● | ● | |
| `faqs` | الأسئلة الشائعة | Y | ● | ● | ● | ● | |
| `branches` | الفروع | Y | ○ | ○ | ○ | ○ | 03 |
| `stockists` | نقاط البيع | Y | ○ | | | | 01 |
| `pages` | الصفحات | M | ● | ● | ● | ● | about, policies (shipping, returns, privacy, terms), size guide, custom-order policy |
| `settings/*` | الإعدادات | J | general, contact, hours, home, seo, (sizes) | + fulfilment, checkout, notifications | + booking | + booking, notifications | |

● = always, ○ = when the module is on. Content counts per site follow the brief: 12–40 products (150+ for site 03), 3–6 categories, 6–12 gallery images, 4 reviews, 6 FAQs, and full policy, shipping and about pages.

### 6.2 On-disk formats, shared by Sveltia and Astro

**Entry (YAML, `single_file`).** Non-translatable fields (`i18n: false`) are written once, under `ar:` [CMS §3.5; SPIKE S2 confirms placement]:

```yaml
# sites/02-noha-modest/src/content/products/linen-wrap-abaya/index.yml
ar:
  id: p7k3mq                    # hidden, default {{uuid_short}}, i18n: false; used in carts and messages
  title: عباية لفّ كتان
  summary: كتان خفيف بلون الرمل، قصّة لفّ بحزام، مناسبة للدوام والمشاوير.
  description: |
    …
  price: "28.500"               # number widget, value_type float/string, step 0.01 (C26); i18n: false
  compareAt: ""
  category: everyday            # relation → categories; i18n: false
  tags: [linen, summer]
  sizes: [s, m, l, xl]          # fashion.sizes pack → settings/sizes.json ids
  lengths: [54, 56, 58]
  availability: in_stock
  images:                       # list, i18n: false; flat alt_ar/alt_en (Decap-safe) → normalised to ImageRef.alt {ar,en}
    - { src: ./front.webp, alt_ar: "", alt_en: "" }   # empty alt falls back to "<title> — صورة ١"
    - { src: ./back.webp }
en:
  title: Linen Wrap Abaya
  summary: Light sand-coloured linen, a belted wrap cut for work and errands.
  description: |
    …
```

**Page (Markdown, `multiple_files`):**

```
src/content/pages/shipping/index.ar.md     --- title: الشحن والتوصيل / description: … --- (body in formal MSA)
src/content/pages/shipping/index.en.md
```

**Settings (JSON, one file per singleton):** see §5.4 and §5.8.

### 6.3 Astro side

```ts
// packages/content/src/collections.ts (sketch)
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const folderPerEntry = (name: string, opts: { deferRender?: boolean } = {}) =>
  glob({
    pattern: '*/index.yml',
    base: `./src/content/${name}`,
    generateId: ({ entry }) => entry.split('/')[0]!,   // folder name = ASCII slug = URL slug
    ...opts,
  });

export function defineCollections(site: SiteConfig) {
  const r = resolvePreset(site);
  const big = site.commerce?.largeCatalog === true;    // 150+ items (site 03) → deferRender [AN §6]; never key on a site id
  return Object.fromEntries(r.collections.map((c) => [c.name, defineCollection(
    c.format === 'yaml'  ? { loader: folderPerEntry(c.name, { deferRender: big }), schema: ({ image }) => entrySchema(c, site, image) } :
    c.format === 'md'    ? { loader: glob({ pattern: '*/index.*.md', base: `./src/content/${c.name}`,
                                            generateId: ({ entry }) => entry.replace(/\/index\.(ar|en)\.md$/, '.$1') }),
                             schema: ({ image }) => pageSchema(c, image) } :
    /* json singletons */  { loader: glob({ pattern: '*.json', base: './src/content/settings' }), schema: settingsSchema(r) },
  )]));
}
```

- **Schemas are generated from the same field-pack definitions as the CMS config**, so the CMS and Astro cannot drift. `entrySchema()` builds:

  ```ts
  z.object({ ar: Full, en: Translated })
  ```

  Money fields go through `parseDecimal(str, currency)`, and images through `image()`. A missing image fails the build, which is desirable [AN §6].
- **`localise(data, lang)`** returns the page-language view:

  ```ts
  lang === 'ar' ? data.ar : { ...pick(data.ar, nonI18nKeys), ...data.en }
  ```

  It is typed per collection, so components never touch `data.en` directly.
- **Strictness depends on the build context:**
  - `AW_STRICT_CONTENT=1` is set in `[context.production.environment]`. There, a missing English field, an off-step price or an uncovered glyph **fails the build**.
  - Deploy previews and branch builds run lenient: an Arabic-only draft builds, and the page shows a small "الترجمة الإنجليزية ناقصة" badge on English pages. This satisfies "Astro schemas must tolerate draft entries" [CMS §3.3] without shipping incomplete English to production.
- **No `i18n.fallback`.** English completeness is enforced; nothing is silently filled in [AN §5.1].
- **Server data.** During dev and build, the integration writes `.aw/server-data.json`, the catalog prices/options and all settings rules that functions need. It is produced by `buildServerData()`, which reads the same files with the same schemas, minus image resolution. Function wrappers import it, so esbuild bundles it into the function, and functions **never trust client prices**.

### 6.4 i18n structure summary

| Kind | Structure | Why |
|---|---|---|
| Entries | `single_file` YAML (`ar:` / `en:`) | One file per entry. Media stays entry-relative for both languages. Decap-readable. Avoids `multiple_folders`, which breaks relative images [CMS §3.5] |
| Long pages | `multiple_files` Markdown | Real Markdown bodies rendered by Astro. Both files share the folder's media |
| Settings | No i18n; inline `{ar, en}` | Flat JSON for rebrand and scripts; both languages visible together for short strings |
| CMS config | `i18n: { structure: single_file, locales: [ar, en], default_locale: ar }` at top level; overridden to `multiple_files` on `pages`; `i18n: false` on settings | |
| Required-ness | `required: [ar]` on translatable fields | The owner can save Arabic first. check-all enforces English for production [CMS §3.5] |

### 6.5 Images: storage and optimisation path

```
owner's phone photo (HEIC / JPEG / PNG, ≤ 8 MB)
  → Sveltia upload transform (in the browser): WebP q85, ≤ 2048 px (HEIC → WebP q82 ≤ 1600 px), EXIF/GPS stripped, SVGO for SVG
  → committed beside the entry: src/content/products/<slug>/front.webp     (media_folder: '', public_folder: '')
  → Astro build: image() validates the path (missing = build error)
  → <Picture formats={['avif','webp']} layout="constrained" widths=[…] sizes=…> via sharp
  → dist/_astro/<hash>.avif|webp   (Cache-Control: immutable)
  → product og:image: getImage() 1200×630 JPEG q80, < 300 KB (WhatsApp previews)
```

- **Only the LCP hero gets `priority`.** Everything else is lazy, with explicit width and height (Astro emits them) [AN §7].
- **Settings images** (home hero, share image) live in `src/content/settings/media/`. The CMS stores them as `./media/<file>` relative to the JSON [SPIKE S2].
- **Brand assets** (logo, favicon, OG) stay in `brand/` and are copied to `public/`. They are already optimised SVG/PNG.
- **Site 03 build time:**
  - 150+ products × widths × 2 formats is dominated by AVIF encoding.
  - Grid thumbnails use `formats={['webp']}` with widths `[320, 640]`. AVIF goes only to the hero and the product page's main image.
  - Measure in the pilot against Netlify's build time limit (15 minutes by default [A]).
  - Persist `node_modules/.astro` between builds if needed [AN §7].
- **Size policy** (check-all):
  - Committed uploads above 800 KB trigger a warning.
  - Any image referenced from `public/` inside content fails the build.
- **Stock photography.** `pnpm images:grade <site>`:
  1. Takes originals from `sites/NN/.source-images/` (gitignored).
  2. Applies the brand's `photo.grade` with sharp (one colour grade per site, as the brief requires).
  3. Writes WebP files into the content folders.
  4. Appends the source URL, author and licence to `sites/NN/images.lock.json`.

  `docs/image-credits.md` is generated from those lock files.

### 6.6 Sveltia config generated per site (excerpt)

```yaml
# sites/02-noha-modest/public/admin/config.yml   GENERATED by pnpm site:sync — do not edit
backend:
  name: github
  repo: <you>/arabic-websites          # monorepo; after `pnpm extract`, the client's own repo
  branch: main
  skip_ci: true                        # demo monorepo only: CMS commits never auto-deploy (C1)
app_title: نُهى · إدارة المحتوى
logo: { src: /favicon.svg }            # the logo mark, copied to public/ by site:sync
site_url: https://noha-modest-demo.netlify.app
media_libraries:                       # shape per [CMS §3.6]
  all:
    max_file_size: 8000000
    slugify_filename: true
    transformations:
      raster_image: { format: webp, quality: 85, width: 2048, height: 2048 }
      heic: { format: webp, quality: 82, width: 1600, height: 1600 }
      svg: { optimize: true }
i18n: { structure: single_file, locales: [ar, en], default_locale: ar }
collections:
  - name: products
    label: المنتجات
    label_singular: منتج
    folder: sites/02-noha-modest/src/content/products     # repo-relative (monorepo prefix handled by the generator)
    path: '{{slug}}/index'
    extension: yml
    format: yaml
    slug: '{{fields._slug}}'
    media_folder: ''
    public_folder: ''
    i18n: true
    summary: '{{title}} — {{price}} د.ب'
    fields:
      - { name: id, widget: hidden, default: '{{uuid_short}}', i18n: false }
      - { name: _slug, label: رابط المنتج بالإنجليزي, widget: string, i18n: false,
          hint: 'حروف إنجليزية صغيرة وأرقام وشرطات فقط، مثل linen-wrap-abaya. لا يُغيَّر بعد النشر.',
          pattern: ['^[a-z0-9]+(-[a-z0-9]+)*$', 'يُسمح بالحروف الإنجليزية الصغيرة والأرقام والشرطة فقط'] }
      - { name: title, label: اسم المنتج, widget: string, i18n: true, required: [ar] }
      - { name: price, label: السعر, widget: number, value_type: float/string, step: 0.01, min: 0,
          after_input: د.ب, i18n: false, hint: 'بالدينار البحريني، مثل 28.500. الفلوس بمضاعفات 10.' }
      # … field packs: sizes, lengths, availability, images, category (relation), description (markdown, i18n)
```

Rules for the generator:
- **Arabic labels use neutral phrasing** (passive voice or nouns), because owners can be women or men.
- **Settings collections** get `i18n: false`.
- `publish_mode: editorial_workflow` is added **per collection** in client repos (D4).
- `preview_path` is added only when deploy previews are enabled.

`public/admin/index.html` loads:
1. The Arabic pre-seed script [CMS §3.7].
2. `<script src="https://unpkg.com/@sveltia/cms@0.218.3/dist/sveltia-cms.js">`.
3. An `nc-root` header link "لوحة الطلبات" → `/owner/`, on full-tier sites.

### 6.7 What each actor can change

| Change | Where | Deploy needed? |
|---|---|---|
| Add a product, change a price, upload a photo, edit a page | CMS | Yes: a commit, then a build (1–3 min) |
| Change hours, delivery fees, zones or caps; add a blackout | CMS | Yes |
| Close today / tomorrow (full tier), set a stock count, change an order status | `/owner/` | **No** (runtime store) |
| Brand palette, fonts, logo, layout, provider | Code (`pnpm rebrand`, `site.config.ts`) | Yes |
| Payment keys, mode | Netlify env | Redeploy of functions |

### 6.8 CMS authentication (per D2)

| Who | How |
|---|---|
| **You** (demo monorepo and client repos) | GitHub OAuth through Netlify's OAuth provider, or "Sign in with Token" (PAT) |
| **Clients** | A GitHub account (free), an accepted collaborator invite on *their* repo, then "Sign in with GitHub". One GitHub OAuth App is shared across sites (callback `https://api.netlify.com/auth/done`), with its Client ID/Secret set per Netlify site [CMS §3.2; SPIKE S13]. `docs/cms-guide-ar.md` covers creating the account, 2FA with GitHub Mobile, and accepting the invite |
| **Fallback** | Deploy one Sveltia CMS Authenticator Worker on Cloudflare and set `backend.base_url` (a site that leaves Netlify). A client who refuses GitHub gets Decap + Decap Turbo, with `@aw/cms` `target: 'decap'` |

---

## 7. Theming and the brand token pipeline

### 7.1 Pipeline

```
brand/tokens.ts ──(pnpm site:sync)──► src/styles/tokens.css     :root { --brand-* }  (+ :lang(en) overrides)
                                         │
packages/brand/theme.css ── @theme inline { --color-surface: var(--brand-surface); … }   (semantic tokens → utilities)
                                         │
sites/NN/src/styles/site.css ── @import "tailwindcss"; @import "@aw/brand/theme.css"; @import "./tokens.css"; @source "../../../../packages";
                                         │
components use ONLY semantic utilities: bg-surface text-ink border-hairline bg-accent text-accent-ink font-display rounded-card …
```

```css
/* packages/brand/src/theme.css (excerpt) */
@theme { --color-*: initial; --font-*: initial; --radius-*: initial; --shadow-*: initial; }   /* no stray defaults such as bg-blue-500 */
@theme inline {
  --color-surface: var(--brand-surface);       --color-surface-alt: var(--brand-surface-alt);
  --color-ink: var(--brand-ink);               --color-ink-muted: var(--brand-ink-muted);
  --color-hairline: var(--brand-hairline);     --color-accent: var(--brand-accent);
  --color-accent-ink: var(--brand-accent-ink); --color-highlight: var(--brand-highlight);
  --color-danger: var(--brand-danger);         --color-success: var(--brand-success);  --color-focus: var(--brand-focus);
  --font-display: var(--brand-font-display);   --font-body: var(--brand-font-body);
  --radius-control: var(--brand-radius-control); --radius-card: var(--brand-radius-card); --radius-image: var(--brand-radius-image);
  --shadow-card: var(--brand-shadow-card);
}
```

```css
/* sites/02-noha-modest/src/styles/tokens.css  GENERATED */
:root {
  --brand-surface: #F4EFE8; --brand-ink: #2B2622; /* … */
  /* Latin-first stacks: Latin words take the paired Latin face, Arabic falls through to the Arabic face [FONT §A5] */
  --brand-font-display: var(--font-latin-display), var(--font-ar-display), serif;
  --brand-font-body: var(--font-latin-body), var(--font-ar-body), sans-serif;
  --brand-lh-body: 1.85; --brand-lh-heading: 1.35;
  --brand-latin-scale: 1.06;
}
:root:lang(en) { --brand-lh-body: 1.6; --brand-lh-heading: 1.2; }
:lang(en) .tracking-caps { letter-spacing: 0.08em; }       /* never tracking on Arabic */
```

`site:sync` refuses to generate if `checkContrast(tokens)` fails WCAG AA. It checks:
- ink on surface and on surfaceAlt: ≥ 4.5
- inkMuted on surface: ≥ 4.5
- accentInk on accent: ≥ 4.5
- focus against the surfaces: ≥ 3
- hairline against surface: ≥ 1.5, since it is decorative

### 7.2 Fonts: self-hosted subsets through the Astro Fonts API (DECIDED)

- **`awSite()` generates the `fonts` array from the tokens.** Each role gets `fontProviders.google()` with:
  - `subsets: ['arabic']` for Arabic roles and `['latin']` for Latin roles,
  - only the weights in use,
  - `optimizedFallbacks`,
  - CSS variables `--font-ar-display`, `--font-ar-body`, `--font-latin-display` and `--font-latin-body`.

  Files are downloaded at build and served from `/_astro/fonts/`, so no Google origins appear in the CSP [AN §11.4, FONT §A6].
- **Rejected: Google's hosted CSS.** It costs two extra origins (DNS + TLS), a render-blocking stylesheet and third-party requests, which hurts LCP on 4G.
- **Preload exactly one file per page:**
  - The Arabic display face on Arabic pages. The Latin display face on English pages.
  - Only the weight used above the fold, via `<Font cssVariable=… preload />` filtered to that file [SPIKE S11].
  - Body faces are not preloaded. `font-display: swap` plus metric-matched fallbacks keep CLS near zero.
- **Font budget ≤ 120 KB per page.** Prefer static weights over variable fonts when a site uses at most two weights [FONT §A6]. check-all measures it.
- **Coverage gates**, run in check-all and at `rebrand --fonts`:
  - The body and price face must cover U+0660–0669 and U+066B/U+066C when `numberingSystem: 'arab'`.
  - Every site's content corpus must be covered by its fonts.
  - Readex Pro and Tajawal are rejected for Iraqi and Kuwaiti sites.
  - Zain is rejected with `'arab'`, because its Arabic-Indic digits look Western.
  - The Saudi Riyal is rendered as an inline SVG icon with `aria-label="ريال سعودي"`, or as the text "ر.س". Only 4 fonts have U+20C1 [FONT §A3].

### 7.3 Logo and OG pipeline (authoring time; outputs committed)

`pnpm brand:render <site>` (also run by new-site and rebrand):
1. `fonts:fetch` downloads the TTFs from google/fonts at SHA `e44c4b011a820c2cbe2fd2cfa8052037d7edb571` into `.cache/fonts`, with OFL and recorded sha256.
2. `harfbuzzjs` + `bidi-js` shape the text into paths, applying `logo.json.features`, e.g. Reem Kufi `cv01`, Qahiri `ss01` [FONT §B2].
3. The lockup templates are `stacked`, `inline` and `mark-only`. Clear space = k × alef height.
4. Output: `logo.svg`, `logo-light.svg`, `logo-dark.svg`, `logo-mark.svg`, `favicon.svg` (svgo; no `<text>`; `<title>` in Arabic and Latin).
5. The same paths compose `og.svg` (1200×630, margins ≥ 64 px). `@resvg/resvg-wasm` rasterises it to `og.png` (< 300 KB) and to `apple-touch-icon.png` (180×180).

Hard rules:
- Validate glyph coverage before shaping, and fail rather than draw `.notdef` boxes.
- Wrap numbers and Latin names in LRI…PDI isolates.
- Monochrome siblings only (no Ink/Fun colour fonts).
- Never use satori, opentype.js or resvg `<text>` [FONT §B5].

### 7.4 Same components, structurally different sites

Distinctness comes from **three layers of configuration**, never from forks:

1. **Tokens:** palette, type pairing, radius, rhythm, motion and photo grade.
2. **Layout config** (`site.config.ts → layout`). Every choice is a variant name from `@aw/ui`:

| Slot | Variants (initial library; add variants to packages, never to sites) |
|---|---|
| `hero` | `full-bleed-photo`, `split-editorial`, `asymmetric-collage`, `product-spotlight`, `lookbook-strip`, `menu-board`, `calendar-first`, `portfolio-mosaic`, `estimate-builder`, `cutoff-countdown`, `typographic-statement`, `arch-frame` |
| `nav` | `bar-start-logo`, `bar-centered-logo`, `bottom-tabs`, `minimal-sheet` |
| `categoryEntry` | `story-rings` (photo circles, like Instagram highlights), `pill-scroller`, `tile-grid`, `text-index`, `tabs` |
| `productCard` | `portrait-minimal`, `square-caption`, `overlay-caption`, `menu-row`, `swatch-card` |
| `grid` | `two-col`, `one-col-large`, `masonry`, `list` |
| `imageShape` | `rect`, `portrait`, `arch`, `soft`, `circle-crop` |
| `productPage` | `gallery-sticky`, `stacked-full-bleed`, `carousel-top` |
| `whatsapp` | `floating-pill`, `bottom-bar`, `inline-only` |
| `footer` | `columns`, `centered-mark`, `band` |
| `sectionVariants` | Per section id, e.g. `reviews: quote-rail \| card-stack \| single-large`, `faq: accordion-plain \| two-column` |
| `signature` | One signature element per site from the design plan: a named component in `@aw/ui/signature/*`, e.g. `notes-pyramid`, `wrapper-preview`, `cutoff-clock`, `fabric-swatch-strip`, `mirror-arch-frame` |

3. **Home composition** (`settings/home.json`): the owner orders and hides sections from the preset's allowed list.

Rules:
- A variant is a complete component with **complete class strings**. Never build class names dynamically [AN §11.2].
- Components accept `variant` props and content, and nothing brand-specific.
- **Distinctness check** (warning level): check-all compares every pair of sites on accent/surface colour (ΔE), font families, hero, nav, card and category-entry variants. It flags any pair that matches on more than two of those dimensions, so "swap two logos and nobody notices" is caught mechanically.

---

## 8. i18n and RTL

### 8.1 Routing

- Astro config:

  ```ts
  i18n: { locales: ['ar', 'en'], defaultLocale: 'ar', routing: { prefixDefaultLocale: false } }
  ```

  with `trailingSlash: 'always'` and `build.format: 'directory'` [AN §5.1].
- Arabic is at `/…/`, English at `/en/…/`, with the **same ASCII slug**. Switching language is a pure prefix swap.
- **Engine pages are injected by the `@aw/astro` integration** with rest-param patterns such as `/[...lang]/products/[slug]`, where `getStaticPaths` emits `lang: undefined` for Arabic and `'en'` for English [SPIKE S7]. Fallback if S7 fails: `site:sync` generates 3-line page files under `sites/NN/src/pages/`, each importing the package page. They are still generated and never hand-edited.
- Every page emits:
  - `<html lang="ar" dir="rtl">` or `<html lang="en" dir="ltr">`,
  - `hreflang` links for `ar-XX`, `en` and `x-default` (→ Arabic),
  - `og:locale` for the country (`ar_BH`, `ar_KW`, `ar_SA`, `ar_IQ`) plus `og:locale:alternate` `en_US`.

### 8.2 Persistence: `?lang=en` and the saved preference

- The blocking `is:inline` head script from [AN §5.2] runs on every page, and its SHA-256 is fed to Astro's CSP. It:
  - reads `?lang=ar|en`,
  - saves the choice to `localStorage['aw.lang']` (every access in try/catch),
  - writes or clears the `lang_en` presence cookie,
  - strips `lang` while keeping `utm_*`, `fbclid` and `igsh`,
  - `location.replace()`s to the other prefix only when the saved preference disagrees with the current URL.
- **The toggle** is a plain link to the counterpart URL, with a small click handler that saves the preference the same way.
- **Crawlers** carry no preference, so they are never redirected. Canonicals point at clean URLs.
- **Never auto-redirect on Accept-Language.**
- **The same script** also sets `html.dataset.demoDismissed` from localStorage, so the dismissed demo banner is hidden before first paint (no CLS).

### 8.3 Mirroring rules (enforced by lint and review)

- **Logical utilities only:**
  - `ps/pe/ms/me`, `inset-s/inset-e`, `text-start/end`, `border-s/e`, `rounded-s/e/ss/se/es/ee`.
  - The check-all lint fails on `ml- mr- pl- pr- left- right- start- end- text-left text-right rounded-l rounded-r border-l border-r` in `packages/**` and `sites/**`.
  - Exceptions carry an `/* aw-physical: reason */` comment [AN §11.3].
- **Directional icons flip; meaningful icons don't:**
  - Flip with `rtl:-scale-x-100`: arrows, chevrons, "back", progress and breadcrumb separators.
  - Never flip: logos, check marks, media play, the WhatsApp glyph, clocks or charts.
- **Carousels and scroll-snap strips** follow `dir`: the first item sits at the inline start, and the prev/next buttons swap. Swipe gestures use `dir`-aware deltas. There is no autoplay.
- **Forms:**
  - Phone and card-like inputs use `dir="ltr"`, `inputmode="tel"` and `autocomplete="tel"`, and are aligned to the inline end in Arabic.
  - Free text uses `dir="auto"`, because names may be Latin.
  - Numbers typed with Arabic-Indic or Persian digits are normalised on input and on the server.
- **Bidi isolation:**
  - Phone numbers, order ids, SKUs, prices next to Latin text, and Latin brand names inside Arabic go in `<bdi>` or `<span dir="ltr">`.
  - Inline English carries `lang="en"`.
  - WhatsApp text uses LRM (U+200E) before `+` phone numbers.
- **Layout mirroring is tested, not assumed.** The check-all RTL smoke test checks:
  - `dir` and `lang` attributes,
  - no horizontal overflow at 390 px and 1440 px,
  - the first nav item at the right edge in Arabic and the left edge in English,
  - that the WhatsApp FAB sits at the configured inline end,
  - that breadcrumb order is reversed.

### 8.4 Numbers, currency and dates

- **Money:** `formatMoney(m, lang, locale)` converts minor units to an exact decimal *string* with integer maths, then calls:

  ```ts
  Intl.NumberFormat(bcp47, { style: 'currency', currency, numberingSystem, minimumFractionDigits: exp, maximumFractionDigits: exp }).format(decimalString)
  ```

  `Intl` accepts exact decimal strings, so **nothing is ever rounded in the UI**. Verified outputs on this machine:
  - `‏٣٨٫٥٠٠ د.ب.‏` (ar-BH)
  - `‏38.500 د.ب.‏` (ar-BH, `nu-latn`)
  - `‏٤٥٬٠٠٠ د.ع.‏` (ar-IQ)
  - `‏٣٥٠٫٠٠ ر.س.‏` (ar-SA)

  SAR can swap the symbol for the riyal SVG icon (§7.2).
- **Numbering:** Arabic UI uses `locale.numberingSystem` (default `arab`); English is always `latn`. Phone numbers are always Latin digits.
- **Locale-correct month names:** `ar-IQ` prints Levantine/Iraqi month names ("٢٤ أيلول"); `ar-BH`/`ar-SA` print "٢٤ سبتمبر". Always format with the full `bcp47` (`ar-IQ`), never plain `ar`.
- **Plurals:** `Intl.PluralRules('ar')` gives `zero/one/two/few/many/other`. Dictionary entries that count things provide all six forms, e.g. قطعة / قطعتان / ٣ قطع / ١١ قطعة.
- **Hijri** is display-only:

  ```ts
  Intl.DateTimeFormat(`${bcp47}-u-ca-islamic-umalqura`, …)
  ```

  For example, 2026-09-24 → "١٣ ربيع الآخر ١٤٤٨ هـ".
  - Shown next to Gregorian dates in booking pickers and confirmations when `hijri.show` allows.
  - Labelled "تقريبي" on BH/KW sites, where local moon sighting may differ by a day.
  - **Ramadan and Eid dates are never computed.** They are CMS data (`seasons`, `windows`, `exceptions`) flagged `approximate`.
- **Time zones:**
  - Every date and time rule is evaluated in `locale.timeZone` (`Asia/Bahrain`, `Asia/Kuwait`, `Asia/Riyadh` or `Asia/Baghdad`) through `Intl`-based helpers in `@aw/core/time`.
  - Nothing reads the machine's zone. Unit tests run with `TZ=UTC` and `TZ=America/Los_Angeles` to prove it.
  - All four zones are UTC+3 without DST today, but nothing hard-codes +3, so site 14 in Egypt (with DST) still works.
  - **Anything relative to "now"** (open now, earliest delivery date, same-day cutoff, seasonal section visibility, booking-window opening, the 1-day notice on site 07) **is computed in the browser at runtime** and re-checked by functions. Static HTML shows neutral content, such as the weekly hours table, never a stale "open now".

### 8.5 Hours that cross midnight

- A `TimeRange` whose `close ≤ open` ends on the next calendar day. `'00:00'–'00:00'` means 24 hours.
- A range **belongs to the business day it opens on**. So 14:00–02:00 on Thursday covers Thursday 14:00 to Friday 02:00.
- `isOpenAt(instant)` checks two things:
  - today's ranges, `[open, close + 1440 if cross-midnight)`,
  - **yesterday's** cross-midnight ranges, which carry over into today's early hours.
- Booking slots use business-day minutes that may exceed 1440. For example, 00:30 on Friday morning belongs to Thursday's business day as minute 1470.
  - It is stored as an ISO instant plus `businessDate`.
  - Daily caps count per `businessDate`.
  - It is displayed as "الخميس ٢٤ سبتمبر · ١٢:٣٠ بعد منتصف الليل (فجر الجمعة)".
- Seasons override `weekly`, and exceptions override both.
- Validation:
  - ranges within a day must not overlap,
  - a cross-midnight close must be ≤ the next day's first open,
  - at most 2 ranges per day.
- **JSON-LD:** `OpeningHoursSpecification` with `closes` earlier than `opens` means the range spans the next day under schema.org semantics, so it is emitted as-is.

### 8.6 Dictionaries, dialect and address

- `@aw/i18n` holds:
  - `base/ar.ts` (neutral Arabic UI),
  - `base/en.ts`,
  - `overlays/<dialect>.ts` (marketing microcopy and WhatsApp greetings),
  - `overlays/audience-women.ts` (feminine imperatives).
- **Lookup order:** site overrides (`settings/home.json` hero CTA text) → dialect + audience overlay → base.

| Key | Base (neutral) | khaleeji-bh + women | iraqi + women | en |
|---|---|---|---|---|
| `cart.add` | أضف إلى السلة | أضيفي للسلة | ضيفي للسلة | Add to bag |
| `cta.orderWhatsapp` | اطلب عبر واتساب | اطلبي على الواتساب | اطلبي عالواتساب | Order on WhatsApp |
| `wa.greeting` | مرحباً | هلا | هلو | Hello |

- **Policy and legal pages are always formal MSA** (`pages/*` content).
- **Dialect content** (product copy, about, FAQs) is written per site in the content files. The dictionary overlays cover only interface microcopy.
- Native-speaker review of every dialect is a risk item (§14.3).

---

## 9. Money and payments

### 9.1 The `Money` type and currency table

```ts
// packages/core/src/money.ts
export const CURRENCIES = {
  BHD: { exponent: 3, cmsStep: '0.010', isoMinor: 3 },
  KWD: { exponent: 3, cmsStep: '0.010', isoMinor: 3 },
  OMR: { exponent: 3, cmsStep: '0.010', isoMinor: 3 },
  JOD: { exponent: 3, cmsStep: '0.010', isoMinor: 3 },
  SAR: { exponent: 2, cmsStep: '0.01',  isoMinor: 2 },
  AED: { exponent: 2, cmsStep: '0.01',  isoMinor: 2 },
  QAR: { exponent: 2, cmsStep: '0.01',  isoMinor: 2 },
  IQD: { exponent: 0, cmsStep: '250',   isoMinor: 3 },   // DELIBERATE deviation from ISO 4217 (C25)
} as const satisfies Record<CurrencyCode, { exponent: 0 | 2 | 3; cmsStep: string; isoMinor: number }>;
```

- `Money = { minor, currency }`, with `minor` a safe integer. **Every** arithmetic function asserts the currencies match and `Number.isSafeInteger`.
- `parseDecimal("28.500", "BHD") → 28500`. It works on strings only, never floats:
  - It rejects more decimals than the exponent allows (`"28.5005"`).
  - When `AW_STRICT_CONTENT=1`, it also rejects off-step values (`"28.505"` for BHD, `"45100"` for IQD).
- `toDecimalString({minor: 28500, currency: 'BHD'}) → "28.500"`, by integer division and zero-padding.
- **Rounding happens in exactly one place:** `allocateBps(m, bps, mode)` in `@aw/core`, used for percentage deposits, VAT display breakdowns and percentage offers. `mode` is `'up-to-step'` (deposits, rounded up to `roundUpTo`) or `'half-up'` (VAT breakdown). Allocation preserves the total (deposit + balance === total). **The UI never rounds**; it only formats `Money`.
- **Totals:** `sum(lines) + shipping + codFee + giftWrap - discounts - giftCard`, all integer operations.
- **Tax:** prices are VAT-inclusive where applicable (SA 15%, BH 10%). The checkout shows "الأسعار شاملة ضريبة القيمة المضافة", plus the included VAT amount on the order summary. ZATCA e-invoicing for Saudi live clients is a go-live checklist item, not v1 scope.

### 9.2 Payment flow (full tier)

```
checkout page ──POST /api/quote────► authoritative priced order (server-data prices; never client prices)
             ──POST /api/checkout──► OrderStore.create(order: pending_payment | placed-COD)
                                     provider.createPaymentSession(payable) → PaymentAttempt stored
             ◄── { redirectUrl } ──  browser → gateway (or /pay/credimax/ interstitial, /pay/mock/)
gateway ──► /pay/return/?s=<sessionId>&<provider params>  (static page, island)
             ──GET /api/pay/status?s=…──► provider.verifyPayment(sessionId, { returnParams })  (re-fetch)
                                          → order.attachPayment(status) → state machine → notify
gateway ──► POST /api/pay/webhook/<provider> ──► provider.handleWebhook(req) → EventLog dedupe → same transition
```

- Both paths (the return page and the webhook) converge on one **idempotent** transition function:
  - `paid` is applied once.
  - Late or duplicate events are ignored.
  - An amount or currency mismatch sets `needs_attention`, never `paid`.
- COD skips the gateway. `createPaymentSession` returns `redirectUrl = /order/?o=…&t=…` immediately, and the order is `placed`.

### 9.3 The provider interface (the brief's four methods, fully typed)

```ts
// packages/payments/src/types.ts
export type PaymentsMode = 'mock' | 'test' | 'live';

/** The `order` argument of createPaymentSession: what the gateway needs, nothing more. */
export interface PayableOrder {
  orderId: string;                         // 'NH-260923-7K3M' (or booking id 'MR-B-261010-Q8TD')
  siteId: string;
  purpose: 'order' | 'deposit' | 'balance' | 'gift_card';
  amount: Money;                           // what to charge NOW (total or deposit)
  description: I18nText;                   // ≤ 120 chars
  customer: { name: string; phone: E164; email?: string };
  lang: Lang;
  method?: PaymentMethodId;                // preselect on the gateway where supported (Tap source, MyFatoorah PaymentMethod)
  lines?: Array<{ name: string; qty: number; unit: Money }>;   // FastPay cart, PayTabs description
  returnUrl: string;                       // https://<site>/pay/return/  (adapter appends ?s=<sessionId>)
  cancelUrl: string;
  idempotencyKey: string;                  // `${orderId}:${attemptNo}`
}

/** ⊇ the brief's { redirectUrl, sessionId }. */
export interface PaymentSession {
  sessionId: string;                       // OURS: 'ps_' + 20 base32 chars; always present in the return URL
  redirectUrl: string;                     // gateway URL, or our interstitial '/pay/credimax/?s=…', or '/pay/mock/?s=…'
  providerRef?: string;                    // chg_…, InvoiceId/PaymentId, pay_…/hpp_…, tran_ref, MPGS session.id, FastPay order_id
  expiresAt?: string;                      // ISO instant
}

export type PaymentState =
  | 'pending' | 'requires_action' | 'authorized' | 'paid'
  | 'failed' | 'cancelled' | 'expired' | 'refunded' | 'partially_refunded';

export interface PaymentStatus {
  sessionId: string;
  orderId: string;
  provider: ProviderName;
  state: PaymentState;
  amount: Money;                           // as reported by the provider, converted back to Money
  amountMatches: boolean;                  // provider amount + currency === attempt amount
  providerRef?: string;
  method?: PaymentMethodId;
  failure?: { code: string; message: I18nText };
  checkedAt: string;                       // ISO instant of the provider API call
}

export type PaymentEventType =
  | 'payment.succeeded' | 'payment.failed' | 'payment.cancelled' | 'payment.expired'
  | 'refund.succeeded' | 'refund.pending' | 'refund.failed' | 'ignored';

export interface PaymentEvent {
  eventKey: string;                        // dedupe key: provider event id / X-Notification-ID / `${providerRef}:${state}`
  provider: ProviderName;
  type: PaymentEventType;
  sessionId?: string;
  providerRef?: string;
  authenticity: 'hmac' | 'shared-secret' | 'static-header' | 'jwt' | 'none';   // what we could verify (C29)
  status?: PaymentStatus;                  // ALWAYS from a fresh verifyPayment(), never from the payload
  duplicate: boolean;                      // set by the webhook handler (EventLog)
  receivedAt: string;
}

export interface RefundOptions { reason?: string; idempotencyKey?: string }
export interface RefundResult {
  refundId: string;                        // ours
  providerRef?: string;
  state: 'succeeded' | 'pending' | 'manual' | 'failed';   // 'pending': Checkout.com 202; 'manual': MyFatoorah finance queue
  amount: Money;
  failure?: { code: string; message: I18nText };
}

export interface VerifyContext {
  returnParams?: Record<string, string>;   // tap_id | paymentId | resultIndicator | tran_ref+signature | cko-payment-id | token (ZainCash) | order_id
}

export interface ProviderCapabilities {
  countries: CountryCode[];
  currencies: CurrencyCode[];
  methods: PaymentMethodId[];
  launch: 'redirect' | 'interstitial' | 'offline';
  webhookAuth: PaymentEvent['authenticity'];
  webhookOn: 'all' | 'success-only';
  refunds: 'sync' | 'async' | 'manual' | 'none';
  partialRefunds: boolean;
  amountWire: 'major-decimal' | 'minor-integer' | 'decimal-string' | 'integer-major';
}

/** The brief's interface. Names and positional arguments are kept; optional context and an injected store close the gaps (C20, C28, C29). */
export interface PaymentProvider {
  readonly name: ProviderName;
  readonly capabilities: ProviderCapabilities;
  createPaymentSession(order: PayableOrder): Promise<PaymentSession>;
  verifyPayment(sessionId: string, ctx?: VerifyContext): Promise<PaymentStatus>;
  handleWebhook(req: Request): Promise<PaymentEvent>;      // Functions v2 give a real Request, so raw body bytes are available
  refund(paymentId: string /* = sessionId of a paid attempt */, amount: Money, opts?: RefundOptions): Promise<RefundResult>;
}

export interface PaymentAttempt {
  sessionId: string; orderId: string; provider: ProviderName; purpose: PayableOrder['purpose'];
  amount: Money; state: PaymentState; providerRef?: string;
  secrets?: { successIndicator?: string };  // Credimax; never sent to the browser
  payer?: { msisdn?: E164 };                // FastPay refunds need it
  createdAt: string; updatedAt: string;
}
export interface PaymentAttemptStore {
  put(a: PaymentAttempt): Promise<void>;                    // onlyIfNew
  get(sessionId: string): Promise<PaymentAttempt | null>;
  update(sessionId: string, patch: Partial<PaymentAttempt>): Promise<PaymentAttempt>;  // ETag retry
  findByProviderRef(provider: ProviderName, ref: string): Promise<PaymentAttempt | null>;
}

export interface ProviderDeps {
  mode: PaymentsMode;
  env: Readonly<Record<string, string | undefined>>;
  attempts: PaymentAttemptStore;
  siteUrl: string;
  fetch: typeof fetch;                      // injectable for tests
  now: () => Date;
}
export type ProviderFactory = (deps: ProviderDeps) => PaymentProvider;
```

### 9.4 Registry and mode

```ts
// packages/payments/src/registry.ts
const factories: Record<ProviderName, () => Promise<ProviderFactory>> = {
  mock: () => import('./adapters/mock.js').then((m) => m.createMockProvider),
  cod: () => import('./adapters/cod.js').then((m) => m.createCodProvider),
  tap: () => import('./adapters/tap.js').then((m) => m.createTapProvider),
  myfatoorah: () => import('./adapters/myfatoorah.js').then((m) => m.createMyFatoorahProvider),
  moyasar: () => import('./adapters/moyasar.js').then((m) => m.createMoyasarProvider),
  paytabs: () => import('./adapters/paytabs.js').then((m) => m.createPayTabsProvider),
  checkout: () => import('./adapters/checkout.js').then((m) => m.createCheckoutComProvider),
  credimax: () => import('./adapters/credimax.js').then((m) => m.createCredimaxProvider),
  fastpay: () => import('./adapters/fastpay.js').then((m) => m.createFastPayProvider),
  zaincash: () => import('./adapters/zaincash.js').then((m) => m.createZainCashProvider),
};

export async function getProvider(name: ProviderName, deps: ProviderDeps): Promise<PaymentProvider>;
```

- **`PAYMENTS_MODE` env** accepts `mock`, `test` or `live`; **unset means `mock`**.
- **In `mock` mode, `getProvider(site.payments.provider)` returns MockProvider** wearing that provider's `capabilities`. The demo therefore shows the right methods and flow (for example the Credimax interstitial), but no network calls are made.
- **In `live` mode, each adapter refuses to start with credentials that look like test ones:**
  - `sk_test_` (Tap, Moyasar)
  - `sk_sbox_` or `.sandbox.` (Checkout.com)
  - `apitest.` (MyFatoorah)
  - a merchant id starting `TEST` (Credimax)
  - `staging-` (FastPay)
  - `uat` or `test.` (ZainCash)

  PayTabs cannot be detected from its keys, so it requires `PAYTABS_PROFILE_KIND=live` [PAY §11.6].
- `live` also requires `SESSION_SECRET`, a non-`outbox` mailer, and `ORDER_STORE` other than `memory` (our rule).

### 9.5 Method availability matrix (data in `@aw/payments/methods.ts`)

Method rules by currency:

| Method | Rule |
|---|---|
| `knet` | KWD |
| `benefit` and `benefitpay` | BHD |
| `mada` and `stc_pay` | SAR |
| `omannet` | OMR |
| `qpay` | QAR |
| IQD | Only `cod`, `zaincash`, `fastpay`, and `card` through PayTabs-Iraq or Checkout.com |
| `apple_pay` | BHD, KWD, SAR, AED or QAR, and only on a hosted page (not in an iframe) |

Which providers offer which method (from [PAY §2]):

| Method | Tap | MyFatoorah | Moyasar | PayTabs | Checkout.com | Credimax | ZainCash | FastPay |
|---|---|---|---|---|---|---|---|---|
| card | yes | yes | yes | yes | yes | yes | — | — |
| mada | yes | yes | yes | yes | as card (KSA acquirer) | yes | — | — |
| apple_pay | yes | yes | yes | yes | yes | yes | — | — |
| knet | yes | yes | — | yes | yes | — | — | — |
| benefit (debit) | yes | unconfirmed | — | — | yes | yes (separate BENEFIT MID) | — | — |
| benefitpay (wallet) | SDK only (**deferred, D5**) | unconfirmed | — | unconfirmed | unconfirmed | — | — | — |
| stc_pay | yes (OTP API) | yes | yes | yes | yes | — | — | — |
| omannet / qpay | yes | account-dependent | — | omannet | qpay | — | — | — |
| zaincash / fastpay | — | — | — | — | — | — | zaincash | fastpay |

The resolved method list is:

```ts
availableMethods(locale, provider, wanted) = wanted ∩ currencyRule(locale.currency) ∩ provider.capabilities.methods
```

plus `cod` when `payments.cod` is set and the zone allows it.

- **The checkout renders at most two choices:**
  - "ادفع أونلاين", with neutral **text** badges for the methods: مدى، KNET، بنفت، Apple Pay, and so on. No trademark logo files in demos.
  - "الدفع عند الاستلام".
- Where the gateway supports preselection, the chosen method is passed through.

Resolved demo methods:

| Site | Methods |
|---|---|
| 02 | benefit, card, apple_pay, cod |
| 03 | card, apple_pay, benefit, cod |
| 04 | **cod** (preselected), fastpay |
| 05 | knet, card, apple_pay |
| 06 | benefit, card, apple_pay |
| 08 | mada, card, apple_pay, stc_pay |
| 09 | mada, card, apple_pay, stc_pay |
| 10 | mada, card, apple_pay, stc_pay |
| 12 | knet, card, apple_pay |

### 9.6 Adapters, env keys and Step-2 target level

- **L0** = typed stub, documented, and throws `NotImplemented` outside mock.
- **L1** = request builders, amount conversion, signature verification and status mapping, unit-tested against documented test vectors (no network).
- **L2** = verified against a real sandbox (needs your accounts; happens when a client signs).

Env names are our convention [PAY: "proposed"].

| Adapter | Launch | Verify with | Webhook authenticity | Refund | Env keys | Step 2 |
|---|---|---|---|---|---|---|
| `mock` | `/pay/mock/` | attempt store | HMAC (`MOCK_WEBHOOK_SECRET`, demo default) | sync/async by scenario | (none) | full |
| `cod` | offline → `/order/` | n/a (owner marks collected) | n/a | `manual` | (none) | full |
| `tap` | redirect (`transaction.url`), `src_all` or method source | `tap_id` → `GET /v2/charges/{id}` (only `CAPTURED` counts as paid) | `hashstring` HMAC-SHA256 hex, amount formatted to currency decimals | sync, partial | `TAP_SECRET_KEY`, `TAP_PUBLIC_KEY` (SDK only), `TAP_SOURCE_ID` | L1 |
| `myfatoorah` | redirect: v3 `POST /v3/payments` → `PaymentURL` | `paymentId` → `GET /v3/payments/{id}` | `MyFatoorah-Signature` HMAC-SHA256 base64 over ordered fields | v2 `MakeRefund`, account currency, **manual** | `MYFATOORAH_API_KEY`, `MYFATOORAH_REGION` (test, kw, ae, sa, qa, eg), `MYFATOORAH_WEBHOOK_SECRET` | L1 |
| `moyasar` | redirect: invoice `url` | `GET /v1/invoices/{id}` → payments | `secret_token` in body (shared secret) + `live` flag check | sync, partial (minor units) | `MOYASAR_SECRET_KEY`, `MOYASAR_WEBHOOK_SECRET_TOKEN` | L1 |
| `paytabs` | redirect (`redirect_url`), regional host | `tran_ref` → `POST /payment/query`; return POST signature | `Signature` HMAC-SHA256 hex of raw body | `tran_type: refund` | `PAYTABS_PROFILE_ID`, `PAYTABS_SERVER_KEY`, `PAYTABS_REGION`, `PAYTABS_PROFILE_KIND` | L1 |
| `checkout` | redirect (HPP `_links.redirect.href`) | `cko-payment-id` → `GET /payments/{id}` | `Cko-Signature` HMAC hex of raw body | **async (202)** | `CHECKOUT_SECRET_KEY`, `CHECKOUT_API_BASE` (MSSD), `CHECKOUT_PROCESSING_CHANNEL_ID`, `CHECKOUT_WEBHOOK_SIGNING_KEY` | L1 |
| `credimax` | **interstitial** `/pay/credimax/` (`checkout.min.js`, `Checkout.showPaymentPage()`) | `resultIndicator` === stored `successIndicator`, then Retrieve Order | static `X-Notification-Secret` header | `PUT …/transaction/{newId}` REFUND | `CREDIMAX_MERCHANT_ID`, `CREDIMAX_API_PASSWORD`, `CREDIMAX_API_VERSION=100`, `CREDIMAX_MERCHANT_NAME`, `CREDIMAX_NOTIFICATION_SECRET`, `CREDIMAX_GATEWAY_HOST` | L1 |
| `fastpay` | redirect (`redirect_uri`) | `order_id` → Validate API (amount + currency compared) | **none**; the notification is only a trigger to call Validate | needs customer msisdn + `refund_secret_key` | `FASTPAY_STORE_ID`, `FASTPAY_STORE_PASSWORD`, `FASTPAY_REFUND_SECRET_KEY`, `FASTPAY_API_BASE` | L1 |
| `zaincash` | redirect (v2 `redirectUrl`) | JWT on return + Inquiry API | unknown (production-only webhooks) | v2 reversal (unverified) | `ZAINCASH_CLIENT_ID`, `ZAINCASH_CLIENT_SECRET`, `ZAINCASH_SCOPE`, `ZAINCASH_API_BASE` | **L0**, built last [PAY §9] |

`toProviderAmount(m, provider)` has one tested rule per gateway:

| Gateway | Wire format | Example (28.500 BHD) |
|---|---|---|
| Tap, MyFatoorah | major decimal number | `28.5` |
| Tap hashstring | fixed-decimal string | `"28.500"` |
| Moyasar, Checkout.com | minor integer | `28500`; Checkout.com **asserts the last digit is 0** for 3-decimal currencies and sends IQD ×1000 |
| Credimax, PayTabs | decimal string | `"28.500"` |
| FastPay, ZainCash | integer IQD | — |

The webhook URL shape for `docs/payments.md` is `https://<domain>/api/pay/webhook/<provider>`. Gateways refuse localhost, so webhooks are tested on a deploy preview.

### 9.7 Webhook handling rules (every adapter)

1. **Read the raw body once** (`await req.arrayBuffer()`) and verify whatever authenticity the provider offers, using `crypto.timingSafeEqual`.
2. **Derive `eventKey`**, then run `EventLog.seen(eventKey)`. That is a Blobs `onlyIfNew` write. A duplicate returns HTTP 200 immediately, because Credimax retries up to 20 times and Tap only twice.
3. **Always re-fetch**, even when a signature is valid: `status = await verifyPayment(sessionId)`.
4. **Apply the idempotent order transition.**
5. **Respond 2xx fast.** Notifications are sent after the store write and never block the response.
6. **Unknown provider or failed authenticity:** return 401 and log. Never mutate state.

### 9.8 MockProvider behaviours (the default on every demo)

The `/pay/mock/?s=…` page:
- Shows "بوابة دفع تجريبية — لن يُخصم أي مبلغ".
- Shows the emulated provider's name in text only (no logos).
- Shows the amount and methods.
- Offers these outcomes:

| Outcome | Effect |
|---|---|
| **نجاح** (success) | `paid`, redirect to `/pay/return/` |
| **فشل** (failure) | `failed`, with a realistic reason ("رُفضت البطاقة", "رصيد غير كافٍ") |
| **إلغاء** (cancel) | `cancelled`, back to checkout with the cart intact |
| **انتهاء المهلة** (timeout) | Stays `pending`. The return page polls, then shows "لم نستلم تأكيد الدفع بعد" and becomes `expired` at `expiresAt` (demo: 2 min) |
| **Webhook options** | Deliver once, **deliver twice** (dedupe), **deliver out of order** (failed after paid is ignored), **delay 20 s** (return page wins), **never deliver** (return path only), **success-only** (FastPay emulation), **mismatched amount** (→ `needs_attention`) |
| **Emulations** | `resultIndicator` mismatch (Credimax), async refund 202 → `pending` → `succeeded` (Checkout.com), manual refund (MyFatoorah) |

Webhooks from the mock are real HTTP calls to `/api/pay/webhook/mock`, signed with HMAC, so the whole pipeline runs in demos. `pay-mock` returns 404 unless `PAYMENTS_MODE=mock`.

### 9.9 CashOnDelivery

- A provider with `launch: 'offline'` and `refunds: 'manual'`.
- Availability depends on:
  - `settings/fulfilment.json → cod`: `enabled`, `fee`, `maxOrder`, `scope` and per-zone `codAllowed`.
  - `payments.cod`.
- The order becomes `placed`. The owner changes it to `completed` ("تم التحصيل") in `/owner/`.
- **Site 04** preselects COD (`primary: 'cod'`). The checkout copy explains cash to the courier in Iraqi dialect, and the address form requires a **nearest landmark** (أقرب نقطة دالة).

---

## 10. Orders and bookings persistence (full tier)

### 10.1 Decision

**DECIDED, pending D3:**

- **Stores:**
  - `blobs`: Netlify Blobs, with `consistency: 'strong'` on every read and ETag conditional writes. Default for demos and small live clients.
  - `supabase`: optional, for clients who need reporting or large volumes.
  - `memory`: tests and local fallback.
- **Functions** are generated per site (§4.3) from handler factories in the packages. Their standalone `.mts` wrappers each carry a literal `config`:

```ts
// sites/02-noha-modest/netlify/functions/checkout.mts   GENERATED by pnpm site:sync
import { createCheckoutHandler } from '@aw/commerce/server';
import site from '../../site.config.ts';
import data from '../../.aw/server-data.json' with { type: 'json' };
export default createCheckoutHandler(site, data);
export const config = { path: '/api/checkout', method: 'POST', rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
```

(`rateLimit` on standalone functions is SPIKE S14. The fallback is a Blobs counter.)

### 10.2 Interfaces

```ts
// packages/commerce/src/server/store.ts
export type OrderStatus =
  | 'pending_payment' | 'payment_failed' | 'placed' | 'paid' | 'confirmed' | 'preparing'
  | 'ready_for_pickup' | 'out_for_delivery' | 'shipped' | 'completed' | 'cancelled'
  | 'refunded' | 'partially_refunded' | 'needs_attention';

export interface Order {
  id: string; siteId: string; createdAt: string; lang: Lang;
  customer: { name: string; phone: E164; email?: string };
  lines: Array<{ productId: string; title: I18nText; selection: Record<string, string>; qty: number; unit: Money; total: Money }>;
  fulfilment:
    | { kind: 'delivery'; zoneId: string; address: Record<string, string>; date?: LocalDate; slotId?: string }
    | { kind: 'shipping'; country: GccCountry; address: Record<string, string> }
    | { kind: 'pickup'; branchId: string; date?: LocalDate };
  pricing: { subtotal: Money; discounts: Money; shipping: Money; codFee?: Money; giftWrap?: Money;
             giftCard?: { code: string; applied: Money }; vatIncluded?: Money; total: Money };
  payment: { provider: ProviderName; method?: PaymentMethodId; sessionId?: string; state: PaymentState | 'cod' };
  status: OrderStatus;
  history: Array<{ at: string; from: OrderStatus; to: OrderStatus; by: 'system' | 'owner' | 'webhook'; note?: string }>;
  notes?: string; giftMessage?: string;
  source?: { utm?: Record<string, string>; referrer?: string };
  viewToken: string;                        // HMAC(orderId): /order/?o=…&t=… (no enumeration)
  demo: boolean;
}

export interface OrderStore {
  create(order: Order): Promise<Order>;                                   // onlyIfNew on o/<id>
  get(id: string): Promise<Order | null>;
  list(q: { from?: LocalDate; to?: LocalDate; status?: OrderStatus[]; cursor?: string; limit?: number }):
    Promise<{ items: OrderSummary[]; cursor?: string }>;
  transition(id: string, to: OrderStatus, by: Order['history'][number]['by'], note?: string): Promise<Order>;  // validates the state machine
  attachPayment(id: string, s: PaymentStatus): Promise<Order>;            // idempotent
  reserveCapacity(key: CapacityKey, qty: number, limit: number, holdUntil?: string): Promise<'ok' | 'full'>;  // delivery slots (06)
  stock: { get(ids: string[]): Promise<Record<string, number>>; decrement(lines: Array<{ key: string; qty: number }>): Promise<'ok' | { short: string[] }>; set(key: string, qty: number): Promise<void> };
  giftCards: { issue(card: GiftCard): Promise<void>; check(code: string): Promise<GiftCard | null>; debit(code: string, amount: Money, orderId: string): Promise<'ok' | 'insufficient'> };
}

// packages/booking/src/server/store.ts
export interface Booking {
  id: string; serviceId: string; businessDate: LocalDate; start: string; end: string;    // ISO instants
  resources: string[]; customer: Order['customer']; answers: Record<string, string>;     // options, reference upload keys
  price: Money; deposit: Money; balance: Money;
  status: 'held' | 'pending_payment' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'expired';
  holdUntil?: string; payment?: Order['payment']; history: Order['history']; viewToken: string; demo: boolean;
}
export interface BookingStore {
  ledger(date: LocalDate): Promise<{ bookings: Booking[]; closed: boolean; capOverride?: number; etag: string }>;
  hold(b: Booking): Promise<'ok' | 'conflict'>;             // re-checks the slot/cap inside an onlyIfMatch write to the day ledger
  confirm(id: string, s: PaymentStatus): Promise<Booking>;
  transition(id: string, to: Booking['status'], by: string): Promise<Booking>;
  setDayOverride(date: LocalDate, o: { closed?: boolean; capOverride?: number }): Promise<void>;   // /owner/ "close this day"
  list(q: { from: LocalDate; to: LocalDate }): Promise<Booking[]>;
}
```

### 10.3 Blobs layout and concurrency

| Store | Key | Holds | Write rule |
|---|---|---|---|
| `orders` | `o/<orderId>.json` | Order | `onlyIfNew` on create; `onlyIfMatch` on transitions |
| `orders` | `idx/<yyyy-mm-dd>.json` | Day index (summaries) for the dashboard | ETag retry (avoids listing thousands of blobs) |
| `orders` | `cap/<yyyy-mm-dd>/<slotId>.json` | Delivery-slot capacity (06) | `onlyIfMatch` |
| `orders` | `stock/<key>.json`, `gc/<code>.json` | Stock counts, gift-card balances | `onlyIfMatch` |
| `bookings` | `day/<businessDate>.json` | **Every booking of that business day, plus overrides**: the unit of concurrency | `onlyIfMatch`: two customers racing for the last slot → exactly one wins, the other gets "هذا الموعد انحجز للتو، اختاري موعداً آخر" |
| `bookings` | `b/<bookingId>.json` | Pointer to the day and date | `onlyIfNew` |
| `pay` | `a/<sessionId>.json`, `ref/<provider>/<ref>` | Payment attempts + lookup | `onlyIfNew` / `onlyIfMatch` |
| `pay` | `evt/<provider>/<eventKey>` | Webhook dedupe | `onlyIfNew` |
| `ops` | `auth/otp/<sha256(email)>`, `auth/rl/<key>`, `outbox/<ts>-<id>.json`, `enq/<id>.json`, `uploads/<bookingId>/<n>.webp` | Auth, rate limits, demo outbox, enquiries, reference images | — |

- `withEtagRetry` retries up to 5 times with jitter [AN §9.1].
- Holds expire lazily: an expired `held` or `pending_payment` booking no longer counts towards capacity.
- A daily cap counts `confirmed + held(unexpired)` for the `businessDate`.

### 10.4 Retention, demo data and privacy

- **Demo sites:**
  - Orders placed through MockProvider are real Blobs records flagged `demo: true`. They are purged lazily after `retentionDays` (14).
  - `/owner/` merges them with **seeded illustrative orders** from `src/content/demo/orders.json`, which are generated per niche and labelled "طلب توضيحي".
  - Phone numbers are masked in demo mode (`+973 3••• ••56`).
  - The demo checkout is capped at 30 orders a day per site. It also has the honeypot and the rate limit.
- **Live sites:** no automatic purge. `docs/handoff-checklist.md` asks the client for a retention period, because Bahrain's PDPL, Saudi Arabia's PDPL and Kuwait's rules differ; this is a legal item for the client [A].

### 10.5 Owner dashboard (`/owner/`)

- **A static Astro page** from `@aw/ops` (Arabic, with an English toggle), plus the `aw-owner-app` island (vanilla TypeScript). It is marked noindex, uses `Cache-Control: no-store`, and is excluded from the sitemap. It lives at `/owner/`, **not** `/admin/orders/`, so it never inherits the looser `/admin/*` CMS policy (C2).
- **Views:**
  - Orders by day or status, and order detail.
  - Status buttons that follow the state machine: تأكيد، قيد التجهيز، جاهز للاستلام، خرج للتوصيل، تم التسليم، تم التحصيل، إلغاء.
  - A WhatsApp link to the customer with an Arabic status template, plus "copy summary" (their existing chat workflow).
  - A printable packing slip (print CSS).
  - A bookings calendar day view.
  - **Close a day** or change today's cap (runtime, instant).
  - Stock counts and gift-card lookup.
  - Enquiries.
  - In demo mode only, a "البريد الصادر (تجريبي)" tab showing the emails that would have been sent.
- **Auth** (`OwnerAuth` interface, precedence env `OWNER_AUTH` > `ops.dashboardAuth`):
  - `demo`: open. PII is masked and a banner reads "لوحة تجريبية ببيانات توضيحية".
  - `email-otp` (**default for live**):
    - The owner enters an email address listed in `settings/notifications.json → ownerEmails`.
    - A 6-digit code is emailed. We use a code rather than a magic link because links open in the wrong in-app browser on phones.
    - Only a hash of the code is stored in Blobs. It expires after 10 minutes and allows 5 attempts per 15 minutes per email and IP.
    - On success, the owner gets a 30-day session cookie `aw_owner`: an HMAC-signed payload with `SESSION_SECRET`, `HttpOnly; Secure; SameSite=Strict; Path=/api/owner`.
  - `supabase`: Supabase Auth email OTP, used when the store is Supabase (row-level security).
  - Netlify Identity was considered and not chosen, because of its Beta status and deprecation history [CMS §3.2]. Email OTP reuses the mailer we already need.
- **API:** a single router function, `owner.mts`, at `/api/owner/*`, covering `auth/request`, `auth/verify`, `me`, `orders`, `orders/:id`, `orders/:id/transition`, `bookings`, `days/:date`, `stock`, `giftcards/:code`, `enquiries` and `outbox`. It has fewer cold starts than one function per route.

### 10.6 Notifications

- **The `Mailer` interface:**

  ```ts
  send({ to, subject, html, text, replyTo? }): Promise<{ id }>
  ```

  Adapters:
  - `outbox`: demo and dev. Writes to Blobs, visible in `/owner/`.
  - `resend`: live. `RESEND_API_KEY`, and `MAIL_FROM` on the client's verified domain. The exact API is checked at build time [A].
- **Events and recipients:**
  - `order.placed` and `order.paid` go to the owner emails, with the summary and a dashboard link.
  - The customer gets a confirmation only if they gave an email. Gulf customers mostly give only a phone number.
  - `booking.confirmed` goes to both.
  - `enquiry` goes to the owner.
  - `otp` goes to the owner.
- **Templates** are Arabic-first RTL HTML with inline styles plus a plain-text part, in `@aw/ops/mail/templates/*.ts`.
- **A failed send never fails the order.** It is recorded and shown in the dashboard.
- **The customer's WhatsApp is the confirmation channel that actually gets used:**
  - The `/order/` page offers "أرسلي تفاصيل الطلب للمحل على واتساب", a prefilled message built by `@aw/whatsapp`.
  - Automatic WhatsApp sending needs Meta's paid WhatsApp Business Platform, which is out of scope and documented as an upsell.

### 10.7 Supabase adapter (optional)

- **Tables:** `orders`, `order_events`, `bookings` (with a `tstzrange` exclusion constraint per resource), `payment_attempts`, `webhook_events` (unique `event_key`), `stock`, `gift_cards`, `day_overrides`. They are migrated by `packages/commerce/server/supabase/schema.sql`.
- **Access:** functions use the service-role key server-side only. The dashboard uses Supabase Auth plus row-level security scoped to `ownerEmails`.
- **Not used by any demo.** Contract tests run the same suite against `memory`, `blobs` (local sandbox) and, when `SUPABASE_TEST_URL` is set, `supabase`.

---

## 11. Cross-cutting modules

### 11.1 WhatsApp builder (`@aw/whatsapp`)

- **One builder per intent:** `orderMessage`, `bookingMessage`, `enquiryMessage`, `shareMessage`. Each takes structured selections and a context `{ lang, dialect, audience, locale, demoPrefix }`.
- **Output format:**
  - A greeting from the dialect overlay, then a bold header using WhatsApp's `*…*`.
  - One bullet per item: options, then quantity × unit price.
  - Date and slot, with the Hijri date when enabled.
  - Name and phone. The phone is prefixed with LRM.
  - Notes, then the estimated total labelled **(تقديري)**. It never uses a bare `*`, which WhatsApp would treat as bold markup.
  - The page link with `utm_source=whatsapp`.
- **`waLink(e164, text)`** returns `https://wa.me/<digits>?text=<encodeURIComponent(text)>`.
- **`fitToLimit`** keeps the encoded URL under 4,000 characters by collapsing long item lists ("+ ٣ منتجات أخرى") and truncating notes [A: test on iOS and Android in-app browsers].
- **In demos**, the first line is `[نموذج: <brand>]`, so your inbox shows which demo the message came from (§11.6).

Example (site 01, lite, Arabic numbering). Greetings come from the dialect overlay and contain no emojis by default:

```
[نموذج: ليان]
هلا ليان، ودي أطلب:
*طلب عباية*
• عباية كريب سوداء بتطريز يدوي
  المقاس: M · الطول: ٥٦
  الكمية: ١ × ٣٨٫٥٠٠ د.ب.
المجموع: ٣٨٫٥٠٠ د.ب. (تقديري)
الاسم: مريم
الجوال: ‎+973 3600 1234
ملاحظات: أبيها قبل الخميس
https://layan-abaya-demo.netlify.app/products/black-crepe-embroidered/?utm_source=whatsapp
```

Unit tests snapshot exact strings for Arabic and English for every niche, and assert:
- no unpaired `*`,
- round-trip through `encodeURIComponent`,
- normalised digits in phone numbers,
- the length guard.

### 11.2 Forms: honeypot and Arabic validation

- **Every form** (WhatsApp order/booking, checkout, enquiry, owner login) goes through the `aw-form` custom element:
  - The **honeypot** is a hidden `company_website` field with `tabindex="-1"`, `autocomplete="off"` and `aria-hidden="true"`, hidden visually (not with `display: none`).
  - A **time trap** rejects submissions faster than 3 s.
  - **Functions re-check** both, and enforce the rate limit.
  - For WhatsApp forms, a filled honeypot silently skips opening WhatsApp.
- **Validation:**
  - Native constraint validation, with `setCustomValidity` messages from the dictionary in the **page language**, never the browser's own messages.
  - An error summary at the top links to each field, with `aria-invalid` and `aria-describedby`.
  - The first error gets focus.
  - Messages say exactly what to fix, using the actual values:

| Rule | Message (ar, audience women) |
|---|---|
| Phone, Bahrain | رقم الجوال البحريني ٨ أرقام، والرقم المكتوب فيه ٧ أرقام. مثال: 36001234 |
| Phone, Iraq | رقم الموبايل العراقي يبدأ بـ 07 ويتكوّن من ١١ رقماً، مثل 07701234567 |
| Minimum notice (07) | أقرب موعد للطلب هو بكرة الخميس ٢٤ سبتمبر. اختاري تاريخاً من بكرة وطالع |
| MOQ (12) | أقل كمية لهذا التوزيع ٢٥ قطعة. زيدي الكمية ٥ قطع على الأقل |
| Text on cake (09) | النص طويل: ٣٤ حرفاً والحد ٣٠. احذفي ٤ أحرف |
| Upload (08) | حجم الصورة ١٢ ميغابايت والحد ٨. جرّبي صورة أصغر أو لقطة شاشة |
| Same-day cutoff (09) | انتهى وقت طلبات اليوم الساعة ٤:٠٠ م. التوصيل المتاح: بكرة الجمعة |

- **Phone rules** (length, allowed leading digits) are data in `@aw/i18n/phone/<country>.ts`, verified against each national numbering plan in Step 2 [A].
- **Address fields are per country** (`@aw/i18n/address`):
  - BH: area, block, road, building, flat.
  - KW: area, block, street, avenue (optional), house.
  - SA: city, district, street, building, optional short national address.
  - IQ: governorate, district, neighbourhood, **nearest landmark** (required), house.
  - GCC shipping (02): country, city, address line, postcode (optional).

### 11.3 Analytics event layer

```ts
// @aw/ui/client/analytics.ts
export type AnalyticsEvent =
  | { name: 'whatsapp_click'; props: { context: 'product' | 'booking' | 'fab' | 'contact' | 'order'; itemId?: string } }
  | { name: 'add_to_cart'; props: { itemId: string; value: string; currency: CurrencyCode; qty: number } }
  | { name: 'begin_checkout'; props: { value: string; currency: CurrencyCode; items: number } }
  | { name: 'purchase'; props: { orderId: string; value: string; currency: CurrencyCode; method: string } }
  | { name: 'booking_submit'; props: { serviceId: string; tier: 'lite' | 'full'; deposit?: string } }
  | { name: 'share_product'; props: { itemId: string; channel: 'native' | 'whatsapp' | 'copy' } }
  | { name: 'lang_switch'; props: { to: Lang } };
export function track(e: AnalyticsEvent): void;   // always dispatches `aw:track` on window; adapter per site config
```

- **Adapters:**
  - `none` (default): a no-op that logs when `?debug=analytics` is set.
  - `plausible`: calls `window.plausible(name, { props })`.
  - `ga4`: calls `gtag('event', …)` with mapped names.
- **The analytics script loads only when configured.** Its origin is added to the page CSP by `awSite()`.
- **Values** are decimal strings from `toDecimalString`, never floats.
- Recommended for live clients: Plausible, which is cookieless and needs no consent banner. GA4 would need a consent notice.

### 11.4 SEO and JSON-LD builders (`@aw/seo`)

- **Per page:**
  - `<title>` from `titleTemplate` and a meta description (entry summary, else `settings/seo.json`).
  - Canonical: an absolute clean URL from `deploy.url`.
  - `hreflang` × 3.
  - OG: `og:type`, `og:locale` plus alternate, `og:image` (the product crop or `og.png`), `og:image:alt`.
  - Twitter `summary_large_image`.
  - Robots.
- **Business type by niche:**
  - fashion → `ClothingStore`
  - perfume, chocolatier, favors → `Store`
  - sweets, cakes → `Bakery`
  - beauty, henna → `BeautySalon`
  - events → `LocalBusiness`
- **JSON-LD:**
  - `business()` emits `openingHoursSpecification`, which cross-midnight hours can use (§8.5). Home-based businesses get `areaServed` and no street address.
  - `product()` emits `Product` + `Offer`, with `price` as a decimal string, `priceCurrency` and `availability`.
  - `service()`.
  - `breadcrumbs()` emits a `BreadcrumbList` on every inner page.
- **Never emitted:**
  - `Review` or `AggregateRating` for sample reviews. They are illustrative, and marking them up would be a structured-data policy violation.
  - FAQ rich-result markup. Google restricts it; plain HTML is fine.
- **Files:**
  - `robots.txt` allows everything except `/admin/`, `/owner/`, `/api/` and `/pay/`, and points to the sitemap. Demos rely on noindex, **not** on robots blocking [AN §5.2].
  - `@astrojs/sitemap` emits Arabic and English alternates and excludes `/owner/`, `/pay/`, `/admin/` and `/order/`.

### 11.5 Security

**CSP layering (C2):**

| Layer | Applies to | Policy |
|---|---|---|
| Astro `security.csp` (meta, per page) | All site pages | `default-src 'self'; script-src 'self' + hashes (incl. the inline language script); style-src 'self' + hashes; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' [+ analytics origin]; form-action 'self'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests`. Per-page additions [SPIKE S8]: branch pages add `frame-src https://www.openstreetmap.org` (the map facade loads only on click); `/pay/credimax/` adds `script-src`, `frame-src` and `connect-src https://credimax.gateway.mastercard.com` |
| `netlify.toml` `/*` | Everything | `Content-Security-Policy: frame-ancestors 'self'; object-src 'none'; base-uri 'self'` (the directives a meta tag can't carry, compatible with the CMS), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(self)`, `X-Robots-Tag: noindex` when `seo.indexing=false` |
| `netlify.toml` `/admin/*` | Sveltia | `script-src 'self' https://unpkg.com; style-src 'self' 'unsafe-inline'; font-src 'self' https://cdn.jsdelivr.net; img-src 'self' blob: data: https://*.githubusercontent.com; connect-src 'self' blob: data: https://unpkg.com https://api.github.com https://www.githubstatus.com https://api.netlify.com; worker-src blob:; frame-src blob:; media-src blob:; manifest-src blob:`, plus `X-Robots-Tag: noindex` and `Cache-Control: no-store` on `config.yml` [CMS §3.11; exact origins SPIKE S3/S13] |
| `netlify.toml` `/_astro/*` | Hashed assets | `Cache-Control: public, max-age=31536000, immutable` |
| Functions | `/api/*` | Set their own headers (Netlify headers don't apply to function responses [AN §10]): `Cache-Control: no-store`, `X-Content-Type-Options`; no CORS (same origin only) |

No `ClientRouter` (it is incompatible with Astro CSP); native CSS view transitions are allowed.

**Secrets:**
- Nothing secret lives in the repo. The CMS config is public by design.
- Every site gets a generated `.env.example` listing exactly its keys, with comments. Full-tier example:

```dotenv
# sites/02-noha-modest/.env.example   GENERATED by pnpm site:sync
# ── mode ─────────────────────────────────────────────
PAYMENTS_MODE=mock            # mock | test | live   (unset = mock; live refuses test-looking keys)
ORDER_STORE=blobs             # blobs | supabase | memory
OWNER_AUTH=demo               # demo | email-otp | supabase
MAIL_PROVIDER=outbox          # outbox | resend
# ── required for test/live ───────────────────────────
SESSION_SECRET=               # ≥ 32 random bytes, base64 (owner sessions, order view tokens)
TAP_SECRET_KEY=               # sk_test_… in test, sk_live_… in live; also the webhook HMAC key
TAP_SOURCE_ID=src_all
RESEND_API_KEY=
MAIL_FROM=                    # "Noha <orders@client-domain>" on a verified domain
# ── optional ─────────────────────────────────────────
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

- Secrets are set in the Netlify UI or CLI for the right deploy context. Deploy previews always run `PAYMENTS_MODE=mock`, set in `netlify.toml [context.deploy-preview.environment]`.
- **Webhook verification:** §9.7. **Spam protection:** §11.2. **Uploads:**
  - Images only, verified by magic bytes, not the file extension.
  - Functions don't re-encode images (no sharp in functions), so the browser downscales to WebP before upload, and the function enforces ≤ 2 MB plus a WebP/JPEG signature.
  - Stored under random keys and served to the owner only through `/api/owner`.

### 11.6 Demo safeguards (all driven by `demo.*`)

| Safeguard | Implementation |
|---|---|
| Top banner | "هذا نموذج مبدئي، الصور والأسعار توضيحية" (English page: "This is a demo; images and prices are illustrative"). Dismissible; dismissal is stored in localStorage (try/catch) and applied before paint by the head script |
| Prices | `<Price>` appends `*` with `aria-describedby` pointing at the footnote "* الأسعار توضيحية لأغراض العرض فقط". In WhatsApp messages the marker is "(تقديري)" (§11.1) |
| Footer credit | "نموذج مبدئي من إعداد <bdi>Shujaat</bdi> — تصميم وتطوير المواقع", linking to the hub. Text comes from `studio.config.ts` |
| Indexing | `seo.indexing=false` → meta robots noindex **and** `X-Robots-Tag` (not robots.txt) |
| **Contact routing** | `demo.contactRouting='studio'`. **Every** `wa.me`, `tel:` and displayed number on a demo uses **your** number from `studio.config.ts` (D7). An invented number could belong to a real person. A prospect who tries "order on WhatsApp" lands in your inbox with `[نموذج: <brand>]` on the first line, which also works as a sales lead |
| Emails | Demo addresses use the reserved `.example` TLD (`hello@noha.example`) |
| Social handles | Shown as text, **not links** (invented handles may be real accounts) |
| CR number | Rendered as "سجل تجاري: ٠٠٠٠٠٠ (نموذج)" |
| Reviews | Each card is labelled "تقييم توضيحي"; no review markup (§11.4) |
| Addresses and maps | Area-level coordinates (a district centroid), never a specific building |
| Payments | MockProvider only; the mock page says no money moves |
| Owner dashboard | Demo auth with masked PII and a "بيانات توضيحية" banner |

Switching a site to a client (`pnpm rebrand … --client`) sets `demo.enabled=false` and `contactRouting='site'`, and keeps `seo.indexing=false` until `pnpm go-live <site>` (§12.5).

### 11.7 Accessibility and performance budgets

- **Accessibility (checked by axe plus Playwright assertions):**
  - WCAG AA contrast, guaranteed by the token check.
  - Visible focus: a 2 px `focus` ring with offset, ≥ 3:1 contrast.
  - Targets ≥ 44 px (`min-h-11 min-w-11` on every control).
  - A skip link and landmarks.
  - One `h1` per page, with sequential headings.
  - Labelled fields.
  - Modals use `<dialog>` with focus return; the lightbox traps focus, closes on Escape and uses no autoplay.
  - `prefers-reduced-motion` disables all transitions.
  - `aria-live="polite"` for cart counts, running estimates and slot availability.
  - Alt text in the page language.
- **Performance budgets** (gzip; check-all fails above them):

| Budget | Limit |
|---|---|
| JS, lite pages | ≤ 15 KB |
| JS, product page (full) | ≤ 25 KB |
| JS, checkout | ≤ 40 KB |
| JS, booking calendar | ≤ 45 KB |
| JS, owner dashboard | ≤ 80 KB (exempt from Lighthouse) |
| CSS | ≤ 25 KB |
| Fonts per page | ≤ 120 KB |
| Hero image on mobile | ≤ 150 KB |
| First view on mobile | ≤ 600 KB |

- LCP ≤ 2.5 s on Lighthouse's simulated mobile (150 ms RTT, 1.6 Mbps, 4× CPU) [AN §12].

---

## 12. Tooling

### 12.1 Commands (root `package.json`)

`<site>` accepts `02`, `noha`, `noha-modest` or `02-noha-modest`. `scripts/lib/resolve-site.ts` resolves it.

| Command | What it does |
|---|---|
| `pnpm new-site [flags]` | Scaffold a site (§12.3) |
| `pnpm rebrand <site> [flags]` | Re-brand in place, or for a client (§12.4) |
| `pnpm extract <site> --to <dir>` | Create a standalone client repo (§12.5) |
| `pnpm go-live <site>` | Interactive go-live checklist that flips `seo.indexing` and verifies the env (§12.5) |
| `pnpm site:sync <site>\|--all [--check]` | Regenerate every **G** file in §3.3. `--check` fails on drift |
| `pnpm dev <site>` | `site:sync` + `astro dev` (port `43NN`), with Functions and Blobs emulated by `@netlify/vite-plugin` [SPIKE S5]. Fallback: `netlify dev --filter sites/<dir>` |
| `pnpm build <site>\|--all` | `site:sync --check` + content check + `astro build` |
| `pnpm run deploy <site> [--prod]` (alias `pnpm ship <site>`) | Build, then `netlify deploy --filter sites/<dir> --site $NETLIFY_SITE_ID [--prod]`. Without `--prod` it creates a draft deploy (free) and prints the URL |
| `pnpm check-all [--sites 02,10] [--remote] [--e2e] [--online]` | §12.6 |
| `pnpm test` | vitest (all packages + scripts) |
| `pnpm brand:render <site>` · `pnpm fonts:fetch` · `pnpm images:grade <site>` · `pnpm hub:screens` | Authoring pipelines (§6.5, §7.3, §13) |

### 12.2 `site:sync`: the single generator

From `site.config.ts`, `brand/tokens.ts`, `brand/logo.json` and `resolvePreset()`, it writes:
- `src/styles/tokens.css`
- `public/admin/config.yml` and `public/admin/index.html`
- `public/favicon.svg`, `public/apple-touch-icon.png` and `public/og.png` (copied)
- `netlify/functions/*.mts`
- `netlify.toml`, including the ignore command below
- `.env.example`

Every generated file carries a `GENERATED` header. The ignore command lists only this site's folder, the packages it actually depends on, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, the root `package.json`, `.nvmrc` and `studio.config.ts`, with the first-build guard [AN §4.3]:

```toml
ignore = "[ \"$CACHED_COMMIT_REF\" = \"$COMMIT_REF\" ] && exit 1; git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF -- sites/02-noha-modest packages/core packages/i18n packages/brand packages/ui packages/commerce packages/whatsapp packages/payments packages/ops packages/seo packages/cms packages/content packages/presets packages/astro pnpm-lock.yaml pnpm-workspace.yaml package.json .nvmrc studio.config.ts"
```

### 12.3 `pnpm new-site`

**Inputs.** Interactive prompts (`@clack/prompts`), or flags for agents and CI:

```
pnpm new-site --preset commerce.full --niche perfume --country KW --name "عنبر|Anbar Scent" --slug anbar-scent
              [--from 05-anbar-scent] [--dialect kuwaiti] [--audience mixed] [--palette seed:#6B4E3D | <name> | 5 hexes]
              [--fonts "Reem Kufi/Josefin Sans//IBM Plex Sans Arabic/IBM Plex Sans"] [--hero split-editorial]
              [--whatsapp +965…] [--provider myfatoorah] [--id 14] [--yes] [--no-build]
```

Derived, not asked: currency, time zone, weekend, numbering default, geo seed for zones, dialect default by country, `businessType` from the niche, and provider methods from the matrix.

**What it does:**
1. Picks the next free `NN`.
2. **Content source:**
   - With `--from`, or automatically when a demo of the same niche exists, it copies that site's `src/content/` and `settings/`.
   - Otherwise it uses `@aw/presets/starterPacks/<niche>`.
3. Writes `site.config.ts` from the preset template.
4. Writes `brand/tokens.ts` from the palette and font inputs, with coverage and contrast checks, and writes `brand/logo.json`.
5. Runs `brand:render`, the rebrand content pass (§12.4, step 4) and `site:sync`.
6. Adds `sites/NN-slug` to the workspace and runs `pnpm install --offline`, falling back to online.
7. Builds once unless `--no-build`.
8. Prints next steps: Netlify site creation (package directory = `sites/NN-slug`, a UI-only setting [AN §4.1]), OAuth Client ID/Secret, and the content to rewrite.

**Target:** under 5 minutes to a building, branded site. Under an hour to a presentable site 14:
- ~20 min: rewrite 12 product entries in the right dialect.
- ~15 min: replace photos with `images:grade`.
- ~10 min: palette and hero review.
- ~5 min: check-all on that site.
- deploy.

### 12.4 `pnpm rebrand`

This is the tool that makes the portfolio pay off, so its contract is strict.

**Inputs:**

```
pnpm rebrand <site>
  --name "<ar>|<en>"                 required: new business name (Arabic|Latin)
  --palette <name|seed:#hex|#h1,#h2,#h3,#h4,#h5>   (surface, ink, accent, hairline, surfaceAlt; rest derived + contrast-solved)
  --fonts "<ar display>/<latin display>//<ar body>/<latin body>"   (validated against the font catalogue + coverage)
  --logo <auto|path/to/client-logo.svg> [--mark <path.svg>]        (auto = regenerate wordmark from name + fonts)
  --whatsapp <+E164>
  [--phone <+E164>] [--email <addr>] [--instagram <handle>] [--cr <number>] [--address-ar … --address-en …]
  [--tagline "<ar>|<en>"] [--domain <https://…>] [--client]    (--client: demo.enabled=false, contactRouting='site')
  [--dry-run]                         prints the plan and the diff, writes nothing
```

**What it writes. This allow-list is exhaustive and enforced:**

| # | File(s) | Change |
|---|---|---|
| 1 | `brand/tokens.ts` | Regenerated with the new palette and fonts. Radius, rhythm, motion and grade are preserved from the old file unless flags change them |
| 2 | `brand/logo.json` | Name, fonts, features |
| 3 | `brand/logo*.svg`, `favicon.svg`, `og.png`, `apple-touch-icon.png` | Re-rendered, or normalised from `--logo` with svgo, and the mark derived from `--mark` |
| 4 | `src/content/**` text fields | **Brand-name replacement:** the old Arabic and Latin names → the new ones, using Arabic-aware word boundaries that allow the prefixes و ب ل ك ف. Candidates in other contexts are listed in `rebrand-report.md` for manual review, not replaced |
| 5 | `src/content/settings/general.json` | `name`, and `tagline` if given |
| 6 | `src/content/settings/contact.json`, `notifications.json` | WhatsApp, phone, email, social, address |
| 7 | `site.config.ts` | Via magicast (AST-safe): `demo.*` (when `--client`), `deploy.url` (when `--domain`), `showcase.oneLiner`. **Nothing else** |
| 8 | `brand/brand.md` | Regenerates the sections between `<!-- aw:generated -->` markers: palette table, type specimen, logo clear space. Hand-written sections are kept, and a "review positioning and tone" checklist is prepended |
| 9 | Everything `site:sync` generates | `tokens.css`, `public/admin/*` (app title and logo), `public/*` icons, `netlify.toml`, `.env.example` |

**The guard:** rebrand builds a write plan first. If any path falls outside `sites/<site>/{site.config.ts, brand/**, src/content/**, src/styles/tokens.css, public/**, netlify.toml, netlify/functions/**, .env.example}`, it **aborts before writing**. A write under `packages/**`, or to a `.astro`/`.ts` component, is impossible by construction. After writing, it runs `build` + `check-all --sites <site>` and prints the `git diff --stat`.

**Tested:** a vitest end-to-end test rebrands a fixture site twice. It asserts that `git diff --name-only` is inside the allow-list, that the build is green, and that no old brand string remains outside the reported candidates.

### 12.5 Handoff: `extract` and `go-live` (per D6)

`pnpm extract <site> --to <dir> [--slug <new>]` creates a self-contained pnpm workspace:

```
<dir>/package.json + pnpm-workspace.yaml + .nvmrc + packages/<only the packages the site uses> + site/
```

It also:
- Rewrites the CMS `backend.repo`, the folder prefixes and the `netlify.toml` paths.
- Runs `git init` and an initial commit.
- Prints the GitHub and Netlify steps.

The packages are **vendored at the current version**. That is the simplest thing that works, and there is no private registry to run. `pnpm extract --update <dir>` re-copies packages later for maintenance.

`pnpm go-live <site>` is an interactive checklist that refuses to finish until:
- `demo.enabled=false`,
- the provider keys are present in Netlify env for production (checked through the Netlify API),
- `PAYMENTS_MODE=live` is only in production context,
- `SESSION_SECRET` and the mailer are set,
- `ownerEmails` is non-empty,
- the policy pages exist (Tap, PayTabs and Credimax require refund, privacy, T&C and shipping pages plus a visible CR [PAY §3, §6]),
- a real test payment has been refunded.

Only then does it set `seo.indexing=true`. `docs/handoff-checklist.md` and `docs/payments.md` expand every step.

### 12.6 `pnpm check-all`

The steps below run **per site** (builds 2 at a time; Lighthouse strictly one at a time). Results go to `.check/report.json`, `.check/report.md` and the console table.

| Step | Tool | Pass threshold |
|---|---|---|
| 1. Drift | `site:sync --check` | No diff |
| 2. Types | `astro check` + `tsc --noEmit` for packages | 0 errors |
| 3. Lints | scripts/lib/lint: RTL physical classes (§8.3); brand literals in packages (§3.1); forbidden imports (server in client); no components under `sites/*/src` | 0 findings |
| 4. Content | `checkContent`: English complete, price steps, image sizes, **glyph coverage** of the full corpus against the site's fonts, CMS config valid (Ajv + Sveltia schema), admin pre-seed present | 0 errors |
| 5. Build | `astro build` with `AW_STRICT_CONTENT=1` | Success; site 03 build time reported |
| 6. Serve | `scripts/lib/serve.ts`: a static server with Brotli and the site's generated `netlify.toml` headers, so local results match production more closely than `astro preview` (which lacks compression) [AN §12] | — |
| 7. Lighthouse | `lighthouse` 13.5 via chrome-launcher, `CHROME_PATH`=installed Chrome, mobile defaults, **median of 3** on `/`, `/en/`, one product or service page and `/checkout/` or `/book/`. Demo sites use `skipAudits: ['is-crawlable']` (C6) | Perf, A11y, BP, SEO **≥ 90** each; LCP ≤ 2.5 s; CLS ≤ 0.1 |
| 8. Accessibility | `@axe-core/playwright` (tags wcag2a, wcag2aa, wcag21a, wcag21aa), Chrome channel, on every route template in ar and en | 0 serious/critical (fail); moderate/minor reported, target 0 |
| 9. Links | linkinator on `dist` (internal only; `wa.me` and external links in a non-blocking pass) | 0 broken |
| 10. RTL smoke | Playwright: `lang`/`dir`, no horizontal overflow at 390 and 1440, nav order, FAB side, breadcrumb order, flipped directional icons | All pass |
| 11. Screenshots | Playwright 390×844 and 1440×900, `/` and `/en/` (+ key pages), after `document.fonts.ready` → `.check/screens/<site>/` | Saved |
| 12. Budgets | dist sizes + Lighthouse network summary (§11.7) | Within budget |
| 13. Indexing | Demo: `noindex` meta + header **present**. Live: absent | As configured |
| 14. E2E (`--e2e`, full tier) | Playwright against `pnpm dev` (functions emulated): add to cart → checkout → mock success → `/owner/` shows the order; booking → deposit → confirmed; a double-booking race → one conflict | Pass |
| 15. CMS online (`--online`) | Loads `/admin/` with network access and asserts that the login screen renders `dir="rtl"` in Arabic | Pass |
| Cross-site | Distinctness matrix (§7.4) | Warning only |

Output:

```
site                   lang tier  build  perf a11y bp  seo  LCP    CLS   axe links rtl  budget cms  e2e
02-noha-modest         ar   full  ok     96   100  100 100* 1.8s   0.00  0   0     ok   ok     ok   ok
02-noha-modest         en   full  ok     97   100  100 100* 1.7s   0.00  0   0     ok   ok     —    —
10-maraya-beauty…      ar   full  ok     93   98   100 100* 2.1s   0.02  0   0     ok   ok     ok   ok
* is-crawlable skipped on demo (noindex asserted separately)
FAILED: 0   WARN: 1 (distinctness: 05↔03 share hero + card + nav)
```

The exit code is non-zero on any failure. `--remote` runs steps 7–15 against the deployed URLs.

### 12.7 Testing strategy (vitest 5 + fast-check)

| Area | Tests |
|---|---|
| **Money** (`@aw/core`) | Parse and format round-trips for every currency. Rejection of excess decimals and off-step values. `sum`/`add`/`mul` exactness. Property test: `allocateBps` parts always sum to the total. Deposit `up-to-step` rounding. IQD exponent 0. `toProviderAmount` for every gateway, incl. the **Tap hashstring `"3.000"`** format and **Checkout.com's last-digit-0 assertion** and IQD ×1000 |
| **Time and hours** | `isOpenAt` across midnight (Thu 14:00–02:00 → Fri 01:30 open, Fri 02:30 closed). Seasons and exceptions precedence. Validation errors. All tests under `TZ=UTC` and `TZ=America/Los_Angeles` |
| **Slot generation** (`@aw/booking`) | Step, buffers and duration fit. Lead time and cutoff. Resource intersection (staff skill + room). Capacity > 1. Cross-midnight business days. Blackouts, full dates and windows (opens/closes/event range). Daily cap by weekday. Holds expiring. Property test: no two generated bookings ever double-use a resource |
| **Shipping and fulfilment** (`@aw/commerce`) | Zone fee, `freeOver` and `minOrder`. GCC country table. Pickup branches. COD scope, zone and max order. Same-day cutoff before and after. Delivery-slot capacity. Personalised lead tag (48 h). Earliest date across a weekend |
| **Pricing** | Choice absolute vs delta prices. MOQ/step validation messages. Tier boundaries (24, 25, 49, 50). Add-on estimate totals (13). Gift-card partial debit |
| **WhatsApp builder** | Snapshots per niche × lang × dialect. Encoding round-trip. Digit normalisation. LRM before phone numbers. `fitToLimit`. No stray `*` |
| **i18n** | Phone parsing per country with Arabic-Indic and Persian digits. Plural forms. `formatMoney` exact output strings (the verified examples in §8.4). Month names for ar-IQ vs ar-BH |
| **Payments** | Per-adapter webhook verification with documented or constructed test vectors (Tap hashstring, MyFatoorah ordered-field base64, PayTabs raw-body hex, Checkout.com, Moyasar token, Credimax header). Status mapping tables. Live-mode guard. MockProvider scenarios. Idempotent transition under duplicate and out-of-order events |
| **Stores** | One contract suite run against `memory`, `blobs` (local sandbox) and optional `supabase`. Concurrent-hold race (`Promise.all` of 10 holds for 1 slot → exactly 1 ok) |
| **Presets and config** | Every `sites/*/site.config.ts` parses. `resolvePreset` snapshot per site. CMS config for every site validates against Sveltia's JSON Schema. Generated Zod schemas accept every content file |
| **Scripts** | rebrand allow-list end-to-end test (§12.4). new-site produces a building site (CI: `--no-install` fixture). `site:sync` is idempotent |

Coverage target: ≥ 90% lines for money, time, slots, fulfilment, pricing and WhatsApp.

### 12.8 Netlify multi-site deploy strategy (per D1)

- **One Netlify site per `sites/NN-*` and one for `hub/`:**
  - Base directory **unset**; **package directory = `sites/NN-*`**, which is a UI setting [AN §4.1].
  - Build command `pnpm --filter @aw/site-NN-slug build`; publish `sites/NN-slug/dist`; functions `sites/NN-slug/netlify/functions`.
  - Generated ignore command (§12.2).
- **Team settings:**
  - "Multiple webhooks per repo" on, so each site posts its own commit status [CMS §3.4].
  - Deploy previews on. Branch deploys on for `dev`.
- **Workflow:**
  - Day-to-day commits go to **`dev`**. Only the sites whose inputs changed build branch deploys, **at 0 credits**, on stable URLs like `dev--noha-modest-demo.netlify.app`, which are good for review.
  - Merge `dev` → `main` when a site is finished, or weekly. Only the changed sites deploy to production, at 15 credits each.
  - Bulk content-only commits carry `[skip netlify]`.
  - The CMS in the monorepo uses `skip_ci: true`.
- **Budget, Free tier:**
  - Initial production of 14 sites = 210 credits.
  - The steady state is about 5–8 production deploys a month (≈ 75–120 credits). Traffic is tiny.
  - During Steps 3–4 (one site at a time, plus fixes), a Personal plan for 1–2 months removes the risk of pausing every demo (D1).
  - `pnpm run deploy <site>` (a CLI draft deploy) costs nothing for quick private previews.
- **Client sites** move to the client's own Netlify team at handoff:
  - 20 production deploys a month on Free is plenty for one shop when CMS commits are batched.
  - `docs/cms-guide-ar.md` teaches owners to make several edits and then publish once.
  - A client who edits all day gets Personal ($9), priced into their retainer.

---

## 13. Hub site (`hub/`)

- **Purpose.** This is the link you send when someone asks "what have you built?". Its design bar is above every demo: a restrained editorial gallery in your studio identity (`studio.config.ts`, D7). Arabic first, with English at `/en/`.
- **Data.** No hand-maintained registry. The hub reads every `sites/*/site.config.ts` at build through `import.meta.glob`: `showcase.oneLiner`, `highlights`, niche, tier, country, `deploy.url` and `hubOrder`. A new site appears automatically.
- **Cards.** Each card shows:
  - a phone-frame screenshot (390 px) layered over a desktop screenshot (1440 px),
  - the brand name,
  - a niche label (عبايات، عطور، شوكولاتة، حلويات، كيك، صالون، حنّاء، توزيعات، مناسبات),
  - a tier badge: "متجر كامل بالدفع" (full) or "كتالوج + طلب واتساب" (lite),
  - the country,
  - the one-line description,
  - "افتحي النموذج" / "Open demo".
- **Filtering:**
  - A vanilla custom element over the server-rendered list, with chips for niche, tier and country.
  - State lives in the URL hash (`#niche=perfume&tier=full`), so a filtered view can be shared.
  - Static per-niche pages `/n/<niche>/` each get their own OG image (the brand pipeline), so a perfume prospect receives a link that previews in WhatsApp as "نماذج مواقع العطور".
- **Screenshots.** `pnpm hub:screens` runs Playwright (installed Chrome) against the deployed demos, or local builds with `--local`. Output goes to `hub/src/assets/screens/<site>-{390,1440}-{ar,en}.png`, and Astro `<Picture>` serves AVIF/WebP. The screens are refreshed whenever a site changes.
- **Contact.** A WhatsApp CTA to your number, with a prefilled "شفت نماذجك وأبي موقع لـ…". There is no pricing section by default (optional later).
- **Indexing** is on by default (D7). The hub is your real marketing site; the demos stay noindex.
- **Budget:** the same Lighthouse ≥ 90 gate. It is included in check-all as `hub`.

---

## 14. Build order and risks

### 14.1 Build order

**Step 1 (now).** This document, plus the per-site design plans (palette hexes, type pairing from [FONT §A5], hero archetype and signature element from §7.4) and the 13 brand identities. **Pause for your review and D1–D8.**

**Step 2: foundation.** Each item lands with tests.

| # | Work | Exit criterion |
|---|---|---|
| 2.0 | Environment: Node 24.21.0, pnpm 12.5.1, root config files, `.gitattributes`, `studio.config.ts` | `pnpm install` clean |
| 2.1 | **Spikes S1–S15** (§14.2) in a throwaway `sites/_spike`, deleted afterwards | Every spike is resolved or its fallback adopted, and this document is updated |
| 2.2 | `@aw/core` (types, schemas, money, time, hours, ids, KV) | Money, time and hours suites green |
| 2.3 | `@aw/i18n`, `@aw/whatsapp` | Formatting and builder snapshots green |
| 2.4 | `@aw/commerce` + `@aw/booking` logic (no UI) | Slots, fulfilment and pricing suites green |
| 2.5 | `@aw/presets`, `@aw/content`, `@aw/cms` | Every preset resolves; the CMS config validates |
| 2.6 | `@aw/brand` (tokens → CSS, contrast, coverage, logo/OG pipeline, photo grade) | Renders a test lockup and OG |
| 2.7 | `@aw/payments` (mock, cod full; others L1; zaincash L0) + stores (memory, blobs) | Adapter and store contract suites green |
| 2.8 | `@aw/seo`, `@aw/ui` (the pilot variants only), `@aw/astro` | A fixture site builds |
| 2.9 | `@aw/ops` (dashboard, OTP auth, outbox mailer) | E2E flows green on the fixture |
| 2.10 | Scripts: `site:sync`, `new-site`, `rebrand`, `check-all`, `run`, `extract`, `go-live` | The rebrand allow-list test is green |

**Step 3: pilots.**
1. **Site 02** first. It proves commerce full, GCC shipping, gift cards, stock and the Tap mock emulation.
2. Then **site 10**. It proves booking full, resources, cross-midnight hours, Hijri and the Moyasar mock emulation.
3. Run check-all, take screenshots at 390 and 1440 in both languages, write a self-critique, fix, and **pause for your review**.

**Step 4: the remaining eleven,** committing after each site. The order maximises reuse:
1. 01 (lite fashion, reuses 02)
2. 04 (IQD, COD, provinces)
3. 03 (large catalog, facets, branches, Credimax interstitial)
4. 05 (perfume, KNET, MyFatoorah)
5. 06 (slots, personalisation)
6. 09 (same-day cutoff, districts, PayTabs)
7. 12 (MOQ, tiers)
8. 08 (daily cap, upload, deposit)
9. 07 (menu, seasonal)
10. 13 (estimate builder)
11. 11 (booking lite + shop, windows)

Then the hub. Before finishing each site, remove one unnecessary decorative element, as the brief asks.

**Step 5: docs.** README, `adding-a-site.md`, `rebranding-for-a-client.md`, `payments.md`, `cms-guide-ar.md` (with GitHub account and 2FA steps), `handoff-checklist.md`, `image-credits.md` (generated).

### 14.2 Spikes (day 1 of Step 2)

| ID | Question | Fallback if it fails |
|---|---|---|
| S1 | Do Astro 7 dev and build work from a path containing spaces (`…\Shujaat Mallick\…\arabic websites`)? | `subst A:` drive or move to `C:\dev\arabic-websites` |
| S2 | Does a Sveltia `single_file` YAML entry with entry-relative images resolve through Astro `glob` + `image()`? Where are `i18n: false` fields written? How do singleton media paths work? | `multiple_files` for entries, or a `@content` Vite alias for media |
| S3 | Does the Arabic localStorage pre-seed give an RTL admin on first load (Chromium, iOS Safari)? What is the exact admin CSP origin list? | Document "switch language in Settings" in the CMS guide |
| S4 | What exact strings does Sveltia store for `value_type: float/string` (4.5 vs 4.500)? | Parser already tolerant; add a CMS pattern |
| S5 | Does `@netlify/vite-plugin` serve `netlify/functions` and a Blobs sandbox inside `astro dev` without the adapter? | `netlify dev --filter` |
| S6 | Does Netlify's esbuild bundle `.mts` wrappers that import workspace TypeScript under pnpm 12 (Linux) and from `netlify deploy` on Windows? | `nodeLinker: hoisted`; then plan B, the `@astrojs/netlify` adapter with `imageCDN: false` [AN §3] |
| S7 | Does `injectRoute` with `[...lang]` work, with a correct `Astro.currentLocale` and `getStaticPaths` in package components? | Generated 3-line page files per site |
| S8 | Does Astro CSP support an `is:inline` hash plus per-page extra directives (map facade, Credimax)? | A `netlify.toml` per-path CSP for those two routes |
| S9 | Does `compressHTML: true` render Arabic inline markup correctly (no lost spaces)? | Keep true; lint for split inline Arabic |
| S10 | What does the ignore command do on a first build? Do skipped builds cost 0 credits? Do per-site commit statuses work? | Adjust the guard |
| S11 | Astro Fonts: are the `arabic` subset names right? Can preload be filtered to one weight and subset? | Fontsource provider or manual `@font-face` |
| S12 | Does Tailwind `@source` reach `packages/**` `.astro` classes? | `@source inline()` safelist generated by `site:sync` |
| S13 | Can one GitHub OAuth App serve several Netlify sites through the Netlify OAuth provider? | One OAuth App per site (cheap) |
| S14 | Does `config.rateLimit` work on standalone functions? | A Blobs counter per IP |
| S15 | Under 10 concurrent holds, do Blobs strong reads + `onlyIfMatch` give exactly one winner? | Serialise through a per-day lock key with `onlyIfNew` |

### 14.3 Risks

| Risk | Likelihood / impact | Mitigation |
|---|---|---|
| Netlify credits run out and **every demo pauses** | Medium / high | Generated ignore rules, the `dev`-branch workflow, `[skip netlify]`, the D1 plan decision, and a credit watch in the `ship` script (warns when the month's production deploys pass 15) |
| Sveltia breaks in a minor release, or its single maintainer steps away | Medium / high | Exact pin, scheduled bump with the `--online` CMS smoke test, Decap-readable content, and the `target: 'decap'` generator path |
| Clients balk at GitHub accounts and 2FA | Medium / medium | Arabic guide with screenshots, a hands-on onboarding call, and the Decap Turbo fallback (D2) |
| pnpm + esbuild function bundling, or paths with spaces, on Windows | Medium / medium | Spikes S1 and S6 on day 1, before any package code |
| Site 03 build time (AVIF × 150 items) exceeds Netlify's limit | Medium / medium | WebP-only thumbnails, persisted image cache, measured in the pilot |
| Lighthouse variance near 90 | Medium / low | Median of 3, local Brotli server, budgets enforced below the thresholds |
| Gateway docs change or are unverifiable (ZainCash behind Cloudflare; several [U] items) | High / low for demos | L1 only against documented vectors. L2 happens with real sandbox accounts when a client signs. ZainCash stays L0 |
| **Dialect copy sounds machine-made** | High / high (it kills the pitch) | Native-speaker review of each site's key pages before showing it to prospects. Policies in formal MSA. The dialect overlays stay short |
| **An invented brand name collides with a real business** | Medium / high (non-negotiable 5) | Name-collision check in the design-plan review (C35), `-demo` hostnames, and no links to invented social handles |
| Invented phone numbers reach real people | Was high → low | Contact routing to your number (§11.6) |
| Stock photos show identifiable brands or people who didn't consent to commercial use | Medium / medium | Curation rules in `images:grade` (no visible logos, prefer products and hands), licence lock files, one grade per site |
| Legal: gift cards as stored value (CBK notice in Kuwait), PDPL retention, ZATCA e-invoicing in Saudi Arabia | Low for demos / medium live | No gift cards on the Kuwaiti demos. Go-live checklist items. Retention asked at handoff |
| Blobs' credit cost is undocumented | Low / low | Tiny volumes; watch the usage dashboard; the Supabase adapter exists |
| Astro 7's stricter compiler (invalid nesting kept as written) | Low / low | `astro check` + axe catch it; component tests render every variant |
