import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Pencil,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Annotation, QueryType } from "@/lib/types";

interface AnnotationListProps {
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
  const distractorCount = annotation.distractorDocs?.length ?? 0;

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
                  {t(`queryTypes.${annotation.queryType as QueryType}.label`)}
                </span>
              )}
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-3.5 h-3.5" />
                {annotation.relevantDocs.length}
              </span>
              {distractorCount > 0 && (
                <span className="flex items-center gap-1 text-red-600">
                  <XCircle className="w-3.5 h-3.5" />
                  {distractorCount}
                </span>
              )}
              <span className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < annotation.complexity
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </span>
              <span className="text-xs text-muted-foreground/50 font-mono">
                {id.slice(0, 8)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {deleteConfirm && (
              <span className="text-xs text-destructive mr-2">
                {t("annotationList.clickAgain")}
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
              {t("annotationList.hideDetails")}
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              {t("annotationList.showDetails")}
            </>
          )}
        </Button>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">
                {t("annotationList.expectedResponse")}
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {annotation.response}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">
                {t("annotationList.relevantDocs", {
                  count: annotation.relevantDocs.length,
                })}
              </h4>
              <div className="space-y-2">
                {annotation.relevantDocs.map((doc, i) => (
                  <div
                    key={i}
                    className="text-sm text-muted-foreground bg-muted p-2 rounded"
                  >
                    <span className="text-muted-foreground/60 mr-2">
                      [{i + 1}]
                    </span>
                    <span className="whitespace-pre-wrap">{doc.content}</span>
                  </div>
                ))}
              </div>
            </div>

            {annotation.distractorDocs &&
              annotation.distractorDocs.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-1">
                    {t("annotationList.distractorDocs", {
                      count: annotation.distractorDocs.length,
                    })}
                  </h4>
                  <div className="space-y-2">
                    {annotation.distractorDocs.map((doc, i) => (
                      <div
                        key={i}
                        className="text-sm text-muted-foreground bg-destructive/10 p-2 rounded"
                      >
                        <span className="text-muted-foreground/60 mr-2">
                          [{i + 1}]
                        </span>
                        <span className="whitespace-pre-wrap">
                          {doc.content}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {annotation.notes && (
              <div>
                <h4 className="text-sm font-medium mb-1">
                  {t("annotationList.notes")}
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {annotation.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AnnotationList({
  annotations,
  onEdit,
  onDelete,
}: AnnotationListProps) {
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
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">{t("annotationList.empty")}</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            {t("annotationList.emptyHint")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t("annotationList.count", { count: entries.length })}
      </p>
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
