# AI SDK for Manufacturing - Starter Project

This is a comprehensive tutorial project for building AI-powered manufacturing applications using the Vercel AI SDK, focused on steel manufacturing plant operations.

## About the Course

The Vercel AI SDK is a free, open-source library for building AI-powered products. This course teaches you how to apply AI SDK concepts specifically to manufacturing use cases.

### What You'll Learn

This course is divided into three lessons:

- **Lesson 1: Invisible AI** - Automate data extraction and forecasting without user interaction
- **Lesson 2: RAG** - Build knowledge bases with semantic search using chunking and embeddings
- **Lesson 3: Conversational AI** - Create interactive chatbots with tool calling for real-time data

## Prerequisites

- JavaScript/TypeScript knowledge
- React familiarity
- Node.js v20 or later (LTS recommended)
- pnpm package manager
- Vercel account (free)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd build-an-ai-app-starter-sep-25
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Vercel AI Gateway

This project uses [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) for unified AI model access.

#### Link Your Project to Vercel

```bash
pnpm install -g vercel
vercel link
```

#### Deploy and Pull Environment Variables

```bash
vercel deploy
vercel env pull
```

This creates a `.env.local` file with your `VERCEL_OIDC_TOKEN` (valid for 12 hours).

#### Configure AI Provider Keys

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to AI Gateway → Integrations
3. Add your AI provider API keys (e.g., OpenAI, Anthropic)
4. Keys are securely stored and scoped to your Vercel team

### 4. Run the Development Server

```bash
# Use Vercel CLI for automatic OIDC token refresh
vercel dev

# Or use standard Next.js dev (manual token refresh required)
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the tutorial navigation page.

## Available Lessons

### Lesson 1: Invisible AI - Raw Material Forecasting

Learn how to automate order extraction, material calculation, and forecasting.

**Note**: This lesson uses command-line scripts only (no web interface).

**Command-line scripts:**

```bash
# Extract order details from sample data
pnpm manufacturing:extract-order

# Run complete forecasting pipeline
pnpm manufacturing:forecast
```

### Lesson 2: RAG - Manufacturing Knowledge Base

Build a knowledge base system with semantic search.

**Command-line script:**

```bash
# Demo chunking and cosine similarity
pnpm rag:demo
```

**Web interface:**

- Navigate to `/rag` to interact with the knowledge base

### Lesson 3: Conversational AI - Operator Assistant

Create an interactive chatbot with tool calling.

**Web interface:**

- Navigate to `/manufacturing/operator-assistant` to use the chatbot

## Project Structure

```
├── app/
│   ├── (1-invisible-ai-manufacturing)/    # Lesson 1: Invisible AI (CLI scripts)
│   │   └── raw-material-forecast/         # Order extraction, calculation, forecasting
│   ├── (2-rag-manufacturing)/             # Lesson 2: RAG
│   │   ├── demo-chunking-similarity.ts    # Demo script
│   │   ├── knowledge-base/                # Sample data and embeddings
│   │   └── rag/                          # RAG chat interface
│   ├── (3-conversational-ai-manufacturing)/ # Lesson 3: Conversational AI
│   │   └── operator-assistant/           # Chat interface (duplicate route)
│   ├── api/                               # API routes
│   │   ├── chat/                         # Operator assistant API
│   │   └── rag/                          # RAG agent API
│   ├── manufacturing/                     # Shared manufacturing resources
│   │   ├── operator-assistant/            # Lesson 3: Chat interface
│   │   └── tools/                        # Tool functions for chat
│   └── page.tsx                           # Homepage navigation
├── guide/                                 # Step-by-step learning guides
├── components/ui/                         # Reusable UI components
└── lib/                                   # Utility functions
    ├── ai/
    │   └── embedding.ts                   # Embedding generation and similarity
    └── vector-store.ts                    # JSON-based vector storage
```

## Learning Guides

Comprehensive step-by-step guides are available in the `guide/` directory:

- **[Guide Index](./guide/README.md)** - Start here for the learning path
- **[Getting Started](./guide/00-getting-started.md)** - Setup and configuration
- **Lesson 1 Guides** - Invisible AI (4 parts)
- **Lesson 2 Guides** - RAG (5 parts)
- **Lesson 3 Guides** - Conversational AI (4 parts)

## About Vercel AI Gateway

Vercel AI Gateway provides:

- **Unified API** - Switch between AI providers without code changes
- **High Reliability** - Automatic request retries and failover
- **Monitoring** - Track usage and spending across providers
- **Security** - Securely manage API keys at the team level
- **Load Balancing** - Distribute requests across multiple providers

## Technologies Used

- [Next.js 15](https://nextjs.org) - React framework
- [Vercel AI SDK](https://sdk.vercel.ai) - AI integration library
- [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) - AI proxy service
- [Tailwind CSS v4](https://tailwindcss.com) - Styling
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [TypeScript](https://www.typescriptlang.org) - Type safety

## Learn More

- [AI SDK Documentation](https://sdk.vercel.ai/docs) - Detailed SDK documentation
- [Vercel AI Gateway Docs](https://vercel.com/docs/ai-gateway) - Gateway documentation
- [Vercel AI Playground](https://sdk.vercel.ai/playground) - Experiment with AI models

## Deploy on Vercel

The easiest way to deploy your AI application is using the [Vercel Platform](https://vercel.com).
