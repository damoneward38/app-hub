import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LandingHero } from './components/LandingHero';
import { SapphireChat } from './components/SapphireChat';
import { OpenClawTerminal } from './components/OpenClawTerminal';
import { OpenClawEditor } from './components/OpenClawEditor';
import { UniversalBrainHub } from './components/UniversalBrainHub';
import { DeployPipeline } from './components/DeployPipeline';
import { MemoryCenter } from './components/MemoryCenter';
import { SavedFilesManager } from './components/SavedFilesManager';
import { SettingsPanel } from './components/SettingsPanel';
import { PricingModal } from './components/PricingModal';
import { TabType, MemoryItem, WorkspaceFile, SystemMetrics, AppSettings } from './types';
import { API } from './services/api';
import { speechService } from './services/speech';
import { Brain, Sparkles, Terminal, Rocket, CheckCircle2, Volume2, VolumeX } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [openClawSubTab, setOpenClawSubTab] = useState<'terminal' | 'editor'>('terminal');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // App Memory and Files State
  const [memories, setMemories] = useState<MemoryItem[]>([
    {
      id: 'mem-1',
      category: 'system',
      title: 'System Architecture',
      content: 'Sapphire is a neural intelligence engine paired with OpenClaw terminal & IDE for high-velocity software engineering.',
      timestamp: new Date().toLocaleTimeString(),
      isActive: true,
      tags: ['architecture', 'core']
    },
    {
      id: 'mem-2',
      category: 'code',
      title: 'TypeScript / ESM Standard',
      content: 'Always format backend exports as ESM with strict type definitions and robust error handling.',
      timestamp: new Date().toLocaleTimeString(),
      isActive: true,
      tags: ['code-standard', 'typescript']
    },
    {
      id: 'mem-3',
      category: 'preference',
      title: 'Developer Persona',
      content: 'Maintain concise, proactive responses with concrete code examples, terminal commands, and clear verification steps.',
      timestamp: new Date().toLocaleTimeString(),
      isActive: true,
      tags: ['persona', 'ux']
    }
  ]);

  const [files, setFiles] = useState<WorkspaceFile[]>([]);

  // Settings State
  const [settings, setSettings] = useState<AppSettings>({
    ollamaBaseUrl: 'http://localhost:11434',
    ollamaModel: 'llama3.2:1b',
    ollamaApiKey: '',
    geminiModel: 'gemini-3.7-flash',
    thinkingLevel: 'HIGH',
    systemPrompt: 'You are Sapphire, an elite AI coding assistant and architecture partner.',
    autoSpeakResponse: false,
    voiceName: 'Samantha',
    speechRate: 1.05,
    wakeWordEnabled: true,
    autoSaveDrafts: true,
    activePlan: 'pro'
  });

  useEffect(() => {
    // Initial fetch of metrics, memories, and workspace files
    refreshData();
    const interval = setInterval(fetchMetrics, 12000);
    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    fetchMetrics();
    const mems = await API.getMemories();
    if (mems && mems.length > 0) setMemories(mems);
    const fls = await API.getFiles();
    if (fls && fls.length > 0) setFiles(fls);
  };

  const fetchMetrics = async () => {
    const data = await API.getMetrics();
    setMetrics(data);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Voice Wake Word Toggle
  const toggleVoiceListening = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      showToast('Voice listening paused');
    } else {
      const success = speechService.startListening(
        () => {
          showToast('🎤 "Hey Sapphire" detected! Listening to command...');
          setActiveTab('sapphire');
        },
        (transcript, isFinal) => {
          if (isFinal) {
            showToast(`Voice input: "${transcript}"`);
          }
        }
      );
      if (success) {
        setIsListening(true);
        showToast('🎤 "Hey Sapphire" wake word active!');
      } else {
        showToast('Could not access microphone');
      }
    }
  };

  const toggleMute = () => {
    const muted = speechService.toggleMute();
    setIsMuted(muted);
    showToast(muted ? 'Text-to-Speech Muted' : 'Text-to-Speech Active');
  };

  const handleOpenInEditor = (file: WorkspaceFile) => {
    setActiveTab('openclaw');
    setOpenClawSubTab('editor');
  };

  const handleSendToSapphire = (code: string) => {
    setActiveTab('sapphire');
    showToast('Code sent to Sapphire for review');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Global Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metrics={metrics}
        isListening={isListening}
        toggleVoiceListening={toggleVoiceListening}
        isMuted={isMuted}
        toggleMute={toggleMute}
        openPricing={() => setIsPricingOpen(true)}
        activePlan={settings.activePlan}
      />

      {/* Main Content Body */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'home' && (
          <LandingHero
            setActiveTab={setActiveTab}
            metrics={metrics}
            openPricing={() => setIsPricingOpen(true)}
          />
        )}

        {activeTab === 'sapphire' && (
          <SapphireChat
            memories={memories}
            onOpenTerminalCmd={(cmd) => {
              setActiveTab('openclaw');
              setOpenClawSubTab('terminal');
            }}
            onOpenFile={handleOpenInEditor as any}
          />
        )}

        {activeTab === 'openclaw' && (
          <div className="flex-1 flex flex-col">
            {/* OpenClaw Sub-nav: Shell Sandbox vs Code Editor */}
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-3 flex items-center justify-between">
              <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => setOpenClawSubTab('terminal')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                    openClawSubTab === 'terminal'
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Cloud Shell Sandbox</span>
                </button>

                <button
                  onClick={() => setOpenClawSubTab('editor')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                    openClawSubTab === 'editor'
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Workspace IDE Editor</span>
                </button>
              </div>

              <div className="text-xs font-mono text-slate-500 hidden sm:inline">
                Runtime: <span className="text-emerald-400 font-bold">Node {metrics?.nodeVersion || 'v22'}</span>
              </div>
            </div>

            {openClawSubTab === 'terminal' ? (
              <OpenClawTerminal />
            ) : (
              <OpenClawEditor
                onSendToSapphire={handleSendToSapphire}
                onDeployTrigger={() => setActiveTab('pipeline')}
              />
            )}
          </div>
        )}

        {activeTab === 'brain' && <UniversalBrainHub />}

        {activeTab === 'pipeline' && <DeployPipeline />}

        {activeTab === 'memory' && (
          <MemoryCenter
            memories={memories}
            setMemories={setMemories}
          />
        )}

        {activeTab === 'files' && (
          <SavedFilesManager
            files={files}
            setFiles={setFiles}
            onOpenInEditor={handleOpenInEditor}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel
            settings={settings}
            setSettings={setSettings}
          />
        )}
      </main>

      {/* Floating Universal AI Brain Button (bottom-right) */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setActiveTab('brain')}
          title="Open Universal 3-AI Brain Hub"
          className="relative group p-3.5 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 text-white shadow-2xl shadow-purple-500/30 hover:scale-105 transition-all focus:outline-none"
        >
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline text-xs font-extrabold uppercase tracking-wider font-mono">
              AI Hub (3 AIs)
            </span>
          </div>

          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 shadow-2xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Pricing & Checkout Modal */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        currentPlan={settings.activePlan}
        onSelectPlan={(plan) => {
          setSettings({ ...settings, activePlan: plan });
          showToast(`Plan successfully updated to ${plan.toUpperCase()}!`);
        }}
      />
    </div>
  );
}
