import type { Metadata } from "next";
import Link from "next/link";
import { BarList } from "@/components/charts/bar-list";
import { ColumnChart } from "@/components/charts/column-chart";
import { count } from "@/components/charts/format";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { LifeMap } from "@/components/life-map";
import { ArrowLink } from "@/components/links";
import { Nav } from "@/components/nav";
import { PhotoImage } from "@/components/entry/photo-figure";
import { SectionLabel } from "@/components/section-label";
import { Stat } from "@/components/stat";
import { Tabs } from "@/components/tabs";
import { content } from "@/lib/content";
import { countryTable, regionName } from "@/lib/ebird/places";
import { lifeStats, type Ranked } from "@/lib/ebird/stats";

// The life list's own page: the numbers and the map. Its table is one level
// down, at /collections/life-list/log. See the design log, 2026-10-11.
export const metadata: Metadata = {
  title: "Life list",
  description: "Every bird species I have identified, counted by where and when.",
};

const plural = (n: number, one: string, many: string) => `${count(n)} ${n === 1 ? one : many}`;

/** "2026-09-28" as "28 September", read as the day it is, in no time zone. */
const day = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });

/** A territory is said to be one; a country is not. */
const kindOf = (type: string) => (/^(Sovereign country|Country)$/.test(type) ? undefined : type);

function countryBars(rows: Ranked[], by: "species" | "checklists") {
  return [...rows]
    .sort((a, b) => b.counts[by] - a.counts[by] || a.name.localeCompare(b.name))
    .map((row) => ({
      label: row.name,
      detail: kindOf(row.type ?? ""),
      value: row.counts[by],
      shown: count(row.counts[by]),
    }));
}

