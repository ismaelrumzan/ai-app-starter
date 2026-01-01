# Lesson 3, Part 2: Basic Chat Interface

In this part, you'll learn how to create a basic chat interface using the AI SDK's `useChat` hook and set up streaming responses.

## Learning Objectives

By the end of this part, you will:
- [ ] Create a chat interface using `useChat` hook
- [ ] Set up an API route for chat
- [ ] Understand streaming responses
- [ ] Handle chat state and messages

## Creating the Chat Interface

**File**: `app/(3-conversational-ai-manufacturing)/operator-assistant/page.tsx`

```typescript
"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat();
  const isLoading = status === "streaming" || status === "submitted";

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Operator Assistant</h1>
        <p className="text-sm text-muted-foreground">
          Ask questions about production status, work orders, and equipment
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <p className="mb-2">I can help you with:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>"What's the status of work order WO-12345?"</li>
              <li>"How many tons did we produce today?"</li>
              <li>"What's the efficiency?"</li>
            </ul>
          </div>
        )}

        {messages.map((message) => {
          if (message.role === "user") {
            return (
              <div key={message.id} className="flex justify-end">
                <Card className="max-w-[80%] bg-primary text-primary-foreground">
                  <CardContent className="p-3">
                    <p className="text-sm whitespace-pre-wrap">
                      {message.parts?.find(
                        (p): p is { type: "text"; text: string } =>
                          p.type === "text"
                      )?.text || ""}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          }

          return (
            <div key={message.id} className="flex justify-start">
              <Card className="max-w-[80%]">
                <CardContent className="p-3">
                  {message.parts?.map((part, i) => {
                    if (part.type === "text") {
                      return (
                        <p
                          key={`${message.id}-${i}`}
                          className="text-sm whitespace-pre-wrap"
                        >
                          {part.text}
                        </p>
                      );
                    }
                    return null;
                  })}
                </CardContent>
              </Card>
            </div>
          );
        })}

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
          try {
            await sendMessage({ text: input });
            setInput("");
          } catch (error) {
            console.error("Failed to send message:", error);
          }
        }}
        className="p-4 border-t flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder="Ask about production status or work orders..."
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

## API Route

**File**: `app/api/chat/route.ts`

```typescript
import { convertToModelMessages, streamText, UIMessage } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: "openai/gpt-4.1",
    system: `You are an AI assistant for a steel manufacturing plant. Help operators with:
- Production status queries (daily totals, efficiency, quality rates)
- Work order progress and status

Always provide accurate, up-to-date information.
Be concise and use manufacturing terminology appropriately.`,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
```

## Key Concepts

### useChat Hook

The `useChat` hook provides:
- **messages** - Array of chat messages
- **sendMessage** - Function to send new messages
- **status** - Current status (idle, streaming, submitted)
- **Automatic state management** - Handles message history

### Streaming Responses

Responses stream in real-time:
- Users see text appear as it's generated
- Better user experience than waiting for complete response
- Uses `toUIMessageStreamResponse()` for proper formatting

### Message Parts

Messages can have multiple parts:
- **text** - Text content
- **tool-*** - Tool call results (covered in next part)

## Check Your Understanding

Before moving on, make sure you can:

- [ ] Create a chat interface with `useChat`
- [ ] Set up an API route for chat
- [ ] Understand how streaming works
- [ ] Handle message display and input

## Try It Yourself

- **Customize the UI**: Change styling, add avatars, improve layout
- **Add features**: Clear chat, export conversation
- **Test streaming**: See how responses appear in real-time

## Summary

In this part, you learned:

- **useChat hook** simplifies chat state management
- **API route** handles chat requests and streaming
- **Streaming** provides real-time responses
- **Basic chat** is the foundation for tool calling

In the next part, you'll learn how to add tool calling for real-time data.

---

**Previous**: [Part 1: Introduction](./03-conversational-ai-part1-introduction.md)  
**Next**: [Part 3: Tool Calling](./03-conversational-ai-part3-tool-calling.md)

