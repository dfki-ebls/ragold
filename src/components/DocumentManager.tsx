import { useState } from "react";
import { FileText, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import type { Document } from "@/lib/types";

interface DocumentFormData {
  filename: string;
  description: string;
}

const emptyForm: DocumentFormData = {
  filename: "",
  description: "",
};

export function DocumentManager() {
  const documents = useStore((s) => s.documents);
  const addDocument = useStore((s) => s.addDocument);
  const updateDocument = useStore((s) => s.updateDocument);
  const deleteDocument = useStore((s) => s.deleteDocument);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<DocumentFormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const documentList = Object.entries(documents);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.filename.trim() || !formData.description.trim()) return;

    const doc: Document = {
      filename: formData.filename.trim(),
      description: formData.description.trim(),
    };

    if (editingId) {
      updateDocument(editingId, doc);
      setEditingId(null);
    } else {
      addDocument(doc);
    }
    setFormData(emptyForm);
  };

  const handleEdit = (id: string, doc: Document) => {
    setEditingId(id);
    setFormData({
      filename: doc.filename,
      description: doc.description,
    });
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteDocument(id);
      setDeleteConfirm(null);
      if (editingId === id) {
        setEditingId(null);
        setFormData(emptyForm);
      }
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(emptyForm);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? "Dokument bearbeiten" : "Neues Dokument"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="filename">Dateiname *</Label>
              <Input
                id="filename"
                value={formData.filename}
                onChange={(e) =>
                  setFormData({ ...formData, filename: e.target.value })
                }
                placeholder="dokument.txt"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc-description">Beschreibung *</Label>
              <Textarea
                id="doc-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Beschreibung des Dokuments..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={!formData.filename.trim() || !formData.description.trim()}
              >
                {editingId ? "Aktualisieren" : "Hinzufügen"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Abbrechen
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dokumentbibliothek ({documentList.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {documentList.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Noch keine Dokumente vorhanden.
              Fügen Sie oben ein Dokument hinzu.
            </p>
          ) : (
            <div className="space-y-3">
              {documentList.map(([id, doc]) => (
                <div
                  key={id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                >
                  <FileText className="w-5 h-5 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{doc.filename}</div>
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-3">
                      {doc.description}
                    </div>
                    <div className="text-xs text-muted-foreground/60 mt-1 font-mono">
                      {id.slice(0, 8)}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleEdit(id, doc)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={deleteConfirm === id ? "destructive" : "ghost"}
                      size="icon-sm"
                      onClick={() => handleDelete(id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
