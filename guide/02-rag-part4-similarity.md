# Lesson 2, Part 4: Cosine Similarity

In this part, you'll learn how to calculate cosine similarity to find relevant chunks when a user asks a question. This is the core of semantic search in RAG systems.

## Learning Objectives

By the end of this part, you will:
- [ ] Understand what cosine similarity is
- [ ] Learn how to calculate cosine similarity
- [ ] Implement similarity search over embeddings
- [ ] Find top matches for user queries

## What is Cosine Similarity?

**Cosine similarity** measures the similarity between two vectors by calculating the cosine of the angle between them. It ranges from -1 to 1:

- **1.0**: Identical meaning (vectors point in same direction)
- **0.0**: Orthogonal (no relationship)
- **-1.0**: Opposite meaning

For embeddings, cosine similarity works well because it focuses on direction (meaning) rather than magnitude.

## Calculating Cosine Similarity

The formula is:

```
cosineSimilarity = dotProduct(a, b) / (magnitude(a) * magnitude(b))
```

Where:
- `dotProduct(a, b)` = sum of a[i] * b[i] for all i
- `magnitude(a)` = sqrt(sum of a[i]² for all i)

## Implementation: Cosine Similarity

**File**: `lib/ai/embedding.ts` (add function)

```typescript
export function calculateCosineSimilarity(
  vecA: number[],
  vecB: number[]
): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }

  // Dot product
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }

  // Magnitudes
  let magnitudeA = 0;
  let magnitudeB = 0;
  for (let i = 0; i < vecA.length; i++) {
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  // Cosine similarity
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  return dotProduct / (magnitudeA * magnitudeB);
}
```

## Finding Relevant Content

**File**: `lib/vector-store.ts` (add function)

```typescript
import { generateEmbedding } from "./ai/embedding";
import { calculateCosineSimilarity } from "./ai/embedding";

export interface SimilarChunk {
  content: string;
  similarity: number;
  source: string;
  metadata?: Record<string, any>;
}

export async function findRelevantContent(
  filePath: string,
  userQuery: string,
  threshold: number = 0.5,
  topK: number = 4
): Promise<SimilarChunk[]> {
  // Load embeddings
  const store = loadEmbeddings(filePath);

  // Generate embedding for user query
  const queryEmbedding = await generateEmbedding(userQuery);

  // Calculate similarity with all chunks
  const similarities: SimilarChunk[] = store.chunks.map((chunk) => ({
    content: chunk.content,
    similarity: calculateCosineSimilarity(queryEmbedding, chunk.embedding),
    source: chunk.source,
    metadata: chunk.metadata,
  }));

  // Filter by threshold and sort by similarity
  const relevant = similarities
    .filter((chunk) => chunk.similarity > threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);

  return relevant;
}
```

## Demo: Similarity Search

Add to demo script:

```typescript
import { findRelevantContent } from "./lib/vector-store";

// User query
const query = "What are the properties of SS304 steel?";

// Find relevant chunks
const relevant = await findRelevantContent(
  "embeddings.json",
  query,
  0.5, // threshold
  4    // top 4 results
);

console.log(`\n🔍 Query: "${query}"\n`);
console.log(`Found ${relevant.length} relevant chunks:\n`);

relevant.forEach((chunk, i) => {
  console.log(`Result ${i + 1} (similarity: ${chunk.similarity.toFixed(3)}):`);
  console.log(chunk.content.substring(0, 150) + "...\n");
});
```

## Similarity Thresholds

Choosing the right threshold:

- **0.7+**: Very similar, high confidence
- **0.5-0.7**: Relevant, moderate confidence
- **0.3-0.5**: Somewhat related, low confidence
- **<0.3**: Not relevant

For manufacturing knowledge bases, **0.5** is a good starting point.

## Check Your Understanding

Before moving on, make sure you can:

- [ ] Explain what cosine similarity measures
- [ ] Understand the similarity range (-1 to 1)
- [ ] Know how to find top matches using similarity
- [ ] Understand threshold selection

## Try It Yourself

- **Test different queries**: Try various questions and see what chunks match
- **Adjust threshold**: Change the threshold and see how results change
- **Compare similarities**: Query similar and different topics

## Summary

In this part, you learned:

- **Cosine similarity** measures semantic similarity between embeddings
- **Calculation** involves dot product and magnitudes
- **Search** finds top matches above a threshold
- **Threshold tuning** affects result quality

In the next part, you'll build a complete RAG agent that uses this for answering questions.

---

**Previous**: [Part 3: Embeddings](./02-rag-part3-embeddings.md)  
**Next**: [Part 5: Building RAG Agent](./02-rag-part5-building-rag-agent.md)

