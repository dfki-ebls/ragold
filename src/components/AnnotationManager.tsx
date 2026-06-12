import dayjs from "dayjs";
import { CheckCircle, ChevronDown, ChevronUp, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AnnotationForm } from "@/components/AnnotationForm";
import { EmptyState } from "@/components/EmptyState";
import { ListItem } from "@/components/ListItem";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useConfirmAction } from "@/lib/useConfirmAction";
import { useStore } from "@/lib/store";
import {
  type Annotation,
  type Chunk,
  type Document,
  KNOWN_QUERY_TYPES,
  type KnownQueryType,
} from "@/lib/types";

interface AnnotationManagerProps {
  scrollToTabs?: () => void;
}

function DetailField({
  label,
  value,
  rows,
}: {
  label: string;
  value: string;
  /** When set, renders a textarea with this many rows; otherwise a single-line input. */
  rows?: number;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {rows ? (
        <Textarea
          value={value}
          readOnly
          rows={rows}
          className="bg-muted/50 field-sizing-fixed overflow-y-auto"
        />
      ) : (
        <Input value={value} readOnly className="bg-muted/50" />
      )}
    </div>
  );
}

function ChunkField({
  chunk,
  index,
  documents,
  variant = "relevant",
}: {
  chunk: Chunk;
  index: number;
  documents: Record<string, Document>;
  variant?: "relevant" | "distracting";
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const doc = chunk.documentId ? documents[chunk.documentId] : undefined;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left text-sm">
        {open ? (
          <ChevronUp className="w-4 h-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
        )}
        <span className="text-muted-foreground/60 shrink-0">[{index + 1}]</span>
        <span className="text-xs font-medium text-foreground/70 shrink-0">
          {doc ? doc.name : t("chunks.deletedDocument")}
        </span>
        {!open && <span className="truncate text-xs text-muted-foreground">{chunk.content}</span>}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-1">
        <Textarea
          value={chunk.content}
          readOnly
          rows={8}
          className={`field-sizing-fixed overflow-y-auto ${
            variant === "distracting" ? "bg-destructive/10" : "bg-muted/50"
          }`}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}

function ChunkSection({
  label,
  chunks,
  documents,
  variant,
}: {
  label: string;
  chunks: Chunk[];
  documents: Record<string, Document>;
  variant?: "relevant" | "distracting";
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {chunks.length > 0 && (
        <div className="space-y-1">
          {chunks.map((chunk, i) => (
            <ChunkField key={i} chunk={chunk} index={i} documents={documents} variant={variant} />
          ))}
        </div>
      )}
    </div>
  );
}

function AnnotationItem({
  annotation,
  onEdit,
  onDelete,
  deleteConfirm,
  documents,
}: {
  annotation: Annotation;
  onEdit: () => void;
  onDelete: () => void;
  deleteConfirm: boolean;
  documents: Record<string, Document>;
}) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const distractingCount = annotation.distractingChunks?.length ?? 0;

  const handleCopy = () => {
    navigator.clipboard
      .writeText(JSON.stringify(annotation, null, 2))
      .then(() => toast.success(t("annotationManager.copySuccess")))
      .catch(() => toast.error(t("annotationManager.copyError")));
  };

  const details = isExpanded ? (
    <div className="space-y-4">
      <DetailField label={t("annotationManager.query")} value={annotation.query} rows={2} />
      <DetailField label={t("annotationManager.queryType")} value={annotation.queryType} />

      <ChunkSection
        label={t("annotationManager.relevantChunks", {
          count: annotation.relevantChunks.length,
        })}
        chunks={annotation.relevantChunks}
        documents={documents}
      />
      <ChunkSection
        label={t("annotationManager.distractingChunks", { count: distractingCount })}
        chunks={annotation.distractingChunks ?? []}
        documents={documents}
        variant="distracting"
      />

      <DetailField
        label={t("annotationManager.expectedResponse")}
        value={annotation.response}
        rows={8}
      />
      <DetailField label={t("annotationManager.listNotes")} value={annotation.notes} rows={2} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DetailField label={t("annotationManager.created")} value={annotation.createdAt} />
        <DetailField label={t("annotationManager.updated")} value={annotation.updatedAt} />
      </div>
    </div>
  ) : undefined;

  return (
    <ListItem
      onEdit={onEdit}
      onDelete={onDelete}
      onCopy={handleCopy}
      deleteConfirm={deleteConfirm}
      footer={details}
    >
      <div className="flex-1 min-w-0">
        <div className={isExpanded ? "font-medium" : "font-medium line-clamp-2"}>
          {annotation.query}
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
          {annotation.queryType && (
            <span className="px-2 py-0.5 bg-muted rounded text-xs">
              {(KNOWN_QUERY_TYPES as readonly string[]).includes(annotation.queryType)
                ? t(`queryTypes.${annotation.queryType as KnownQueryType}.label`)
                : annotation.queryType}
            </span>
          )}
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle className="w-3.5 h-3.5" />
            {annotation.relevantChunks.length}
          </span>
          <span className="flex items-center gap-1 text-red-600">
            <XCircle className="w-3.5 h-3.5" />
            {distractingCount}
          </span>
          {annotation.updatedAt && (
            <span>
              {t("common.lastEdited", {
                date: dayjs(annotation.updatedAt).format("YYYY-MM-DD HH:mm"),
              })}
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-auto p-0 mt-2 text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              {t("annotationManager.hideDetails")}
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              {t("annotationManager.showDetails")}
            </>
          )}
        </Button>
      </div>
    </ListItem>
  );
}

