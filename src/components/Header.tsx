import { Download, Globe, RotateCcw, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { SupportedLanguage } from "@/i18n";
import { useStore } from "@/lib/store";

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
  const [clearConfirm, setClearConfirm] = useState(false);

  const annotationCount = Object.keys(annotations).length;
  const isMetadataComplete = author.trim() && project.trim();

  const handleClear = () => {
    if (clearConfirm) {
      localStorage.removeItem("ragold-store");
      window.location.reload();
    } else {
      setClearConfirm(true);
      setTimeout(() => setClearConfirm(false), 3000);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm(t("header.importConfirm"))) {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    try {
      const count = await useStore.getState().importAnnotations(file);
      if (count > 0) {
        alert(t("header.importSuccess", { count }));
      } else {
        alert(t("header.importEmpty"));
      }
    } catch (err) {
      alert(
        t("header.importError", {
          message: err instanceof Error ? err.message : "Unknown error",
        }),
      );
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleExport = () => {
    if (!isMetadataComplete) {
      alert(t("header.exportDisabledMeta"));
      return;
    }
    if (annotationCount === 0) {
      alert(t("header.exportDisabledEmpty"));
      return;
    }
    useStore.getState().exportAnnotations();
  };

  const toggleLanguage = () => {
    const next: SupportedLanguage = language === "de" ? "en" : "de";
    setLanguage(next);
  };

  return (
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
            accept=".json"
            onChange={handleImport}
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
            title={
              !isMetadataComplete
                ? t("header.exportDisabledMeta")
                : annotationCount === 0
                  ? t("header.exportDisabledEmpty")
                  : t("header.exportTooltip")
            }
          >
            <Download className="w-4 h-4 mr-2" />
            {t("common.export")} ({annotationCount})
          </Button>
          <Button
            variant={clearConfirm ? "destructive" : "ghost"}
            size="sm"
            onClick={handleClear}
            title={t("header.resetTooltip")}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {clearConfirm ? t("common.confirm") : t("common.reset")}
          </Button>
        </div>
      </div>
    </header>
  );
}
