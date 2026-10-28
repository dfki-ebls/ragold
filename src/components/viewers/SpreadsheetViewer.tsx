import readXlsxFile, { type CellValue } from "read-excel-file/browser";
import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { ViewerProps } from "@/components/viewers/types";
import { ViewerLoading } from "@/components/viewers/ViewerLoading";
import { useResource } from "@/lib/useResource";
import {
  type Cell,
  type CellRange,
  cellText,
  columnLabel,
  locateCells,
  formatRange,
  normalizeRange,
  parseRange,
  rangeToTsv,
} from "@/lib/viewer";

/** Rendered grid bounds that keep the table responsive. */
const MAX_ROWS = 500;
const MAX_COLUMNS = 50;
const NO_ROWS: Cell[][] = [];

interface Sheet {
  name: string;
  rows: Cell[][];
  /** Cell count of the longest row. */
  width: number;
}

function toCell(value: CellValue | null): Cell {
  if (value instanceof Date) {
    return value;
  }

  return typeof value === "function" ? null : value;
}

async function loadSheets(blob: Blob): Promise<Sheet[]> {
  const sheets = await readXlsxFile(blob);
  return sheets.map(({ sheet, data }) => ({
    name: sheet,
    rows: data.map((row) => row.map(toCell)),
    width: data.reduce((max, row) => Math.max(max, row.length), 0),
  }));
}

function locate(sheets: Sheet[], focus: ViewerProps["focus"]): CellRange | null {
  if (!focus) {
    return null;
  }

  const parsed = parseRange(focus.location);

  if (parsed && sheets.some((sheet) => sheet.name === parsed.sheet)) {
    return parsed;
  }

  for (const sheet of sheets) {
    const found = locateCells(sheet.rows, sheet.name, focus.text);

    if (found) {
      return found;
    }
  }

  return null;
}

function cellOf(target: EventTarget): { row: number; column: number } | null {
  const cell = target instanceof Element ? target.closest<HTMLElement>("td[data-row]") : null;
  return cell ? { row: Number(cell.dataset.row), column: Number(cell.dataset.column) } : null;
}

function SpreadsheetViewer(props: ViewerProps) {
  const sheets = useResource(props.blob, loadSheets);

  return sheets === undefined ? <ViewerLoading /> : <SheetGrid sheets={sheets} {...props} />;
}

export default memo(SpreadsheetViewer);

function SheetGrid({ sheets, focus, onSelect }: ViewerProps & { sheets: Sheet[] }) {
  const { t } = useTranslation();
  const tableRef = useRef<HTMLTableElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [initial] = useState(() => locate(sheets, focus));
  const [sheetName, setSheetName] = useState(initial?.sheet ?? sheets[0]?.name ?? "");
  const [range, setRange] = useState<CellRange | null>(initial);
  const [dragging, setDragging] = useState(false);
  const sheet = sheets.find((s) => s.name === sheetName);
  const rows = sheet?.rows ?? NO_ROWS;
  const width = sheet?.width ?? 0;
  const shownRows = Math.min(rows.length, MAX_ROWS);
  const shownColumns = Math.min(width, MAX_COLUMNS);

  // The grid only depends on the sheet, so dragging re-renders just the overlay.
  const body = useMemo(
    () =>
      rows.slice(0, MAX_ROWS).map((row, r) => (
        <tr key={r}>
          <th className="sticky left-0 z-10 bg-muted px-2 text-right font-normal text-muted-foreground">
            {r + 1}
          </th>
          {Array.from({ length: shownColumns }, (_, c) => (
            <td key={c} data-row={r} data-column={c} className="max-w-64 truncate border px-2 py-1">
              {cellText(row[c] ?? null)}
            </td>
          ))}
        </tr>
      )),
    [rows, shownColumns],
  );

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const table = tableRef.current;
    const visible = range && range.sheet === sheetName ? normalizeRange(range) : null;
    const start =
      visible &&
      table?.querySelector<HTMLElement>(
        `td[data-row="${visible.top}"][data-column="${visible.left}"]`,
      );
    const end =
      visible &&
      table?.querySelector<HTMLElement>(
        `td[data-row="${visible.bottom}"][data-column="${visible.right}"]`,
      );

    if (!overlay) {
      return;
    }

    overlay.hidden = !start || !end;

    if (start && end) {
      Object.assign(overlay.style, {
        left: `${start.offsetLeft}px`,
        top: `${start.offsetTop}px`,
        width: `${end.offsetLeft + end.offsetWidth - start.offsetLeft}px`,
        height: `${end.offsetTop + end.offsetHeight - start.offsetTop}px`,
      });
    }
  }, [range, sheetName]);

  useEffect(() => {
    if (initial) {
      overlayRef.current?.scrollIntoView({ block: "center", inline: "center" });
    }
  }, [initial]);

  useEffect(() => {
    if (!dragging) {
      return;
    }

    const finish = () => {
      setDragging(false);

      const end =
        range &&
        tableRef.current?.querySelector(
          `td[data-row="${range.bottom}"][data-column="${range.right}"]`,
        );

      if (range && end) {
        onSelect({
          text: rangeToTsv(rows, range),
          location: formatRange(range),
          anchor: end,
        });
      }
    };

    window.addEventListener("pointerup", finish);

    return () => window.removeEventListener("pointerup", finish);
  }, [dragging, range, rows, onSelect]);

  const handlePointerDown = (event: React.PointerEvent) => {
    const cell = cellOf(event.target);

    if (!cell || event.button !== 0) {
      return;
    }

    event.preventDefault();
    onSelect(null);
    setDragging(true);
    setRange(
      event.shiftKey && range?.sheet === sheetName
        ? { ...range, bottom: cell.row, right: cell.column }
        : {
            sheet: sheetName,
            top: cell.row,
            left: cell.column,
            bottom: cell.row,
            right: cell.column,
          },
    );
  };

  const handlePointerOver = (event: React.PointerEvent) => {
    const cell = cellOf(event.target);

    if (dragging && cell && range) {
      setRange({ ...range, bottom: cell.row, right: cell.column });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {sheets.length > 1 && (
          <div className="flex items-center gap-2">
            <Label htmlFor="sheet">{t("viewer.sheet")}</Label>
            <NativeSelect
              id="sheet"
              size="sm"
              value={sheetName}
              onChange={(e) => {
                setSheetName(e.target.value);
                onSelect(null);
              }}
            >
              {sheets.map((s) => (
                <NativeSelectOption key={s.name} value={s.name}>
                  {s.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        )}
        <p className="text-sm text-muted-foreground">{t("viewer.sheetHint")}</p>
      </div>
      {(rows.length > shownRows || width > shownColumns) && (
        <p className="text-sm text-muted-foreground">
          {t("viewer.sheetTruncated", { rows: MAX_ROWS, columns: MAX_COLUMNS })}
        </p>
      )}
      <div className="overflow-auto rounded-md border">
        <div className="relative w-fit">
          <table
            ref={tableRef}
            className="border-collapse text-xs select-none"
            onPointerDown={handlePointerDown}
            onPointerOver={handlePointerOver}
          >
            <thead>
              <tr>
                <td aria-hidden className="sticky top-0 left-0 z-20 bg-muted" />
                {Array.from({ length: shownColumns }, (_, c) => (
                  <th
                    key={c}
                    className="sticky top-0 z-10 bg-muted px-2 font-normal text-muted-foreground"
                  >
                    {columnLabel(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{body}</tbody>
          </table>
          <div
            ref={overlayRef}
            hidden
            className="pointer-events-none absolute border-2 border-primary bg-highlight/40"
          />
        </div>
      </div>
    </div>
  );
}
