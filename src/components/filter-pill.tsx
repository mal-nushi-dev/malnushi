import { cx } from "@/lib/site";

const sizes = {
  md: "h-(--pill-height) px-(--space-md) type-small",
  /**
   * 32px tall, for a row of filters that sits quietly over a gallery. Under
   * the 44px touch target: revisit with the mobile layout.
   */
  sm: "h-(--pill-height-sm) px-(--space-sm) type-small",
} as const;

export type FilterPillSize = keyof typeof sizes;

/** Toggle button for filters. Active = ink fill. */
export function FilterPill({
  active = false,
  size = "md",
  children,
  ...props
}: {
  active?: boolean;
  size?: FilterPillSize;
  children: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cx(
        "inline-flex items-center justify-center rounded-full border focus-visible:rounded-full",
        sizes[size],
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
