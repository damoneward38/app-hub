import type { ChatResult, OllamaMessage } from './types.js';

const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 120_000);
const CANDIDATES = (process.env.OLLAMA_URLS || process.env.OLLAMA_URL ||
  'http://host.docker.internal:11434,http://127.0.0.1:11434')
  .split(',')
  .map((value) => value.trim().replace(/\/$/, ''))
  .filter(Boolean);

let activeUrl: string | null = null;

async function request(url: string, pathname: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(`${url}${pathname}`, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function ollamaHealth(): Promise<{ ok: boolean; url: string | null; models: string[]; error?: string }> {
  for (const url of CANDIDATES) {
    try {
      const response = await request(url, '/api/tags', { method: 'GET' });
      if (!response.ok) continue;
      const body = (await response.json()) as { models?: Array<{ name?: string }> };
      activeUrl = url;
      return { ok: true, url, models: (body.models || []).map((m) => m.name || '').filter(Boolean) };
    } catch {
      continue;
    }
  }
  return { ok: false, url: activeUrl, models: [], error: 'No Ollama endpoint reachable' };
}

export async function chat(messages: OllamaMessage[], model = DEFAULT_MODEL): Promise<ChatResult> {
  if (!messages.length) throw new Error('messages[] is required');
  const candidates = activeUrl ? [activeUrl, ...CANDIDATES.filter((u) => u !== activeUrl)] : CANDIDATES;
  let lastError = 'No Ollama endpoint reachable';
  for (const url of candidates) {
    const started = Date.now();
    try {
      const response = await request(url, '/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ model, messages, stream: false })
      });
      if (!response.ok) {
        lastError = `Ollama ${response.status}: ${(await response.text()).slice(0, 300)}`;
        continue;
      }
      const body = (await response.json()) as {
        message?: { content?: string };
        prompt_eval_count?: number;
        eval_count?: number;
      };
      activeUrl = url;
      return {
        text: body.message?.content || '',
        model,
        latencyMs: Date.now() - started,
        promptTokens: body.prompt_eval_count,
        completionTokens: body.eval_count
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }
  throw new Error(lastError);
}
