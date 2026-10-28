import { FileText, ScanSearch, Trash2 } from "lucide-react";
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
function locationLabel(location: string, t: TFunction): string {
  const span = parseSpan(location);

  if (!span) {
    return location || t("passages.noLocation");
  }

  const { unit, from, to } = span;

  return from === to ? t(`viewer.${unit}`, { from }) : t(`viewer.${unit}s`, { from, to });
}

const GRADE_STYLES: Record<PassageGrade, string> = {
  needed: "border-l-primary",
  helpful: "border-l-muted-foreground/40",
  misleading: "border-l-destructive",
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
  const doc = useStore((s) => s.documents[passage.documentId]);

  return (
    <div className={cn("space-y-2 rounded-xl border border-l-4 p-3", GRADE_STYLES[passage.grade])}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
          <FileText className="size-4 shrink-0 text-muted-foreground" />
          <span className={cn("truncate font-medium", !doc && "text-destructive")}>
            {doc?.name ?? t("passages.deletedDocument")}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
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
