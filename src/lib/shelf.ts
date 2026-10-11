/*
 * What the Collections shelf needs that is not drawing: a collection's
 * sentence with its number filled in, the groups it can be set in, and the
 * length of the tick that hints at its size. Nothing here knows about
 * entries or components.
 */

/** A run of a sentence. The number (and what it counts) is the loud run. */
export type SentencePart = { text: string; loud: boolean };

/** `1 bird`, `2 birds`. The noun is written once, in the singular. */
export function plural(noun: string, count: number) {
  return count === 1 ? noun : `${noun}s`;
}

const loudRun = /\{count\}(?: \{items\})?/;

/**
 * A collection's sentence with its tokens filled. `{count}` is the number of
 * rows and `{items}` the noun, plural unless there is one. The number, and
 * the noun straight after it, are the loud part. Without a sentence a
 * collection reads `128 recommendations.`
 */
export function sentenceParts(
  sentence: string | undefined,
  count: number,
  noun = "entry",
): SentencePart[] {
  const template = sentence ?? "{count} {items}.";
  const fill = (text: string) =>
    text
      .replaceAll("{items}", plural(noun, count))
      .replaceAll("{count}", count.toLocaleString("en-US"));
  const found = loudRun.exec(template);
  if (!found) return [{ text: fill(template), loud: false }];
  return [
    { text: fill(template.slice(0, found.index)), loud: false },
    { text: fill(found[0]), loud: true },
    { text: fill(template.slice(found.index + found[0].length)), loud: false },
  ].filter((part) => part.text !== "");
}

/** A sentence as plain text, for a screen reader. */
export function sentenceText(parts: SentencePart[]) {
  return parts.map((part) => part.text).join("");
}

export type Group<T> = {
  /** The category, or nothing for the collections that have none. */
  label?: string;
  items: T[];
};

/** By title, so nothing is ordered by hand. */
export function alphabetical<T extends { title: string }>(items: T[]) {
  return [...items].sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * The shelf in groups, one for each category in use. Groups are whatever the
 * collections say, alphabetical, with the collections that have no category
 * last. Within a group, by title.
 */
export function groupsOf<T extends { title: string; category?: string }>(items: T[]): Group<T>[] {
  const labelled = new Map<string, Group<T>>();
  const unlabelled: T[] = [];
  for (const item of alphabetical(items)) {
    const label = item.category?.trim();
    if (!label) {
      unlabelled.push(item);
      continue;
    }
    const key = label.toLowerCase();
    const group = labelled.get(key) ?? { label, items: [] };
    group.items.push(item);
    labelled.set(key, group);
  }
  const groups = [...labelled.values()].sort((a, b) => a.label!.localeCompare(b.label!));
  return unlabelled.length ? [...groups, { items: unlabelled }] : groups;
}

const shortest = 10;
const longest = 46;

/**
 * How long the tick above a spine's count is, in px: from `shortest` to
 * `longest` by the square root of its share of the largest collection, so a
 * collection ten times the size is about three times the length and the
 * shelf stays quiet.
 */
export function tickLength(count: number, largest: number) {
  if (largest <= 0 || count <= 0) return shortest;
  const share = Math.min(1, count / largest);
  return Math.round(shortest + (longest - shortest) * Math.sqrt(share));
}
