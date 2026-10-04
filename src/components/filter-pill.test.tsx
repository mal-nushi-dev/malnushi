import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FilterPill } from "./filter-pill";

describe("FilterPill", () => {
  it("is a button named by its label", () => {
    render(<FilterPill>Warblers</FilterPill>);
    expect(screen.getByRole("button", { name: "Warblers" })).toBeInTheDocument();
  });

  it("is not a submit button", () => {
    render(<FilterPill>Warblers</FilterPill>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("reports its state with aria-pressed", () => {
    const { rerender } = render(<FilterPill>Warblers</FilterPill>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
    rerender(<FilterPill active>Warblers</FilterPill>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onClick, and not when disabled", async () => {
    const onClick = vi.fn();
    const { rerender } = render(<FilterPill onClick={onClick}>Wrens</FilterPill>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
    rerender(
      <FilterPill onClick={onClick} disabled>
        Wrens
      </FilterPill>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("activates from the keyboard", async () => {
    const onClick = vi.fn();
    render(<FilterPill onClick={onClick}>Wrens</FilterPill>);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
