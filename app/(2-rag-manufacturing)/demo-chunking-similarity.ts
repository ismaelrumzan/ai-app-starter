import dotenvFlow from "dotenv-flow";
dotenvFlow.config();
import fs from "fs";
import { generateEmbeddings } from "@/lib/ai/embedding";
import { findRelevantContent } from "@/lib/vector-store";

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

  // Define types for JSON data
  interface MaterialSpec {
    steelGrade: string;
    description: string;
    chemicalComposition: {
      chromium: string;
      nickel: string;
      [key: string]: string;
    };
    mechanicalProperties: {
      yieldStrength: string;
      tensileStrength: string;
      [key: string]: string;
    };
    physicalProperties?: {
      density?: string;
      meltingPoint?: string;
      thermalConductivity?: string;
      electricalResistivity?: string;
      [key: string]: string | undefined;
    };
    applications: string[];
    thicknessRange?: string;
    widthRange?: string;
    standardCodes?: string[];
  }

  interface MaterialChart {
    materialCode: string;
    description: string;
    applicableGrades: string[];
    thicknessRange: {
      min: number;
      max: number;
      unit: string;
    };
  }

  interface Procedure {
    procedureId: string;
    title: string;
    steps: string[];
  }

  // Add IDs and metadata (track which source each chunk came from)
  let chunkIndex = 0;
  const chunksWithIds: Array<{
    id: string;
    content: string;
    embedding: number[];
    source: string;
    metadata?: Record<string, unknown>;
  }> = [];
  
  // Process material specs chunks - create detailed chunks for each spec
  for (const spec of materialSpecs as MaterialSpec[]) {
    // Create comprehensive text for each material spec with ALL details
    const compositionText = Object.entries(spec.chemicalComposition)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    
    const mechanicalText = Object.entries(spec.mechanicalProperties)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    
    const physicalText = spec.physicalProperties
      ? Object.entries(spec.physicalProperties)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ")
      : "";
    
    const fullSpecText = `${spec.steelGrade} steel: ${spec.description}. ` +
      `Chemical composition: ${compositionText}. ` +
      `Mechanical properties: ${mechanicalText}. ` +
      (physicalText ? `Physical properties: ${physicalText}. ` : "") +
      `Applications: ${spec.applications.join(", ")}. ` +
      (spec.thicknessRange ? `Thickness range: ${spec.thicknessRange}. ` : "") +
      (spec.widthRange ? `Width range: ${spec.widthRange}. ` : "") +
      (spec.standardCodes && spec.standardCodes.length > 0
        ? `Standard codes: ${spec.standardCodes.join(", ")}.` 
        : "");
    
    // For material specs, create a single comprehensive chunk per material
    // instead of splitting by periods (which breaks up the information)
    const { embed } = await import("ai");
    const { embedding } = await embed({
      model: "openai/text-embedding-ada-002",
      value: fullSpecText,
    });
    
    chunksWithIds.push({
      id: `chunk_${chunkIndex++}`,
      content: fullSpecText,
      embedding: embedding,
      source: "material-specs.json",
      metadata: { type: "material-spec", steelGrade: spec.steelGrade },
    });
  }
  
  // Process material charts chunks
  const chartsText = (materialCharts as MaterialChart[]).map((chart) =>
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
  const proceduresText = (procedures as Procedure[]).map((proc) =>
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

  // Save to JSON - clear existing and create fresh
  const embeddingsPath = `${knowledgeBasePath}/embeddings.json`;
  // Clear existing embeddings and create fresh file with all chunks
  fs.writeFileSync(
    embeddingsPath,
    JSON.stringify({ chunks: chunksWithIds }, null, 2),
    "utf-8"
  );
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

