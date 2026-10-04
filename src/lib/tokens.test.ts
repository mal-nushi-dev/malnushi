// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/*
 * tokens/*.json is the source of truth; src/app/globals.css mirrors it by
 * hand. These tests fail when the two drift apart: a changed value, a token
 * with no CSS, or a CSS variable with no token.
 */

type Json = Record<string, unknown>;
const root = join(__dirname, "../..");
const read = (path: string) => readFileSync(join(root, path), "utf8");
const json = (path: string) => JSON.parse(read(path)) as Json;

const primitives = json("tokens/primitives.json");
const semantic = json("tokens/semantic.json");
const modes = {
  light: json("tokens/modes/light.json"),
  dark: json("tokens/modes/dark.json"),
};

function at(tree: Json, path: string): Json {
  let node: unknown = tree;
  for (const part of path.split(".")) node = (node as Json)?.[part];
  if (!node) throw new Error(`No token at ${path}`);
  return node as Json;
}

/** Follows {a.b.c} aliases through the primitives and the mode file. */
function resolve(value: unknown, mode: Json = modes.light): unknown {
  if (typeof value === "string" && /^\{.+\}$/.test(value)) {
    const path = value.slice(1, -1);
    let node: Json;
    try {
      node = at(primitives, path);
    } catch {
      node = at(mode, path);
    }
    return resolve(node.$value, mode);
  }
  return value;
}

const token = (path: string, mode?: Json) => {
  const value = resolve(at(semantic, path).$value, mode);
  return value;
};

const px = (value: unknown) => {
  const { value: n, unit } = value as { value: number; unit: string };
  expect(unit).toBe("px");
  return `${n}px`;
};

/** Body of the first `{ ... }` block that follows `header`, balanced. */
function block(css: string, header: string, from = 0): string {
  const start = css.indexOf(header, from);
  if (start === -1) throw new Error(`No "${header}" in globals.css`);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  throw new Error(`Unbalanced block after "${header}"`);
}

function declarations(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  const stripped = body.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const m of stripped.matchAll(/(--[\w-]+|[\w-]+)\s*:\s*([^;]+);/g)) {
    out[m[1]] = m[2].trim().replace(/\s+/g, " ");
  }
  return out;
}

const css = read("src/app/globals.css");
const rootVars = declarations(block(css, ":root"));
const darkVars = declarations(
  block(block(css, "@media (prefers-color-scheme: dark)"), ":root"),
);

function flatten(tree: Json, prefix = ""): [string, Json][] {
  return Object.entries(tree).flatMap(([key, node]) => {
    if (key.startsWith("$")) return [];
    const path = prefix ? `${prefix}.${key}` : key;
    return "$value" in (node as Json)
      ? [[path, node as Json]]
      : flatten(node as Json, path);
  });
}

const dimensions: Record<string, string> = {
  "space.gutter.desktop": "--gutter",
  "space.col-gap": "--col-gap",
  "space.stack.sm": "--space-sm",
  "space.stack.md": "--space-md",
  "space.stack.lg": "--space-lg",
  "space.stack.xl": "--space-xl",
  "space.stack.2xl": "--space-2xl",
  "space.block": "--space-block",
  "space.header-top": "--space-header-top",
  "space.nav-item": "--space-nav-item",
  "space.meta-item": "--space-meta-item",
  "space.row.index": "--space-row-index",
  "space.row.table": "--space-row-table",
  "size.content-width": "--content-width",
  "size.reading-measure": "--measure",
  "size.touch-target": "--touch-target",
  "size.pill-height": "--pill-height",
  "radius.image": "--radius-img",
  "radius.code": "--radius-code",
  "radius.nav": "--radius-nav",
  "radius.nav-open": "--radius-nav-open",
};

