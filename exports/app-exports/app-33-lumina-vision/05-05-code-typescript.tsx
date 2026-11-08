import { NeuralEngineError, RateLimitError } from "../types";
import { logger } from "./logger";

// ─── Retry Configuration ───────────────────────────────────────────────────────
interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;    // Initial delay (exponential backoff base)
  maxDelayMs: number;     // Cap on maximum delay
  jitter: boolean;        // Add randomness to prevent thundering herd
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  jitter: true,
};

/**
 * Calculates exponential backoff delay with optional jitter.
 * Formula: min(base * 2^attempt, maxDelay) + jitter
 */
const calculateDelay = (attempt: number, options: RetryOptions): number => {
  const exponentialDelay = Math.min(
    options.baseDelayMs * Math.pow(2, attempt),
    options.maxDelayMs
  );

  // Add ±20% jitter to prevent thundering herd
  const jitterFactor = options.jitter ? 0.8 + Math.random() * 0.4 : 1;
  return Math.floor(exponentialDelay * jitterFactor);
};

/**
 * Determines if an error is retryable based on its type and HTTP status.
 */
const isRetryable = (error: unknown): boolean => {
  if (error instanceof NeuralEngineError) return error.retryable;
  if (error instanceof Error) {
    // Retry on network errors and 5xx responses
    return (
      error.message.includes("ECONNRESET") ||
      error.message.includes("ETIMEDOUT") ||
      error.message.includes("ENOTFOUND") ||
      error.message.includes("socket hang up")
    );
  }
  return false;
};

/**
 * Executes an async function with exponential backoff retry logic.
 * Automatically retries on retryable errors (rate limits, network issues).
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> => {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      // First attempt is not a retry
      if (attempt > 0) {
        const delay = calculateDelay(attempt - 1, config);
        logger.warn(`Retry attempt ${attempt}/${config.maxRetries} after ${delay}ms`, {
          attempt,
          delay,
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      return await fn();
    } catch (error) {
      lastError = error;

      // Special handling for rate limit errors (use server's retry-after)
      if (error instanceof RateLimitError && error.retryAfter) {
        logger.warn(`Rate limited. Waiting ${error.retryAfter}s before retry...`);
        await new Promise((resolve) =>
          setTimeout(resolve, error.retryAfter! * 1000)
        );
        continue;
      }

      // Don't retry non-retryable errors
      if (!isRetryable(error)) {
        logger.error("Non-retryable error encountered, aborting", { error });
        throw error;
      }

      // Don't sleep after the last attempt
      if (attempt === config.maxRetries) break;

      logger.warn(`Attempt ${attempt + 1} failed, will retry`, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // All retries exhausted
  logger.error(`All ${config.maxRetries} retry attempts failed`);
  throw lastError;
};