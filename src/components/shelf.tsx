"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { FilterPill } from "@/components/filter-pill";
import { Spine, type SpineProps } from "@/components/spine";
import { alphabetical, groupsOf, tickLength } from "@/lib/shelf";

/*
 * The Collections shelf: every collection as a spine on one line the width
 * of the page. Closed spines share it, up to 128px each; the one that is
 * open takes room from the rest, so the shelf never changes size. "By
 * category" sets the same spines in labelled clusters on the same line.
 */

/** A collection as the shelf takes it. `index` and `tick` are worked out here. */
export type ShelfItem = Omit<SpineProps, "index" | "tick" | "level"> & { id: string };

type ShelfProps = {
  items: ShelfItem[];
  grouped?: boolean;
  onGroupedChange?: (grouped: boolean) => void;
};

export function Shelf({ items, grouped = false, onGroupedChange }: ShelfProps) {
  const ordered = alphabetical(items);
  const largest = Math.max(0, ...ordered.map((item) => item.count));
  const place = new Map(ordered.map((item, i) => [item.id, i + 1]));
  const spine = (item: ShelfItem, level: 2 | 3) => (
    <li
      key={item.id}
      // A closed spine is 72 to 128px wide; open, up to 436 (a 96px strip
      // and a 340px body). Written out: Tailwind reads whole class names.
      className="h-full min-w-18 max-w-32 grow basis-0 transition-[flex-grow,max-width] duration-350 ease-spring-close spine-open:max-w-109 spine-open:grow-[5.2] spine-open:duration-600 spine-open:ease-spring-open motion-reduce:transition-none"
    >
      <Spine
        {...item}
        index={place.get(item.id) ?? 0}
        tick={tickLength(item.count, largest)}
        level={level}
      />
    </li>
  );
  const groups = groupsOf(items);
  // With only one group there is nothing to set apart.
  const canGroup = groups.length > 1;
  const showGroups = grouped && canGroup;

  return (
    <div className="flex flex-col gap-(--space-md)">
      {canGroup && (
        <div role="group" aria-label="Arrange the shelf" className="flex items-center gap-2">
          <span aria-hidden className="mr-2 type-label text-ink-2">
            Shelve
          </span>
          <FilterPill size="sm" active={!grouped} onClick={() => onGroupedChange?.(false)}>
            All together
          </FilterPill>
          <FilterPill size="sm" active={grouped} onClick={() => onGroupedChange?.(true)}>
            By category
          </FilterPill>
        </div>
      )}
      {showGroups ? (
        <div className="flex h-130 items-stretch gap-(--space-md)">
          {groups.map((group) => {
            const n = group.items.length;
            return (
              <section
                key={group.label ?? "none"}
                aria-label={group.label ?? "Other collections"}
                style={{ "--n": n } as React.CSSProperties}
                className="flex h-full min-w-[calc(var(--n)*72px)] max-w-[calc(var(--n)*128px+(var(--n)-1)*4px)] grow-(--n) basis-0 flex-col gap-(--space-sm) transition-[flex-grow,max-width] duration-350 ease-spring-close spine-open:max-w-[calc(var(--n)*128px+(var(--n)-1)*4px+308px)] spine-open:grow-[calc(var(--n)+4.2)] spine-open:duration-600 spine-open:ease-spring-open motion-reduce:transition-none"
              >
                <h2 className="truncate border-b border-ink pb-2 type-label text-ink-2">
                  {group.label ?? "Other"}
                </h2>
                <ul
                  role="list"
                  className="flex min-h-0 flex-1 items-end gap-(--space-tile-gap) border-b border-ink"
                >
                  {alphabetical(group.items).map((item) => spine(item, 3))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <ul
          role="list"
          className="flex h-130 items-end gap-(--space-tile-gap) border-b border-ink"
        >
          {ordered.map((item) => spine(item, 2))}
        </ul>
      )}
    </div>
  );
}

/**
 * A `Shelf` whose arrangement lives in the address (`?shelve=category`), as
 * the Projects filters do: it can be linked to and survives a reload, and it
 * replaces the history entry so Back leaves the page.
 *
 * It reads the address, so on a prerendered page it needs a `Suspense`
 * around it; give that the plain `Shelf` as its fallback and the page is
 * whole before any script runs.
 */
export function UrlShelf({ param = "shelve", ...shelf }: Omit<ShelfProps, "grouped" | "onGroupedChange"> & { param?: string }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const grouped = params.get(param) === "category";

  function change(next: boolean) {
    const query = new URLSearchParams(params.toString());
    if (next) query.set(param, "category");
    else query.delete(param);
    const search = query.toString();
    window.history.replaceState(null, "", search ? `${pathname}?${search}` : pathname);
  }

  return <Shelf {...shelf} grouped={grouped} onGroupedChange={change} />;
}
