import { ChevronDown, PencilLine } from "lucide-react";
import { Component, lazy, type ReactNode, Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { GradePicker, useChoiceOptions } from "@/components/choices";
import { DocumentIcon, PassageList } from "@/components/PassageCard";
import { SelectionPopover } from "@/components/SelectionPopover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ViewerFile } from "@/components/viewers/types";
import { ViewerLoading } from "@/components/viewers/ViewerLoading";
import { getFile } from "@/lib/fileStorage";
import { normalizePassage } from "@/lib/match";
import { clearSelection, type ViewerSelection } from "@/lib/selection";
import { useStore } from "@/lib/store";
import { type Document, type Passage, PASSAGE_GRADES, type PassageGrade } from "@/lib/types";
import { useResource } from "@/lib/useResource";
import { textOrNull } from "@/lib/utils";
import { type ViewerKind, viewerKind } from "@/lib/viewer";

const VIEWERS = {
  pdf: lazy(() => import("@/components/viewers/PdfViewer")),
  docx: lazy(() => import("@/components/viewers/DocxViewer")),
  spreadsheet: lazy(() => import("@/components/viewers/SpreadsheetViewer")),
  text: lazy(() => import("@/components/viewers/TextViewer")),
  image: lazy(() => import("@/components/viewers/ImageViewer")),
  other: lazy(() => import("@/components/viewers/FileViewer")),
} satisfies Record<ViewerKind, unknown>;

class ViewerBoundary extends Component<{ fallback: ReactNode; children: ReactNode }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * Document of the passage dialog: an id, null for passages without a document,
 * or undefined while the user has yet to choose.
 */
type Choice = string | null | undefined;

/** The document of the last passage, else the only document, else none so that the user chooses. */
function initialChoice(passages: readonly Passage[], documents: Record<string, Document>): Choice {
  const last = passages.at(-1);

  if (last && (last.documentId === null || Object.hasOwn(documents, last.documentId))) {
    return last.documentId;
  }

  const ids = Object.keys(documents);

  return ids.length > 1 ? undefined : (ids[0] ?? null);
}

function Message({ children }: { children: ReactNode }) {
  return <p className="py-12 text-center text-sm text-muted-foreground">{children}</p>;
}

interface PassageDialogProps {
  passages: readonly Passage[];
  /** Existing passage to show in its document. */
  focus?: Passage;
  onChange: (passages: Passage[]) => void;
  onClose: () => void;
}

/**
 * Document viewer for adding passages by selecting content, with manual entry as fallback.
 * The passages of the shown document are highlighted and listed for editing.
 */
export function PassageDialog({
  passages,
  focus: initialFocus,
  onChange,
  onClose,
}: PassageDialogProps) {
  const { t } = useTranslation();
  const documents = useStore((s) => s.documents);
  const [documentId, setDocumentId] = useState<Choice>(() =>
    initialFocus ? initialFocus.documentId : initialChoice(passages, documents),
  );
  const [focus, setFocus] = useState(initialFocus);
  const [selection, setSelection] = useState<ViewerSelection | null>(null);
  const gradeOptions = useChoiceOptions(PASSAGE_GRADES, "passageGrades");
  const doc = documentId ? documents[documentId] : undefined;
  const loadFile = async (sha256: string): Promise<ViewerFile | null> => {
    const blob = documentId ? await getFile(documentId).catch(() => null) : null;
    return blob && { blob, sha256 };
  };
  // Keyed by content, so that a replaced file is loaded again.
  const file = useResource(doc?.sha256 ?? null, loadFile);
  const kind = doc ? viewerKind(doc.name) : "other";
  const Viewer = VIEWERS[kind];
  const shown = passages.flatMap((p, i) => (p.documentId === documentId ? [i] : []));
  const highlighted = shown.map((i) => passages[i]);

  /** Add a passage, or regrade the one with the same text in the same document. */
  const add = (passage: Omit<Passage, "documentId">) => {
    if (documentId === undefined) {
      return;
    }

    const text = normalizePassage(passage.text);
    const index = shown.find((i) => normalizePassage(passages[i].text) === text);

    onChange(
      index === undefined
        ? [...passages, { ...passage, documentId }]
        : passages.map((p, i) => (i === index ? { ...p, grade: passage.grade } : p)),
    );
    toast.success(t(index === undefined ? "passages.added" : "passages.updated"));
  };

  const pickGrade = (grade: PassageGrade) => {
    if (selection) {
      add({ text: selection.text, location: selection.location, grade });
    }

    clearSelection();
    setSelection(null);
  };

  const choose = (id: string | null) => {
    setSelection(null);
    setFocus(undefined);
    setDocumentId(id);
  };

  const viewer =
    documentId === undefined ? (
      <Message>{t("passages.choosePrompt")}</Message>
    ) : documentId === null ? (
      <Message>{t("passages.noDocumentDescription")}</Message>
    ) : doc && file === undefined ? (
      <ViewerLoading />
    ) : doc && file ? (
      <ViewerBoundary key={documentId} fallback={<Message>{t("viewer.error")}</Message>}>
        <Suspense fallback={<ViewerLoading />}>
          <Viewer
            file={file}
            name={doc.name}
            passages={highlighted}
            focus={focus?.documentId === documentId ? focus : undefined}
            onSelect={setSelection}
          />
        </Suspense>
      </ViewerBoundary>
    ) : (
      <Message>{t("viewer.notFound")}</Message>
    );

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="flex h-[min(92vh,64rem)] flex-col gap-4 sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>{t("passages.dialogTitle")}</DialogTitle>
          <DialogDescription>{t("passages.dialogDescription")}</DialogDescription>
        </DialogHeader>

        <DocumentPicker
          documents={documents}
          passages={passages}
          value={documentId}
          onChange={choose}
        />

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_22rem]">
          <div className="min-h-48 overflow-auto rounded-2xl border bg-muted/30 p-4">{viewer}</div>
          {documentId !== undefined && (
            <section className="max-h-48 space-y-2 overflow-auto lg:max-h-none">
              <h3 className="text-sm font-medium">
                {t(documentId === null ? "passages.listNoDocument" : "passages.listDocument", {
                  count: shown.length,
                })}
              </h3>
              <PassageList
                passages={passages}
                shown={shown}
                onChange={onChange}
                // A new object scrolls to the passage again after the user scrolled away.
                onShow={(passage) => setFocus({ ...passage })}
              />
            </section>
          )}
        </div>

        {documentId !== undefined && (
          <ManualEntry
            key={documentId}
            withoutDocument={documentId === null}
            defaultOpen={documentId === null || kind === "image" || kind === "other"}
            onAdd={add}
          />
        )}

        <DialogFooter>
          <Button onClick={onClose}>{t("common.done")}</Button>
        </DialogFooter>

        <SelectionPopover
          anchor={selection?.anchor ?? null}
          title={t("passages.gradeTitle")}
          excerpt={selection?.text ?? ""}
          options={gradeOptions}
          onPick={pickGrade}
          onClose={() => setSelection(null)}
        />
      </DialogContent>
    </Dialog>
  );
}

