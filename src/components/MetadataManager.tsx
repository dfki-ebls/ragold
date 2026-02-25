import { Folder, StickyNote, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";

export function MetadataManager() {
  const { t } = useTranslation();
  const author = useStore((s) => s.author);
  const project = useStore((s) => s.project);
  const notes = useStore((s) => s.notes);

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="author" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {t("metadata.author")} *
            </Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => useStore.getState().setAuthor(e.target.value)}
              placeholder={t("metadata.authorPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project" className="flex items-center gap-2">
              <Folder className="w-4 h-4" />
              {t("metadata.project")} *
            </Label>
            <Input
              id="project"
              value={project}
              onChange={(e) => useStore.getState().setProject(e.target.value)}
              placeholder={t("metadata.projectPlaceholder")}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes" className="flex items-center gap-2">
            <StickyNote className="w-4 h-4" />
            {t("metadata.notes")}
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => useStore.getState().setNotes(e.target.value)}
            placeholder={t("metadata.notesPlaceholder")}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
