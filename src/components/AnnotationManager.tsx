import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AnnotationForm } from "@/components/AnnotationForm";
import { EmptyState } from "@/components/EmptyState";
import { ListItem } from "@/components/ListItem";
import { OriginBadge } from "@/components/OriginBadge";
import { PassageCard } from "@/components/PassageCard";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDirtyForms, useStore } from "@/lib/store";
import { type Annotation, type AnnotationContent, PASSAGE_GRADES } from "@/lib/types";
import { useConfirmAction } from "@/lib/useConfirmAction";
import { formatTimestamp } from "@/lib/utils";

interface AnnotationManagerProps {
  scrollToTabs?: () => void;
}

function DetailSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function AnnotationItem({
  annotation,
  onEdit,
  onDelete,
  deleteConfirm,
}: {
  annotation: Annotation;
  onEdit: () => void;
  onDelete: () => void;
  deleteConfirm: boolean;
}) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const counts = PASSAGE_GRADES.map((grade) => ({
    grade,
    count: annotation.passages.filter((p) => p.grade === grade).length,
  })).filter(({ count }) => count > 0);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(JSON.stringify(annotation, null, 2))
      .then(() => toast.success(t("annotationManager.copySuccess")))
      .catch(() => toast.error(t("annotationManager.copyError")));
  };

  const details = isExpanded ? (
    <div className="space-y-4">
      {annotation.passages.length > 0 && (
        <DetailSection label={t("passages.label")}>
          <div className="space-y-2">
            {annotation.passages.map((passage, i) => (
              <PassageCard key={i} passage={passage} />
            ))}
          </div>
        </DetailSection>
      )}
      <DetailSection label={t("response.label")}>
        <p className="text-sm whitespace-pre-wrap">{annotation.response}</p>
      </DetailSection>
      {annotation.keyFacts.length > 0 && (
        <DetailSection label={t("response.keyFacts")}>
          <ul className="space-y-1">
            {annotation.keyFacts.map((fact) => (
              <li key={fact.text} className="flex items-start gap-2 text-sm">
                <Badge variant={fact.importance === "must" ? "default" : "secondary"}>
                  {t(`keyFactImportances.${fact.importance}.label`)}
                </Badge>
                <span>{fact.text}</span>
              </li>
            ))}
          </ul>
        </DetailSection>
      )}
      {annotation.notes && (
        <DetailSection label={t("annotationManager.notes")}>
          <p className="text-sm whitespace-pre-wrap">{annotation.notes}</p>
        </DetailSection>
      )}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
        <span>
          {t("annotationManager.created")}: {formatTimestamp(annotation.createdAt)}
        </span>
        <span>
          {t("annotationManager.updated")}: {formatTimestamp(annotation.updatedAt)}
        </span>
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
        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
          <Badge variant="secondary">{t(`questionTypes.${annotation.questionType}.label`)}</Badge>
          <Badge variant="outline">{t(`answerabilities.${annotation.answerability}.label`)}</Badge>
          {counts.map(({ grade, count }) => (
            <Badge key={grade} variant={grade === "misleading" ? "destructive" : "outline"}>
              {count} {t(`passageGrades.${grade}.label`)}
            </Badge>
          ))}
          <OriginBadge origin={annotation.origin} />
          <span className="text-xs">
            {t("common.lastEdited", { date: formatTimestamp(annotation.updatedAt) })}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-auto p-0 mt-2 text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
          {isExpanded ? t("annotationManager.hideDetails") : t("annotationManager.showDetails")}
        </Button>
      </div>
    </ListItem>
  );
}

export function AnnotationManager({ scrollToTabs }: AnnotationManagerProps) {
  const { t } = useTranslation();
  const annotations = useStore((s) => s.annotations);
  const annotationFormDirty = useDirtyForms((s) => s.annotation);
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

  const handleSubmit = (data: AnnotationContent) => {
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
        key={editingId ?? "new"}
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
