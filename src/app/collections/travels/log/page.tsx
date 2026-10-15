import type { Metadata } from "next";
import { Suspense } from "react";
import { FlightLog, UrlFlightLog, type FlightRow } from "@/components/flight-log";
import { Footer } from "@/components/footer";
import { ArrowLink } from "@/components/links";
import { PageHeader } from "@/components/page-header";
import { PageSection } from "@/components/page-section";
import { content, type Airport } from "@/lib/content";
import { hoursAndMinutes, miles } from "@/lib/flights/format";
import { numbered } from "@/lib/format";

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
    no: numbered(flights.length - at, 3),
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
      <main className="pb-(--space-block)">
        <PageHeader
          eyebrow={{ section: "Travels", category: "Log" }}
          title="Flight log"
          standfirst="Every flight I have taken, newest first."
        >
          <ArrowLink href="/collections/travels">The map, and the flights counted</ArrowLink>
        </PageHeader>
        <PageSection as="div">
          <Suspense fallback={<FlightLog rows={rows} />}>
            <UrlFlightLog rows={rows} />
          </Suspense>
        </PageSection>
      </main>
      <Footer />
    </>
  );
}
