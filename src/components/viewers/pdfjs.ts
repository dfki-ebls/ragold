import * as pdfjsLib from "pdfjs-dist";
// oxlint-disable-next-line import/default -- Vite asset URL import
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

// The viewer component reads the library from the global scope, so this module is imported before it.
Object.assign(globalThis, { pdfjsLib });
