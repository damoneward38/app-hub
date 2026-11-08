import React, { useState } from 'react';
import {
  Layers,
  Cpu,
  Shield,
  Activity,
  Code2,
  Lock,
  Terminal,
  FileCheck2,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ArrowDown,
  Info,
  Server,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export type TechStatus =
  | 'Existing Technology'
  | 'Integrated Technology'
  | 'Capability Layer'
  | 'Planned Integration'
  | 'Future Expansion';

interface ArchitectureNode {
  id: string;
  level: number;
  title: string;
  subtitle: string;
  techStatus: TechStatus;
  description: string;
  subsystems: string[];
  dataflowIn: string;
  dataflowOut: string;
  codebaseOrigin: string;
  icon: any;
}

export const VisualArchitectureView: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('neural_core');

  const ARCHITECTURE_HIERARCHY: ArchitectureNode[] = [
    {
      id: 'local_ai',
      level: 1,
      title: 'LOCAL AI / OLLAMA ENGINE',
      subtitle: 'Localhost:11434 Zero-Egress Foundation',
      techStatus: 'Integrated Technology',
      description:
        'Local intelligence substrate executing open-weights models (Qwen2.5, Llama 3, Mistral) on local developer hardware or on-prem air-gapped GPU servers. Ensures zero IP leakage.',
      subsystems: ['Ollama HTTP API', 'vLLM Local Server', 'Model Weights Storage', 'Local Context Cache'],
      dataflowIn: 'User Prompts, System Tasks, Code Snippets',
      dataflowOut: 'Raw Token Generation, Reasoning Traces, Function Call Invocations',
      codebaseOrigin: 'Localhost Engine / Ollama Daemon',
      icon: Cpu,
    },
    {
      id: 'neural_core',
      level: 2,
      title: 'NEURAL CORE ORCHESTRATION POWERHOUSE',
      subtitle: 'Permanent Underlying Intelligence & Workflow Engine',
      techStatus: 'Existing Technology',
      description:
        'The permanent underlying powerhouse. Coordinates intent discovery, DAG task planning, specialist delegation, continuous scheduling, long-term vector memory, and closed-loop verification.',
      subsystems: ['Task DAG Compiler', 'Continuity Scheduler', 'Vector Memory Vault', 'Dynamic Plugin Engine'],
      dataflowIn: 'Local AI Tokens, Business Intents, System Events',
      dataflowOut: 'Delegated Tasks, Specialist Allocations, Sandboxed Execution Payloads',
      codebaseOrigin: 'Sapphire / MatrixBroker (301 Python files, 140 JS files)',
      icon: Activity,
    },
    {
      id: 'sela_ezhkar',
      level: 3,
      title: 'SELA & EZHKAR CAPABILITY LAYERS',
      subtitle: 'Operational Inspection, Diagnostics & Sandbox Isolation',
      techStatus: 'Capability Layer',
      description:
        'SELA handles deep system inspection, website diagnostics, credential file inspection, and AST code transformations. EZHKAR enforces strict Firecracker micro-VM isolation boundaries and closed-loop verification.',
      subsystems: ['SELA AST Code Transformer', 'Zero-Knowledge File Reader', 'EZHKAR Firecracker Sandboxes', 'Egress Firewall Rules'],
      dataflowIn: 'Delegated Tasks, Codebase Repositories, Ingress Packets',
      dataflowOut: 'Sanitized AST Nodes, Taint Graphs, Micro-VM Execution Contracts',
      codebaseOrigin: 'SELA Diagnostic Suite + EZHKAR Isolation Enclave',
      icon: Code2,
    },
    {
      id: 'specialist_cores',
      level: 4,
      title: '200 SPECIALIZED AI CORES',
      subtitle: '100 Business/Creator Cores + 100 Cybersecurity Cores',
      techStatus: 'Integrated Technology',
      description:
        'Divided into 10 groups of 20 parallel micro-VM agents. Groups A–E run cybersecurity (50 Finders + 50 Fixers). Groups F–J run business automation with a ≥11/20 majority vote quorum.',
      subsystems: ['50 Security Finders (CVE, WAF, Sandbox)', '50 Security Fixers (Patch, Policy)', '100 Creator Cores (Media, DRM, Billing, CDN)', 'Consensus Ballot Distiller'],
      dataflowIn: 'Sandboxed Micro-VM Contexts, Domain Parameters',
      dataflowOut: 'Parallel Execution Traces, 20-Agent Quorum Ballots, State Transitions',
      codebaseOrigin: 'Neural Core 200 Swarm Architecture',
      icon: Layers,
    },
    {
      id: 'open_jev',
      level: 5,
      title: 'JAVMAIN / OPEN-JEV DECISION ENGINE',
      subtitle: 'Research, Reasoning, Statutory Evaluation & Invariants',
      techStatus: 'Existing Technology',
      description:
        'Qwen-based decision model research and evaluation framework. Executes multi-step statutory reasoning, legal precedent validation (case_browser, case_citation), mailroom compliance audits, and heuristic triage.',
      subsystems: ['case_browser (Precedent Search)', 'case_citation (Bluebook Invariants)', 'case_reasoning (Syllogisms)', 'mailroom_audit (FINRA/SEC)', 'cyber_healer (AST Repair)'],
      dataflowIn: 'Complex Decision Prompts, Statutory Texts, Swarm Ballots',
      dataflowOut: 'Syllogistic Proof Trees, Zero-Hallucination Verified Citations, Consensus Hashes',
      codebaseOrigin: 'Open-Jev / NAMI (235 Python files, 2,582 functions, 15 CLI commands)',
      icon: BookOpen,
    },
    {
      id: 'tempest',
      level: 6,
      title: 'T3MP3ST / TEMPEST OFFENSIVE & DEFENSIVE ARSENAL',
      subtitle: 'Penetration-Testing, AST Taint Analysis & Scoped Security',
      techStatus: 'Existing Technology',
      description:
        'Elite penetration-testing and vulnerability-hunting arsenal spanning 8 domains: Web apps, robotics/embedded CAN bus, EVM smart contracts, cloud IAM, mobile APKs, binary reverse engineering, and MCP tool schemas.',
      subsystems: ['AST Taint Dataflow Engine', 'EVM Bytecode Invariant Fuzzer', 'Cloud IAM Escalation Mapper', 'Frida Mobile Instrumentor', 'Ghidra ROP Chain Synthesizer'],
      dataflowIn: 'Source Code Syntax Trees, Cloud IAM Roles, Contract Bytecode',
      dataflowOut: 'Taint Trace Proofs, Vulnerability Verification Receipts, Scoped Remediation Patches',
      codebaseOrigin: 'T3MP3ST / CyberHealer (107 files, 1,200+ functions, 64 doc pages)',
      icon: Shield,
    },
    {
      id: 'functions_tools',
      level: 7,
      title: 'FUNCTIONS, TOOLS & SERVICE APIS',
      subtitle: '6,805+ Discrete Functions, 247 REST Routes & MCP Tools',
      techStatus: 'Integrated Technology',
      description:
        'Granular operational execution layer exposing 65+ Sapphire assistant tools, 15 Open-Jev CLI binaries, 247 REST API web routes, and Model Context Protocol (MCP) tool schemas for AI model execution.',
      subsystems: ['65+ Sapphire Tools', '15 CLI Binaries', '247 REST API Routes', 'MCP JSON-RPC Tool Schema', 'P2WSH Bitcoin Wallet API'],
      dataflowIn: 'Specialist Invocations, API Requests, CLI Commands',
      dataflowOut: 'Raw Execution Outputs, Media Streams, Multi-Sig Addresses',
      codebaseOrigin: 'Cross-Pillar Functional Library (78 Modules)',
      icon: Terminal,
    },
    {
      id: 'sandboxes_exec',
      level: 8,
      title: 'SANDBOXES & CONTROLLED EXECUTION',
      subtitle: 'Isolated Runtime Micro-VMs & Hardware Security Boundaries',
      techStatus: 'Capability Layer',
      description:
        'All physical executions occur inside ephemeral micro-VM sandboxes with hardware-enforced CPU/memory quotas, read-only root filesystems, and strict egress firewalls.',
      subsystems: ['Firecracker Micro-VM Pool', 'Read-Only Container Mounts', 'Loopback Network Isolation', 'Timeout Watchdog Timers'],
      dataflowIn: 'Tool Payloads, Input Buffers, Environmental Variables',
      dataflowOut: 'Sandbox Exit Codes, Memory Dumps, Standard Output Logs',
      codebaseOrigin: 'EZHKAR Kernel Sandboxing Infrastructure',
      icon: Lock,
    },
    {
      id: 'verification',
      level: 9,
      title: 'CLOSED-LOOP VERIFICATION & AUTONOMOUS REPAIR',
      subtitle: 'Verify → Fix → Repair → Re-Verify → Report Loopback',
      techStatus: 'Integrated Technology',
      description:
        'Automated observation and invariant checking. If verification fails, the system returns to the appropriate earlier stage, investigates the root cause, repairs the flaw, and re-verifies.',
      subsystems: ['Invariant Verification Engine', 'Automated Loopback Router', 'Heuristic Repair Agent', 'Re-Verification Gatekeeper'],
      dataflowIn: 'Sandbox Output Logs, Test Assertions, Expected Invariants',
      dataflowOut: 'Verification Pass/Fail Tokens, Repair Instructions, Final Clearance',
      codebaseOrigin: 'Neural Core Closed-Loop Orchestration Engine',
      icon: CheckCircle2,
    },
    {
      id: 'audit_reporting',
      level: 10,
      title: 'IMMUTABLE AUDIT LEDGER & REPORTING',
      subtitle: 'Cryptographic SHA-256 Chained WORM Compliance Receipts',
      techStatus: 'Integrated Technology',
      description:
        'Every action, vote, tool invocation, and verification receipt is cryptographically chained into an immutable Write-Once-Read-Many (WORM) audit ledger for regulatory examiners (SEC, FDA, DoD).',
      subsystems: ['SHA-256 Merkle Chain', 'WORM Storage Vault', 'Audit Log Exporter (CSV/PDF)', 'Tamper Detection Sentinel'],
      dataflowIn: 'Verified Action Tokens, Cryptographic Signatures, Monotonic Timestamps',
      dataflowOut: 'Immutable Block Receipts, Examiner Compliance Reports, Hash Anchors',
      codebaseOrigin: 'PCA-Grade Audit Ledger Engine',
      icon: FileCheck2,
    },
    {
      id: 'future_hardware',
      level: 11,
      title: 'AIR-GAPPED HARDWARE APPLIANCE & SATELLITE COMMS',
      subtitle: 'Physical SCIF Appliance for Defense & Naval Fleets',
      techStatus: 'Planned Integration',
      description:
        'Co-located 1U/2U physical hardware rack appliance featuring FIPS 140-3 hardware security modules (HSM) and optional tactical radio links for naval vessels and army base enclaves.',
      subsystems: ['FIPS 140-3 Cryptographic HSM', 'Physical Tamper-Switch Mesh', 'Tactical Mesh Data Bus', 'Solar/Battery Standalone Rig'],
      dataflowIn: 'Physical Sensor Feeds, Tactical Radios',
      dataflowOut: 'Encrypted Sovereign Packets, Hardware Key Derivations',
      codebaseOrigin: 'Hardware Engineering Roadmap',
      icon: Server,
    },
  ];

  const activeNode =
    ARCHITECTURE_HIERARCHY.find((n) => n.id === selectedNodeId) || ARCHITECTURE_HIERARCHY[1];

  const getStatusBadge = (status: TechStatus) => {
    switch (status) {
      case 'Existing Technology':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/60';
      case 'Integrated Technology':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60';
      case 'Capability Layer':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-500/60';
      case 'Planned Integration':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/60';
      case 'Future Expansion':
        return 'bg-purple-950/80 text-purple-300 border-purple-500/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-wider">
              <Layers className="w-3 h-3 text-cyan-400" />
              SYSTEM ARCHITECTURE VISUALIZER
            </span>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              FULL-STACK CAPABILITY OPERATING SYSTEM
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            The Three-Pillar & Capability Layers Architecture
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Detailed interactive architectural topology tracing the complete sovereign execution flow from <strong>Local Ollama → Neural Core → Capability Layers → 200 Cores → Open-Jev & Tempest → Sandboxed Execution → Closed-Loop Verification → Immutable Audit Ledger</strong>.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">Existing Tech</span>
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">Integrated Tech</span>
          <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">Capability Layer</span>
          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">Planned Integration</span>
        </div>
      </div>

      {/* Main Interactive Architecture Inspector (2-Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Flow Nodes (6 cols) */}
        <div className="lg:col-span-6 space-y-2">
          <div className="text-xs font-mono uppercase text-slate-400 font-bold mb-3 flex items-center justify-between">
            <span>Execution Hierarchy (Click Node to Inspect):</span>
            <span className="text-cyan-400">11 Layers</span>
          </div>

          <div className="space-y-2">
            {ARCHITECTURE_HIERARCHY.map((node, index) => {
              const Icon = node.icon;
              const isSelected = selectedNodeId === node.id;
              return (
                <React.Fragment key={node.id}>
                  <div
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/40 shadow-lg shadow-cyan-950/30'
                        : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300 group-hover:text-cyan-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-500">#{node.level}</span>
                          <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                            {node.title}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block font-sans line-clamp-1">
                          {node.subtitle}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase shrink-0 ${getStatusBadge(
                        node.techStatus
                      )}`}
                    >
                      {node.techStatus}
                    </span>
                  </div>

                  {index < ARCHITECTURE_HIERARCHY.length - 1 && (
                    <div className="flex justify-center py-0.5">
                      <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Right Column: Node Deep-Dive Dossier (6 cols) */}
        <div className="lg:col-span-6">
          <div className="sticky top-24 p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-6">
            {/* Dossier Header */}
            <div className="pb-4 border-b border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
                  LAYER #{activeNode.level} SPECIFICATION
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${getStatusBadge(
                    activeNode.techStatus
                  )}`}
                >
                  {activeNode.techStatus}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">{activeNode.title}</h2>
              <div className="text-xs text-slate-300 font-mono font-medium">{activeNode.subtitle}</div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
                {activeNode.description}
              </p>
            </div>

            {/* Subsystems List */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block font-bold">
                Underlying Subsystems & Modules:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                {activeNode.subsystems.map((sub, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span className="truncate">{sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dataflow Inputs & Outputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">DATAFLOW INGRESS:</span>
                <span className="text-slate-300 text-[11px] block">{activeNode.dataflowIn}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">DATAFLOW EGRESS:</span>
                <span className="text-cyan-300 text-[11px] block">{activeNode.dataflowOut}</span>
              </div>
            </div>

            {/* Codebase Origin */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">PRIMARY CODEBASE ORIGIN:</span>
                <span className="text-white font-bold text-[11px]">{activeNode.codebaseOrigin}</span>
              </div>
              <span className="text-[10px] px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
                Verifiable Asset
              </span>
            </div>

            {/* Transparency Note */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Architecture status reflects honest technical readiness. Systems marked as "Existing Technology" have operational codebases in the repository. "Planned Integration" represents hardware roadmaps.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
