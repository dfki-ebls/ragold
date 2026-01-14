import { Download, RotateCcw, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export default function Header() {
  const annotations = useStore((s) => s.annotations);
  const documents = useStore((s) => s.documents);
  const author = useStore((s) => s.author);
  const project = useStore((s) => s.project);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [clearConfirm, setClearConfirm] = useState(false);

  const annotationCount = Object.keys(annotations).length;
  const documentCount = Object.keys(documents).length;
  const totalCount = annotationCount + documentCount;
  const isMetadataComplete = author.trim() && project.trim();
  const canExport = annotationCount > 0 && isMetadataComplete;

  const handleClear = () => {
    if (clearConfirm) {
      useStore.getState().clearAll();
      setClearConfirm(false);
    } else {
      setClearConfirm(true);
      setTimeout(() => setClearConfirm(false), 3000);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const count = await useStore.getState().importAnnotations(file);
      if (count > 0) {
        alert(`${count} neue Annotation(en) importiert. Dokumente wurden ebenfalls importiert.`);
      } else {
        alert("Keine neuen Annotationen gefunden (alle bereits vorhanden). Dokumente wurden ggf. importiert.");
      }
    } catch (err) {
      alert(
        `Import fehlgeschlagen: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`,
      );
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleExport = () => {
    if (!canExport) return;
    useStore.getState().exportAnnotations();
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">RAGold</h1>

        <div className="flex items-center gap-2">
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
            title="Importiert Annotationen und Dokumente aus JSON"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={!canExport}
            title={
              !isMetadataComplete
                ? "Autor und Projekt müssen ausgefüllt sein"
                : annotationCount === 0
                  ? "Keine Annotationen vorhanden"
                  : "Exportiert Annotationen und Dokumente als JSON"
            }
          >
            <Download className="w-4 h-4 mr-2" />
            Export ({annotationCount})
          </Button>
          <Button
            variant={clearConfirm ? "destructive" : "ghost"}
            size="sm"
            onClick={handleClear}
            disabled={totalCount === 0}
            title={
              totalCount === 0
                ? "Keine Daten vorhanden"
                : "Löscht alle Annotationen und Dokumente"
            }
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {clearConfirm ? "Bestätigen" : "Reset"}
          </Button>
        </div>
      </div>
    </header>
  );
}
