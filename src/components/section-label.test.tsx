import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "@/test/axe";
import { SectionLabel } from "./section-label";

describe("SectionLabel", () => {
  it("renders a level 2 heading with children by default", () => {
    render(<SectionLabel>Default Heading</SectionLabel>);

    const heading = screen.getByRole("heading", {
      level: 2,
      name: "Default Heading",
    });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe("H2");
  });

  describe("polymorphic as prop", () => {
    it("renders a level 3 heading when as=\"h3\" is specified", () => {
      render(<SectionLabel as="h3">Subheading</SectionLabel>);

      const heading = screen.getByRole("heading", {
        level: 3,
        name: "Subheading",
      });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe("H3");
    });

    it("renders a paragraph when as=\"p\" is specified", () => {
      render(<SectionLabel as="p">Paragraph Label</SectionLabel>);

      const paragraph = screen.getByText("Paragraph Label");
      expect(paragraph).toBeInTheDocument();
      expect(paragraph.tagName).toBe("P");
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    });
  });

  describe("children rendering", () => {
    it("renders plain text children", () => {
      render(<SectionLabel>Recent Articles</SectionLabel>);

      expect(screen.getByText("Recent Articles")).toBeInTheDocument();
    });

    it("renders complex ReactNode children", () => {
      render(
        <SectionLabel>
          <span>Title</span>
          <span data-testid="count">(12)</span>
        </SectionLabel>,
      );

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toContainElement(screen.getByTestId("count"));
      expect(heading).toHaveTextContent("Title(12)");
    });
  });

  describe("accessibility", () => {
    it("has no accessibility violations with default heading", async () => {
      const { container } = render(
        <SectionLabel>Accessible Heading</SectionLabel>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it("has no accessibility violations when rendered as paragraph", async () => {
      const { container } = render(
        <SectionLabel as="p">Accessible Paragraph</SectionLabel>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});

