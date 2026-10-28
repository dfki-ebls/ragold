import { describe, expect, it } from "vitest";
import { locatePassage, normalizePassage } from "@/lib/match";

describe("normalizePassage", () => {
  it("folds Unicode, case, hyphenation, punctuation, and markdown", () => {
    expect(normalizePassage("Die ﬁnale Ｖersion")).toBe("die finale version");
    expect(normalizePassage("well-\n  known, state-of-the-art")).toBe("wellknown state of the art");
    expect(normalizePassage("| **Bold** | `code` |\n# Title")).toBe("bold code title");
  });
});

describe("locatePassage", () => {
  const haystack = "Intro.\nThe **quick** brown fox jum-\nps over the lazy dog.\nOutro.";

  it("maps normalized containment back to original offsets", () => {
    const found = locatePassage("quick brown fox jumps", haystack);

    expect(found && haystack.slice(...found)).toBe("quick** brown fox jum-\nps");
  });

  it("falls back to in-order token coverage above the threshold", () => {
    const found = locatePassage("the quick red fox jumps over the lazy dog", haystack);

    expect(found && haystack.slice(...found)).toBe("The **quick** brown fox jum-\nps over the lazy dog");
    expect(locatePassage("the slow red cat jumps over a lazy dog", haystack)).toBeNull();
  });
});
