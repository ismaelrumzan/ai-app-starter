import { convertToModelMessages, streamText, stepCountIs, UIMessage } from "ai";
import { getWorkOrderStatus } from "@/app/manufacturing/tools/getWorkOrderStatus";
import { getProductionStatus } from "@/app/manufacturing/tools/getProductionStatus";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: "openai/gpt-4.1",
      system: `You are an AI assistant for a steel manufacturing plant. Help operators with:
- Production status queries (daily totals, efficiency, quality rates)
- Work order progress and status

Use the available tools to fetch real-time data when operators ask questions.
Always provide accurate, up-to-date information.
Be concise and use manufacturing terminology appropriately.`,
      messages: await convertToModelMessages(messages),
      tools: {
        getWorkOrderStatus,
        getProductionStatus,
      },
      stopWhen: stepCountIs(5),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);

    // Return a proper error response
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
