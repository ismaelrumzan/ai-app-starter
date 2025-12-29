# Invisible AI: Raw Material Forecasting

This guide demonstrates how to implement invisible AI for **Raw Material Forecasting** in a steel manufacturing plant. You'll learn how AI can automate the process of determining material requirements from customer orders and forecasting material needs.

## The Current Workflow

In a typical steel manufacturing plant, the raw material forecasting process works like this:

1. **Orders are received** via:

   - Excel sheets from customers
   - Manual input by operators
   - Scanned paper orders

2. **Material determination**: Users rely on experience and material charts to determine:

   - What materials are needed
   - Required amounts
   - Material sizes/specifications

3. **Stock check**: Check if materials are available in stock

4. **Order decision**:

   - If material is available → submit order
   - If not available → order material from suppliers

5. **Scrap tracking**: Track scrap material (general measurement, not per order) on a regular basis

## The Problem: Manual, Time-Consuming Process

This workflow has several pain points:

- **Manual interpretation** of orders in different formats
- **Experience-dependent** material calculations
- **Time-consuming** stock checks and material ordering
- **Reactive** rather than proactive material planning

## The Solution: AI-Powered Raw Material Forecasting

AI can automate and improve this workflow by:

- **Extracting structured data** from various order formats (Excel, text, scanned documents)
- **Calculating material requirements** based on order specifications and material charts
- **Forecasting material needs** based on historical consumption patterns
- **Predicting scrap generation** to optimize material ordering

## Where AI Excels: Specific Use Cases and Benefits

### 1. Order Data Extraction from Unstructured Formats

**The Challenge**: Customer orders arrive in multiple formats:

- Excel sheets with varying structures
- Free-form text from manual entry
- Scanned paper documents with OCR text

**Why Traditional Programming Fails**:

- **Rigid parsing rules**: Traditional code requires exact format matching. A change in Excel column order breaks everything.
- **Format variations**: Each customer may structure orders differently. You'd need separate parsers for each format.
- **Error-prone**: OCR from scanned documents introduces typos and formatting inconsistencies that break fixed parsers.
- **Maintenance burden**: Every new customer format requires new code, testing, and deployment.

**How AI Solves This**:

- **Flexible understanding**: AI understands intent, not just format. It can extract order details even when structure varies.
- **Natural language processing**: Handles free-form text, abbreviations, and variations in terminology.
- **Resilient to errors**: Can interpret imperfect OCR text and still extract correct information.
- **Self-adapting**: Learns from context to handle new formats without code changes.

**Example**: An order says "500 tons SS304, 5mm thick" in one format and "Grade: SS304, Qty: 500T, Thickness: 5mm" in another. AI extracts the same structured data from both.

### 2. Material Requirement Calculation

**The Challenge**: Determining raw materials needed involves:

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

### 3. Time-Phased Material Forecasting

**The Challenge**: Predicting when materials will be needed, not just how much:

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

**Example**: AI might forecast that chromium is needed in 30 days, but recommends ordering now from a supplier with 45-day lead time because they're more reliable and cheaper, accounting for buffer time.

**Data Sources and How AI Uses Them**:

1. **Current Orders** (from Step 1 - Order Extraction):

   - Extracted order details with delivery dates
   - Material requirements calculated for each order
   - **How AI uses it**: Groups orders by material type and delivery date to determine when materials are needed

2. **Historical Consumption Data**:

   - Monthly consumption averages by material type
   - Seasonal factors (Q1-Q4 consumption patterns)
   - Past order patterns and trends
   - **How AI uses it**: Identifies consumption trends, seasonal variations, and baseline requirements beyond current orders

3. **Current Stock Levels**:

   - Real-time inventory for each material type
   - Stock replenishment history
   - **How AI uses it**: Calculates shortfall (required - current stock) and determines ordering urgency

4. **Supplier Information**:

   - Lead times for each supplier and material
   - Supplier reliability scores
   - Minimum order quantities
   - Historical delivery performance
   - **How AI uses it**: Matches material needs with supplier capabilities, considering lead times against forecast dates, and recommends optimal suppliers

5. **Production Schedule**:
   - Planned production runs
   - Machine availability
   - **How AI uses it**: Adjusts material timing based on when production actually happens (not just order delivery dates)

**The AI Process**:

1. Analyzes all current orders and their material requirements
2. Adds historical baseline consumption (accounts for orders not yet received)
3. Subtracts current stock to find shortfalls
4. Calculates when each material is needed based on order delivery dates and production schedules
5. Matches needs with supplier lead times to determine ordering dates
6. Optimizes supplier selection balancing cost, reliability, and timing
7. Provides confidence levels based on data quality and pattern strength

