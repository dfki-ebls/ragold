import { z } from "zod";
import { defaultLanguage, supportedLanguages } from "@/i18n";

/** Current schema version, imports of any other version are rejected. */
export const SCHEMA_VERSION = 3;

/** CRAG question types (Yang et al. 2024, https://doi.org/10.52202/079017-0335). */
export const QUESTION_TYPES = [
  "simple",
  "simple_w_condition",
  "comparison",
  "aggregation",
  "set",
  "multi-hop",
  "post-processing",
  "false_premise",
] as const;

/** MTRAG answerability without CONVERSATIONAL (Katsis et al. 2025, https://arxiv.org/abs/2501.03468). */
export const ANSWERABILITIES = ["answerable", "partial", "unanswerable"] as const;

export const PASSAGE_GRADES = ["needed", "helpful", "misleading"] as const;

export const KEY_FACT_IMPORTANCES = ["must", "nice"] as const;

const timestampSchema = z.iso.datetime({ offset: true }).meta({ id: "Timestamp" });

export const passageSchema = z.object({
  documentId: z.string().min(1),
  text: z.string().min(1),
  location: z.string().default(""),
  grade: z.enum(PASSAGE_GRADES),
}).meta({ id: "Passage" });

export const keyFactSchema = z.object({
  text: z.string().min(1),
  importance: z.enum(KEY_FACT_IMPORTANCES),
}).meta({ id: "KeyFact" });

export const documentSchema = z.object({
  name: z.string().min(1),
  size: z.int().nonnegative(),
  sha256: z.string().regex(/^[0-9a-f]{64}$/),
  notes: z.string().default(""),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
}).meta({ id: "Document" });

/** Key facts are verbatim, case-sensitive excerpts of the response. */
export function isKeyFactInResponse(text: string, response: string): boolean {
  return response.includes(text);
}

const annotationFields = z.object({
  query: z.string().min(1),
  questionType: z.enum(QUESTION_TYPES),
  answerability: z.enum(ANSWERABILITIES).default("answerable"),
  passages: z.array(passageSchema).default([]),
  response: z.string().min(1),
  keyFacts: z.array(keyFactSchema).default([]),
  origin: z.string().default(""),
  notes: z.string().default(""),
});

// Custom issues carry i18n keys as their messages.
function checkKeyFacts(
  annotation: Pick<z.output<typeof annotationFields>, "keyFacts" | "response">,
  ctx: z.RefinementCtx,
): void {
  annotation.keyFacts.forEach((fact, i) => {
    if (!isKeyFactInResponse(fact.text, annotation.response)) {
      ctx.addIssue({
        code: "custom",
        message: "form.keyFactNotInResponse",
        path: ["keyFacts", i, "text"],
      });
    }
  });
}

function checkDocuments(
  passages: readonly z.output<typeof passageSchema>[],
  documents: Record<string, unknown>,
  ctx: z.RefinementCtx,
  path: PropertyKey[] = [],
): void {
  passages.forEach((passage, i) => {
    if (!Object.hasOwn(documents, passage.documentId)) {
      ctx.addIssue({
        code: "custom",
        message: "form.documentMissing",
        path: [...path, "passages", i, "documentId"],
      });
    }
  });
}

/** Annotation without timestamps, as edited in the form and passed to the store. */
export const annotationContentSchema = annotationFields.superRefine(checkKeyFacts);

/** Content schema that also requires every passage to refer to one of `documents`. */
export function annotationContentSchemaFor(documents: Record<string, Document>) {
  return annotationContentSchema.superRefine((annotation, ctx) =>
    checkDocuments(annotation.passages, documents, ctx),
  );
}

export const annotationSchema = annotationFields
  .extend({ createdAt: timestampSchema, updatedAt: timestampSchema })
  .superRefine(checkKeyFacts)
  .meta({ id: "Annotation" });

export const annotationDataSchema = z.object({
  version: z.literal(SCHEMA_VERSION),
  author: z.string().default(""),
  project: z.string().default(""),
  notes: z.string().default(""),
  language: z.enum(supportedLanguages).default(defaultLanguage),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  annotations: z.record(z.string(), annotationSchema).default({}),
  documents: z.record(z.string(), documentSchema).default({}),
}).superRefine((data, ctx) => {
  for (const [id, annotation] of Object.entries(data.annotations)) {
    checkDocuments(annotation.passages, data.documents, ctx, ["annotations", id]);
  }
}).meta({ title: "AnnotationData" });

export type QuestionType = (typeof QUESTION_TYPES)[number];
export type Answerability = (typeof ANSWERABILITIES)[number];
export type PassageGrade = (typeof PASSAGE_GRADES)[number];
export type KeyFactImportance = (typeof KEY_FACT_IMPORTANCES)[number];
export type Passage = z.output<typeof passageSchema>;
export type KeyFact = z.output<typeof keyFactSchema>;
export type Document = z.output<typeof documentSchema>;
export type AnnotationContent = z.output<typeof annotationContentSchema>;
export type Annotation = z.output<typeof annotationSchema>;
export type AnnotationData = z.output<typeof annotationDataSchema>;

/**
 * JSON Schema of the envelope, the contract for producers such as hivegent.
 * Input mode marks defaulted fields as optional,
 * and the rules from `superRefine` cannot be expressed and are omitted.
 * Formats replace their verbose patterns, which only the runtime validation enforces.
 */
export function annotationDataJsonSchema() {
  return z.toJSONSchema(annotationDataSchema, {
    io: "input",
    override: ({ jsonSchema }) => {
      if (jsonSchema.format) {
        delete jsonSchema.pattern;
      }
    },
  });
}

const MULTI_PASSAGE_TYPES: ReadonlySet<QuestionType> = new Set([
  "comparison",
  "aggregation",
  "set",
  "multi-hop",
]);

export type HintKey = "unanswerableWithNeeded" | "answerableWithoutNeeded" | "multiPassageFewNeeded";

/** Soft consistency hints that do not block saving, returned as i18n keys under `hints`. */
export function annotationHints(
  annotation: Pick<AnnotationContent, "questionType" | "answerability" | "passages">,
): HintKey[] {
  const needed = annotation.passages.filter((p) => p.grade === "needed").length;

  if (annotation.answerability === "unanswerable") {
    return needed > 0 ? ["unanswerableWithNeeded"] : [];
  }

  if (needed === 0) {
    return ["answerableWithoutNeeded"];
  }

  return MULTI_PASSAGE_TYPES.has(annotation.questionType) && needed < 2
    ? ["multiPassageFewNeeded"]
    : [];
}
