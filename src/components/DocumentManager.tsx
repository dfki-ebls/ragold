import { FileText, PenLine, StickyNote, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
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
import { getFile, MAX_FILE_SIZE } from "@/lib/fileStorage";
import { useDirtyForms, useStore } from "@/lib/store";
import type { Annotation } from "@/lib/types";
import { downloadBlob, errorMessage, formatTimestamp } from "@/lib/utils";
import { cn } from "cn";

interface DocumentManagerProps {
  scrollToTabs?: () => void;
}

const MAX_FILE_SIZE_MB = MAX_FILE_SIZE / (1024 * 1024);

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Usage {
  annotations: number;
  passages: number;
}

const UNUSED: Usage = { annotations: 0, passages: 0 };

/** Number of annotations and passages that refer to each document. */
function documentUsage(annotations: Record<string, Annotation>): Map<string, Usage> {
  const usage = new Map<string, Usage>();

  for (const { passages } of Object.values(annotations)) {
    const ids = passages.map((p) => p.documentId);

    for (const id of new Set(ids)) {
      usage.set(id, {
        annotations: (usage.get(id)?.annotations ?? 0) + 1,
        passages: (usage.get(id)?.passages ?? 0) + ids.filter((other) => other === id).length,
      });
    }
  }

  return usage;
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
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex min-w-0 w-full max-w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
          isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <Upload className="w-8 h-8 text-muted-foreground" />
        <span className="max-w-full text-sm font-medium break-words">
          {t("documentManager.dropzoneLabel")}
        </span>
        <span className="max-w-full text-xs text-muted-foreground break-words">{hint}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        className="hidden"
        onChange={onChange}
        disabled={disabled}
      />
    </>
  );
}

export function DocumentManager({ scrollToTabs }: DocumentManagerProps) {
  const { t } = useTranslation();
  const documents = useStore((s) => s.documents);
  const annotations = useStore((s) => s.annotations);
  const uploadDocument = useStore((s) => s.uploadDocument);
  const replaceDocumentFile = useStore((s) => s.replaceDocumentFile);
  const updateDocument = useStore((s) => s.updateDocument);
  const deleteDocument = useStore((s) => s.deleteDocument);
  const documentFormDirty = useDirtyForms((s) => s.document);
  const usage = useMemo(() => documentUsage(annotations), [annotations]);
  const usageOf = (id: string) => usage.get(id) ?? UNUSED;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const scrollPendingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reUploadInputRef = useRef<HTMLInputElement>(null);

  const startEditing = (id: string | null) => {
    setEditingId(id);
    setName(id ? (documents[id]?.name ?? "") : "");
    setNotes(id ? (documents[id]?.notes ?? "") : "");
    useDirtyForms.setState({ document: false });
  };

  useEffect(() => {
    if (scrollPendingRef.current) {
      scrollPendingRef.current = false;
      scrollToTabs?.();
    }
  });

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
      const results = await Promise.allSettled(valid.map((file) => uploadDocument(file)));
      const duplicates: string[] = [];
      const errors: string[] = [];
      let added = 0;

      results.forEach((result, i) => {
        const { name } = valid[i];

        if (result.status === "rejected") {
          errors.push(
            t("documentManager.uploadError", { name, message: errorMessage(result.reason) }),
          );
        } else if (result.value.duplicate) {
          const existing = useStore.getState().documents[result.value.id]?.name ?? "";
          duplicates.push(t("documentManager.duplicate", { name, existing }));
        } else {
          added++;
        }
      });

      if (duplicates.length > 0) {
        toast.info(duplicates.join("\n"));
      }

      if (errors.length > 0) {
        toast.error(errors.join("\n"));
      } else if (added > 0) {
        toast.success(t("documentManager.uploadSuccess", { count: added }));
        scrollPendingRef.current = true;
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
      await replaceDocumentFile(editingId, file);
      updateDocument(editingId, { notes });
      toast.success(t("documentManager.saved"));
      startEditing(null);
    } catch (err) {
      toast.error(
        t("documentManager.uploadError", {
          name: file.name,
          message: errorMessage(err),
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
    startEditing(id);
    scrollPendingRef.current = true;
  };

  const removeDocument = (id: string) => {
    deleteDocument(id);
    if (editingId === id) startEditing(null);
    toast.success(t("documentManager.deleteSuccess"));
  };

  const handleCancelEdit = () => startEditing(null);

  const handleDownload = async (id: string) => {
    const doc = documents[id];
    if (!doc) return;
    const blob = await getFile(id);
    if (!blob) {
      toast.error(t("documentManager.downloadError"));
      return;
    }
    downloadBlob(blob, doc.name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      if (editingId) {
        void handleReUpload(files[0]);
      } else {
        void processFiles(files);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) void processFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReUploadInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleReUpload(file);
    if (reUploadInputRef.current) reUploadInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? t("documentManager.titleEdit") : t("documentManager.titleNew")}
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full">
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
                    useDirtyForms.setState({ document: true });
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
                    useDirtyForms.setState({ document: true });
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
                    updateDocument(editingId, { name, notes });
                    toast.success(t("documentManager.saved"));
                    startEditing(null);
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
              hint={t("documentManager.dropzoneHint", { max: MAX_FILE_SIZE_MB })}
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
          <CardTitle>{t("documentManager.library", { count: documentList.length })}</CardTitle>
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
                  onDelete={() => setPendingDeleteId(id)}
                  onDownload={() => handleDownload(id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{doc.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatFileSize(doc.size)} ·{" "}
                        <span title={t("documentManager.fingerprintHint")} className="font-mono">
                          {t("documentManager.fingerprint", { hash: doc.sha256.slice(0, 12) })}
                        </span>
                        {usage.has(id) && (
                          <> · {t("documentManager.usage", { count: usageOf(id).passages })}</>
                        )}
                        {doc.updatedAt && (
                          <> · {t("common.lastEdited", { date: formatTimestamp(doc.updatedAt) })}</>
                        )}
                      </div>
                      {doc.notes && (
                        <div className="text-xs text-muted-foreground truncate">{doc.notes}</div>
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
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("documentManager.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDeleteId &&
                t(
                  usage.has(pendingDeleteId)
                    ? "documentManager.deleteUsed"
                    : "documentManager.deleteUnused",
                  {
                    name: documents[pendingDeleteId]?.name ?? "",
                    ...usageOf(pendingDeleteId),
                  },
                )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (pendingDeleteId) removeDocument(pendingDeleteId);
                setPendingDeleteId(null);
              }}
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={pendingEditId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingEditId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("form.unsavedChangesTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("form.unsavedChanges")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                startEditing(pendingEditId);
                setPendingEditId(null);
                scrollPendingRef.current = true;
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
