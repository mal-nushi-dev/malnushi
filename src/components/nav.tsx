"use client";

import { animate, motionValue } from "motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cx, sections, type Section } from "@/lib/site";

type Mode = "idle" | "search" | "menu";

const REST = 72;
const height: Record<Mode, number> = { idle: REST, search: 144, menu: 416 };

/*
 * Springs. Opening overshoots a little and settles (width about 7%, height
 * about 5%); closing is close to critically damped so the bar lands still.
 */
const spring = {
  width: { type: "spring", stiffness: 260, damping: 21, mass: 1 },
  height: { type: "spring", stiffness: 220, damping: 21, mass: 1 },
  close: { type: "spring", stiffness: 320, damping: 34, mass: 1 },
} as const;

/* The second phase starts once the first has covered this much of its travel. */
const OVERLAP = 0.8;
/* Most the bar thins while its width is moving, in px. */
const SQUASH = 4;

/* At or under this width the plate is already full width and cannot widen. */
const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isNarrow = () => window.matchMedia("(max-width: 632px)").matches;

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
  "flex size-14 flex-none cursor-pointer items-center justify-center rounded-(--radius-img) text-ink-2 transition-colors duration-300 hover:text-ink motion-reduce:transition-none";

/**
 * Floating toolbar. A sticky layer with no height of its own, a spacer that
 * holds the toolbar's height in the page flow, and two siblings inside the
 * layer: the row (search, wordmark, menu), fixed at 600 × 72px and never
 * resized, and the plate behind it. The plate carries the fill and shadow and
 * grows outward from the row to reveal the search field or the menu list, so
 * nothing in the row is ever laid out again. It is clear at the top of the
 * page and filled once scrolled, or while expanded.
 *
 * The plate opens in two phases on springs: it widens about its center, then
 * drops open just before the width settles. Closing runs the other way, and
 * the open color is held until the plate starts to narrow, as it arrived. Two
 * motion values drive it, written to the plate as CSS variables (`--p`, width
 * progress 0 to 1, and `--h`, height in px), so no frame re-renders React.
 * See docs/adr/0001-spring-animation-with-motion.md.
 */