### 4. Scrap Material Prediction

**The Challenge**: Estimating scrap generation:

- Varies by product type, production method, and operator skill
- Not tracked per order, but as general measurements
- Needed for optimizing material orders (using scrap reduces new material needs)

**Why Traditional Programming Fails**:

- **Fixed percentages**: Traditional code uses fixed scrap rates (e.g., 15%), missing variations by product or process.
- **No learning**: Can't improve predictions based on actual scrap measurements.
- **Oversimplified**: Doesn't account for factors like material quality, production line efficiency, or operator experience.
- **Reactive**: Only tracks scrap after it's generated, can't predict it proactively.

**How AI Solves This**:

- **Contextual prediction**: Considers product type, dimensions, production method, and historical patterns.
- **Continuous learning**: Improves predictions as actual scrap data is collected.
- **Multi-factor analysis**: Accounts for material quality, production efficiency, and other variables.
- **Proactive planning**: Predicts scrap generation to optimize material ordering (order less new material if scrap will be available).

**Example**: AI predicts 180 tons of scrap from current orders, estimates 85% can be reused, and adjusts material orders accordingly—something that requires complex calculations in traditional systems.

**Data Sources and How AI Uses Them**:

1. **Order Specifications** (from Step 1 - Order Extraction):

   - Product type (steel grade: SS304, SS316, etc.)
   - Dimensions (thickness, width, length)
   - Quantity
   - Special requirements
   - **How AI uses it**: Different products and dimensions generate different amounts of scrap. Thinner materials typically have higher scrap rates.

2. **Historical Scrap Data**:

   - Past scrap measurements by product type
   - Scrap rates by dimension ranges
   - Scrap generation patterns over time
   - **How AI uses it**: Learns typical scrap rates for similar products. For example, SS304 at 3mm thickness might historically generate 12% scrap, while 6mm generates 8%.

3. **Production Method Data**:

   - Which production line was used
   - Production method (hot rolling, cold rolling, etc.)
   - Machine efficiency metrics
   - **How AI uses it**: Different production methods have different scrap rates. Hot rolling might generate more scrap than cold rolling for certain products.

4. **Operator/Shift Performance**:

   - Historical scrap rates by operator or shift
   - Quality metrics by production team
   - **How AI uses it**: Adjusts predictions based on who's operating. Experienced operators typically generate less scrap.

5. **Material Quality Metrics**:

   - Incoming material quality grades
   - Defect rates in raw materials
   - **How AI uses it**: Lower quality raw materials tend to generate more scrap during processing.

6. **General Scrap Measurements** (collected regularly):
   - Weekly/monthly scrap totals
   - Scrap by material type
   - Scrap utilization rates (how much gets reused)
   - **How AI uses it**: Validates and improves predictions. If AI predicted 15% scrap but actual was 18%, it adjusts future predictions.

**The AI Process**:

1. For each order, analyzes product type, dimensions, and specifications
2. Looks up historical scrap rates for similar products
3. Adjusts for production method, operator experience, and material quality
4. Calculates estimated scrap per order
5. Aggregates scrap across all current orders
6. Estimates scrap utilization rate (how much can be reused vs. disposed)
7. Adjusts material requirements: if 100 tons of scrap will be available and 80% is reusable, reduces new material orders by 80 tons
8. Continuously improves by comparing predictions to actual scrap measurements

## Why AI vs. Traditional Programming?

| Challenge                | Traditional Programming                  | AI Approach                                 |
| ------------------------ | ---------------------------------------- | ------------------------------------------- |
| **Format Variations**    | Requires separate parser for each format | Handles variations automatically            |
| **Unstructured Data**    | Needs strict templates and validation    | Understands natural language and intent     |
| **Expert Knowledge**     | Difficult to codify into rules           | Learns patterns from data and examples      |
| **Context Awareness**    | Limited by explicit if-else logic        | Considers multiple factors simultaneously   |
| **Adaptation**           | Requires code changes for new scenarios  | Adapts to new patterns without code changes |
| **Error Handling**       | Breaks on unexpected input               | Resilient to typos and variations           |
| **Complex Optimization** | Requires complex algorithms              | Balances multiple objectives naturally      |
| **Learning**             | Static rules, manual updates             | Improves from historical data               |

**Key Insight**: Traditional programming excels at **deterministic, rule-based tasks**. AI excels at **pattern recognition, natural language understanding, and adaptive reasoning**—exactly what's needed for real-world manufacturing workflows with human-written orders, experience-based decisions, and variable formats.

---

