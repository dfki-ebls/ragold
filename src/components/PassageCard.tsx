import { FileText, ScanSearch, TextQuote, Trash2 } from "lucide-react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { GradePicker } from "@/components/choices";
import { FieldError } from "@/components/FieldError";
import { IconButton } from "@/components/IconButton";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import type { Passage, PassageGrade } from "@/lib/types";
import { parseSpan } from "@/lib/viewer";
import { cn } from "cn";

/** Translated page or line span, other locations such as manual entries are shown verbatim. */
function locationLabel(location: string | null, t: TFunction): string {
  const span = parseSpan(location);

  if (!span) {
    return location ?? t("passages.noLocation");
  }

  const { unit, from, to } = span;

  return from === to ? t(`viewer.${unit}`, { from }) : t(`viewer.${unit}s`, { from, to });
}

/** Icon of the document of a passage, or of a passage without document. */
export function DocumentIcon({
  documentId,
  className,
}: {
  documentId: string | null;
  className?: string;
}) {
  const Icon = documentId === null ? TextQuote : FileText;
  return <Icon className={className} />;
}

const GRADE_STYLES: Record<PassageGrade, string> = {
  needed: "border-l-grade-needed",
  helpful: "border-l-grade-helpful",
  misleading: "border-l-grade-misleading",
};

interface PassageCardProps {
  passage: Passage;
  error?: string;
  /** Editing actions, the card is read-only without them. */
  onGradeChange?: (grade: PassageGrade) => void;
  onShow?: () => void;
  onRemove?: () => void;
}

export function PassageCard({ passage, error, onGradeChange, onShow, onRemove }: PassageCardProps) {
  const { t } = useTranslation();
  const { documentId } = passage;
  const doc = useStore((s) => (documentId === null ? undefined : s.documents[documentId]));
  const name = documentId === null ? t("passages.noDocument") : doc?.name;

  return (
    <div className={cn("space-y-2 rounded-xl border border-l-4 p-3", GRADE_STYLES[passage.grade])}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex min-w-48 flex-1 items-center gap-2 text-sm">
          <DocumentIcon documentId={documentId} className="size-4 shrink-0 text-muted-foreground" />
          <span className={cn("min-w-0 truncate font-medium", !name && "text-destructive")}>
            {name ?? t("passages.deletedDocument")}
          </span>
          <span className="min-w-0 truncate text-xs text-muted-foreground">
            {locationLabel(passage.location, t)}
          </span>
        </div>
        {onGradeChange ? (
          <GradePicker value={passage.grade} onChange={onGradeChange} />
        ) : (
          <Badge variant="outline">{t(`passageGrades.${passage.grade}.label`)}</Badge>
        )}
        {(onShow || onRemove) && (
          <div className="flex gap-1">
            {onShow && doc && (
              <IconButton label={t("passages.showInDocument")} onClick={onShow}>
                <ScanSearch />
              </IconButton>
            )}
            {onRemove && (
              <IconButton label={t("common.remove")} onClick={onRemove}>
                <Trash2 />
              </IconButton>
            )}
          </div>
        )}
      </div>
      <blockquote className="line-clamp-4 border-l-2 pl-3 text-sm whitespace-pre-wrap text-muted-foreground">
        {passage.text}
      </blockquote>
      <FieldError message={error} />
    </div>
  );
}

interface PassageListProps {
  passages: readonly Passage[];
  /** Indices of the passages to show, all by default. */
  shown?: readonly number[];
  onChange: (passages: Passage[]) => void;
  onShow: (passage: Passage) => void;
  errorOf?: (index: number) => string | undefined;
}

/** Editable cards of passages, whose changes apply to the full list. */
export function PassageList({
  passages,
  shown,
  onChange,
  onShow,
  errorOf,
}: PassageListProps) {
  const { t } = useTranslation();
  const indices = shown ?? passages.map((_, i) => i);

  if (indices.length === 0) {
    return <p className="text-sm text-muted-foreground/70 italic">{t("passages.empty")}</p>;
  }

  return (
    <div className="space-y-2">
      {indices.map((i) => (
        <PassageCard
          key={i}
          passage={passages[i]}
          error={errorOf?.(i)}
          onGradeChange={(grade) =>
            onChange(passages.map((p, j) => (j === i ? { ...p, grade } : p)))
          }
          onShow={() => onShow(passages[i])}
          onRemove={() => onChange(passages.filter((_, j) => j !== i))}
        />
      ))}
    </div>
  );
}
