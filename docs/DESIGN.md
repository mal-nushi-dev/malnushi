# DESIGN.md — malnushi.com

The design foundation for Mal Nushi's personal site: writing, projects (code, digital design, hardware, Lego), photography, and a set of living collections (bird life list, recommendations, music, travels, Lego inventory).

---

## Concept

**An editorial, art-directed, typographic site.** The frame has a voice. Typography carries meaning, scale is used on purpose, and the best pieces are designed individually instead of being poured into a template. It sits in the lineage of microsoft.design, WePresent, Stripe Press and COLLINS.

What those sites share is the model this one follows: **a strict, quiet house system underneath, with a bespoke layer on top for the pieces that earn it.** The house system (grid, UI type, metadata, color tokens) is what makes the site feel authored instead of chaotic. The bespoke layer is what makes it memorable.

Three things define the look:

- **Scale contrast.** Very large serif headlines against small, precise sans labels and mono metadata. The gap between the biggest and smallest type on a page is the signature.
- **Type as image.** Headlines, pull quotes and big numbers are compositional elements, not just labels for content.
- **Restraint everywhere else.** A cool neutral ground, hairline rules, no shadows, no gradients, no ornament. Color is spent deliberately and rarely.

References: Stripe Press (house system plus per-book identity, serif voice), WePresent and microsoft.design (per-story art direction), COLLINS (type at display scale, project indexes), The Paris Review (literary serif), Linear (precise sans UI), Kinfolk (whitespace).

Avoid: 1970s chunky and rounded (Vacation.inc, Ghia), brutalism and neo-brutalism, dense engineering tables (McMaster-Carr), pure black on pure white, Pinterest-style card walls, gradient washes, drop shadows, emoji.

---

## Site structure

### Navigation

`Writing` · `Work` · `Photography` · `Collections` · `About`

The wordmark ("Mal Nushi", Newsreader 24px) sits on the left and links home. Features have no nav item of their own. They surface on the homepage and at the top of their section index.

### Page types

Every piece of content is one of four types. Each has its own house template.

| Type | What it is | Leads with | Promotable to feature |
|---|---|---|---|
| **Essay** | Long-form writing | Type: headline, standfirst, then reading column | Yes |
| **Project** | Code, digital design, hardware, Lego builds | Image: hero, then title and spec block | Yes |
| **Photography series** | A sequenced set of photographs | Image: sequencing and pacing do the work | Yes |
| **Collection** | A structured, growing list (life list, recs, music, travels, Lego inventory) | Data: header, stats, then rows | No (items are rows, not pages) |

The first three are **pieces**: each is a standalone page at its own URL. **Collections** are different. A bird sighting, a recommendation or an album is a row in a list, never a page of its own. If an item grows into a story (a birding trip, say), that story becomes an essay or photo series that links back to the list.

### Two tiers: house and feature

- **House.** The default for every piece. A well-designed template that handles most of the output. Nothing on the site should feel second-class for living here.
- **Feature.** A small number of pieces get real art direction: their own accent color, a display-scale headline built for that piece, and custom layout and image pacing. Expect three to five at launch and roughly one in ten after that.

The test for promotion: the piece has a narrative arc *and* enough visual material to carry a designed layout, *and* you'd send it to someone as your introduction.

### Publish first, promote later

Everything publishes as a house entry first. Features are promotions of existing pieces, never a separate pipeline. When a piece earns it, it gets art-directed at the **same URL**, with the same words; only the presentation gets richer. This keeps publishing fast and means design effort goes where it has already proven worthwhile.

---

## Typography

All three fonts are free, under the SIL Open Font License, and on Google Fonts. Each has a fixed role.

| Role | Typeface | Job |
|---|---|---|
| Voice | **Newsreader** (serif) | Headlines, reading text, standfirsts, pull quotes, index titles, big numbers, scientific names |
| Structure | **Google Sans Flex** (sans) | Navigation, labels and eyebrows, captions, spec blocks, table cells, buttons, footnotes and asides |
| Detail | **JetBrains Mono** (mono) | Dates, indexes (`001`), EXIF, set numbers, stacks, coordinates, BPM and key, code |

