export type PageTab =
  | 'landing'
  | 'help'
  | 'readiness'
  | 'pipeline'
  | 'governor'
  | 'threats'
  | 'compliance'
  | 'marketplace'
  | 'telemetry'
  | 'overview'
  | 'features'
  | 'demo'
  | 'pricing'
  | 'contact';

export type AgentId = 'neural-core' | 'sapphire' | 'openclaw' | string;

export type ActionType =
  | 'read'
  | 'write'
  | 'execute'
  | 'delete'
  | 'network'
  | 'git'
  | 'deploy'
  | 'system'
  | 'computer';

export type Decision = 'ALLOW' | 'REQUIRE_APPROVAL' | 'BLOCK';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ReadinessGateCheck {
  id: string;
  name: string;
  category: 'build' | 'environment' | 'testing' | 'security' | 'runtime';
  command?: string;
  status: 'PASSED' | 'FAILED' | 'RUNNING' | 'PENDING';
  message: string;
  durationMs: number;
  details?: string;
}

export interface ReadinessGateReport {
  timestamp: string;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  allPassed: boolean;
  status: 'READY FOR REVIEW' | 'FAILED_REQUIREMENTS' | 'EVALUATING';
  certificationHash: string;
  checks: ReadinessGateCheck[];
}

export interface PipelineStageState {
  id: string;
  title: string;
  subtitle: string;
  status: 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED' | 'SKIPPED' | 'BLOCKED';
  durationMs?: number;
  output?: string;
  details?: Record<string, unknown>;
}

export interface PipelineExecution {
  id: string;
  changeName: string;
  author: string;
  commitHash: string;
  startedAt: string;
  finishedAt?: string;
  status: 'RUNNING' | 'RELEASED' | 'BLOCKED_BY_GOVERNOR' | 'ROLLED_BACK' | 'FAILED';
  decision: Decision;
  stages: PipelineStageState[];
  auditBlockIndex?: number;
  auditHash?: string;
  stagingUrl?: string;
  healthMetrics?: {
    uptime: string;
    httpStatus: number;
    latencyMs: number;
    errorRate: string;
  };
}

export interface RepairStepState {
  stepNumber: number;
  name: 'Diagnose' | 'Plan' | 'Patch' | 'Test' | 'Build' | 'Launch in staging' | 'Verify' | 'Report';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  outputSummary: string;
  timestamp?: string;
}

export interface RepairWorkflowResult {
  id: string;
  repository: string;
  targetIssue: string;
  startedAt: string;
  completedAt?: string;
  finalStatus: 'STATUS: VERIFIED' | 'FAILED' | 'RUNNING';
  steps: RepairStepState[];
  readinessGatePassed: boolean;
  verifiedBadgeHash: string;
}

export interface OneClickAuditBundle {
  bundleId: string;
  generatedAt: string;
  generator: string;
  system: {
    name: string;
    version: string;
    siliconRevision: string;
    secureBootIntegrity: string;
    killSwitchStatus: string;
  };
  readinessGate: ReadinessGateReport;
  governanceDecisions: GovernanceResult[];
  approvalRecords: ApprovalRequest[];
  auditLedger: AuditEntry[];
  chainIntegrity: {
    valid: boolean;
    totalBlocks: number;
    genesisHash: string;
    latestHash: string;
  };
  signature: string;
}

export interface RoadmapPhase {
  phase: string;
  days: string;
  goal: string;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
  deliverables: string[];
  metrics: string;
}

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
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
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
  result: 'SUCCESS' | 'FAILED' | 'BLOCKED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  message: string;
}

export interface GovernorStatusState {
  status: string;
  secureBoot: {
    verified: boolean;
    status: string;
    startedAt?: string;
    integrityHash?: string;
    romSignature?: string;
    hardwareEnclaveState?: string;
  };
  killSwitch: {
    active: boolean;
    activatedAt: string | null;
    activatedBy: string | null;
    activationReason: string | null;
  };
  agentsCount: number;
  pendingApprovalsCount: number;
  auditBlocksCount: number;
  auditChainIntegrity: boolean;
  systemClock: string;
}

export interface SecurityFeature {
  id: string;
  title: string;
  oneLiner: string;
  neroCoreSpec: string;
  chipSecret: string;
  category: 'Hardware HSM' | 'Inference Defense' | 'Governance & Audit';
  iconName: string;
  latencyImpact: string;
  mitigationRate: string;
}

