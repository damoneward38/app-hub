import type {
  ApprovalRequest,
  AgentAction,
} from "./types";
import { createId } from "./crypto";
import { SIX686_CONFIG } from "./config";

const approvals = new Map<string, ApprovalRequest>();

export function createApproval(action: AgentAction): ApprovalRequest {
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + SIX686_CONFIG.approval.expirationMinutes * 60 * 1000
  );

  const approval: ApprovalRequest = {
    id: createId(),
    actionId: action.id,
    agentId: action.agentId,
    action,
    status: "PENDING",
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  approvals.set(approval.id, approval);
  return approval;
}

export function getApproval(approvalId: string): ApprovalRequest | undefined {
  const approval = approvals.get(approvalId);
  if (!approval) {
    return undefined;
  }

  if (
    approval.status === "PENDING" &&
    new Date() > new Date(approval.expiresAt)
  ) {
    approval.status = "EXPIRED";
  }

  return approval;
}

export function approveRequest(
  approvalId: string,
  ownerId = "owner"
): ApprovalRequest {
  const approval = getApproval(approvalId);
  if (!approval) {
    throw new Error(`Approval request '${approvalId}' not found.`);
  }

  if (approval.status !== "PENDING") {
    throw new Error(`Approval request '${approvalId}' is not pending (status: ${approval.status}).`);
  }

  approval.status = "APPROVED";
  approval.resolvedAt = new Date().toISOString();
  approval.resolvedBy = ownerId;

  return approval;
}

export function rejectRequest(
  approvalId: string,
  ownerId = "owner"
): ApprovalRequest {
  const approval = getApproval(approvalId);
  if (!approval) {
    throw new Error(`Approval request '${approvalId}' not found.`);
  }

  if (approval.status !== "PENDING") {
    throw new Error(`Approval request '${approvalId}' is not pending (status: ${approval.status}).`);
  }

  approval.status = "REJECTED";
  approval.resolvedAt = new Date().toISOString();
  approval.resolvedBy = ownerId;

  return approval;
}

export function listPendingApprovals(): ApprovalRequest[] {
  const list: ApprovalRequest[] = [];
  for (const approval of approvals.values()) {
    if (getApproval(approval.id)?.status === "PENDING") {
      list.push(approval);
    }
  }
  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function listAllApprovals(): ApprovalRequest[] {
  const list: ApprovalRequest[] = [];
  for (const approval of approvals.values()) {
    getApproval(approval.id); // check expiry
    list.push(approval);
  }
  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
