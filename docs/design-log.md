# Design log

Decisions made while turning [DESIGN.md](DESIGN.md) into the Penpot file (`malnushi`) and, later, into code. DESIGN.md says what the design is. This file records where the Penpot file departs from it, and why.

Format: newest first. Each entry has the decision, the reason, and what would change it. Unresolved questions live in DESIGN.md under "Open questions"; don't duplicate them here.

---

## Known differences: DESIGN.md vs Penpot

DESIGN.md now follows Penpot (see the 2026-09-29 entry). What remains are limits of Penpot itself or work not done yet.

| # | DESIGN.md says | Penpot has | Why |
|---|---|---|---|
| 1 | Light/dark via `prefers-color-scheme` | Themes `mode/Light` and `mode/Dark` contain no sets; switch by toggling `modes/*` sets | Plugin API can't attach sets to a theme |
| 2 | Nav underline offset, spec key column, margin column | No tokens | Add with components |

---

## 2026-09-30

### Components in code
Every component in groups 01–06 is now a React server component in `src/components/`, built for Next 16 and Tailwind 4 from the Penpot structure and DESIGN.md. `/components` previews them in the Penpot groups (`noindex`, not linked). Checked at 1440: nav 104px, gutters 96px, index row and table on the same columns as Penpot, all three fonts loading. Departures and choices:
- **States are CSS, not props.** Hover uses `:hover`; focus is one global `:focus-visible` rule (2px `--ink`, 4px offset, 4px radius; pills keep their round shape). Penpot's ring offsets varied (2–8px) between components; code uses 4px everywhere. Only Active is a prop (`NavItem active`, `FilterPill active`).
- **Caption, Figure and Data Table are one component each** in code. Caption shows the EXIF layout when `exif` is passed. Variant sets map to props: `Figure size="hero" | "column"`, `DataTable columns={lifeListColumns | legoColumns}`.
- **Rows are whole links.** Index rows link the entire row; Next Link and Collection Link do the same.
- **Added where Penpot had nothing:** footer links get `--ink` on hover; the Lego table's cell styles are guessed, because only its header exists in Penpot.
- **Semantics:** `<nav>`, `<table>` with a hidden caption, `<dl>` for the spec block, `<figure>`/`<figcaption>`, `<blockquote>`, `<aside>`; Section Label renders an `<h2>` by default; the nav marks the current section with `aria-current="page"`.
- **Font variables renamed** to `--font-newsreader`, `--font-google-sans-flex` and `--font-jetbrains-mono`, because `--font-serif` etc. are Tailwind's own theme names and would reference themselves.
- **Not done:** mobile layout, filter and sort behavior in the toolbar (presentational for now), syntax colors in code blocks.

