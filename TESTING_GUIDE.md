# Testing Guide: Manufacturing AI Examples

This guide will help you test both the **Invisible AI** (Raw Material Forecasting) and **Conversational AI** (Operator Assistant) implementations before teaching.

## Prerequisites

### 1. Environment Setup

Ensure you have the required environment variables set up:

**Check for `.env.local` file:**
```bash
ls -la .env.local
```

**Required environment variables:**
- `OPENAI_API_KEY` - Your OpenAI API key (or use Vercel AI Gateway)
- `VERCEL_OIDC_TOKEN` - If using Vercel AI Gateway (auto-refreshed with `vercel dev`)

**If using Vercel AI Gateway:**
```bash
# Link your project (if not already done)
vercel link

# Deploy to get environment variables
vercel deploy

# Pull environment variables
vercel env pull
```

### 2. Install Dependencies

```bash
pnpm install
```

---

## Testing Invisible AI: Raw Material Forecasting

### Quick Test

Run the CLI script:

```bash
pnpm manufacturing:forecast
```

### Expected Output

You should see:

1. **Step 1: Extracting order details**
   - ✓ Extracted order: [order number] - [steel grade]
   - Should extract 3 orders from sample data

2. **Step 2: Calculating material requirements**
   - ✓ Calculated materials for each order
   - Shows number of material types needed
   - Shows estimated scrap for each order

3. **Step 3: Forecasting material needs**
   - Material forecast results with:
     - Material type, required quantity, current stock, shortfall
     - Forecast date and confidence level
     - Supplier recommendations
   - Scrap material forecast
   - Reasoning explanation

### What to Verify

✅ **Order Extraction Works:**
- All 3 sample orders are extracted successfully
- Order details (customer name, order number, steel grade, quantity, delivery date) are correctly parsed

✅ **Material Calculation Works:**
- Materials are calculated based on steel grade (SS304 vs SS316)
- Scrap estimates are provided for each order

✅ **Forecasting Works:**
- Material forecasts show required quantities vs current stock
- Shortfall calculations are correct
- Supplier recommendations are provided
- Scrap forecast includes utilization percentage

### Troubleshooting

**Error: "Cannot find module './sample_orders.json'"**
- Check that all JSON data files exist in `app/(6-invisible-ai-manufacturing)/raw-material-forecast/`
- Required files: `sample_orders.json`, `material_chart.json`, `historical_consumption.json`, `current_stock.json`, `supplier_data.json`

**Error: "API key not found"**
- Ensure `.env.local` exists with `OPENAI_API_KEY` or `VERCEL_OIDC_TOKEN`
- If using Vercel Gateway, run `vercel env pull` to refresh token

**Error: "Rate limit exceeded"**
- Wait a few minutes and try again
- Check your API key has sufficient credits

---

## Testing Conversational AI: Operator Assistant

### Quick Test

1. **Start the development server:**
   ```bash
   pnpm dev
   # or if using Vercel Gateway:
   vercel dev
   ```

2. **Open the Operator Assistant:**
   - Navigate to: `http://localhost:3000/manufacturing/operator-assistant`
   - Or click the link from the homepage: `http://localhost:3000`

### Test Scenarios

#### Test 1: Simple Production Status Query

**Ask:** "How many tons did we produce today?"

**Expected:**
- AI calls `getProductionStatus` tool
- Response shows: "Today's production is 1,250 tons"
- Tool invocation visible in chat (shows "Tools used: getProductionStatus")

**Verify:**
- ✅ Tool is called automatically
- ✅ Response includes actual production data
- ✅ Tool name is displayed in the message

#### Test 2: Work Order Status Query

**Ask:** "What's the status of work order WO-12345?"

**Expected:**
- AI calls `getWorkOrderStatus` tool
- Response shows: "Work order WO-12345 is currently in progress at 65% completion..."
- Includes details: status, progress, product grade, customer, expected completion

**Verify:**
- ✅ Tool is called with correct work order ID
- ✅ Response includes all relevant work order details
- ✅ Tool name is displayed

#### Test 3: Customer Name Search

**Ask:** "Where's the ABC Manufacturing order?"

**Expected:**
- AI calls `getWorkOrderStatus` with customer name
- Finds work order WO-12345 (ABC Manufacturing)
- Provides full status

**Verify:**
- ✅ Tool finds order by customer name (not just ID)
- ✅ Response is accurate

