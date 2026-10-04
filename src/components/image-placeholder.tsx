import { cx } from "@/lib/site";

const sizes = {
  hero: { width: 1248, height: 640, label: "HERO" },
  column: { width: 680, height: 453, label: "COLUMN" },
} as const;

export type ImageSize = keyof typeof sizes;

/** Stand-in for a missing image: --line fill with a mono label. */
export function ImagePlaceholder({ size }: { size: ImageSize }) {
  const { width, height, label } = sizes[size];
  const text = `${label} — ${width} × ${height}`;
  return (
    <div
      role="img"
      aria-label={`Image placeholder, ${width} by ${height}`}
      className="flex w-full items-center justify-center rounded-(--radius-img) bg-line"
      style={{ maxWidth: width, aspectRatio: `${width} / ${height}` }}
    >
      <span className="type-meta text-ink-2">{text}</span>
    </div>
  );
}

/** Stand-in image at any aspect ratio; the class sets the ratio. */
export function ImageSlot({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <div
      role="img"
      aria-label={`Image placeholder, ${label}`}
      className={cx(
        "flex w-full items-center justify-center rounded-(--radius-img) bg-line",
        className,
      )}
    >
      <span className="type-meta text-ink-2">{label}</span>
    </div>
  );
}
