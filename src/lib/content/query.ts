import { changedAt } from "./format";
import type { ContentIndex } from "./load";
import { toRef, type Kind } from "./refs";
import type { Entry, EntryOf, Rel } from "./schema";

/** Days sort as midnight UTC; a moment sorts by its instant. */
function instant(date: string) {
  return Date.parse(date);
}

function newestFirst(a: Entry, b: Entry) {
  return instant(b.date) - instant(a.date) || a.ref.localeCompare(b.ref);
}

/** As `newestFirst`, with a revised entry placed by its revision. */
function lastChangedFirst(a: Entry, b: Entry) {
  return instant(changedAt(b)) - instant(changedAt(a)) || newestFirst(a, b);
}

/**
 * `"date"` orders by when an entry was published, `"updated"` by when it
 * last changed.
 */
type By = "date" | "updated";

function order(by: By = "date") {
  return by === "updated" ? lastChangedFirst : newestFirst;
}

type ListOptions<E> = {
  where?: (entry: E) => boolean;
  limit?: number;
  /** Newest first unless set. */
  oldestFirst?: boolean;
  /** By publication unless set. */
  by?: By;
};

/** What appears in a stream of everything unless a page asks otherwise. */
const streamKinds: Kind[] = [
  "post",
  "note",
  "photo",
  "photo-series",
  "project",
  "track",
  "album",
  "sighting",
  "recommendation",
  "item",
];

/**
 * The questions pages ask of the content. Bound to an index, so tests can
 * ask them of a fixture folder.
 */
export function createQueries(index: ContentIndex) {
  const all = [...index.entries.values()];

  function get<K extends Kind>(kind: K, id: string): EntryOf<K> | undefined;
  function get(ref: string): Entry | undefined;
  function get(kindOrRef: string, id?: string) {
    return index.entries.get(id === undefined ? kindOrRef : toRef(kindOrRef as Kind, id));
  }

  /** As `get`, for a ref the page cannot do without. */
  function need<K extends Kind>(kind: K, id: string): EntryOf<K> {
    const entry = get(kind, id);
    if (!entry) throw new Error(`No ${toRef(kind, id)} in the content folder`);
    return entry;
  }

  function list<K extends Kind>(kind: K, options: ListOptions<EntryOf<K>> = {}) {
    let found = all.filter((e): e is EntryOf<K> => e.kind === kind).sort(order(options.by));
    if (options.where) found = found.filter(options.where);
    if (options.oldestFirst) found.reverse();
    return options.limit === undefined ? found : found.slice(0, options.limit);
  }

  /** Dated entries of several kinds together, newest first. */
  function stream({
    kinds = streamKinds,
    limit,
    by,
  }: { kinds?: Kind[]; limit?: number; by?: By } = {}) {
    const found = all.filter((e) => kinds.includes(e.kind)).sort(order(by));
    return limit === undefined ? found : found.slice(0, limit);
  }

  /**
   * The entries that point at this one, newest first. With `rel`, only those
   * that point in that way: `"embeds"` for the essays a photograph sits in.
   */
  function backlinks(ref: string, rel?: Rel) {
    const from = (index.backlinks.get(ref) ?? [])
      .filter((link) => rel === undefined || link.rel === rel)
      .map((link) => link.from);
    return [...new Set(from)]
      .map((r) => index.entries.get(r))
      .filter((e) => e !== undefined)
      .sort(newestFirst);
  }

  /** What a series or a collection holds, in its own order. */
  function members(entry: Entry) {
    return entry.edges
      .filter((edge) => edge.rel === "contains")
      .map((edge) => index.entries.get(edge.to))
      .filter((e) => e !== undefined);
  }

  /**
   * The series and collections this entry is in, with its place in each.
   * Membership is written on the series; this reads it backwards.
   *
   * A part still in draft is not in a build, but it keeps its place: the
   * position and the total count it, and `previous` and `next` step over it
   * to the nearest part that is published.
   */
  function partOf<K extends Kind>(ref: string, kind?: K) {
    return backlinks(ref, "contains")
      .filter((parent): parent is EntryOf<K> => kind === undefined || parent.kind === kind)
      .map((parent) => {
        const places = parent.edges
          .filter((edge) => edge.rel === "contains")
          .map((edge) => index.entries.get(edge.to));
        const at = places.findIndex((e) => e?.ref === ref);
        // A series may announce parts that are not written yet.
        const series: Entry = parent;
        const announced = series.kind === "post-series" ? (series.data.total ?? 0) : 0;
        return {
          parent,
          position: at + 1,
          total: Math.max(announced, places.length),
          previous: places.slice(0, at).findLast((e) => e !== undefined),
          next: places.slice(at + 1).find((e) => e !== undefined),
        };
      });
  }

  /** Everything carrying a tag, newest first. */
  function tagged(tag: string) {
    const wanted = tag.toLowerCase();
    return all.filter((e) => e.tags.some((t) => t.toLowerCase() === wanted)).sort(newestFirst);
  }

  /** Its neighbours of the same kind, for the next link. */
  function adjacent<K extends Kind>(
    entry: EntryOf<K>,
    where?: (entry: EntryOf<K>) => boolean,
  ) {
    const siblings = list(entry.kind as K, { where });
    const at = siblings.findIndex((e) => e.ref === entry.ref);
    return {
      newer: at > 0 ? siblings[at - 1] : undefined,
      older: at >= 0 ? siblings[at + 1] : undefined,
    };
  }

  return { get, need, list, stream, backlinks, members, partOf, tagged, adjacent };
}

export type Queries = ReturnType<typeof createQueries>;
