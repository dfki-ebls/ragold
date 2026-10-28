# User Guide

Welcome to RAGold!
This tool helps you create test examples for Retrieval-Augmented Generation (RAG) systems.
Each example consists of a question, the passages of your documents that matter for it, and the ideal answer with its key facts.
Follow these steps to create your first annotation.

### Step 1: Set Up Your Project

Fill in the **Author** and **Project** fields at the top of the page.
These fields are required before you can export your annotations.
You can also add optional **Notes** for the dataset.

### Step 2: Upload Documents

Go to the **Documents** tab to upload your reference documents.
You can drag and drop files or click to select them, several files at once are fine.
Any file type is accepted, with a maximum size of 10 MB per file.
Every document gets a short fingerprint of its content.
If you upload a file whose content already exists, RAGold tells you and keeps the existing document.
You can rename a document, replace its file, or add **Notes** by clicking **Edit** in the document library.
RAGold asks before deleting a document, and if passages use it, these passages are removed as well.

### Step 3: Create an Annotation

Switch to the **Annotations** tab and fill in:

1. **Question**: Write the question as a user would ask it in a chat system.
2. **Kind of question**: Choose what it takes to answer the question, each option shows an example.
3. **Can the documents answer it?**: Choose whether the documents answer the question fully, partly, or not at all.
4. **Passages**: Mark the parts of your documents that matter for the answer (see below).
5. **Ideal answer** and **Key facts**: Write the answer, then mark its key facts (see below).
6. **Notes** (optional): Add any special considerations about this example.

The form shows hints for unusual combinations, for example a question marked as not answerable that still has needed passages.
These hints do not prevent saving.

#### Adding Passages

Click **Add from document** to open the document viewer and pick a document at the top.
PDF files, Word documents (.docx), Excel workbooks (.xlsx), and text files such as .txt, .md, .csv, or .json are shown directly.
Select the relevant text with the mouse, or drag across cells in a workbook, and a small popup asks how important the passage is:

- _Needed_: Required to answer the question.
- _Helpful_: Adds useful context but is not required.
- _Misleading_: Looks relevant but would lead to a wrong answer.

The viewer stays open, so you can add several passages in a row and close it with **Done**.
RAGold records where each passage was found, such as the page of a PDF, the heading in a Word document, the lines of a text file, or the cell range of a workbook.
For images and other file types such as CAD drawings or old Office formats, open the file with **Open file** and use **Enter a passage by hand** to paste the text and describe where it is.
In the form, you can change the grade of a passage, remove it, or click the magnifier to show it in its document.

#### Marking Key Facts

Write the ideal answer and click **Done editing**.
Then select words in the answer, and a popup lets you mark them as _Must mention_ or _Nice to mention_.
Key facts are highlighted in the answer and listed below it.
If you edit the answer later so that a key fact no longer appears in it, the key fact is flagged and you can remove it or restore the wording.

### Step 4: Review and Export

Your annotations appear below the form in the **Annotations** tab.
You can expand, edit, and delete annotations as needed.
When ready, use the **Export** button in the header to download your dataset as a zip archive.
{{CONTACT_NOTE}}

## Import and Export

### Exporting Your Work

The exported zip archive (`ragold-YYYYMMDD-HHMMSS.zip`) contains an `annotations.json` file with all project metadata and annotations, plus the uploaded document files.
You must fill in the **Author** and **Project** fields and create at least one annotation before exporting.

### Importing Data

The **Import** button adds the annotations and documents of an exported zip archive to the current project.
Documents with the same content as existing ones are reused, and nothing is imported if the archive is invalid.
The author, project, and notes of the archive are only taken over if the current project is still empty.
A confirmation dialog will appear before the import proceeds.

### Transfer from hivegent

In hivegent, you can send a conversation to RAGold.
RAGold opens in a new tab and asks whether to add the annotation together with the documents it cites.
Such annotations carry a **From conversation** badge that links back to the conversation.
Their passages usually have no location yet, so the viewer searches the document for the passage text and highlights it when you click the magnifier.
RAGold finds passages even when line breaks, hyphenation, or formatting differ from the document.

### Resetting Data

The **Reset** button deletes all annotations, documents, and stored files.
Click once to see the confirmation prompt, then click again within 3 seconds to confirm.

## Background

The kinds of questions follow the question types of the CRAG benchmark ([Yang et al. 2024](https://doi.org/10.52202/079017-0335)): simple, simple with condition, comparison, aggregation, set, multi-hop, post-processing, and false premise.
The answerability options follow MTRAG ([Katsis et al. 2025](https://arxiv.org/abs/2501.03468)): answerable, partial, and unanswerable.
The export uses these original names, so the data can be compared with other RAG benchmarks.

## Tips for Good Annotations

- Write questions in natural language as real users would phrase them.
- Select passages generously enough that the answer can actually be derived from them.
- For unanswerable questions, the ideal answer should explain why the question cannot be answered.
- Add misleading passages to create challenging examples that put the system to the test.
- Keep key facts short, a name, a number, or a short statement is usually best.
- Add notes when there are ambiguities or special considerations.
- Consider using AI tools like [ChatGPT](https://chatgpt.com) to draft ideal answers: enter your question, review the response, and tailor it to your documents and domain knowledge (if allowed by your organization).
- Treat AI-generated answers as a starting point and make sure the ideal answer is accurate and grounded in your passages.
