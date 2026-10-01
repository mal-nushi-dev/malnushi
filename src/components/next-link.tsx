import Link from "next/link";

/** Bottom of every piece: links to the next piece in the section. */
export function NextLink({
  label,
  title,
  href,
}: {
  /** For example "Next essay" or "Next series". */
  label: string;
  title: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-(--space-sm) border-t border-ink pt-(--space-sm)"
    >
      <span className="type-label text-ink-2">{label}</span>
      <span className="type-index-title text-ink group-hover:text-link">
        {title}
      </span>
    </Link>
  );
}
