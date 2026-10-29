import type { ViewerSelection } from "@/lib/selection";
import type { Passage, PassageGrade } from "@/lib/types";
import { cached } from "@/lib/utils";

export interface ViewerFile {
  blob: Blob;
  /** Content hash that keys the caches of the viewers. */
  sha256: string;
}

export type ViewerPassage = Pick<Passage, "text" | "location" | "grade">;

/** Element counterparts of the `ragold-<grade>` text highlights. */
export const GRADE_BACKGROUNDS: Record<PassageGrade, string> = {
  needed: "bg-grade-needed",
  helpful: "bg-grade-helpful",
  misleading: "bg-grade-misleading",
};

export interface ViewerProps {
  file: ViewerFile;
  name: string;
  /** Passages of the document, highlighted by grade, best effort. */
  passages: readonly ViewerPassage[];
  /** Passage to scroll to and emphasize, every new object scrolls again. */
  focus?: ViewerPassage;
  onSelect: (selection: ViewerSelection | null) => void;
}

/** Files whose parsed content each viewer keeps, so that reopening a document is instant. */
const CACHE_SIZE = 3;

/** Loader of parsed file content, cached for the most recently viewed files. */
export function viewerLoader<T>(
  load: (blob: Blob) => Promise<T>,
  dispose?: (value: T) => void,
): (file: ViewerFile) => Promise<T> {
  return cached((file: ViewerFile) => load(file.blob), (file) => file.sha256, CACHE_SIZE, dispose);
}
