import Link from "next/link";
import { sentenceText, type SentencePart } from "@/lib/shelf";

/*
 * A spine: one collection standing on the shelf. Closed it is a name set
 * upright and a count with a tick above it. The pointer or the keyboard
 * pulls it out: it turns sage, as the nav and a tile's plate do, and shows a
 * sentence about the collection and its newest rows.
 *
 * The open state is all CSS, on the nav's springs. The link is named by the
 * collection's title (a heading) and read with its sentence and newest rows;
 * what is drawn is decoration, as on a tile.
 */

export type SpineProps = {
  href: string;
  title: string;
  /** Its place on the shelf, from 1: shown as `001`. */
  index: number;
  count: number;
  category?: string;
  description?: string;
  sentence: SentencePart[];
  /** The newest rows, newest first: a day and a name. */
  newest: { id: string; label: string; text: string }[];
  /** The tick above the count, in px. */
  tick: number;
  /** The level of the title for assistive technology. */
  level?: 2 | 3;
};

/*
 * Hidden on the element and not in a class, as a tile's plate is: a class
 * arrives with the stylesheet, and a browser that has styled the page before
 * then would see the body go from shown to hidden and run the closing
 * transition. The open state has to be `!important` to win over it.
 */
const hidden = { opacity: 0, visibility: "hidden" } as const;

export function Spine({
  href,
  title,
  index,
  count,
  category,
  description,
  sentence,
  newest,
  tick,
  level = 2,
}: SpineProps) {
  const Heading = `h${level}` as const;
  return (
    <Link
      href={href}
      className="spine relative flex size-full overflow-hidden rounded-t-(--radius-img) bg-surface text-ink transition-colors duration-300 hover:bg-bg focus-visible:z-10 focus-visible:bg-bg motion-reduce:transition-none"
    >
      <span className="sr-only">
        <Heading>{title}</Heading>
        <span>
          {[sentenceText(sentence), description, ...newest.map((n) => `${n.label}, ${n.text}`)]
            .filter(Boolean)
            .join(". ")}
        </span>
      </span>
      <span aria-hidden className="flex size-full">
        <span className="flex w-18 shrink-0 flex-col items-center justify-between py-5 transition-[width] duration-350 ease-spring-close spine-on:w-24 spine-on:duration-600 spine-on:ease-spring-open motion-reduce:transition-none">
          {/* `ink`, not `ink-2`: the provisional dark surface leaves `ink-2`
              under 4.5:1 (see Open questions). */}
          <span className="type-meta">{String(index).padStart(3, "0")}</span>
          <span className="type-index-title whitespace-nowrap [writing-mode:vertical-rl]">
            {title}
          </span>
          <span className="flex flex-col items-center gap-1.5">
            <i style={{ width: tick }} className="block h-0.5 bg-current opacity-55" />
            <span className="type-meta">{count}</span>
          </span>
        </span>
        <span
          style={hidden}
          className="flex w-85 shrink-0 flex-col justify-between py-5 pr-(--space-md) transition-[opacity,visibility] duration-150 spine-on:visible! spine-on:opacity-100! spine-on:duration-350 spine-on:[transition-delay:150ms,0s] motion-reduce:transition-none"
        >
          <span className="flex flex-col gap-(--space-sm)">
            {category && <span className="type-label text-ink-2">{category}</span>}
            <span className="type-quote text-ink-2">
              {sentence.map((part, i) => (
                <span key={i} className={part.loud ? "text-ink" : undefined}>
                  {part.text}
                </span>
              ))}
            </span>
            {description && <span className="type-ui text-ink-2">{description}</span>}
            <span className="flex flex-col gap-1.5 pt-2">
              {newest.map((row) => (
                <span
                  key={row.id}
                  className="flex gap-3 border-t border-line pt-1.5 type-meta text-ink-2"
                >
                  <span>{row.label}</span>
                  <span className="truncate">{row.text}</span>
                </span>
              ))}
            </span>
          </span>
          <span className="type-meta text-ink-2">Open {title.toLowerCase()} →</span>
        </span>
      </span>
    </Link>
  );
}
