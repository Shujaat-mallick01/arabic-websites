# CMS research: Sveltia CMS vs Decap CMS

Written for Step 1 ("Plan first") of `arabic-websites-master-prompt.md`. Later build phases depend on this file.
Research date: **2026-09-23**. Nothing in this repo has been scaffolded yet.

## How to read this document

Each claim carries a confidence tag:

| Tag | Meaning |
|---|---|
| **[V]** Verified | Read today in a primary source: the official docs, the product's own source code or package, the npm registry, or the GitHub API. The URL is given. |
| **[L]** Likely | Strong inference from primary sources, but not observed end to end. |
| **[A]** Assumption / unverified | Reasoned guess or secondary source. **Prove it with a spike in Step 2 before relying on it.** |

**Primary sources used:**
- The full Sveltia CMS docs snapshot at `https://sveltiacms.app/llms-full.txt`, fetched today.
- The Sveltia npm package `@sveltia/cms@0.218.3` and its source map, which contains the original source.
- The Decap docs repo `decaporg/decap-website`, main branch as of 2026-09-22.
- The Decap source package `decap-cms-core@3.19.1`.
- The GitHub releases and issues APIs.
- Netlify docs, via their `.md` endpoints.
- Astro docs.

---

## 0. TL;DR

1. **Recommendation: Sveltia CMS, with the GitHub backend.** Decap is not a like-for-like fallback because it has **no Arabic UI locale and no RTL layout** [V]. That breaks non-negotiable #1, "Arabic admin UI".
2. **The brief's client auth path does not work with Sveltia.** The brief asks for Netlify Identity plus git-gateway. Sveltia does not support either and has no plans to [V]. Netlify has **deprecated Git Gateway** [V]. **Netlify Identity itself is still offered** on every credit-based plan [V]. Recommended client path: each client gets a free GitHub account, is added as a collaborator on **their own repo**, and signs in with "Sign in with GitHub". OAuth runs either through **Netlify's OAuth provider** (no extra infrastructure) or through the **Sveltia CMS Authenticator on Cloudflare Workers** (works on any host).
3. **Orders must not live in the Git CMS.** Keep them in a runtime store behind an `OrderStore` interface: Mock for demos, Supabase as the brief says, or Netlify Database / Blobs. Owners view orders on a separate authenticated page such as `/admin/orders/`. The CMS stores order *configuration* only: statuses, delivery slots, caps and closed days.
4. **Content layout for Astro:** use the `single_file` i18n structure (one YAML per entry, with `ar:` and `en:` keys) and **entry-relative media under `src/`**. That way Astro's `image()` can optimise uploads to AVIF/WebP. Astro never optimises images in `public/` [V].
5. **Sharing config across 13 sites:** generate each site's `public/admin/config.yml` (or `.json`) at build or scaffold time from TypeScript builders in `packages/cms`. Sveltia can also merge several `<link rel="cms-config-url">` files, and it concatenates arrays [V].
6. **Admin UI language:** Sveltia ignores the `locale` config option and follows the browser [V]. To default to Arabic, `public/admin/index.html` should pre-seed Sveltia's preference key in localStorage. This relies on an undocumented internal, which I verified in the source [V].

---

## 1. Versions and project health (checked 2026-09-23)

| | Sveltia CMS | Decap CMS |
|---|---|---|
| Latest npm | `@sveltia/cms` **0.218.3**, published 2026-09-23 [V] (`npm view`) | `decap-cms-app` **3.16.3**, 2026-09-22; `decap-cms-core` 3.19.1 [V] |
| Status | **Beta.** "version 1.0 (GA) scheduled for release in late 2026" [V] https://sveltiacms.app/en/docs | Stable 3.x. Very active: 3.12 to 3.16 all shipped in 2026 [V] https://github.com/decaporg/decap-cms/releases |
| Breaking changes | Possible in **minor** versions until 1.0 [V] https://sveltiacms.app/en/docs/releases | Semver 3.x |
| Maintainer | Effectively one person. The authenticator README calls it "nothing more than @kyoshino's personal project" [V] https://github.com/sveltia/sveltia-cms-auth. This is a bus-factor risk. | Company-backed ("PM, poslovni mediji d.o.o.") with a paid add-on, Decap Turbo [V] https://decapcms.org/turbo/ |
| Distribution | CDN IIFE from unpkg; auto-updates unless pinned [V]. One npm package [V]. | CDN or many npm packages |

---

## 2. Requirement matrix: the brief's "CMS requirements"

S = supported, P = partial, U = unsupported, NS = possible but not sensible.

