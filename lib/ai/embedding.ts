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

