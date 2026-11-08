import React, { useState, useEffect } from 'react';
import {
  Layers,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Zap,
  Search,
  Filter,
  Cpu,
  Lock,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Terminal,
  Activity,
  Award,
  RefreshCw,
  X,
} from 'lucide-react';
import type { PageTab, MarketplaceModelItem } from '../types';
import { useAuth } from '../context/AuthContext';

interface MarketplacePageProps {
  setActiveTab: (tab: PageTab) => void;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [models, setModels] = useState<MarketplaceModelItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
  const [validatingModelId, setValidatingModelId] = useState<string | null>(null);

  // Form state for publishing new model
  const [newModelName, setNewModelName] = useState<string>('');
  const [newModelDescription, setNewModelDescription] = useState<string>('');
  const [newModelVersion, setNewModelVersion] = useState<string>('1.0.0');
  const [newModelPublisher, setNewModelPublisher] = useState<string>(user?.email || 'Magen Labs');

  const defaultModels: MarketplaceModelItem[] = [
    {
      id: 'magen-nero-4',
      name: 'Neural Core Nero-4.0',
      description: 'Enterprise high-assurance code repair, syntactic delimiter shielding, and system analysis engine.',
      version: '4.0.8',
      publisher: 'Magen-Raki Labs',
      validated: true,
      createdAt: Date.now() - 86400000 * 5,
      category: 'LLM',
      contextWindow: '128k Tokens',
      securityScore: 99.8,
      quantization: 'FP16 Enclave Isolated',
      latencyAvgMs: 1.8,
      pricingPer1k: 0.0015,
    },
    {
      id: 'six686-guard-v2',
      name: 'Six 686 Hardware Risk Enclave Model',
      description: 'Hardware-level AST risk scoring and tamper-proof policy evaluation with sub-millisecond classification.',
      version: '2.4.1',
      publisher: 'Six 686 Systems',
      validated: true,
      createdAt: Date.now() - 86400000 * 3,
      category: 'AST_GUARD',
      contextWindow: '32k Tokens',
      securityScore: 100,
      quantization: 'INT8 Co-Processor',
      latencyAvgMs: 0.6,
      pricingPer1k: 0.0004,
    },
    {
      id: 'sapphire-agent-v1',
      name: 'Sapphire Workspace Orchestrator',
      description: 'Autonomous task execution and multi-agent coordination under strict human-in-the-loop governance.',
      version: '1.2.0',
      publisher: 'Sapphire OpenClaw',
      validated: true,
      createdAt: Date.now() - 86400000,
      category: 'AGENT',
      contextWindow: '64k Tokens',
      securityScore: 98.4,
      quantization: 'BF16 Shielded',
      latencyAvgMs: 2.4,
      pricingPer1k: 0.002,
    },
    {
      id: 'gemini-2.5-flash-shielded',
      name: 'Gemini 2.5 Flash (Shielded Gateway)',
      description: 'Ultra-low-latency multimodal model with Magen-Raki prompt injection sanitizer and Bearer token scrubber.',
      version: '2.5.0',
      publisher: 'Google Cloud + Magen-Raki',
      validated: true,
      createdAt: Date.now() - 86400000 * 2,
      category: 'LLM',
      contextWindow: '1M Tokens',
      securityScore: 99.2,
      quantization: 'Cloud TPU Enclave',
      latencyAvgMs: 3.2,
      pricingPer1k: 0.0009,
    },
  ];

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/magen-raki/marketplace');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Merge with rich metadata
          const enriched = data.map((m: any) => {
            const def = defaultModels.find((d) => d.id === m.id);
            return {
              ...m,
              category: def?.category || 'LLM',
              contextWindow: def?.contextWindow || '64k Tokens',
              securityScore: def?.securityScore || 98.5,
              quantization: def?.quantization || 'FP16 Shielded',
              latencyAvgMs: def?.latencyAvgMs || 2.1,
              pricingPer1k: def?.pricingPer1k || 0.001,
            };
          });
          setModels(enriched);
        } else {
          setModels(defaultModels);
        }
      } else {
        setModels(defaultModels);
      }
    } catch (e) {
      setModels(defaultModels);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleValidateModel = async (id: string) => {
    setValidatingModelId(id);
    try {
      const res = await fetch(`/api/magen-raki/marketplace/${id}/validate`, {
        method: 'POST',
      });
      if (res.ok) {
        fetchModels();
      }
    } catch (e) {
      console.error('Validation failed:', e);
    } finally {
      setValidatingModelId(null);
    }
  };

  const handlePublishModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelName) return;

    try {
      const res = await fetch('/api/magen-raki/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newModelName,
          description: newModelDescription || 'Proprietary enclave model registered by administrator.',
          version: newModelVersion || '1.0.0',
          publisher: newModelPublisher || user?.email || 'Magen Security',
        }),
      });

      if (res.ok) {
        setIsPublishModalOpen(false);
        setNewModelName('');
        setNewModelDescription('');
        fetchModels();
      }
    } catch (e) {
      console.error('Publish error:', e);
    }
  };

  const filteredModels = models.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.publisher.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#0a0a14] bg-immersive py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 text-slate-200">
      {/* Header */}
      <div className="text-center max-w-4xl mx-auto space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono shadow-[0_0_15px_rgba(79,70,229,0.2)]">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>VERIFIED MODEL REGISTRY & SILICON ENCLAVE MARKETPLACE</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hardware Attested Models</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
          Verified Model Marketplace
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Discover, validate, and deploy hardened AI models protected by Six 686 silicon enclaves and Neural Core AST runtime filters.
        </p>

        {/* Action button */}
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => setIsPublishModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register & Validate New Model</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0d0d1e] border border-white/10 rounded-2xl p-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verified models or publishers..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-mono">
          {['ALL', 'LLM', 'AST_GUARD', 'AGENT'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredModels.map((model) => (
          <div
            key={model.id}
            className="bg-[#0d0d1e] border border-white/10 hover:border-indigo-500/50 rounded-2xl p-6 space-y-4 transition-all shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {model.category || 'LLM'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">v{model.version}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{model.name}</h3>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono">
                  {model.validated ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>VALIDATED</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleValidateModel(model.id)}
                      disabled={validatingModelId === model.id}
                      className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold flex items-center gap-1 hover:bg-amber-500/30 cursor-pointer"
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${validatingModelId === model.id ? 'animate-spin' : ''}`}
                      />
                      <span>Validate</span>
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{model.description}</p>

              {/* Specs & Hardware Attributes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[9px]">Security Score</span>
                  <span className="text-emerald-400 font-bold">{model.securityScore || 99.8}%</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[9px]">Enclave Format</span>
                  <span className="text-indigo-300 font-bold truncate block">{model.quantization}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[9px]">Avg Latency</span>
                  <span className="text-slate-200 font-bold">{model.latencyAvgMs || 1.8}ms</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[9px]">Rate / 1k Chars</span>
                  <span className="text-slate-200 font-bold">${model.pricingPer1k || 0.001}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500">
                Publisher: <strong className="text-slate-400">{model.publisher}</strong>
              </span>

              <button
                onClick={() => setActiveTab('demo')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Launch in Sandbox</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Publish Model Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0d0d1e] border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Register Model in Enclave</span>
              </h3>
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublishModel} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Model Name
                </label>
                <input
                  type="text"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  placeholder="e.g., Llama-3-70B-Hardened"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Description & Use Case
                </label>
                <textarea
                  value={newModelDescription}
                  onChange={(e) => setNewModelDescription(e.target.value)}
                  rows={3}
                  placeholder="Explain security profile and model weights..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Version
                  </label>
                  <input
                    type="text"
                    value={newModelVersion}
                    onChange={(e) => setNewModelVersion(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Publisher / Org
                  </label>
                  <input
                    type="text"
                    value={newModelPublisher}
                    onChange={(e) => setNewModelPublisher(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-3 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Publish to Enclave Registry</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
