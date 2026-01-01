# Getting Started

Welcome! This guide will help you set up your development environment and prepare for the AI SDK manufacturing course.

## Learning Objectives

By the end of this guide, you will:
- [ ] Have the project cloned and dependencies installed
- [ ] Configure Vercel AI Gateway
- [ ] Set up environment variables
- [ ] Run the development server
- [ ] Understand the project structure

## Prerequisites Check

Before proceeding, ensure you have:

- ✅ Node.js v20 or later installed (`node --version`)
- ✅ pnpm installed (`pnpm --version`)
- ✅ A Vercel account ([sign up free](https://vercel.com))
- ✅ Git installed (`git --version`)

## Step 1: Clone and Install

If you haven't already, clone the repository and install dependencies:

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd build-an-ai-app-starter-sep-25

# Install dependencies
pnpm install
```

## Step 2: Set Up Vercel AI Gateway

This project uses [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) for unified AI model access. It provides:

- **Unified API** - Switch between AI providers without code changes
- **High Reliability** - Automatic request retries and failover
- **Monitoring** - Track usage and spending across providers
- **Security** - Securely manage API keys at the team level

### Link Your Project to Vercel

```bash
# Install Vercel CLI globally (if not already installed)
pnpm install -g vercel

# Link your project to Vercel
vercel link
```

Follow the prompts to link your project to your Vercel account.

### Deploy and Pull Environment Variables

```bash
# Deploy to Vercel (creates project if needed)
vercel deploy

# Pull environment variables to .env.local
vercel env pull
```

This creates a `.env.local` file with your `VERCEL_OIDC_TOKEN` (valid for 12 hours).

### Configure AI Provider Keys

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **AI Gateway** → **Integrations**
3. Add your AI provider API keys:
   - **OpenAI** - Get your API key from [platform.openai.com](https://platform.openai.com/api-keys)
   - **Anthropic** (optional) - Get your API key from [console.anthropic.com](https://console.anthropic.com)
4. Keys are securely stored and scoped to your Vercel team

## Step 3: Verify Environment Setup

Check that your `.env.local` file exists and contains:

```env
VERCEL_OIDC_TOKEN=your-token-here
```

**Note**: The OIDC token expires after 12 hours. If you get authentication errors, run `vercel env pull` again to refresh it.

## Step 4: Run the Development Server

You can run the development server in two ways:

### Option 1: Vercel CLI (Recommended)

```bash
vercel dev
```

This automatically refreshes your OIDC token and provides the best development experience.

### Option 2: Standard Next.js

```bash
pnpm dev
```

**Note**: With this option, you'll need to manually refresh your OIDC token every 12 hours by running `vercel env pull`.

Open [http://localhost:3000](http://localhost:3000) to see the tutorial navigation page.

## Project Structure

Here's the structure of the project:

```
build-an-ai-app-starter-sep-25/
├── app/
│   ├── (1-invisible-ai-manufacturing)/    # Lesson 1: Invisible AI
│   ├── (2-rag-manufacturing)/             # Lesson 2: RAG
│   ├── (3-conversational-ai-manufacturing)/ # Lesson 3: Conversational AI
│   ├── api/                               # API routes
│   └── page.tsx                           # Homepage
├── components/
│   └── ui/                                # Reusable UI components
├── guide/                                 # Learning guides (you are here!)
├── lib/                                   # Utility functions
└── package.json                           # Dependencies and scripts
```

## Available Scripts

The project includes several npm scripts for running lessons:

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Manufacturing lessons
pnpm manufacturing:forecast        # Run invisible AI forecast
pnpm manufacturing:extract-order   # Run order extraction demo
pnpm rag:demo                      # Run RAG chunking and similarity demo (Lesson 2)
```

## Troubleshooting

### Common Issues

**Issue**: `VERCEL_OIDC_TOKEN` not found or expired
- **Solution**: Run `vercel env pull` to refresh the token

**Issue**: API calls failing with authentication errors
- **Solution**: 
  1. Verify AI provider keys are added in Vercel Dashboard
  2. Check that `VERCEL_OIDC_TOKEN` is valid (refresh if needed)
  3. Ensure you're using `vercel dev` or have refreshed tokens recently

**Issue**: Dependencies not installing
- **Solution**: 
  1. Delete `node_modules` and `pnpm-lock.yaml`
  2. Run `pnpm install` again
  3. Check Node.js version is v20+

**Issue**: Port 3000 already in use
- **Solution**: 
  1. Kill the process using port 3000: `lsof -ti:3000 | xargs kill`
  2. Or use a different port: `pnpm dev -- -p 3001`

## Check Your Understanding

Before moving on, verify you can:

- [ ] Run `pnpm dev` and see the homepage at localhost:3000
- [ ] See your Vercel project linked (check with `vercel ls`)
- [ ] Have AI provider keys configured in Vercel Dashboard
- [ ] Understand the project structure

## Next Steps

You're all set! Ready to start learning? Begin with:

**[→ Lesson 1, Part 1: Introduction to Invisible AI](./01-invisible-ai-part1-introduction.md)**

---

**Previous**: [Guide Index](./README.md)  
**Next**: [Lesson 1, Part 1: Introduction to Invisible AI](./01-invisible-ai-part1-introduction.md)

