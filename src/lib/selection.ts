import { type RefObject, type SyntheticEvent, useEffect } from "react";
import { locatePassage } from "@/lib/match";

/** Positioning reference accepted by the `anchor` prop of Base UI positioners. */
export interface VirtualAnchor {
  getBoundingClientRect: () => DOMRect;
  contextElement?: Element;
}

/** Content picked in a document viewer, ready to become a passage. */
export interface ViewerSelection {
  text: string;
  location: string;
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
const BREAKS = new Set(["BR", "P", "DIV", "LI", "TD", "TH", "TR", "H1", "H2", "H3", "H4", "H5", "H6"]);

/** Search for `passage` in the text of `root` with `locatePassage`. */
export function findTextRange(root: Node, passage: string): Range | null {
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

  const found = locatePassage(passage, text);

  if (!found) {
    return null;
  }

  // An end offset belongs to the node it ends, not to the one starting there.
  const locate = (offset: number, end = false) => {
    const index = starts.findLastIndex((start) => (end ? start < offset : start <= offset));
    return [nodes[index], offset - starts[index]] as const;
  };

  const range = document.createRange();
  range.setStart(...locate(found[0]));
  range.setEnd(...locate(found[1], true));

  return range;
}

/** Paint ranges with the CSS Custom Highlight API, returns a cleanup function. */
export function paintHighlight(name: string, ranges: Range[]): () => void {
  if (!("highlights" in CSS)) {
    return () => undefined;
  }

  CSS.highlights.set(name, new Highlight(...ranges));

  return () => CSS.highlights.delete(name);
}

/** Locate, scroll to, and highlight `text` inside `ref` once `ready`. */
export function useFocusHighlight(
  ref: RefObject<HTMLElement | null>,
  text: string | undefined,
  ready: boolean,
): void {
  useEffect(() => {
    const range = ready && text && ref.current ? findTextRange(ref.current, text) : null;

    if (!range) {
      return;
    }

    range.startContainer.parentElement?.scrollIntoView({ block: "center" });

    return paintHighlight("ragold-passage", [range]);
  }, [ref, text, ready]);
}
