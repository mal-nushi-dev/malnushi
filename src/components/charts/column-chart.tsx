export type Column = {
  label: string;
  value: number;
  /** A line under the label: the life total at the year's end. */
  note?: string;
};

const width = 1248;
const height = 240;
const base = 176;
const tallest = 140;

/**
 * Values in columns, left to right: a year to a column. A server component
 * that draws SVG, as the other charts do. Each value is printed over its
 * column, so no column is read by its height alone.
 */
export function ColumnChart({ label, columns }: { label: string; columns: Column[] }) {
  const most = Math.max(1, ...columns.map((c) => c.value));
  const slot = width / Math.max(columns.length, 1);
  const bar = Math.min(88, slot * 0.6);
  return (
    <svg
      role="img"
      aria-label={`${label}: ${columns.map((c) => `${c.label} ${c.value}`).join(", ")}`}
      viewBox={`0 0 ${width} ${height}`}
      className="block h-auto w-full"
    >
      <line x1={0} x2={width} y1={base} y2={base} className="stroke-line" />
      {columns.map((c, i) => {
        const h = c.value === 0 ? 0 : Math.max(2, (c.value / most) * tallest);
        const x = i * slot + slot / 2;
        return (
          <g key={c.label}>
            <rect x={x - bar / 2} y={base - h} width={bar} height={h} rx={2} className="fill-accent" />
            <text x={x} y={base - h - 8} textAnchor="middle" className="fill-ink type-meta">
              {c.value}
            </text>
            <text x={x} y={base + 24} textAnchor="middle" className="fill-ink-2 type-meta">
              {c.label}
            </text>
            {c.note && (
              <text x={x} y={base + 46} textAnchor="middle" className="fill-ink-2 type-meta">
                {c.note}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
