import Link from "next/link";
import { cx, sections, type Section } from "@/lib/site";

export function NavItem({
  href,
  active = false,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cx(
        "group flex flex-col gap-[6px] type-ui",
        active ? "text-ink" : "text-ink-2 hover:text-ink",
      )}
    >
      {children}
      {/* The 2px slot is always there so items don't shift when the active section changes. */}
      <span
        aria-hidden
        className={cx("block h-[2px] w-full", active && "bg-accent")}
      />
    </Link>
  );
}

/** Desktop bar: wordmark left, sections right, hairline below. */
export function Nav({ active }: { active?: Section }) {
  return (
    <header className="bg-bg">
      <div className="flex items-center justify-between px-(--gutter) py-(--space-lg)">
        <Link href="/" className="type-standfirst text-ink">
          Mal Nushi
        </Link>
        <nav aria-label="Sections">
          {/* 8px top padding (6px gap + 2px underline) centres the labels on the wordmark. */}
          <ul className="flex items-center gap-(--space-nav-item) pt-2">
            {sections.map((s) => (
              <li key={s.href}>
                <NavItem href={s.href} active={s.label === active}>
                  {s.label}
                </NavItem>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="h-px bg-line" />
    </header>
  );
}
