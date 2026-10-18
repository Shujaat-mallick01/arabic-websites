# Research: Astro 7 + Netlify + Tailwind v4 + pnpm workspaces

Researched: **2026-09-23**, for Step 1 ("Plan first") of `arabic-websites-master-prompt.md`.
Scope: the platform facts that `docs/architecture.md` and the later build phases depend on. CMS details live in the sibling file `docs/research/cms.md`.

**Confidence legend** (used on every claim that matters):

- **[V] Verified.** Read today in a primary source: official docs, package source code, the npm registry, or a command run on this machine. The URL or command is given.
- **[L] Likely.** Comes from a secondary source (blog, forum or changelog summary), or is a strong inference from primary sources. Treat as true, but confirm when it is first exercised.
- **[A] Assumption.** Not verified. Must be tested in the Step 2/3 pilots before anything depends on it.

---

## 0. Summary: what this means for the plan

1. **Pages: pure static output, no Astro adapter by default.** Astro's default `output: 'static'` builds every page to HTML [V]. `output: 'hybrid'` was removed in Astro 5 [V]. An adapter is needed only for routes with `export const prerender = false` [V].
2. **Server side: standalone Netlify Functions.** Put them in each site's `netlify/functions/*.mts` as thin wrappers around handler factories in `packages/*`. Each wrapper keeps a *literal* `export const config = { path: … }`, because Netlify reads that export by static analysis [L]. Use `@netlify/vite-plugin` inside `astro dev` to emulate Functions, Blobs, redirects and headers locally [V: README]. The alternative, Astro endpoints plus `@astrojs/netlify`, is viable (§3). It is not the default because it changes the image pipeline and couples every `full` site to the adapter's release cycle.
3. **Netlify credits drive the deployment design. This is the biggest risk found.** New Netlify accounts (since 2025-09-04) are on credit plans [V]. The **Free plan has 300 credits a month, pooled across every site in the team** [V]. **Each successful production deploy costs 15 credits**, which is about **20 production deploys a month for all 14 sites combined** [V]. When credits run out, **every site on the team is paused** and shows "Site not available" [V]. With no ignore rule, one commit rebuilds all 14 sites (about 210 credits) [V: default ignore compares the whole base directory]. Mitigations are in §4.4. Deploy Previews and branch deploys cost 0 credits [V].
4. **Monorepo on Netlify:** one Netlify site per `sites/NN-*` folder. Leave **base directory unset** (repo root). Set **package directory = `sites/NN-*`**, which is where that site's `netlify.toml` lives. Give every `netlify.toml` a git-based `ignore` command that lists the site folder and the shared inputs [V]. The package directory can be set only in the UI (not in `netlify.toml`) [V].
5. **i18n:** Arabic unprefixed (`/`) and English under `/en/`, using `defaultLocale: 'ar'` with `prefixDefaultLocale: false` [V]. Use **the same ASCII slug in both languages**, so switching language is just a prefix swap. `?lang=en` and the saved preference are handled by a **tiny blocking inline `<head>` script**. That script is the baseline because it works everywhere, including with `utm_*`, `fbclid` and `igsh` parameters. Generated Netlify redirect rules can optionally be added on top as a zero-JS fast path (§5.3). Crawlers never carry a preference, so SEO is unaffected. Google advises against *automatic* language redirects [V], and a redirect on an *explicit* user choice is not that.
6. **Content:** the Content Layer API only. Config goes in `src/content.config.ts`, and every collection needs a `loader` (`glob()` or `file()`) [V]. JSON, YAML, TOML, Markdown and MDX are all supported [V]. `z` is imported from `astro/zod` (Zod 4) [V].
7. **Images:** CMS uploads **must live under `src/`**, entry-relative, and be referenced through the `image()` schema helper. **Anything in `public/` is never optimised** [V]. Use `<Picture formats={['avif','webp']}>` built by sharp at build time. Do not use the Netlify Image CDN: it prefers WebP over AVIF, and it transforms on first request [V].
8. **Islands:** vanilla TypeScript custom elements in Astro `<script>` tags, plus `nanostores` for shared cart state (Astro's own recommendation, "<1 KB") [V]. Preact is the fallback if a component becomes genuinely complex (core ≈ 4.8 kB gz) [V]. Svelte 5 is not chosen. Its runtime is small (≈ 3–4 KB by one measurement [L]), but its integration requires TypeScript 5/6 [V] and it adds a compiler to the toolchain.
9. **Persistence:** Netlify Blobs for demo orders and bookings. It needs zero provisioning and is available on Free [V]. Reads are eventually consistent (up to 60 s) unless you ask for `consistency: 'strong'`. Conditional writes (`onlyIfNew`, `onlyIfMatch` ETag) make daily caps and slot limits safe [V]. Supabase goes behind the same interface for real clients. Its Free plan allows **2 active projects** and **pauses after 1 week of inactivity** [V], which would kill a demo.
10. **CSP:** Netlify **merges all header rules that match a path, joining the values with commas** [V]. So a strict `/*` CSP would also apply to `/admin/` and break the CMS. Recommended split:
    - Astro's `security.csp` (stable since Astro 6) puts a hash-based `<meta>` CSP on site pages [V].
    - `netlify.toml` sets only CMS-compatible directives on `/*` (`frame-ancestors`, `object-src`, `base-uri`).
    - `/admin/*` gets its own CMS policy.
11. **Tailwind v4:** use `@tailwindcss/vite` [V]. Add `@source` for `packages/*`, because each site's scan root excludes the workspace packages [L]. Use logical utilities throughout. **`start-*` and `end-*` are deprecated since v4.2 in favour of `inset-s-*` and `inset-e-*`** [V]. Theme with CSS custom properties plus `@theme inline` [V].
12. **Tooling on this machine:**
    - Chrome 153 and Edge 153 are installed [V: local].
    - **Lighthouse 13.x needs Node ≥ 22.19, but this machine has Node 22.18** [V]. Upgrade Node to 24 LTS or ≥ 22.19 before Step 3, or pin `lighthouse@12.8.2`.
    - `@astrojs/check` needs **TypeScript 5 or 6**. npm `latest` is now TypeScript **7.0.2** [V]. **Pin `typescript@^6`.**

---

## 1. Environment snapshot (checked 2026-09-23)

### 1.1 Registry versions ([V], `npm view <pkg> version|engines|peerDependencies`)

| Package | Latest | Released | Engines / peers that matter |
|---|---|---|---|
| astro | 7.3.4 | 2026-09-22 | node `>=22.12.0`; deps: vite `^8.0.13`, zod `^4.5.4`, `@astrojs/compiler-rs`, `@astrojs/markdown-satteri`; **sharp is an *optional* dependency** `^0.35.4`; optional peer `@astrojs/markdown-remark ^7.3.0` |
| @astrojs/netlify | 8.2.6 | 2026-09-16 | peer astro `^7.0.0`; depends on `@netlify/vite-plugin`, `@netlify/blobs`, `@netlify/functions` |
| @astrojs/check | 0.9.10 | | **peer typescript `^5.0.0 \|\| ^6.0.0`** |
| @astrojs/sitemap | 3.7.4 | | |
| @astrojs/preact / @astrojs/svelte | 6.0.5 / 9.0.1 | | svelte integration peers: svelte `^5.43.6`, **typescript `^5.3.3 \|\| ^6.0.0`** |
| preact / @preact/signals | 10.29.8 / 2.11.2 | | |
| svelte | 5.57.1 | | |
| nanostores / @nanostores/persistent | 1.5.3 / 1.3.5 | | |
| tailwindcss / @tailwindcss/vite | 4.3.3 | 2026-07-16 | vite peer `^5.2 \|\| ^6 \|\| ^7 \|\| ^8` |
| @netlify/blobs | 11.1.0 | | node `>=22.12.0` |
| @netlify/functions | 6.0.0 | | node `>=22.12.0` |
| @netlify/vite-plugin | 3.0.1 | | vite peer up to `^8` |
| netlify-cli | 27.8.1 | | |
| sharp | 0.35.4 | | node `>=20.9.0` |
| lighthouse | 13.5.0 | 2026-09-18 | **node `>=22.19`** (every 13.x). `12.8.2` needs `>=18.16` |
| chrome-launcher | 1.2.1 | | |
| playwright / @playwright/test | 1.63.0 | | |
| @axe-core/playwright | 4.13.0 | | peer playwright-core `>=1.0.0` |
| pa11y / pa11y-ci | 10.0.0 / 4.1.1 | | node `^22.13.0 \|\| >=24` |
| linkinator | 8.1.0 | | node `>=22` |
| typescript | **7.0.2** (latest) | | 6.0.3 is the newest 6.x. **Use `^6` because of the @astrojs/check and svelte peers** |
| vitest | 5.0.1 | | |
| pnpm | 12.5.1 (`latest`) | 12.0.0 on 2026-08-26 | `latest-11` = 11.27.1 |
| @sveltia/cms / decap-cms-app | 0.218.3 / 3.16.3 | Sveltia published 2026-09-23 | |
| @supabase/supabase-js | 2.117.1 | | |

### 1.2 This machine ([V], shell commands run today)

- **Node v22.18.0**, npm on `C:\Program Files\nodejs`, corepack 0.33.0, git 2.46.2, Python 3.13.5. **pnpm is not installed.**
- **Google Chrome 153.0.8010.53** at `C:\Program Files\Google\Chrome\Application\chrome.exe`.
- **Microsoft Edge 153.0.4234.48** at `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`.
- No Playwright browser cache (`%LOCALAPPDATA%\ms-playwright` is absent). No `CHROME_PATH` set.
- The npm global prefix is `C:\Users\Shujaat Mallick\AppData\Roaming\npm`. It is user-writable and on PATH.
- `git config --global core.autocrlf` is unset. **Recommend a `.gitattributes` with `* text=auto eol=lf`** so `git diff`-based ignore rules and lockfiles behave the same on Windows and on Netlify's Linux builders [A].
- **Both the user profile path and the project path contain spaces** (`Shujaat Mallick`, `arabic websites`). Astro/Vite have had build failures on paths with spaces before (`%20` in resolved ids; issues #4065, #4636, #12556). They were closed as fixed upstream in Vite [L]. **Test this in the first scaffold build.** Fallback: work from a space-free path such as `C:\dev\arabic-websites` or a `subst` drive letter [A].

### 1.3 Installing pnpm on this machine

- `corepack enable` writes shims into `C:\Program Files\nodejs`, so it needs an elevated shell [L]. Two alternatives that need no admin rights:
  - `npm i -g pnpm@12.5.1` (installs to the user prefix above), or
  - `corepack enable --install-directory "%APPDATA%\npm"` [L].
- Pin the version in the root `package.json` with `"packageManager": "pnpm@12.5.1"`. Netlify reads this field through Corepack. **Semver ranges are not allowed there** [V: Netlify "Manage dependencies"].
- pnpm 11+ changes that affect config ([V]/[L], pnpm 11 blog and migration guide via search):
  - `.npmrc` is **for auth and registry settings only**. Every other setting goes in `pnpm-workspace.yaml`.
  - `onlyBuiltDependencies` and related settings were replaced by one **`allowBuilds`** map.
  - **`minimumReleaseAge` now defaults to 1440 minutes (1 day).** Brand-new releases are skipped by default. For example, astro 7.3.4 (published 2026-09-22 18:56 UTC) is skipped until 24 h after publication. Set `minimumReleaseAge: 0` to opt out.
- pnpm 12 breaking changes [L]:
  - Unknown `pnpm-workspace.yaml` settings now warn, or fail when the pnpm version is pinned.
  - Git dependencies are normalised to HTTPS.
  - Lockfiles are canonicalised.
  - `engineStrict` is stricter.
- The pnpm 12 release notes say to install it with `pnpm self-update latest-12`. When 12.0 shipped, npm's `latest` tag still pointed at 11. **Today npm `latest` is 12.5.1** [V: dist-tags].

---

## 2. Astro 6 and 7: breaking changes that matter here

### 2.1 Astro 6 (6.0.0 released 2026-03-10) [V: https://docs.astro.build/en/guides/upgrade-to/v6/]

**Platform:**
- Node **≥ 22.12.0**, Vite 7, **Zod 4**, and Shiki 4.
- Zod 4 changes that bite: string formats move to the top level (`z.email()` instead of `z.string().email()`), and `.default()` must match the *output* type.

**Content collections:**
- The **legacy Content Collections API is removed**. The config file must be **`src/content.config.ts`**; the old path throws `LegacyContentConfigError`.
- Every collection needs a `loader`. The `type: 'content' | 'data'` field is gone.
- Use `getEntry()` instead of `getEntryBySlug()` / `getDataEntryById()`.
- **`entry.slug` is gone; use `entry.id`.** The original path is `entry.filePath`.
- Render with `render(entry)` from `astro:content`.
- Import `z` from **`astro/zod`**.
- `legacy.collectionsBackwardsCompat` exists only as a temporary migration aid.

**i18n:**
- `routing.redirectToDefaultLocale` now defaults to `false` and requires `prefixDefaultLocale: true`. **This is irrelevant here, because Arabic is unprefixed.**

**Removed or renamed:**
- `Astro.glob()` is removed; use `import.meta.glob(..., { eager: true })`.
- `<ViewTransitions />` is gone; use `<ClientRouter />`.
- `emitESMImage` is now `emitImageMetadata`.
- `.cjs` / `.cts` config files are no longer supported.

**Images:**
- Setting `width` and `height` now crops by default.
- **Images are never upscaled.**
- SVGs can be rasterised.
- **`getImage()` throws on the client.**

**Scripts, styles and env:**
- `<script>` and `<style>` render in **declaration order**.
- `import.meta.env` values are always inlined and **stay strings**, never coerced to booleans or numbers. Feature flags read from env must be parsed explicitly.

**Endpoints:**
- Endpoints with a file extension (such as `sitemap.xml.ts`) are served **only without a trailing slash**.

**Experimental flags now stable** (remove them from config): `csp`, `fonts`, `liveContentCollections`, `preserveScriptOrder`, `staticImportMetaEnv`, `headingIdCompat`. `failOnPrerenderConflict` became `prerenderConflictBehavior`.

**Adapter and integration API changes** (relevant only if we write adapters or integrations):
- Adapters now use `createApp()`.
- `routes` was removed from `astro:build:done`; use the `astro:routes:resolved` hook instead [V].
- `astro:build:done` still receives `pages`, `dir` and `assets`. §5.2 Option 2 relies on this [V: https://docs.astro.build/en/reference/integrations-reference/].

### 2.2 Astro 7 (7.0.0 released 2026-06-22) [V: https://docs.astro.build/en/guides/upgrade-to/v7/, https://morello.dev/blog/astro-7]

- **Vite 8, with Rolldown replacing esbuild and Rollup.** Vite plugins must be compatible with Vite 8. `@tailwindcss/vite` 4.3.3 declares `^8` [V].
- **The Rust `.astro` compiler is now the only compiler, and it is stricter:**
  - **Unclosed non-void tags are errors.**
  - **Invalid nesting is no longer auto-corrected.** For example, a `<div>` inside a `<p>` is left in place for the browser's error recovery.
  - CSS may serialise differently, which is cosmetic.
- **Sätteri is the default Markdown pipeline.** remark/rehype plugins need `@astrojs/markdown-remark` plus the `unified()` processor. GFM, smartypants, heading IDs and math are built in [V/L]. We should need no remark plugins.
- **`compressHTML` now defaults to `'jsx'`.** Whitespace between inline elements follows JSX rules. **Watch Arabic copy split across inline tags on separate lines, where a space can disappear** [A]. Set `compressHTML: true` to restore HTML-aware compression.
- **`src/fetch.ts` is reserved** for Advanced Routing. Don't create that file, or set `fetchFile: null`.
- Queued/streaming rendering is the default.
- `cache` and `routeRules` are now top-level options.
- `logger` is now a top-level option.
- **`@astrojs/db` is removed.**
- `getContainerRenderer()` moved to `@astrojs/<fw>/container-renderer`. This matters only for component tests that use the Container API.
- Netlify's changelog says Astro 7 "just works on Netlify on day one" [V: https://www.netlify.com/changelog/2026-06-22-astro-7/].

### 2.3 Astro 7.1–7.3 additions worth knowing

- **7.1** [V: https://astro.build/blog/astro-710/]
  - CSP gains `kind: 'element' | 'attribute'`, which maps to `script-src-elem/-attr` and `style-src-elem/-attr`.
  - `glob({ deferRender: true })` lowers memory use for large collections. **Use it for site 03 (150+ items).**
  - Experimental `collectionStorage: "chunked"`.
  - `paginate({ format })`.
  - `astro dev --ignore-lock` allows multiple dev servers.
- **7.2** [V: https://astro.build/blog/astro-720/]
  - `experimental.incrementalBuild`: a route opts in by returning a `cacheKey` from `getStaticPaths()`. The cache lives in `node_modules/.astro/`.
  - `session: false` removes the session runtime.
  - **`astro preview --background`**, with `status`, `logs` and `stop` subcommands. This is useful for `check-all`.
- **7.3** [L]: `astro preview --ignore-lock`; the logger is passed to image services.

### 2.4 Output modes

- `output: 'static'` is the default. `output: 'server'` renders every page on demand.
- **`'hybrid'` was merged into `'static'` in Astro 5.** In static mode, any route can set `export const prerender = false`, but only with an adapter [V: https://docs.astro.build/en/guides/upgrade-to/v5/, https://docs.astro.build/en/guides/on-demand-rendering/].
- "To render any page on demand, you need to add an adapter" [V].
- The Astro Netlify docs say a static site "usually" doesn't need the adapter. It needs one only for Netlify's image service, or to translate the `redirects` config into `_redirects` [V: https://docs.astro.build/en/guides/integrations-guide/netlify/].

---

## 3. Server-side strategy: pure static + standalone Functions vs static + on-demand routes

| | **A. Pure static + standalone Netlify Functions (recommended)** | **B. Static + `prerender = false` endpoints via `@astrojs/netlify`** |
|---|---|---|
| Pages | 100% HTML at build | 100% HTML at build (only the API routes are on-demand) |
| Where the code lives | `sites/NN/netlify/functions/checkout.mts` etc.: thin wrappers importing `@aw/payments`, `@aw/commerce/server` | `sites/NN/src/pages/api/checkout.ts` with `export const prerender = false` |
| Bundler | Netlify's zip-it-and-ship-it (esbuild) bundles each function | Vite/Rolldown bundles **all** on-demand routes into **one** SSR function at `.netlify/v1/functions/ssr/` [V: adapter source] |
| Workspace packages | esbuild follows pnpm symlinks. **Transitive deps are a known pnpm and esbuild pain point** ("Cannot find module" when pnpm does not hoist) [L: https://answers.netlify.com/t/functions-not-building-with-pnpm-and-esbuild/131215]. Keep server packages dependency-light, and declare their deps in the site's `package.json`. Fallback: `nodeLinker: hoisted` in `pnpm-workspace.yaml` [A] | Vite resolves workspace TS exactly as it does for pages, so no extra pnpm issues [L] |
| Routing config | `export const config = { path: '/api/checkout', method: 'POST' }` **must be literal in the entry file**. Netlify extracts it by static analysis and never runs the module [L: search summary of Netlify forum/PRs]. The scaffold script generates these files | Astro file routing |
| Local dev | Add `@netlify/vite-plugin` to `vite.plugins`. It emulates Functions, Edge Functions, Blobs, redirects, headers, env and Image CDN inside the Vite dev server [V: package README]. **[A]** confirm it picks up `netlify/functions` under `astro dev` without the adapter. Otherwise use `netlify dev --filter <site>` [V: CLI docs] | Built in: the adapter enables Netlify emulation in `astro dev` (Astro ≥ 5.12) [V: https://docs.netlify.com/frameworks/astro/] |
| Image pipeline | Unchanged (sharp at build) | **The adapter switches `<Image>` to the Netlify Image CDN by default.** You must set `imageCDN: false` to keep build-time AVIF/WebP [V] |
| Coupling | Payments and orders code is framework-independent and portable to any host with fetch-style functions | Tied to Astro's adapter API and release cycle |
| Same config for `lite` and `full` | Yes: only the presence of `netlify/functions` differs | No: `full` sites need the adapter and `lite` sites don't |

**Why A:** the payment interface in the brief (`createPaymentSession`, `verifyPayment`, `handleWebhook`, `refund`) maps directly onto fetch-style `(req: Request, context: Context) => Response` handlers. A keeps the page toolchain identical across all 13 sites, and it keeps image handling deterministic. **Revisit B** if the pilot hits pnpm/esbuild resolution problems that `nodeLinker: hoisted` doesn't fix.

### 3.1 Netlify Functions facts [V: https://docs.netlify.com/build/functions/configuration/, /get-started/, /api/]

- **Location and naming:**
  - The default directory is `netlify/functions` *relative to the base directory*. It is configurable with `[functions] directory = …`.
  - Use `.mts` for TypeScript as ESM.
  - `hello.mts`, `hello/hello.mts` and `hello/index.mts` all create the function `hello`.
- **Handler signature:** `export default async (req: Request, context: Context) => Response`.
  - `context` gives `geo`, `ip`, `site`, `deploy`, `cookies.get/set/delete` and `params`.
  - `config` supports `path`, `excludedPath`, `method`, `preferStatic` and `rateLimit`.
- **Limits:**
  - **Synchronous timeout 60 s**, scheduled 30 s, background 15 min. None of these is configurable.
  - Buffered payload **6 MB** (4.5 MB binary); streamed 20 MB; background 256 KB.
  - Memory defaults to 1024 MB (range 1024–4096).
- **Runtime:** the Node version follows the build's Node version, if that is a valid non-deprecated Lambda runtime; otherwise it falls back to **Node 24**. Override with `AWS_LAMBDA_JS_RUNTIME` (set in the UI, CLI or API, not in `netlify.toml`).
- **Bundler:** `node_bundler = "esbuild"`, `external_node_modules` and `included_files` are available.
- **Cost:** compute is **10 credits per GB-hour** [V: credits doc]. A 1 GB function running 300 ms uses about 0.083 GB-s, so roughly 43,000 such calls equal 10 credits [A: arithmetic only].

---

## 4. Deploying many Netlify sites from one pnpm monorepo

### 4.1 Base directory vs package directory [V: https://docs.netlify.com/build/configure-builds/monorepos/, /overview/]

- **Base directory**: where Netlify "checks for dependency management files such as `package.json` or `.nvmrc`, installs dependencies, and runs your build command". It is also the build-cache root. **It defaults to the repo root.**
- **Package directory**: "the directory that contains your site files, including the `netlify.toml`". **It is settable only in the UI**, under *Project configuration → Build & deploy → Build settings*. It is not a `netlify.toml` key. The public OpenAPI `repoInfo` has no field for it either [V: netlify/open-api swagger.yml], so API automation of this setting is **unverified** [A].
- `netlify.toml` is looked up in this order: package directory, then base directory, then repo root [V].
- Every path in `netlify.toml` (publish, functions, ignore) is relative to the **base directory** [V].
- **Recommended setup (Netlify's own recommendation): leave base unset and set package directory = `sites/NN-slug`** [V]. Netlify's monorepo auto-detection does exactly this when you import a repo [V].
- **Pitfall:** if you instead set *base* = `sites/NN`, `pnpm-lock.yaml` is no longer in the base directory. Netlify then falls back to **npm**, which fails on `workspace:*` [L: netlify/build#4648 and forum reports].
- **Only 1 concurrent build on Free** [V]. A change to `packages/` that affects all 14 sites will queue 14 builds one after another.

### 4.2 Per-site `netlify.toml` (sketch, to validate in the pilot)

```toml
# sites/02-noha-modest/netlify.toml   (package directory = sites/02-noha-modest, base unset)
[build]
  command = "pnpm --filter @aw/site-02-noha-modest build"
  publish = "sites/02-noha-modest/dist"          # relative to base (repo root)  [V rule; exact form A]
  # exit 0 = skip, exit 1 = build. Runs from base dir. First build: force build if refs equal [A].
  ignore  = "[ \"$CACHED_COMMIT_REF\" = \"$COMMIT_REF\" ] && exit 1; git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF -- sites/02-noha-modest packages pnpm-lock.yaml pnpm-workspace.yaml package.json .nvmrc"

[build.environment]
  NODE_VERSION = "24"                           # or commit .nvmrc at repo root (takes precedence) [V]

[functions]
  directory = "sites/02-noha-modest/netlify/functions"
  node_bundler = "esbuild"

[[headers]]  # see §10 for CSP layering
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    X-Robots-Tag = "noindex"        # demos only; generated from site config (indexing flag)
```

- Netlify's monorepo example writes function directories with a leading slash (`"/packages/my-app/netlify/functions"`). Its blog example writes publish paths without one (`"apps/app-1/dist"`). **Both are "relative to base"** [V]. Pick one form and test it [A].
- The build command runs from the base directory (repo root), so `pnpm --filter <pkg> build` is the natural form [V: "Build command runs in the base directory"].
- **Packages ship TypeScript source, with no build step.** Their `exports` point at `./src/*.ts`, so the filter command never has to build dependencies first [A: standard pnpm/Vite practice].

### 4.3 Only rebuild changed sites (ignore builds) [V: https://docs.netlify.com/build/configure-builds/ignore-builds/]

- **Exit code `0` skips the build; `1` builds.**
- Default when unset: compare the base directory. **In a monorepo with base unset, any commit rebuilds every site** [V: monorepo doc "Any changes in the base directory trigger builds of all connected sites"].
- The documented monorepo pattern is `git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF packages/blog-1 packages/common` [V].
- **The ignore command runs on Node 18, which cannot be changed**. So keep it as a shell `git diff`, or a Node-18-safe script with no dependencies. **pnpm is not installed yet at that point** [V: Node 18 note; A: pnpm absence].
- **The ignore command never cancels builds started by build hooks** [V].
- **`[skip ci]` or `[skip netlify]` anywhere in the commit message skips the deploy**, and it covers every commit in the push [L: Netlify blog/forum via search]. This is useful for bulk content commits.
- Refinement [A]: have `scripts/` generate each site's path list from its actual workspace dependencies (for example, site 02 uses `packages/commerce` but not `packages/booking`). A change to `packages/booking` then won't rebuild the commerce sites.
- A build cancelled by the ignore command produces no production deploy. It should therefore cost no credits [L: only "successful production deploys" consume credits].

### 4.4 Credit maths and mitigations (critical) [V: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/, …/billing-faq-for-credit-based-plans/, …/credit-based-pricing-plans/, https://www.netlify.com/pricing/]

| Meter | Cost |
|---|---|
| Production deploy (successful) | **15 credits** (failed deploys and rollbacks are free) |
| Deploy Previews, branch deploys | **0** |
| Bandwidth | 20 credits/GB |
| Web requests (pages, assets, **redirects**, function calls, **edge function invocations**) | 2 credits per 10,000 |
| Compute (functions) | 10 credits/GB-hour |
| Form submissions | free, unlimited |

- Plans: **Free: 300 credits/month, hard cap, no auto-recharge**. Personal: $9, 1,000 credits. Pro: $20, 3,000 credits.
- **Credits are pooled per team.** When they are exhausted on Free, **all projects are paused** ("Site not available"), and new production deploys are blocked.
- Free also includes: 500 projects, **1 concurrent build**, Blobs ✓, Functions and Edge Functions ✓. **Password protection is not available.**

**Implications for 13 demos plus the hub on one Free team:**
- 300 credits ÷ 15 ≈ **20 production deploys a month in total**.
- One untargeted commit is 14 × 15 = 210 credits.
- One CMS "publish" on one site is 15 credits.
- Traffic: 1 GB of images is 20 credits, and 10k page+asset requests is 2 credits. Bandwidth and traffic are small for demos.

**Mitigation options** (decision needed; see §13):
1. Precise `ignore` commands (§4.3). These are mandatory whatever else is chosen.
2. Batch commits and use `[skip netlify]`. For demos, prefer local `pnpm deploy <site>` (`netlify deploy --prod --filter <site>`) with builds stopped on Netlify (the site's `stop_builds` flag) [V: OpenAPI `repoInfo.stop_builds`; CLI `--filter` [V]].
3. Edit content on branches. **Deploy Previews are free**, so demo editing via the CMS editorial workflow costs nothing until merge.
4. Upgrade the portfolio team to **Personal ($9, ≈ 66 deploys)** or Pro.
5. Put client sites in the client's own Netlify team at handoff. This matches the brief's handoff checklist.
6. [A] Put all demos on one Netlify site under subpaths or host-rewritten subdomains. Netlify supports domain-level rules such as `https://noha.example.com/* /noha/:splat 200!` for domains assigned to the site [V: redirect options, "domain-level redirects"]. One deploy would then cover every demo, but this complicates per-site `/admin`, functions and the "rebrand into a real site" story.

### 4.5 Sharing Functions code across sites

- Handler factories live in `packages/payments` and `packages/commerce/server`; site wrappers are generated. Example:

  ```ts
  // sites/02-noha-modest/netlify/functions/checkout.mts  (generated by new-site)
  import { createCheckoutHandler } from '@aw/commerce/server';
  import site from '../../site.config';
  export default createCheckoutHandler(site);
  export const config = { path: '/api/checkout', method: 'POST' };   // literal, per file
  ```

- Declare every workspace package the functions import, and their runtime deps, in the **site's** `package.json` (`"@aw/commerce": "workspace:*"`). pnpm then links them into `sites/NN/node_modules`, where the bundler can resolve them [L].
- Secrets go in Netlify's UI or CLI env, with a `.env.example` per site. Functions read them through `process.env` [V].
- Netlify's Frameworks API output (`.netlify/v1/…`, used by the adapter) *appends* to user functions, redirects and headers. User-defined config comes first [V: https://docs.netlify.com/build/frameworks/frameworks-api/]. This is only relevant under option B.

### 4.6 Netlify CLI in a monorepo [V: https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/]

- CLI ≥ 16 runs every command from the workspace root. `--filter <package name | path>` picks the site. Examples: `netlify dev --filter sites/02-noha-modest`, `netlify deploy --prod --filter …`.
- `netlify deploy` uploads pre-built output. `netlify build` runs a Netlify-like build locally.
- `netlify link` writes `.netlify/state.json`, or set `NETLIFY_SITE_ID`. **`scripts/deploy.ts` can map site → site ID from the site config.**
- Node for builds: `.nvmrc`/`.node-version` in the base directory takes precedence over `NODE_VERSION` [V].

---

## 5. i18n: Arabic default unprefixed, English at `/en/`

### 5.1 Astro config [V: https://docs.astro.build/en/guides/internationalization/]

```js
// astro.config.mjs (per site, produced by a shared helper in packages/*)
export default defineConfig({
  site: 'https://noha-modest.netlify.app',
  trailingSlash: 'always',            // pick one policy; Netlify pretty-URLs directory output [A: choose in pilot]
  i18n: {
    locales: ['ar', 'en'],
    defaultLocale: 'ar',
    routing: { prefixDefaultLocale: false },   // '/' = ar, '/en/' = en
  },
});
```

- **Helpers from `astro:i18n`:**
  - `getRelativeLocaleUrl(locale, path)` and `getAbsoluteLocaleUrl()`.
  - `getRelativeLocaleUrlList(path)`, which is useful for hreflang.
  - `getPathByLocale()` and `getLocaleByPath()`.
- **`Astro.currentLocale` works on static pages.** `Astro.preferredLocale` and `Astro.preferredLocaleList` (Accept-Language) work **only on on-demand pages** [V].
- `fallback` with `fallbackType: 'rewrite' | 'redirect'` exists. **Don't use it.** The brief requires complete English, so `check-all` should fail on any missing EN entry instead.
- `domains` and custom locale paths need `output: 'server'`, so they are not for us [V].
- **Page files without duplication** [A: verify in pilot]:
  - Engine pages live in `packages/*` and are registered by a shared Astro integration via `injectRoute({ pattern, entrypoint: '@aw/commerce/pages/product.astro' })`. Package specifiers are supported [V: https://docs.astro.build/en/reference/integrations-reference/].
  - Use a rest-param pattern such as `/[...lang]/products/[slug]`, with `getStaticPaths` returning `lang: undefined` for Arabic and `'en'` for English.
  - Confirm that `Astro.currentLocale` resolves correctly for injected rest-param routes.
- **Use the same ASCII slug in both languages**, so `/products/black-crepe-abaya/` ↔ `/en/products/black-crepe-abaya/` is a pure prefix swap. This keeps hreflang, the toggle and the redirect logic trivial.
- **Sitemap:** `@astrojs/sitemap` with `i18n: { defaultLocale: 'ar', locales: { ar: 'ar-BH', en: 'en-US' } }` emits `xhtml:link` alternates. It needs `site`. Use `filter` to exclude `/admin/` [V: https://docs.astro.build/en/guides/integrations-guide/sitemap/].

### 5.2 Honouring `?lang=en` and a saved preference on a static host

Facts that constrain the options:

- **Netlify query-param rules** (`/store id=:id /blog/:id 301`, or `query = {…}` in TOML) match **"only URLs that have only the `id` parameter and no others"** [V: https://docs.netlify.com/manage/routing/redirects/redirect-options/]. A link shared from Instagram or WhatsApp with `utm_*`, `fbclid` or `igsh` would **not** match. Matching a *literal* value (`lang=en`) rather than a placeholder is **disputed in forum answers** [A: test on a deploy preview].
- **Query strings pass through** to the destination on 200, 301 and 302 [V].
- Rules shadow existing files **only with `force`/`!`** [V]. Arabic pages exist as files, so every language rule must be forced.
- **`Cookie=` conditions match on presence only, regardless of value**, and names are case-insensitive [V]. So a presence cookie like `lang_en` must be set or deleted by the toggle.
- The `Language=` condition uses the **first** Accept-Language entry, and the **`nf_lang` cookie overrides it** [V]. Don't use it: it would push Gulf visitors with English-language phones to `/en/`, which Google also advises against [V: https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites, "Avoid automatically redirecting users from one language version … to a different language version"].
- **Edge Functions:**
  - Deno runtime; **50 ms CPU** per request; 20 MB code; 512 MB memory.
  - They run **before redirects and the cache**.
  - Declared with `path`/`excludedPath`/`pattern`, plus `header` regex conditions, for example `cookie`.
  - Invocations count as web requests (2 credits per 10k) [V: https://docs.netlify.com/build/edge-functions/limits/, …/declarations/, credits doc].
- Astro processed `<script>` tags become deferred `type="module"` scripts. **Only `is:inline` scripts in `<head>` run before first paint** [V: https://docs.astro.build/en/guides/client-side-scripts/].

| Option | Correctness | LCP / perf | SEO / noindex | Complexity |
|---|---|---|---|---|
| **1. Blocking inline `<head>` script (recommended baseline)**: reads `?lang` and the localStorage preference (in try/catch), saves it, then `location.replace()` to the prefix-swapped URL | Handles any extra params; works in `astro preview`, on Netlify and on any host | Visitors with no preference (the Lighthouse run and most traffic) pay only ~0.5 KB of inline JS. EN-preferring visitors pay one extra round trip of Arabic HTML before the redirect | Crawlers have no localStorage or `?lang`, so they are never redirected. `?lang=en` URLs are JS-redirected; canonical tags point at the clean URLs. Google advises against `?loc=` parameter *versions*; here `?lang` is only a shortcut, never a canonical URL [V: same Google page] | Low. Under the Astro CSP, an `is:inline` script needs a **manually supplied hash** (§10) [L] |
| **2. Generated Netlify rules (optional fast path on top of 1)**: an `astro:build:done` hook (which receives `pages` and `dir` [V]) writes per-page `/<p>/ /en/<p>/ 302! Cookie=lang_en` plus `/<p>/ lang=en /en/<p>/ 302!` into `_redirects` | Cookie rules are reliable. Query rules work only when `lang` is the sole param, and literal values are unverified | Zero JS, redirected at the CDN, no extra HTML download | Same as 1 (crawlers carry no cookie) | Medium. Not testable in `astro preview` (only with `@netlify/vite-plugin` or `netlify dev`) |
| **3. Edge Function on `/*`** (excluding assets and `/admin/*`) | Full control: parses any params, sets `Set-Cookie`, returns 302 | Adds edge latency to **every** HTML request, plus cold starts [L] | Fine if crawlers get no redirect | Medium–high: Deno, config, and Netlify lock-in |
| 4. On-demand Astro middleware / `Astro.preferredLocale` | Full control | Every page becomes SSR, losing CDN-static HTML | Fine | Contradicts "static output" |

**Recommendation:**
- Use **Option 1** everywhere. The toggle writes localStorage (in try/catch, as the brief requires) **and** the `lang_en` presence cookie, so Option 2 can be switched on later without client changes.
- Emit `<link rel="alternate" hreflang="ar-XX">`, `hreflang="en"` and `x-default` (→ Arabic) on every page.
- Emit `og:locale` per country with an `en_US` alternate.
- **For demos**, send `noindex` as **both** a `<meta name="robots">` tag and an `X-Robots-Tag` header, driven by the site config flag. **Do not also disallow the pages in `robots.txt`**, because "for the noindex rule to be effective, the page … must not be blocked by a robots.txt file" [V: https://developers.google.com/search/docs/crawling-indexing/block-indexing].

Sketch of the inline script (Arabic and English pages both include it; ~0.5 KB minified) [A]:

```html
<script is:inline>
(function(){try{
  var p=location.pathname, q=new URLSearchParams(location.search), l=q.get('lang');
  var en = p==='/en/'||p==='/en'||p.indexOf('/en/')===0;
  var pref=null; try{pref=localStorage.getItem('lang')}catch(e){}
  if(l==='en'||l==='ar'){ pref=l; try{localStorage.setItem('lang',l)}catch(e){}
    document.cookie = l==='en' ? 'lang_en=1;path=/;max-age=31536000;samesite=lax' : 'lang_en=;path=/;max-age=0'; }
  if(l){ q.delete('lang'); }                          // keep utm_* etc., drop lang
  var rest=q.toString(), s=rest?('?'+rest):'', h=location.hash;
  if(pref==='en'&&!en){ location.replace('/en'+p+s+h); }
  else if(pref==='ar'&&en){ location.replace((p.replace(/^\/en(\/|$)/,'/'))+s+h); }
  else if(l&&history.replaceState){ history.replaceState(null,'',p+s+h); }
}catch(e){}})();
</script>
```

---

## 6. Content collections for files written by a git CMS

[V: https://docs.astro.build/en/guides/content-collections/]

- Loaders come from `astro/loaders`:
  - **`glob({ pattern, base, generateId })`**: one entry per file. It supports **Markdown, MDX, Markdoc, JSON, YAML and TOML**. `base` can point anywhere in the project, not only `src/content/`.
  - **`file(path, { parser })`**: many entries from one file. A JSON array needs an `id` on each item; for a JSON object, the keys become ids. YAML parses like JSON; TOML top-level tables become entries. A custom `parser` handles CSV or nested extraction.
- `reference('collection')` links collections (for example product → collection).
- Query with `getCollection(name, filter)`, `getEntry(name, id)` and `render(entry)`.
- **Live collections** (`src/live.config.ts`, `getLiveCollection()`) fetch at runtime. They have **no image optimisation** and need an adapter, so they are not for us [V].
- **CMS file layouts** (full detail in `docs/research/cms.md` §3.5):
  - `single_file` (one YAML per entry with `ar:`/`en:` keys) is the recommended structure. Use `glob({ pattern: '**/index.yml', base })` with a custom `generateId`.
  - Singletons (site settings, shipping table, hours): use one `glob` collection per folder of singleton files, then `getEntry('settings', 'general')`. This keeps them schema-validated, unlike raw JSON imports.
- **Entry ids:**
  - The default `glob` id is the slugified path. **Always pass `generateId`** for locale-suffixed files (`x.ar.yml`) or folder-per-entry layouts.
  - Arabic file names would become Arabic ids and URLs. **Configure the CMS slug to ASCII** (transliteration or an explicit `slug` field) [A: CMS setting; see cms.md].
- **For large catalogues** (site 03), use `glob({ deferRender: true })` [V: 7.1 blog]. Consider `experimental.incrementalBuild` only after the pilot [V: 7.2 blog].
- **How the `image()` helper resolves paths** [V: Astro source, `packages/astro/src/content/utils.ts` and `assets/utils/resolveImports.ts`, `main` branch today]:
  - Content-layer entries of **any** file type get the same `image()` transform. It keys off the entry's `filePath`, not on Markdown, so YAML and JSON data entries behave like frontmatter [L: source reading; confirm in pilot].
  - Bare file names (`cover.jpg`) are normalised to `./cover.jpg` **relative to the entry's folder**, if the file exists there. Otherwise the string is kept as-is and "likely a Vite alias", so **tsconfig/Vite aliases such as `@assets/uploads/x.jpg` are allowed**.
  - Strings containing `://` (remote) are **not imported**. They stay remote URLs and are optimised only if allowed through `image.domains`/`remotePatterns` [V: images guide].
  - Absolute `/…` paths go to Vite resolution. **`/uploads/x.jpg` in `public/` will not be optimised** [V: "Images stored in the public/ folder are never optimized"]. A root-relative `/src/assets/…` may resolve through Vite's root [A].
  - A path that doesn't resolve is a **fatal schema error**: `Image … does not exist. Is the path correct?` [V]. That is good, because a broken CMS upload fails the build instead of shipping a broken image.

---

## 7. Images (astro:assets) for CMS uploads

[V: https://docs.astro.build/en/guides/images/, https://docs.astro.build/en/reference/modules/astro-assets/]

- **Uploads must live under `src/`** (entry-relative media folders, or `src/assets/uploads` via an alias) to be optimised. **`public/` is copied as-is.** `<Image>` given a `public/` string only prevents layout shift, and it **requires `width`/`height`**.
- Local `src/` images get width and height **inferred** automatically. Output is **WebP by default**. `<Picture formats={['avif','webp']}>` emits `<source>` elements for each format, with a `fallbackFormat`.
- Useful props:
  - **`priority`** sets `loading="eager"`, `decoding="sync"` and `fetchpriority="high"`. Use it on the hero or LCP image only. The default is `lazy` + `async`.
  - `layout: 'constrained' | 'full-width' | 'fixed' | 'none'` (or the global `image.layout`) auto-generates `srcset`/`sizes`.
  - `fit` (default `cover`), `position`, `quality`, `widths`/`sizes` and `densities` (incompatible with `layout`).
- **sharp is the default service.** It is an **optional** dependency of astro. Astro's docs warn that with strict package managers like **pnpm "you may need to manually install Sharp"**. **Add `sharp` to each site's (or a shared) devDependencies** [V]. With pnpm 11+, allow its build scripts if prompted (`allowBuilds`) [A].
- Astro 6+ never upscales images, and crops by default when both dimensions are given [V].
- **AVIF encoding is slow.** On site 03 (150+ products × several widths × 2 formats), build time is dominated by image encoding. Astro caches transformed images in `node_modules/.astro` (the `cacheDir`) [V: 7.2 blog says caches live there]. **Persisting that directory between Netlify builds** is not verified: Netlify caches dependencies at the base directory, while per-site `node_modules/.astro` inside a pnpm workspace is uncertain [A]. Options include `netlify-plugin-cache` (used by a CodeStitch Astro 7 + Decap starter [L]) or a fixed `cacheDir` path.
- **Netlify Image CDN** (for comparison) [V: https://docs.netlify.com/build/image-cdn/overview/, adapter source]:
  - URL form: `/.netlify/images?url=&w=&h=&fit=&position=&fm=&q=`.
  - **Content negotiation prefers WebP, then AVIF**.
  - Transforms happen on first request, then are cached until the next deploy.
  - Site-relative sources need no config. Remote sources need `[images] remote_images`.
  - The Astro adapter's image service passes string `src` values (including `public/` paths) straight into `url=`, so with the adapter even `public/` images would be transformed at request time [V: source; L: behaviour].
  - **Not chosen:** there would be no AVIF for most browsers, a first-hit latency risk for the LCP image, and credit usage that isn't documented.
- **Brief compliance:** "WebP/AVIF, explicit width/height, lazy below the fold" is met by `<Picture formats={['avif','webp']}>` on `src/` images. Astro emits `width`/`height` and lazy loading by default [V].

---

## 8. Islands for cart and booking: the lightest option

| Option | Runtime cost (gzip) | Evidence | Notes |
|---|---|---|---|
| **Vanilla TS custom element in an Astro `<script>`** | **0 KB framework**; only your code | Astro recommends custom elements plus `data-*` attributes for passing server data. Processed scripts are bundled, deduplicated and emitted as `type="module"`; small ones are inlined [V: https://docs.astro.build/en/guides/client-side-scripts/] | No island loader, and no renderer client. Best for Lighthouse |
| + `nanostores` for cart state across components | "<1 KB, zero dependencies" [V: Astro recipe https://docs.astro.build/en/recipes/sharing-state-islands/]. Whole package 2.2 kB gz on bundlephobia; `atom` alone is smaller [V: bundlephobia API] | Works from plain `<script>` and from any framework | `@nanostores/persistent` backs a store with localStorage. **Wrap storage access in try/catch**, as the brief requires [A: check how the lib handles exceptions] |
| Preact 10.29.8 | ≈ **4.8 kB** core [V: bundlephobia API]; `@preact/signals` 2.11.2 adds ≈ 3.5 kB [V: bundlephobia] | `@astrojs/preact` 6.0.5 | Adds Astro's island hydration loader plus the renderer client [L]. Good if the booking calendar grows complex |
| Svelte 5.57 | Signals runtime ≈ 3–4 KB [L: khromov.se]. Another site measured "~1 KB" for the runtime and 7–16 KB per page with components [L: lillevang.dev]; the figures conflict | `@astrojs/svelte` 9 peers **TypeScript ≤ 6** | Compiles small, but adds a compiler and a second component model |

**Recommendation:**
- Use vanilla TS custom elements plus nanostores for the cart drawer, add-to-cart, the running estimate (site 13), slot pickers and form validation.
- The pure logic already required by the brief (money math, slot generation, shipping rules, WhatsApp builder) stays framework-free in `packages/*`, where it can be unit-tested.
- Measure in the pilot by building site 02 and checking `dist/_astro/*.js` sizes. Re-evaluate Preact only if the booking calendar's DOM code becomes unmanageable.

---

## 9. Persisting orders and bookings: Netlify Blobs vs Supabase

### 9.1 Netlify Blobs [V: https://docs.netlify.com/build/data-and-storage/netlify-blobs/]

- **API** (`@netlify/blobs` 11.1.0):
  - `getStore(name | { name, consistency, region, siteID, token })` for a site-wide store that survives deploys. `getDeployStore()` gives a deploy-scoped store.
  - Writes: `set` and `setJSON(key, value, { metadata, onlyIfNew, onlyIfMatch })`, which return `{ modified, etag }`.
  - Reads: `get(key, { type: 'json' | 'text' | 'arrayBuffer' | 'blob' | 'stream', consistency })`, `getWithMetadata` and `getMetadata`.
  - Listing: `list({ prefix, directories, paginate })` and `listStores()`.
  - Deleting: `delete` and `deleteAll`.
- **Consistency:**
  - **Eventual by default. Updates and deletes propagate within 60 s.**
  - `consistency: 'strong'` can be set per store or per read, at the cost of slower reads.
  - **Last write wins, with no transactions.** Use `onlyIfMatch` (ETag) for optimistic concurrency and `onlyIfNew` for idempotent order ids.
  - Pattern for daily caps and slot limits [A]: read the counter with strong consistency and get its ETag; write with `onlyIfMatch`; retry on `modified: false`.
- **Limits:** object ≤ **5 GB**; key ≤ **600 bytes**, cannot start with `/`; metadata ≤ **2 KB**; store name ≤ 64 bytes, with no `/` or `:`.
- **Regions:** `us-east-1`, `us-east-2` (the default for site-wide stores), `eu-central-1`, `ap-southeast-1` and `ap-southeast-2`. **Changing region does not migrate data.**
- **Access:**
  - Zero-config inside Functions, Edge Functions and build plugins. Go functions can't use it.
  - Blobs are browsable in the UI under *Data & Storage → Blobs*.
  - Local dev uses a sandbox store (via Netlify Dev or `@netlify/vite-plugin`).
- **Plan:** "Store files & images with Blob storage" is listed on Free [V: pricing.md]. **The credit cost of Blobs storage and operations is not documented** [A: watch the usage dashboard].
- **Fit:** good for demo orders and bookings, keyed like `orders/2026-09-23/<id>.json` and `caps/2026-09-23.json`. A read-only orders dashboard lists by prefix.

### 9.2 Supabase [V: https://supabase.com/pricing]

- Free plan:
  - **2 active projects**.
  - 500 MB database; 5 GB egress; 1 GB file storage; 50k auth MAUs.
  - **Paused after 1 week of inactivity**.
  - No backups.
- Pro is from $25/month.
- A demo that has been paused fails for the next prospect, so Supabase is **unsuitable as the demo default**. Keep it as the `full`-tier adapter for real clients who need relational queries, inventory and reporting.

### 9.3 Netlify Database (new; noted for completeness)

- The Free credit plan lists "3 databases, 20 branches, 5 GB storage, 48 compute units per period, sleeps after 5 min". It is billed at 10 credits per compute unit [V: https://docs.netlify.com/build/data-and-storage/netlify-database/billing-and-usage/].
- Its GA status and client package were **not verified** [A]. It could be a third `OrderStore` adapter later.

**Recommendation:** define an `OrderStore` / `BookingStore` interface in `packages/commerce` and `packages/booking`, with a `BlobsStore` (demo default) and a `SupabaseStore` (client option).

**Owner dashboard auth:**
- **Netlify Identity is included at no extra cost on all credit plans, with unlimited users**, and **server-side user verification in functions** [V: https://docs.netlify.com/manage/security/secure-access-to-sites/identity/plans-and-pricing/]. Identity is in Beta [V: git-gateway page].
- Netlify password protection is **not on Free** [V].
- The alternative is a signed-cookie passcode checked by a function [A].
- Git Gateway is deprecated, but Identity itself is not [V]. See cms.md for the CMS side.

---

## 10. Security headers and CSP on Netlify

- **Header syntax:** `[[headers]] for = "/path" [headers.values]` in `netlify.toml`, or a `_headers` file in the publish directory [V: https://docs.netlify.com/manage/routing/headers/].
- **When several rules match a path, their values are merged and joined with commas** [V]. Two `Content-Security-Policy` values joined this way form **two policies, both enforced**, so the effective result is their intersection. Result: a `/*` CSP strict enough for the storefront **will break `/admin/`**, which loads Sveltia from unpkg and calls `api.github.com`.
- **Headers don't apply to function responses, proxied content or SSR pages**. Those must set their own headers [V].
- **Astro `security.csp`** (stable since 6.0) [V: https://docs.astro.build/en/reference/configuration-reference/#securitycsp]:
  - It injects a `<meta http-equiv="content-security-policy">` per page, with SHA-256 hashes (configurable to SHA-384/512) of the scripts and styles Astro processes.
  - Extra directives go in `directives: [...]`. Use `scriptDirective` / `styleDirective` for `resources`, `hashes` and `strictDynamic`. Since 7.1, a `kind` of `element` or `attribute` selects the `-elem`/`-attr` variants.
  - **It does not work in `astro dev`**; test with `build` plus `preview`.
  - **It is incompatible with `<ClientRouter />`** (use native cross-document view transitions in CSS if needed).
  - External resources need explicit hashes or resources.
  - If `'unsafe-inline'` is present, Astro drops hashes for that directive.
  - **`is:inline` scripts are not hashed automatically. Supply their hashes** in `scriptDirective.hashes`, or use the per-page runtime CSP API [L: Astro docs via search]. The §5.2 language script is `is:inline`, so compute its SHA-256 in the shared config helper.
  - A `<meta>` CSP **cannot carry `frame-ancestors`, `report-uri` or `sandbox`** [L: Astro 5.11 notes].
  - With the adapter, **`staticHeaders: true`** emits the CSP as real headers for prerendered pages through Netlify's framework config [V: adapter source]. That is only relevant under option B.
- **Sveltia CMS `/admin` policy** [V: https://sveltiacms.app/en/docs/security]:

  ```
  style-src 'self' 'unsafe-inline'; font-src 'self' https://cdn.jsdelivr.net; img-src 'self' blob: data:;
  media-src blob:; frame-src blob:; script-src 'self' https://unpkg.com;
  connect-src 'self' blob: data: https://unpkg.com; manifest-src blob:
  ```

  Add to `connect-src`: `https://api.github.com`, `https://avatars.githubusercontent.com` and `https://raw.githubusercontent.com`, plus the OAuth origin (see cms.md).

**Recommended layering:**

| Where | What |
|---|---|
| `netlify.toml` `/*` | Only CMS-compatible hardening: `Content-Security-Policy: frame-ancestors 'self'; object-src 'none'; base-uri 'self'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, and `X-Robots-Tag` from the demo flag |
| Astro `security.csp` (site pages) | `script-src` / `style-src` hashes (Astro), plus `directives`: `default-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'`. Add analytics origins only when the analytics hook is enabled. JSON-LD `<script type="application/ld+json">` is a data block, not executed, so script-src does not block it [L] |
| `netlify.toml` `/admin/*` | The Sveltia policy above (a second, looser policy that stacks with the `/*` one, and is compatible with it) |

- Fonts self-hosted through the Astro Fonts API need no external origins (§11.4).
- WhatsApp is reached by navigation to `wa.me`, which CSP does not restrict.

---

## 11. Tailwind CSS v4 in Astro

### 11.1 Install [V: https://tailwindcss.com/docs/installation/framework-guides/astro, https://docs.astro.build/en/guides/styling/]

- Install `tailwindcss` and `@tailwindcss/vite`. Register them in the Astro config with `vite: { plugins: [tailwindcss()] }`.
- The stylesheet starts with `@import "tailwindcss";` and is imported in the layout.
- `astro add tailwind` (Astro ≥ 5.2) does exactly this. `@astrojs/tailwind` is legacy, for Tailwind 3 only.

### 11.2 Monorepo class detection [V: https://tailwindcss.com/docs/detecting-classes-in-source-files]

- v4 scans project files automatically, but **skips `.gitignore`d files, `node_modules`, binaries, CSS and lockfiles**.
- Components in `packages/ui` sit outside each site's scan root, and are symlinked through `node_modules` [L]. So add something like `@source "../../../../packages";` (relative to the CSS file), or `@import "tailwindcss" source("../../..")` [A: exact path].
- Other tools:
  - `@source not "…"` excludes paths.
  - `@source inline("…")` safelists classes, with brace expansion.
- **Never build class names dynamically.** Map config values to complete class strings.

### 11.3 RTL-safe utilities [V: tailwind docs pages cited]

| Need | Use | Avoid |
|---|---|---|
| Inline padding/margin | `ps-*` `pe-*` `ms-*` `me-*`, `px-*`/`mx-*` (these are `padding-inline`/`margin-inline`) | `pl-*` `pr-*` `ml-*` `mr-*` |
| Block padding/margin (v4.2+) | `pbs-*` `pbe-*` `mbs-*` `mbe-*` | only if writing mode matters; `pt/pb` are fine |
| Positioning | **`inset-s-*` `inset-e-*`** (v4.2+), `inset-bs-*` `inset-be-*` | `left-*` `right-*`, and **`start-*` `end-*` (deprecated in v4.2, still work but emit a warning)** |
| Text alignment | `text-start` `text-end` | `text-left` `text-right` |
| Borders and radius | `border-s-*` `border-e-*` `rounded-s-*` `rounded-e-*` `rounded-ss-*` … [L: standard v4 set] | `border-l/r`, `rounded-l/r` |
| Sizing (v4.2+) | `inline-*`, `min-inline-*`, `max-inline-*`, `block-*` … | |
| Spacing between children | `space-x-*` already uses `margin-inline-start/end` in v4 [V] | |
| Direction-specific tweaks | `rtl:` = `&:where(:dir(rtl), [dir="rtl"], [dir="rtl"] *)`, `ltr:` likewise [V]. Use them for things logical properties can't express, such as flipping directional icons (`rtl:-scale-x-100`) | |

- v4.2 (2026-02-18) added the logical block and inline utilities and deprecated `start-*`/`end-*` [V: GitHub release notes].
- v4.3 (2026-05-08) added scrollbar, `@container-size`, `zoom-*` and `tab-*` utilities, stacked/compound `@variant`, and utility `--default(...)` [V: https://tailwindcss.com/blog/tailwindcss-v4-3].
- **The RTL lint for `check-all`** [A]: grep the sources of `sites/*` and `packages/*` for `\b(-?m[lr]|p[lr]|left|right|start|end)-|text-(left|right)|rounded-[lr]|border-[lr]\b` and fail on a match. Add an allow-comment for intentional physical cases, such as a phone number that stays LTR.

### 11.4 Per-brand theming with CSS custom properties [V: https://tailwindcss.com/docs/theme]

- **`@theme` variables create utilities**: `--color-*` → `bg-*`/`text-*`, plus `--font-*`, `--text-*`, `--radius-*`, `--shadow-*`, `--spacing`, `--breakpoint-*`. They are also emitted as `:root` CSS variables.
- `--color-*: initial` (or `--*: initial`) removes the defaults, so no stray `bg-blue-500` can appear.
- **`@theme inline { --color-accent: var(--brand-accent); }`** makes the utility use the *referenced* variable, avoiding resolution problems in nested contexts.
- Pattern:
  - A shared `packages/brand/theme.css` declares semantic tokens (`--color-surface`, `--color-ink`, `--color-accent`, `--color-hairline`, `--font-display`, `--font-body`, `--radius-card`, …) through `@theme inline`, each mapped to a `--brand-*` variable.
  - Each site's generated `tokens.css` (from `brand/tokens.ts`) sets the `--brand-*` values on `:root`.
  - Components only ever use semantic utilities (`bg-surface`, `text-ink`, `border-hairline`).
- Sharing a theme file across projects by `@import "../brand/theme.css"` is documented [V].
- **Astro Fonts API** (stable since 6):
  - `fonts: [{ provider: fontProviders.google(), name: 'Readex Pro', cssVariable: '--font-readex', weights: ['300 700'], subsets: ['arabic','latin'], fallbacks: ['sans-serif'] }]` plus `<Font cssVariable="--font-readex" preload />` in `<head>`.
  - Fonts are **downloaded at build and self-hosted** under `_astro/fonts/`, with optimised metric fallbacks.
  - Wire them to Tailwind with `@theme inline { --font-body: var(--font-readex); }` [V: https://docs.astro.build/en/guides/fonts/; `subsets` value names A].
  - This removes third-party font origins from the CSP and helps LCP and CLS.

---

## 12. Tooling for `check-all` on Windows

- **Browsers:** Chrome 153 and Edge 153 are installed (§1.2). **No browser download is needed** if the tools are pointed at them.
- **Lighthouse** 13.5.0 [V: npm engines; https://github.com/GoogleChrome/lighthouse/blob/main/docs/readme.md, …/throttling.md]:
  - **It requires Node ≥ 22.19, and this machine has 22.18. Upgrade Node**, preferably to 24 LTS, or pin `lighthouse@12.8.2` (Node ≥ 18.16) [V].
  - Programmatic use: `const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] }); const r = await lighthouse(url, { port: chrome.port, output: 'json', onlyCategories: ['performance','accessibility','best-practices','seo'] }); r.lhr.categories.performance.score`.
  - Defaults are **mobile with simulated throttling**: 150 ms RTT, 1.6 Mbps down / 750 Kbps up, 4× CPU, a 412×823 viewport at DPR 1.75, and a Moto G Power UA [V]. This matches the brief's "simulated 4G phone".
  - chrome-launcher uses `chromePath`, then `CHROME_PATH`, then auto-detection [V]. Set `CHROME_PATH` explicitly in the script for determinism. Edge can be used via `chromePath` [A].
  - Run each URL about 3 times and take the median, because simulated scores vary [A: common practice].
- **Serving builds:** use `astro preview --background` (7.2+) [V] or any static server, one port per site.
  - Note that local preview lacks Netlify's Brotli/HTTP2 and headers, so performance scores differ from production [A].
  - `@netlify/vite-plugin` emulates headers and redirects only in dev [V: README].
- **Accessibility:** `@axe-core/playwright` 4.13: `await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze()`, then assert that `violations` is empty [V: https://playwright.dev/docs/accessibility-testing].
  - Use Playwright with the installed browsers through **`channel: 'chrome'`** or **`'msedge'`**, with no download [V: https://playwright.dev/docs/browsers]. Branded browsers use the *new* headless mode, which differs from Playwright's default headless shell [V].
  - **pa11y is not recommended.** It drives Puppeteer, which downloads its own Chrome [L], and it duplicates axe.
- **Links:** `linkinator` 8.1 (Node ≥ 22) [V].
  - CLI: `npx linkinator ./sites/02/dist --recurse --clean-urls --format json`.
  - API: `new LinkChecker().check({ path: './dist', recurse: true, linksToSkip: [...] })` [V: README].
  - Skip `wa.me` and external domains, or run those in a separate non-blocking pass [A].
- **Screenshots:** Playwright at 390×844 and 1440×900, for `/` and `/en/` [A: viewport choice]. Use `page.screenshot({ fullPage: true })` after `document.fonts.ready`.
- **RTL smoke test** [A]:
  - Assert that `<html lang="ar" dir="rtl">` and `<html lang="en" dir="ltr">` are set.
  - Assert no horizontal overflow (`document.documentElement.scrollWidth <= innerWidth`).
  - Assert that the first nav item sits on the right in AR and on the left in EN.
  - Run the §11.3 class lint.
- **Output:** print a table per site and locale, with Perf, A11y, BP, SEO, LCP, axe violations and broken links. Exit non-zero on any failure below the brief's thresholds.

---

## 13. Conflicts with the brief, and decisions needed

1. **Netlify Free is too small for 14 auto-deployed sites** (§4.4). The brief assumes "deploy to Netlify" per site with CMS edits, but one untargeted commit costs 210 of the 300 monthly credits, and exhaustion pauses *every* site. **Decide:**
   - (a) Personal/Pro for the portfolio team;
   - (b) demos deployed manually with builds stopped, and CMS edits previewed on free Deploy Previews;
   - (c) a single-site bundle of all demos; or
   - (d) a mix.
   Precise `ignore` commands are needed in every case.
2. **"Netlify Identity / git-gateway for clients"**: Git Gateway is deprecated by Netlify [V], and Sveltia doesn't support it [V]. Identity itself is still supported and free on credit plans [V]. See cms.md §3 for the client auth recommendation (GitHub OAuth via Netlify's OAuth provider).
3. **Brief lists `start-/end-` utilities**: they are deprecated since Tailwind 4.2. Use `inset-s-*` and `inset-e-*` [V].
4. **Toolchain versions vs this machine:**
   - Node 22.18 is below Lighthouse 13's floor of 22.19 [V].
   - TypeScript `latest` is 7.0, but the Astro tooling peers need ≤ 6 [V].
   - pnpm 11+ skips packages younger than 1 day by default [L].
   **Decide:** upgrade Node to 24 LTS, pin TypeScript to `^6`, and pin pnpm in `packageManager`.
5. **"Static output" vs "Netlify Functions for server-side"**: there is no conflict under option A (§3). It is noted because choosing B (the adapter) would change the image pipeline (Netlify Image CDN, which prefers WebP) unless `imageCDN: false` is set.
6. **CSP "via netlify.toml"**: a single site-wide CSP header can't serve both a strict storefront and `/admin/` (header merge, §10). The plan uses Astro's meta CSP for pages plus layered `netlify.toml` headers. The brief's intent is met, but not literally "all in netlify.toml".
7. **`?lang=en` with zero JS is impossible to do reliably on Netlify.** Query rules fail when other params are present [V], so a tiny inline script is required (§5.2).
8. **Workspace path contains spaces** (`arabic websites`, `Shujaat Mallick`): this is a historical Astro/Vite failure mode [L]. Verify at the first build.

---

## 14. Open questions to settle in the Step 2 and 3 pilots

- [A] `@netlify/vite-plugin` in `astro dev` without the adapter: does it serve `sites/NN/netlify/functions` and a Blobs sandbox?
- [A] Netlify esbuild bundling of functions that import `workspace:*` TS packages under pnpm 12. Is `nodeLinker: hoisted` needed?
- [A] `image()` in YAML `single_file` entries, and with an alias path. The source says yes; confirm with a real CMS-written file.
- [A] `injectRoute` with `[...lang]` rest params, and `Astro.currentLocale` / `getRelativeLocaleUrl` behaviour on those routes.
- [A] The first-build behaviour of the `ignore` command (`CACHED_COMMIT_REF` == `COMMIT_REF`?), and whether ignored builds really consume 0 credits.
- [A] Netlify query-rule literal matching (`/about/ lang=en /en/about/ 302!`). Only needed if Option 2 of §5.2 is enabled.
- [A] Persisting `node_modules/.astro` (the image cache) between Netlify builds in a pnpm workspace.
- [A] Whether Netlify's API or CLI can set the *package directory*, for automated `new-site` provisioning (it is UI-only per the docs).
- [A] Netlify Blobs credit cost, and Netlify Database status.
- [A] `compressHTML: 'jsx'` effects on Arabic inline markup.
- [A] Astro/Vite builds in a path with spaces on Windows.

---

## 15. Sources (all accessed 2026-09-23)

**Astro**
- Upgrade to v6: https://docs.astro.build/en/guides/upgrade-to/v6/
- Upgrade to v7: https://docs.astro.build/en/guides/upgrade-to/v7/
- Upgrade to v5 (hybrid removal): https://docs.astro.build/en/guides/upgrade-to/v5/
- Astro 7.1 / 7.2 release posts: https://astro.build/blog/astro-710/ · https://astro.build/blog/astro-720/
- What's new July / August 2026: https://astro.build/blog/whats-new-july-2026/ · https://astro.build/blog/whats-new-august-2026/
- Astro 7 summary: https://morello.dev/blog/astro-7
- On-demand rendering: https://docs.astro.build/en/guides/on-demand-rendering/
- Netlify adapter: https://docs.astro.build/en/guides/integrations-guide/netlify/
- Adapter source: https://github.com/withastro/astro/tree/main/packages/integrations/netlify/src (`index.ts`, `image-service.ts`)
- i18n: https://docs.astro.build/en/guides/internationalization/
- Content collections: https://docs.astro.build/en/guides/content-collections/
- Images: https://docs.astro.build/en/guides/images/ · https://docs.astro.build/en/reference/modules/astro-assets/
- `image()` source: https://github.com/withastro/astro/blob/main/packages/astro/src/content/utils.ts · …/content/runtime-assets.ts · …/assets/utils/resolveImports.ts · …/content/mutable-data-store.ts
- Client-side scripts: https://docs.astro.build/en/guides/client-side-scripts/
- Sharing state between islands: https://docs.astro.build/en/recipes/sharing-state-islands/
- Integration API (`injectRoute`, `astro:build:done`): https://docs.astro.build/en/reference/integrations-reference/
- Config reference (`security.csp`): https://docs.astro.build/en/reference/configuration-reference/#securitycsp
- CSP flag page (historical): https://docs.astro.build/en/reference/experimental-flags/csp/
- Fonts: https://docs.astro.build/en/guides/fonts/
- Sitemap: https://docs.astro.build/en/guides/integrations-guide/sitemap/
- Styling / Tailwind: https://docs.astro.build/en/guides/styling/
- Spaces-in-path issues: https://github.com/withastro/astro/issues/12556 · https://github.com/withastro/astro/issues/4065 · https://github.com/withastro/astro/issues/4636

**Netlify**
- Astro on Netlify: https://docs.netlify.com/frameworks/astro/
- Astro 7 changelog: https://www.netlify.com/changelog/2026-06-22-astro-7/
- Monorepos: https://docs.netlify.com/build/configure-builds/monorepos/
- Build configuration overview: https://docs.netlify.com/build/configure-builds/overview/
- Ignore builds: https://docs.netlify.com/build/configure-builds/ignore-builds/
- File-based configuration: https://docs.netlify.com/build/configure-builds/file-based-configuration/
- Manage dependencies (pnpm, Node): https://docs.netlify.com/build/configure-builds/manage-dependencies/
- Enhanced monorepo blog: https://www.netlify.com/blog/better-monorepos-on-netlify/
- CLI: https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/
- OpenAPI spec (`stop_builds`): https://github.com/netlify/open-api/blob/master/swagger.yml
- Redirect options (query params, cookies, `nf_lang`, domain-level rules): https://docs.netlify.com/manage/routing/redirects/redirect-options/
- Rewrites and proxies (shadowing): https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/
- Forum threads on literal query matching: https://answers.netlify.com/t/how-to-redirect-with-a-specific-query-parameter/30257 · https://answers.netlify.com/t/redirect-based-on-query-parameter/55691
- Headers: https://docs.netlify.com/manage/routing/headers/
- Edge Functions: https://docs.netlify.com/build/edge-functions/overview/ · https://docs.netlify.com/build/edge-functions/limits/ · https://docs.netlify.com/build/edge-functions/declarations/
- Functions: https://docs.netlify.com/build/functions/overview/ · https://docs.netlify.com/build/functions/get-started/ · https://docs.netlify.com/build/functions/configuration/ · https://docs.netlify.com/build/functions/api/
- Frameworks API: https://docs.netlify.com/build/frameworks/frameworks-api/
- Blobs: https://docs.netlify.com/build/data-and-storage/netlify-blobs/
- Netlify Database billing: https://docs.netlify.com/build/data-and-storage/netlify-database/billing-and-usage/
- Image CDN: https://docs.netlify.com/build/image-cdn/overview/
- Pricing: https://www.netlify.com/pricing/ · https://www.netlify.com/pricing.md
- How credits work: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/
- Credit-based pricing plans: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/
- Billing FAQ: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/billing-faq-for-credit-based-plans/
- Git Gateway (deprecated): https://docs.netlify.com/manage/security/secure-access-to-sites/git-gateway/
- Identity plans: https://docs.netlify.com/manage/security/secure-access-to-sites/identity/plans-and-pricing/
- pnpm + esbuild functions issue: https://answers.netlify.com/t/functions-not-building-with-pnpm-and-esbuild/131215
- pnpm detection issue: https://github.com/netlify/build/issues/4648
- `@netlify/vite-plugin` README: `npm view @netlify/vite-plugin readme` (v3.0.1)

**Tailwind**
- Astro install: https://tailwindcss.com/docs/installation/framework-guides/astro
- Theme variables: https://tailwindcss.com/docs/theme
- Detecting classes: https://tailwindcss.com/docs/detecting-classes-in-source-files
- RTL variants: https://tailwindcss.com/docs/hover-focus-and-other-states#rtl-support
- Logical inset: https://tailwindcss.com/docs/top-right-bottom-left
- Margin: https://tailwindcss.com/docs/margin
- Text align: https://tailwindcss.com/docs/text-align
- v4.2 release: https://github.com/tailwindlabs/tailwindcss/releases/tag/v4.2.0
- v4.3 blog: https://tailwindcss.com/blog/tailwindcss-v4-3

**pnpm**
- pnpm 12.0: https://pnpm.io/blog/releases/12.0
- What's different in pnpm 12: https://pnpm.io/blog/whats-different-in-pnpm-12
- pnpm 11.0: https://pnpm.io/blog/releases/11.0
- Migration: https://pnpm.io/migration

**Islands**
- Bundlephobia API: https://bundlephobia.com/api/size?package=preact@latest · …@preact/signals@latest · …nanostores@1.5.3
- Svelte 5 size: https://khromov.se/svelte-5-brings-up-to-50-bundle-size-decrease-for-existing-svelte-4-apps/ · https://lillevang.dev/blog/svelte-islands-on-astro/

**Data**
- Supabase pricing: https://supabase.com/pricing

**CMS (security and backends)**
- https://sveltiacms.app/en/docs/security · https://sveltiacms.app/en/docs/backends

**SEO**
- Block indexing: https://developers.google.com/search/docs/crawling-indexing/block-indexing
- Multi-regional sites: https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites

**Testing**
- Lighthouse: https://github.com/GoogleChrome/lighthouse/blob/main/docs/readme.md · …/docs/throttling.md · …/core/config/constants.js
- chrome-launcher: https://github.com/GoogleChrome/chrome-launcher
- Playwright accessibility testing: https://playwright.dev/docs/accessibility-testing
- Playwright browsers: https://playwright.dev/docs/browsers
- linkinator: https://github.com/JustinBeckwith/linkinator

**Local commands run** (outputs summarised in §1): `npm view` (versions, engines, peers, dist-tags, times), browser path checks, `node -v`, `corepack --version`, `npm config get prefix`, and the PowerShell `VersionInfo` of `chrome.exe`/`msedge.exe`.
