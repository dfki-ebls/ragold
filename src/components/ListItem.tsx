import { Download, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface ListItemProps {
  onEdit: () => void;
  onDelete: () => void;
  onDownload?: () => void;
  deleteConfirm: boolean;
  children: React.ReactNode;
}

export function ListItem({ onEdit, onDelete, onDownload, deleteConfirm, children }: ListItemProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
      {children}
      <div className="flex items-center gap-1 shrink-0">
        {deleteConfirm && (
          <span className="text-xs text-destructive mr-2">{t("common.clickAgain")}</span>
        )}
        {onDownload && (
          <Button variant="ghost" size="icon-sm" onClick={onDownload}>
            <Download className="w-4 h-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon-sm" onClick={onEdit}>
          <Pencil className="w-4 h-4" />
        </Button>
        <Button variant={deleteConfirm ? "destructive" : "ghost"} size="icon-sm" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
