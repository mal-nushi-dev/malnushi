"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { FilterPill } from "@/components/filter-pill";
import { Tile, TileGrid, TileGridItem, type TileProps } from "@/components/tile";
import {
  formatSelection,
  matching,
  openFilters,
  parseSelection,
  toggle,
  type Filter,
} from "@/lib/filter";

/** A tile and the filters it answers to. `cover` is drawn as the tile's cover. */
export type GalleryItem = Omit<TileProps, "children"> & {
  id: string;
  keys: string[];
  cover: React.ReactNode;
};

type GalleryProps = {
  items: GalleryItem[];
  filters: Filter[];
  /** What the things are called, for the count read to screen readers. */
  noun?: { one: string; many: string };
};

/**
 * Small filter pills, centered, over a grid of tiles. Several filters can be
 * on at once and an item must answer to all of them; a filter that would
 * leave nothing is not shown. The selection is the caller's: see
 * `UrlTileGallery` for one kept in the address.
 */
export function TileGallery({
  items,
  filters,
  noun = { one: "item", many: "items" },
  selected = [],
  onChange,
}: GalleryProps & {
  selected?: string[];
  onChange?: (selected: string[]) => void;
}) {
  const shown = matching(items, selected);
  return (
    <div className="flex flex-col gap-(--space-md)">
      {filters.length > 1 && (
        <div
          role="group"
          aria-label="Filter"
          className="flex flex-wrap justify-center gap-2"
        >
          <FilterPill size="sm" active={selected.length === 0} onClick={() => onChange?.([])}>
            All
          </FilterPill>
          {openFilters(items, selected, filters).map((f) => (
            <FilterPill
              key={f.key}
              size="sm"
              active={selected.includes(f.key)}
              onClick={() => onChange?.(toggle(selected, f.key, filters))}
            >
              {f.label}
            </FilterPill>
          ))}
        </div>
      )}
      <p role="status" className="sr-only">
        {shown.length} {shown.length === 1 ? noun.one : noun.many}
      </p>
      <TileGrid>
        {shown.map((item) => (
          <TileGridItem key={item.id} size={item.size}>
            <Tile
              href={item.href}
              title={item.title}
              summary={item.summary}
              label={item.label}
              year={item.year}
              status={item.status}
              size={item.size}
            >
              {item.cover}
            </Tile>
          </TileGridItem>
        ))}
      </TileGrid>
    </div>
  );
}

/**
 * A `TileGallery` whose selection lives in the address (`?t=code,design`), so
 * a filtered view can be linked to and survives a reload. Filtering replaces
 * the history entry: Back leaves the page, it does not undo a pill.
 *
 * It reads the address, so on a prerendered page it needs a `Suspense`
 * around it; give that the plain `TileGallery` as its fallback and the page
 * is whole before any script runs.
 */
export function UrlTileGallery({ param = "t", ...gallery }: GalleryProps & { param?: string }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const selected = parseSelection(params.get(param), gallery.filters);

  function change(next: string[]) {
    const query = new URLSearchParams(params.toString());
    const value = formatSelection(next);
    if (value) query.set(param, value);
    else query.delete(param);
    // Commas are legal in a query and read better than %2C.
    const search = query.toString().replaceAll("%2C", ",");
    window.history.replaceState(null, "", search ? `${pathname}?${search}` : pathname);
  }

  return <TileGallery {...gallery} selected={selected} onChange={change} />;
}
