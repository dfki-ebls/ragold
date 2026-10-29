import { Lightbulb, Plus, Search, StickyNote, Tags, Library, CircleQuestionMark } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ChoiceCards, useChoiceOptions } from "@/components/choices";
import { FieldError } from "@/components/FieldError";
import { OriginBadge } from "@/components/OriginBadge";
import { PassageCard } from "@/components/PassageCard";
import { PassageDialog } from "@/components/PassageDialog";
import { ResponseEditor } from "@/components/ResponseEditor";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDirtyForms, useStore } from "@/lib/store";
import {
  ANSWERABILITIES,
  type AnnotationContent,
  type AnnotationDraft,
  annotationContentSchemaFor,
  annotationHints,
  type Passage,
  QUESTION_TYPES,
} from "@/lib/types";
import { useFormErrors } from "@/lib/useFormErrors";

interface AnnotationFormProps {
  annotation?: AnnotationContent;
  onSubmit: (data: AnnotationContent) => void;
  onCancel?: () => void;
}

const emptyFormData: AnnotationDraft = {
  query: "",
  questionType: null,
  answerability: null,
  passages: [],
  response: "",
  keyFacts: [],
  origin: "",
  notes: "",
};

type Changes = Partial<AnnotationDraft>;

export function AnnotationForm({ annotation, onSubmit, onCancel }: AnnotationFormProps) {
  const { t } = useTranslation();
  const documents = useStore((s) => s.documents);
  const [formData, setFormData] = useState<AnnotationDraft>(annotation ?? emptyFormData);
  const [viewer, setViewer] = useState<{ documentId: string; focus?: Passage } | null>(null);
  const [lastDocumentId, setLastDocumentId] = useState<string>();
  const { errors, validate, clearErrors } = useFormErrors<string>();
  const questionTypeOptions = useChoiceOptions(QUESTION_TYPES, "questionTypes");
  const answerabilityOptions = useChoiceOptions(ANSWERABILITIES, "answerabilities");
  const documentIds = Object.keys(documents);

  // State is initialized per mount, the parent remounts the form via `key` when switching annotations.
  useEffect(() => () => useDirtyForms.setState({ annotation: false }), []);

  const update = (changes: Changes | ((current: AnnotationDraft) => Changes)) => {
    setFormData((current) => ({
      ...current,
      ...(typeof changes === "function" ? changes(current) : changes),
    }));
    useDirtyForms.setState({ annotation: true });
  };

  const passageError = (index: number) =>
    Object.entries(errors).find(([path]) => path.startsWith(`passages.${index}.`))?.[1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = annotationContentSchemaFor(documents).safeParse(formData);
    const messages: Record<string, string> = {};

    // Custom issues carry i18n keys, all others stem from required fields.
    for (const issue of result.error?.issues ?? []) {
      messages[issue.path.join(".")] = t(issue.message, { defaultValue: t("form.required") });
    }

    if (!validate(messages) || !result.success) {
      toast.error(t("form.validationError"));
      return;
    }

    onSubmit(result.data);

    if (!annotation) {
      setFormData(emptyFormData);
      useDirtyForms.setState({ annotation: false });
      clearErrors();
    }
  };

  const openViewer = (documentId: string, focus?: Passage) => {
    setLastDocumentId(documentId);
    setViewer({ documentId, focus });
  };

  const defaultDocumentId =
    lastDocumentId && documents[lastDocumentId] ? lastDocumentId : documentIds[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {annotation ? t("annotationManager.titleEdit") : t("annotationManager.titleNew")}
        </CardTitle>
        <CardAction>
          <OriginBadge origin={formData.origin} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="query" className="flex items-center gap-2">
              <Search className="size-4" />
              {t("annotationManager.query")} *
            </Label>
            <p className="text-sm text-muted-foreground">
              {t("annotationManager.queryDescription")}
            </p>
            <Textarea
              id="query"
              value={formData.query}
              onChange={(e) => update({ query: e.target.value })}
              placeholder={t("annotationManager.queryPlaceholder")}
              rows={2}
              aria-invalid={!!errors.query}
            />
            <FieldError message={errors.query} />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tags className="size-4" />
              {t("annotationManager.questionType")} *
            </Label>
            <p className="text-sm text-muted-foreground">
              {t("annotationManager.questionTypeDescription")}
            </p>
            <ChoiceCards
              id="question-type"
              options={questionTypeOptions}
              value={formData.questionType}
              onChange={(questionType) => update({ questionType })}
              className="sm:grid-cols-2"
              italic
            />
            <FieldError message={errors.questionType} />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CircleQuestionMark className="size-4" />
              {t("annotationManager.answerability")} *
            </Label>
            <ChoiceCards
              id="answerability"
              options={answerabilityOptions}
              value={formData.answerability}
              onChange={(answerability) => update({ answerability })}
              className="sm:grid-cols-3"
            />
            <FieldError message={errors.answerability} />
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="flex items-center gap-2">
                <Library className="size-4" />
                {t("passages.label")}
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!defaultDocumentId}
                onClick={() => defaultDocumentId && openViewer(defaultDocumentId)}
              >
                <Plus />
                {t("passages.addFromDocument")}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {documentIds.length > 0 ? t("passages.description") : t("passages.noDocuments")}
            </p>
            {formData.passages.length === 0 ? (
              <p className="text-sm text-muted-foreground/70 italic">{t("passages.empty")}</p>
            ) : (
              <div className="space-y-2">
                {formData.passages.map((passage, i) => (
                  <PassageCard
                    key={i}
                    passage={passage}
                    error={passageError(i)}
                    onGradeChange={(grade) =>
                      update({
                        passages: formData.passages.map((p, j) => (j === i ? { ...p, grade } : p)),
                      })
                    }
                    onShow={() => openViewer(passage.documentId, passage)}
                    onRemove={() => update({ passages: formData.passages.filter((_, j) => j !== i) })}
                  />
                ))}
              </div>
            )}
            {annotationHints(formData).map((hint) => (
              <Alert key={hint}>
                <Lightbulb />
                <AlertDescription>{t(`hints.${hint}`)}</AlertDescription>
              </Alert>
            ))}
          </div>

          <ResponseEditor
            response={formData.response}
            keyFacts={formData.keyFacts}
            onChange={update}
            errors={errors}
          />

          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <StickyNote className="size-4" />
              {t("annotationManager.notes")}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t("annotationManager.notesDescription")}
            </p>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => update({ notes: e.target.value })}
              placeholder={t("annotationManager.notesPlaceholder")}
              rows={2}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit">{annotation ? t("common.update") : t("common.add")}</Button>
            {annotation && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                {t("common.cancel")}
              </Button>
            )}
          </div>
        </form>
      </CardContent>

      {viewer && (
        <PassageDialog
          documentId={viewer.documentId}
          focus={viewer.focus}
          onAdd={(passage) => update((current) => ({ passages: [...current.passages, passage] }))}
          onClose={() => setViewer(null)}
        />
      )}
    </Card>
  );
}
