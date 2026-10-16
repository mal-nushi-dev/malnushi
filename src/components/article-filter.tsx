"use client";

import { useId, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { FilterPill } from "@/components/filter-pill";
import { IndexRow, type IndexItem } from "@/components/index-list";
import { SectionLabel } from "@/components/section-label";
import { noun } from "@/lib/format";

/*
 * ArticleFilter: an index of writing with category pills that narrow the list.
 *
 * Designed to work either standalone (uncontrolled, with its own internal state)
 * or driven by a caller / URL address (controlled via `UrlArticleFilter`).
 *
 * Follows the patterns set in ADR 0009:
 * - Pure data extraction and filtering functions.
 * - Screen reader status announcements on filter updates.
 * - Optional URL persistence via history.replaceState to keep views linkable.
 */

/** Default category label representing all articles unfiltered. */
const ALL = "All";

/**
 * Extracts distinct categories from items in the order they first appear,
 * prepending "All" as the first choice.
 *
 * Empty, null, or whitespace-only category labels are pruned to avoid blank pills.
 */
export function categoriesOf(items: IndexItem[]): string[] {
  const seen = new Set<string>();
  for (const item of items) {
    const trimmed = item.category?.trim();
    if (trimmed) seen.add(trimmed);
  }
  return [ALL, ...seen];
}

/**
 * Filters items by category using a case-insensitive, whitespace-trimmed comparison.
 * When `category` is "All", the full list is returned without filtering.
 */
function filterBy<T extends IndexItem>(items: T[], category: string): T[] {
  if (category === ALL) return items;
  const target = category.trim().toLowerCase();
  return items.filter((i) => i.category?.trim().toLowerCase() === target);
}

/**
 * Renders the row of category filter pills wrapped in an accessible group.
 */
function CategoryPills({
  label,
  categories,
  active,
  controlsId,
  onChange,
}: {
  /** The section label, used to form an accessible group label. */
  label: string;
  /** Available category strings. */
  categories: string[];
  /** Currently active category string. */
  active: string;
  /** DOM ID of the element being controlled/filtered, for `aria-controls`. */
  controlsId?: string;
  /** Callback fired when a category pill is selected. */
  onChange: (category: string) => void;
}) {
  return (
    <div
      role="group"
      aria-label={`Filter ${label.toLowerCase()} by category`}
      className="flex flex-wrap gap-(--space-sm)"
    >
      {categories.map((c) => (
        <FilterPill
          key={c}
          active={c === active}
          aria-controls={controlsId}
          onClick={() => onChange(c)}
        >
          {c}
        </FilterPill>
      ))}
    </div>
  );
}

/**
 * Props for {@link ArticleFilter}.
 */
export type ArticleFilterProps = {
  /** Section heading label shown above the filters (e.g. "All articles"). */
  label: string;
  /** The full array of index items to display and filter. */
  items: IndexItem[];
  /**
   * Currently active category filter. When provided, the component operates
   * in controlled mode, delegating state management to the caller.
   */
  category?: string;
  /**
   * Callback fired when the user selects a category pill or deselects
   * back to "All".
   */
  onChange?: (category: string) => void;
};

/**
 * An index list of articles with category pills that filter it in place.
 *
 * Can be used in two modes:
 * 1. **Uncontrolled (Standalone):** Manages its own filter state internally via `useState`.
 * 2. **Controlled:** Receives `category` and `onChange` from a parent or `UrlArticleFilter`.
 *
 * Features:
 * - **Memoized filtering:** Avoids re-computing category sets and filtered subsets unless inputs change.
 * - **Accessible status:** Emits a screen reader live region announcement when counts change.
 * - **Toggling:** Clicking the already active category toggles back to "All".
 * - **Empty state:** Displays a quiet message when no articles match the selected category.
 */
export function ArticleFilter({
  label,
  items,
  category: controlledCategory,
  onChange,
}: ArticleFilterProps) {
  // Internal state fallback for uncontrolled usage
  const [internalCategory, setInternalCategory] = useState(ALL);
  const activeCategory = controlledCategory ?? internalCategory;

  // Memoize distinct categories to prevent scanning and Set allocations on every render
  const categories = useMemo(() => categoriesOf(items), [items]);

  // Fallback to ALL if the active category is no longer present in the items list
  const resolvedCategory = categories.includes(activeCategory)
    ? activeCategory
    : ALL;

  // Memoize filtered results so unrelated parent renders do not re-run filtering
  const shown = useMemo(
    () => filterBy(items, resolvedCategory),
    [items, resolvedCategory],
  );

  /**
   * Handles pill clicks: selecting an active category deselects back to ALL,
   * while clicking a new category activates it.
   */
  function handleSelect(c: string) {
    const next = c === resolvedCategory ? ALL : c;
    if (onChange) onChange(next);
    else setInternalCategory(next);
  }

  // Generate a unique ID to link the filter buttons to the list via aria-controls
  const listId = useId();

  return (
    <section>
      <SectionLabel>{label}</SectionLabel>

      {/* Only show filter pills if there are at least two distinct categories to choose from */}
      {categories.length > 2 && (
        <div className="py-(--space-md)">
          <CategoryPills
            label={label}
            categories={categories}
            active={resolvedCategory}
            controlsId={listId}
            onChange={handleSelect}
          />
        </div>
      )}

      {/* Screen reader live region: announces matching article counts upon filter change */}
      <p role="status" className="sr-only">
        {shown.length} {noun(shown.length, "article", "articles")}
      </p>

      {/* Empty state fallback when filtering leaves zero matching articles */}
      {shown.length === 0 ? (
        <p className="border-t border-line py-(--space-md) type-meta text-ink-2">
          No articles in this category.
        </p>
      ) : (
        <ol id={listId} className="border-t border-line">
          {shown.map((item, i) => (
            <IndexRow key={item.href} index={i + 1} item={item} />
          ))}
        </ol>
      )}
    </section>
  );
}

/**
 * An {@link ArticleFilter} whose active category lives in the URL address (`?c=technology`),
 * enabling shareable, bookmarkable filtered views that survive page reloads (ADR 0009).
 *
 * Uses `history.replaceState` instead of pushing new entries so browser Back leaves the page
 * rather than cycling through previously clicked filter pills.
 *
 * Note: Reading search parameters requires a `<Suspense>` boundary when rendered
 * inside a static, prerendered page (with `<ArticleFilter>` as the fallback).
 */
export function UrlArticleFilter({
  param = "c",
  ...props
}: ArticleFilterProps & {
  /** Query parameter key in the URL. Defaults to `"c"`. */
  param?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const asked = searchParams.get(param);

  // Validate the URL parameter against available categories (case-insensitive)
  const categories = useMemo(() => categoriesOf(props.items), [props.items]);
  const active =
    categories.find(
      (c) => c.toLowerCase() === asked?.trim().toLowerCase() && c !== ALL,
    ) ?? ALL;

  /**
   * Updates the URL search parameter without triggering a full page navigation or history entry.
   */
  function handleChange(next: string) {
    const query = new URLSearchParams(searchParams.toString());
    if (next && next !== ALL) {
      query.set(param, next.toLowerCase());
    } else {
      query.delete(param);
    }
    const search = query.toString();
    window.history.replaceState(
      null,
      "",
      search ? `${pathname}?${search}` : pathname,
    );
  }

  return <ArticleFilter {...props} category={active} onChange={handleChange} />;
}
