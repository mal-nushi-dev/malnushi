export type Spec = {
  year: number | string;
  role: string;
  medium: string;
  /** Code projects have a stack, hardware and Lego projects have materials. */
  stack?: string[];
  materials?: string[];
  status: string;
};

function Row({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-(--col-gap) border-b border-line py-(--space-sm) last:border-b-0">
      <dt className="w-24 shrink-0 pt-0.5 type-label text-ink-2">{term}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}

/** Project facts in columns 9–12: a 1px --ink rule, then key/value rows. */
export function SpecBlock({ spec }: { spec: Spec }) {
  const list = spec.stack ?? spec.materials;
  return (
    <dl className="max-w-100 border-t border-ink">
      <Row term="Year">
        <span className="type-meta">{spec.year}</span>
      </Row>
      <Row term="Role">
        <span className="type-ui">{spec.role}</span>
      </Row>
      <Row term="Medium">
        <span className="type-ui">{spec.medium}</span>
      </Row>
      {list && (
        <Row term={spec.stack ? "Stack" : "Materials"}>
          <span className="type-meta">{list.join(", ")}</span>
        </Row>
      )}
      <Row term="Status">
        <span className="flex items-center gap-2 type-ui">
          <span aria-hidden className="size-2 rounded-full bg-accent" />
          {spec.status}
        </span>
      </Row>
    </dl>
  );
}
