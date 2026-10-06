import Link from "next/link";

/*
 * A tile: one piece of work in a gallery. Its cover fills it; the pointer or
 * the keyboard brings a sage plate over the cover with a glance of what the
 * piece is. `TileGrid` lays tiles out as a tight mosaic.
 *
 * A tile knows nothing about content. Whatever is passed as its children is
 * its cover (a photograph, a placeholder, later something that moves), and
 * the rest are plain props, so anything with a link and a title can be one.
 */

/** How many cells of the grid a tile takes. */
export type TileSize = "square" | "wide" | "tall" | "large";

const spans: Record<TileSize, string> = {
  square: "",
  wide: "col-span-2",
  tall: "row-span-2",
  large: "col-span-2 row-span-2",
};

/**
 * Sizes for a run of tiles, by position: twelve tiles in this order fill a
 * four-column grid with no gaps, and the run repeats. A size is given by
 * where a tile falls in the whole list, so filtering never resizes it.
 */
const run: TileSize[] = [
  "wide", "tall", "square",
  "large", "square", "square", "square", "square", "square",
  "large", "square", "square",
];

export function tileSizeAt(index: number): TileSize {
  return run[index % run.length];
}

/**
 * The gallery's grid: four columns of square cells, `--space-tile-gap` apart
 * both ways. Later tiles move up into any cell an earlier, larger one left
 * open. Each child is a `TileGridItem`.
 */
export function TileGrid({ children }: { children: React.ReactNode }) {
  return (
    // The cell's height is the column's width, which the grid cannot ask of
    // itself: it is read from this container.
    <div className="@container">
      <ul
        role="list"
        className="grid grid-flow-dense auto-rows-[calc((100cqw_-_3_*_var(--space-tile-gap))_/_4)] grid-cols-4 gap-(--space-tile-gap)"
      >
        {children}
      </ul>
    </div>
  );
}

export function TileGridItem({
  size = "square",
  children,
}: {
  size?: TileSize;
  children: React.ReactNode;
}) {
  return <li className={spans[size]}>{children}</li>;
}

export type TileProps = {
  href: string;
  title: string;
  /** One line under the title. */
  summary?: string;
  /** What it is: `Code`, `Photo series · 12`. */
  label: string;
  year: number;
  /** For example "In progress". Shown with a dot. */
  status?: string;
  /** Sets the title's scale. Its place in the grid is the `TileGridItem`'s. */
  size?: TileSize;
  /**
   * The cover. It is stretched to fill the tile, and is decoration: the tile
   * is named by its title, so nothing in the cover is read out.
   */
  children: React.ReactNode;
};

/**
 * The plate is the nav's: sage, grown from the center on the nav's opening
 * spring, with its contents fading in 150ms later, and gone on the closing
 * spring. With reduced motion it appears and goes at once.
 *
 * The plate is for the eye and is hidden from everything else until it shows.
 * What the tile is called does not depend on it: the link carries the same
 * words for screen readers, with the title as a heading.
 */
/*
 * The plate at rest, written on the element and not in a class. A class
 * arrives with the stylesheet, and a browser that has worked out the page's
 * styles before then (a script asked) would see the plate go from shown to
 * hidden and run the closing transition: a sage flash over every tile as the
 * page loads. Written here, it is hidden from the first moment. The showing
 * state has to be `!important` to win over it.
 */
const clear = { opacity: 0 } as const;
const hidden = { ...clear, visibility: "hidden" } as const;

export function Tile({
  href,
  title,
  summary,
  label,
  year,
  status,
  size = "square",
  children,
}: TileProps) {
  const roomy = size === "wide" || size === "large";
  return (
    <Link
      href={href}
      className="tile relative block size-full overflow-hidden rounded-(--radius-img) focus-visible:z-10"
    >
      <div aria-hidden className="absolute inset-0 transition-transform duration-350 ease-spring-close tile-open:scale-103 tile-open:duration-600 tile-open:ease-spring-open motion-reduce:transform-none motion-reduce:transition-none *:size-full">
        {children}
      </div>
      <div className="sr-only">
        <h2>{title}</h2>
        <p>{[label, year, summary, status].filter(Boolean).join(". ")}</p>
      </div>
      <div data-tile-plate aria-hidden className="absolute inset-0">
        <div
          style={clear}
          className="absolute inset-0 scale-86 bg-bg/90 transition-[scale,opacity] [transition-duration:350ms,200ms] [transition-timing-function:var(--ease-spring-close),linear] tile-open:scale-100 tile-open:opacity-100! tile-open:[transition-duration:600ms,150ms] tile-open:[transition-timing-function:var(--ease-spring-open),linear] motion-reduce:scale-100 motion-reduce:transition-none"
        />
        <div
          style={hidden}
          className="absolute inset-0 flex flex-col justify-between p-(--space-md) text-ink transition-[opacity,visibility] duration-150 tile-open:visible! tile-open:opacity-100! tile-open:duration-350 tile-open:[transition-delay:150ms,0s] motion-reduce:transition-none"
        >
          <p className="flex items-baseline justify-between gap-(--space-sm) text-ink-2">
            <span className="type-label">{label}</span>
            <span className="type-meta">{year}</span>
          </p>
          <div className="flex flex-col gap-2">
            <p className={roomy ? "type-quote" : "type-index-title"}>{title}</p>
            {summary && <p className="type-ui max-w-105 text-ink-2">{summary}</p>}
            {status && (
              <p className="flex items-center gap-2 pt-2 type-meta text-ink-2">
                <span aria-hidden className="size-2 rounded-full bg-accent" />
                {status}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
