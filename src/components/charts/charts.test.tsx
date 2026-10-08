import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "@/test/axe";
import { BarList } from "./bar-list";
import { axisTop, count, percent } from "./format";
import { LineChart } from "./line-chart";
import { PieChart } from "./pie-chart";

describe("format", () => {
  it("writes a number with its thousands, and no fraction", () => {
    expect(count(161324.4)).toBe("161,324");
    expect(count(7)).toBe("7");
  });

  it("writes a share as a whole percentage, and a sliver as under one", () => {
    expect(percent(117, 121)).toBe("97%");
    expect(percent(1, 1000)).toBe("<1%");
    expect(percent(0, 10)).toBe("0%");
    expect(percent(0, 0)).toBe("0%");
  });

  it("tops an axis at a round number four even steps reach", () => {
    expect(axisTop(24)).toBe(40);
    expect(axisTop(20)).toBe(20);
    expect(axisTop(28)).toBe(40);
    expect(axisTop(3)).toBe(4);
    expect(axisTop(130)).toBe(200);
    expect(axisTop(0)).toBe(4);
  });
});

const cabins = ["Economy", "Economy+", "Business", "First", "Private"];

describe("PieChart", () => {
  const pie = (slices = [{ label: "Economy", count: 117 }, { label: "First", count: 4 }]) =>
    render(<PieChart title="Class" unit="flights" order={cabins} slices={slices} note="2 flights have no class recorded." />);

  it("is a picture named by what it shows", () => {
    pie();
    expect(screen.getByRole("img", { name: "Class: Economy 97%, First 3%" })).toBeInTheDocument();
  });

  it("gives every slice its name, number and share in a table", () => {
    pie();
    const table = screen.getByRole("table", { name: "Class" });
    const first = within(table).getByRole("row", { name: /First/ });
    expect(within(first).getByRole("rowheader")).toHaveTextContent("First");
    expect(within(first).getAllByRole("cell").map((c) => c.textContent)).toEqual(["4", "3%"]);
  });

  it("colors a slice by its place in the order, not by its size", () => {
    const { container } = pie();
    const fills = [...container.querySelectorAll("svg path")].map((p) => p.getAttribute("fill"));
    // Economy is first in the order and First is fourth, whatever was flown between.
    expect(fills).toEqual(["var(--chart-1)", "var(--chart-4)"]);
  });

  it("starts at twelve o'clock and goes clockwise", () => {
    const { container } = render(
      <PieChart title="Halves" unit="flights" order={["a", "b"]} slices={[{ label: "a", count: 1 }, { label: "b", count: 1 }]} />,
    );
    const [a, b] = [...container.querySelectorAll("svg path")].map((p) => p.getAttribute("d"));
    expect(a).toBe("M100 100L100.00 0.00A100 100 0 0 1 100.00 200.00Z");
    expect(b).toBe("M100 100L100.00 200.00A100 100 0 0 1 100.00 0.00Z");
  });

  it("draws a single slice as a whole circle", () => {
    const { container } = pie([{ label: "Economy", count: 9 }]);
    expect(container.querySelectorAll("svg path")).toHaveLength(0);
    expect(container.querySelector("svg circle")).toHaveAttribute("fill", "var(--chart-1)");
  });

  it("says what was left out", () => {
    pie();
    expect(screen.getByText("2 flights have no class recorded.")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = pie();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("BarList", () => {
  const bars = [
    { label: "DTW", detail: "Detroit", value: 70, shown: "70" },
    { label: "CLT", detail: "Charlotte", value: 35, shown: "35" },
  ];

  it("is a list in the order given, each row with its name and number", () => {
    render(<BarList label="Airports by flights" bars={bars} />);
    const rows = within(screen.getByRole("list", { name: "Airports by flights" })).getAllByRole("listitem");
    expect(rows.map((r) => r.textContent)).toEqual(["DTW Detroit70", "CLT Charlotte35"]);
  });

  it("measures every bar against the longest", () => {
    const { container } = render(<BarList label="Airports" bars={bars} />);
    const widths = [...container.querySelectorAll<HTMLElement>("li > span[aria-hidden] > span")].map(
      (bar) => bar.style.width,
    );
    expect(widths).toEqual(["100%", "50%"]);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<BarList label="Airports" bars={bars} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("LineChart", () => {
  const points = [
    { label: "2024", count: 20 },
    { label: "2025", count: 8 },
    { label: "2026", count: 10 },
  ];
  const chart = () => render(<LineChart title="Flights per year" unit="flights" points={points} />);

  it("is a picture with every number in a table beside it", () => {
    chart();
    expect(screen.getByRole("img", { name: "Flights per year" })).toBeInTheDocument();
    const rows = within(screen.getByRole("table", { name: "Flights per year" })).getAllByRole("row");
    expect(rows.slice(1).map((r) => r.textContent)).toEqual(["202420", "20258", "202610"]);
  });

  it("starts its axis at nothing and tops it at a round number", () => {
    const { container } = chart();
    const ticks = [...container.querySelectorAll("svg g text")].map((t) => t.textContent);
    expect(ticks).toEqual(["0", "5", "10", "15", "20"]);
  });

  it("has a dot for each point that says its number", () => {
    const { container } = chart();
    const dots = [...container.querySelectorAll("svg circle title")].map((t) => t.textContent);
    expect(dots).toEqual(["2024: 20 flights", "2025: 8 flights", "2026: 10 flights"]);
  });

  it("labels along the bottom every nth point, and always the last", () => {
    const years = Array.from({ length: 22 }, (_, i) => ({ label: String(2005 + i), count: i }));
    const { container } = render(<LineChart title="Years" unit="flights" points={years} every={5} />);
    const labels = [...container.querySelectorAll("svg > text")].map((t) => t.textContent);
    // 2025 would sit against 2026, so the last one takes its place. The final text is the peak's number.
    expect(labels).toEqual(["2005", "2010", "2015", "2020", "2026", "21"]);
  });

  it("draws nothing for no points, and does not fail", () => {
    const { container } = render(<LineChart title="Empty" unit="flights" points={[]} />);
    expect(container.querySelectorAll("svg circle")).toHaveLength(0);
  });

  it("has no accessibility violations", async () => {
    const { container } = chart();
    expect(await axe(container)).toHaveNoViolations();
  });
});
