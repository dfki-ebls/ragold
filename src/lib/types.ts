import type { SupportedLanguage } from "@/i18n";

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
  language: SupportedLanguage;
  createdAt: string;
  updatedAt: string;
  annotations: Record<string, Annotation>;
  documents: Record<string, Document>;
}
