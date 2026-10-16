import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Link from "next/link";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "@/test/axe";
import {
  ArrowButton,
  ArrowLink,
  InlineLink,
  inlineLinkClass,
} from "./links";

vi.mock("next/link", () => ({
  default: vi.fn(({ children, href, transitionTypes: _transitionTypes, ...rest }) => {
    void _transitionTypes;
    return (
      <a
        href={typeof href === "object" ? href.pathname : href}
        {...rest}
      >
        {children}
      </a>
    );
  }),
}));

describe("inlineLinkClass", () => {
  it("exports the required typographic and hover utility classes", () => {
    expect(inlineLinkClass).toContain("text-link");
    expect(inlineLinkClass).toContain("underline");
    expect(inlineLinkClass).toContain("hover:text-ink");
    expect(inlineLinkClass).toContain("decoration-1");
  });
});

describe("InlineLink", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a semantic link with href and text content", () => {
    render(<InlineLink href="/about">About Mal</InlineLink>);

    const link = screen.getByRole("link", { name: "About Mal" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/about");
    expect(link).toHaveClass(inlineLinkClass);
  });

  it("renders nested React element children inside the link", () => {
    render(
      <InlineLink href="/writing/the-kernel">
        Issue <em>04</em> of The Kernel
      </InlineLink>,
    );

    const link = screen.getByRole("link", {
      name: "Issue 04 of The Kernel",
    });
    expect(link).toBeInTheDocument();
    expect(within(link).getByText("04").tagName).toBe("EM");
  });

  it("passes external href destinations cleanly to the underlying link", () => {
    render(
      <InlineLink href="https://github.com/malnushi">GitHub</InlineLink>,
    );

    const link = screen.getByRole("link", { name: "GitHub" });
    expect(link).toHaveAttribute("href", "https://github.com/malnushi");
  });
});

describe("ArrowLink", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a semantic link with children and an aria-hidden arrow", () => {
    render(<ArrowLink href="/projects">View all projects</ArrowLink>);

    // Accessible name excludes aria-hidden arrow glyph
    const link = screen.getByRole("link", { name: "View all projects" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/projects");

    const arrow = within(link).getByText("→");
    expect(arrow).toBeInTheDocument();
    expect(arrow).toHaveAttribute("aria-hidden", "true");
  });

  it("omits view-transition back configuration by default", () => {
    render(<ArrowLink href="/projects">View source</ArrowLink>);

    const link = screen.getByRole("link", { name: "View source" });
    expect(link).not.toHaveAttribute("data-vt-back");

    const linkCallProps = vi.mocked(Link).mock.lastCall?.[0] as
      | (Record<string, unknown> & { transitionTypes?: string[] })
      | undefined;
    expect(linkCallProps?.transitionTypes).toBeUndefined();
    expect(linkCallProps?.["data-vt-back"]).toBeUndefined();
  });

  it("omits view-transition back configuration when back is explicitly false", () => {
    render(
      <ArrowLink href="/photography" back={false}>
        Archive
      </ArrowLink>,
    );

    const link = screen.getByRole("link", { name: "Archive" });
    expect(link).not.toHaveAttribute("data-vt-back");

    const linkCallProps = vi.mocked(Link).mock.lastCall?.[0] as
      | (Record<string, unknown> & { transitionTypes?: string[] })
      | undefined;
    expect(linkCallProps?.transitionTypes).toBeUndefined();
    expect(linkCallProps?.["data-vt-back"]).toBeUndefined();
  });

  it("configures transitionTypes and data-vt-back when back is true", () => {
    render(
      <ArrowLink href="/writing" back>
        All essays
      </ArrowLink>,
    );

    const link = screen.getByRole("link", { name: "All essays" });
    expect(link).toHaveAttribute("data-vt-back", "");

    const linkCallProps = vi.mocked(Link).mock.lastCall?.[0] as
      | (Record<string, unknown> & { transitionTypes?: string[] })
      | undefined;
    expect(linkCallProps?.transitionTypes).toEqual(["nav-back"]);
    expect(linkCallProps?.["data-vt-back"]).toBe("");
  });
});

describe("ArrowButton", () => {
  it("renders a button with type='button', children, and an aria-hidden arrow", () => {
    render(<ArrowButton onClick={() => {}}>Try again</ArrowButton>);

    // Accessible name excludes the aria-hidden arrow
    const button = screen.getByRole("button", { name: "Try again" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("type", "button");

    const arrow = within(button).getByText("→");
    expect(arrow).toBeInTheDocument();
    expect(arrow).toHaveAttribute("aria-hidden", "true");
  });

  it("invokes onClick callback upon user click", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<ArrowButton onClick={handleClick}>Refresh</ArrowButton>);

    const button = screen.getByRole("button", { name: "Refresh" });
    expect(handleClick).not.toHaveBeenCalled();

    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);

    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it("invokes onClick callback via keyboard interaction", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<ArrowButton onClick={handleClick}>Retry</ArrowButton>);

    const button = screen.getByRole("button", { name: "Retry" });
    button.focus();
    expect(button).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(handleClick).toHaveBeenCalledTimes(1);

    await user.keyboard(" ");
    expect(handleClick).toHaveBeenCalledTimes(2);
  });
});

describe("accessibility (axe)", () => {
  it("InlineLink has no accessibility violations", async () => {
    const { container } = render(
      <p>
        Learn more in the <InlineLink href="/about">colophon</InlineLink>.
      </p>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("ArrowLink (forward navigation) has no accessibility violations", async () => {
    const { container } = render(
      <ArrowLink href="/projects/code">View code</ArrowLink>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("ArrowLink (back navigation) has no accessibility violations", async () => {
    const { container } = render(
      <ArrowLink href="/projects" back>
        All projects
      </ArrowLink>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("ArrowButton has no accessibility violations", async () => {
    const { container } = render(
      <ArrowButton onClick={() => {}}>Try again</ArrowButton>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

