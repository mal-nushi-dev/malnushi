"use client";

import { animate, motionValue } from "motion";
import Link from "next/link";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { cx, sections, type Section } from "@/lib/site";

type Mode = "idle" | "search" | "menu";

const REST = 72;
const height: Record<Mode, number> = { idle: REST, search: 144, menu: 416 };

/*
 * Springs. Opening overshoots a little and settles (width about 7%, height
 * about 5%); closing is close to critically damped so the bar lands still.
 */
export const spring = {
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

/*
 * Search to close, drawn as two paths whose nodes match one for one, so the
 * morph is a plain interpolation of coordinates. The lens is four cubic arcs
 * that straighten and pull apart into the "/" stroke of the X; the handle is
 * a line whose ends slide into the "\" stroke. Only `d` changes (no layout),
 * the stroke, caps and color stay on the parent svg.
 */
const K = 0.5523;
type Pt = [number, number];
const lens = (() => {
  const r = 5.5;
  const ang = (i: number) => ((-45 - 90 * i) * Math.PI) / 180;
  const at = (i: number): Pt => [9 + r * Math.cos(ang(i)), 9 + r * Math.sin(ang(i))];
  const circle: Pt[] = [at(0)];
  for (let i = 0; i < 4; i++) {
    const a0 = ang(i);
    const a1 = ang(i + 1);
    const p0 = at(i);
    const p1 = at(i + 1);
    circle.push(
      [p0[0] + K * r * Math.sin(a0), p0[1] - K * r * Math.cos(a0)],
      [p1[0] - K * r * Math.sin(a1), p1[1] + K * r * Math.cos(a1)],
      p1,
    );
  }
  const from: Pt = [15, 5];
  const to: Pt = [5, 15];
  const line: Pt[] = [from];
  for (let i = 0; i < 4; i++) {
    const lerp = (u: number): Pt => [
      from[0] + (to[0] - from[0]) * u,
      from[1] + (to[1] - from[1]) * u,
    ];
    line.push(lerp((i + 1 / 3) / 4), lerp((i + 2 / 3) / 4), lerp((i + 1) / 4));
  }
  return { circle, line };
})();
const f = (n: number) => n.toFixed(3);
const mix = (a: Pt[], b: Pt[], t: number) =>
  a.map((p, i): Pt => [p[0] + (b[i][0] - p[0]) * t, p[1] + (b[i][1] - p[1]) * t]);
const lensPath = (t: number) => {
  const q = mix(lens.circle, lens.line, t);
  let d = `M${f(q[0][0])} ${f(q[0][1])}`;
  for (let i = 1; i < q.length; i += 3) {
    d += `C${q.slice(i, i + 3).map((p) => `${f(p[0])} ${f(p[1])}`).join(" ")}`;
  }
  return d;
};
const handle = { from: [[13.2, 13.2], [17, 17]] as Pt[], to: [[15, 15], [5, 5]] as Pt[] };
const handlePath = (t: number) => {
  const [a, b] = mix(handle.from, handle.to, t);
  return `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
};

/* Drives a 0 to 1 morph value toward `open`, calling `write` on every change. */
function useMorph(open: boolean, write: (t: number) => void) {
  const [t] = useState(() => motionValue(open ? 1 : 0));
  const onChange = useEffectEvent(write);
  useEffect(() => {
    onChange(t.get());
    return t.on("change", onChange);
  }, [t]);
  useEffect(() => {
    const to = open ? 1 : 0;
    if (reducedMotion()) {
      t.jump(to);
      return;
    }
    // Retargets from the current value, so a mid-flight toggle reverses cleanly.
    const a = animate(t, to, { duration: 0.25, ease: [0.4, 0, 0.2, 1] });
    return () => a.stop();
  }, [open, t]);
}

function SearchIcon({ open }: { open: boolean }) {
  const lensEl = useRef<SVGPathElement>(null);
  const handleEl = useRef<SVGPathElement>(null);
  useMorph(open, (v) => {
    lensEl.current?.setAttribute("d", lensPath(v));
    handleEl.current?.setAttribute("d", handlePath(v));
  });
  return (
    <Icon>
      <path ref={lensEl} d={lensPath(open ? 1 : 0)} />
      <path ref={handleEl} d={handlePath(open ? 1 : 0)} />
    </Icon>
  );
}

/* Hamburger to close: each bar's two ends travel to an end of a diagonal. */
const bars: { from: Pt[]; to: Pt[] }[] = [
  { from: [[3, 6.5], [17, 6.5]], to: [[5, 5], [15, 15]] },
  { from: [[3, 13.5], [17, 13.5]], to: [[5, 15], [15, 5]] },
];
const barPath = (i: number, t: number) => {
  const [a, b] = mix(bars[i].from, bars[i].to, t);
  return `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
};

function MenuIcon({ open }: { open: boolean }) {
  const top = useRef<SVGPathElement>(null);
  const bottom = useRef<SVGPathElement>(null);
  useMorph(open, (v) => {
    top.current?.setAttribute("d", barPath(0, v));
    bottom.current?.setAttribute("d", barPath(1, v));
  });
  const t = open ? 1 : 0;
  return (
    <Icon>
      <path ref={top} d={barPath(0, t)} />
      <path ref={bottom} d={barPath(1, t)} />
    </Icon>
  );
}
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
  const header = useRef<HTMLElement>(null);
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

  // A press anywhere outside the toolbar and its plate closes the plate. The
  // search field is always mounted, so its text survives the close.
  const closeOnOutsidePress = useEffectEvent((e: PointerEvent) => {
    if (e.target instanceof Node && !header.current?.contains(e.target)) {
      go("idle");
    }
  });
  useEffect(() => {
    if (mode === "idle") return;
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [mode]);

  useEffect(() => {
    if (!search) return;
    // The field's opacity fade is delayed but its visibility is not, so it can
    // take focus here; a hidden element silently refuses focus.
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
        ref={header}
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
                search ? "opacity-100 [transition-delay:150ms,0s]" : "invisible opacity-0",
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
                menu ? "opacity-100 [transition-delay:150ms,0s]" : "invisible opacity-0",
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
              <SearchIcon open={search} />
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
              <MenuIcon open={menu} />
            </button>
          </div>
        </div>
      </header>
      <div aria-hidden className="h-26" />
    </>
  );
}
