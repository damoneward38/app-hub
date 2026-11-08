import type { RiskLevel, RiskResult } from "./types.js";

function levelForScore(score: number): RiskLevel {
  if (score >= 90) return "CRITICAL";
  if (score >= 70) return "HIGH";
  if (score >= 30) return "MEDIUM";
  return "LOW";
}

export function scoreInference(
  prompt: string,
  response?: string
): RiskResult {
  let score = 0;
  const reasons: string[] = [];

  const combined = `${prompt} ${response || ""}`;

  if (combined.length > 100_000) {
    score += 25;
    reasons.push("Unusually large inference payload");
  }

  if (
    /(ignore previous instructions|system prompt|reveal secret|jailbreak|bypass security|DAN mode)/i.test(
      combined
    )
  ) {
    score += 40;
    reasons.push("Prompt manipulation pattern detected");
  }

  if (
    /(private key|api[_ -]?key|password|secret|AKIA[0-9A-Z]{16}|ghp_[0-9a-zA-Z]{36}|AIza[0-9A-Za-z-_]{20,})/i.test(
      combined
    )
  ) {
    score += 35;
    reasons.push("Sensitive-data pattern detected");
  }

  if (
    /(rm\s+-rf|drop\s+table|mkfs|format\s+[a-z]:|shutdown\s+-h)/i.test(
      combined
    )
  ) {
    score += 50;
    reasons.push("Destructive system command execution pattern");
  }

  score = Math.min(score, 100);
  const level = levelForScore(score);

  if (score >= 90) {
    return {
      score,
      level,
      reasons,
      contained: true,
      action: "BLOCK",
    };
  }

  if (score >= 70) {
    return {
      score,
      level,
      reasons,
      contained: true,
      action: "HARDEN",
    };
  }

  return {
    score,
    level,
    reasons,
    contained: false,
    action: "ALLOW",
  };
}

export function hardenRequest(prompt: string) {
  return {
    prompt,
    isolation: "STRICT",
    toolAccess: "READ_ONLY",
    networkAccess: "DISABLED",
    sensitiveDataRedaction: true,
    maxOutputCharacters: 4000,
  };
}