### Newsreader: the voice

- Variable: weight 200–800, optical size 6–72, with italics. Let `opsz` follow the font size (`font-optical-sizing: auto`) so display sizes get the refined cut and body text gets the sturdy one.
- At display sizes, set it tight and light-to-regular (300–400). Weight is not how headlines get emphasis here; size is.
- It stands in for Adobe Caslon and Anthropic Serif. Libre Caslon was rejected because its weights are too limited to carry a whole site.

### Google Sans Flex: the architecture

- Used at regular weight (400) everywhere, at its default width. **Never use the rounded axis.** It pushes the site toward the chunky-70s look.
- Use `font-variant-numeric: tabular-nums` on any column of numbers.
- It stands in for Google Sans, Segoe UI, Moderat, Ginto and Geist.

### JetBrains Mono: the details

- Small (13px for `meta`, 14px for `code`) and usually in `--ink-2`. It labels things; it never carries sentences.
- It replaces Hack.

### Type scale

These are the `type.*` tokens. Each style has one size; a feature may override the size of `feature-display` and `display-sans` for its own headline. Tracking is in px, calculated from the size (size × em), so change it when the size changes.

| Token | Font | Size / line height | Weight | Tracking | Use |
|---|---|---|---|---|---|
| `feature-display` | Newsreader | 180 / 0.95 | 300 | -5.4px | Feature headlines only. May crop or break the grid. |
| `display-sans` | Google Sans Flex | 120 / 0.95 | 400 | -3.6px | Section indexes and features only. |
| `h1` | Newsreader | 88 / 1.02 | 400 | -2.2px | House titles for all page types |
| `standfirst` | Newsreader | 24 / 1.45 | 400 | 0 | Dek under an h1 |
| `quote` | Newsreader | 36 / 1.25 | 300 | -0.36px | Pull quotes, interludes in photo series |
| `h2` | Newsreader | 28 / 1.25 | 500 | 0 | Section heads within a piece |
| `index-title` | Newsreader | 28 / 1.2 | 400 | 0 | Titles in index lists and "next" links |
| `stat` | Newsreader | 56 / 1 | 400 | -0.56px | Big numbers on collection headers |
| `body` | Newsreader | 19 / 1.65 | 400 | 0 | Reading text |
| `ui` | Google Sans Flex | 15 / 1.5 | 400 | 0 | Nav, captions, table cells, spec values |
| `small` | Google Sans Flex | 14 / 1.6 | 400 | 0 | Footnotes, asides, captions |
| `label` | Google Sans Flex | 12 / 1.5 | 400 | +1.44px, UPPERCASE | Eyebrows, spec keys, table headers, section labels |
| `meta` | JetBrains Mono | 13 / 1.7 | 400 | 0 | Dates, indexes, EXIF, stacks |
| `code` | JetBrains Mono | 14 / 1.7 | 400 | 0 | Code blocks and inline code |

### Rules

- **Headlines are serif by default.** Sans display is reserved for section indexes and features, where it's a deliberate choice.
- **Reading column is 680px max** (about 65 characters per line).
- **Footnotes and asides go in the margin, in the sans,** at `small` size. They read as the site talking, not the author.
- **Emphasis in body text is italic, never bold.** Newsreader 600 is rare; the sans stays at regular weight.
- **Scientific names** are Newsreader italic in `--ink-2`, set beside the common name.
- **Casual pieces can lean lighter** (Newsreader 300); analytical pieces stay at regular. Same family, different temperature.

---

## Color

One cool-neutral family with a sage accent. **No pure black, no pure white.** The charcoal ink removes the harshness of black on white, and warmth comes from the serif, not from cream tones. **Do not mix in the creams** (`#F7F4ED`, `#EEECE2`): they're a different temperature and muddy the palette.

