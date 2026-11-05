import { type RefObject, type SyntheticEvent, useEffect } from "react";
import { passageLocator } from "@/lib/match";
import { type Passage, PASSAGE_GRADES, type PassageGrade } from "@/lib/types";

/** Positioning reference accepted by the `anchor` prop of Base UI positioners. */
export interface VirtualAnchor {
  getBoundingClientRect: () => DOMRect;
  contextElement?: Element;
}

/** Content picked in a document viewer, ready to become a passage. */
export interface ViewerSelection {
  text: string;
  location: string | null;
  anchor: VirtualAnchor;
}

/** Anchor at the last line of a range, so the popup appears where the selection ends. */
export function rangeAnchor(range: Range, contextElement?: Element): VirtualAnchor {
  return {
    getBoundingClientRect: () => {
      const rects = range.getClientRects();
      return rects.length > 0 ? rects[rects.length - 1] : range.getBoundingClientRect();
    },
    contextElement,
  };
}

export interface TextSelection {
  range: Range;
  text: string;
  /** The element the handlers are spread on. */
  element: HTMLElement;
}

/**
 * Event handlers reporting the non-empty selection inside the element they are spread on,
 * or null once it is gone.
 */
export function selectionHandlers(onSelect: (selection: TextSelection | null) => void) {
  const handle = (event: SyntheticEvent<HTMLElement>) => {
    const selection = window.getSelection();
    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const text = selection?.toString().trim() ?? "";
    const element = event.currentTarget;
    const inside = range && !range.collapsed && element.contains(range.commonAncestorContainer);

    onSelect(inside && text ? { range: range.cloneRange(), text, element } : null);
  };

  return { onPointerUp: handle, onKeyUp: handle };
}

/** Numeric `data-<name>` attribute of the closest element around `node`, 0 if there is none. */
export function closestData(node: Node, name: string): number {
  const element = node instanceof Element ? node : node.parentElement;
  return Number(element?.closest(`[data-${name}]`)?.getAttribute(`data-${name}`) ?? 0);
}

export function clearSelection(): void {
  window.getSelection()?.removeAllRanges();
}

/** Elements that separate words in the text of a viewer, such as pdf.js line ends or table cells. */
const BREAKS = new Set([
  "BR",
  "P",
  "DIV",
  "LI",
  "TD",
  "TH",
  "TR",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
]);

/** Search for each of `passages` in the text of `root` with `passageLocator`. */
export function findTextRanges(root: Node, passages: readonly string[]): (Range | null)[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  const nodes: Text[] = [];
  const starts: number[] = [];
  let text = "";

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node instanceof Text) {
      nodes.push(node);
      starts.push(text.length);
      text += node.data;
    } else if (BREAKS.has(node.nodeName)) {
      text += "\n";
    }
  }

  // An end offset belongs to the node it ends, not to the one starting there.
  const locate = (offset: number, end = false) => {
    const index = starts.findLastIndex((start) => (end ? start < offset : start <= offset));
    return [nodes[index], offset - starts[index]] as const;
  };
  const locatePassage = passageLocator(text);

  return passages.map((passage) => {
    const found = locatePassage(passage);

    if (!found) {
      return null;
    }

    const range = document.createRange();
    range.setStart(...locate(found[0]));
    range.setEnd(...locate(found[1], true));

    return range;
  });
}

/** Search for `passage` in the text of `root`, see `findTextRanges`. */
export function findTextRange(root: Node, passage: string): Range | null {
  return findTextRanges(root, [passage])[0];
}

/**
 * Paint ranges with the CSS Custom Highlight API, returns a cleanup function.
 * Higher priorities are painted on top.
 */
export function paintHighlight(name: string, ranges: Range[], priority = 0): () => void {
  if (!("highlights" in CSS)) {
    return () => undefined;
  }

  const highlight = new Highlight(...ranges);
  highlight.priority = priority;
  CSS.highlights.set(name, highlight);

  return () => CSS.highlights.delete(name);
}

export interface GradedRange {
  grade: PassageGrade;
  range: Range;
}

/** Ranges of the passages found in the text of `root`. */
export function passageRanges(
  root: Node,
  passages: readonly Pick<Passage, "text" | "grade">[],
): GradedRange[] {
  return findTextRanges(
    root,
    passages.map((passage) => passage.text),
  ).flatMap((range, i) => (range ? [{ grade: passages[i].grade, range }] : []));
}

/** Paint ranges with the `ragold-<grade>` highlights, returns a cleanup function. */
export function paintGrades(ranges: Iterable<GradedRange>): () => void {
  const byGrade = Map.groupBy(ranges, ({ grade }) => grade);
  const cleanups = PASSAGE_GRADES.map((grade) =>
    paintHighlight(
      `ragold-${grade}`,
      (byGrade.get(grade) ?? []).map(({ range }) => range),
    ),
  );

  return () => cleanups.forEach((cleanup) => cleanup());
}

/** Emphasize `range` above the passage highlights and optionally scroll to it, returns a cleanup function. */
export function focusRange(range: Range, scroll = true): () => void {
  if (scroll) {
    range.startContainer.parentElement?.scrollIntoView({ block: "center" });
  }

  return paintHighlight("ragold-focus", [range], 1);
}

/**
 * Highlight `passages` by grade and scroll to `focus` inside `ref` once `content` is rendered,
 * the highlights are painted again when it changes.
 */
export function useTextHighlights(
  ref: RefObject<HTMLElement | null>,
  content: unknown,
  passages: readonly Pick<Passage, "text" | "grade">[],
  focus: Pick<Passage, "text"> | undefined,
): void {
  const ready = content !== undefined;

  useEffect(() => {
    const root = ref.current;
    return content !== undefined && root ? paintGrades(passageRanges(root, passages)) : undefined;
  }, [ref, content, passages]);

  useEffect(() => {
    const range = ready && focus && ref.current ? findTextRange(ref.current, focus.text) : null;
    return range ? focusRange(range) : undefined;
  }, [ref, ready, focus]);
}
