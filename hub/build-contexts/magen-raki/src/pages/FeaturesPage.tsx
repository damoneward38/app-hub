import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Activity,
  Database,
  Lock,
  Sparkles,
  ShieldAlert,
  KeyRound,
  Cpu,
  Radio,
  Fingerprint,
  Gauge,
  Terminal,
  ServerCrash,
  Search,
  CheckCircle2,
  Zap,
  ArrowRight,
  Info,
  X
} from 'lucide-react';
import { FEATURES_DATA } from '../data/featuresData';
import { SecurityFeature, PageTab } from '../types';

interface FeaturesPageProps {
  setActiveTab: (tab: PageTab) => void;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ setActiveTab }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalFeature, setActiveModalFeature] = useState<SecurityFeature | null>(null);

  const categories = ['All', 'Hardware HSM', 'Inference Defense', 'Governance & Audit'];

  const filteredFeatures = useMemo(() => {
    return FEATURES_DATA.filter((feat) => {
      const matchCat = selectedCategory === 'All' || feat.category === selectedCategory;
      const matchQuery =
        searchQuery.trim() === '' ||
        feat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feat.oneLiner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feat.neroCoreSpec.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-indigo-400" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-indigo-400" />;
      case 'Database':
        return <Database className="w-5 h-5 text-indigo-400" />;
      case 'Lock':
        return <Lock className="w-5 h-5 text-indigo-400" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-indigo-400" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-indigo-400" />;
      case 'KeyRound':
        return <KeyRound className="w-5 h-5 text-indigo-400" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-indigo-400" />;
      case 'Radio':
        return <Radio className="w-5 h-5 text-indigo-400" />;
      case 'Fingerprint':
        return <Fingerprint className="w-5 h-5 text-indigo-400" />;
      case 'Gauge':
        return <Gauge className="w-5 h-5 text-indigo-400" />;
      case 'Terminal':
        return <Terminal className="w-5 h-5 text-indigo-400" />;
      case 'ServerCrash':
        return <ServerCrash className="w-5 h-5 text-indigo-400" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a14] bg-immersive py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 text-slate-200">
      {/* Header Section */}
      <div className="text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>13 KERNEL DEFENSE SPECIFICATIONS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          13 Specialized AI Security Modules
        </h1>
        <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-3xl mx-auto">
          Every feature is deeply integrated with the <strong className="text-indigo-400 font-semibold">Neural Core Engine (Nero-4.0)</strong> and locked into the <strong className="text-indigo-300 font-semibold">Six 686 silicon shield</strong> to guarantee zero-risk inference.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
              {cat === 'All' ? ' (13)' : ''}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search defense modules..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>

      {/* 13 Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFeatures.map((feat) => (
          <div
            key={feat.id}
            id={`feature-card-${feat.id}`}
            className="p-6 rounded-2xl bg-black/40 border border-white/10 hover:border-indigo-500/50 hover:bg-black/60 transition-all flex flex-col justify-between group shadow-xl backdrop-blur-md hover:shadow-[0_0_30px_rgba(79,70,229,0.2)]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(79,70,229,0.3)]">
                  {getIcon(feat.iconName)}
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/40">
                  {feat.category}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mb-2 group-hover:text-indigo-200 transition-colors">
                {feat.title}
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {feat.oneLiner}
              </p>

              {/* Explicit Neural Core Integration Highlight */}
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-[11px] space-y-1.5 mb-4">
                <div className="font-semibold text-indigo-400 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Neural Core (Nero-4.0) Execution:</span>
                </div>
                <p className="text-slate-400 leading-snug">
                  {feat.neroCoreSpec}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
              <div className="text-slate-400">
                Latency: <span className="text-slate-200 font-semibold">{feat.latencyImpact}</span>
              </div>
              <button
                onClick={() => setActiveModalFeature(feat)}
                className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Inspect Silicon Spec</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Deep Dive Modal */}
      {activeModalFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-2xl bg-[#0b0d1a] border border-indigo-500/40 p-6 sm:p-8 space-y-6 shadow-[0_0_60px_rgba(79,70,229,0.4)] relative">
            <button
              onClick={() => setActiveModalFeature(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                {getIcon(activeModalFeature.iconName)}
              </div>
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300">
                  {activeModalFeature.category}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">{activeModalFeature.title}</h3>
              </div>
            </div>

            <p className="text-slate-300 text-sm">{activeModalFeature.oneLiner}</p>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-1">
                <div className="font-bold text-indigo-400">Neural Core Engine (Nero-4.0) Implementation</div>
                <p className="text-slate-300 leading-relaxed">{activeModalFeature.neroCoreSpec}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-1">
                <div className="font-bold text-indigo-300">Six 686 Hardware Silicon Security Secret</div>
                <p className="text-slate-300 leading-relaxed">{activeModalFeature.chipSecret}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-indigo-950/40 border border-indigo-900/40 text-center font-mono text-xs">
              <div>
                <div className="text-slate-400 text-[10px]">EVALUATION OVERHEAD</div>
                <div className="text-white font-bold text-sm mt-0.5">{activeModalFeature.latencyImpact}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">THREAT MITIGATION RATE</div>
                <div className="text-emerald-400 font-bold text-sm mt-0.5">{activeModalFeature.mitigationRate}</div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setActiveModalFeature(null);
                  setActiveTab('demo');
                }}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(79,70,229,0.4)]"
              >
                Test in Live Sandbox
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
