import "@/components/viewers/pdfjs";
import "pdfjs-dist/web/pdf_viewer.css";
import { getDocument, type PDFDocumentProxy } from "pdfjs-dist";
import { EventBus, LinkTarget, PDFLinkService, PDFViewer } from "pdfjs-dist/web/pdf_viewer.mjs";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { ViewerProps } from "@/components/viewers/types";
import { ViewerLoading } from "@/components/viewers/ViewerLoading";
import { locatePassage } from "@/lib/match";
import {
  closestData,
  findTextRange,
  paintHighlight,
  rangeAnchor,
  selectionHandlers,
} from "@/lib/selection";
import { useResource } from "@/lib/useResource";
import { formatSpan } from "@/lib/viewer";

interface Pdf {
  proxy: PDFDocumentProxy;
  /** Text of every page, extracted once on the first focus search. */
  pages: () => Promise<string[]>;
}

function extractPages(proxy: PDFDocumentProxy): Promise<string[]> {
  return Promise.all(
    Array.from({ length: proxy.numPages }, async (_, i) => {
      const { items } = await (await proxy.getPage(i + 1)).getTextContent();
      // Line ends become breaks as in the text layer, so that words of adjacent lines stay apart.
      return items
        .map((item) => ("str" in item ? item.str + (item.hasEOL ? "\n" : "") : ""))
        .join("");
    }),
  );
}

async function loadPdf(blob: Blob): Promise<Pdf> {
  const proxy = await getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
  let pages: Promise<string[]> | undefined;

  return { proxy, pages: () => (pages ??= extractPages(proxy)) };
}

function destroyPdf({ proxy }: Pdf): void {
  void proxy.loadingTask.destroy();
}

/** Number of the page where `passage` starts, null if it is not found. */
async function findPage(pdf: Pdf, passage: string): Promise<number | null> {
  const starts: number[] = [];
  let text = "";

  for (const page of await pdf.pages()) {
    starts.push(text.length);
    text += `${page}\n`;
  }

  const found = locatePassage(passage, text);

  return found && starts.findLastIndex((start) => start <= found[0]) + 1;
}

function PdfViewer({ blob, focus, onSelect }: ViewerProps) {
  const pdf = useResource(blob, loadPdf, destroyPdf);

  return pdf ? <PdfPages pdf={pdf} focus={focus} onSelect={onSelect} /> : <ViewerLoading />;
}

export default memo(PdfViewer);

function PdfPages({
  pdf,
  focus,
  onSelect,
}: Pick<ViewerProps, "focus" | "onSelect"> & { pdf: Pdf }) {
  const ref = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<PDFViewer>();
  const findFocus = useCallback((text: string) => findPage(pdf, text).catch(() => null), [pdf]);
  const focusPage = useResource(focus?.text ?? null, findFocus);
  const focusText = focus?.text;

  useEffect(() => {
    const container = ref.current;

    if (!container) {
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;
    const eventBus = new EventBus();
    const linkService = new PDFLinkService({ eventBus, externalLinkTarget: LinkTarget.BLANK });
    // `abortSignal` detaches the listeners of the viewer, it is supported but missing from the typings.
    const options = {
      container,
      eventBus,
      linkService,
      removePageBorders: true,
      abortSignal: signal,
    };
    const viewer = new PDFViewer(options);
    const fit = () => {
      viewer.currentScaleValue = "page-width";
    };
    const observer = new ResizeObserver(fit);

    eventBus.on(
      "pagesinit",
      () => {
        fit();
        setViewer(viewer);
      },
      { signal },
    );
    observer.observe(container);
    linkService.setViewer(viewer);
    linkService.setDocument(pdf.proxy);
    viewer.setDocument(pdf.proxy);

    return () => {
      controller.abort();
      observer.disconnect();
      viewer.setDocument(null);
      linkService.setDocument(null);
      setViewer(undefined);
    };
  }, [pdf]);

  useEffect(() => {
    if (!viewer || !focusText || !focusPage) {
      return;
    }

    const controller = new AbortController();
    let clear: (() => void) | undefined;

    // Text layers are rebuilt when pages are rendered again, so the highlight is repainted each time.
    const highlight = () => {
      const layer = viewer.container.querySelector(`[data-page-number="${focusPage}"] .textLayer`);
      const range = layer && findTextRange(layer, focusText);

      if (!range) {
        return;
      }

      if (!clear) {
        range.startContainer.parentElement?.scrollIntoView({ block: "center" });
      }

      clear = paintHighlight("ragold-passage", [range]);
    };

    viewer.eventBus.on(
      "textlayerrendered",
      ({ pageNumber }: { pageNumber: number }) => {
        if (pageNumber === focusPage) highlight();
      },
      { signal: controller.signal },
    );
    viewer.scrollPageIntoView({ pageNumber: focusPage });
    highlight();

    return () => {
      controller.abort();
      clear?.();
    };
  }, [viewer, focusText, focusPage]);

  const handlers = selectionHandlers((selection) => {
    onSelect(
      selection && {
        text: selection.text.replace(/\s+/g, (space) => (space.includes("\n") ? "\n" : " ")),
        location: formatSpan({
          unit: "page",
          from: closestData(selection.range.startContainer, "page-number"),
          to: closestData(selection.range.endContainer, "page-number"),
        }),
        anchor: rangeAnchor(selection.range, selection.element),
      },
    );
  });

  // pdf.js requires an absolutely positioned scroll container.
  return (
    <div className="relative h-full">
      {!viewer && <ViewerLoading />}
      <div ref={ref} className="absolute inset-0 overflow-auto" {...handlers}>
        <div className="pdfViewer" />
      </div>
    </div>
  );
}
