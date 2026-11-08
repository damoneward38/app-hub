import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  Play, 
  Trash2, 
  Copy, 
  Check, 
  CornerDownLeft, 
  Sparkles, 
  ShieldAlert, 
  Layers, 
  Activity, 
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { TerminalLog } from '../types';
import { API } from '../services/api';

export const OpenClawTerminal: React.FC = () => {
  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      id: 'log-1',
      command: 'sapphire --version && openclaw --status',
      output: `Sapphire Neural Core v3.8.2 [Online]
OpenClaw Terminal Engine v4.1.0 [Ready]
Isolated Sandbox: /workspace/project
Cluster Node: 0.0.0.0:3000 [Container Active]
Type 'help' to see all available commands.`,
      status: 'success',
      timestamp: new Date().toLocaleTimeString(),
      cwd: '/workspace/project'
    }
  ]);

  const [inputCommand, setInputCommand] = useState('');
  const [history, setHistory] = useState<string[]>(['help', 'ls -la', 'sapphire test', 'openclaw status']);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentCwd, setCurrentCwd] = useState('/workspace/project');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, isExecuting]);

  const quickCommands = [
    'help',
    'ls -la',
    'sapphire test',
    'openclaw status',
    'git status',
    'uptime',
    'node -v',
    'deploy vercel',
    'cat package.json'
  ];

  const handleExecute = async (cmdToRun?: string) => {
    const cmd = cmdToRun || inputCommand;
    if (!cmd.trim() || isExecuting) return;

    if (cmd.trim() === 'clear') {
      setLogs([]);
      setInputCommand('');
      setHistory(prev => [cmd, ...prev]);
      setHistoryIndex(-1);
      return;
    }

    setIsExecuting(true);
    setHistory(prev => [cmd, ...prev]);
    setHistoryIndex(-1);
    if (!cmdToRun) setInputCommand('');

    try {
      const result = await API.execCommand(cmd, currentCwd);
      if (result.output === '__CLEAR__') {
        setLogs([]);
      } else {
        setLogs(prev => [...prev, result]);
        if (result.cwd) {
          setCurrentCwd(result.cwd);
        }
      }
    } catch (e: any) {
      setLogs(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          command: cmd,
          output: `Command failed: ${e.message || 'Execution error'}`,
          status: 'error',
          timestamp: new Date().toLocaleTimeString(),
          cwd: currentCwd
        }
      ]);
    } finally {
      setIsExecuting(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleExecute();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIndex = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(nextIndex);
        setInputCommand(history[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const prevIndex = historyIndex - 1;
        setHistoryIndex(prevIndex);
        setInputCommand(history[prevIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputCommand('');
      }
    }
  };

  const copyOutput = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 py-4 gap-4">
      {/* Terminal Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-emerald-400">
            <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>OpenClaw Cloud Shell</span>
          </div>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            CWD: <span className="text-slate-300">{currentCwd}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLogs([])}
            title="Clear Terminal Output"
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 transition"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Quick Action Commands Pill Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 font-mono text-[11px] shrink-0">Quick Run:</span>
        {quickCommands.map((qc, idx) => (
          <button
            key={idx}
            onClick={() => handleExecute(qc)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-950/40 hover:border-emerald-500/40 border border-slate-800 text-slate-300 hover:text-emerald-300 font-mono shrink-0 transition"
          >
            {qc}
          </button>
        ))}
      </div>

      {/* Terminal Main Window */}
      <div 
        onClick={() => inputRef.current?.focus()}
        className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-2xl border border-slate-800/90 font-mono text-xs shadow-2xl space-y-3 cursor-text"
      >
        {logs.map((log) => (
          <div key={log.id} className="group flex flex-col space-y-1">
            {/* Command prompt line */}
            <div className="flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">openclaw@sandbox</span>
                <span className="text-slate-600">:</span>
                <span className="text-amber-400">{log.cwd || currentCwd}</span>
                <span className="text-emerald-400 font-bold">$</span>
                <span className="text-white font-semibold">{log.command}</span>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyOutput(log.id, log.output);
                  }}
                  title="Copy command output"
                  className="p-1 hover:text-white text-slate-500 transition"
                >
                  {copiedId === log.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Command Output */}
            <div
              className={`pl-4 whitespace-pre-wrap leading-relaxed ${
                log.status === 'error' ? 'text-rose-400' : 'text-slate-300'
              }`}
            >
              {log.output}
            </div>
          </div>
        ))}

        {isExecuting && (
          <div className="flex items-center gap-2 text-emerald-400 pl-4 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Executing command in cloud sandbox...</span>
          </div>
        )}

        {/* Current Active Input Line */}
        <div className="flex items-center gap-2 pt-2">
          <span className="text-cyan-400 font-bold">openclaw@sandbox</span>
          <span className="text-slate-600">:</span>
          <span className="text-amber-400">{currentCwd}</span>
          <span className="text-emerald-400 font-bold">$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputCommand}
            onChange={(e) => setInputCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            className="flex-1 bg-transparent text-white focus:outline-none font-mono text-xs caret-emerald-400"
            placeholder="Type command here..."
          />
        </div>

        <div ref={bottomRef} />
      </div>

      {/* Bottom Command Execution Helper */}
      <div className="flex items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs">
        <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
          <span><kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded">Enter</kbd> to run</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded">↑ / ↓</kbd> for history</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded">clear</kbd> to reset</span>
        </div>

        <button
          onClick={() => handleExecute()}
          disabled={!inputCommand.trim() || isExecuting}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl transition"
        >
          <span>Execute</span>
          <Play className="w-3.5 h-3.5 fill-slate-950" />
        </button>
      </div>
    </div>
  );
};
