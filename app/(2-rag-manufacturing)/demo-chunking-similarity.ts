import dotenvFlow from "dotenv-flow";
dotenvFlow.config();
import fs from "fs";
import { generateEmbeddings, generateEmbedding, calculateCosineSimilarity } from "@/lib/ai/embedding";
import { addChunks, findRelevantContent } from "@/lib/vector-store";

async function main() {
  console.log("🔍 RAG Demo: Chunking and Cosine Similarity\n");
  console.log("=".repeat(60));

  // Load sample manufacturing data
  const knowledgeBasePath = "app/(2-rag-manufacturing)/knowledge-base";
  
  console.log("\n📄 Step 1: Loading sample manufacturing data...\n");
  
  const materialSpecs = JSON.parse(
    fs.readFileSync(`${knowledgeBasePath}/material-specs.json`, "utf-8")
  );
  const materialCharts = JSON.parse(
    fs.readFileSync(`${knowledgeBasePath}/material-charts.json`, "utf-8")
  );
  const procedures = JSON.parse(
    fs.readFileSync(`${knowledgeBasePath}/production-procedures.json`, "utf-8")
  );
  
  console.log(`✓ Loaded material-specs.json (${materialSpecs.length} entries)`);
  console.log(`✓ Loaded material-charts.json (${materialCharts.length} entries)`);
  console.log(`✓ Loaded production-procedures.json (${procedures.length} entries)`);

  // Convert to readable text format for chunking
  console.log("\n✂️  Step 2: Generating chunks and embeddings...\n");

  // Add IDs and metadata (track which source each chunk came from)
  let chunkIndex = 0;
  const chunksWithIds: Array<{
    id: string;
    content: string;
    embedding: number[];
    source: string;
    metadata?: Record<string, any>;
  }> = [];
  
  // Process material specs chunks
  const specsText = materialSpecs.map((spec: any) => 
    `${spec.steelGrade} steel: ${spec.description}. Chemical composition includes chromium ${spec.chemicalComposition.chromium}, nickel ${spec.chemicalComposition.nickel}. Mechanical properties: yield strength ${spec.mechanicalProperties.yieldStrength}, tensile strength ${spec.mechanicalProperties.tensileStrength}. Applications include ${spec.applications.join(", ")}.`
  ).join(" ");
  const specsChunks = await generateEmbeddings(specsText);
  specsChunks.forEach((chunk) => {
    chunksWithIds.push({
      id: `chunk_${chunkIndex++}`,
      content: chunk.content,
      embedding: chunk.embedding,
      source: "material-specs.json",
      metadata: { type: "material-spec" },
    });
  });
  
  // Process material charts chunks
  const chartsText = materialCharts.map((chart: any) =>
    `Material code ${chart.materialCode}: ${chart.description}. Applicable grades: ${chart.applicableGrades.join(", ")}. Thickness range: ${chart.thicknessRange.min}-${chart.thicknessRange.max}${chart.thicknessRange.unit}.`
  ).join(" ");
  const chartsChunks = await generateEmbeddings(chartsText);
  chartsChunks.forEach((chunk) => {
    chunksWithIds.push({
      id: `chunk_${chunkIndex++}`,
      content: chunk.content,
      embedding: chunk.embedding,
      source: "material-charts.json",
      metadata: { type: "material-chart" },
    });
  });
  
  // Process procedures chunks
  const proceduresText = procedures.map((proc: any) =>
    `Procedure ${proc.procedureId}: ${proc.title}. Steps: ${proc.steps.join(". ")}.`
  ).join(" ");
  const proceduresChunks = await generateEmbeddings(proceduresText);
  proceduresChunks.forEach((chunk) => {
    chunksWithIds.push({
      id: `chunk_${chunkIndex++}`,
      content: chunk.content,
      embedding: chunk.embedding,
      source: "production-procedures.json",
      metadata: { type: "procedure" },
    });
  });

  // Save to JSON
  const embeddingsPath = `${knowledgeBasePath}/embeddings.json`;
  addChunks(embeddingsPath, chunksWithIds);
  console.log(`✓ Generated ${chunksWithIds.length} total chunks with embeddings`);
  console.log(`✓ Saved embeddings to ${embeddingsPath}`);

  // Test similarity search
  console.log("\n🔍 Step 3: Testing similarity search...\n");
  
  const testQueries = [
    "What are the properties of SS304 steel?",
    "Tell me about chromium content in stainless steel",
    "What is the yield strength of SS316?",
  ];

  for (const query of testQueries) {
    console.log(`\nQuery: "${query}"`);
    const relevant = await findRelevantContent(embeddingsPath, query, 0.5, 3);
    
    console.log(`Found ${relevant.length} relevant chunks:\n`);
    relevant.forEach((chunk, i) => {
      console.log(`  ${i + 1}. Similarity: ${chunk.similarity.toFixed(3)}`);
      console.log(`     ${chunk.content.substring(0, 100)}...\n`);
    });
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Demo complete!");
}

main().catch((error) => {
  console.error("❌ Demo failed:", error.message);
  console.log("\n💡 Common issues:");
  console.log("  - Check your .env.local file has valid API keys");
  console.log("  - Verify knowledge-base files exist");
  console.log("  - Ensure you have internet connectivity for API calls");
  process.exit(1);
});

