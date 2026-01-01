"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { UIMessage } from "ai";

// Force dynamic rendering to prevent build-time prerendering issues
export const dynamic = 'force-dynamic';

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
          if (line.trim() === "") continue;
          
          // Handle Server-Sent Events format (data: {...})
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              
              // Handle text streaming
              if (data.type === "text-delta" && data.delta) {
                const textPartIndex = assistantMessage.parts.findIndex(
                  (p) => p.type === "text"
                );

                if (textPartIndex >= 0) {
                  // Update existing text part
                  const existingPart = assistantMessage.parts[textPartIndex] as { type: "text"; text: string };
                  assistantMessage.parts[textPartIndex] = {
                    ...existingPart,
                    text: existingPart.text + data.delta,
                  };
                } else {
                  // Create new text part
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
              // Handle tool input start (tool call beginning)
              else if (data.type === "tool-input-start") {
                // Create tool part when tool call starts
                const existingToolPart = assistantMessage.parts.find(
                  (p) =>
                    p.type.startsWith("tool-") &&
                    "toolCallId" in p &&
                    p.toolCallId === data.toolCallId
                );
                
                if (!existingToolPart) {
                  assistantMessage.parts.push({
                    type: `tool-${data.toolName}`,
                    toolCallId: data.toolCallId,
                    state: "input-streaming",
                    input: "",
                  } as unknown as UIMessage["parts"][number]);
                  
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      ...assistantMessage,
                      parts: [...assistantMessage.parts],
                    };
                    return updated;
                  });
                }
              }
              // Handle tool input delta (streaming tool arguments)
              else if (data.type === "tool-input-delta") {
                const toolPart = assistantMessage.parts.find(
                  (p) =>
                    p.type.startsWith("tool-") &&
                    "toolCallId" in p &&
                    p.toolCallId === data.toolCallId
                ) as { input: string } | undefined;
                
                if (toolPart && typeof toolPart.input === "string") {
                  toolPart.input += data.inputTextDelta || "";
                  
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      ...assistantMessage,
                      parts: [...assistantMessage.parts],
                    };
                    return updated;
                  });
                }
              }
              // Handle tool calls (when tool is actually called)
              else if (data.type === "tool-call") {
                const toolPartIndex = assistantMessage.parts.findIndex(
                  (p) =>
                    p.type.startsWith("tool-") &&
                    "toolCallId" in p &&
                    p.toolCallId === data.toolCallId
                );
                
                if (toolPartIndex >= 0) {
                  // Update existing tool part
                  assistantMessage.parts[toolPartIndex] = {
                    ...assistantMessage.parts[toolPartIndex],
                    state: "call",
                    input: data.args,
                  } as unknown as UIMessage["parts"][number];
                } else {
                  // Create new tool part
                  assistantMessage.parts.push({
                    type: `tool-${data.toolName}`,
                    toolCallId: data.toolCallId,
                    state: "call",
                    input: data.args,
                  } as unknown as UIMessage["parts"][number]);
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
              // Handle tool results
              else if (data.type === "tool-result") {
                const toolPartIndex = assistantMessage.parts.findIndex(
                  (p) =>
                    p.type.startsWith("tool-") &&
                    "toolCallId" in p &&
                    p.toolCallId === data.toolCallId
                );
                if (toolPartIndex >= 0) {
                  // Update the tool part with result and state
                  assistantMessage.parts[toolPartIndex] = {
                    ...assistantMessage.parts[toolPartIndex],
                    state: "result",
                    output: data.result,
                  } as unknown as UIMessage["parts"][number];
                  
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      ...assistantMessage,
                      parts: [...assistantMessage.parts],
                    };
                    return updated;
                  });
                }
              }
            } catch {
              // Skip invalid JSON lines
            }
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
              <li>&quot;What are the properties of SS304 steel?&quot;</li>
              <li>&quot;How do I handle quality issues?&quot;</li>
              <li>&quot;What material code should I use?&quot;</li>
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
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ children }: { children?: React.ReactNode }) => (
                              <h1 className="text-lg font-bold mt-4 mb-2">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }: { children?: React.ReactNode }) => (
                              <h2 className="text-base font-bold mt-3 mb-2">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }: { children?: React.ReactNode }) => (
                              <h3 className="text-sm font-semibold mt-2 mb-1">
                                {children}
                              </h3>
                            ),
                            p: ({ children }: { children?: React.ReactNode }) => (
                              <p className="mb-2 leading-relaxed">{children}</p>
                            ),
                            ul: ({ children }: { children?: React.ReactNode }) => (
                              <ul className="list-disc list-inside mb-2 space-y-1">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }: { children?: React.ReactNode }) => (
                              <ol className="list-decimal list-inside mb-2 space-y-1">
                                {children}
                              </ol>
                            ),
                            li: ({ children }: { children?: React.ReactNode }) => (
                              <li className="ml-2">{children}</li>
                            ),
                            strong: ({ children }: { children?: React.ReactNode }) => (
                              <strong className="font-semibold">{children}</strong>
                            ),
                            em: ({ children }: { children?: React.ReactNode }) => (
                              <em className="italic">{children}</em>
                            ),
                            code: ({
                              children,
                              className,
                            }: {
                              children?: React.ReactNode;
                              className?: string;
                            }) => {
                              const isInline = !className;
                              return isInline ? (
                                <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs font-mono">
                                  {children}
                                </code>
                              ) : (
                                <code className={className}>{children}</code>
                              );
                            },
                            pre: ({ children }: { children?: React.ReactNode }) => (
                              <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto mb-2">
                                {children}
                              </pre>
                            ),
                          }}
                        >
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

