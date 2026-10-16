import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "@/test/axe";
import { PageSection } from "./page-section";

describe("PageSection", () => {
  describe("rendering and semantics", () => {
    it("renders as a section element by default with provided children", () => {
      render(
        <PageSection>
          <p>Section content</p>
        </PageSection>,
      );

      const section = screen.getByText("Section content").closest("section");
      expect(section).toBeInTheDocument();
      expect(section?.tagName).toBe("SECTION");
    });

    it("renders as a div element when as='div'", () => {
      render(
        <PageSection as="div">
          <p>Div content</p>
        </PageSection>,
      );

      const element = screen.getByText("Div content").parentElement;
      expect(element?.tagName).toBe("DIV");
    });

    it("renders as an ordered list element when as='ol'", () => {
      render(
        <PageSection as="ol">
          <li>First item</li>
          <li>Second item</li>
        </PageSection>,
      );

      const list = screen.getByRole("list");
      expect(list.tagName).toBe("OL");
      expect(screen.getAllByRole("listitem")).toHaveLength(2);
    });
  });

  describe("spacing", () => {
    it("applies the 2xl spacing class by default", () => {
      const { container } = render(<PageSection>Content</PageSection>);

      expect(container.firstElementChild).toHaveClass("page", "pt-(--space-2xl)");
      expect(container.firstElementChild).not.toHaveClass("pt-(--space-block)");
    });

    it("applies the block spacing class when space='block'", () => {
      const { container } = render(
        <PageSection space="block">Content</PageSection>,
      );

      expect(container.firstElementChild).toHaveClass("page", "pt-(--space-block)");
      expect(container.firstElementChild).not.toHaveClass("pt-(--space-2xl)");
    });

    it("applies the 2xl spacing class when space='2xl'", () => {
      const { container } = render(
        <PageSection space="2xl">Content</PageSection>,
      );

      expect(container.firstElementChild).toHaveClass("page", "pt-(--space-2xl)");
      expect(container.firstElementChild).not.toHaveClass("pt-(--space-block)");
    });
  });

  describe("class name composition", () => {
    it("merges custom className with base layout and spacing classes", () => {
      const { container } = render(
        <PageSection className="flex flex-col gap-4">Content</PageSection>,
      );

      expect(container.firstElementChild).toHaveClass(
        "page",
        "pt-(--space-2xl)",
        "flex",
        "flex-col",
        "gap-4",
      );
    });

    it("does not produce undefined or trailing extra classes when className is omitted", () => {
      const { container } = render(<PageSection>Content</PageSection>);

      expect(container.firstElementChild?.className).toBe("page pt-(--space-2xl)");
    });
  });

  describe("accessibility", () => {
    it("has no automated accessibility violations in default configuration", async () => {
      const { container } = render(
        <PageSection>
          <h2>Section Title</h2>
          <p>Accessible section body.</p>
        </PageSection>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no automated accessibility violations when rendered as an ordered list", async () => {
      const { container } = render(
        <PageSection as="ol">
          <li>List Item 1</li>
          <li>List Item 2</li>
        </PageSection>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

