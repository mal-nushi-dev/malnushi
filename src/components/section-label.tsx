/** A label over a 1px --ink rule. The rule separates the label from the list below. */
export function SectionLabel({
  as: Tag = "h2",
  children,
}: {
  as?: "h2" | "h3" | "p";
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-(--space-sm)">
      <Tag className="type-label text-ink-2">{children}</Tag>
      <div className="h-px bg-ink" />
    </div>
  );
}
