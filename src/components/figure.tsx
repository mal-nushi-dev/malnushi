import { Caption } from "./caption";
import { ImagePlaceholder, type ImageSize } from "./image-placeholder";

const widths: Record<ImageSize, number> = { hero: 1248, column: 680 };

/** An image (or placeholder) with its caption 16px below. */
export function Figure({
  size,
  index,
  caption,
  exif,
  children,
}: {
  size: ImageSize;
  index: string;
  caption?: React.ReactNode;
  exif?: string[];
  /** The image. Defaults to a placeholder of the same size. */
  children?: React.ReactNode;
}) {
  return (
    <figure
      className="flex w-full flex-col gap-(--space-sm)"
      style={{ maxWidth: widths[size] }}
    >
      {children ?? <ImagePlaceholder size={size} />}
      <Caption index={index} exif={exif}>
        {caption}
      </Caption>
    </figure>
  );
}
