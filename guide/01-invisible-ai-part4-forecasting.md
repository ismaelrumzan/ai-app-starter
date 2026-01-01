# Lesson 1, Part 4: Forecasting

In this final part, you'll learn how to create a complete forecasting system that combines order extraction, material calculation, and time-phased forecasting with scrap prediction.

## Learning Objectives

By the end of this part, you will:
- [ ] Understand time-phased forecasting vs simple quantity calculations
- [ ] Learn how to combine multiple data sources for forecasting
- [ ] Implement the complete forecasting pipeline
- [ ] Understand scrap prediction and optimization

## The Challenge: Time-Phased Material Forecasting

Predicting when materials will be needed, not just how much:

- Multiple orders with different delivery dates
- Supplier lead times vary by material and supplier
- Seasonal consumption patterns
- Stock level optimization

**Why Traditional Programming Fails**:

- **Linear calculations**: Traditional code calculates based on fixed formulas, missing complex interdependencies.
- **Static rules**: Can't adapt to changing patterns or learn from historical accuracy.
- **Simplified assumptions**: Often assumes constant consumption rates, missing seasonal or trend variations.
- **Limited optimization**: Hard to balance multiple objectives (cost, lead time, reliability) simultaneously.

**How AI Solves This**:

- **Multi-factor analysis**: Considers orders, history, stock, suppliers, and trends simultaneously.
- **Pattern learning**: Identifies consumption patterns from historical data that aren't obvious.
- **Probabilistic forecasting**: Provides confidence levels and handles uncertainty better than deterministic calculations.
- **Optimization**: Balances multiple constraints (cost, time, reliability) to recommend best suppliers.

## Data Sources for Forecasting

The forecasting system uses:

1. **Current Orders** - Extracted order details with delivery dates
2. **Historical Consumption** - Monthly averages, seasonal factors
3. **Current Stock** - Real-time inventory levels
4. **Supplier Information** - Lead times, reliability, minimum orders

## Implementation: Forecast Material Needs

**File**: `app/(1-invisible-ai-manufacturing)/raw-material-forecast/forecast-materials.ts`

```typescript
import { generateObject } from "ai";
import { z } from "zod";
import type { ExtractedOrder } from "./extract-order";

const forecastSchema = z.object({
  materialForecasts: z.array(
    z.object({
      materialType: z.string().describe("Type of raw material"),
      requiredQuantity: z.number().describe("Total quantity needed in tons"),
      currentStock: z.number().describe("Current stock level in tons"),
      shortfall: z
        .number()
        .describe("Quantity that needs to be ordered (tons)"),
      forecastDate: z
        .string()
        .describe("When the material is needed (YYYY-MM-DD)"),
      confidenceLevel: z
        .enum(["high", "medium", "low"])
        .describe("Confidence level of the forecast"),
      supplierRecommendations: z
        .array(
          z.object({
            supplierName: z.string(),
            leadTime: z.number().describe("Lead time in days"),
            reliability: z
              .number()
              .describe("Supplier reliability score (0-100)"),
          })
        )
        .nullable()
        .describe("Recommended suppliers for this material"),
    })
  ),
  overallScrapForecast: z
    .object({
      estimatedScrap: z.number().describe("Total estimated scrap in tons"),
      scrapUtilization: z
        .number()
        .describe("Percentage of scrap that can be reused"),
      disposalRequired: z.number().describe("Scrap that needs disposal (tons)"),
    })
    .describe("Overall scrap material forecast"),
  reasoning: z.string().describe("Explanation of the forecast"),
});

export type MaterialForecast = z.infer<typeof forecastSchema>;
export type HistoricalConsumption = {
  averageMonthlyConsumption: Record<string, number>;
  scrapGenerationRate: number;
  seasonalFactors: Record<string, number>;
};
export type CurrentStock = Record<string, number>;
export type SupplierData = Record<
  string,
  Array<{
    supplierName: string;
    leadTime: number;
    reliability: number;
    minOrder?: number;
  }>
>;

export async function forecastMaterialNeeds(
  currentOrders: ExtractedOrder[],
  historicalConsumption: HistoricalConsumption,
  currentStock: CurrentStock,
  supplierData: SupplierData
): Promise<MaterialForecast> {
  const { object } = await generateObject({
    model: "openai/gpt-4.1",
    prompt: `Forecast raw material needs based on:
