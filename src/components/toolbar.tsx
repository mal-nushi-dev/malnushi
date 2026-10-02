import { FilterPill } from "./filter-pill";

/**
 * Filter pills left, sort label right, above a collection table.
 * Presentational for now: the collection page will own the filter state.
 */
export function Toolbar({
  filters,
  active,
  sort,
}: {
  filters: string[];
  active: string;
  /** For example "First seen ↓". */
  sort: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div role="group" aria-label="Filter" className="flex gap-(--space-sm)">
        {filters.map((f) => (
          <FilterPill key={f} active={f === active}>
            {f}
          </FilterPill>
        ))}
      </div>
      <p className="type-meta text-ink-2">Sort: {sort}</p>
    </div>
  );
}
