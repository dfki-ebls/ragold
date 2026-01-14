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
    importTooltip: "Import annotations and documents from JSON",
    exportTooltip: "Export annotations and documents as JSON",
    exportDisabledMeta: "Author and project must be filled in",
    exportDisabledEmpty: "No annotations available",
    resetTooltip: "Delete all annotations and documents",
    resetDisabled: "No data available",
    importSuccess:
      "{{count}} new annotation(s) imported. Documents were also imported.",
    importEmpty:
      "No new annotations found (all already exist). Documents may have been imported.",
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
    datasetDescription: "Description",
    datasetDescriptionPlaceholder:
      "Brief description of the dataset (optional)",
    metadataInfo:
      "This metadata applies to all annotations and documents. The export includes both annotations and documents.",
  },
  tabs: {
    newAnnotation: "New Annotation",
    editing: "Edit",
    annotations: "Annotations ({{count}})",
    documents: "Documents ({{count}})",
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
    complexity: "Task Complexity",
    complexityDescription: "How difficult is this task for a RAG system?",
    complexityError: "Complexity (1-5 stars) is required",
    complexityLevel1:
      "Simple fact lookup, answer is stated verbatim in the document",
    complexityLevel2: "Minor rephrasing or filtering required",
    complexityLevel3:
      "Information from multiple paragraphs needs to be combined",
    complexityLevel4:
      "Complex relationships to understand, implicit knowledge required",
    complexityLevel5: "Very challenging, requires deep understanding",
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
  docs: {
    relevantLabel: "Relevant Document Contents",
    relevantDescription:
      "Enter the text passages that the system would need to find to correctly answer the question.",
    relevantPlaceholder: "Document passage",
    relevantError: "At least one document passage is required",
    distractorLabel: "Irrelevant Document Contents (optional)",
    distractorDescription:
      "Text passages that appear relevant but should not be used to answer the question.",
    distractorPlaceholder: "Distracting passage",
    addPassage: "Add another passage",
    noDocuments: "No documents available",
    manualEntry: "Manual entry",
    addDocsHint: 'Add documents in the "Documents" tab to select them here.',
  },
  annotationList: {
    count: "{{count}} annotation(s)",
    empty: "No annotations yet.",
    emptyHint: 'Create your first annotation via the "New Annotation" tab.',
    showDetails: "Show details",
    hideDetails: "Show less",
    expectedResponse: "Expected Answer",
    relevantDocs: "Relevant Document Passages ({{count}})",
    distractorDocs: "Irrelevant Document Passages ({{count}})",
    notes: "Notes",
    clickAgain: "Click again",
  },
  documentManager: {
    titleNew: "New Document",
    titleEdit: "Edit Document",
    filename: "Filename",
    filenamePlaceholder: "document.txt",
    description: "Description",
    descriptionPlaceholder: "Description of the document...",
    library: "Document Library ({{count}})",
    empty: "No documents yet. Add a document above.",
  },
  starRating: {
    ariaLabel: "{{value}} of {{max}} stars",
  },
};

export type TranslationKeys = typeof en;
