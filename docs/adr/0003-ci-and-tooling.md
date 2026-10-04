# 0003. CI, typecheck script, and native tsconfig paths in Vitest

- **Status:** accepted
- **Date:** 2026-10-03

## Context

Nothing ran the lint, tests or a production build except by hand. There was no typecheck script, and Vitest warned that `vite-tsconfig-paths` is redundant now that Vite resolves tsconfig paths itself.

## Decision

1. **GitHub Actions CI** (`.github/workflows/ci.yml`) runs `lint`, `typecheck`, `test:run` and `build` on pull requests and pushes to `develop` and `main`. One job, steps in that order, so the cheap checks fail first. Node comes from `.nvmrc` (22); `package.json` `engines.node` is `>=22`.
2. **Add `typecheck`** (`tsc --noEmit`) and `check` (lint, typecheck, tests) scripts. `next build` also typechecks, but a separate script gives a fast local check and a named CI step.
3. **Remove `vite-tsconfig-paths`.** `vitest.config.mts` sets `resolve.tsconfigPaths: true` instead. One fewer dependency, same behavior; the 40 nav tests pass unchanged.
4. **ESLint ignores `.agents/`**, which holds example code shipped with agent skills.

## Alternatives considered

- **Prettier.** Not added: the code is already consistently formatted by hand and a formatter would reflow every file. Revisit if more contributors join.
- **Separate CI jobs.** Parallel jobs finish sooner but each repeats `npm ci`; the whole run is short, so one job is simpler.

## Consequences

- `next build` fetches Google Fonts, so CI needs network access (GitHub-hosted runners have it).
- Branch protection (requiring this check) is a repository setting, not set up by this change.
- The Vitest config no longer follows the Next.js testing guide's `vite-tsconfig-paths` example.
