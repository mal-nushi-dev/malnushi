import { describe, expect, it } from "vitest";
import {
  alphabetical,
  groupsOf,
  plural,
  sentenceParts,
  sentenceText,
  tickLength,
} from "./shelf";

describe("sentenceParts", () => {
  it("fills the number and the noun, and makes them the loud part", () => {
    const parts = sentenceParts("I have named {count} {items}.", 214, "bird");
    expect(parts).toEqual([
      { text: "I have named ", loud: false },
      { text: "214 birds", loud: true },
      { text: ".", loud: false },
    ]);
  });

  it("keeps the noun singular for one", () => {
    expect(sentenceText(sentenceParts("I have named {count} {items}.", 1, "bird"))).toBe(
      "I have named 1 bird.",
    );
  });

  it("puts a thousands separator in a big number", () => {
    expect(sentenceText(sentenceParts("{count} {items}.", 12345, "flight"))).toBe("12,345 flights.");
  });

  it("makes only the number loud when the noun is not beside it", () => {
    const parts = sentenceParts("I keep {count} things.", 3);
    expect(parts.filter((p) => p.loud).map((p) => p.text)).toEqual(["3"]);
  });

  it("reads as a count and its noun without a sentence", () => {
    expect(sentenceText(sentenceParts(undefined, 128, "recommendation"))).toBe("128 recommendations.");
  });
});

describe("plural", () => {
  it("adds an s unless there is one", () => {
    expect(plural("set", 0)).toBe("sets");
    expect(plural("set", 1)).toBe("set");
    expect(plural("set", 2)).toBe("sets");
  });
});

describe("groupsOf", () => {
  const items = [
    { title: "Travels", category: "places and nature" },
    { title: "Recommendations", category: "Taste" },
    { title: "Cameras" },
    { title: "Life list", category: "Places and nature" },
    { title: "Records", category: "Taste" },
  ];

  it("makes a group for each category in use, alphabetical, uncategorised last", () => {
    const groups = groupsOf(items);
    expect(groups.map((g) => g.label)).toEqual(["Places and nature", "Taste", undefined]);
  });

  it("orders each group by title and treats a category's case as the same", () => {
    const groups = groupsOf(items);
    expect(groups[0].items.map((i) => i.title)).toEqual(["Life list", "Travels"]);
    expect(groups[1].items.map((i) => i.title)).toEqual(["Recommendations", "Records"]);
    expect(groups[2].items.map((i) => i.title)).toEqual(["Cameras"]);
  });

  it("is one group when nothing has a category, and none when there is nothing", () => {
    expect(groupsOf([{ title: "A" }, { title: "B" }])).toHaveLength(1);
    expect(groupsOf([])).toEqual([]);
  });
});

describe("alphabetical", () => {
  it("sorts by title without changing its input", () => {
    const input = [{ title: "b" }, { title: "a" }];
    expect(alphabetical(input).map((i) => i.title)).toEqual(["a", "b"]);
    expect(input.map((i) => i.title)).toEqual(["b", "a"]);
  });
});

describe("tickLength", () => {
  it("is the longest for the largest and the shortest for none", () => {
    expect(tickLength(214, 214)).toBe(46);
    expect(tickLength(0, 214)).toBe(10);
  });

  it("grows by the square root, so a hundredth is a tenth of the way", () => {
    expect(tickLength(2, 200)).toBe(14);
    expect(tickLength(50, 200)).toBe(28);
  });

  it("never passes the longest", () => {
    expect(tickLength(500, 214)).toBe(46);
  });
});
