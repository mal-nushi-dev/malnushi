# DESIGN.md — malnushi.com

The design foundation for Mal Nushi's personal site: writing, projects (code, digital design, hardware, Lego), photography, and a set of living collections (bird life list, recommendations, music, travels, Lego inventory).

---

## Concept

**An editorial, art-directed, typographic site.** The frame has a voice. Typography carries meaning, scale is used on purpose, and the best pieces are designed individually instead of being poured into a template. It sits in the lineage of microsoft.design, WePresent, Stripe Press and COLLINS.

What those sites share is the model this one follows: **a strict, quiet house system underneath, with a bespoke layer on top for the pieces that earn it.** The house system (grid, UI type, metadata, color tokens) is what makes the site feel authored instead of chaotic. The bespoke layer is what makes it memorable.

Three things define the look:

- **Scale contrast.** Very large serif headlines against small, precise sans labels and mono metadata. The gap between the biggest and smallest type on a page is the signature.
- **Type as image.** Headlines, pull quotes and big numbers are compositional elements, not just labels for content.
- **Restraint everywhere else.** A cool neutral ground, hairline rules, no gradients, no ornament, and no shadows except the nav's once the page scrolls. Color is spent deliberately and rarely.

References: Stripe Press (house system plus per-book identity, serif voice), WePresent and microsoft.design (per-story art direction), COLLINS (type at display scale, project indexes), The Paris Review (literary serif), Linear (precise sans UI), Kinfolk (whitespace).

Avoid: 1970s chunky and rounded (Vacation.inc, Ghia), brutalism and neo-brutalism, dense engineering tables (McMaster-Carr), pure black on pure white, Pinterest-style card walls, gradient washes, drop shadows (the scrolled nav is the one exception), emoji.

---

## Site structure

### What the pages signify

The site is organized around five distinct pillars, each with a clear editorial role and purpose:

- **Home.** Acts as an active front porch rather than a static directory. It welcomes visitors with editorial curation: a personal introduction in the serif voice, a lead feature at display scale, varied-size secondary features, and live pulses from recent writing, projects, and collection activity.
- **Writing.** Unifies your long-form blog and your short-form microblog under one roof, preventing your thoughts from feeling fragmented across the site. The cleanest layout here is a reverse-chronological feed with a subtle filter toggle at the top to isolate essays, quick notes, or all entries. Rendering microblog entries as brief, timestamped notes and longform articles with titles and reading times keeps your stream active without burying your in-depth pieces.
- **Projects.** Serves as your creative workshop, focusing strictly on things you have made, engineered, or arranged. Here live your software repositories, original music compositions, Lego creations, and photography portfolios. Structuring this hub as an image-forward card grid allows visitors to browse disparate disciplines side by side, with each card leading to a dedicated case study detailing the backstory, tools used, audio players, or photo galleries.
- **Collections.** Operates as your personal encyclopedia and ongoing data hub. This is where your bird life list, plant tracker, flight stats, city guides, item inventories, and media recommendations live. Unlike projects, these are not finished deliverables, but living reference tables and personal dashboards that evolve over decades. Presenting this hub with visual index tiles—each displaying a quick preview or running tally, like species identified or miles flown—makes browsing feel like walking through a private museum.
- **About.** Grounds the entire site by providing personal context, philosophy, and connection points. Alongside your background and current technical focus, it works well to include a colophon detailing how the site is built and hosted, a "Now" module outlining what you are currently reading or tinkering with, and direct ways to get in touch.

### Navigation

`Home` · `Writing` · `Projects` · `Collections` · `About`

The wordmark ("Mal Nushi") links home and sits in the centre of the toolbar. Features have no nav item of their own. They surface on the homepage and at the top of their section index.

### Page types

Every piece of content is one of six types. Each has its own house template.

| Type | What it is | Leads with | Promotable to feature |
|---|---|---|---|
| **Essay** | A Kodikion post: an article, or an issue of The Kernel or Dev Journal | Type: headline, standfirst, then reading column | Articles yes; newsletter issues no |
| **Project** | Code, digital design, hardware, Lego builds | Image: hero, then title and spec block | Yes |
| **Photography series** | A sequenced set of photographs | Image: sequencing and pacing do the work | Yes |
| **Note** | A short, untitled post, the length of a social post | Text: the note itself, then a mono date | No |
| **Photo** | One photograph, on its own | Image: the photograph, then its caption and EXIF | No |
| **Collection** | A structured, growing list (life list, recs, music, travels, Lego inventory) | Data: header, stats, then rows | No (items are rows, not pages) |

