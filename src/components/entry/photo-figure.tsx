import type { StaticImageData } from "next/image";
import Link from "next/link";
import { Figure } from "@/components/figure";
import type { ImageSize } from "@/components/image-placeholder";
import { Photo } from "@/components/photo";
import { exifLine, type PhotoEntry } from "@/lib/content";

/*
 * The image file, imported so Next serves it under a hashed, cacheable URL
 * with a blurred stand-in. Its proportions come from the entry, which the
 * loader read from the same file, so the box is reserved before it loads (no
 * layout shift) wherever the photograph is shown. Naming the
 * extension keeps the photos' .yml files out of the bundle. The bundler
 * needs at least one file to match, which is why photographs are .jpg only
 * (src/lib/content/load.ts): add a format in both places together.
 */
export async function imageOf(photo: PhotoEntry): Promise<StaticImageData> {
  return (await import(`@content/photos/${photo.id}.jpg`)).default;
}

/** Landscape fills the content width and portrait the column. */
function sizeOf(photo: PhotoEntry): ImageSize {
  return photo.data.height > photo.data.width ? "column" : "hero";
}

/** A photograph from the archive, uncropped, at a figure size. */
export async function PhotoImage({
  photo,
  size,
  aboveTheFold,
}: {
  photo: PhotoEntry;
  /** By its proportions unless set: see `sizeOf`. */
  size?: ImageSize;
  aboveTheFold?: boolean;
}) {
  return (
    <Photo
      src={await imageOf(photo)}
      alt={photo.data.alt}
      size={size ?? sizeOf(photo)}
      aspect={photo.data}
      aboveTheFold={aboveTheFold}
      placeholder="blur"
    />
  );
}

/**
 * A photograph with its caption: a mono index, then the EXIF it has. The
 * image links to the photograph's own page.
 */
export function PhotoFigure({
  photo,
  index,
  size,
}: {
  photo: PhotoEntry;
  index: string;
  size?: ImageSize;
}) {
  const figureSize = size ?? sizeOf(photo);
  return (
    <Figure size={figureSize} index={index} exif={exifLine(photo.data)}>
      <Link href={photo.url}>
        <PhotoImage photo={photo} size={figureSize} />
      </Link>
    </Figure>
  );
}
