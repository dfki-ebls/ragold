import { beforeEach, expect, it, vi } from "vitest";
import { deleteFile } from "@/lib/fileStorage";
import { useStore } from "@/lib/store";

vi.mock(import("@/lib/fileStorage"), async (importOriginal) => ({
  ...(await importOriginal()),
  deleteFile: vi.fn<typeof deleteFile>(async () => undefined),
}));

const now = "2026-01-01T00:00:00.000Z";

beforeEach(() => {
  useStore.setState(useStore.getInitialState(), true);
});

it("removes the passages of a deleted document", () => {
  const doc = { name: "a.txt", size: 1, sha256: "0".repeat(64), notes: "", createdAt: now, updatedAt: now };
  const passage = { text: "x", location: "", grade: "needed" as const };
  useStore.setState({ documents: { a: doc, b: { ...doc, name: "b.txt" } } });
  const id = useStore.getState().addAnnotation({
    query: "Q?",
    questionType: "comparison",
    answerability: "answerable",
    passages: [
      { ...passage, documentId: "a" },
      { ...passage, documentId: "b" },
    ],
    response: "R",
    keyFacts: [],
    origin: "",
    notes: "",
  });

  useStore.getState().deleteDocument("a");

  expect(useStore.getState().annotations[id].passages.map((p) => p.documentId)).toEqual(["b"]);
  expect(deleteFile).toHaveBeenCalledWith("a");
});
