<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Design

- `docs/DESIGN.md` is the design specification for the site.
- `docs/design-log.md` records design decisions, with the reasons. Read it before changing tokens, and add a dated entry whenever you make or change a design decision.
- Keep the "Design tokens" section of `docs/DESIGN.md` in sync when you add, rename or remove tokens.
- Unresolved design questions go in the "Open questions" section of DESIGN.md, not in the log.

# Architecture

- `docs/adr/` holds architecture decision records, numbered in order. Add one when an engineering decision adds a dependency or sets a pattern others should follow. Design decisions still go in `docs/design-log.md`.
