import { NextLink } from "@/components/next-link";
import { Note } from "@/components/note";
import { content, dayOf, homes } from "@/lib/content";
import { ItemSummary } from "./item-summary";
import { categoryOf, titleOf, toNoteItem } from "./mappers";
import { PhotoFigure } from "./photo-figure";
import { TrackSummary } from "./track-summary";

/**
 * Another entry, inside this one: `<Embed of="photo:2026-10-02-wren" />`.
 * Each kind is drawn as itself. The build fails on a ref that names nothing
 * (src/lib/content/load.ts), so an embed cannot be left dangling.
 */
export async function Embed({
  of,
  index,
}: {
  /** The entry's ref. */
  of: string;
  /** A figure number for a photograph. Defaults to the day it was taken. */
  index?: string;
}) {
  const q = await content();
  const entry = q.get(of);
  if (!entry) throw new Error(`Embed: nothing in the content folder is named ${of}`);
  switch (entry.kind) {
    case "photo":
      return <PhotoFigure photo={entry} index={index ?? dayOf(entry.date)} size="column" />;
    case "note":
      return (
        <div className="border-y border-line py-(--space-md)">
          <Note note={toNoteItem(entry)} />
        </div>
      );
    case "track":
      return (
        <div className="border-y border-line py-(--space-md)">
          <TrackSummary track={entry} />
        </div>
      );
    case "item":
    case "sighting":
    case "recommendation":
      return (
        <div className="border-y border-line py-(--space-md)">
          <ItemSummary
            item={entry}
            collection={q.need(
              "collection",
              entry.kind === "item" ? entry.data.collection : homes[entry.kind],
            )}
          />
        </div>
      );
    default:
      return <NextLink label={categoryOf(entry)} title={titleOf(entry)} href={entry.url} />;
  }
}
