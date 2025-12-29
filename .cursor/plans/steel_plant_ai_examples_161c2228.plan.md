---
name: Steel Plant AI Examples
overview: "Create comprehensive manufacturing AI implementations with guides covering: Invisible AI (Classification, Structured Extraction, Summarization) and Conversational AI (Basic Chatbot, AI Elements, Tool Use, Multi-step/Generative UI), following Vercel Academy lesson structure."
todos:
  - id: create_guide_structure
    content: Create guide/ folder structure for markdown instructional files
    status: pending
  - id: create_invisible_ai_guide
    content: Create guide/invisible-ai-manufacturing.md with Classification, Extraction, and Summarization sections
    status: pending
    dependencies:
      - create_guide_structure
  - id: create_conversational_ai_guide
    content: Create guide/conversational-ai-manufacturing.md with Chatbot, AI Elements, Tool Use, and Multi-step sections
    status: pending
    dependencies:
      - create_guide_structure
  - id: create_classification_implementation
    content: Create classification example for production issues/quality reports (CLI)
    status: pending
  - id: create_extraction_implementation
    content: Create structured extraction example for work orders/BOM data (Web)
    status: pending
  - id: create_summarization_implementation
    content: Create summarization example for production reports/shift summaries (Web)
    status: pending
  - id: create_basic_chatbot
    content: Create basic chatbot interface for operator assistant (Web)
    status: pending
  - id: implement_ai_elements
    content: Implement AI SDK React hooks (useChat, useCompletion) in chatbot
    status: pending
    dependencies:
      - create_basic_chatbot
  - id: implement_tool_use
    content: Implement tool calling for MES/PLC/SCADA data queries (focused)
    status: pending
    dependencies:
      - implement_ai_elements
  - id: implement_multi_step_ui
    content: Implement multi-step troubleshooting and generative UI (focused)
    status: pending
    dependencies:
      - implement_tool_use
  - id: add_npm_scripts
    content: Add npm scripts for all CLI examples
    status: pending
  - id: update_navigation
    content: Add all web examples to homepage navigation
    status: pending
---

# Steel Manufacturing Plant AI Implementation Examples

## Overview

Create comprehensive educational examples demonstrating AI implementation in a steel manufacturing context, structured to match Vercel Academy lessons. Includes detailed markdown guides for developers who have completed the fundamentals section.

## Guide Structure

### Instructional Markdown Files

**Location**: `guide/` folder at project root

**Files**:
- `guide/invisible-ai-manufacturing.md` - Complete guide covering Classification, Structured Extraction, and Summarization
- `guide/conversational-ai-manufacturing.md` - Complete guide covering Basic Chatbot, AI Elements, Tool Use, and Multi-step/Generative UI

