/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { CreatorStudioView } from './components/CreatorStudioView';
import { NeuralCoreConsoleView } from './components/NeuralCoreConsoleView';
import { CoresRegistryView } from './components/CoresRegistryView';
import { SelaDiagnosticsView } from './components/SelaDiagnosticsView';
import { EzhkarSandboxView } from './components/EzhkarSandboxView';
import { WizardView } from './components/WizardView';
import { DashboardView } from './components/DashboardView';
import { AuditLedgerView } from './components/AuditLedgerView';
import { AdminView } from './components/AdminView';
import { PricingView } from './components/PricingView';
import { DocsView } from './components/DocsView';
import { ContactView } from './components/ContactView';
import { JobDetailModal } from './components/JobDetailModal';
import { AuthModal } from './components/AuthModal';
import { OllamaConfigModal } from './components/OllamaConfigModal';
import { LiveChatDrawer } from './components/LiveChatDrawer';
import { PillarsVaultView } from './components/PillarsVaultView';
import { HowToCallView } from './components/HowToCallView';
import { ValuationView } from './components/ValuationView';
import { DocsLibraryView } from './components/DocsLibraryView';
import { InvestorTerminalView } from './components/InvestorTerminalView';
import { SecureEnterpriseView } from './components/SecureEnterpriseView';
import { NeuralCoreChatView } from './components/NeuralCoreChatView';
import { platformStore } from './services/store';
import { Job, PlanTier } from './types';
import { Shield, CheckCircle2, Cpu } from 'lucide-react';