interface DocumentItem {
  id: string | null;
  name: string;
}

/** Searchable choice of a document, or none for passages without one, with the passage count of each. */
function DocumentPicker({
  documents,
  passages,
  value,
  onChange,
}: {
  documents: Record<string, Document>;
  passages: readonly Passage[];
  value: Choice;
  onChange: (id: string | null) => void;
}) {
  const { t } = useTranslation();
  const items: DocumentItem[] = [
    ...Object.entries(documents)
      .map(([id, doc]) => ({ id, name: doc.name }))
      .toSorted((a, b) => a.name.localeCompare(b.name)),
    { id: null, name: t("passages.noDocument") },
  ];
  const counts = Map.groupBy(passages, (p) => p.documentId);

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="passage-document">{t("passages.document")}</Label>
      <Combobox
        items={items}
        value={items.find((item) => item.id === value) ?? null}
        onValueChange={(item) => {
          if (item) onChange(item.id);
        }}
        itemToStringLabel={(item) => item.name}
        isItemEqualToValue={(item, other) => item.id === other.id}
        defaultOpen={value === undefined}
        autoHighlight
      >
        <ComboboxInput
          id="passage-document"
          placeholder={t("passages.searchDocuments")}
          className="min-w-0 flex-1 sm:max-w-md"
        />
        <ComboboxContent>
          <ComboboxEmpty>{t("passages.noMatch")}</ComboboxEmpty>
          <ComboboxList>
            {(item: DocumentItem) => {
              const count = counts.get(item.id)?.length;

              return (
                <ComboboxItem key={item.id ?? ""} value={item}>
                  <DocumentIcon documentId={item.id} className="text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{item.name}</span>
                  {count !== undefined && <Badge variant="secondary">{count}</Badge>}
                </ComboboxItem>
              );
            }}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

function ManualEntry({
  withoutDocument,
  defaultOpen,
  onAdd,
}: {
  /** The location then names the source of the passage. */
  withoutDocument: boolean;
  defaultOpen: boolean;
  onAdd: (passage: Omit<Passage, "documentId">) => void;
}) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [location, setLocation] = useState("");
  const [grade, setGrade] = useState<PassageGrade | null>(null);

  const submit = () => {
    if (!grade) {
      return;
    }

    onAdd({ text, location: textOrNull(location), grade });
    setText("");
    setLocation("");
    setGrade(null);
  };

  return (
    <Collapsible defaultOpen={defaultOpen} className="rounded-2xl border p-3">
      <CollapsibleTrigger className="group flex w-full items-center gap-2 text-left text-sm font-medium">
        <PencilLine className="size-4" />
        {t("passages.manualTitle")}
        <ChevronDown className="ml-auto size-4 transition-transform group-data-panel-open:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 pt-3">
        {!withoutDocument && (
          <p className="text-sm text-muted-foreground">{t("passages.manualDescription")}</p>
        )}
        <div className="space-y-1">
          <Label htmlFor="manual-text">{t("passages.manualText")}</Label>
          <Textarea
            id="manual-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("passages.manualTextPlaceholder")}
            rows={3}
            className="max-h-40"
          />
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1 space-y-1">
            <Label htmlFor="manual-location">
              {t(withoutDocument ? "passages.manualSource" : "passages.manualLocation")}
            </Label>
            <Input
              id="manual-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t(
                withoutDocument
                  ? "passages.manualSourcePlaceholder"
                  : "passages.manualLocationPlaceholder",
              )}
            />
          </div>
          <GradePicker value={grade} onChange={setGrade} />
          <Button disabled={!text.trim() || !grade} onClick={submit}>
            {t("passages.manualAdd")}
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
