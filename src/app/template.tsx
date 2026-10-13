"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, ViewTransition } from "react";
import { trackOrigins } from "@/lib/page-origin";
import { runPageTransition } from "@/lib/page-transition";

/*
 * Keyed on the path, so a new page is a new element, and the page gets enter
 * and exit here, once, instead of in each page. (A template alone would not
 * do: it only remounts when the first segment changes, so an index to its
 * detail would not animate.) Filters live in the query string and do not
 * change the path, so they do not animate either.
 *
 * The motion is the nav's springs run by src/lib/page-transition.ts when the
 * browser's snapshots are ready, and drawn by the `page-*` and `vt-plate`
 * rules in globals.css. A page opens out of the nav plate, or out of a link
 * marked `data-vt-origin`; a link marked `back` closes the old page instead
 * (src/lib/page-origin.ts). Suspense reveals and refresh happen inside the
 * page and do not animate.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // The page on screen, for `trackOrigins`: a press arrives before the router
  // has changed the path.
  const current = useRef(pathname);
  useEffect(() => {
    current.current = pathname;
  }, [pathname]);
  useEffect(() => trackOrigins(() => current.current), []);
  return (
    <ViewTransition
      key={pathname}
      name="page"
      share={{ "nav-back": "page-close", default: "page-open" }}
      enter={{ "nav-back": "page-hold", default: "page-open" }}
      exit={{ "nav-back": "page-close", default: "page-hold" }}
      default="none"
      onShare={runPageTransition}
      onEnter={runPageTransition}
      onExit={runPageTransition}
    >
      {/*
        One element, so the page is one snapshot and one clip. It paints its
        own background: a snapshot has none of the body's, and a clear page
        would let the one beneath it show through.
      */}
      <div className="bg-bg">{children}</div>
    </ViewTransition>
  );
}
