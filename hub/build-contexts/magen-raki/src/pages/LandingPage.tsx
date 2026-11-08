import React, { useState, useEffect } from 'react';
import {
  Shield,
  Cpu,
  Lock,
  Activity,
  Zap,
  ArrowRight,
  ShieldCheck,
  Radio,
  Terminal,
  Database,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Layers,
  Sparkles,
  Mic
} from 'lucide-react';
import { PageTab } from '../types';

interface LandingPageProps {
  setActiveTab: (tab: PageTab) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActiveTab }) => {
  // Live threat interception feed simulator
  const [threatEvents, setThreatEvents] = useState([
    {
      id: 1,
      type: 'Prompt Injection (Direct Override)',
      model: 'GPT-4o-Enterprise',
      action: 'BLOCKED_BY_SIX686',
      time: '0.4s ago',
      risk: 94,
    },
    {
      id: 2,
      type: 'System Prompt Extraction Probe',
      model: 'Claude-3.7-Sonnet',
      action: 'ISOLATED_AND_ZEROED',
      time: '1.2s ago',
      risk: 88,
    },
    {
      id: 3,
      type: 'Poisoned RAG Delimiter Payload',
      model: 'Llama-3.3-70B',
      action: 'SANITIZED_BY_NERO4',
      time: '2.8s ago',
      risk: 62,
    },
    {
      id: 4,
      type: 'Side-Channel Timing Vector Probe',
      model: 'Gemini-3.7-Flash',
      action: 'JITTER_DAMPENED',
      time: '3.6s ago',
      risk: 76,
    },
  ]);

  const [threatCount, setThreatCount] = useState(849312);

  useEffect(() => {
    const interval = setInterval(() => {
      setThreatCount((prev) => prev + Math.floor(Math.random() * 3) + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0a0a14] bg-immersive overflow-hidden text-slate-200">
      {/* Background Dot Pattern Overlay from Immersive UI */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none bg-dot-grid"
        style={{ backgroundSize: '50px 50px' }}
      />

      {/* Main Immersive Hero Section */}
      <section className="relative pt-8 sm:pt-14 pb-20 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[580px]">
          {/* Left Column: Headline & Action Buttons (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Core Engine Active Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-widest font-semibold">
                Core Engine Active: Nero-4.0
              </span>
            </div>

            {/* Immersive Display Headline */}
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[0.95] tracking-tighter text-white">
              The Sky-Shield <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-blue-500">
                For Global AI.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
              Lock, guard, and audit every inference with the world-first AI-risk chip.
              Powered by the <strong className="text-indigo-400 font-semibold">Neural Core Engine (Nero-4.0)</strong>,
              delivering hardware-level zero-trust isolation for enterprise models.
            </p>

            {/* Immersive CTA Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                id="hero-voice-cta"
                onClick={() => setActiveTab('help')}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:scale-105 transition-all text-sm flex items-center gap-2"
              >
                <Mic className="w-4 h-4 text-white animate-pulse" />
                <span>Talk to Nero-4.0 (Voice Guide)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-governor-cta"
                onClick={() => setActiveTab('governor')}
                className="px-8 py-4 bg-slate-900 border border-indigo-500/50 hover:bg-slate-800 text-white font-bold rounded-xl hover:scale-105 transition-all text-sm flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-indigo-400" />
                <span>Six 686 Governor</span>
              </button>

              <button
                id="hero-sandbox-cta"
                onClick={() => setActiveTab('demo')}
                className="px-8 py-4 border border-slate-700 hover:border-slate-500 font-bold rounded-xl hover:bg-white/5 transition-all text-sm text-slate-200 flex items-center gap-2"
              >
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>Threat Sandbox</span>
              </button>
            </div>
          </div>

          {/* Right Column: Concentric Glowing Silicon Shield Rings Centerpiece (5 cols) */}
          <div className="lg:col-span-5 flex justify-center items-center relative py-6">
            <div className="w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] relative flex items-center justify-center">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-pulse" />
              {/* Mid ring */}
              <div className="absolute inset-6 sm:inset-10 rounded-full border border-indigo-500/40" />
              {/* Inner backdrop ring with backdrop-blur */}
              <div className="absolute inset-16 sm:inset-20 rounded-full bg-indigo-500/5 backdrop-blur-sm border border-indigo-500/60 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-indigo-300 mb-2 font-mono">
                    Neural Kernel Layer
                  </p>

                  {/* 3D Rotated Diamond Silicon HSM Chip */}
                  <div className="w-28 h-28 sm:w-32 sm:h-32 bg-indigo-600 rounded-3xl rotate-45 flex items-center justify-center shadow-[0_0_60px_rgba(79,70,229,0.6)] border border-white/20 relative overflow-hidden group hover:scale-105 transition-transform">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent pointer-events-none" />
                    <div className="-rotate-45 text-center">
                      <span className="block text-lg sm:text-xl font-black text-white leading-none tracking-tight">
                        SIX
                      </span>
                      <span className="block text-2xl sm:text-3xl font-black text-white leading-none tracking-tight">
                        686
                      </span>
                      <span className="block text-[8px] uppercase font-bold text-indigo-200 mt-1 tracking-wider">
                        Secure Chip
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Shield Status Badge */}
              <div className="absolute top-0 right-0 sm:right-4 bg-black/60 border border-white/10 p-3 rounded-xl backdrop-blur-md shadow-xl">
                <p className="text-[8px] text-indigo-400 uppercase font-bold mb-1 tracking-wider font-mono">
                  Shield Status
                </p>
                <div className="flex items-center gap-2 font-mono">
                  <div className="h-1.5 w-14 bg-indigo-500/30 rounded-full overflow-hidden">
                    <div className="h-full w-4/5 bg-indigo-400 rounded-full" />
                  </div>
                  <span className="text-[10px] font-bold text-white">98.2%</span>
                </div>
              </div>

              {/* Floating Latency Badge */}
              <div className="absolute bottom-2 left-0 sm:left-4 bg-black/60 border border-white/10 px-3 py-2 rounded-xl backdrop-blur-md shadow-xl font-mono text-[10px] text-slate-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Nero-4.0: &lt; 2.4 ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Hardware Telemetry Banner */}
        <div className="mt-12 max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-black/40 border border-white/10 shadow-2xl backdrop-blur-md">
          <div className="p-3 border-r border-white/10 last:border-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Scoring Latency</span>
            </div>
            <div className="text-xl font-black font-mono text-white">
              2.4 <span className="text-xs font-normal text-indigo-300">ms / eval</span>
            </div>
          </div>

          <div className="p-3 border-r border-white/10 last:border-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Injections Blocked</span>
            </div>
            <div className="text-xl font-black font-mono text-emerald-400">
              {threatCount.toLocaleString()}
            </div>
          </div>

          <div className="p-3 border-r border-white/10 last:border-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Six 686 Die Temp</span>
            </div>
            <div className="text-xl font-black font-mono text-white">
              41.8 <span className="text-xs font-normal text-slate-400">°C</span>
            </div>
          </div>

          <div className="p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span>Ledger Blocks</span>
            </div>
            <div className="text-xl font-black font-mono text-sky-300">
              4,192,084 <span className="text-xs font-normal text-slate-400">HMAC</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Three Structural Pillars of Sky-Shield */}
      <section className="py-16 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto border-t border-white/10 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold tracking-[0.3em] text-indigo-400 uppercase mb-2 font-mono">
            Uncompromising Defense Architecture
          </h2>
          <p className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built from Silicon to Software for Absolute AI Assurance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="p-7 rounded-2xl bg-black/40 border border-white/10 hover:border-indigo-500/40 transition-all backdrop-blur-md group hover:shadow-[0_0_30px_rgba(79,70,229,0.15)]">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              <Cpu className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
              Neural Core Engine (Nero-4.0)
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              The trusted operating kernel that intercepts, vector-scores, and tokenizes every model prompt in sub-millisecond hardware enclaves before model weights execute.
            </p>
            <ul className="space-y-2 text-xs text-slate-300 font-mono">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                Zero-day injection syntactic dissection
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                Ephemeral model memory sanitization
              </li>
            </ul>
          </div>

          {/* Pillar 2 */}
          <div className="p-7 rounded-2xl bg-black/40 border border-white/10 hover:border-indigo-500/40 transition-all backdrop-blur-md group hover:shadow-[0_0_30px_rgba(79,70,229,0.15)]">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
              Six 686 AI-Risk Chip
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              A dedicated physical Hardware Security Module (HSM) silicon appliance. Houses cryptographic fuse arrays and matrix co-processors that physically prevent model weight scraping.
            </p>
            <ul className="space-y-2 text-xs text-slate-300 font-mono">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                FIPS 140-3 Level 4 physical tamper-resistance
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                Electromagnetic side-channel dampening
              </li>
            </ul>
          </div>

          {/* Pillar 3 */}
          <div className="p-7 rounded-2xl bg-black/40 border border-white/10 hover:border-indigo-500/40 transition-all backdrop-blur-md group hover:shadow-[0_0_30px_rgba(79,70,229,0.15)]">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              <Database className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
              Immutable Cryptographic Ledger
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              Every token stream, safety risk evaluation, and hardware attestation signature is sealed in an append-only HMAC chain for auditability and compliance.
            </p>
            <ul className="space-y-2 text-xs text-slate-300 font-mono">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                Non-repudiable proof of clean inference
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                Instant compliance export for SEC/EU AI Act
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Live Threat Interception Stream */}
      <section className="py-16 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto border-t border-white/10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-950/80 text-indigo-300 text-xs font-mono border border-indigo-500/30">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>LIVE DEFENSE TELEMETRY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Real-Time Threat Interception Stream
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Watch as Magen-Raki's Neural Core Engine (Nero-4.0) isolates inbound adversarial injections, credential theft probes, and model inversion attempts before they reach target LLMs.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setActiveTab('demo')}
                className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider font-mono"
              >
                <span>Test your own adversarial prompts in Sandbox</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-black/60 border border-white/10 p-5 shadow-2xl font-mono text-xs backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-white font-bold">Nero-4.0 Guard Stream</span>
                </div>
                <span className="text-[11px] text-slate-500">Six 686 Hardware Guard #419</span>
              </div>

              <div className="divide-y divide-white/5 mt-2 space-y-2">
                {threatEvents.map((evt) => (
                  <div key={evt.id} className="pt-2.5 flex items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-slate-200 font-medium">{evt.type}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Target: <span className="text-indigo-300">{evt.model}</span> • {evt.time}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950/90 text-indigo-300 border border-indigo-700/50">
                        {evt.action}
                      </span>
                      <div className="text-[10px] text-rose-400 mt-0.5 font-bold">
                        Risk Score: {evt.risk}/100
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Competitive Advantage & Formula Section */}
      <section className="py-14 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto space-y-10 relative z-10 border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono tracking-wider uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>The Proven Competitive Formula</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Autonomous Agents Governed by Mathematical Proof
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Neural Core and Sapphire do not just write code — they are governed by the Six 686 chip, verified by the 12-check Readiness Gate, deployed to isolated staging with synthetic probes, and logged to an immutable SHA-512 ledger.
          </p>
        </div>

        {/* The Core Enterprise Security Subsystems */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Neuro-Core Voice Guide',
              sub: 'Natural Speech AI Advisor',
              desc: 'Speak questions directly to Nero-4.0 with local Web Speech processing & Six 686 HSM attestation.',
              tab: 'help',
              badge: 'VOICE AI',
              badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
            },
            {
              title: 'Six 686 Governor',
              sub: 'Silicon Risk Enclave',
              desc: 'Sub-millisecond AST risk scoring, policy rules, and emergency hardware kill switch circuit.',
              tab: 'governor',
              badge: 'ARMED',
              badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
            },
            {
              title: 'Threat Intelligence Radar',
              sub: 'Live Vulnerability Vault',
              desc: 'Adversarial jailbreak detection, prompt injection quarantine, and MITRE ATLAS matrix.',
              tab: 'threats',
              badge: 'LIVE RADAR',
              badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
            },
            {
              title: 'Compliance Vault',
              sub: 'Regulatory Seal Generator',
              desc: 'SOC 2 Type II, ISO 27001, HIPAA, and EU AI Act verifiable cryptographic evidence bundles.',
              tab: 'compliance',
              badge: 'SOC 2 READY',
              badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
            },
            {
              title: 'Model Marketplace',
              sub: 'Silicon Verified Registry',
              desc: 'Browse, publish, validate, and benchmark high-assurance models with hardware attestation seals.',
              tab: 'marketplace',
              badge: 'MARKETPLACE',
              badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
            },
            {
              title: 'Hardware Telemetry',
              sub: 'Warm-Cache & DMA Monitor',
              desc: 'PCIe DMA latency gauges, temperature monitoring, and sub-0.2ms warm-cache vector routing.',
              tab: 'telemetry',
              badge: '0.4μs LATENCY',
              badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
            },
            {
              title: 'Readiness Gate',
              sub: '12-Point Gate Matrix',
              desc: 'Exhaustive verification across build, environment, security, and runtime assertions.',
              tab: 'readiness',
              badge: '12/12 CHECKS',
              badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
            },
            {
              title: 'Autonomous CI/CD',
              sub: '9-Stage Pipeline & 8-Step Repair',
              desc: 'Deterministic staging deployment, synthetic probe validation, and automated rollback protocols.',
              tab: 'pipeline',
              badge: 'AUTONOMOUS',
              badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
            },
            {
              title: 'Threat Sandbox',
              sub: 'Live Interactive Playground',
              desc: 'Execute real-time injection attempts, verify AST delimiters, and test protected inference.',
              tab: 'demo',
              badge: 'INTERACTIVE',
              badgeColor: 'text-slate-300 bg-slate-800 border-slate-700',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => setActiveTab(item.tab as any)}
              className="group cursor-pointer rounded-2xl p-5 bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="text-[10px] font-mono uppercase text-indigo-400 tracking-wider">{item.sub}</div>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>
                <div className="text-base font-bold text-white mt-1 group-hover:text-indigo-300 transition-colors">{item.title}</div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-indigo-400 font-semibold">
                <span>Access Subsystem</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* Readiness Gate Banner Callout */}
        <div className="rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-emerald-950/40 border border-indigo-500/30 p-8 sm:p-10 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Zero False-Done Guarantee</span>
            </div>
            <h3 className="text-2xl font-bold text-white">
              Eliminate White Screens, Broken Routes & Missing Deps
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              No AI should declare a repository fixed simply because it changed lines of code. 
              The Magen-Raki Readiness Gate automatically verifies dependencies, TypeScript zero-errors, unit tests, routes, entry page DOM root, and staging health before granting approval.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={() => setActiveTab('readiness')}
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Open Readiness Gate (12 Checks)</span>
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <span>View CI/CD Pipeline</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Comparison: Standard API vs Magen-Raki Shield */}
      <section className="py-16 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto border-t border-white/10 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold tracking-[0.3em] text-indigo-400 uppercase mb-2 font-mono">
            Vulnerability Elimination
          </h2>
          <p className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Unprotected Inference vs. Magen-Raki Protected Inference
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Legacy / Unprotected */}
          <div className="p-7 rounded-2xl bg-black/30 border border-rose-900/30 space-y-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              <span>Standard Enterprise LLM API (Unprotected)</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Vulnerable to indirect prompt injection through search results or poisoned RAG files.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>No hardware-level model weight protection; host memory scraping remains an insider risk.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Audit logs are mutable and stored in generic databases with no cryptographic sealing.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Residual tokens linger in GPU memory across multi-tenant sessions.</span>
              </li>
            </ul>
          </div>

          {/* Magen-Raki Protected */}
          <div className="p-7 rounded-2xl bg-black/60 border border-indigo-500/40 space-y-4 shadow-[0_0_40px_rgba(79,70,229,0.2)] backdrop-blur-md">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
              <ShieldCheck className="w-5 h-5" />
              <span>Magen-Rakiʿ + Neural Core (Nero-4.0)</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-200">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Hardware Enclave Isolation:</strong> Prompts tokenized within Six 686 confidential boundaries.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Instant Memory Sanitization:</strong> High-bandwidth memory is purged in a single clock cycle.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Cryptographic Attestation:</strong> Every response accompanied by a tamper-proof HMAC verification receipt.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Side-Channel Shielding:</strong> Power jitter injection blocks electromagnetic timing eavesdropping.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-14 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto border-t border-white/10 text-center relative z-10">
        <div className="p-8 sm:p-14 rounded-3xl bg-black/50 border border-white/10 relative overflow-hidden backdrop-blur-xl shadow-[0_0_50px_rgba(79,70,229,0.2)]">
          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Deploy the Sky-Shield over your AI models today
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Available as a cloud microservice API, high-throughput PCIe card with Six 686 silicon, or an air-gapped sovereign appliance.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setActiveTab('contact')}
                className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all hover:scale-105"
              >
                Schedule Architecture Consultation
              </button>
              <button
                onClick={() => setActiveTab('features')}
                className="px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
              >
                Explore 13 Defense Modules
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

