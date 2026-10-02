/** A 1px --ink rule over mono items: date, reading time, tags. */
export function MetaRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-ink pt-(--space-sm)">
      <ul className="flex items-center gap-(--space-meta-item) type-meta text-ink-2">
        {children}
      </ul>
    </div>
  );
}

export function MetaItem({ children }: { children: React.ReactNode }) {
  return <li>{children}</li>;
}
