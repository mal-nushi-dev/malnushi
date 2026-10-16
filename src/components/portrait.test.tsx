import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "@/test/axe";
import { Portrait } from "./portrait";

describe("Portrait", () => {
  describe("semantics and accessibility tree", () => {
    it("renders an SVG with the img role and accessible label describing Mal", () => {
      render(<Portrait />);
      const svg = screen.getByRole("img", {
        name: "Line drawing of Mal: a smiling man with his hair tied up in a bun and a large, curled handlebar mustache.",
      });

      expect(svg).toBeInTheDocument();
      expect(svg.tagName.toLowerCase()).toBe("svg");
    });

    it("defines the expected viewBox for vector scaling", () => {
      render(<Portrait />);
      const svg = screen.getByRole("img", { name: /Line drawing of Mal/i });

      expect(svg).toHaveAttribute("viewBox", "0 0 400 480");
    });
  });

  describe("styling and className propagation", () => {
    it("propagates a custom className to the root SVG element", () => {
      render(<Portrait className="h-48 w-40 text-accent" />);
      const svg = screen.getByRole("img", { name: /Line drawing of Mal/i });

      expect(svg).toHaveClass("h-48", "w-40", "text-accent");
    });

    it("renders without a class attribute when no className is provided", () => {
      render(<Portrait />);
      const svg = screen.getByRole("img", { name: /Line drawing of Mal/i });

      expect(svg).not.toHaveAttribute("class");
    });
  });

  describe("accessibility", () => {
    it("has no automated accessibility violations", async () => {
      const { container } = render(<Portrait />);
      const results = await axe(container);

      expect(results).toHaveNoViolations();
    });
  });
});

