"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, isLoading } = useChat({
    api: "/api/chat",
  });

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
            <p className="mb-2">I can fetch real-time data for you:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>"What's the status of work order WO-12345?"</li>
              <li>"How many tons did we produce today?"</li>
              <li>"What's the efficiency?"</li>
              <li>"Where's the ABC Manufacturing order?"</li>
            </ul>
          </div>
        )}

        {messages.map((message) => {
          if (message.role === "user") {
            return (
              <div key={message.id} className="flex justify-end">
                <Card className="max-w-[80%] bg-primary text-primary-foreground">
                  <CardContent className="p-3">
                    <p className="text-sm whitespace-pre-wrap">{message.parts?.find((p: any) => p.type === "text")?.text || message.content || ""}</p>
                  </CardContent>
                </Card>
              </div>
            );
          }

          // Assistant messages with parts
          return (
            <div key={message.id} className="flex justify-start">
              <Card className="max-w-[80%]">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    {message.parts?.map((part: any, i: number) => {
                      switch (part.type) {
                        case "text":
                          return (
                            <div key={`${message.id}-${i}`} className="text-sm whitespace-pre-wrap">
                              {part.text}
                            </div>
                          );
                        case "tool-getWorkOrderStatus":
                        case "tool-getProductionStatus":
                          const toolName = part.type === "tool-getWorkOrderStatus" ? "Work Order Status" : "Production Status";
                          
                          // Try to find the corresponding tool invocation result
                          const toolInvocation = message.toolInvocations?.find(
                            (inv: any) => inv.toolName === (part.type === "tool-getWorkOrderStatus" ? "getWorkOrderStatus" : "getProductionStatus")
                          );
                          
                          // Check multiple possible properties for tool result
                          // Tool parts can have: result, output, or we can get it from toolInvocations
                          const result = part.result ?? part.output ?? toolInvocation?.result ?? (part.state === "result" ? part : null);
                          const hasResult = result !== null && result !== undefined && part.state !== "call" && toolInvocation?.state !== "call";
                          
                          return (
                            <div key={`${message.id}-${i}`} className="text-xs font-mono p-2 bg-gray-100 rounded border">
                              <p className="font-semibold mb-1">{toolName}</p>
                              {hasResult ? (
                                <pre className="text-xs overflow-auto">
                                  {JSON.stringify(result, null, 2)}
                                </pre>
                              ) : (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-900"></div>
                                  <span>Fetching data...</span>
                                </div>
                              )}
                            </div>
                          );
                        default:
                          return null;
                      }
                    })}
                  </div>
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
                  <span className="text-sm text-muted-foreground">Thinking...</span>
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
            // TODO: Show user-friendly error message
            // You could add a toast notification here
          }
        }}
        className="p-4 border-t flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
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

