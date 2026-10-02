import Link from "next/link";

/** Link inside running text: --link with a 1px underline; --ink on hover. */
export function InlineLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-link underline decoration-1 underline-offset-[0.15em] hover:text-ink"
    >
      {children}
    </Link>
  );
}

/** Standalone action ("View source →"): no underline until hover. */
export function ArrowLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="type-ui text-link decoration-1 underline-offset-[0.15em] hover:text-ink hover:underline"
    >
      {children} <span aria-hidden>→</span>
    </Link>
  );
}
