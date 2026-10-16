/* eslint-disable @next/next/no-img-element */
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "@/test/axe";
import { Caption } from "./caption";
import { Figure } from "./figure";
import { ImagePlaceholder } from "./image-placeholder";

vi.mock("./caption", () => ({
  Caption: vi.fn(
    ({
      index,
      exif,
      children,
    }: {
      index: string;
      exif?: string[];
      children?: React.ReactNode;
    }) => (
      <figcaption data-testid="mock-caption" data-index={index}>
        <span>{index}</span>
        {children}
        {exif?.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </figcaption>
    ),
  ),
}));

vi.mock("./image-placeholder", () => ({
  ImagePlaceholder: vi.fn(({ size }: { size: string }) => (
    <div
      role="img"
      aria-label={`Image placeholder, ${size}`}
      data-testid="mock-image-placeholder"
      data-size={size}
    />
  )),
}));

const MockCaption = vi.mocked(Caption);
const MockImagePlaceholder = vi.mocked(ImagePlaceholder);

describe("Figure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("semantics and styling", () => {
    it("renders a semantic figure element with the hero max-width of 1248px", () => {
      const { container } = render(<Figure size="hero" index="01" />);
      const figure = container.querySelector("figure");

      expect(figure).toBeInTheDocument();
      expect(figure).toHaveStyle({ maxWidth: "1248px" });
      expect(screen.getByRole("figure")).toBeInTheDocument();
    });

    it("renders a semantic figure element with the column max-width of 680px", () => {
      const { container } = render(<Figure size="column" index="02" />);
      const figure = container.querySelector("figure");

      expect(figure).toBeInTheDocument();
      expect(figure).toHaveStyle({ maxWidth: "680px" });
      expect(screen.getByRole("figure")).toBeInTheDocument();
    });

    it("applies the layout styling classes to the figure element", () => {
      const { container } = render(<Figure size="column" index="01" />);
      const figure = container.querySelector("figure");

      expect(figure).toHaveClass("flex", "w-full", "flex-col", "gap-(--space-sm)");
    });
  });

  describe("image rendering and placeholder fallback", () => {
    it("falls back to ImagePlaceholder with matching size when children are omitted", () => {
      render(<Figure size="hero" index="01" />);

      expect(MockImagePlaceholder).toHaveBeenCalledTimes(1);
      expect(MockImagePlaceholder.mock.calls[0][0]).toMatchObject({ size: "hero" });
      expect(screen.getByTestId("mock-image-placeholder")).toHaveAttribute(
        "data-size",
        "hero",
      );
    });

    it("falls back to ImagePlaceholder with column size when size is column and children are omitted", () => {
      render(<Figure size="column" index="02" />);

      expect(MockImagePlaceholder).toHaveBeenCalledTimes(1);
      expect(MockImagePlaceholder.mock.calls[0][0]).toMatchObject({ size: "column" });
      expect(screen.getByTestId("mock-image-placeholder")).toHaveAttribute(
        "data-size",
        "column",
      );
    });

    it("renders custom children when provided and does not invoke ImagePlaceholder", () => {
      render(
        <Figure size="hero" index="03">
          <img src="/photo.jpg" alt="A high alpine lake" />
        </Figure>,
      );

      expect(MockImagePlaceholder).not.toHaveBeenCalled();
      expect(screen.queryByTestId("mock-image-placeholder")).not.toBeInTheDocument();
      expect(screen.getByRole("img", { name: "A high alpine lake" })).toBeInTheDocument();
    });

    it("falls back to ImagePlaceholder when children is null", () => {
      render(
        <Figure size="column" index="04">
          {null}
        </Figure>,
      );

      expect(MockImagePlaceholder).toHaveBeenCalledTimes(1);
      expect(MockImagePlaceholder.mock.calls[0][0]).toMatchObject({ size: "column" });
      expect(screen.getByTestId("mock-image-placeholder")).toBeInTheDocument();
    });
  });

  describe("caption and exif forwarding", () => {
    it("forwards index and caption text to Caption as children", () => {
      render(
        <Figure
          size="column"
          index="01"
          caption="A wooden desk under morning light."
        />,
      );

      expect(MockCaption).toHaveBeenCalledTimes(1);
      expect(MockCaption.mock.calls[0][0]).toMatchObject({
        index: "01",
        children: "A wooden desk under morning light.",
        exif: undefined,
      });
      expect(screen.getByText("01")).toBeInTheDocument();
      expect(
        screen.getByText("A wooden desk under morning light."),
      ).toBeInTheDocument();
    });

    it("forwards rich React elements as caption to Caption", () => {
      render(
        <Figure
          size="hero"
          index="02"
          caption={
            <span>
              Taken near <a href="https://example.com/lake">Lake Louise</a>
            </span>
          }
        />,
      );

      expect(MockCaption).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("link", { name: "Lake Louise" })).toHaveAttribute(
        "href",
        "https://example.com/lake",
      );
    });

    it("forwards exif metadata to Caption", () => {
      const exif = ["50mm", "f/1.8", "1/250s", "ISO 100"];
      render(<Figure size="hero" index="03" exif={exif} />);

      expect(MockCaption).toHaveBeenCalledTimes(1);
      expect(MockCaption.mock.calls[0][0]).toMatchObject({
        index: "03",
        exif,
      });
      for (const item of exif) {
        expect(screen.getByText(item)).toBeInTheDocument();
      }
    });

    it("forwards both caption and exif simultaneously to Caption", () => {
      const exif = ["28mm", "f/2.8"];
      render(
        <Figure
          size="column"
          index="04"
          caption="Morning mist along the ridge"
          exif={exif}
        />,
      );

      expect(MockCaption).toHaveBeenCalledTimes(1);
      expect(MockCaption.mock.calls[0][0]).toMatchObject({
        index: "04",
        children: "Morning mist along the ridge",
        exif,
      });
      expect(screen.getByText("Morning mist along the ridge")).toBeInTheDocument();
      expect(screen.getByText("28mm")).toBeInTheDocument();
      expect(screen.getByText("f/2.8")).toBeInTheDocument();
    });

    it("forwards undefined caption and exif to Caption when optional props are omitted", () => {
      render(<Figure size="column" index="05" />);

      expect(MockCaption).toHaveBeenCalledTimes(1);
      expect(MockCaption.mock.calls[0][0]).toMatchObject({
        index: "05",
        children: undefined,
        exif: undefined,
      });
      expect(screen.getByText("05")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has no accessibility violations with default placeholder and caption", async () => {
      const { container } = render(
        <Figure
          size="hero"
          index="01"
          caption="A quiet forest trail at sunrise."
        />,
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it("has no accessibility violations with custom image child and exif metadata", async () => {
      const { container } = render(
        <Figure
          size="column"
          index="02"
          exif={["35mm", "f/2.0", "1/500s", "ISO 200"]}
        >
          <img src="/trail.jpg" alt="A quiet forest trail at sunrise" />
        </Figure>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
