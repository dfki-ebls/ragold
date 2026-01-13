import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DocChunk } from "@/lib/types";

interface DocsInputProps {
  docs: DocChunk[];
  onChange: (docs: DocChunk[]) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  placeholder?: string;
}

export function DocsInput({
  docs,
  onChange,
  disabled = false,
  label = "Relevante Dokumenteninhalte",
  description = "Tragen Sie die Textpassagen ein, die das System finden müsste, um die Frage korrekt zu beantworten.",
  placeholder = "Dokumentpassage",
}: DocsInputProps) {
  const addDoc = () => {
    onChange([...docs, { content: "" }]);
  };

  const removeDoc = (index: number) => {
    onChange(docs.filter((_, i) => i !== index));
  };

  const updateDoc = (index: number, content: string) => {
    const updated = [...docs];
    updated[index] = { content };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <p className="text-sm text-muted-foreground">{description}</p>

      {docs.map((doc, index) => (
        <div key={index} className="flex gap-2">
          <Textarea
            value={doc.content}
            onChange={(e) => updateDoc(index, e.target.value)}
            placeholder={`${placeholder} ${index + 1}...`}
            rows={3}
            disabled={disabled}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeDoc(index)}
            disabled={disabled || docs.length <= 1}
            className="shrink-0"
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
        Weitere Passage hinzufügen
      </Button>
    </div>
  );
}
