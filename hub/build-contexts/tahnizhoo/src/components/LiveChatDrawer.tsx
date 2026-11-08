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

const ASSISTANT_SYSTEM_PROMPT = [
  'You are the Neural Core 200 assistant for Tahnic Hazoo (תכנית הצופה), a business, creator, and cybersecurity platform.',
  'Answer concisely in the language of the user. Use only the platform facts in this conversation; do not invent live data.',
  'Platform facts: 200 specialist cores; 100 creator/business cores for audio stems, Widevine DRM, video HLS, contracts, royalties, and Stripe;',
  '100 cybersecurity cores split into 50 finders and 50 fixers; closed loop is UNDERSTAND, PLAN, FIND, FACT, DELEGATE, EXECUTE, OBSERVE, VERIFY, REPORT;',
  'SELA provides AST and website diagnostics; the AI foundation is local Ollama on localhost:11434.',
].join(' ');

async function askLocalOllama(message: string): Promise<string> {
  const messages = [
    { role: 'system', content: ASSISTANT_SYSTEM_PROMPT },
    { role: 'user', content: message },
  ];
  const injected = (window as any).OllamaAI;
  if (injected?.chat) return injected.chat(messages, { model: 'llama3.2' });

  const endpoints = ['/api/ai/chat', 'http://localhost:8780/api/ai/chat'];
  let lastError: unknown = new Error('connection failed');
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, model: 'llama3.2', stream: false }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const text = data.message?.content ?? data.choices?.[0]?.message?.content ?? data.response;
      if (typeof text === 'string' && text.trim()) return text.trim();
      throw new Error('empty response');
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('connection failed');
}

export const LiveChatDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
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

  const handleSendQuery = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    const lower = textToSend.toLowerCase();
    let actionTag: { label: string; tab: string } | undefined;
    if (/(music|audio|artist|label|stem|drm|royalt)/.test(lower)) actionTag = { label: 'Launch Music Mode', tab: 'studio' };
    else if (/(video|youtube|podcast|channel|thumbnail)/.test(lower)) actionTag = { label: 'Launch Video Mode', tab: 'studio' };
    else if (/(finder|fixer|cyber|security|cve|sandbox|ezhkar)/.test(lower)) actionTag = { label: 'Inspect 200 Cores', tab: 'cores' };
    else if (/(sela|ast|code|diagnost|inspect)/.test(lower)) actionTag = { label: 'Open SELA Lab', tab: 'sela' };
    else if (/(price|plan|free|cost)/.test(lower)) actionTag = { label: 'View Pricing Table', tab: 'pricing' };
    else if (/(admin|damone|login|password)/.test(lower)) actionTag = { label: 'Open Admin Console', tab: 'admin' };

    let reply: string;
    try {
      reply = await askLocalOllama(textToSend);
    } catch (error) {
      reply = `Local Ollama is unreachable (${error instanceof Error ? error.message : 'connection failed'}). Start the portal at http://localhost:8780 or Ollama at http://localhost:11434, then resend.`;
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
    setIsSending(false);
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
