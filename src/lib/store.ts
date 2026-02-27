import dayjs from "dayjs";
import { v1 as uuidv1 } from "uuid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18n, { type SupportedLanguage, supportedLanguages } from "@/i18n";
import { getAllFiles, putBuffer, clearAllFiles } from "@/lib/fileStorage";
import {
  type Annotation,
  type AnnotationData,
  annotationDataSchema,
  type Document,
  documentSchema,
  SCHEMA_VERSION,
} from "@/lib/types";

interface AppState extends AnnotationData {
  addAnnotation: (data: Annotation) => string;
  updateAnnotation: (id: string, data: Annotation) => void;
  deleteAnnotation: (id: string) => void;
  addDocument: (id: string, data: Partial<Document>) => void;
  updateDocument: (id: string, data: Partial<Document>) => void;
  deleteDocument: (id: string) => void;

  setAuthor: (author: string) => void;
  setProject: (project: string) => void;
  setNotes: (notes: string) => void;
  setLanguage: (language: SupportedLanguage) => void;

  annotationFormDirty: boolean;
  documentFormDirty: boolean;
  setAnnotationFormDirty: (dirty: boolean) => void;
  setDocumentFormDirty: (dirty: boolean) => void;

  exportAnnotations: () => Promise<void>;
  importAnnotations: (file: File) => Promise<number>;
}

// --- Schema migration helpers ---

let pendingMigrationData: unknown = null;

export function getPendingMigrationData(): unknown {
  return pendingMigrationData;
}

export function clearPendingMigrationData(): void {
  pendingMigrationData = null;
}

function hasContent(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    (!!d.annotations && Object.keys(d.annotations as object).length > 0) ||
    (!!d.documents && Object.keys(d.documents as object).length > 0)
  );
}

// ---

function createEmptyState() {
  const now = dayjs().toISOString();
  return annotationDataSchema.parse({
    language: i18n.language,
    createdAt: now,
    updatedAt: now,
  });
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...createEmptyState(),

      annotationFormDirty: false,
      documentFormDirty: false,
      setAnnotationFormDirty: (dirty) => set({ annotationFormDirty: dirty }),
      setDocumentFormDirty: (dirty) => set({ documentFormDirty: dirty }),

      addAnnotation: (data) => {
        const id = uuidv1();
        const now = dayjs().toISOString();
        set((state) => ({
          annotations: {
            ...state.annotations,
            [id]: { ...data, createdAt: now, updatedAt: now },
          },
        }));
        return id;
      },

      updateAnnotation: (id, data) => {
        const now = dayjs().toISOString();
        set((state) => {
          const existing = state.annotations[id];
          if (!existing) return state;
          return {
            annotations: {
              ...state.annotations,
              [id]: { ...existing, ...data, updatedAt: now },
            },
          };
        });
      },

      deleteAnnotation: (id) => {
        set((state) => {
          const { [id]: _, ...rest } = state.annotations;
          return { annotations: rest };
        });
      },

      addDocument: (id, data) => {
        const now = dayjs().toISOString();
        const doc = documentSchema.parse({ ...data, createdAt: now, updatedAt: now });
        set((state) => ({
          documents: { ...state.documents, [id]: doc },
        }));
      },

      updateDocument: (id, data) => {
        const now = dayjs().toISOString();
        set((state) => {
          const existing = state.documents[id];
          if (!existing) return state;
          return {
            documents: {
              ...state.documents,
              [id]: { ...existing, ...data, updatedAt: now },
            },
          };
        });
      },

      deleteDocument: (id) => {
        set((state) => {
          const { [id]: _, ...rest } = state.documents;
          return { documents: rest };
        });
      },

      setAuthor: (author) => set({ author }),
      setProject: (project) => set({ project }),
      setNotes: (notes) => set({ notes }),
      setLanguage: (language) => {
        void i18n.changeLanguage(language);
        set({ language });
      },

      exportAnnotations: async () => {
        const { annotations, documents, author, project, notes, language, createdAt } = get();
        const now = dayjs();
        const stamp = now.format("YYYYMMDD-HHmmss");

        const exportData = {
          version: SCHEMA_VERSION,
          author,
          project,
          notes,
          language,
          createdAt,
          updatedAt: now.toISOString(),
          annotations,
          documents,
        };

        const { default: JSZip } = await import("jszip");
        const zip = new JSZip();
        zip.file("annotations.json", JSON.stringify(exportData, null, 2));

        const files = await getAllFiles();
        for (const [id, blob] of files) {
          const doc = documents[id];
          if (doc) {
            zip.file(`files/${id}/${doc.name}`, blob);
          }
        }

        const zipBlob = await zip.generateAsync({
          type: "blob",
          compression: "DEFLATE",
        });
        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `ragold-${stamp}.zip`;
        link.click();
        URL.revokeObjectURL(url);

        set({ updatedAt: now.toISOString() });
      },

      importAnnotations: async (file) => {
        const { default: JSZip } = await import("jszip");
        const zip = await JSZip.loadAsync(file);

        const metaFile = zip.file("annotations.json");
        if (!metaFile) {
          throw new Error("Invalid zip: annotations.json not found");
        }

        const text = await metaFile.async("text");
        const raw = JSON.parse(text);

        if (typeof raw.version === "number" && raw.version > SCHEMA_VERSION) {
          throw new Error(
            `This file requires a newer version of RAGold (schema v${raw.version}, current v${SCHEMA_VERSION}). Please update the app.`,
          );
        }

        const result = annotationDataSchema.safeParse(raw);
        if (!result.success) {
          throw new Error("Invalid format: schema validation failed");
        }

        const parsed = result.data;

        const importedLanguage: SupportedLanguage = supportedLanguages.includes(parsed.language)
          ? parsed.language
          : get().language;

        // Clear existing files before writing new ones
        await clearAllFiles();

        // Extract and store document files from the zip
        await Promise.all(
          Object.entries(parsed.documents).map(async ([id, doc]) => {
            const zipEntry = zip.file(`files/${id}/${doc.name}`);
            if (!zipEntry) return;
            const buffer = await zipEntry.async("arraybuffer");
            await putBuffer(id, buffer);
          }),
        );

        set({
          annotations: parsed.annotations,
          documents: parsed.documents,
          createdAt: parsed.createdAt,
          updatedAt: dayjs().toISOString(),
          author: parsed.author,
          project: parsed.project,
          notes: parsed.notes,
          language: importedLanguage,
        });

        void i18n.changeLanguage(importedLanguage);

        return Object.keys(parsed.annotations).length;
      },
    }),
    {
      name: "ragold-store",
      partialize: (state) => ({
        version: SCHEMA_VERSION,
        author: state.author,
        project: state.project,
        notes: state.notes,
        language: state.language,
        createdAt: state.createdAt,
        updatedAt: state.updatedAt,
        annotations: state.annotations,
        documents: state.documents,
      }),
      merge: (_persisted, current) => {
        if (
          _persisted &&
          typeof _persisted === "object" &&
          "version" in _persisted &&
          typeof (_persisted as { version: unknown }).version === "number" &&
          (_persisted as { version: number }).version < SCHEMA_VERSION &&
          hasContent(_persisted)
        ) {
          pendingMigrationData = _persisted;
          return current;
        }
        const result = annotationDataSchema.safeParse(_persisted);
        if (!result.success) return current;
        return { ...current, ...result.data };
      },
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          void i18n.changeLanguage(state.language);
        }
      },
    },
  ),
);
