"use client";

import { useState } from "react";
import { IndexRow } from "@/components/index-list";
import { SectionLabel } from "@/components/section-label";
import { CategoryPills, categoriesOf, filterBy } from "./article-filter";
import type { Article } from "./data";
import { ImageSlot } from "./parts";

/**
 * Direction C: the article index in columns 1–7 and one image slot beside
 * it, which stays in view while the list scrolls. The slot shows the article
 * whose row is hovered or focused; the newest listed article until then.
 */
export function LiveIndex({ items }: { items: Article[] }) {
  const [category, setCategory] = useState("All");
  const [pointed, setPointed] = useState<string | null>(null);

  const listed = filterBy(items, category);
  const shown = listed.find((a) => a.href === pointed) ?? listed[0];

  // Rows are whole links, so one handler on the list covers hover and focus.
  const point = (e: React.SyntheticEvent) => {
    const href = (e.target as Element).closest("a")?.getAttribute("href");
    if (href) setPointed(href);
  };

  return (
    <div className="grid grid-cols-12 items-start gap-x-(--col-gap)">
      <section className="col-span-7">
        <SectionLabel>Articles</SectionLabel>
        <div className="py-(--space-md)">
          <CategoryPills
            categories={categoriesOf(items)}
            active={category}
            onChange={setCategory}
          />
        </div>
        <ol
          className="border-t border-line"
          onMouseOver={point}
          onFocus={point}
        >
          {listed.map((item, i) => (
            <IndexRow key={item.href} index={i + 1} item={item} />
          ))}
        </ol>
      </section>

      {/* Sticks below the nav plate, which it would otherwise slide under. */}
      <div className="sticky top-26 col-span-4 col-start-9 flex flex-col gap-(--space-sm)">
        <ImageSlot
          label={`${shown.title.toUpperCase()} — 400 × 500`}
          className="aspect-4/5"
        />
        <p className="flex gap-(--space-md) type-meta text-ink-2">
          <span className="text-ink">
            {String(listed.indexOf(shown) + 1).padStart(3, "0")}
          </span>
          <span>{shown.date}</span>
          <span>{shown.category}</span>
        </p>
        <p className="type-small text-ink-2">{shown.subtitle}</p>
      </div>
    </div>
  );
}
