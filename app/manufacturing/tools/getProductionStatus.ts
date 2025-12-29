import { tool } from "ai";
import { z } from "zod";

export const getProductionStatus = tool({
  description:
    "Get production status including daily totals, efficiency metrics, quality rates, and current production. Can query for today, yesterday, or specific dates.",
  inputSchema: z.object({
    date: z
      .string()
      .optional()
      .describe(
        "Date to query in YYYY-MM-DD format. If not provided, returns today's data"
      ),
    metric: z
      .enum(["total", "efficiency", "quality", "all"])
      .optional()
      .describe('Specific metric to retrieve, or "all" for complete status'),
  }),
  execute: async ({ date, metric = "all" }) => {
    try {
      // In production, this would query your production database
      // For now, simulate with sample data
      const now = new Date();
      const today = now.toISOString().split("T")[0];

      // Handle special date strings like "today" or "yesterday"
      let queryDate = date || today;
      if (date?.toLowerCase() === "today") {
        queryDate = today;
      } else if (date?.toLowerCase() === "yesterday") {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        queryDate = yesterday.toISOString().split("T")[0];
      }

      // Get yesterday's date for testing
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      // Build mock data with dynamically computed dates
      const mockData: Record<string, any> = {
        [today]: {
          date: today,
          totalProduction: 1250,
          unit: "tons",
          efficiency: 87.5,
          qualityRate: 98.2,
          defectRate: 1.8,
          activeWorkOrders: 5,
          completedWorkOrders: 3,
          currentShift: "Day Shift",
        },
        [yesterdayStr]: {
          date: yesterdayStr,
          totalProduction: 1180,
          unit: "tons",
          efficiency: 85.2,
          qualityRate: 97.5,
          defectRate: 2.5,
          activeWorkOrders: 6,
          completedWorkOrders: 2,
          currentShift: "Night Shift",
        },
        // Add a few more dates for testing
        "2024-01-15": {
          date: "2024-01-15",
          totalProduction: 1320,
          unit: "tons",
          efficiency: 89.1,
          qualityRate: 98.8,
          defectRate: 1.2,
          activeWorkOrders: 4,
          completedWorkOrders: 4,
          currentShift: "Day Shift",
        },
      };

      // Get data for the query date, with fallback to today if not found
      let data = mockData[queryDate];

      if (!data) {
        // If specific date not found, try today's data as fallback
        data = mockData[today];
      }

      if (!data) {
        // Final fallback - return default structure
        data = {
          date: queryDate,
          totalProduction: 0,
          unit: "tons",
          efficiency: 0,
          qualityRate: 0,
          defectRate: 0,
          activeWorkOrders: 0,
          completedWorkOrders: 0,
          message: "No data available for this date",
        };
      }

      // Return specific metric if requested
      if (metric !== "all") {
        // Check if the metric exists in the data (handle 0 as a valid value)
        if (
          metric in data &&
          data[metric] !== undefined &&
          data[metric] !== null
        ) {
          return { [metric]: data[metric] };
        }
        // Try with "Rate" suffix (e.g., "quality" -> "qualityRate")
        const rateKey = `${metric}Rate`;
        if (
          rateKey in data &&
          data[rateKey] !== undefined &&
          data[rateKey] !== null
        ) {
          return { [metric]: data[rateKey] };
        }
        // Metric not found
        return { [metric]: "N/A" };
      }

      return data;
    } catch (error) {
      console.error("getProductionStatus error:", error);
      return { error: "Failed to fetch production status" };
    }
  },
});
