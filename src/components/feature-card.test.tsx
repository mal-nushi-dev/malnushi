import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "@/test/axe";
import { FeatureCard } from "./feature-card";

const image = <div role="img" aria-label="Cover" />;

describe("FeatureCard", () => {
  it("is one link holding the image, eyebrow, title and summary", () => {
    render(
      <FeatureCard
        href="/projects/dns-filter"
        image={image}
        eyebrow={{ section: "Projects", category: "Code" }}
        title="DNS filter"
        summary="A denylist I can edit from my phone."
      />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/projects/dns-filter");
    expect(link).toContainElement(screen.getByRole("img", { name: "Cover" }));
    expect(link).toContainElement(screen.getByRole("heading", { level: 3, name: "DNS filter" }));
    expect(link).toHaveTextContent("A denylist I can edit from my phone.");
  });

  it("can be the section's main heading, with a date", () => {
    render(
      <FeatureCard
        href="#"
        size="lead"
        as="h2"
        image={image}
        eyebrow={{ section: "Writing", category: "Birding" }}
        title="The list that keeps me looking"
        meta="2026-09-28"
      />,
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveClass("type-quote");
    expect(screen.getByText("2026-09-28")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <FeatureCard href="#" size="small" image={image} eyebrow={{ section: "Writing", category: "Notes" }} title="Small" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