### Light (default)

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#FAFAFA` | Page |
| `--surface` | `#EDEEEB` | Inline code, subtle fills |
| `--ink` | `#2E2E2E` | Primary text, strong rules |
| `--ink-2` | `#626964` | Secondary text, meta, captions (≈5.4:1 on bg, passes AA) |
| `--link` | `#485861` | Links |
| `--accent` | `#626E5E` | Sage. Active nav underline, eyebrow separators, pull-quote rules, status dots, large decorative marks (5.14:1 on bg, 4.61:1 on surface). Still a mark color: set body and small text in `ink`, `ink-2` or `link`. |
| `--line` | `#D5D7D2` | Hairline dividers, borders, image placeholders |
| `--code-bg` | `#2E2E2E` | Code block background |
| `--code-fg` | `#EDEEEB` | Code block text |

### Dark

| Token | Hex | Status |
|---|---|---|
| `--bg` | `#2E2E2E` | Decided |
| `--ink` | `#EDEEEB` | Decided |
| `--ink-2` | `#A4ADA6` | Decided |
| `--link` | `#D2DDE4` | Decided |
| `--line` | `#485861` | Decided |
| `--accent` | `#758072` | Provisional: same as light |
| `--surface` | `#3D444C` | Provisional |
| `--code-bg` | `#2A2F35` | Provisional: darker than `--bg` so code blocks stay distinct |
| `--code-fg` | `#EDEEEB` | Provisional: same as light |

Provisional values exist so the dark set is complete. Check them for contrast once the pages exist.

### Palette primitives

The `primitives` token set holds the raw values the tokens above point to:

| Ramp | Steps |
|---|---|
| `color.neutral` | 50 `#FAFAFA`, 100 `#EDEEEB`, 200 `#D5D7D2`, 400 `#A4ADA6`, 600 `#626964`, 800 `#3D444C`, 900 `#2E2E2E`, 950 `#2A2F35` |
| `color.slate` | 300 `#D2DDE4`, 600 `#485861` |
| `color.sage` | 500 `#758072` (dark accent), 600 `#626E5E` (light accent) |

Neutral 800 and 950 exist only for the provisional dark values.

### Feature accents

A feature may override `--accent` with **one** color of its own, pulled from the work itself (a dominant tone in the photographs, a material in the build). The rules:

- One accent per feature. Never a second.
- It can be used at scale: a full-bleed color field behind the hero, the headline itself, rules and marks.
- It is never used for body or small text unless it passes 4.5:1 against its background.
- Everything else (ink, lines, ground) stays on the house tokens, so the feature still belongs to the site.

---

## Layout

### Grid

- **12 columns** inside the content width, **24px column gap**.
- Desktop page gutter is **96px** (content width 1248px at a 1440px viewport). Mobile gutter is **16px**, with no horizontal scroll at phone width.
- Layouts use **deliberate asymmetry**: a title across 7 columns with a spec block in columns 9–12, a reading column offset by two columns with asides in the right margin, images placed on different spans.
- Photography and features may go **full-bleed** (edge to edge, ignoring the gutter).

### Spacing

An 8px base. Vertical rhythm uses these steps: 8, 16, 24, 32, 48, 64, 80, 96, 128, 160, 200.

Four component values sit off the scale on purpose and are tokenized as written: 18 (table row padding), 22 (index row padding), 40 (nav item gap) and 120 (header top padding).

- **Between major blocks** within a piece: 128px.
- **Between images** in a photography series: 160–200px. Whitespace is part of the pacing.
- **Header top padding** (below the nav): 120px.
- The page should feel **airy, not sparse**: roughly one idea per screen.

### Lines, corners, surfaces

- **Dividers are 1px hairlines** in `--line`. A 1px `--ink` rule marks the start of something: a table header, a spec block, a section label, the meta row under a standfirst.
- **Corner radius** is 4px on images and 8px on code blocks. Filter pills are fully rounded. Nothing else is rounded.
- **No gradients, drop shadows or emoji.**

---

## Components

### Nav

`ui` style, items 40px apart, in `--ink-2`. The active item is `--ink` with a **2px accent underline** offset 6px. A 1px `--line` hairline sits under the nav bar.