export default async function LifeListPage() {
  const q = await content();
  const sightings = q.list("sighting");
  const countries = countryTable();
  const stats = lifeStats(
    sightings,
    {
      country: (code) => countries[code] ?? { name: code, type: "", continent: "", subregion: "" },
      region: regionName,
    },
    7,
  );
  const { totals } = stats;

  // Photographs of a bird on the list are its media: a photograph points at the sighting it is of.
  const sightingRefs = new Set(sightings.map((s) => s.ref));
  const media = q
    .list("photo")
    .filter((photo) => photo.edges.some((edge) => edge.rel === "related" && sightingRefs.has(edge.to)))
    .slice(0, 3);

  const shownRegions = stats.byMajor.filter((r) => r.counts.species > 0);
  const hiddenRegions = stats.byMajor.length - shownRegions.length + stats.undefinedRegions;

  return (
    <>
      <Nav active="Collections" />
      <main className="pb-(--space-block)">
        <header className="page flex flex-col gap-(--space-md) pt-(--space-header-top)">
          <Eyebrow section="Collections" category="Life list" />
          <h1 className="type-h1">Life list</h1>
          <p className="type-standfirst max-w-150 text-ink-2">
            {totals.species === 0 ? (
              "No birds on the list yet."
            ) : (
              <>
                I have named <span className="text-ink">{plural(totals.species, "bird", "birds")}</span>,
                in {plural(totals.countries, "country", "countries")} since {totals.since}.
                {totals.lastLifer && (
                  <>
                    {" "}
                    The latest is the {totals.lastLifer.species}, on {day(totals.lastLifer.date)}.
                  </>
                )}
              </>
            )}
          </p>
        </header>

        {totals.species > 0 && (
          <>
            <section className="page flex flex-col gap-(--space-xl) pt-(--space-2xl)">
              <SectionLabel>In numbers</SectionLabel>
              <div className="grid grid-cols-2 gap-x-(--col-gap) gap-y-(--space-lg) md:grid-cols-5">
                <Stat value={count(totals.species)} label={totals.species === 1 ? "Species" : "Species"} />
                <Stat value={count(totals.checklists)} label={totals.checklists === 1 ? "Checklist" : "Checklists"} />
                <Stat
                  value={count(totals.countries)}
                  label={totals.countries === 1 ? "Country or territory" : "Countries and territories"}
                />
                <Stat
                  value={count(totals.regions)}
                  label={totals.regions === 1 ? "State or province" : "States and provinces"}
                />
                <Stat value={count(totals.years)} label={totals.years === 1 ? "Year" : "Years"} />
              </div>
            </section>

            <section className="page flex flex-col gap-(--space-xl) pt-(--space-2xl)">
              <SectionLabel>Where</SectionLabel>
              <LifeMap
                countries={stats.map.countries}
                regions={stats.map.regions}
                total={totals.species}
              />
            </section>

            <section className="page flex flex-col gap-(--space-xl) pt-(--space-2xl)">
              <SectionLabel>By year</SectionLabel>
              <Tabs
                label="Count by year"
                tabs={[
                  {
                    label: "Species seen",
                    panel: (
                      <div className="flex flex-col gap-(--space-sm)">
                        <ColumnChart
                          label="Species seen in each year"
                          columns={stats.byYear.map((y) => ({
                            label: y.year,
                            value: y.species,
                            note: `${y.life} in all`,
                          }))}
                        />
                        <p className="type-small text-ink-2">
                          A species seen in two years counts in both, so the years add up to more
                          than the list. Under each year is the list&rsquo;s total at its end.
                        </p>
                      </div>
                    ),
                  },
                  {
                    label: "Checklists",
                    panel: (
                      <ColumnChart
                        label="Checklists in each year"
                        columns={stats.byYear.map((y) => ({ label: y.year, value: y.checklists }))}
                      />
                    ),
                  },
                ]}
              />
            </section>

            <section className="page grid gap-x-(--col-gap) gap-y-(--space-2xl) pt-(--space-2xl) md:grid-cols-2">
              <div className="flex flex-col gap-(--space-md)">
                <SectionLabel as="h2">
                  {`Country, territory or dependency · ${count(stats.byCountry.length)}`}
                </SectionLabel>
                <Tabs
                  label="Rank places by"
                  tabs={[
                    {
                      label: "By species",
                      panel: <BarList wrap label="Places by species" bars={countryBars(stats.byCountry, "species")} />,
                    },
                    {
                      label: "By checklists",
                      panel: (
                        <BarList wrap label="Places by checklists" bars={countryBars(stats.byCountry, "checklists")} />
                      ),
                    },
                  ]}
                />
              </div>
              <div className="flex flex-col gap-(--space-md)">
                <SectionLabel as="h2">{`Major region · ${count(shownRegions.length)}`}</SectionLabel>
                <BarList
                  wrap
                  label="Major regions by species"
                  bars={shownRegions.map((r) => ({
                    label: r.name,
                    value: r.counts.species,
                    shown: count(r.counts.species),
                  }))}
                />
                {hiddenRegions > 0 && (
                  <p className="type-small text-ink-2">
                    {plural(hiddenRegions, "more region", "more regions")}, none seen yet.
                  </p>
                )}
              </div>
            </section>

            <section className="page grid gap-x-(--col-gap) gap-y-(--space-2xl) pt-(--space-2xl) md:grid-cols-2">
              <div className="flex flex-col gap-(--space-md)">
                <SectionLabel as="h2">Latest checklists</SectionLabel>
                <ul>
                  {stats.latest.map((l) => (
                    <li
                      key={l.id}
                      className="grid grid-cols-[6.5rem_minmax(0,1fr)_auto] items-baseline gap-(--space-sm) border-b border-line py-3"
                    >
                      <span className="type-meta text-ink-2">{l.date}</span>
                      <span className="flex flex-col">
                        <span className="type-index-title text-ink">{l.species}</span>
                        <span className="type-small text-ink-2">
                          <span className="italic">{l.scientific}</span> · {l.where}
                        </span>
                      </span>
                      <a
                        href={`https://ebird.org/checklist/${l.checklist}`}
                        rel="noreferrer"
                        className="type-meta text-link underline decoration-1 underline-offset-[0.15em] hover:text-ink"
                      >
                        eBird<span aria-hidden> ↗</span>
                        <span className="sr-only"> checklist {l.checklist}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-(--space-md)">
                <SectionLabel as="h2">Latest media</SectionLabel>
                {media.length === 0 ? (
                  <p className="type-small text-ink-2">
                    No photographs of a bird on the list yet.
                  </p>
                ) : (
                  <ul className="grid grid-cols-2 gap-(--space-md) lg:grid-cols-3">
                    {media.map((photo) => (
                      <li key={photo.id} className="flex flex-col gap-(--space-sm)">
                        <Link href={photo.url} className="block">
                          <PhotoImage photo={photo} size="column" />
                        </Link>
                        {(photo.data.caption ?? photo.data.place) && (
                          <span className="type-small text-ink">
                            {photo.data.caption ?? photo.data.place}
                          </span>
                        )}
                        <span className="type-meta text-ink-2">{photo.date.slice(0, 10)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <div className="page pt-(--space-2xl)">
              <ArrowLink href="/collections/life-list/log">
                Every species, in the order I first saw it
              </ArrowLink>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
