import React, { useState } from 'react';
import {
  Music,
  Video,
  Mic,
  BookOpen,
  ShoppingBag,
  Layers,
  Briefcase,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  Cpu,
  Search,
  Filter,
  Sliders,
  Check,
  Zap,
  Lock,
} from 'lucide-react';
import { BusinessCreatorMode, BusinessLedgerItem } from '../types';
import { A_TO_Z_LEDGER, CREATOR_MODES } from '../services/neuralCoreData';
import { platformStore } from '../services/store';

interface CreatorStudioViewProps {
  onWorkflowLaunched: (businessId: string) => void;
  onOpenWizard: () => void;
}

export const CreatorStudioView: React.FC<CreatorStudioViewProps> = ({
  onWorkflowLaunched,
  onOpenWizard,
}) => {
  const [selectedMode, setSelectedMode] = useState<BusinessCreatorMode>(CREATOR_MODES[0]);
  const [businessName, setBusinessName] = useState('Velvet Sound Records');
  const [searchLedger, setSearchLedger] = useState('');
  const [selectedFunctionIds, setSelectedFunctionIds] = useState<string[]>(CREATOR_MODES[0].defaultFunctions);
  const [automationOverrides, setAutomationOverrides] = useState<Record<string, 'autonomous' | 'approval_required' | 'delegated'>>({});
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const handleSelectMode = (mode: BusinessCreatorMode) => {
    setSelectedMode(mode);
    setSelectedFunctionIds(mode.defaultFunctions);
    if (mode.id === 'mode-music') setBusinessName('Velvet Sound Records');
    else if (mode.id === 'mode-video') setBusinessName('Apex Media Network');
    else if (mode.id === 'mode-podcast') setBusinessName('The Frontier Broadcast');
    else if (mode.id === 'mode-publishing') setBusinessName('Chronicle Press');
    else if (mode.id === 'mode-ecommerce') setBusinessName('Kinetix Apparel & Vinyl');
    else if (mode.id === 'mode-saas') setBusinessName('CloudForge Analytics');
    else setBusinessName('Aura Creative Studio');
  };

  const toggleFunction = (item: BusinessLedgerItem) => {
    if (selectedFunctionIds.includes(item.id)) {
      setSelectedFunctionIds(selectedFunctionIds.filter((id) => id !== item.id));
    } else {
      setSelectedFunctionIds([...selectedFunctionIds, item.id]);
    }
  };

  const handleSetAutomation = (id: string, level: 'autonomous' | 'approval_required' | 'delegated') => {
    setAutomationOverrides((prev) => ({ ...prev, [id]: level }));
  };

  const handleAutoConfigure = () => {
    setIsConfiguring(true);
    setTimeout(() => {
      const newBiz = platformStore.configureCreatorMode(
        selectedMode.id,
        businessName,
        selectedFunctionIds
      );
      setIsConfiguring(false);
      onWorkflowLaunched(newBiz.id);
    }, 600);
  };

  const filteredLedger = A_TO_Z_LEDGER.filter((item) => {
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
    if (searchLedger) {
      const q = searchLedger.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.letter.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categories = ['ALL', ...Array.from(new Set(A_TO_Z_LEDGER.map((i) => i.category)))];

  // Calculate active core allocations based on selected functions
  const activeGroups = Array.from(
    new Set(
      selectedFunctionIds
        .map((id) => A_TO_Z_LEDGER.find((l) => l.id === id)?.assignedCoreGroup)
        .filter(Boolean)
    )
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Customer-Facing Platform: Business + Creator Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            A-to-Z Business & Creator Studio
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Select your creator domain and desired capabilities. Neural Core automatically configures the appropriate business AI specialists (100 cores) and activates the hidden cybersecurity sentinel (100 cores).
          </p>
        </div>

        <button
          onClick={onOpenWizard}
          className="px-4 py-2 text-xs font-bold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          Full 6-Step Wizard
        </button>
      </div>

      {/* 1. Choose Creator / Business Mode */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-xs text-cyan-300 font-bold">1</span>
            Select Creator & Business Operating Mode
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {CREATOR_MODES.length} Pre-Tuned Presets
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {CREATOR_MODES.map((mode) => {
            const isSelected = selectedMode.id === mode.id;
            return (
              <div
                key={mode.id}
                onClick={() => handleSelectMode(mode)}
                className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-950/50'
                    : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      {mode.id === 'mode-music' && <Music className="w-4 h-4 text-cyan-400" />}
                      {mode.id === 'mode-video' && <Video className="w-4 h-4 text-cyan-400" />}
                      {mode.id === 'mode-podcast' && <Mic className="w-4 h-4 text-cyan-400" />}
                      {mode.id === 'mode-publishing' && <BookOpen className="w-4 h-4 text-cyan-400" />}
                      {mode.id === 'mode-ecommerce' && <ShoppingBag className="w-4 h-4 text-cyan-400" />}
                      {mode.id === 'mode-saas' && <Layers className="w-4 h-4 text-cyan-400" />}
                      {mode.id === 'mode-agency' && <Briefcase className="w-4 h-4 text-cyan-400" />}
                      {mode.name}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium mb-1">{mode.tagline}</div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {mode.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>{mode.defaultFunctions.length} Auto-Tasks</span>
                  <span className="text-cyan-400 uppercase">{mode.recommendedSecurityLevel}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Configure Brand Name & Active Swarm Preview */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1 space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Brand / Enterprise Profile Name
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-cyan-500"
            placeholder="e.g. My Media Enterprise"
          />
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-6 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">SELECTED CAPABILITIES</span>
            <span className="text-cyan-300 font-bold text-base">{selectedFunctionIds.length} Functions</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">AI CORES MOBILIZED</span>
            <span className="text-emerald-400 font-bold text-base">{activeGroups.length * 20} Cores</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">SECURITY COHORTS</span>
            <span className="text-indigo-400 font-bold text-base">Groups A–E</span>
          </div>
        </div>
      </div>

      {/* 3. A-to-Z Business & Function Ledger */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-xs text-cyan-300 font-bold">2</span>
              A-to-Z Business Function Ledger ({selectedFunctionIds.length} Activated)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select functions and choose automation levels: Autonomous, Needs Approval, or Delegated to Specialist.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchLedger}
                onChange={(e) => setSearchLedger(e.target.value)}
                placeholder="Search A-Z ledger..."
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 w-48"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ledger Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredLedger.map((item) => {
            const isSelected = selectedFunctionIds.includes(item.id);
            const automation = automationOverrides[item.id] || item.defaultAutomation;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-500/60 bg-slate-900/80 shadow-md'
                    : 'border-slate-800/80 bg-slate-950/40 opacity-70 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-cyan-400">
                        {item.letter}
                      </span>
                      <h3 className="text-xs font-bold text-white leading-snug">{item.name}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFunction(item)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Active' : '+ Add'}
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    {item.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                      Core Group {item.assignedCoreGroup}
                    </span>
                    <span className="text-slate-500 font-mono">
                      {item.securityDependency}
                    </span>
                  </div>

                  {/* Automation Switcher */}
                  {isSelected && (
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[10px]">
                      <button
                        onClick={() => handleSetAutomation(item.id, 'autonomous')}
                        className={`px-2 py-0.5 rounded transition ${
                          automation === 'autonomous' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Autonomous
                      </button>
                      <button
                        onClick={() => handleSetAutomation(item.id, 'approval_required')}
                        className={`px-2 py-0.5 rounded transition ${
                          automation === 'approval_required' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Requires Approval
                      </button>
                      <button
                        onClick={() => handleSetAutomation(item.id, 'delegated')}
                        className={`px-2 py-0.5 rounded transition ${
                          automation === 'delegated' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Delegated
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Action Banner: Auto-Configure & Launch */}
      <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-indigo-950/80 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Ready to Auto-Configure Your 200 AI Specialists?
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Neural Core will map your {selectedFunctionIds.length} chosen functions into the active operating mode, establish micro-VM sandboxes, and dispatch the first closed-loop task cycle.
          </p>
        </div>

        <button
          onClick={handleAutoConfigure}
          disabled={isConfiguring}
          className="px-8 py-3.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-xl shadow-lg transition flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
        >
          {isConfiguring ? (
            <span>Configuring 200 Cores...</span>
          ) : (
            <>
              <span>Auto-Configure & Launch Studio</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
