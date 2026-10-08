import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "@/test/axe";
import { FlightLog, UrlFlightLog, type FlightRow } from "./flight-log";

let search = "";
vi.mock("next/navigation", () => ({
  usePathname: () => "/collections/travels/log",
  useSearchParams: () => new URLSearchParams(search),
}));

const row = (id: string, date: string, to: string): FlightRow => ({
  id,
  no: "001",
  date,
  from: "Detroit (DTW)",
  to,
  airline: "Delta Air Lines",
  aircraft: "Airbus A330-300",
  distance: "4,524",
  time: "8h 40m",
});
const rows = [
  row("2026-01-10-dtw-vie", "2026-01-10", "Vienna (VIE)"),
  row("2024-03-02-dtw-ord", "2024-03-02", "Chicago (ORD)"),
  row("2024-03-01-dtw-clt", "2024-03-01", "Charlotte (CLT)"),
];
const shown = () =>
  within(screen.getByRole("table")).getAllByRole("row").slice(1).map((r) => r.id);

beforeEach(() => {
  search = "";
});

describe("FlightLog", () => {
  it("lists every flight, each row with its id for a link to land on", () => {
    render(<FlightLog rows={rows} />);
    expect(shown()).toEqual(rows.map((r) => r.id));
    expect(screen.getByRole("status")).toHaveTextContent("3 flights");
  });

  it("has a pill for each year flown, newest first, after All", () => {
    render(<FlightLog rows={rows} />);
    const pills = within(screen.getByRole("group", { name: "Year" })).getAllByRole("button");
    expect(pills.map((p) => p.textContent)).toEqual(["All", "2026", "2024"]);
    expect(pills[0]).toHaveAttribute("aria-pressed", "true");
  });

  it("shows one year when asked", () => {
    render(<FlightLog rows={rows} year="2024" />);
    expect(shown()).toEqual(["2024-03-02-dtw-ord", "2024-03-01-dtw-clt"]);
    expect(screen.getByRole("button", { name: "2024" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("status")).toHaveTextContent("2 flights");
  });

  it("reports the year chosen, and All as none", async () => {
    const onChange = vi.fn();
    render(<FlightLog rows={rows} year="2024" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "2026" }));
    expect(onChange).toHaveBeenLastCalledWith("2026");
    await userEvent.click(screen.getByRole("button", { name: "All" }));
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<FlightLog rows={rows} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("UrlFlightLog", () => {
  it("reads the year from the address", () => {
    search = "y=2026";
    render(<UrlFlightLog rows={rows} />);
    expect(shown()).toEqual(["2026-01-10-dtw-vie"]);
  });

  it("shows everything for a year nothing was flown in", () => {
    search = "y=1999";
    render(<UrlFlightLog rows={rows} />);
    expect(shown()).toHaveLength(3);
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");
  });

  it("writes the year to the address without adding to the history, keeping other parameters", async () => {
    search = "q=vienna";
    const replace = vi.spyOn(window.history, "replaceState");
    render(<UrlFlightLog rows={rows} />);
    await userEvent.click(screen.getByRole("button", { name: "2024" }));
    expect(replace).toHaveBeenLastCalledWith(null, "", "/collections/travels/log?q=vienna&y=2024");
  });

  it("takes the year out of the address for All", async () => {
    search = "y=2024";
    const replace = vi.spyOn(window.history, "replaceState");
    render(<UrlFlightLog rows={rows} />);
    await userEvent.click(screen.getByRole("button", { name: "All" }));
    expect(replace).toHaveBeenLastCalledWith(null, "", "/collections/travels/log");
  });
});