| # | Brief requirement | Sveltia | Decap | Key sources |
|---|---|---|---|---|
| 1 | Admin at `/admin` on every site | **S** [V]. A static `public/admin/index.html` plus `config.yml`. Do *not* use `src/pages/admin.astro`, because the local workflow would reload-loop [V]. | **S** [V] | https://sveltiacms.app/en/docs/start · https://sveltiacms.app/en/docs/workflows/local · https://decapcms.org/docs/install-decap-cms/ |
| 2 | Arabic admin UI | **S with a caveat** [V]. `ar` is a shipped UI locale; I count about 894 of 1,001 keys translated, and missing keys fall back to English [V, own count]. The UI language is **auto-detected from the browser**, and the `locale` option is ignored. See §3.7 for the workaround. | **U** [V]. There is no `ar` in `decap-cms-locales` (it has `fa` and `he`). The only route is a DIY `CMS.registerLocale('ar', …)` with all strings translated by us. | https://sveltiacms.app/en/docs/ui#localization · https://github.com/sveltia/sveltia-cms/blob/main/src/lib/locales/ar.yaml · https://github.com/decaporg/decap-cms/tree/main/packages/decap-cms-locales/src · https://decapcms.org/docs/configuration-options/#locale |
| 3 | RTL admin | **S** [V]. "The application layout automatically adjusts to support right-to-left (RTL) languages such as Arabic." Content fields get `dir="rtl"` for RTL locales (source: `getTextDirection` → `isRTL(locale)`). | **U** [V]. Issue #1769, "add right-to-left layout support", has been open since 2018. #2524, "Support RTL in the Preview pane", is also open. `decap-cms-core@3.19.1` contains no RTL code. | https://sveltiacms.app/en/docs/successor-to-netlify-cms · https://github.com/decaporg/decap-cms/issues/1769 · https://github.com/decaporg/decap-cms/issues/2524 |
| 4 | Collections per preset: products/services, collections, offers, gallery, reviews, pages, site settings | **S** [V]. Entry collections, file collections and **singletons** (top-level). Adds `icon`, `divider` and `limit`. | **S** [V]. Folder and file collections; no singletons concept. | https://sveltiacms.app/en/docs/collections · https://sveltiacms.app/en/docs/collections/singletons · https://decapcms.org/docs/collection-folder/ |
| 5 | "orders where the tier has them" | **NS**. Orders are runtime data; see §3.10. | **NS** | §3.10 |
| 6 | Field-level Arabic labels and helper text | **S** [V]. `label`, `hint` (below the input, basic Markdown), `comment` (between label and input), plus `before_input` / `after_input` on number and string fields. The UI chrome is Arabic too. | **S** [V]. `label` and `hint`. The UI chrome stays English, so screens are mixed language. | https://sveltiacms.app/en/docs/fields · https://decapcms.org/docs/widgets/ |
| 7 | Editorial workflow on | **S** [V]. **GitHub and GitLab only**; not Gitea/Forgejo, the local workflow, or the Test backend. `publish_mode` can be set per collection. `publish: false` and `delete: false` are available. | **S** [V]. GitHub, GitLab, Bitbucket and git-gateway; Forgejo/Codeberg since 3.15.0. | https://sveltiacms.app/en/docs/workflows/editorial · https://decapcms.org/docs/editorial-workflows/ |
| 8 | Media library configured | **S** [V]. Asset Library, `asset_collections`, per-collection, per-file and per-field folders, entry-relative folders, 10 external providers, stock-photo search. | **S** [V]. Media library, Cloudinary/Uploadcare, collection-level relative folders. | https://sveltiacms.app/en/docs/media · https://sveltiacms.app/en/docs/media/internal · https://decapcms.org/docs/collection-folder/ |
| 9 | Image uploads auto-resized | **S** [V]. `media_libraries.all.transformations`: converts to **WebP only**, `quality`, max `width`/`height`, SVGO minify, and **HEIC→WebP for phone photos**. No AVIF, because browsers cannot encode it. | **S since 3.16.0** (2026-08-31) [V]. `media_processing`: JPEG or WebP output, width/height, quality, `aspect_ratio` centre-crop, `strip_metadata`. JPEG/PNG/WebP input only; no HEIC. | https://sveltiacms.app/en/docs/media#image-optimization · https://decapcms.org/docs/configuration-options/#media-processing · https://github.com/decaporg/decap-cms/releases/tag/decap-cms%403.16.0 |
| 10 | Preview of an edit before publishing | **P** [V]. Live preview pane with `registerPreviewTemplate` (React class components) and `registerPreviewStyle`. Deploy-preview links for unpublished entries in the editorial workflow. Live-site rendering is **an explicit non-goal**. | **P** [V]. Same APIs and deploy-preview links. The preview pane has no RTL (#2524). | https://sveltiacms.app/en/docs/ui/content-editor#preview-pane · https://sveltiacms.app/en/docs/workflows/deploy-previews · https://decapcms.org/docs/customization/ · https://decapcms.org/docs/deploy-preview-links/ |
| 11 | "GitHub backend for me" | **S** [V]. Personal access token (PAT) or OAuth; GraphQL; signed commits. | **S** [V] | https://sveltiacms.app/en/docs/backends/github · https://decapcms.org/docs/github-backend/ |
| 12 | "Netlify Identity / git-gateway for clients" | **U** [V]. Not supported and not planned: "we still don't plan to support it … due to the lack of Git Gateway support". An alternative, "Sveltia CMS Additions", is on the v1.0 roadmap but not shipped. | **P** [V]. Works (`backend: git-gateway` plus the Identity widget), but **Git Gateway is deprecated by Netlify**. | https://sveltiacms.app/en/docs/migration/netlify-decap-cms · https://docs.netlify.com/manage/security/secure-access-to-sites/git-gateway/ |
| 13 | `docs/cms-guide-ar.md` with screenshots | **S**. Screenshots can show a fully Arabic UI. | **P**. Screenshots would show English UI chrome. | follows from rows 2–3 |

**Beyond the brief's list**, which the task also asked for:

| Capability | Sveltia | Decap | Sources |
|---|---|---|---|
| i18n `multiple_files` / `multiple_folders` / `single_file` | **S**, plus `single_file_default_root`, `multiple_root_folders`, and a `{{locale}}` placeholder anywhere in `folder`. File collections support every structure via `{{locale}}` in `file`. [V] | **S**, but file collections are **`single_file` only**, and list widgets accept only `i18n: true` (per-subfield i18n is ignored). [V] | https://sveltiacms.app/en/docs/i18n/structures · https://decapcms.org/docs/i18n/ |
| Relation widget | **S**. Inline "Add" of related entries, cascading renames and deletes, backlinks panel, templated `filters`, `{{locale}}/{{slug}}` value fields. [V] | **S**. `filters` since 3.1.5; `options_length`. [V] | https://sveltiacms.app/en/docs/fields/relation · https://decapcms.org/docs/widgets/relation/ |
| List / object widgets | **S**. `field`, `fields` or `types` (variable types), `summary`, `thumbnail`, `collapsed`, `min`/`max`, `add_to_top`, `allow_*`; object i18n per subfield. [V] | **S** (list, object, variable types); i18n limits as above. [V] | https://sveltiacms.app/en/docs/fields/list · https://sveltiacms.app/en/docs/fields/object · https://decapcms.org/docs/widgets/list/ |
| Hidden field | **S**. `default` supports `{{locale}}`, `{{datetime}}`, `{{uuid*}}` and `{{author-*}}`. [V] | **S** (`default`). [V] | https://sveltiacms.app/en/docs/fields/hidden · https://decapcms.org/docs/widgets/hidden/ |
| Read-only field | **S**. A common `readonly` option, plus Compute and UUID fields. [V] | **U**. No `readonly` in the `configSchema.js` of decap-cms-core 3.19.1; a UUID widget arrived in 3.15.0. [V] | https://sveltiacms.app/en/docs/fields#readonly |
| Price-friendly number | **S**. `value_type: float/string` stores the decimal *as a string*; `step`, `min`, `after_input`. [V] | **P**. `int`/`float` only; Sveltia notes that Decap's documented string type "actually doesn't work". [V per Sveltia] | https://sveltiacms.app/en/docs/fields/number |
| Config loading | `config.yml`, `.toml` or `.json`. **Several `<link rel="cms-config-url">` files are deep-merged, with arrays concatenated** (`merge.all` from `deepmerge`, confirmed in source). `CMS.init({config})`, `load_config_file: false`, a TypeScript `CmsConfig` type and a JSON Schema. [V] | One `config.yml` (custom path via one link tag). `init({config})` merges, and **arrays are replaced**. `load_config_file: false`. [V] | https://sveltiacms.app/en/docs/config-basics · https://sveltiacms.app/en/docs/api/initialization · https://decapcms.org/docs/manual-initialization/ |
| Mobile editing | Fully responsive, **QR-code "Sign In with Mobile"**, installable PWA. [V] | Collections, workflow and media views made responsive in 3.14.0. [V] | https://sveltiacms.app/en/docs/ui#mobile-support |
| Test / demo backend | `test-repo` in the browser's origin private file system (OPFS). **Starts empty**; simple workflow only. [V] | `test-repo` in memory; starts empty; lost on reload. [V] | https://sveltiacms.app/en/docs/backends/test · https://decapcms.org/docs/test-backend/ |
| Local editing | "Work with Local Repository" (Chromium File System Access API), no proxy. `local_backend` is ignored. [V] | `local_backend` plus the `decap-server` proxy. | https://sveltiacms.app/en/docs/workflows/local |

---

## 3. Detailed findings

### 3.1 Backends

- **Sveltia** supports **GitHub, GitLab, Gitea/Forgejo (including Codeberg) and Test** [V]. It does *not* support **Git Gateway, Bitbucket or Azure DevOps**, "for performance reasons". `CMS.registerBackend` is a no-op [V]. Sources: https://sveltiacms.app/en/docs/backends · https://sveltiacms.app/en/docs/migration/netlify-decap-cms
- **Decap** supports GitHub, GitLab, Gitea (plus Forgejo/Codeberg with editorial workflow since 3.15.0), Bitbucket, Azure, Git Gateway and the hosted **Decap Turbo** backends `turbo-github` / `turbo-gitlab` [V]. Source: https://decapcms.org/docs/backends-overview/
- Both default to the repo's configured branch.
- Sveltia's `skip_ci: true` adds `[skip ci]` to CMS commits and offers "Save and Publish" to trigger a deploy on purpose [V]. This saves Netlify build credits when an owner makes many small edits. Source: https://sveltiacms.app/en/docs/deployments

### 3.2 Authentication

**Netlify Identity and Git Gateway status (Netlify's own docs, read today):**

- **Git Gateway:** "Git Gateway is deprecated. While Git Gateway continues to function for sites that currently have it enabled, new Git Gateway configurations are not recommended. While we will keep fixing any major security issues that arise, we will no longer fix bugs in the functionality of Git Gateway." [V] https://docs.netlify.com/manage/security/secure-access-to-sites/git-gateway/
  - The docs do not say whether it can still be *technically* enabled on a brand-new site [A].
- **Netlify Identity:** "Identity is available on all credit-based plans at no additional cost". Unlimited active and invite-only users; there is a new `@netlify/identity` package. The page was last updated 2026-03-30 and carries **no deprecation notice** [V]. https://docs.netlify.com/manage/security/secure-access-to-sites/identity/overview/
  - History: Netlify announced Identity's deprecation on 2025-02-28 [V, per https://github.com/sveltia/sveltia-cms/discussions/284]. That changelog URL (https://www.netlify.com/changelog/deprecation-netlify-identity/) now returns **404** [V]. Sveltia's docs say Identity "has since been revived by Netlify" [V].
  - Net result: **Identity is alive, but the piece Decap needs for Git-account-free editing (Git Gateway) is deprecated.**
- Decap's own docs still present Identity plus Git Gateway as the default path, with **no deprecation warning** [V]. https://decapcms.org/docs/choosing-a-backend/ · https://decapcms.org/docs/git-gateway-backend/

**Auth options, ranked for a non-technical Gulf shop owner:**

| Option | CMS | Client needs | Infra | Status |
|---|---|---|---|---|
| A. GitHub OAuth via **Netlify's OAuth provider** | Sveltia (the default when `base_url` is unset) and Decap | Free GitHub account, collaborator with **write** role on their repo | None: register one GitHub OAuth App (callback `https://api.netlify.com/auth/done`) and paste its Client ID/Secret into each Netlify site under *Project configuration → Security → OAuth* | [V] https://sveltiacms.app/en/docs/backends/github#using-netlify · https://docs.netlify.com/manage/security/secure-access-to-sites/oauth-provider-tokens/ . One OAuth App can serve all sites because the callback is the same: [L]. |
| B. GitHub OAuth via **Sveltia CMS Authenticator** (Cloudflare Worker) | Sveltia (Decap-compatible) | Same as A | One Worker for all sites. Set `ALLOWED_DOMAINS` to a comma list of every site hostname (wildcards like `*.example.com` are allowed); set `backend.base_url` to the Worker URL | [V] https://github.com/sveltia/sveltia-cms-auth. Host-independent, so it survives leaving Netlify. |
| C. GitLab **PKCE** (client-side, no server) | Sveltia and Decap | Free GitLab account | Register one GitLab OAuth app; set `auth_type: pkce` and `app_id` | [V] https://sveltiacms.app/en/docs/backends/gitlab. Recommended by Sveltia for non-technical GitLab users. |
| D. Personal access token | Sveltia (the "Sign In with Token" dialog pre-fills scopes) | A token pasted into the browser | None | [V]. Fine **for me**; Sveltia says it is not recommended for non-technical users. |
| E. **GitHub PKCE** | Neither | — | — | **Unavailable** [V]. GitHub put client-side PKCE for SPAs "on hold" (https://github.com/orgs/community/discussions/15752, https://github.com/github/roadmap/issues/1153). |
| F. Netlify Identity + Git Gateway (email/password, **no Git account**) | **Decap only** | Email invite | Enable Identity + Git Gateway per site | Works, but Git Gateway is deprecated with no bug fixes [V]. |
| G. **Decap Turbo** (hosted auth, email invites, **no Git account**, roles) | **Decap only** | Turbo account via invite | SaaS | **Public preview** [V]. Free: 1 site + 1 seat. Pro: €19/mo for 1 site + 5 seats, €10/extra site, €6/extra seat. Pro is free until 2026-10-15, then a 14-day trial. Free has a 2,500 proxy requests/day ceiling. https://decapcms.org/turbo/ · https://decapcms.org/docs/turbo-billing/ |
| H. Local repository mode | Sveltia | Chromium browser + a local git clone | None | [V]. **Developer-only.** It makes no git commits itself. |
| I. "Sveltia CMS Additions" (users and roles without a Git account; commits without a Git service account; Cloudflare Workers) | Sveltia | — | — | **Roadmap for v1.0, "late 2026". Not shipped** [V]. https://sveltiacms.app/en/docs/roadmap |

**Frictions for the client:**
- **GitHub 2FA.** GitHub requires 2FA for "users who contribute code". Accounts are enrolled in waves, with 45 days to comply plus a 7-day grace period [V]. https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/about-mandatory-two-factor-authentication
  - Whether a CMS-only committer gets enrolled is unclear [A]. Plan for it: document setting up the **GitHub Mobile app or a TOTP app** in `cms-guide-ar.md`.
  - A community thread mentions a "May 2, 2026" deadline, but that was one user's personal enrolment notice, not a universal rule [V].
- **Invitations.** A GitHub OAuth token with the default `repo` scope covers everything the editorial workflow needs [V]. A client must accept the collaborator invite first; a personal-account repo can only grant write access [V]. https://sveltiacms.app/en/docs/workflows/editorial#requirements

### 3.3 Editorial workflow

- **Sveltia** [V] (https://sveltiacms.app/en/docs/workflows/editorial):
  - `publish_mode: editorial_workflow`, at top level *or per collection*. Singletons always follow the top level.
  - Each entry gets a branch `cms/<collection>/<slug>` and a PR. Draft entries are GitHub **draft PRs**.
  - Labels are `sveltia-cms/draft`, `pending_review`, `pending_publish` and `pending_deletion`. `cms_label_prefix` changes the prefix.
  - `squash_merges: true` is available.
  - Drafts may be saved with required fields empty. **Astro Zod schemas must tolerate that on deploy previews, or preview builds go red.**
  - Deleting a published entry opens a deletion PR; there is no "Unpublish" as in Decap.
  - Inline "Add related entry" is disabled under the workflow.
- **Decap** [V] (https://decapcms.org/docs/editorial-workflows/): the same PR model, and it also works through git-gateway.
- **UX cost for one owner-editor:** each edit becomes Save → (Send for review) → Publish. Each draft PR triggers Netlify deploy previews, which cost build credits [L]. **Recommendation:** enable the workflow for catalogue collections (products, offers, pages), where preview matters. Keep `simple` for operational singletons such as hours, closed days and contact details, where speed matters. Put that per-collection split in the plan.
- **Monorepo risk [A]:** in the demo monorepo, 13 CMS instances would share one repo. Branch names `cms/products/<slug>` could collide between sites, and each site's workflow board may list other sites' PRs. Mitigations: per-site `cms_label_prefix`, per-site unique collection `name`s such as `p02_products`, or (best) keep editorial workflow off for demos and on for client repos. **Spike this in Step 2.**

### 3.4 Preview

- **In-editor preview pane:**
  - **Sveltia:** a two-pane editor. Arabic UI swaps the panes. Scroll sync, click-to-highlight, and preview disabled via `editor.preview: false` at global, collection, file or field level [V] (https://sveltiacms.app/en/docs/ui/content-editor#preview-pane).
  - **Custom templates:** `CMS.registerPreviewTemplate(name, ReactClassComponent)`. Props: `entry` (Immutable; default-locale data plus `i18n.<locale>.data`), `widgetFor`, `widgetsFor`, `getAsset`, `getCollection`, `fieldsMetaData`, and the iframe's `document`/`window` [V] (https://sveltiacms.app/en/docs/api/preview-templates).
  - Templates can use `h`/`createClass` without JSX. The preview is a **sandboxed iframe**, so styles must come in via `CMS.registerPreviewStyle(url | cssString, {raw:true})` [V] (https://sveltiacms.app/en/docs/api/preview-styles).
  - Sveltia may be incompatible with *undocumented* Decap template props [V].
  - **Decap** has the same two APIs [V] (https://decapcms.org/docs/customization/), with no RTL in the preview pane (#2524).
- **True site rendering:**
  - **Neither CMS renders the real Astro components.** Sveltia states that live site preview is a non-goal [V].
  - A React preview template means re-implementing product cards in React. **Recommendation:** at most one lightweight RTL preview template per key collection (a product card using the site's built CSS tokens). Rely on deploy previews for full fidelity.
- **Deploy previews:**
  - **Sveltia** [V] (https://sveltiacms.app/en/docs/workflows/deploy-previews): needs GitHub/GitLab, a CI provider reporting commit statuses, check runs or deployments, and a `preview_path` per collection.
    - It links unpublished entries to the PR's preview and shows "Building…" / "Build Failed" badges.
    - In the simple workflow it links to the live site and shows whether the build is finished.
    - `preview_context` pins the exact status name.
    - It ignores canceled or skipped monorepo builds.
    - The i18n option `omit_default_locale_from_preview_path` keeps Arabic at root.
  - **Decap** [V] (https://decapcms.org/docs/deploy-preview-links/): works only in the editorial workflow, and the status must contain "deploy".
  - **Netlify** posts GitHub commit statuses (with the preview link), PR comments and commit checks by default [V] (https://docs.netlify.com/deploy/deploy-notifications/).
    - **Monorepo gotcha:** by default only one linked site may report per repo. Set *Team settings → Notifications → Commit status webhooks → "Multiple webhooks per repo"* [V] (https://docs.netlify.com/build/configure-builds/monorepos/).
    - Use per-site `ignore` commands so a CMS commit to site 05 does not rebuild all 13 [V] (https://docs.netlify.com/build/configure-builds/ignore-builds/).
    - The Netlify status context is `netlify/<site-name>/deploy-preview` [A]. Set Sveltia's `preview_context` to the site name, which is matched partially and case-insensitively [V].

### 3.5 i18n structures and how Astro reads them

**The structures** [V] (https://sveltiacms.app/en/docs/i18n/structures, https://decapcms.org/docs/i18n/):

| Structure | On-disk shape | Sveltia | Decap |
|---|---|---|---|
| `single_file` | `products/<slug>.yml` with top-level `ar:` / `en:` keys | S | S (the only one for file collections) |
| `single_file_default_root` | Default locale at root, `en:` nested, auto `lang: [..]` | S | U |
| `multiple_files` | `products/<slug>.ar.yml` + `<slug>.en.yml` | S | S (entry collections only) |
| `multiple_folders` | `products/ar/<slug>.yml` + `products/en/<slug>.yml` | S | S (entry collections only) |
| `multiple_root_folders` / `{{locale}}` in `folder` | `ar/products/…` or `content/{{locale}}/products` | S | U |

Other i18n settings:
- Top level: `i18n: { structure, locales: [ar, en], default_locale: ar }`. With no `default_locale`, the first locale in the list is the default.
- Per field: `i18n: true | false | duplicate`.
  - `false` stores only the default locale's value and hides the field in `en`.
  - `duplicate` copies the value and makes it read-only in `en`.
  - [V] https://sveltiacms.app/en/docs/i18n/options
- **Sveltia requires every required field in *every* locale** (Decap requires it only in the default locale). To make English optional for client edits, use `required: [ar]` [V]. https://sveltiacms.app/en/docs/migration/netlify-decap-cms#content-editing-experience
- The optional one-click translation button needs the user's own Google, Anthropic or OpenAI key [V]. https://sveltiacms.app/en/docs/integrations/translations

**How Astro (v7; content layer with `glob()`/`file()` loaders [V] https://docs.astro.build/en/guides/content-collections/) consumes each structure:**

- **`single_file` (recommended).** Loader: `glob({ pattern: '**/index.yml', base: '…/products' })`. Use a custom `generateId`, e.g. `({entry}) => entry.split('/')[0]`, because each entry sits in its own folder (`path: '{{slug}}/index'`).
  - Schema sketch: `({ image }) => z.object({ ar: ProductAr.extend({ images: z.array(image()) }), en: ProductEn })`.
  - Non-translatable fields (`i18n: false`) are written only under the default-locale key `ar:` [L; confirm with a fixture]. Read them from `data.ar`.
  - Pages render via `data[lang] ?? data.ar`.
  - Media sits beside the YAML, so Astro's `image()` resolves the relative path [V for Markdown frontmatter; **[A] for YAML data entries**, so confirm in Step 2].
- **`multiple_files`.** Astro's default ID generation slugifies the path. `about.ar.yml` would likely lose the dot and collide into something like `aboutar` [A]. **Always pass a custom `generateId`** that splits off `.ar` / `.en`.
- **`multiple_folders`.** IDs come out as `ar/<slug>` and `en/<slug>`, so it is easy to filter by prefix. **But** entry-relative media is stored only in the default locale's folder, and the `en` file references it by the same relative path [V]. Astro's relative `image()` resolution from `en/<slug>/…` would then break [L]. Sveltia itself warns: "If your framework has no equivalent mechanism, prefer `single_file` or `multiple_files`" [V].
- **Singletons / site settings.** Use one JSON or YAML file per singleton. JSON is recommended so `scripts/rebrand.ts` can edit it with `JSON.parse`/`stringify` without a YAML round-trip, and Astro/TS can import it directly [L]. Read it with the `file()` loader or a direct import.

**Slugs for Arabic titles:**
- Sveltia's default slug encoding is `unicode`, which gives Arabic filenames and URL-encoded URLs [V].
- Alternatives: `encoding: ascii` + `clean_accents` (transliteration via `transliterate`; Arabic output quality [A]), `{{uuid_short}}`, or `slug: '{{fields._slug}}'` so the owner or I type a Latin slug [V]. https://sveltiacms.app/en/docs/collections/entries/slugs
- **Recommendation:** `{{fields._slug}}` with a hint in Arabic, defaulting to a transliteration pre-filled by the scaffold.

### 3.6 Media library and image optimisation

- **Astro constraint:** "Images stored in the `public/` folder are never optimized". Content-collection images must be **relative paths** passed through `image()` to get AVIF/WebP and srcsets [V]. https://docs.astro.build/en/guides/images/
  - So CMS uploads for products and gallery belong in `src/`, entry-relative (`media_folder: ''`, `public_folder: ''`, `path: '{{slug}}/index'`). Both CMSes support that [V] (https://sveltiacms.app/en/docs/media/internal#using-entry-relative-folders, https://decapcms.org/docs/collection-folder/).
  - Deleting an entry deletes its entry-relative media in Sveltia [V].
  - Brand files, the favicon and OG images can stay in `public/`.
- **Upload-time optimisation** (Sveltia, run in the browser) [V] https://sveltiacms.app/en/docs/media#image-optimization

  ```yaml
  media_libraries:
    all:
      max_file_size: 8000000
      slugify_filename: true
      transformations:
        raster_image: { format: webp, quality: 85, width: 2048, height: 2048 }
        heic: { format: webp, quality: 82, width: 1600, height: 1600 }
        svg: { optimize: true }
  ```

  - `width`/`height` are maximums; smaller images are not upscaled.
  - Exif is stripped, and so is GPS data. That is good for owners' phone photos [V].
  - HEIC decoding downloads about 300 KB of WASM from unpkg on first use. It needs `worker-src blob:` in the admin CSP [V].
  - This complements Astro's build-time AVIF/WebP rather than replacing it.
- **Decap equivalent** [V] https://decapcms.org/docs/configuration-options/#media-processing

  ```yaml
  media_processing: { enabled: true, format: { enabled: true, default: webp }, quality: 80, width: 1600 }
  ```

  It can be set per field and adds an `aspect_ratio` crop. It does not handle HEIC.
- **Sveltia extras** [V]:
  - Stock-photo search: Pexels, Pixabay, Unsplash. Keep licence attribution in `docs/image-credits.md`.
  - External storage such as Cloudflare R2, S3 or Cloudinary if repo size becomes a problem. Site 03 has 150+ products; Git LFS is **not** supported on GitHub [V].

### 3.7 Admin UI locale and RTL

- **Sveltia:**
  - Arabic is listed as an available UI language [V] (https://sveltiacms.app/en/docs/ui#localization). Layout mirrors for RTL [V].
  - The locale is **Automatic by default (browser language)**. "The `CMS.registerLocale` API method is a noop and the `locale` configuration option is ignored in Sveltia CMS." [V]
  - Non-English strings are fetched at runtime from `https://unpkg.com/@sveltia/cms@<version>/locales/<locale>.json` with a 5-second timeout. On failure the UI falls back to English, so the admin CSP needs `connect-src https://unpkg.com` even when self-hosting [V, source `src/lib/services/app/i18n.js`].
  - **Workaround to default to Arabic** [V from source `src/lib/services/user/prefs.svelte.js`; undocumented, so treat as fragile]. Preferences live in `localStorage['sveltia-cms.prefs']` (JSON), and `getStoredLocale()` reads `.locale` synchronously at start-up. `public/admin/index.html` can run this *before* the CMS script:

    ```html
    <script>
      try {
        var k = 'sveltia-cms.prefs', p = JSON.parse(localStorage.getItem(k) || '{}') || {};
        if (!p.locale || p.locale === 'auto') { p.locale = 'ar'; localStorage.setItem(k, JSON.stringify(p)); }
      } catch (e) {}
    </script>
    ```

    Users can still switch in Settings. Re-check this after each Sveltia upgrade; `check-all` could smoke-test that the login screen renders `dir="rtl"`.
- **Decap:** no Arabic (confirmed by listing `packages/decap-cms-locales/src`) and no RTL layout [V]. A DIY Arabic phrase file could translate the strings, but the layout would stay LTR.

### 3.8 Widgets relevant to the presets

**Relation fields.**
- Example uses: products → collections/categories, packages → add-ons, services → staff.
- In Sveltia, the default `value_field: '{{slug}}'` gets cascading renames and deletes plus the backlinks panel [V].
- Filters can reference the current entry: `{{fields.x}}` [V].

**Lists and objects.** Uses across the presets:
- Hours are a list of `{day, open, close}`. Cross-midnight hours such as 14:00–02:00 are handled in code, not the CMS.
- The shipping table is a list of `{region, fee, eta}`, plus sizes, the note pyramid (top/heart/base as an object of lists), package inclusions, bulk-price tiers and closed days.
- Use `summary` and `collapsed` so owners see readable rows [V].
- Variable-type lists (`types`) can power flexible home-page sections [V].

**Hidden and read-only fields.**
- Use `widget: hidden` with `default: '{{uuid_short}}'` for stable product IDs used in carts and WhatsApp messages [V].
- Use `readonly: true` for scaffold-set values such as currency code, country and tier. The brand editor should not change these [V].
- Decap has no `readonly` [V].

**Money.** The brief wants minor units, with no rounding in the UI.
- Sveltia `widget: number, value_type: float/string` stores the price as a **string** [V], e.g. `"4.500"`.
- A build-time parser in `packages/commerce` converts the string to integer minor units using the currency's decimals (BHD, KWD, OMR = 3; SAR, AED, QAR = 2; IQD = 0).
- Add `step: 0.001` / `0.01` / `250` and `after_input: 'د.ب'` for the owner.
- Whether trailing zeros are preserved exactly as typed is [A]. The parser must not care: parse the string, reject more decimals than the currency allows, then multiply using integer maths.

### 3.9 Config loading: sharing fragments across 13 sites

**Constraints.**
- The admin must be a static page: `public/admin/index.html` plus config [V].
- The config is public, so it must hold no secrets [V].

**Options.**
1. **Build-time generation (recommended).**
   - `packages/cms` exports typed builders: `productCollection(preset, currency, labelsAr)`, `siteSettingsSingleton(…)`, and so on. It uses Sveltia's exported `CmsConfig` type [V].
   - `pnpm new-site` and a prebuild step emit `sites/<site>/public/admin/config.yml` (or `.json`).
   - Advantages: it works with the local workflow, keeps each site's config readable, can be diffed in PRs, and can be validated against Sveltia's JSON Schema (`https://unpkg.com/@sveltia/cms/schema/sveltia-cms.json`) in `check-all`.
   - The same field definitions can also generate the site's Astro Zod schemas, giving a single source of truth [A: design proposal].
2. **Multiple config files.** Add `<link rel="cms-config-url">` tags, e.g. a shared `collections/products.yml` plus a site `config.yml`. They are merged with deepmerge and **arrays are concatenated** [V, confirmed in source `merge.all(objects)`].
   - Limits: YAML anchors do not cross files, and editor schema validation flags partial files [V].
   - It still needs per-site values such as labels, currency and paths, so it only works well for truly generic fragments.
3. **`CMS.init({ config: {...}, load_config_file: false })`** from a bundled script [V].
   - This needs a bundling step for the admin entry. Astro would treat an `.astro` admin page as a page, which breaks the local workflow [V]. A tiny Vite build or copying a prebuilt file is required.
   - Use it only if dynamic config is needed.

**Other settings for every site:**
- `app_title` and `logo.src`, so the admin carries the brand name [V] (https://sveltiacms.app/en/docs/customization).
- Optionally a `nc-root` mount element with a thin header linking to the orders dashboard [V].
- **Pin the CMS version**, because pre-1.0 minors can break. `https://unpkg.com/@sveltia/cms@^0.218.3/dist/sveltia-cms.js` (caret on 0.x means patch-only) or an exact version bumped deliberately by a script [L on unpkg semver-range behaviour]. Sveltia's docs discourage exact pins for security reasons [V], so bump on a schedule.

### 3.10 Orders: why not a Git CMS collection, and what to do instead

**Why a Git "orders" collection is wrong for live orders:**
- **Who writes the data.** Orders are created by *customers at runtime*. A Netlify Function would have to commit to the repo with a stored token.
- **Deploy cost.** Every order commit triggers a production build and deploy, costing build credits and minutes, unless it is marked `[skip ci]`.
- **Personal data.** Customer names, phone numbers and addresses would sit **permanently in Git history**. That is a privacy liability under the GCC data-protection laws [A: legal characterisation] and is irreversible without rewriting history.
- **Correctness.** There are no atomic counters or queries. GitHub API rate limits and concurrent writes cause conflicts, so daily caps and stock limits cannot be enforced correctly.
- **Owner experience.** The CMS has no status workflow for orders (new, paid, shipped). The editorial workflow is for content, not operations.

**Recommended alternative** (fits the brief's own "optional `full` tier: Supabase … behind an interface"):
- `packages/commerce` (and `packages/booking`) define an `OrderStore` / `BookingStore` interface: `create`, `get`, `list(filter)`, `updateStatus`, `countForDate`.
- Adapters:
  - `MockStore`. The default for demos: seeded sample orders, in memory or in browser storage for the demo dashboard.
  - `SupabaseStore`. Postgres with row-level security; owner login via Supabase Auth email OTP or magic link. This is the brief's choice.
  - Optionally `NetlifyDatabaseStore`, a managed Postgres on credit-based plans [V] (https://docs.netlify.com/build/data-and-storage/netlify-database/).
  - Or `NetlifyBlobsStore`, a key/value store where "the last write wins". Netlify's docs point anything that needs "complex queries, concurrency control, or a relational data model" to database vendors instead [V] (https://docs.netlify.com/build/data-and-storage/netlify-blobs/). It suits only tiny volumes.
- Netlify Functions: `checkout-session`, `payment-webhook` and `order-notify`. The notification sends an email and a WhatsApp deep link to the owner. Functions validate against the **static** rules the CMS publishes, such as the shipping table, lead times and slot definitions, and against **runtime** counts from the store, such as the daily cap.
- The **owner dashboard** is a separate static route, e.g. `/admin/orders/`, a small island that authenticates against the store's auth.
  - Supabase Auth, or Netlify Identity, which is alive, for Blobs/Database.
  - Link to it from the CMS header via `nc-root`, and from the CMS guide.
- **The Git CMS keeps order *configuration*.**
  - This covers: order status labels, notification email and WhatsApp number, delivery zones and fees, time slots, lead-time rules, daily caps, booking windows, and closed or blackout days.
  - The guide item "how to close a booking day" becomes a CMS list edit. It takes effect after the rebuild, about 1–3 minutes [A], and runtime cap checks still apply.
- **lite tier:** no order store. The WhatsApp message *is* the order.

### 3.11 Admin security and CSP (Netlify `_headers` / `netlify.toml`)

- Give `/admin/*` its **own, looser CSP**, separate from the strict site CSP.
- Sveltia's base policy [V] (https://sveltiacms.app/en/docs/security):

  ```
  script-src 'self' https://unpkg.com
  connect-src 'self' blob: data: https://unpkg.com https://api.github.com https://www.githubstatus.com
  img-src 'self' blob: data: https://*.githubusercontent.com
  worker-src blob:
  ```

  Add `frame-src blob:`, `media-src blob:`, `manifest-src blob:`, `style-src 'self' 'unsafe-inline'` and `font-src 'self' https://cdn.jsdelivr.net`.
- Add the Worker origin if the Sveltia Authenticator is used.
- Add Netlify's auth origin (`https://api.netlify.com`) if the Netlify OAuth provider is used [A: confirm exact origins with Sveltia's CSP builder].
- Sveltia needs no `unsafe-eval` [V]. Decap does [V, per Sveltia].
- Keep `noindex` on `/admin/`.

---

## 4. Conflicts between the brief and reality

1. **"Netlify Identity / git-gateway for clients" vs the choice of Sveltia CMS.**
   - Sveltia supports neither and does not plan to [V].
   - With Decap it works, but **Git Gateway is deprecated**: security fixes only, no bug fixes, "new Git Gateway configurations are not recommended" [V].
   - Netlify Identity itself is *not* deprecated today [V].
   - → The brief's client auth path must change. Options are in §3.2; the recommendation is in §5.
2. **"Configure the admin UI in Arabic" vs Sveltia behaviour.**
   - Arabic and RTL exist, but Sveltia **ignores the `locale` config option** and follows the browser [V].
   - It can only be defaulted through an undocumented localStorage pre-seed [V in source]. Also, about 11% of UI strings are still untranslated and fall back to English [V, own count].
3. **"Sveltia (or Decap CMS if Sveltia gives trouble)".** Decap is **not** an equivalent fallback: no Arabic UI, no RTL layout (open since 2018), and no RTL preview [V]. Falling back would violate non-negotiable #1. A true fallback is Decap plus a DIY Arabic phrase file plus custom RTL CSS: significant, unsupported work.
4. **"Collections … and orders where the tier has them" / "orders visible to the owner".** Customer orders cannot sensibly live in a Git CMS (§3.10). → Orders go in a runtime store with a separate owner dashboard; the CMS holds order configuration only.
5. **"Preview of what an edit looks like before publishing".**
   - Neither CMS can render the real Astro site in-editor. Sveltia lists live preview as a non-goal [V].
   - Achievable only via (a) React preview templates, which duplicate markup, and (b) Netlify deploy previews under the editorial workflow: real rendering, but with build delay and credits.
6. **"Image uploads auto-resized" plus "every image WebP/AVIF".**
   - CMS upload processing produces **WebP only** (Sveltia) or JPEG/WebP (Decap). AVIF must come from Astro at build time [V].
   - That only happens for images in `src/` referenced relatively, never `public/` [V]. → CMS media folders must be entry-relative under `src/`, which constrains the i18n structure: `single_file` or `multiple_files`, not `multiple_folders` (§3.5).
7. **"Editorial workflow on" everywhere.**
   - Sveltia supports it only on GitHub/GitLab, not in the local workflow, the Test backend or Gitea [V].
   - In the 13-site monorepo, workflow branches `cms/<collection>/<slug>` and PR lists may collide across sites [A], and each PR can trigger 13 deploy previews without per-site `ignore` rules [V].
   - For a single owner it also adds steps to every price change. → Use per-collection `publish_mode` (§3.3), and consider workflow off for demos.
8. **One monorepo for 13 sites vs "a CMS for every site the client edits without me" plus handoff.**
   - A Git CMS gives the editor **write access to the whole repo**. A client must never get write access to a repo that contains all 13 demos plus tooling.
   - → The handoff and rebrand flow must **extract the client site into its own repo** (with the needed `packages/*`, vendored or published). Otherwise the client's CMS points at a repo they should not be able to write.
   - This affects `scripts/rebrand.ts` and `docs/handoff-checklist.md`.
9. **"Authentication documented … for clients" assumes email login.**
   - With Sveltia, every client needs a **GitHub (or GitLab) account**, an accepted collaborator invite, and possibly **mandatory 2FA** [V/A]. That is real friction for non-technical owners and must be in `cms-guide-ar.md`.
   - A Git-account-free path exists only with Decap (Git Gateway, deprecated; or Turbo, a paid SaaS in public preview, with Decap's English LTR UI), or with Sveltia "Additions" (not shipped; roadmap is "late 2026") [V].
10. **"Shared Sveltia config fragments" (`packages/cms`).**
    - A static admin page cannot import TS packages at runtime.
    - Multiple config files are supported, but fragments cannot share YAML anchors and still need per-site values [V].
    - → Generate per-site config at scaffold or build time (§3.9).
11. **Admin page location.** The obvious Astro approach (`src/pages/admin.astro`) is explicitly discouraged by Sveltia [V]. The admin must be `public/admin/index.html`.
12. **CSP "via netlify.toml" for every site.** `/admin` needs third-party origins (unpkg, api.github.com, blob: workers, the auth origin) that the public site's strict CSP must not include. → Use per-path headers [V].
13. **Stability.** The brief treats the CMS as a stable dependency across 13 sites and client handoffs. Sveltia is **pre-1.0 beta**; breaking changes can land in minor versions; it is maintained by essentially one person [V]. → Pin versions and add a CMS smoke test to `check-all`.

---

## 5. Recommendation

**Use Sveltia CMS on all 13 sites, with the GitHub backend.** Keep content Decap-compatible where it costs nothing, so the CMS can be swapped with a config change rather than a content migration.

Reasons:
1. It is the **only** option that meets "Arabic admin UI + RTL" out of the box [V]. Decap fails this non-negotiable.
2. It has better i18n for an AR-default/EN site:
   - Per-locale required rules.
   - Non-default locales are validated.
   - `duplicate` on lists and objects.
   - Every structure works for file collections.
   - Content fields get RTL direction per locale.
3. It is better for phone-first owners: fully responsive, QR "Sign In with Mobile", **HEIC phone photos converted to WebP on upload**, and a smaller bundle [V].
4. It has richer widgets the presets need: `readonly`, Compute, UUID, string-stored decimals for money, relation cascades and backlinks, singletons, icons and dividers [V].
5. Its config is Decap-compatible, apart from a few Sveltia-only options [V].

**Authentication plan:**
- **Me:** GitHub OAuth, or a PAT, in the demo monorepo.
- **Demos:** CMS access for me only.
- **Clients:** extract each client site to **the client's own GitHub repo**, ideally owned by the client after handoff. Invite the owner as a collaborator. Default sign-in is "Sign in with GitHub" through **Netlify's OAuth provider**:
  - one GitHub OAuth App,
  - Client ID/Secret set per Netlify site,
  - no extra infrastructure.
- If a client leaves Netlify, switch to **one Sveltia CMS Authenticator Worker** by adding `base_url` and listing their domain in `ALLOWED_DOMAINS`.
- Document the GitHub account, invite and 2FA steps in Arabic, with screenshots.

**Hybrid / escape hatch (documented, not built now):**
- If a specific client refuses a Git account, the fallback is **Decap + Decap Turbo** (or, less preferably, Decap + Git Gateway + Identity) for that client only. It is accepted that the admin will then be English/LTR.
- To keep that cheap:
  - Store entry collections as `single_file` YAML. Decap reads the same content.
  - Keep a `target: 'sveltia' | 'decap'` switch in the `packages/cms` generator, even though only `sveltia` is implemented now.
- **Re-evaluate at Sveltia v1.0 (late 2026)**, when "Additions" (users, roles, commits without a Git account) is expected [V roadmap].

**Orders and bookings:** use a runtime `OrderStore` / `BookingStore` interface:
- Mock for demos with seeded data.
- Supabase for live `full` clients.
- The owner dashboard at `/admin/orders/`.
- The CMS holds only rules and configuration (§3.10).

---

## 6. Spikes to run at the start of Step 2 (before building on these assumptions)

1. Sveltia `single_file` YAML entry with an entry-relative image: does Astro 7's `glob()` plus `image()` resolve the image inside a **YAML data** entry? Where exactly are `i18n: false` fields written: under `ar:` only?
2. The localStorage pre-seed puts the UI in Arabic on first load (Chromium and Safari iOS). The login screen shows `dir="rtl"`.
3. `value_type: float/string`: the exact stored string for inputs like `4.5` and `4.500`.
4. Monorepo editorial workflow with two sites that both have a `products` collection: do branches, PR lists or boards collide? Does `cms_label_prefix` or unique collection names fix it?
5. Netlify deploy-preview status context name, and Sveltia `preview_context` matching per site, with "Multiple webhooks per repo" enabled.
6. Netlify OAuth provider: one GitHub OAuth App reused across several Netlify sites.
7. Admin CSP: the final origin list, using Sveltia's CSP builder.
8. Astro `generateId` defaults for `about.ar.yml`-style names, only if `multiple_files` is used anywhere.

## 7. Open questions for the user

1. Are you OK with clients needing a **free GitHub account (+2FA)** to edit? If not, which fallback do you prefer for those clients:
   - Decap Turbo (paid SaaS, English LTR admin),
   - Decap + deprecated Git Gateway, or
   - waiting for Sveltia Additions?
2. At handoff, should each client site move to **its own repo**? I strongly recommend yes, because of security and CMS write access.
3. For live `full` clients, is **Supabase** still the store, or would you prefer Netlify Database to stay on one vendor?
4. Should the editorial workflow be **off for demos** and on only for catalogue collections in client repos?

## 8. Sources (all accessed 2026-09-23)

**Sveltia CMS**
- Docs home and status: https://sveltiacms.app/en/docs · full text: https://sveltiacms.app/llms-full.txt · npm: https://www.npmjs.com/package/@sveltia/cms
- Roadmap: https://sveltiacms.app/en/docs/roadmap · Releases: https://sveltiacms.app/en/docs/releases
- Migration and compatibility (Git Gateway, Identity, `locale` ignored): https://sveltiacms.app/en/docs/migration/netlify-decap-cms
- Backends: https://sveltiacms.app/en/docs/backends · GitHub: https://sveltiacms.app/en/docs/backends/github · GitLab: https://sveltiacms.app/en/docs/backends/gitlab · Gitea/Forgejo: https://sveltiacms.app/en/docs/backends/gitea-forgejo · Test: https://sveltiacms.app/en/docs/backends/test
- Authenticator: https://github.com/sveltia/sveltia-cms-auth
- UI and localization: https://sveltiacms.app/en/docs/ui · RTL notes: https://sveltiacms.app/en/docs/successor-to-netlify-cms · Arabic strings: https://github.com/sveltia/sveltia-cms/blob/main/src/lib/locales/ar.yaml
- Workflows: https://sveltiacms.app/en/docs/workflows/editorial · https://sveltiacms.app/en/docs/workflows/local · https://sveltiacms.app/en/docs/workflows/deploy-previews · https://sveltiacms.app/en/docs/deployments
- Editor and preview: https://sveltiacms.app/en/docs/ui/content-editor · https://sveltiacms.app/en/docs/api/preview-templates · https://sveltiacms.app/en/docs/api/preview-styles
- i18n: https://sveltiacms.app/en/docs/i18n · https://sveltiacms.app/en/docs/i18n/options · https://sveltiacms.app/en/docs/i18n/structures · https://sveltiacms.app/en/docs/i18n/slugs
- Media: https://sveltiacms.app/en/docs/media · https://sveltiacms.app/en/docs/media/internal
- Fields: https://sveltiacms.app/en/docs/fields · https://sveltiacms.app/en/docs/fields/relation · https://sveltiacms.app/en/docs/fields/list · https://sveltiacms.app/en/docs/fields/object · https://sveltiacms.app/en/docs/fields/hidden · https://sveltiacms.app/en/docs/fields/number
- Config: https://sveltiacms.app/en/docs/config-basics · https://sveltiacms.app/en/docs/api/initialization · https://sveltiacms.app/en/docs/customization · https://sveltiacms.app/en/docs/data-output · https://sveltiacms.app/en/docs/collections/entries/slugs · https://sveltiacms.app/en/docs/collections/singletons
- Security/CSP: https://sveltiacms.app/en/docs/security · Astro guide: https://sveltiacms.app/en/docs/frameworks/astro
- Source files read (from the `@sveltia/cms@0.218.3` source map): `src/lib/services/user/prefs.svelte.js`, `src/lib/services/app/i18n.js`, `src/lib/services/config/loader.js`, `src/lib/services/config/index.js`, `src/lib/services/contents/i18n/index.js`

**Decap CMS**
- Docs: https://decapcms.org/docs/ · config options (`locale`, `media_processing`): https://decapcms.org/docs/configuration-options/ · i18n: https://decapcms.org/docs/i18n/
- Backends: https://decapcms.org/docs/backends-overview/ · https://decapcms.org/docs/git-gateway-backend/ · https://decapcms.org/docs/choosing-a-backend/ · https://decapcms.org/docs/external-oauth-clients/ · https://decapcms.org/docs/test-backend/
- Workflow and preview: https://decapcms.org/docs/editorial-workflows/ · https://decapcms.org/docs/deploy-preview-links/ · https://decapcms.org/docs/customization/ · https://decapcms.org/docs/manual-initialization/
- Widgets: https://decapcms.org/docs/widgets/ · https://decapcms.org/docs/widgets/relation/ · https://decapcms.org/docs/widgets/hidden/ · https://decapcms.org/docs/collection-folder/
- Turbo: https://decapcms.org/turbo/ · https://decapcms.org/docs/turbo-overview/ · https://decapcms.org/docs/turbo-billing/ · https://decapcms.org/docs/turbo-roles-and-members/
- Locales: https://github.com/decaporg/decap-cms/tree/main/packages/decap-cms-locales/src · RTL issues: https://github.com/decaporg/decap-cms/issues/1769 · https://github.com/decaporg/decap-cms/issues/2524 · Releases: https://github.com/decaporg/decap-cms/releases

**Netlify**
- Git Gateway (deprecated): https://docs.netlify.com/manage/security/secure-access-to-sites/git-gateway/
- Identity: https://docs.netlify.com/manage/security/secure-access-to-sites/identity/overview/ · former deprecation notice (now 404): https://www.netlify.com/changelog/deprecation-netlify-identity/ · context: https://github.com/sveltia/sveltia-cms/discussions/284
- OAuth provider: https://docs.netlify.com/manage/security/secure-access-to-sites/oauth-provider-tokens/
- Deploy notifications: https://docs.netlify.com/deploy/deploy-notifications/ · Monorepos: https://docs.netlify.com/build/configure-builds/monorepos/ · Ignore builds: https://docs.netlify.com/build/configure-builds/ignore-builds/
- Database: https://docs.netlify.com/build/data-and-storage/netlify-database/ · Blobs: https://docs.netlify.com/build/data-and-storage/netlify-blobs/

**Astro / GitHub**
- Content collections: https://docs.astro.build/en/guides/content-collections/ · Images: https://docs.astro.build/en/guides/images/
- GitHub mandatory 2FA: https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/about-mandatory-two-factor-authentication · GitHub PKCE on hold: https://github.com/orgs/community/discussions/15752 · https://github.com/github/roadmap/issues/1153
