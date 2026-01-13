import { v1 as uuidv1 } from "uuid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Annotation, AnnotationData, DocChunk } from "@/lib/types";

interface AppState extends AnnotationData {
  addAnnotation: (data: Annotation) => string;
  updateAnnotation: (id: string, data: Partial<Annotation>) => void;
  deleteAnnotation: (id: string) => void;
  clearAnnotations: () => void;

  setAuthor: (author: string) => void;
  setProject: (project: string) => void;
  setDescription: (description: string) => void;

  exportAnnotations: () => void;
  importAnnotations: (file: File) => Promise<number>;
}

function createEmptyState(): AnnotationData {
  const now = new Date().toISOString();
  return {
    author: "",
    project: "",
    description: "",
    createdAt: now,
    updatedAt: now,
    annotations: {},
  };
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

      clearAnnotations: () => set({ annotations: {} }),

      setAuthor: (author) => set({ author }),
      setProject: (project) => set({ project }),
      setDescription: (description) => set({ description }),

      exportAnnotations: () => {
        const { annotations, author, project, description, createdAt } = get();
        const now = new Date().toISOString();

        const exportData = {
          author,
          project,
          description,
          createdAt,
          updatedAt: now,
          annotations,
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
        const parsed = JSON.parse(text);
        const now = new Date().toISOString();

        if (!parsed.annotations || typeof parsed.annotations !== "object") {
          throw new Error("Invalid format: expected annotations object");
        }

        const imported: Record<string, Annotation> = Object.fromEntries(
          Object.entries(parsed.annotations).map(([id, ann]) => {
            const a = ann as Record<string, unknown>;
            return [
              id,
              {
                query: String(a.query ?? ""),
                queryType:
                  (a.queryType as Annotation["queryType"]) ?? "fact_single",
                relevantDocs: (a.relevantDocs as DocChunk[]) ?? [],
                distractorDocs: (a.distractorDocs as DocChunk[]) ?? [],
                response: String(a.response ?? ""),
                complexity: Number(a.complexity ?? 0),
                notes: String(a.notes ?? ""),
              },
            ];
          }),
        );

        const currentIds = new Set(Object.keys(get().annotations));
        const newAnnotations = Object.fromEntries(
          Object.entries(imported).filter(([id]) => !currentIds.has(id)),
        );

        set((state) => ({
          annotations: { ...state.annotations, ...newAnnotations },
          createdAt: parsed.createdAt ?? state.createdAt,
          updatedAt: now,
          author: parsed.author || state.author,
          project: parsed.project || state.project,
          description: parsed.description || state.description,
        }));

        return Object.keys(newAnnotations).length;
      },
    }),
    {
      name: "ragold-store",
      partialize: (state) => ({
        author: state.author,
        project: state.project,
        description: state.description,
        createdAt: state.createdAt,
        updatedAt: state.updatedAt,
        annotations: state.annotations,
      }),
    },
  ),
);
