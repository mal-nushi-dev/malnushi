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

## 2026-10-03

### Nav buttons show a pointer cursor
The search and menu buttons kept the default arrow on hover, because Tailwind's preflight resets `<button>` to `cursor: default`. Added `cursor-pointer` to the shared `button` class in `src/components/nav.tsx`, so both controls (and their close states) show the pointing hand. Links already did.

## 2026-10-02

### Expanded nav is sage
Mal asked to try other colors for the nav while expanded (resting nav unchanged). Four palette-only candidates were built and compared in the browser: `surface` (`#EDEEEB`), `ink` (inverted `#2E2E2E`), `slate` (`#485861`) and `sage` (`#626E5E`). All passed AA. Mal chose **sage**, for both the menu and search.
- **Implementation:** `[data-nav-open]` on the nav wrapper re-points the color tokens in `src/app/globals.css`; the plate, row and contents follow, and the row text fades with the plate (600ms). The `?navtone=` experiment and the other three tones were removed.
- **Contrast on sage:** ink `#FAFAFA` 5.1:1, ink-2 and link `#EDEEEB` 4.6:1. Hairlines are a `color-mix` of `#EDEEEB` into sage; the active underline is `#EDEEEB`, since the sage accent would vanish.
- **Same in dark mode** (my call: sage is mid-tone, so it lifts off `#2E2E2E` and the light text still works; unchecked visually).
- **Spec change:** a tinted surface is now allowed in this one place. Written into DESIGN.md (Nav).
- **Not done:** the color mix is not a token in `tokens/` or Penpot; Penpot's nav is still the old one.

### Nav controls pinned, panel grows outward, fill and shadow on scroll
Mal found the nav hard to read once content scrolled behind it, and noticed the search and menu buttons shifting when the nav expanded.
- **Why they moved:** one centred island both held the buttons and animated its width (600 → 840px), so the buttons at its edges slid outward, and search also re-laid out the wordmark.
- **Decision:** split the surface from the controls. The row (search, wordmark, menu) is fixed at 600 × 72px and never resized. A plate behind it grows outward from the same origin, wider and downward, and the search field and menu list appear in that expansion below the row. Mal's words: expand "width wise and below", in place, and don't touch the three row elements. Only the icon swaps to close, in place (my choice, so the toggle state stays visible; say if the icons should never change).
- **Fill on scroll:** clear at the top of the page, as before. After 8px of scroll the plate fades to a `--bg` fill with a very slight shadow. Search and menu also fill it, even at the top (my call; the menu was already filled, which settles the earlier unconfirmed note).
- **First shadow in the system:** DESIGN.md said no shadows. Mal asked for one on the scrolled nav, so `shadow.nav` is the single exception, written into the rules. Light `0 1px 2px / 0.04, 0 4px 16px / 0.06`; dark values (higher alpha, shadows read weakly on `#2e2e2e`) are provisional and unchecked.
- **Not done:** `--shadow-nav` lives in `src/app/globals.css` only; it is not in `tokens/` or Penpot. Penpot's nav is still the old one. Search panel height (144px) and the 8px threshold are my defaults.

### Nav becomes a floating toolbar
Mal wanted a simpler, more expansive nav that could grow into a hub, so the five-item bar was replaced by a toolbar (search, wordmark, menu). Decided in artifact comments on the home page canvas, then built in `src/components/nav.tsx`:
- **Structure:** transparent sticky layer, a 104px spacer, and a fill-less island; width, height and flex-grow transitions on `cubic-bezier(0.16, 1, 0.3, 1)`. Details are in DESIGN.md (Nav).
- **No outline, no pill, no fill:** Mal asked for a rectangular island (4px corners) with no stroke and no background. First tries had a `--bg` fill with a hairline, then a pill, then a `--surface` fill; all were removed on request. Size was raised about 25% (600 × 72px).
- **Exception:** the open menu panel has a `--bg` fill, because transparent it was unreadable over the page text. Mal hasn't confirmed this; see Open questions.
- **Departures from earlier rules:** this adds motion (the README said "no motion spec yet") and line icons (the system had none; they are inline SVG, 1.5px stroke). The "nothing else is rounded" rule still holds, since the 4px radius is the image radius.
- **Changes the Penpot file:** not done. The `Nav / Desktop` and `Nav Item` components in Penpot, the design system's `Nav` and `docs/component-checklist.md` still show the old bar.

### Home page built
`src/app/page.tsx` follows DESIGN.md's Home: intro with the portrait (`src/components/portrait.tsx`, from `docs/portrait.svg`), lead feature with its own accent, three more features at different sizes, latest writing and work index lists, and a collections strip. All copy, titles and the accent are placeholders.

---

## 2026-10-01

### Light accent darkened to `#626E5E`
The design system's contrast check flagged light `accent` (`#758072`) at 3.96:1 on `bg`, under 4.5:1. Mal chose to re-tint it in the source, not just in the design system.
- **New primitive `color.sage.600` `#626E5E`** (5.14:1 on `bg`, 4.61:1 on `surface`). First try was `#6A7667`, which reached 4.57:1 on `bg` but only 4.10:1 on `surface`, so it was darkened again. Light `accent` now aliases it. `color.sage.500` `#758072` stays and is still the dark `accent`, because a darker sage would read worse on the dark ground (provisional, unchecked).
- **Changed in:** `tokens/primitives.json`, `tokens/modes/light.json`, `src/app/globals.css`, DESIGN.md. **Penpot not updated yet:** add `color.sage.600` and point `modes/light` `accent` at it.
- Accent is still a mark color (nav underline, eyebrow slash, quote rule, status dot). It now passes 4.5:1 on both `bg` and `surface`, but at 5.14:1 it is close to `ink-2` (about 5.4:1), so it reads less distinct from secondary text.

