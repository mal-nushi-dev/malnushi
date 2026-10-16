import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "@/test/axe";
import { Eyebrow } from "./eyebrow";

describe("Eyebrow", () => {
  it("renders the section and category text", () => {
    render(<Eyebrow section="Essay" category="Birding" />);

    expect(screen.getByText("Essay")).toBeInTheDocument();
    expect(screen.getByText("Birding")).toBeInTheDocument();
  });

  it("accommodates screen readers by hiding the visual slash and voicing a comma pause", () => {
    render(<Eyebrow section="Travels" category="Log" />);

    const slash = screen.getByText("/");
    expect(slash).toHaveAttribute("aria-hidden", "true");

    const comma = screen.getByText(",");
    expect(comma).toHaveClass("sr-only");
    expect(comma.closest("[aria-hidden='true']")).toBeNull();
  });

  it("handles labels with special characters and spaces", () => {
    render(<Eyebrow section="Design & Architecture" category="Case Studies" />);

    expect(screen.getByText("Design & Architecture")).toBeInTheDocument();
    expect(screen.getByText("Case Studies")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Eyebrow section="Travels" category="Log" />,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

