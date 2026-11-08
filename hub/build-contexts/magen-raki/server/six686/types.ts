export type AgentId =
  | "neural-core"
  | "sapphire"
  | "openclaw"
  | string;

export type ActionType =
  | "read"
  | "write"
  | "execute"
  | "delete"
  | "network"
  | "git"
  | "deploy"
  | "system"
  | "computer";

export type Decision =
  | "ALLOW"
  | "REQUIRE_APPROVAL"
  | "BLOCK";

export type RiskLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export interface AgentAction {
  id: string;
  agentId: AgentId;
  type: ActionType;
  capability: string;
  target?: string;
  description: string;
  metadata?: Record<string, unknown>;
  requestedAt: string;
}

export interface AgentIdentity {
  agentId: AgentId;
  name: string;
  enabled: boolean;
  capabilities: string[];
  maxRiskLevel: RiskLevel;
  description?: string;
}

export interface RiskAssessment {
  score: number;
  level: RiskLevel;
  reasons: string[];
}

export interface GovernanceResult {
  action: AgentAction;
  risk: RiskAssessment;
  decision: Decision;
  approvalId?: string;
  reason: string;
}

export interface ApprovalRequest {
  id: string;
  actionId: string;
  agentId: AgentId;
  action: AgentAction;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  expiresAt: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  previousHash: string;
  hash: string;

  agentId: AgentId;
  actionId: string;
  capability: string;
  target?: string;

  riskScore: number;
  decision: Decision;

  result:
    | "SUCCESS"
    | "FAILED"
    | "BLOCKED"
    | "PENDING"
    | "APPROVED"
    | "REJECTED";

  message: string;
}
