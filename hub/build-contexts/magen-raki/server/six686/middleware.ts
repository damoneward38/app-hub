import type { AgentAction, GovernanceResult } from "./types";
import { governAction } from "./governor";

export interface Six686GuardResult<T> {
  success?: boolean;
  pendingApproval?: boolean;
  approvalId?: string;
  reason?: string;
  governance?: GovernanceResult;
  result?: T;
}

export async function six686Guard<T>(
  action: AgentAction,
  executor: () => Promise<T>
): Promise<Six686GuardResult<T>> {
  const result = await governAction(action);

  if (result.decision === "BLOCK") {
    throw new Error(`SIX 686 BLOCKED: ${result.reason}`);
  }

  if (result.decision === "REQUIRE_APPROVAL") {
    return {
      pendingApproval: true,
      approvalId: result.approvalId,
      reason: result.reason,
      governance: result,
    };
  }

  const execution = await executor();

  return {
    success: true,
    governance: result,
    result: execution,
  };
}
