import type { KeyFact } from "@/lib/types";

/** Start indices of all occurrences of `part` in `text`. */
export function occurrences(text: string, part: string): number[] {
  const indices: number[] = [];

  for (let i = text.indexOf(part); i >= 0; i = text.indexOf(part, i + 1)) {
    indices.push(i);
  }

  return indices;
}

/**
 * Carry key facts through an edit of the response, so that rewording a key fact updates it.
 * A textarea edit replaces a single span, the caret after the edit marks the end of the inserted text.
 * Facts the edit deletes or only partly overlaps are kept as they are and become stale.
 */
export function followEdit(
  before: string,
  after: string,
  caret: number,
  keyFacts: readonly KeyFact[],
): KeyFact[] {
  const maxSuffix = Math.min(before.length, after.length - caret);
  let suffix = 0;
  while (suffix < maxSuffix && before.at(-1 - suffix) === after.at(-1 - suffix)) suffix++;

  const maxStart = Math.min(before.length, after.length) - suffix;
  let start = 0;
  while (start < maxStart && before[start] === after[start]) start++;

  const end = before.length - suffix;
  const shift = after.length - before.length;
  // Typing right next to a fact does not extend it.
  const covers = (factStart: number, factEnd: number) =>
    factStart <= start &&
    end <= factEnd &&
    !(start === end && (start === factStart || start === factEnd));

  const followed = keyFacts.map((fact) => {
    const length = fact.text.length;
    const factStart = occurrences(before, fact.text).find((i) => covers(i, i + length));
    const text = factStart === undefined ? "" : after.slice(factStart, factStart + length + shift);

    return text ? { ...fact, text } : fact;
  });

  return followed.filter((fact, i) => followed.findIndex((f) => f.text === fact.text) === i);
}
