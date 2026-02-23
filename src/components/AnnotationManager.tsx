import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  XCircle,
} from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AnnotationForm,
  type AnnotationFormRef,
} from "@/components/AnnotationForm";
import { EmptyState } from "@/components/EmptyState";
import { ListItem } from "@/components/ListItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export interface AnnotationManagerRef {
  hasUnsavedChanges: () => boolean;
}

function ChunkPreview({
  chunk,
  index,
  documents,
  className,
}: {
  chunk: Chunk;
  index: number;
  documents: Record<string, Document>;
  className?: string;
}) {
  const { t } = useTranslation();
  const doc = chunk.documentId ? documents[chunk.documentId] : undefined;

  return (
    <div className={`text-sm text-muted-foreground p-2 rounded ${className ?? "bg-muted"}`}>
      <div className="flex items-baseline gap-2">
        <span className="text-muted-foreground/60 shrink-0">[{index + 1}]</span>
        <span className="text-xs font-medium text-foreground/70">
          {doc ? doc.filename : t("chunks.manualEntry")}
        </span>
      </div>
      <div className="whitespace-pre-wrap mt-1 line-clamp-3">{chunk.content}</div>
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

  return (
    <ListItem
      onEdit={onEdit}
      onDelete={onDelete}
      deleteConfirm={deleteConfirm}
    >
      <div className="flex-1 min-w-0">
        <div className="font-medium line-clamp-2">{annotation.query}</div>
        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
          {annotation.queryType && (
            <span className="px-2 py-0.5 bg-muted rounded text-xs">
              {(KNOWN_QUERY_TYPES as readonly string[]).includes(
                annotation.queryType,
              )
                ? t(
                    `queryTypes.${annotation.queryType as KnownQueryType}.label`,
                  )
                : annotation.queryType}
            </span>
          )}
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle className="w-3.5 h-3.5" />
            {annotation.relevantChunks.length}
          </span>
          {distractingCount > 0 && (
            <span className="flex items-center gap-1 text-red-600">
              <XCircle className="w-3.5 h-3.5" />
              {distractingCount}
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

        {isExpanded && (
          <div className="mt-3 space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">
                {t("annotationManager.expectedResponse")}
              </h4>
              <div className="max-h-40 overflow-y-auto">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {annotation.response}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">
                {t("annotationManager.relevantChunks", {
                  count: annotation.relevantChunks.length,
                })}
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {annotation.relevantChunks.map((chunk, i) => (
                  <ChunkPreview
                    key={i}
                    chunk={chunk}
                    index={i}
                    documents={documents}
                  />
                ))}
              </div>
            </div>

            {annotation.distractingChunks &&
              annotation.distractingChunks.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-1">
                    {t("annotationManager.distractingChunks", {
                      count: annotation.distractingChunks.length,
                    })}
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {annotation.distractingChunks.map((chunk, i) => (
                      <ChunkPreview
                        key={i}
                        chunk={chunk}
                        index={i}
                        documents={documents}
                        className="bg-destructive/10"
                      />
                    ))}
                  </div>
                </div>
              )}

            {annotation.notes && (
              <div>
                <h4 className="text-sm font-medium mb-1">
                  {t("annotationManager.listNotes")}
                </h4>
                <div className="max-h-40 overflow-y-auto">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {annotation.notes}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ListItem>
  );
}

export const AnnotationManager = forwardRef<
  AnnotationManagerRef,
  AnnotationManagerProps
>(function AnnotationManager({ scrollToTabs }, ref) {
  const { t } = useTranslation();
  const annotations = useStore((s) => s.annotations);
  const documents = useStore((s) => s.documents);
  const { isConfirming, confirm } = useConfirmAction();
  const [editingId, setEditingId] = useState<string | null>(null);
  const formRef = useRef<AnnotationFormRef>(null);

  const editingAnnotation = editingId ? annotations[editingId] : null;
  const entries = Object.entries(annotations);

  useImperativeHandle(ref, () => ({
    hasUnsavedChanges: () => formRef.current?.hasUnsavedChanges() ?? false,
  }));

  const handleSubmit = (data: Annotation) => {
    const store = useStore.getState();
    if (editingId) {
      store.updateAnnotation(editingId, data);
      setEditingId(null);
    } else {
      store.addAnnotation(data);
      scrollToTabs?.();
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    scrollToTabs?.();
  };

  const handleDelete = (id: string) => {
    confirm(id, () => {
      useStore.getState().deleteAnnotation(id);
      if (editingId === id) {
        setEditingId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <AnnotationForm
        ref={formRef}
        annotation={editingAnnotation ?? undefined}
        onSubmit={handleSubmit}
        onCancel={editingId ? handleCancel : undefined}
      />
      <Card>
        <CardHeader>
          <CardTitle>
            {t("annotationManager.library", { count: entries.length })}
          </CardTitle>
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
    </div>
  );
});
