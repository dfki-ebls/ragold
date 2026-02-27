import {
  CircleOff,
  Lightbulb,
  ListTree,
  MessageSquare,
  Search,
  StickyNote,
  Tags,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FieldError } from "@/components/FieldError";
import { useFormErrors } from "@/lib/useFormErrors";
import { useTranslation } from "react-i18next";
import { useStore } from "@/lib/store";
import { ChunksInput } from "@/components/ChunksInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type Annotation,
  annotationSchema,
  type Chunk,
  KNOWN_QUERY_TYPES,
  type KnownQueryType,
} from "@/lib/types";

const QUERY_TYPE_ICONS: Record<KnownQueryType, React.ElementType> = {
  fact_single: Target,
  summary: ListTree,
  reasoning: Lightbulb,
  unanswerable: CircleOff,
};

interface AnnotationFormProps {
  annotation?: Annotation;
  onSubmit: (data: Annotation) => void;
  onCancel?: () => void;
}

const emptyFormData: Annotation = {
  ...annotationSchema.parse({}),
  relevantChunks: [{ content: "" }],
  distractingChunks: [{ content: "" }],
};

export function AnnotationForm({ annotation, onSubmit, onCancel }: AnnotationFormProps) {
  const { t } = useTranslation();
  const setAnnotationFormDirty = useStore((s) => s.setAnnotationFormDirty);
  const [formData, setFormData] = useState<Annotation>(emptyFormData);
  const { errors, validate, clearErrors } = useFormErrors<keyof Annotation>();

  useEffect(() => {
    const newFormData = annotation
      ? {
          ...annotation,
          queryType: annotation.queryType ?? "fact_single",
          relevantChunks:
            annotation.relevantChunks.length > 0 ? annotation.relevantChunks : [{ content: "" }],
          distractingChunks:
            annotation.distractingChunks?.length > 0
              ? annotation.distractingChunks
              : [{ content: "" }],
        }
      : emptyFormData;
    setFormData(newFormData);
    setAnnotationFormDirty(false);
    clearErrors();
  }, [annotation, clearErrors, setAnnotationFormDirty]);

  const updateFormData = (next: Annotation) => {
    setFormData(next);
    setAnnotationFormDirty(true);
  };

  const isUnanswerable = formData.queryType === "unanswerable";

  const hasNoContent = (chunks: Chunk[]) => chunks.every((chunk) => !chunk.content.trim());

  const hasMissingDocument = (chunks: Chunk[]) =>
    chunks.some((chunk) => chunk.content.trim() && !chunk.documentId);

  const validateChunks = (chunks: Chunk[], requireContent: boolean): string | undefined => {
    if (isUnanswerable) return undefined;
    if (requireContent && hasNoContent(chunks)) return t("chunks.relevantError");
    if (hasMissingDocument(chunks)) return t("chunks.documentError");
    return undefined;
  };

  const handleValidate = (): boolean =>
    validate({
      query: !formData.query.trim() ? t("annotationManager.queryError") : undefined,
      relevantChunks: validateChunks(formData.relevantChunks, true),
      distractingChunks: validateChunks(formData.distractingChunks, false),
      response: !formData.response.trim() ? t("annotationManager.responseError") : undefined,
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handleValidate()) {
      const cleanedData: Annotation = {
        ...formData,
        relevantChunks: isUnanswerable
          ? []
          : formData.relevantChunks.filter((chunk) => chunk.content.trim()),
        distractingChunks: formData.distractingChunks.filter((chunk) => chunk.content.trim()),
      };
      onSubmit(cleanedData);
      if (!annotation) {
        setFormData(emptyFormData);
        setAnnotationFormDirty(false);
        clearErrors();
      }
    } else {
      toast.error(t("form.validationError"));
    }
  };

  const isEditing = !!annotation;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? t("annotationManager.titleEdit") : t("annotationManager.titleNew")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="query" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              {t("annotationManager.query")} *
            </Label>
            <p className="text-sm text-muted-foreground">
              {t("annotationManager.queryDescription")}
            </p>
            <Textarea
              id="query"
              value={formData.query}
              onChange={(e) => updateFormData({ ...formData, query: e.target.value })}
              placeholder={t("annotationManager.queryPlaceholder")}
              rows={3}
            />
            <FieldError message={errors.query} />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tags className="w-4 h-4" />
              {t("annotationManager.queryType")} *
            </Label>
            <p className="text-sm text-muted-foreground">
              {t("annotationManager.queryTypeDescription")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {KNOWN_QUERY_TYPES.map((type) => {
                const Icon = QUERY_TYPE_ICONS[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateFormData({ ...formData, queryType: type })}
                    className={`p-3 text-left border rounded-md transition-colors ${
                      formData.queryType === type
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="font-medium text-sm flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {t(`queryTypes.${type}.label`)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {t(`queryTypes.${type}.description`)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {!isUnanswerable && (
            <div className="space-y-2">
              <ChunksInput
                chunks={formData.relevantChunks}
                onChange={(relevantChunks) => updateFormData({ ...formData, relevantChunks })}
                required
              />
              <FieldError message={errors.relevantChunks} />
            </div>
          )}

          <div className="space-y-2">
            <ChunksInput
              chunks={formData.distractingChunks}
              onChange={(distractingChunks) => updateFormData({ ...formData, distractingChunks })}
              variant="distracting"
            />
            <FieldError message={errors.distractingChunks} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="response" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              {t("annotationManager.response")} *
            </Label>
            <p className="text-sm text-muted-foreground">
              {t("annotationManager.responseDescription")}
            </p>
            <Textarea
              id="response"
              value={formData.response}
              onChange={(e) => updateFormData({ ...formData, response: e.target.value })}
              placeholder={t("annotationManager.responsePlaceholder")}
              rows={4}
            />
            <FieldError message={errors.response} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <StickyNote className="w-4 h-4" />
              {t("annotationManager.notes")}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t("annotationManager.notesDescription")}
            </p>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateFormData({ ...formData, notes: e.target.value })}
              placeholder={t("annotationManager.notesPlaceholder")}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit">{isEditing ? t("common.update") : t("common.add")}</Button>
            {isEditing && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                {t("common.cancel")}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
