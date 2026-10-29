import { describe, expect, it } from "vitest";
import { followEdit } from "@/lib/keyFacts";
import type { KeyFact } from "@/lib/types";

const before = "Paris has 2.1 million inhabitants.";
const facts: KeyFact[] = [{ text: "2.1 million", importance: "must" }];

function edit(after: string, caret: number): string[] {
  return followEdit(before, after, caret, facts).map((fact) => fact.text);
}

describe("followEdit", () => {
  it("updates facts edited inside", () => {
    expect(edit("Paris has 2.2 million inhabitants.", 13)).toEqual(["2.2 million"]);
    expect(edit("Paris has 2.1 billion inhabitants.", 15)).toEqual(["2.1 billion"]);
  });

  it("keeps facts edited around them", () => {
    expect(edit("Paris has 22.1 million inhabitants.", 11)).toEqual(["2.1 million"]);
    expect(edit("Paris has 2.1 million  inhabitants.", 22)).toEqual(["2.1 million"]);
    expect(edit("Paris has inhabitants.", 10)).toEqual(["2.1 million"]);
  });

  it("merges facts that become equal", () => {
    const merged = followEdit("a b", "a a", 3, [
      { text: "a", importance: "must" },
      { text: "b", importance: "nice" },
    ]);
    expect(merged).toEqual([{ text: "a", importance: "must" }]);
  });
});
