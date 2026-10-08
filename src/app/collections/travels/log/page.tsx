import type { Metadata } from "next";
import { Suspense } from "react";
import { Eyebrow } from "@/components/eyebrow";
import { FlightLog, UrlFlightLog, type FlightRow } from "@/components/flight-log";
import { Footer } from "@/components/footer";
import { ArrowLink } from "@/components/links";
import { Nav } from "@/components/nav";
import { content, type Airport } from "@/lib/content";
import { hoursAndMinutes, miles } from "@/lib/flights/format";

// The travels collection's table: every flight, newest first. The collection's
// own page is the map; see the design log, 2026-10-07.
export const metadata: Metadata = {
  title: "Flight log",
  description: "Every flight I have taken, newest first.",
};

const place = (airport: Airport) => `${airport.city} (${airport.iata ?? airport.icao})`;

export default async function FlightLogPage() {
  const flights = (await content()).list("flight");
  const rows: FlightRow[] = flights.map((flight, at) => ({
    id: flight.id,
    // Numbered from the first flight taken.
    no: String(flights.length - at).padStart(3, "0"),
    date: flight.date,
    from: place(flight.data.from),
    to: place(flight.data.to),
    airline: flight.data.airline ?? "",
    aircraft: flight.data.aircraft ?? "",
    distance: miles(flight.data.km),
    time: flight.data.minutes ? hoursAndMinutes(flight.data.minutes) : "",
  }));

  return (
    <>
      <Nav active="Collections" />
      <main className="pb-(--space-block)">
        <header className="page flex flex-col gap-(--space-md) pt-(--space-header-top)">
          <Eyebrow section="Travels" category="Log" />
          <h1 className="type-h1">Flight log</h1>
          <p className="type-standfirst max-w-150 text-ink-2">
            Every flight I have taken, newest first.
          </p>
          <ArrowLink href="/collections/travels">The map, and the flights counted</ArrowLink>
        </header>
        <div className="page pt-(--space-2xl)">
          <Suspense fallback={<FlightLog rows={rows} />}>
            <UrlFlightLog rows={rows} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
