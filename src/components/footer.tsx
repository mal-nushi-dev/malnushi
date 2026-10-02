import Link from "next/link";
import { sections } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-bg">
      <div className="h-px bg-line" />
      <div className="flex items-center justify-between px-(--gutter) py-(--space-xl) type-small text-ink-2">
        <p>
          © 2026 Mal Nushi&nbsp;&nbsp;·&nbsp;&nbsp;Made with{" "}
          {/* Text glyph, never emoji: force text presentation. */}
          <span className="[font-variant-emoji:text]" aria-label="love">
            ♥
          </span>{" "}
          in Charlotte
        </p>
        <nav aria-label="Footer">
          <ul className="flex items-center gap-(--space-md)">
            {sections.map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="hover:text-ink">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