- Current orders: ${JSON.stringify(currentOrders, null, 2)}
- Historical consumption patterns: ${JSON.stringify(
      historicalConsumption,
      null,
      2
    )}
- Current stock levels: ${JSON.stringify(currentStock, null, 2)}
- Supplier information: ${JSON.stringify(supplierData, null, 2)}

Provide a time-phased forecast showing when materials are needed, not just quantities. Include scrap material predictions.`,
    schema: forecastSchema,
  });

  return object;
}
```

## Complete Example Script

**File**: `app/(1-invisible-ai-manufacturing)/raw-material-forecast/raw-material-forecast.ts`

```typescript
import dotenvFlow from "dotenv-flow";
dotenvFlow.config();
import fs from "fs";
import { extractOrderDetails } from "./extract-order";
import { calculateMaterialRequirements } from "./calculate-materials";
import { forecastMaterialNeeds } from "./forecast-materials";

async function main() {
  console.log("🔍 Raw Material Forecasting System\n");
  console.log("=".repeat(60));

  // Load sample data
  const sampleOrders = JSON.parse(
    fs.readFileSync(
      "app/(1-invisible-ai-manufacturing)/raw-material-forecast/sample_orders.json",
      "utf-8"
    )
  );
  const materialChart = JSON.parse(
    fs.readFileSync(
      "app/(1-invisible-ai-manufacturing)/raw-material-forecast/material_chart.json",
      "utf-8"
    )
  );
  const historicalData = JSON.parse(
    fs.readFileSync(
      "app/(1-invisible-ai-manufacturing)/raw-material-forecast/historical_consumption.json",
      "utf-8"
    )
  );
  const stockData = JSON.parse(
    fs.readFileSync(
      "app/(1-invisible-ai-manufacturing)/raw-material-forecast/current_stock.json",
      "utf-8"
    )
  );
  const supplierData = JSON.parse(
    fs.readFileSync(
      "app/(1-invisible-ai-manufacturing)/raw-material-forecast/supplier_data.json",
      "utf-8"
    )
  );

  // Step 1: Extract order details
  console.log("\n📋 Step 1: Extracting order details...\n");
  const extractedOrders = [];
  for (const order of sampleOrders) {
    const extracted = await extractOrderDetails(order.text);
    extractedOrders.push(extracted);
    console.log(
      `✓ Extracted order: ${extracted.orderNumber} - ${extracted.productSpecifications.steelGrade}`
    );
  }

  // Step 2: Calculate material requirements
  console.log("\n🧮 Step 2: Calculating material requirements...\n");
  for (const order of extractedOrders) {
    const requirements = await calculateMaterialRequirements(
      order,
      materialChart
    );
    console.log(`✓ Calculated materials for order ${order.orderNumber}`);
    console.log(
      `  Materials needed: ${requirements.rawMaterials.length} types`
    );
    console.log(`  Estimated scrap: ${requirements.scrapEstimate} tons`);
  }

  // Step 3: Forecast overall material needs
  console.log("\n📊 Step 3: Forecasting material needs...\n");
  const forecast = await forecastMaterialNeeds(
    extractedOrders,
    historicalData,
    stockData,
    supplierData
  );

  // Display results
  console.log("\n" + "=".repeat(60));
  console.log("📈 MATERIAL FORECAST RESULTS");
  console.log("=".repeat(60));

  console.log("\n📦 Material Requirements:\n");
  forecast.materialForecasts.forEach((material) => {
    console.log(`  ${material.materialType}:`);
    console.log(`    Required: ${material.requiredQuantity} tons`);
    console.log(`    Current Stock: ${material.currentStock} tons`);
    console.log(`    Shortfall: ${material.shortfall} tons`);
    console.log(`    Needed by: ${material.forecastDate}`);
    console.log(`    Confidence: ${material.confidenceLevel}`);
    if (material.supplierRecommendations) {
      console.log(`    Recommended Suppliers:`);
      material.supplierRecommendations.forEach((supplier) => {
        console.log(
          `      - ${supplier.supplierName} (${supplier.leadTime} days, reliability: ${supplier.reliability}%)`
        );
      });
    }
    console.log("");
  });

  console.log("\n♻️  Scrap Material Forecast:\n");
  console.log(
    `  Estimated Scrap: ${forecast.overallScrapForecast.estimatedScrap} tons`
  );
  console.log(
    `  Scrap Utilization: ${forecast.overallScrapForecast.scrapUtilization}%`
  );
  console.log(
    `  Disposal Required: ${forecast.overallScrapForecast.disposalRequired} tons`
  );

  console.log("\n💡 Reasoning:\n");
  console.log(forecast.reasoning);

  console.log("\n" + "=".repeat(60));
  console.log("✅ Forecast complete!");
}

main().catch((error) => {
  console.error("❌ Forecasting failed:", error.message);
  console.log("\n💡 Common issues:");
  console.log("  - Check your .env.local file has valid API keys");
  console.log("  - Verify all data files exist");
  console.log("  - Ensure you have internet connectivity for API calls");
  process.exit(1);
});
```

