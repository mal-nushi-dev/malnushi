"use client";

import { useId, useRef, useState } from "react";
import { cx } from "@/lib/site";

export type Tab = {
  label: string;
  /** Rendered on the server and handed over whole: see ADR 0009. */
  panel: React.ReactNode;
};

/**
 * Two or more views of one thing, one shown at a time: a ranking by flights
 * or by distance. The left and right arrows move between the tabs, and Home
 * and End go to the first and last. Every panel is in the page from the
 * start, so switching fetches nothing.
 */
export function Tabs({ label, tabs }: { label: string; tabs: Tab[] }) {
  const id = useId();
  const [selected, setSelected] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: React.KeyboardEvent) {
    const last = tabs.length - 1;
    const to = {
      ArrowRight: selected === last ? 0 : selected + 1,
      ArrowLeft: selected === 0 ? last : selected - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (to === undefined) return;
    event.preventDefault();
    setSelected(to);
    buttons.current[to]?.focus();
  }

  return (
    <div className="flex flex-col gap-(--space-sm)">
      <div role="tablist" aria-label={label} className="flex gap-(--space-md)" onKeyDown={onKeyDown}>
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            ref={(node) => {
              buttons.current[i] = node;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={i === selected}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={i === selected ? 0 : -1}
            onClick={() => setSelected(i)}
            className={cx(
              "border-b-2 pb-1 type-small",
              i === selected ? "border-accent text-ink" : "border-transparent text-ink-2 hover:text-ink",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.label}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={i !== selected}
        >
          {tab.panel}
        </div>
      ))}
    </div>
  );
}
