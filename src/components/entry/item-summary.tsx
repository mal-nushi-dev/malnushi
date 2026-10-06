import {
  fieldOf,
  type CollectionEntry,
  type ItemEntry,
  type RecommendationEntry,
  type SightingEntry,
} from "@/lib/content";

/**
 * One row of a collection, away from its table: a label, the name (with the
 * scientific name beside a species) and the collection's summary fields. The
 * row is a sighting, a recommendation or an item written in the collection.
 */
export function ItemSummary({
  item,
  collection,
  label,
}: {
  item: ItemEntry | SightingEntry | RecommendationEntry;
  collection: CollectionEntry;
  /** Defaults to the collection's name. */
  label?: string;
}) {
  const { scientific } = item.facets;
  return (
    <div className="flex flex-col gap-(--space-sm)">
      <p className="type-label text-ink-2">{label ?? collection.data.title}</p>
      <p className="type-index-title text-ink">
        {item.title}
        {scientific && (
          <>
            {" "}
            <span className="type-body italic text-ink-2">{scientific}</span>
          </>
        )}
      </p>
      <p className="type-meta text-ink-2">
        {collection.data.summary.map((key) => fieldOf(item, key)).join(" · ")}
      </p>
    </div>
  );
}
