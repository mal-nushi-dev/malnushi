# 0008. One content model: entries in files, a query layer, many views

- **Status:** accepted
- **Date:** 2026-10-04
- **Supersedes:** the storage decisions of [0006](0006-writing-content-in-a-private-repo.md)

## Context

Every page held its own sample data, typed into the page. DESIGN.md described content as bound to a page: one route per section and one template per type. A photograph, a note or a row of the bird list could not appear anywhere but the page it was written for without being copied.

Mal wants the opposite: an entry is written once, in its own shape with all its metadata, and any page can show it. The same photograph should be its own page, a figure in the archive, an item on the home page and an illustration inside an essay. This applies to all content, not only photographs. It must not cost speed or image quality, and it should leave room for feeds and embeddable widgets later.

Mal also decided that content lives in this repository, which will be made private, instead of the separate private repository ADR 0006 set out.

## Decision

Three layers. Each knows nothing about the one after it.

1. **Content is files in `content/`,** tracked in this repository. The file name is the id.

   ```
   content/
     posts/<slug>.mdx           frontmatter as in DESIGN.md, "Writing metadata"
     notes/<id>.md              a date with its UTC offset, then the text
     photos/<id>.jpg            the photograph, exported for the web
     photos/<id>.yml            optional: alt, caption, place, tags, or any field to override
     series/<slug>.mdx          an ordered list of photographs
     projects/<slug>.mdx        the spec fields
     collections/<slug>.yml     columns, then one item per row
   ```

2. **`src/lib/content/` reads the folder into one index** while the site builds.
   - `schema.ts` has one zod schema per kind, each in its own shape, and an `Envelope` every entry shares (`kind`, `id`, `ref`, `url`, `date`, `title`, `summary`, `tags`, `links`). Cross-kind views read the envelope; a kind's own views read its own fields.
   - `load.ts` parses and checks every file and collects every problem before failing, each named by file and field: a missing or misspelled field, a reserved slug, two entries at one URL, a photograph without alt text or a date, a ref that names nothing or names a draft. Drafts are left out of a build and shown in development.
   - `query.ts` is what pages ask: `get`, `need`, `list`, `stream` (several kinds, newest first), `backlinks` and `adjacent`.
   - `index.ts` binds the queries to `content/`. Pages call `content()`.
3. **Views live in `src/components/entry/`.** Mappers turn an entry into what the existing components take (`toIndexItem`, `toNoteItem`, `toIssue`); `PhotoFigure`, `ItemSummary` and `EntryBody` draw one entry; `Embed` draws any entry by ref and is available in every MDX body.

**Refs.** An entry is named `kind:id`: `photo:2026-10-02-wren-at-the-window`, `post:the-rise-of-gan`, `item:life-list/carolina-wren`. Entries point at each other in frontmatter (`cover`, `photos`, `related`) and in bodies (`<Embed of="…" />`). The loader gathers these as `links` and reverses them, which is how a photograph's page lists the essays it appears in.

**A collection row is an entry without a page.** It has a ref and can be embedded or streamed; its URL is its collection's page and an anchor.

**Photographs.** The image's EXIF and IPTC are read with `exifr`. Anything written in the `.yml` wins over the file. Alt text is required, from the `.yml` or from the image's own alt text field. The image is imported through the bundler (`import(\`@content/photos/${id}.jpg\`)`), so Next knows its dimensions before render, gives it a blur placeholder and a hashed URL, and serves it through `next/image` as ADR 0005 requires.

**Bodies** are compiled by `@next/mdx` when imported (`EntryBody`), with `remark-frontmatter` to drop the frontmatter the loader has already read. Notes go through the same path as posts.

**Dates are kept as written.** YAML is parsed with `yaml`, which leaves `2026-10-03T14:12-04:00` a string, so a note keeps the offset of the place it was written.

Dependencies added: `zod`, `yaml`, `exifr`, `@next/mdx`, `@mdx-js/loader`, `remark-frontmatter`, and `@types/mdx` for development.

## Alternatives considered

- **Keeping data in each page.** No dependency, and no way to reuse an entry.
- **A content framework** (Content Collections, Velite). They do the schema and loading steps, and add a build plugin and generated code between the files and the pages. The loader here is about 400 lines, has no code generation, and gives refs, backlinks and EXIF, which those would not.
- **A database or a hosted CMS.** Queries at request time and a richer editor, at the cost of a service to run, latency, and content living outside git.
- **An internal API or feeds between sections.** This is the decoupling Mal ruled out: a network hop, layout shift while it loads, and metadata reduced to what the feed format carries.
- **`gray-matter`** for frontmatter. It parses dates into `Date` objects, which loses a note's offset.
- **`server-only`** on the layer. It throws under Vitest; the layer imports `node:fs`, which already cannot be bundled for the browser.
- **Images in `public/`.** No import needed, but no dimensions, placeholder or hashed URL without a second step.

## Consequences

- Publishing is adding a file and pushing. A new kind is a schema, a block in the loader and its views; the home stream, backlinks and embeds work for it at once.
- A mistake in content stops the build, with the file named. A published entry cannot embed a draft.
- The whole folder is read on each build, and on each request in development. Fine at hundreds of entries; cache it if it becomes slow.
- Photographs are `.jpg` only. The bundler needs at least one file per imported extension, so a second format is added in `load.ts` and `photo-figure.tsx` together, once a file of that type exists.
- Photographs are in git, so the repository grows with each one. Export at web size (long edge 2400px or less). Git LFS is the remedy if it becomes a problem and changes nothing above the files.
- `exifr` is unmaintained and its file reader fails on current Node, so the loader hands it a buffer, and it is kept out of the server bundle (`serverExternalPackages`).
- This repository is still public. Only placeholder content is committed until it is private.
- No sample-content fallback is needed: CI and local builds read the same folder.

## Deferred

Pages for projects, series and collections (their entries already load); margin asides and the feature tier on the essay page; RSS feeds and search, which are route handlers over `query.ts`; pointing Pages CMS at this repository; Git LFS.