export function AnnotationManager({ scrollToTabs }: AnnotationManagerProps) {
  const { t } = useTranslation();
  const annotations = useStore((s) => s.annotations);
  const documents = useStore((s) => s.documents);
  const annotationFormDirty = useStore((s) => s.annotationFormDirty);
  const { isConfirming, confirm } = useConfirmAction();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const scrollPendingRef = useRef(false);

  useEffect(() => {
    if (scrollPendingRef.current) {
      scrollPendingRef.current = false;
      scrollToTabs?.();
    }
  });

  const editingAnnotation = editingId ? annotations[editingId] : null;
  const entries = Object.entries(annotations);

  const handleSubmit = (data: Annotation) => {
    const store = useStore.getState();
    if (editingId) {
      store.updateAnnotation(editingId, data);
      setEditingId(null);
      toast.success(t("annotationManager.updateSuccess"));
    } else {
      store.addAnnotation(data);
      scrollPendingRef.current = true;
      toast.success(t("annotationManager.createSuccess"));
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleEdit = (id: string) => {
    if (annotationFormDirty) {
      setPendingEditId(id);
      return;
    }
    setEditingId(id);
    scrollPendingRef.current = true;
  };

  const handleDelete = (id: string) => {
    confirm(id, () => {
      useStore.getState().deleteAnnotation(id);
      if (editingId === id) {
        setEditingId(null);
      }
      toast.success(t("annotationManager.deleteSuccess"));
    });
  };

  return (
    <div className="space-y-6">
      <AnnotationForm
        annotation={editingAnnotation ?? undefined}
        onSubmit={handleSubmit}
        onCancel={editingId ? handleCancel : undefined}
      />
      <Card>
        <CardHeader>
          <CardTitle>{t("annotationManager.library", { count: entries.length })}</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <EmptyState
              message={t("annotationManager.empty")}
              hint={t("annotationManager.emptyHint")}
            />
          ) : (
            <div className="space-y-3">
              {entries.map(([id, annotation]) => (
                <AnnotationItem
                  key={id}
                  annotation={annotation}
                  onEdit={() => handleEdit(id)}
                  onDelete={() => handleDelete(id)}
                  deleteConfirm={isConfirming(id)}
                  documents={documents}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <AlertDialog
        open={pendingEditId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingEditId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("form.unsavedChangesTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("form.unsavedChanges")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setEditingId(pendingEditId);
                setPendingEditId(null);
                scrollPendingRef.current = true;
              }}
            >
              {t("common.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
