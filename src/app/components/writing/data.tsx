import type { IndexItem } from "@/components/index-list";
import { InlineLink } from "@/components/links";
import type { NoteItem } from "@/components/note";

// Sample content shared by the three Writing index mockups. Placeholder
// copy; links point at routes that are not built yet.

export type Article = IndexItem & {
  /** The standfirst. Only the lead shows it. */
  subtitle: string;
  date: string;
};

export type Issue = {
  href: string;
  issue: number;
  title: string;
  date: string;
};

export const articles: Article[] = [
  {
    href: "/writing/the-rise-of-gan",
    title: "The rise of GaN",
    category: "Technology",
    year: 2026,
    date: "2026-09-28",
    subtitle:
      "Gallium nitride made the charger smaller than the cable. What it does next is more interesting.",
  },
  {
    href: "/writing/can-you-rebrand-a-systemic-collapse",
    title: "Can you rebrand a systemic collapse?",
    category: "Politics",
    year: 2026,
    date: "2026-08-14",
    subtitle: "A new name is cheaper than a new system, and it shows.",
  },
  {
    href: "/writing/right-to-repair-part-2",
    title: "Right to repair, part 2: the parts pairing problem",
    category: "Technology",
    year: 2025,
    date: "2025-11-02",
    subtitle: "The screw is no longer what keeps you out of your own phone.",
  },
  {
    href: "/writing/exile-on-main-st",
    title: "Exile on Main St.",
    category: "Music",
    year: 2025,
    date: "2025-07-19",
    subtitle: "A murky record that only works because nobody cleaned it up.",
  },
  {
    href: "/writing/the-last-manual-gearbox",
    title: "The last manual gearbox",
    category: "Cars",
    year: 2025,
    date: "2025-03-08",
    subtitle: "On the third pedal, and what goes when it goes.",
  },
];

export const kernel: Issue[] = [
  { href: "/writing/the-kernel-12", issue: 12, title: "A clock that runs on gravity", date: "2026-09-30" },
  { href: "/writing/the-kernel-11", issue: 11, title: "Small web, big maps", date: "2026-09-16" },
  { href: "/writing/the-kernel-10", issue: 10, title: "The quietest keyboard", date: "2026-09-02" },
];

export const devJournal: Issue[] = [
  { href: "/writing/dev-journal-8", issue: 8, title: "Teaching a DNS filter to forget", date: "2026-09-24" },
  { href: "/writing/dev-journal-7", issue: 7, title: "Three rebuilds of one nav", date: "2026-09-10" },
  { href: "/writing/dev-journal-6", issue: 6, title: "The bug that only ran on Tuesdays", date: "2026-08-27" },
];

export const notes: NoteItem[] = [
  {
    id: "2026-10-03-1412",
    day: "2026-10-03",
    time: "2:12 PM EDT",
    body: "A Carolina wren has been shouting at the window since seven. Loudest bird per gram I know of.",
  },
  {
    id: "2026-10-03-0931",
    day: "2026-10-03",
    time: "9:31 AM EDT",
    body: (
      <>
        Spent the morning reading about tandem OLED. I wrote about where this
        was heading in{" "}
        <InlineLink href="/writing/we-need-to-talk-about-displays">
          the displays piece
        </InlineLink>
        ; it got here sooner than I guessed.
      </>
    ),
  },
  {
    id: "2026-10-01-2204",
    day: "2026-10-01",
    time: "10:04 PM EDT",
    body: "Every charger I own is now smaller than the cable that goes with it.",
  },
];
