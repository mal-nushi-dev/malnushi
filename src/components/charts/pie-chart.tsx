import { count, percent } from "./format";

export type Slice = { label: string; count: number };

const size = 200;
const radius = size / 2;

/** A point on the circle, with 0 at twelve o'clock and going clockwise. */
function point(turn: number) {
  const angle = turn * 2 * Math.PI;
  return `${(radius + radius * Math.sin(angle)).toFixed(2)} ${(radius - radius * Math.cos(angle)).toFixed(2)}`;
}

/**
 * How a whole divides. Each slice takes its color from its place in `order`,
 * not from its size, so a value is the same color in every pie it is in and
 * stays that color as the numbers change. The table beside the pie names
 * every slice and gives its number, so no slice is read by color alone.
 */
export function PieChart({
  title,
  slices,
  order,
  unit,
  note,
}: {
  title: string;
  slices: Slice[];
  /** Every value the pie could show, in the order they are cut and colored. */
  order: string[];
  /** What is counted, in the plural: "flights". */
  unit: string;
  /** A line under the table: what was left out. */
  note?: string;
}) {
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);
  const colorOf = (label: string) => `var(--chart-${(order.indexOf(label) % 6) + 1})`;
  // Each slice starts where the ones before it end.
  const cut = slices.map((slice, at) => {
    const before = slices.slice(0, at).reduce((sum, s) => sum + s.count, 0);
    const turn = (n: number) => (total === 0 ? 0 : n / total);
    return { ...slice, from: turn(before), to: turn(before + slice.count) };
  });
  return (
    <figure className="flex flex-col gap-(--space-md)">
      <figcaption className="type-label text-ink-2">{title}</figcaption>
      <div className="flex items-center gap-(--space-lg)">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="size-40 shrink-0"
          role="img"
          aria-label={`${title}: ${slices.map((s) => `${s.label} ${percent(s.count, total)}`).join(", ")}`}
        >
          {cut.map((slice) =>
            // An arc cannot close on itself: a slice that is everything is a circle.
            slice.to - slice.from >= 1 ? (
              <circle key={slice.label} cx={radius} cy={radius} r={radius} fill={colorOf(slice.label)}>
                <title>{`${slice.label}: ${count(slice.count)} ${unit}`}</title>
              </circle>
            ) : (
              <path
                key={slice.label}
                d={`M${radius} ${radius}L${point(slice.from)}A${radius} ${radius} 0 ${slice.to - slice.from > 0.5 ? 1 : 0} 1 ${point(slice.to)}Z`}
                fill={colorOf(slice.label)}
                // The gap between slices is the page showing through.
                stroke="var(--bg)"
                strokeWidth={2}
                strokeLinejoin="round"
              >
                <title>{`${slice.label}: ${count(slice.count)} ${unit} (${percent(slice.count, total)})`}</title>
              </path>
            ),
          )}
        </svg>
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">{title}</caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">{title}</th>
              <th scope="col">{unit}</th>
              <th scope="col">Share</th>
            </tr>
          </thead>
          <tbody>
            {slices.map((slice) => (
              <tr key={slice.label} className="border-b border-line">
                <th scope="row" className="py-2 pr-(--space-sm) font-normal type-ui text-ink">
                  <span
                    aria-hidden
                    className="mr-2 inline-block size-2.5 rounded-full"
                    style={{ background: colorOf(slice.label) }}
                  />
                  {slice.label}
                </th>
                <td className="py-2 pr-(--space-sm) text-right type-meta tabular-nums text-ink">
                  {count(slice.count)}
                </td>
                <td className="w-12 py-2 text-right type-meta tabular-nums text-ink-2">
                  {percent(slice.count, total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && <p className="type-small text-ink-2">{note}</p>}
    </figure>
  );
}
