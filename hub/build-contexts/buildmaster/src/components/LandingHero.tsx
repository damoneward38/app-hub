import React from 'react';
import { 
  Sparkles, 
  Terminal, 
  Cpu, 
  Database, 
  Rocket, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Activity, 
  Globe,
  Radio
} from 'lucide-react';
import { TabType, SystemMetrics } from '../types';

interface LandingHeroProps {
  setActiveTab: (tab: TabType) => void;
  metrics: SystemMetrics | null;
  openPricing: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ setActiveTab, metrics, openPricing }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 overflow-y-auto">
      {/* Hero Header Section */}
      <div className="relative text-center space-y-6 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span>NEURAL CLOUD WORKSPACE & TERMINAL ENGINE</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Where <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">Sapphire Neural AI</span> meets <span className="text-emerald-400">OpenClaw</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
          An integrated AI development environment powered by Gemini 3.7 Flash, local Ollama zero-tunnel bridge, real cloud sandbox terminal, multi-agent synthesis, and one-click multi-cloud deployment.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setActiveTab('sapphire')}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 transition"
          >
            <Radio className="w-4 h-4" />
            <span>Launch Sapphire AI</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('openclaw')}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm transition"
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>OpenClaw Terminal & IDE</span>
          </button>

          <button
            onClick={() => setActiveTab('brain')}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 border border-purple-500/40 font-bold text-sm transition"
          >
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>3-AI Collaborative Hub</span>
          </button>
        </div>
      </div>

      {/* Live Workspace Telemetry Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-900/80 border border-slate-800 rounded-3xl backdrop-blur-sm shadow-xl">
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>UPTIME</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-base sm:text-lg font-extrabold text-white font-mono">
            {metrics?.uptime || 'Active'}
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">● Online & Healthy</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>CPU LOAD</span>
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-base sm:text-lg font-extrabold text-white font-mono">
            {metrics?.cpuUsage || 22}%
          </div>
          <span className="text-[10px] text-slate-400 font-mono">V8 Optimized</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>RAM USAGE</span>
            <Layers className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-base sm:text-lg font-extrabold text-white font-mono">
            {metrics?.ramUsage.used || 120} MB
          </div>
          <span className="text-[10px] text-slate-400 font-mono">of 512 MB Pool</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>AI ENGINES</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-base sm:text-lg font-extrabold text-white font-mono">
            Gemini + Ollama
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">● 2 Routes Connected</span>
        </div>
      </div>

      {/* 4 Feature Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Sapphire AI Assistant */}
        <div
          onClick={() => setActiveTab('sapphire')}
          className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/60 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Radio className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Open Assistant <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <h3 className="text-lg font-bold text-white mt-4">Sapphire Neural Intelligence</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Multi-turn conversation engine with persistent memory injection, 12-capability grid, live token streaming, and "Hey Sapphire" voice control.
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5 text-[10px] font-mono">
            <span className="px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">Voice Synthesis</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">Token Tracker</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">Markdown Export</span>
          </div>
        </div>

        {/* Card 2: OpenClaw Terminal & IDE */}
        <div
          onClick={() => setActiveTab('openclaw')}
          className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Terminal className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Open Terminal <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <h3 className="text-lg font-bold text-white mt-4">OpenClaw Cloud Shell & IDE</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Integrated sandbox shell runner with real-time command execution, file tree explorer, line-numbered code editor, and git history inspection.
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5 text-[10px] font-mono">
            <span className="px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">Shell Sandbox</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">Code Editor</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">File Tree</span>
          </div>
        </div>

        {/* Card 3: Universal Brain 3-AI Hub */}
        <div
          onClick={() => setActiveTab('brain')}
          className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/60 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono text-purple-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Open Hub <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <h3 className="text-lg font-bold text-white mt-4">Universal Multi-Agent Collaboration</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Orchestrate Sapphire, OpenClaw, and Atlas in parallel on complex objectives with synchronized thought streams and security audits.
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5 text-[10px] font-mono">
            <span className="px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">3 AI Specialists</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">Security Audit</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">Voice Broadcast</span>
          </div>
        </div>

        {/* Card 4: Multi-Cloud CI/CD Pipeline */}
        <div
          onClick={() => setActiveTab('pipeline')}
          className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/60 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Rocket className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono text-rose-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Open Pipeline <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <h3 className="text-lg font-bold text-white mt-4">Continuous Deployment Pipeline</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Release your builds across Vercel Edge, Cloudflare Workers, Cloud Run containers, and AWS with automated verification stages.
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5 text-[10px] font-mono">
            <span className="px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">Multi-Cloud</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">Live Logs</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">Zero Downtime</span>
          </div>
        </div>
      </div>
    </div>
  );
};
