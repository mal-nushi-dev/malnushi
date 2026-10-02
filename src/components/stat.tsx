/** A big serif number over a 1px --ink rule, with a label below. */
export function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col gap-(--space-sm) border-t border-ink pt-(--space-sm)">
      <span className="type-stat text-ink">{value}</span>
      <span className="type-label text-ink-2">{label}</span>
    </div>
  );
}

/** Two or three stats stacked in columns 9–12 of a collection page. */
export function Stats({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex max-w-[400px] flex-col gap-(--space-lg)">{children}</div>
  );
}
