import dayjs from "dayjs";
import { v1 as uuidv1 } from "uuid";
import { z } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18n, { type SupportedLanguage } from "@/i18n";
import { deleteFile, putFiles, resetIndexedDb, sha256 } from "@/lib/fileStorage";
import {
  type Annotation,
  type AnnotationContent,
  type AnnotationData,
  annotationContentSchemaFor,
  annotationDataSchema,
  type Document,
  SCHEMA_VERSION,
} from "@/lib/types";
import { uniqueName } from "@/lib/utils";

export const STORE_KEY = "ragold-store";

export interface UploadResult {
  id: string;
  /** True if a document with the same content already existed and was reused. */
  duplicate: boolean;
}

/** File content with the fields of its document, a declared `sha256` must match the content. */
export interface DocumentFile {
  buffer: ArrayBuffer;
  doc: Pick<Document, "name"> & Partial<Document>;
  /** Existing document whose file is replaced, a new document is created otherwise. */
  id?: string;
}

interface AppState extends AnnotationData {
  /** Why the stored data failed to load, which stays untouched while this is set. */
  loadError: string | null;
  /** Throws a `ZodError` if the content is invalid or a passage refers to an unknown document. */
  addAnnotation: (content: AnnotationContent) => string;
  updateAnnotation: (id: string, content: AnnotationContent) => void;
  deleteAnnotation: (id: string) => void;
  /**
   * Store files in a single transaction and return their document ids in order.
   * Documents with the same content are reused, and checksums are verified before anything is written.
   */
  addFiles: (files: readonly DocumentFile[]) => Promise<UploadResult[]>;
  /** Stores the file unless a document with the same sha256 exists. */
  uploadDocument: (file: File) => Promise<UploadResult>;
  /** Throws if another document already has the same content. */
  replaceDocumentFile: (id: string, file: File) => Promise<void>;
  updateDocument: (id: string, data: Partial<Pick<Document, "name" | "notes">>) => void;
  /** Also removes the passages that refer to the document, so that exports stay consistent. */
  deleteDocument: (id: string) => void;

  setAuthor: (author: string) => void;
  setProject: (project: string) => void;
  setNotes: (notes: string) => void;
  setLanguage: (language: SupportedLanguage) => void;
}

/** The persisted and exported part of the state. */
export function snapshot({
  version,
  author,
  project,
  notes,
  language,
  createdAt,
  updatedAt,
  annotations,
  documents,
}: AnnotationData): AnnotationData {
  return { version, author, project, notes, language, createdAt, updatedAt, annotations, documents };
}

function idsBySha(documents: Record<string, Document>): Map<string, string> {
  return new Map(Object.entries(documents).map(([id, doc]) => [doc.sha256, id]));
}

function otherNames(documents: Record<string, Document>, excludeId?: string): string[] {
  return Object.entries(documents)
    .filter(([id]) => id !== excludeId)
    .map(([, doc]) => doc.name);
}

