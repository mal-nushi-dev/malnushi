import { InlineLink } from "@/components/links";
import { NextLink } from "@/components/next-link";
import { Note } from "@/components/note";
import { content, dayOf, homes } from "@/lib/content";
import { EntryBody } from "./body";
import { ItemSummary } from "./item-summary";
import { categoryOf, noteComponents, titleOf, toNoteItem } from "./mappers";
import { PhotoFigure } from "./photo-figure";
import { TrackSummary } from "./track-summary";

/**
 * An embed inside a body that is itself embedded: a link to the entry, and
 * nothing more. See `Embed`.
 */
async function EmbedLink({ of }: { of: string }) {
  const entry = (await content()).get(of);
  if (!entry) throw new Error(`Embed: nothing in the content folder is named ${of}`);
  return <InlineLink href={entry.url}>{titleOf(entry)}</InlineLink>;
}

/** What an embedded body is made of: its own, with embeds as links. */
const shallow = { ...noteComponents, Embed: EmbedLink };

/**
 * Another entry, inside this one: `<Embed of="photo:2026-10-02-wren" />`.
 * Each kind is drawn as itself. The build fails on a ref that names nothing
 * (src/lib/content/load.ts), so an embed cannot be left dangling.
 *
 * Embeds are one level deep. Most kinds are drawn as a card, which shows no
 * body. Where a body is shown (a note), an embed inside it is drawn as a
 * link, never opened: two entries that embed each other cannot loop, and a
 * page holds only what its own text asked for. Today the loader also keeps
 * embeds out of a note altogether, since a .md body cannot draw one; the
 * link is what holds if a kind shown this way becomes .mdx.
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
          <Note
            note={{
              ...toNoteItem(entry),
              body: <EntryBody entry={entry} components={shallow} />,
            }}
          />
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
    case "flight":
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
