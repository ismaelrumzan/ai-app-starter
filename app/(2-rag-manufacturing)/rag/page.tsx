"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ children }: any) => (
                              <h1 className="text-lg font-bold mt-4 mb-2">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }: any) => (
                              <h2 className="text-base font-bold mt-3 mb-2">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }: any) => (
                              <h3 className="text-sm font-semibold mt-2 mb-1">
                                {children}
                              </h3>
                            ),
                            p: ({ children }: any) => (
                              <p className="mb-2 leading-relaxed">{children}</p>
                            ),
                            ul: ({ children }: any) => (
                              <ul className="list-disc list-inside mb-2 space-y-1">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }: any) => (
                              <ol className="list-decimal list-inside mb-2 space-y-1">
                                {children}
                              </ol>
                            ),
                            li: ({ children }: any) => (
                              <li className="ml-2">{children}</li>
                            ),
                            strong: ({ children }: any) => (
                              <strong className="font-semibold">{children}</strong>
                            ),
                            em: ({ children }: any) => (
                              <em className="italic">{children}</em>
                            ),
                            code: ({ children, className }: any) => {
                              const isInline = !className;
                              return isInline ? (
                                <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs font-mono">
                                  {children}
                                </code>
                              ) : (
                                <code className={className}>{children}</code>
                              );
                            },
                            pre: ({ children }: any) => (
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
                      "result" in part && part.result !== undefined;
                    return (
                      <div
                        key={`${message.id}-${i}`}
                        className="text-xs mt-2 p-2 bg-gray-100 rounded"
                      >
                        <p className="font-semibold">
                          {hasResult ? "Called" : "Calling"} tool: {toolName}
                        </p>
                        {hasResult && (
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

