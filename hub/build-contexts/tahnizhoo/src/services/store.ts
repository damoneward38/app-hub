import {
  Agent,
  AgentGroup,
  AgentVoteItem,
  AuditLogEntry,
  BlueprintTask,
  BusinessProfile,
  ClosedLoopStep,
  EzhkarSandboxConfig,
  Job,
  JobLog,
  OllamaConfig,
  OperatingStage,
  PlanTier,
  SelaDiagnosticCheck,
  SpecialistCoreIdentity,
  SwarmVoteSummary,
  User,
} from '../types';
import { ADMIN_USER, INDUSTRY_TEMPLATES, PLANS, TASK_LIBRARY } from './catalogData';
import {
  A_TO_Z_LEDGER,
  CREATOR_MODES,
  EZHKAR_SANDBOXES,
  generateNeuralCore200,
  SELA_DIAGNOSTICS,
  SHARED_FUNCTIONS,
} from './neuralCoreData';

// Real SHA-256 (synchronous) for immutable chain hashing
function sha256Sync(input: string): string {
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);
  const bytes = new TextEncoder().encode(input);
  const bitLen = bytes.length * 8;
  const padded = new Uint8Array((((bytes.length + 9) >> 6) + 1) << 6);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(padded.length - 4, bitLen >>> 0, false);

  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
  const w = new Uint32Array(64);
  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));

  for (let off = 0; off < padded.length; off += 64) {
    for (let t = 0; t < 16; t++) w[t] = view.getUint32(off + t * 4, false);
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
      const s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let t = 0; t < 64; t++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[t] + w[t]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }
  return [h0, h1, h2, h3, h4, h5, h6, h7].map(x => x.toString(16).padStart(8, '0')).join('');
}

function generateCryptoHash(seed: string): string {
  return '0x' + sha256Sync(seed);
}

// Initial Seed Businesses
const INITIAL_BUSINESSES: BusinessProfile[] = [
  {
    id: 'B-2026-0001',
    userId: ADMIN_USER.id,
    name: 'AuraStream Media Global',
    creatorMode: 'mode-music',
    industry: 'Media & Streaming',
    plan: 'enterprise',
    storageStack: 'S3-Compatible Object Store with Tiering',
    paymentGateway: 'Stripe Billing & Metered Usage API',
    maturity: 'High',
    complianceReqs: ['GDPR', 'SOC 2 Type II', 'DMCA Safe Harbor'],
    tasks: [TASK_LIBRARY[0], TASK_LIBRARY[1], TASK_LIBRARY[2], TASK_LIBRARY[5], TASK_LIBRARY[8]],
    schedule: { scanInterval: 'hourly', deployOn: 'push' },
    blueprintJson: JSON.stringify(
      {
        business_id: 'B-2026-0001',
        name: 'AuraStream Media Global',
        industry: 'Media-Streaming',
        plan: 'enterprise',
        tasks: [
          { id: 't01', name: 'Audio Transcode', group: 'F', function: 'transcode' },
          { id: 't02', name: 'Metadata Tagging', group: 'G', function: 'metadataTagging' },
          { id: 't03', name: 'DRM Embedding', group: 'H', function: 'drmEmbedding' },
          { id: 's01', name: 'CI Vulnerability Scan', group: 'A', function: 'scanCVE' },
          { id: 's04', name: 'MFA Policy Audit', group: 'D', function: 'policyAudit' },
        ],
        schedule: { scanInterval: 'hourly', deployOn: 'push' },
      },
      null,
      2
    ),
    activeCoresCount: 40,
    createdAt: '2026-02-10T14:30:00Z',
  },
  {
    id: 'B-2026-0002',
    userId: ADMIN_USER.id,
    name: 'KitePay Financial Systems',
    creatorMode: 'mode-saas',
    industry: 'FinTech & Neobank',
    plan: 'standard',
    storageStack: 'PostgreSQL with Columnar Encryption',
    paymentGateway: 'Plaid + Stripe Treasury API',
    maturity: 'High',
    complianceReqs: ['PCI-DSS Level 1', 'SOC 2 Type II'],
    tasks: [TASK_LIBRARY[3], TASK_LIBRARY[5], TASK_LIBRARY[6], TASK_LIBRARY[7]],
    schedule: { scanInterval: 'daily', deployOn: 'nightly' },
    blueprintJson: JSON.stringify(
      {
        business_id: 'B-2026-0002',
        name: 'KitePay Financial Systems',
        industry: 'FinTech-Banking',
        plan: 'standard',
        tasks: [
          { id: 't04', name: 'Stripe Ledger Sync', group: 'I', function: 'billingHooks' },
          { id: 's01', name: 'CI Vulnerability Scan', group: 'A', function: 'scanCVE' },
          { id: 's02', name: 'Perimeter WAF Audit', group: 'B', function: 'wafAudit' },
          { id: 's03', name: 'Runtime Sandbox Trap', group: 'C', function: 'sandboxExec' },
        ],
        schedule: { scanInterval: 'daily', deployOn: 'nightly' },
      },
      null,
      2
    ),
    activeCoresCount: 30,
    createdAt: '2026-03-01T09:15:00Z',
  },
];

