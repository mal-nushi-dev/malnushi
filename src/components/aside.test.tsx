import { render, screen } from "@testing-library/react";
import Link from "next/link";
import { describe, expect, it } from "vitest";
import { axe } from "@/test/axe";
import { Aside } from "./aside";

describe("Aside", () => {
  it("renders as an aside landmark containing the provided content", () => {
    const { container } = render(
      <Aside>A margin note providing additional background.</Aside>,
    );

    const aside = screen.getByRole("complementary");
    expect(aside).toBeInTheDocument();
    expect(container.firstElementChild?.tagName).toBe("ASIDE");

    const content = screen.getByText("A margin note providing additional background.");
    expect(content).toBeInTheDocument();
    expect(content.tagName).toBe("P");
  });

  it("shows a marker when one is provided", () => {
    render(
      <Aside marker="1">
        Footnote reference explaining the citation.
      </Aside>,
    );

    const marker = screen.getByText("1");
    expect(marker).toBeInTheDocument();
    expect(marker.tagName).toBe("SPAN");

    const content = screen.getByText("Footnote reference explaining the citation.");
    expect(content).toBeInTheDocument();
    expect(marker.nextElementSibling).toBe(content);
  });

  it("omits the marker element when none is provided", () => {
    const { container, rerender } = render(
      <Aside>Unmarked margin note.</Aside>,
    );

    expect(screen.getByText("Unmarked margin note.")).toBeInTheDocument();
    expect(container.querySelector("span")).toBeNull();

    // Also verify when marker is empty
    rerender(<Aside marker="">Unmarked margin note.</Aside>);
    expect(container.querySelector("span")).toBeNull();
  });

  it("renders rich elements within its children", () => {
    render(
      <Aside marker="*">
        See also <Link href="/writing/references">the references</Link> for more details.
      </Aside>,
    );

    const link = screen.getByRole("link", { name: "the references" });
    expect(link).toHaveAttribute("href", "/writing/references");
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("has no accessibility violations with marker", async () => {
    const { container } = render(
      <main>
        <Aside marker="1">A note with a marker reference.</Aside>
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no accessibility violations without marker", async () => {
    const { container } = render(
      <main>
        <Aside>An unmarked note in the margin.</Aside>
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
