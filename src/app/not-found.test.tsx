import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import NotFound from "./not-found";

beforeEach(() => {
  window.matchMedia = (() => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
});

describe("not found page", () => {
  it("says the page is missing, in one h1", () => {
    render(<NotFound />);
    expect(
      screen.getByRole("heading", { level: 1, name: /isn’t here/ }),
    ).toBeInTheDocument();
  });

  it("offers a way back to the home page", () => {
    render(<NotFound />);
    expect(
      screen.getByRole("link", { name: /Back to the home page/ }),
    ).toHaveAttribute("href", "/");
  });
});