export interface TelemetryState {
  engineVersion: string;
  hsmChip: string;
  status: string;
  dieTempCelsius: number;
  enclaveRamUsagePercent: number;
  inferencesScoredPerSec: number;
  threatsNeutralizedTotal: number;
  lastAttestationHash: string;
  zeroTrustIsolationActive: boolean;
  tamperProofLedgerBlock: number;
}

export interface InferenceAnalysisResult {
  success: boolean;
  engine: string;
  chip: string;
  promptHash: string;
  nonce: string;
  targetModel: string;
  securityLevel: string;
  latencyMs: number;
  riskScore: number;
  status: 'BLOCKED_BY_SIX686_ENCLAVE' | 'SANITIZED_AND_ROUTED' | 'VERIFIED_SECURE';
  action: string;
  attackCategory: string;
  reasoning: string;
  detectedSignatures: string[];
  hardwareIsolation: {
    enclaveAddress: string;
    sideChannelDampening: string;
    memorySanitized: boolean;
    chipAttestationHash: string;
    immutableLedgerBlock: number;
  };
  timestamp: string;
}

export interface MagenUsageRecord {
  id: string;
  tenantId: string;
  model: string;
  inputCharacters: number;
  outputCharacters: number;
  estimatedCost: number;
  timestamp: number;
}

export interface TenantAggregatedUsage {
  tenantId: string;
  requestsCount: number;
  inputCharacters: number;
  outputCharacters: number;
  totalCharacters: number;
  estimatedCost: number;
  modelsUsed: string[];
  averageLatencyMs?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'SUPERADMIN' | 'SECURITY_OFFICER' | 'SECURITY_ANALYST' | 'DEVELOPER' | 'AUDITOR' | 'GUEST';
  title: string;
  tenantId: string;
  avatar?: string;
  permissions: string[];
  maxRiskAuthority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  mfaAuthenticated: boolean;
  hsmSessionActive: boolean;
  createdAt: string;
}

export interface PricingTier {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  billingPeriod: string;
  badge?: string;
  highlighted?: boolean;
  userLimit: string;
  apiKeyCount: string;
  features: string[];
  sla: string;
  ctaText: string;
}

export interface ThreatIntelligenceData {
  title: string;
  generatedAt: number;
  currentRisk: number;
  systemStatus: string;
  blockedEvents: number;
  policyEvents: number;
  totalAuditEvents: number;
  recommendation: string;
  activeVectors?: Array<{
    id: string;
    vector: string;
    category: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    mitigation: string;
    mitreRef: string;
    detectedCount: number;
    status: 'NEUTRALIZED' | 'MONITORING' | 'CONTAINED';
  }>;
}

export interface ComplianceBundleRecord {
  id: string;
  framework: 'SOC2' | 'ISO27001' | 'HIPAA' | 'PCI_DSS' | 'EU_AI_ACT' | 'FEDRAMP';
  generatedAt: number;
  integrityHash: string;
  riskEvents: any[];
  policyEvents: any[];
  auditEvents: any[];
  summary?: {
    totalControls: number;
    passedControls: number;
    auditSeals: number;
    certifier: string;
  };
}

export interface MarketplaceModelItem {
  id: string;
  name: string;
  description: string;
  version: string;
  publisher: string;
  validated: boolean;
  createdAt: number;
  category?: 'LLM' | 'AST_GUARD' | 'ORCHESTRATOR' | 'EMBEDDING' | 'AGENT';
  contextWindow?: string;
  securityScore?: number;
  quantization?: string;
  latencyAvgMs?: number;
  pricingPer1k?: number;
}

export interface HardwareTelemetryData {
  status: string;
  uptimeSeconds: number;
  currentRisk: number;
  totalInferences: number;
  activeSessions: number;
  lastHeartbeat: string;
  siliconEnclave: {
    chipId: string;
    attestationState: string;
    temperatureCelsius: number;
    dmaLatencyMicroseconds: number;
    hsmMemoryUsedMb: number;
    hsmMemoryTotalMb: number;
  };
  warmCache: {
    totalCached: number;
    hitCount: number;
    missCount: number;
    hitRatio: number;
    avgRetrievalMs: number;
  };
}

