import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { sections } from "@/lib/site";
import { axe } from "@/test/axe";
import { Footer } from "./footer";

describe("Footer", () => {
  describe("landmarks and structure", () => {
    it("renders the footer element with the contentinfo role", () => {
      render(<Footer />);
      const footer = screen.getByRole("contentinfo");
      expect(footer).toBeInTheDocument();
      expect(footer.tagName).toBe("FOOTER");
    });

    it("renders a navigation landmark with the accessible name 'Footer'", () => {
      render(<Footer />);
      const nav = screen.getByRole("navigation", { name: "Footer" });
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAccessibleName("Footer");
    });

    it("structures navigation links inside a semantic list", () => {
      render(<Footer />);
      const nav = screen.getByRole("navigation", { name: "Footer" });
      const list = within(nav).getByRole("list");
      const items = within(list).getAllByRole("listitem");
      expect(items).toHaveLength(sections.length);
    });
  });

  describe("navigation links", () => {
    it("lists the site sections in order with their target URLs", () => {
      render(<Footer />);
      const nav = screen.getByRole("navigation", { name: "Footer" });
      const links = within(nav).getAllByRole("link");

      expect(
        links.map((link) => [link.textContent, link.getAttribute("href")]),
      ).toEqual([
        ["Home", "/"],
        ["Writing", "/writing"],
        ["Projects", "/projects"],
        ["Collections", "/collections"],
        ["About", "/about"],
      ]);
    });

    it("derives all section links from site configuration", () => {
      render(<Footer />);
      const nav = screen.getByRole("navigation", { name: "Footer" });

      sections.forEach((section) => {
        const link = within(nav).getByRole("link", { name: section.label });
        expect(link).toHaveAttribute("href", section.href);
      });
    });
  });

  describe("copyright and colophon", () => {
    it("displays the copyright statement and location", () => {
      render(<Footer />);
      const copyright = screen.getByText(/© 2026 Mal Nushi/);
      expect(copyright).toBeInTheDocument();
      expect(copyright).toHaveTextContent(/Made with/);
      expect(copyright).toHaveTextContent(/in Charlotte/);
    });

    it("renders the heart text glyph with the accessible label 'love'", () => {
      render(<Footer />);
      const heart = screen.getByLabelText("love");
      expect(heart).toBeInTheDocument();
      expect(heart).toHaveTextContent("♥");
      expect(heart.textContent?.codePointAt(0)).toBe(0x2665);
    });
  });

  describe("accessibility", () => {
    it("has no automated accessibility violations", async () => {
      const { container } = render(<Footer />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

