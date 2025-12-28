import { generateText } from "ai";
import "dotenv/config";
import dotenvFlow from "dotenv-flow";
dotenvFlow.config();

const complexProblem = `
A company has 150 employees. They want to organize them into teams where:
- Each team has between 8-12 people
- No team should have exactly 10 people
- Teams should be as equal in size as possible
How should they organize the teams?
`;

async function compareFastVsReasoning() {
  console.log("🚀 Testing fast model (gpt-4.1)...");
  const startFast = Date.now();

  const fastResult = await generateText({
    model: "openai/gpt-4.1",
    prompt: complexProblem,
  });

  const fastTime = Date.now() - startFast;
  console.log(`⏱️  Fast model time: ${fastTime}ms`);
  console.log(
    "📝 Result preview:",
    fastResult.text.substring(0, 200) + "...\n"
  );
  console.log("🧠 Testing reasoning model (gpt-5-mini)...");
  const startReasoning = Date.now();

  const reasoningResult = await generateText({
    model: "openai/gpt-5-mini",
    prompt: complexProblem,
  });

  const reasoningTime = Date.now() - startReasoning;
  console.log(`⏱️  Reasoning model time: ${reasoningTime}ms`);
  console.log(
    "📝 Result preview:",
    reasoningResult.text.substring(0, 200) + "...\n"
  );
  console.log("📊 Performance Comparison:");
  console.log(`- Fast model: ${fastTime}ms`);
  console.log(`- Reasoning model: ${reasoningTime}ms`);
  console.log(
    `- Speed difference: ${reasoningTime - fastTime}ms slower for reasoning`
  );

  console.log("\n🎯 Key Observations:");
  console.log("- Fast models start responding immediately");
  console.log("- Reasoning models think before responding");
  console.log("- Both solve the problem, but with different approaches");
}

// TODO: Call the function to run your comparison
compareFastVsReasoning().catch(console.error);
