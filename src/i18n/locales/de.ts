import type { TranslationKeys } from "./en";

export const de: TranslationKeys = {
  common: {
    save: "Speichern",
    cancel: "Abbrechen",
    edit: "Bearbeiten",
    delete: "Löschen",
    confirm: "Bestätigen",
    reset: "Reset",
    import: "Import",
    export: "Export",
    add: "Hinzufügen",
    update: "Aktualisieren",
  },
  header: {
    title: "RAGold",
    importTooltip:
      "Importiert Annotationen und Dokumente aus JSON (ersetzt vorhandene Daten)",
    importConfirm:
      "Der Import ersetzt alle vorhandenen Annotationen und Dokumente. Dies kann nicht rückgängig gemacht werden. Fortfahren?",
    exportTooltip: "Exportiert Annotationen und Dokumente als JSON",
    exportDisabledMeta: "Autor und Projekt müssen ausgefüllt sein",
    exportDisabledEmpty: "Keine Annotationen vorhanden",
    resetTooltip: "Setzt die App auf den Ausgangszustand zurück",
    importSuccess: "Import abgeschlossen. {{count}} Annotation(en) geladen.",
    importEmpty: "Import abgeschlossen. Die Datei enthielt keine Annotationen.",
    importError: "Import fehlgeschlagen: {{message}}",
  },
  metadata: {
    author: "Autor",
    authorPlaceholder: "Name des Annotators",
    project: "Projekt",
    projectPlaceholder: "Projektname",
    datasetDescription: "Beschreibung (optional)",
    datasetDescriptionPlaceholder: "Kurze Beschreibung des Datensatzes",
    metadataInfo:
      "Diese Metadaten gelten für alle Annotationen und Dokumente. Der Export enthält sowohl Annotationen als auch Dokumente.",
  },
  tabs: {
    newAnnotation: "Neue Annotation",
    editing: "Bearbeiten",
    annotations: "Annotationen ({{count}})",
    documents: "Dokumente ({{count}})",
    guide: "Anleitung",
  },
  form: {
    titleNew: "Neue Annotation erstellen",
    titleEdit: "Annotation bearbeiten",
    description:
      "Erstellen Sie ein Beispiel für eine Nutzeranfrage an ein RAG-System mit den relevanten Dokumenten und der erwarteten Antwort.",
    query: "Nutzeranfrage",
    queryDescription:
      "Formulieren Sie die Frage so, wie ein Nutzer sie in ein Chat-System eingeben würde.",
    queryPlaceholder: "Wie beantrage ich Urlaub im Self-Service-Portal?",
    queryError: "Nutzeranfrage ist erforderlich",
    queryType: "Fragetyp",
    queryTypeDescription: "Wie wird die Frage durch den Kontext beantwortet?",
    response: "Erwartete Antwort",
    responseDescription:
      "Formulieren Sie die ideale Antwort, die das Chat-System geben sollte.",
    responsePlaceholder: "Antwort auf die Nutzeranfrage...",
    responseError: "Erwartete Antwort ist erforderlich",
    notes: "Anmerkungen (optional)",
    notesDescription:
      "Besonderheiten wie mehrdeutige Begriffe, Zeitabhängigkeit, besondere Formulierungen.",
    notesPlaceholder: "Optionale Hinweise...",
    unsavedChanges:
      "Es gibt ungespeicherte Änderungen. Möchten Sie wirklich wechseln?",
  },
  queryTypes: {
    fact_single: {
      label: "Einzelfakt",
      description:
        "Antwort ist im Kontext vorhanden, eine einzelne Informationseinheit.",
    },
    summary: {
      label: "Zusammenfassung",
      description:
        "Antwort ist im Kontext vorhanden, erfordert Zusammenfassung mehrerer Informationen.",
    },
    reasoning: {
      label: "Schlussfolgerung",
      description:
        "Antwort ist nicht explizit im Kontext, kann aber durch Schlussfolgerung abgeleitet werden.",
    },
    unanswerable: {
      label: "Unbeantwortbar",
      description: "Antwort ist weder im Kontext vorhanden noch ableitbar.",
    },
  },
  chunks: {
    relevantLabel: "Relevante Dokumentausschnitte",
    relevantDescription:
      "Tragen Sie Textausschnitte aus Dokumenten ein, die das System finden müsste, um die Frage korrekt zu beantworten.",
    relevantPlaceholder: "Dokumentausschnitt",
    relevantError: "Mindestens ein Dokumentausschnitt ist erforderlich",
    distractingLabel: "Ablenkende Dokumentausschnitte (optional)",
    distractingDescription:
      "Textausschnitte, die relevant erscheinen könnten, aber das System irreführen oder die Antwort verschlechtern würden.",
    distractingPlaceholder: "Ablenkender Ausschnitt",
    addChunk: "Weiteren Ausschnitt hinzufügen",
    noDocuments: "Keine Dokumente vorhanden",
    manualEntry: "Manueller Eintrag",
    addChunksHint:
      'Fügen Sie Dokumente im Tab "Dokumente" hinzu, um sie hier auszuwählen.',
  },
  annotationList: {
    count: "{{count}} Annotation(en)",
    empty: "Noch keine Annotationen vorhanden.",
    emptyHint:
      'Erstellen Sie Ihre erste Annotation über den Tab "Neue Annotation".',
    showDetails: "Details anzeigen",
    hideDetails: "Weniger anzeigen",
    expectedResponse: "Erwartete Antwort",
    relevantChunks: "Relevante Dokumentausschnitte ({{count}})",
    distractingChunks: "Ablenkende Dokumentausschnitte ({{count}})",
    notes: "Anmerkungen",
    clickAgain: "Nochmal klicken",
  },
  errorBoundary: {
    title: "Etwas ist schiefgelaufen",
    description:
      "Ein unerwarteter Fehler ist aufgetreten. Sie können Ihre Daten exportieren, bevor Sie die App zurücksetzen.",
    exportButton: "Daten exportieren",
    exportSuccess: "Daten erfolgreich exportiert.",
    exportFailed: "Export fehlgeschlagen. Keine Daten gefunden.",
    resetButton: "App zurücksetzen",
    resetConfirm: "Zurücksetzen bestätigen",
    resetDescription:
      "Das Zurücksetzen löscht alle gespeicherten Daten und lädt die App neu.",
  },
  faq: {
    contact: "Kontakt",
  },
  documentManager: {
    titleNew: "Neues Dokument",
    titleEdit: "Dokument bearbeiten",
    filename: "Dateiname",
    filenamePlaceholder: "dokument.txt",
    description: "Beschreibung",
    descriptionPlaceholder: "Beschreibung des Dokuments...",
    library: "Dokumentbibliothek ({{count}})",
    filenameError: "Dateiname ist erforderlich",
    descriptionError: "Beschreibung ist erforderlich",
    empty: "Noch keine Dokumente vorhanden.",
    emptyHint: "Fügen Sie über das Formular oben ein Dokument hinzu.",
  },
};
