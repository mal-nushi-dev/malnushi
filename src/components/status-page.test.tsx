import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Link from "next/link";
import { describe, expect, it, vi } from "vitest";
import { axe } from "@/test/axe";
import { StatusPage } from "./status-page";

vi.mock("@/components/footer", () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

describe("StatusPage", () => {
  describe("landmarks and structure", () => {
    it("renders the main landmark containing the status page content", () => {
      render(
        <StatusPage
          label="404"
          title="That page isn’t here."
          actions={<Link href="/">Back to the home page</Link>}
        >
          It may not be written yet, or the link may be wrong.
        </StatusPage>,
      );

      const main = screen.getByRole("main");
      expect(main).toBeInTheDocument();
      expect(main).toHaveClass("page");
    });

    it("renders the primary level 1 heading with the specified title", () => {
      render(
        <StatusPage
          label="404"
          title="That page isn’t here."
          actions={<Link href="/">Back to the home page</Link>}
        >
          Page missing description.
        </StatusPage>,
      );

      const heading = screen.getByRole("heading", {
        level: 1,
        name: "That page isn’t here.",
      });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass("type-h1");
    });

    it("renders the status label as an eyebrow above the title", () => {
      render(
        <StatusPage
          label="404"
          title="Not Found"
          actions={<Link href="/">Home</Link>}
        >
          Missing page.
        </StatusPage>,
      );

      const label = screen.getByText("404");
      expect(label).toBeInTheDocument();
      expect(label).toHaveClass("type-label");
    });

    it("renders the explanation content in the standfirst paragraph", () => {
      render(
        <StatusPage
          label="404"
          title="Not Found"
          actions={<Link href="/">Home</Link>}
        >
          It may not be written yet, or the link may be wrong.
        </StatusPage>,
      );

      const standfirst = screen.getByText(
        "It may not be written yet, or the link may be wrong.",
      );
      expect(standfirst).toBeInTheDocument();
      expect(standfirst).toHaveClass("type-standfirst");
    });

    it("includes the footer landmark positioned outside the main content", () => {
      render(
        <StatusPage
          label="Error"
          title="Something went wrong."
          actions={<button type="button">Retry</button>}
        >
          The page failed to load.
        </StatusPage>,
      );

      const main = screen.getByRole("main");
      const footer = screen.getByRole("contentinfo");

      expect(footer).toBeInTheDocument();
      expect(screen.getByTestId("footer")).toBeInTheDocument();
      expect(main).not.toContainElement(footer);
    });
  });

  describe("actions and user interaction", () => {
    it("renders action elements inside the main landmark", () => {
      render(
        <StatusPage
          label="404"
          title="Not Found"
          actions={<Link href="/">Back to the home page</Link>}
        >
          Missing page.
        </StatusPage>,
      );

      const main = screen.getByRole("main");
      const link = within(main).getByRole("link", {
        name: "Back to the home page",
      });

      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/");
    });

    it("renders complex interactive actions and triggers event handlers", async () => {
      const handleRetry = vi.fn();
      const user = userEvent.setup();

      render(
        <StatusPage
          label="Error"
          title="Something went wrong."
          actions={
            <>
              <button type="button" onClick={handleRetry}>
                Try again
              </button>
              <Link href="/">Back to the home page</Link>
            </>
          }
        >
          The page failed to load.
        </StatusPage>,
      );

      const main = screen.getByRole("main");
      const button = within(main).getByRole("button", { name: "Try again" });
      const link = within(main).getByRole("link", {
        name: "Back to the home page",
      });

      expect(button).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/");

      await user.click(button);
      expect(handleRetry).toHaveBeenCalledOnce();
    });
  });

  describe("rich content rendering", () => {
    it("renders complex ReactNode children containing nested inline markup and links", () => {
      render(
        <StatusPage
          label="404"
          title="Page missing"
          actions={<Link href="/">Home</Link>}
        >
          <span>
            The resource at <code>/drafts/secret</code> was moved. Visit the{" "}
            <Link href="/writing">writing archive</Link> instead.
          </span>
        </StatusPage>,
      );

      const main = screen.getByRole("main");
      expect(within(main).getByText("/drafts/secret").tagName).toBe("CODE");
      expect(
        within(main).getByRole("link", { name: "writing archive" }),
      ).toHaveAttribute("href", "/writing");
    });
  });

  describe("accessibility", () => {
    it("has no automated accessibility violations with standard status content", async () => {
      const { container } = render(
        <StatusPage
          label="404"
          title="That page isn’t here."
          actions={<Link href="/">Back to the home page</Link>}
        >
          It may not be written yet, or the link may be wrong. Most of this site
          is still being worked on.
        </StatusPage>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no automated accessibility violations with complex actions and rich children", async () => {
      const { container } = render(
        <StatusPage
          label="Error"
          title="Something went wrong."
          actions={
            <>
              <button type="button" onClick={() => {}}>
                Try again
              </button>
              <Link href="/">Back to the home page</Link>
            </>
          }
        >
          <span>
            The page failed to load. You can try again or return to the{" "}
            <Link href="/">home page</Link>.
          </span>
        </StatusPage>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
