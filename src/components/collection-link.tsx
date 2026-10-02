import Link from "next/link";

/** A collection's name and mono count, e.g. "Recommendations [128]". */
export function CollectionLink({
  href,
  name,
  count,
}: {
  href: string;
  name: string;
  count: number;
}) {
  return (
    <Link href={href} className="group inline-flex items-center gap-(--space-sm)">
      <span className="type-index-title text-ink group-hover:text-link">
        {name}
      </span>
      <span className="type-meta text-ink-2">[{count}]</span>
    </Link>
  );
}
