import axios from "axios";
import { cacheKey, getCached, setCached } from "./warmCache.js";
import { scoreInference, hardenRequest } from "./riskHardening.js";
import { recordUsage } from "./usageMeter.js";
import { recordHeartbeat } from "./heartbeat.js";
import type { InferenceRequest, InferenceResult } from "./types.js";

const OLLAMA_CANDIDATES = [
  process.env.OLLAMA_URL,
  "http://host.docker.internal:11434",
  "http://127.0.0.1:11434",
  "http://localhost:11434",
].filter(Boolean) as string[];
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

function ollamaEndpoints(preferred?: string): string[] {
  return Array.from(new Set([preferred, ...OLLAMA_CANDIDATES].filter(Boolean) as string[]));
}

export async function runProtectedInference(
  request: InferenceRequest
): Promise<InferenceResult> {
  const started = performance.now();

  const risk = scoreInference(request.prompt);
  recordHeartbeat(risk.score);

  if (risk.action === "BLOCK") {
    throw new Error(
      `Magen-Raki blocked this inference due to critical risk (${risk.score}/100): ${risk.reasons.join(", ")}`
    );
  }

  const modelName = request.model || DEFAULT_MODEL;
  const preferredEndpoint = request.metadata?.ollamaUrl as string | undefined;
  const key = cacheKey(modelName, request.prompt);

  const cached = getCached<InferenceResult>(key);
  if (cached) {
    return {
      ...cached,
      cached: true,
    };
  }

  let prompt = request.prompt;
  if (risk.action === "HARDEN") {
    const hardened = hardenRequest(request.prompt);
    prompt = `[STRICT ISOLATION MODE - TOOLS READ-ONLY]\n${hardened.prompt}`;
  }

  let output = "";
  const failures: string[] = [];
  for (const endpoint of ollamaEndpoints(preferredEndpoint)) {
    try {
      const response = await axios.post(
        `${endpoint}/api/generate`,
        {
          model: modelName,
          prompt,
          stream: false,
        },
        {
          timeout: 120000,
        }
      );
      output = String(response.data?.response || "").trim();
      if (output) break;
      failures.push(`${endpoint}: empty response`);
    } catch (error: any) {
      failures.push(`${endpoint}: ${error?.code || error?.message || "unreachable"}`);
    }
  }

  if (!output) {
    throw new Error(`Local Ollama is unavailable for Magen-Raki inference. Tried ${failures.join("; ")}`);
  }

  const latencyMs = Math.round(performance.now() - started);

  const result: InferenceResult = {
    model: modelName,
    response: output,
    latencyMs,
    cached: false,
    risk,
  };

  setCached(key, result);

  recordUsage(
    request.tenantId || "default",
    modelName,
    request.prompt,
    output
  );

  return result;
}
