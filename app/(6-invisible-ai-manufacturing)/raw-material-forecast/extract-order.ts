import { generateObject } from "ai";
import { z } from "zod";

const orderSchema = z.object({
  customerName: z.string().describe("Customer or company name"),
  orderNumber: z.string().describe("Order number or reference"),
  productSpecifications: z.object({
    steelGrade: z.string().describe("Steel grade required (e.g., SS304, SS316)"),
    dimensions: z.string().nullable().describe("Dimensions or sizes required"),
    quantity: z.number().describe("Quantity in tons or pieces"),
    thickness: z.number().nullable().describe("Thickness in mm if specified"),
    width: z.number().nullable().describe("Width in mm if specified"),
    length: z.number().nullable().describe("Length in mm if specified"),
  }),
  deliveryDate: z.string().describe("Required delivery date in YYYY-MM-DD format"),
  specialRequirements: z.string().nullable().describe("Any special requirements or notes"),
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

export async function extractOrderDetails(orderText: string): Promise<ExtractedOrder> {
  const { object } = await generateObject({
    model: "openai/gpt-4.1",
    prompt: `Extract order details from the following customer order. The order may be from an Excel sheet, manual input, or scanned document:\n\n${orderText}`,
    schema: orderSchema,
  });

  return object;
}