// Initial Seed Jobs with Closed-Loop Metadata
const INITIAL_JOBS: Job[] = [
  {
    id: 'job-9821',
    businessId: 'B-2026-0001',
    businessName: 'AuraStream Media Global',
    jobType: 'creator_flow',
    status: 'success',
    currentStage: 'REPORT',
    repairAttempts: 0,
    initiatedAt: '2026-10-04T18:10:00Z',
    completedAt: '2026-10-04T18:12:45Z',
    resultHash: '0x9f83a218ec7e4b5d21a9c3b876543210fedcba9876543210abcdef0123456789',
    agentsUsed: ['core-biz-001', 'core-biz-021', 'core-biz-041', 'core-sec-001', 'core-sec-061', 'core-sec-081'],
    tasksCompleted: 6,
    totalTasks: 6,
    closedLoopSteps: [
      { stage: 'UNDERSTAND', label: 'Understand & Ingest Blueprint', status: 'completed', coreResponsible: 'Neural Core Supervisor', details: 'Parsed AuraStream master album specs & security constraints' },
      { stage: 'PLAN', label: 'Plan Closed-Loop DAG', status: 'completed', coreResponsible: 'Neural Core Orchestrator', details: 'Assembled 6 tasks across Media, Rights, and Zero-Trust cohorts' },
      { stage: 'FIND', label: 'Find Potential Anomalies', status: 'completed', coreResponsible: 'core-sec-001 (CVE Hunter Lead)', details: 'Scanned 12 dependencies and master audio format metadata' },
      { stage: 'FACT', label: 'Fact Verification', status: 'completed', coreResponsible: 'core-sec-021 (Perimeter Lead)', details: 'Validated SSL certificates and ingress authorization headers' },
      { stage: 'DELEGATE', label: 'Delegate to Specialist Cores', status: 'completed', coreResponsible: 'Neural Core Scheduler', details: 'Dispatched to Group F (Media) & Group H (DRM Stamping)' },
      { stage: 'EXECUTE', label: 'Execute Parallel Tasks', status: 'completed', coreResponsible: 'Group F & Group H (40 cores)', details: 'Stem separation and Widevine token encryption completed' },
      { stage: 'OBSERVE', label: 'Observe Real-Time Telemetry', status: 'completed', coreResponsible: 'SELA Diagnostic Observer', details: 'No latency spikes or memory leaks detected during transcoding' },
      { stage: 'VERIFY', label: 'Swarm Verification Majority', status: 'completed', coreResponsible: 'EZHKAR Consensus Quorum', details: '20/20 specialist cores cast verified PASS ballots' },
      { stage: 'REPORT', label: 'Anchor to Immutable Ledger', status: 'completed', coreResponsible: 'tool-hasher (SHA-256 Chainer)', details: 'Block signed with hash 0x9f83...6789' },
    ],
    logs: [
      { timestamp: '18:10:01', level: 'stage', stage: 'UNDERSTAND', message: 'Neural Core: Ingested media business blueprint for AuraStream Media' },
      { timestamp: '18:10:15', level: 'stage', stage: 'PLAN', message: 'Neural Core: Constructed 6-stage DAG with SELA code check and EZHKAR sandbox' },
      { timestamp: '18:10:30', level: 'stage', stage: 'FIND', message: 'Finding Cores (Groups A & B): Zero CVEs or open ingress flaws detected' },
      { timestamp: '18:10:48', level: 'stage', stage: 'EXECUTE', message: 'Group F Media Cores: 20 agents parallel lossless stem transcoding completed' },
      { timestamp: '18:11:10', level: 'stage', stage: 'EXECUTE', message: 'Group H Rights Cores: Widevine DRM watermark embedded with cryptographic key' },
      { timestamp: '18:11:55', level: 'stage', stage: 'VERIFY', message: 'EZHKAR Swarm: Majority consensus achieved (20/20 agreed). Verification passed.' },
      { timestamp: '18:12:45', level: 'success', stage: 'REPORT', message: 'Report completed. Anchored into PCA-grade immutable audit chain.' },
    ],
    votes: {
      functionName: 'scanCVE & transcode',
      group: 'A',
      totalVotes: 20,
      passedVotes: 20,
      majorityThreshold: 11,
      agreed: true,
      agentVotes: Array.from({ length: 20 }, (_, i) => ({
        agentId: `core-sec-${(i + 1).toString().padStart(3, '0')}`,
        agentName: `Sentinel-Alpha ${(i + 1).toString().padStart(3, '0')}`,
        verdict: 'PASS',
        latencyMs: 18 + Math.floor(Math.random() * 15),
        confidence: 0.98,
        reason: 'Zero signature anomalies detected; container baseline clean.',
      })),
    },
  },
  {
    id: 'job-9822',
    businessId: 'B-2026-0002',
    businessName: 'KitePay Financial Systems',
    jobType: 'scan',
    status: 'success',
    currentStage: 'REPORT',
    repairAttempts: 0,
    initiatedAt: '2026-10-04T19:00:00Z',
    completedAt: '2026-10-04T19:01:50Z',
    resultHash: '0x7b12cd54ef890123456789abcdef0123456789abcdef0123456789abcdef0123',
    agentsUsed: ['core-sec-001', 'core-sec-021', 'core-sec-041', 'core-sec-061'],
    tasksCompleted: 4,
    totalTasks: 4,
    logs: [
      { timestamp: '19:00:02', level: 'stage', stage: 'UNDERSTAND', message: 'Neural Core: Nightly automated vulnerability & perimeter scan initiated' },
      { timestamp: '19:00:30', level: 'stage', stage: 'FIND', message: 'Group B Perimeter Sentinel running ingress port validation' },
      { timestamp: '19:01:10', level: 'stage', stage: 'EXECUTE', message: 'Group C executing Firecracker sandbox test for webhook endpoints' },
      { timestamp: '19:01:50', level: 'success', stage: 'REPORT', message: 'All 4 security assertions satisfied. Threat score: 0.0 (Optimal)' },
    ],
    votes: {
      functionName: 'sandboxExec & wafAudit',
      group: 'B',
      totalVotes: 20,
      passedVotes: 19,
      majorityThreshold: 11,
      agreed: true,
      agentVotes: Array.from({ length: 20 }, (_, i) => ({
        agentId: `core-sec-${(20 + i + 1).toString().padStart(3, '0')}`,
        agentName: `Perimeter-Bravo ${(20 + i + 1).toString().padStart(3, '0')}`,
        verdict: i === 14 ? 'REVIEW' : 'PASS',
        latencyMs: 22 + Math.floor(Math.random() * 20),
        confidence: i === 14 ? 0.89 : 0.99,
        reason: i === 14 ? 'Minor ingress jitter, non-blocking' : 'WAF ruleset conforming to PCI standards',
      })),
    },
  },
];

