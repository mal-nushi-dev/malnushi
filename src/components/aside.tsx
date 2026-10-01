/** Margin note or footnote in the 294px column beside the reading column. */
export function Aside({
  marker,
  children,
}: {
  marker?: string;
  children: React.ReactNode;
}) {
  return (
    <aside className="flex max-w-[294px] gap-(--space-sm)">
      {marker && <span className="type-meta text-ink">{marker}</span>}
      <p className="type-small text-ink-2">{children}</p>
    </aside>
  );
}
