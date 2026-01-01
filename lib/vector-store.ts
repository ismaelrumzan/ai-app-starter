import fs from "fs";
import { generateEmbedding, calculateCosineSimilarity } from "./ai/embedding";

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

export interface SimilarChunk {
  content: string;
  similarity: number;
  source: string;
  metadata?: Record<string, any>;
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

