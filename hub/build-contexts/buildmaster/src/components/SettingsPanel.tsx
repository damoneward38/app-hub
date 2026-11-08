import React, { useState } from 'react';
import { 
  Settings, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Save, 
  Volume2, 
  Sliders, 
  Key, 
  ShieldCheck, 
  Terminal, 
  Radio,
  Zap,
  Layers
} from 'lucide-react';
import { AppSettings } from '../types';
import { API } from '../services/api';

interface SettingsPanelProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, setSettings }) => {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [saveBanner, setSaveBanner] = useState(false);

  const handleTestOllama = async () => {
    setTestStatus('testing');
    setTestMessage('Pinging local Ollama endpoint at ' + settings.ollamaBaseUrl + '...');
    try {
      const res = await API.testOllama(settings.ollamaBaseUrl, settings.ollamaModel);
      setTestStatus('success');
      setTestMessage(res.message || 'Connected to Ollama successfully!');
    } catch (e: any) {
      setTestStatus('error');
      setTestMessage('Could not reach Ollama: ' + (e.message || 'Connection refused'));
    }
  };

  const handleSaveAll = () => {
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 py-4 gap-4 overflow-y-auto">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-600 to-slate-800 p-0.5 shadow-lg">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Settings className="w-5 h-5 text-slate-300" />
            </div>
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              System Settings & AI Integrations
              {saveBanner && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse font-mono">
                  SETTINGS SAVED
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Configure local Ollama bridge, Gemini models, reasoning levels, and vocal synthesis.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveAll}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>

      {/* PROMINENT NEON GREEN OLLAMA CONNECT PANEL */}
      <div className="relative p-5 rounded-2xl border-2 border-emerald-500/80 bg-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.15)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-emerald-500/30">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="text-sm font-extrabold text-emerald-300 font-mono tracking-wider flex items-center gap-1.5 uppercase">
              <Cpu className="w-4 h-4 text-emerald-400" /> Connect Your Local Ollama Engine
            </h3>
          </div>

          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
            ZERO-TUNNEL WS RELAY
          </span>
        </div>

        <p className="text-xs text-slate-300">
          Connect your local Mac/Linux Ollama instance to Sapphire for unlimited local AI execution with zero latency and complete privacy.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-emerald-400 font-mono mb-1 font-semibold">Ollama Base URL:</label>
            <input
              type="text"
              value={settings.ollamaBaseUrl}
              onChange={(e) => setSettings({ ...settings, ollamaBaseUrl: e.target.value })}
              placeholder="http://localhost:11434"
              className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-400 focus:outline-none shadow-inner"
            />
          </div>

          <div>
            <label className="block text-emerald-400 font-mono mb-1 font-semibold">Active Model Tag:</label>
            <input
              type="text"
              value={settings.ollamaModel}
              onChange={(e) => setSettings({ ...settings, ollamaModel: e.target.value })}
              placeholder="llama3.2:1b, llama3, codellama"
              className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-400 focus:outline-none shadow-inner"
            />
          </div>

          <div>
            <label className="block text-emerald-400 font-mono mb-1 font-semibold">API Key / Token (Optional):</label>
            <input
              type="password"
              value={settings.ollamaApiKey}
              onChange={(e) => setSettings({ ...settings, ollamaApiKey: e.target.value })}
              placeholder="Bearer token or leave empty"
              className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-400 focus:outline-none shadow-inner"
            />
          </div>
        </div>

        {/* Test Button & Live Status Badge */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono">
            {testStatus === 'testing' && (
              <span className="text-emerald-400 flex items-center gap-1.5 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> {testMessage}
              </span>
            )}
            {testStatus === 'success' && (
              <span className="text-emerald-300 flex items-center gap-1.5 bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-500/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {testMessage}
              </span>
            )}
            {testStatus === 'error' && (
              <span className="text-rose-400 flex items-center gap-1.5 bg-rose-950/40 px-3 py-1 rounded-lg border border-rose-500/40">
                <XCircle className="w-4 h-4 text-rose-400" /> {testMessage}
              </span>
            )}
            {testStatus === 'idle' && (
              <span className="text-slate-400">Click test to ping local endpoint.</span>
            )}
          </div>

          <button
            onClick={handleTestOllama}
            disabled={testStatus === 'testing'}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all font-mono uppercase tracking-wider"
          >
            {testStatus === 'testing' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-slate-950" />}
            <span>Test & Save Connection</span>
          </button>
        </div>
      </div>

      {/* Cloud AI Configuration & Model Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gemini Engine Settings */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" /> Cloud AI Model Routing
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-mono">Primary Model:</label>
              <select
                value={settings.geminiModel}
                onChange={(e) => setSettings({ ...settings, geminiModel: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
              >
                <option value="gemini-3.7-flash">Gemini 3.7 Flash (Default - High Speed)</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Deep STEM Reasoning)</option>
                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite (Low Latency)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-mono">Reasoning Level:</label>
              <select
                value={settings.thinkingLevel}
                onChange={(e) => setSettings({ ...settings, thinkingLevel: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
              >
                <option value="HIGH">HIGH (Maximum STEM & Code Verification)</option>
                <option value="LOW">LOW (Fast response rate)</option>
                <option value="MINIMAL">MINIMAL (Instant stream)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-mono">System Persona Prompt:</label>
              <textarea
                value={settings.systemPrompt}
                onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:border-cyan-500 focus:outline-none resize-none text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Audio & Voice Synthesis Settings */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-purple-400" /> Speech & Vocal Parameters
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <div>
                <span className="font-bold text-white block">Auto-Speak Responses</span>
                <span className="text-[11px] text-slate-400">Play natural voice automatically after generation</span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSpeakResponse}
                onChange={(e) => setSettings({ ...settings, autoSpeakResponse: e.target.checked })}
                className="w-4 h-4 accent-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <div>
                <span className="font-bold text-white block">"Hey Sapphire" Wake Word</span>
                <span className="text-[11px] text-slate-400">Always-on background listener for instant mic triggers</span>
              </div>
              <input
                type="checkbox"
                checked={settings.wakeWordEnabled}
                onChange={(e) => setSettings({ ...settings, wakeWordEnabled: e.target.checked })}
                className="w-4 h-4 accent-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-mono">Speech Rate: ({settings.speechRate}x)</label>
              <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.05"
                value={settings.speechRate}
                onChange={(e) => setSettings({ ...settings, speechRate: parseFloat(e.target.value) })}
                className="w-full accent-purple-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
