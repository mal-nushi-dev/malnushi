import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "@/test/axe";
import { PageHeader } from "./page-header";
import { PageSection } from "./page-section";

describe("PageHeader", () => {
  it("is the page's heading, with its eyebrow and standfirst", () => {
    render(
      <PageHeader
        eyebrow={{ section: "Travels", category: "Log" }}
        title="Flight log"
        standfirst="Every flight I have taken, newest first."
      >
        <a href="/collections/travels">The map</a>
      </PageHeader>,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Flight log");
    expect(screen.getByText("Travels")).toBeInTheDocument();
    expect(screen.getByText("Every flight I have taken, newest first.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "The map" })).toBeInTheDocument();
  });

  it("needs only a title", () => {
    const { container } = render(<PageHeader title="Collections" />);
    expect(container.querySelectorAll("header > *")).toHaveLength(1);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <main>
        <PageHeader eyebrow={{ section: "Music", category: "Tracks" }} title="Music" standfirst="Newest first." />
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("PageSection", () => {
  it("is a section spaced 2xl from the band above, unless asked otherwise", () => {
    const { container, rerender } = render(<PageSection>x</PageSection>);
    expect(container.firstElementChild).toHaveProperty("tagName", "SECTION");
    expect(container.firstElementChild).toHaveClass("page", "pt-(--space-2xl)");

    rerender(
      <PageSection as="ol" space="block" className="flex">
        <li>x</li>
      </PageSection>,
    );
    expect(container.firstElementChild).toHaveProperty("tagName", "OL");
    expect(container.firstElementChild).toHaveClass("page", "pt-(--space-block)", "flex");
  });
});
