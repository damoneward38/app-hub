import React, { useState, useEffect } from 'react';
import { 
  X, 
  Activity, 
  ShieldAlert, 
  ShieldCheck, 
  Radio, 
  Globe2, 
  Zap, 
  Lock, 
  RefreshCw,
  Terminal
} from 'lucide-react';
import { SecurityEvent } from '../types';

interface LiveRadarSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialEvents: SecurityEvent[] = [
  {
    id: 'evt_9918',
    timestamp: 'Just now',
    ip: '194.26.29.14',
    country: 'RU',
    attackType: 'SQLi Obfuscated Payload on /api/v1/auth',
    actionTaken: 'BLOCKED',
    featureId: 27,
    featureName: 'Intelligent Next-Gen WAF',
    severity: 'high'
  },
  {
    id: 'evt_9917',
    timestamp: '3s ago',
    ip: '45.154.255.89',
    country: 'NL',
    attackType: 'HTTP/2 Rapid Reset Flooding (120k req/s)',
    actionTaken: 'MITIGATED',
    featureId: 28,
    featureName: 'Multi-Layer L3/L4/L7 DDoS Defense',
    severity: 'critical'
  },
  {
    id: 'evt_9916',
    timestamp: '8s ago',
    ip: '185.220.101.4',
    country: 'DE (Tor)',
    attackType: 'Credential Stuffing Bot Attack',
    actionTaken: 'BLOCKED',
    featureId: 29,
    featureName: 'Behavioral Bot Management',
    severity: 'medium'
  },
  {
    id: 'evt_9915',
    timestamp: '14s ago',
    ip: '82.102.23.110',
    country: 'IL',
    attackType: 'Outbound Unmasked Credit Card PII',
    actionTaken: 'TOKENIZED',
    featureId: 53,
    featureName: 'Enterprise DLP Sensor',
    severity: 'high'
  },
  {
    id: 'evt_9914',
    timestamp: '22s ago',
    ip: '103.203.57.18',
    country: 'CN',
    attackType: 'Kernel Syscall Elevation Attempt (ptrace)',
    actionTaken: 'ISOLATED',
    featureId: 20,
    featureName: 'eBPF Kernel Threat Sensor',
    severity: 'critical'
  }
];

export default function LiveRadarSimulator({ isOpen, onClose }: LiveRadarSimulatorProps) {
  const [events, setEvents] = useState<SecurityEvent[]>(initialEvents);
  const [blockedCount, setBlockedCount] = useState(1482910);
  const [activeSensors, setActiveSensors] = useState(78);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setBlockedCount((prev) => prev + Math.floor(Math.random() * 4) + 1);

      const possibleAttacks = [
        { type: 'GraphQL Introspection Query Probing', featureId: 30, featureName: 'API Threat Inspector', act: 'BLOCKED' as const, sev: 'medium' as const, country: 'US', ip: '54.210.12.9' },
        { type: 'Zero-Day Directory Traversal (/etc/passwd)', featureId: 27, featureName: 'Intelligent Next-Gen WAF', act: 'BLOCKED' as const, sev: 'high' as const, country: 'RO', ip: '188.241.80.12' },
        { type: 'Impossible Travel Login Velocity Check', featureId: 41, featureName: 'Adaptive Contextual MFA', act: 'ISOLATED' as const, sev: 'high' as const, country: 'BR', ip: '177.136.250.4' },
        { type: 'HoneyToken Trigger in /backup_keys.env', featureId: 72, featureName: 'Honeypot Decoy Network', act: 'BLOCKED' as const, sev: 'critical' as const, country: 'VN', ip: '113.161.44.88' },
        { type: 'Unencrypted PHI Database Query Intercept', featureId: 5, featureName: 'HIPAA Audit Vault', act: 'TOKENIZED' as const, sev: 'medium' as const, country: 'IL', ip: '10.0.12.44' }
      ];

      const chosen = possibleAttacks[Math.floor(Math.random() * possibleAttacks.length)];
      const newEvt: SecurityEvent = {
        id: `evt_${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        ip: chosen.ip,
        country: chosen.country,
        attackType: chosen.type,
        actionTaken: chosen.act,
        featureId: chosen.featureId,
        featureName: chosen.featureName,
        severity: chosen.sev
      };

      setEvents((prev) => [newEvt, ...prev.slice(0, 6)]);
    }, 3500);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-950/90 border border-cyan-500/50">
              <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-ping"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-sans">
                  SkyGuard Live Threat Defense Radar
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-bold">
                  AUTONOMOUS ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Real-time telemetry across 78 security modules • 0 breach threshold
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Key telemetry stat bars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                Attacks Blocked (24h)
              </span>
              <span className="text-2xl font-bold font-mono text-cyan-400">
                {blockedCount.toLocaleString()}
              </span>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                Active Sensors
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {activeSensors}/78 Full Stack
              </span>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                Mean Mitigation Time
              </span>
              <span className="text-2xl font-bold font-mono text-white">
                0.38 ms
              </span>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                Sovereign SLA
              </span>
              <span className="text-2xl font-bold font-mono text-amber-400">
                99.999%
              </span>
            </div>
          </div>

          {/* Real-time incident feed */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Live Ingress Intercept Feed (Auto-Updating)
              </h4>
              <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Streaming eBPF/WAF Telemetry
              </span>
            </div>

            <div className="space-y-2 font-mono">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs gap-2 animate-in fade-in slide-in-from-top-1 duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      evt.actionTaken === 'BLOCKED' ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40' :
                      evt.actionTaken === 'MITIGATED' ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40' :
                      evt.actionTaken === 'ISOLATED' ? 'bg-purple-950/80 text-purple-300 border border-purple-500/40' :
                      'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                    }`}>
                      {evt.actionTaken}
                    </span>

                    <div>
                      <span className="text-slate-200 font-medium block">
                        {evt.attackType}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Origin: {evt.ip} [{evt.country}] • Module #{evt.featureId} ({evt.featureName})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto text-slate-500 text-[11px]">
                    <span>{evt.timestamp}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Powered by מגן‑רקיע Distributed Defense Mesh
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Close Radar View
          </button>
        </div>
      </div>
    </div>
  );
}
