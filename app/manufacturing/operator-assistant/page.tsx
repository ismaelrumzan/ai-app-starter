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
            <p className="mb-2">I can fetch real-time data for you:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>&quot;What&apos;s the status of work order WO-12345?&quot;</li>
              <li>&quot;How many tons did we produce today?&quot;</li>
              <li>&quot;What&apos;s the efficiency?&quot;</li>
              <li>&quot;Where&apos;s the ABC Manufacturing order?&quot;</li>
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
                      {message.parts?.find((p): p is { type: "text"; text: string } => p.type === "text")?.text || ""}
                    </p>
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
                    {message.parts?.map((part, i: number) => {
                      if (part.type === "text") {
                        return (
                          <div key={`${message.id}-${i}`} className="text-sm whitespace-pre-wrap">
                            {part.text}
                          </div>
                        );
                      }
                      
                      // Handle tool parts - check if it's a tool-related part
                      if (part.type.startsWith("tool-")) {
                        // Extract tool name from type (e.g., "tool-getWorkOrderStatus" -> "getWorkOrderStatus")
                        const toolType = part.type.replace("tool-", "");
                        const toolName = toolType === "getWorkOrderStatus" ? "Work Order Status" : 
                                        toolType === "getProductionStatus" ? "Production Status" : 
                                        toolType;
                        
                        // Check if we have a result by looking at the part structure
                        const hasResult = "result" in part && part.result !== undefined;
                        const result = hasResult ? (part as { result: unknown }).result : null;
                        
                        return (
                          <div key={`${message.id}-${i}`} className="text-xs font-mono p-2 bg-gray-100 rounded border">
                            <p className="font-semibold mb-1">{toolName}</p>
                            {!hasResult ? (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-900"></div>
                                <span>Fetching data...</span>
                              </div>
                            ) : (
                              <pre className="text-xs overflow-auto">
                                {JSON.stringify(result, null, 2)}
                              </pre>
                            )}
                          </div>
                        );
                      }
                      
                      return null;
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

