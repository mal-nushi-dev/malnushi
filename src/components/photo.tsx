import Image, { type ImageProps } from "next/image";
import type { ImageSize } from "./image-placeholder";

/*
 * Both sizes fill the content column (1248px, or the viewport minus the 96px
 * gutters when narrower); the column size stops at 680px. `sizes` tells the
 * browser which width to pick from the srcset, so it never downloads the
 * hero for a column image.
 */
const sizes = {
  hero: { width: 1248, height: 640, sizes: "min(1248px, calc(100vw - 192px))" },
  column: { width: 680, height: 453, sizes: "min(680px, calc(100vw - 192px))" },
} as const;

/**
 * A real image at one of the two figure sizes, replacing `ImagePlaceholder`.
 * Width, height and `sizes` come from the size, so the box is reserved before
 * the image loads (no layout shift) and the right file is chosen.
 *
 * Images load lazily. Set `aboveTheFold` on the one image that can be the
 * first screen's largest element: it loads eagerly at high priority.
 */
export function Photo({
  size,
  alt,
  aboveTheFold = false,
  ...props
}: {
  size: ImageSize;
  /** Required. Use `""` only for a purely decorative image. */
  alt: string;
  aboveTheFold?: boolean;
} & Omit<ImageProps, "alt" | "width" | "height" | "sizes" | "fill">) {
  const { width, height, sizes: sizesAttr } = sizes[size];
  return (
    <Image
      {...props}
      alt={alt}
      width={width}
      height={height}
      sizes={sizesAttr}
      loading={aboveTheFold ? "eager" : "lazy"}
      fetchPriority={aboveTheFold ? "high" : "auto"}
      className="h-auto w-full rounded-(--radius-img)"
      style={{ maxWidth: width, aspectRatio: `${width} / ${height}` }}
    />
  );
}
