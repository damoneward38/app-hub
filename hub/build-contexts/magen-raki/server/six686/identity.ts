import type {
  AgentIdentity,
  RiskLevel,
} from "./types";

const identities = new Map<string, AgentIdentity>();

function riskValue(level: RiskLevel): number {
  const map: Record<RiskLevel, number> = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4,
  };

  return map[level] || 1;
}

export function registerAgent(identity: AgentIdentity): AgentIdentity {
  identities.set(identity.agentId, identity);
  return identity;
}

export function getAgent(agentId: string): AgentIdentity | undefined {
  return identities.get(agentId);
}

export function getAllAgents(): AgentIdentity[] {
  return Array.from(identities.values());
}

export function updateAgent(
  agentId: string,
  patch: Partial<Omit<AgentIdentity, "agentId">>
): AgentIdentity | undefined {
  const existing = identities.get(agentId);
  if (!existing) return undefined;
  const updated: AgentIdentity = {
    ...existing,
    ...patch,
  };
  identities.set(agentId, updated);
  return updated;
}

export function verifyAgent(
  agentId: string,
  capability: string,
  riskLevel: RiskLevel
): { allowed: boolean; reason: string } {
  const agent = identities.get(agentId);

  if (!agent) {
    return {
      allowed: false,
      reason: `Unknown agent identifier '${agentId}'. Access denied by Six 686 Identity Module.`,
    };
  }

  if (!agent.enabled) {
    return {
      allowed: false,
      reason: `Agent '${agentId}' is currently disabled in Six 686 policy registry.`,
    };
  }

  if (!agent.capabilities.includes("*")) {
    const hasCapability = agent.capabilities.some(
      (cap) => cap === capability || capability.startsWith(`${cap}:`)
    );
    if (!hasCapability) {
      return {
        allowed: false,
        reason: `Agent '${agentId}' lacks the required capability: '${capability}'.`,
      };
    }
  }

  if (riskValue(riskLevel) > riskValue(agent.maxRiskLevel)) {
    return {
      allowed: false,
      reason: `Action risk level (${riskLevel}) exceeds maximum authorized risk authority (${agent.maxRiskLevel}) for agent '${agentId}'.`,
    };
  }

  return {
    allowed: true,
    reason: `Agent identity '${agentId}' verified and authorized for capability '${capability}'.`,
  };
}

export function registerDefaultAgents() {
  registerAgent({
    agentId: "damoneward38@gmail.com",
    name: "Damon Ward (Root Administrator)",
    enabled: true,
    capabilities: [
      "*",
      "admin",
      "override",
      "killswitch",
      "governance-signoff",
      "enclave-attestation",
      "compliance-audit",
    ],
    maxRiskLevel: "CRITICAL",
    description: "Root Security Officer & HSM Administrator (damoneward38@gmail.com) with full discretionary governance authority.",
  });

  registerAgent({
    agentId: "neural-core",
    name: "Neural Core Engine (Nero-4.0)",
    enabled: true,
    capabilities: [
      "*",
      "inference-isolation",
      "heuristic-scan",
      "deploy-production",
      "system-telemetry",
      "model-arbitration",
    ],
    maxRiskLevel: "HIGH",
    description: "Core intelligence and safety arbitration engine for Magen-Raki.",
  });

  registerAgent({
    agentId: "sapphire",
    name: "Sapphire Diagnostic & Repair",
    enabled: true,
    capabilities: [
      "repository-repair",
      "diagnostic",
      "read",
      "write",
      "git",
      "file-ops",
      "code-patch",
    ],
    maxRiskLevel: "HIGH",
    description: "Autonomous codebase repair, diagnostics, and git operations orchestrator.",
  });

  registerAgent({
    agentId: "openclaw",
    name: "OpenClaw Pipeline & Automation",
    enabled: true,
    capabilities: [
      "pipeline-run",
      "test-runner",
      "benchmark",
      "code-generate",
      "execute",
      "read",
    ],
    maxRiskLevel: "MEDIUM",
    description: "Automated workflow pipelines, test runner, and continuous integration builder.",
  });
}
