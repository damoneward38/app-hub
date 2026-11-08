export interface Feature {
  id: number;
  set: number; // 1 to 6
  title: string;
  titleHe?: string;
  desc: string;
  category: 'Privacy & Governance' | 'OS & Infrastructure' | 'Network & WAF' | 'Identity & Zero-Trust' | 'Cryptography & DLP' | 'SIEM & SOC Operations';
  complianceTags: string[];
  specs: string;
  apiSample?: string;
  verificationOutput?: string;
}

export interface PricingTier {
  id: string;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  isCustom?: boolean;
  users: string;
  featuresSummary: string;
  includedFeatureCount: number;
  highlighted?: boolean;
  perks: string[];
  ctaText: string;
}

export interface WhiteLabelConfig {
  brandName: string;
  brandTagline: string;
  primaryColor: string;
  customDomain: string;
  selectedTier: 'base' | 'enterprise';
  selectedAddons: string[];
}

export interface QuoteRequestData {
  name: string;
  email: string;
  company: string;
  phone?: string;
  tier: string;
  userCount: string;
  notes: string;
  estimatedBudget: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  ip: string;
  country: string;
  attackType: string;
  actionTaken: 'BLOCKED' | 'MITIGATED' | 'ISOLATED' | 'TOKENIZED';
  featureId: number;
  featureName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export type UserRole = 
  | 'owner' 
  | 'admin' 
  | 'security_analyst' 
  | 'privacy_officer' 
  | 'viewer' 
  | 'security_officer' 
  | 'compliance_auditor' 
  | 'analyst';

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  trustedStatus: 'Hardware Enclave' | 'WebAuthn Bound' | 'Standard Session';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  tenantName: string;
  avatar?: string;
  plan: 'basic' | 'pro' | 'enterprise' | 'whitelabel';
  mfaEnabled: boolean;
  emailVerified?: boolean;
  lastLogin: string;
  activeSessions?: UserSession[];
}

export interface WafRule {
  id: string;
  name: string;
  type: 'rate_limiting' | 'ip_reputation' | 'sql_injection' | 'xss_shield' | 'geo_fencing' | 'bot_challenge';
  status: 'active' | 'learning' | 'disabled';
  action: 'block' | 'challenge' | 'log';
  matchedLast24h: number;
  updatedAt: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ZeroTrustPolicy {
  id: string;
  name: string;
  enclave: string;
  postureRequirement: string;
  deviceTrust: 'Managed' | 'Hardware Root of Trust' | 'Biometric Bound';
  activeSessions: number;
  status: 'enforced' | 'audit_only';
}

export interface ConsentRecord {
  id: string;
  subjectEmail: string;
  subjectId: string;
  purposes: string[];
  status: 'active' | 'withdrawn' | 'pending';
  source: string;
  timestamp: string;
  legalBasis: string;
  ipAddress?: string;
  signatureHash?: string;
}

export interface PrivacyFeatureModule {
  id: string;
  title: string;
  category: string;
  description: string;
  route: string;
  plan: string;
  status: string;
  capabilities: string[];
}

export interface DsarRequest {
  id: string;
  subjectName: string;
  subjectEmail: string;
  type: 'Right to Access' | 'Right to Erasure (Shred)' | 'Portability' | 'Consent Revocation';
  regulation: 'GDPR Art. 17' | 'CCPA § 1798.105' | 'HIPAA Privacy' | 'PIPEDA';
  status: 'pending' | 'verifying_id' | 'crypto_shredding' | 'completed' | 'rejected';
  submittedAt: string;
  deadlineDays: number;
}

export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  overallScore: number;
  totalControls: number;
  passedControls: number;
  failingControls: number;
  inProgressControls: number;
  lastAudited: string;
  controls: {
    id: string;
    title: string;
    category: string;
    status: 'passed' | 'warning' | 'failed';
    evidenceId: string;
    linkedFeatureId: number;
  }[];
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: 'healthy' | 'degraded' | 'unhealthy';
    api: 'healthy' | 'degraded' | 'unhealthy';
    authentication: 'healthy' | 'degraded' | 'unhealthy';
    [key: string]: string;
  };
}

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'new' | 'investigating' | 'resolved' | 'contained' | 'open';

export interface AlertIncident {
  id: string;
  title: string;
  severity: AlertSeverity;
  status: AlertStatus;
  source: string;
  createdAt: string;
  affectedAsset: string;
  assignedTo: string | null;
  target?: string;
  timestamp?: string;
  description?: string;
  mitigationSteps?: string[];
  evidenceDigest?: string;
}

export interface IntegrationConnector {
  id: string;
  name: string;
  category: 'SIEM & SOC' | 'Cloud Perimeter' | 'Identity Provider' | 'Incident Notification';
  icon: string;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  lastSync: string;
  eventsIngestedToday: number;
  description: string;
}

export interface SecurityFinding {
  id: string;
  title: string;
  category: 'WAF & Perimeter' | 'Zero-Trust Auth' | 'Data Protection' | 'Configuration' | 'Network';
  severity: 'critical' | 'high' | 'medium' | 'low';
  scoreImpact: number;
  status: 'open' | 'mitigating' | 'resolved';
  resource: string;
  description: string;
  remediation: string;
  discoveredAt: string;
}

