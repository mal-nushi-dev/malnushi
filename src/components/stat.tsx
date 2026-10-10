/**
 * What a stat is made of: the number, what it counts, and optionally the
 * parts the number is made of (`StatPart`s in a row under the label). `Stat`
 * and `StatCard` differ only in what they draw around it.
 */
function StatBody({
  value,
  label,
  children,
}: {
  value: string | number;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <span className="type-stat text-ink">{value}</span>
      <span className="type-label text-ink-2">{label}</span>
      {children && <div className="flex flex-wrap gap-x-(--space-lg) gap-y-1">{children}</div>}
    </>
  );
}

/**
 * A big serif number over a 1px --ink rule, with a label below. Its children
 * are the parts the number is made of, as `StatPart`s in a row under the label.
 */
export function Stat({
  value,
  label,
  children,
}: {
  value: string | number;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-(--space-sm) border-t border-ink pt-(--space-sm)">
      <StatBody value={value} label={label}>
        {children}
      </StatBody>
    </div>
  );
}

/**
 * A stat on a `surface` plate, 3:2, for a number that earns a picture. The
 * picture is `backdrop`: it fills the plate behind the text, is decoration
 * and is hidden from screen readers, so the number and its label are the
 * card's whole content.
 */
export function StatCard({
  value,
  label,
  backdrop,
  children,
}: {
  value: string | number;
  label: string;
  backdrop?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative aspect-[3/2] overflow-hidden rounded-(--radius-img) bg-surface p-(--space-lg)">
      {backdrop && (
        <div aria-hidden className="absolute inset-0 *:size-full">
          {backdrop}
        </div>
      )}
      <div className="relative flex flex-col gap-(--space-sm)">
        <StatBody value={value} label={label}>
          {children}
        </StatBody>
      </div>
    </div>
  );
}

/** One part of a stat's number: 73 of the 123 flights were domestic. */
export function StatPart({ value, label }: { value: string | number; label: string }) {
  return (
    <span className="flex items-baseline gap-2">
      <span className="type-ui tabular-nums text-ink">{value}</span>
      <span className="type-label text-ink-2">{label}</span>
    </span>
  );
}

/** Two or three stats stacked in columns 9–12 of a collection page. */
export function Stats({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex max-w-100 flex-col gap-(--space-lg)">{children}</div>
  );
}
