import Image from "next/image";
import { ImageSlot } from "@/components/image-placeholder";
import type { TileSize } from "@/components/tile";
import type { PhotoEntry } from "@/lib/content";
import { imageOf } from "./photo-figure";

/*
 * How wide a tile is drawn, so the browser picks a file no larger than it
 * needs: one or two of the grid's four columns, inside the page's gutters.
 */
const sizes: Record<TileSize, string> = {
  square: "min(309px, calc((100vw - 192px) / 4))",
  tall: "min(309px, calc((100vw - 192px) / 4))",
  wide: "min(622px, calc((100vw - 192px) / 2))",
  large: "min(622px, calc((100vw - 192px) / 2))",
};

/**
 * A tile's cover: the photograph, cropped to fill the tile, or a placeholder
 * that names the piece when it has none.
 *
 * The photograph is decorative here (`alt=""`): the tile is a link named by
 * its title, and the photograph's own description belongs to its own page.
 */
export async function TileCover({
  photo,
  title,
  size = "square",
}: {
  photo?: PhotoEntry;
  /** Shown on the placeholder. */
  title: string;
  size?: TileSize;
}) {
  if (!photo) return <ImageSlot label={title} className="size-full p-(--space-sm) text-center" />;
  return (
    <Image
      src={await imageOf(photo)}
      alt=""
      // Its own proportions, so the box is known before it loads; the tile
      // crops it.
      width={photo.data.width}
      height={photo.data.height}
      sizes={sizes[size]}
      placeholder="blur"
      className="size-full object-cover"
    />
  );
}
