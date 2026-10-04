# 0002. Vitest and Testing Library for unit tests

- **Status:** accepted
- **Date:** 2026-10-03

## Context

The project had no tests. A bug in the nav (focusing the search field while the plate was still short scrolled it out of place) shipped because nothing exercised the component's behavior.

## Decision

1. **Add Vitest with jsdom** as the unit-test runner, set up as in the Next.js guide (`node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`). Scripts: `test` (watch) and `test:run` (once, for CI).
2. **Use Testing Library** (`@testing-library/react`, `user-event`, `jest-dom`). Tests find elements by role and accessible name and assert on what a user or assistive technology can observe: `aria-*` state, focus, links. They do not read class names, CSS variables, component state or refs.
3. **Do not mock `motion` or `next/link`.** Tests set `prefers-reduced-motion` so the real code jumps to its end state, which keeps animation out of the way without a mock that could drift from the real library.
4. **Bump `@types/node` to ^22.** Vitest 5 requires it.
5. Test files sit next to the code (`nav.test.tsx`).

## Alternatives considered

- **Jest.** Works with Next, but needs more transform config; Vitest reuses the Vite pipeline and is faster.
- **Playwright only.** Real browser, so CSS and springs are testable, but slow and heavy for logic like focus and state. Still the right tool for fill, tint and motion; not added yet.

## Consequences

- jsdom does not apply CSS, so `visibility`-based hiding, scroll fill, tint and spring motion cannot be unit tested. They need a browser test.
- jsdom has no `matchMedia`; tests stub it.
