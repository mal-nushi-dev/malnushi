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

- Variable axes: weight, width, optical size, slant and rounded terminals. **Never use the rounded axis.** It pushes the site toward the chunky-70s look.
- The width axis is available for display use on index pages and features (a condensed or extended sans headline). House pieces keep serif headlines.
- Use `font-variant-numeric: tabular-nums` on any column of numbers.
- It stands in for Google Sans, Segoe UI, Moderat, Ginto and Geist.

### JetBrains Mono: the details

- Small (12–13px) and usually in `--ink-2`. It labels things; it never carries sentences.
- It replaces Hack.

### Type scale

| Token | Font | Size / line height | Weight | Tracking | Use |
|---|---|---|---|---|---|
| `feature-display` | Newsreader | 140–220 / 0.95 | 300–400 | -0.03em | Feature headlines only. May crop or break the grid. |
| `display-sans` | Google Sans Flex | 96–180 / 0.95 | 500–600 | -0.03em | Section indexes and features only. Width axis allowed. |
| `h1` | Newsreader | 88 / 1.02 | 400 | -0.025em | House titles for all page types |
| `standfirst` | Newsreader italic | 23–26 / 1.45 | 400 | 0 | Dek under an h1 |
| `quote` | Newsreader | 36 / 1.25 | 300 | -0.01em | Pull quotes, interludes in photo series |
| `h2` | Newsreader | 28 / 1.25 | 500 | 0 | Section heads within a piece |
| `index-title` | Newsreader | 26–28 / 1.2 | 400 | 0 | Titles in index lists and "next" links |
| `stat` | Newsreader | 56 / 1 | 400 | -0.01em | Big numbers on collection headers |
| `body` | Newsreader | 19 / 1.65 | 400 | 0 | Reading text |
| `ui` | Google Sans Flex | 15 / 1.5 | 400–500 | 0 | Nav, captions, table cells, spec values |
| `small` | Google Sans Flex | 14 / 1.6 | 400 | 0 | Footnotes, asides, captions |
| `label` | Google Sans Flex | 12 | 600 | +0.12em, UPPERCASE | Eyebrows, spec keys, table headers, section labels |
| `meta` | JetBrains Mono | 12–13 / 1.7 | 400 | 0 | Dates, indexes, EXIF, stacks |
| `code` | JetBrains Mono | 14 / 1.7 | 400 | 0 | Code blocks (16px inline in body) |

**Mobile:** `feature-display` and `display-sans` scale to 64–88px, `h1` to 44px, `quote` to 28px, `body` to 18px. Everything else stays.

### Rules

- **Headlines are serif by default.** Sans display is reserved for section indexes and features, where it's a deliberate choice.
- **Reading column is 680px max** (about 65 characters per line).
- **Footnotes and asides go in the margin, in the sans,** at `small` size. They read as the site talking, not the author.
- **Emphasis in body text is italic, never bold.** Newsreader 600 is rare; Sans 700 is almost never used.
- **Scientific names** are Newsreader italic in `--ink-2`, set beside the common name.
- **Casual pieces can lean lighter** (Newsreader 300); analytical pieces stay at regular. Same family, different temperature.

---

## Color

One cool-neutral family with a sage accent. **No pure black, no pure white.** The charcoal ink removes the harshness of black on white, and warmth comes from the serif, not from cream tones. **Do not mix in the creams** (`#F7F4ED`, `#EEECE2`): they're a different temperature and muddy the palette.

### Light (default)

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#F1F1F1` | Page |
| `--surface` | `#EDEEEB` | Inline code, subtle fills |
| `--ink` | `#343A42` | Primary text, strong rules |
| `--ink-2` | `#626964` | Secondary text, meta, captions (≈5:1 on bg, passes AA) |
| `--link` | `#485861` | Links |
| `--accent` | `#758072` | Sage. Active nav underline, eyebrow separators, pull-quote rules, status dots, large decorative marks. **Not for body or small text** (≈3.7:1 on bg). |
| `--line` | `#D5D7D2` | Hairline dividers, borders, image placeholders |
| `--code-bg` | `#343A42` | Code block background |
| `--code-fg` | `#EDEEEB` | Code block text |

### Dark

