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
    console.log(`✓ Extracted order: ${extracted.orderNumber} - ${extracted.productSpecifications.steelGrade}`);
  }

  // Step 2: Calculate material requirements for each order
  console.log("\n🧮 Step 2: Calculating material requirements...\n");
  const materialRequirements = [];
  for (const order of extractedOrders) {
    const requirements = await calculateMaterialRequirements(order, materialChart);
    materialRequirements.push(requirements);
    console.log(`✓ Calculated materials for order ${order.orderNumber}`);
    console.log(`  Materials needed: ${requirements.rawMaterials.length} types`);
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
        console.log(`      - ${supplier.supplierName} (${supplier.leadTime} days, reliability: ${supplier.reliability}%)`);
      });
    }
    console.log("");
  });

  console.log("\n♻️  Scrap Material Forecast:\n");
  console.log(`  Estimated Scrap: ${forecast.overallScrapForecast.estimatedScrap} tons`);
  console.log(`  Scrap Utilization: ${forecast.overallScrapForecast.scrapUtilization}%`);
  console.log(`  Disposal Required: ${forecast.overallScrapForecast.disposalRequired} tons`);

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

