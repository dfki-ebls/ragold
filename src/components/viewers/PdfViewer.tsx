import "@/components/viewers/pdfjs";
import "pdfjs-dist/web/pdf_viewer.css";
import { getDocument, type PDFDocumentProxy } from "pdfjs-dist";
import { EventBus, LinkTarget, PDFLinkService, PDFViewer } from "pdfjs-dist/web/pdf_viewer.mjs";
import { useEffect, useRef, useState } from "react";
import { type ViewerPassage, type ViewerProps, viewerLoader } from "@/components/viewers/types";
import { ViewerLoading } from "@/components/viewers/ViewerLoading";
import { passageLocator } from "@/lib/match";
import {
  closestData,
  findTextRange,
  focusRange,
  type GradedRange,
  paintGrades,
  passageRanges,
  rangeAnchor,
  selectionHandlers,
} from "@/lib/selection";
import { useResource } from "@/lib/useResource";
import { formatSpan } from "@/lib/viewer";

interface Pdf {
  proxy: PDFDocumentProxy;
  /** Number of the page where a passage starts, null if it is not found. */
  pageOf: (passage: string) => Promise<number | null>;
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

async function pageLocator(proxy: PDFDocumentProxy): Promise<(passage: string) => number | null> {
  const starts: number[] = [];
  let text = "";

  for (const page of await extractPages(proxy)) {
    starts.push(text.length);
    text += `${page}\n`;
  }

  const locate = passageLocator(text);

  return (passage) => {
    const found = locate(passage);
    return found && starts.findLastIndex((start) => start <= found[0]) + 1;
  };
}

const loadPdf = viewerLoader(
  async (blob): Promise<Pdf> => {
    const proxy = await getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
    // The text of all pages is extracted once on the first search.
    let locate: Promise<(passage: string) => number | null> | undefined;

    return {
      proxy,
      pageOf: (passage) =>
        (locate ??= pageLocator(proxy)).then((pageOf) => pageOf(passage)).catch(() => null),
    };
  },
  ({ proxy }) => void proxy.loadingTask.destroy(),
);

export default function PdfViewer({ file, passages, focus, onSelect }: ViewerProps) {
  const pdf = useResource(file, loadPdf);

  return pdf ? (
    <PdfPages pdf={pdf} passages={passages} focus={focus} onSelect={onSelect} />
  ) : (
    <ViewerLoading />
  );
}

/**
 * Call `paint` for each of `pages` now and again whenever pdf.js renders one of them,
 * since it rebuilds the text layers on rendering.
 */
function onTextLayers(
  viewer: PDFViewer,
  signal: AbortSignal,
  pages: ReadonlySet<number>,
  paint: (page: number, layer: Element) => void,
): void {
  const repaint = (page: number) => {
    const layer = viewer.container.querySelector(`[data-page-number="${page}"] .textLayer`);
    if (layer && pages.has(page)) paint(page, layer);
  };

  viewer.eventBus.on(
    "textlayerrendered",
    ({ pageNumber }: { pageNumber: number }) => repaint(pageNumber),
    {
      signal,
    },
  );
  pages.forEach(repaint);
}

function PdfPages({
  pdf,
  passages,
  focus,
  onSelect,
}: Pick<ViewerProps, "passages" | "focus" | "onSelect"> & { pdf: Pdf }) {
  const ref = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<PDFViewer>();

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
    if (!viewer) {
      return;
    }

    const controller = new AbortController();
    const painted = new Map<number, GradedRange[]>();
    let clear: (() => void) | undefined;

    void Promise.all(passages.map((passage) => pdf.pageOf(passage.text))).then((pages) => {
      const byPage = new Map<number, ViewerPassage[]>();

      passages.forEach((passage, i) => {
        const page = pages[i];
        if (page) byPage.set(page, [...(byPage.get(page) ?? []), passage]);
      });

      if (!controller.signal.aborted) {
        onTextLayers(viewer, controller.signal, new Set(byPage.keys()), (page, layer) => {
          painted.set(page, passageRanges(layer, byPage.get(page) ?? []));
          clear = paintGrades([...painted.values()].flat());
        });
      }
    });

    return () => {
      controller.abort();
      clear?.();
    };
  }, [viewer, pdf, passages]);

  useEffect(() => {
    if (!viewer || !focus) {
      return;
    }

    const controller = new AbortController();
    let clear: (() => void) | undefined;

    void pdf.pageOf(focus.text).then((page) => {
      if (controller.signal.aborted || !page) {
        return;
      }

      viewer.scrollPageIntoView({ pageNumber: page });
      onTextLayers(viewer, controller.signal, new Set([page]), (_, layer) => {
        const range = findTextRange(layer, focus.text);

        // Scroll to the passage once, repaints follow when the page is rendered again.
        if (range) clear = focusRange(range, !clear);
      });
    });

    return () => {
      controller.abort();
      clear?.();
    };
  }, [viewer, pdf, focus]);

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
