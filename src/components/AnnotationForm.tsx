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
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { FieldError } from "@/components/FieldError";
import { useFormErrors } from "@/lib/useFormErrors";
import { useTranslation } from "react-i18next";
import { ChunksInput } from "@/components/ChunksInput";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,

  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type Annotation,
  annotationSchema,
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

export interface AnnotationFormRef {
  hasUnsavedChanges: () => boolean;
}

const emptyFormData: Annotation = {
  ...annotationSchema.parse({}),
  relevantChunks: [{ content: "" }],
  distractingChunks: [{ content: "" }],
};

export const AnnotationForm = forwardRef<
  AnnotationFormRef,
  AnnotationFormProps
>(function AnnotationForm({ annotation, onSubmit, onCancel }, ref) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Annotation>(emptyFormData);
  const { errors, validate, clearErrors } =
    useFormErrors<keyof Annotation>();
  const savedDataRef = useRef<Annotation>(emptyFormData);

  useImperativeHandle(ref, () => ({
    hasUnsavedChanges: () =>
      JSON.stringify(formData) !== JSON.stringify(savedDataRef.current),
  }));

  useEffect(() => {
    const newFormData = annotation
      ? {
          query: annotation.query,
          queryType: annotation.queryType ?? "fact_single",
          relevantChunks:
            annotation.relevantChunks.length > 0
              ? annotation.relevantChunks
              : [{ content: "" }],
          distractingChunks:
            annotation.distractingChunks?.length > 0
              ? annotation.distractingChunks
              : [{ content: "" }],
          response: annotation.response,
          notes: annotation.notes,
        }
      : emptyFormData;
    setFormData(newFormData);
    savedDataRef.current = newFormData;
    clearErrors();
  }, [annotation, clearErrors]);

  const isUnanswerable = formData.queryType === "unanswerable";

  const handleValidate = (): boolean =>
    validate({
      query: !formData.query.trim() ? t("annotationManager.queryError") : undefined,
      relevantChunks:
        !isUnanswerable &&
        formData.relevantChunks.every((chunk) => !chunk.content.trim())
          ? t("chunks.relevantError")
          : undefined,
      response:
        !isUnanswerable && !formData.response.trim()
          ? t("annotationManager.responseError")
          : undefined,
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handleValidate()) {
      const cleanedData: Annotation = {
        ...formData,
        relevantChunks: formData.relevantChunks.filter((chunk) =>
          chunk.content.trim(),
        ),
        distractingChunks: formData.distractingChunks.filter((chunk) =>
          chunk.content.trim(),
        ),
      };
      onSubmit(cleanedData);
      if (!annotation) {
        setFormData(emptyFormData);
        savedDataRef.current = emptyFormData;
        clearErrors();
      }
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
              onChange={(e) =>
                setFormData({ ...formData, query: e.target.value })
              }
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
                    onClick={() =>
                      setFormData({ ...formData, queryType: type })
                    }
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

          <div className="space-y-2">
            <ChunksInput
              chunks={formData.relevantChunks}
              onChange={(relevantChunks) =>
                setFormData({ ...formData, relevantChunks })
              }
              required={!isUnanswerable}
            />
            <FieldError message={errors.relevantChunks} />
          </div>

          <div className="space-y-2">
            <ChunksInput
              chunks={formData.distractingChunks}
              onChange={(distractingChunks) =>
                setFormData({ ...formData, distractingChunks })
              }
              variant="distracting"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="response" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              {t("annotationManager.response")} {isUnanswerable ? "(optional)" : "*"}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t("annotationManager.responseDescription")}
            </p>
            <Textarea
              id="response"
              value={formData.response}
              onChange={(e) =>
                setFormData({ ...formData, response: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder={t("annotationManager.notesPlaceholder")}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit">
              {isEditing ? t("common.update") : t("common.add")}
            </Button>
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
});
