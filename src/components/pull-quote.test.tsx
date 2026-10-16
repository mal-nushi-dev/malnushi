import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "@/test/axe";
import { PullQuote } from "./pull-quote";

describe("PullQuote", () => {
  it("renders children inside a semantic <blockquote> element", () => {
    const quoteText = "Simplicity is prerequisite for reliability.";

    const { container } = render(<PullQuote>{quoteText}</PullQuote>);

    const quoteElement = container.querySelector("blockquote");
    expect(quoteElement).toBeInTheDocument();
    expect(quoteElement?.tagName).toBe("BLOCKQUOTE");
    expect(quoteElement).toHaveTextContent(quoteText);
  });

  it("renders rich and nested children without altering their structure", () => {
    render(
      <PullQuote>
        <p>
          Premature optimization is the root of all evil.
          <cite>— Donald Knuth</cite>
        </p>
      </PullQuote>,
    );

    expect(
      screen.getByText(/Premature optimization is the root of all evil\./i),
    ).toBeInTheDocument();
    expect(screen.getByText("— Donald Knuth")).toBeInTheDocument();
    expect(screen.getByText("— Donald Knuth").tagName).toBe("CITE");
  });

  it("renders multiple children and formatted markup correctly", () => {
    render(
      <PullQuote>
        <span>First segment. </span>
        <strong>Bold emphasis. </strong>
        <em>Italic emphasis.</em>
      </PullQuote>,
    );

    expect(screen.getByText("First segment.")).toBeInTheDocument();
    expect(screen.getByText("Bold emphasis.")).toBeInTheDocument();
    expect(screen.getByText("Italic emphasis.")).toBeInTheDocument();
  });

  it("handles empty or null children gracefully", () => {
    const { container } = render(<PullQuote>{null}</PullQuote>);

    const quoteElement = container.querySelector("blockquote");
    expect(quoteElement).toBeInTheDocument();
    expect(quoteElement).toBeEmptyDOMElement();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <PullQuote>
        <p>Accessible pull quote content.</p>
      </PullQuote>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

