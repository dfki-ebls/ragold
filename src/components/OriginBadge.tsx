import { MessagesSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

function isWebUrl(value: string): boolean {
  return URL.canParse(value) && ["http:", "https:"].includes(new URL(value).protocol);
}

/** Link to the conversation an annotation was created from, nothing for manual annotations. */
export function OriginBadge({ origin }: { origin: string | null }) {
  const { t } = useTranslation();

  if (origin === null) {
    return null;
  }

  const badge = (
    <Badge variant="outline" title={origin}>
      <MessagesSquare />
      {t("annotationManager.fromConversation")}
    </Badge>
  );

  return isWebUrl(origin) ? (
    <a href={origin} target="_blank" rel="noreferrer" className="inline-flex hover:opacity-80">
      {badge}
    </a>
  ) : (
    badge
  );
}
