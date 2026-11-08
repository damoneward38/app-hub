const SECRET_PATTERNS = [
  /sk-[A-Za-z0-9_-]{10,}/g,
  /ghp_[A-Za-z0-9]{10,}/g,
  /Bearer\s+[A-Za-z0-9._-]+/gi,
  /password\s*[:=]\s*\S+/gi,
  /api[_-]?key\s*[:=]\s*\S+/gi,
  /private[_-]?key\s*[:=]\s*\S+/gi,
  /AIza[0-9A-Za-z-_]{20,}/g,
  /AKIA[0-9A-Z]{16}/g,
  /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END\s+(RSA\s+)?PRIVATE\s+KEY-----/gi,
];

export function containsSecrets(value: unknown): boolean {
  if (typeof value === "string") {
    return SECRET_PATTERNS.some((pattern) => pattern.test(value));
  }
  if (value && typeof value === "object") {
    return containsSecrets(JSON.stringify(value));
  }
  return false;
}

export function sanitizeTelemetry(value: unknown): unknown {
  if (typeof value === "string") {
    let sanitized = value;
    for (const pattern of SECRET_PATTERNS) {
      sanitized = sanitized.replace(pattern, "[REDACTED_BY_SIX686_TELEMETRY_GUARD]");
    }
    return sanitized;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeTelemetry);
  }

  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      // Also scrub sensitive key names directly if needed
      if (/password|secret|apikey|token|auth/i.test(key) && typeof item === "string") {
        result[key] = "[REDACTED_BY_SIX686_TELEMETRY_GUARD]";
      } else {
        result[key] = sanitizeTelemetry(item);
      }
    }
    return result;
  }

  return value;
}
