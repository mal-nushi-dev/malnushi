"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cx, sections, type Section } from "@/lib/site";

type Mode = "idle" | "search" | "menu";

const ease = "ease-[cubic-bezier(0.16,1,0.3,1)]";

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const SearchIcon = () => (
  <Icon>
    <circle cx="9" cy="9" r="5.5" />
    <path d="M13.2 13.2 17 17" />
  </Icon>
);
const MenuIcon = () => (
  <Icon>
    <path d="M3 6.5h14M3 13.5h14" />
  </Icon>
);
const CloseIcon = () => (
  <Icon>
    <path d="M5 5l10 10M15 5L5 15" />
  </Icon>
);

const button =
  "flex size-14 flex-none items-center justify-center rounded-(--radius-img) text-ink-2 transition-colors duration-[600ms] hover:text-ink motion-reduce:transition-none";

/**
 * Floating toolbar. A sticky layer with no height of its own, a spacer that
 * holds the toolbar's height in the page flow, and two siblings inside the
 * layer: the row (search, wordmark, menu), fixed at 600 × 72px and never
 * resized, and the plate behind it. The plate carries the fill and shadow and
 * grows outward from the row (wider and downward) to reveal the search field
 * or the menu list, so nothing in the row is ever laid out again. It is clear
 * at the top of the page and filled once scrolled, or while expanded.
 */
export function Nav({ active }: { active?: Section }) {
  const [mode, setMode] = useState<Mode>("idle");
  const [scrolled, setScrolled] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const search = mode === "search";
  const menu = mode === "menu";
  const filled = scrolled || search || menu;

  useEffect(() => {
    if (!search) return;
    const t = setTimeout(() => input.current?.focus(), 120);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <>
      <header
        onKeyDown={(e) => e.key === "Escape" && setMode("idle")}
        className="pointer-events-none sticky top-0 z-50 h-0 bg-transparent"
      >
        <div
          data-nav-open={search || menu ? "" : undefined}
          className="relative flex justify-center pt-(--space-md)"
        >
          <div
            className={cx(
              "absolute top-(--space-md) left-1/2 -translate-x-1/2 overflow-hidden rounded-(--radius-img) transition-[width,height,background-color,box-shadow] duration-[600ms] motion-reduce:transition-none",
              ease,
              search || menu
                ? "pointer-events-auto w-[min(840px,calc(100vw-32px))]"
                : "w-[min(600px,calc(100vw-32px))]",
              menu ? "h-[416px]" : search ? "h-[144px]" : "h-[72px]",
              filled
                ? "bg-bg shadow-(--shadow-nav)"
                : "bg-transparent shadow-none",
            )}
          >
            <div
              className={cx(
                "absolute top-[72px] left-1/2 w-[min(840px,calc(100vw-32px))] -translate-x-1/2 px-2 transition-[opacity,visibility] duration-[350ms] motion-reduce:transition-none",
                search ? "opacity-100" : "invisible opacity-0",
              )}
            >
              <input
                ref={input}
                type="search"
                placeholder="Search the site"
                aria-label="Search the site"
                tabIndex={search ? 0 : -1}
                className="type-body h-14 w-full min-w-0 bg-transparent px-(--space-sm) text-ink outline-offset-0 placeholder:text-ink-2"
              />
            </div>
            <nav
              id="site-menu"
              aria-label="Sections"
              className={cx(
                "absolute top-[72px] left-1/2 w-[min(840px,calc(100vw-32px))] -translate-x-1/2 px-(--space-lg) pb-(--space-lg) pt-(--space-sm) transition-[opacity,visibility] duration-[350ms] motion-reduce:transition-none",
                menu ? "opacity-100" : "invisible opacity-0",
              )}
            >
              <ul>
                {sections.map((s, i) => (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      aria-current={s.label === active ? "page" : undefined}
                      onClick={() => setMode("idle")}
                      className="flex min-h-(--touch-target) items-center border-t border-line py-3 text-ink hover:text-link"
                    >
                      <span className="w-12 type-meta text-ink-2">
                        {String(i + 1).padStart(3, "0")}
                      </span>
                      <span
                        className={cx(
                          "type-index-title",
                          s.label === active &&
                            "underline decoration-2 decoration-accent underline-offset-[6px]",
                        )}
                      >
                        {s.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="pointer-events-auto relative flex h-[72px] w-[min(600px,calc(100vw-32px))] items-center px-2">
            <button
              type="button"
              className={button}
              aria-label={search ? "Close search" : "Search"}
              aria-expanded={search}
              onClick={() => setMode(search ? "idle" : "search")}
            >
              {search ? <CloseIcon /> : <SearchIcon />}
            </button>
            <div className="flex min-w-0 flex-1 justify-center">
              <Link
                href="/"
                className="type-index-title whitespace-nowrap text-ink transition-colors duration-[600ms] motion-reduce:transition-none"
              >
                Mal Nushi
              </Link>
            </div>
            <button
              type="button"
              className={button}
              aria-label={menu ? "Close menu" : "Open menu"}
              aria-expanded={menu}
              aria-controls="site-menu"
              onClick={() => setMode(menu ? "idle" : "menu")}
            >
              {menu ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>
      <div aria-hidden className="h-[104px]" />
    </>
  );
}
