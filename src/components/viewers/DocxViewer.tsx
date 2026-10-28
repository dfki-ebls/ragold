import DOMPurify from "dompurify";
import mammoth from "mammoth";
import { memo, useRef } from "react";
import type { ViewerProps } from "@/components/viewers/types";
import { ViewerLoading } from "@/components/viewers/ViewerLoading";
import { rangeAnchor, selectionHandlers, useFocusHighlight } from "@/lib/selection";
import { useResource } from "@/lib/useResource";

async function loadHtml(blob: Blob): Promise<string> {
  const { value } = await mammoth.convertToHtml({ arrayBuffer: await blob.arrayBuffer() });
  return DOMPurify.sanitize(value);
}

/** Text of the nearest heading before `node`, empty if there is none. */
function headingBefore(root: HTMLElement, node: Node): string {
  let heading = "";

  for (const element of root.querySelectorAll("h1, h2, h3, h4, h5, h6")) {
    const before =
      element.contains(node) ||
      element.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING;

    if (!before) {
      break;
    }

    heading = element.textContent.trim();
  }

  return heading;
}

function DocxViewer({ blob, focus, onSelect }: ViewerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const html = useResource(blob, loadHtml);
  useFocusHighlight(ref, focus?.text, html !== undefined);

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

export default memo(DocxViewer);
