import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "@/test/axe";
import { Note, NoteList, type NoteItem } from "./note";

const sampleNote: NoteItem = {
  id: "2026-04-12-morning-light",
  day: "2026-04-12",
  time: "8:30 AM EDT",
  body: "Brewing a light roast while watching the fog roll across the harbor.",
};

const sampleNotes: NoteItem[] = [
  sampleNote,
  {
    id: "2026-04-11-evening-walk",
    day: "2026-04-11",
    time: "7:45 PM EDT",
    body: "Streetlamps flickering on along the cobblestones.",
  },
];

describe("Note", () => {
  it("renders as an article landmark", () => {
    render(<Note note={sampleNote} />);

    expect(screen.getByRole("article")).toBeInTheDocument();
  });

  it("renders the note body inside a paragraph", () => {
    render(<Note note={sampleNote} />);

    const article = screen.getByRole("article");
    const bodyParagraph = within(article).getByText(
      "Brewing a light roast while watching the fog roll across the harbor.",
    );

    expect(bodyParagraph.tagName).toBe("P");
  });

  it("supports complex ReactNode elements in the body", () => {
    const richNote: NoteItem = {
      id: "rich-note",
      day: "2026-04-13",
      time: "10:15 AM EDT",
      body: (
        <>
          Testing <em>emphasized</em> text and a{" "}
          <strong data-testid="bold-elem">bold phrase</strong>.
        </>
      ),
    };

    render(<Note note={richNote} />);

    expect(screen.getByText("emphasized").tagName).toBe("EM");
    expect(screen.getByTestId("bold-elem")).toHaveTextContent("bold phrase");
  });

  it("renders a permalink targeting /writing/notes/[id] with formatted day and time", () => {
    render(<Note note={sampleNote} />);

    const permalink = screen.getByRole("link", {
      name: "2026-04-12 · 8:30 AM EDT",
    });

    expect(permalink).toHaveAttribute(
      "href",
      "/writing/notes/2026-04-12-morning-light",
    );
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <main>
        <Note note={sampleNote} />
      </main>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("NoteList", () => {
  it("renders an ordered list with a list item for each note", () => {
    const { container } = render(<NoteList notes={sampleNotes} />);

    const ol = container.querySelector("ol");
    expect(ol).toBeInTheDocument();

    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
  });

  it("renders each note inside its list item in order", () => {
    render(<NoteList notes={sampleNotes} />);

    const items = screen.getAllByRole("listitem");

    expect(
      within(items[0]).getByText(
        "Brewing a light roast while watching the fog roll across the harbor.",
      ),
    ).toBeInTheDocument();
    expect(
      within(items[0]).getByRole("link", { name: "2026-04-12 · 8:30 AM EDT" }),
    ).toHaveAttribute("href", "/writing/notes/2026-04-12-morning-light");

    expect(
      within(items[1]).getByText(
        "Streetlamps flickering on along the cobblestones.",
      ),
    ).toBeInTheDocument();
    expect(
      within(items[1]).getByRole("link", { name: "2026-04-11 · 7:45 PM EDT" }),
    ).toHaveAttribute("href", "/writing/notes/2026-04-11-evening-walk");
  });

  it("handles an empty list by rendering an empty ordered list", () => {
    const { container } = render(<NoteList notes={[]} />);

    const ol = container.querySelector("ol");
    expect(ol).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("has no accessibility violations with multiple notes", async () => {
    const { container } = render(
      <main>
        <h1>Notes</h1>
        <NoteList notes={sampleNotes} />
      </main>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no accessibility violations when empty", async () => {
    const { container } = render(
      <main>
        <h1>Notes</h1>
        <NoteList notes={[]} />
      </main>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

