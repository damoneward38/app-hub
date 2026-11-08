import type {
  AgentAction,
  RiskAssessment,
  RiskLevel,
} from "./types";
import { SIX686_CONFIG } from "./config";

const CRITICAL_PATTERNS = [
  "rm -rf /",
  "rm -rf *",
  "mkfs",
  "erase disk",
  "format disk",
  "delete all",
  "wipe system",
  "drop database",
  ":(){ :|:& };:",
  "chmod -r 777 /",
  "dd if=/dev/zero",
  "> /dev/sda",
  "exfiltrate",
];

const HIGH_RISK_WORDS = [
  "delete",
  "deploy",
  "production",
  "push main",
  "push-main",
  "system",
  "terminal",
  "shell",
  "sudo",
  "override",
  "reboot",
  "kill",
  "secret",
  "private-key",
  "env-inject",
];

export function assessRisk(action: AgentAction): RiskAssessment {
  let score = 0.1;
  const reasons: string[] = [];

  const content = [
    action.capability,
    action.target ?? "",
    action.description,
    action.metadata ? JSON.stringify(action.metadata) : "",
  ]
    .join(" ")
    .toLowerCase();

  // Action type base risk weighting
  if (action.type === "read") {
    score += 0.05;
    reasons.push("Read operation: low blast-radius.");
  } else if (action.type === "write") {
    score += 0.2;
    reasons.push("Write operation: modifies file/state content.");
  } else if (action.type === "execute") {
    score += 0.3;
    reasons.push("Execution operation: runs runtime logic or subprocesses.");
  } else if (action.type === "network") {
    score += 0.25;
    reasons.push("Network operation: communicates outside local system boundaries.");
  } else if (action.type === "git") {
    score += 0.2;
    reasons.push("Git operation: modifies version control tracking.");
  } else if (action.type === "deploy") {
    score += 0.45;
    reasons.push("Deployment operation: affects live deployment targets.");
  } else if (action.type === "delete" || action.type === "system" || action.type === "computer") {
    score += 0.5;
    reasons.push("Destructive, host system, or computer-level operation.");
  }

  // Critical pattern detection (Immediate escalation to CRITICAL)
  for (const pattern of CRITICAL_PATTERNS) {
    if (content.includes(pattern)) {
      score = 0.98;
      reasons.push(`CRITICAL ALERT: Detected hazardous signature match '${pattern}'.`);
      break;
    }
  }

  // High risk keyword evaluation
  for (const word of HIGH_RISK_WORDS) {
    if (content.includes(word)) {
      score += 0.15;
      reasons.push(`High-impact vocabulary trigger: '${word}'.`);
    }
  }

  // Target sensitivity checks
  if (action.target) {
    const targetLower = action.target.toLowerCase();
    if (
      targetLower.includes("/etc") ||
      targetLower.includes("/root") ||
      targetLower.includes("/sys") ||
      targetLower.includes(".env") ||
      targetLower.includes("id_rsa")
    ) {
      score += 0.35;
      reasons.push(`Target touches sensitive path or credentials: '${action.target}'.`);
    }
  }

  // Clamp score between 0.05 and 1.0
  const normalizedScore = Math.min(1.0, Math.max(0.05, parseFloat(score.toFixed(2))));

  let level: RiskLevel = "LOW";
  if (normalizedScore >= SIX686_CONFIG.risk.critical) {
    level = "CRITICAL";
  } else if (normalizedScore >= SIX686_CONFIG.risk.high) {
    level = "HIGH";
  } else if (normalizedScore >= SIX686_CONFIG.risk.medium) {
    level = "MEDIUM";
  }

  return {
    score: normalizedScore,
    level,
    reasons: reasons.length > 0 ? reasons : ["Action parameters are within standard baseline boundaries."],
  };
}
