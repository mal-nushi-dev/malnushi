import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "@/test/axe";
import { Tabs } from "./tabs";

const tabs = [
  { label: "By flights", panel: <p>Seventy</p> },
  { label: "By distance", panel: <p>Far</p> },
  { label: "By time", panel: <p>Long</p> },
];
const show = () => render(<Tabs label="Rank airports by" tabs={tabs} />);
const tab = (name: string) => screen.getByRole("tab", { name });

describe("Tabs", () => {
  it("is a named list of tabs with the first selected and its panel shown", () => {
    show();
    expect(screen.getByRole("tablist", { name: "Rank airports by" })).toBeInTheDocument();
    expect(tab("By flights")).toHaveAttribute("aria-selected", "true");
    expect(tab("By distance")).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("tabpanel", { name: "By flights" })).toHaveTextContent("Seventy");
    expect(screen.getAllByRole("tabpanel")).toHaveLength(1);
  });

  it("keeps every panel in the page, hidden until its tab is chosen", () => {
    show();
    expect(screen.getByText("Far")).not.toBeVisible();
    expect(tab("By distance")).toHaveAttribute("aria-controls", screen.getByText("Far").parentElement!.id);
  });

  it("shows a panel when its tab is clicked", async () => {
    show();
    await userEvent.click(tab("By distance"));
    expect(tab("By distance")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "By distance" })).toHaveTextContent("Far");
    expect(screen.getByText("Seventy")).not.toBeVisible();
  });

  it("is one stop for the Tab key, and moves between tabs with the arrows", async () => {
    show();
    await userEvent.tab();
    expect(tab("By flights")).toHaveFocus();
    expect(tab("By distance")).toHaveAttribute("tabindex", "-1");
    await userEvent.keyboard("{ArrowRight}");
    expect(tab("By distance")).toHaveFocus();
    expect(tab("By distance")).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    // Past the first is the last.
    expect(tab("By time")).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(tab("By flights")).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(tab("By time")).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(tab("By flights")).toHaveFocus();
  });

  it("has no accessibility violations", async () => {
    const { container } = show();
    expect(await axe(container)).toHaveNoViolations();
  });
});
