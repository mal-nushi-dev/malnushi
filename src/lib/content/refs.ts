/*
 * A ref names one entry anywhere in the site: "photo:2026-10-02-wren",
 * "post:the-rise-of-gan", "item:life-list/carolina-wren". Entries point at
 * each other with refs, in frontmatter and in `<Embed of="…" />`.
 */

export const kinds = [
  "post",
  "note",
  "photo",
  "series",
  "project",
  "collection",
  "item",
] as const;

export type Kind = (typeof kinds)[number];

const id = "[a-z0-9][a-z0-9-]*";

/** A file name, without its extension, that can be an id. */
export const idPattern = new RegExp(`^${id}$`);

export const refPattern = new RegExp(
  `^(?:(?:post|note|photo|series|project|collection):${id}|item:${id}/${id})$`,
);

export function toRef(kind: Kind, id: string) {
  return `${kind}:${id}`;
}

export function parseRef(ref: string): { kind: Kind; id: string } | null {
  if (!refPattern.test(ref)) return null;
  const at = ref.indexOf(":");
  return { kind: ref.slice(0, at) as Kind, id: ref.slice(at + 1) };
}

/** Where an entry lives. A collection row has no page: it is an anchor. */
export function urlFor(kind: Kind, id: string) {
  switch (kind) {
    case "post":
      return `/writing/${id}`;
    case "note":
      return `/writing/notes/${id}`;
    case "photo":
      return `/photography/${id}`;
    case "series":
    case "project":
      return `/projects/${id}`;
    case "collection":
      return `/collections/${id}`;
    case "item": {
      const [collection, row] = id.split("/");
      return `/collections/${collection}#${row}`;
    }
  }
}

/** Every `<Embed of="…" />` in an MDX or Markdown body, in order. */
export function refsInBody(body: string) {
  return [...body.matchAll(/<Embed\s[^>]*?\bof=["']([^"']+)["']/g)].map(
    (m) => m[1],
  );
}
