import type {
  AgentAction,
  GovernanceResult,
} from "./types";
import { createId } from "./crypto";
import { assertSystemActive } from "./killSwitch";
import { assessRisk } from "./riskEngine";
import { evaluatePolicy } from "./policyEngine";
import { verifyAgent } from "./identity";
import { createApproval } from "./approvalGate";
import { writeAudit } from "./auditLedger";

export function createAction(
  input: Omit<AgentAction, "id" | "requestedAt">
): AgentAction {
  return {
    id: createId(),
    requestedAt: new Date().toISOString(),
    ...input,
  };
}

export async function governAction(
  action: AgentAction
): Promise<GovernanceResult> {
  // 1. Check Emergency Kill Switch
  assertSystemActive();

  // 2. Assess Risk Score & Level
  const risk = assessRisk(action);

  // 3. Verify Agent Identity & Risk Authority Ceiling
  const identity = verifyAgent(
    action.agentId,
    action.capability,
    risk.level
  );

  if (!identity.allowed) {
    writeAudit({
      agentId: action.agentId,
      actionId: action.id,
      capability: action.capability,
      target: action.target,
      riskScore: risk.score,
      decision: "BLOCK",
      result: "BLOCKED",
      message: identity.reason,
    });

    return {
      action,
      risk,
      decision: "BLOCK",
      reason: identity.reason,
    };
  }

  // 4. Policy Engine Evaluation
  const policy = evaluatePolicy(action, risk);

  if (policy.decision === "BLOCK") {
    writeAudit({
      agentId: action.agentId,
      actionId: action.id,
      capability: action.capability,
      target: action.target,
      riskScore: risk.score,
      decision: "BLOCK",
      result: "BLOCKED",
      message: policy.reason,
    });

    return {
      action,
      risk,
      decision: "BLOCK",
      reason: policy.reason,
    };
  }

  if (policy.decision === "REQUIRE_APPROVAL") {
    const approval = createApproval(action);

    writeAudit({
      agentId: action.agentId,
      actionId: action.id,
      capability: action.capability,
      target: action.target,
      riskScore: risk.score,
      decision: "REQUIRE_APPROVAL",
      result: "PENDING",
      message: `${policy.reason} (Approval Request ID: ${approval.id})`,
    });

    return {
      action,
      risk,
      decision: "REQUIRE_APPROVAL",
      approvalId: approval.id,
      reason: policy.reason,
    };
  }

  // 5. Passed all gates - ALLOW
  writeAudit({
    agentId: action.agentId,
    actionId: action.id,
    capability: action.capability,
    target: action.target,
    riskScore: risk.score,
    decision: "ALLOW",
    result: "SUCCESS",
    message: policy.reason,
  });

  return {
    action,
    risk,
    decision: "ALLOW",
    reason: policy.reason,
  };
}
