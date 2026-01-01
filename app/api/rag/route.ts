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
    
IMPORTANT: You MUST use the getInformation tool to retrieve information from the knowledge base before answering ANY question. Do NOT answer from your training data - always call getInformation first.

Steps:
1. When a user asks a question, ALWAYS call getInformation with their question
2. Use ALL the information returned from getInformation to provide a comprehensive answer
3. Include all relevant details from the retrieved results (properties, specifications, procedures, etc.)
4. If getInformation returns no results or empty results, respond "Sorry, I don't have that information in my knowledge base."
5. Never make up information or use your training data - only use what getInformation returns
6. Format your response clearly with proper structure (lists, sections, etc.) when presenting multiple pieces of information`,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      addResource: tool({
        description: "Add manufacturing documentation to the knowledge base. Use this when the user provides information to store.",
        inputSchema: z.object({
          content: z.string().describe("The content to add to the knowledge base"),
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
        description: "REQUIRED: Use this tool to search the knowledge base for information to answer user questions. You MUST call this tool for every question before answering.",
        inputSchema: z.object({
          question: z.string().describe("The user's question to search for in the knowledge base"),
        }),
        execute: async ({ question }) => {
          const relevant = await findRelevantContent(
            "app/(2-rag-manufacturing)/knowledge-base/embeddings.json",
            question,
            0.5,
            4
          );
          if (relevant.length === 0) {
            return { message: "No relevant information found in the knowledge base." };
          }
          return {
            found: relevant.length,
            results: relevant.map((r) => ({
              content: r.content,
              similarity: r.similarity,
              source: r.source,
            })),
          };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}

