import { tool } from "ai";
import { z } from "zod";

export const getWorkOrderStatus = tool({
  description:
    "Get the current status and progress of a work order from the MES system. Can find orders by work order ID (various formats like WO-12345, #67890, ORD-2024-001) or by customer name.",
  inputSchema: z.object({
    workOrderId: z
      .string()
      .optional()
      .describe(
        "The work order ID to query (e.g., WO-12345, #67890). Can be partial."
      ),
    customerName: z
      .string()
      .optional()
      .describe("Customer or company name to search for work orders"),
  }),
  execute: async ({ workOrderId, customerName }) => {
    try {
      // In production, this would query your MES API
      // For now, simulate with sample data
      const mockData: Record<string, any> = {
        "WO-12345": {
          workOrderId: "WO-12345",
          status: "in_progress",
          progress: 65,
          productGrade: "SS304",
          quantity: 500,
          customerName: "ABC Manufacturing",
          expectedCompletion: "2024-01-15T14:00:00Z",
          currentStage: "Hot Rolling",
        },
        "WO-12346": {
          workOrderId: "WO-12346",
          status: "completed",
          progress: 100,
          productGrade: "SS316",
          quantity: 300,
          customerName: "XYZ Corp",
          completedAt: "2024-01-15T12:30:00Z",
        },
        "ORD-2024-001": {
          workOrderId: "ORD-2024-001",
          status: "in_progress",
          progress: 45,
          productGrade: "SS304",
          quantity: 750,
          customerName: "Steel Works Ltd",
          expectedCompletion: "2024-02-20T10:00:00Z",
          currentStage: "Cold Rolling",
        },
        "#67890": {
          workOrderId: "#67890",
          status: "pending",
          progress: 0,
          productGrade: "SS316",
          quantity: 200,
          customerName: "Metal Industries Inc",
          expectedCompletion: "2024-02-25T16:00:00Z",
          currentStage: "Scheduling",
        },
      };

      // Normalize work order ID for matching (remove special chars, convert to lowercase)
      const normalizeId = (id: string) => id.toLowerCase().replace(/[#\s-]/g, "");

      // If searching by customer name
      if (customerName && !workOrderId) {
        const found = Object.values(mockData).find((wo: any) =>
          wo.customerName?.toLowerCase().includes(customerName.toLowerCase())
        );
        return (
          found || { error: `No work order found for customer: ${customerName}` }
        );
      }

      // Search by work order ID (handle various formats and partial matches)
      if (workOrderId) {
        const normalizedQuery = normalizeId(workOrderId);
        
        // First try exact match (case-insensitive, ignoring special chars)
        const exactMatch = Object.keys(mockData).find(
          (key) => normalizeId(key) === normalizedQuery
        );
        if (exactMatch) {
          return mockData[exactMatch];
        }

        // Then try partial match
        const partialMatch = Object.keys(mockData).find((key) =>
          normalizeId(key).includes(normalizedQuery) || normalizedQuery.includes(normalizeId(key))
        );
        if (partialMatch) {
          return mockData[partialMatch];
        }

        return { error: `Work order ${workOrderId} not found` };
      }

      return { error: "Please provide either work order ID or customer name" };
    } catch (error) {
      console.error("getWorkOrderStatus error:", error);
      return { error: "Failed to fetch work order status" };
    }
  },
});

