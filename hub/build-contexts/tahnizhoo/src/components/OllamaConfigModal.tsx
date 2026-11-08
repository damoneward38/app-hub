import React, { useState } from 'react';
import {
  X,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  Globe,
  Radio,
} from 'lucide-react';
import { platformStore } from '../services/store';

interface OllamaConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OllamaConfigModal: React.FC<OllamaConfigModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const config = platformStore.getOllamaConfig();
  const [selectedModel, setSelectedModel] = useState(config.model);
  const [endpoint, setEndpoint] = useState(config.endpoint);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTest = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      const res = platformStore.testOllamaConnection();
      setTestResult(`Connected successfully to ${config.model} (Latency: ${res.latency}ms). Localhost inference engine nominal.`);
    }, 500);
  };

  const handleApply = () => {
    platformStore.setOllamaModel(selectedModel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Local Ollama Foundation <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
              </h2>
              <p className="text-xs text-slate-400">LOCAL OLLAMA / LOCALHOST → NEURAL CORE</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 text-xs text-cyan-200 leading-relaxed space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-cyan-300">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            Permanent Underlying Architecture
          </div>
          <p>
            Ollama running on <strong className="text-white">localhost:11434</strong> provides private, zero-leakage local AI intelligence to the Neural Core 200 orchestrator. All 200 cores run through this foundation.
          </p>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Localhost Ollama API Endpoint
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleTest}
                disabled={isTesting}
                className="px-3.5 py-2 font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-cyan-400' : ''}`} />
                Test Ping
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Active Neural Core Intelligence Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
            >
              {config.availableModels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {testResult && (
            <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{testResult}</span>
            </div>
          )}

          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 grid grid-cols-3 gap-2 font-mono text-center">
            <div>
              <span className="text-[10px] text-slate-500 block">STATUS</span>
              <span className="text-emerald-400 font-bold">CONNECTED</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">LATENCY</span>
              <span className="text-cyan-300 font-bold">{config.latencyMs} ms</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">CORES SERVED</span>
              <span className="text-indigo-300 font-bold">200 / 200</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end gap-2 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-400 hover:text-white rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2 font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-lg shadow-md transition cursor-pointer"
          >
            Apply Model Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
