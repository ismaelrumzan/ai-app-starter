import { generateObject } from "ai";
import { z } from "zod";
import type { ExtractedOrder } from "./extract-order";

const materialRequirementSchema = z.object({
  rawMaterials: z.array(
    z.object({
      materialType: z
        .enum([
          "iron_ore",
          "coal",
          "limestone",
          "chromium",
          "nickel",
          "molybdenum",
          "scrap_steel",
        ])
        .describe("Type of raw material"),
      quantity: z.number().describe("Required quantity in tons"),
      grade: z.string().nullable().describe("Material grade or specification if applicable"),
      size: z.string().nullable().describe("Size or dimension requirements if applicable"),
    })
  ),
  scrapEstimate: z
    .number()
    .describe("Estimated scrap material that will be generated (in tons)"),
  reasoning: z.string().describe("Explanation of material calculations"),
});

export interface MaterialRequirement {
  rawMaterials: Array<{
    materialType: "iron_ore" | "coal" | "limestone" | "chromium" | "nickel" | "molybdenum" | "scrap_steel";
    quantity: number;
    grade: string | null;
    size: string | null;
  }>;
  scrapEstimate: number;
  reasoning: string;
}

export type MaterialChart = Record<string, Record<string, number>>;

export async function calculateMaterialRequirements(
  orderDetails: ExtractedOrder,
  materialChart: MaterialChart
): Promise<MaterialRequirement> {
  const { object } = await generateObject({
    model: "openai/gpt-4.1",
    prompt: `Based on the following order details and material chart, calculate the raw materials needed:\n\nOrder: ${JSON.stringify(orderDetails, null, 2)}\n\nMaterial Chart: ${JSON.stringify(materialChart, null, 2)}\n\nConsider typical consumption patterns and include an estimate of scrap material that will be generated.`,
    schema: materialRequirementSchema,
  });

  return object;
}


