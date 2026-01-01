# Lesson 2, Part 5: Building RAG Agent

In this final part, you'll combine everything you've learned to build a complete RAG agent that can answer questions using your manufacturing knowledge base.

## Learning Objectives

By the end of this part, you will:
- [ ] Build a complete RAG API route
- [ ] Create tools for knowledge base operations
- [ ] Build a chat UI for the RAG agent
- [ ] Test the complete RAG system

## RAG Agent Architecture

The RAG agent consists of:

1. **API Route** - Handles chat requests and tool calling
2. **Tools** - `addResource` and `getInformation`
3. **Vector Store** - Loads and searches embeddings
4. **Chat UI** - Interface for users

## API Route with RAG

**File**: `app/api/rag/route.ts`

```typescript
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
          addChunks("app/(2-rag-manufacturing)/knowledge-base/embeddings.json", chunksWithIds);
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
```

## Chat UI

**File**: `app/(2-rag-manufacturing)/rag/page.tsx`

```typescript
"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function RAGPage() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    api: "/api/rag",
  });
  const isLoading = status === "streaming" || status === "submitted";

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Manufacturing Knowledge Base</h1>
        <p className="text-sm text-muted-foreground">
          Ask questions about materials, procedures, and specifications
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <Card className={message.role === "user" ? "bg-primary text-primary-foreground max-w-[80%]" : "max-w-[80%]"}>
              <CardContent className="p-3">
                {message.parts?.map((part, i) => {
                  if (part.type === "text") {
                    return <p key={i} className="text-sm whitespace-pre-wrap">{part.text}</p>;
                  }
                  if (part.type.startsWith("tool-")) {
                    return (
                      <div key={i} className="text-xs mt-2 p-2 bg-gray-100 rounded">
                        <p className="font-semibold">Tool: {part.type.replace("tool-", "")}</p>
                        {"result" in part && part.result && (
                          <pre className="text-xs mt-1 overflow-auto">
                            {JSON.stringify(part.result, null, 2)}
                          </pre>
                        )}
                      </div>
                    );
                  }
                  return null;
                })}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!input.trim()) return;
          await sendMessage({ text: input });
          setInput("");
        }}
        className="p-4 border-t flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about materials, procedures..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
```

## Testing the RAG Agent

1. **Start the dev server**: `pnpm dev`
2. **Navigate to**: `http://localhost:3000/rag`
3. **Try queries**:
   - "What are the properties of SS304?"
   - "How do I handle quality issues?"
   - "What material code should I use?"

## Key Takeaways

- **RAG combines** chunking, embedding, and similarity search
- **Tools enable** adding and querying the knowledge base
- **JSON storage** is simple and sufficient for learning
- **Cosine similarity** finds semantically relevant content

## Check Your Understanding

Before moving on, make sure you can:

- [ ] Build a complete RAG API route
- [ ] Create tools for knowledge base operations
- [ ] Understand how tools integrate with the chat
- [ ] Test the RAG agent with various queries

## Try It Yourself

- **Add more content**: Use `addResource` to expand the knowledge base
- **Test different queries**: Try various manufacturing questions
- **Improve prompts**: Refine the system prompt for better responses

## Summary

In this part, you learned:

- **RAG agent** combines all RAG components
- **Tools** enable knowledge base operations
- **Chat UI** provides user interface
- **Complete system** answers questions using your knowledge base

**Next**: Move on to [Lesson 3: Conversational AI](./03-conversational-ai-part1-introduction.md) to learn about building chatbots with tool calling!

---

**Previous**: [Part 4: Cosine Similarity](./02-rag-part4-similarity.md)  
**Next**: [Lesson 3, Part 1: Introduction to Conversational AI](./03-conversational-ai-part1-introduction.md)

