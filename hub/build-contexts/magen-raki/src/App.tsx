import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SignInModal } from './components/SignInModal';
import { AuthProvider } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { ReadinessGatePage } from './pages/ReadinessGatePage';
import { PipelinePage } from './pages/PipelinePage';
import { GovernorPage } from './pages/GovernorPage';
import { OverviewPage } from './pages/OverviewPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { DemoPage } from './pages/DemoPage';
import { PricingPage } from './pages/PricingPage';
import { ContactPage } from './pages/ContactPage';
import { ThreatRadarPage } from './pages/ThreatRadarPage';
import { CompliancePage } from './pages/CompliancePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { TelemetryPage } from './pages/TelemetryPage';
import { NeuroCoreHelpPage } from './pages/NeuroCoreHelpPage';
import { PageTab } from './types';

function AppContent() {
  const [activeTab, setActiveTab] = useState<PageTab>('landing');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a14] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Persistent Brand Header with Nero-4.0 Banner */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area Based on Active Page */}
      <main className="flex-1 w-full">
        {activeTab === 'landing' && <LandingPage setActiveTab={setActiveTab} />}
        {activeTab === 'help' && <NeuroCoreHelpPage setActiveTab={setActiveTab} />}
        {activeTab === 'readiness' && <ReadinessGatePage setActiveTab={setActiveTab} />}
        {activeTab === 'pipeline' && <PipelinePage setActiveTab={setActiveTab} />}
        {activeTab === 'governor' && <GovernorPage setActiveTab={setActiveTab} />}
        {activeTab === 'threats' && <ThreatRadarPage setActiveTab={setActiveTab} />}
        {activeTab === 'compliance' && <CompliancePage setActiveTab={setActiveTab} />}
        {activeTab === 'marketplace' && <MarketplacePage setActiveTab={setActiveTab} />}
        {activeTab === 'telemetry' && <TelemetryPage setActiveTab={setActiveTab} />}
        {activeTab === 'overview' && <OverviewPage setActiveTab={setActiveTab} />}
        {activeTab === 'features' && <FeaturesPage setActiveTab={setActiveTab} />}
        {activeTab === 'demo' && <DemoPage />}
        {activeTab === 'pricing' && <PricingPage setActiveTab={setActiveTab} />}
        {activeTab === 'contact' && <ContactPage setActiveTab={setActiveTab} />}
      </main>

      {/* Persistent Footer with Sky-Shield & Nero-4.0 Core Notice */}
      <Footer setActiveTab={setActiveTab} />

      {/* Interactive Sign In & Enclave Authentication Portal Modal */}
      <SignInModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

