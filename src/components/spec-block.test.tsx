import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "@/test/axe";
import { type Spec, SpecBlock } from "./spec-block";

const baseSpec: Spec = {
  year: 2026,
  role: "Lead Designer & Developer",
  medium: "Web Application",
  status: "Active",
};

describe("SpecBlock", () => {
  describe("description list semantics", () => {
    it("renders as a semantic <dl> description list", () => {
      const { container } = render(<SpecBlock spec={baseSpec} />);
      const dl = container.querySelector("dl");
      expect(dl).toBeInTheDocument();
    });

    it("renders valid paired <dt> terms and <dd> descriptions", () => {
      const { container } = render(
        <SpecBlock
          spec={{
            ...baseSpec,
            stack: ["React", "TypeScript"],
          }}
        />,
      );

      const dts = container.querySelectorAll("dt");
      const dds = container.querySelectorAll("dd");

      expect(dts.length).toBe(5);
      expect(dds.length).toBe(5);

      dts.forEach((dt) => {
        const dd = dt.parentElement?.querySelector("dd");
        expect(dd).toBeInTheDocument();
      });
    });
  });

  describe("mandatory spec fields", () => {
    it("renders Year, Role, Medium, and Status terms and their values", () => {
      render(<SpecBlock spec={baseSpec} />);

      const yearDt = screen.getByText("Year");
      expect(yearDt.tagName).toBe("DT");
      expect(yearDt.parentElement?.querySelector("dd")).toHaveTextContent("2026");

      const roleDt = screen.getByText("Role");
      expect(roleDt.tagName).toBe("DT");
      expect(roleDt.parentElement?.querySelector("dd")).toHaveTextContent(
        "Lead Designer & Developer",
      );

      const mediumDt = screen.getByText("Medium");
      expect(mediumDt.tagName).toBe("DT");
      expect(mediumDt.parentElement?.querySelector("dd")).toHaveTextContent(
        "Web Application",
      );

      const statusDt = screen.getByText("Status");
      expect(statusDt.tagName).toBe("DT");
      expect(statusDt.parentElement?.querySelector("dd")).toHaveTextContent(
        "Active",
      );
    });

    it("renders numeric and string year values accurately", () => {
      const { rerender } = render(
        <SpecBlock spec={{ ...baseSpec, year: 2024 }} />,
      );
      expect(
        screen.getByText("Year").parentElement?.querySelector("dd"),
      ).toHaveTextContent("2024");

      rerender(<SpecBlock spec={{ ...baseSpec, year: "2023–2025" }} />);
      expect(
        screen.getByText("Year").parentElement?.querySelector("dd"),
      ).toHaveTextContent("2023–2025");
    });

    it("marks the status indicator dot as decorative (aria-hidden)", () => {
      render(<SpecBlock spec={baseSpec} />);
      const statusDd = screen
        .getByText("Status")
        .parentElement?.querySelector("dd");
      const indicator = statusDd?.querySelector("[aria-hidden='true']");
      expect(indicator).toBeInTheDocument();
    });
  });

  describe("stack and materials conditions", () => {
    it("renders a Stack row with items joined by comma when stack is provided", () => {
      render(
        <SpecBlock
          spec={{
            ...baseSpec,
            stack: ["Next.js", "TypeScript", "Tailwind CSS"],
          }}
        />,
      );

      const stackDt = screen.getByText("Stack");
      expect(stackDt.tagName).toBe("DT");
      expect(stackDt.parentElement?.querySelector("dd")).toHaveTextContent(
        "Next.js, TypeScript, Tailwind CSS",
      );
      expect(screen.queryByText("Materials")).not.toBeInTheDocument();
    });

    it("renders a single stack item without trailing comma", () => {
      render(
        <SpecBlock
          spec={{
            ...baseSpec,
            stack: ["Rust"],
          }}
        />,
      );

      expect(
        screen.getByText("Stack").parentElement?.querySelector("dd"),
      ).toHaveTextContent("Rust");
    });

    it("renders a Materials row when materials are provided instead of stack", () => {
      render(
        <SpecBlock
          spec={{
            ...baseSpec,
            materials: ["Anodized Aluminum", "Walnut", "Brass"],
          }}
        />,
      );

      const materialsDt = screen.getByText("Materials");
      expect(materialsDt.tagName).toBe("DT");
      expect(materialsDt.parentElement?.querySelector("dd")).toHaveTextContent(
        "Anodized Aluminum, Walnut, Brass",
      );
      expect(screen.queryByText("Stack")).not.toBeInTheDocument();
    });

    it("renders neither Stack nor Materials row when neither property is present", () => {
      const { container } = render(<SpecBlock spec={baseSpec} />);

      expect(screen.queryByText("Stack")).not.toBeInTheDocument();
      expect(screen.queryByText("Materials")).not.toBeInTheDocument();

      const dts = container.querySelectorAll("dt");
      expect(dts).toHaveLength(4);
    });

    it("prioritizes Stack when both stack and materials are provided", () => {
      render(
        <SpecBlock
          spec={{
            ...baseSpec,
            stack: ["React", "CSS"],
            materials: ["PLA Plastic"],
          }}
        />,
      );

      expect(screen.getByText("Stack")).toBeInTheDocument();
      expect(
        screen.getByText("Stack").parentElement?.querySelector("dd"),
      ).toHaveTextContent("React, CSS");
      expect(screen.queryByText("Materials")).not.toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has no automated accessibility violations with default mandatory fields", async () => {
      const { container } = render(<SpecBlock spec={baseSpec} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no automated accessibility violations with stack", async () => {
      const { container } = render(
        <SpecBlock
          spec={{
            ...baseSpec,
            stack: ["Next.js", "TypeScript", "Tailwind CSS"],
          }}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no automated accessibility violations with materials", async () => {
      const { container } = render(
        <SpecBlock
          spec={{
            ...baseSpec,
            materials: ["Oak", "Steel"],
          }}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

