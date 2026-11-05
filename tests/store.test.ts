import { beforeEach, expect, it, vi } from "vitest";
import { deleteFile } from "@/lib/fileStorage";
import { STORE_KEY, useStore } from "@/lib/store";

vi.mock(import("@/lib/fileStorage"), async (importOriginal) => ({
  ...(await importOriginal()),
  deleteFile: vi.fn<typeof deleteFile>(async () => undefined),
}));

const now = "2026-01-01T00:00:00.000Z";

beforeEach(() => {
  useStore.setState(useStore.getInitialState(), true);
});

it("removes the passages of a deleted document", () => {
  const doc = {
    name: "a.txt",
    size: 1,
    sha256: "0".repeat(64),
    notes: "",
    createdAt: now,
    updatedAt: now,
  };
  const passage = { text: "x", location: null, grade: "needed" as const };
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
    origin: null,
    notes: "",
  });

  useStore.getState().deleteDocument("a");

  expect(useStore.getState().annotations[id].passages.map((p) => p.documentId)).toEqual(["b"]);
  expect(deleteFile).toHaveBeenCalledWith("a");
});

it("keeps stored data that fails to load", async () => {
  const stored = JSON.stringify({ state: { version: 2 }, version: 0 });
  localStorage.setItem(STORE_KEY, stored);

  await useStore.persist.rehydrate();

  expect(useStore.getState().loadError).toContain("version");
  expect(localStorage.getItem(STORE_KEY)).toBe(stored);
});
