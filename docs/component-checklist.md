# Component checklist

Status of the Penpot components on the `Components` page of the `malnushi` file. Design decisions for each live in [design-log.md](design-log.md); the spec lives in [DESIGN.md](DESIGN.md). Desktop only for now.

Legend: `[x]` built and verified in Penpot · `[ ]` not started · `[~]` in progress

The page is split into sections 01–07. States are Penpot variant sets with properties named `State`, `Type`, `Kind` or `Columns`.

## 01 Shell

- [x] Nav Item (State: Default, Hover, Active, Focus)
- [x] Nav / Desktop
- [x] Next Link (State: Default, Hover)
- [x] Footer / Desktop

## 02 Text and media

- [x] Eyebrow
- [x] Meta Row
- [x] Section Label
- [x] Caption (Type: Image, Photo, Photo Sparse)
- [x] Image Placeholder / Size=Hero
- [x] Image Placeholder / Size=Column (680 × 453)
- [x] Figure / Size=Hero
- [x] Figure / Size=Column

## 03 Links and controls

- [x] Inline Link (State: Default, Hover, Focus)
- [x] Arrow Link (State: Default, Hover, Focus)
- [x] Filter Pill (State: Default, Hover, Active, Focus)
- [x] Collection Link (State: Default, Hover, Focus)

## 04 Lists and tables

- [x] Index Row (State: Default, Hover, Focus)
- [x] Table Header Row (Columns: Life list, Lego inventory)
- [x] Table Row / Columns=Life list

## 05 Editorial content

- [x] Pull Quote
- [x] Aside
- [x] Spec Block (Kind: Code, Hardware)
- [x] Stat
- [x] Code Block
- [x] Inline Code

## 06 Patterns

- [x] Toolbar (filter pills and sort label)
- [x] Index List
- [x] Stats
- [x] Other Collections Row
- [x] Essay Header

## 07 Specimens (not components)

- Specimen / Inline Link, Specimen / Arrow Link, Inline Code / sample sentence
- Specimen / Collection Table (toolbar, header, six rows)
## In code

All of groups 01–06 are implemented in `src/components/` and previewed at `/components`. Tokens are in `src/app/globals.css`, fonts in `src/app/fonts.ts`. When a component changes in Penpot, update its file too.

## Next

Essay page (house version), assembled at 1440 from these components; add components only where the page shows a gap. Then project, collection and photography pages, feature variants, and the home page last.

## Open

- Three stale library entries (the specimens) still show in the component list; delete them in the Assets panel. Delete the empty `zz-test` page.
- Only the Life list has a table row; add rows for other collections when their pages are built.
- Mobile is out of scope until desktop is done.
