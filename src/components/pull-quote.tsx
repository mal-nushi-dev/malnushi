/** Breaks the column rhythm: a 2px accent rule over a `quote` line. */
export function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="max-w-(--measure) border-t-2 border-accent pt-(--space-md) type-quote text-ink">
      {children}
    </blockquote>
  );
}