#### Test 4: Multi-Step Query

**Ask:** "Show me today's production and the status of WO-12345"

**Expected:**
- AI calls `getProductionStatus` first
- Then calls `getWorkOrderStatus`
- Combines both results in response

**Verify:**
- ✅ Multiple tools are called
- ✅ Both tool names are displayed
- ✅ Response synthesizes information from both tools

#### Test 5: Different Phrasings

Test that AI understands variations:

- "What's today's efficiency?" → Should call `getProductionStatus` with metric="efficiency"
- "Production status" → Should call `getProductionStatus`
- "Status of #12345" → Should find WO-12345 (handles partial ID)
- "How much did we make today?" → Should understand as production query

**Verify:**
- ✅ AI understands intent regardless of phrasing
- ✅ Appropriate tools are called
- ✅ Responses are accurate

### What to Verify

✅ **Chat Interface:**
- Page loads without errors
- Welcome message displays example queries
- Input field is functional
- Send button works

✅ **Tool Calling:**
- Tools are called automatically when needed
- Tool invocations are visible in chat messages
- Tool results are used correctly in responses

✅ **Multi-Step Execution:**
- AI can call multiple tools in sequence
- Complex queries are handled correctly
- Results are synthesized properly

✅ **Error Handling:**
- Invalid work order IDs show appropriate error messages
- Non-existent customer names are handled gracefully

### Troubleshooting

**Error: "Failed to fetch" or Network Error**
- Check that the dev server is running (`pnpm dev`)
- Verify the API route exists: `app/api/chat/route.ts`
- Check browser console for detailed error

**Tools Not Being Called:**
- Verify tools are imported correctly in `app/api/chat/route.ts`
- Check tool descriptions are clear and specific
- Try more explicit queries (e.g., "Get production status for today")

**No Response or Stuck on "Thinking..."**
- Check API key is valid
- Check network tab in browser DevTools for API errors
- Verify `OPENAI_API_KEY` or `VERCEL_OIDC_TOKEN` is set

**Tool Invocations Not Showing:**
- Verify the page component includes tool invocation display code
- Check that `message.toolInvocations` is being accessed correctly

---

## Pre-Teaching Checklist

Before starting your teaching session, verify:

### Invisible AI ✅
- [ ] `pnpm manufacturing:forecast` runs successfully
- [ ] All 3 orders are extracted correctly
- [ ] Material calculations work
- [ ] Forecast results are displayed
- [ ] No errors in console

### Conversational AI ✅
- [ ] Dev server starts without errors
- [ ] Operator Assistant page loads at `/manufacturing/operator-assistant`
- [ ] Can send messages and receive responses
- [ ] Tools are called automatically
- [ ] Tool invocations are visible
- [ ] Multi-step queries work
- [ ] No errors in browser console or terminal

### General ✅
- [ ] Environment variables are set
- [ ] All dependencies are installed
- [ ] No TypeScript errors
- [ ] All data files exist
- [ ] API keys are valid

---

## Quick Test Commands

```bash
# Test Invisible AI
pnpm manufacturing:forecast

# Test Conversational AI (in separate terminal)
pnpm dev
# Then open: http://localhost:3000/manufacturing/operator-assistant
```

---

## Common Issues and Solutions

### Issue: "Module not found" errors
**Solution:** Run `pnpm install` to ensure all dependencies are installed

### Issue: API rate limits
**Solution:** Wait a few minutes between tests, or use a different API key

### Issue: TypeScript errors
**Solution:** These are often from deleted files. Try `pnpm build` to see if there are real errors

### Issue: Port 3000 already in use
**Solution:** Kill the process: `lsof -ti:3000 | xargs kill -9` (Mac/Linux) or use a different port

---

## Testing During Teaching

### For Invisible AI Demo:
1. Run `pnpm manufacturing:forecast` live
2. Show the step-by-step output
3. Explain each step as it executes
4. Point out the structured data extraction
5. Show the forecast results

### For Conversational AI Demo:
1. Open the Operator Assistant in browser
2. Show the welcome message
3. Try each test query live
4. Point out tool calls in the UI
5. Demonstrate multi-step queries
6. Show how AI handles different phrasings

---

## Need Help?

If something doesn't work:
1. Check the error message carefully
2. Verify environment variables
3. Check that all files exist
4. Review the troubleshooting section above
5. Check browser console (F12) for web errors
6. Check terminal for CLI errors