export function Nav({ active }: { active?: Section }) {
  const [mode, setMode] = useState<Mode>("idle");
  const [scrolled, setScrolled] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const searchButton = useRef<HTMLButtonElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [p] = useState(() => motionValue(0));
  const [h] = useState(() => motionValue(REST));
  const search = mode === "search";
  const menu = mode === "menu";
  // Holds the open color through a close, until the plate starts to narrow.
  const [held, setHeld] = useState(false);
  const tinted = search || menu || held;
  const filled = scrolled || tinted;

  const go = (next: Mode) => {
    // Focus inside the plate is about to be hidden; hand it back to the toggle.
    if (next === "idle" && plate.current?.contains(document.activeElement)) {
      (search ? searchButton : menuButton).current?.focus({
        preventScroll: true,
      });
    }
    setMode(next);
    setHeld(next === "idle" && !reducedMotion() && h.get() > REST + 1);
  };

  useEffect(() => {
    if (!search) return;
    // preventScroll: focusing while the plate is still short would otherwise
    // scroll its clipped overflow and leave the field stuck over the row.
    const t = setTimeout(() => {
      input.current?.focus({ preventScroll: true });
      if (plate.current) plate.current.scrollTop = 0;
    }, 120);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const el = plate.current;
    if (!el) return;
    const write = () => {
      const squash = isNarrow()
        ? 0
        : Math.min(SQUASH, Math.abs(p.getVelocity()) * 0.5);
      el.style.setProperty("--p", String(p.get()));
      el.style.setProperty("--h", `${h.get()}px`);
      el.style.setProperty("--s", `${squash}px`);
    };
    const offP = p.on("change", write);
    const offH = h.on("change", write);
    const offEnd = p.on("animationComplete", () =>
      el.style.setProperty("--s", "0px"),
    );
    return () => {
      offP();
      offH();
      offEnd();
      p.stop();
      h.stop();
    };
  }, [p, h]);

  useEffect(() => {
    const open = mode !== "idle";
    if (reducedMotion()) {
      p.jump(open ? 1 : 0);
      h.jump(height[mode]);
      return;
    }
    // A running spring is retargeted, not restarted, so it keeps its velocity.
    const lead = open ? p : h;
    const from = lead.get();
    const to = open ? 1 : REST;
    const second = () =>
      open
        ? animate(h, height[mode], spring.height)
        : animate(p, 0, spring.close);
    animate(lead, to, open ? spring.width : spring.close);
    const done = (v: number) =>
      Math.abs(v - from) >= Math.abs(to - from) * OVERLAP;
    if ((open && isNarrow()) || done(from)) {
      second();
      return;
    }
    const off = lead.on("change", (v) => {
      if (!done(v)) return;
      off();
      second();
      setHeld(false);
    });
    return off;
  }, [mode, p, h]);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <>
      <header
        onKeyDown={(e) => e.key === "Escape" && go("idle")}
        className="pointer-events-none sticky top-0 z-50 h-0 bg-transparent"
      >
        <div
          data-nav-open={tinted ? "" : undefined}
          className="relative flex justify-center pt-(--space-md)"
        >
          <div
            ref={plate}
            className={cx(
              "absolute top-(--space-md) left-1/2 -translate-x-1/2 overflow-hidden contain-layout contain-paint transition-[background-color,box-shadow] duration-300 motion-reduce:transition-none",
              "[--h:72px] [--p:0] [--s:0px] [--w0:min(600px,calc(100vw-32px))] [--w1:min(840px,calc(100vw-32px))]",
              "mt-[calc(var(--s)/2)] h-[calc(var(--h)-var(--s))] w-[calc(var(--w0)+(var(--w1)-var(--w0))*var(--p))] rounded-[calc(var(--radius-nav)+(var(--radius-nav-open)-var(--radius-nav))*var(--p))]",
              (search || menu) && "pointer-events-auto",
              filled
                ? "bg-bg shadow-(--shadow-nav)"
                : "bg-transparent shadow-none",
            )}
          >
            <div
              className={cx(
                "absolute top-18 left-1/2 w-[min(840px,calc(100vw-32px))] -translate-x-1/2 px-2 transition-[opacity,visibility] duration-350 motion-reduce:transition-none",
                search ? "opacity-100 delay-150" : "invisible opacity-0",
              )}
            >
              <input
                ref={input}
                type="search"
                placeholder="Search the site"
                aria-label="Search the site"
                tabIndex={search ? 0 : -1}
                className="type-index-title h-18 w-full min-w-0 bg-transparent px-(--space-lg) text-center text-[40px] leading-none text-ink outline-none placeholder:text-ink-2 [&::-webkit-search-cancel-button]:hidden"
              />
            </div>
            <nav
              id="site-menu"
              aria-label="Sections"
              className={cx(
                "absolute top-18 left-1/2 w-[min(840px,calc(100vw-32px))] -translate-x-1/2 px-(--space-lg) pb-(--space-lg) pt-(--space-sm) transition-[opacity,visibility] duration-350 motion-reduce:transition-none",
                menu ? "opacity-100 delay-150" : "invisible opacity-0",
              )}
            >
              <ul>
                {sections.map((s, i) => (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      aria-current={s.label === active ? "page" : undefined}
                      onClick={() => go("idle")}
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
          <div className="pointer-events-auto relative flex h-18 w-[min(600px,calc(100vw-32px))] items-center px-2">
            <button
              ref={searchButton}
              type="button"
              className={button}
              aria-label={search ? "Close search" : "Search"}
              aria-expanded={search}
              onClick={() => go(search ? "idle" : "search")}
            >
              {search ? <CloseIcon /> : <SearchIcon />}
            </button>
            <div className="flex min-w-0 flex-1 justify-center">
              <Link
                href="/"
                onClick={() => go("idle")}
                className="type-index-title whitespace-nowrap text-ink transition-colors duration-300 motion-reduce:transition-none"
              >
                Mal Nushi
              </Link>
            </div>
            <button
              ref={menuButton}
              type="button"
              className={button}
              aria-label={menu ? "Close menu" : "Open menu"}
              aria-expanded={menu}
              aria-controls="site-menu"
              onClick={() => go(menu ? "idle" : "menu")}
            >
              {menu ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>
      <div aria-hidden className="h-26" />
    </>
  );
}
