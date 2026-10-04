import type { ContentIndex } from "./load";
import { toRef, type Kind } from "./refs";
import type { Entry, EntryOf } from "./schema";

/** Days sort as midnight UTC; a moment sorts by its instant. */
function instant(date: string) {
  return Date.parse(date);
}

function newestFirst(a: Entry, b: Entry) {
  return instant(b.date) - instant(a.date) || a.ref.localeCompare(b.ref);
}

type ListOptions<E> = {
  where?: (entry: E) => boolean;
  limit?: number;
  /** Newest first unless set. */
  oldestFirst?: boolean;
};

/** What appears in a stream of everything unless a page asks otherwise. */
const streamKinds: Kind[] = ["post", "note", "photo", "series", "project", "item"];

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
    let found = all.filter((e): e is EntryOf<K> => e.kind === kind).sort(newestFirst);
    if (options.where) found = found.filter(options.where);
    if (options.oldestFirst) found.reverse();
    return options.limit === undefined ? found : found.slice(0, options.limit);
  }

  /** Dated entries of several kinds together, newest first. */
  function stream({ kinds = streamKinds, limit }: { kinds?: Kind[]; limit?: number } = {}) {
    const found = all.filter((e) => kinds.includes(e.kind)).sort(newestFirst);
    return limit === undefined ? found : found.slice(0, limit);
  }

  /** The entries that point at this one, newest first. */
  function backlinks(ref: string) {
    return (index.backlinks.get(ref) ?? [])
      .map((r) => index.entries.get(r))
      .filter((e) => e !== undefined)
      .sort(newestFirst);
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

  return { get, need, list, stream, backlinks, adjacent };
}

export type Queries = ReturnType<typeof createQueries>;
