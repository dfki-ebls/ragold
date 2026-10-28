import dayjs from "dayjs";

/**
 * Returns a unique name by appending a numeric suffix if the name already
 * exists in the provided set. Mimics OS file manager behavior:
 * `report.pdf` -> `report-1.pdf` -> `report-2.pdf`.
 */
export function uniqueName(desired: string, existing: Iterable<string>): string {
  const taken = new Set(existing);
  if (!taken.has(desired)) return desired;

  const dot = desired.lastIndexOf(".");
  const stem = dot > 0 ? desired.slice(0, dot) : desired;
  const ext = dot > 0 ? desired.slice(dot) : "";

  let n = 1;
  while (taken.has(`${stem}-${n}${ext}`)) n++;
  return `${stem}-${n}${ext}`;
}

/** Message of an unknown thrown value. */
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Save a blob through a temporary download link. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Short local date and time of an ISO timestamp. */
export function formatTimestamp(timestamp: string): string {
  return dayjs(timestamp).format("YYYY-MM-DD HH:mm");
}
