import { v1 as uuidv1 } from "uuid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18n, { type SupportedLanguage, supportedLanguages } from "@/i18n";
import {
  type Annotation,
  type AnnotationData,
  annotationDataSchema,
  type Document,
  SCHEMA_VERSION,
} from "@/lib/types";

interface AppState extends AnnotationData {
  addAnnotation: (data: Annotation) => string;
  updateAnnotation: (id: string, data: Annotation) => void;
  deleteAnnotation: (id: string) => void;
  clearAll: () => void;

  addDocument: (data: Document) => string;
  updateDocument: (id: string, data: Document) => void;
  deleteDocument: (id: string) => void;

  setAuthor: (author: string) => void;
  setProject: (project: string) => void;
  setDescription: (description: string) => void;
  setLanguage: (language: SupportedLanguage) => void;

  exportAnnotations: () => void;
  importAnnotations: (file: File) => Promise<number>;
}

function createEmptyState(): AnnotationData {
  const now = new Date().toISOString();
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

      addAnnotation: (data) => {
        const id = uuidv1();
        set((state) => ({
          annotations: { ...state.annotations, [id]: data },
        }));
        return id;
      },

      updateAnnotation: (id, data) => {
        set((state) => {
          const existing = state.annotations[id];
          if (!existing) return state;
          return {
            annotations: {
              ...state.annotations,
              [id]: { ...existing, ...data },
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

      clearAll: () => set({ annotations: {}, documents: {} }),

      addDocument: (data) => {
        const id = uuidv1();
        set((state) => ({
          documents: { ...state.documents, [id]: data },
        }));
        return id;
      },

      updateDocument: (id, data) => {
        set((state) => {
          const existing = state.documents[id];
          if (!existing) return state;
          return {
            documents: {
              ...state.documents,
              [id]: { ...existing, ...data },
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
      setDescription: (description) => set({ description }),
      setLanguage: (language) => {
        i18n.changeLanguage(language);
        set({ language });
      },

      exportAnnotations: () => {
        const {
          annotations,
          documents,
          author,
          project,
          description,
          language,
          createdAt,
        } = get();
        const now = new Date().toISOString();

        const exportData = {
          version: SCHEMA_VERSION,
          author,
          project,
          description,
          language,
          createdAt,
          updatedAt: now,
          annotations,
          documents,
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `ragold-${now.split("T")[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);

        set({ updatedAt: now });
      },

      importAnnotations: async (file) => {
        const text = await file.text();
        const raw = JSON.parse(text);

        // Reject files from newer schema versions
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
        const now = new Date().toISOString();

        const currentIds = new Set(Object.keys(get().annotations));
        const newAnnotations = Object.fromEntries(
          Object.entries(parsed.annotations).filter(
            ([id]) => !currentIds.has(id),
          ),
        );

        const currentDocIds = new Set(Object.keys(get().documents));
        const newDocuments = Object.fromEntries(
          Object.entries(parsed.documents).filter(
            ([id]) => !currentDocIds.has(id),
          ),
        );

        const importedLanguage: SupportedLanguage = supportedLanguages.includes(
          parsed.language as SupportedLanguage,
        )
          ? (parsed.language as SupportedLanguage)
          : get().language;

        set((state) => ({
          annotations: { ...state.annotations, ...newAnnotations },
          documents: { ...state.documents, ...newDocuments },
          createdAt: parsed.createdAt || state.createdAt,
          updatedAt: now,
          author: parsed.author || state.author,
          project: parsed.project || state.project,
          description: parsed.description || state.description,
          language: importedLanguage,
        }));

        i18n.changeLanguage(importedLanguage);

        return Object.keys(newAnnotations).length;
      },
    }),
    {
      name: "ragold-store",
      partialize: (state) => ({
        version: SCHEMA_VERSION,
        author: state.author,
        project: state.project,
        description: state.description,
        language: state.language,
        createdAt: state.createdAt,
        updatedAt: state.updatedAt,
        annotations: state.annotations,
        documents: state.documents,
      }),
      merge: (_persisted, current) => {
        const result = annotationDataSchema.safeParse(_persisted);
        if (!result.success) return current;
        return { ...current, ...result.data };
      },
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          i18n.changeLanguage(state.language);
        }
      },
    },
  ),
);
