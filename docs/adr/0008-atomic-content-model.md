# 0008. The Atomic Content Model: entries in files, a query layer, many views

- **Status:** accepted
- **Date:** 2026-10-05
- **Supersedes:** the storage decisions of [0006](0006-writing-content-in-a-private-repo.md)

## Context

Every page held its own sample data, typed into the page. DESIGN.md described content as bound to a page: one route per section and one template per type. A photograph, a note or a bird sighting could not appear anywhere but the page it was written for without being copied.

Mal wants the opposite: the site as a graph of pieces of work, not a set of pages. An entry is written once, in its own shape with all its metadata, and any page can show it. The same photograph should be its own page, a figure in the archive, an item on the home page and an illustration inside an essay. This applies to all content. It must not cost speed or image quality, and it should leave room for search, feeds and embeddable widgets later.

Three things have to be kept apart for that to work:

- **What a piece of work is.** A photograph, a post, a note, a sighting, a recommendation. Call these primitives.
- **How pieces are grouped.** A photo series, a series of posts, a collection. These are composites: entries in their own right, holding an ordered list of the primitives they contain and nothing copied from them.
- **How a piece is described.** Its category, tags, camera, species, place. These are fields on the entry, never entries themselves.

Mal also decided that content lives in this repository, which will be made private, instead of the separate private repository ADR 0006 set out.

## Decision

Call it the **Atomic Content Model**. Content is broken into atoms (entries), each written once and complete in itself, which any page can show.

Three layers. Each knows nothing about the one after it.

1. **Content is files in `content/`,** tracked in this repository. The file name is the id.

   ```
   content/
     posts/<slug>.mdx             frontmatter as in DESIGN.md, "Writing metadata"
     notes/<id>.md                a date with its UTC offset, then the text
     photos/<id>.jpg              the photograph, exported for the web
     photos/<id>.yml              optional: alt, caption, place, tags, or any field to override
     projects/<slug>.mdx          the spec fields
     sightings/<id>.md            one time a bird was seen; the text is the field notes
     recommendations/<id>.md      something worth passing on; the text is why
     photo-series/<slug>.mdx      an ordered list of photographs
     post-series/<slug>.mdx       an ordered list of posts
     collections/<slug>.yml       columns, then either rows or the kind to ask
   ```

2. **`src/lib/content/` reads the folder into one index** while the site builds.
   - `schema.ts` has one zod schema per kind, each in its own shape, and the `Envelope` every entry shares.
   - `kinds.ts` is the registry: for each kind that is one file per entry, its folder, its schema, the kind its members must be if it is a series, and how an entry fills the envelope. Photographs (an image and a `.yml`) and collections (many rows in a file) are read by their own code in `load.ts`.
   - `load.ts` parses and checks every file and collects every problem before failing, each named by file and field. Drafts are left out of a build and shown in development.
   - `query.ts` is what pages ask: `get`, `need`, `list`, `stream` (several kinds, newest first), `backlinks`, `members`, `partOf`, `tagged` and `adjacent`.
   - `index.ts` binds the queries to `content/`. Pages call `content()`.
3. **Views live in `src/components/entry/`.** Mappers turn an entry into what the existing components take (`toIndexItem`, `toNoteItem`, `toIssue`); `PhotoFigure`, `ItemSummary` and `EntryBody` draw one entry; `Embed` draws any entry by ref and is available in every MDX body.

**The envelope** is what cross-kind views, and later search and feeds, read. A kind's own views read its own fields.

| Field | What it holds |
|---|---|
| `kind`, `id`, `ref`, `url`, `date` | What it is, its name, where it lives, when |
| `title`, `summary`, `body` | The text to show and to search |
| `category` | The one label an eyebrow or a badge shows. Optional. |
| `tags` | Free labels, the same field on every kind, shown to readers |
| `facets` | The fields a reader might search or filter by, flat: `camera`, `place`, `species`, `medium` |
| `edges` | What this entry points at, each with its sort |

**Refs.** An entry is named `kind:id`: `photo:2026-10-02-wren-at-the-window`, `post:the-rise-of-gan`, `sighting:2026-09-27-carolina-wren`.

**Edges are typed.** One entry points at another in its frontmatter or its body, and each pointer says what it means:

| Edge | Written as | Meaning |
|---|---|---|
| `contains` | `photos` on a photo series, `posts` on a post series, a collection's rows | Membership, in order |
| `cover` | `cover` | The photograph used as the hero |
| `related` | `related` | What the entry is about |
| `embeds` | `<Embed of="…" />` in a body | Drawn in place |

**Membership is written once, on the composite.** A photo series lists its photographs; a photograph never names its series. What an entry belongs to, and its place there ("Part 2 of 3", the next photograph in a series), is worked out by reading the edges backwards (`partOf`). Reordering a series or adding a part is one edit in one file, and the two directions cannot disagree. A series may only list entries of its own member kind, and each only once.

**Facets, not taxonomy entries.** Each kind copies its descriptive fields into `facets` under names the kinds share: `place` is the same key on a photograph and a sighting. Search and filters read that one map and need no code per kind. A category, a tag, a camera, a composer or a species is therefore never an entry: it would be a file holding one string. A subject becomes an entry only when it has prose of its own (see Deferred, topics). `facets` is a copy for searching; templates read the typed fields in `data`.

**`category` and `tags` are both kept.** Tags are many and unordered, for finding. Category is one, chosen by the author, for display: a template that had only tags would have to guess which one to put in the eyebrow.

