import type { TranslationKeys } from "./en";

export const de: TranslationKeys = {
  common: {
    save: "Speichern",
    cancel: "Abbrechen",
    edit: "Bearbeiten",
    delete: "Löschen",
    remove: "Entfernen",
    copy: "Kopieren",
    download: "Herunterladen",
    confirm: "Bestätigen",
    reset: "Reset",
    import: "Import",
    export: "Export",
    add: "Hinzufügen",
    update: "Aktualisieren",
    done: "Fertig",
    clickAgain: "Nochmal klicken",
    lastEdited: "Bearbeitet {{date}}",
  },
  header: {
    title: "RAGold",
    importTooltip:
      "Fügt Annotationen und Dokumente aus einer Zip-Datei zum aktuellen Projekt hinzu",
    importConfirm:
      "Die Annotationen und Dokumente des Archivs werden zum aktuellen Projekt hinzugefügt. Dokumente mit identischem Inhalt werden wiederverwendet. Fortfahren?",
    exportTooltip: "Exportiert Annotationen und Dokumente als Zip",
    exportDisabledMeta: "Autor und Projekt müssen ausgefüllt sein",
    exportDisabledEmpty: "Keine Annotationen vorhanden",
    resetTooltip: "Setzt die App auf den Ausgangszustand zurück",
    importSuccess: "Import abgeschlossen. {{count}} Annotation(en) hinzugefügt.",
    importEmpty: "Import abgeschlossen. Die Datei enthielt keine Annotationen.",
    importError: "Import fehlgeschlagen: {{message}}",
    exportUnsavedWarning:
      "Es gibt ungespeicherte Formularänderungen, die nicht im Export enthalten sein werden.",
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
    validationError: "Bitte prüfen Sie die markierten Felder.",
    required: "Bitte füllen Sie dieses Feld aus.",
    keyFactNotInResponse: "Diese Kernaussage kommt in der Antwort nicht mehr vor.",
    documentMissing: "Das Dokument dieser Passage wurde gelöscht.",
  },
  questionTypes: {
    simple: {
      label: "Ein einzelner Fakt",
      description: "Wann wurde das Werk in Hamburg eröffnet?",
    },
    simple_w_condition: {
      label: "Ein einzelner Fakt unter einer Bedingung",
      description: "Was kostete die jährliche Wartung im Jahr 2023?",
    },
    comparison: {
      label: "Zwei Dinge vergleichen",
      description: "Welche der beiden Pumpen verbraucht weniger Energie?",
    },
    aggregation: {
      label: "Über mehrere Stellen zählen oder summieren",
      description: "Wie viele Standorte betreibt das Unternehmen in Deutschland?",
    },
    set: {
      label: "Alles Zutreffende auflisten",
      description: "Welche Abteilungen nehmen am Pilotprojekt teil?",
    },
    "multi-hop": {
      label: "Mehrere Fakten nacheinander verknüpfen",
      description: "Wer leitet die Abteilung, die für das Pilotprojekt zuständig ist?",
    },
    "post-processing": {
      label: "Gefundenes berechnen oder umformen",
      description: "Wie viele Tage läuft der Vertrag noch?",
    },
    false_premise: {
      label: "Die Frage setzt etwas Falsches voraus",
      description: "Warum wurde das Pilotprojekt eingestellt? (Es wurde nie eingestellt.)",
    },
  },
  answerabilities: {
    answerable: {
      label: "Vollständig beantwortbar",
      description: "Die Dokumente enthalten alles für eine vollständige Antwort.",
    },
    partial: {
      label: "Teilweise beantwortbar",
      description: "Die Dokumente beantworten nur einen Teil der Frage.",
    },
    unanswerable: {
      label: "Nicht beantwortbar",
      description:
        "Die Dokumente enthalten die Antwort nicht. Die ideale Antwort sollte das sagen.",
    },
  },
  passageGrades: {
    needed: {
      label: "Notwendig",
      description: "Wird für die Antwort zwingend gebraucht.",
    },
    helpful: {
      label: "Hilfreich",
      description: "Liefert nützlichen Kontext, ist aber nicht zwingend.",
    },
    misleading: {
      label: "Irreführend",
      description: "Wirkt relevant, würde aber zu einer falschen Antwort führen.",
    },
  },
  keyFactImportances: {
    must: {
      label: "Muss erwähnt werden",
      description: "Ohne diesen Fakt ist die Antwort unvollständig.",
    },
    nice: {
      label: "Sollte erwähnt werden",
      description: "Verbessert die Antwort, ist aber optional.",
    },
  },
  hints: {
    unanswerableWithNeeded:
      "Die Frage ist als nicht beantwortbar markiert, aber einige Passagen sind als notwendig markiert.",
    answerableWithoutNeeded:
      "Die Frage ist als beantwortbar markiert, aber noch keine Passage ist als notwendig markiert.",
    multiPassageFewNeeded:
      "Fragen dieser Art stützen sich meist auf mindestens zwei notwendige Passagen.",
  },
  annotationManager: {
    titleNew: "Neue Annotation",
    titleEdit: "Annotation bearbeiten",
    query: "Frage",
    queryDescription:
      "Formulieren Sie die Frage so, wie ein Nutzer sie in ein Chat-System eingeben würde.",
    queryPlaceholder: "Wie beantrage ich Urlaub im Self-Service-Portal?",
    questionType: "Art der Frage",
    questionTypeDescription: "Was braucht es, um die Frage zu beantworten?",
    answerability: "Können die Dokumente sie beantworten?",
    notes: "Anmerkungen (optional)",
    notesDescription:
      "Besonderheiten wie mehrdeutige Begriffe, Zeitabhängigkeit oder ungewöhnliche Formulierungen.",
    notesPlaceholder: "Optionale Hinweise...",
    fromConversation: "Aus Unterhaltung",
    library: "Annotationsbibliothek ({{count}})",
    empty: "Noch keine Annotationen vorhanden.",
    emptyHint: "Erstellen Sie über das Formular oben eine Annotation.",
    showDetails: "Details anzeigen",
    hideDetails: "Weniger anzeigen",
    created: "Erstellt",
    updated: "Zuletzt aktualisiert",
    createSuccess: "Annotation erstellt.",
    updateSuccess: "Annotation aktualisiert.",
    deleteSuccess: "Annotation gelöscht.",
    copySuccess: "Annotation als JSON in die Zwischenablage kopiert.",
    copyError: "Kopieren in die Zwischenablage fehlgeschlagen.",
  },
  passages: {
    label: "Passagen",
    description:
      "Markieren Sie die Stellen Ihrer Dokumente, auf die es für die Antwort ankommt, und geben Sie an, wie wichtig sie sind.",
    empty: "Noch keine Passagen.",
    addFromDocument: "Aus Dokument hinzufügen",
    noDocuments: "Laden Sie im Tab Dokumente Dateien hoch, um Passagen hinzuzufügen.",
    showInDocument: "Im Dokument zeigen",
    deletedDocument: "Gelöschtes Dokument",
    noLocation: "Ohne Fundstelle",
    added: "Passage hinzugefügt.",
    dialogTitle: "Passagen hinzufügen",
    dialogDescription:
      "Markieren Sie Text im Dokument und wählen Sie dann, wie wichtig er ist. Sie können mehrere Passagen nacheinander hinzufügen.",
    document: "Dokument",
    gradeTitle: "Wie wichtig ist diese Passage?",
    manualTitle: "Passage von Hand eingeben",
    manualDescription:
      "Für Dateien, die hier nicht angezeigt werden können, oder wenn das Markieren nicht klappt, fügen Sie den Text selbst ein.",
    manualText: "Text der Passage",
    manualTextPlaceholder: "Text aus dem Dokument einfügen...",
    manualLocation: "Fundstelle im Dokument (optional)",
    manualLocationPlaceholder: "Seite 4, Abschnitt 2.1, ...",
    manualAdd: "Passage hinzufügen",
  },
  response: {
    label: "Ideale Antwort",
    description: "Schreiben Sie die Antwort, die das Chat-System geben sollte.",
    placeholder: "Antwort auf die Frage...",
    edit: "Antwort bearbeiten",
    finishEditing: "Bearbeitung beenden",
    selectHint: "Markieren Sie Wörter in der Antwort, um sie als Kernaussagen festzulegen.",
    emptyHint: "Schreiben Sie zuerst die Antwort und markieren Sie dann ihre Kernaussagen.",
    keyFacts: "Kernaussagen",
    keyFactsDescription: "Die Teile der Antwort, die eine gute Antwort enthalten muss.",
    noKeyFacts: "Noch keine Kernaussagen.",
    keyFactTitle: "Als Kernaussage markieren",
    staleKeyFact:
      "Kommt in der Antwort nicht mehr vor. Entfernen Sie sie oder stellen Sie den Wortlaut wieder her.",
  },
  viewer: {
    loading: "Dokument wird geöffnet...",
    error:
      "Dieses Dokument kann nicht angezeigt werden. Sie können Passagen weiterhin von Hand eingeben.",
    page: "Seite {{from}}",
    pages: "Seiten {{from}}-{{to}}",
    line: "Zeile {{from}}",
    lines: "Zeilen {{from}}-{{to}}",
    sheet: "Tabellenblatt",
    sheetTruncated:
      "Nur die ersten {{rows}} Zeilen und {{columns}} Spalten werden angezeigt. Andere Zellen bitte von Hand eingeben.",
    sheetHint: "Ziehen Sie über Zellen, um einen Bereich zu markieren.",
    textTruncated: "{{shown}} von {{total}} Zeilen werden angezeigt.",
    showMore: "Mehr anzeigen",
    image:
      "Bilder können nicht markiert werden. Beschreiben oder übertragen Sie die relevante Stelle unten von Hand.",
    unsupported:
      "Dieser Dateityp kann hier nicht angezeigt werden. Öffnen Sie die Datei und geben Sie Passagen unten von Hand ein.",
    openFile: "Datei öffnen",
    notFound: "Die Datei fehlt in diesem Browser.",
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
    resetDescription: "Das Zurücksetzen löscht alle gespeicherten Daten und lädt die App neu.",
  },
  faq: {
    contact: "Senden Sie die exportierte Datei an",
  },
  documentManager: {
    titleNew: "Dokumente hochladen",
    titleEdit: "Dokument bearbeiten",
    dropzoneLabel: "Dateien hierher ziehen oder klicken zum Auswählen",
    dropzoneHint: "Beliebiger Dateityp, max. 10 MB pro Datei. Mehrere Dateien möglich.",
    dropzoneHintEdit: "Ersatzdatei hierher ziehen oder klicken zum Auswählen.",
    library: "Dokumentbibliothek ({{count}})",
    empty: "Noch keine Dokumente vorhanden.",
    emptyHint: "Laden Sie Dokumente über den Bereich oben hoch.",
    fileTooLarge: '"{{name}}" überschreitet das Limit von {{max}} MB.',
    uploadError: 'Fehler beim Speichern von "{{name}}": {{message}}',
    uploadSuccess: "{{count}} Dokument(e) hochgeladen.",
    duplicate:
      '"{{name}}" hat denselben Inhalt wie "{{existing}}" und wurde nicht erneut hinzugefügt.',
    saved: "Dokument gespeichert.",
    deleteSuccess: "Dokument gelöscht.",
    deleteTitle: "Dokument löschen?",
    deleteUnused: '"{{name}}" wird von keiner Passage verwendet und wird gelöscht.',
    deleteUsed:
      '"{{name}}" wird von {{passages}} Passage(n) in {{annotations}} Annotation(en) verwendet. Beim Löschen des Dokuments werden auch diese Passagen entfernt.',
    downloadError: "Datei nicht gefunden.",
    name: "Dateiname",
    notes: "Anmerkungen (optional)",
    notesPlaceholder: "Optionale Anmerkungen zu diesem Dokument...",
    fingerprint: "Fingerabdruck {{hash}}",
    fingerprintHint: "SHA-256-Prüfsumme, identische Dateien haben denselben Fingerabdruck",
    usage: "Von {{count}} Passage(n) verwendet",
  },
};
