# Component checklist

Status of the components in `src/components/`, previewed at `/components`. Design decisions for each live in [design-log.md](design-log.md); the spec lives in [DESIGN.md](DESIGN.md). Desktop only for now.

Legend: `[x]` built · `[ ]` not started · `[~]` in progress

Components are grouped in sections 01–06. States (hover, focus) are CSS; variants are props.

## 01 Shell

- [x] Nav (floating toolbar: search, wordmark, menu; expands on springs)
- [x] Next Link
- [x] Footer
- [x] Status Page (404 and error pages; `src/components/status-page.tsx`)

## 02 Text and media

- [x] Eyebrow
- [x] Meta Row
- [x] Section Label
- [x] Caption (image, photo with EXIF)
- [x] Image Placeholder (hero 1248 × 640, column 680 × 453)
- [x] Figure (`size`: hero, column)
- [x] Portrait
- [x] Photo (`next/image` at the hero and column sizes; replaces ImagePlaceholder when real images exist)

## 03 Links and controls

- [x] Inline Link
- [x] Arrow Link
- [x] Filter Pill (`active`; `size`: md 44px, sm 32px)
- [x] Collection Link

## 04 Lists and tables

- [x] Index List (rows are whole links)
- [x] Data Table (`columns`: life list, Lego inventory)
- [x] Tile and Tile Grid (`size`: square, wide, tall, large; sage plate on hover and focus)

## 05 Editorial content

- [x] Pull Quote
- [x] Aside
- [x] Spec Block (code, hardware)
- [x] Stat
- [x] Code Block
- [x] Inline Code

## 06 Patterns

- [x] Toolbar (filter pills and sort label; presentational)
- [x] Other Collections Row
- [x] Essay Header
- [x] Tile Gallery (filter pills over a tile grid; `UrlTileGallery` keeps the selection in the address). Not on the preview page: see `/projects`.

## Where things are

Components are in `src/components/`. Tokens are in `tokens/*.json`, mirrored by `src/app/globals.css`; fonts are in `src/app/fonts.ts`.

## Next

Essay page (house version), assembled at 1440 from these components; add components only where the page shows a gap. Then project, collection and photography pages, and feature variants. The projects index (`/projects`) is built.

## Open

- The Lego table's cell styles are guessed; only its header was designed.
- Toolbar search, filter and sort are not wired to anything.
- Mobile is out of scope until desktop is done.
