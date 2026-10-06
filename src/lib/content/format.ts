import type { Entry, NoteEntry, PhotoData, TrackData } from "./schema";

/** Minutes to read a body, at 230 words a minute. */
export function readingTime(body: string) {
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

export function yearOf(date: string) {
  return Number(date.slice(0, 4));
}

export function dayOf(date: string) {
  return date.slice(0, 10);
}

/**
 * What a collection's column shows for an entry: its day, its title or one
 * of its facets.
 */
export function fieldOf(entry: Entry, key: string) {
  if (key === "date") return dayOf(entry.date);
  if (key === "title") return entry.title;
  return entry.facets[key];
}

/** Notes are written in Eastern time; any other offset is shown as it is. */
const zones: Record<string, string> = { "-04:00": "EDT", "-05:00": "EST" };

/**
 * A note's date line, in the time and zone where it was written, not the
 * reader's: `2026-10-03` and `2:12 PM EDT`.
 */
export function noteDateLine(date: NoteEntry["date"]) {
  const hour = Number(date.slice(11, 13));
  const offset = date.slice(-6);
  const clock = `${hour % 12 || 12}:${date.slice(14, 16)} ${hour < 12 ? "AM" : "PM"}`;
  return { day: dayOf(date), time: `${clock} ${zones[offset] ?? `UTC${offset}`}` };
}

/**
 * A photograph's EXIF caption: only the fields it has, in a fixed order
 * (focal length, aperture, shutter, ISO).
 */
export function exifLine(photo: PhotoData) {
  return [
    photo.focalLength && `${photo.focalLength}mm`,
    photo.aperture && `f/${photo.aperture}`,
    photo.shutter,
    photo.iso && `ISO ${photo.iso}`,
  ].filter((item): item is string => Boolean(item));
}

/**
 * A track's facts in a fixed order (duration, tempo, key): only the ones it
 * has.
 */
export function trackLine(track: TrackData) {
  return [track.duration, track.bpm && `${track.bpm} BPM`, track.key].filter(
    (item): item is string => Boolean(item),
  );
}