### New ground and ink: `#FAFAFA` and `#2E2E2E`
Mal didn't like the lead headline's placeholder rust (`#B4532A`) and asked for `#FAFAFA` and `#2E2E2E`. They were applied as the house ground and ink, not just to the headline (Mal's choice):
- **Primitives changed, not the semantic tokens:** `color.neutral.50` `#F1F1F1` → `#FAFAFA`, `color.neutral.900` `#343A42` → `#2E2E2E`. Light `bg`, light `ink`, light `code-bg` and dark `bg` all follow, because they alias these primitives.
- **Lead headline** on Home is now bound to `color.ink`. It was the only hard-coded fill in the file, so nothing is hard-coded now.
- **Contrast on the new light bg:** ink 13.0:1 (was 10.2), `ink-2` 5.4:1, `link` 7.1:1, `accent` 4.0:1. On the new dark bg: ink 11.7:1, `ink-2` 5.9:1, `accent` 3.3:1, which clears the 3:1 for marks it failed before.
- **Side effects, not fixed:** the dark `code-bg` (`#2A2F35`) is now 1.01:1 against the dark `bg`. The new values are neutral grays, while the rest of the family is still cool. Both are in Open questions.
- Penpot didn't refresh shapes already bound to the changed tokens, so the bindings were re-applied page by page. Afterwards all 475 bound fills and strokes match their tokens. Updated to match: the Foundations hex labels, `tokens/primitives.json`, `src/app/globals.css` and the `--bg` fallback in `docs/portrait.svg`.

### Home frame (Penpot page `Home`, board `Home / Desktop`)
Built from existing component instances on the 1440 desktop grid: Nav, Feature / Lead, Intro with portrait, Other Features, Latest writing, Latest work, Collections strip (latest bird and rec plus Other Collections Row), Footer. Bound to tokens except the lead headline colour. Decisions:
- **Intro before feature** (changed the same day; first built feature-first). The intro and portrait open the page, right under the nav (120px top), and the lead feature follows 128px lower. Mal's call: it is a personal site, so a visitor should meet the person first. The 180px feature headline still gives the page its type-scale contrast; it just comes second. DESIGN.md Page types → Home is updated to match.
- **Placeholder content.** Titles, dates, the bird and the rec are invented. The open question about picking real features stays open in DESIGN.md.
- **Placeholder feature accent `#B4532A`** on the lead headline, the only hard-coded fill. Replace it with a colour pulled from the real feature. Contrast on `--bg` is not checked yet.
- **Headline wraps** to two lines inside the 1248 content width instead of breaking the grid.
- **Intro layout.** Text in columns 3-8 (612px, `standfirst` style, so under the 680 reading measure), portrait in columns 9-12 (400px). No "building things" tagline.
- **Portrait** (fourth version). Source of truth is `docs/portrait.svg`, an inline-ready SVG; the Penpot `Portrait` board is a copy of it. Monoline 1.5px strokes with round caps and joins (brows 2px). Hair, bun, irises and mustache are solid `ink`; thin `bg` lines cut three hair strands, two bun wraps, the hair tie and a catchlight in each eye. The hair was filled because the outlined version read as a cap. A spiral on the bun was dropped because with the tie it looked like a face. The hairline recedes slightly at the temples. In dark mode the solid shapes invert to light, like every other line on the page; tokens can't keep the hair dark without a hard-coded colour. The mustache is Mal's pick (2026-10-01): the "Mustache" icon from SVG Repo, scaled non-uniformly (0.32 × 0.24) so it sits under the nose and lets the centre of the smile show, then rewritten as absolute coordinates. It replaced my hand-drawn curls, which read as thin and fussy. Smiling: warm eyes with lower lids and crow's feet, the centre of a smile below the mustache. Tried and dropped: smile creases (hidden by the mustache), cheek lines (read as tired). For the web it draws in `currentColor` and the mustache sits on a 6px `var(--bg)` knockout stroke, so the face lines it crosses stop cleanly at its edge, and it follows dark mode. The mustache is one self-contained `<g id="mustache">` with a transparent hit area and a CSS transform origin under the nose. The face and smile are drawn complete underneath it, so moving it never exposes a gap; checked by rotating it 10°. In Penpot the strokes and mustache fill are bound to `color.ink` and the knockout to `color.bg`. Penpot flattens nested SVG groups, so the board holds four named groups (Torso, Hair, Face, Mustache) instead of the finer groups in the source file. Licence of the SVG Repo icon not yet checked.
- **Other Features.** A 7-column and a 4-column feature, the second 128px lower for asymmetry. Built as local boards (placeholder, eyebrow, `h2` title), not components.
- **Focus rings** are hidden on every instance on the page; the main components show them as a state.

Review: the Penpot PNG export times out intermittently. SVG export of a single shape works when PNG does not, and the board PNG did export after the reorder. Some text was rendering mirrored (flip flags on nested instances); fixed by toggling `flipX` on the affected nodes only, because the plugin's `flipX` setter toggles instead of setting.

Known issue: the footer heart renders as a red emoji in Penpot, not the U+2665 text glyph in `--ink-2` that DESIGN.md asks for. It comes from the Footer component.

Still to do: cursor exploration (Cursors specimen), mobile frame.

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
