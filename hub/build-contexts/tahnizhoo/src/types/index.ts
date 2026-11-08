export type PlanTier = 'free' | 'essential' | 'pro' | 'enterprise' | 'whitelabel' | 'standard';

export type AgentGroup = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J';

export type CoreType = 'cybersecurity' | 'business';

export type CyberRoleType = 'finder' | 'fixer';

export type OperatingStage =
  | 'UNDERSTAND'
  | 'PLAN'
  | 'FIND'
  | 'FACT'
  | 'DELEGATE'
  | 'EXECUTE'
  | 'OBSERVE'
  | 'VERIFY'
  | 'FIX'
  | 'REPAIR'
  | 'VERIFY_AGAIN'
  | 'REPORT';

export interface OllamaConfig {
  endpoint: string;
  model: string;
  status: 'connected' | 'standby' | 'fallback';
  latencyMs: number;
  availableModels: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  plan: PlanTier;
  createdAt: string;
}

export interface Agent {
  id: string;
  groupName: AgentGroup;
  category: 'security' | 'business';
  functionName: string;
  roleLabel: string;
  status: 'online' | 'busy' | 'offline' | 'error';
  lastSeen: string;
  cpuUsage: number;
  memoryUsage: number;
  latencyMs: number;
  totalJobsProcessed: number;
}

export interface SpecialistCoreIdentity {
  id: string;
  name: string;
  role: string;
  group: AgentGroup;
  type: CoreType;
  cyberRole?: CyberRoleType; // Exactly 50 finders + 50 fixers for cybersecurity
  businessDomain?: string; // For business cores (Music, Video, Publishing, E-Com, etc.)
  description: string;
  domain: string;
  primaryFunctions: string[];
  secondaryFunctions: string[];
  inputs: string[];
  outputs: string[];
  permissions: string[];
  sandboxAssignment: string;
  delegationRules: string[];
  verificationResponsibility: string;
  repairResponsibility: string;
  communicationRules: string[];
  applicableDomains: string[];
  status: 'online' | 'busy' | 'offline' | 'error';
  cpuUsage: number;
  memoryUsage: number;
  latencyMs: number;
  totalJobsProcessed: number;
}

// A-to-Z Business Ledger Item
export interface BusinessLedgerItem {
  id: string;
  code: string;
  letter: string;
  name: string;
  category: string;
  description: string;
  applicableCreatorModes: string[];
  assignedCoreGroup: AgentGroup;
  defaultAutomation: 'autonomous' | 'approval_required' | 'delegated';
  sharedToolsUsed: string[];
  securityDependency: string;
}

export interface BusinessCreatorMode {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  defaultFunctions: string[]; // Ledger item IDs
  primaryCoreGroups: AgentGroup[];
  recommendedSecurityLevel: 'basic' | 'enhanced' | 'zero-trust';
}

export interface BlueprintTask {
  id: string;
  name: string;
  group: AgentGroup;
  function: string;
  type: 'business' | 'security';
  planLocked: boolean;
  description: string;
  requiredTier: PlanTier;
}

export interface BusinessProfile {
  id: string;
  userId: string;
  name: string;
  creatorMode?: string;
  industry: string;
  plan: PlanTier;
  storageStack: string;
  paymentGateway: string;
  maturity: 'Low' | 'Medium' | 'High';
  complianceReqs: string[];
  tasks: BlueprintTask[];
  schedule: {
    scanInterval: string;
    deployOn: string;
  };
  blueprintJson: string;
  activeCoresCount?: number;
  createdAt: string;
}

export interface AgentVoteItem {
  agentId: string;
  agentName: string;
  verdict: 'PASS' | 'FAIL' | 'REVIEW';
  latencyMs: number;
  confidence: number;
  reason: string;
}

export interface SwarmVoteSummary {
  functionName: string;
  group: AgentGroup;
  totalVotes: number;
  passedVotes: number;
  majorityThreshold: number;
  agreed: boolean;
  agentVotes: AgentVoteItem[];
}

export interface JobLog {
  timestamp: string;
  level: 'info' | 'warn' | 'security' | 'success' | 'error' | 'stage';
  stage?: OperatingStage;
  message: string;
}

export interface ClosedLoopStep {
  stage: OperatingStage;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'repaired';
  coreResponsible: string;
  details: string;
  timestamp?: string;
}

export interface Job {
  id: string;
  businessId: string;
  businessName: string;
  jobType: 'deploy' | 'scan' | 'patch' | 'audit' | 'pipeline' | 'creator_flow';
  status: 'pending' | 'running' | 'success' | 'failed' | 'upgrade_needed';
  currentStage?: OperatingStage;
  closedLoopSteps?: ClosedLoopStep[];
  repairAttempts?: number;
  initiatedAt: string;
  completedAt?: string;
  resultHash?: string;
  agentsUsed: string[];
  tasksCompleted: number;
  totalTasks: number;
  logs: JobLog[];
  votes?: SwarmVoteSummary;
  blueprintJson?: string;
}

export interface AuditLogEntry {
  id: string;
  jobId: string;
  agentId: string;
  eventTs: string;
  eventType: string;
  hashPayload: string;
  previousHash: string;
  status: 'verified' | 'tampered';
  details: string;
  stageReference?: OperatingStage;
}

export interface SharedFunction {
  id: string;
  name: string;
  category: 'code' | 'network' | 'media' | 'finance' | 'security' | 'crypto';
  description: string;
  invokedCount: number;
  avgLatencyMs: number;
  parameters: string[];
}

export interface SelaDiagnosticCheck {
  id: string;
  target: string;
  type: 'website' | 'ast_code' | 'file' | 'system' | 'business';
  status: 'healthy' | 'warning' | 'critical' | 'investigating';
  findings: string[];
  recommendedFix?: string;
  verifiedByCore: string;
  lastRun: string;
}

export interface EzhkarSandboxConfig {
  id: string;
  name: string;
  coreAssignment: string;
  isolationLevel: 'strict' | 'airgap' | 'monitored';
  networkAccess: 'none' | 'whitelisted' | 'full';
  filesystemMode: 'read-only' | 'ephemeral-copy-on-write' | 'restricted';
  memoryLimitMb: number;
  cpuQuotaPercent: number;
  status: 'active' | 'quarantined' | 'idle';
}

export interface IndustryTemplate {
  id: string;
  name: string;
  code: string;
  category: string;
  iconName: string;
  description: string;
  defaultTasks: BlueprintTask[];
  defaultStorage: string;
  defaultPayment: string;
  recommendedCompliance: string[];
}

export interface PlanConfig {
  name: PlanTier;
  label: string;
  monthlyPrice: number;
  annualPrice: number;
  price: number;
  billingPeriod: string;
  description: string;
  tagline: string;
  popular?: boolean;
  features: string[];
  scanMinutes: string;
  customTemplates: string;
  securityAgentsCount: number;
  agentPercentage?: string;
  targetVerticals?: string[];
  sla?: string;
}
