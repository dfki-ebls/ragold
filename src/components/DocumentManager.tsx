import { FileText, Upload } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { v1 as uuidv1 } from "uuid";
import { EmptyState } from "@/components/EmptyState";
import { ListItem } from "@/components/ListItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConfirmAction } from "@/lib/useConfirmAction";
import { deleteFile, MAX_FILE_SIZE, putFile } from "@/lib/fileStorage";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export interface DocumentManagerRef {
  hasUnsavedChanges: () => boolean;
}

interface DocumentManagerProps {
  scrollToTabs?: () => void;
}

const MAX_FILE_SIZE_MB = MAX_FILE_SIZE / (1024 * 1024);

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DropZone({
  inputRef,
  multiple,
  onChange,
  hint,
  isDragging,
  setIsDragging,
  onDrop,
  disabled,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  multiple?: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  hint: string;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  onDrop: React.DragEventHandler;
  disabled: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <Upload className="w-8 h-8 text-muted-foreground" />
      <span className="text-sm font-medium">
        {t("documentManager.dropzoneLabel")}
      </span>
      <span className="text-xs text-muted-foreground">{hint}</span>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        className="hidden"
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

export const DocumentManager = forwardRef<
  DocumentManagerRef,
  DocumentManagerProps
>(function DocumentManager({ scrollToTabs }, ref) {
  const { t } = useTranslation();
  const documents = useStore((s) => s.documents);
  const addDocument = useStore((s) => s.addDocument);
  const updateDocument = useStore((s) => s.updateDocument);
  const deleteDocument = useStore((s) => s.deleteDocument);
  const { isConfirming, confirm } = useConfirmAction();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reUploadInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({ hasUnsavedChanges: () => false }));

  const documentList = Object.entries(documents);
  const editingDoc = editingId ? documents[editingId] : null;

  const processFiles = async (files: File[]) => {
    const oversized = files.filter((f) => f.size > MAX_FILE_SIZE);
    const valid = files.filter((f) => f.size <= MAX_FILE_SIZE);

    for (const f of oversized) {
      toast.error(
        t("documentManager.fileTooLarge", {
          name: f.name,
          max: MAX_FILE_SIZE_MB,
        }),
      );
    }
    if (valid.length === 0) return;

    setUploading(true);
    try {
      const results = await Promise.allSettled(
        valid.map(async (file) => {
          const id = uuidv1();
          await putFile(id, file);
          addDocument(id, { name: file.name, size: file.size });
          return file.name;
        }),
      );

      const succeeded = results.filter(
        (r) => r.status === "fulfilled",
      ).length;
      const failed = results.filter(
        (r): r is PromiseRejectedResult => r.status === "rejected",
      );

      if (succeeded > 0) {
        toast.success(
          t("documentManager.uploadSuccess", { count: succeeded }),
        );
      }
      for (const [i, r] of failed.entries()) {
        const name = valid[results.indexOf(r)]?.name ?? valid[i]?.name ?? "file";
        toast.error(
          t("documentManager.uploadError", {
            name,
            message:
              r.reason instanceof Error ? r.reason.message : "Unknown error",
          }),
        );
      }
    } finally {
      setUploading(false);
    }
  };

  const handleReUpload = async (file: File) => {
    if (!editingId) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        t("documentManager.fileTooLarge", {
          name: file.name,
          max: MAX_FILE_SIZE_MB,
        }),
      );
      return;
    }
    setUploading(true);
    try {
      await putFile(editingId, file);
      updateDocument(editingId, { name: file.name, size: file.size });
      toast.success(t("documentManager.reUploadSuccess"));
      setEditingId(null);
    } catch (err) {
      toast.error(
        t("documentManager.uploadError", {
          name: file.name,
          message: err instanceof Error ? err.message : "Unknown error",
        }),
      );
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    scrollToTabs?.();
  };

  const handleDelete = (id: string) => {
    confirm(id, () => {
      deleteDocument(id);
      deleteFile(id).catch(() => {});
      if (editingId === id) setEditingId(null);
    });
  };

  const handleCancelEdit = () => setEditingId(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      if (editingId) {
        handleReUpload(files[0]);
      } else {
        processFiles(files);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) processFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReUploadInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) handleReUpload(file);
    if (reUploadInputRef.current) reUploadInputRef.current.value = "";
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
          {editingId && editingDoc ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t("documentManager.currentFile")}:{" "}
                <strong>{editingDoc.name}</strong>
              </p>
              <DropZone
                inputRef={reUploadInputRef}
                onChange={handleReUploadInputChange}
                hint={t("documentManager.dropzoneHintEdit")}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
                onDrop={handleDrop}
                disabled={uploading}
              />
              <Button variant="outline" onClick={handleCancelEdit}>
                {t("common.cancel")}
              </Button>
            </div>
          ) : (
            <DropZone
              inputRef={fileInputRef}
              multiple
              onChange={handleFileInputChange}
              hint={t("documentManager.dropzoneHint")}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              onDrop={handleDrop}
              disabled={uploading}
            />
          )}
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
                  onEdit={() => handleEdit(id)}
                  onDelete={() => handleDelete(id)}
                  deleteConfirm={isConfirming(id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{doc.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatFileSize(doc.size)}
                      </div>
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
});
