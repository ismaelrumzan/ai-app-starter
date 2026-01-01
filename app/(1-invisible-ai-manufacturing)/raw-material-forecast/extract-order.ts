import dotenvFlow from "dotenv-flow";
dotenvFlow.config(); // Load environment variables (API keys, etc.)
import fs from "fs";
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

// Run the async function and catch any errors (only when executed directly)
// Check if this file is being run as a script (not imported as a module)
if (process.argv[1]?.includes("extract-order.ts")) {
  main().catch((error) => {
    console.error("❌ Extraction failed:", error.message);
    console.log("\n💡 Common issues:");
    console.log("  - Check your .env.local file has valid API keys");
    console.log(
      "  - Verify sample_orders.json exists at app/(1-invisible-ai-manufacturing)/raw-material-forecast/sample_orders.json"
    );
    console.log("  - Ensure you have internet connectivity for API calls");
    process.exit(1);
  });
}