The first three are **pieces**: each is a standalone page at its own URL. A **note** also has its own URL, so it can be linked to, but it is read in a stream and is never art-directed; if a note needs a headline, it is an essay. A **photo** is the same for images: it has its own URL and is read in the archive, never art-directed; photographs that belong together and need pacing are a series, which is an ordered selection of photos. **Collections** are different. A bird sighting, a recommendation or an album is a row in a list, never a page of its own. A row can still be named and shown elsewhere (in an essay, on the home page); it links back to its list. If an item grows into a story (a birding trip, say), that story becomes an essay or photo series that links back to the list.

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
- **Corner radius** is 4px on images and 8px on code blocks. Filter pills are fully rounded. The nav plate is 14px (`radius.nav`), easing to 20px (`radius.nav-open`) when expanded. Nothing else is rounded.
- **No gradients, drop shadows or emoji.** Exceptions: the nav gets a very slight shadow (`shadow.nav`) once the page scrolls (requested by Mal 2026-10-02); and the Writing index masthead's terminal screen has gradients, a dark tinted surface and a bowed, rounded shape while the animation plays (requested by Mal 2026-10-04).

---

## Components

### Nav (floating toolbar)

Decided with Mal 2026-10-02. The nav is a slim floating toolbar, not a bar with five items. It has three parts:

1. **Sticky layer.** `position: sticky; top: 0`, no height of its own and a fully transparent background, so only the toolbar content shows.
2. **Spacer.** A 104px block in the page flow so content below doesn't jump.
3. **Row and plate.** Two siblings inside the layer, centred:
   - **Row:** 600 × 72px, never resized: a search button (left), the wordmark "Mal Nushi" in `index-title` (centre) and a menu button (right). Buttons are 56px with 26px line icons, `--ink-2`, `--ink` on hover. Nothing in the row moves or is laid out again in any state; only the button icon swaps to a close icon, in place.
   - **Plate:** a 14px-cornered (`radius.nav`) surface behind the row, 600 × 72px at rest. It carries the fill and shadow and grows outward from the row, wider and downward, to reveal the search field or the menu list.

**Fill and shadow.** At the top of the page (scroll under 8px) the plate has no fill, outline or shadow, so the nav reads as part of the page. Once the page scrolls it fades to a `--bg` fill with `shadow.nav`, so it lifts off the content and stays legible. Search and menu also fill the plate, even at the top, and in those states the plate is **sage** (see below). `shadow.nav` is the only shadow in the system: light `0 1px 2px rgb(0 0 0 / 0.04), 0 4px 16px rgb(0 0 0 / 0.06)`; dark (provisional, unchecked) `0 1px 2px rgb(0 0 0 / 0.25), 0 4px 16px rgb(0 0 0 / 0.3)`.

**Expanded color (decided with Mal 2026-10-02).** While search or the menu is open, the plate is `color.sage.600` (`#626E5E`) in both light and dark mode, and everything on it (row, input, list) switches to light tokens: ink `#FAFAFA` (5.1:1), secondary text and links `#EDEEEB` (4.6:1), hairlines a 35% mix of `#EDEEEB` into sage, and the active underline `#EDEEEB` (sage on sage would vanish). Row text fades with the plate over 300ms. This is the one place a tinted surface is allowed; it is implemented as token overrides under `[data-nav-open]` in `globals.css`.

The plate expands in place and floats over page content; it pushes nothing.

**Motion (decided with Mal 2026-10-03).** The plate opens in two phases, on springs, not easing curves:
1. **Widen.** It grows from 600px to 840px about its center. Its corners ease from 14px to 20px, and the bar thins by up to 4px while the width is moving.
2. **Drop.** Once the width has covered 80% of its travel, the plate grows downward to its open height. The top edge never moves.

Each phase grows slightly past its target, pulls back and settles: about 7% on the width (roughly 8px a side) and 5% on the height. The plate never sways sideways; the only oscillation is in its own size. Springs: width `stiffness 260, damping 21, mass 1`; height `220, 21, 1`.

