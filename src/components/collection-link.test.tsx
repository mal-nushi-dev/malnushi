import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "@/test/axe";
import { CollectionLink } from "./collection-link";

describe("CollectionLink", () => {
  it("renders a link pointing to the destination href", () => {
    render(
      <CollectionLink
        href="/collections/recommendations"
        name="Recommendations"
        count={128}
      />,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/collections/recommendations");
  });

  it("displays the collection name and count formatted in brackets", () => {
    render(
      <CollectionLink
        href="/collections/life-list"
        name="Life list"
        count={214}
      />,
    );

    expect(screen.getByText("Life list")).toBeInTheDocument();
    expect(screen.getByText("[214]")).toBeInTheDocument();
  });

  it("exposes the full accessible name combining name and bracketed count", () => {
    render(
      <CollectionLink
        href="/collections/recommendations"
        name="Recommendations"
        count={128}
      />,
    );

    const link = screen.getByRole("link", { name: "Recommendations[128]" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAccessibleName("Recommendations[128]");
  });

  it("formats zero count in brackets without omitting it", () => {
    render(
      <CollectionLink
        href="/collections/empty"
        name="Archive"
        count={0}
      />,
    );

    expect(screen.getByText("[0]")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Archive[0]" }),
    ).toHaveAttribute("href", "/collections/empty");
  });

  it("handles names with special characters and large numbers", () => {
    render(
      <CollectionLink
        href="/collections/field-notes"
        name="Field Notes & Observations"
        count={1042}
      />,
    );

    expect(screen.getByText("Field Notes & Observations")).toBeInTheDocument();
    expect(screen.getByText("[1042]")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Field Notes & Observations[1042]" }),
    ).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <CollectionLink
        href="/collections/recommendations"
        name="Recommendations"
        count={128}
      />,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
