import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type Annotation,
  KNOWN_QUERY_TYPES,
  type KnownQueryType,
} from "@/lib/types";

interface AnnotationManagerProps {
  annotations: Record<string, Annotation>;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function AnnotationCard({
  id,
  annotation,
  onEdit,
  onDelete,
  deleteConfirm,
}: {
  id: string;
  annotation: Annotation;
  onEdit: () => void;
  onDelete: () => void;
  deleteConfirm: boolean;
}) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const distractingCount = annotation.distractingChunks?.length ?? 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-medium line-clamp-2">
              {annotation.query}
            </CardTitle>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
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
              <span className="text-xs text-muted-foreground/50 font-mono">
                {id.slice(0, 8)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {deleteConfirm && (
              <span className="text-xs text-destructive mr-2">
                {t("annotationManager.clickAgain")}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant={deleteConfirm ? "destructive" : "ghost"}
              size="icon"
              onClick={onDelete}
              className="h-8 w-8"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-auto p-0 text-muted-foreground hover:text-foreground"
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
          <div className="mt-4 space-y-4">
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
                  <div
                    key={i}
                    className="text-sm text-muted-foreground bg-muted p-2 rounded"
                  >
                    <span className="text-muted-foreground/60 mr-2">
                      [{i + 1}]
                    </span>
                    <span className="whitespace-pre-wrap">{chunk.content}</span>
                  </div>
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
                      <div
                        key={i}
                        className="text-sm text-muted-foreground bg-destructive/10 p-2 rounded"
                      >
                        <span className="text-muted-foreground/60 mr-2">
                          [{i + 1}]
                        </span>
                        <span className="whitespace-pre-wrap">
                          {chunk.content}
                        </span>
                      </div>
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
      </CardContent>
    </Card>
  );
}

export function AnnotationManager({
  annotations,
  onEdit,
  onDelete,
}: AnnotationManagerProps) {
  const { t } = useTranslation();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const entries = Object.entries(annotations);

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      onDelete(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {t("annotationManager.library", { count: 0 })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">{t("annotationManager.empty")}</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              {t("annotationManager.emptyHint")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {t("annotationManager.library", { count: entries.length })}
          </CardTitle>
        </CardHeader>
      </Card>
      {entries.map(([id, annotation]) => (
        <AnnotationCard
          key={id}
          id={id}
          annotation={annotation}
          onEdit={() => onEdit(id)}
          onDelete={() => handleDelete(id)}
          deleteConfirm={deleteConfirm === id}
        />
      ))}
    </div>
  );
}
