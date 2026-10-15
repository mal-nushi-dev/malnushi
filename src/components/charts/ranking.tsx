import { count } from "@/lib/format";
import { BarList, type Bar } from "./bar-list";
import { Tabs } from "@/components/tabs";

export type Measure = {
  /** How it is ranked, as its tab reads: "By flights". */
  label: string;
  bars: Bar[];
};

/**
 * A ranking under its heading. With one measure it is a bar list; with more,
 * tabs switch between them. The lists and tabs are named from `subject`:
 * "Airports by flights", "Rank airports by".
 */
export function Ranking({
  heading,
  subject,
  measures,
  wrap,
  children,
}: {
  heading: React.ReactNode;
  /** What is ranked, plural and capitalized: "Airports". */
  subject: string;
  measures: Measure[];
  wrap?: boolean;
  /** A note under the list. */
  children?: React.ReactNode;
}) {
  const list = (m: Measure) => (
    <BarList wrap={wrap} label={`${subject} ${m.label.toLowerCase()}`} bars={m.bars} />
  );
  return (
    <section className="flex flex-col gap-(--space-md)">
      {heading}
      {measures.length === 1 ? (
        list(measures[0])
      ) : (
        <Tabs
          label={`Rank ${subject.toLowerCase()} by`}
          tabs={measures.map((m) => ({ label: m.label, panel: list(m) }))}
        />
      )}
      {children}
    </section>
  );
}

/** A ranking's name, and how many different ones there are: the bars show only the top of it. */
export function RankingTitle({ title, total }: { title: string; total: number }) {
  return (
    <h3 className="flex items-baseline justify-between type-label text-ink-2">
      {title}
      <span className="tabular-nums text-ink">
        {count(total)} <span className="sr-only">in all</span>
      </span>
    </h3>
  );
}
