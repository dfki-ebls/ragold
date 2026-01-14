export interface DocChunk {
  content: string;
  documentId?: string;
}

/**
 * A document in the document library with metadata.
 * The ID is stored as the key in the documents record.
 * Content is stored per-chunk in annotations, not in the document itself.
 */
export interface Document {
  filename: string;
  description: string;
}

/**
 * Query type taxonomy based on "Know Your RAG" (arXiv:2411.19710).
 * Classifies how the context answers the question.
 */
export type QueryType =
  | "fact_single"
  | "summary"
  | "reasoning"
  | "unanswerable";

export const QUERY_TYPE_LABELS: Record<QueryType, string> = {
  fact_single: "Einzelfakt",
  summary: "Zusammenfassung",
  reasoning: "Schlussfolgerung",
  unanswerable: "Unbeantwortbar",
};

export const QUERY_TYPE_DESCRIPTIONS: Record<QueryType, string> = {
  fact_single:
    "Antwort ist im Kontext vorhanden, eine einzelne Informationseinheit.",
  summary:
    "Antwort ist im Kontext vorhanden, erfordert Zusammenfassung mehrerer Informationen.",
  reasoning:
    "Antwort ist nicht explizit im Kontext, kann aber durch Schlussfolgerung abgeleitet werden.",
  unanswerable: "Antwort ist weder im Kontext vorhanden noch ableitbar.",
};

/**
 * A single annotation without metadata.
 * The ID is stored as the key in the annotations record.
 */
export interface Annotation {
  query: string;
  queryType: QueryType;
  relevantDocs: DocChunk[];
  distractorDocs: DocChunk[];
  response: string;
  complexity: number;
  notes: string;
}

/**
 * Complete annotation dataset including metadata and timestamps.
 * This is the format used for persistence and export.
 */
export interface AnnotationData {
  author: string;
  project: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  annotations: Record<string, Annotation>;
  documents: Record<string, Document>;
}
