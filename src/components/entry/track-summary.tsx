import Link from "next/link";
import { trackLine, type TrackEntry } from "@/lib/content";

/**
 * One track, away from its own page: a label, its title and its duration,
 * tempo and key. The whole block links to the track.
 */
export function TrackSummary({
  track,
  label = "Track",
}: {
  track: TrackEntry;
  label?: string;
}) {
  return (
    <Link href={track.url} className="group flex flex-col gap-(--space-sm)">
      <p className="type-label text-ink-2">{label}</p>
      <p className="type-index-title text-ink group-hover:text-link">{track.data.title}</p>
      <p className="type-meta text-ink-2">{trackLine(track.data).join(" · ")}</p>
    </Link>
  );
}
