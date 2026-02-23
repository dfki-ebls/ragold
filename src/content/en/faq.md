# User Guide

Welcome to RAGold!
This tool helps you create training examples for Retrieval-Augmented Generation (RAG) systems.
Follow these steps to create your first annotation.

### Step 1: Set Up Your Project

Fill in the **Author** and **Project** fields at the top of the page.
These metadata fields are required before you can export your annotations.
You can also add an optional **Description** for the dataset.

### Step 2: Add Documents (Optional)

Go to the **Documents** tab to add reference documents.
Each document has a filename and a description.
When you later create chunks, you can link each chunk to one of these documents.
You can skip this step and enter chunks manually if preferred.

### Step 3: Create an Annotation

Switch to the **Annotations** tab and fill in:

1. **User Query**: Write a question as a user would ask it in a chat system.
2. **Query Type**: Select how the question relates to the context (based on the "Know Your RAG" taxonomy):
   - _Single Fact_: Simple lookup — the answer is stated directly in one place.
   - _Summary_: The answer requires synthesizing information from multiple parts.
   - _Reasoning_: The answer is not explicit but can be logically derived.
   - _Unanswerable_: The information is not in the provided context.
3. **Relevant Document Chunks**: Add text passages that contain the information needed to answer the question.
4. **Distracting Chunks** (optional): Add passages that might seem relevant but would mislead the system.
5. **Expected Answer**: Write the ideal response the system should provide.
6. **Notes** (optional): Add any special considerations about this example.

For **Unanswerable** queries, relevant document chunks and the expected answer are optional.

### Step 4: Review and Export

Your annotations appear below the form in the **Annotations** tab.
You can expand, edit, and delete annotations as needed.
When ready, use the **Export** button in the header to download your dataset as JSON.

## Import and Export

### Exporting Your Work

The exported JSON file (`ragold-YYYYMMDD-HHMMSS.json`) contains all project metadata, annotations, and documents.
You must fill in the **Author** and **Project** fields and create at least one annotation before exporting.

### Importing Data

The **Import** button loads a previously exported JSON file, replacing all current data (annotations, documents, and metadata).
A confirmation dialog will appear before the import proceeds.
This action cannot be undone, so consider exporting your current data first.

### Resetting Data

The **Reset** button deletes all annotations and documents.
Click once to see the confirmation prompt, then click again within 3 seconds to confirm.

## Tips for Good Annotations

- Write queries in natural language as real users would phrase them.
- Include enough context in chunks so the answer can actually be derived.
- For unanswerable queries, the expected answer should explain why the question cannot be answered.
- Add distracting chunks to create challenging examples that put the system to the test.
- Add notes when there are ambiguities or special considerations.

## Using AI Tools for Inspiration

You can use tools like [ChatGPT](https://chatgpt.com) to get a rough idea of what a good answer might look like (if allowed by your organization).
Enter your user query, review the generated response, and then tailor it to your specific documents and domain knowledge.
AI-generated answers are a starting point — always ensure the expected answer is accurate and grounded in your actual document chunks.
