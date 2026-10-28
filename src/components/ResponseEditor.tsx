import { Check, MessageSquare, PencilLine, Trash2, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChoiceToggle, useChoiceOptions } from "@/components/choices";
import { FieldError } from "@/components/FieldError";
import { IconButton } from "@/components/IconButton";
import { SelectionPopover } from "@/components/SelectionPopover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  clearSelection,
  paintHighlight,
  rangeAnchor,
  selectionHandlers,
  type VirtualAnchor,
} from "@/lib/selection";
import {
  isKeyFactInResponse,
  KEY_FACT_IMPORTANCES,
  type KeyFact,
  type KeyFactImportance,
} from "@/lib/types";
import { cn } from "cn";

interface ResponseEditorProps {
  response: string;
  keyFacts: KeyFact[];
  onChange: (value: { response: string; keyFacts: KeyFact[] }) => void;
  /** Validation messages keyed by path, such as `response` or `keyFacts.0.text`. */
  errors: Partial<Record<string, string>>;
}

/** Character offset of a selection boundary in an element holding a single text node. */
function offsetIn(element: HTMLElement, node: Node, offset: number): number {
  if (node === element.firstChild) {
    return offset;
  }

  return offset === 0 ? 0 : (element.textContent?.length ?? 0);
}

function occurrences(text: string, part: string): number[] {
  const indices: number[] = [];

  for (let i = text.indexOf(part); i >= 0; i = text.indexOf(part, i + 1)) {
    indices.push(i);
  }

  return indices;
}

/** The ideal answer with key facts that are marked by selecting text in its read view. */
export function ResponseEditor({ response, keyFacts, onChange, errors }: ResponseEditorProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(response === "");
  const [pending, setPending] = useState<{ text: string; anchor: VirtualAnchor } | null>(null);
  const importanceOptions = useChoiceOptions(KEY_FACT_IMPORTANCES, "keyFactImportances");

  useEffect(() => {
    const textNode = ref.current?.firstChild;

    if (editing || !(textNode instanceof Text)) {
      return;
    }

    const cleanups = KEY_FACT_IMPORTANCES.map((importance) => {
      const ranges = keyFacts
        .filter((fact) => fact.importance === importance)
        .flatMap((fact) =>
          occurrences(response, fact.text).map((start) => {
            const range = document.createRange();
            range.setStart(textNode, start);
            range.setEnd(textNode, start + fact.text.length);
            return range;
          }),
        );

      return paintHighlight(`ragold-${importance}`, ranges);
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [editing, response, keyFacts]);

  const handlers = selectionHandlers((selection) => {
    if (!selection) {
      setPending(null);
      return;
    }

    const { range, element } = selection;
    let start = offsetIn(element, range.startContainer, range.startOffset);
    let end = offsetIn(element, range.endContainer, range.endOffset);

    while (start < end && /\s/.test(response[start])) start++;
    while (end > start && /\s/.test(response[end - 1])) end--;

    setPending(
      end > start
        ? { text: response.slice(start, end), anchor: rangeAnchor(range, element) }
        : null,
    );
  });

  const addKeyFact = (importance: KeyFactImportance) => {
    if (pending) {
      onChange({
        response,
        keyFacts: [
          ...keyFacts.filter((fact) => fact.text !== pending.text),
          { text: pending.text, importance },
        ],
      });
    }

    clearSelection();
    setPending(null);
  };

  const setKeyFacts = (next: KeyFact[]) => onChange({ response, keyFacts: next });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="response" className="flex items-center gap-2">
            <MessageSquare className="size-4" />
            {t("response.label")} *
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={editing && !response.trim()}
            onClick={() => setEditing(!editing)}
          >
            {editing ? <Check /> : <PencilLine />}
            {editing ? t("response.finishEditing") : t("response.edit")}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {editing ? t("response.description") : t("response.selectHint")}
        </p>
        {editing ? (
          <Textarea
            id="response"
            value={response}
            onChange={(e) => onChange({ response: e.target.value, keyFacts })}
            placeholder={t("response.placeholder")}
            rows={6}
            aria-invalid={!!errors.response}
          />
        ) : (
          <div
            ref={ref}
            className="max-h-96 cursor-text overflow-y-auto rounded-2xl border bg-muted/30 px-3 py-2 text-sm whitespace-pre-wrap"
            {...handlers}
          >
            {response}
          </div>
        )}
        <FieldError message={errors.response} />
      </div>

      <div className="space-y-2">
        <Label>{t("response.keyFacts")}</Label>
        <p className="text-sm text-muted-foreground">
          {response ? t("response.keyFactsDescription") : t("response.emptyHint")}
        </p>
        {keyFacts.length === 0 ? (
          <p className="text-sm text-muted-foreground/70 italic">{t("response.noKeyFacts")}</p>
        ) : (
          <ul className="space-y-2">
            {keyFacts.map((fact, i) => {
              const stale = !isKeyFactInResponse(fact.text, response);

              return (
                <li
                  key={fact.text}
                  className={cn(
                    "space-y-1 rounded-xl border p-2",
                    stale && "border-destructive/50 bg-destructive/5",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="min-w-0 flex-1 text-sm">
                      <span
                        className={cn(
                          "rounded px-1",
                          !stale && (fact.importance === "must" ? "bg-key-must" : "bg-key-nice"),
                        )}
                      >
                        {fact.text}
                      </span>
                    </span>
                    <ChoiceToggle
                      options={importanceOptions}
                      value={fact.importance}
                      onChange={(importance) =>
                        setKeyFacts(keyFacts.map((f, j) => (j === i ? { ...f, importance } : f)))
                      }
                    />
                    <IconButton
                      label={t("common.remove")}
                      onClick={() => setKeyFacts(keyFacts.filter((_, j) => j !== i))}
                    >
                      <Trash2 />
                    </IconButton>
                  </div>
                  {stale && (
                    <p className="flex items-center gap-1 text-xs text-destructive">
                      <TriangleAlert className="size-3.5" />
                      {t("response.staleKeyFact")}
                    </p>
                  )}
                  <FieldError message={stale ? undefined : errors[`keyFacts.${i}.text`]} />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <SelectionPopover
        anchor={pending?.anchor ?? null}
        title={t("response.keyFactTitle")}
        excerpt={pending?.text ?? ""}
        options={importanceOptions}
        onPick={addKeyFact}
        onClose={() => setPending(null)}
      />
    </div>
  );
}
