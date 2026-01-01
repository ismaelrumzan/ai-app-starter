# Lesson 2, Part 2: Chunking

In this part, you'll learn how to break down manufacturing documents into smaller, searchable chunks that can be embedded and retrieved efficiently.

## Learning Objectives

By the end of this part, you will:
- [ ] Understand why chunking is necessary
- [ ] Learn different chunking strategies
- [ ] Implement sentence-based chunking for manufacturing docs
- [ ] See how chunking affects search quality

## What is Chunking?

**Chunking** refers to the process of breaking down a particular source material into smaller pieces. Since embeddings work best with smaller text segments, chunking is essential for RAG systems.

### Why Chunking Matters

- **Embedding quality**: Larger inputs produce lower quality embeddings
- **Search precision**: Smaller chunks allow more precise matching
- **Context relevance**: Retrieving specific chunks is better than entire documents
- **Performance**: Smaller chunks are faster to process and search

## Chunking Strategies

There are many approaches to chunking:

1. **Sentence-based** - Split by sentences (periods)
2. **Paragraph-based** - Split by paragraphs
3. **Fixed-size** - Split into fixed character/token counts
4. **Semantic** - Split at semantic boundaries
5. **Overlapping** - Include some overlap between chunks

For manufacturing documents, **sentence-based chunking** works well because:
- Technical specifications are often sentence-structured
- Each sentence can be a complete unit of information
- Easy to implement and understand

## Implementation: Generate Chunks

**File**: `lib/ai/embedding.ts`

```typescript
const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split('.')
    .filter(i => i !== '')
    .map(chunk => chunk.trim());
};
```

This function:
1. Splits text by periods (sentences)
2. Filters out empty chunks
3. Trims whitespace from each chunk

## Handling Manufacturing Documents

Manufacturing documents often contain:
- **JSON data** - Material specs, charts
- **Structured text** - Procedures, guidelines
- **Mixed formats** - Tables, lists, paragraphs

### Example: Chunking Material Specs

For JSON data, you might want to:
1. Convert JSON to readable text
2. Chunk the text representation
3. Preserve metadata (source, material type)

```typescript
function chunkMaterialSpecs(specs: any[]): string[] {
  const chunks: string[] = [];
  
  for (const spec of specs) {
    // Create a readable description
    const description = `${spec.steelGrade} steel has the following properties: 
      Chemical composition includes ${spec.composition}. 
      Mechanical properties: yield strength ${spec.yieldStrength} MPa, 
      tensile strength ${spec.tensileStrength} MPa. 
      Dimensions: thickness ${spec.thicknessRange}mm, 
      width ${spec.widthRange}mm.`;
    
    // Chunk the description
    const specChunks = generateChunks(description);
    chunks.push(...specChunks);
  }
  
  return chunks;
}
```

## Demo: Chunking Sample Data

Create a demo script to see chunking in action:

**File**: `app/(2-rag-manufacturing)/demo-chunking-similarity.ts` (partial)

```typescript
import dotenvFlow from "dotenv-flow";
dotenvFlow.config();
import fs from "fs";

const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split('.')
    .filter(i => i !== '')
    .map(chunk => chunk.trim());
};

async function main() {
  // Load sample manufacturing data
  const materialSpecs = JSON.parse(
    fs.readFileSync(
      "app/(2-rag-manufacturing)/knowledge-base/material-specs.json",
      "utf-8"
    )
  );

  console.log("📄 Original Document Length:", JSON.stringify(materialSpecs).length);
  
  // Convert to text and chunk
  const text = JSON.stringify(materialSpecs, null, 2);
  const chunks = generateChunks(text);
  
  console.log(`\n✂️  Generated ${chunks.length} chunks\n`);
  
  // Display first few chunks
  chunks.slice(0, 5).forEach((chunk, i) => {
    console.log(`Chunk ${i + 1} (${chunk.length} chars):`);
    console.log(chunk.substring(0, 100) + "...\n");
  });
}

main().catch(console.error);
```

## Chunking Best Practices

### 1. Preserve Context

Keep related information together:
- Don't split mid-sentence
- Keep specifications with their values
- Maintain relationships between data points

**For detailed material specifications**: Consider keeping each material spec as a single comprehensive chunk rather than splitting by sentences. This ensures all properties (chemical, mechanical, physical) stay together for better semantic search.

### 2. Add Metadata

Store metadata with each chunk:
- Source document
- Material type
- Section or category

### 3. Handle Special Cases

- **Tables**: Convert to text descriptions
- **Lists**: Each item can be a chunk
- **Code blocks**: Keep as single chunks if small

## Check Your Understanding

Before moving on, make sure you can:

- [ ] Explain why chunking is necessary for embeddings
- [ ] Understand sentence-based chunking
- [ ] Know how to handle different document formats
- [ ] Understand the relationship between chunk size and search quality

## Try It Yourself

- **Modify chunking strategy**: Try paragraph-based or fixed-size chunking
- **Test with different documents**: See how chunking varies by document type
- **Add metadata**: Include source information with each chunk

## Summary

In this part, you learned:

- **Chunking** breaks documents into smaller, embeddable pieces
- **Sentence-based chunking** works well for manufacturing docs
- **Metadata** helps preserve context and source information
- **Chunking strategy** affects search quality

In the next part, you'll learn how to generate embeddings for these chunks.

---

**Previous**: [Part 1: Introduction](./02-rag-part1-introduction.md)  
**Next**: [Part 3: Embeddings](./02-rag-part3-embeddings.md)

