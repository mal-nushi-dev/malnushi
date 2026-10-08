import type { Metadata } from "next";
import { BarList } from "@/components/charts/bar-list";
import { count } from "@/components/charts/format";
import { LineChart } from "@/components/charts/line-chart";
import { PieChart } from "@/components/charts/pie-chart";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { ArrowLink } from "@/components/links";
import { Nav } from "@/components/nav";
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

// The travels collection: a map of every flight, then the flights counted.
// The first collection whose page is not its table; that is one level down,
// at /collections/travels/log. See the design log, 2026-10-07.
export const metadata: Metadata = {
  title: "Travels",
  description: "Every flight I have taken, drawn on a map and counted.",
};

const plural = (n: number, one: string, many: string) => `${count(n)} ${n === 1 ? one : many}`;

/** What a pie says about the flights it could not place. */
const unrecorded = (n: number, what: string) =>
  n === 0 ? undefined : `${plural(n, "flight has", "flights have")} no ${what} recorded.`;

/** One ranking as bars, read by flights or by distance. */
function bars(rows: Ranked[], by: "count" | "km") {
  return top(rows, by).map((row) => ({
    label: row.label,
    detail: row.detail,
    value: row[by],
    shown: by === "count" ? count(row.count) : `${miles(row.km)} mi`,
  }));
}

function Ranking({ title, rows }: { title: string; rows: Ranked[] }) {
  return (
    <section className="flex flex-col gap-(--space-md)">
      <h3 className="type-label text-ink-2">{title}</h3>
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
      <Nav active="Collections" />
      <main className="pb-(--space-block)">
        <header className="page flex flex-col gap-(--space-md) pt-(--space-header-top)">
          <Eyebrow section="Collections" category="Travels" />
          <h1 className="type-h1">{collection.title}</h1>
          <p className="type-standfirst max-w-150 text-ink-2">{collection.summary}</p>
        </header>

        <section className="page flex flex-col gap-(--space-xl) pt-(--space-block)">
          <SectionLabel>In numbers</SectionLabel>
          <div className="grid grid-cols-4 gap-x-(--col-gap) gap-y-(--space-xl)">
            <Stat value={count(stats.flights)} label="Flights" />
            <Stat value={count(stats.domestic)} label="Domestic" />
            <Stat value={count(stats.international)} label="International" />
            <Stat value={count(stats.countries)} label="Countries" />
            <Stat value={miles(stats.km)} label={`Miles flown · ${count(stats.km)} km`} />
            <Stat value={times(stats.toMoon)} label="Of the way to the Moon" />
            <Stat value={times(stats.aroundEarth)} label="Around the Earth" />
            <Stat value={times(stats.toSun)} label="Of the way to the Sun" />
          </div>
        </section>

        <section className="page flex flex-col gap-(--space-xl) pt-(--space-2xl)">
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
              {plural(stats.estimated, "flight has", "flights have")} no duration recorded, and{" "}
              {stats.estimated === 1 ? "is" : "are"} estimated from distance.
            </p>
          )}
        </section>

        <section className="page flex flex-col gap-(--space-xl) pt-(--space-2xl)">
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
              ` ${plural(emissions.leftOut, "private flight is", "private flights are")} not counted.`}
          </p>
        </section>

        <section className="page flex flex-col gap-(--space-xl) pt-(--space-block)">
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
        </section>

        <section className="page flex flex-col gap-(--space-xl) pt-(--space-block)">
          <SectionLabel>Most flown</SectionLabel>
          <div className="grid grid-cols-2 gap-x-(--space-2xl) gap-y-(--space-2xl)">
            <Ranking title="Airports" rows={rankings.airports} />
            <Ranking title="Airlines" rows={rankings.airlines} />
            <Ranking title="Aircraft" rows={rankings.aircraft} />
            <Ranking title="Routes" rows={rankings.routes} />
            <section className="flex flex-col gap-(--space-md)">
              <h3 className="type-label text-ink-2">Countries</h3>
              <BarList label="Countries by flights landed" bars={bars(rankings.countries, "count")} />
            </section>
          </div>
        </section>

        <section className="page flex flex-col gap-(--space-xl) pt-(--space-block)">
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
        </section>

        <div className="page pt-(--space-2xl)">
          <ArrowLink href="/collections/travels/log">
            Every flight, in a table
          </ArrowLink>
        </div>
      </main>
      <Footer />
    </>
  );
}
