import { z } from "zod/v4";
import type { SupportedLanguage } from "@/i18n";
import { defaultLanguage, supportedLanguages } from "@/i18n";

/** Current schema version. Bump only for breaking changes. */
export const SCHEMA_VERSION = 2;

/**
 * Known query types for UI rendering and form selection.
 * Based on "Know Your RAG" (https://aclanthology.org/2025.coling-industry.4/).
 */
export const KNOWN_QUERY_TYPES = [
  "fact_single",
  "summary",
  "reasoning",
  "unanswerable",
] as const;
export type KnownQueryType = (typeof KNOWN_QUERY_TYPES)[number];

// --- Leaf schemas (looseObject preserves unknown fields) ---

export const chunkSchema = z.looseObject({
  content: z.string().default(""),
  documentId: z.string().optional(),
});

export const documentSchema = z.looseObject({
  name: z.string().default(""),
  size: z.number().default(0),
});

export const annotationSchema = z.looseObject({
  query: z.string().default(""),
  queryType: z.string().default("fact_single"),
  relevantChunks: z.array(chunkSchema).default([]),
  distractingChunks: z.array(chunkSchema).default([]),
  response: z.string().default(""),
  notes: z.string().default(""),
});

// --- Language schema ---

const languageSchema = z
  .enum(supportedLanguages as [SupportedLanguage, ...SupportedLanguage[]])
  .default(defaultLanguage);

// --- Top-level envelope ---

export const annotationDataSchema = z.looseObject({
  version: z.number().default(SCHEMA_VERSION),
  author: z.string().default(""),
  project: z.string().default(""),
  description: z.string().default(""),
  language: languageSchema,
  createdAt: z.string().default(""),
  updatedAt: z.string().default(""),
  annotations: z.record(z.string(), annotationSchema).default({}),
  documents: z.record(z.string(), documentSchema).default({}),
});

// --- Derived types ---

export type Chunk = z.infer<typeof chunkSchema>;
export type Document = z.infer<typeof documentSchema>;
export type Annotation = z.infer<typeof annotationSchema>;
export type AnnotationData = z.infer<typeof annotationDataSchema>;

/**
 * QueryType is `string` (not a union) for forward compatibility.
 * Use KnownQueryType for UI logic.
 */
export type QueryType = string;
