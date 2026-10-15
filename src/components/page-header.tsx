import { Eyebrow } from "@/components/eyebrow";

/**
 * The top of an index or collection page: eyebrow, title, standfirst, then
 * any links. The page's only `h1`.
 */
export function PageHeader({
  eyebrow,
  title,
  standfirst,
  children,
}: {
  eyebrow?: React.ComponentProps<typeof Eyebrow>;
  title: React.ReactNode;
  standfirst?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="page flex flex-col gap-(--space-md) pt-(--space-header-top)">
      {eyebrow && <Eyebrow {...eyebrow} />}
      <h1 className="type-h1">{title}</h1>
      {standfirst && <p className="type-standfirst max-w-150 text-ink-2">{standfirst}</p>}
      {children}
    </header>
  );
}
