import Link from "next/link";

/** The look of a link inside running text. For a link `InlineLink` cannot be, such as one off the site. */
export const inlineLinkClass = "text-link underline decoration-1 underline-offset-[0.15em] hover:text-ink";

const arrowClass =
  "type-ui text-link decoration-1 underline-offset-[0.15em] hover:text-ink hover:underline";

/** Link inside running text: --link with a 1px underline; --ink on hover. */
export function InlineLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={inlineLinkClass}>
      {children}
    </Link>
  );
}

/** Standalone action ("View source →"): no underline until hover. */
export function ArrowLink({
  href,
  back,
  children,
}: {
  href: string;
  /** Goes up a level: the page closes into the nav instead of opening. */
  back?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      transitionTypes={back ? ["nav-back"] : undefined}
      data-vt-back={back ? "" : undefined}
      className={arrowClass}
    >
      {children} <span aria-hidden>→</span>
    </Link>
  );
}

/** An action on the page that looks like an arrow link ("Try again →"). */
export function ArrowButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className={`cursor-pointer ${arrowClass}`}>
      {children} <span aria-hidden>→</span>
    </button>
  );
}
