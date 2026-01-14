import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { DocsInput } from "@/components/DocsInput";
import { StarRating } from "@/components/StarRating";
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
import { QUERY_TYPE_DESCRIPTIONS, QUERY_TYPE_LABELS } from "@/lib/types";

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
  complexity: 0,
  notes: "",
};

export const AnnotationForm = forwardRef<AnnotationFormRef, AnnotationFormProps>(
  function AnnotationForm({ annotation, onSubmit, onCancel }, ref) {
  const [formData, setFormData] = useState<Annotation>(emptyFormData);
  const [errors, setErrors] = useState<
    Partial<Record<keyof Annotation, string>>
  >({});
  const initialFormData = useRef<Annotation>(emptyFormData);

  useImperativeHandle(ref, () => ({
    hasUnsavedChanges: () => {
      return JSON.stringify(formData) !== JSON.stringify(initialFormData.current);
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
          complexity: annotation.complexity,
          notes: annotation.notes,
        }
      : emptyFormData;
    setFormData(newFormData);
    initialFormData.current = newFormData;
    setErrors({});
  }, [annotation]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Annotation, string>> = {};

    if (!formData.query.trim()) {
      newErrors.query = "Nutzeranfrage ist erforderlich";
    }

    if (formData.relevantDocs.every((doc) => !doc.content.trim())) {
      newErrors.relevantDocs =
        "Mindestens eine Dokumentpassage ist erforderlich";
    }

    if (!formData.response.trim()) {
      newErrors.response = "Erwartete Antwort ist erforderlich";
    }

    if (formData.complexity < 1 || formData.complexity > 5) {
      newErrors.complexity = "Komplexität (1-5 Sterne) ist erforderlich";
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
          {isEditing ? "Annotation bearbeiten" : "Neue Annotation erstellen"}
        </CardTitle>
        <CardDescription>
          Erstellen Sie ein Beispiel für eine Nutzeranfrage an ein RAG-System
          mit den relevanten Dokumenten und der erwarteten Antwort.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="query">Nutzeranfrage *</Label>
            <p className="text-sm text-muted-foreground">
              Formulieren Sie die Frage so, wie ein Nutzer sie in ein
              Chat-System eingeben würde.
            </p>
            <Textarea
              id="query"
              value={formData.query}
              onChange={(e) =>
                setFormData({ ...formData, query: e.target.value })
              }
              placeholder="Wie beantrage ich Urlaub im Self-Service-Portal?"
              rows={3}
            />
            {errors.query && (
              <p className="text-sm text-destructive">{errors.query}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Fragetyp *</Label>
            <p className="text-sm text-muted-foreground">
              Wie wird die Frage durch den Kontext beantwortet?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Object.keys(QUERY_TYPE_LABELS) as QueryType[]).map((type) => (
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
                    {QUERY_TYPE_LABELS[type]}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {QUERY_TYPE_DESCRIPTIONS[type]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <DocsInput
              docs={formData.relevantDocs}
              onChange={(relevantDocs) =>
                setFormData({ ...formData, relevantDocs })
              }
            />
            {errors.relevantDocs && (
              <p className="text-sm text-destructive">{errors.relevantDocs}</p>
            )}
          </div>

          <div className="space-y-2">
            <DocsInput
              docs={formData.distractorDocs}
              onChange={(distractorDocs) =>
                setFormData({ ...formData, distractorDocs })
              }
              label="Irrelevante Dokumenteninhalte (optional)"
              description="Textpassagen, die relevant erscheinen, aber nicht zur Beantwortung verwendet werden sollten."
              placeholder="Ablenkende Passage"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="response">Erwartete Antwort *</Label>
            <p className="text-sm text-muted-foreground">
              Formulieren Sie die ideale Antwort, die das Chat-System geben
              sollte.
            </p>
            <Textarea
              id="response"
              value={formData.response}
              onChange={(e) =>
                setFormData({ ...formData, response: e.target.value })
              }
              placeholder="Antwort auf die Nutzeranfrage..."
              rows={4}
            />
            {errors.response && (
              <p className="text-sm text-destructive">{errors.response}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Komplexität der Aufgabe *</Label>
            <p className="text-sm text-muted-foreground">
              Wie schwierig ist diese Aufgabe für ein RAG-System?
            </p>
            <div className="text-xs text-muted-foreground space-y-0.5 mb-2">
              <p>
                1: Einfache Faktenabfrage, Antwort steht wörtlich im Dokument
              </p>
              <p>2: Leichte Umformulierung oder Filterung nötig</p>
              <p>3: Informationen aus mehreren Absätzen kombinieren</p>
              <p>
                4: Komplexe Zusammenhänge verstehen, implizites Wissen nutzen
              </p>
              <p>5: Sehr anspruchsvoll, erfordert tiefes Verständnis</p>
            </div>
            <StarRating
              value={formData.complexity}
              onChange={(complexity) =>
                setFormData({ ...formData, complexity })
              }
            />
            {errors.complexity && (
              <p className="text-sm text-destructive">{errors.complexity}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Anmerkungen (optional)</Label>
            <p className="text-sm text-muted-foreground">
              Besonderheiten wie mehrdeutige Begriffe, Zeitabhängigkeit,
              besondere Formulierungen.
            </p>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Optionale Hinweise..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit">Speichern</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Abbrechen
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
});
