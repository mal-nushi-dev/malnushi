import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "@/test/axe";
import { Stat, StatCard, StatPart } from "./stat";

describe("Stat", () => {
  it("shows its number and what it counts", () => {
    render(<Stat value={214} label="Species seen" />);
    expect(screen.getByText("214")).toBeInTheDocument();
    expect(screen.getByText("Species seen")).toBeInTheDocument();
  });

  it("shows the parts its number is made of", () => {
    render(
      <Stat value={123} label="Flights">
        <StatPart value={73} label="Domestic" />
        <StatPart value={50} label="International" />
      </Stat>,
    );
    expect(screen.getByText("Domestic").previousElementSibling).toHaveTextContent("73");
    expect(screen.getByText("International").previousElementSibling).toHaveTextContent("50");
  });
});

describe("StatCard", () => {
  it("has the same number, label and parts as a stat", () => {
    render(
      <StatCard value="123" label="Flights">
        <StatPart value="73" label="Domestic" />
      </StatCard>,
    );
    expect(screen.getByText("123")).toBeInTheDocument();
    expect(screen.getByText("Flights")).toBeInTheDocument();
    expect(screen.getByText("Domestic")).toBeInTheDocument();
  });

  it("hides its backdrop from assistive technology and leaves the text", () => {
    render(
      <StatCard value="6.5×" label="Around the Earth" backdrop={<canvas data-testid="scene" />} />,
    );
    expect(screen.getByTestId("scene").closest("[aria-hidden='true']")).not.toBeNull();
    expect(screen.getByText("6.5×").closest("[aria-hidden='true']")).toBeNull();
    expect(screen.queryByRole("figure")).not.toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <StatCard value="0.68×" label="Miles flown" backdrop={<canvas />}>
        <StatPart value="0.68×" label="Of the way to the Moon" />
      </StatCard>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
