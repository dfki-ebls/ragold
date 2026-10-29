import { passageLocator } from "@/lib/match";

export type ViewerKind = "pdf" | "docx" | "spreadsheet" | "text" | "image" | "other";

function extensions(kind: ViewerKind, list: string): [string, ViewerKind][] {
  return list.split(" ").map((extension) => [extension, kind]);
}

const VIEWER_KINDS = new Map<string, ViewerKind>([
  ["pdf", "pdf"],
  ["docx", "docx"],
  ["xlsx", "spreadsheet"],
  ...extensions("image", "png jpg jpeg gif webp avif bmp svg ico"),
  ...extensions(
    "text",
    "txt text md markdown rst adoc tex bib csv tsv log json jsonl ndjson xml yaml yml toml " +
      "ini cfg conf properties env html htm xhtml css scss js mjs cjs ts tsx jsx vue svelte " +
      "py ipynb r jl java kt scala groovy c h cc cpp hpp cs go rs rb php pl lua swift m " +
      "sh bash zsh fish ps1 bat sql graphql proto nix dockerfile makefile gradle srt vtt eml",
  ),
]);

/** Viewer for a file name, chosen by its extension. */
export function viewerKind(name: string): ViewerKind {
  const dot = name.lastIndexOf(".");
  return VIEWER_KINDS.get(dot >= 0 ? name.slice(dot + 1).toLowerCase() : "") ?? "other";
}

export interface Span {
  unit: "page" | "line";
  /** One-based, inclusive bounds. */
  from: number;
  to: number;
}

/** Language-neutral location of a span, such as `page=4` or `line=10-12`. */
export function formatSpan({ unit, from, to }: Span): string {
  return `${unit}=${from === to ? from : `${from}-${to}`}`;
}

/** Inverse of `formatSpan`, returns null for anything else such as manually entered locations. */
export function parseSpan(location: string | null): Span | null {
  const match = location && /^(page|line)=(\d+)(?:-(\d+))?$/.exec(location);

  if (!match) {
    return null;
  }

  const [, unit, from, to = from] = match;

  return { unit: unit === "page" ? "page" : "line", from: Number(from), to: Number(to) };
}

/** Decode text as UTF-8, falling back to Windows-1252 for legacy files. */
export function decodeText(buffer: ArrayBuffer): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder("windows-1252").decode(buffer);
  }
}

/** One-based line number of a character offset. */
export function lineAt(text: string, offset: number): number {
  let line = 1;

  for (let i = 0; i < offset && i < text.length; i++) {
    if (text[i] === "\n") {
      line++;
    }
  }

  return line;
}

export interface CellRange {
  sheet: string;
  /** Zero-based, inclusive bounds. */
  top: number;
  left: number;
  bottom: number;
  right: number;
}

/** Spreadsheet column label of a zero-based index: 0 is A, 26 is AA. */
export function columnLabel(index: number): string {
  let label = "";

  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    label = String.fromCharCode(65 + ((n - 1) % 26)) + label;
  }

  return label;
}

function columnIndex(label: string): number {
  let index = 0;

  for (let i = 0; i < label.length; i++) {
    index = index * 26 + label.charCodeAt(i) - 64;
  }

  return index - 1;
}

/** Normalize a range so that top-left precedes bottom-right. */
export function normalizeRange(range: CellRange): CellRange {
  return {
    sheet: range.sheet,
    top: Math.min(range.top, range.bottom),
    left: Math.min(range.left, range.right),
    bottom: Math.max(range.top, range.bottom),
    right: Math.max(range.left, range.right),
  };
}

/** A1 notation such as `Sheet1!B2:D5`, quoting sheet names that are not plain words. */
export function formatRange(range: CellRange): string {
  const { sheet, top, left, bottom, right } = normalizeRange(range);
  const name = /^\w+$/.test(sheet) ? sheet : `'${sheet.replaceAll("'", "''")}'`;
  const start = `${columnLabel(left)}${top + 1}`;
  const end = `${columnLabel(right)}${bottom + 1}`;

  return `${name}!${start === end ? start : `${start}:${end}`}`;
}

/** Inverse of `formatRange`, returns null for anything else. */
export function parseRange(location: string | null): CellRange | null {
  const match =
    location && /^(?:'((?:[^']|'')+)'|(\w+))!([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/.exec(location);

  if (!match) {
    return null;
  }

  const [, quoted, plain, startCol, startRow, endCol = startCol, endRow = startRow] = match;

  return normalizeRange({
    sheet: quoted ? quoted.replaceAll("''", "'") : plain,
    top: Number(startRow) - 1,
    left: columnIndex(startCol),
    bottom: Number(endRow) - 1,
    right: columnIndex(endCol),
  });
}

export type Cell = string | number | boolean | Date | null;

/** Display text of a cell, dates without a time of day are shown as plain dates. */
export function cellText(value: Cell): string {
  if (value === null) {
    return "";
  }

  if (value instanceof Date) {
    const iso = value.toISOString();
    return iso.endsWith("T00:00:00.000Z") ? iso.slice(0, 10) : iso;
  }

  return String(value);
}

/** Cells of a range as tab-separated values, one line per row. */
export function rangeToTsv(rows: readonly (readonly Cell[])[], range: CellRange): string {
  const { top, left, bottom, right } = normalizeRange(range);
  const lines: string[] = [];

  for (let r = top; r <= bottom; r++) {
    const cells: string[] = [];

    for (let c = left; c <= right; c++) {
      cells.push(cellText(rows[r]?.[c] ?? null));
    }

    lines.push(cells.join("\t"));
  }

  return lines.join("\n");
}

/** Locator of passages in a sheet, as the range from their first to their last cell. */
export function cellLocator(
  rows: readonly (readonly Cell[])[],
  sheet: string,
): (passage: string) => CellRange | null {
  const cells: { row: number; column: number; start: number }[] = [];
  let locate: ((passage: string) => [number, number] | null) | undefined;

  // The text of the sheet is built on the first search.
  const build = () => {
    let text = "";

    rows.forEach((row, r) => {
      row.forEach((cell, c) => {
        cells.push({ row: r, column: c, start: text.length });
        text += `${cellText(cell)}\t`;
      });
      text += "\n";
    });

    return passageLocator(text);
  };

  return (passage) => {
    const found = (locate ??= build())(passage);
    const first = found && cells.findLast((cell) => cell.start <= found[0]);
    const last = found && cells.findLast((cell) => cell.start < found[1]);

    if (!first || !last) {
      return null;
    }

    return normalizeRange({
      sheet,
      top: first.row,
      left: first.column,
      bottom: last.row,
      right: last.column,
    });
  };
}
