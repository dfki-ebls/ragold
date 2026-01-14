import { useRef, useState } from "react";
import { AnnotationForm, type AnnotationFormRef } from "@/components/AnnotationForm";
import { AnnotationList } from "@/components/AnnotationList";
import { DocumentManager } from "@/components/DocumentManager";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import type { Annotation } from "@/lib/types";

export default function App() {
  const annotations = useStore((s) => s.annotations);
  const documents = useStore((s) => s.documents);
  const author = useStore((s) => s.author);
  const project = useStore((s) => s.project);
  const description = useStore((s) => s.description);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("new");
  const formRef = useRef<AnnotationFormRef>(null);

  const editingAnnotation = editingId ? annotations[editingId] : null;
  const annotationCount = Object.keys(annotations).length;
  const documentCount = Object.keys(documents).length;

  const handleTabChange = (value: string) => {
    if (value === "manage" && activeTab === "new" && formRef.current?.hasUnsavedChanges()) {
      const confirmed = window.confirm(
        "Es gibt ungespeicherte Änderungen. Möchten Sie wirklich wechseln?"
      );
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
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            Annotation von RAG-Beispielen
          </h1>
          <p className="text-muted-foreground">
            Erstellen Sie Beispiele für Nutzeranfragen an ein Chat-System, das
            Antworten basierend auf Dokumenteninhalten generiert
            (Retrieval-Augmented Generation).
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="author">Autor *</Label>
                <Input
                  id="author"
                  value={author}
                  onChange={(e) =>
                    useStore.getState().setAuthor(e.target.value)
                  }
                  placeholder="Name des Annotators"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project">Projekt *</Label>
                <Input
                  id="project"
                  value={project}
                  onChange={(e) =>
                    useStore.getState().setProject(e.target.value)
                  }
                  placeholder="Projektname"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) =>
                  useStore.getState().setDescription(e.target.value)
                }
                placeholder="Kurze Beschreibung des Datensatzes (optional)"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Diese Metadaten gelten für alle Annotationen und Dokumente.
              Der Export enthält sowohl Annotationen als auch Dokumente.
            </p>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-6">
            <TabsTrigger value="new">
              {editingId ? "Bearbeiten" : "Neue Annotation"}
            </TabsTrigger>
            <TabsTrigger value="manage">
              Annotationen ({annotationCount})
            </TabsTrigger>
            <TabsTrigger value="documents">
              Dokumente ({documentCount})
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
            <DocumentManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