## Implementation: Raw Material Forecasting System

### Step 1: Extract Order Details from Various Formats

First, we need to extract structured data from customer orders, regardless of format.

**File**: `app/(6-invisible-ai-manufacturing)/raw-material-forecast/extract-order.ts`

```typescript
import { generateObject } from "ai";
import { z } from "zod";

const orderSchema = z.object({
  customerName: z.string().describe("Customer or company name"),
  orderNumber: z.string().describe("Order number or reference"),
  productSpecifications: z.object({
    steelGrade: z
      .string()
      .describe("Steel grade required (e.g., SS304, SS316)"),
    dimensions: z.string().nullable().describe("Dimensions or sizes required"),
    quantity: z.number().describe("Quantity in tons or pieces"),
    thickness: z.number().nullable().describe("Thickness in mm if specified"),
    width: z.number().nullable().describe("Width in mm if specified"),
    length: z.number().nullable().describe("Length in mm if specified"),
  }),
  deliveryDate: z
    .string()
    .describe("Required delivery date in YYYY-MM-DD format"),
  specialRequirements: z
    .string()
    .nullable()
    .describe("Any special requirements or notes"),
});

export async function extractOrderDetails(orderText: string) {
  const { object } = await generateObject({
    model: "openai/gpt-4.1",
    prompt: `Extract order details from the following customer order. The order may be from an Excel sheet, manual input, or scanned document:\n\n${orderText}`,
    schema: orderSchema,
  });

  return object;
}
```

### Step 2: Calculate Material Requirements

Based on the extracted order details, calculate what raw materials are needed.

**File**: `app/(6-invisible-ai-manufacturing)/raw-material-forecast/calculate-materials.ts`

```typescript
import { generateObject } from "ai";
import { z } from "zod";

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

export type MaterialChart = Record<string, Record<string, number>>;

export async function calculateMaterialRequirements(
  orderDetails: ExtractedOrder,
  materialChart: MaterialChart
): Promise<MaterialRequirement> {
  const { object } = await generateObject({
    model: "openai/gpt-4.1",
    prompt: `Based on the following order details and material chart, calculate the raw materials needed:\n\nOrder: ${JSON.stringify(
      orderDetails,
      null,
      2
    )}\n\nMaterial Chart: ${JSON.stringify(
      materialChart,
      null,
      2
    )}\n\nConsider typical consumption patterns and include an estimate of scrap material that will be generated.`,
    schema: materialRequirementSchema,
  });

  return object;
}
```

### Step 3: Forecast Material Needs

Forecast material requirements considering historical consumption and current orders.

**File**: `app/(6-invisible-ai-manufacturing)/raw-material-forecast/forecast-materials.ts`

```typescript
import { generateObject } from "ai";
import { z } from "zod";
import dotenvFlow from "dotenv-flow";
dotenvFlow.config();

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

export type HistoricalConsumption = {
  averageMonthlyConsumption: Record<string, number>;
  scrapGenerationRate: number;
  seasonalFactors: Record<string, number>;
};

export type CurrentStock = Record<string, number>;

export type SupplierData = Record<string, Array<{
  supplierName: string;
  leadTime: number;
  reliability: number;
  minOrder?: number;
}>>;

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

### Step 4: Complete Example Script

**File**: `app/(6-invisible-ai-manufacturing)/raw-material-forecast/raw-material-forecast.ts`

```typescript
import dotenvFlow from "dotenv-flow";
dotenvFlow.config();
import { extractOrderDetails } from "./extract-order";
import { calculateMaterialRequirements } from "./calculate-materials";
import { forecastMaterialNeeds } from "./forecast-materials";
import sampleOrders from "./sample_orders.json";
import materialChart from "./material_chart.json";
import historicalData from "./historical_consumption.json";
import stockData from "./current_stock.json";
import supplierData from "./supplier_data.json";

