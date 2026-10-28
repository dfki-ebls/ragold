import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { ViewerProps } from "@/components/viewers/types";
import { ViewerLoading } from "@/components/viewers/ViewerLoading";
import { closestData, rangeAnchor, selectionHandlers } from "@/lib/selection";
import { useResource } from "@/lib/useResource";
import { locatePassage } from "@/lib/match";
import { decodeText, formatSpan, lineAt } from "@/lib/viewer";
import { cn } from "cn";

/** Lines rendered at once, more are added on request to keep the DOM small. */
const LINES_STEP = 2000;

async function loadText(blob: Blob): Promise<string> {
  return decodeText(await blob.arrayBuffer());
}

function TextViewer(props: ViewerProps) {
  const text = useResource(props.blob, loadText);

  return text === undefined ? <ViewerLoading /> : <TextContent text={text} {...props} />;
}

export default memo(TextViewer);

function TextContent({ text, focus, onSelect }: ViewerProps & { text: string }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => text.split(/\r?\n/), [text]);
  const marked = useMemo(() => {
    const found = focus && locatePassage(focus.text, text);
    return found ? { from: lineAt(text, found[0]), to: lineAt(text, found[1] - 1) } : null;
  }, [text, focus]);
  const [limit, setLimit] = useState(() => Math.max(LINES_STEP, (marked?.to ?? 0) + LINES_STEP));

  useEffect(() => {
    if (marked) {
      ref.current
        ?.querySelector(`[data-line="${marked.from}"]`)
        ?.scrollIntoView({ block: "center" });
    }
  }, [marked]);

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
            className={cn(
              "relative min-h-5 pl-14 break-all whitespace-pre-wrap before:absolute before:left-0 before:w-10 before:text-right before:text-muted-foreground before:content-[attr(data-line)] before:select-none",
              marked && i + 1 >= marked.from && i + 1 <= marked.to && "bg-highlight",
            )}
          >
            {line}
          </div>
        ))}
      </div>
      {limit < lines.length && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {t("viewer.textTruncated", { shown: limit, total: lines.length })}
          <Button variant="outline" size="sm" onClick={() => setLimit(limit + LINES_STEP)}>
            {t("viewer.showMore")}
          </Button>
        </div>
      )}
    </div>
  );
}