- **Closing** runs in reverse (height first, then width at 80% of the height's travel) on a stiffer, nearly critically damped spring (`320, 34, 1`), so the bar lands without a wobble. The plate keeps its sage fill and shadow while the height collapses, and fades back only as the width narrows, mirroring the open.
- **Search to menu** (and back) moves only the height.
- **Interrupting** a transition retargets the running spring, which keeps its velocity.
- **Narrow viewports** (632px and under), where the plate is already full width, skip the widen phase and the thinning, and drop open at once.
- **Fill and shadow** fade over 300ms. Panel content fades in over 350ms after a 150ms delay, so it arrives with the drop and does not wobble.
- **`prefers-reduced-motion`**: no springs and no fades; the plate jumps to its size.

Engineering notes are in `docs/adr/0001-spring-animation-with-motion.md`.

- **Search:** the plate widens to 840px and grows to 144px tall. A search input appears in the expansion below the row, and takes focus. The search button becomes a close button.
- **Menu:** the plate grows to 840 × 416px. The five sections appear below the row as an index list: mono `001`–`005` and `index-title` labels, hairlines between rows. The active section has a 2px accent underline. The menu button becomes a close button.
- **Escape**, the close button, or a press anywhere outside the nav returns to rest. The search text is kept when it closes, and cleared only by a refresh or a page change.

The panel content has a fixed 840px width (narrower viewports clamp it to the viewport minus 32px), so it never reflows while the plate animates. The section list lives only in the menu, so it can grow into a hub. The search input is not wired to anything yet. Mobile is not designed yet.

### Eyebrow

`label` style, `--ink-2`, above every h1 (except the Writing index, whose masthead is the name): section, then an accent-colored `/`, then the sub-category.
Examples: `WRITING / TECHNOLOGY`, `WRITING / THE KERNEL`, `WRITING / DEV JOURNAL`, `PROJECTS / CODE`, `PHOTOGRAPHY / SERIES 04`, `COLLECTIONS / BIRDING`. The three parts sit in a row 8px apart. For writing, the sub-category is the article's category, or the newsletter's name on an issue.

### Meta row

A 1px `--ink` rule, then mono `meta` items in a row, 32px apart: date, reading time, tags. It sits under the standfirst on essays. The rule spans the content width (1248px) and sits 16px above the items.

### Spec block (projects)

A definition list in columns 9–12. Each row pairs a `label` key (96px column) with a value. Hairline between rows, 1px `--ink` rule on top. Values are sans `ui`, except dates and stacks, which are mono.

Standard keys: **Year**, **Role**, **Medium**, **Stack** (code) or **Materials** (hardware, Lego), **Status**. The status gets a small accent dot.

### Captions

Under images: a mono index (`01`) in `--ink`, then the caption in sans `small`, `--ink-2`. On photography, the caption is mono EXIF, right-aligned opposite the index.

The index sits in a fixed 48px column with the caption text beside it (600px wide), so wrapped lines hang under the text, not under the index. EXIF is `meta` in `--ink-2`, items 24px apart, and **flexible**: it shows only the fields a photograph has (for example lens, aperture, shutter, ISO), in a fixed order, so one photo can show four items and another two. Nothing is required and nothing is left as an empty slot.

### Index list

Used for "More projects", section indexes and anything else that lists pieces. Each row is a grid: mono index, serif `index-title`, sans category, mono year aligned right. 22px row padding, hairlines between rows, a 1px `--ink` rule under the section label. This replaces card grids, except on the Writing index, where the articles lead with images (see that section).

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

The home page acts as an active front porch rather than a static directory—an editorial front page, not a passive feed.

- **Opening:** a short introduction in the serif voice, an About link and a line-drawn self-portrait. No hero tagline about "building things."
- **Lead feature:** one feature follows the introduction, at full display scale with its own accent. It changes when a new feature is promoted.
- **Then:** the other features in a varied-size arrangement, followed by index lists of the latest essays and projects, the latest newsletter issues and notes, and a strip showing recent collection activity (latest bird, latest rec, latest photograph).

### Essay

Type leads.

1. Eyebrow, `h1`, `standfirst`, meta row (the `Essay Header` component). Title and standfirst span 7 columns (718px); 24px between eyebrow, title and standfirst; 48px from the standfirst to the meta row, which spans 1248px. The standfirst is `--ink-2`.
2. A hero image (1248 wide) with a caption. Optional; an essay can go straight from the header to the text.
3. The body: a 680px reading column offset two columns from the left, with asides and footnotes in a 294px margin column on the right.
4. Pull quotes break the column rhythm, with a 2px accent rule on top.
5. The next link in the footer.

**As a feature:** a display-scale headline (`feature-display`) that may crop, a full-bleed hero or color field in the piece's accent, and inset images that break out of the column.

Every Kodikion post uses this template. A post's `type` says what it is:

- **Article** (the default). It has one topic category (Technology, Cars, Politics…) and can be promoted to a feature.
- **The Kernel** or **Dev Journal**, a newsletter issue. It needs no category and is never promoted to a feature.

A multi-part run (parts 1 to 3 on one subject) is a series name and a part number on any post, whatever its category. It adds "Part 2 of 3" to the meta row and links to the previous and next parts. A series has no page of its own.

A post that is also on Substack links to that copy ("Also on Substack") after the body.

### Writing index

`/writing`. The writing page unifies your long-form blog and your short-form microblog under one roof, preventing your thoughts from feeling fragmented across the site. The cleanest layout here is a reverse-chronological feed with a subtle filter toggle at the top to isolate essays, quick notes, or all entries. Rendering microblog entries as brief, timestamped notes and longform articles with titles and reading times keeps your stream active without burying your in-depth pieces.

The page calls itself **Kodikion.** (the nav item stays "Writing"). Decided with Mal 2026-10-04; see the design log. From the top:

1. **Masthead** (the `Masthead` component): "Kodikion." centered across columns 3–10, drawn as outlines at about 200px, the full stop in `--accent`. It is typed in JetBrains Mono behind a block cursor, then each letter springs into Newsreader. It is the page's `h1` (real text for screen readers). Under it, centered, the `standfirst`: "A blog by Mal Nushi. Also on Substack." Then a 1px `--ink` rule across the content width. There is no eyebrow on this page: it would repeat the name above itself.
2. **Articles, columns 1–8**, in this order, with 128px (`space-block`) between:
   - the lead: a 3:2 image, eyebrow, headline in `quote`, subtitle in `body`, date in `meta`;
   - two more, in a 5 + 3 column pair (3:2 and 3:4 images), the second dropped by `space-block`; eyebrow and `index-title` headline;
   - **Newsletters:** a section label, then The Kernel and Dev Journal side by side. Each is a `label` name, the newest issue (its number in `stat`, in `--accent`, the title in `index-title`, the date) and an arrow link, then the earlier issues as one-line rows between hairlines;
   - **All articles:** a section label, filter pills (one per category, plus All) and the index list, which the pills filter in place.
3. **Notes rail, columns 10–12:** a section label, the latest notes set in `ui` with a `meta` date link, and an arrow link to the stream. It is sticky (`top: --space-lg`) and stays in view while the articles scroll. The rail is an `aside` landmark named "Notes".

Newsletter issues and notes never mix into the article list. Images are placeholders until the posts have real ones.

**Masthead behaviour.** Plays on every page load, about 3.3s: a dark CRT screen warms up behind the name (0.3s), the name is typed in JetBrains Mono, in green phosphor, behind a block cursor (solid while typing), the cursor blinks twice (1s), then the letters spring into the serif, the screen fades out and the cursor becomes the sage full stop. Pressing it plays the morph again, serif to monospace (the full stop becoming the block cursor), two blinks, then back to serif; presses during a play are ignored. It is a button covering the masthead, named "Play the masthead animation again", so it works from the keyboard. With reduced motion, or no JavaScript, the finished serif is shown still and there is no button.

**The terminal** (decided with Mal 2026-10-04). Mono mode is a VT100 / IBM 3270 screen: convex glass with bowed sides, rounded corners, a faint bezel, a vignette, scanlines and a soft glare, drawn in the masthead's own SVG, and the letters bulged to match (the bulge relaxes as they turn serif). Phosphor persistence: each letter has a faint halo, a letter just typed flares and settles over about 250ms, and a moving letter leaves two fading ghosts. The cursor blinks on at once and off with a quick decay, twice a second at most. These values belong to the masthead and are not site tokens: screen `#040604`–`#15211a`, bezel `#454a44`, phosphor `#7DFF9B`, struck `#E2FFE8`. The screen is dark in light and dark mode alike and is decorative (the SVG is hidden from screen readers; the `h1` is real text). It exists only while the animation runs; at rest the page is unchanged.

The outlines come from `scripts/masthead-glyphs.mjs` (ADR 0007); the box never changes size and the screen overflows it without affecting layout, so nothing shifts. On a phone it is not designed yet (Open questions).

### Newsletter page

`/writing/the-kernel` and `/writing/dev-journal`. Eyebrow, the newsletter's name as the `h1`, its description as the standfirst, then an index list of every issue, newest first.

### Note

A note has no title, no standfirst and no feature tier.

- **Stream** (`/writing/notes`): eyebrow, `h1`, standfirst, then the notes, newest first, in the 680px reading column (offset two columns, as on an essay). Each note is its text in `body`, then 16px below it a mono `meta` line in `--ink-2` that links to the note's own page. Notes are separated by a hairline with 32px above and below. The `Note` component is one note and `NoteList` is the list; the list supplies the hairlines and the page supplies the column.
- **Date line:** the date, a middle dot, then the time on a 12-hour clock with the time zone: `2026-10-03 · 2:12 PM EDT`. The time and zone are those where the note was written (Eastern, so `EDT` or `EST` by date), not the reader's.
- **Single note** (`/writing/notes/[id]`): the same note alone, with a link back to the stream.

Notes are not part of Kodikion and are not sent to Substack.

### Project

Projects serves as your creative workshop, focusing strictly on things you have made, engineered, or arranged. Here live your software repositories, original music compositions, Lego creations, and photography portfolios. Structuring this hub as an image-forward card grid allows visitors to browse disparate disciplines side by side, with each card leading to a dedicated case study detailing the backstory, tools used, audio players, or photo galleries.

Image leads. One template covers code, digital design, hardware and Lego; the spec block is what flexes.

1. Eyebrow (`PROJECTS / CODE`, `PROJECTS / HARDWARE`), then the hero image directly under it, so label, image and title read as one unit.
2. Title (`h1`) and standfirst across 7 columns, with links ("View source →", "Download →"). The spec block sits in columns 9–12.
3. An image pair with captions.
4. The write-up: an `h2` in columns 1–3, body text in columns 4–10. Repeat as needed.
5. Detail images in a row of three.
6. A "More projects" index list and the footer.

Someone should understand a project from the hero, title and spec block alone, and read further only if interested.

**As a feature:** a COLLINS-style case study. The process, dead ends and details become the story, with larger image sequences, process artifacts, and the project's own accent.

### Photo

One photograph. It has no feature tier.

- **Archive** (`/photography`): eyebrow, `h1`, standfirst, then every photograph, newest first, one at a time, `space-block` apart: landscape at the content width, portrait at the column width, alternating left and right. Each has a mono index (numbered from the oldest, so a photograph keeps its number) and its EXIF, and links to its own page. Provisional; see Open questions.
- **Single photo** (`/photography/[id]`): eyebrow (`PHOTOGRAPHY / 2026-10-02`), the photograph, its title as the `h1` if it has one, its caption in `standfirst`, then a meta row of date, place, camera, lens and exposure. Below: "Appears in", an index list of the entries that point at it, and the next link to the next photograph.
- **Embedded** in an essay: a column figure with the day it was taken as its index and its EXIF, linking to its page.

The archive is not in the nav. It is reached from Projects and from the home page.

### Photography series

The photographs lead. Text is reduced to a minimum.

1. Eyebrow, `h1` in columns 1–8, a two-line intro and mono meta (count, camera) in columns 9–12.
2. A full-bleed opener.
3. A paced sequence: an offset pair, a single small image in a lot of space, a one-line `quote` interlude, a wide close. Vary scale and position deliberately; never a uniform grid.
4. Every image has a mono index and EXIF caption.
5. The next link to the next series.

**As a feature:** the sequence gets its own accent color field, bespoke placement, and optionally a written essay woven between the images.

### Collections

Collections operates as your personal encyclopedia and ongoing data hub. This is where your bird life list, plant tracker, flight stats, city guides, item inventories, and media recommendations live. Unlike projects, these are not finished deliverables, but living reference tables and personal dashboards that evolve over decades.

- **Collections index** (`/collections`): visual index tiles—each displaying a quick preview or running tally, like species identified or miles flown—making browsing feel like walking through a private museum.
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

The About page grounds the entire site by providing personal context, philosophy, and connection points. Alongside your background and current technical focus, it works well to include:

- A personal narrative and philosophy in a house essay reading column (`h1`, standfirst, body text).
- A **"Now" module** outlining what you are currently reading, thinking about, or tinkering with.
- A **colophon** detailing how the site is built and hosted.
- Direct ways to get in touch (contact methods and links).

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
- The rule of no gradients, shadows or emoji (the scrolled nav's shadow is the one exception). Break it only if a specific feature truly earns it.

---

## Implementation (Next.js)

### Content model

Everything published is an **entry**: a file in `content/`, written once in its own shape, which any page can ask for and show. See `docs/adr/0008-atomic-content-model.md`.

| Kind | File | Lives at |
|---|---|---|
| Post | `content/posts/<slug>.mdx` | `/writing/[slug]` |
| Note | `content/notes/<id>.md` | `/writing/notes/[id]`, read at `/writing/notes` |
| Photo | `content/photos/<id>.jpg`, with an optional `<id>.yml` | `/photography/[id]`, read at `/photography` |
| Series | `content/series/<slug>.mdx` | `/projects/[slug]` |
| Project | `content/projects/<slug>.mdx` | `/projects/[slug]` |
| Collection | `content/collections/<slug>.yml` | `/collections/[slug]` |
| Collection row | an item in its collection's file | no page: `/collections/[slug]#<id>` |

`/writing/the-kernel` and `/writing/dev-journal` list the two newsletters. `the-kernel`, `dev-journal` and `notes` are reserved: no post may use them as a slug. A series and a project share `/projects/`, so they cannot share a slug.

**Refs.** An entry is named `kind:id`, for example `photo:2026-10-02-wren-at-the-window` or `item:life-list/carolina-wren`. One entry points at another in its frontmatter (`cover`, `photos`, `related`) or in its body with `<Embed of="photo:…" />`, which draws the other entry in place: a photograph as a figure with its EXIF, a note as a note, a collection row as its summary. Each entry's page can list what points at it ("Appears in"). The build fails on a ref that names nothing.

**Views.** The same entry is drawn differently by context: its own page, a row in an index list, an item in a stream, an embed. Pages get entries from `src/lib/content` and never hold content themselves.

**Content is in this repository,** which will be made private. Until it is, only placeholder content is committed. Notes are still to be posted with Pages CMS.

**Photo metadata.** A photograph's date, camera, lens and exposure are read from the image file. Its `.yml` can add `alt`, `caption`, `place` and `tags`, and can override anything the file says (for a film scan, it supplies everything). Alt text is required, from the `.yml` or from the image's own alt text field. Photographs are `.jpg`, exported with the long edge at 2400px or less.

**RSS.** Two feeds: `/writing/feed.xml` for Kodikion posts and `/writing/notes/feed.xml` for notes. Both carry the full text.

A piece renders in its house template unless the frontmatter has a `feature` block:

```yaml
---
title: "The list that keeps me looking"
subtitle: "A life list is supposed to be about the birds…"
date: 2026-09-28
type: article
category: Birding
feature:
  accent: "#8A5A3C"
  hero: "split-type"       # full-bleed | color-field | split-type | type-only
  headline: "display-xl"   # display-l | display-xl | sans-display
---
```

Promoting a piece means adding that block plus any bespoke MDX components. The URL and the words don't change.

### Writing metadata

Post frontmatter. These fields are what search, the index lists, link previews and structured data read, so every post fills them in the same way.

| Field | Required | Notes |
|---|---|---|
| `title` | Yes | |
| `subtitle` | Yes | The standfirst under the `h1` |
| `description` | No | One or two sentences for search results, link previews and SEO. Falls back to `subtitle`. |
| `date` | Yes | First published |
| `updated` | No | Only for a real revision |
| `author` | No | Defaults to Mal Nushi |
| `type` | No | `article` (default), `the-kernel` or `dev-journal` |
| `category` | Articles | One per post, from a short fixed list |
| `keywords` | No | Three to eight specific terms a reader would type. For search only; not shown as tags. |
| `series`, `part` | No | A series name and this post's part number |
| `issue` | No | Newsletter issue number |
| `image`, `imageAlt` | No | Hero and share image |
| `cover` | No | A photo's ref, used as the hero |
| `related` | No | Refs of entries this post is about |
| `substack` | No | URL of the Substack copy |
| `draft` | No | `true` keeps the post out of the build |
| `feature` | No | The block above. Articles only. |

The slug is the file name. Reading time and word count are worked out at build time, never written by hand.

A note has a `date` with a time and a UTC offset (`2026-10-03T14:12-04:00`) and its text. `keywords` and `syndicated` (links to the copies on Threads or Bluesky) are optional. Its id is the file name.

**Canonical URLs.** Every post on the site is its own canonical URL, including posts that were first published on Substack. Substack cannot point its canonical URL elsewhere, so both copies are indexed.

**Search** covers posts and notes. Matches are weighted: title first; then subtitle, keywords and category; then description; then body. Results can be filtered by kind (post or note), type, category and year.

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
  --radius-img: 4px; --radius-code: 8px; --radius-nav: 14px; --radius-nav-open: 20px;
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
| `radius.nav` / `radius.nav-open` | `--radius-nav` / `--radius-nav-open` |

Other semantic tokens have no CSS variable yet:

| Group | Tokens |
|---|---|
| Spacing | `space.block` (128), `space.image-gap.min` / `.max` (160 / 200), `space.header-top` (120), `space.nav-item` (40), `space.meta-item` (32), `space.row.index` (22), `space.row.table` (18), `space.stack.sm` `.md` `.lg` `.xl` `.2xl` (16 / 24 / 32 / 48 / 64) |
| Sizing | `size.content-width` (1248), `size.touch-target` (44), `size.pill-height` (44) |
| Borders | `border.hairline` (1), `border.rule` (1), `border.accent-rule` (2) |
| Shadow | `shadow.nav`, CSS `--shadow-nav` (values in Components → Nav). Code only: not in `tokens/` yet. |

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
- **Contrast failures found by the browser checks (2026-10-03, `e2e/a11y.spec.ts`).** Image placeholder labels (`ink-2` on `line`) are 3.88:1 in light and 3.2:1 in dark, under the 4.5:1 AA minimum for small text; `ink` would pass. On the home page the lead feature's hero label (`bg` on the placeholder accent `#8a5a3c`) is 2.33:1 in dark mode. Placeholders are excluded from the scan until this is decided. The dark accent (`#758072`) is 3.28:1 on the dark `bg`, so it must not be used for text (it is not, apart from a preview-page heading that was moved to `ink-2`). Everything else the scan covers, including the sage plate in both modes, passes AA.
- Ink and ground are now neutral grays (`#2E2E2E`, `#FAFAFA`), while `surface`, `line`, `ink-2` and `link` are still the cool, slightly green family. Decide whether to make those neutral too.
- Pick the first three to five pieces to promote to features at launch.
- Replace the homepage placeholder content once the first features exist (built in `src/app/page.tsx` 2026-10-02). The lead feature's accent (`#8a5a3c`) is a placeholder; pick it from the real piece. Links go to routes that don't exist yet.
- Wire up the toolbar search (no route or index yet). What it indexes and how matches are weighted is in Implementation → Writing metadata; the search library is not chosen.
- Writing: settle the fixed list of article categories, and file the two Substack posts that have no section there ("Can You Rebrand a Systemic Collapse?" and "Exile on Main St.").
- Writing index: the masthead and its sticky notes rail are not checked in Safari, Firefox or on a phone and have no mobile layout (set aside by Mal 2026-10-04, not dropped). The full-stop spacing in the masthead is unreviewed.
- Photo archive (`/photography`): the layout is a first pass built from existing components, not designed. Decide the layout, the page's copy, whether captions show in the archive, and where the archive is linked from.
- Photography series now live at `/projects/[slug]`, so `/photography/[id]` is a single photo (my choice, 2026-10-04; not confirmed by Mal). The series template is not built.
- Home: the "latest photograph" in the collections strip is text only. Decide whether it shows the image.
- Essay page (`/writing/[slug]`): margin asides and the feature tier are not built; an aside renders inline.
- Writing: whether a note can carry an image or a link preview. The chosen stream layout is built at `/writing/notes` (`src/app/writing/notes/page.tsx`).
- Home: show the latest notes and newsletter issues (decided 2026-10-03). How they are shown is not designed, and `src/app/page.tsx` does not show them yet.
- The old mobile Nav proposal below (a "Menu" text button) predates the toolbar; redo it for the toolbar.
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