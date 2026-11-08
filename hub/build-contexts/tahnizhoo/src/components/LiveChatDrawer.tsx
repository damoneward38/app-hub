import React, { useState } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Shield,
  Bot,
  User as UserIcon,
  Sparkles,
  Zap,
  Cpu,
  ArrowRight,
  Code2,
  Lock,
} from 'lucide-react';
import { platformStore } from '../services/store';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionTag?: {
    label: string;
    tab: string;
  };
}

export const LiveChatDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: 'Shalom! I am your Neural Core 200 — תכנית הצופה (Taḥnīʿ Hâzoo) autonomous intelligence assistant. I can help you configure your creator studio, explain our 200 AI cores, run SELA code diagnostics, or trigger closed-loop tasks. How can I assist you right now?',
      timestamp: 'Just now',
    },
  ]);

  const quickPrompts = [
    'What can you do?',
    'Music, Stems & DRM',
    'YouTube & Video Creation',
    '50 Finders vs 50 Fixers',
    'SELA Code Inspection',
    'Local Ollama Status',
  ];

  const handleSendQuery = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const query = textToSend.toLowerCase().trim();
    setInput('');

    setTimeout(() => {
      let reply = '';
      let actionTag: { label: string; tab: string } | undefined = undefined;

      // Greetings
      if (
        query === 'hi' ||
        query === 'hello' ||
        query === 'hey' ||
        query === 'shalom' ||
        query === 'yo' ||
        query.startsWith('hi ') ||
        query.startsWith('hello ')
      ) {
        reply =
          'Shalom and welcome! I am the Neural Core 200 autonomous intelligence assistant. You can ask me to explain what our 200 cores can do, configure a music label or YouTube channel, test SELA code diagnostics, inspect EZHKAR sandboxes, or check your local Ollama engine. What would you like to build or inspect?';
      }
      // "Can you do" / "What can you do" / "Capabilities" / "Help"
      else if (
        query.includes('can you do') ||
        query.includes('what can you do') ||
        query.includes('what do you do') ||
        query.includes('capabilities') ||
        query.includes('help') ||
        query.includes('features')
      ) {
        reply =
          'Yes! Neural Core 200 is built as a complete Business, Creator & Cybersecurity platform with 200 specialized AI cores:\n\n' +
          '🎵 1. Creator & Business Studio (100 Cores):\n' +
          '• Lossless audio stem transcoding, LUFS normalization & Widevine DRM watermarking\n' +
          '• 4K video HLS chunking, automated chaptering & YouTube thumbnail A/B testing\n' +
          '• Smart contract redlining & automated royalty split-sheet distribution\n' +
          '• Tour booking routing, ticket tiering & Shopify merchandise storefront sync\n' +
          '• Invoicing, cross-border tax calculation & Stripe ledger reconciliation\n\n' +
          '🛡️ 2. Autonomous Cybersecurity (100 Cores):\n' +
          '• 50 Finding Cores: CVE deep search, WAF perimeter audits, and memory traps\n' +
          '• 50 Fixing Cores: AST code patch engine, sandbox isolation, and zero-trust IAM\n\n' +
          '🔁 3. Closed-Loop Working Model:\n' +
          'UNDERSTAND → PLAN → FIND → FACT → DELEGATE → EXECUTE → OBSERVE → VERIFY → FIX → REPAIR → VERIFY AGAIN → REPORT.\n\n' +
          'Try clicking "Launch Creator Studio" or asking about a specific discipline!';
        actionTag = { label: 'Open Creator Studio', tab: 'studio' };
      }
      // Music & Audio
      else if (
        query.includes('music') ||
        query.includes('audio') ||
        query.includes('artist') ||
        query.includes('label') ||
        query.includes('stem') ||
        query.includes('drm') ||
        query.includes('royalt')
      ) {
        reply =
          'Our Music Artists & Record Labels mode activates 40+ specialized cores across Groups F, H, and I:\n' +
          '• Group F: Ingests master WAV/FLAC, generates lossless stems, and renders album art.\n' +
          '• Group H: Cryptographically embeds Widevine/FairPlay DRM watermarks and calculates split-sheet percentages.\n' +
          '• Group I: Syncs merchandise vinyl orders with Stripe Treasury and routes tour logistics.\n' +
          'All master audio files are stored in our Zero-Knowledge Vault with AES-256-GCM encryption.';
        actionTag = { label: 'Launch Music Mode', tab: 'studio' };
      }
      // Video & YouTube
      else if (
        query.includes('video') ||
        query.includes('youtube') ||
        query.includes('podcast') ||
        query.includes('channel') ||
        query.includes('thumbnail')
      ) {
        reply =
          'For YouTube and Video Creators, Neural Core coordinates Groups F, G, and J:\n' +
          '• Chunks 4K footage into adaptive HLS/DASH streams for buffer-free playback.\n' +
          '• Generates high-CTR title hooks, timestamped chapters, and A/B thumbnail sets.\n' +
          '• Automatically transcribes audio, cuts 9:16 vertical shorts for TikTok/Reels, and manages sponsor brand pipelines.';
        actionTag = { label: 'Launch Video Mode', tab: 'studio' };
      }
      // Cybersecurity 50/50 Finders & Fixers
      else if (
        query.includes('finder') ||
        query.includes('fixer') ||
        query.includes('50') ||
        query.includes('cyber') ||
        query.includes('security') ||
        query.includes('cve')
      ) {
        reply =
          'Our 100 Cybersecurity Cores operate under the EZHKAR detector/fixer separation principle:\n' +
          '• 50 Finding Cores (Groups A, B & C-Detectors): Hunt CVE zero-days, scan ingress WAF ports, and trap memory anomalies. They only locate and document.\n' +
          '• 50 Fixing Cores (Groups C-Remediators, D & E): Contain compromised sandboxes, rotate IAM keys, and synthesize verified AST code patches.\n' +
          'Neither group validates their own work, ensuring zero bias before consensus quorum!';
        actionTag = { label: 'Inspect 200 Cores', tab: 'cores' };
      }
      // SELA & AST Code diagnostics
      else if (
        query.includes('sela') ||
        query.includes('ast') ||
        query.includes('code') ||
        query.includes('diagnost') ||
        query.includes('inspect')
      ) {
        reply =
          'The SELA Capability Layer provides deep inspection tools directly above Neural Core:\n' +
          '• AST Code Parser: Analyzes Abstract Syntax Trees and prevents syntax or logic regressions.\n' +
          '• Website Troubleshooting: Tests TLS 1.3 handshakes, ingress response time, and CSP headers.\n' +
          '• File Inspector: Verifies 0400 read-only file permissions on master creator keys.\n' +
          '• Diagnostic Terminal: Allows real-time health queries over local sockets.';
        actionTag = { label: 'Open SELA Lab', tab: 'sela' };
      }
      // Local Ollama
      else if (
        query.includes('ollama') ||
        query.includes('local') ||
        query.includes('localhost') ||
        query.includes('model') ||
        query.includes('llama')
      ) {
        const ollama = platformStore.getOllamaConfig();
        reply = `The platform's permanent foundation is LOCAL OLLAMA at ${ollama.endpoint}. Currently running '${ollama.model}' with ~${ollama.latencyMs}ms local latency. All 200 specialist cores operate over this zero-leakage local AI foundation.`;
        actionTag = { label: 'Configure Ollama', tab: 'home' };
      }
      // Hebrew Name
      else if (query.includes('hebrew') || query.includes('name') || query.includes('tahnic') || query.includes('hazoo')) {
        reply =
          '“תכנית הצופה” (Taḥnīʿ Hâzoo) transliterates to “The Planner & The Sentinel”:\n' +
          '• “תכנית” (Taḥnīt): The business blueprint, architecture, and creator workflows.\n' +
          '• “הצופה” (Ha-Tzofeh): The observant sentinel watching over the system to guarantee cybersecurity and data safety.';
      }
      // Admin / Damone Ward
      else if (query.includes('admin') || query.includes('damone') || query.includes('login') || query.includes('password')) {
        reply =
          'Damone Ward (damoneward38@gmail.com) is provisioned as Root Master Administrator with Enterprise privileges, container reboot authority, and user role management.';
        actionTag = { label: 'Open Admin Console', tab: 'admin' };
      }
      // Pricing
      else if (query.includes('price') || query.includes('plan') || query.includes('free') || query.includes('cost')) {
        reply =
          'We offer 3 tiers:\n' +
          '1. Free Starter ($0/mo): 30 min daily scans, 1 business template, Groups A & B.\n' +
          '2. Standard Business ($49.99/mo): Unlimited scans, 5 custom templates, full Groups A–E.\n' +
          '3. Enterprise Autonomous ($499.99/mo): Full 200-core swarm parallelism, dedicated 100 cybersecurity cores, and unlimited A-to-Z templates.';
        actionTag = { label: 'View Pricing Table', tab: 'pricing' };
      }
      // Default contextual response
      else {
        reply =
          `I understand your request regarding "${textToSend}". Under Neural Core 200, I can dispatch our specialized AI cores to handle this.\n\n` +
          'Would you like to:\n' +
          '1. Configure this inside the Creator Studio (A–Z Ledger)\n' +
          '2. Run a Closed-Loop Task Cycle (Understand → Plan → Execute → Verify → Report)\n' +
          '3. Run a SELA code or website diagnostic check?';
        actionTag = { label: 'Open Creator Studio', tab: 'studio' };
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now() + 1}`,
          sender: 'ai',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionTag,
        },
      ]);
    }, 450);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendQuery(input);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-gradient-to-r from-cyan-600 via-indigo-600 to-teal-500 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-xl shadow-cyan-600/30 flex items-center gap-2 transition hover:scale-105 cursor-pointer"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-xs font-bold hidden sm:inline">Neural Core 200 AI</span>
        </button>
      )}

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col h-[520px]">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  Neural Core 200 Assistant <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Ollama localhost:11434 · תכנית הצופה
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 bg-slate-950/70 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSendQuery(p)}
                className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 whitespace-nowrap transition cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900/60 text-xs leading-relaxed">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-xl max-w-[85%] whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p>{m.text}</p>
                  <span className="text-[9px] opacity-60 block text-right mt-1.5 font-mono">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handleFormSubmit} className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about music, YouTube, 200 cores, SELA..."
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
