import {
  ChevronDown,
  ChevronUp,
  FileText,
  Pencil,
  RotateCcw,
  Star,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Annotation } from "@/lib/types";
import { QUERY_TYPE_LABELS } from "@/lib/types";

interface AnnotationListProps {
  annotations: Record<string, Annotation>;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

function AnnotationCard({
  id,
  annotation,
  onEdit,
  onDelete,
}: {
  id: string;
  annotation: Annotation;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

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
                  {QUERY_TYPE_LABELS[annotation.queryType]}
                </span>
              )}
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                {annotation.relevantDocs.length} Dok.
              </span>
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
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
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
              Weniger anzeigen
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              Details anzeigen
            </>
          )}
        </Button>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Erwartete Antwort</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {annotation.response}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">
                Relevante Dokumentpassagen ({annotation.relevantDocs.length})
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
                    Irrelevante Dokumentpassagen (
                    {annotation.distractorDocs.length})
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
                <h4 className="text-sm font-medium mb-1">Anmerkungen</h4>
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
  onClear,
}: AnnotationListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [clearConfirm, setClearConfirm] = useState(false);

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

  const handleClear = () => {
    if (clearConfirm) {
      onClear();
      setClearConfirm(false);
    } else {
      setClearConfirm(true);
      setTimeout(() => setClearConfirm(false), 3000);
    }
  };

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">
            Noch keine Annotationen vorhanden.
          </p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Erstellen Sie Ihre erste Annotation über den Tab "Neue Annotation".
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {entries.length} Annotation(en)
        </p>
        <Button
          variant={clearConfirm ? "destructive" : "ghost"}
          size="sm"
          onClick={handleClear}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          {clearConfirm ? "Klicken zum Bestätigen" : "Alle löschen"}
        </Button>
      </div>
      {entries.map(([id, annotation]) => (
        <div key={id}>
          <AnnotationCard
            id={id}
            annotation={annotation}
            onEdit={() => onEdit(id)}
            onDelete={() => handleDelete(id)}
          />
          {deleteConfirm === id && (
            <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
              Klicken Sie erneut auf Löschen, um zu bestätigen.
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
