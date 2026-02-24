import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
