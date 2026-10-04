import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Toolbar } from "./toolbar";

const filters = ["All", "Wrens", "Warblers"];

describe("Toolbar", () => {
  it("groups the filters under the name Filter", () => {
    render(<Toolbar filters={filters} active="All" sort="First seen ↓" />);
    const group = screen.getByRole("group", { name: "Filter" });
    expect(within(group).getAllByRole("button")).toHaveLength(3);
  });

  it("presses only the active filter", () => {
    render(<Toolbar filters={filters} active="Wrens" sort="First seen ↓" />);
    expect(screen.getByRole("button", { name: "Wrens" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "Warblers" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("presses nothing when the active filter is not in the list", () => {
    render(<Toolbar filters={filters} active="Owls" sort="First seen ↓" />);
    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveAttribute("aria-pressed", "false");
    }
  });

  it("shows the sort label", () => {
    render(<Toolbar filters={filters} active="All" sort="First seen ↓" />);
    expect(screen.getByText("Sort: First seen ↓")).toBeInTheDocument();
  });

  it("renders with no filters", () => {
    render(<Toolbar filters={[]} active="" sort="A–Z" />);
    expect(screen.getByRole("group", { name: "Filter" })).toBeEmptyDOMElement();
  });
});
