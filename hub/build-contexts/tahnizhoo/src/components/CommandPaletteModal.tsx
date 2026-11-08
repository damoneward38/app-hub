import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Layers,
  Cpu,
  Shield,
  Activity,
  Code2,
  Lock,
  Terminal,
  FileCheck2,
  DollarSign,
  BookOpen,
  Briefcase,
  ArrowRight,
  ExternalLink,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

interface PaletteItem {
  id: string;
  title: string;
  category: 'Platform' | 'AI System' | 'Security' | 'Technology' | 'Business' | 'Docs' | 'Commercial';
  tabTarget: string;
  description: string;
  shortcut?: string;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const ITEMS: PaletteItem[] = [
    // Platform
    { id: 'p1', title: 'Home — Platform Command Plane', category: 'Platform', tabTarget: 'home', description: 'Hero, customer intent engine, 3-pillar overview, and operating model.' },
    { id: 'p2', title: 'Creator Studio — A-to-Z Business Ledger', category: 'Platform', tabTarget: 'studio', description: 'Music, Video, Publishing, and E-Com automation workflows.' },
    { id: 'p3', title: 'Cockpit Dashboard — Real-Time Operations', category: 'Platform', tabTarget: 'dashboard', description: 'Executive KPIs, deployment health, MTTF, and active swarm jobs.' },
    { id: 'p4', title: 'Secure Enterprise — Air-Gapped Zero-Egress Enclave', category: 'Platform', tabTarget: 'secure-enterprise', description: 'Zero-leakage architecture for Banks, Defense, Law Firms, and the FDA.' },

    // AI System
    { id: 'a1', title: 'Neural Core Console — 12-Stage Operating Model', category: 'AI System', tabTarget: 'console', description: 'Understand → Plan → Find → Fact → Delegate → Execute → Observe → Verify → Repair.' },
    { id: 'a2', title: '200 Specialized AI Cores Registry', category: 'AI System', tabTarget: 'cores', description: '100 Business/Creator cores + 100 Cybersecurity cores (50 Finders + 50 Fixers).' },

    // Security
    { id: 's1', title: 'SELA Diagnostic Lab — AST Code & File Inspection', category: 'Security', tabTarget: 'sela', description: 'Website troubleshooting, AST taint tracking, and credential inspection.' },
    { id: 's2', title: 'EZHKAR Sandboxes — Firecracker Micro-VM Isolation', category: 'Security', tabTarget: 'ezhkar', description: 'Hardware memory ceilings, read-only filesystems, and closed-loop verification.' },
    { id: 's3', title: 'PCA-Grade Immutable Audit Ledger', category: 'Security', tabTarget: 'audit', description: 'Cryptographic SHA-256 block hash chaining for SEC, FDA, and DoD auditors.' },

    // Technology
    { id: 't1', title: 'Visual Architecture — Complete 3-Pillar Topology', category: 'Technology', tabTarget: 'architecture', description: 'Visual diagram of Local Ollama → Neural Core → Capability Layers → Sandboxes.' },
    { id: 't2', title: 'Pillars Vault — 6,805+ Functions Catalog', category: 'Technology', tabTarget: 'pillars', description: 'Sapphire (MatrixBroker), Open-Jev (NAMI), and T3MP3ST (CyberHealer).' },
    { id: 't3', title: 'How To Call — 8 Invocation Modalities', category: 'Technology', tabTarget: 'how-to-call', description: 'CLI binaries, Python SDK, 247 REST routes, MCP schemas, and Wake-Word.' },

    // Business
    { id: 'b1', title: 'Business Blueprint Wizard — A-to-Z Template Engine', category: 'Business', tabTarget: 'wizard', description: '6-step setup for Banks, Law Firms, Defense bases, Healthcare, and SaaS.' },

    // Docs
    { id: 'd1', title: '177 Documentation Books & Public Inventories', category: 'Docs', tabTarget: 'docs-library', description: 'TOOLS.md, MASTERY-GUIDE.md, CAPABILITY_INVENTORY.md, Red-Team Arsenal.' },
    { id: 'd2', title: 'REST API Explorer — 247 Web Routes & Webhooks', category: 'Docs', tabTarget: 'docs', description: 'Interactive endpoint tester with live client-server telemetry responses.' },

    // Commercial
    { id: 'c1', title: 'Investor Capital Terminal — Series A & Commercial Dossier', category: 'Commercial', tabTarget: 'investor', description: 'Three-tier pricing ($250/mo, $1.5k/mo, $4.5k/mo or $3k/$18k/$54k/yr), $300M+ TAM, and $320M exit multiple card.' },
    { id: 'c2', title: 'Executive Valuation — Why It Is Worth Millions ($4.25M)', category: 'Commercial', tabTarget: 'valuation', description: '12 SaaS tools replaced ($550k/yr saved) and 15 senior staff engineer years.' },
    { id: 'c3', title: 'Pricing & Licensing Paywall — Monthly & Annual', category: 'Commercial', tabTarget: 'pricing', description: 'Monthly ($250, $1.5k, $4.5k/mo), Annual ($3k, $18k, $54k/yr), Free Sandbox & $110k White-Label OEM offer.' },
    { id: 'c4', title: 'Contact & Enterprise Demo Booking', category: 'Commercial', tabTarget: 'contact', description: 'Direct support inquiry and interactive time slot scheduler.' },
  ];

  const filtered = ITEMS.filter((item) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900/60">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a capability, page, core, or document (e.g. 'investor', 'banking', 'mcp', 'cve')..."
            className="w-full bg-transparent text-sm text-white focus:outline-none placeholder:text-slate-500"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-3 max-h-[60vh] overflow-y-auto space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.tabTarget);
                  onClose();
                }}
                className="w-full p-3 rounded-xl border border-transparent hover:border-slate-800 hover:bg-slate-900/80 transition flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300">
                      {item.category}
                    </span>
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{item.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching capabilities or pages found for "{query}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900/40 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Navigate with click · Esc to exit</span>
          <span className="text-cyan-400">TAḤNĪʿ HÂZOO Universal Command Palette</span>
        </div>
      </div>
    </div>
  );
};