**Style Reference**: Follow the structure and style of Vercel AI SDK Academy lessons:
- [Text Classification](https://vercel.com/academy/ai-sdk/text-classification)
- [Structured Data Extraction](https://vercel.com/academy/ai-sdk/structured-data-extraction)
- [Automatic Summarization](https://vercel.com/academy/ai-sdk/automatic-summarization)
- [Basic Chatbot](https://vercel.com/academy/ai-sdk/basic-chatbot)
- [AI Elements](https://vercel.com/academy/ai-sdk/ai-elements)
- [Tool Use](https://vercel.com/academy/ai-sdk/tool-use)
- [Multi-step and Generative UI](https://vercel.com/academy/ai-sdk/multi-step-and-generative-ui)

## Invisible AI Guide Structure

### guide/invisible-ai-manufacturing.md

**Section 1: Text Classification**
- **Manufacturing Use Case**: Classifying production issues, quality reports, maintenance requests
- **Example**: Classify production incident reports into categories (equipment_failure, quality_defect, safety_incident, process_deviation, material_issue)
- **Implementation**: CLI script using `generateObject` with `output: 'array'`
- **Follows**: [Text Classification lesson structure](https://vercel.com/academy/ai-sdk/text-classification)
- **Key Topics**:
  - Using `z.enum()` for fixed categories
  - Multi-item classification with `output: 'array'`
  - Iterating schema (adding urgency, language detection)
  - Using `.describe()` for better results

**Section 2: Structured Data Extraction**
- **Manufacturing Use Case**: Extracting work order details, BOM data, production parameters from natural language
- **Example**: Extract structured work order from operator notes like "Produce 500 tons of Grade SS304 for Order #12345, start furnace at 1600°C, add 2% chromium"
- **Implementation**: Web interface with form input and structured display
- **Follows**: [Structured Data Extraction lesson structure](https://vercel.com/academy/ai-sdk/structured-data-extraction)
- **Key Topics**:
  - Detailed Zod schemas for manufacturing data
  - Using `nullable()` for optional fields
  - `.describe()` for format specifications and context
  - Date/time parsing with manufacturing context

**Section 3: Automatic Summarization**
- **Manufacturing Use Case**: Summarizing production reports, shift summaries, quality analysis data
- **Example**: Summarize a day's production data (multiple work orders, quality metrics, downtime events)
- **Implementation**: Web interface with data display and summary generation
- **Follows**: [Automatic Summarization lesson structure](https://vercel.com/academy/ai-sdk/automatic-summarization)
- **Key Topics**:
  - Using `generateText` for summarization
  - Context-aware summaries (production metrics, quality data)
  - Displaying summaries in UI components

## Conversational AI Guide Structure

### guide/conversational-ai-manufacturing.md

**Section 1: Basic Chatbot**
- **Manufacturing Use Case**: Operator assistant for querying production status
- **Example**: Simple chat interface for operators to ask questions about production
- **Implementation**: Web interface with streaming chat
- **Follows**: [Basic Chatbot lesson structure](https://vercel.com/academy/ai-sdk/basic-chatbot)
- **Key Topics**:
  - Setting up `streamText` API route
  - Basic chat interface
  - Manufacturing context in system prompts

**Section 2: AI Elements**
- **Manufacturing Use Case**: Using AI SDK React hooks for better UX
- **Example**: Enhanced chatbot with `useChat` hook, loading states, error handling
- **Implementation**: Upgrade basic chatbot with React hooks
- **Follows**: [AI Elements lesson structure](https://vercel.com/academy/ai-sdk/ai-elements)
- **Key Topics**:
  - `useChat` hook for chat interfaces
  - `useCompletion` for single completions
  - Managing state with AI SDK hooks
  - Better UX patterns

**Section 3: Tool Use (FOCUSED)**
- **Manufacturing Use Case**: Querying MES systems, PLC/SCADA data, production databases
- **Example**: Chatbot that can call tools to fetch real-time production data, work order status, machine metrics
- **Implementation**: Extend chatbot with tool calling capabilities
- **Follows**: [Tool Use lesson structure](https://vercel.com/academy/ai-sdk/tool-use)
- **Key Topics**:
  - Defining tools with Zod schemas
  - Tool calling for MES data queries
  - PLC/SCADA data integration
  - Real-time production metrics
  - Error handling for tool calls

**Section 4: Multi-step and Generative UI (FOCUSED)**
- **Manufacturing Use Case**: Multi-step troubleshooting workflows, dynamic production dashboards
- **Example**: Chatbot that guides operators through troubleshooting steps, generates dynamic UI based on production data
- **Implementation**: Advanced chatbot with multi-step reasoning and UI generation
- **Follows**: [Multi-step and Generative UI lesson structure](https://vercel.com/academy/ai-sdk/multi-step-and-generative-ui)
- **Key Topics**:
  - Multi-step reasoning workflows
  - Generative UI components
  - Dynamic dashboard generation
  - Progressive disclosure of information
  - Complex manufacturing workflows

## Implementation Structure

### Invisible AI Examples

#### 1. Classification (CLI)
**Location**: `app/(6-invisible-ai-manufacturing)/classification/`
- `production-incident-classification.ts` - CLI script
- `production_incidents.json` - Sample incident reports
- `production_incidents_multilanguage.json` - Multi-language variant

**Schema Example**:
```typescript
const incidentSchema = z.object({
  incident: z.string().describe('The original incident report text.'),
  category: z.enum([
    'equipment_failure',
    'quality_defect',
    'safety_incident',
    'process_deviation',
    'material_issue'
  ]).describe('The category of the production incident.'),
  urgency: z.enum(['low', 'medium', 'high', 'critical'])
    .describe('The urgency level based on impact on production.'),
  affectedArea: z.string().describe('The production area or equipment affected.'),
});
```

#### 2. Structured Extraction (Web)
**Location**: `app/(6-invisible-ai-manufacturing)/extraction/`
- `page.tsx` - Web interface with form
- `work-order-display.tsx` - Component to display extracted work order
- `actions.ts` - Server action for extraction

**Schema Example**:
```typescript
const workOrderSchema = z.object({
  productGrade: z.string().describe('Steel grade to produce (e.g., SS304, SS316).'),
  quantity: z.number().describe('Quantity in tons.'),
  orderNumber: z.string().describe('Customer order number.'),
  furnaceTemperature: z.number().nullable()
    .describe('Required furnace temperature in Celsius.'),
  alloyComposition: z.record(z.number()).nullable()
    .describe('Alloy percentages (e.g., { chromium: 18, nickel: 8 }).'),
  startDate: z.string().describe('Production start date in YYYY-MM-DD format.'),
  priority: z.enum(['low', 'normal', 'high', 'urgent'])
    .describe('Production priority level.'),
});
```

#### 3. Summarization (Web)
**Location**: `app/(6-invisible-ai-manufacturing)/summarization/`
- `page.tsx` - Web interface with production data
- `production-summary-card.tsx` - Component for summary display
- `production_data.json` - Sample production data (work orders, quality metrics, downtime)

### Conversational AI Examples

#### 1. Basic Chatbot (Web)
**Location**: `app/(7-conversational-ai-manufacturing)/operator-assistant/`
- `page.tsx` - Basic chat interface
- `app/api/chat/route.ts` - API route with `streamText`

#### 2. AI Elements (Web)
**Location**: Same as Basic Chatbot, enhanced version
- Upgrade `page.tsx` to use `useChat` hook
- Add loading states, error handling
- Better message display

#### 3. Tool Use (Web - FOCUSED)
**Location**: `app/(7-conversational-ai-manufacturing)/operator-assistant-tools/`
- `page.tsx` - Chat interface with tool support
- `app/api/chat-tools/route.ts` - API route with tool definitions
- `tools/` - Tool implementations:
  - `getWorkOrderStatus.ts` - Query work order from MES
  - `getMachineMetrics.ts` - Query PLC/SCADA data
  - `getQualityMetrics.ts` - Query quality database
  - `getProductionSchedule.ts` - Query production planning

**Tool Example**:
```typescript
const getWorkOrderStatus = tool({
  description: 'Get the current status of a work order from the MES system',
  parameters: z.object({
    workOrderId: z.string().describe('The work order ID to query'),
  }),
  execute: async ({ workOrderId }) => {
    // Simulate MES query
    return { status: 'in_progress', progress: 65, ... };
  },
});
```

#### 4. Multi-step and Generative UI (Web - FOCUSED)
**Location**: `app/(7-conversational-ai-manufacturing)/operator-assistant-advanced/`
- `page.tsx` - Advanced chat with multi-step support
- `app/api/chat-advanced/route.ts` - API route with multi-step reasoning
- `components/`:
  - `troubleshooting-wizard.tsx` - Multi-step troubleshooting UI
  - `production-dashboard.tsx` - Generative dashboard component
  - `step-indicator.tsx` - Progress indicator for multi-step flows

## File Structure

```
guide/
├── invisible-ai-manufacturing.md
└── conversational-ai-manufacturing.md

app/
├── (6-invisible-ai-manufacturing)/
│   ├── classification/
│   │   ├── production-incident-classification.ts
│   │   ├── production_incidents.json
│   │   └── production_incidents_multilanguage.json
│   ├── extraction/
│   │   ├── page.tsx
│   │   ├── work-order-display.tsx
│   │   └── actions.ts
│   └── summarization/
│       ├── page.tsx
│       ├── production-summary-card.tsx
│       └── production_data.json
└── (7-conversational-ai-manufacturing)/
    ├── operator-assistant/
    │   └── page.tsx
    ├── operator-assistant-tools/
    │   ├── page.tsx
    │   └── tools/
    │       ├── getWorkOrderStatus.ts
    │       ├── getMachineMetrics.ts
    │       ├── getQualityMetrics.ts
    │       └── getProductionSchedule.ts
    └── operator-assistant-advanced/
        ├── page.tsx
        └── components/
            ├── troubleshooting-wizard.tsx
            ├── production-dashboard.tsx
            └── step-indicator.tsx

app/api/
├── chat/
│   └── route.ts
├── chat-tools/
│   └── route.ts
└── chat-advanced/
    └── route.ts
```

## Guide Content Details

### invisible-ai-manufacturing.md

**Introduction**
- What is Invisible AI in Manufacturing?
- Manufacturing context from MES flow architecture
- Three key patterns: Classification, Extraction, Summarization

**Section 1: Text Classification**
- The Problem: Unstructured production incident reports
- The Solution: `generateObject` with `z.enum()`
- Step-by-step implementation
- Iteration: Adding urgency and affected areas
- Multi-language support
- Learning prompts for schema refinement

**Section 2: Structured Data Extraction**
- The Problem: Natural language work orders
- The Solution: Detailed Zod schemas
- Step-by-step implementation
- Refining with `.describe()` for manufacturing context
- Date/time parsing with production schedules
- Learning prompts for advanced extraction

**Section 3: Automatic Summarization**
- The Problem: Information overload in production reports
- The Solution: `generateText` for summaries
- Step-by-step implementation
- Context-aware summarization
- Displaying summaries in UI
- Learning prompts for better summaries

**Reflection Prompts**
- Other invisible AI opportunities in the plant
- Integration with existing MES systems

**Next Steps**
- Real-world integration
- Extending to other use cases (BOM preparation, routing optimization)

### conversational-ai-manufacturing.md

**Introduction**
- What is Conversational AI in Manufacturing?
- Operator support use cases
- Four key patterns: Basic Chat, AI Elements, Tool Use, Multi-step UI

**Section 1: Basic Chatbot**
- Setting up streaming chat
- Manufacturing context in system prompts
- Step-by-step implementation
- Testing with operator queries

**Section 2: AI Elements**
- Using `useChat` hook
- Better state management
- Loading states and error handling
- Step-by-step upgrade from basic chatbot

**Section 3: Tool Use (FOCUSED)**
- Why tools matter in manufacturing
- Defining tools with Zod schemas
- Tool implementations for MES/PLC/SCADA
- Step-by-step implementation
- Error handling and fallbacks
- Learning prompts for tool design

**Section 4: Multi-step and Generative UI (FOCUSED)**
- Complex manufacturing workflows
- Multi-step troubleshooting
- Generative UI for dynamic dashboards
- Step-by-step implementation
- Progressive disclosure patterns
- Learning prompts for workflow design

**Reflection Prompts**
- Other conversational AI opportunities
- Balancing helpfulness with accuracy
- Safety considerations in manufacturing

**Next Steps**
- Integration with real production systems
- Voice interface for hands-free operation
- Multi-language support for operators

## Implementation Details

### Classification (CLI)
- Use `generateObject` with `output: 'array'`
- Categories: equipment_failure, quality_defect, safety_incident, process_deviation, material_issue
- Add urgency and affected area fields
- Support multi-language incident reports
- NPM script: `"manufacturing:classify": "tsx app/\\(6-invisible-ai-manufacturing\\)/classification/production-incident-classification.ts"`

### Extraction (Web)
- Server action using `generateObject`
- Detailed Zod schema for work orders
- Form input with natural language
- Display component for structured data
- Route: `/manufacturing/extraction`

### Summarization (Web)
- `generateText` for summary generation
- Context from production data JSON
- Summary card component
- Route: `/manufacturing/summarization`

### Basic Chatbot (Web)
- API route with `streamText`
- Simple chat interface
- Manufacturing system prompts
- Route: `/manufacturing/operator-assistant`

### Tool Use (Web - FOCUSED)
- API route with tool definitions
- Tools for MES, PLC/SCADA queries
- Tool calling in chat interface
- Error handling for tool failures
- Route: `/manufacturing/operator-assistant-tools`

### Multi-step UI (Web - FOCUSED)
- Multi-step reasoning workflows
- Generative UI components
- Dynamic dashboard generation
- Progress indicators
- Route: `/manufacturing/operator-assistant-advanced`

## Data Modeling

Create realistic steel manufacturing scenarios:
- **Incident Reports**: Equipment failures, quality defects, safety incidents
- **Work Orders**: Steel grades (SS304, SS316), quantities, temperatures, alloy compositions
- **Production Data**: Work orders, quality metrics, downtime events, shift summaries
- **Machine Metrics**: Furnace temperatures, throughput rates, energy consumption
- **Quality Metrics**: Defect rates, rework percentages, test results

## Educational Value

- Comprehensive coverage of all Vercel Academy invisible AI patterns
- Comprehensive coverage of all Vercel Academy conversational AI patterns
- Manufacturing-specific context and terminology
- Focused deep-dives on Tool Use and Multi-step UI
- Step-by-step guides following Academy lesson structure
- Learning prompts for AI-assisted development
- Real-world integration considerations

