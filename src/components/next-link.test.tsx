import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "@/test/axe";
import { NextLink } from "./next-link";

describe("NextLink", () => {
  const defaultProps = {
    label: "Next essay",
    title: "Designing with Sound",
    href: "/writing/designing-with-sound",
  };

  describe("navigation and link contract", () => {
    it("renders a semantic link targeting the specified href", () => {
      render(<NextLink {...defaultProps} />);

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/writing/designing-with-sound");
    });

    it("displays both the label and title within the link", () => {
      render(<NextLink {...defaultProps} />);

      const link = screen.getByRole("link");
      expect(within(link).getByText("Next essay")).toBeInTheDocument();
      expect(within(link).getByText("Designing with Sound")).toBeInTheDocument();
    });

    it("exposes an accessible name containing both the label and title", () => {
      render(<NextLink {...defaultProps} />);

      const link = screen.getByRole("link", {
        name: /Next essay.*Designing with Sound/i,
      });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAccessibleName(/Next essay.*Designing with Sound/i);
    });

    it("renders different navigation labels and paths correctly", () => {
      render(
        <NextLink
          label="Previous issue"
          title="Letter from the Studio"
          href="/writing/letter-from-the-studio"
        />,
      );

      const link = screen.getByRole("link", {
        name: /Previous issue.*Letter from the Studio/i,
      });
      expect(link).toHaveAttribute("href", "/writing/letter-from-the-studio");
      expect(within(link).getByText("Previous issue")).toBeInTheDocument();
      expect(within(link).getByText("Letter from the Studio")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has no automated accessibility violations", async () => {
      const { container } = render(<NextLink {...defaultProps} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

