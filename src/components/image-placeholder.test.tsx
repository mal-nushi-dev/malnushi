import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "@/test/axe";
import { ImagePlaceholder, ImageSlot } from "./image-placeholder";

describe("ImagePlaceholder", () => {
  describe("hero size", () => {
    it("renders with role='img', accessible label, dimensions text, and hero layout styles", () => {
      render(<ImagePlaceholder size="hero" />);

      const el = screen.getByRole("img", {
        name: "Image placeholder, 1248 by 640",
      });
      expect(el).toBeInTheDocument();
      expect(el).toHaveTextContent("HERO — 1248 × 640");
      expect(el).toHaveStyle({
        maxWidth: "1248px",
        aspectRatio: "1248 / 640",
      });
      expect(el).toHaveClass("bg-line");
    });
  });

  describe("column size", () => {
    it("renders with role='img', accessible label, dimensions text, and column layout styles", () => {
      render(<ImagePlaceholder size="column" />);

      const el = screen.getByRole("img", {
        name: "Image placeholder, 680 by 453",
      });
      expect(el).toBeInTheDocument();
      expect(el).toHaveTextContent("COLUMN — 680 × 453");
      expect(el).toHaveStyle({
        maxWidth: "680px",
        aspectRatio: "680 / 453",
      });
      expect(el).toHaveClass("bg-line");
    });
  });

  describe("accessibility", () => {
    it("has no automated accessibility violations", async () => {
      const { container } = render(<ImagePlaceholder size="hero" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

describe("ImageSlot", () => {
  it("renders with role='img', accessible name, visible label, and applies custom className", () => {
    render(
      <ImageSlot
        label="FEATURE IMAGE — 718 × 479"
        className="aspect-3/2 custom-frame"
      />,
    );

    const el = screen.getByRole("img", {
      name: "Image placeholder, FEATURE IMAGE — 718 × 479",
    });
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent("FEATURE IMAGE — 718 × 479");
    expect(el).toHaveClass("aspect-3/2");
    expect(el).toHaveClass("custom-frame");
    expect(el).toHaveClass("bg-line");
  });

  describe("accessibility", () => {
    it("has no automated accessibility violations", async () => {
      const { container } = render(
        <ImageSlot label="Diagram placeholder" className="aspect-square" />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

