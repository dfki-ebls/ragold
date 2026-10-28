import dayjs from "dayjs";
import { v1 as uuidv1 } from "uuid";
import { z } from "zod";
import { getFile } from "@/lib/fileStorage";
import { snapshot, useStore } from "@/lib/store";
import { type AnnotationData, annotationDataSchema, type Document } from "@/lib/types";
import { downloadBlob } from "@/lib/utils";

/** Parsed zip archive, files are keyed by the document ids of `data`. */
export interface Archive {
  data: AnnotationData;
  files: Map<string, ArrayBuffer>;
}

const DATA_FILE = "annotations.json";

function filePath(id: string, doc: Document): string {
  return `files/${id}/${doc.name}`;
}

/** Read and validate a zip archive of `annotations.json` and `files/<documentId>/<name>`. */
export async function readArchive(zipBlob: Blob): Promise<Archive> {
  const { default: JSZip } = await import("jszip");
  const zip = await JSZip.loadAsync(zipBlob);
  const entry = zip.file(DATA_FILE);

  if (!entry) {
    throw new Error(`Invalid archive: ${DATA_FILE} not found`);
  }

  const result = annotationDataSchema.safeParse(JSON.parse(await entry.async("text")));

  if (!result.success) {
    throw new Error(`Invalid ${DATA_FILE}: ${z.prettifyError(result.error)}`);
  }

  const entries = await Promise.all(
    Object.entries(result.data.documents).flatMap(([id, doc]) => {
      const file = zip.file(filePath(id, doc));
      return file ? [file.async("arraybuffer").then((buffer) => [id, buffer] as const)] : [];
    }),
  );

  return { data: result.data, files: new Map(entries) };
}

/**
 * Merge an archive into the current project and return the new annotation ids.
 * Everything is validated before anything is written,
 * documents with known content are reused, and all other ids are regenerated.
 * Metadata is only adopted if the current project is empty.
 */
export async function mergeImport({ data, files }: Archive): Promise<string[]> {
  const state = useStore.getState();
  const adoptMetadata =
    Object.keys(state.annotations).length === 0 && Object.keys(state.documents).length === 0;
  const documents = Object.entries(data.documents);
  const results = await state.addFiles(
    documents.map(([id, doc]) => {
      const buffer = files.get(id);

      if (!buffer) {
        throw new Error(`Missing file for document "${doc.name}"`);
      }

      return { buffer, doc };
    }),
  );
  const idMap = new Map(documents.map(([id], i) => [id, results[i].id]));
  // The schema guarantees that every passage refers to a document of the archive.
  const annotations = Object.fromEntries(
    Object.values(data.annotations).map((annotation) => [
      uuidv1(),
      {
        ...annotation,
        passages: annotation.passages.map((p) => ({
          ...p,
          documentId: idMap.get(p.documentId) ?? p.documentId,
        })),
      },
    ]),
  );

  useStore.setState((current) => ({
    annotations: { ...current.annotations, ...annotations },
    updatedAt: dayjs().toISOString(),
    ...(adoptMetadata && { author: data.author, project: data.project, notes: data.notes }),
  }));

  if (adoptMetadata) {
    state.setLanguage(data.language);
  }

  return Object.keys(annotations);
}

/** Download the current project as a zip archive. */
export async function exportArchive(): Promise<void> {
  const now = dayjs();
  const data: AnnotationData = { ...snapshot(useStore.getState()), updatedAt: now.toISOString() };
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  // Documents such as PDF, DOCX, or XLSX are compressed already, so only the data is deflated.
  zip.file(DATA_FILE, JSON.stringify(data, null, 2), { compression: "DEFLATE" });

  await Promise.all(
    Object.entries(data.documents).map(async ([id, doc]) => {
      const file = await getFile(id);

      if (!file) {
        throw new Error(`Missing file for document "${doc.name}"`);
      }

      zip.file(filePath(id, doc), file);
    }),
  );

  const zipBlob = await zip.generateAsync({ type: "blob", compression: "STORE" });
  downloadBlob(zipBlob, `ragold-${now.format("YYYYMMDD-HHmmss")}.zip`);
  useStore.setState({ updatedAt: data.updatedAt });
}
