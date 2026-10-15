import { cx } from "@/lib/site";

const spaces = {
  /** Between parts of a page that stand apart. */
  block: "pt-(--space-block)",
  /** Between parts that read as one run. */
  "2xl": "pt-(--space-2xl)",
};

/** A band of a page, in the page's columns, spaced from the band above. */
export function PageSection({
  as: Tag = "section",
  space = "2xl",
  className,
  children,
}: {
  as?: "section" | "div" | "ol";
  space?: keyof typeof spaces;
  className?: string;
  children: React.ReactNode;
}) {
  return <Tag className={cx("page", spaces[space], className)}>{children}</Tag>;
}
