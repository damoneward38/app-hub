import React from 'react';
import { Feature } from '../types';
import { Shield, CheckCircle, Terminal, ArrowRight, Lock, Cpu, Network, KeyRound, Database, Activity } from 'lucide-react';

interface FeatureCardProps {
  key?: React.Key;
  feature: Feature;
  onInspect: (feature: Feature) => void;
}

export default function FeatureCard({ feature, onInspect }: FeatureCardProps) {
  // Category icon helper
  const getCategoryIcon = () => {
    switch (feature.category) {
      case 'Privacy & Governance':
        return <Lock className="w-4 h-4 text-emerald-400" />;
      case 'OS & Infrastructure':
        return <Cpu className="w-4 h-4 text-blue-400" />;
      case 'Network & WAF':
        return <Network className="w-4 h-4 text-cyan-400" />;
      case 'Identity & Zero-Trust':
        return <KeyRound className="w-4 h-4 text-purple-400" />;
      case 'Cryptography & DLP':
        return <Database className="w-4 h-4 text-amber-400" />;
      case 'SIEM & SOC Operations':
        return <Activity className="w-4 h-4 text-rose-400" />;
      default:
        return <Shield className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getCategoryBadgeClass = () => {
    switch (feature.category) {
      case 'Privacy & Governance':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'OS & Infrastructure':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'Network & WAF':
        return 'bg-sky-50 border-sky-200 text-sky-700';
      case 'Identity & Zero-Trust':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'Cryptography & DLP':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'SIEM & SOC Operations':
        return 'bg-rose-50 border-rose-200 text-rose-700';
      default:
        return 'bg-slate-100 border-slate-200 text-slate-700';
    }
  };

  return (
    <div 
      id={`feature-card-${feature.id}`}
      className="group relative flex flex-col justify-between rounded-xl bg-white border border-slate-200 hover:border-blue-500 p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* Top Header info */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 font-mono text-xs font-bold text-blue-600">
              #{feature.id}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${getCategoryBadgeClass()}`}>
              {getCategoryIcon()}
              <span>{feature.category}</span>
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 font-medium">
            Set {feature.set}
          </span>
        </div>

        {/* Feature Titles */}
        <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-snug mb-1 font-sans">
          {feature.title}
        </h3>

        {feature.titleHe && (
          <p className="text-xs font-medium text-slate-500 mb-2.5 font-sans" dir="rtl">
            {feature.titleHe}
          </p>
        )}

        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          {feature.desc}
        </p>
      </div>

      {/* Footer Tags & Action */}
      <div className="pt-3 border-t border-slate-100 mt-2">
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {feature.complianceTags.map((tag, idx) => (
            <span 
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-600 font-medium"
            >
              <CheckCircle className="w-2.5 h-2.5 text-green-500" />
              {tag}
            </span>
          ))}
        </div>

        <button
          onClick={() => onInspect(feature)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-all cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-blue-600" />
            Inspect Architecture &amp; Test
          </span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-blue-600" />
        </button>
      </div>
    </div>
  );
}
