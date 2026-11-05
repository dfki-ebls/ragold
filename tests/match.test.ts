import { describe, expect, it } from "vitest";
import { normalizePassage, passageLocator } from "@/lib/match";

describe("normalizePassage", () => {
  it("folds Unicode, case, hyphenation, punctuation, and markdown", () => {
    expect(normalizePassage("Die ﬁnale Ｖersion")).toBe("die finale version");
    expect(normalizePassage("well-\n  known, state-of-the-art")).toBe("wellknown state of the art");
    expect(normalizePassage("| **Bold** | `code` |\n# Title")).toBe("bold code title");
  });
});

describe("passageLocator", () => {
  const haystack = "Intro.\nThe **quick** brown fox jum-\nps over the lazy dog.\nOutro.";
  const locate = passageLocator(haystack);

  it("maps normalized containment back to original offsets", () => {
    const found = locate("quick brown fox jumps");

    expect(found && haystack.slice(...found)).toBe("quick** brown fox jum-\nps");
  });

  it("falls back to in-order token coverage above the threshold", () => {
    const found = locate("the quick red fox jumps over the lazy dog");

    expect(found && haystack.slice(...found)).toBe(
      "The **quick** brown fox jum-\nps over the lazy dog",
    );
    expect(locate("the slow red cat jumps over a lazy dog")).toBeNull();
  });
});
