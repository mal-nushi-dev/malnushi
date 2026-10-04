"use client";

import { useState } from "react";
import { FilterPill } from "@/components/filter-pill";
import { IndexRow, type IndexItem } from "@/components/index-list";
import { SectionLabel } from "@/components/section-label";

const ALL = "All";

/** "All", then each category in the order it first appears. */
export function categoriesOf(items: IndexItem[]) {
  return [ALL, ...new Set(items.map((i) => i.category))];
}

export function filterBy<T extends IndexItem>(items: T[], category: string) {
  return category === ALL ? items : items.filter((i) => i.category === category);
}

export function CategoryPills({
  categories,
  active,
  onChange,
}: {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="flex flex-wrap gap-(--space-sm)"
    >
      {categories.map((c) => (
        <FilterPill key={c} active={c === active} onClick={() => onChange(c)}>
          {c}
        </FilterPill>
      ))}
    </div>
  );
}

/** An index list of articles with category pills that filter it in place. */
export function ArticleFilter({
  label,
  items,
}: {
  label: string;
  items: IndexItem[];
}) {
  const [category, setCategory] = useState(ALL);
  return (
    <section>
      <SectionLabel>{label}</SectionLabel>
      <div className="py-(--space-md)">
        <CategoryPills
          categories={categoriesOf(items)}
          active={category}
          onChange={setCategory}
        />
      </div>
      <ol className="border-t border-line">
        {filterBy(items, category).map((item, i) => (
          <IndexRow key={item.href} index={i + 1} item={item} />
        ))}
      </ol>
    </section>
  );
}
