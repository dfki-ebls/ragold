import readXlsxFile, { type CellValue } from "read-excel-file/browser";
import { type CSSProperties, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  GRADE_BACKGROUNDS,
  type ViewerPassage,
  type ViewerProps,
  viewerLoader,
} from "@/components/viewers/types";
import { ViewerLoading } from "@/components/viewers/ViewerLoading";
import type { PassageGrade } from "@/lib/types";
import { useResource } from "@/lib/useResource";
import {
  type Cell,
  type CellRange,
  cellLocator,
  cellText,
  columnLabel,
  formatRange,
  normalizeRange,
  parseRange,
  rangeToTsv,
} from "@/lib/viewer";
import { cn } from "cn";

/** Rendered grid bounds that keep the table responsive. */
const MAX_ROWS = 500;
const MAX_COLUMNS = 50;

interface Sheet {
  name: string;
  rows: Cell[][];
  /** Cell count of the longest row. */
  width: number;
}

type Locators = Map<string, (passage: string) => CellRange | null>;

function toCell(value: CellValue | null): Cell {
  if (value instanceof Date) {
    return value;
  }

  return typeof value === "function" ? null : value;
}

const loadSheets = viewerLoader(async (blob): Promise<Sheet[]> => {
  const sheets = await readXlsxFile(blob);

  return sheets.map(({ sheet, data }) => ({
    name: sheet,
    rows: data.map((row) => row.map(toCell)),
    width: data.reduce((max, row) => Math.max(max, row.length), 0),
  }));
});

/** Range of a passage, by its recorded location or else by its text. */
function locate(locators: Locators, passage: ViewerPassage): CellRange | null {
  const parsed = parseRange(passage.location);

  if (parsed && locators.has(parsed.sheet)) {
    return parsed;
  }

  for (const locateIn of locators.values()) {
    const found = locateIn(passage.text);

    if (found) {
      return found;
    }
  }

  return null;
}

/** Position of a range over the rendered cells, null if they are not rendered. */
function boxOf(table: HTMLTableElement, range: CellRange): CSSProperties | null {
  const { top, left, bottom, right } = normalizeRange(range);
  const start = table.querySelector<HTMLElement>(`td[data-row="${top}"][data-column="${left}"]`);
  const end = table.querySelector<HTMLElement>(`td[data-row="${bottom}"][data-column="${right}"]`);

  return (
    start &&
    end && {
      left: `${start.offsetLeft}px`,
      top: `${start.offsetTop}px`,
      width: `${end.offsetLeft + end.offsetWidth - start.offsetLeft}px`,
      height: `${end.offsetTop + end.offsetHeight - start.offsetTop}px`,
    }
  );
}

function cellOf(target: EventTarget): { row: number; column: number } | null {
  const cell = target instanceof Element ? target.closest<HTMLElement>("td[data-row]") : null;
  return cell ? { row: Number(cell.dataset.row), column: Number(cell.dataset.column) } : null;
}

export default function SpreadsheetViewer(props: ViewerProps) {
  const sheets = useResource(props.file, loadSheets);

  return sheets === undefined ? <ViewerLoading /> : <SheetGrid sheets={sheets} {...props} />;
}

function SheetGrid({ sheets, passages, focus, onSelect }: ViewerProps & { sheets: Sheet[] }) {
  const { t } = useTranslation();
  const tableRef = useRef<HTMLTableElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [sheetName, setSheetName] = useState(sheets[0]?.name ?? "");
  const [range, setRange] = useState<CellRange | null>(null);
  const [dragging, setDragging] = useState(false);
  const [boxes, setBoxes] = useState<{ style: CSSProperties; grade: PassageGrade }[]>([]);
  const [focused, setFocused] = useState<ViewerPassage>();
  const [scrollTarget, setScrollTarget] = useState<CellRange>();
  // Built per mount rather than cached with the sheets, so that the search index goes with the viewer.
  const locators: Locators = new Map(sheets.map((s) => [s.name, cellLocator(s.rows, s.name)]));
  const located = passages.map((passage) => ({
    range: locate(locators, passage),
    grade: passage.grade,
  }));
  const sheet = sheets.find((s) => s.name === sheetName);
  const rows = sheet?.rows ?? [];
  const width = sheet?.width ?? 0;
  const shownRows = Math.min(rows.length, MAX_ROWS);
  const shownColumns = Math.min(width, MAX_COLUMNS);

  // Adjusted while rendering, so that a focus on another sheet does not flash the current one.
  if (focus !== focused) {
    const found = focus && locate(locators, focus);
    setFocused(focus);

    if (found) {
      setSheetName(found.sheet);
      setRange(found);
      setScrollTarget(found);
    }
  }

  useLayoutEffect(() => {
    const table = tableRef.current;

    setBoxes(
      located.flatMap(({ range, grade }) => {
        const style = range?.sheet === sheetName && table && boxOf(table, range);
        return style ? [{ style, grade }] : [];
      }),
    );
  }, [located, sheetName]);

  // The selection is positioned directly, so that dragging does not re-render the grid.
  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const table = tableRef.current;
    const box = range?.sheet === sheetName && table && boxOf(table, range);

    if (!overlay) {
      return;
    }

    overlay.hidden = !box;

    if (box) {
      Object.assign(overlay.style, box);

      if (range === scrollTarget) {
        overlay.scrollIntoView({ block: "center", inline: "center" });
      }
    }
  }, [range, sheetName, scrollTarget]);

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

      if (sheet && range && end) {
        onSelect({
          text: rangeToTsv(sheet.rows, range),
          location: formatRange(range),
          anchor: end,
        });
      }
    };

    window.addEventListener("pointerup", finish);

    return () => window.removeEventListener("pointerup", finish);
  }, [dragging, range, sheet, onSelect]);

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
        <div className="relative isolate w-fit">
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
            <tbody>
              {rows.slice(0, MAX_ROWS).map((row, r) => (
                <tr key={r}>
                  <th className="sticky left-0 z-10 bg-muted px-2 text-right font-normal text-muted-foreground">
                    {r + 1}
                  </th>
                  {Array.from({ length: shownColumns }, (_, c) => (
                    <td
                      key={c}
                      data-row={r}
                      data-column={c}
                      className="max-w-64 truncate border px-2 py-1"
                    >
                      {cellText(row[c] ?? null)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {boxes.map(({ style, grade }, i) => (
            <div
              key={i}
              style={style}
              className={cn("pointer-events-none absolute -z-10", GRADE_BACKGROUNDS[grade])}
            />
          ))}
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