async function main() {
  console.log("🔍 Raw Material Forecasting System\n");
  console.log("=".repeat(60));

  // Step 1: Extract order details from various formats
  console.log("\n📋 Step 1: Extracting order details...\n");
  const extractedOrders = [];
  for (const order of sampleOrders) {
    const extracted = await extractOrderDetails(order.text);
    extractedOrders.push(extracted);
    console.log(
      `✓ Extracted order: ${extracted.orderNumber} - ${extracted.productSpecifications.steelGrade}`
    );
  }

  // Step 2: Calculate material requirements for each order
  console.log("\n🧮 Step 2: Calculating material requirements...\n");
  const materialRequirements = [];
  for (const order of extractedOrders) {
    const requirements = await calculateMaterialRequirements(
      order,
      materialChart
    );
    materialRequirements.push(requirements);
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

### Step 5: Sample Data Files

Create sample data files to test the system:

**File**: `app/(6-invisible-ai-manufacturing)/raw-material-forecast/sample_orders.json`

```json
[
  {
    "id": 1,
    "text": "Order #12345 from ABC Manufacturing. Need 500 tons of SS304 steel, thickness 5mm, width 1500mm, length 6000mm. Delivery required by 2024-02-15. Standard quality requirements."
  },
  {
    "id": 2,
    "text": "Customer: XYZ Corp\nOrder Ref: ORD-67890\nProduct: SS316 stainless steel\nQuantity: 300 tons\nDimensions: 3mm x 1200mm x 5000mm\nDelivery: 2024-02-20\nSpecial: Food grade certification required"
  },
  {
    "id": 3,
    "text": "From scanned document:\nORDER FORM\nCompany: Steel Works Ltd\nOrder: #SW-2024-001\nMaterial: Grade SS304\nAmount: 400 tons\nSize: 6mm thickness, 1800mm width\nLength: Custom (6000-8000mm)\nRequired: March 1, 2024"
  }
]
```

**File**: `app/(6-invisible-ai-manufacturing)/raw-material-forecast/material_chart.json`

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

**File**: `app/(6-invisible-ai-manufacturing)/raw-material-forecast/historical_consumption.json`

```json
{
  "averageMonthlyConsumption": {
    "iron_ore": 2000,
    "coal": 800,
    "limestone": 400,
    "chromium": 350,
    "nickel": 150,
    "molybdenum": 30,
    "scrap_steel": 900
  },
  "scrapGenerationRate": 0.15,
  "seasonalFactors": {
    "Q1": 0.9,
    "Q2": 1.0,
    "Q3": 1.1,
    "Q4": 1.0
  }
}
```

**File**: `app/(6-invisible-ai-manufacturing)/raw-material-forecast/current_stock.json`

```json
{
  "iron_ore": 1500,
  "coal": 600,
  "limestone": 300,
  "chromium": 250,
  "nickel": 100,
  "molybdenum": 20,
  "scrap_steel": 500
}
```

**File**: `app/(6-invisible-ai-manufacturing)/raw-material-forecast/supplier_data.json`

```json
{
  "iron_ore": [
    {
      "supplierName": "Iron Ore Suppliers Inc",
      "leadTime": 14,
      "reliability": 95,
      "minOrder": 500
    },
    {
      "supplierName": "Global Mining Co",
      "leadTime": 21,
      "reliability": 88,
      "minOrder": 300
    }
  ],
  "chromium": [
    {
      "supplierName": "Alloy Metals Ltd",
      "leadTime": 30,
      "reliability": 92,
      "minOrder": 50
    }
  ],
  "nickel": [
    {
      "supplierName": "Nickel Corp",
      "leadTime": 45,
      "reliability": 90,
      "minOrder": 25
    }
  ]
}
```

### Step 6: Run the Forecast

Add to `package.json`:

```json
"manufacturing:forecast": "tsx app/\\(6-invisible-ai-manufacturing\\)/raw-material-forecast/raw-material-forecast.ts"
```

Run:

```bash
pnpm manufacturing:forecast
```

---

## How This Solves Your Workflow

1. **Order Extraction**: AI automatically extracts structured data from Excel, manual input, or scanned documents
2. **Material Calculation**: AI uses material charts and order specifications to calculate exact material needs
3. **Stock Checking**: System compares requirements with current stock levels
4. **Forecasting**: AI predicts when materials will be needed and recommends suppliers
5. **Scrap Prediction**: System estimates scrap generation to optimize material ordering

## Key Benefits

- **Automation**: Reduces manual work in order processing
- **Accuracy**: Consistent material calculations based on charts and specifications
- **Proactive Planning**: Forecasts material needs before orders are placed
- **Time Savings**: Instant stock checks and supplier recommendations
- **Scrap Optimization**: Better planning for scrap material utilization

## Next Steps

- **Integrate with MES**: Connect to your actual order management system
- **Real-time Stock Updates**: Link to inventory management system
- **Supplier Integration**: Connect to supplier APIs for automated ordering
- **Historical Learning**: Improve forecasts by learning from past consumption patterns

## Key Takeaways

- Use `generateObject` with Zod schemas to extract structured data from various formats
- Combine multiple data sources (orders, charts, history, stock) for accurate forecasting
- Time-phased forecasting (when materials are needed) is more valuable than just quantities
- Scrap material prediction helps optimize overall material planning
- AI can automate the entire workflow from order receipt to material ordering
