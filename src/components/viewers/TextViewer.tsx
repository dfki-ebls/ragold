import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { type ViewerProps, viewerLoader } from "@/components/viewers/types";
import { ViewerLoading } from "@/components/viewers/ViewerLoading";
import { passageLocator } from "@/lib/match";
import { closestData, rangeAnchor, selectionHandlers, useTextHighlights } from "@/lib/selection";
import { useResource } from "@/lib/useResource";
import { decodeText, formatSpan, lineAt } from "@/lib/viewer";

/** Lines rendered at once, more are added on request to keep the DOM small. */
const LINES_STEP = 2000;

const loadText = viewerLoader(async (blob) => decodeText(await blob.arrayBuffer()));

export default function TextViewer(props: ViewerProps) {
  const text = useResource(props.file, loadText);

  return text === undefined ? <ViewerLoading /> : <TextContent text={text} {...props} />;
}

function TextContent({ text, passages, focus, onSelect }: ViewerProps & { text: string }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const lines = text.split(/\r?\n/);
  const locate = passageLocator(text);
  // The focus is located in the full text, so that its lines are rendered before they are highlighted.
  const found = focus && locate(focus.text);
  const focusEnd = found ? lineAt(text, found[1] - 1) : 0;
  const [requested, setRequested] = useState(LINES_STEP);
  const limit = Math.max(requested, focusEnd + LINES_STEP);
  useTextHighlights(ref, limit, passages, focus);

  const handlers = selectionHandlers((selection) => {
    if (!selection) {
      onSelect(null);
      return;
    }

    const { range } = selection;
    const from = closestData(range.startContainer, "line");
    let to = closestData(range.endContainer, "line");

    // A selection ending at the start of a line does not include that line.
    if (to > from && range.endOffset === 0) {
      to--;
    }

    onSelect({
      text: selection.text,
      location: formatSpan({ unit: "line", from, to }),
      anchor: rangeAnchor(range, selection.element),
    });
  });

  return (
    <div className="space-y-3">
      <div ref={ref} className="font-mono text-xs leading-5" {...handlers}>
        {lines.slice(0, limit).map((line, i) => (
          <div
            key={i}
            data-line={i + 1}
            className="relative min-h-5 pl-14 break-all whitespace-pre-wrap before:absolute before:left-0 before:w-10 before:text-right before:text-muted-foreground before:content-[attr(data-line)] before:select-none"
          >
            {line}
          </div>
        ))}
      </div>
      {limit < lines.length && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {t("viewer.textTruncated", { shown: limit, total: lines.length })}
          <Button variant="outline" size="sm" onClick={() => setRequested(limit + LINES_STEP)}>
            {t("viewer.showMore")}
          </Button>
        </div>
      )}
    </div>
  );
}
