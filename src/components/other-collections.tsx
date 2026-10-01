import { CollectionLink } from "./collection-link";
import { SectionLabel } from "./section-label";

export type CollectionSummary = { href: string; name: string; count: number };

/** Bottom of a collection page: links to the other collections. */
export function OtherCollections({
  collections,
}: {
  collections: CollectionSummary[];
}) {
  return (
    <section className="border-b border-line">
      <SectionLabel>Other collections</SectionLabel>
      <ul className="flex items-center gap-(--space-xl) py-(--space-row-index)">
        {collections.map((c) => (
          <li key={c.href}>
            <CollectionLink {...c} />
          </li>
        ))}
      </ul>
    </section>
  );
}
