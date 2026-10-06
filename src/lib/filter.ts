/*
 * Filtering a list by labels, several at once. Nothing here knows what is
 * being filtered: a gallery of projects today, any list of things that carry
 * labels tomorrow.
 *
 * A filter is offered for each label some item has as its main one (its
 * category). An item also answers to any of its tags that names such a
 * filter, so a design project that involved code is found under both. Tags
 * that name no filter stay out of the row: they are for search.
 */

export type Filter = {
  /** The label in lower case: what an item is matched by and the URL carries. */
  key: string;
  /** The label as it is shown. */
  label: string;
};

export function filterKey(label: string) {
  return label.trim().toLowerCase();
}

/** One filter for each main label, the most used first, then by name. */
export function filtersFrom(labels: string[]): Filter[] {
  const found = new Map<string, { label: string; count: number }>();
  for (const label of labels) {
    const key = filterKey(label);
    const seen = found.get(key);
    if (seen) seen.count++;
    else found.set(key, { label: label.trim(), count: 1 });
  }
  return [...found]
    .sort(([a, x], [b, y]) => y.count - x.count || a.localeCompare(b))
    .map(([key, { label }]) => ({ key, label }));
}

/** The filters an item answers to: its main label, and its tags that are filters. */
export function filterKeys(label: string, tags: string[], filters: Filter[]): string[] {
  const offered = new Set(filters.map((f) => f.key));
  return [...new Set([label, ...tags].map(filterKey))].filter((key) => offered.has(key));
}

/** The items that answer to every selected filter. All of them, if none is selected. */
export function matching<T extends { keys: string[] }>(items: T[], selected: string[]): T[] {
  return items.filter((item) => selected.every((key) => item.keys.includes(key)));
}

/**
 * The filters worth showing: those that are selected, and those that at
 * least one item still showing answers to. Selecting any other would leave
 * nothing.
 */
export function openFilters<T extends { keys: string[] }>(
  items: T[],
  selected: string[],
  filters: Filter[],
): Filter[] {
  const live = new Set(matching(items, selected).flatMap((item) => item.keys));
  return filters.filter((f) => selected.includes(f.key) || live.has(f.key));
}

/** Adds a filter to the selection, or removes it. The order follows `filters`. */
export function toggle(selected: string[], key: string, filters: Filter[]): string[] {
  const next = selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key];
  return filters.map((f) => f.key).filter((k) => next.includes(k));
}

/** A selection from a URL: `code,design`. Anything that is not a filter is dropped. */
export function parseSelection(param: string | null | undefined, filters: Filter[]): string[] {
  const wanted = new Set((param ?? "").split(",").map(filterKey));
  return filters.map((f) => f.key).filter((key) => wanted.has(key));
}

/** A selection for a URL, or nothing when all is shown. */
export function formatSelection(selected: string[]): string | undefined {
  return selected.length ? selected.join(",") : undefined;
}
