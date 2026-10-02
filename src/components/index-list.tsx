import Link from "next/link";
import { SectionLabel } from "./section-label";

export type IndexItem = {
  href: string;
  title: string;
  /** For example "Essay / Birding". */
  category: string;
  year: number | string;
};

/**
 * One row on the 12-column grid: index (1 col), title (7), category (3),
 * year (1). The whole row is the link.
 */
export function IndexRow({ index, item }: { index: number; item: IndexItem }) {
  return (
    <li className="border-b border-line">
      <Link
        href={item.href}
        className="group grid grid-cols-12 items-center gap-x-(--col-gap) py-(--space-row-index)"
      >
        <span className="col-span-1 type-meta text-ink-2">
          {String(index).padStart(3, "0")}
        </span>
        <span className="col-span-7 type-index-title text-ink group-hover:text-link">
          {item.title}
        </span>
        <span className="col-span-3 type-ui text-ink-2">{item.category}</span>
        <span className="col-span-1 text-right type-meta text-ink-2">
          {item.year}
        </span>
      </Link>
    </li>
  );
}

/** Replaces card grids: a section label over numbered rows. */
export function IndexList({
  label,
  items,
}: {
  label: string;
  items: IndexItem[];
}) {
  return (
    <section>
      <SectionLabel>{label}</SectionLabel>
      <ol>
        {items.map((item, i) => (
          <IndexRow key={item.href} index={i + 1} item={item} />
        ))}
      </ol>
    </section>
  );
}