export default function App() {
  const [, setTick] = useState(0);

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = platformStore.subscribe(() => {
      setTick((t) => t + 1);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const currentUser = platformStore.getCurrentUser();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<string>('home');
  const [wizardIndustryCode, setWizardIndustryCode] = useState<string | undefined>(undefined);

  // Modals
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOllamaOpen, setIsOllamaOpen] = useState(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [isGlobalConversationMode, setIsGlobalConversationMode] = useState(false);
  const [lastAutonomousAction, setLastAutonomousAction] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 3500);
  };

  const handleStartWizard = (industryCode?: string) => {
    setWizardIndustryCode(industryCode);
    setActiveTab('wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWorkflowLaunched = (businessId: string) => {
    triggerToast(`Neural Core: Profile ${businessId} configured! Closed-loop task dispatched.`);
    const bizJobs = platformStore.getJobs().filter((j) => j.businessId === businessId);
    if (bizJobs.length > 0) {
      setSelectedJob(bizJobs[0]);
    }
    setActiveTab('console');
  };

  const handleBlueprintCreated = (businessId: string) => {
    triggerToast(`Business Blueprint ${businessId} generated! First swarm deployment scheduled.`);
    const bizJobs = platformStore.getJobs().filter((j) => j.businessId === businessId);
    if (bizJobs.length > 0) {
      setSelectedJob(bizJobs[0]);
    }
    setActiveTab('dashboard');
  };

  const handleRerunJob = (jobId: string) => {
    platformStore.rerunJob(jobId);
    triggerToast(`Job ${jobId} re-dispatched to 20-agent swarm.`);
    const updated = platformStore.getJobById(jobId);
    if (updated) setSelectedJob(updated);
  };

  const handleQuickAdminLogin = () => {
    platformStore.loginAsAdmin();
    triggerToast('Logged in as Master Administrator Damone Ward (damoneward38@gmail.com).');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Toast Alert */}
      {toastNotification && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-cyan-950/95 border border-cyan-500/50 text-cyan-200 text-xs shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => {
          platformStore.logout();
          triggerToast('You have been signed out.');
        }}
        onQuickAdminLogin={handleQuickAdminLogin}
        onOpenOllamaModal={() => setIsOllamaOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            onStartStudio={() => {
              setActiveTab('studio');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onExploreConsole={() => {
              setActiveTab('console');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onExploreCores={() => {
              setActiveTab('cores');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onExploreSela={() => {
              setActiveTab('sela');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onExploreEzhkar={() => {
              setActiveTab('ezhkar');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onExplorePillars={() => {
              setActiveTab('pillars');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onExploreHowToCall={() => {
              setActiveTab('how-to-call');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onExploreValuation={() => {
              setActiveTab('valuation');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onExploreInvestor={() => {
              setActiveTab('investor');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onExploreDocsLibrary={() => {
              setActiveTab('docs-library');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onExploreEnterprise={() => {
              setActiveTab('secure-enterprise');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onExploreChat={() => {
              setActiveTab('chat');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onViewPricing={() => {
              setActiveTab('pricing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAudit={() => {
              setActiveTab('audit');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenOllamaModal={() => setIsOllamaOpen(true)}
          />
        )}

        {activeTab === 'studio' && (
          <CreatorStudioView
            onWorkflowLaunched={handleWorkflowLaunched}
            onOpenWizard={() => setActiveTab('wizard')}
          />
        )}

        {activeTab === 'console' && <NeuralCoreConsoleView />}

        {activeTab === 'cores' && <CoresRegistryView />}

        {activeTab === 'sela' && <SelaDiagnosticsView />}

        {activeTab === 'ezhkar' && <EzhkarSandboxView />}

        {activeTab === 'wizard' && (
          <WizardView
            initialIndustryCode={wizardIndustryCode}
            onBlueprintCreated={handleBlueprintCreated}
            onCancel={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenWizard={() => setActiveTab('wizard')}
            onSelectJob={(job) => setSelectedJob(job)}
            onViewAudit={() => setActiveTab('audit')}
            onUpgradePlan={() => setActiveTab('pricing')}
          />
        )}

        {activeTab === 'pillars' && (
          <PillarsVaultView
            onNavigateToHowToCall={() => {
              setActiveTab('how-to-call');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToValuation={() => {
              setActiveTab('valuation');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToDocs={() => {
              setActiveTab('docs-library');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'how-to-call' && (
          <HowToCallView
            onNavigateToValuation={() => {
              setActiveTab('valuation');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToDocs={() => {
              setActiveTab('docs-library');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToVault={() => {
              setActiveTab('pillars');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'valuation' && (
          <ValuationView
            onNavigateToHowToCall={() => {
              setActiveTab('how-to-call');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToInvestor={() => {
              setActiveTab('investor');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToDocs={() => {
              setActiveTab('docs-library');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToVault={() => {
              setActiveTab('pillars');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToSecureEnterprise={() => {
              setActiveTab('secure-enterprise');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'docs-library' && (
          <DocsLibraryView
            onNavigateToHowToCall={() => {
              setActiveTab('how-to-call');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToValuation={() => {
              setActiveTab('valuation');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToVault={() => {
              setActiveTab('pillars');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'investor' && (
          <InvestorTerminalView
            onNavigateToHowToCall={() => {
              setActiveTab('how-to-call');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToValuation={() => {
              setActiveTab('valuation');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToDocs={() => {
              setActiveTab('docs-library');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToWizard={() => {
              setActiveTab('wizard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToSecureEnterprise={() => {
              setActiveTab('secure-enterprise');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'secure-enterprise' && (
          <SecureEnterpriseView
            onOpenWizard={(industryCode) => {
              setWizardIndustryCode(industryCode);
              setActiveTab('wizard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToArchitecture={() => {
              setActiveTab('pillars');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToDocs={() => {
              setActiveTab('docs-library');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToInvestor={() => {
              setActiveTab('investor');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'audit' && <AuditLedgerView />}

        {(activeTab === 'chat' || activeTab === 'neural-chat') && (
          <NeuralCoreChatView
            onNavigateToTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            isConversationMode={isGlobalConversationMode}
            onToggleConversationMode={(enabled) => setIsGlobalConversationMode(enabled)}
            onAutonomousAction={(actionText) => {
              setLastAutonomousAction(actionText);
              triggerToast(`⚡ Autonomous Takeover: ${actionText}`);
            }}
            onOpenOllamaModal={() => setIsOllamaOpen(true)}
          />
        )}

        {activeTab === 'admin' && <AdminView />}

        {activeTab === 'pricing' && (
          <PricingView
            onPlanSelected={(tier: PlanTier) => {
              triggerToast(`Plan updated to ${tier.toUpperCase()}`);
            }}
          />
        )}

        {activeTab === 'docs' && <DocsView />}

        {activeTab === 'contact' && <ContactView />}
      </main>

      {/* Modals */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onRerun={handleRerunJob}
        />
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => triggerToast(`Signed in successfully as ${platformStore.getCurrentUser().name}`)}
      />

      <OllamaConfigModal
        isOpen={isOllamaOpen}
        onClose={() => setIsOllamaOpen(false)}
      />

      {/* Floating 24/7 Conversation Mode Autonomous Control HUD across pages */}
      {isGlobalConversationMode && activeTab !== 'chat' && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-slate-950/95 border border-cyan-500/80 shadow-2xl shadow-cyan-950 rounded-2xl p-3 px-4 flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-mono font-bold text-cyan-300">24/7 CONVERSATION MODE ACTIVE</span>
          </div>
          {lastAutonomousAction && (
            <span className="hidden sm:inline text-xs text-slate-300 max-w-xs truncate border-l border-slate-800 pl-3">
              ⚡ {lastAutonomousAction}
            </span>
          )}
          <button
            onClick={() => {
              setActiveTab('chat');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <span>Return to Chat</span>
          </button>
          <button
            onClick={() => setIsGlobalConversationMode(false)}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
          >
            Turn Off
          </button>
        </div>
      )}

      {activeTab !== 'chat' && !isGlobalConversationMode && <LiveChatDrawer />}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-300">
              NEURAL CORE 200 · תכנית הצופה (Taḥnīʿ Hâzoo)
            </span>
            <span className="text-slate-600">·</span>
            <span>Local Ollama Foundation</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setActiveTab('studio')} className="hover:text-slate-300 transition">
              Creator Studio
            </button>
            <button onClick={() => setActiveTab('console')} className="hover:text-slate-300 transition">
              Closed-Loop
            </button>
            <button onClick={() => setActiveTab('cores')} className="hover:text-slate-300 transition">
              200 Cores
            </button>
            <button onClick={() => setActiveTab('sela')} className="hover:text-slate-300 transition">
              SELA
            </button>
            <button onClick={() => setActiveTab('ezhkar')} className="hover:text-slate-300 transition">
              EZHKAR
            </button>
            <button onClick={() => setActiveTab('pricing')} className="hover:text-slate-300 transition">
              Pricing
            </button>
          </div>

          <div className="font-mono text-[11px] text-slate-500">
            100 Cyber (50 Finders / 50 Fixers) + 100 Creator Cores · SHA-256 Chained
          </div>
        </div>
      </footer>
    </div>
  );
}
