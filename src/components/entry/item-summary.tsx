import type { CollectionEntry, ItemEntry } from "@/lib/content";

/**
 * One row of a collection, away from its table: a label, the name (with the
 * scientific name beside a species) and the collection's summary fields.
 */
export function ItemSummary({
  item,
  collection,
  label,
}: {
  item: ItemEntry;
  collection: CollectionEntry;
  /** Defaults to the collection's name. */
  label?: string;
}) {
  const { fields } = item.data;
  return (
    <div className="flex flex-col gap-(--space-sm)">
      <p className="type-label text-ink-2">{label ?? collection.data.title}</p>
      <p className="type-index-title text-ink">
        {item.title}
        {fields.scientific && (
          <>
            {" "}
            <span className="type-body italic text-ink-2">{fields.scientific}</span>
          </>
        )}
      </p>
      <p className="type-meta text-ink-2">
        {collection.data.summary.map((key) => fields[key]).join(" · ")}
      </p>
    </div>
  );
}
