import type { ViewerSelection } from "@/lib/selection";

export interface ViewerProps {
  blob: Blob;
  name: string;
  /** Passage to locate and highlight, best effort. */
  focus?: { text: string; location: string };
  onSelect: (selection: ViewerSelection | null) => void;
}
