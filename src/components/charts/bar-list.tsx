export type Bar = {
  label: string;
  /** A second, quieter name: an airport's city beside its code. */
  detail?: string;
  value: number;
  /** The value as it is read: "70" or "133,364 km". */
  shown: string;
};

/**
 * A ranking, longest bar first: a name, a bar and its number in each row.
 * Every bar is measured against the longest. It is a list, so it reads in
 * order without the bars.
 */
export function BarList({ label, bars }: { label: string; bars: Bar[] }) {
  const longest = Math.max(...bars.map((bar) => bar.value), 0);
  return (
    <ol aria-label={label} className="flex flex-col">
      {bars.map((bar) => (
        <li
          key={bar.label}
          className="grid grid-cols-[minmax(0,5fr)_minmax(0,6fr)_auto] items-center gap-(--space-sm) border-b border-line py-2.5"
        >
          <span className="truncate type-ui text-ink">
            {bar.label}
            {bar.detail && <span className="text-ink-2"> {bar.detail}</span>}
          </span>
          <span aria-hidden className="block h-2">
            <span
              className="block h-full min-w-0.5 rounded-r-sm bg-accent"
              style={{ width: `${longest === 0 ? 0 : (bar.value / longest) * 100}%` }}
            />
          </span>
          <span className="min-w-20 text-right type-meta tabular-nums text-ink">{bar.shown}</span>
        </li>
      ))}
    </ol>
  );
}
