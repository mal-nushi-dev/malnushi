/* eslint-disable @next/next/no-img-element */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "@/test/axe";
import { Caption } from "./caption";

describe("Caption", () => {
  describe("image caption mode", () => {
    it("renders the index and caption text", () => {
      render(<Caption index="01">A wooden desk under morning light.</Caption>);

      expect(screen.getByText("01")).toBeInTheDocument();
      expect(
        screen.getByText("A wooden desk under morning light."),
      ).toBeInTheDocument();
    });

    it("supports rich React elements as caption content", () => {
      render(
        <Caption index="02">
          Photo taken near{" "}
          <a href="https://example.com/charlotte">Charlotte</a> during{" "}
          <em>autumn</em>.
        </Caption>,
      );

      expect(
        screen.getByRole("link", { name: "Charlotte" }),
      ).toHaveAttribute("href", "https://example.com/charlotte");
      expect(screen.getByText("autumn").tagName).toBe("EM");
    });

    it("renders the index without error when children are omitted", () => {
      const { container } = render(<Caption index="03" />);

      expect(screen.getByText("03")).toBeInTheDocument();
      expect(container.querySelector("figcaption")).toBeInTheDocument();
    });

    it("renders non-numeric or custom index strings", () => {
      render(<Caption index="Fig. 4">Schematic diagram</Caption>);

      expect(screen.getByText("Fig. 4")).toBeInTheDocument();
      expect(screen.getByText("Schematic diagram")).toBeInTheDocument();
    });
  });

  describe("photo EXIF mode", () => {
    it("renders EXIF metadata items in the exact sequence provided", () => {
      const exif = ["50mm", "f/1.8", "1/250s", "ISO 100"];
      const { container } = render(<Caption index="01" exif={exif} />);

      expect(screen.getByText("01")).toBeInTheDocument();

      const figcaption = container.querySelector("figcaption")!;
      const [, exifGroup] = Array.from(figcaption.children);
      const renderedItems = Array.from(exifGroup.children).map(
        (child) => child.textContent,
      );

      expect(renderedItems).toEqual(["50mm", "f/1.8", "1/250s", "ISO 100"]);
    });

    it("renders flexible subsets of EXIF fields without empty slots", () => {
      const { container } = render(
        <Caption index="02" exif={["28mm", "f/2.8"]} />,
      );

      const figcaption = container.querySelector("figcaption")!;
      const [, exifGroup] = Array.from(figcaption.children);
      const renderedItems = Array.from(exifGroup.children).map(
        (child) => child.textContent,
      );

      expect(renderedItems).toEqual(["28mm", "f/2.8"]);
      expect(screen.queryByText("ISO")).not.toBeInTheDocument();
    });

    it("handles an empty EXIF list without crashing", () => {
      const { container } = render(<Caption index="03" exif={[]} />);

      expect(screen.getByText("03")).toBeInTheDocument();
      const figcaption = container.querySelector("figcaption")!;
      const [, exifGroup] = Array.from(figcaption.children);
      expect(exifGroup.children).toHaveLength(0);
    });

    it("prioritizes EXIF metadata over children when both are supplied", () => {
      render(
        <Caption index="04" exif={["85mm", "f/1.4"]}>
          Text that should not display in EXIF mode
        </Caption>,
      );

      expect(screen.getByText("04")).toBeInTheDocument();
      expect(screen.getByText("85mm")).toBeInTheDocument();
      expect(screen.getByText("f/1.4")).toBeInTheDocument();
      expect(
        screen.queryByText("Text that should not display in EXIF mode"),
      ).not.toBeInTheDocument();
    });
  });

  describe("semantics and accessibility", () => {
    it("renders as a semantic figcaption element", () => {
      const { container } = render(
        <Caption index="01">A minimalist interior.</Caption>,
      );

      const figcaption = container.querySelector("figcaption");
      expect(figcaption).toBeInTheDocument();
      expect(figcaption?.tagName.toLowerCase()).toBe("figcaption");
    });

    it("has no accessibility violations in image caption mode inside a figure", async () => {
      const { container } = render(
        <figure>
          <img src="/photo.jpg" alt="A quiet forest trail" />
          <Caption index="01">A quiet forest trail in the morning.</Caption>
        </figure>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it("has no accessibility violations in photo EXIF mode inside a figure", async () => {
      const { container } = render(
        <figure>
          <img src="/photo.jpg" alt="A mountain summit at dawn" />
          <Caption
            index="02"
            exif={["24mm", "f/8", "1/500s", "ISO 64"]}
          />
        </figure>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});

