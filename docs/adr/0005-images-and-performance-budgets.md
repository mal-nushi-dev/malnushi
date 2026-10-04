# 0005. Images, bundle analysis, and performance budgets

- **Status:** accepted
- **Date:** 2026-10-03

## Context

The site has no real images or content yet, which is the cheapest time to set the patterns that content will follow. A Lighthouse baseline (docs/performance.md) shows a healthy desktop page (99, LCP 0.8 s) and no problems that need fixing now, so the work is guardrails: how images are served, how the bundle is inspected, and what fails the build if the page grows.

## Decision

1. **Images:** serve through `next/image`, with `formats: ["image/avif", "image/webp"]` and `qualities: [75]` in `next.config.ts`. A `Photo` component (`src/components/photo.tsx`) fixes width, height and `sizes` per figure size, loads lazily, and takes `aboveTheFold` for the one eager, high-priority image. Local images are imported statically. Served size budgets: hero at most 200 kB, column at most 120 kB.
2. **Bundle analysis:** use the built-in `next experimental-analyze` (`npm run analyze`). Do not add `@next/bundle-analyzer`, which only supports webpack.
3. **Budgets as a test:** `e2e/budget.spec.ts` asserts transfer budgets for the home page (JS, CSS, fonts, total), the number of preloaded fonts, immutable font caching and compression. No new dependency.
4. **Fonts unchanged.** Subsets, `display: swap` and preloading were checked and are right; a trial of not preloading the italic and mono made First Contentful Paint worse (docs/performance.md).
5. **Lighthouse is run by hand**, with `npx`, not added as a dependency or a CI job.
6. **Field metrics deferred** until the site is live.

## Alternatives considered

- **`@next/bundle-analyzer`.** Suggested earlier in planning; it does not work with Turbopack, which Next 16 uses by default.
- **Lighthouse CI in CI.** The scores move with runner noise and the page is nearly empty. The budget test catches the regressions that matter (bytes, preloads) deterministically. Revisit when there is real content.
- **`LazyMotion` with `domAnimation`.** It slims the `motion.div` components; the nav uses `animate` and `motionValue` only, so it would change nothing.
- **Several image qualities.** Each allowed quality is another cached variant. One is enough until a photograph looks wrong.
- **Replacing the `→` glyph with SVG** to save 64 kB of font subsets. Recorded as a finding; it changes a visible glyph, so it waits for a design decision.

## Consequences

- AVIF and WebP are cached separately by the optimizer, so image storage on the host roughly doubles.
- The budgets will need raising, with a reason in docs/performance.md, when real content lands.
- A new image size needs a new entry in `Photo` and in `ImagePlaceholder`; both are keyed by `ImageSize`.