Desktop bar (1440px): 96px gutter left and right, 32px above and below, the wordmark on the left and the five items right-aligned. Bar height is 104px including the hairline. The wordmark and the item labels share one vertical centre line. Item states: **Default** (`--ink-2`), **Hover** (`--ink`), **Active** (`--ink` plus the accent underline) and **Focus** (`--ink` with a 2px `--ink` ring, 4px radius, offset 8px horizontally and 4px vertically). The ring shows for keyboard focus only (`:focus-visible`), never on mouse clicks. Mobile is not designed yet.

### Eyebrow

`label` style, `--ink-2`, above every h1: section, then an accent-colored `/`, then the sub-category.
Examples: `ESSAY / BIRDING`, `WORK / CODE`, `PHOTOGRAPHY / SERIES 04`, `COLLECTIONS / BIRDING`. The three parts sit in a row 8px apart.

### Meta row

A 1px `--ink` rule, then mono `meta` items in a row, 32px apart: date, reading time, tags. It sits under the standfirst on essays. The rule spans the content width (1248px) and sits 16px above the items.

### Spec block (projects)

A definition list in columns 9–12. Each row pairs a `label` key (96px column) with a value. Hairline between rows, 1px `--ink` rule on top. Values are sans `ui`, except dates and stacks, which are mono.

Standard keys: **Year**, **Role**, **Medium**, **Stack** (code) or **Materials** (hardware, Lego), **Status**. The status gets a small accent dot.

### Captions

Under images: a mono index (`01`) in `--ink`, then the caption in sans `small`, `--ink-2`. On photography, the caption is mono EXIF, right-aligned opposite the index.

The index sits in a fixed 48px column with the caption text beside it (600px wide), so wrapped lines hang under the text, not under the index. EXIF is `meta` in `--ink-2`, items 24px apart, and **flexible**: it shows only the fields a photograph has (for example lens, aperture, shutter, ISO), in a fixed order, so one photo can show four items and another two. Nothing is required and nothing is left as an empty slot.

### Index list

Used for "More work", section indexes and anything else that lists pieces. Each row is a grid: mono index, serif `index-title`, sans category, mono year aligned right. 22px row padding, hairlines between rows, a 1px `--ink` rule under the section label. This replaces card grids entirely.

### Data table (collections)

Header row in `label` style over a 1px `--ink` rule. 18px row padding, hairlines between rows. Mono index and dates, serif names (with italic scientific names where relevant), sans for everything else. Comfortable, never dense.

### Filter pills

`small` style, 44px tall, fully rounded, 24px padding left and right. Inactive pills have a 1px `--line` border; the active pill is filled `--ink` with `--bg` text. **Hover** darkens the border to `--ink-2`. **Focus** uses the same 2px `--ink` ring as the nav, 4px outside the pill, keyboard focus only.

### Next link (footer)

At the bottom of every piece: a `label` ("Next essay", "Next series") over an `index-title` or larger serif title, linking to the next piece in the section. A 1px `--ink` rule sits on top, 16px above the label. On hover the title changes to `--link`.

### Footer

Desktop (1440px): a 1px `--line` hairline on top, then one row with the `small` style in `--ink-2`, 48px above and below, 96px gutters. On the left, one line: "© 2026 Mal Nushi · Made with ♥ in Charlotte". The heart is the text glyph ♥ (U+2665) in `--ink-2`, not an emoji. The five section links are right-aligned, 24px apart. The next link sits above the footer on piece pages.

### Section label

A `label` in `--ink-2` over a 1px `--ink` rule, 16px apart. The label sits above the rule, so the rule separates the label from the list below it.

### Links

Inline links are `--link` with a 1px underline; on hover the text and underline turn `--ink`. Arrow links ("View source →") have no underline until hover. Keyboard focus shows the 2px `--ink` ring used by the nav, on `:focus-visible` only, so it never appears on mouse hover or click.

### Image placeholders

While real images are missing, use `--line` fills with a mono label giving the purpose and dimensions (`HERO — 1248 × 640`). The label is `meta` in `--ink-2`, centered, on a 4px-radius fill. Two sizes exist: hero (1248 × 640) and column (680 × 453, 3:2, for images in the reading column). Add other sizes as pages need them.

A **figure** is a placeholder (or image) with its caption 16px below, stretched to the same width: `Figure / Size=Hero` and `Figure / Size=Column`.

