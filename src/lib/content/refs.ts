/*
 * A ref names one entry anywhere in the site: "photo:2026-10-02-wren",
 * "post:the-rise-of-gan", "sighting:2026-09-27-carolina-wren". Entries point at
 * each other with refs, in frontmatter and in `<Embed of="…" />`.
 */

export const kinds = [
  "post",
  "note",
  "photo",
  "photo-series",
  "post-series",
  "project",
  "track",
  "album",
  "sighting",
  "recommendation",
  "flight",
  "collection",
  "item",
] as const;

export type Kind = (typeof kinds)[number];

const id = "[a-z0-9][a-z0-9-]*";

/** A file name, without its extension, that can be an id. */
export const idPattern = new RegExp(`^${id}$`);

export const refPattern = new RegExp(
  `^(?:(?:${kinds.filter((k) => k !== "item").join("|")}):${id}|item:${id}/${id})$`,
);

/**
 * Kinds without a page of their own. Their address is somewhere on another
 * page, so two of them never compete for one.
 */
export const pageless: readonly Kind[] = [
  "post-series",
  "sighting",
  "recommendation",
  "flight",
  "item",
];

/** The collection whose page an observation is read on. */
export const homes = {
  sighting: "life-list",
  recommendation: "recommendations",
  flight: "travels",
} as const satisfies Partial<Record<Kind, string>>;

export function toRef(kind: Kind, id: string) {
  return `${kind}:${id}`;
}

export function parseRef(ref: string): { kind: Kind; id: string } | null {
  if (!refPattern.test(ref)) return null;
  const at = ref.indexOf(":");
  return { kind: ref.slice(0, at) as Kind, id: ref.slice(at + 1) };
}

/**
 * Where an entry lives. A collection row, a sighting, a recommendation or a
 * flight has no page: it is an anchor on its collection's table.
 */
export function urlFor(kind: Kind, id: string) {
  switch (kind) {
    case "post":
      return `/writing/${id}`;
    case "note":
      return `/writing/notes/${id}`;
    case "photo":
      return `/photography/${id}`;
    case "track":
      return `/music/${id}`;
    case "photo-series":
    case "album":
    case "project":
      return `/projects/${id}`;
    case "post-series":
      // No page yet: the loader points it at its first part.
      return "/writing";
    case "sighting":
    case "recommendation":
      return `/collections/${homes[kind]}#${id}`;
    case "flight":
      // The travels page is a map, so its table is one level down.
      return `/collections/${homes[kind]}/log#${id}`;
    case "collection":
      return `/collections/${id}`;
    case "item": {
      const [collection, row] = id.split("/");
      return `/collections/${collection}#${row}`;
    }
  }
}

/** Fenced blocks, then inline code: text that is shown, not run. */
const codeInBody = /^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[^\n]*$|`[^`\n]*`/gm;

/**
 * Every `<Embed of="…" />` in an MDX or Markdown body, in order. One written
 * inside code is an example and is not drawn, so it is not an embed.
 */
export function refsInBody(body: string) {
  return [...body.replace(codeInBody, "").matchAll(/<Embed\s[^>]*?\bof=["']([^"']+)["']/g)].map(
    (m) => m[1],
  );
}
