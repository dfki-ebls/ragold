import DOMPurify from "dompurify";
import mammoth from "mammoth";
import { useRef } from "react";
import { type ViewerProps, viewerLoader } from "@/components/viewers/types";
import { ViewerLoading } from "@/components/viewers/ViewerLoading";
import { rangeAnchor, selectionHandlers, useTextHighlights } from "@/lib/selection";
import { useResource } from "@/lib/useResource";

const loadHtml = viewerLoader(async (blob) => {
  const { value } = await mammoth.convertToHtml({ arrayBuffer: await blob.arrayBuffer() });
  return DOMPurify.sanitize(value);
});

/** Text of the nearest heading before `node`, null if there is none. */
function headingBefore(root: HTMLElement, node: Node): string | null {
  let heading: string | null = null;

  for (const element of root.querySelectorAll("h1, h2, h3, h4, h5, h6")) {
    const before =
      element.contains(node) ||
      element.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING;

    if (!before) {
      break;
    }

    heading = element.textContent.trim() || null;
  }

  return heading;
}

export default function DocxViewer({ file, passages, focus, onSelect }: ViewerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const html = useResource(file, loadHtml);
  useTextHighlights(ref, html, passages, focus);

  const handlers = selectionHandlers((selection) => {
    onSelect(
      selection && {
        text: selection.text,
        location: headingBefore(selection.element, selection.range.startContainer),
        anchor: rangeAnchor(selection.range, selection.element),
      },
    );
  });

  if (html === undefined) {
    return <ViewerLoading />;
  }

  return (
    <div
      ref={ref}
      className="prose prose-sm max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: html }}
      {...handlers}
    />
  );
}