---

## Page types in detail

### Home

The homepage is an editorial front page, not a feed.

- **Opening:** a short introduction in the serif voice, an About link and a line-drawn self-portrait. No hero tagline about "building things."
- **Lead feature:** one feature follows the introduction, at full display scale with its own accent. It changes when a new feature is promoted.
- **Then:** the other features in a varied-size arrangement, followed by index lists of the latest essays and projects, and a strip showing recent collection activity (latest bird, latest rec).

### Essay

Type leads.

1. Eyebrow, `h1`, `standfirst`, meta row (the `Essay Header` component). Title and standfirst span 7 columns (718px); 24px between eyebrow, title and standfirst; 48px from the standfirst to the meta row, which spans 1248px. The standfirst is `--ink-2`.
2. A hero image (1248 wide) with a caption. Optional; an essay can go straight from the header to the text.
3. The body: a 680px reading column offset two columns from the left, with asides and footnotes in a 294px margin column on the right.
4. Pull quotes break the column rhythm, with a 2px accent rule on top.
5. The next link in the footer.

**As a feature:** a display-scale headline (`feature-display`) that may crop, a full-bleed hero or color field in the piece's accent, and inset images that break out of the column.

### Project

Image leads. One template covers code, digital design, hardware and Lego; the spec block is what flexes.

1. Eyebrow (`WORK / CODE`, `WORK / HARDWARE`), then the hero image directly under it, so label, image and title read as one unit.
2. Title (`h1`) and standfirst across 7 columns, with links ("View source →", "Download →"). The spec block sits in columns 9–12.
3. An image pair with captions.
4. The write-up: an `h2` in columns 1–3, body text in columns 4–10. Repeat as needed.
5. Detail images in a row of three.
6. A "More work" index list and the footer.

Someone should understand a project from the hero, title and spec block alone, and read further only if interested.

**As a feature:** a COLLINS-style case study. The process, dead ends and details become the story, with larger image sequences, process artifacts, and the project's own accent.

### Photography series

The photographs lead. Text is reduced to a minimum.

1. Eyebrow, `h1` in columns 1–8, a two-line intro and mono meta (count, camera) in columns 9–12.
2. A full-bleed opener.
3. A paced sequence: an offset pair, a single small image in a lot of space, a one-line `quote` interlude, a wide close. Vary scale and position deliberately; never a uniform grid.
4. Every image has a mono index and EXIF caption.
5. The next link to the next series.

**As a feature:** the sequence gets its own accent color field, bespoke placement, and optionally a written essay woven between the images.

### Collections

Collections are structured data pages, designed once and never art-directed per item.

- **Collections index** (`/collections`): an index list of every collection with a mono count (`[N] species`, `[N] sets`).
- **A collection page:** eyebrow, `h1`, standfirst, then two or three `stat` numbers over 1px `--ink` rules in columns 9–12. Filter pills and a sort label, then the data table. At the bottom, an "Other collections" row linking to the rest.

Each collection defines its own columns:

| Collection | Columns |
|---|---|
| Life list | No. · Species (common + *scientific*) · Family · First seen · Where |
| Recommendations | No. · Title · Kind (book, film, tool, place…) · Why (one line) · Added |
| Music | No. · Title · Artist · Year · Key / BPM (for own work) |
| Travels | No. · Place · Country · When · Notes |
| Lego inventory | No. · Set name · Set number · Pieces · Year · Status |

Adding to a collection means adding a row of data, never writing a page.

### About

A house essay page in structure: the `h1`, a standfirst, a short reading column, then a mono-labeled list of links and contact.

---

## Feature kit

What a feature **may** change:

- The accent color (one, from the work).
- The hero: full-bleed image, color field, split type-and-image, or type only.
- The headline: `feature-display` or `display-sans` size and placement, including cropping and breaking the grid.
- Image pacing and placement, including full-bleed and off-grid images.
- Custom components inside the body (interactive diagrams, image comparisons, galleries).

What a feature **must keep**:

