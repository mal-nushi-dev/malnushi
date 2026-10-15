import Link from "next/link";
import { Eyebrow } from "@/components/eyebrow";
import { cx } from "@/lib/site";

const sizes = {
  /** The Writing lead: a quote-size title, its subtitle in body text, the date. */
  lead: { title: "type-quote", summary: "max-w-150 type-body text-ink-2" },
  /** A large feature on Home: a quote-size title and a short summary. */
  large: { title: "type-quote", summary: "type-small max-w-130 text-ink-2" },
  /** A small feature: the title alone, at index size. */
  small: { title: "type-index-title", summary: "type-small max-w-130 text-ink-2" },
};

/**
 * A featured piece: its image, eyebrow, title and summary, the whole card one
 * link. The title takes the link color on hover or focus. The grid places the
 * card (`className`); the card does not size itself.
 */
export function FeatureCard({
  href,
  image,
  eyebrow,
  title,
  summary,
  meta,
  size = "large",
  as: Heading = "h3",
  className,
}: {
  href: string;
  image: React.ReactNode;
  eyebrow: React.ComponentProps<typeof Eyebrow>;
  title: React.ReactNode;
  summary?: React.ReactNode;
  /** A mono line under the summary, such as the date. */
  meta?: React.ReactNode;
  size?: keyof typeof sizes;
  as?: "h2" | "h3";
  className?: string;
}) {
  const style = sizes[size];
  return (
    <Link href={href} className={cx("group flex flex-col gap-(--space-md)", className)}>
      {image}
      <Eyebrow {...eyebrow} />
      <Heading className={cx(style.title, "text-ink group-hover:text-link")}>{title}</Heading>
      {summary && <p className={style.summary}>{summary}</p>}
      {meta && <span className="type-meta text-ink-2">{meta}</span>}
    </Link>
  );
}
