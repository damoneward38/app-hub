import "dotenv/config";
import { NeuralEngine } from "./engine/NeuralEngine";
import { NeuralEngineError } from "./types";
import { logger } from "./utils/logger";

// ─── Demo: Multi-turn Conversation ────────────────────────────────────────────
const runConversationDemo = async () => {
  const engine = new NeuralEngine({
    model:        "gpt-4o",
    temperature:  0.7,
    maxTokens:    1024,
    systemPrompt: "You are a senior software architect. Be concise and precise.",
    stream:       false,
  });

  try {
    console.log("\n🧠 Neural Engine · GPT-4o Demo\n" + "─".repeat(40));

    // Turn 1: Initial question
    console.log("\n👤 User: What are the SOLID principles?");
    const response1 = await engine.chat("What are the SOLID principles?");
    console.log(`\n🤖 Assistant: ${response1.content}`);
    console.log(`📊 Tokens: ${response1.usage.totalTokens} | Latency: ${response1.latencyMs}ms`);

    // Turn 2: Follow-up (tests conversation memory)
    console.log("\n👤 User: Can you give me a TypeScript example of the first one?");
    const response2 = await engine.chat(
      "Can you give me a TypeScript example of the first one?"
    );
    console.log(`\n🤖 Assistant: ${response2.content}`);
    console.log(`📊 Tokens: ${response2.usage.totalTokens} | Latency: ${response2.latencyMs}ms`);

    // Token usage report
    const usage = engine.getTokenUsage();
    console.log(`\n📈 Token Budget: ${usage.used}/${usage.limit} used (${usage.remaining} remaining)`);

  } finally {
    // Always release resources
    engine.dispose();
  }
};

// ─── Demo: Streaming Response ─────────────────────────────────────────────────
const runStreamingDemo = async () => {
  const engine = new NeuralEngine({
    model:       "gpt-4o",
    temperature: 0.8,
    maxTokens:   512,
    stream:      true,
  });

  try {
    console.log("\n🌊 Streaming Demo\n" + "─".repeat(40));
    console.log("\n👤 Prompt: Write a haiku about neural networks.\n");
    process.stdout.write("🤖 Assistant: ");

    await engine.chat("Write a haiku about neural networks.", {
      onToken:    (token)        => process.stdout.write(token),
      onComplete: (fullContent)  => console.log(`\n\n✅ Complete (${fullContent.length} chars)`),
      onError:    (err)          => console.error(`\n❌ Stream error: ${err.message}`),
    });

  } finally {
    engine.dispose();
  }
};

// ─── Demo: One-shot Completion ────────────────────────────────────────────────
const runCompletionDemo = async () => {
  const engine = new NeuralEngine({ model: "gpt-4o", maxTokens: 256 });

  try {
    console.log("\n⚡ One-shot Completion Demo\n" + "─".repeat(40));
    const response = await engine.complete(
      "List 3 design patterns in JSON format with name and use-case fields.",
      "You are a JSON API. Respond only with valid JSON, no markdown."
    );

    console.log("\n📦 Response:");
    console.log(JSON.parse(response.content)); // Verify it's valid JSON
  } finally {
    engine.dispose();
  }
};

// ─── Entry Point ──────────────────────────────────────────────────────────────
(async () => {
  try {
    await runConversationDemo();
    await runStreamingDemo();
    await runCompletionDemo();
  } catch (error) {
    if (error instanceof NeuralEngineError) {
      logger.error(`NeuralEngineError [${error.code}]: ${error.message}`, {
        code:        error.code,
        statusCode:  error.statusCode,
        retryable:   error.retryable,
      });
    } else {
      logger.error("Unexpected error", { error });
    }
    process.exit(1);
  }
})();