**Observations are entries; collections ask for them.** A sighting or a recommendation is its own file with typed fields and a body. A collection's file either holds its rows (`items:`, for a plain table such as an inventory) or names a kind (`from:`), in which case its rows are the entries of that kind, with `unique:` keeping one row per value, the earliest. The life list is `from: sighting, unique: species`: the first sighting of each species, in the order of seeing. Nothing is kept by hand.
- A collection is resolved from the entries already loaded, so a draft sighting is neither a row nor able to stand in for a published one.
- Two sightings of one species must agree on its scientific name and family, or a slip would start a new row.
- A column of such a collection reads the entry's date, title or a facet.

**Not every entry has a page.** A sighting, a recommendation and a table row live at an anchor on their collection's page (`/collections/life-list#<id>`); one or two sentences do not earn a route. A post series has no page yet and takes its first part's URL and date. Any of these can be given a page later without changing its ref or its file.

**Photographs.** The image's EXIF and IPTC are read with `exifr`. Anything written in the `.yml` wins over the file. Alt text is required, from the `.yml` or from the image's own alt text field. The image is imported through the bundler (`import(\`@content/photos/${id}.jpg\`)`), so Next knows its dimensions before render, gives it a blur placeholder and a hashed URL, and serves it through `next/image` as ADR 0005 requires.

**Bodies** are compiled by `@next/mdx` when imported (`EntryBody`), with `remark-frontmatter` to drop the frontmatter the loader has already read. Notes, sightings and recommendations go through the same path as posts.

**Dates are kept as written.** YAML is parsed with `yaml`, which leaves `2026-10-03T14:12-04:00` a string, so a note keeps the offset of the place it was written.

Dependencies added: `zod`, `yaml`, `exifr`, `@next/mdx`, `@mdx-js/loader`, `remark-frontmatter`, and `@types/mdx` for development.

## Alternatives considered

- **Keeping data in each page.** No dependency, and no way to reuse an entry.
- **A content framework** (Content Collections, Velite). They do the schema and loading steps, and add a build plugin and generated code between the files and the pages. The loader here is a few hundred lines, has no code generation, and gives typed edges, backlinks, facets and EXIF, which those would not.
- **A database or a hosted CMS.** Queries at request time and a richer editor, at the cost of a service to run, latency, and content living outside git.
- **An internal API or feeds between sections.** This is the decoupling Mal ruled out: a network hop, layout shift while it loads, and metadata reduced to what the feed format carries.
- **Tags and categories as entries.** Every label would be a file with a string in it and a page with nothing on it. Facets give the same search and filtering.
- **One category and no tags, or tags and no category.** A single category forces a piece about a connected kitchen appliance to be filed under either technology or home. Tags alone leave templates guessing which label to show.
- **Membership written on the member** (a `series` and `part` on each post, a series name on each photograph), or on both sides. Renumbering means editing every part, and two records of one fact drift.
- **Sightings and recommendations as rows of a table.** Cells hold text or a number only: no field notes, coordinates, tags or typed fields, and the list has to be kept by hand.
- **Untyped links** (a list of refs). A photograph's page could list everything that points at it, but could not tell the series it belongs to from an essay that mentions it.
- **`gray-matter`** for frontmatter. It parses dates into `Date` objects, which loses a note's offset.
- **`server-only`** on the layer. It throws under Vitest; the layer imports `node:fs`, which already cannot be bundled for the browser.
- **Images in `public/`.** No import needed, but no dimensions, placeholder or hashed URL without a second step.

## Consequences

- Publishing is adding a file and pushing. Logging a sighting updates the life list; nothing else is edited.
- A new kind is a declaration in `kinds.ts`, its schema and its views. Streams, backlinks, embeds, tags and facets work for it at once.
- A mistake in content stops the build, with the file named: a missing or misspelled field, a reserved slug, two entries at one URL, a photograph without alt text or a date, a ref that names nothing or names a draft, a series listing the wrong kind or one entry twice, a species named two ways. A published entry cannot embed or contain a draft, so a part that is not written yet is announced with `total`, not listed.
- Facet names are a shared vocabulary. A new kind should reuse an existing key where the meaning is the same, or one search splits into two.
- Renaming an entry's file changes its ref. Everything that points at it then fails the build until it is updated.
- `EntryBody` imports bodies by folder and extension, and the bundler needs at least one file to match each pattern. A folder for a kind with a body must not be empty.
- The whole folder is read on each build, and on each request in development. Fine at hundreds of entries; cache it if it becomes slow.
- Photographs are `.jpg` only, for the same bundler reason: a second format is added in `load.ts` and `photo-figure.tsx` together, once a file of that type exists.
- Photographs are in git, so the repository grows with each one. Export at web size (long edge 2400px or less). Git LFS is the remedy if it becomes a problem and changes nothing above the files.
- `exifr` is unmaintained and its file reader fails on current Node, so the loader hands it a buffer, and it is kept out of the server bundle (`serverExternalPackages`).
- This repository is still public. Only placeholder content is committed until it is private.
- No sample-content fallback is needed: CI and local builds read the same folder.

## Deferred

- **Music.** A track (primitive: audio, duration, tempo, key) and an album or EP (composite of tracks), for Mal's own recordings under Projects. Other people's music is a recommendation.
- **Search.** A build-time index over the envelope and facets of every kind, with results labelled by kind.
- **Topics.** A subject with its own prose and a chosen reading list becomes an entry that contains others. Until one exists, a subject is a tag.
- **Proof images on a sighting.** A picture that only confirms a field mark stays a file beside the sighting. One that stands on its own is a photograph, which the sighting points at with `related`.
- **Pages** for projects, photo series, collections and post series (their entries already load); margin asides and the feature tier on the essay page.
- RSS feeds, which are route handlers over `query.ts`; pointing Pages CMS at this repository; Git LFS.