## Running the Forecast

Add to `package.json`:

```json
{
  "scripts": {
    "manufacturing:forecast": "tsx app/\\(1-invisible-ai-manufacturing\\)/raw-material-forecast/raw-material-forecast.ts"
  }
}
```

Run:

```bash
pnpm manufacturing:forecast
```

## Key Takeaways

### Time-Phased Forecasting

Forecasting **when** materials are needed is more valuable than just **how much**:
- Accounts for order delivery dates
- Considers supplier lead times
- Optimizes ordering timing

### Multi-Source Integration

The system combines:
- **Current orders** - Immediate needs
- **Historical patterns** - Baseline consumption
- **Stock levels** - Current availability
- **Supplier data** - Ordering constraints

### Scrap Optimization

Scrap prediction enables:
- Better material planning
- Reduced waste
- Cost optimization

## Check Your Understanding

Before moving on, make sure you can:

- [ ] Explain the difference between time-phased and quantity-only forecasting
- [ ] Understand how multiple data sources are combined
- [ ] Know what supplier recommendations include
- [ ] Understand how scrap forecasting optimizes material ordering

## Try It Yourself

- **Modify sample data**: Change order quantities, dates, or add new orders
- **Adjust stock levels**: See how forecasts change with different stock
- **Experiment with suppliers**: Add suppliers with different lead times and reliability
- **Test scrap optimization**: Modify scrap utilization rates

## Summary

In this part, you learned:

- **Time-phased forecasting** predicts when materials are needed, not just quantities
- **Multi-source integration** combines orders, history, stock, and suppliers
- **Supplier recommendations** balance cost, lead time, and reliability
- **Scrap optimization** helps reduce waste and costs

## Lesson 1 Complete!

Congratulations! You've completed Lesson 1: Invisible AI. You now know how to:

- ✅ Extract structured data from unstructured formats
- ✅ Calculate material requirements using AI reasoning
- ✅ Forecast material needs with time-phased predictions
- ✅ Optimize material ordering with scrap prediction

**Next**: Move on to [Lesson 2: RAG](./02-rag-part1-introduction.md) to learn about building knowledge bases with semantic search!

---

**Previous**: [Part 3: Material Calculation](./01-invisible-ai-part3-calculation.md)  
**Next**: [Lesson 2, Part 1: Introduction to RAG](./02-rag-part1-introduction.md)

