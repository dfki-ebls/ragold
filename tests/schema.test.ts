import { describe, expect, it } from "vitest";
import {
  annotationDataSchema,
  annotationSchema,
  chunkSchema,
  documentSchema,
  SCHEMA_VERSION,
} from "@/lib/types";

describe("chunkSchema", () => {
  it("fills defaults for empty object", () => {
    const result = chunkSchema.parse({});
    expect(result).toEqual({ content: "" });
  });

  it("preserves unknown fields", () => {
    const result = chunkSchema.parse({ content: "a", futureField: 42 });
    expect(result).toEqual({ content: "a", futureField: 42 });
  });
});

describe("documentSchema", () => {
  it("fills defaults for empty object", () => {
    const result = documentSchema.parse({});
    expect(result).toEqual({ name: "", size: 0, notes: "" });
  });

  it("preserves unknown fields", () => {
    const result = documentSchema.parse({
      name: "f.txt",
      description: "d",
      tags: ["a"],
    });
    expect(result.tags).toEqual(["a"]);
  });
});

describe("annotationSchema", () => {
  it("fills defaults for empty object", () => {
    const result = annotationSchema.parse({});
    expect(result).toEqual({
      query: "",
      queryType: "fact_single",
      relevantChunks: [],
      distractingChunks: [],
      response: "",
      notes: "",
    });
  });

  it("accepts unknown queryType values", () => {
    const result = annotationSchema.parse({ queryType: "comparison" });
    expect(result.queryType).toBe("comparison");
  });

  it("preserves unknown fields", () => {
    const result = annotationSchema.parse({ confidence: 0.95 });
    expect(result.confidence).toBe(0.95);
  });
});

describe("annotationDataSchema", () => {
  it("fills all defaults for empty object", () => {
    const result = annotationDataSchema.parse({});
    expect(result.version).toBe(SCHEMA_VERSION);
    expect(result.author).toBe("");
    expect(result.project).toBe("");
    expect(result.notes).toBe("");
    expect(result.language).toBe("en");
    expect(result.createdAt).toBe("");
    expect(result.updatedAt).toBe("");
    expect(result.annotations).toEqual({});
    expect(result.documents).toEqual({});
  });

  it("preserves a complete valid object", () => {
    const input = {
      version: 1,
      author: "Alice",
      project: "Test",
      description: "A test",
      language: "de",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-02T00:00:00Z",
      annotations: {
        "abc-123": {
          query: "What is X?",
          queryType: "fact_single",
          relevantChunks: [{ content: "X is Y" }],
          distractingChunks: [],
          response: "X is Y.",
          notes: "",
        },
      },
      documents: {
        "doc-1": { name: "a.txt" },
      },
    };
    const result = annotationDataSchema.parse(input);
    expect(result.author).toBe("Alice");
    expect(result.annotations["abc-123"].query).toBe("What is X?");
    expect(result.documents["doc-1"].name).toBe("a.txt");
  });

  it("preserves unknown top-level fields", () => {
    const result = annotationDataSchema.parse({ customMeta: "hello" });
    expect(result.customMeta).toBe("hello");
  });

  it("defaults missing version", () => {
    const result = annotationDataSchema.parse({ author: "Bob" });
    expect(result.version).toBe(SCHEMA_VERSION);
  });

  it("parses old-format data without version or future fields", () => {
    const oldData = {
      author: "Legacy",
      project: "Old",
      description: "",
      language: "en",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-06-01T00:00:00Z",
      annotations: {
        "id-1": {
          query: "Q?",
          queryType: "summary",
          relevantChunks: [{ content: "C" }],
          distractingChunks: [],
          response: "R",
          notes: "",
        },
      },
      documents: {},
    };
    const result = annotationDataSchema.parse(oldData);
    expect(result.version).toBe(SCHEMA_VERSION);
    expect(result.author).toBe("Legacy");
    expect(result.annotations["id-1"].queryType).toBe("summary");
  });

  it("fills defaults for annotations with missing fields", () => {
    const result = annotationDataSchema.parse({
      annotations: {
        "a-1": { query: "Q?" },
      },
    });
    const ann = result.annotations["a-1"];
    expect(ann.queryType).toBe("fact_single");
    expect(ann.relevantChunks).toEqual([]);
    expect(ann.response).toBe("");
    expect(ann.notes).toBe("");
  });

  it("rejects invalid language", () => {
    const result = annotationDataSchema.safeParse({ language: "xx" });
    expect(result.success).toBe(false);
  });
});
