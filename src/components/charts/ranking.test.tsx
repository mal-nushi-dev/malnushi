import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "@/test/axe";
import { Ranking, RankingTitle } from "./ranking";

const bars = (n: number) => [
  { label: "CLT", value: n, shown: String(n) },
  { label: "JFK", value: 1, shown: "1" },
];

describe("Ranking", () => {
  it("is one named list when there is one measure", () => {
    render(
      <Ranking heading={<h3>Countries</h3>} subject="Countries" measures={[{ label: "By flights landed", bars: bars(3) }]}>
        <p>2 more, none landed in.</p>
      </Ranking>,
    );
    expect(screen.getByRole("list", { name: "Countries by flights landed" })).toBeInTheDocument();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.getByText("2 more, none landed in.")).toBeInTheDocument();
  });

  it("switches between measures with tabs", () => {
    render(
      <Ranking
        heading={<RankingTitle title="Airports" total={42} />}
        subject="Airports"
        measures={[
          { label: "By flights", bars: bars(3) },
          { label: "By distance", bars: bars(9) },
        ]}
      />,
    );
    expect(screen.getByRole("tablist", { name: "Rank airports by" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "By distance" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Airports42 in all");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Ranking
        heading={<RankingTitle title="Airlines" total={5} />}
        subject="Airlines"
        measures={[
          { label: "By flights", bars: bars(3) },
          { label: "By distance", bars: bars(9) },
        ]}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
