import dayjs from "dayjs";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AnnotationManager,
  type AnnotationManagerRef,
} from "@/components/AnnotationManager";
import {
  DocumentManager,
  type DocumentManagerRef,
} from "@/components/DocumentManager";
import { FaqPage } from "@/components/FaqPage";
import Header from "@/components/Header";
import { MetadataManager } from "@/components/MetadataManager";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { clearAllFiles } from "@/lib/fileStorage";
import {
  clearPendingMigrationData,
  getPendingMigrationData,
  useStore,
} from "@/lib/store";
import { SCHEMA_VERSION } from "@/lib/types";

export default function App() {
  const { t } = useTranslation();
  const annotations = useStore((s) => s.annotations);
  const documents = useStore((s) => s.documents);

  const [migrationData, setMigrationData] = useState<unknown>(
    getPendingMigrationData,
  );
  const [activeTab, setActiveTab] = useState("guide");
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const docFormRef = useRef<DocumentManagerRef>(null);
  const annotationFormRef = useRef<AnnotationManagerRef>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const scrollToTabs = () => {
    requestAnimationFrame(() => {
      tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const annotationCount = Object.keys(annotations).length;
  const documentCount = Object.keys(documents).length;

  const hasUnsavedChanges = () => {
    if (activeTab === "annotations" && annotationFormRef.current?.hasUnsavedChanges()) {
      return true;
    }
    if (activeTab === "documents" && docFormRef.current?.hasUnsavedChanges()) {
      return true;
    }
    return false;
  };

  const oldVersion =
    migrationData &&
    typeof migrationData === "object" &&
    "version" in migrationData
      ? (migrationData as { version: number }).version
      : 0;

  const dismissMigration = () => {
    clearPendingMigrationData();
    clearAllFiles();
    setMigrationData(null);
  };

  const handleDownloadMigration = () => {
    const blob = new Blob([JSON.stringify(migrationData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ragold-backup-${dayjs().format("YYYYMMDD-HHmmss")}.json`;
    link.click();
    URL.revokeObjectURL(url);
    dismissMigration();
  };

  const switchTab = (value: string) => {
    setActiveTab(value);
  };

  const handleTabChange = (value: string) => {
    if (hasUnsavedChanges()) {
      setPendingTab(value);
      return;
    }
    switchTab(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <MetadataManager />

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList ref={tabsRef} className="mb-4 flex w-fit flex-wrap gap-1 h-auto mx-auto">
            <TabsTrigger value="guide">{t("tabs.guide")}</TabsTrigger>
            <TabsTrigger value="documents">
              {t("tabs.documents", { count: documentCount })}
            </TabsTrigger>
            <TabsTrigger value="annotations">
              {t("tabs.annotations", { count: annotationCount })}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="guide">
            <FaqPage />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentManager ref={docFormRef} scrollToTabs={scrollToTabs} />
          </TabsContent>

          <TabsContent value="annotations">
            <AnnotationManager ref={annotationFormRef} scrollToTabs={scrollToTabs} />
          </TabsContent>
        </Tabs>
      </main>

      <AlertDialog open={migrationData !== null}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("schemaMigration.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("schemaMigration.description", {
                old: oldVersion,
                new: SCHEMA_VERSION,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={dismissMigration}>
              {t("schemaMigration.continueWithout")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDownloadMigration}>
              {t("schemaMigration.download")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={pendingTab !== null}
        onOpenChange={(open) => {
          if (!open) setPendingTab(null);
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
                if (pendingTab) switchTab(pendingTab);
                setPendingTab(null);
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
