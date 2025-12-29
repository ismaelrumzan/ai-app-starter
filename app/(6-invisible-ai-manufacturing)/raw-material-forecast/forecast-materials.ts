import { generateObject } from "ai";
import { z } from "zod";
import type { ExtractedOrder } from "./extract-order";

const forecastSchema = z.object({
  materialForecasts: z.array(
    z.object({
      materialType: z.string().describe("Type of raw material"),
      requiredQuantity: z.number().describe("Total quantity needed in tons"),
      currentStock: z.number().describe("Current stock level in tons"),
      shortfall: z.number().describe("Quantity that needs to be ordered (tons)"),
      forecastDate: z.string().describe("When the material is needed (YYYY-MM-DD)"),
      confidenceLevel: z
        .enum(["high", "medium", "low"])
        .describe("Confidence level of the forecast"),
      supplierRecommendations: z
        .array(
          z.object({
            supplierName: z.string(),
            leadTime: z.number().describe("Lead time in days"),
            reliability: z.number().describe("Supplier reliability score (0-100)"),
          })
        )
        .nullable()
        .describe("Recommended suppliers for this material"),
    })
  ),
  overallScrapForecast: z
    .object({
      estimatedScrap: z.number().describe("Total estimated scrap in tons"),
      scrapUtilization: z.number().describe("Percentage of scrap that can be reused"),
      disposalRequired: z.number().describe("Scrap that needs disposal (tons)"),
    })
    .describe("Overall scrap material forecast"),
  reasoning: z.string().describe("Explanation of the forecast"),
});

export interface MaterialForecast {
  materialForecasts: Array<{
    materialType: string;
    requiredQuantity: number;
    currentStock: number;
    shortfall: number;
    forecastDate: string;
    confidenceLevel: "high" | "medium" | "low";
    supplierRecommendations: Array<{
      supplierName: string;
      leadTime: number;
      reliability: number;
    }> | null;
  }>;
  overallScrapForecast: {
    estimatedScrap: number;
    scrapUtilization: number;
    disposalRequired: number;
  };
  reasoning: string;
}

export async function forecastMaterialNeeds(
  currentOrders: ExtractedOrder[],
  historicalConsumption: any,
  currentStock: any,
  supplierData: any
): Promise<MaterialForecast> {
  const { object } = await generateObject({
    model: "openai/gpt-4.1",
    prompt: `Forecast raw material needs based on:
- Current orders: ${JSON.stringify(currentOrders, null, 2)}
- Historical consumption patterns: ${JSON.stringify(historicalConsumption, null, 2)}
- Current stock levels: ${JSON.stringify(currentStock, null, 2)}
- Supplier information: ${JSON.stringify(supplierData, null, 2)}

Provide a time-phased forecast showing when materials are needed, not just quantities. Include scrap material predictions.`,
    schema: forecastSchema,
  });

  return object;
}

