# Lesson 2, Part 3: Embeddings

In this part, you'll learn how to generate embeddings for your document chunks using the AI SDK, enabling semantic search over your manufacturing knowledge base.

## Learning Objectives

By the end of this part, you will:
- [ ] Understand what embeddings are and how they work
- [ ] Learn how to generate embeddings using the AI SDK
- [ ] Implement batch embedding generation
- [ ] Store embeddings for later retrieval

## What are Embeddings?

**Embeddings** are vector representations of text that capture semantic meaning. In a high-dimensional space (typically 1536 dimensions for OpenAI's model), similar words and phrases are close to each other.

### Key Properties

- **Semantic meaning**: Similar concepts have similar embeddings
- **Fixed dimensions**: Each embedding is a fixed-size vector (e.g., 1536 numbers)
- **Mathematical operations**: Can calculate similarity between embeddings
- **Language agnostic**: Works across languages (with appropriate models)

## Generating Embeddings with AI SDK

The AI SDK provides `embed` and `embedMany` functions for generating embeddings.

### Single Embedding

```typescript
import { embed } from "ai";

const { embedding } = await embed({
  model: "openai/text-embedding-ada-002",
  value: "SS304 steel has 18% chromium and 8% nickel",
});
// embedding is an array of 1536 numbers
```

### Batch Embeddings

```typescript
import { embedMany } from "ai";

const { embeddings } = await embedMany({
  model: "openai/text-embedding-ada-002",
  values: [
    "SS304 steel properties",
    "SS316 steel composition",
    "Material thickness specifications",
  ],
});
// embeddings is an array of embedding arrays
```

## Implementation: Generate Embeddings

**File**: `lib/ai/embedding.ts`

```typescript
import dotenvFlow from "dotenv-flow";
dotenvFlow.config();
import { embed, embedMany } from "ai";

const embeddingModel = "openai/text-embedding-ada-002";

const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split(".")
    .filter((i) => i !== "")
    .map((chunk) => chunk.trim());
};

export const generateEmbeddings = async (
  value: string
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll("\\n", " ");
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
};
```

## Storing Embeddings

Since we're using JSON-based storage (no database), we'll store embeddings in a JSON file:

**File**: `lib/vector-store.ts`

```typescript
import fs from "fs";

export interface ChunkWithEmbedding {
  id: string;
  content: string;
  embedding: number[];
  source: string;
  metadata?: Record<string, any>;
}

export interface EmbeddingStore {
  chunks: ChunkWithEmbedding[];
}

export function loadEmbeddings(filePath: string): EmbeddingStore {
  if (!fs.existsSync(filePath)) {
    return { chunks: [] };
  }
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

export function saveEmbeddings(
  filePath: string,
  store: EmbeddingStore
): void {
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
}

export function addChunks(
  filePath: string,
  chunks: ChunkWithEmbedding[]
): void {
  const store = loadEmbeddings(filePath);
  store.chunks.push(...chunks);
  saveEmbeddings(filePath, store);
}
```

## Demo: Generating Embeddings

Add to the demo script:

```typescript
import { generateEmbeddings } from "./lib/ai/embedding";
import { addChunks } from "./lib/vector-store";

// Generate embeddings for chunks
// Note: generateEmbeddings internally calls generateChunks
const chunksWithEmbeddings = await generateEmbeddings(text);

// Add IDs and metadata
const chunksWithIds = chunksWithEmbeddings.map((chunk, i) => ({
  id: `chunk_${i}`,
  content: chunk.content,
  embedding: chunk.embedding,
  source: "material-specs.json",
  metadata: { index: i },
}));

// Save to JSON
addChunks("embeddings.json", chunksWithIds);
```

## Check Your Understanding

Before moving on, make sure you can:

- [ ] Explain what embeddings are and why they're useful
- [ ] Understand the difference between `embed` and `embedMany`
- [ ] Know how to store embeddings in JSON format
- [ ] Understand the relationship between chunks and embeddings

## Try It Yourself

- **Generate embeddings**: Run the demo script and see embeddings generated
- **Inspect embeddings**: Log an embedding to see its structure (array of numbers)
- **Compare embeddings**: Generate embeddings for similar and different text

## Summary

In this part, you learned:

- **Embeddings** are vector representations of text meaning
- **AI SDK** provides `embed` and `embedMany` for generation
- **JSON storage** is simple and sufficient for learning
- **Batch processing** is efficient for multiple chunks

In the next part, you'll learn how to use cosine similarity to find relevant chunks.

---

**Previous**: [Part 2: Chunking](./02-rag-part2-chunking.md)  
**Next**: [Part 4: Cosine Similarity](./02-rag-part4-similarity.md)

