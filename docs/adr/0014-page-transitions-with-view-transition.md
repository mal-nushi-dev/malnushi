# 0014. Page transitions with React's ViewTransition, and the nav in the layout

- **Status:** accepted
- **Date:** 2026-10-13

## Context

Page changes were an instant cut. `<Nav />` was rendered inside every page, so it was torn down and rebuilt with each navigation and could not be a fixed point for a transition. Mal wants a page transition built from the nav's own motion (design log, 2026-10-13).

## Decision

1. **Use React's `<ViewTransition>`**, which Next 16 supports in the App Router with no configuration, rather than an animation library that tracks mount and unmount. It needs no dependency. The browser animates snapshots, so the page is not re-rendered per frame.
2. **One wrapper, in `src/app/template.tsx`,** keyed on the pathname. A template alone remounts only when the first segment changes, so a key is what makes an index to its detail animate. Query-string changes (filters) do not change the path, so they do not animate. No page wraps itself.
3. **The nav is in `src/app/layout.tsx`** and is a layer of its own (`view-transition-name: site-nav`). Pages do not render it. Its active row comes from `sectionOf(pathname)`. It is a real 104px box in the flow, not a zero-height header with a spacer: a zero-height element has nothing to snapshot.
4. **The motion is JavaScript, on the nav's springs.** CSS `linear()` curves gave a mask on a clock, not a body with velocity (design log, 2026-10-13). `src/lib/page-transition.ts` runs three motion values on `springs` from `src/lib/motion.ts`, as the nav does, and writes the clip, a plate's box and its fade to `--vt-*` on the root every frame. The CSS only reads them. React calls it from `onShare`, `onEnter` and `onExit` when the browser's snapshots are ready; the engine keeps the transition alive with an animation on the group and ends it when the springs settle.
5. **Where a transition starts is set at the press.** `src/lib/page-origin.ts` listens for presses on `[data-vt-origin]` links and writes the link's box and corners to `--vt-from-*` on the root element; the keyframes read them with the nav plate as the `var()` fallback. It remembers the link by where it led, so a return to that page starts from the same box. A page needs only the attribute.
6. **Direction is a link type.** `ArrowLink` takes `back`, which sets `transitionTypes={["nav-back"]}`. Everything else opens.

## Things that went wrong on the way

- **A snapshot has no background.** The body's background is not captured, so the new page showed the old through it. The wrapper paints `bg-bg`.
- **The UA blends old and new with `plus-lighter`,** which adds two opaque pages to white. It is set back to normal.
- **The group morphs between the two pages' heights** by default, which stretched them. It is set to no animation.
- **A list of pseudo-element selectors with a class-only form was dropped whole** by the browser. They are written one rule each.
- **React's cleanup arrives at once.** With no CSS animation on the transition, React finds nothing to wait for and calls what the handler returned immediately. The engine ends itself and returns nothing that ends it.
- **`requestAnimationFrame` does not run in a tab that is not in front,** so a spring-driven transition does not advance there. Test with the tab fronted.
- **The plate is a named element the transition draws:** the pressed link itself (so its snapshot, text and all, is the plate's image), or a 1px `#vt-plate` in the layout when no spine is pressed. Two elements must never share the name; every press clears it first.
- **`exit: "none"` removes the old page's snapshot,** leaving a blank under the clip. The old page uses a class whose animation is `none` instead.

## Consequences

- The browser's back and forward buttons do not animate: React starts no view transition for a pop.
- A new page type gets the transition with no work. A link that goes up a level should be an `ArrowLink back`.
- Pages that hold a canvas (the maps, the three.js scenes) are snapshotted. Watch their first frame after a change of page.
- Dev only: a direct load of `/collections` can leave the shelf un-hydrated for long enough that a first press is a full page load. This is on the baseline too, and not caused by the transition.
- The e2e compression test ignores bodies under 1KB, since the template's chunk is 526 bytes and no server compresses that.
