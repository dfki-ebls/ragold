export const en = {
  common: {
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    confirm: "Confirm",
    reset: "Reset",
    import: "Import",
    export: "Export",
    add: "Add",
    update: "Update",
  },
  header: {
    title: "RAGold",
    importTooltip:
      "Import annotations and documents from JSON (replaces existing data)",
    importConfirm:
      "Importing will replace all existing annotations and documents. This cannot be undone. Continue?",
    exportTooltip: "Export annotations and documents as JSON",
    exportDisabledMeta: "Author and project must be filled in",
    exportDisabledEmpty: "No annotations available",
    resetTooltip: "Delete all annotations and documents",
    resetDisabled: "No data available",
    importSuccess: "Import complete. {{count}} annotation(s) loaded.",
    importEmpty: "Import complete. The file contained no annotations.",
    importError: "Import failed: {{message}}",
  },
  metadata: {
    title: "Annotating RAG Examples",
    description:
      "Create examples of user queries for a chat system that generates answers based on document contents (Retrieval-Augmented Generation).",
    author: "Author",
    authorPlaceholder: "Name of the annotator",
    project: "Project",
    projectPlaceholder: "Project name",
    datasetDescription: "Description (optional)",
    datasetDescriptionPlaceholder: "Brief description of the dataset",
    metadataInfo:
      "This metadata applies to all annotations and documents. The export includes both annotations and documents.",
  },
  tabs: {
    newAnnotation: "New Annotation",
    editing: "Edit",
    annotations: "Annotations ({{count}})",
    documents: "Documents ({{count}})",
    guide: "Guide",
  },
  form: {
    titleNew: "Create New Annotation",
    titleEdit: "Edit Annotation",
    description:
      "Create an example of a user query for a RAG system with the relevant documents and expected answer.",
    query: "User Query",
    queryDescription:
      "Phrase the question as a user would enter it into a chat system.",
    queryPlaceholder: "How do I request vacation in the self-service portal?",
    queryError: "User query is required",
    queryType: "Query Type",
    queryTypeDescription: "How is the question answered by the context?",
    response: "Expected Answer",
    responseDescription:
      "Write the ideal answer that the chat system should provide.",
    responsePlaceholder: "Answer to the user query...",
    responseError: "Expected answer is required",
    notes: "Notes (optional)",
    notesDescription:
      "Special considerations such as ambiguous terms, time dependencies, or special phrasings.",
    notesPlaceholder: "Optional notes...",
    unsavedChanges: "There are unsaved changes. Do you really want to switch?",
  },
  queryTypes: {
    fact_single: {
      label: "Single Fact",
      description:
        "Answer is present in the context as a single piece of information.",
    },
    summary: {
      label: "Summary",
      description:
        "Answer is present in the context but requires summarizing multiple pieces of information.",
    },
    reasoning: {
      label: "Reasoning",
      description:
        "Answer is not explicitly in the context but can be derived through reasoning.",
    },
    unanswerable: {
      label: "Unanswerable",
      description: "Answer is neither present in the context nor derivable.",
    },
  },
  chunks: {
    relevantLabel: "Relevant Document Chunks",
    relevantDescription:
      "Enter text chunks from documents that the system would need to retrieve to correctly answer the question.",
    relevantPlaceholder: "Document chunk",
    relevantError: "At least one document chunk is required",
    distractingLabel: "Distracting Document Chunks (optional)",
    distractingDescription:
      "Text chunks that might seem relevant but could mislead the system or worsen the answer if retrieved.",
    distractingPlaceholder: "Distracting chunk",
    addChunk: "Add another chunk",
    noDocuments: "No documents available",
    manualEntry: "Manual entry",
    addChunksHint: 'Add documents in the "Documents" tab to select them here.',
  },
  annotationList: {
    count: "{{count}} annotation(s)",
    empty: "No annotations yet.",
    emptyHint: 'Create your first annotation via the "New Annotation" tab.',
    showDetails: "Show details",
    hideDetails: "Show less",
    expectedResponse: "Expected Answer",
    relevantChunks: "Relevant Document Chunks ({{count}})",
    distractingChunks: "Distracting Document Chunks ({{count}})",
    notes: "Notes",
    clickAgain: "Click again",
  },
  errorBoundary: {
    title: "Something went wrong",
    description:
      "An unexpected error occurred. You can export your data before resetting the app.",
    exportButton: "Export Data",
    exportSuccess: "Data exported successfully.",
    exportFailed: "Export failed. No data found.",
    resetButton: "Reset App",
    resetConfirm: "Confirm Reset",
    resetDescription: "Resetting clears all stored data and reloads the app.",
  },
  documentManager: {
    titleNew: "New Document",
    titleEdit: "Edit Document",
    filename: "Filename",
    filenamePlaceholder: "document.txt",
    description: "Description",
    descriptionPlaceholder: "Description of the document...",
    library: "Document Library ({{count}})",
    empty: "No documents yet.",
    emptyHint: "Add a document using the form above.",
  },
};

export type TranslationKeys = typeof en;
