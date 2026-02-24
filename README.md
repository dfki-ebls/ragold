# RAGold

A web-based annotation tool for RAG (Retrieval-Augmented Generation) datasets.
RAGold helps annotators create query-response pairs with relevant and distracting document chunks, following the [Know Your RAG](https://aclanthology.org/2025.coling-industry.4/) research framework.

## Features

- Create and manage annotations with queries, responses, and associated document chunks.
- Classify queries by type: single-fact, summary, reasoning, or unanswerable.
- Upload source documents (any file type, max 10 MB each) with drag-and-drop and bulk upload support.
- Link document chunks to specific uploaded documents.
- Export and import annotation datasets as zip archives containing both annotations and document files.
- Annotation metadata is stored in localStorage, document files in IndexedDB.
- Available in English and German.

## Environment Variables

| Variable | Description |
| --- | --- |
| `VITE_CONTACT_INFO` | Optional contact information displayed in the UI. |

## Data Format

Annotation datasets are exported as zip archives with the following structure:

```
ragold-<timestamp>.zip
├── annotations.json
└── files/
    └── <uuid>/
        └── <filename>
```

The `annotations.json` file contains:

```json
{
  "version": 2,
  "author": "",
  "project": "",
  "description": "",
  "language": "en",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z",
  "annotations": {
    "<uuid>": {
      "query": "",
      "queryType": "fact_single",
      "relevantChunks": [{ "content": "", "documentId": "<uuid>" }],
      "distractingChunks": [{ "content": "", "documentId": "<uuid>" }],
      "response": "",
      "notes": ""
    }
  },
  "documents": {
    "<uuid>": {
      "name": "",
      "size": 0
    }
  }
}
```