### Link style confirmed, variant properties renamed
- **Links:** confirmed by Mal: `--link` with a 1px underline, `--ink` on hover; arrow links underline only on hover. The focus ring stays keyboard-only (`:focus-visible`); it must never show on mouse hover or click. Moved from Open questions into DESIGN.md Components → Links.
- **Variant properties renamed:** the variant sets converted in the UI had one property, "Property 1", with values like `State=Default`. Renamed through the plugin, one set at a time, each checked before the next: `State` (Nav Item, Next Link, Filter Pill, Inline Link, Arrow Link, Collection Link, Index Row), `Type` (Caption), `Kind` (Spec Block), `Columns` (Table Header Row). `Photo, Sparse` became `Photo Sparse`, because Penpot separates properties in variant names with commas. No variant errors afterwards, and existing instances still resolve.
- **Section label order:** label above the rule, as built (Mal's choice after comparing both orders over the same index list). This differs from Next Link and Meta Row, where the rule is on top: there the rule opens a block, here it separates the label from its list. The comparison specimen was deleted.

### Essay Header, Figure and the collection table
Built on the `Components` page after the reorganization. Library: 33 components, no duplicates.
- **Essay Header** (section 06): Eyebrow, `h1`, standfirst, then Meta Row across 1248px. The title block is 718px wide (7 columns of 82px with 24px gaps). Gaps: 24px between eyebrow, title and standfirst (`space.stack.md`), 48px from standfirst to meta row (`space.stack.xl`). The standfirst is `--ink-2` (my choice; DESIGN.md gives no color) so the title carries the contrast. No byline; DESIGN.md doesn't have one. Sample text from the frontmatter example in DESIGN.md.
- **Image Placeholder / Size=Column** (section 02): 680 × 453 (3:2), the reading-column width.
- **Figure / Size=Hero and Size=Column** (section 02): placeholder over `Caption / Type=Image`, 16px apart (`space.stack.sm`), caption stretched to the figure width. Built as two standalone components, not a variant set, because creating variants through the plugin has broken the file; combine them in the UI if wanted.
- **Specimen / Collection Table** (section 07): Toolbar, then 32px, then the life-list header and six rows of Charlotte-area birds. Uses instances only; the 32px toolbar margin is a literal.
- **Decisions from the component agents, for review:**
  - Links: inline links are `--link` with a 1px underline; hover turns text and underline `--ink`; focus adds the nav's ring. Arrow links have no underline until hover.
  - Section Label: label over the 1px `--ink` rule.
  - Aside has no top rule, so it reads as the site talking, not a new section.
  - Spec block: 96px key column, 24px gap, hairlines between rows but none after the last. The Hardware sample values are invented.
  - Inline code: 4px radius (`radius.image`; no small-chip token), 4px × 1px padding.
  - Table rows have no hover or focus state; they aren't interactive.
  - Not bound to tokens: the pull-quote rule height (2px), focus-ring offsets, spec-block key width.

### Components page organized into sections
After several component groups were converted to variants, the `Components` page had items scattered and far apart. Kept it as one page (moving main components between pages through the plugin is untested and could break instances) and laid it out in six labelled sections, left-aligned at x=0, 80px between items, wrapping at 3200px: 01 Shell, 02 Text and media, 03 Links and controls, 04 Lists and tables, 05 Editorial content, 06 Compositions. Compositions (Toolbar, Index List, Other Collections Row, Stats, sample sentence) are assembled examples, not components. Only positions changed; nothing was renamed or re-parented. Split into pages later if the file gets too large.

Follow-up, same day: Toolbar, Index List (renamed from "Index List (specimen)"), Other Collections Row and Stats were plain boards, so they were converted to main components. Section 06 is now "Patterns" (multi-component assemblies). The three usage-example boards (Specimen / Inline Link, Specimen / Arrow Link, Inline Code / sample sentence) are documentation, not reusable parts, so they are plain boards, not library components, and live in a new section 07 "Specimens". They were briefly made components and reverted: nobody places a specimen in a page, and they would clutter the Assets panel. Rule: a board is a component only if it is meant to be instantiated. The `Components` page now has an empty-page sibling `zz-test` left from a test; delete it in Penpot.

### First components: Nav Item and Nav / Desktop
Components are built on a new `Components` page in Penpot, starting with the nav. Order of work: shell (nav, footer with next link), small parts, index list row, essay page, other page types, feature variants, home page last.
- **Desktop only.** Mobile nav is out of scope until desktop is done. No mobile pattern is decided.
- **Standalone components, not variants.** States are separate components named `Nav Item / State=Default|Hover|Active|Focus`, created one at a time. Mutating Penpot variants through the plugin can corrupt the file. They can be converted to real variants in the Penpot UI later.
- **Focus state is new.** DESIGN.md had no focus style. Chosen: `--ink` text and a 2px `--ink` outer ring with 4px radius (`radius.image`), drawn as an absolute child rectangle so the item layout doesn't change. Nothing else shows focus in the site yet, so this sets the pattern for links and buttons. It is there for keyboard users (a visible focus indicator is an accessibility requirement) and shows on `:focus-visible` only, never on mouse clicks. Reviewed on 2026-09-30: the ring was questioned as generic, alternatives (ink underline, hairline box, inverted fill) were offered, and it was kept.
- **Hover is `--ink` only,** no underline, so the underline stays exclusive to the active section.
- **Wordmark uses `type.standfirst`** (Newsreader 24 / 1.45 / 400), the only token matching "Newsreader 24px". Not semantically a standfirst; add a `type.wordmark` token if the wordmark ever diverges.
- **Bar spacing:** 96px gutter (`space.gutter.desktop`), 32px top and bottom (`space.stack.lg`), 40px between items (`space.nav-item`). The 2px underline slot is always reserved (empty when not active) so items don't shift when the active section changes. That slot made the labels sit 4px above the bar's centre line, so the items row has 8px of top padding (6px gap + 2px underline) to centre the labels with the wordmark. The padding is a literal, not a token, and the bar is 104px tall (103 plus the hairline).
- **Not bound to tokens:** the 6px gap between label and underline, the underline height (2px) and the focus ring offsets. Penpot has no token for them yet (matches known difference 2).

### Image Placeholder, Captions and Filter Pill
Components on the `Components` page: `Image Placeholder / Size=Hero`; `Caption / Type=Image`, `Type=Photo` and `Type=Photo, Sparse`; `Filter Pill / State=Default|Hover|Active|Focus`.
- **Placeholder sizes:** hero only (1248 × 640). Pair, triple and full-bleed were offered and left out; add when a page needs them.
- **Caption layout:** index in a fixed 48px column, text beside it 600px wide, so wrapped lines hang. The 600px text width is my choice, not DESIGN.md's.
- **EXIF is flexible.** Not every photo has the same metadata, so the caption shows only the fields present, in a fixed order, right-aligned. `Photo` (4 items) and `Photo, Sparse` (2 items) show the range in Penpot; in code, render present fields only. The camera model is not a required field.
- **Filter pill:** 44px tall (`size.pill-height`), 24px side padding (`space.stack.md`), 1px `--line` border, `radius.pill`. Hover darkens the border to `--ink-2` (my choice). Focus reuses the nav's ring, 4px outside the pill and following its radius. No counts, disabled state or "All" variant; add them if the collections pages need them.
- **Not bound to tokens:** the focus ring's size and offset, and the caption's 48px and 600px widths. Filter pill width follows its label.

### Eyebrow and Meta Row
Components `Eyebrow` and `Meta Row` on the `Components` page. Neither is interactive, so neither has states.
- **Eyebrow** is a row of three text layers (section, `/`, sub-category) rather than one text with a colored character, so each part binds to its own color token (`--ink-2`, `--accent`, `--ink-2`). The 8px gap is a literal, not a token.
- **Meta Row** is the 1px `--ink` rule over mono `meta` items 32px apart (`space.meta-item`). DESIGN.md gave no width or rule-to-items gap, so: the rule spans the 1248px content width and the gap is 16px (`space.stack.sm` would match, not bound). Sample items: date, reading time, tag.
- **Accent contrast:** the `/` is small text in `--accent` (about 3.7:1 on `--bg`). DESIGN.md allows accent for eyebrow separators because it is decoration, not information. In dark mode the accent is still provisional and lower (2.78:1); see the dark-mode contrast entry.

### Next Link and Footer
Components `Next Link / State=Default|Hover` and `Footer / Desktop`, built on the `Components` page, bound to tokens.
- **Next Link** follows DESIGN.md (label over `index-title`). Added a 1px `--ink` rule on top, since DESIGN.md says that rule marks the start of something, and a hover state where the title turns `--link`. The default title text is a placeholder and the width is fixed at 1248px.
- **Footer content was not specified**, so this is a proposal: copyright on the left, the same five section links on the right, `small` in `--ink-2`, nothing else. Change it if you want more (contact, colophon, RSS).
- **Colophon line added:** "© 2026 Mal Nushi · Made with ♥ in Charlotte", left-aligned, one text layer (`colophon`). The heart is the text glyph ♥ in `--ink-2`, chosen over a drawn sage heart or plain words. DESIGN.md bans emoji, and a text glyph is not one, but Google Sans Flex appears to lack it: Penpot draws it from a fallback font, and it looks slightly heavier than the text. In code, force text presentation with `font-variant-emoji: text` (or wrap it in a span with a font that has the glyph) so no platform swaps in a colored emoji.
- **Footer links have no hover or focus state yet.** They are plain text in the mock. Add states when links are built as real components, with the same focus ring as the nav.
- Footer spacing: 48px above and below (`space.stack.xl`), 24px between links (`space.stack.md`).

### Penpot re-synced with tokens and DESIGN.md
Penpot, `tokens/` and DESIGN.md were compared token by token. `tokens/` and DESIGN.md agreed. Penpot had drifted back to its state before the 2026-09-29 sync, which nobody edited by hand; the cause is unknown, most likely an older version restored after the app quit. Restored in Penpot:
- `font.weight.semibold` (600) removed again.
- `type.display-sans` and `type.label` weights back to `font.weight.regular` (400).
- The six texts still rendering 500 or 600 were re-bound to their tokens.
- Specimen captions regenerated from the tokens: px tracking instead of em, correct weights, and the `label` caption includes its line height.

After the fix: all four Penpot token sets match the JSON files (62, 40, 9 and 9 tokens); every bound text on Foundations matches its typography token; the 242 color fills match their tokens; and DESIGN.md's type scale, light and dark colors, palette primitives and Penpot-token values match `tokens/`.

To re-check after any change, compare the Penpot sets against `tokens/` (the conversion was run in Penpot through the plugin API) and DESIGN.md's tables against `tokens/`. Neither check is committed as a script yet.

### 12-column grid guides drawn on Foundations
A column layout guide is set on the `Foundations` board: 12 columns, stretch, margin 96, gutter 24 (82px columns across the 1248px content width), in `--accent` at 15% opacity. Guide values are literals; Penpot can't bind them to tokens. The guides show only when the board is selected, so the page also has a visible **Grid** section (last section on Foundations, same header and spacing pattern as the others): the 12 columns numbered 01–12, then three examples taken from DESIGN.md's grid text (title across columns 1–7 with a spec block in 9–12; a 680px reading column offset two columns with a 294px margin column in 10–12; a full-bleed bar ignoring the 96px gutter). Column and span widths are raw pixels because Penpot can't bind spacing tokens to width; the column gap is bound to `space.col-gap` and the fills to `color.line` and `color.accent`. DESIGN.md's grid spec is unchanged.

### Specimen caption clipping fixed
In the type specimen, the caption box (`Meta`) in each row was 40px tall but its two lines need 52px, and in the `small`, `label`, `meta` and `code` rows it clipped, cutting off the spec line. Sized to fit and clipping turned off in all 14 rows. The `standfirst` caption also said "italic"; the standfirst is upright (see 2026-09-29), so the word was removed.

The page structure is being redesigned, so the Layout, Components and Page types sections of DESIGN.md may no longer match the new pages. Whether the grid fits them is not yet confirmed. Revisit when the new page structure is defined.

### Dark-mode contrast postponed
The dark `surface` (`#3D444C`) fails AA for `ink-2` text on it (4.28:1, needs 4.5), and the dark `accent` (`#758072`) is 2.78:1 on `bg`, below the 3:1 wanted for decorative marks. Both are provisional, and the "Open questions" item on them stays open. Candidate fixes: surface `#394048` (4.55:1), accent `#8A9787` (3.75:1).

## 2026-09-29

### Tokens exported to W3C DTCG JSON
Penpot is the source of truth. The tokens are exported to `tokens/` (one file per Penpot set: `primitives`, `semantic`, `modes/light`, `modes/dark`) in the W3C Design Tokens Community Group format (2025.10): colors as `{colorSpace, components, hex}`, dimensions as `{value, unit: "px"}`, aliases as `{path.to.token}`. The export was converted inside Penpot and checked: 111 tokens per mode, every alias resolves in both modes, and every hex matches its components.
- The DTCG typography type has no case or decoration property, so `type.label`'s `uppercase` lives in `$extensions["com.penpot"].textCase`.
- The light and dark files reuse the same token paths, so a build has to load one mode at a time on top of `primitives` and `semantic`.
- Nothing regenerates these files yet. After a token change in Penpot, re-export by hand. A build step (for example Style Dictionary) that turns them into CSS variables is not set up.

### Only what Penpot can show goes in the spec
Rule: if it can't be previewed in the Penpot file, it isn't in DESIGN.md. Applied on 2026-09-29:
- Google Sans Flex is regular (400) everywhere. `type.display-sans` and `type.label` changed from 500 and 600 to 400, and the unused `font.weight.semibold` token was removed. The width axis is dropped from the spec.
- The standfirst is upright Newsreader, not italic. Typography tokens can't carry italic, so it could only exist as a layer override.
- The mobile type scale and the 16px inline code size were removed. Add mobile when mobile design starts.
- The Foundations page captions were updated to match (weights, no italic, tracking in px).

### DESIGN.md changed to match Penpot
DESIGN.md was edited so the spec says what the Penpot file says:
- Type scale: one size per style (the 140–220, 96–180, 23–26, 26–28 and 12–13 ranges are gone), tracking in px instead of em, `ui` weight 400.
- Nav and filter pills now use `ui` and `small` (400) instead of 500. Emphasis comes from color and the underline.
- Dark mode lists surface, accent and code colors as provisional; palette primitives, off-scale spacing and the semantic layout tokens are documented.

### Library styles deferred
No Penpot colour or typography library styles yet. Colour styles would duplicate the tokens and would not follow light/dark. Typography styles may earn their place once components exist. Revisit when building components.

### Foundations page is bound to tokens
Colour swatches, type specimen and spacing scale live on the `Foundations` page (1440px board). All 381 bindings were applied in chunks and read back. Spacing bar widths are raw pixels because Penpot can't bind spacing tokens to width.

### Dark surface and code colours are provisional
DESIGN.md defines only bg, ink, ink-2, link and line for dark. Added `neutral.800` (`#3D444C`) for surface and `neutral.950` (`#2A2F35`) for code-bg so the dark set is complete and code blocks stay distinct from the page. Change them in primitives once dark contrast is checked.

### Tracking stored in px
`font.tracking.*` values are px, calculated as size × em (for example h1: 88 × -0.025 = -2.2). Percent values resolved as fractions (-0.03) and would have applied as -0.03px. If the size of a style changes, recalculate its tracking token.

### Off-grid spacing kept
`spacing.18`, `.22` and `.120` (table row, index row, header top) and `.40` (nav items) are not 4px multiples in every case, but DESIGN.md specifies them. Kept as written.

### Colour set split
Colour tokens live in `modes/light` and `modes/dark` with identical names. Everything else lives in `semantic`. `modes/light` is active by default. To view dark, turn `modes/dark` on and `modes/light` off in the Tokens panel.

### Spelling
Use "color" (US) in names and labels to match the tokens and DESIGN.md.
