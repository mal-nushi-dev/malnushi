import type { Metadata } from "next";
import { BarList } from "@/components/charts/bar-list";
import { LineChart } from "@/components/charts/line-chart";
import { PieChart } from "@/components/charts/pie-chart";
import { FlightMap } from "@/components/flight-map";
import { FlightScenes } from "@/components/flight-scenes";
import { Footer } from "@/components/footer";
import { ArrowLink } from "@/components/links";
import { PageHeader } from "@/components/page-header";
import { PageSection } from "@/components/page-section";
import { SectionLabel } from "@/components/section-label";
import { Stat } from "@/components/stat";
import { Tabs } from "@/components/tabs";
import { content } from "@/lib/content";
import { amount, miles, times } from "@/lib/flights/format";
import {
  cabinOrder,
  continentOrder,
  flightStats,
  reasonOrder,
  seatOrder,
  top,
  type Ranked,
} from "@/lib/flights/stats";
import { count, counted } from "@/lib/format";

// The travels collection: a map of every flight, then the flights counted.
// The first collection whose page is not its table; that is one level down,
// at /collections/travels/log. See the design log, 2026-10-07.
export const metadata: Metadata = {
  title: "Travels",
  description: "Every flight I have taken, drawn on a map and counted.",
};

/** What a pie says about the flights it could not place. */
const unrecorded = (n: number, what: string) =>
  n === 0 ? undefined : `${counted(n, "flight has", "flights have")} no ${what} recorded.`;

/** One ranking as bars, read by flights or by distance. */
function bars(rows: Ranked[], by: "count" | "km") {
  return top(rows, by).map((row) => ({
    label: row.label,
    detail: row.detail,
    value: row[by],
    shown: by === "count" ? count(row.count) : `${miles(row.km)} mi`,
  }));
}

/** A ranking's name, and how many different ones there are: the bars show only the top of it. */
function RankingTitle({ title, total }: { title: string; total: number }) {
  return (
    <h3 className="flex items-baseline justify-between type-label text-ink-2">
      {title}
      <span className="tabular-nums text-ink">
        {count(total)} <span className="sr-only">in all</span>
      </span>
    </h3>
  );
}

function Ranking({ title, rows }: { title: string; rows: Ranked[] }) {
  return (
    <section className="flex flex-col gap-(--space-md)">
      <RankingTitle title={title} total={rows.length} />
      <Tabs
        label={`Rank ${title.toLowerCase()} by`}
        tabs={[
          {
            label: "By flights",
            panel: <BarList label={`${title} by flights`} bars={bars(rows, "count")} />,
          },
          {
            label: "By distance",
            panel: <BarList label={`${title} by distance`} bars={bars(rows, "km")} />,
          },
        ]}
      />
    </section>
  );
}

