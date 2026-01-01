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
```

## Chat UI

**File**: `app/(2-rag-manufacturing)/rag/page.tsx`

The RAG chat UI uses manual streaming to handle the `/api/rag` endpoint. This is because `useChat` in `@ai-sdk/react` v3.0.0 doesn't support custom endpoints directly.

### Understanding Server-Sent Events (SSE)

**Server-Sent Events (SSE)** is a standard for streaming data from a server to a client. The server sends text in a specific format:
- Each line starts with `data: ` followed by JSON
- Lines are separated by newlines
- The client reads the stream incrementally

**Why Manual Parsing?**
- `useChat` hook expects `/api/chat` endpoint by default
- We need to use `/api/rag` for our RAG system
- Manual parsing gives us control over the stream

**Key Concepts:**
- **`ReadableStream`**: The response body is a stream of bytes
- **`TextDecoder`**: Converts bytes to text
- **Buffer**: Accumulates partial lines until we have complete JSON

Let's implement manual SSE parsing:

```typescript
"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { UIMessage } from "ai";

export default function RAGPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async ({ text }: { text: string }) => {
    if (!text.trim() || isLoading) return;

    const userMessage: UIMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      parts: [{ type: "text", text }],
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      const assistantMessage: UIMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        parts: [],
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Parse Server-Sent Events stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim() === "" || !line.startsWith("data: ")) continue;

          try {
            const data = JSON.parse(line.slice(6));

            // Handle text streaming
            if (data.type === "text-delta" && data.delta) {
              const existingTextPart = assistantMessage.parts.find(
                (p) => p.type === "text"
              ) as { type: "text"; text: string } | undefined;

              if (existingTextPart) {
                existingTextPart.text += data.delta;
              } else {
                assistantMessage.parts.push({
                  type: "text",
                  text: data.delta,
                });
              }

              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...assistantMessage,
                  parts: [...assistantMessage.parts],
                };
                return updated;
              });
            }

            // Handle tool calls (simplified - see actual code for full implementation)
            // ... tool call handling code ...
          } catch {
            // Skip invalid JSON lines
          }
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Manufacturing Knowledge Base</h1>
        <p className="text-sm text-muted-foreground">
          Ask questions about materials, procedures, and specifications
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <p className="mb-2">I can help you with:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>"What are the properties of SS304 steel?"</li>
              <li>"How do I handle quality issues?"</li>
              <li>"What material code should I use?"</li>
            </ul>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === "user"
                ? "flex justify-end"
                : "flex justify-start"
            }
          >
            <Card
              className={
                message.role === "user"
                  ? "bg-primary text-primary-foreground max-w-[80%]"
                  : "max-w-[80%]"
              }
            >
              <CardContent className="p-3">
                {message.parts?.map((part, i) => {
                  if (part.type === "text") {
                    return (
                      <div
                        key={`${message.id}-${i}`}
                        className="text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {part.text}
                        </ReactMarkdown>
                      </div>
                    );
                  }
                  if (part.type.startsWith("tool-")) {
                    const toolName = part.type.replace("tool-", "");
                    const hasResult =
                      ("output" in part && part.output !== undefined) ||
                      ("result" in part && part.result !== undefined);
                    const result: unknown = "output" in part ? part.output : 
                                  "result" in part ? part.result : 
                                  undefined;
                    return (
                      <div
                        key={`${message.id}-${i}`}
                        className="text-xs mt-2 p-2 bg-gray-100 rounded"
                      >
                        <p className="font-semibold">
                          {hasResult ? "Called" : "Calling"} tool: {toolName}
                        </p>
                        {hasResult && result !== undefined ? (
                          <pre className="text-xs mt-1 overflow-auto">
                            {JSON.stringify(result, null, 2)}
                          </pre>
                        ) : null}
                      </div>
                    );
                  }
                  return null;
                })}
              </CardContent>
            </Card>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  <span className="text-sm text-muted-foreground">
                    Thinking...
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
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

**Note**: The full implementation includes complete SSE parsing for tool calls (`tool-input-start`, `tool-input-delta`, `tool-call`, `tool-result` events). 

### Understanding the Stream Parsing

The code above shows the core pattern:
1. **Read stream**: `reader.read()` gets chunks of bytes
2. **Decode to text**: `TextDecoder` converts bytes to strings
3. **Buffer lines**: Accumulate until we have complete lines
4. **Parse JSON**: Extract `data: {...}` and parse the JSON
5. **Update UI**: React state updates trigger re-renders

For production, you'd want to handle all event types. The actual code file (`app/(2-rag-manufacturing)/rag/page.tsx`) shows the complete implementation with tool call handling.

**Key Takeaway**: Manual streaming gives you full control, but `useChat` is simpler when you can use the default endpoint. For custom endpoints like `/api/rag`, manual parsing is necessary.

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

