import { AlignLeft, File, FileText } from "lucide-react";
import { forwardRef, useImperativeHandle, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { FieldError } from "@/components/FieldError";
import { ListItem } from "@/components/ListItem";
import { useConfirmAction } from "@/lib/useConfirmAction";
import { useFormChangeTracking } from "@/lib/useFormChangeTracking";
import { useFormErrors } from "@/lib/useFormErrors";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import type { Document } from "@/lib/types";

interface DocumentFormData {
  filename: string;
  description: string;
}

export interface DocumentManagerRef {
  hasUnsavedChanges: () => boolean;
}

const emptyForm: DocumentFormData = {
  filename: "",
  description: "",
};

interface DocumentManagerProps {
  scrollToTabs?: () => void;
}

export const DocumentManager = forwardRef<DocumentManagerRef, DocumentManagerProps>(
  function DocumentManager({ scrollToTabs }, ref) {
    const { t } = useTranslation();
    const documents = useStore((s) => s.documents);
    const addDocument = useStore((s) => s.addDocument);
    const updateDocument = useStore((s) => s.updateDocument);
    const deleteDocument = useStore((s) => s.deleteDocument);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<DocumentFormData>(emptyForm);
    const { errors, validate, clearErrors } =
      useFormErrors<keyof DocumentFormData>();
    const { isConfirming, confirm } = useConfirmAction();
    const { hasUnsavedChanges } = useFormChangeTracking(formData, emptyForm);

    useImperativeHandle(ref, () => ({ hasUnsavedChanges }));

    const documentList = Object.entries(documents);

    const handleValidate = (): boolean =>
      validate({
        filename: !formData.filename.trim()
          ? t("documentManager.filenameError")
          : undefined,
        description: !formData.description.trim()
          ? t("documentManager.descriptionError")
          : undefined,
      });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!handleValidate()) return;

      const doc: Document = {
        filename: formData.filename.trim(),
        description: formData.description.trim(),
      };

      if (editingId) {
        updateDocument(editingId, doc);
        setEditingId(null);
      } else {
        addDocument(doc);
      }
      setFormData(emptyForm);
      clearErrors();
    };

    const handleEdit = (id: string, doc: Document) => {
      setEditingId(id);
      setFormData({
        filename: doc.filename,
        description: doc.description,
      });
      scrollToTabs?.();
    };

    const handleDelete = (id: string) => {
      confirm(id, () => {
        deleteDocument(id);
        if (editingId === id) {
          setEditingId(null);
          setFormData(emptyForm);
        }
      });
    };

    const handleCancel = () => {
      setEditingId(null);
      setFormData(emptyForm);
    };

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId
                ? t("documentManager.titleEdit")
                : t("documentManager.titleNew")}
            </CardTitle>

          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="filename" className="flex items-center gap-2">
                  <File className="w-4 h-4" />
                  {t("documentManager.filename")} *
                </Label>
                <Input
                  id="filename"
                  value={formData.filename}
                  onChange={(e) =>
                    setFormData({ ...formData, filename: e.target.value })
                  }
                  placeholder={t("documentManager.filenamePlaceholder")}
                />
                <FieldError message={errors.filename} />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="doc-description"
                  className="flex items-center gap-2"
                >
                  <AlignLeft className="w-4 h-4" />
                  {t("documentManager.description")} *
                </Label>
                <Textarea
                  id="doc-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder={t("documentManager.descriptionPlaceholder")}
                  rows={4}
                />
                <FieldError message={errors.description} />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit">
                  {editingId ? t("common.update") : t("common.add")}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    {t("common.cancel")}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {t("documentManager.library", { count: documentList.length })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {documentList.length === 0 ? (
              <EmptyState
                message={t("documentManager.empty")}
                hint={t("documentManager.emptyHint")}
              />
            ) : (
              <div className="space-y-3">
                {documentList.map(([id, doc]) => (
                  <ListItem
                    key={id}
                    onEdit={() => handleEdit(id, doc)}
                    onDelete={() => handleDelete(id)}
                    deleteConfirm={isConfirming(id)}
                  >
                    <FileText className="w-5 h-5 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{doc.filename}</div>
                      <div className="text-sm text-muted-foreground mt-1 line-clamp-3">
                        {doc.description}
                      </div>
                    </div>
                  </ListItem>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  },
);
