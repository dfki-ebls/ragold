import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { MessageSquare, Search, StickyNote, Tags } from "lucide-react";
import { DocsInput } from "@/components/DocsInput";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Annotation, QueryType } from "@/lib/types";

const QUERY_TYPES: QueryType[] = [
  "fact_single",
  "summary",
  "reasoning",
  "unanswerable",
];

interface AnnotationFormProps {
  annotation?: Annotation;
  onSubmit: (data: Annotation) => void;
  onCancel: () => void;
}

export interface AnnotationFormRef {
  hasUnsavedChanges: () => boolean;
}

const emptyFormData: Annotation = {
  query: "",
  queryType: "fact_single",
  relevantDocs: [{ content: "" }],
  distractorDocs: [{ content: "" }],
  response: "",
  notes: "",
};

export const AnnotationForm = forwardRef<
  AnnotationFormRef,
  AnnotationFormProps
>(function AnnotationForm({ annotation, onSubmit, onCancel }, ref) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Annotation>(emptyFormData);
  const [errors, setErrors] = useState<
    Partial<Record<keyof Annotation, string>>
  >({});
  const initialFormData = useRef<Annotation>(emptyFormData);

  useImperativeHandle(ref, () => ({
    hasUnsavedChanges: () => {
      return (
        JSON.stringify(formData) !== JSON.stringify(initialFormData.current)
      );
    },
  }));

  useEffect(() => {
    const newFormData = annotation
      ? {
          query: annotation.query,
          queryType: annotation.queryType ?? "fact_single",
          relevantDocs:
            annotation.relevantDocs.length > 0
              ? annotation.relevantDocs
              : [{ content: "" }],
          distractorDocs:
            annotation.distractorDocs?.length > 0
              ? annotation.distractorDocs
              : [{ content: "" }],
          response: annotation.response,
          notes: annotation.notes,
        }
      : emptyFormData;
    setFormData(newFormData);
    initialFormData.current = newFormData;
    setErrors({});
  }, [annotation]);

  const isUnanswerable = formData.queryType === "unanswerable";

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Annotation, string>> = {};

    if (!formData.query.trim()) {
      newErrors.query = t("form.queryError");
    }

    if (
      !isUnanswerable &&
      formData.relevantDocs.every((doc) => !doc.content.trim())
    ) {
      newErrors.relevantDocs = t("docs.relevantError");
    }

    if (!isUnanswerable && !formData.response.trim()) {
      newErrors.response = t("form.responseError");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const cleanedData: Annotation = {
        ...formData,
        relevantDocs: formData.relevantDocs.filter((doc) => doc.content.trim()),
        distractorDocs: formData.distractorDocs.filter((doc) =>
          doc.content.trim(),
        ),
      };
      onSubmit(cleanedData);
      if (!annotation) {
        setFormData(emptyFormData);
      }
    }
  };

  const isEditing = !!annotation;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? t("form.titleEdit") : t("form.titleNew")}
        </CardTitle>
        <CardDescription>{t("form.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="query" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              {t("form.query")} *
            </Label>
            <p className="text-sm text-muted-foreground">
              {t("form.queryDescription")}
            </p>
            <Textarea
              id="query"
              value={formData.query}
              onChange={(e) =>
                setFormData({ ...formData, query: e.target.value })
              }
              placeholder={t("form.queryPlaceholder")}
              rows={3}
            />
            {errors.query && (
              <p className="text-sm text-destructive">{errors.query}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tags className="w-4 h-4" />
              {t("form.queryType")} *
            </Label>
            <p className="text-sm text-muted-foreground">
              {t("form.queryTypeDescription")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUERY_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, queryType: type })}
                  className={`p-3 text-left border rounded-md transition-colors ${
                    formData.queryType === type
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="font-medium text-sm">
                    {t(`queryTypes.${type}.label`)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t(`queryTypes.${type}.description`)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {!isUnanswerable && (
            <>
              <div className="space-y-2">
                <DocsInput
                  docs={formData.relevantDocs}
                  onChange={(relevantDocs) =>
                    setFormData({ ...formData, relevantDocs })
                  }
                />
                {errors.relevantDocs && (
                  <p className="text-sm text-destructive">
                    {errors.relevantDocs}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <DocsInput
                  docs={formData.distractorDocs}
                  onChange={(distractorDocs) =>
                    setFormData({ ...formData, distractorDocs })
                  }
                  variant="distractor"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="response" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  {t("form.response")} *
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("form.responseDescription")}
                </p>
                <Textarea
                  id="response"
                  value={formData.response}
                  onChange={(e) =>
                    setFormData({ ...formData, response: e.target.value })
                  }
                  placeholder={t("form.responsePlaceholder")}
                  rows={4}
                />
                {errors.response && (
                  <p className="text-sm text-destructive">{errors.response}</p>
                )}
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <StickyNote className="w-4 h-4" />
              {t("form.notes")}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t("form.notesDescription")}
            </p>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder={t("form.notesPlaceholder")}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit">{t("common.save")}</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
});
