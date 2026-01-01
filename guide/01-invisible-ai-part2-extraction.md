# Lesson 1, Part 2: Data Extraction

In this part, you'll learn how to extract structured data from unstructured customer orders using AI. This is the foundation of the raw material forecasting system.

## Learning Objectives

By the end of this part, you will:
- [ ] Understand why order extraction is challenging
- [ ] Learn how to use `generateObject` with Zod schemas
- [ ] Implement order extraction from various formats
- [ ] Test extraction with sample data

## The Challenge: Order Data Extraction

Customer orders arrive in multiple formats:

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

## Implementation: Extract Order Details

Let's implement order extraction using the AI SDK's `generateObject` function with a Zod schema.

**File**: `app/(1-invisible-ai-manufacturing)/raw-material-forecast/extract-order.ts`

```typescript
import dotenvFlow from "dotenv-flow";
dotenvFlow.config(); // Load environment variables (API keys, etc.)
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
    materialCode: z
      .enum(["CODE_1", "CODE_2", "CODE_3"])
      .describe("Material type"),
  }),
  deliveryDate: z
    .string()
    .describe("Required delivery date in YYYY-MM-DD format"),
  specialRequirements: z
    .string()
    .nullable()
    .describe("Any special requirements or notes"),
});

export interface ExtractedOrder {
  customerName: string;
  orderNumber: string;
  productSpecifications: {
    steelGrade: string;
    dimensions: string | null;
    quantity: number;
    thickness: number | null;
    width: number | null;
    length: number | null;
    materialCode: "CODE_1" | "CODE_2" | "CODE_3";
  };
  deliveryDate: string;
  specialRequirements: string | null;
}

export async function extractOrderDetails(
  orderText: string
): Promise<ExtractedOrder> {
  const { object } = await generateObject({
    model: "openai/gpt-4.1",
    prompt: `Extract order details from the following customer order. The order may be from an Excel sheet, manual input, or scanned document:\n\n${orderText}`,
    schema: orderSchema,
  });

  return object;
}
```

## Understanding the Code

### Zod Schema

The `orderSchema` defines the structure we want to extract:

- **`z.object()`** - Creates an object schema
- **`.describe()`** - Provides hints to the AI about what each field means
- **`.nullable()`** - Allows fields to be null if not found
- **`.enum()`** - Restricts values to specific options

### generateObject

The `generateObject` function:

- Takes a **prompt** describing what to extract
- Uses a **schema** to define the output structure
- Returns a **typed object** matching the schema
- Handles format variations automatically

### Model Selection

We use `"openai/gpt-4.1"` which is:
- Fast enough for real-time extraction
- Accurate for structured data extraction
- Cost-effective for this use case

## Sample Data

Create sample orders to test extraction:

**File**: `app/(1-invisible-ai-manufacturing)/raw-material-forecast/sample_orders.json`

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

## Testing Extraction

Add a script to test order extraction:

**File**: `app/(1-invisible-ai-manufacturing)/raw-material-forecast/extract-order.ts` (add main function)

```typescript
// ... existing code ...

// Main execution when run as a script
async function main() {
  // Read sample orders from JSON file
  const sampleOrdersPath =
    "app/(1-invisible-ai-manufacturing)/raw-material-forecast/sample_orders.json";
  const sampleOrders = JSON.parse(
    fs.readFileSync(sampleOrdersPath, "utf-8")
  ) as Array<{ id: number; text: string }>;

  console.log(`\n📋 Processing ${sampleOrders.length} sample order(s)...\n`);

  for (const order of sampleOrders) {
    console.log(`\n--- Processing Order #${order.id} ---`);
    console.log("Original text:");
    console.log(order.text);
    console.log("\n--- Extracted Order Details ---");

    try {
      const extracted = await extractOrderDetails(order.text);
      console.log(JSON.stringify(extracted, null, 2));
    } catch (error) {
      console.error(`❌ Failed to extract order #${order.id}:`, error);
    }
    console.log("\n" + "=".repeat(50));
  }
}

// Run the async function and catch any errors
if (process.argv[1]?.includes("extract-order.ts")) {
  main().catch((error) => {
    console.error("❌ Extraction failed:", error.message);
    console.log("\n💡 Common issues:");
    console.log("  - Check your .env.local file has valid API keys");
    console.log(
      "  - Verify sample_orders.json exists"
    );
    console.log("  - Ensure you have internet connectivity for API calls");
    process.exit(1);
  });
}
```

## Running the Extraction

Add to `package.json`:

```json
{
  "scripts": {
    "manufacturing:extract-order": "tsx app/\\(1-invisible-ai-manufacturing\\)/raw-material-forecast/extract-order.ts"
  }
}
```

Run:

```bash
pnpm manufacturing:extract-order
```

You should see extracted order details for each sample order, showing how AI handles different formats.

## Key Concepts

### Structured Output

Using `generateObject` with Zod ensures:
- **Type safety** - TypeScript knows the exact structure
- **Validation** - Invalid data is caught early
- **Consistency** - All extractions follow the same format

### Prompt Engineering

The prompt tells the AI:
- **What to do**: "Extract order details"
- **Context**: "from Excel sheet, manual input, or scanned document"
- **Input**: The actual order text

### Error Handling

Always wrap extraction in try-catch:
- API calls can fail
- Invalid input
- Network issues

## Check Your Understanding

Before moving on, make sure you can:

- [ ] Explain why traditional parsing fails for varied order formats
- [ ] Understand how Zod schemas define the output structure
- [ ] Know what `generateObject` does and why it's useful
- [ ] Run the extraction script and see structured output

## Try It Yourself

- **Modify the schema**: Add a new field like `priority` or `paymentTerms`
- **Test with your own data**: Create a sample order in a different format
- **Experiment with prompts**: Change the prompt to see how it affects extraction
- **Handle edge cases**: What happens if an order is missing required fields?

## Summary

In this part, you learned:

- **The challenge**: Orders come in many formats, making traditional parsing difficult
- **The solution**: AI with `generateObject` handles format variations automatically
- **Implementation**: Use Zod schemas to define structured output
- **Testing**: Create sample data and test extraction

In the next part, you'll learn how to calculate material requirements based on extracted order data.

---

**Previous**: [Part 1: Introduction](./01-invisible-ai-part1-introduction.md)  
**Next**: [Part 3: Material Calculation](./01-invisible-ai-part3-calculation.md)

