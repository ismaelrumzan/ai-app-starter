# Lesson 1, Part 3: Material Calculation

In this part, you'll learn how to calculate material requirements based on extracted order details and material charts using AI reasoning.

## Learning Objectives

By the end of this part, you will:
- [ ] Understand why material calculation is complex
- [ ] Learn how AI interprets material charts and applies expert knowledge
- [ ] Implement material requirement calculation
- [ ] Understand scrap estimation

## The Challenge: Material Requirement Calculation

Determining raw materials needed involves:

- Interpreting material charts and specifications
- Accounting for production losses and waste
- Considering order-specific requirements
- Applying experience-based adjustments

**Why Traditional Programming Fails**:

- **Complex rule sets**: Material charts are guidelines, not strict formulas. Experienced operators apply judgment that's hard to codify.
- **Context-dependent**: Same order might need different materials based on production line availability, quality requirements, or seasonal factors.
- **Exception handling**: Edge cases and special requirements require extensive if-else logic that becomes unmaintainable.
- **Knowledge capture**: Expert knowledge is implicit and difficult to translate into explicit rules.

**How AI Solves This**:

- **Pattern recognition**: Learns from historical orders and material usage patterns.
- **Contextual reasoning**: Considers multiple factors simultaneously (order specs, material charts, production constraints).
- **Expert knowledge**: Can incorporate reasoning similar to experienced operators without explicit rule coding.
- **Adaptive calculations**: Adjusts calculations based on context and learns from outcomes.

**Example**: An order for SS316 with "food grade" requirement might need higher-purity chromium. AI recognizes this context and adjusts material calculations accordingly.

## Implementation: Calculate Material Requirements

**File**: `app/(1-invisible-ai-manufacturing)/raw-material-forecast/calculate-materials.ts`

```typescript
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
      grade: z
        .string()
        .nullable()
        .describe("Material grade or specification if applicable"),
      size: z
        .string()
        .nullable()
        .describe("Size or dimension requirements if applicable"),
    })
  ),
  scrapEstimate: z
    .number()
    .describe("Estimated scrap material that will be generated (in tons)"),
  reasoning: z.string().describe("Explanation of material calculations"),
});

export type MaterialRequirement = z.infer<typeof materialRequirementSchema>;
export type MaterialChart = Record<string, Record<string, number>>;

export async function calculateMaterialRequirements(
  orderDetails: ExtractedOrder,
  materialChart: MaterialChart
): Promise<MaterialRequirement> {
  const { object } = await generateObject({
    model: "openai/gpt-4.1",
    prompt: `Based on the following order details and material chart, calculate the raw materials needed:

Order: ${JSON.stringify(orderDetails, null, 2)}

Material Chart: ${JSON.stringify(materialChart, null, 2)}

Consider typical consumption patterns and include an estimate of scrap material that will be generated.`,
    schema: materialRequirementSchema,
  });

  return object;
}
```

## Understanding Material Charts

Material charts map steel grades to raw material requirements. For example:

**File**: `app/(1-invisible-ai-manufacturing)/raw-material-forecast/material_chart.json`

```json
{
  "SS304": {
    "iron_ore": 0.7,
    "chromium": 0.18,
    "nickel": 0.08,
    "scrap_steel": 0.3
  },
  "SS316": {
    "iron_ore": 0.65,
    "chromium": 0.16,
    "nickel": 0.1,
    "molybdenum": 0.02,
    "scrap_steel": 0.3
  }
}
```

These ratios represent the proportion of each raw material needed per ton of finished steel.

## How AI Uses Material Charts

The AI:

1. **Looks up the steel grade** in the material chart
2. **Applies the ratios** to the order quantity
3. **Adjusts for context** (e.g., food grade requirements, special dimensions)
4. **Accounts for waste** and production losses
5. **Estimates scrap** based on product type and dimensions

## Key Concepts

### Contextual Reasoning

AI considers:
- **Order specifications** - Steel grade, dimensions, quantity
- **Special requirements** - Food grade, certifications, quality standards
- **Material charts** - Base ratios for each steel grade
- **Production factors** - Typical waste rates, scrap generation

### Scrap Estimation

Scrap varies by:
- **Product type** - Different steel grades have different scrap rates
- **Dimensions** - Thinner materials typically have higher scrap rates
- **Production method** - Hot rolling vs cold rolling affects scrap

## Testing Calculation

You can test material calculation by running the full forecast script (covered in Part 4), or create a simple test:

```typescript
import { calculateMaterialRequirements } from "./calculate-materials";
import materialChart from "./material_chart.json";

const testOrder = {
  customerName: "Test Corp",
  orderNumber: "TEST-001",
  productSpecifications: {
    steelGrade: "SS304",
    quantity: 500,
    thickness: 5,
    width: 1500,
    length: 6000,
    materialCode: "CODE_1" as const,
  },
  deliveryDate: "2024-02-15",
  specialRequirements: null,
};

const result = await calculateMaterialRequirements(testOrder, materialChart);
console.log(result);
```

## Check Your Understanding

Before moving on, make sure you can:

- [ ] Explain why material calculation is more complex than simple multiplication
- [ ] Understand how material charts work
- [ ] Know what factors AI considers when calculating materials
- [ ] Understand how scrap is estimated

## Try It Yourself

- **Modify material chart**: Add a new steel grade with different ratios
- **Test with different orders**: See how calculations change with different specifications
- **Experiment with special requirements**: Add "food grade" or other requirements and see how AI adjusts

## Summary

In this part, you learned:

- **Material calculation** requires interpreting charts and applying expert knowledge
- **AI excels** at contextual reasoning and handling edge cases
- **Material charts** provide base ratios that AI applies intelligently
- **Scrap estimation** considers product type, dimensions, and production method

In the next part, you'll learn how to combine all these pieces into a complete forecasting system.

---

**Previous**: [Part 2: Data Extraction](./01-invisible-ai-part2-extraction.md)  
**Next**: [Part 4: Forecasting](./01-invisible-ai-part4-forecasting.md)

