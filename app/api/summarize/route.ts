import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  const { data } = await req.json();

  const result = await generateText({
    model: openai("gpt-4.1"),
    prompt: `Summarize the following production data in 3-4 bullet points, highlighting key achievements, issues, and metrics:\n\n${JSON.stringify(data, null, 2)}`,
  });

  return Response.json({ text: result.text });
}

