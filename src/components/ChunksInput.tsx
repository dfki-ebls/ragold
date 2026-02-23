import { CircleCheck, CircleX, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectOption } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import type { Chunk } from "@/lib/types";

interface ChunksInputProps {
  chunks: Chunk[];
  onChange: (chunks: Chunk[]) => void;
  disabled?: boolean;
  variant?: "relevant" | "distracting";
  required?: boolean;
}

export function ChunksInput({
  chunks,
  onChange,
  disabled = false,
  variant = "relevant",
  required,
}: ChunksInputProps) {
  const { t } = useTranslation();
  const documents = useStore((s) => s.documents);
  const documentList = Object.entries(documents);

  const label =
    variant === "relevant"
      ? t("chunks.relevantLabel")
      : t("chunks.distractingLabel");
  const description =
    variant === "relevant"
      ? t("chunks.relevantDescription")
      : t("chunks.distractingDescription");
  const placeholder =
    variant === "relevant"
      ? t("chunks.relevantPlaceholder")
      : t("chunks.distractingPlaceholder");

  const addChunk = () => {
    onChange([...chunks, { content: "" }]);
  };

  const removeChunk = (index: number) => {
    onChange(chunks.filter((_, i) => i !== index));
  };

  const updateChunk = (index: number, content: string, documentId?: string) => {
    const updated = [...chunks];
    updated[index] = { ...chunks[index], content, documentId };
    onChange(updated);
  };

  const handleDocumentSelect = (index: number, documentId: string) => {
    if (documentId === "") {
      updateChunk(index, chunks[index].content, undefined);
    } else {
      updateChunk(index, chunks[index].content, documentId);
    }
  };

  const Icon = variant === "relevant" ? CircleCheck : CircleX;

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {label}
        {required === true && " *"}
        {required === false && " (optional)"}
      </Label>
      <p className="text-sm text-muted-foreground">{description}</p>

      {chunks.map((chunk, index) => (
        <div key={index} className="flex gap-2">
          <div className="flex-1 space-y-2">
            <div className="space-y-1">
              <Select
                value={chunk.documentId ?? ""}
                onChange={(e) => handleDocumentSelect(index, e.target.value)}
                disabled={disabled || documentList.length === 0}
                className="w-fit"
              >
                {documentList.length === 0 ? (
                  <SelectOption value="">
                    {t("chunks.noDocuments")}
                  </SelectOption>
                ) : (
                  <>
                    <SelectOption value="">
                      {t("chunks.manualEntry")}
                    </SelectOption>
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
                  {t("chunks.addChunksHint")}
                </p>
              )}
            </div>
            <Textarea
              value={chunk.content}
              onChange={(e) =>
                updateChunk(index, e.target.value, chunk.documentId)
              }
              placeholder={`${placeholder} ${index + 1}...`}
              rows={3}
              disabled={disabled}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeChunk(index)}
            disabled={disabled || chunks.length <= 1}
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
        onClick={addChunk}
        disabled={disabled}
      >
        <Plus className="w-4 h-4 mr-2" />
        {t("chunks.addChunk")}
      </Button>
    </div>
  );
}
