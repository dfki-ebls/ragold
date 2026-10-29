# RAGold

A web-based annotation tool for RAG (Retrieval-Augmented Generation) datasets.
RAGold helps annotators create query-response pairs with graded passages and key facts.
Question types follow [CRAG](https://doi.org/10.52202/079017-0335) and answerability follows [MTRAG](https://arxiv.org/abs/2501.03468).

## Features

- Create and manage annotations with queries, responses, key facts, and passages graded as needed, helpful, or misleading.
- Classify questions by CRAG type and MTRAG answerability with plain-language options, and get soft hints for inconsistent passages.
- Add passages by selecting text in the built-in document viewer, which records the location automatically:
  page for PDF, nearest heading for DOCX, cell range for XLSX, and line numbers for text files.
  Images and other file types can be opened externally, with manual entry as a fallback for any file.
  Existing passages, such as those transferred without a location, are searched for and highlighted in their document.
- Mark key facts by selecting them in the ideal answer, with key facts that no longer match an edited answer flagged for review.
- Upload source documents (any file type, max 10 MB each) with drag-and-drop and bulk upload support, and add optional notes.
  Identical files are detected by their SHA-256 hash and stored only once.
  Deleting a document also removes the passages that refer to it after a confirmation.
- Export annotation datasets as zip archives and merge such archives into the current project.
- Receive archives from other apps such as hivegent through a browser-only transfer.
- Annotation metadata is stored in localStorage (synced across tabs), document files in IndexedDB.
- Available in English and German.

## Environment Variables

| Variable            | Description                                       |
| ------------------- | ------------------------------------------------- |
| `VITE_CONTACT_INFO` | Optional contact information displayed in the UI. |

## Data Format

Annotation datasets are exported as zip archives with the following structure:

```
ragold-<timestamp>.zip
├── annotations.json
└── files/
    └── <documentId>/
        └── <name>
```

The `annotations.json` file follows schema version 3, whose JSON Schema is committed as [`schema.json`](schema.json) (regenerate it with `npm run schema`):

```json
{
  "version": 3,
  "author": "",
  "project": "",
  "notes": "",
  "language": "en",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z",
  "annotations": {
    "<annotationId>": {
      "query": "",
      "questionType": "simple",
      "answerability": "answerable",
      "passages": [{ "documentId": "<documentId>", "text": "", "location": "", "grade": "needed" }],
      "response": "",
      "keyFacts": [{ "text": "", "importance": "must" }],
      "origin": "",
      "notes": "",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  },
  "documents": {
    "<documentId>": {
      "name": "",
      "size": 0,
      "sha256": "<lowercase hex>",
      "notes": "",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  }
}
```

- `questionType` is one of the CRAG types `simple`, `simple_w_condition`, `comparison`, `aggregation`, `set`, `multi-hop`, `post-processing`, `false_premise`.
- `answerability` is `answerable`, `partial`, or `unanswerable` (MTRAG without the conversational class).
  Like `questionType` and `grade`, it has no default and must be chosen explicitly.
- `grade` of a passage is `needed`, `helpful`, or `misleading`.
- `location` of a passage is language-neutral: `page=4` or `page=4-5` for PDF, `line=10` or `line=10-12` for text files, an A1 range such as `Sheet1!B2:D5` for XLSX, and the nearest heading for DOCX.
  Locations entered by hand are free text.
- Every key fact must be a verbatim excerpt of `response`, and its `importance` is `must` or `nice`.
- `origin` links to the source conversation and is empty for manual annotations.

Importing an archive merges it into the current project.
All documents must be present with a matching `sha256`, and every passage `documentId` must refer to one of them.
Documents whose content already exists are reused, all other annotations and documents receive fresh ids.
The metadata of the archive is only adopted if the current project is empty.
An archive with a single annotation opens it in the form.

The project is stored in the browser and validated against the same schema when loaded.
Stored data that fails validation is left untouched, and RAGold shows the errors with an export of the raw data and its files instead of the app.

## Passage Matching

Passages are either selected in RAGold from the rendered original (PDF text layer, DOCX as HTML, XLSX cells as tab-separated values, plain text) or transferred as plain text derived from a converted document, so reading order, line breaks, hyphenation, and table layout may differ from the original.
Both sides are therefore normalized before comparison (`normalizePassage` in [`src/lib/match.ts`](src/lib/match.ts)):

1. Apply Unicode NFKC and convert to lower case.
2. Join words hyphenated across line breaks, a hyphen followed by whitespace that contains a newline.
3. Replace every character that is not a letter, combining mark, or digit with a space.
4. Collapse whitespace and trim.

A passage matches a document if its normalized text is contained in the normalized document text.
Otherwise, it matches the window of about the passage's length whose tokens cover at least 80% of the passage tokens in order.
Evaluators should apply the same rule, which mirrors the approximate provenance matching of [KILT](https://doi.org/10.18653/v1/2021.naacl-main.200) (Petroni et al. 2021).

## Transfer

Other apps can send an archive without a file download.
They open RAGold with `window.open("<ragold>/#import")`, wait for the message `{ type: "ragold:ready" }`, and post `{ type: "ragold:import", zip }` with the archive as a `Blob`.
After the user confirms the import, RAGold answers with `{ type: "ragold:result", ok: true, count }` or `{ type: "ragold:result", ok: false, error }`.
Only one import is accepted per page load.
