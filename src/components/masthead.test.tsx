import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { animate } from "motion";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "@/test/axe";
import { Masthead } from "./masthead";

vi.mock("motion", () => ({
  animate: vi.fn(
    (
      _fromOrElement: unknown,
      toOrKeyframes: unknown,
      options?: { onUpdate?: (v: number) => void },
    ) => {
      if (typeof options?.onUpdate === "function") {
        const targetVal = typeof toOrKeyframes === "number" ? toOrKeyframes : 1;
        options.onUpdate(targetVal);
      }
      let stopped = false;
      const stop = vi.fn(() => {
        stopped = true;
      });
      const promise = new Promise<void>((resolve) => {
        queueMicrotask(() => {
          if (!stopped) resolve();
        });
      });
      return Object.assign(promise, {
        stop,
        then: promise.then.bind(promise),
      });
    },
  ),
}));

function stubMedia({ reducedMotion = false } = {}) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("prefers-reduced-motion") ? reducedMotion : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  })) as typeof window.matchMedia;
}

beforeEach(() => {
  stubMedia({ reducedMotion: false });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Masthead", () => {
  describe("landmarks and semantic heading", () => {
    it("renders a level 1 heading landmark with sr-only text 'Kodikion.'", () => {
      render(<Masthead />);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveAccessibleName("Kodikion.");

      const srOnly = within(heading).getByText("Kodikion.");
      expect(srOnly).toHaveClass("sr-only");
    });
  });

  describe("SVG glyph presentations", () => {
    it("hides the SVG presentation from screen readers with aria-hidden", () => {
      const { container } = render(<Masthead />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });

    it("contains both live and static glyph presentation layers", () => {
      const { container } = render(<Masthead />);
      const liveGroup = container.querySelector('[data-masthead="live"]');
      const staticGroup = container.querySelector('[data-masthead="static"]');

      expect(liveGroup).toBeInTheDocument();
      expect(liveGroup).toHaveClass("motion-reduce:hidden");

      expect(staticGroup).toBeInTheDocument();
      expect(staticGroup).toHaveClass("hidden", "motion-reduce:inline");
      expect(staticGroup?.querySelectorAll("path")).toHaveLength(9);
    });

    it("includes a noscript fallback for environments without JavaScript", () => {
      const { container } = render(<Masthead />);
      const noscript = container.querySelector("noscript");
      expect(noscript).toBeInTheDocument();
    });
  });

  describe("replay button", () => {
    it("reveals the replay button when animation is enabled", () => {
      render(<Masthead />);
      const button = screen.getByRole("button", {
        name: "Play the masthead animation again",
      });
      expect(button).toBeInTheDocument();
      expect(button).not.toHaveAttribute("hidden");
    });

    it("triggers replay sequence when clicked after intro settles", async () => {
      const user = userEvent.setup();
      render(<Masthead />);

      await act(async () => {});
      vi.mocked(animate).mockClear();

      const button = screen.getByRole("button", {
        name: "Play the masthead animation again",
      });
      await user.click(button);

      expect(animate).toHaveBeenCalled();
    });

    it("ignores replay clicks while the animation sequence is busy", () => {
      render(<Masthead />);
      vi.mocked(animate).mockClear();

      const button = screen.getByRole("button", {
        name: "Play the masthead animation again",
      });

      // Synchronous click before initial intro settles
      button.click();

      expect(animate).not.toHaveBeenCalled();
    });

    it("stops running animations and cancels animation frames on unmount", () => {
      const cancelAnimSpy = vi.spyOn(window, "cancelAnimationFrame");
      const { unmount } = render(<Masthead />);

      unmount();

      expect(cancelAnimSpy).toHaveBeenCalled();
    });
  });

  describe("under prefers-reduced-motion", () => {
    beforeEach(() => {
      stubMedia({ reducedMotion: true });
    });

    it("keeps the replay button hidden from assistive technology and users", () => {
      const { container } = render(<Masthead />);
      expect(
        screen.queryByRole("button", {
          name: "Play the masthead animation again",
        }),
      ).not.toBeInTheDocument();

      const button = container.querySelector(
        'button[aria-label="Play the masthead animation again"]',
      );
      expect(button).toHaveAttribute("hidden");
    });

    it("bypasses animation execution when reduced motion is requested", () => {
      vi.mocked(animate).mockClear();
      render(<Masthead />);
      expect(animate).not.toHaveBeenCalled();
    });

    it("preserves semantic heading landmark under reduced motion", () => {
      render(<Masthead />);
      expect(
        screen.getByRole("heading", { level: 1, name: "Kodikion." }),
      ).toBeInTheDocument();
    });

    it("has no automated accessibility violations in reduced motion mode", async () => {
      const { container } = render(<Masthead />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe("accessibility", () => {
    it("has no automated accessibility violations in animated state", async () => {
      const { container } = render(<Masthead />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