- The nav, footer and next link.
- The three fonts and their roles. No new typefaces.
- House ink, line and ground tokens.
- Mono metadata and captions.
- The 680px reading measure for any running text.
- The rule of no gradients, shadows or emoji. Break it only if a specific feature truly earns it.

---

## Implementation (Next.js)

### Content model

Each piece is an MDX file with frontmatter. One route per section:

- `/writing/[slug]` for essays
- `/work/[slug]` for projects
- `/photography/[slug]` for series
- `/collections/[slug]` for collections (backed by data files such as JSON, YAML or CSV, not MDX)

A piece renders in its house template unless the frontmatter has a `feature` block:

```yaml
---
title: "The list that keeps me looking"
standfirst: "A life list is supposed to be about the birds…"
date: 2026-09-28
category: Birding
feature:
  accent: "#8A5A3C"
  hero: "split-type"       # full-bleed | color-field | split-type | type-only
  headline: "display-xl"   # display-l | display-xl | sans-display
---
```

Promoting a piece means adding that block plus any bespoke MDX components. The URL and the words don't change.

Projects add spec fields:

```yaml
year: 2026
role: "Design & engineering"
medium: "macOS app"
stack: ["Swift", "SwiftUI", "NextDNS API"]   # or materials: [...]
status: "In progress"
```

### Fonts

Load all three with `next/font/google` (Next 16 lists `Google_Sans_Flex`), which self-hosts them. The code is in `src/app/fonts.ts` and `src/app/layout.tsx`. The CSS variables are `--font-newsreader`, `--font-google-sans-flex` and `--font-jetbrains-mono`; Tailwind maps them to `font-serif`, `font-sans` and `font-mono`. Next has no fallback metrics for Google Sans Flex, so its fallback isn't size-adjusted and sans text can shift slightly when the font loads.

### Tokens

The tokens live in `src/app/globals.css`: color, spacing, size and radius as CSS variables (light, and dark under `prefers-color-scheme`), colors exposed to Tailwind (`text-ink`, `bg-line`, `border-accent`), and one `type-*` utility per typography token (`type-h1`, `type-meta`). Components use spacing variables directly, e.g. `gap-(--space-md)`. The block below is the short version.

```css
:root {
  --bg: #FAFAFA; --surface: #EDEEEB; --ink: #2E2E2E; --ink-2: #626964;
  --link: #485861; --accent: #626E5E; --line: #D5D7D2;
  --code-bg: #2E2E2E; --code-fg: #EDEEEB;

  --gutter: 96px; --col-gap: 24px; --measure: 680px;
  --radius-img: 4px; --radius-code: 8px;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #2E2E2E; --ink: #EDEEEB; --ink-2: #A4ADA6;
    --link: #D2DDE4; --line: #485861;
    /* provisional, pending contrast checks */
    --surface: #3D444C; --code-bg: #2A2F35;
  }
}
@media (max-width: 720px) {
  :root { --gutter: 16px; }
}
body {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-sans), system-ui, sans-serif;
}
h1, h2, h3, .prose { font-family: var(--font-serif), Georgia, serif; }
code, pre, .meta   { font-family: var(--font-mono), ui-monospace, monospace; }
```

A feature sets its accent by overriding the token on its page wrapper: `<article style={{ "--accent": feature.accent }}>`.

### Design tokens

The design tokens live in `tokens/` as W3C DTCG JSON in four sets: `primitives` (raw values), `semantic` (mode-invariant aliases and the `type.*` styles), and `modes/light` and `modes/dark` (the color tokens, same names in both). Components use semantic tokens, never primitives. Token names map to the CSS variables above:

| Token | CSS |
|---|---|
| `color.bg` `surface` `ink` `ink-2` `link` `accent` `line` | `--bg` `--surface` `--ink` `--ink-2` `--link` `--accent` `--line` |
| `color.code.bg` / `color.code.fg` | `--code-bg` / `--code-fg` |
| `space.gutter.desktop` / `space.gutter.mobile` | `--gutter` (96px / 16px) |
| `space.col-gap` | `--col-gap` |
| `size.reading-measure` | `--measure` |
| `radius.image` / `radius.code` / `radius.pill` | `--radius-img` / `--radius-code` / fully rounded |

