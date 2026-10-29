import { MessageSquare, Trash2, TriangleAlert } from "lucide-react";
import { type SyntheticEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChoiceToggle, useChoiceOptions } from "@/components/choices";
import { FieldError } from "@/components/FieldError";
import { IconButton } from "@/components/IconButton";
import { SelectionPopover } from "@/components/SelectionPopover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { followEdit, occurrences } from "@/lib/keyFacts";
import { paintHighlight, rangeAnchor, type VirtualAnchor } from "@/lib/selection";
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

/** Box metrics shared by the textarea and its mirror, so that both wrap the text alike. */
const TEXT_BOX = "border border-transparent px-3 py-3 text-base md:text-sm";

function textRange(node: Text, start: number, end: number): Range {
  const range = document.createRange();
  range.setStart(node, start);
  range.setEnd(node, end);
  return range;
}

/**
 * The ideal answer with key facts that are marked by selecting text in it.
 * A mirror behind the transparent textarea lays out the same text to paint highlights and anchor the popover.
 */
export function ResponseEditor({ response, keyFacts, onChange, errors }: ResponseEditorProps) {
  const { t } = useTranslation();
  const mirror = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [pending, setPending] = useState<{ text: string; anchor: VirtualAnchor } | null>(null);
  const importanceOptions = useChoiceOptions(KEY_FACT_IMPORTANCES, "keyFactImportances");

  useEffect(() => {
    const textNode = mirror.current?.firstChild;

    if (!(textNode instanceof Text)) {
      return;
    }

    const cleanups = KEY_FACT_IMPORTANCES.map((importance) => {
      const ranges = keyFacts
        .filter((fact) => fact.importance === importance)
        .flatMap((fact) =>
          occurrences(response, fact.text).map((start) =>
            textRange(textNode, start, start + fact.text.length),
          ),
        );

      return paintHighlight(`ragold-${importance}`, ranges);
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [response, keyFacts]);

  const handleSelect = (event: SyntheticEvent<HTMLTextAreaElement>) => {
    let { selectionStart: start, selectionEnd: end } = event.currentTarget;
    const textNode = mirror.current?.firstChild;

    while (start < end && /\s/.test(response[start])) start++;
    while (end > start && /\s/.test(response[end - 1])) end--;

    setPending(
      end > start && textNode instanceof Text
        ? {
            text: response.slice(start, end),
            anchor: rangeAnchor(textRange(textNode, start, end), mirror.current ?? undefined),
          }
        : null,
    );
  };

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

    // Collapse the selection so that typing after picking does not replace the key fact.
    if (textarea.current) textarea.current.selectionStart = textarea.current.selectionEnd;
    setPending(null);
  };

  const setKeyFacts = (next: KeyFact[]) => onChange({ response, keyFacts: next });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="response" className="flex items-center gap-2">
          <MessageSquare className="size-4" />
          {t("response.label")} *
        </Label>
        <p className="text-sm text-muted-foreground">{t("response.description")}</p>
        <div className="grid rounded-2xl bg-input/50 *:[grid-area:1/1]">
          <div
            ref={mirror}
            aria-hidden
            className={cn(
              TEXT_BOX,
              "pointer-events-none wrap-break-word whitespace-pre-wrap text-transparent select-none",
            )}
          >
            {response}
          </div>
          <Textarea
            ref={textarea}
            id="response"
            value={response}
            onChange={(e) =>
              onChange({
                response: e.target.value,
                keyFacts: followEdit(response, e.target.value, e.target.selectionEnd, keyFacts),
              })
            }
            onSelect={handleSelect}
            placeholder={t("response.placeholder")}
            rows={6}
            className={cn(TEXT_BOX, "min-h-36 bg-transparent")}
            aria-invalid={!!errors.response}
          />
        </div>
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
        keepFocus
      />
    </div>
  );
}