export interface ProtectedAsset {
  id: string;
  name: string;
  type: 'Kubernetes Cluster' | 'API Gateway' | 'KMS Partition' | 'Postgres DB Enclave' | 'Storage Bucket' | 'Redis Cache' | 'Zero-Trust Ingress';
  region: string;
  securityScore: number;
  status: 'protected' | 'scanning' | 'warning';
  enclaveId: string;
  lastHardened: string;
  vulnerabilitiesCount: number;
}

export type AssetCategory = 
  | 'Websites' 
  | 'APIs' 
  | 'Domains' 
  | 'Servers' 
  | 'Cloud Accounts' 
  | 'Applications' 
  | 'Databases';

export interface InventoryAsset {
  id: string;
  name: string;
  category: AssetCategory;
  identifier: string;
  parentApex: string;
  status: 'healthy' | 'warning' | 'critical' | 'monitoring';
  ipOrHost: string;
  environment: 'production' | 'staging' | 'internal';
  monitoringActive: boolean;
  compliancePassing: boolean;
  securityScore: number;
  lastScan: string;
  tags: string[];
  vulnerabilitiesCount: number;
  wafShielded: boolean;
}

export type EnclaveEventType = 
  | 'user_login'
  | 'password_change'
  | 'api_key_create'
  | 'admin_role_change'
  | 'consent_exported'
  | 'privacy_request_completed'
  | 'alert_resolved'
  | 'integration_connected';

export interface EnclaveActivityEvent {
  id: string;
  type: EnclaveEventType;
  title: string;
  pillar: 'Monitoring' | 'Compliance' | 'Security';
  actor: string;
  actorRole: string;
  targetAsset: string;
  timestamp: string;
  details: string;
  ipAddress: string;
  evidenceDigest: string;
  status: 'success' | 'warning' | 'info';
}

export interface AuditLogRecord {
  id: string; // e.g. "audit_123"
  workspaceId: string; // e.g. "workspace_123"
  userId: string; // e.g. "user_456"
  action: string; // e.g. "ALERT_RESOLVED", "USER_CREATED", "ASSET_REGISTERED", "REPORT_GENERATED"
  entity: string; // e.g. "alert", "user", "asset", "report", "workspace"
  entityId: string; // e.g. "alert_123"
  createdAt: string; // ISO timestamp
  metadata: Record<string, any>;
}

export interface WorkspaceUser {
  id: string; // e.g. "user_456"
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'analyst' | 'viewer';
  status: 'active' | 'invited' | 'suspended';
  mfaEnabled: boolean;
  joinedAt: string;
  lastActive: string;
  title: string;
}

export interface WorkspaceReport {
  id: string;
  title: string;
  type: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'Executive';
  period: string;
  generatedAt: string;
  generatedBy: string;
  status: 'ready' | 'generating' | 'archived';
  securityScore: number;
  fileSize: string;
}

export interface WorkspaceNode {
  id: string; // e.g. "workspace_123", "workspace_456"
  name: string; // e.g. "Workspace A", "Workspace B"
  displayName: string;
  description: string;
  tier: 'Enterprise Enclave' | 'Staging Sandbox' | 'Sovereign FedRAMP';
  environment: 'production' | 'staging' | 'internal';
  apexDomain: string;
  createdAt: string;
  users: WorkspaceUser[];
  assets: InventoryAsset[];
  alerts: AlertIncident[];
  reports: WorkspaceReport[];
}

export type SkyGuardEventType =
  | 'security_alert'
  | 'system_health'
  | 'auth_failure'
  | 'access_denied'
  | 'workflow_event'
  | 'integration_event';

export type SkyGuardEventSeverity =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'info';

export type SkyGuardEventStatus =
  | 'new'
  | 'investigating'
  | 'resolved'
  | 'dismissed';

export interface SkyGuardEvent {
  id: string;
  workspaceId: string;
  type: SkyGuardEventType;
  severity: SkyGuardEventSeverity;
  status: SkyGuardEventStatus;
  description: string;
  origin: string;
  module: string;
  entityType?: string;
  entityId?: string;
  correlationId: string;
  createdAt: string;
}

export interface WhiteLabelSettings {
  companyName: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  customDomain: string;
  emailBranding: {
    senderName: string;
    senderEmail: string;
    footerText: string;
    logoInHeader: boolean;
  };
  reportBranding: {
    headerTitle: string;
    confidentialityNotice: string;
    watermarkText: string;
    showPageNumbers: boolean;
  };
  loginBranding: {
    heading: string;
    subheading: string;
    backgroundImageUrl?: string;
    customLegalLink?: string;
  };
  customSupport: {
    supportEmail: string;
    helpdeskUrl: string;
    emergencyHotline?: string;
    tier1SlaHours: number;
  };
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  condition: string;
  action: string;
  enabled: boolean;
  lastTriggered?: string;
  executionCount: number;
}

export interface SecurityApiKey {
  id: string;
  name: string;
  prefix: string;
  maskedKey: string;
  role: 'admin' | 'read_only' | 'ingestion_only';
  createdAt: string;
  expiresAt: string;
  lastUsed: string;
  status: 'active' | 'revoked';
}

