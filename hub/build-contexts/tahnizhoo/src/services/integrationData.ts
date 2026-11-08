export type IntegrationState =
  | 'Ready for Backend'
  | 'Backend Connected'
  | 'Demonstration'
  | 'Simulation'
  | 'Specification'
  | 'Verification Required';

export interface SubsystemStatus {
  id: string;
  name: string;
  layer: 'FOUNDATION' | 'ORCHESTRATION' | 'CAPABILITY' | 'EXECUTION' | 'SECURITY' | 'API' | 'AUDIT';
  state: IntegrationState;
  protocol: string;
  details: string;
  notes: string;
}

export const SUBSYSTEM_INTEGRATION_STATUS: SubsystemStatus[] = [
  {
    id: 'subsys-ollama',
    name: 'Local AI / Ollama (localhost:11434)',
    layer: 'FOUNDATION',
    state: 'Backend Connected',
    protocol: 'HTTP JSON REST / Local daemon socket',
    details: 'Configured to bind to local Ollama server running Qwen2.5, Llama 3, or Mistral with latency telemetry.',
    notes: 'Connects to running local Ollama instance on port 11434; falls back gracefully if daemon is offline.',
  },
  {
    id: 'subsys-neural-core',
    name: 'Neural Core Orchestrator Bus',
    layer: 'ORCHESTRATION',
    state: 'Simulation',
    protocol: 'Reactive in-memory state bus with subscriber pattern',
    details: 'Simulates the 12-stage closed-loop operating methodology (Understand → Plan → Find → Fact → Delegate → Execute → Observe → Verify → Fix → Repair → Re-Verify → Report).',
    notes: 'Runs complete workflow logic inside the front-end control plane; ready for Node/Express server integration.',
  },
  {
    id: 'subsys-sela',
    name: 'SELA Capability Layer (Diagnostics & AST)',
    layer: 'CAPABILITY',
    state: 'Simulation',
    protocol: 'AST syntax transformation & file inspection contracts',
    details: 'Simulates website troubleshooting, zero-knowledge credential file scanning, and AST taint dataflow tracking.',
    notes: 'Pre-configured with real test cases; ready to bind to local bash/Python workers.',
  },
  {
    id: 'subsys-ezhkar',
    name: 'EZHKAR Sandboxing & Isolation Bounds',
    layer: 'EXECUTION',
    state: 'Specification',
    protocol: 'Firecracker Micro-VM & Linux Cgroups v2 specifications',
    details: 'Defines memory ceilings, CPU pin rules, read-only root filesystems, and strict network egress drops.',
    notes: 'Complete architecture documented; awaiting hypervisor hook on bare-metal deployment nodes.',
  },
  {
    id: 'subsys-200-cores',
    name: '200 Specialized AI Cores Swarm',
    layer: 'ORCHESTRATION',
    state: 'Simulation',
    protocol: '20-agent micro-VM quorum with majority ≥11/20 ballots',
    details: 'Simulates 100 Business/Creator cores (Groups F–J) and 100 Cybersecurity cores (50 Finders + 50 Fixers, Groups A–E).',
    notes: 'Simulates parallel vote collection and consensus distillation; ready for distributed Celery/Redis queue.',
  },
  {
    id: 'subsys-pca-audit',
    name: 'Immutable PCA-Grade Audit Ledger',
    layer: 'AUDIT',
    state: 'Backend Connected',
    protocol: 'Client-side cryptographic SHA-256 block hash chaining',
    details: 'Computes real cryptographic hashes over task inputs, results, and timestamps, building an immutable tamper-evident chain.',
    notes: 'Live verification algorithm actively verifies block header integrity in the browser.',
  },
  {
    id: 'subsys-rest-api',
    name: '247 Production REST Web Routes',
    layer: 'API',
    state: 'Ready for Backend',
    protocol: 'OpenAPI 3.0 JSON specifications / Express route signatures',
    details: 'Complete endpoints for /api/v1/voice, /api/v1/scheduler, /api/v1/memory, /api/v1/openjev, /api/v1/tempest, and billing.',
    notes: 'Routes and schemas fully documented with sample payloads and cURL recipes; ready for backend binding.',
  },
  {
    id: 'subsys-mcp',
    name: 'Model Context Protocol (MCP) Server',
    layer: 'API',
    state: 'Specification',
    protocol: 'Anthropic & Gemini JSON-RPC 2.0 tool schema',
    details: 'Exposes T3MP3ST, SELA, and Sapphire tools under dual-authorization cryptographic permission tokens.',
    notes: 'Compatible with Claude Desktop, Cursor, and Gemini Studio tooling.',
  },
  {
    id: 'subsys-voice-dsp',
    name: 'Wake-Word & Hardware Audio DSP',
    layer: 'CAPABILITY',
    state: 'Specification',
    protocol: 'Porcupine wake-word / ALSA & PulseAudio channel bus',
    details: 'Low-latency hands-free keyword detection ("Hey Sapphire", "Taḥnīʿ") and multi-channel hardware routing.',
    notes: 'Python runtime contracts documented in TOOLS.md and VOICE_PIPELINE.md.',
  },
  {
    id: 'subsys-zero-egress',
    name: 'Air-Gapped Zero-Egress Enclave',
    layer: 'SECURITY',
    state: 'Verification Required',
    protocol: 'FIPS 140-3 Hardware Cryptography / iptables packet drop',
    details: 'Guarantees zero outbound data leakage for Banks, Law Firms, Defense bases, Naval ships, and FDA trials.',
    notes: 'Requires on-prem physical appliance or isolated VPC deployment with network verification.',
  },
];
