import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Download, 
  Trash2, 
  Copy, 
  Check, 
  Volume2, 
  Mic, 
  MicOff, 
  Cpu, 
  Code, 
  Terminal, 
  Database, 
  ShieldCheck, 
  Wrench, 
  Zap, 
  ArrowRight,
  Brain,
  Activity,
  Layers,
  StopCircle
} from 'lucide-react';
import { ChatMessage, MemoryItem } from '../types';
import { API } from '../services/api';
import { speechService } from '../services/speech';

interface SapphireChatProps {
  memories: MemoryItem[];
  onOpenTerminalCmd?: (cmd: string) => void;
  onOpenFile?: (fileName: string) => void;
}

export const SapphireChat: React.FC<SapphireChatProps> = ({ memories, onOpenTerminalCmd }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'sapphire',
      content: `### 💎 Sapphire Neural Assistant Online
Welcome to **Sapphire + OpenClaw** — your full-stack AI dev engine.

I can write production code, inspect and run cloud shell commands, orchestrate multi-agent collaboration, and retain learned knowledge across your sessions.

**Quick Capabilities Ready:**
- Click any of the 12 quick action cards below, or speak using **"Hey Sapphire"**.
- Code outputs can be dispatched directly to the OpenClaw editor or terminal.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tokensUsed: 142,
      model: 'gemini-3.7-flash'
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-3.7-flash');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [totalTokens, setTotalTokens] = useState(142);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const capabilities = [
    { id: 'code-gen', label: 'Full-Stack Scaffold', icon: <Code className="w-3.5 h-3.5 text-cyan-400" />, prompt: 'Generate a complete, type-safe Express + React API route module with error handling and zod validation.' },
    { id: 'terminal-exec', label: 'Terminal Diagnostics', icon: <Terminal className="w-3.5 h-3.5 text-emerald-400" />, prompt: 'Diagnose the OpenClaw workspace environment, memory footprint, and package dependencies.' },
    { id: 'memory-recall', label: 'Sync Active Memories', icon: <Database className="w-3.5 h-3.5 text-amber-400" />, prompt: 'List all active memories in the knowledge base and explain how they guide current inference.' },
    { id: 'sec-audit', label: 'Security & Auth Audit', icon: <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />, prompt: 'Perform a full vulnerability audit on API routes, checking for CORS, CSP, input sanitization, and secret leaks.' },
    { id: 'refactor', label: 'Optimize & Refactor', icon: <Wrench className="w-3.5 h-3.5 text-purple-400" />, prompt: 'Refactor our state manager to reduce render overhead and apply memoized selectors.' },
    { id: 'deploy-prep', label: 'Deploy Pre-Flight Check', icon: <Zap className="w-3.5 h-3.5 text-yellow-400" />, prompt: 'Verify build steps and generate the production CI/CD container configuration.' },
    { id: 'multi-agent', label: '3-Agent Collaboration', icon: <Brain className="w-3.5 h-3.5 text-indigo-400" />, prompt: 'Run collaborative pipeline between Sapphire, OpenClaw, and Atlas to architect and verify an automated workflow.' },
    { id: 'perf-profile', label: 'Performance Profiling', icon: <Activity className="w-3.5 h-3.5 text-teal-400" />, prompt: 'Profile latency bottlenecks in our client-server data bridge and suggest SSE token caching strategies.' },
    { id: 'api-mock', label: 'Rest & GraphQL Tester', icon: <Layers className="w-3.5 h-3.5 text-sky-400" />, prompt: 'Write comprehensive integration tests covering /api/health, /api/sapphire/chat, and /api/terminal/exec.' },
    { id: 'ollama-bridge', label: 'Local Ollama Bridge', icon: <Cpu className="w-3.5 h-3.5 text-lime-400" />, prompt: 'Verify connection to local Ollama on port 11434 with llama3.2:1b and report model metadata.' },
    { id: 'doc-gen', label: 'API Documentation', icon: <Sparkles className="w-3.5 h-3.5 text-pink-400" />, prompt: 'Generate clean, comprehensive markdown documentation for all Sapphire + OpenClaw endpoints and architecture.' },
    { id: 'code-review', label: 'Deep Code Review', icon: <Check className="w-3.5 h-3.5 text-orange-400" />, prompt: 'Review our full-stack codebase against OWASP standards, TypeScript strictness, and bundle size.' }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const activeMems = memories.filter(m => m.isActive);
      const reply = await API.sendChatMessage(textToSend, 'sapphire', activeMems);
      
      setMessages(prev => [...prev, reply]);
      setTotalTokens(prev => prev + (reply.tokensUsed || 100));

      // Auto-speak if enabled
      speechService.speak(reply.content);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'sapphire',
          content: `⚠️ Note: ${err.message || 'Error communicating with neural engine. Defaulting to local sandbox.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string) => {
    speechService.speak(text);
  };

  const handleExportChat = () => {
    const markdownContent = `# Sapphire + OpenClaw — Chat Session Export
**Date:** ${new Date().toLocaleString()}
**Total Tokens Tracked:** ${totalTokens}

---

${messages.map(m => `### ${m.sender.toUpperCase()} (${m.timestamp})
${m.content}

*Model: ${m.model || selectedModel} | Tokens: ${m.tokensUsed || 0}*
`).join('\n---\n')}
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sapphire-chat-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'sapphire',
        content: '💎 Chat history cleared. Ready for your next command or task.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const toggleMic = () => {
    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
    } else {
      const started = speechService.startListening(
        () => {
          // Wake word detected!
        },
        (transcript, isFinal) => {
          setInput(transcript);
          if (isFinal && transcript.trim().length > 3) {
            handleSend(transcript);
            speechService.stopListening();
            setIsRecording(false);
          }
        }
      );
      setIsRecording(started);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 py-4 gap-4">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Neural Engine 3.7</span>
          <span className="text-xs text-slate-500">|</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-slate-950 text-slate-200 text-xs px-2.5 py-1 rounded-lg border border-slate-700/80 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="gemini-3.7-flash">Gemini 3.7 Flash (Fastest)</option>
            <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Deep Reasoner)</option>
            <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite (Low Latency)</option>
            <option value="ollama-local">Local Ollama (llama3.2:1b)</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tokens: {totalTokens}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportChat}
              title="Download Chat History as Markdown"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Export .md</span>
            </button>

            <button
              onClick={handleClear}
              title="Clear Session"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-300 hover:bg-slate-700 text-xs border border-slate-700 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 rounded-2xl bg-slate-950/40 p-4 border border-slate-900">
        {messages.map((msg) => {
          const isSapphire = msg.sender !== 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-sm ${isSapphire ? 'items-start' : 'items-start flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center shadow-md ${
                  isSapphire
                    ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white'
                    : 'bg-gradient-to-tr from-slate-700 to-slate-800 text-slate-200'
                }`}
              >
                {isSapphire ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`flex flex-col max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 border shadow-md transition-all ${
                  isSapphire
                    ? 'bg-slate-900/90 border-slate-800 text-slate-100'
                    : 'bg-cyan-950/40 border-cyan-700/50 text-cyan-50'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-4 pb-2 mb-2 border-b border-slate-800/60 text-[11px] text-slate-400 font-mono">
                  <span className="font-semibold text-cyan-400 capitalize">
                    {msg.sender === 'user' ? 'You' : 'Sapphire Neural AI'}
                  </span>
                  <div className="flex items-center gap-2">
                    {msg.tokensUsed && <span>{msg.tokensUsed} tokens</span>}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {/* Content body */}
                <div className="prose prose-invert prose-sm max-w-none text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>

                {/* Suggested Memories (if any) */}
                {msg.suggestedMemories && msg.suggestedMemories.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Database className="w-3 h-3" /> Memory Extracted:
                    </span>
                    {msg.suggestedMemories.map((sm, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                        {sm}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="flex items-center justify-end gap-1.5 mt-3 pt-2 border-t border-slate-800/40 text-xs">
                  <button
                    onClick={() => handleSpeak(msg.content)}
                    title="Speak this response"
                    className="p-1 text-slate-400 hover:text-cyan-300 transition"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    title="Copy response"
                    className="p-1 text-slate-400 hover:text-white transition"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3 text-slate-400 text-xs font-mono p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 animate-pulse">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>Sapphire Neural Engine is generating response...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 12-Capability Grid (Expandable) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
          <span className="flex items-center gap-1 font-bold text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> 12 Core Capabilities:
          </span>
          <span className="text-[11px] text-slate-500">Click to execute with 1-click</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-28 overflow-y-auto pr-1">
          {capabilities.map((cap) => (
            <button
              key={cap.id}
              onClick={() => handleSend(cap.prompt)}
              className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-800/70 text-left transition-all group"
            >
              <div className="p-1 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                {cap.icon}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-semibold text-slate-200 truncate group-hover:text-cyan-300">
                  {cap.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Box */}
      <div className="relative flex items-center gap-2 p-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl focus-within:border-cyan-500/60 transition">
        <button
          onClick={toggleMic}
          title={isRecording ? 'Listening (Click to stop)' : 'Click to speak to Sapphire'}
          className={`p-2.5 rounded-xl border transition ${
            isRecording
              ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          {isRecording ? <Mic className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask Sapphire anything, generate code, inspect architecture..."
          className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none px-2"
        />

        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
