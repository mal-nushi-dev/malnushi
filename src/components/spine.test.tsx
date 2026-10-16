import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "@/test/axe";
import { Spine, type SpineProps } from "./spine";

const baseProps: SpineProps = {
  href: "/collections/travels",
  title: "Travels",
  index: 4,
  count: 123,
  category: "Places and nature",
  description: "Dispatches and memories from journeys near and far.",
  sentence: [
    { text: "I have visited ", loud: false },
    { text: "123 places", loud: true },
    { text: " across the globe.", loud: false },
  ],
  newest: [
    { id: "row-1", label: "2026-09-27", text: "Kyoto autumn walk" },
    { id: "row-2", label: "2026-08-15", text: "Bergen fjords hike" },
  ],
  tick: 36,
};

describe("Spine", () => {
  it("renders a link targeting href with view-transition origin attribute", () => {
    render(<Spine {...baseProps} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/collections/travels");
    expect(link).toHaveAttribute("data-vt-origin", "");
  });

  it("renders an accessible sr-only heading defaulting to level 2", () => {
    render(<Spine {...baseProps} />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Travels" }),
    ).toBeInTheDocument();
  });

  it("renders an accessible sr-only heading at level 3 when specified", () => {
    render(<Spine {...baseProps} level={3} />);
    expect(
      screen.getByRole("heading", { level: 3, name: "Travels" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
  });

  it("renders an accessible summary containing sentence text, description, and newest rows", () => {
    const { container } = render(<Spine {...baseProps} />);
    const srOnly = container.querySelector(".sr-only");
    expect(srOnly).not.toBeNull();
    expect(srOnly).toHaveTextContent(
      "I have visited 123 places across the globe.. Dispatches and memories from journeys near and far.. 2026-09-27, Kyoto autumn walk. 2026-08-15, Bergen fjords hike",
    );
  });

  it("composes the accessible summary cleanly when description and newest rows are omitted", () => {
    const { container } = render(
      <Spine {...baseProps} description={undefined} newest={[]} />,
    );
    const srOnly = container.querySelector(".sr-only");
    expect(srOnly).not.toBeNull();
    expect(srOnly).toHaveTextContent("I have visited 123 places across the globe.");
    expect(srOnly).not.toHaveTextContent("Dispatches and memories");
  });

  it("renders visual presentation elements inside an aria-hidden container", () => {
    const { container } = render(<Spine {...baseProps} />);
    const ariaHidden = container.querySelector("[aria-hidden='true']");
    expect(ariaHidden).not.toBeNull();
    const visual = within(ariaHidden as HTMLElement);

    expect(visual.getByText("004")).toHaveClass("type-meta");
    expect(visual.getByText("Travels")).toHaveClass("type-index-title");
    expect(visual.getByText("123")).toHaveClass("type-meta");
    const tick = ariaHidden!.querySelector("i");
    expect(tick).toHaveStyle({ width: "36px" });
    expect(visual.getByText("Open travels →")).toBeInTheDocument();
  });

  it("renders category and description in the visual drawer when present", () => {
    const { container } = render(<Spine {...baseProps} />);
    const ariaHidden = container.querySelector("[aria-hidden='true']") as HTMLElement;
    const visual = within(ariaHidden);

    expect(visual.getByText("Places and nature")).toHaveClass("type-label");
    expect(
      visual.getByText("Dispatches and memories from journeys near and far."),
    ).toHaveClass("type-ui");
  });

  it("omits category and description from the visual drawer when undefined", () => {
    const { container } = render(
      <Spine {...baseProps} category={undefined} description={undefined} />,
    );
    const ariaHidden = container.querySelector("[aria-hidden='true']") as HTMLElement;
    const visual = within(ariaHidden);

    expect(visual.queryByText("Places and nature")).not.toBeInTheDocument();
    expect(
      visual.queryByText("Dispatches and memories from journeys near and far."),
    ).not.toBeInTheDocument();
  });

  it("highlights loud sentence parts with text-ink styling in the visual drawer", () => {
    const { container } = render(<Spine {...baseProps} />);
    const ariaHidden = container.querySelector("[aria-hidden='true']") as HTMLElement;
    const quote = ariaHidden.querySelector(".type-quote");
    expect(quote).not.toBeNull();

    const quietPart1 = within(quote as HTMLElement).getByText("I have visited");
    const loudPart = within(quote as HTMLElement).getByText("123 places");
    const quietPart2 = within(quote as HTMLElement).getByText("across the globe.");

    expect(loudPart).toHaveClass("text-ink");
    expect(quietPart1).not.toHaveClass("text-ink");
    expect(quietPart2).not.toHaveClass("text-ink");
  });

  it("renders newest rows with labels and text in the visual drawer", () => {
    const { container } = render(<Spine {...baseProps} />);
    const ariaHidden = container.querySelector("[aria-hidden='true']") as HTMLElement;
    const visual = within(ariaHidden);

    expect(visual.getByText("2026-09-27")).toBeInTheDocument();
    expect(visual.getByText("Kyoto autumn walk")).toBeInTheDocument();
    expect(visual.getByText("2026-08-15")).toBeInTheDocument();
    expect(visual.getByText("Bergen fjords hike")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <main>
        <h1>Collections</h1>
        <Spine {...baseProps} />
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

