# malnushi

Mal Nushi's personal site: writing, projects, photography and living collections. Built with Next.js (App Router), React, Tailwind CSS v4 and Motion.

> This is a newer Next.js than most documentation covers. Before changing framework code, read the matching guide in `node_modules/next/dist/docs/`. See [AGENTS.md](AGENTS.md).

## Requirements

Node 22 or later (`.nvmrc` pins 22) and npm.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000. Fonts come from Google Fonts at build time, so the first build needs network access.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest in watch mode |
| `npm run test:run` | Vitest once |
| `npm run test:e2e` | Playwright end-to-end and accessibility tests against a production build (first run: `npx playwright install chromium`) |
| `npm run test:visual` | Visual regression screenshots (macOS baselines; `npm run test:visual:update` accepts a change) |
| `npm run analyze` | Bundle analyzer (`next experimental-analyze`) |
| `npm run check` | Lint, typecheck and tests, the same as CI minus the build |

CI (`.github/workflows/ci.yml`) runs lint, typecheck, unit tests and a build, and separately the Playwright suite, on every pull request and push to `develop` and `main`. Visual regression is local only for now (TODO: Linux baselines, see ADR 0004).

## Configuration

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin (for example `https://example.com`). Used for Open Graph URLs, `sitemap.xml` and `robots.txt`. Defaults to `http://localhost:3000`. |

## Docs

- [docs/DESIGN.md](docs/DESIGN.md): the design specification, including the design tokens.
- [docs/design-log.md](docs/design-log.md): design decisions and the reasons for them.
- [docs/performance.md](docs/performance.md): Lighthouse baseline, bundle and font findings, image pattern and budgets.
- [docs/component-checklist.md](docs/component-checklist.md): status of each component.
- [docs/adr/](docs/adr/): architecture decision records.
- `tokens/`: design tokens in W3C DTCG JSON, the source of truth. `src/app/globals.css` mirrors them by hand.

## Layout

```
src/app/         routes, metadata files (icon, robots, sitemap, Open Graph image)
src/components/  shared components, with tests beside them
e2e/             Playwright specs: smoke, nav, accessibility, visual
src/lib/         site constants and helpers
tokens/          design tokens
docs/            design spec, log, ADRs
```
