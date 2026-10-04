# 0006. Writing content in a private repository, notes through Pages CMS

- **Status:** accepted
- **Date:** 2026-10-03

## Context

The Writing section will hold two kinds of content: Kodikion posts (articles and the newsletters The Kernel and Dev Journal, which are also published on Substack) and short notes. DESIGN.md had each piece as an MDX file in this repository.

This repository is public and will stay public. Mal wants the writing itself stored privately, so that drafts, edit history and deleted notes are not visible, and wants content decoupled from the application. Notes also need to be posted, edited and deleted from a phone, without a code editor.

Nothing is built yet. This record sets the pattern; the work is listed under "Deferred".

## Decision

1. **Writing lives in a separate private repository.** This repository holds the application only. Layout of the content repository:

   ```
   posts/       one .mdx per post; the file name is the slug
   notes/       one .md per note; the file name is the id
   images/      referenced by posts and notes
   .pages.yml   Pages CMS configuration (notes)
   ```

2. **The app reads content from disk, fetched at build time.** A prebuild step downloads the content repository into a gitignored `content/` folder, using a read-only token kept in the host's environment. Pages stay static; nothing is fetched per request.
3. **A push to the content repository rebuilds the site,** through the host's deploy hook. No commit is made to this repository.
4. **Sample content is the fallback.** Without the token (CI, forks, a fresh clone), the app builds from a small set of sample posts and notes kept in this repository. Tests and visual snapshots run against the samples, so they never depend on, or leak, real content.
5. **Local writing:** an environment variable points the app at a local clone of the content repository, to preview drafts.
6. **Notes are posted with Pages CMS,** connected to the content repository only. It is a git-based editor: each new, edited or deleted note is a commit. Posts are written as MDX in an editor, not in Pages CMS, because they use components (figures, pull quotes, feature layouts).
7. **The frontmatter is the contract between the two repositories.** The fields are listed in DESIGN.md, "Writing metadata". The build fails on a post that is missing a required field or uses a reserved slug (`the-kernel`, `dev-journal`, `notes`).
8. **Every post is its own canonical URL,** including posts first published on Substack.

## Alternatives considered

- **Content in this repository.** The simplest option, and what DESIGN.md described. Rejected because the repository is public.
- **Making this repository private.** Rejected by Mal; the application code should stay open.
- **A private git submodule.** Keeps one checkout, but it pins a content commit in this repository, so every note would need a commit here too, and the host needs extra setup to clone it.
- **Fetching content per request,** from the GitHub API with caching. Notes would appear in seconds instead of after a build, but it adds a runtime dependency on GitHub, a runtime MDX compiler and cache invalidation. Revisit if the build delay is a problem.
- **A hosted headless CMS** (a database-backed service). Instant publishing and a richer editor, but a second system to run and another place content lives. Mal chose git-based.

## Consequences

- A note is live about a minute after it is posted, once the site has rebuilt. Posting is not instant.
- Deleting a note removes it from the site. It remains in the private repository's history, and copies already posted to Threads or Bluesky are not touched.
- Privacy covers the source, drafts and history. Anything published on the site is public.
- A deploy needs the token and the deploy hook configured. If the token is missing in production, the site would ship sample content, so the production build must fail when it is absent.
- Images come with the content at build time, so they go through `next/image` as local files (ADR 0005). A large image library will slow the fetch.
- Contributors and CI see only sample content. The samples must cover each case the templates handle: an article, a feature, an issue of each newsletter, a series part and a note.
- Work, photography and collections content stays in this repository. Only writing is private.

## Deferred

Creating the content repository; the fetch step and deploy hook; the MDX library; the search library; the two RSS feeds (posts and notes); the `.pages.yml` configuration, including whether Pages CMS suits the note fields as specified. The existing Substack posts are copied over by hand; no import tool is planned.
