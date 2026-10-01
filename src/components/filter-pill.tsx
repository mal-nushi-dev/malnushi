import { cx } from "@/lib/site";

/** Toggle button for collection filters. Active = ink fill. */
export function FilterPill({
  active = false,
  children,
  ...props
}: {
  active?: boolean;
  children: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cx(
        "inline-flex h-(--pill-height) items-center justify-center rounded-full border px-(--space-md) type-small focus-visible:rounded-full",
        active
          ? "border-ink bg-ink text-bg"
          : "border-line text-ink hover:border-ink-2",
      )}
      {...props}
    >
      {children}
    </button>
  );
}