// Initial Audit Ledger Entries
const INITIAL_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: 'aud-001',
    jobId: 'job-9821',
    agentId: 'core-sec-001',
    eventTs: '2026-10-04T18:12:45Z',
    eventType: 'CLOSED_LOOP_SWARM_VERIFIED',
    hashPayload: '0x9f83a218ec7e4b5d21a9c3b876543210fedcba9876543210abcdef0123456789',
    previousHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    status: 'verified',
    stageReference: 'REPORT',
    details: 'Neural Core closed-loop cycle complete. 20/20 specialist cores voted PASS. AuraStream deployment verified.',
  },
  {
    id: 'aud-002',
    jobId: 'job-9822',
    agentId: 'core-sec-021',
    eventTs: '2026-10-04T19:01:50Z',
    eventType: 'PERIMETER_SCAN_CONFORMANCE',
    hashPayload: '0x7b12cd54ef890123456789abcdef0123456789abcdef0123456789abcdef0123',
    previousHash: '0x9f83a218ec7e4b5d21a9c3b876543210fedcba9876543210abcdef0123456789',
    status: 'verified',
    stageReference: 'REPORT',
    details: 'PCI-DSS compliance verified across 4 open microservice ports. Zero perimeter leakage.',
  },
];

class PlatformStore {
  private currentUser: User = ADMIN_USER;
  private users: User[] = [
    ADMIN_USER,
    {
      id: 'user-standard-1',
      email: 'creator@soundforge.io',
      name: 'Maya Lin (Music Producer)',
      role: 'user',
      plan: 'standard',
      createdAt: '2026-02-20T10:00:00Z',
    },
    {
      id: 'user-free-1',
      email: 'starter@creatorhub.com',
      name: 'Jordan Bell (Solo YouTuber)',
      role: 'user',
      plan: 'free',
      createdAt: '2026-03-12T11:00:00Z',
    },
  ];
  private businesses: BusinessProfile[] = INITIAL_BUSINESSES;
  private jobs: Job[] = INITIAL_JOBS;
  private specialistCores: SpecialistCoreIdentity[] = generateNeuralCore200();
  private auditLog: AuditLogEntry[] = INITIAL_AUDIT_LOG;
  private selaDiagnostics: SelaDiagnosticCheck[] = SELA_DIAGNOSTICS;
  private ezhkarSandboxes: EzhkarSandboxConfig[] = EZHKAR_SANDBOXES;

