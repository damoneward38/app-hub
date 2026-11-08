import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Search,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  Cpu,
  Shield,
  ArrowRight,
  Download,
  Terminal,
} from 'lucide-react';
import {
  DOCS_LIBRARY_CATALOG,
  DocLibraryItem,
  PILLARS_METRICS,
} from '../services/pillarsData';

interface DocsLibraryViewProps {
  onNavigateToHowToCall?: () => void;
  onNavigateToValuation?: () => void;
  onNavigateToVault?: () => void;
}

export const DocsLibraryView: React.FC<DocsLibraryViewProps> = ({
  onNavigateToHowToCall,
  onNavigateToValuation,
  onNavigateToVault,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(DOCS_LIBRARY_CATALOG[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<string>('ALL');
  const [copiedExcerpt, setCopiedExcerpt] = useState(false);

  const activeDoc =
    DOCS_LIBRARY_CATALOG.find((d) => d.id === selectedDocId) || DOCS_LIBRARY_CATALOG[0];

  const handleCopyExcerpt = () => {
    navigator.clipboard.writeText(activeDoc.excerpt);
    setCopiedExcerpt(true);
    setTimeout(() => setCopiedExcerpt(false), 2000);
  };

  const filteredDocs = DOCS_LIBRARY_CATALOG.filter((doc) => {
    if (selectedPillar !== 'ALL' && doc.pillar !== selectedPillar) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.filename.toLowerCase().includes(q) ||
      doc.summary.toLowerCase().includes(q) ||
      doc.tableOfContents.some((c) => c.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            177 Documentation Books & Public Inventories
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Documentation Library & Capability Inventories
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Read the master blueprints, tool contracts, and research inventories: <strong>48 Sapphire pages</strong> (TOOLS.md, TOOLSETS.md, MASTERY-GUIDE.md), <strong>65 Open-Jev pages</strong> (Public Jev Capability Inventory), and <strong>64 Tempest pages</strong> (Red-Team Arsenal & MCP).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToHowToCall && (
            <button
              onClick={onNavigateToHowToCall}
              className="px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-700/60 text-cyan-300 hover:bg-cyan-900/60 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              How To Call & Use
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          {onNavigateToValuation && (
            <button
              onClick={onNavigateToValuation}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/60 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              Executive Valuation
            </button>
          )}
        </div>
      </div>

      {/* Docs Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-[10px] text-slate-500 block uppercase">TOTAL DOCUMENTATION</span>
          <span className="text-xl font-bold text-amber-400">{PILLARS_METRICS.totalDocPages} Pages</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-[10px] text-slate-500 block uppercase">SAPPHIRE BLUEPRINTS</span>
          <span className="text-xl font-bold text-cyan-400">48 Pages (15 Modules)</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-[10px] text-slate-500 block uppercase">OPEN-JEV INVENTORIES</span>
          <span className="text-xl font-bold text-indigo-400">65 Pages (48 Modules)</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-[10px] text-slate-500 block uppercase">TEMPEST RED-TEAM ARSENAL</span>
          <span className="text-xl font-bold text-emerald-400">64 Pages (8 Domains)</span>
        </div>
      </div>

      {/* Main Two-Column Document Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Document Browser List (4 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 177 documentation books..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex gap-1.5 text-xs font-mono">
              {['ALL', 'neural_core', 'jav_main', 'tempest'].map((pil) => (
                <button
                  key={pil}
                  onClick={() => setSelectedPillar(pil)}
                  className={`px-2 py-1 rounded-md text-[11px] transition cursor-pointer ${
                    selectedPillar === pil
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {pil === 'ALL'
                    ? 'All Docs'
                    : pil === 'neural_core'
                    ? 'Sapphire'
                    : pil === 'jav_main'
                    ? 'Open-Jev'
                    : 'Tempest'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer space-y-1.5 ${
                  selectedDocId === doc.id
                    ? 'border-amber-500/80 bg-amber-950/30'
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${
                      doc.pillar === 'neural_core'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/40'
                        : doc.pillar === 'jav_main'
                        ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/40'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                    }`}
                  >
                    {doc.filename}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{doc.pagesCount} Pages</span>
                </div>

                <div
                  className={`text-xs font-bold leading-tight ${
                    selectedDocId === doc.id ? 'text-white' : 'text-slate-300'
                  }`}
                >
                  {doc.title.split('—')[0]}
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {doc.summary}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Selected Document Inspector (7 cols) */}
        <div className="lg:col-span-7">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-6">
            {/* Document Header */}
            <div className="pb-4 border-b border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                  {activeDoc.category}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Target: {activeDoc.audience}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">{activeDoc.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeDoc.summary}
              </p>
            </div>

            {/* Table of Contents */}
            <div className="space-y-2.5">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block font-bold">
                Chapter Directory & Sections:
              </span>
              <div className="space-y-1.5 font-mono text-xs">
                {activeDoc.tableOfContents.map((chap, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-slate-300 flex items-center gap-2"
                  >
                    <span className="text-amber-400 font-bold shrink-0">§{i + 1}</span>
                    <span>{chap}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Excerpt Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
                  Document Excerpt Preview:
                </span>
                <button
                  onClick={handleCopyExcerpt}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-950 border border-slate-800 rounded flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedExcerpt ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-mono">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Excerpt</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 font-mono text-xs text-cyan-300 leading-relaxed italic">
                "{activeDoc.excerpt}"
              </div>
            </div>

            {/* Integration Action */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-slate-400 font-mono">
                Full documentation indexed and ready for reference.
              </span>
              {onNavigateToHowToCall && (
                <button
                  onClick={onNavigateToHowToCall}
                  className="px-3.5 py-2 font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-lg shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  View Calling Syntax for This Module
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
