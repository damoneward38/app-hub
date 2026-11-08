import type {
  AgentAction,
  Decision,
  RiskAssessment,
} from "./types";

const FORBIDDEN_CAPABILITIES = [
  "self-modify-governor",
  "disable-governor",
  "disable-audit",
  "delete-audit",
  "disable-kill-switch",
  "modify-policy-without-owner",
  "bypass-six686",
  "forge-attestation",
];

export function evaluatePolicy(
  action: AgentAction,
  risk: RiskAssessment
): {
  decision: Decision;
  reason: string;
} {
  const capability = action.capability.toLowerCase();

  if (
    FORBIDDEN_CAPABILITIES.some((item) =>
      capability.includes(item)
    )
  ) {
    return {
      decision: "BLOCK",
      reason: "Action attempts to modify, forge, or disable the Six 686 security layer.",
    };
  }

  if (risk.level === "CRITICAL") {
    return {
      decision: "BLOCK",
      reason: "Critical-risk action blocked by Six 686 policy engine.",
    };
  }

  if (
    risk.level === "HIGH" ||
    action.type === "delete" ||
    action.type === "deploy"
  ) {
    return {
      decision: "REQUIRE_APPROVAL",
      reason: "High-impact action requires human owner cryptographic approval before dispatch.",
    };
  }

  return {
    decision: "ALLOW",
    reason: "Action passed Six 686 policy evaluation.",
  };
}
