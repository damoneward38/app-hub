import React, { useState } from 'react';
import { Shield, Lock, Cpu, CheckCircle2, ArrowRight, Activity, Terminal, Sparkles } from 'lucide-react';
import { PageTab } from '../types';

interface FooterProps {
  setActiveTab: (tab: PageTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setEmail('');
    }
  };

  return (
    <footer className="w-full border-t border-white/10 bg-black/60 backdrop-blur-xl text-slate-400 text-xs relative z-20">
      {/* 3-Column Micro-Features Bar from Immersive UI */}
      <div className="border-b border-white/10 px-6 sm:px-10 py-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-white">Secure-Boot</h4>
            </div>
            <p className="text-[11px] text-slate-400">Encrypted start-up verified by Nero-4.0</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-white">Risk-Scoring</h4>
            </div>
            <p className="text-[11px] text-slate-400">Real-time inference analysis & audit</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-white">Tamper-Proof</h4>
            </div>
            <p className="text-[11px] text-slate-400">Zero-trust hardware isolation</p>
          </div>

          <div className="text-left md:text-right font-mono text-[10px] text-slate-400">
            <div className="text-indigo-400 font-bold">SYSTEM_NODE: IL_SKY_SHIELD_01</div>
            <div className="text-slate-500">Nero-4.0 Kernel v4.0.8 • Six 686 Active</div>
          </div>
        </div>
      </div>

      {/* Required Engine Attribution Bar */}
      <div className="border-b border-white/5 bg-[#070712] py-2.5 px-4 text-center">
        <p className="text-slate-300 text-[11px] font-mono flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            Built on <strong className="text-white">Magen-Raki</strong> + the{' '}
            <strong className="text-indigo-300">Neural Core Engine (Nero-4.0)</strong>. All data is encrypted in the{' '}
            <strong className="text-indigo-400">Six 686 shield</strong>.
          </span>
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Core Hardware Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center shadow-[0_0_10px_rgba(79,70,229,0.3)]">
                <Shield className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="font-black text-sm text-white tracking-tight">MAGEN-RAKIʿ</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-400 border border-indigo-800/40">
                מגן-רקיע
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              The world-first hardware-anchored AI risk shield. Eliminating prompt injection, model weight extraction, and adversarial jailbreaks with the Six 686 chip.
            </p>
          </div>

          {/* Col 2: Architecture & Security Navigation */}
          <div>
            <h4 className="font-bold text-white text-[11px] uppercase tracking-widest mb-3">
              Platform Architecture & Radar
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setActiveTab('help')}
                  className="hover:text-indigo-300 transition-colors text-left font-semibold text-indigo-400 flex items-center gap-1.5"
                >
                  <span>Neuro-Core Voice Guidance</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">Mic</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('threats')}
                  className="hover:text-indigo-400 transition-colors text-left font-semibold text-rose-300"
                >
                  Threat Radar & Vulnerabilities
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('compliance')}
                  className="hover:text-indigo-400 transition-colors text-left font-semibold text-emerald-300"
                >
                  Regulatory Compliance Vault
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className="hover:text-indigo-400 transition-colors text-left font-semibold text-cyan-300"
                >
                  Verified Model Marketplace
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('telemetry')}
                  className="hover:text-indigo-400 transition-colors text-left font-semibold text-purple-300"
                >
                  Hardware & Cache Telemetry
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('governor')}
                  className="hover:text-white transition-colors text-left"
                >
                  Six 686 Software & Silicon Governor
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('readiness')}
                  className="hover:text-white transition-colors text-left"
                >
                  Readiness Gate (12 Checks)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('pipeline')}
                  className="hover:text-white transition-colors text-left"
                >
                  CI/CD & Autonomous Repair
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Hardware Certifications */}
          <div>
            <h4 className="font-bold text-white text-[11px] uppercase tracking-widest mb-3">
              Hardware Certifications
            </h4>
            <ul className="space-y-1.5 text-[11px] font-mono">
              <li className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                FIPS 140-3 Level 4 HSM Silicon
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                NIST AI Risk Management (RMF)
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                ISO/IEC 27001 & 42001 AI Standards
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                SOC 2 Type II Confidential Computing
              </li>
            </ul>
          </div>

          {/* Col 4: Zero-Day Threat Bulletin Subscription */}
          <div>
            <h4 className="font-bold text-white text-[11px] uppercase tracking-widest mb-3">
              Zero-Day Threat Feed
            </h4>
            <p className="text-slate-400 text-xs mb-3">
              Receive real-time signatures and CVE advisories verified by the Nero-4.0 lab.
            </p>
            {subscribed ? (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Subscribed to Nero Zero-Day Feed.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-1.5">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="secops@enterprise.com"
                  className="bg-black/60 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 flex-1"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-[0_0_10px_rgba(79,70,229,0.3)] flex items-center gap-1"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>© 2026 Magen-Rakiʿ (מגן-רקיע) Security Systems Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 font-mono text-slate-400">
            <span>Six 686 Cryptographic Secret: VERIFIED</span>
            <span>•</span>
            <span>Latency SLA: &lt; 4ms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

