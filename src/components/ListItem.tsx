import { Copy, Download, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { IconButton } from "@/components/IconButton";

interface ListItemProps {
  onEdit: () => void;
  onDelete: () => void;
  onDownload?: () => void;
  onCopy?: () => void;
  /** Highlights the delete button while it awaits a second click. */
  deleteConfirm?: boolean;
  children: React.ReactNode;
  /** Full-width content rendered below the overview row, not capped by the action buttons. */
  footer?: React.ReactNode;
}

export function ListItem({
  onEdit,
  onDelete,
  onDownload,
  onCopy,
  deleteConfirm,
  children,
  footer,
}: ListItemProps) {
  const { t } = useTranslation();

  return (
    <div className="p-3 rounded-lg border bg-card">
      <div className="flex items-start gap-3">
        {children}
        <div className="flex items-center gap-1 shrink-0">
          {deleteConfirm && (
            <span className="text-xs text-destructive mr-2">{t("common.clickAgain")}</span>
          )}
          {onCopy && (
            <IconButton label={t("common.copy")} onClick={onCopy}>
              <Copy />
            </IconButton>
          )}
          {onDownload && (
            <IconButton label={t("common.download")} onClick={onDownload}>
              <Download />
            </IconButton>
          )}
          <IconButton label={t("common.edit")} onClick={onEdit}>
            <Pencil />
          </IconButton>
          <IconButton
            label={t("common.delete")}
            variant={deleteConfirm ? "destructive" : "ghost"}
            onClick={onDelete}
          >
            <Trash2 />
          </IconButton>
        </div>
      </div>
      {footer && <div className="mt-3">{footer}</div>}
    </div>
  );
}