Other semantic tokens have no CSS variable yet:

| Group | Tokens |
|---|---|
| Spacing | `space.block` (128), `space.image-gap.min` / `.max` (160 / 200), `space.header-top` (120), `space.nav-item` (40), `space.meta-item` (32), `space.row.index` (22), `space.row.table` (18), `space.stack.sm` `.md` `.lg` `.xl` `.2xl` (16 / 24 / 32 / 48 / 64) |
| Sizing | `size.content-width` (1248), `size.touch-target` (44), `size.pill-height` (44) |
| Borders | `border.hairline` (1), `border.rule` (1), `border.accent-rule` (2) |

The files are `tokens/primitives.json`, `tokens/semantic.json`, `tokens/modes/light.json` and `tokens/modes/dark.json`. `src/app/globals.css` mirrors them: change the JSON first, then the CSS.

Design decisions are tracked in [design-log.md](design-log.md).

---

## Accessibility

- Text meets 4.5:1 (3:1 at 24px and up). `--ink-2` on `--bg` passes; `--accent` does not, so it never carries small text.
- Filter pills and all touch targets are at least 44px.
- Real elements: `<nav>`, `<a href>`, `<button>`, `<table>` (or proper ARIA table roles), `<figure>` and `<figcaption>`.
- Every image has alt text. Photography alt text describes the photograph, not the EXIF.
- Respect `prefers-reduced-motion` for any feature motion.

---

## Open questions

- Confirm the pairing reads well on real essays (test a full paragraph on the essay page at 100% zoom).
- Confirm the provisional dark-mode accent, surface and code colors after contrast checks. Since `neutral.900` became `#2E2E2E`, the dark `code-bg` (`#2A2F35`) is 1.01:1 against the dark `bg`, so code blocks no longer stand out in dark mode.
- Ink and ground are now neutral grays (`#2E2E2E`, `#FAFAFA`), while `surface`, `line`, `ink-2` and `link` are still the cool, slightly green family. Decide whether to make those neutral too.
- Pick the first three to five pieces to promote to features at launch.
- Replace the homepage placeholder content once the first features exist (frame built 2026-10-01). The lead headline uses `ink` until a feature has its own accent.
- Specify the travels collection's map view, if it gets one.
- Check the licence of the SVG Repo mustache used in `docs/portrait.svg` (credit it, or redraw the shape, before launch).
- **Mobile (draft proposal, not decided).** Nothing below is spec until approved.
  - One breakpoint: under 768px is mobile; 768px and up keeps the desktop layout (approved by Mal 2026-10-01: tablet uses the desktop layout for now).
  - Foundations: gutter 16px; `space-block` 128 → 64, `space-header-top` 120 → 48, `space-xl` 48 → 32. Type sizes only: h1 88 → 44, feature-display 180 → 64, display-sans 120 → 48, standfirst 24 → 20, quote 36 → 26, stat 56 → 44, h2 and index-title 28 → 24, body 19 → 18; ui, small, label, meta and code unchanged. Recalculate tracking as size × em. Touch targets stay 44px.
  - Nav (approved by Mal 2026-10-01): wordmark left and a text "Menu" button right (no icon); it opens the five sections as a full-width list under the bar, active item keeps the accent underline. Footer: copyright line, then the links wrapping.
  - Eyebrow, SectionLabel, Caption, Figure, ImagePlaceholder: unchanged apart from full width inside the gutters; EXIF wraps under the index. MetaRow items wrap.
  - EssayHeader, SpecBlock, Stats: full width, stacked (no columns 9–12). Aside sits inline under its paragraph instead of the margin.
  - IndexList: index and title on one line, category and year on a second line.
  - DataTable (approved by Mal 2026-10-01): stacked label/value rows, one block per row, hairline between rows. No horizontal scroll.
  - Toolbar (approved by Mal 2026-10-01): pills scroll sideways inside the toolbar only (the one allowed horizontal scroll); sort label drops below. CollectionLink and OtherCollections stack.
  - CodeBlock: scrolls inside the block, padding 32 → 16.