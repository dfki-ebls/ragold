import { AlignLeft, Folder, User } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AnnotationForm,
  type AnnotationFormRef,
} from "@/components/AnnotationForm";
import { AnnotationList } from "@/components/AnnotationList";
import {
  DocumentManager,
  type DocumentManagerRef,
} from "@/components/DocumentManager";
import { FaqPage } from "@/components/FaqPage";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import type { Annotation } from "@/lib/types";

export default function App() {
  const { t } = useTranslation();
  const annotations = useStore((s) => s.annotations);
  const documents = useStore((s) => s.documents);
  const author = useStore((s) => s.author);
  const project = useStore((s) => s.project);
  const description = useStore((s) => s.description);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("guide");
  const formRef = useRef<AnnotationFormRef>(null);
  const docFormRef = useRef<DocumentManagerRef>(null);

  const editingAnnotation = editingId ? annotations[editingId] : null;
  const annotationCount = Object.keys(annotations).length;
  const documentCount = Object.keys(documents).length;

  const handleTabChange = (value: string) => {
    if (
      activeTab === "new" &&
      value !== "new" &&
      formRef.current?.hasUnsavedChanges()
    ) {
      const confirmed = window.confirm(t("form.unsavedChanges"));
      if (!confirmed) return;
    }
    if (
      activeTab === "documents" &&
      value !== "documents" &&
      docFormRef.current?.hasUnsavedChanges()
    ) {
      const confirmed = window.confirm(t("form.unsavedChanges"));
      if (!confirmed) return;
    }
    setActiveTab(value);
    if (value === "manage") {
      setEditingId(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setActiveTab("manage");
  };

  const handleSubmit = (data: Annotation) => {
    const store = useStore.getState();
    if (editingId) {
      store.updateAnnotation(editingId, data);
      setEditingId(null);
      setActiveTab("manage");
    } else {
      store.addAnnotation(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{t("metadata.title")}</h1>
          <p className="text-muted-foreground">{t("metadata.description")}</p>
        </div>

        <Card className="mb-8">
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
                  onChange={(e) =>
                    useStore.getState().setAuthor(e.target.value)
                  }
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
                  onChange={(e) =>
                    useStore.getState().setProject(e.target.value)
                  }
                  placeholder={t("metadata.projectPlaceholder")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <AlignLeft className="w-4 h-4" />
                {t("metadata.datasetDescription")}
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) =>
                  useStore.getState().setDescription(e.target.value)
                }
                placeholder={t("metadata.datasetDescriptionPlaceholder")}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              {t("metadata.metadataInfo")}
            </p>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-6 flex w-fit flex-wrap gap-1 h-auto mx-auto">
            <TabsTrigger value="guide">{t("tabs.guide")}</TabsTrigger>
            <TabsTrigger value="new">
              {editingId ? t("tabs.editing") : t("tabs.newAnnotation")}
            </TabsTrigger>
            <TabsTrigger value="manage">
              {t("tabs.annotations", { count: annotationCount })}
            </TabsTrigger>
            <TabsTrigger value="documents">
              {t("tabs.documents", { count: documentCount })}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new">
            <AnnotationForm
              ref={formRef}
              annotation={editingAnnotation ?? undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </TabsContent>

          <TabsContent value="manage">
            <AnnotationList
              annotations={annotations}
              onEdit={(id) => {
                setEditingId(id);
                setActiveTab("new");
              }}
              onDelete={(id) => useStore.getState().deleteAnnotation(id)}
            />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentManager ref={docFormRef} />
          </TabsContent>

          <TabsContent value="guide">
            <FaqPage />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
