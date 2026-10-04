import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

/** Full page for a state the visitor did not choose: not found, error. */
export function StatusPage({
  label,
  title,
  children,
  actions,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
  actions: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="page pt-(--space-header-top) pb-(--space-block)">
        <div className="flex max-w-175 flex-col gap-(--space-xl)">
          <p className="type-label text-ink-2">{label}</p>
          <h1 className="type-h1">{title}</h1>
          <p className="type-standfirst text-ink-2">{children}</p>
          <div className="flex items-center gap-(--space-lg)">{actions}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
