import React, { useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  Cpu, 
  Terminal, 
  ShieldCheck, 
  Play, 
  CheckCircle2, 
  Clock, 
  Volume2, 
  Activity, 
  RefreshCw, 
  Zap,
  ArrowRight,
  Layers,
  StopCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { API } from '../services/api';
import { speechService } from '../services/speech';

export const UniversalBrainHub: React.FC = () => {
  const [taskInput, setTaskInput] = useState('Build and verify a high-performance streaming API service with auth & rate limiting');
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [collaborationResults, setCollaborationResults] = useState<any>(null);
  const [scanData, setScanData] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  const agents = [
    {
      id: 'sapphire',
      name: 'Sapphire',
      role: 'Lead Architect & Knowledge Synthesis',
      model: 'gemini-3.7-flash',
      icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
      color: 'from-cyan-500 to-blue-600',
      badge: 'ARCHITECT'
    },
    {
      id: 'openclaw',
      name: 'OpenClaw',
      role: 'Systems Engineer & Code Execution',
      model: 'openclaw-v8-sandbox',
      icon: <Terminal className="w-5 h-5 text-emerald-400" />,
      color: 'from-emerald-500 to-teal-600',
      badge: 'SYSTEMS'
    },
    {
      id: 'atlas',
      name: 'Atlas / Neuro',
      role: 'Security, Verification & Performance',
      model: 'neuro-auditor-3.1',
      icon: <ShieldCheck className="w-5 h-5 text-purple-400" />,
      color: 'from-purple-500 to-indigo-600',
      badge: 'SECURITY'
    }
  ];

  const handleStartCollaboration = async () => {
    if (!taskInput.trim() || isCollaborating) return;

    setIsCollaborating(true);
    setCurrentStep(1);
    setCollaborationResults(null);

    // Simulate multi-agent progression
    setTimeout(() => setCurrentStep(2), 1200);
    setTimeout(() => setCurrentStep(3), 2600);

    try {
      const data = await API.collaborate(taskInput);
      setTimeout(() => {
        setCollaborationResults(data);
        setIsCollaborating(false);
        setCurrentStep(4);
        
        // Trigger celebratory confetti on complete collaboration
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Broadcast voice summary
        speechService.speak('Collaboration complete. All 3 agents verified the architecture, code implementation, and security audit.');
      }, 3400);
    } catch (e) {
      setIsCollaborating(false);
    }
  };

  const handleScanWorkspace = async () => {
    setIsScanning(true);
    try {
      const data = await API.scanSite();
      setScanData(data);
    } finally {
      setIsScanning(false);
    }
  };

  const handleVoiceBroadcast = () => {
    if (collaborationResults) {
      const text = collaborationResults.steps.map((s: any) => `${s.role}: ${s.output}`).join('. ');
      speechService.speak(text);
    } else {
      speechService.speak('Sapphire, OpenClaw, and Atlas are standing by in the multi-agent neural hub.');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 py-4 gap-4 overflow-y-auto">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-cyan-500 p-0.5 shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              Universal AI Brain & Multi-Agent Hub
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                3 CONCURRENT AGENTS
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Synchronize Sapphire, OpenClaw, and Atlas on complex multi-stage tasks with unified execution.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleVoiceBroadcast}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Voice Broadcast</span>
          </button>

          <button
            onClick={handleScanWorkspace}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition"
          >
            <Activity className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Live System Scan'}</span>
          </button>
        </div>
      </div>

      {/* 3 Specialist Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {agents.map((ag, idx) => {
          const stepActive = isCollaborating && currentStep === idx + 1;
          const stepDone = isCollaborating && currentStep > idx + 1;
          return (
            <div
              key={ag.id}
              className={`p-4 rounded-2xl border transition-all ${
                stepActive
                  ? 'bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${ag.color} text-white shadow-md`}>
                    {ag.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {ag.name}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">{ag.badge}</span>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 font-mono text-slate-400">
                  {ag.model}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                {ag.role}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Status:</span>
                {stepActive ? (
                  <span className="text-cyan-400 font-bold flex items-center gap-1 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" /> In Action
                  </span>
                ) : stepDone || collaborationResults ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                ) : (
                  <span className="text-slate-400">Ready</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Collaboration Orchestrator Command Box */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
        <label className="block text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">
          Multi-Agent Objective / Prompt:
        </label>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Enter high-level engineering or architecture task..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none font-mono"
          />

          <button
            onClick={handleStartCollaboration}
            disabled={isCollaborating || !taskInput.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 via-indigo-600 to-cyan-500 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-500/20 disabled:opacity-40 transition"
          >
            {isCollaborating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Collaborating...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" />
                <span>COLLABORATE</span>
              </>
            )}
          </button>
        </div>

        {/* Progress Bar while collaborating */}
        {isCollaborating && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-mono text-cyan-300">
              <span>Step {currentStep}/3: {currentStep === 1 ? 'Sapphire Architecting' : currentStep === 2 ? 'OpenClaw Coding' : 'Atlas Verifying'}</span>
              <span>{Math.round((currentStep / 3) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 transition-all duration-700"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Collaboration Results Breakdown */}
      {collaborationResults && (
        <div className="p-4 bg-slate-900 border border-emerald-500/40 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Multi-Agent Synthesis Complete
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Total Tokens: {collaborationResults.totalTokens}
            </span>
          </div>

          <div className="space-y-3">
            {collaborationResults.steps.map((st: any, i: number) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-cyan-400 uppercase">{st.role}</span>
                  <span className="text-slate-500">{st.duration}</span>
                </div>
                <div className="prose prose-invert prose-xs text-slate-300 whitespace-pre-wrap font-mono text-xs">
                  {st.output}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live System Scanner Output */}
      {scanData && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white font-mono uppercase">System Diagnostic Radar</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
              HEALTH SCORE: {scanData.healthScore}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs font-mono">
            {scanData.pages.map((p: any, idx: number) => (
              <div key={idx} className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">{p.name}</span>
                <span className="text-emerald-400">{p.speed}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 text-xs space-y-1">
            <span className="font-bold text-slate-400 font-mono">AI Optimizations:</span>
            {scanData.suggestions.map((s: string, idx: number) => (
              <p key={idx} className="text-slate-300 font-mono text-[11px] flex items-center gap-1.5">
                <span className="text-cyan-400">→</span> {s}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
