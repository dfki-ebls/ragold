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
    clickAgain: "Click again",
    lastEdited: "Edited {{date}}",
  },
  header: {
    title: "RAGold",
    importTooltip:
      "Import annotations and documents from a zip file (replaces existing data)",
    importConfirm:
      "Importing will replace all existing annotations and documents. This cannot be undone. Continue?",
    exportTooltip: "Export annotations and documents as zip",
    exportDisabledMeta: "Author and project must be filled in",
    exportDisabledEmpty: "No annotations available",
    resetTooltip: "Reset the app to its initial state",
    importSuccess: "Import complete. {{count}} annotation(s) loaded.",
    importEmpty: "Import complete. The file contained no annotations.",
    importError: "Import failed: {{message}}",
    exportError: "Export failed: {{message}}",
  },
  metadata: {
    author: "Author",
    authorPlaceholder: "Name of the annotator",
    project: "Project",
    projectPlaceholder: "Project name",
    notes: "Notes (optional)",
    notesPlaceholder: "Optional notes about this dataset...",
  },
  tabs: {
    annotations: "Annotations ({{count}})",
    documents: "Documents ({{count}})",
    guide: "Guide",
  },
  form: {
    unsavedChangesTitle: "Unsaved Changes",
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
    selectDocument: "Select a document...",
    documentError: "Each chunk with content must have a document selected",
    deletedDocument: "Deleted document",
    selectDocumentFirst: "Select a document first to enter chunk content",
    addChunksHint: 'Upload documents in the "Documents" tab to select them here.',
  },
  annotationManager: {
    titleNew: "New Annotation",
    titleEdit: "Edit Annotation",

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
    library: "Annotation Library ({{count}})",
    empty: "No annotations yet.",
    emptyHint: "Add an annotation using the form above.",
    showDetails: "Show details",
    hideDetails: "Show less",
    expectedResponse: "Expected Answer",
    relevantChunks: "Relevant Document Chunks ({{count}})",
    distractingChunks: "Distracting Document Chunks ({{count}})",
    listNotes: "Notes",
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
  faq: {
    contact: "Send the exported file to",
  },
  documentManager: {
    titleNew: "Upload Documents",
    titleEdit: "Replace Document",
    dropzoneLabel: "Drop files here or click to select",
    dropzoneHint: "Any file type, max 10 MB per file. Multiple files supported.",
    dropzoneHintEdit: "Drop a replacement file or click to select.",
    currentFile: "Current file",
    library: "Document Library ({{count}})",
    empty: "No documents yet.",
    emptyHint: "Upload documents using the area above.",
    fileTooLarge: "\"{{name}}\" exceeds the {{max}} MB size limit.",
    uploadError: "Failed to store \"{{name}}\": {{message}}",
    uploadSuccess: "{{count}} document(s) uploaded.",
    reUploadSuccess: "Document replaced successfully.",
    notes: "Notes (optional)",
    notesPlaceholder: "Optional notes about this document...",
    notesSaved: "Notes saved.",
  },
};

export type TranslationKeys = typeof en;
