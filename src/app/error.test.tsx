import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ErrorPage from "./error";

beforeEach(() => {
  window.matchMedia = (() => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("error page", () => {
  it("says something went wrong, in one h1", () => {
    render(<ErrorPage error={new Error("boom")} retry={() => {}} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /went wrong/ }),
    ).toBeInTheDocument();
  });

  it("retries when asked", async () => {
    const retry = vi.fn();
    render(<ErrorPage error={new Error("boom")} retry={retry} />);
    await userEvent.click(screen.getByRole("button", { name: /Try again/ }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it("offers a way back to the home page", () => {
    render(<ErrorPage error={new Error("boom")} retry={() => {}} />);
    expect(
      screen.getByRole("link", { name: /Back to the home page/ }),
    ).toHaveAttribute("href", "/");
  });

  it("reports the error", () => {
    const error = new Error("boom");
    render(<ErrorPage error={error} retry={() => {}} />);
    expect(console.error).toHaveBeenCalledWith(error);
  });
});
