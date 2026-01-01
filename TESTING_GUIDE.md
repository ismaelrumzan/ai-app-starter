# Testing & Verification Guide

This guide helps you verify that all three lessons are working correctly. Use this **after completing each lesson** to ensure your implementation is functioning properly.

**Note**: This is a verification/testing guide, not a learning guide. For step-by-step learning, see the [guide/README.md](./guide/README.md) directory.

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

- Check that all JSON data files exist in `app/(1-invisible-ai-manufacturing)/raw-material-forecast/`
- Required files: `sample_orders.json`, `material_chart.json`, `historical_consumption.json`, `current_stock.json`, `supplier_data.json`

**Error: "API key not found"**

- Ensure `.env.local` exists with `OPENAI_API_KEY` or `VERCEL_OIDC_TOKEN`
- If using Vercel Gateway, run `vercel env pull` to refresh token

**Error: "Rate limit exceeded"**

- Wait a few minutes and try again
- Check your API key has sufficient credits

---

## Testing RAG: Manufacturing Knowledge Base

### Quick Test

1. **Generate embeddings (first time only):**

   ```bash
   pnpm rag:demo
   ```

   This creates the `embeddings.json` file with chunked and embedded knowledge base content.

2. **Start the development server:**

   ```bash
   pnpm dev
   # or if using Vercel Gateway:
   vercel dev
   ```

3. **Open the RAG interface:**
   - Navigate to: `http://localhost:3000/rag`
   - Or click the link from the homepage: `http://localhost:3000`

### Test Scenarios

#### Test 1: Material Specification Query

**Ask:** "What are the properties of SS304 steel?"

**Expected:**

- AI calls `getInformation` tool
- Retrieves relevant chunks from knowledge base
- Response includes: chemical composition, mechanical properties, physical properties, applications
- Tool invocation visible showing "Called tool: getInformation"

**Verify:**

- ✅ Tool is called automatically
- ✅ Response includes detailed material properties
- ✅ Information comes from knowledge base (not AI training data)
- ✅ Tool result shows retrieved chunks

#### Test 2: Procedure Query

**Ask:** "How do I handle quality issues?"

**Expected:**

- AI calls `getInformation` tool
- Finds relevant procedure chunks
- Provides step-by-step guidance from knowledge base

**Verify:**

- ✅ Tool retrieves relevant procedure information
- ✅ Response is based on knowledge base content
- ✅ Tool shows similarity scores and sources

#### Test 3: Material Code Query

**Ask:** "What material code should I use for 5mm SS304?"

**Expected:**

- AI calls `getInformation` tool
- Searches material charts
- Finds appropriate material code mapping

**Verify:**

- ✅ Tool finds relevant material chart information
- ✅ Response includes material code and specifications
- ✅ Information is accurate from knowledge base

#### Test 4: Adding New Content

**Ask:** "Remember that SS409 has 11% chromium and is used for automotive exhaust systems"

**Expected:**

- AI calls `addResource` tool
- New content is added to knowledge base
- Confirmation message displayed

**Verify:**

- ✅ `addResource` tool is called
- ✅ New content is embedded and stored
- ✅ Can query the new content afterward

### What to Verify

✅ **RAG Interface:**

- Page loads without errors
- Welcome message displays example queries
- Input field is functional
- Send button works
- Markdown rendering works (lists, formatting)

✅ **Tool Calling:**

- `getInformation` tool is called for every question
- Tool retrieves relevant chunks from knowledge base
- Tool results show similarity scores and sources
- `addResource` tool works for adding new content

✅ **Knowledge Base:**

- Responses are based on knowledge base content
- Information is comprehensive and detailed
- Similarity search finds relevant content
- Multiple chunks can be retrieved

✅ **Error Handling:**

- Questions with no relevant content show appropriate message
- Invalid queries are handled gracefully

### Troubleshooting

**Error: "embeddings.json not found"**

- Run `pnpm rag:demo` first to generate embeddings
- Check that `app/(2-rag-manufacturing)/knowledge-base/embeddings.json` exists

**Tool Not Being Called:**

- Verify system prompt requires tool usage in `app/api/rag/route.ts`
- Check tool descriptions are clear
- Ensure `stopWhen: stepCountIs(5)` is set

**No Relevant Results:**

- Verify embeddings were generated (`pnpm rag:demo`)
- Check similarity threshold (default 0.5) in `findRelevantContent`
- Try more specific queries

**Markdown Not Rendering:**

- Verify `react-markdown` and `remark-gfm` are installed
- Check that ReactMarkdown component is used in the UI

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
- Tool invocation visible in chat (shows "Called tool: getProductionStatus" or "Calling tool: getProductionStatus")

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

- Verify the page component includes tool part display code
- Check that `message.parts` with `type.startsWith("tool-")` is being accessed correctly
- Tools are displayed as parts of the message, not separate invocations

---

## Verification Checklist

After completing each lesson, verify everything works:

### Lesson 1: Invisible AI ✅

- [ ] `pnpm manufacturing:forecast` runs successfully
- [ ] All 3 orders are extracted correctly
- [ ] Material calculations work
- [ ] Forecast results are displayed
- [ ] No errors in console

### Lesson 2: RAG ✅

- [ ] `pnpm rag:demo` runs successfully and generates embeddings
- [ ] RAG interface loads at `/rag`
- [ ] Can ask questions and receive responses
- [ ] `getInformation` tool is called automatically
- [ ] Responses are based on knowledge base content
- [ ] Markdown rendering works correctly
- [ ] Can add new content with `addResource` tool

### Lesson 3: Conversational AI ✅

- [ ] Dev server starts without errors
- [ ] Operator Assistant page loads at `/manufacturing/operator-assistant`
- [ ] Can send messages and receive responses
- [ ] Tools are called automatically
- [ ] Tool calls are visible in chat
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
# Test Lesson 1: Invisible AI
pnpm manufacturing:forecast

# Test Lesson 2: RAG (first generate embeddings, then start server)
pnpm rag:demo
pnpm dev
# Then open: http://localhost:3000/rag

# Test Lesson 3: Conversational AI (in separate terminal)
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

## When to Use This Guide

### For Learners:

- **After completing each lesson** - Use this to verify your implementation works
- **When troubleshooting** - Check the troubleshooting sections for common issues
- **Before moving to next lesson** - Ensure current lesson is fully functional

### For Instructors:

- **Before teaching** - Verify all examples work correctly
- **During demos** - Use test scenarios as live demonstration examples
- **For troubleshooting** - Help students debug issues using this guide

---

## Need Help?

If something doesn't work:

1. Check the error message carefully
2. Verify environment variables
3. Check that all files exist
4. Review the troubleshooting section above
5. Check browser console (F12) for web errors
6. Check terminal for CLI errors
