import path from "node:path";
import { cache } from "react";
import { loadContent } from "./load";
import { createQueries, type Queries } from "./query";

/*
 * The site's own content: the `content/` folder at the top of the
 * repository. Pages call `content()` and ask it questions; nothing else
 * reads the folder. See docs/adr/0008-atomic-content-model.md.
 */

export * from "./format";
export * from "./refs";
export type * from "./schema";
export type { Queries } from "./query";

const development = process.env.NODE_ENV === "development";

async function read() {
  // Drafts show while writing, and never in a build.
  return createQueries(
    await loadContent(path.join(process.cwd(), "content"), { drafts: development }),
  );
}

let built: Promise<Queries> | undefined;

// In development the folder is read again for each request, so an edit shows
// on reload. A build reads it once.
const perRequest = cache(read);

export function content(): Promise<Queries> {
  if (development) return perRequest();
  return (built ??= read());
}