function createEmptyState(): AnnotationData {
  const now = dayjs().toISOString();

  return annotationDataSchema.parse({
    version: SCHEMA_VERSION,
    language: i18n.language,
    createdAt: now,
    updatedAt: now,
  });
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...createEmptyState(),
      loadError: null,

      addAnnotation: (content) => {
        const id = uuidv1();
        const now = dayjs().toISOString();
        const annotation: Annotation = {
          ...annotationContentSchemaFor(get().documents).parse(content),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ annotations: { ...state.annotations, [id]: annotation } }));

        return id;
      },

      updateAnnotation: (id, content) => {
        const existing = get().annotations[id];

        if (!existing) {
          return;
        }

        const annotation: Annotation = {
          ...annotationContentSchemaFor(get().documents).parse(content),
          createdAt: existing.createdAt,
          updatedAt: dayjs().toISOString(),
        };
        set((state) => ({ annotations: { ...state.annotations, [id]: annotation } }));
      },

      deleteAnnotation: (id) => {
        set((state) => {
          const { [id]: _, ...rest } = state.annotations;
          return { annotations: rest };
        });
      },

      addFiles: async (files) => {
        const hashes = await Promise.all(files.map(({ buffer }) => sha256(buffer)));

        files.forEach(({ doc }, i) => {
          if (doc.sha256 !== undefined && doc.sha256 !== hashes[i]) {
            throw new Error(`Checksum mismatch for document "${doc.name}"`);
          }
        });

        const known = idsBySha(get().documents);
        const written = new Map<string, ArrayBuffer>();
        const planned = files.map(({ buffer, id: target }, i): UploadResult => {
          const existing = known.get(hashes[i]);

          if (existing && existing !== target) {
            return { id: existing, duplicate: true };
          }

          const id = target ?? uuidv1();
          known.set(hashes[i], id);
          written.set(id, buffer);

          return { id, duplicate: false };
        });

        await putFiles(written);

        // Concurrent calls may have stored the same content or deleted the target in the meantime.
        const documents = { ...get().documents };
        const current = idsBySha(documents);
        const now = dayjs().toISOString();
        const results = planned.map((result, i): UploadResult => {
          const { buffer, doc, id: target } = files[i];
          const existing = current.get(hashes[i]);
          const previous = target ? documents[target] : undefined;

          if (result.duplicate || (!target && existing && existing !== result.id)) {
            if (!result.duplicate) {
              void deleteFile(result.id).catch(() => undefined);
            }

            return { id: existing ?? result.id, duplicate: true };
          }

          if (target && !previous) {
            return result;
          }

          documents[result.id] = {
            notes: "",
            createdAt: now,
            ...previous,
            updatedAt: now,
            ...doc,
            name: uniqueName(doc.name, otherNames(documents, result.id)),
            size: buffer.byteLength,
            sha256: hashes[i],
          };
          current.set(hashes[i], result.id);

          return result;
        });

        set({ documents });

        return results;
      },

      uploadDocument: async (file) => {
        const [result] = await get().addFiles([
          { buffer: await file.arrayBuffer(), doc: { name: file.name } },
        ]);

        return result;
      },

      replaceDocumentFile: async (id, file) => {
        const [result] = await get().addFiles([
          { id, buffer: await file.arrayBuffer(), doc: { name: file.name } },
        ]);

        if (result.duplicate) {
          throw new Error(`Same content as "${get().documents[result.id].name}"`);
        }
      },

      updateDocument: (id, data) => {
        set((state) => {
          const doc = state.documents[id];

          if (!doc) {
            return state;
          }

          const name =
            data.name === undefined
              ? doc.name
              : uniqueName(data.name, otherNames(state.documents, id));

          return {
            documents: {
              ...state.documents,
              [id]: { ...doc, ...data, name, updatedAt: dayjs().toISOString() },
            },
          };
        });
      },

      deleteDocument: (id) => {
        set((state) => {
          const { [id]: _, ...rest } = state.documents;
          const now = dayjs().toISOString();
          const annotations = Object.fromEntries(
            Object.entries(state.annotations).map(([annotationId, annotation]) => {
              const passages = annotation.passages.filter((p) => p.documentId !== id);

              return [
                annotationId,
                passages.length === annotation.passages.length
                  ? annotation
                  : { ...annotation, passages, updatedAt: now },
              ];
            }),
          );

          return { documents: rest, annotations };
        });
        void deleteFile(id).catch(() => undefined);
      },

      setAuthor: (author) => set({ author }),
      setProject: (project) => set({ project }),
      setNotes: (notes) => set({ notes }),
      setLanguage: (language) => {
        void i18n.changeLanguage(language);
        set({ language });
      },
    }),
    {
      name: STORE_KEY,
      partialize: (state) => snapshot(state),
      // Data that does not validate, such as data of another schema version, is kept for export,
      // since the app shows only the recovery screen and thus writes nothing while `loadError` is set.
      merge: (persisted, current) => {
        if (persisted === undefined) {
          return current;
        }

        const result = annotationDataSchema.safeParse(persisted);

        return result.success
          ? { ...current, ...result.data, loadError: null }
          : { ...current, loadError: z.prettifyError(result.error) };
      },
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          void i18n.changeLanguage(state.language);
        }
      },
    },
  ),
);

// Keep tabs in sync, the storage event only fires in the tabs that did not write.
window.addEventListener("storage", (event) => {
  if (event.key === STORE_KEY) {
    void useStore.persist.rehydrate();
  }
});

/** Unsaved form changes, kept apart so that typing does not persist the whole store. */
export const useDirtyForms = create(() => ({ annotation: false, document: false }));

/** Clear all persisted app data (IndexedDB and localStorage) and reload. */
export async function resetApp(): Promise<void> {
  await resetIndexedDb();
  localStorage.removeItem(STORE_KEY);
  window.location.reload();
}