| Token | Hex |
|---|---|
| `--bg` | `#343A42` |
| `--ink` | `#EDEEEB` |
| `--ink-2` | `#A4ADA6` |
| `--link` | `#D2DDE4` |
| `--line` | `#485861` |

Check the dark-mode accent and code colors for contrast once the pages exist.

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

An 8px base. Vertical rhythm uses these steps: 16, 24, 32, 48, 64, 80, 96, 128, 160, 200.

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

Sans 15/500, items 40px apart, in `--ink-2`. The active item is `--ink` with a **2px accent underline** offset 6px. A 1px `--line` hairline sits under the nav bar.

### Eyebrow

`label` style, `--ink-2`, above every h1: section, then an accent-colored `/`, then the sub-category.
Examples: `ESSAY / BIRDING`, `WORK / CODE`, `PHOTOGRAPHY / SERIES 04`, `COLLECTIONS / BIRDING`.

### Meta row

A 1px `--ink` rule, then mono `meta` items in a row, 32px apart: date, reading time, tags. It sits under the standfirst on essays.

### Spec block (projects)

A definition list in columns 9–12. Each row pairs a `label` key (96px column) with a value. Hairline between rows, 1px `--ink` rule on top. Values are sans `ui`, except dates and stacks, which are mono.

Standard keys: **Year**, **Role**, **Medium**, **Stack** (code) or **Materials** (hardware, Lego), **Status**. The status gets a small accent dot.

### Captions

Under images: a mono index (`01`) in `--ink`, then the caption in sans `small`, `--ink-2`. On photography, the caption is mono EXIF, right-aligned opposite the index.

### Index list

Used for "More work", section indexes and anything else that lists pieces. Each row is a grid: mono index, serif `index-title`, sans category, mono year aligned right. 22px row padding, hairlines between rows, a 1px `--ink` rule under the section label. This replaces card grids entirely.

### Data table (collections)

Header row in `label` style over a 1px `--ink` rule. 18px row padding, hairlines between rows. Mono index and dates, serif names (with italic scientific names where relevant), sans for everything else. Comfortable, never dense.

### Filter pills

Sans 14/500, 44px tall, fully rounded. Inactive pills have a 1px `--line` border; the active pill is filled `--ink` with `--bg` text.

### Next link (footer)

At the bottom of every piece: a `label` ("Next essay", "Next series") over an `index-title` or larger serif title, linking to the next piece in the section.

### Image placeholders

While real images are missing, use `--line` fills with a mono label giving the purpose and dimensions (`HERO — 1248 × 640`).

---

## Page types in detail

### Home

The homepage is an editorial front page, not a feed.

- **Opening:** one feature leads, at full display scale with its own accent. It changes when a new feature is promoted.
- **Then:** the other features in a varied-size arrangement, followed by index lists of the latest essays and projects, and a strip showing recent collection activity (latest bird, latest rec).
- A short introduction in the serif voice, and an About link. No hero tagline about "building things."

### Essay

Type leads.

1. Eyebrow, `h1`, `standfirst`, meta row.
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

Load all three with `next/font`, which self-hosts and avoids layout shift.

```ts
// app/fonts.ts
import { Newsreader, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

export const serif = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-serif",
  display: "swap",
});

export const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// If your Next.js version lists Google_Sans_Flex in next/font/google, use that instead.
// Otherwise download the variable .woff2 from Google Fonts into app/fonts/.
export const sans = localFont({
  src: "./fonts/GoogleSansFlex-Variable.woff2",
  variable: "--font-sans",
  display: "swap",
});
```

```tsx
// app/layout.tsx
<html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
```

### Tokens

```css
:root {
  --bg: #F1F1F1; --surface: #EDEEEB; --ink: #343A42; --ink-2: #626964;
  --link: #485861; --accent: #758072; --line: #D5D7D2;
  --code-bg: #343A42; --code-fg: #EDEEEB;

  --gutter: 96px; --col-gap: 24px; --measure: 680px;
  --radius-img: 4px; --radius-code: 8px;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #343A42; --ink: #EDEEEB; --ink-2: #A4ADA6;
    --link: #D2DDE4; --line: #485861;
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
- Decide the dark-mode accent and code colors after contrast checks.
- Pick the first three to five pieces to promote to features at launch.
- Design the homepage once the first features exist.
- Specify the travels collection's map view, if it gets one.
