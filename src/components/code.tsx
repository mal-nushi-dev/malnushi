/** A code sample in the reading column. No syntax colors yet. */
export function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="max-w-(--measure) overflow-x-auto rounded-(--radius-code) bg-code-bg p-(--space-lg) type-code text-code-fg">
      <code>{code}</code>
    </pre>
  );
}

/** Code inside running text. */
export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-(--radius-img) bg-surface px-1 py-px type-code text-ink">
      {children}
    </code>
  );
}
