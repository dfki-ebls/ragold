import { Download, Globe, Loader2, RotateCcw, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
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
import type { SupportedLanguage } from "@/i18n";
import { resetApp } from "@/lib/fileStorage";
import { useStore } from "@/lib/store";
import { useConfirmAction } from "@/lib/useConfirmAction";

const languageLabels: Record<SupportedLanguage, string> = {
  de: "DE",
  en: "EN",
};

export default function Header() {
  const { t } = useTranslation();
  const annotations = useStore((s) => s.annotations);
  const author = useStore((s) => s.author);
  const project = useStore((s) => s.project);
  const language = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isConfirming, confirm } = useConfirmAction();
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const annotationCount = Object.keys(annotations).length;
  const isMetadataComplete = author.trim() && project.trim();

  const handleClear = () => {
    confirm("reset", () => resetApp());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImportFile(file);
  };

  const handleImportConfirm = async () => {
    const file = pendingImportFile;
    setPendingImportFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (!file) return;

    try {
      const count = await useStore.getState().importAnnotations(file);
      if (count > 0) {
        toast.success(t("header.importSuccess", { count }));
      } else {
        toast.warning(t("header.importEmpty"));
      }
    } catch (err) {
      toast.error(
        t("header.importError", {
          message: err instanceof Error ? err.message : "Unknown error",
        }),
      );
    }
  };

  const handleImportCancel = () => {
    setPendingImportFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleExport = async () => {
    if (!isMetadataComplete) {
      toast.warning(t("header.exportDisabledMeta"));
      return;
    }
    if (annotationCount === 0) {
      toast.warning(t("header.exportDisabledEmpty"));
      return;
    }
    setIsExporting(true);
    try {
      await useStore.getState().exportAnnotations();
    } catch (err) {
      toast.error(
        t("header.exportError", {
          message: err instanceof Error ? err.message : "Unknown error",
        }),
      );
    } finally {
      setIsExporting(false);
    }
  };

  const toggleLanguage = () => {
    const next: SupportedLanguage = language === "de" ? "en" : "de";
    setLanguage(next);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-lg font-semibold">{t("header.title")}</h1>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              title={
                language === "de" ? "Switch to English" : "Auf Deutsch wechseln"
              }
            >
              <Globe className="w-4 h-4 mr-2" />
              {languageLabels[language]}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              className="hidden"
              id="import-file"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              title={t("header.importTooltip")}
            >
              <Upload className="w-4 h-4 mr-2" />
              {t("common.import")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
              title={
                !isMetadataComplete
                  ? t("header.exportDisabledMeta")
                  : annotationCount === 0
                    ? t("header.exportDisabledEmpty")
                    : t("header.exportTooltip")
              }
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {t("common.export")}
            </Button>
            <Button
              variant={isConfirming("reset") ? "destructive" : "ghost"}
              size="sm"
              onClick={handleClear}
              title={t("header.resetTooltip")}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {isConfirming("reset") ? t("common.confirm") : t("common.reset")}
            </Button>
          </div>
        </div>
      </header>

      <AlertDialog
        open={pendingImportFile !== null}
        onOpenChange={(open) => {
          if (!open) handleImportCancel();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.import")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("header.importConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleImportConfirm}>
              {t("common.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
