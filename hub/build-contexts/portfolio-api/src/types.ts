export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';

export interface JobEvent {
  at: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: JsonValue;
}

export interface Job<Input = JsonValue, Result = JsonValue> {
  id: string;
  appId: string;
  type: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  finishedAt?: string;
  input: Input;
  result?: Result;
  error?: string;
  events: JobEvent[];
}

export interface JobContext {
  job: Job;
  log: (message: string, data?: JsonValue) => Promise<void>;
  warn: (message: string, data?: JsonValue) => Promise<void>;
  isCancelled: () => boolean;
}

export type JobHandler = (
  input: JsonValue,
  context: JobContext
) => Promise<JsonValue>;

export interface StoredRecord {
  id: string;
  appId: string;
  collection: string;
  createdAt: string;
  updatedAt: string;
  data: JsonValue;
}

export interface AppState {
  appId: string;
  updatedAt: string;
  data: JsonValue;
}

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResult {
  text: string;
  model: string;
  latencyMs: number;
  promptTokens?: number;
  completionTokens?: number;
}

export interface Capability {
  type: string;
  description: string;
  input: Record<string, string>;
  deterministic: boolean;
}
