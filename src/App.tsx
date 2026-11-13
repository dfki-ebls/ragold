import { type RefObject, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { AnnotationManager } from "@/components/AnnotationManager";
import { DocumentManager } from "@/components/DocumentManager";
import { FaqPage } from "@/components/FaqPage";
import Header from "@/components/Header";
import { MetadataManager } from "@/components/MetadataManager";
import { RecoveryScreen } from "@/components/RecoveryScreen";
import { TransferDialog } from "@/components/TransferDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore, useView } from "@/lib/store";

function scrollToStart(ref: RefObject<HTMLElement | null>) {
  requestAnimationFrame(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

export default function App() {
  const { t } = useTranslation();
  const annotations = useStore((s) => s.annotations);
  const documents = useStore((s) => s.documents);
  const loadError = useStore((s) => s.loadError);

  const activeTab = useView((s) => s.tab);
  const tabsRef = useRef<HTMLDivElement>(null);

  const scrollToTabs = () => scrollToStart(tabsRef);

  // Bring the form into view whenever an annotation is loaded into it, including by an import.
  useEffect(
    () =>
      useView.subscribe((state, prev) => {
        if (state.editingId && state.editingId !== prev.editingId) {
          scrollToStart(tabsRef);
        }
      }),
    [],
  );

  if (loadError) {
    return (
      <RecoveryScreen
        title={t("loadError.title")}
        description={t("loadError.description")}
        details={loadError}
      />
    );
  }

  const annotationCount = Object.keys(annotations).length;
  const documentCount = Object.keys(documents).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <MetadataManager />

        <Tabs value={activeTab} onValueChange={(tab: string) => useView.setState({ tab })}>
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
            <DocumentManager scrollToTabs={scrollToTabs} />
          </TabsContent>

          <TabsContent value="annotations">
            <AnnotationManager scrollToTabs={scrollToTabs} />
          </TabsContent>
        </Tabs>
      </main>

      <TransferDialog />
    </div>
  );
}
