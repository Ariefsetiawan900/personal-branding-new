# Migration and validation notes

## Baseline

Original source was preserved before application changes. macOS Chromium screenshots were captured at widths 1440, 768, 390, 360, 991, 992, 767, 575, and 576px. Main states include Home, both About timelines, Contact, menu, Portfolio, and both project dialogs. Poppins loaded successfully and no browser errors were recorded during baseline capture. The capture report recorded an unnamed menu button and unnamed social links as critical/serious axe violations.

Tests also serve the original fixture and migrated build together so font rendering and platform differences do not create misleading cross-platform comparisons. The frozen macOS images remain independent reference evidence.

## Local validation

- Frozen pnpm install, format check, lint, `astro check`, unit tests, and static build passed on Node 24.15. Astro dev responded with HTTP 200 in a local smoke test; preview served the browser test suite.
- All 102 E2E cases passed in Chromium, Firefox, and WebKit with two workers, matching CI. They include CSP checks and axe scans with no serious or critical violations in the tested sections, navigation, and dialogs. Functional tests block Google Fonts requests to avoid external network stalls; visual tests load and verify actual Poppins.
- All nine Chromium original-versus-Astro visual comparisons passed at 1440, 992, 991, 768, 767, 576, 575, 390, and 360px. Main desktop/tablet/mobile states cover both About tabs, menu, Portfolio, and both project dialogs. The optimized Portfolio thumbnail at 390px differed in 0.09% of pixels; the comparator allows at most 0.11%. A one-pixel height difference from subpixel rounding is explicitly checked and allowed, with all shared pixels still compared. No baseline was rewritten.
- A five-run Chromium lab comparison at 1440px, serving both versions through the same local static server, found median same-origin resource bodies of 2,667,434 bytes for the original and 205,686 bytes for Astro on initial Home load. Median load events were 290ms and 307ms respectively; this small timing difference is too noisy to claim a speed gain. External Google Fonts and the HTML navigation body are outside that byte count. Field INP remains unknown.

## Intentional behavior changes

- Hash navigation now handles direct links, refresh, Back/Forward, invalid hashes, and repeated navigation consistently. The existing `portofolio` identifier is retained.
- The loader's original `fade-out` selector typo is repaired, preserving the 600ms dismissal and 500ms navigation transition.
- A three-second fallback starts loader dismissal if a slow external resource delays the window load event. The normal load path keeps its original timing.
- The preserved Firebase-style 404 page now points maintainers to its Astro source file instead of a removed root HTML file.
- Core content remains readable without JavaScript; loader/menu/dialog behavior is enabled only as enhancement.
- Navigation, tabs, and project dialogs have accessible labels, keyboard controls, focus management, and state attributes. Decorative icons remain visual only.
- Focus indicators and reduced-motion rules are intentional accessibility additions. Existing general typography, spacing, colors, and breakpoints remain the baseline.
- Project details are cloned from static typed-data templates, rather than copying arbitrary `innerHTML` from the page.
- Original Firebase metadata is replaced by configuration from `SITE_URL`; preview and local builds cannot be indexed.

## Release checks outside local scope

- Connect and execute GitHub Actions to verify live CI status.
- Select a production domain, configure `SITE_URL`, connect Vercel, and review a hosted preview before production.
- Check installed Chrome, Edge, and Safari where available. Playwright WebKit coverage does not claim a Safari application session.
- Validate actual hosting headers, including the frame policy and HSTS, after deployment. Local Astro preview checks the HTML CSP only.
- Measure field Web Vitals, especially INP, after genuine traffic exists. Local timings and file-size comparisons are lab measurements.

Check outcomes must be recorded from actual command results; configuration alone is not evidence that tests or remote deployment passed.
