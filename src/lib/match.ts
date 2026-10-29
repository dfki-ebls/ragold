/** Share of passage tokens that the fallback must find in order within a window. */
export const MATCH_THRESHOLD = 0.8;

const SEGMENT = /\P{M}\p{M}*|\p{M}+/gu;
const HYPHEN_BREAK = /[-\u00AD\u2010][^\S\n]*\n\s*/y;
const WORD = /[\p{L}\p{M}\p{N}]/u;

interface Normalized {
  text: string;
  /** Original `[start, end)` offsets of the segment that produced each character of `text`. */
  starts: number[];
  ends: number[];
}

function normalize(text: string): Normalized {
  const starts: number[] = [];
  const ends: number[] = [];
  const segment = new RegExp(SEGMENT);
  let output = "";
  let space = false;

  for (let match = segment.exec(text); match; match = segment.exec(text)) {
    const start = match.index;
    const end = segment.lastIndex;
    HYPHEN_BREAK.lastIndex = start;

    // Words hyphenated across lines are joined by dropping the hyphen and the break.
    if (HYPHEN_BREAK.test(text)) {
      segment.lastIndex = HYPHEN_BREAK.lastIndex;
      continue;
    }

    for (const char of match[0].normalize("NFKC").toLowerCase()) {
      if (!WORD.test(char)) {
        space ||= output.length > 0;
        continue;
      }

      if (space) {
        output += " ";
        starts.push(start);
        ends.push(start);
        space = false;
      }

      output += char;

      for (let i = 0; i < char.length; i++) {
        starts.push(start);
        ends.push(end);
      }
    }
  }

  return { text: output, starts, ends };
}

/**
 * Canonical form for comparing passages: NFKC, lower case, words hyphenated across lines joined,
 * everything but letters, marks and digits replaced by single spaces.
 *
 * @example normalizePassage("**Well-\n  known** | ﬁle") === "wellknown file"
 */
export function normalizePassage(text: string): string {
  return normalize(text).text;
}

/** For each prefix of `b`, the length of the longest common subsequence with `a`. */
function lcsPrefixes(a: readonly string[], b: readonly string[]): number[] {
  const column = Array.from({ length: a.length + 1 }, () => 0);
  const result = [0];

  for (const token of b) {
    let diagonal = 0;

    for (let i = 1; i <= a.length; i++) {
      const above = column[i];
      column[i] = a[i - 1] === token ? diagonal + 1 : Math.max(column[i - 1], above);
      diagonal = above;
    }

    result.push(column[a.length]);
  }

  return result;
}

/** Window of `size` tokens with the largest multiset overlap with `needle`, as its start index. */
function bestWindow(needle: readonly string[], tokens: readonly string[], size: number): number {
  const missing = new Map<string, number>();

  for (const token of needle) {
    missing.set(token, (missing.get(token) ?? 0) + 1);
  }

  let overlap = 0;
  let best = { start: 0, overlap: -1 };

  for (let i = 0; i < tokens.length; i++) {
    const added = missing.get(tokens[i]);

    if (added !== undefined) {
      missing.set(tokens[i], added - 1);
      overlap += added > 0 ? 1 : 0;
    }

    const removed = i >= size ? missing.get(tokens[i - size]) : undefined;

    if (removed !== undefined) {
      missing.set(tokens[i - size], removed + 1);
      overlap -= removed >= 0 ? 1 : 0;
    }

    if (i >= size - 1 && overlap > best.overlap) {
      best = { start: i - size + 1, overlap };
    }
  }

  return best.start;
}

interface Index extends Normalized {
  tokens: string[];
  /** Offset in `text` where each token starts, plus one past the end. */
  offsets: number[];
}

function indexOf(haystack: string): Index {
  const normalized = normalize(haystack);
  const tokens = normalized.text.split(" ");
  const offsets = [0];

  for (const token of tokens) {
    offsets.push(offsets[offsets.length - 1] + token.length + 1);
  }

  return { ...normalized, tokens, offsets };
}

/**
 * Locator of passages in `haystack`, returning `[start, end)` offsets into `haystack` or null.
 * Normalized containment is tried first, then the window of about the passage's length whose tokens
 * cover at least `MATCH_THRESHOLD` of the passage tokens in order.
 * The haystack is indexed once on the first search and results are kept per passage,
 * so reuse the locator for several passages.
 */
export function passageLocator(haystack: string): (passage: string) => [number, number] | null {
  let index: Index | undefined;
  const results = new Map<string, [number, number] | null>();

  const locate = (passage: string): [number, number] | null => {
    const needle = normalizePassage(passage);
    const { text, starts, ends, tokens, offsets } = (index ??= indexOf(haystack));

    if (!needle || !text) {
      return null;
    }

    const found = text.indexOf(needle);

    if (found >= 0) {
      return [starts[found], ends[found + needle.length - 1]];
    }

    const needleTokens = needle.split(" ");
    const size = Math.min(needleTokens.length, tokens.length);
    const start = bestWindow(needleTokens, tokens, size);
    const window = tokens.slice(start, start + size);
    const forward = lcsPrefixes(needleTokens, window);
    const matched = forward[size];

    if (matched / needleTokens.length < MATCH_THRESHOLD) {
      return null;
    }

    // Trim the window to its first and last token that take part in the in-order match.
    const last = forward.indexOf(matched) - 1;
    const backward = lcsPrefixes(needleTokens.toReversed(), window.slice(0, last + 1).toReversed());
    const first = last + 1 - backward.indexOf(matched);

    return [starts[offsets[start + first]], ends[offsets[start + last + 1] - 2]];
  };

  return (passage) => {
    if (!results.has(passage)) {
      results.set(passage, locate(passage));
    }

    return results.get(passage) ?? null;
  };
}
