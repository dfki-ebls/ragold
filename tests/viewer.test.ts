import { describe, expect, it } from "vitest";
import {
  type Cell,
  columnLabel,
  formatRange,
  formatSpan,
  lineAt,
  locateCells,
  parseRange,
  parseSpan,
  rangeToTsv,
  viewerKind,
} from "@/lib/viewer";

const rows: Cell[][] = [
  ["Name", "Born", "Active"],
  ["Ada", new Date("1815-12-10T00:00:00.000Z"), true],
  ["Alan", 1912, null],
];

describe("spreadsheet ranges", () => {
  it("formats and parses A1 ranges", () => {
    expect(columnLabel(0)).toBe("A");
    expect(columnLabel(27)).toBe("AB");

    const range = { sheet: "Q1 Sales", top: 4, left: 3, bottom: 1, right: 1 };
    expect(formatRange(range)).toBe("'Q1 Sales'!B2:D5");
    expect(parseRange("'Q1 Sales'!B2:D5")).toEqual({ sheet: "Q1 Sales", top: 1, left: 1, bottom: 4, right: 3 });
    expect(formatRange({ sheet: "Sheet1", top: 0, left: 0, bottom: 0, right: 0 })).toBe("Sheet1!A1");
    expect(parseRange("page 3")).toBeNull();
  });

  it("extracts and locates cells as TSV", () => {
    const range = { sheet: "S", top: 1, left: 0, bottom: 2, right: 2 };
    const tsv = rangeToTsv(rows, range);

    expect(tsv).toBe("Ada\t1815-12-10\ttrue\nAlan\t1912\t");
    expect(locateCells(rows, "S", tsv.split("\n")[0])).toEqual({ ...range, bottom: 1 });
    expect(locateCells(rows, "S", "| Alan | 1912 |")).toEqual({ ...range, top: 2, right: 1 });
  });
});

it("reports one-based lines of offsets", () => {
  expect(lineAt("a\nb\nc", 2)).toBe(2);
});

it("formats and parses language-neutral spans", () => {
  expect(formatSpan({ unit: "page", from: 4, to: 4 })).toBe("page=4");
  expect(parseSpan("line=10-12")).toEqual({ unit: "line", from: 10, to: 12 });
  expect(parseSpan("page 4")).toBeNull();
});

it("chooses viewers by extension", () => {
  expect(["a.PDF", "b.docx", "c.xlsx", "d.csv", "e.png", "f.dwg", "g.xls"].map(viewerKind)).toEqual([
    "pdf",
    "docx",
    "spreadsheet",
    "text",
    "image",
    "other",
    "other",
  ]);
});
