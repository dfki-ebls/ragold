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
    clickAgain: "Nochmal klicken",
    lastEdited: "Bearbeitet {{date}}",
  },
  header: {
    title: "RAGold",
    importTooltip:
      "Importiert Annotationen und Dokumente aus einer Zip-Datei (ersetzt vorhandene Daten)",
    importConfirm:
      "Der Import ersetzt alle vorhandenen Annotationen und Dokumente. Dies kann nicht rückgängig gemacht werden. Fortfahren?",
    exportTooltip: "Exportiert Annotationen und Dokumente als Zip",
    exportDisabledMeta: "Autor und Projekt müssen ausgefüllt sein",
    exportDisabledEmpty: "Keine Annotationen vorhanden",
    resetTooltip: "Setzt die App auf den Ausgangszustand zurück",
    importSuccess: "Import abgeschlossen. {{count}} Annotation(en) geladen.",
    importEmpty: "Import abgeschlossen. Die Datei enthielt keine Annotationen.",
    importError: "Import fehlgeschlagen: {{message}}",
    exportUnsavedWarning: "Es gibt ungespeicherte Formularänderungen, die nicht im Export enthalten sein werden.",
    exportSuccess: "Export abgeschlossen.",
    exportError: "Export fehlgeschlagen: {{message}}",
    resetSuccess: "App zurückgesetzt.",
  },
  metadata: {
    author: "Autor",
    authorPlaceholder: "Name des Annotators",
    project: "Projekt",
    projectPlaceholder: "Projektname",
    notes: "Anmerkungen (optional)",
    notesPlaceholder: "Optionale Anmerkungen zu diesem Datensatz...",
  },
  tabs: {
    annotations: "Annotationen ({{count}})",
    documents: "Dokumente ({{count}})",
    guide: "Anleitung",
  },
  form: {
    unsavedChangesTitle: "Ungespeicherte Änderungen",
    unsavedChanges:
      "Es gibt ungespeicherte Änderungen, die verloren gehen. Möchten Sie fortfahren?",
    validationError: "Bitte überprüfen Sie das Formular auf Fehler.",
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
    selectDocument: "Dokument auswählen...",
    documentError: "Jeder Ausschnitt mit Inhalt muss einem Dokument zugeordnet sein",
    deletedDocument: "Gelöschtes Dokument",
    selectDocumentFirst:
      "Wählen Sie zuerst ein Dokument aus, um Ausschnitte einzugeben",
    addChunksHint:
      'Laden Sie Dokumente im Tab "Dokumente" hoch, um sie hier auszuwählen.',
  },
  annotationManager: {
    titleNew: "Neue Annotation",
    titleEdit: "Annotation bearbeiten",

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
    library: "Annotationsbibliothek ({{count}})",
    empty: "Noch keine Annotationen vorhanden.",
    emptyHint: "Erstellen Sie über das Formular oben eine Annotation.",
    showDetails: "Details anzeigen",
    hideDetails: "Weniger anzeigen",
    expectedResponse: "Erwartete Antwort",
    relevantChunks: "Relevante Dokumentausschnitte ({{count}})",
    distractingChunks: "Ablenkende Dokumentausschnitte ({{count}})",
    listNotes: "Anmerkungen",
    createSuccess: "Annotation erstellt.",
    updateSuccess: "Annotation aktualisiert.",
    deleteSuccess: "Annotation gelöscht.",
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
  schemaMigration: {
    title: "Datenaktualisierung erforderlich",
    description:
      "Die App wurde aktualisiert (Schema v{{old}} → v{{new}}). Ihre gespeicherten Daten sind nicht kompatibel und werden ersetzt. Sie können vorher ein Backup Ihrer aktuellen Daten herunterladen.",
    download: "Herunterladen & Fortfahren",
    continueWithout: "Ohne Download fortfahren",
  },
  faq: {
    contact: "Senden Sie die exportierte Datei an",
  },
  documentManager: {
    titleNew: "Dokumente hochladen",
    titleEdit: "Dokument ersetzen",
    dropzoneLabel: "Dateien hierher ziehen oder klicken zum Auswählen",
    dropzoneHint: "Beliebiger Dateityp, max. 10 MB pro Datei. Mehrere Dateien möglich.",
    dropzoneHintEdit: "Ersatzdatei hierher ziehen oder klicken zum Auswählen.",
    currentFile: "Aktuelle Datei",
    library: "Dokumentbibliothek ({{count}})",
    empty: "Noch keine Dokumente vorhanden.",
    emptyHint: "Laden Sie Dokumente über den Bereich oben hoch.",
    fileTooLarge: "\"{{name}}\" überschreitet das Limit von {{max}} MB.",
    uploadError: "Fehler beim Speichern von \"{{name}}\": {{message}}",
    uploadSuccess: "{{count}} Dokument(e) hochgeladen.",
    saved: "Dokument gespeichert.",
    deleteSuccess: "Dokument gelöscht.",
    deleteBlocked: "Löschen nicht möglich: referenziert von {{count}} Annotation(en).",
    downloadError: "Datei nicht gefunden.",
    name: "Dateiname",
    notes: "Anmerkungen (optional)",
    notesPlaceholder: "Optionale Anmerkungen zu diesem Dokument...",
  },
};
