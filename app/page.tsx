import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          AI SDK for Manufacturing
        </h1>

        <p className="text-lg text-gray-600 mb-12">
          Learn how to build AI-powered manufacturing applications with the
          Vercel AI SDK. Navigate to the lessons below to get started.
        </p>

        <div className="grid gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              Manufacturing Lessons
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              AI implementations for steel manufacturing plant operations
            </p>
            <div className="grid gap-4">
              <Link
                href="/manufacturing/operator-assistant"
                className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-gray-400 transition-colors shadow-sm hover:shadow-md"
              >
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  Lesson 1: Invisible AI - Raw Material Forecasting
                </h3>
                <p className="text-gray-600">
                  Learn how to automate order extraction, material calculation,
                  and forecasting using invisible AI.
                </p>
              </Link>

              <Link
                href="/rag"
                className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-gray-400 transition-colors shadow-sm hover:shadow-md"
              >
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  Lesson 2: RAG - Manufacturing Knowledge Base
                </h3>
                <p className="text-gray-600">
                  Build a knowledge base system with semantic search using
                  chunking, embeddings, and cosine similarity.
                </p>
              </Link>

              <Link
                href="/manufacturing/operator-assistant"
                className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-gray-400 transition-colors shadow-sm hover:shadow-md"
              >
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  Lesson 3: Conversational AI - Operator Assistant
                </h3>
                <p className="text-gray-600">
                  Create an interactive chatbot with tool calling for querying
                  production status and work orders.
                </p>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Follow the complete guides in the{" "}
            <Link
              href="/guide"
              className="text-blue-600 hover:underline"
            >
              /guide
            </Link>{" "}
            directory for detailed step-by-step instructions.
          </p>
        </div>
      </main>
    </div>
  );
}