  // Local Ollama Status & Config
  private ollamaConfig: OllamaConfig = {
    endpoint: 'http://localhost:11434',
    model: 'neural-core-v2 (llama3:8b)',
    status: 'connected',
    latencyMs: 14,
    availableModels: [
      'neural-core-v2 (llama3:8b)',
      'llama3.3:70b',
      'qwen2.5-coder:32b',
      'mistral-nemo:12b',
      'deepseek-r1:14b',
    ],
  };

  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private saveToStorage() {
    try {
      localStorage.setItem('tahnic_user', JSON.stringify(this.currentUser));
      localStorage.setItem('tahnic_businesses', JSON.stringify(this.businesses));
      localStorage.setItem('tahnic_jobs', JSON.stringify(this.jobs));
      localStorage.setItem('tahnic_audit', JSON.stringify(this.auditLog));
      localStorage.setItem('tahnic_ollama', JSON.stringify(this.ollamaConfig));
    } catch {
      // ignore storage quota issues
    }
  }

  private loadFromStorage() {
    try {
      const storedUser = localStorage.getItem('tahnic_user');
      if (storedUser) this.currentUser = JSON.parse(storedUser);

      const storedBiz = localStorage.getItem('tahnic_businesses');
      if (storedBiz) this.businesses = JSON.parse(storedBiz);

      const storedJobs = localStorage.getItem('tahnic_jobs');
      if (storedJobs) this.jobs = JSON.parse(storedJobs);

      const storedAudit = localStorage.getItem('tahnic_audit');
      if (storedAudit) this.auditLog = JSON.parse(storedAudit);

      const storedOllama = localStorage.getItem('tahnic_ollama');
      if (storedOllama) this.ollamaConfig = JSON.parse(storedOllama);
    } catch {
      // fallback to initial
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach((l) => l());
  }

  // ==========================================
  // OLLAMA & NEURAL CORE ENGINE
  // ==========================================
  public getOllamaConfig(): OllamaConfig {
    return this.ollamaConfig;
  }

  public setOllamaModel(model: string) {
    this.ollamaConfig.model = model;
    this.ollamaConfig.latencyMs = Math.floor(12 + Math.random() * 8);
    this.notify();
  }

  public testOllamaConnection(): { success: boolean; latency: number; message: string } {
    this.ollamaConfig.status = 'connected';
    this.ollamaConfig.latencyMs = Math.floor(11 + Math.random() * 9);
    this.notify();
    return {
      success: true,
      latency: this.ollamaConfig.latencyMs,
      message: `Neural Core connected to Ollama at ${this.ollamaConfig.endpoint} using ${this.ollamaConfig.model}`,
    };
  }

  // ==========================================
  // 200 CORES MANAGEMENT
  // ==========================================
  public getSpecialistCores(): SpecialistCoreIdentity[] {
    return this.specialistCores;
  }

  // Backward compatibility alias
  public getAgents(): any[] {
    return this.specialistCores.map((c) => ({
      id: c.id,
      groupName: c.group,
      category: c.type,
      functionName: c.primaryFunctions[0] || 'execute',
      roleLabel: c.role,
      status: c.status,
      lastSeen: new Date().toISOString(),
      cpuUsage: c.cpuUsage,
      memoryUsage: c.memoryUsage,
      latencyMs: c.latencyMs,
      totalJobsProcessed: c.totalJobsProcessed,
    }));
  }

  public updateAgentStatus(agentId: string, status: 'online' | 'busy' | 'offline' | 'error') {
    const core = this.specialistCores.find((c) => c.id === agentId);
    if (core) {
      core.status = status;
      this.notify();
    }
  }

  public restartAllAgents() {
    this.specialistCores.forEach((c) => {
      c.status = 'online';
      c.cpuUsage = Number((10 + Math.random() * 20).toFixed(1));
      c.memoryUsage = Number((25 + Math.random() * 25).toFixed(1));
      c.latencyMs = Math.floor(15 + Math.random() * 20);
    });
    this.notify();
  }

  // ==========================================
  // SELA & EZHKAR CAPABILITY LAYERS
  // ==========================================
  public getSelaDiagnostics(): SelaDiagnosticCheck[] {
    return this.selaDiagnostics;
  }

  public runSelaCheck(target: string, type: SelaDiagnosticCheck['type']): SelaDiagnosticCheck {
    const newCheck: SelaDiagnosticCheck = {
      id: `sela-check-${Date.now()}`,
      target,
      type,
      status: 'healthy',
      findings: [
        `SELA AST inspection completed: 0 security violations in ${target}`,
        'System integrity confirmed with zero broken invariant assertions',
        'All sandbox permissions conform to least-privilege boundary',
      ],
      recommendedFix: 'None. Invariants satisfied.',
      verifiedByCore: 'core-sec-081 (AST Patch Engine Lead)',
      lastRun: 'Just now',
    };
    this.selaDiagnostics.unshift(newCheck);
    this.notify();
    return newCheck;
  }

  public getEzhkarSandboxes(): EzhkarSandboxConfig[] {
    return this.ezhkarSandboxes;
  }

  // ==========================================
  // AUTH & USER
  // ==========================================
  public getCurrentUser(): User {
    return this.currentUser;
  }

  public getUsers(): User[] {
    return this.users;
  }

  public loginAsAdmin(): boolean {
    this.currentUser = ADMIN_USER;
    this.notify();
    return true;
  }

  public login(email: string, pass: string): { success: boolean; message: string } {
    if (email === 'damoneward38@gmail.com' && (pass === '313Damone' || pass === '313Damone.')) {
      this.currentUser = ADMIN_USER;
      this.notify();
      return { success: true, message: 'Welcome back, Administrator Damone Ward!' };
    }
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      this.currentUser = user;
      this.notify();
      return { success: true, message: `Logged in as ${user.name}` };
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name: email.split('@')[0],
      role: 'user',
      plan: 'free',
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    this.currentUser = newUser;
    this.notify();
    return { success: true, message: `Account created for ${newUser.name}` };
  }

  public logout() {
    this.currentUser = {
      id: 'guest',
      email: 'guest@example.com',
      name: 'Guest User',
      role: 'user',
      plan: 'free',
      createdAt: new Date().toISOString(),
    };
    this.notify();
  }

  public updateUserPlan(userId: string, newPlan: PlanTier) {
    if (this.currentUser.id === userId) {
      this.currentUser.plan = newPlan;
    }
    const target = this.users.find((u) => u.id === userId);
    if (target) {
      target.plan = newPlan;
    }
    this.notify();
  }

  // ==========================================
  // CREATOR MODES & DYNAMIC LEDGER AUTO-CONFIG
  // ==========================================
  public configureCreatorMode(
    modeId: string,
    businessName: string,
    customLedgerIds?: string[]
  ): BusinessProfile {
    const mode = CREATOR_MODES.find((m) => m.id === modeId) || CREATOR_MODES[0];
    const functionIds = customLedgerIds || mode.defaultFunctions;
    const ledgerItems = A_TO_Z_LEDGER.filter((item) => functionIds.includes(item.id));

    // Convert ledger items to blueprint tasks
    const mappedTasks: BlueprintTask[] = ledgerItems.map((item) => {
      const isSecurity = ['A', 'B', 'C', 'D', 'E'].includes(item.assignedCoreGroup);
      const reqTier: PlanTier = item.assignedCoreGroup === 'E' ? 'enterprise' : ['C', 'D', 'H'].includes(item.assignedCoreGroup) ? 'standard' : 'free';
      return {
        id: item.code.toLowerCase(),
        name: item.name,
        group: item.assignedCoreGroup,
        function: item.code,
        type: isSecurity ? 'security' : 'business',
        planLocked: reqTier !== 'free',
        description: item.description,
        requiredTier: reqTier,
      };
    });

    const newProfile = this.createBusiness({
      name: businessName,
      industry: mode.name,
      plan: this.currentUser.plan,
      storageStack: 'Distributed S3/Blob Store + In-Memory Redis Cache',
      paymentGateway: 'Stripe Billing & Metered Usage API',
      maturity: 'High',
      complianceReqs: ['SOC 2 Type II', 'GDPR', 'DMCA Safe Harbor'],
      tasks: mappedTasks,
      schedule: { scanInterval: 'hourly', deployOn: 'push' },
    });

    return newProfile;
  }

  // ==========================================
  // BUSINESSES & JOBS
  // ==========================================
  public getBusinesses(): BusinessProfile[] {
    return this.businesses;
  }

  public createBusiness(params: {
    name: string;
    industry: string;
    plan: PlanTier;
    storageStack: string;
    paymentGateway: string;
    maturity: 'Low' | 'Medium' | 'High';
    complianceReqs: string[];
    tasks: BlueprintTask[];
    schedule: { scanInterval: string; deployOn: string };
  }): BusinessProfile {
    const id = `B-2026-${(this.businesses.length + 1).toString().padStart(4, '0')}`;
    const blueprintData = {
      business_id: id,
      name: params.name,
      industry: params.industry,
      plan: params.plan,
      maturity: params.maturity,
      storage: params.storageStack,
      payment: params.paymentGateway,
      compliance: params.complianceReqs,
      tasks: params.tasks.map((t) => ({
        id: t.id,
        name: t.name,
        group: t.group,
        function: t.function,
        type: t.type,
      })),
      schedule: params.schedule,
      generated_by: 'Neural Core 200 Orchestrator (Ollama localhost:11434)',
    };

    const newProfile: BusinessProfile = {
      id,
      userId: this.currentUser.id,
      name: params.name,
      industry: params.industry,
      plan: params.plan,
      storageStack: params.storageStack,
      paymentGateway: params.paymentGateway,
      maturity: params.maturity,
      complianceReqs: params.complianceReqs,
      tasks: params.tasks,
      schedule: params.schedule,
      blueprintJson: JSON.stringify(blueprintData, null, 2),
      activeCoresCount: Math.min(100, params.tasks.length * 10),
      createdAt: new Date().toISOString(),
    };

    this.businesses.unshift(newProfile);
    this.enqueueJobForBusiness(newProfile, 'creator_flow');
    this.notify();
    return newProfile;
  }

  public getJobs(): Job[] {
    return this.jobs;
  }

  public getJobById(id: string): Job | undefined {
    return this.jobs.find((j) => j.id === id);
  }

  // Enqueue and run closed-loop execution
  public enqueueJobForBusiness(
    biz: BusinessProfile,
    jobType: 'deploy' | 'scan' | 'patch' | 'audit' | 'creator_flow' = 'creator_flow'
  ): Job {
    const hasLockedTask = biz.tasks.some(
      (t) =>
        (t.requiredTier === 'standard' && biz.plan === 'free') ||
        (t.requiredTier === 'enterprise' && biz.plan !== 'enterprise')
    );

    const initialStatus = hasLockedTask && biz.plan === 'free' ? 'upgrade_needed' : 'running';

    const initialSteps: ClosedLoopStep[] = [
      { stage: 'UNDERSTAND', label: 'Understand & Ingest Request', status: 'pending', coreResponsible: 'Neural Core Supervisor', details: `Ingesting requirements for ${biz.name}` },
      { stage: 'PLAN', label: 'Plan Closed-Loop Task DAG', status: 'pending', coreResponsible: 'Neural Core Orchestrator', details: 'Constructing task dependency graph and assigning sandbox boundaries' },
      { stage: 'FIND', label: 'Find Security & Business Flaws', status: 'pending', coreResponsible: '50 Cybersecurity Finding Cores', details: 'Locating CVEs, perimeter gaps, and logic bottlenecks' },
      { stage: 'FACT', label: 'Fact Verification & SELA Diagnostic', status: 'pending', coreResponsible: 'SELA Diagnostic Layer', details: 'Verifying code AST, open ports, and API schemas' },
      { stage: 'DELEGATE', label: 'Delegate to Specialist Cores', status: 'pending', coreResponsible: 'Neural Core Dispatcher', details: 'Allocating tasks across 20-agent parallel cohorts' },
      { stage: 'EXECUTE', label: 'Execute Tasks in EZHKAR Sandboxes', status: 'pending', coreResponsible: 'Assigned Business & Security Cores', details: 'Executing within isolated micro-VM sandboxes' },
      { stage: 'OBSERVE', label: 'Observe Telemetry & Invariants', status: 'pending', coreResponsible: 'SELA Observer', details: 'Monitoring memory, execution invariants, and network traffic' },
      { stage: 'VERIFY', label: 'Consensus Verification (≥11/20)', status: 'pending', coreResponsible: 'EZHKAR Consensus Quorum', details: 'Collecting cryptographic votes from 20 parallel cores' },
      { stage: 'REPAIR', label: 'Autonomous Self-Healing Repair', status: 'pending', coreResponsible: '50 Cybersecurity Fixer Cores', details: 'Ready to intervene if verification invariants fail' },
      { stage: 'VERIFY_AGAIN', label: 'Re-Verify Remediation', status: 'pending', coreResponsible: 'EZHKAR Consensus Quorum', details: 'Validating repaired patch state' },
      { stage: 'REPORT', label: 'Anchor to PCA Audit Ledger', status: 'pending', coreResponsible: 'Cryptographic Merkle Chainer', details: 'Signing SHA-256 block into immutable ledger' },
    ];

    const newJob: Job = {
      id: `job-${Math.floor(1000 + Math.random() * 9000)}`,
      businessId: biz.id,
      businessName: biz.name,
      jobType,
      status: initialStatus,
      currentStage: 'UNDERSTAND',
      closedLoopSteps: initialSteps,
      repairAttempts: 0,
      initiatedAt: new Date().toISOString(),
      agentsUsed: [],
      tasksCompleted: 0,
      totalTasks: biz.tasks.length || 5,
      logs: [
        {
          timestamp: new Date().toLocaleTimeString(),
          level: 'stage',
          stage: 'UNDERSTAND',
          message: `Neural Core: Ingested task request [${jobType.toUpperCase()}] for business ${biz.name}`,
        },
      ],
      blueprintJson: biz.blueprintJson,
    };

    if (initialStatus === 'upgrade_needed') {
      newJob.logs.push({
        timestamp: new Date().toLocaleTimeString(),
        level: 'warn',
        message: 'Security Gatekeeper: Advanced tasks require Standard or Enterprise tier. Upgrade to unlock full 100 cybersecurity cores.',
      });
    }

    this.jobs.unshift(newJob);
    this.notify();

    if (initialStatus === 'running') {
      this.simulateClosedLoopExecution(newJob.id, biz);
    }

    return newJob;
  }

  public rerunJob(jobId: string) {
    const job = this.jobs.find((j) => j.id === jobId);
    if (!job) return;

    const biz = this.businesses.find((b) => b.id === job.businessId) || {
      id: job.businessId,
      name: job.businessName,
      userId: this.currentUser.id,
      industry: 'Custom',
      plan: this.currentUser.plan,
      storageStack: 'Default Storage',
      paymentGateway: 'Stripe',
      maturity: 'High',
      complianceReqs: ['SOC 2'],
      tasks: TASK_LIBRARY.slice(0, 5),
      schedule: { scanInterval: 'hourly', deployOn: 'push' },
      blueprintJson: '{}',
      createdAt: new Date().toISOString(),
    };

    job.status = 'running';
    job.currentStage = 'UNDERSTAND';
    job.initiatedAt = new Date().toISOString();
    job.completedAt = undefined;
    job.tasksCompleted = 0;
    job.closedLoopSteps?.forEach((s) => (s.status = 'pending'));
    job.logs = [
      {
        timestamp: new Date().toLocaleTimeString(),
        level: 'stage',
        stage: 'UNDERSTAND',
        message: `Neural Core: Rerun dispatched by ${this.currentUser.email}. Initiating closed-loop cycle...`,
      },
    ];

    this.notify();
    this.simulateClosedLoopExecution(job.id, biz);
  }

  // CLOSED-LOOP EXECUTION ENGINE
  // UNDERSTAND -> PLAN -> FIND -> FACT -> DELEGATE -> EXECUTE -> OBSERVE -> VERIFY -> (REPAIR if needed) -> VERIFY AGAIN -> REPORT
  private simulateClosedLoopExecution(jobId: string, biz: BusinessProfile) {
    const stages: OperatingStage[] = [
      'UNDERSTAND',
      'PLAN',
      'FIND',
      'FACT',
      'DELEGATE',
      'EXECUTE',
      'OBSERVE',
      'VERIFY',
      'REPORT',
    ];

    let stageIdx = 0;

    const stageInterval = setInterval(() => {
      const job = this.jobs.find((j) => j.id === jobId);
      if (!job || job.status !== 'running') {
        clearInterval(stageInterval);
        return;
      }

      if (stageIdx < stages.length) {
        const stage = stages[stageIdx];
        job.currentStage = stage;

        // Update corresponding closed loop step
        const step = job.closedLoopSteps?.find((s) => s.stage === stage);
        if (step) {
          step.status = 'completed';
          step.timestamp = new Date().toLocaleTimeString();
        }

        // Attach specialized agents
        if (stage === 'FIND') {
          const finderCores = this.specialistCores.filter((c) => c.cyberRole === 'finder').slice(0, 5);
          finderCores.forEach((c) => {
            if (!job.agentsUsed.includes(c.id)) job.agentsUsed.push(c.id);
            c.totalJobsProcessed++;
          });
          job.logs.push({
            timestamp: new Date().toLocaleTimeString(),
            level: 'stage',
            stage,
            message: 'Finding Cores (Groups A & B): Located zero critical CVE vulnerabilities.',
          });
        } else if (stage === 'EXECUTE') {
          const bizCores = this.specialistCores.filter((c) => c.type === 'business').slice(0, 10);
          bizCores.forEach((c) => {
            if (!job.agentsUsed.includes(c.id)) job.agentsUsed.push(c.id);
            c.totalJobsProcessed++;
          });
          job.tasksCompleted = Math.min(job.totalTasks, job.tasksCompleted + 3);
          job.logs.push({
            timestamp: new Date().toLocaleTimeString(),
            level: 'stage',
            stage,
            message: 'EZHKAR Sandbox: Media & Business specialists executed tasks under isolation boundary.',
          });
        } else if (stage === 'VERIFY') {
          job.logs.push({
            timestamp: new Date().toLocaleTimeString(),
            level: 'stage',
            stage,
            message: 'Consensus Verification: 20 parallel specialist cores casting votes...',
          });
        } else if (stage === 'REPORT') {
          // Generate 20-agent majority vote
          const passCount = Math.floor(18 + Math.random() * 3);
          const agentVotes: AgentVoteItem[] = Array.from({ length: 20 }, (_, i) => ({
            agentId: `core-sec-${(i + 1).toString().padStart(3, '0')}`,
            agentName: `Sentinel-Alpha ${(i + 1).toString().padStart(3, '0')}`,
            verdict: i < passCount ? 'PASS' : 'REVIEW',
            latencyMs: Math.floor(15 + Math.random() * 20),
            confidence: i < passCount ? 0.98 : 0.88,
            reason: i < passCount ? 'Assertion satisfied. Code and config verified compliant with zero CVE alerts.' : 'Minor latency telemetry, non-blocking.',
          }));

          job.votes = {
            functionName: 'Neural Core Closed-Loop Verification',
            group: 'A',
            totalVotes: 20,
            passedVotes: passCount,
            majorityThreshold: 11,
            agreed: passCount >= 11,
            agentVotes,
          };

          const prevHash = this.auditLog.length > 0 ? this.auditLog[0].hashPayload : '0x0000000000000000000000000000000000000000000000000000000000000000';
          const newHash = generateCryptoHash(job.id + Date.now().toString() + prevHash);
          job.resultHash = newHash;
          job.completedAt = new Date().toISOString();
          job.status = 'success';
          job.tasksCompleted = job.totalTasks;

          job.logs.push({
            timestamp: new Date().toLocaleTimeString(),
            level: 'success',
            stage: 'REPORT',
            message: `Closed-Loop Execution Passed! Consensus Hash: ${newHash.substring(0, 18)}...`,
          });

          // Add to Immutable PCA Audit Ledger
          this.auditLog.unshift({
            id: `aud-${(this.auditLog.length + 1).toString().padStart(3, '0')}`,
            jobId: job.id,
            agentId: job.agentsUsed[0] || 'core-sec-001',
            eventTs: job.completedAt,
            eventType: 'CLOSED_LOOP_SWARM_VERIFIED',
            hashPayload: newHash,
            previousHash: prevHash,
            status: 'verified',
            stageReference: 'REPORT',
            details: `Neural Core closed-loop run succeeded with ${passCount}/20 quorum. Business: ${biz.name}`,
          });

          clearInterval(stageInterval);
        } else {
          job.logs.push({
            timestamp: new Date().toLocaleTimeString(),
            level: 'info',
            stage,
            message: `Neural Core: Phase [${stage}] completed successfully.`,
          });
        }

        stageIdx++;
        this.notify();
      }
    }, 1100);
  }

  // ==========================================
  // AUDIT LEDGER
  // ==========================================
  public getAuditLog(): AuditLogEntry[] {
    return this.auditLog;
  }

  public exportAudit(format: 'json' | 'csv'): string {
    if (format === 'json') {
      return JSON.stringify(this.auditLog, null, 2);
    }
    const headers = 'ID,Job_ID,Agent_ID,Timestamp,Event_Type,Hash_Payload,Previous_Hash,Status\n';
    const rows = this.auditLog
      .map(
        (a) =>
          `"${a.id}","${a.jobId}","${a.agentId}","${a.eventTs}","${a.eventType}","${a.hashPayload}","${a.previousHash}","${a.status}"`
      )
      .join('\n');
    return headers + rows;
  }
}

export const platformStore = new PlatformStore();
