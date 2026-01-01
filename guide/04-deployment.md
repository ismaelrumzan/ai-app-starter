# Deployment Guide: Deploying to Vercel

This guide covers deploying your AI manufacturing application to Vercel, including important considerations for file system access in serverless environments.

## ⚠️ Production Recommendation

**For production RAG systems**, you should migrate to a **vector database** (Pinecone, pgvector, Weaviate, etc.) rather than using file-based storage. Vector databases are optimized for similarity search, scalable, and production-ready. See [Option 3: Vector Database](#option-3-vector-database-production-recommended) for details.

The file-based solutions (Options 1 and 2) are suitable for **learning and small projects only**.

## Learning Objectives

By the end of this guide, you will:
- [ ] Understand how to deploy to Vercel
- [ ] Know why file system access doesn't work in serverless environments
- [ ] Learn how to handle data files (embeddings, knowledge base) in production
- [ ] Configure environment variables for production
- [ ] Understand deployment options for RAG knowledge bases

## Prerequisites

Before deploying, ensure you have:
- ✅ Completed all three lessons
- ✅ Tested your application locally
- ✅ A Vercel account ([sign up free](https://vercel.com))
- ✅ Vercel CLI installed (`pnpm install -g vercel`)
- ✅ Your project linked to Vercel (`vercel link`)

## Quick Deployment

### Step 1: Prepare Your Project

Ensure your project is ready:

```bash
# Build locally to check for errors
pnpm build

# Fix any build errors before deploying
```

### Step 2: Deploy to Vercel

```bash
# Deploy to production
vercel --prod

# Or deploy to preview
vercel
```

Vercel will:
1. Build your Next.js application
2. Deploy to a global CDN
3. Provide you with a production URL

## Important: File System Limitations

### The Problem

**Serverless functions on Vercel have a read-only file system.** This means:

❌ **Won't work in production:**
- `fs.readFileSync()` - Reading local JSON files
- `fs.writeFileSync()` - Writing to local files
- `fs.existsSync()` - Checking if files exist
- Any file system operations that modify files

✅ **Works in production:**
- Reading files bundled with your code (at build time)
- Environment variables
- External APIs and databases
- Vercel Blob Storage

### What This Affects

In your application, these components use file system access:

1. **RAG Knowledge Base** (`lib/vector-store.ts`)
   - Reads `embeddings.json` using `fs.readFileSync()`
   - Writes to `embeddings.json` using `fs.writeFileSync()`
   - **This won't work in production!**

2. **Demo Scripts** (`demo-chunking-similarity.ts`)
   - Reads knowledge base JSON files
   - Generates and writes embeddings
   - **These are CLI tools - run locally, not in production**

3. **Invisible AI Scripts** (`extract-order.ts`, etc.)
   - Reads sample data JSON files
   - **These are CLI tools - run locally, not in production**

## Solutions for Production

### ⚠️ Important: Production Considerations

**For learning**: The solutions below (Option 1 and 2) work for learning and small projects, but have limitations.

**For production applications**: You should use a **vector database** with proper vector search capabilities. See [Option 3: Vector Database](#option-3-vector-database-production-recommended) below.

### Option 1: Pre-generate and Bundle Embeddings (Learning Only)

**Best for**: Learning projects, small static knowledge bases

**Limitations**:
- ❌ Can't add new content at runtime
- ❌ Limited scalability
- ❌ Not suitable for production

**How it works**:
1. Generate embeddings locally using `pnpm rag:demo`
2. Commit `embeddings.json` to your repository
3. Read it at build time (bundled with your code)

**Implementation**:

1. **Generate embeddings locally:**
   ```bash
   pnpm rag:demo
   ```

2. **Commit the embeddings file:**
   ```bash
   git add app/(2-rag-manufacturing)/knowledge-base/embeddings.json
   git commit -m "Add pre-generated embeddings"
   ```

3. **Update `lib/vector-store.ts` to handle both local and production:**

```typescript
import fs from "fs";
import { generateEmbedding, calculateCosineSimilarity } from "./ai/embedding";

// ... existing interfaces ...

// Try to load from file system (local dev) or bundled (production)
export function loadEmbeddings(filePath: string): EmbeddingStore {
  // In production, try to import the bundled file
  if (typeof window === "undefined" && process.env.NODE_ENV === "production") {
    try {
      // Import the bundled JSON file
      const embeddings = require(filePath);
      return embeddings;
    } catch {
      // Fallback to empty if not found
      return { chunks: [] };
    }
  }
  
  // Local development: use file system
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  }
  
  return { chunks: [] };
}

// Note: saveEmbeddings and addChunks won't work in production
// For production, you'd need to use external storage (see Option 2)
```

**Limitations**:
- ❌ Can't add new content at runtime (`addResource` tool won't work)
- ✅ Works for read-only knowledge bases
- ✅ Simple and sufficient for learning

### Option 2: Vercel Blob Storage (Small Production Apps)

**Best for**: Small production applications, dynamic content, when you can't use a vector database

**Limitations**:
- ⚠️ Not optimized for vector similarity search
- ⚠️ Requires loading all embeddings into memory for search
- ⚠️ Performance degrades with large knowledge bases
- ⚠️ **For production, consider Option 3 (Vector Database) instead**

**How it works**:
1. Store embeddings in Vercel Blob Storage
2. Read/write via API calls
3. Supports dynamic updates
4. Load all embeddings and search in-memory

**Setup**:

1. **Install Vercel Blob:**
   ```bash
   pnpm add @vercel/blob
   ```

2. **Create a blob store:**
   - Go to Vercel Dashboard → Your Project → Storage
   - Create a new Blob store
   - Note the store name

3. **Update `lib/vector-store.ts:**

```typescript
import { put, get, list } from '@vercel/blob';
import { generateEmbedding, calculateCosineSimilarity } from "./ai/embedding";

const BLOB_STORE_NAME = process.env.BLOB_STORE_NAME || 'embeddings-store';
const EMBEDDINGS_KEY = 'embeddings.json';

export async function loadEmbeddings(): Promise<EmbeddingStore> {
  try {
    const blob = await get(`${BLOB_STORE_NAME}/${EMBEDDINGS_KEY}`);
    const text = await blob.text();
    return JSON.parse(text);
  } catch (error) {
    // If blob doesn't exist, return empty
    return { chunks: [] };
  }
}

export async function saveEmbeddings(store: EmbeddingStore): Promise<void> {
  await put(`${BLOB_STORE_NAME}/${EMBEDDINGS_KEY}`, JSON.stringify(store, null, 2), {
    access: 'public',
    contentType: 'application/json',
  });
}

export async function addChunks(chunks: ChunkWithEmbedding[]): Promise<void> {
  const store = await loadEmbeddings();
  store.chunks.push(...chunks);
  await saveEmbeddings(store);
}

export async function findRelevantContent(
  userQuery: string,
  threshold: number = 0.5,
  topK: number = 4
): Promise<SimilarChunk[]> {
  const store = await loadEmbeddings();
  // ... rest of the function stays the same ...
}
```

4. **Update API route to use new functions:**

```typescript
// app/api/rag/route.ts
import { findRelevantContent, addChunks } from "@/lib/vector-store";

// Remove filePath parameter - now uses blob storage
const relevant = await findRelevantContent(question, 0.5, 4);
```

5. **Set environment variable:**
   ```bash
   vercel env add BLOB_STORE_NAME
   # Enter your blob store name
   ```

**Benefits**:
- ✅ Works in production
- ✅ Supports dynamic updates
- ✅ Persistent storage

**Limitations**:
- ⚠️ Not optimized for vector search (loads all embeddings into memory)
- ⚠️ Performance degrades with large knowledge bases
- ⚠️ **For production, consider migrating to a vector database (Option 3)**

### Option 3: Vector Database (Production Recommended) ⭐

**Best for**: Production applications, large knowledge bases, scalable RAG systems

**Why Vector Databases?**
- ✅ **Optimized for similarity search** - Built for vector operations
- ✅ **Scalable** - Handles millions of vectors efficiently
- ✅ **Fast queries** - Indexed vector search (much faster than in-memory)
- ✅ **Production-ready** - Used by major AI applications
- ✅ **Dynamic updates** - Add/update/delete vectors easily

**Recommended Vector Databases:**

#### 3a. Pinecone (Easiest - Managed Service)

**Best for**: Quick setup, managed infrastructure

```typescript
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.index('manufacturing-knowledge');

// Upsert embeddings
await index.upsert([
  {
    id: 'chunk_1',
    values: embedding,
    metadata: { content: '...', source: '...' }
  }
]);

// Query similar vectors
const results = await index.query({
  vector: queryEmbedding,
  topK: 4,
  includeMetadata: true,
});
```

**Setup**:
1. Sign up at [pinecone.io](https://pinecone.io)
2. Create an index
3. Install: `pnpm add @pinecone-database/pinecone`
4. Update `lib/vector-store.ts` to use Pinecone API

#### 3b. PostgreSQL with pgvector (Self-Hosted)

**Best for**: You already use PostgreSQL, want self-hosted solution

```typescript
import { Pool } from 'pg';
import { PoolClient } from 'pg';

// Create table with vector column
await pool.query(`
  CREATE TABLE IF NOT EXISTS embeddings (
    id TEXT PRIMARY KEY,
    content TEXT,
    embedding vector(1536),
    source TEXT,
    metadata JSONB
  );
  
  CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops);
`);

// Query similar vectors
const results = await pool.query(`
  SELECT content, source, metadata,
    1 - (embedding <=> $1::vector) as similarity
  FROM embeddings
  WHERE 1 - (embedding <=> $1::vector) > $2
  ORDER BY embedding <=> $1::vector
  LIMIT $3
`, [queryEmbedding, threshold, topK]);
```

**Setup**:
1. Install PostgreSQL with pgvector extension
2. Install: `pnpm add pg @types/pg`
3. Update `lib/vector-store.ts` to use PostgreSQL

#### 3c. Weaviate (Open-Source)

**Best for**: Open-source preference, self-hosted or cloud

```typescript
import weaviate from 'weaviate-ts-client';

const client = weaviate.client({
  scheme: 'https',
  host: process.env.WEAVIATE_HOST!,
  apiKey: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY!),
});

// Query similar vectors
const result = await client.graphql
  .get()
  .withClassName('ManufacturingChunk')
  .withFields('content source metadata')
  .withNearVector({ vector: queryEmbedding })
  .withLimit(topK)
  .do();
```

**Setup**:
1. Deploy Weaviate (self-hosted or Weaviate Cloud)
2. Install: `pnpm add weaviate-ts-client`
3. Update `lib/vector-store.ts` to use Weaviate

#### 3d. Other Options

- **Qdrant** - Open-source, high-performance
- **Milvus** - Open-source, scalable
- **Chroma** - Lightweight, Python-focused
- **Supabase Vector** - Built on pgvector, managed PostgreSQL

**Migration Path**:

1. **Start with Option 1 or 2** (for learning)
2. **Move to Vector Database** when:
   - Knowledge base grows (>1000 chunks)
   - Need better performance
   - Need production scalability
   - Adding dynamic content frequently

**Note**: Vector databases are beyond the scope of this learning course, but are the recommended approach for production RAG systems.

## Deployment Checklist

Before deploying, verify:

### Environment Variables ✅
- [ ] `VERCEL_OIDC_TOKEN` - Automatically set by Vercel
- [ ] AI provider keys configured in Vercel Dashboard
- [ ] `BLOB_STORE_NAME` (if using Option 2)

### Code Changes ✅
- [ ] Updated `lib/vector-store.ts` for production
- [ ] Removed file system writes from API routes
- [ ] Pre-generated embeddings committed (if using Option 1)
- [ ] All build errors resolved

### Testing ✅
- [ ] Local build succeeds (`pnpm build`)
- [ ] Preview deployment works
- [ ] RAG knowledge base loads correctly
- [ ] Tool calling works
- [ ] No file system errors in logs

## Step-by-Step: Deploy with Pre-generated Embeddings

### 1. Generate Embeddings Locally

```bash
# Run the demo script to generate embeddings
pnpm rag:demo

# Verify embeddings.json was created
ls -la app/(2-rag-manufacturing)/knowledge-base/embeddings.json
```

### 2. Commit Embeddings

```bash
# Add embeddings to git
git add app/(2-rag-manufacturing)/knowledge-base/embeddings.json

# Commit
git commit -m "Add pre-generated embeddings for production"
```

### 3. Update Vector Store (Optional)

If you want to support both local dev and production, update `lib/vector-store.ts` as shown in Option 1 above.

### 4. Deploy

```bash
# Deploy to Vercel
vercel --prod
```

### 5. Verify

1. Open your production URL
2. Navigate to `/rag`
3. Ask a question like "What are the properties of SS304 steel?"
4. Verify the RAG system works

## Troubleshooting

### Error: "Cannot find module" or "File not found"

**Cause**: File system access in serverless function

**Solution**: 
- Use Option 1 (pre-generate and bundle) or Option 2 (Blob Storage)
- Don't use `fs.readFileSync()` in API routes

### Error: "EACCES: permission denied"

**Cause**: Trying to write to file system in production

**Solution**:
- Remove all `fs.writeFileSync()` calls from API routes
- Use Blob Storage or database for writes

### Error: Embeddings not loading

**Cause**: Embeddings file not bundled or blob not configured

**Solution**:
- Verify `embeddings.json` is committed to git
- Check blob storage configuration (if using Option 2)
- Check Vercel build logs for errors

### Error: "addResource tool not working"

**Cause**: Can't write to file system in production

**Solution**:
- Use Option 2 (Blob Storage) to enable dynamic writes
- Or disable `addResource` tool in production (read-only mode)

## Production Considerations

### Performance

- **Embeddings size**: Large embeddings files increase bundle size
- **Cold starts**: First request may be slower (loads embeddings)
- **Caching**: Consider caching embeddings in memory for faster access

### Security

- **API keys**: Never commit API keys to git
- **Blob access**: Configure blob storage access controls
- **Rate limiting**: Consider adding rate limits to API routes

### Monitoring

- **Vercel Analytics**: Monitor function execution times
- **Error tracking**: Set up error monitoring (Sentry, etc.)
- **Logs**: Check Vercel function logs for issues

## Next Steps

After deployment:

1. **Test thoroughly** - Verify all features work in production
2. **Monitor performance** - Check function execution times
3. **Set up alerts** - Get notified of errors
4. **Optimize** - Consider caching, CDN, etc.

## Summary

In this guide, you learned:

- ✅ **Vercel deployment** is straightforward with `vercel --prod`
- ✅ **File system limitations** - Serverless functions can't write to disk
- ✅ **Learning solutions** - Pre-generate embeddings or use Blob Storage
- ✅ **Production solution** - Use a vector database for scalable RAG systems
- ✅ **Production considerations** - Performance, security, monitoring

**Key Takeaways**:

1. **For Learning**: Use Option 1 (pre-generate and bundle) - simple and sufficient
2. **For Small Production**: Option 2 (Blob Storage) works but has limitations
3. **For Production**: **Use a vector database** (Pinecone, pgvector, Weaviate, etc.) - optimized for vector similarity search, scalable, and production-ready

**Migration Path**: Start with simple solutions for learning, then migrate to a vector database when moving to production or when your knowledge base grows.

---

**Previous**: [Lesson 3, Part 4: Multi-Step Execution](./03-conversational-ai-part4-multi-step.md)  
**Next**: [Back to Guide Index](./README.md)

