import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "@/test/axe";
import { EssayHeader } from "./essay-header";

const sampleEssay = {
  category: "Design",
  title: "The Shape of Rhythm",
  standfirst: "How typographical pacing dictates the editorial voice.",
  date: "2026-10-14",
  readingTime: 6,
  tags: ["Typography", "Layout"],
};

describe("EssayHeader", () => {
  it("renders the header landmark with h1 title and standfirst paragraph", () => {
    render(<EssayHeader {...sampleEssay} />);

    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
    expect(header.tagName).toBe("HEADER");

    const heading = screen.getByRole("heading", {
      level: 1,
      name: "The Shape of Rhythm",
    });
    expect(heading).toBeInTheDocument();
    expect(header).toContainElement(heading);

    const standfirst = screen.getByText(
      "How typographical pacing dictates the editorial voice.",
    );
    expect(standfirst).toBeInTheDocument();
    expect(standfirst.tagName).toBe("P");
    expect(header).toContainElement(standfirst);
  });

  it("renders the eyebrow with section fixed to 'Writing' and the given category", () => {
    render(<EssayHeader {...sampleEssay} category="Engineering" />);

    expect(screen.getByText("Writing")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
  });

  it("renders the publication date inside a time element with the dateTime attribute", () => {
    render(<EssayHeader {...sampleEssay} date="2026-09-28" />);

    const timeElement = screen.getByText("2026-09-28");
    expect(timeElement.tagName).toBe("TIME");
    expect(timeElement).toHaveAttribute("dateTime", "2026-09-28");
  });

  it("renders the reading time in minutes", () => {
    render(<EssayHeader {...sampleEssay} readingTime={8} />);

    expect(screen.getByText("8 min read")).toBeInTheDocument();
  });

  it("renders the metadata list with date, reading time, and all provided tags", () => {
    render(
      <EssayHeader {...sampleEssay} tags={["Typography", "Grid", "Pacing"]} />,
    );

    const list = screen.getByRole("list");
    const items = within(list).getAllByRole("listitem");

    expect(items.map((item) => item.textContent)).toEqual([
      "2026-10-14",
      "6 min read",
      "Typography",
      "Grid",
      "Pacing",
    ]);
  });

  it("defaults to an empty tags list when tags are omitted", () => {
    const propsWithoutTags = { ...sampleEssay, tags: undefined };
    render(<EssayHeader {...propsWithoutTags} />);

    const list = screen.getByRole("list");
    const items = within(list).getAllByRole("listitem");

    expect(items.map((item) => item.textContent)).toEqual([
      "2026-10-14",
      "6 min read",
    ]);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <main>
        <EssayHeader {...sampleEssay} />
      </main>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

