/** `ESSAY / BIRDING`: section, accent slash, sub-category. */
export function Eyebrow({
  section,
  category,
}: {
  section: string;
  category: string;
}) {
  return (
    <p className="flex items-center gap-2 type-label text-ink-2">
      <span>{section}</span>
      <span aria-hidden className="text-accent">
        /
      </span>
      <span className="sr-only">,</span>
      <span>{category}</span>
    </p>
  );
}
