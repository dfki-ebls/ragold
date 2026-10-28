import { ChevronDown, PencilLine } from "lucide-react";
import { Component, lazy, type ReactNode, Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { GradePicker, useChoiceOptions } from "@/components/choices";
import { SelectionPopover } from "@/components/SelectionPopover";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { ViewerLoading } from "@/components/viewers/ViewerLoading";
import { getFile } from "@/lib/fileStorage";
import { clearSelection, type ViewerSelection } from "@/lib/selection";
import { useStore } from "@/lib/store";
import { type Passage, PASSAGE_GRADES, type PassageGrade } from "@/lib/types";
import { useResource } from "@/lib/useResource";
import { type ViewerKind, viewerKind } from "@/lib/viewer";

const VIEWERS = {
  pdf: lazy(() => import("@/components/viewers/PdfViewer")),
  docx: lazy(() => import("@/components/viewers/DocxViewer")),
  spreadsheet: lazy(() => import("@/components/viewers/SpreadsheetViewer")),
  text: lazy(() => import("@/components/viewers/TextViewer")),
  image: lazy(() => import("@/components/viewers/ImageViewer")),
  other: lazy(() => import("@/components/viewers/FileViewer")),
} satisfies Record<ViewerKind, unknown>;

/** File of a document, null if it is missing from this browser. */
function loadFile(id: string): Promise<Blob | null> {
  return getFile(id).catch(() => null);
}

class ViewerBoundary extends Component<{ fallback: ReactNode; children: ReactNode }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

interface PassageDialogProps {
  documentId: string;
  /** Existing passage to locate in the document. */
  focus?: Passage;
  onAdd: (passage: Passage) => void;
  onClose: () => void;
}

/** Document viewer for adding passages by selecting content, with manual entry as fallback. */
export function PassageDialog({
  documentId: initialId,
  focus,
  onAdd,
  onClose,
}: PassageDialogProps) {
  const { t } = useTranslation();
  const documents = useStore((s) => s.documents);
  const [documentId, setDocumentId] = useState(initialId);
  const blob = useResource(documentId, loadFile);
  const [selection, setSelection] = useState<ViewerSelection | null>(null);
  const gradeOptions = useChoiceOptions(PASSAGE_GRADES, "passageGrades");
  const doc = documents[documentId];
  const kind = viewerKind(doc?.name ?? "");
  const Viewer = VIEWERS[kind];

  const add = (passage: Omit<Passage, "documentId">) => {
    onAdd({ ...passage, documentId });
    toast.success(t("passages.added"));
  };

  const pickGrade = (grade: PassageGrade) => {
    if (selection) {
      add({ text: selection.text, location: selection.location, grade });
    }

    clearSelection();
    setSelection(null);
  };

  const viewer =
    blob === undefined ? (
      <ViewerLoading />
    ) : blob && doc ? (
      <ViewerBoundary
        key={documentId}
        fallback={
          <p className="py-12 text-center text-sm text-muted-foreground">{t("viewer.error")}</p>
        }
      >
        <Suspense fallback={<ViewerLoading />}>
          <Viewer
            blob={blob}
            name={doc.name}
            focus={documentId === focus?.documentId ? focus : undefined}
            onSelect={setSelection}
          />
        </Suspense>
      </ViewerBoundary>
    ) : (
      <p className="py-12 text-center text-sm text-muted-foreground">{t("viewer.notFound")}</p>
    );

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="flex h-[min(92vh,64rem)] flex-col gap-4 sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{t("passages.dialogTitle")}</DialogTitle>
          <DialogDescription>{t("passages.dialogDescription")}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Label htmlFor="passage-document">{t("passages.document")}</Label>
          <NativeSelect
            id="passage-document"
            className="min-w-0 flex-1 sm:flex-none"
            value={documentId}
            onChange={(e) => {
              setSelection(null);
              setDocumentId(e.target.value);
            }}
          >
            {Object.entries(documents).map(([id, d]) => (
              <NativeSelectOption key={id} value={id}>
                {d.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        <div className="min-h-0 flex-1 overflow-auto rounded-2xl border bg-muted/30 p-4">
          {viewer}
        </div>

        <ManualEntry
          key={documentId}
          defaultOpen={kind === "image" || kind === "other"}
          onAdd={add}
        />

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

function ManualEntry({
  defaultOpen,
  onAdd,
}: {
  defaultOpen: boolean;
  onAdd: (passage: Omit<Passage, "documentId">) => void;
}) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [location, setLocation] = useState("");
  const [grade, setGrade] = useState<PassageGrade>("needed");

  const submit = () => {
    onAdd({ text: text.trim(), location: location.trim(), grade });
    setText("");
    setLocation("");
  };

  return (
    <Collapsible defaultOpen={defaultOpen} className="rounded-2xl border p-3">
      <CollapsibleTrigger className="group flex w-full items-center gap-2 text-left text-sm font-medium">
        <PencilLine className="size-4" />
        {t("passages.manualTitle")}
        <ChevronDown className="ml-auto size-4 transition-transform group-data-panel-open:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 pt-3">
        <p className="text-sm text-muted-foreground">{t("passages.manualDescription")}</p>
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
            <Label htmlFor="manual-location">{t("passages.manualLocation")}</Label>
            <Input
              id="manual-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t("passages.manualLocationPlaceholder")}
            />
          </div>
          <GradePicker value={grade} onChange={setGrade} />
          <Button disabled={!text.trim()} onClick={submit}>
            {t("passages.manualAdd")}
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
