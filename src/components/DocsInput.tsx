import { CircleCheck, CircleX, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectOption } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import type { DocChunk } from "@/lib/types";

interface DocsInputProps {
  docs: DocChunk[];
  onChange: (docs: DocChunk[]) => void;
  disabled?: boolean;
  variant?: "relevant" | "distractor";
}

export function DocsInput({
  docs,
  onChange,
  disabled = false,
  variant = "relevant",
}: DocsInputProps) {
  const { t } = useTranslation();
  const documents = useStore((s) => s.documents);
  const documentList = Object.entries(documents);

  const label =
    variant === "relevant"
      ? t("docs.relevantLabel")
      : t("docs.distractorLabel");
  const description =
    variant === "relevant"
      ? t("docs.relevantDescription")
      : t("docs.distractorDescription");
  const placeholder =
    variant === "relevant"
      ? t("docs.relevantPlaceholder")
      : t("docs.distractorPlaceholder");

  const addDoc = () => {
    onChange([...docs, { content: "" }]);
  };

  const removeDoc = (index: number) => {
    onChange(docs.filter((_, i) => i !== index));
  };

  const updateDoc = (index: number, content: string, documentId?: string) => {
    const updated = [...docs];
    updated[index] = { content, documentId };
    onChange(updated);
  };

  const handleDocumentSelect = (index: number, documentId: string) => {
    if (documentId === "") {
      updateDoc(index, docs[index].content, undefined);
    } else {
      updateDoc(index, docs[index].content, documentId);
    }
  };

  const Icon = variant === "relevant" ? CircleCheck : CircleX;

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {label}
      </Label>
      <p className="text-sm text-muted-foreground">{description}</p>

      {docs.map((doc, index) => (
        <div key={index} className="flex gap-2">
          <div className="flex-1 space-y-2">
            <div className="space-y-1">
              <Select
                value={doc.documentId ?? ""}
                onChange={(e) => handleDocumentSelect(index, e.target.value)}
                disabled={disabled || documentList.length === 0}
                className="w-fit"
              >
                {documentList.length === 0 ? (
                  <SelectOption value="">{t("docs.noDocuments")}</SelectOption>
                ) : (
                  <>
                    <SelectOption value="">{t("docs.manualEntry")}</SelectOption>
                    {documentList.map(([id, d]) => (
                      <SelectOption key={id} value={id}>
                        {d.filename}
                      </SelectOption>
                    ))}
                  </>
                )}
              </Select>
              {documentList.length === 0 && index === 0 && (
                <p className="text-xs text-muted-foreground">
                  {t("docs.addDocsHint")}
                </p>
              )}
            </div>
            <Textarea
              value={doc.content}
              onChange={(e) => updateDoc(index, e.target.value, doc.documentId)}
              placeholder={`${placeholder} ${index + 1}...`}
              rows={3}
              disabled={disabled}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeDoc(index)}
            disabled={disabled || docs.length <= 1}
            className="shrink-0 self-center"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={addDoc}
        disabled={disabled}
      >
        <Plus className="w-4 h-4 mr-2" />
        {t("docs.addPassage")}
      </Button>
    </div>
  );
}
