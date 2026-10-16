import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "@/test/axe";
import { OtherCollections, type CollectionSummary } from "./other-collections";

const sampleCollections: CollectionSummary[] = [
  { href: "/collections/recommendations", name: "Recommendations", count: 128 },
  { href: "/collections/life-list", name: "Life list", count: 214 },
  { href: "/collections/travels", name: "Travels", count: 42 },
];

describe("OtherCollections", () => {
  describe("structure and section heading", () => {
    it("renders a section containing the 'Other collections' level 2 heading", () => {
      const { container } = render(
        <OtherCollections collections={sampleCollections} />,
      );

      const section = container.querySelector("section");
      expect(section).toBeInTheDocument();

      const heading = within(section!).getByRole("heading", {
        level: 2,
        name: "Other collections",
      });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe("H2");
    });
  });

  describe("collections list and links", () => {
    it("renders a list containing a list item for each collection", () => {
      render(<OtherCollections collections={sampleCollections} />);

      const list = screen.getByRole("list");
      expect(list).toBeInTheDocument();

      const items = within(list).getAllByRole("listitem");
      expect(items).toHaveLength(sampleCollections.length);
    });

    it("renders each collection link with the expected href, name, and bracketed count", () => {
      render(<OtherCollections collections={sampleCollections} />);

      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(sampleCollections.length);

      sampleCollections.forEach((collection, index) => {
        const link = links[index];
        expect(link).toHaveAttribute("href", collection.href);
        expect(link).toHaveTextContent(collection.name);
        expect(link).toHaveTextContent(`[${collection.count}]`);
        expect(link).toHaveAccessibleName(
          `${collection.name}[${collection.count}]`,
        );
      });
    });

    it("formats zero counts and handles long or special character titles", () => {
      const variedCollections: CollectionSummary[] = [
        { href: "/collections/archive", name: "Archive", count: 0 },
        {
          href: "/collections/field-notes",
          name: "Field Notes & Observations",
          count: 1042,
        },
      ];

      render(<OtherCollections collections={variedCollections} />);

      const zeroLink = screen.getByRole("link", { name: "Archive[0]" });
      expect(zeroLink).toHaveAttribute("href", "/collections/archive");
      expect(zeroLink).toHaveTextContent("[0]");

      const specialLink = screen.getByRole("link", {
        name: "Field Notes & Observations[1042]",
      });
      expect(specialLink).toHaveAttribute("href", "/collections/field-notes");
      expect(specialLink).toHaveTextContent("Field Notes & Observations");
      expect(specialLink).toHaveTextContent("[1042]");
    });
  });

  describe("empty state", () => {
    it("renders the section and empty list without items when collections array is empty", () => {
      const { container } = render(<OtherCollections collections={[]} />);

      const section = container.querySelector("section");
      expect(section).toBeInTheDocument();

      const heading = within(section!).getByRole("heading", {
        level: 2,
        name: "Other collections",
      });
      expect(heading).toBeInTheDocument();

      const list = screen.getByRole("list");
      expect(list).toBeInTheDocument();
      expect(within(list).queryAllByRole("listitem")).toHaveLength(0);
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has no accessibility violations with collections populated", async () => {
      const { container } = render(
        <OtherCollections collections={sampleCollections} />,
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it("has no accessibility violations when collections list is empty", async () => {
      const { container } = render(<OtherCollections collections={[]} />);

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});

