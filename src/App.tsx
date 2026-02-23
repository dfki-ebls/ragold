import { AlignLeft, Folder, Mail, User } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import type { Annotation } from "@/lib/types";

const contactInfo = import.meta.env.VITE_CONTACT_INFO;

export default function App() {
  const { t } = useTranslation();
  const annotations = useStore((s) => s.annotations);
  const documents = useStore((s) => s.documents);
  const author = useStore((s) => s.author);
  const project = useStore((s) => s.project);
  const description = useStore((s) => s.description);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("guide");
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const formRef = useRef<AnnotationFormRef>(null);
  const docFormRef = useRef<DocumentManagerRef>(null);

  const editingAnnotation = editingId ? annotations[editingId] : null;
  const annotationCount = Object.keys(annotations).length;
  const documentCount = Object.keys(documents).length;

  const hasUnsavedChanges = () => {
    if (activeTab === "annotations" && formRef.current?.hasUnsavedChanges()) {
      return true;
    }
    if (activeTab === "documents" && docFormRef.current?.hasUnsavedChanges()) {
      return true;
    }
    return false;
  };

  const switchTab = (value: string) => {
    setActiveTab(value);
    if (value !== "annotations") {
      setEditingId(null);
    }
  };

  const handleTabChange = (value: string) => {
    if (hasUnsavedChanges()) {
      setPendingTab(value);
      return;
    }
    switchTab(value);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleSubmit = (data: Annotation) => {
    const store = useStore.getState();
    if (editingId) {
      store.updateAnnotation(editingId, data);
      setEditingId(null);
    } else {
      store.addAnnotation(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
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
            {contactInfo && (
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t("faq.contact")}: {contactInfo}
              </p>
            )}
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-6 flex w-fit flex-wrap gap-1 h-auto mx-auto">
            <TabsTrigger value="guide">{t("tabs.guide")}</TabsTrigger>
            <TabsTrigger value="annotations">
              {t("tabs.annotations", { count: annotationCount })}
            </TabsTrigger>
            <TabsTrigger value="documents">
              {t("tabs.documents", { count: documentCount })}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="annotations">
            <div className="space-y-6">
              <AnnotationForm
                ref={formRef}
                annotation={editingAnnotation ?? undefined}
                onSubmit={handleSubmit}
                onCancel={editingId ? handleCancel : undefined}
              />
              <AnnotationList
                annotations={annotations}
                onEdit={(id) => {
                  setEditingId(id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onDelete={(id) => {
                  useStore.getState().deleteAnnotation(id);
                  if (editingId === id) {
                    setEditingId(null);
                  }
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <DocumentManager ref={docFormRef} />
          </TabsContent>

          <TabsContent value="guide">
            <FaqPage />
          </TabsContent>
        </Tabs>
      </main>

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
