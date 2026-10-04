import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Photo } from "./photo";

describe("Photo", () => {
  it("is an image with its alt text", () => {
    render(<Photo size="column" src="/wren.jpg" alt="A Carolina wren on a fence" />);
    expect(
      screen.getByRole("img", { name: "A Carolina wren on a fence" }),
    ).toBeInTheDocument();
  });

  it("reserves the figure's box, so nothing shifts when it loads", () => {
    render(<Photo size="hero" src="/hero.jpg" alt="Hero" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("width", "1248");
    expect(img).toHaveAttribute("height", "640");
  });

  it("uses the column size's dimensions", () => {
    render(<Photo size="column" src="/wren.jpg" alt="Wren" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("width", "680");
    expect(img).toHaveAttribute("height", "453");
  });

  it("keeps a photograph's own proportions when given them", () => {
    render(
      <Photo size="column" src="/heron.jpg" alt="Heron" aspect={{ width: 1600, height: 2400 }} />,
    );
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("width", "680");
    expect(img).toHaveAttribute("height", "1020");
  });

  it("tells the browser how wide it will be shown", () => {
    render(<Photo size="column" src="/wren.jpg" alt="Wren" />);
    expect(screen.getByRole("img")).toHaveAttribute(
      "sizes",
      "min(680px, calc(100vw - 192px))",
    );
  });

  it("loads lazily by default", () => {
    render(<Photo size="column" src="/wren.jpg" alt="Wren" />);
    expect(screen.getByRole("img")).toHaveAttribute("loading", "lazy");
  });

  it("loads eagerly at high priority above the fold", () => {
    render(<Photo size="hero" src="/hero.jpg" alt="Hero" aboveTheFold />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute("fetchpriority", "high");
  });

  it("serves through the image optimizer with a srcset", () => {
    render(<Photo size="hero" src="/hero.jpg" alt="Hero" />);
    const img = screen.getByRole("img");
    expect(img.getAttribute("srcset")).toContain("/_next/image?url=");
  });
});
