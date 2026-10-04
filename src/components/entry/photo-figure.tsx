import type { StaticImageData } from "next/image";
import Link from "next/link";
import { Figure } from "@/components/figure";
import type { ImageSize } from "@/components/image-placeholder";
import { Photo } from "@/components/photo";
import { exifLine, type PhotoEntry } from "@/lib/content";

/*
 * The image file, imported so Next knows its size before it renders (no
 * layout shift) and serves it under a hashed, cacheable URL. Naming the
 * extension keeps the photos' .yml files out of the bundle. The bundler
 * needs at least one file to match, which is why photographs are .jpg only
 * (src/lib/content/load.ts): add a format in both places together.
 */
async function imageOf(photo: PhotoEntry): Promise<StaticImageData> {
  return (await import(`@content/photos/${photo.id}.jpg`)).default;
}

/** A photograph from the archive, uncropped, at a figure size. */
export async function PhotoImage({
  photo,
  size,
  aboveTheFold,
}: {
  photo: PhotoEntry;
  /** Landscape fills the content width and portrait the column, unless set. */
  size?: ImageSize;
  aboveTheFold?: boolean;
}) {
  const image = await imageOf(photo);
  return (
    <Photo
      src={image}
      alt={photo.data.alt}
      size={size ?? (image.height > image.width ? "column" : "hero")}
      aspect={image}
      aboveTheFold={aboveTheFold}
      placeholder="blur"
    />
  );
}

/**
 * A photograph with its caption: a mono index, then the EXIF it has. The
 * image links to the photograph's own page.
 */
export async function PhotoFigure({
  photo,
  index,
  size,
}: {
  photo: PhotoEntry;
  index: string;
  size?: ImageSize;
}) {
  const image = await imageOf(photo);
  const figureSize = size ?? (image.height > image.width ? "column" : "hero");
  return (
    <Figure size={figureSize} index={index} exif={exifLine(photo.data)}>
      <Link href={photo.url}>
        <PhotoImage photo={photo} size={figureSize} />
      </Link>
    </Figure>
  );
}
