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
Documents help you organize which text chunks come from which source.
You can skip this step and add chunks manually if preferred.

### Step 3: Create an Annotation

Switch to the **New Annotation** tab and fill in:

1. **User Query**: Write a question as a user would ask it in a chat system.
2. **Query Type**: Select how the question relates to the context:
   - _Single Fact_: The answer is one piece of information in the document.
   - _Summary_: The answer requires combining multiple pieces of information.
   - _Reasoning_: The answer must be derived through logical reasoning.
   - _Unanswerable_: The answer cannot be found or derived from the context.
3. **Relevant Document Chunks**: Add text passages that contain the information needed to answer the question.
4. **Distracting Chunks** (optional): Add passages that might seem relevant but would mislead the system.
5. **Expected Answer**: Write the ideal response the system should provide.
6. **Notes** (optional): Add any special considerations about this example.

For **Unanswerable** queries, relevant document chunks and the expected answer are optional.

### Step 4: Review and Export

Use the **Annotations** tab to review all your annotations.
You can edit or delete annotations as needed.
When ready, click **Export** in the header to download your dataset as JSON.

## Import and Export

### Exporting Your Work

The **Export** button in the header downloads your complete dataset as a JSON file.
The filename includes the current date and time (`ragold-YYYYMMDD-HHMMSS.json`).

Before you can export, you must:

- Fill in the **Author** and **Project** fields
- Create at least one annotation

The exported file contains:

- All project metadata (author, project, description)
- All annotations with their queries, chunks, and responses
- All documents from the document library

### Importing Data

The **Import** button allows you to load annotations from a previously exported JSON file.
This is useful for:

- Continuing work from a previous session
- Collaborating with others by sharing export files

When importing:

- Select a `.json` file that was exported from RAGold
- All existing annotations and documents will be replaced with the imported data
- Project metadata (author, project, description) will also be replaced
- You will be asked for confirmation before the import proceeds
- This action cannot be undone, so consider exporting your current data first

### Resetting Data

The **Reset** button deletes all annotations and documents.
Click once to see the confirmation prompt, then click again within 3 seconds to confirm.
This action cannot be undone, so consider exporting first.

## Tips for Good Annotations

- Write queries in natural language as real users would phrase them.
- Include enough context in chunks so the answer can actually be derived.
- For unanswerable queries, the expected answer should explain why the question cannot be answered.
- Add distracting chunks to create challenging examples that put the system to the test.
- Add notes when there are ambiguities or special considerations.

## What are Query Types?

The query types are based on the "Know Your RAG" taxonomy:

- **Single Fact**: Simple lookup, answer is stated directly in one place.
- **Summary**: Answer requires synthesizing information from multiple parts.
- **Reasoning**: Answer is not explicit but can be logically derived.
- **Unanswerable**: The information simply is not in the provided context.