describe("colors", () => {
  const colors: Record<string, string> = {
    bg: "--bg",
    surface: "--surface",
    ink: "--ink",
    "ink-2": "--ink-2",
    link: "--link",
    accent: "--accent",
    line: "--line",
    "code.bg": "--code-bg",
    "code.fg": "--code-fg",
  };
  const hex = (name: string, mode: Json) =>
    (
      resolve(at(mode, `color.${name}`).$value, mode) as { hex: string }
    ).hex.toLowerCase();

  it("maps every color token to a variable", () => {
    const tokenNames = flatten(modes.light.color as Json).map(
      ([path]) => path,
    );
    const colorTokens = tokenNames.filter(
      (p) => !p.startsWith("neutral") && !p.startsWith("slate"),
    );
    expect(colorTokens.sort()).toEqual(Object.keys(colors).sort());
  });

  it("has the same color tokens in light and dark", () => {
    const names = (mode: Json) =>
      flatten(mode.color as Json).map(([path]) => path).sort();
    expect(names(modes.dark)).toEqual(names(modes.light));
  });

  for (const [name, variable] of Object.entries(colors)) {
    it(`light ${name} is ${variable}`, () => {
      expect(rootVars[variable]?.toLowerCase()).toBe(hex(name, modes.light));
    });
    it(`dark ${name} is ${variable}`, () => {
      expect(darkVars[variable]?.toLowerCase()).toBe(hex(name, modes.dark));
    });
  }
});

describe("dimensions", () => {
  for (const [path, variable] of Object.entries(dimensions)) {
    it(`${path} is ${variable}`, () => {
      expect(rootVars[variable]).toBe(px(token(path)));
    });
  }

  it("lists every non-color token that has CSS, and none that doesn't", () => {
    // Tokens with no CSS variable by design (see DESIGN.md, "Design tokens"):
    // spacing used only as a primitive, image gaps, borders, the full radius
    // (Tailwind's rounded-full), the mobile gutter, and type (below).
    const noVariable = new Set([
      "space.gutter.mobile",
      "space.image-gap.min",
      "space.image-gap.max",
      "radius.pill",
    ]);
    const tokens = flatten(semantic)
      .map(([path]) => path)
      .filter((p) => !p.startsWith("type.") && !p.startsWith("border."))
      .filter((p) => !noVariable.has(p));
    expect(tokens.sort()).toEqual(Object.keys(dimensions).sort());
  });
});

describe("css variables", () => {
  // Defined in CSS only, with no token yet (noted in DESIGN.md).
  const codeOnly = new Set(["--shadow-nav"]);
  const colorVars = [
    "--bg",
    "--surface",
    "--ink",
    "--ink-2",
    "--link",
    "--accent",
    "--line",
    "--code-bg",
    "--code-fg",
  ];

  it("has a token behind every :root variable", () => {
    const mapped = new Set([...colorVars, ...Object.values(dimensions)]);
    const orphans = Object.keys(rootVars).filter(
      (n) => !codeOnly.has(n) && !mapped.has(n),
    );
    expect(orphans).toEqual([]);
  });

  it("only overrides variables in dark mode that exist in :root", () => {
    for (const name of Object.keys(darkVars)) {
      expect(rootVars, name).toHaveProperty([name]);
    }
  });
});

describe("type styles", () => {
  const family: Record<string, string> = {
    Newsreader: "var(--font-newsreader), Georgia, serif",
    "Google Sans Flex":
      "var(--font-google-sans-flex), system-ui, sans-serif",
    "JetBrains Mono": "var(--font-jetbrains-mono), ui-monospace, monospace",
  };
  const styles = Object.keys(semantic.type as Json);

  it("has a utility for every type token and no others", () => {
    const utilities = [...css.matchAll(/@utility type-([\w-]+)/g)].map(
      (m) => m[1],
    );
    expect(utilities.sort()).toEqual([...styles].sort());
  });

  for (const name of styles) {
    it(`type-${name} matches its token`, () => {
      const node = at(semantic, `type.${name}`);
      const value = node.$value as Record<string, unknown>;
      const declared = declarations(block(css, `@utility type-${name} `));

      const tracking = resolve(value.letterSpacing) as {
        value: number;
      };
      const textCase = (
        node.$extensions as { malnushi?: { textCase?: string } } | undefined
      )?.malnushi?.textCase;

      expect(declared["font-family"]).toBe(
        family[resolve(value.fontFamily) as string],
      );
      expect(declared["font-size"]).toBe(px(resolve(value.fontSize)));
      expect(declared["font-weight"]).toBe(
        String(resolve(value.fontWeight)),
      );
      expect(declared["line-height"]).toBe(String(value.lineHeight));
      expect(declared["letter-spacing"]).toBe(
        tracking.value === 0 ? "0" : px(tracking),
      );
      expect(declared["text-transform"]).toBe(textCase);
    });
  }
});
