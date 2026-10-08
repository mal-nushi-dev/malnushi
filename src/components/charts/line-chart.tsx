import { axisTop, count } from "./format";

export type Point = { label: string; count: number };

const width = 520;
const height = 220;
// Room for the numbers up the side and the labels along the bottom.
const plot = { left: 36, right: 12, top: 16, bottom: 32 };
const steps = 4;

/**
 * One series over an ordered run of labels: years, months, days of the week.
 * The axis starts at nothing. Only the highest point is labelled; each dot
 * says its own number on hover, and the table under the chart, for a screen
 * reader, has them all.
 */
export function LineChart({
  title,
  points,
  unit,
  every = 1,
}: {
  title: string;
  points: Point[];
  /** What is counted, in the plural: "flights". */
  unit: string;
  /** Label every nth point along the bottom, for a long run of years. */
  every?: number;
}) {
  const top = axisTop(Math.max(...points.map((p) => p.count), 0), steps);
  const inner = { width: width - plot.left - plot.right, height: height - plot.top - plot.bottom };
  const x = (i: number) =>
    plot.left + (points.length <= 1 ? inner.width / 2 : (i / (points.length - 1)) * inner.width);
  const y = (value: number) => plot.top + inner.height - (value / top) * inner.height;
  const peak = points.reduce((best, p, i) => (p.count > points[best].count ? i : best), 0);
  return (
    <figure className="flex flex-col gap-(--space-md)">
      <figcaption className="type-label text-ink-2">{title}</figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={title}>
        {Array.from({ length: steps + 1 }, (_, i) => (top / steps) * i).map((tick) => (
          <g key={tick}>
            <line
              x1={plot.left}
              x2={width - plot.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke={tick === 0 ? "var(--ink-2)" : "var(--line)"}
              strokeWidth={1}
            />
            <text
              x={plot.left - 8}
              y={y(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              className="type-meta fill-ink-2 tabular-nums"
              style={{ fontSize: 11 }}
            >
              {count(tick)}
            </text>
          </g>
        ))}
        {points.map(
          (p, i) =>
            // The last label is always shown, so the run has both its ends.
            (i % every === 0 || i === points.length - 1) &&
            (i === points.length - 1 || points.length - 1 - i >= every) && (
              <text
                key={p.label}
                x={x(i)}
                y={height - 8}
                textAnchor="middle"
                className="type-meta fill-ink-2"
                style={{ fontSize: 11 }}
              >
                {p.label}
              </text>
            ),
        )}
        {points.length > 1 && (
          <polyline
            points={points.map((p, i) => `${x(i).toFixed(1)},${y(p.count).toFixed(1)}`).join(" ")}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {points.map((p, i) => (
          // A ring of the page around each dot keeps it clear of the line.
          <circle key={p.label} cx={x(i)} cy={y(p.count)} r={4} fill="var(--accent)" stroke="var(--bg)" strokeWidth={2}>
            <title>{`${p.label}: ${count(p.count)} ${unit}`}</title>
          </circle>
        ))}
        {points.length > 0 && (
          <text
            x={x(peak)}
            y={y(points[peak].count) - 10}
            textAnchor={peak === 0 ? "start" : peak === points.length - 1 ? "end" : "middle"}
            className="type-meta fill-ink tabular-nums"
            style={{ fontSize: 12 }}
          >
            {count(points[peak].count)}
          </text>
        )}
      </svg>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">{title}</th>
            <th scope="col">{unit}</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.label}>
              <th scope="row">{p.label}</th>
              <td>{p.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
