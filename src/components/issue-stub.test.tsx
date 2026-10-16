import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "@/test/axe";
import { EarlierIssues, IssueStub, type Issue } from "./issue-stub";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children?: React.ReactNode;
    href: string | { pathname: string };
    [key: string]: unknown;
  }) => {
    const domProps = { ...rest };
    delete domProps.transitionTypes;
    return (
      <a
        href={typeof href === "object" ? href.pathname : href}
        {...domProps}
      >
        {children}
      </a>
    );
  },
}));

const sampleIssue: Issue = {
  href: "/writing/the-kernel/04",
  issue: 4,
  title: "On Memory",
  date: "2026-10-01",
};

const sampleIssues: Issue[] = [
  {
    href: "/writing/the-kernel/03",
    issue: 3,
    title: "The Architecture of Reading",
    date: "2026-09-15",
  },
  {
    href: "/writing/the-kernel/02",
    issue: 2,
    title: "Tools for Thought",
    date: "2026-09-01",
  },
  {
    href: "/writing/the-kernel/01",
    issue: 1,
    title: "Origins",
    date: "2026-08-15",
  },
];

describe("IssueStub", () => {
  it("renders the newsletter name in a level 3 heading", () => {
    render(
      <IssueStub
        name="The Kernel"
        href="/writing/the-kernel"
        issue={sampleIssue}
      />,
    );

    const heading = screen.getByRole("heading", {
      level: 3,
      name: "The Kernel",
    });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe("H3");
  });

  it("renders primary issue link targeting issue.href containing issue number, title, and date", () => {
    render(
      <IssueStub
        name="The Kernel"
        href="/writing/the-kernel"
        issue={sampleIssue}
      />,
    );

    const issueLink = screen.getByRole("link", {
      name: /No\.\s*4\s*On Memory\s*2026-10-01/i,
    });
    expect(issueLink).toBeInTheDocument();
    expect(issueLink).toHaveAttribute("href", "/writing/the-kernel/04");

    expect(within(issueLink).getByText("No.")).toBeInTheDocument();
    expect(within(issueLink).getByText("4")).toBeInTheDocument();
    expect(within(issueLink).getByText("On Memory")).toBeInTheDocument();
    expect(within(issueLink).getByText("2026-10-01")).toBeInTheDocument();
  });

  it("renders 'All of [name]' arrow link targeting href", () => {
    render(
      <IssueStub
        name="The Kernel"
        href="/writing/the-kernel"
        issue={sampleIssue}
      />,
    );

    const archiveLink = screen.getByRole("link", {
      name: "All of The Kernel",
    });
    expect(archiveLink).toBeInTheDocument();
    expect(archiveLink).toHaveAttribute("href", "/writing/the-kernel");

    const arrow = within(archiveLink).getByText("→");
    expect(arrow).toBeInTheDocument();
    expect(arrow).toHaveAttribute("aria-hidden", "true");
  });

  it("renders correctly with different newsletter names and issue data", () => {
    const devIssue: Issue = {
      href: "/writing/dev-journal/12",
      issue: 12,
      title: "Building the Engine",
      date: "2026-10-10",
    };

    render(
      <IssueStub
        name="Dev Journal"
        href="/writing/dev-journal"
        issue={devIssue}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Dev Journal" }),
    ).toBeInTheDocument();

    const issueLink = screen.getByRole("link", {
      name: /No\.\s*12\s*Building the Engine\s*2026-10-10/i,
    });
    expect(issueLink).toHaveAttribute("href", "/writing/dev-journal/12");
    expect(within(issueLink).getByText("12")).toBeInTheDocument();

    const archiveLink = screen.getByRole("link", {
      name: "All of Dev Journal",
    });
    expect(archiveLink).toHaveAttribute("href", "/writing/dev-journal");
  });
});

describe("EarlierIssues", () => {
  it("renders an ordered list containing each issue as a list item", () => {
    render(<EarlierIssues issues={sampleIssues} />);

    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");

    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(3);
  });

  it("renders 2-digit zero-padded issue numbers, titles, and link targets", () => {
    render(<EarlierIssues issues={sampleIssues} />);

    const items = screen.getAllByRole("listitem");

    // First item (issue 3 -> "03")
    const link1 = within(items[0]).getByRole("link");
    expect(link1).toHaveAttribute("href", "/writing/the-kernel/03");
    expect(within(link1).getByText("03")).toBeInTheDocument();
    expect(
      within(link1).getByText("The Architecture of Reading"),
    ).toBeInTheDocument();

    // Second item (issue 2 -> "02")
    const link2 = within(items[1]).getByRole("link");
    expect(link2).toHaveAttribute("href", "/writing/the-kernel/02");
    expect(within(link2).getByText("02")).toBeInTheDocument();
    expect(within(link2).getByText("Tools for Thought")).toBeInTheDocument();

    // Third item (issue 1 -> "01")
    const link3 = within(items[2]).getByRole("link");
    expect(link3).toHaveAttribute("href", "/writing/the-kernel/01");
    expect(within(link3).getByText("01")).toBeInTheDocument();
    expect(within(link3).getByText("Origins")).toBeInTheDocument();
  });

  it("formats double-digit and multi-digit issues without extra padding", () => {
    const multiDigitIssues: Issue[] = [
      {
        href: "/writing/dev-journal/105",
        issue: 105,
        title: "Deep Dive",
        date: "2026-10-15",
      },
      {
        href: "/writing/dev-journal/10",
        issue: 10,
        title: "Milestone Ten",
        date: "2026-09-20",
      },
    ];

    render(<EarlierIssues issues={multiDigitIssues} />);

    const links = screen.getAllByRole("link");
    expect(within(links[0]).getByText("105")).toBeInTheDocument();
    expect(within(links[1]).getByText("10")).toBeInTheDocument();
  });

  it("handles an empty issues array by rendering an empty list", () => {
    render(<EarlierIssues issues={[]} />);

    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(within(list).queryAllByRole("listitem")).toHaveLength(0);
  });
});

describe("accessibility", () => {
  it("IssueStub has no automated accessibility violations", async () => {
    const { container } = render(
      <IssueStub
        name="The Kernel"
        href="/writing/the-kernel"
        issue={sampleIssue}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("EarlierIssues has no automated accessibility violations with issues", async () => {
    const { container } = render(<EarlierIssues issues={sampleIssues} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("EarlierIssues has no automated accessibility violations when empty", async () => {
    const { container } = render(<EarlierIssues issues={[]} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
