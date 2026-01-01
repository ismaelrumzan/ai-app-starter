import { convertToModelMessages, streamText, tool, UIMessage, stepCountIs } from "ai";
import { z } from "zod";
import { findRelevantContent, addChunks } from "@/lib/vector-store";
import { generateEmbeddings } from "@/lib/ai/embedding";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: "openai/gpt-4o",
    system: `You are a manufacturing knowledge assistant. 
    Only respond using information from your knowledge base.
    If no relevant information is found, respond "Sorry, I don't know."`,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      addResource: tool({
        description: "Add manufacturing documentation to the knowledge base",
        inputSchema: z.object({
          content: z.string().describe("The content to add"),
        }),
        execute: async ({ content }) => {
          const chunks = await generateEmbeddings(content);
          const chunksWithIds = chunks.map((chunk, i) => ({
            id: `chunk_${Date.now()}_${i}`,
            content: chunk.content,
            embedding: chunk.embedding,
            source: "user-added",
          }));
          addChunks(
            "app/(2-rag-manufacturing)/knowledge-base/embeddings.json",
            chunksWithIds
          );
          return "Resource added successfully";
        },
      }),
      getInformation: tool({
        description: "Get information from the knowledge base to answer questions",
        inputSchema: z.object({
          question: z.string().describe("The user's question"),
        }),
        execute: async ({ question }) => {
          const relevant = await findRelevantContent(
            "app/(2-rag-manufacturing)/knowledge-base/embeddings.json",
            question,
            0.5,
            4
          );
          return relevant;
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}

