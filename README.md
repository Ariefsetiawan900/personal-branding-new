# Arief Setiawan — personal website

Static Astro website with strict TypeScript. The migration preserves the original CSS, Poppins typography, content, responsive breakpoints, and section navigation. Portfolio remains reachable at `/#portofolio`; its navigation shortcuts and the contact form remain inactive.

## Local development

Use Node 24 (minimum 24.15) and pnpm 11.0.6:

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm preview
```

The built site is in `dist/`. Images are processed by Astro/Sharp; no UI framework, server adapter, backend, or database is required. Google Fonts still supplies Poppins, so online font access is needed to reproduce the baseline typography.

## Configuration and publication

Copy `.env.example` to `.env` for local settings. `SITE_URL` is the final canonical origin, for example `https://your-domain.example`, without a path, query, or fragment. The default local origin is `http://localhost:4321`. Local and preview builds always carry `noindex,nofollow`, disallow robots, and produce an empty sitemap.

Production builds require an explicit, valid HTTPS `SITE_URL` with a public domain. Production is selected by `VERCEL_ENV=production` or `DEPLOY_ENV=production`; malformed or missing configuration stops the build. `NODE_ENV=production` alone does not enable indexing because all Astro preview builds use production optimization too. Both metadata and generated endpoints use the same configuration helper.

Vercel setup, once an account/repository and domain are ready:

1. Connect the GitHub repository to a Vercel project and select Node 24. `vercel.json` supplies the frozen install, build command, and `dist` output directory.
2. Set `SITE_URL` to the final production origin in the Production environment. Set the same value for Preview if canonical links should point to production. Vercel supplies `VERCEL_ENV`; previews remain unindexed.
3. Review a preview deployment after CI passes. Check its metadata, images, fonts, CV, 404, console, CSP, keyboard interactions, and mobile layout.
4. Configure the domain and release the reviewed revision to production. Verify `/robots.txt`, `/sitemap.xml`, canonical metadata, and security response headers again.
5. Roll back through Vercel by promoting the last verified deployment if needed; keep the Git revision and environment configuration associated with each release.

Firebase is an alternative, not an additional live target. `firebase.json` serves `dist` and includes equivalent response headers. Build with `DEPLOY_ENV=production SITE_URL=https://your-domain.example pnpm build` before an explicitly authorized `firebase deploy --only hosting`. No Firebase project identifier or credentials are committed. Rollback uses the previous Hosting release in the Firebase console.

No accounts are connected and no preview/production deployment has been published by this migration.

## Checks

```sh
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium firefox webkit
pnpm test:e2e
pnpm test:visual
```

`pnpm check` runs formatting, lint, type checking, unit tests, and the build. Use `pnpm format` only for intentional formatting changes. `astro check` validates both Astro and TypeScript source. Unit tests focus on navigation and publication configuration. Playwright covers Chromium, Firefox, WebKit, keyboard/focus behavior, accessible names, axe checks, responsive layouts, JavaScript failure, and metadata. These engines do not constitute manual verification of the installed Chrome, Edge, or Safari applications.

Playwright starts the built site on port 4173 and the original fixture on port 4180. Python 3 is required for the latter. Visual tests compare both versions in the same browser process and environment, using the same fonts and viewport. The immutable original source lives in `tests/visual/legacy`; original macOS reference screenshots and capture findings are in `tests/visual/baseline`. Any optional Playwright snapshots are separated by platform and browser in the configured snapshot path. Do not alter the fixture or accept new screenshots merely to make a failing comparison pass; inspect the diff and record a justified change.

Functional E2E tests block external Google Fonts requests so navigation, accessibility, and modal checks do not depend on that network service. Visual tests deliberately load actual Poppins and fail when it is unavailable.

GitHub Actions runs the same checks plus all three browser engines, accessibility, and original-versus-migrated visual comparisons on Ubuntu. Test reports, traces, and diff artifacts are uploaded on failure. A workflow file does not prove a hosted CI run; live CI status is verified after the repository is connected.

## Source and maintenance

- `src/data` contains typed profile, skills, timeline, social, and project content; edit content there rather than duplicating markup.
- `src/components` and `src/layouts` render static content. `src/scripts` progressively enhances section navigation, tabs, loader, and project dialogs.
- `src/styles/global.css` retains the original stylesheet with small accessibility and progressive-enhancement additions. The 991/767/575px breakpoints are preserved.
- `public` contains the CV, favicon, and existing Font Awesome files; `src/assets` holds the image sources processed at build time.

New links opened in a new tab use safe `rel` attributes. CSP is generated by Astro at build time, with script/style hashes and only the required Google Fonts origins. Hosting adds a separate `frame-ancestors 'none'` policy, MIME sniffing protection, a referrer policy, permissions restrictions, frame protection, and HSTS. CSP is tested against `build`/`preview`; the development server cannot validate the production policy. Hosting response headers require a hosted preview check.

Dependencies are pinned and the lockfile is committed. ESLint 9 and Astro lint plugin 1 are pinned for compatibility with the currently available Node 24.15 runtime; ESLint 9 is upstream-deprecated. Upgrade Node to 24.16 or later and test the current ESLint/Astro plugin pair together before removing that compatibility pin. TypeScript 6 is used because the current Astro checker and typescript-eslint do not yet accept TypeScript 7. Only required image/build package install scripts are allowed by pnpm.

See [the asset audit](docs/asset-audit.md) and [migration validation notes](docs/migration.md) for preservation decisions and remaining external checks.
