import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { NoteItem } from "@/components/note";
import { axe } from "@/test/axe";
import { WireNotes } from "./wire-notes";

const sampleNotes: NoteItem[] = [
  {
    id: "2026-04-12-morning-light",
    day: "2026-04-12",
    time: "8:30 AM EDT",
    body: "Brewing a light roast while watching the fog roll across the harbor.",
  },
  {
    id: "2026-04-11-evening-walk",
    day: "2026-04-11",
    time: "7:45 PM EDT",
    body: "Streetlamps flickering on along the cobblestones.",
  },
];

describe("WireNotes", () => {
  describe("structure and listing", () => {
    it("renders an ordered list containing a list item for each note", () => {
      render(<WireNotes notes={sampleNotes} />);

      const list = screen.getByRole("list");
      expect(list.tagName).toBe("OL");

      const items = screen.getAllByRole("listitem");
      expect(items).toHaveLength(2);
    });

    it("handles an empty notes array by rendering an empty ordered list", () => {
      const { container } = render(<WireNotes notes={[]} />);

      const ol = container.querySelector("ol");
      expect(ol).toBeInTheDocument();
      expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    });
  });

  describe("note content and permalink", () => {
    it("renders each note body inside a paragraph", () => {
      render(<WireNotes notes={sampleNotes} />);

      const items = screen.getAllByRole("listitem");

      expect(
        within(items[0]).getByText(
          "Brewing a light roast while watching the fog roll across the harbor.",
        ),
      ).toBeInTheDocument();
      expect(
        within(items[1]).getByText(
          "Streetlamps flickering on along the cobblestones.",
        ),
      ).toBeInTheDocument();
    });

    it("supports complex ReactNode elements in the note body", () => {
      const richNotes: NoteItem[] = [
        {
          id: "rich-note",
          day: "2026-04-13",
          time: "10:15 AM EDT",
          body: (
            <span>
              Testing <em>emphasized</em> text and a{" "}
              <strong data-testid="bold-elem">bold phrase</strong>.
            </span>
          ),
        },
      ];

      render(<WireNotes notes={richNotes} />);

      expect(screen.getByText("emphasized").tagName).toBe("EM");
      expect(screen.getByTestId("bold-elem")).toHaveTextContent("bold phrase");
    });

    it("renders a permalink targeting /writing/notes/[id] with formatted day and time", () => {
      render(<WireNotes notes={sampleNotes} />);

      const items = screen.getAllByRole("listitem");

      const firstLink = within(items[0]).getByRole("link", {
        name: "2026-04-12 · 8:30 AM EDT",
      });
      expect(firstLink).toHaveAttribute(
        "href",
        "/writing/notes/2026-04-12-morning-light",
      );

      const secondLink = within(items[1]).getByRole("link", {
        name: "2026-04-11 · 7:45 PM EDT",
      });
      expect(secondLink).toHaveAttribute(
        "href",
        "/writing/notes/2026-04-11-evening-walk",
      );
    });
  });

  describe("typography variants", () => {
    it("applies the 'type-small' typography class by default", () => {
      render(<WireNotes notes={sampleNotes} />);

      const items = screen.getAllByRole("listitem");
      const paragraph = within(items[0]).getByText(
        "Brewing a light roast while watching the fog roll across the harbor.",
      );

      expect(paragraph).toHaveClass("type-small");
      expect(paragraph).not.toHaveClass("type-ui");
    });

    it("applies the 'type-ui' typography class when type is 'type-ui'", () => {
      render(<WireNotes notes={sampleNotes} type="type-ui" />);

      const items = screen.getAllByRole("listitem");
      const paragraph = within(items[0]).getByText(
        "Brewing a light roast while watching the fog roll across the harbor.",
      );

      expect(paragraph).toHaveClass("type-ui");
      expect(paragraph).not.toHaveClass("type-small");
    });

    it("applies the 'type-small' typography class when explicitly specified", () => {
      render(<WireNotes notes={sampleNotes} type="type-small" />);

      const items = screen.getAllByRole("listitem");
      const paragraph = within(items[0]).getByText(
        "Brewing a light roast while watching the fog roll across the harbor.",
      );

      expect(paragraph).toHaveClass("type-small");
      expect(paragraph).not.toHaveClass("type-ui");
    });
  });

  describe("accessibility", () => {
    it("has no accessibility violations with multiple notes", async () => {
      const { container } = render(
        <main>
          <h1>Wire Notes</h1>
          <WireNotes notes={sampleNotes} />
        </main>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it("has no accessibility violations when empty", async () => {
      const { container } = render(
        <main>
          <h1>Wire Notes</h1>
          <WireNotes notes={[]} />
        </main>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});

