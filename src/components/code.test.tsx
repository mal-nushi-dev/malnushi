import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "@/test/axe";
import { CodeBlock, InlineCode } from "./code";

describe("CodeBlock", () => {
  it("renders a semantic <pre> element containing a <code> element", () => {
    const snippet = "const greeting = 'hello';";
    const { container } = render(<CodeBlock code={snippet} />);

    const pre = container.querySelector("pre");
    expect(pre).toBeInTheDocument();

    const code = pre?.querySelector("code");
    expect(code).toBeInTheDocument();
    expect(code?.textContent).toBe(snippet);
  });

  it("preserves exact string content including newlines and leading whitespace", () => {
    const formattedCode = [
      "function sum(a: number, b: number): number {",
      "  // Indented comment",
      "    return a + b;",
      "}",
    ].join("\n");

    const { container } = render(<CodeBlock code={formattedCode} />);

    const code = container.querySelector("code");
    expect(code).toBeInTheDocument();
    expect(code?.textContent).toBe(formattedCode);
  });

  it("preserves special characters and HTML-like syntax literally", () => {
    const codeWithSymbols = `<div className="test" data-id="123">&'"` + "\n\talert(1);";
    const { container } = render(<CodeBlock code={codeWithSymbols} />);

    const code = container.querySelector("code");
    expect(code).toBeInTheDocument();
    expect(code?.textContent).toBe(codeWithSymbols);
  });

  it("handles empty code string gracefully", () => {
    const { container } = render(<CodeBlock code="" />);

    const pre = container.querySelector("pre");
    expect(pre).toBeInTheDocument();

    const code = pre?.querySelector("code");
    expect(code).toBeInTheDocument();
    expect(code).toBeEmptyDOMElement();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <CodeBlock code={"export default function App() {\n  return null;\n}"} />,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("InlineCode", () => {
  it("renders text content within a semantic <code> element", () => {
    render(<InlineCode>npm test</InlineCode>);

    const code = screen.getByText("npm test");
    expect(code).toBeInTheDocument();
    expect(code.tagName).toBe("CODE");
  });

  it("renders nested elements and rich markup without altering their hierarchy", () => {
    const { container } = render(
      <InlineCode>
        <span data-testid="prefix">git</span> checkout
      </InlineCode>,
    );

    const code = container.querySelector("code");
    expect(code).toBeInTheDocument();
    expect(screen.getByTestId("prefix")).toHaveTextContent("git");
    expect(code).toHaveTextContent("git checkout");
  });

  it("handles empty or null children gracefully", () => {
    const { container } = render(<InlineCode>{null}</InlineCode>);

    const code = container.querySelector("code");
    expect(code).toBeInTheDocument();
    expect(code).toBeEmptyDOMElement();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <p>
        Use <InlineCode>pnpm test</InlineCode> to execute unit tests.
      </p>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