export default async function TravelsPage() {
  const q = await content();
  const collection = q.need("collection", "travels");
  const stats = flightStats(q.list("flight"));
  const { shares, rankings, series, time, emissions } = stats;

  return (
    <>
      <main className="pb-(--space-block)">
        <PageHeader
          eyebrow={{ section: "Collections", category: "Travels" }}
          title={collection.title}
          standfirst={collection.summary}
        />

        <PageSection as="div">
          <FlightMap airports={stats.map.airports} routes={stats.map.routes} />
        </PageSection>

        <PageSection space="block" className="flex flex-col gap-(--space-xl)">
          <SectionLabel>In numbers</SectionLabel>
          <FlightScenes
            flights={{
              total: count(stats.flights),
              domestic: count(stats.domestic),
              international: count(stats.international),
            }}
            distance={{ miles: miles(stats.km), km: count(stats.km) }}
            moon={{ ratio: stats.toMoon, read: times(stats.toMoon) }}
            earth={{ ratio: stats.aroundEarth, read: times(stats.aroundEarth) }}
            sun={{ ratio: stats.toSun, read: times(stats.toSun) }}
          />
        </PageSection>

        <PageSection className="flex flex-col gap-(--space-xl)">
          <SectionLabel>Time in the air</SectionLabel>
          <div className="grid grid-cols-6 gap-x-(--col-gap)">
            <Stat value={time.years} label={time.years === 1 ? "Year" : "Years"} />
            <Stat value={time.months} label={time.months === 1 ? "Month" : "Months"} />
            <Stat value={time.weeks} label={time.weeks === 1 ? "Week" : "Weeks"} />
            <Stat value={time.days} label={time.days === 1 ? "Day" : "Days"} />
            <Stat value={time.hours} label={time.hours === 1 ? "Hour" : "Hours"} />
            <Stat value={time.minutes} label={time.minutes === 1 ? "Minute" : "Minutes"} />
          </div>
          {stats.estimated > 0 && (
            <p className="type-small text-ink-2">
              {counted(stats.estimated, "flight has", "flights have")} no duration recorded, and{" "}
              {stats.estimated === 1 ? "is" : "are"} estimated from distance.
            </p>
          )}
        </PageSection>

        <PageSection className="flex flex-col gap-(--space-xl)">
          <SectionLabel>Emissions</SectionLabel>
          <div className="grid grid-cols-4 gap-x-(--col-gap)">
            <Stat value={amount(emissions.co2Tonnes)} label="Tonnes of carbon dioxide" />
            <Stat value={amount(emissions.ch4Kg)} label="Kilograms of methane" />
            <Stat value={amount(emissions.n2oKg)} label="Kilograms of nitrous oxide" />
          </div>
          <p className="type-small max-w-(--measure) text-ink-2">
            An estimate of one passenger&rsquo;s share, from distance and cabin, using the UK
            government&rsquo;s 2026 conversion factors. It leaves out the extra warming of
            emissions at altitude.
            {emissions.leftOut > 0 &&
              ` ${counted(emissions.leftOut, "private flight is", "private flights are")} not counted.`}
          </p>
        </PageSection>

        <PageSection space="block" className="flex flex-col gap-(--space-xl)">
          <SectionLabel>How</SectionLabel>
          <div className="grid grid-cols-2 gap-x-(--space-2xl) gap-y-(--space-2xl)">
            <PieChart
              title="Class"
              unit="flights"
              order={cabinOrder}
              slices={shares.cabin.slices}
              note={unrecorded(shares.cabin.unrecorded, "class")}
            />
            <PieChart
              title="Seat"
              unit="flights"
              order={seatOrder}
              slices={shares.seat.slices}
              note={unrecorded(shares.seat.unrecorded, "seat")}
            />
            <PieChart
              title="Reason"
              unit="flights"
              order={reasonOrder}
              slices={shares.reason.slices}
              note={unrecorded(shares.reason.unrecorded, "reason")}
            />
            <PieChart
              title="Continent"
              unit="flights"
              order={continentOrder}
              slices={shares.continent.slices}
              note="Where each flight landed."
            />
          </div>
        </PageSection>

        <PageSection space="block" className="flex flex-col gap-(--space-xl)">
          <SectionLabel>Most flown</SectionLabel>
          <div className="grid grid-cols-2 gap-x-(--space-2xl) gap-y-(--space-2xl)">
            <Ranking title="Airports" rows={rankings.airports} />
            <Ranking title="Airlines" rows={rankings.airlines} />
            <Ranking title="Aircraft" rows={rankings.aircraft} />
            <Ranking title="Routes" rows={rankings.routes} />
            <section className="flex flex-col gap-(--space-md)">
              <RankingTitle title="Countries" total={rankings.countries.length} />
              <BarList label="Countries by flights landed" bars={bars(rankings.countries, "count")} />
            </section>
          </div>
        </PageSection>

        <PageSection space="block" className="flex flex-col gap-(--space-xl)">
          <SectionLabel>When</SectionLabel>
          <LineChart
            title="Flights per year"
            unit="flights"
            points={series.years}
            width={1064}
            every={series.years.length > 12 ? 2 : 1}
          />
          <div className="grid grid-cols-2 gap-x-(--space-2xl)">
            <LineChart title="Flights per month" unit="flights" points={series.months} />
            <LineChart title="Flights per weekday" unit="flights" points={series.weekdays} />
          </div>
        </PageSection>

        <PageSection as="div">
          <ArrowLink href="/collections/travels/log">
            Every flight, in a table
          </ArrowLink>
        </PageSection>
      </main>
      <Footer />
    </>
  );
}
