export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface RiskResult {
  score: number;
  level: RiskLevel;
  reasons: string[];
  contained: boolean;
  action: "ALLOW" | "HARDEN" | "BLOCK";
}

export interface InferenceRequest {
  model: string;
  prompt: string;
  tenantId?: string;
  metadata?: Record<string, unknown>;
}

export interface InferenceResult {
  model: string;
  response: string;
  latencyMs: number;
  cached: boolean;
  risk: RiskResult;
}

export interface UsageRecord {
  id: string;
  tenantId: string;
  model: string;
  inputCharacters: number;
  outputCharacters: number;
  estimatedCost: number;
  timestamp: number;
}

export interface ComplianceBundle {
  id: string;
  framework: "SOC2" | "ISO27001" | "HIPAA" | "PCI_DSS" | "EU_AI_ACT" | "FEDRAMP" | "NIST";
  generatedAt: number;
  riskEvents: unknown[];
  policyEvents: unknown[];
  auditEvents: unknown[];
  integrityHash: string;
}
