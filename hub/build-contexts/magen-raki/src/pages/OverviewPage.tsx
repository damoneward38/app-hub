import React, { useState } from 'react';
import {
  Cpu,
  Shield,
  Lock,
  Layers,
  Database,
  Terminal,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  KeyRound,
  Fingerprint,
  Zap,
  Activity,
  AlertOctagon,
  HardDrive
} from 'lucide-react';
import { PageTab } from '../types';

interface OverviewPageProps {
  setActiveTab: (tab: PageTab) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ setActiveTab }) => {
  const [selectedNode, setSelectedNode] = useState<'ingress' | 'nero' | 'chip' | 'model' | 'ledger'>('nero');

  const nodeDetails = {
    ingress: {
      title: '1. Inbound Host Interface & Prompt Ingestion',
      category: 'Perimeter Layer',
      badge: 'Zero-Trust Gateway',
      description: 'Incoming user prompts, RAG documents, and API function payloads enter the untrusted perimeter from client applications or external orchestrators.',
      specs: [
        'TLS 1.3 End-to-End Encrypted Tunnel',
        'Early delimiter normalization & token sanitization',
        'Payload size and context buffer rate-limiting',
        'Origin identity cryptographic verification'
      ],
      hardwareRole: 'Routes payload directly into memory-isolated Six 686 PCIe DMA channel without OS caching.',
      codeSnippet: `// Host Ingress Token Stream Handshake
const ingressPacket = {
  originHash: "0x892a...f41b",
  tlsCertificate: "FIPS-Validated-ECC384",
  dmaTarget: "SIX686_ISOLATED_RING_0",
  rawTokens: 412
};`
    },
    nero: {
      title: '2. Neural Core Engine (Nero-4.0) Kernel',
      category: 'Inference Security Engine',
      badge: 'Heart of Magen-Raki',
      description: 'Magen-Raki is built on the Neural Core Engine (Nero-4.0), the trusted kernel that protects every model launch. Nero-4.0 performs deep semantic syntactic deconstruction, evaluates multi-vector threat matrices in <2.4ms, and coordinates hardware attestation.',
      specs: [
        'Sub-millisecond parallel neural vector evaluation',
        'Real-time syntactic delimiter manipulation armor',
        'Dynamic attention anomaly & drift detection',
        'Coordinated memory zeroing upon token stream completion'
      ],
      hardwareRole: 'Executes within verified hardware enclave, invoking Six 686 co-processors for high-speed risk scoring.',
      codeSnippet: `// Nero-4.0 Kernel Evaluation Vector
const neroKernelDecision = await NeroCore.evaluatePromptVector({
  stream: rawTokenStream,
  securityLevel: "STRICT_ENCLAVE",
  heuristicFilters: ["JAILBREAK", "EXFILTRATION", "SIDE_CHANNEL"]
});
// Result: { riskScore: 4, decision: "PASS_TO_SIX686" }`
    },
    chip: {
      title: '3. Six 686 AI-Risk Hardware Security Module (HSM)',
      category: 'Physical Silicon Boundary',
      badge: 'FIPS 140-3 Level 4',
      description: 'The physical hardware boundary of the Sky-Shield. Houses factory-burned private cryptographic keys, matrix co-processors, electromagnetic side-channel noise injectors, and one-cycle RAM purge circuits.',
      specs: [
        'Dedicated matrix risk co-processor (10,000+ vector paths/sec)',
        'Physical anti-tamper envelope with automatic key self-destruct',
        'Power-consumption jitter injection (blocks side-channel timing leaks)',
        'Hardware fuse array preventing unauthorized firmware flash'
      ],
      hardwareRole: 'Guarantees models cannot be extracted even by an adversary with root access to the physical host server.',
      codeSnippet: `// Six 686 Silicon HSM Attestation Register
const hsmProof = Six686_HSM.generateAttestationSignature({
  sessionNonce: "8dfa190b21",
  enclaveAddress: "0x7F91_ENCLAVE_ZERO",
  fuseArrayStatus: "FACTORY_LOCKED_SECURE"
});`
    },
    model: {
      title: '4. Foundation Model Execution (Isolated Enclave)',
      category: 'Compute Isolation Zone',
      badge: 'Confidential Computing',
      description: 'The foundation model (Gemini 3.7 Flash, Claude, Llama, custom enterprise weights) executes in an ephemeral enclave. Model weights are watermarked and protected by AES-256 bus encryption.',
      specs: [
        'Zero host-OS memory visibility into neural weights',
        'High-Bandwidth Memory (HBM) hardware encryption',
        'Dynamic token generation monitoring for output leaks',
        'Automated zeroing of GPU cache upon stream conclusion'
      ],
      hardwareRole: 'Six 686 DMA controller cuts off memory access lines the microsecond inference concludes.',
      codeSnippet: `// Enclave Model Weight Verification
const weightAttestation = Enclave.verifyModelFingerprint({
  modelTag: "Foundation-LLM-v4",
  watermarkHash: "0x9812f...ee10",
  hbmEncrypted: true
});`
    },
    ledger: {
      title: '5. Tamper-Proof Cryptographic Ledger',
      category: 'Governance & Compliance',
      badge: 'Append-Only HMAC-SHA256',
      description: 'Every inference run produces a signed cryptographic receipt containing prompt hash, safety risk score, latency metrics, and hardware attestation. Stored in a monotonic immutable ledger.',
      specs: [
        'Monotonic hardware counters prevent historical rollback',
        'Non-repudiable audit receipts for EU AI Act & SEC compliance',
        'Deterministic verification keys for external compliance auditors',
        'Sub-millisecond signature generation overhead (<0.5ms)'
      ],
      hardwareRole: 'Six 686 internal secure storage signs each block with private on-die key.',
      codeSnippet: `// Immutable Audit Record Block
const ledgerReceipt = Ledger.sealBlock({
  blockIndex: 4192084,
  promptHash: "sha256:7f91a...",
  riskScore: 6,
  decision: "VERIFIED_SECURE",
  attestationSig: "0x4b891...92a1"
});`
    }
  };

  const activeData = nodeDetails[selectedNode];

  return (
    <div className="min-h-screen bg-[#0a0a14] bg-immersive py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 text-slate-200">
      {/* Overview Header Banner */}
      <div className="text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>SYSTEM ARCHITECTURE SPECIFICATION</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          The Sky-Shield Architectural Stack
        </h1>
        <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-3xl mx-auto">
          Magen-Raki is built on the <strong className="text-indigo-400 font-semibold">Neural Core Engine (Nero-4.0)</strong>, the trusted kernel that protects every model launch. Combined with the dedicated <strong className="text-indigo-300 font-semibold">Six 686 hardware security chip</strong>, it creates an impenetrable boundary around enterprise generative AI.
        </p>
      </div>

      {/* Interactive Architecture Flow Diagram */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <span>Interactive Pipeline Inspector (Click any node to inspect internals)</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Status: <span className="text-emerald-400">All 5 Subsystems Armed</span>
          </span>
        </div>

        {/* The 5 Pipeline Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Node 1: Ingress */}
          <button
            onClick={() => setSelectedNode('ingress')}
            className={`p-4 rounded-xl text-left transition-all border ${
              selectedNode === 'ingress'
                ? 'bg-indigo-950/80 border-indigo-500 shadow-lg shadow-indigo-950 text-white'
                : 'bg-black/40 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-black/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-indigo-400 font-bold">STAGE 01</span>
              <Terminal className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-100">Prompt Ingress</div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">TLS 1.3 & Delimiter Gate</div>
          </button>

          {/* Node 2: Nero-4.0 Core */}
          <button
            onClick={() => setSelectedNode('nero')}
            className={`p-4 rounded-xl text-left transition-all border relative ${
              selectedNode === 'nero'
                ? 'bg-indigo-950/80 border-indigo-400 shadow-xl shadow-indigo-950 text-white ring-1 ring-indigo-500/50'
                : 'bg-black/40 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-black/60'
            }`}
          >
            <div className="absolute -top-2.5 right-2 px-1.5 py-0.2 rounded bg-indigo-600 text-white text-[9px] font-bold uppercase shadow-[0_0_10px_rgba(79,70,229,0.5)]">
              Core Engine
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-indigo-400 font-bold">STAGE 02</span>
              <Cpu className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="font-bold text-xs text-slate-100">Neural Core (Nero-4.0)</div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">Zero-Trust Kernel Eval</div>
          </button>

          {/* Node 3: Six 686 HSM */}
          <button
            onClick={() => setSelectedNode('chip')}
            className={`p-4 rounded-xl text-left transition-all border ${
              selectedNode === 'chip'
                ? 'bg-indigo-950/80 border-indigo-500 shadow-lg shadow-indigo-950 text-white'
                : 'bg-black/40 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-black/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-indigo-400 font-bold">STAGE 03</span>
              <Shield className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="font-bold text-xs text-slate-100">Six 686 Hardware Chip</div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">FIPS 140-3 HSM Boundary</div>
          </button>

          {/* Node 4: Model Execution */}
          <button
            onClick={() => setSelectedNode('model')}
            className={`p-4 rounded-xl text-left transition-all border ${
              selectedNode === 'model'
                ? 'bg-indigo-950/80 border-indigo-500 shadow-lg shadow-indigo-950 text-white'
                : 'bg-black/40 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-black/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-indigo-400 font-bold">STAGE 04</span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="font-bold text-xs text-slate-100">Model Execution</div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">HBM Enclave Isolation</div>
          </button>

          {/* Node 5: Tamper-Proof Ledger */}
          <button
            onClick={() => setSelectedNode('ledger')}
            className={`p-4 rounded-xl text-left transition-all border ${
              selectedNode === 'ledger'
                ? 'bg-indigo-950/80 border-indigo-500 shadow-lg shadow-indigo-950 text-white'
                : 'bg-black/40 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-black/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-indigo-400 font-bold">STAGE 05</span>
              <Database className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="font-bold text-xs text-slate-100">Tamper-Proof Ledger</div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">HMAC-SHA256 Seal</div>
          </button>
        </div>

        {/* Selected Node Deep Dive Inspector */}
        <div className="p-6 sm:p-8 rounded-2xl bg-black/60 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-800">
                  {activeData.category}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                  {activeData.badge}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">{activeData.title}</h3>
            </div>

            <button
              onClick={() => setActiveTab('demo')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all self-start sm:self-auto shadow-[0_0_15px_rgba(79,70,229,0.4)]"
            >
              <span>Test in Sandbox</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed">{activeData.description}</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Technical Specifications */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
                Hardware & Kernel Guarantees
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {activeData.specs.map((spec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2 p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-xs text-slate-300">
                <span className="font-semibold text-indigo-300">Silicon Function: </span>
                {activeData.hardwareRole}
              </div>
            </div>

            {/* Code / Cryptographic Proof Snippet */}
            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 text-[11px] px-1">
                <span>Kernel Telemetry Inspector</span>
                <span className="text-emerald-400">Enclave: ACTIVE</span>
              </div>
              <pre className="p-4 rounded-xl bg-black/80 border border-white/10 text-indigo-200 overflow-x-auto text-[11px] leading-relaxed">
                {activeData.codeSnippet}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Deep-Dive: The Six 686 Hardware Secret */}
      <section className="p-8 rounded-3xl bg-black/50 border border-white/10 space-y-6 backdrop-blur-xl shadow-[0_0_40px_rgba(79,70,229,0.15)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.4)]">
            <HardDrive className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              The Six 686 Hardware Risk Secret: Hardware-Enforced AI Protection
            </h3>
            <p className="text-xs text-slate-400">
              Why software-only guardrails fail against advanced jailbreaks, and how physical silicon solves it.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
            <div className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Physical Fuse Security</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Once burned during manufacturing, Six 686 cryptographic fuses permanently lock down kernel instruction memory. Even malicious host firmware cannot bypass verification.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
            <div className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Single-Clock RAM Purge</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Upon token emission, high-bandwidth memory capacitors are instantly drained. Residual token embeddings are eradicated with zero persistence between multi-tenant queries.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
            <div className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Fingerprint className="w-4 h-4 text-sky-400" />
              <span>Hardware Model Fingerprinting</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Tensor weights are watermarked at the silicon layer. Unauthorized export or weight extraction across PCIe buses renders the memory block invalid and halts compute.
            </p>
          </div>
        </div>

        {/* Action Gate Links */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Governed by <strong className="text-white">Nero-4.0 + Six 686 + Readiness Gate</strong>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('readiness')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <span>Magen-Raki Readiness Gate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>Competitive Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
