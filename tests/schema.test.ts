import { describe, expect, it } from "vitest";
import {
  type AnnotationContent,
  annotationDataJsonSchema,
  annotationDataSchema,
  annotationHints,
  annotationSchema,
  SCHEMA_VERSION,
} from "@/lib/types";

const now = "2026-01-01T00:00:00.000Z";

const annotation = {
  query: "When was RAGold released?",
  questionType: "simple",
  answerability: "answerable",
  passages: [{ documentId: "doc-1", text: "RAGold was released in 2026.", grade: "needed" }],
  response: "RAGold was released in 2026.",
  keyFacts: [{ text: "2026", importance: "must" }],
  createdAt: now,
  updatedAt: now,
};

describe("annotationDataSchema", () => {
  it("parses v3 data and fills defaults", () => {
    const result = annotationDataSchema.parse({
      version: SCHEMA_VERSION,
      createdAt: now,
      updatedAt: now,
      annotations: { "ann-1": annotation },
      documents: {
        "doc-1": { name: "a.txt", size: 1, sha256: "0".repeat(64), createdAt: now, updatedAt: now },
      },
    });

    expect(result.annotations["ann-1"]).toMatchObject({
      origin: "",
      notes: "",
      passages: [{ location: "" }],
    });
  });

  it("rejects other versions", () => {
    const result = annotationDataSchema.safeParse({ version: 2, createdAt: now, updatedAt: now });

    expect(result.success).toBe(false);
  });

  it("matches the committed schema.json", async () => {
    await expect(`${JSON.stringify(annotationDataJsonSchema(), null, 2)}\n`).toMatchFileSnapshot(
      "../schema.json",
    );
  });
});

describe("annotationSchema", () => {
  it("requires an explicit answerability", () => {
    const { answerability: _, ...rest } = annotation;

    expect(annotationSchema.safeParse(rest).success).toBe(false);
  });

  it("requires key facts to be excerpts of the response", () => {
    const result = annotationSchema.safeParse({
      ...annotation,
      keyFacts: [...annotation.keyFacts, { text: "2025", importance: "nice" }],
    });

    expect(result.error?.issues.map((issue) => issue.path)).toEqual([["keyFacts", 1, "text"]]);
  });
});

describe("annotationHints", () => {
  const hints = (
    answerability: AnnotationContent["answerability"],
    questionType: AnnotationContent["questionType"],
    neededCount: number,
  ) =>
    annotationHints({
      answerability,
      questionType,
      passages: Array.from({ length: neededCount }, () => ({
        documentId: "doc-1",
        text: "x",
        location: "",
        grade: "needed" as const,
      })),
    });

  it("flags inconsistent passages", () => {
    expect(hints("unanswerable", "simple", 1)).toEqual(["unanswerableWithNeeded"]);
    expect(hints("partial", "simple", 0)).toEqual(["answerableWithoutNeeded"]);
    expect(hints("answerable", "comparison", 1)).toEqual(["multiPassageFewNeeded"]);
    expect(hints("answerable", "multi-hop", 2)).toEqual([]);
    expect(hints("unanswerable", "simple", 0)).toEqual([]);
  });
});
