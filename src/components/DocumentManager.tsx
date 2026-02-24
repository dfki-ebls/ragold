import dayjs from "dayjs";
import { FileText, PenLine, StickyNote, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { v1 as uuidv1 } from "uuid";
import { EmptyState } from "@/components/EmptyState";
import { ListItem } from "@/components/ListItem";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useConfirmAction } from "@/lib/useConfirmAction";
import { deleteFile, getFile, MAX_FILE_SIZE, putFile } from "@/lib/fileStorage";
import { useStore } from "@/lib/store";
import { cn, uniqueName } from "@/lib/utils";

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

export function DocumentManager({ scrollToTabs }: DocumentManagerProps) {
  const { t } = useTranslation();
  const documents = useStore((s) => s.documents);
  const addDocument = useStore((s) => s.addDocument);
  const updateDocument = useStore((s) => s.updateDocument);
  const deleteDocument = useStore((s) => s.deleteDocument);
  const documentFormDirty = useStore((s) => s.documentFormDirty);
  const setDocumentFormDirty = useStore((s) => s.setDocumentFormDirty);
  const { isConfirming, confirm } = useConfirmAction();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [scrollTrigger, setScrollTrigger] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reUploadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(editingId ? (documents[editingId]?.name ?? "") : "");
    setNotes(editingId ? (documents[editingId]?.notes ?? "") : "");
    setDocumentFormDirty(false);
  }, [editingId, documents, setDocumentFormDirty]);

  useEffect(() => {
    if (scrollTrigger > 0) {
      scrollToTabs?.();
    }
  }, [scrollTrigger, scrollToTabs]);

  const documentList = Object.entries(documents);
  const editingDoc = editingId ? documents[editingId] : null;

  const processFiles = async (files: File[]) => {
    const oversized = files.filter((f) => f.size > MAX_FILE_SIZE);
    const valid = files.filter((f) => f.size <= MAX_FILE_SIZE);

    if (oversized.length > 0) {
      toast.error(
        oversized
          .map((f) =>
            t("documentManager.fileTooLarge", {
              name: f.name,
              max: MAX_FILE_SIZE_MB,
            }),
          )
          .join("\n"),
      );
    }
    if (valid.length === 0) return;

    setUploading(true);
    try {
      const existingNames = Object.values(documents).map((d) => d.name);
      const results = await Promise.allSettled(
        valid.map(async (file) => {
          const dedupName = uniqueName(file.name, existingNames);
          existingNames.push(dedupName);
          const id = uuidv1();
          await putFile(id, file);
          addDocument(id, { name: dedupName, size: file.size });
          return dedupName;
        }),
      );

      const succeeded = results.filter(
        (r) => r.status === "fulfilled",
      ).length;
      const failed = results.filter(
        (r): r is PromiseRejectedResult => r.status === "rejected",
      );

      if (failed.length === 0) {
        toast.success(
          t("documentManager.uploadSuccess", { count: succeeded }),
        );
        setScrollTrigger((n) => n + 1);
      } else {
        const lines = failed.map((r, i) => {
          const idx = results.indexOf(r);
          const name = valid[idx]?.name ?? valid[i]?.name ?? "file";
          const message =
            r.reason instanceof Error ? r.reason.message : "Unknown error";
          return t("documentManager.uploadError", { name, message });
        });
        toast.error(lines.join("\n"));
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
      const dedupName = uniqueName(file.name, otherNames(editingId));
      updateDocument(editingId, { name: dedupName, size: file.size, notes });
      toast.success(t("documentManager.saved"));
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
    if (documentFormDirty) {
      setPendingEditId(id);
      return;
    }
    setEditingId(id);
    setScrollTrigger((n) => n + 1);
  };

  const handleDelete = (id: string) => {
    confirm(id, () => {
      deleteDocument(id);
      deleteFile(id).catch(() => {});
      if (editingId === id) setEditingId(null);
      toast.success(t("documentManager.deleteSuccess"));
    });
  };

  const handleCancelEdit = () => setEditingId(null);

  const otherNames = (excludeId: string) =>
    Object.entries(documents)
      .filter(([id]) => id !== excludeId)
      .map(([, d]) => d.name);

  const handleDownload = async (id: string) => {
    const doc = documents[id];
    if (!doc) return;
    const blob = await getFile(id);
    if (!blob) {
      toast.error(t("documentManager.downloadError"));
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.name;
    a.click();
    URL.revokeObjectURL(url);
  };

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
              <div className="space-y-2">
                <Label htmlFor="doc-name" className="flex items-center gap-2">
                  <PenLine className="w-4 h-4" />
                  {t("documentManager.name")}
                </Label>
                <Input
                  id="doc-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setDocumentFormDirty(true);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-notes" className="flex items-center gap-2">
                  <StickyNote className="w-4 h-4" />
                  {t("documentManager.notes")}
                </Label>
                <Textarea
                  id="doc-notes"
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    setDocumentFormDirty(true);
                  }}
                  placeholder={t("documentManager.notesPlaceholder")}
                  rows={3}
                />
              </div>
              <DropZone
                inputRef={reUploadInputRef}
                onChange={handleReUploadInputChange}
                hint={t("documentManager.dropzoneHintEdit")}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
                onDrop={handleDrop}
                disabled={uploading}
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    const dedupName = uniqueName(name, otherNames(editingId));
                    updateDocument(editingId, { ...editingDoc, name: dedupName, notes });
                    setDocumentFormDirty(false);
                    toast.success(t("documentManager.saved"));
                    setEditingId(null);
                  }}
                >
                  {t("common.save")}
                </Button>
                <Button variant="outline" onClick={handleCancelEdit}>
                  {t("common.cancel")}
                </Button>
              </div>
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
                  onDownload={() => handleDownload(id)}
                  deleteConfirm={isConfirming(id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{doc.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatFileSize(doc.size)}
                        {doc.updatedAt && (
                          <> · {t("common.lastEdited", { date: dayjs(doc.updatedAt).format("YYYY-MM-DD HH:mm") })}</>
                        )}
                      </div>
                      {doc.notes && (
                        <div className="text-xs text-muted-foreground truncate">
                          {doc.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </ListItem>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <AlertDialog
        open={pendingEditId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingEditId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("form.unsavedChangesTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("form.unsavedChanges")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setEditingId(pendingEditId);
                setPendingEditId(null);
                setScrollTrigger((n) => n + 1);
              }}
            >
              {t("common.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
