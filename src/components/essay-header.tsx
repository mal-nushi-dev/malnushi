import { Eyebrow } from "./eyebrow";
import { MetaItem, MetaRow } from "./meta-row";

/**
 * Top of a house essay: eyebrow, h1 and standfirst across 7 columns,
 * then the meta row across the full content width.
 */
export function EssayHeader({
  category,
  title,
  standfirst,
  date,
  readingTime,
  tags = [],
}: {
  category: string;
  title: string;
  standfirst: string;
  /** ISO date, e.g. "2026-09-28". */
  date: string;
  /** Minutes. */
  readingTime: number;
  tags?: string[];
}) {
  return (
    <header className="flex flex-col gap-(--space-xl)">
      <div className="flex max-w-[718px] flex-col gap-(--space-md)">
        <Eyebrow section="Essay" category={category} />
        <h1 className="type-h1 text-ink">{title}</h1>
        <p className="type-standfirst text-ink-2">{standfirst}</p>
      </div>
      <MetaRow>
        <MetaItem>
          <time dateTime={date}>{date}</time>
        </MetaItem>
        <MetaItem>{readingTime} min read</MetaItem>
        {tags.map((t) => (
          <MetaItem key={t}>{t}</MetaItem>
        ))}
      </MetaRow>
    </header>
  );
}
