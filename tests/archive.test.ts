import { beforeEach, describe, expect, it, vi } from "vitest";
import { mergeImport } from "@/lib/archive";
import { putFiles, sha256 } from "@/lib/fileStorage";
import { useStore } from "@/lib/store";
import { type AnnotationData, type Document, SCHEMA_VERSION } from "@/lib/types";

vi.mock(import("@/lib/fileStorage"), async (importOriginal) => ({
  ...(await importOriginal()),
  putFiles: vi.fn<typeof putFiles>(),
}));

const now = "2026-01-01T00:00:00.000Z";
const initialState = useStore.getInitialState();

function bytes(text: string): ArrayBuffer {
  return new TextEncoder().encode(text).buffer;
}

async function document(name: string, buffer: ArrayBuffer): Promise<Document> {
  const sha = await sha256(buffer);
  return { name, size: buffer.byteLength, sha256: sha, notes: "", createdAt: now, updatedAt: now };
}

async function archive(files: Map<string, ArrayBuffer>, declared?: Record<string, Document>) {
  const documents: Record<string, Document> = {};

  for (const [id, buffer] of files) {
    documents[id] = declared?.[id] ?? (await document(`${id}.txt`, buffer));
  }

  const data: AnnotationData = {
    version: SCHEMA_VERSION,
    author: "Hivegent",
    project: "Imported",
    notes: "",
    language: "en",
    createdAt: now,
    updatedAt: now,
    documents,
    annotations: {
      "ann-1": {
        query: "Q?",
        questionType: "comparison",
        answerability: "answerable",
        passages: [...files.keys()].map((documentId) => ({
          documentId,
          text: "x",
          location: null,
          grade: "needed" as const,
        })),
        response: "R",
        keyFacts: [],
        origin: null,
        notes: "",
        createdAt: now,
        updatedAt: now,
      },
    },
  };

  return { data, files };
}

describe("mergeImport", () => {
  beforeEach(() => {
    useStore.setState(initialState, true);
    vi.mocked(putFiles).mockReset();
  });

  it("reuses documents with known content and remaps ids", async () => {
    const known = bytes("known");
    const fresh = bytes("fresh");
    useStore.setState({ author: "Alice", documents: { local: await document("local.txt", known) } });

    const ids = await mergeImport(await archive(new Map([["a", known], ["b", fresh]])));
    const { annotations, documents, author } = useStore.getState();
    const newDocumentId = Object.keys(documents).find((id) => id !== "local");

    expect(author).toBe("Alice");
    expect(ids).toHaveLength(1);
    expect(Object.keys(documents)).toHaveLength(2);
    expect(annotations[ids[0]].passages.map((p) => p.documentId)).toEqual(["local", newDocumentId]);
    expect([...vi.mocked(putFiles).mock.calls[0][0].keys()]).toEqual([newDocumentId]);
  });

  it("rejects checksum mismatches without writing anything", async () => {
    const declared = { a: await document("a.txt", bytes("other")) };

    await expect(mergeImport(await archive(new Map([["a", bytes("content")]]), declared))).rejects.toThrow(
      "Checksum mismatch",
    );
    expect(putFiles).not.toHaveBeenCalled();
    expect(useStore.getState().annotations).toEqual({});
  });
});
