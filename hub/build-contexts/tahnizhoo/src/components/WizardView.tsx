import React, { useState, useEffect } from 'react';
import {
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  ShieldAlert,
  Sparkles,
  FileCode2,
  Copy,
  Check,
  Server,
  CreditCard,
  Building,
  Cpu,
  Globe,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { BlueprintTask, PlanTier } from '../types';
import { INDUSTRY_TEMPLATES, PLANS, TASK_LIBRARY } from '../services/catalogData';
import { platformStore } from '../services/store';

interface WizardViewProps {
  initialIndustryCode?: string;
  onBlueprintCreated: (businessId: string) => void;
  onCancel: () => void;
}

export const WizardView: React.FC<WizardViewProps> = ({
  initialIndustryCode,
  onBlueprintCreated,
  onCancel,
}) => {
  const currentUser = platformStore.getCurrentUser();

  // Wizard Step (1 to 6)
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [businessName, setBusinessName] = useState('Nexus Hyperion Global');
  const [businessType, setBusinessType] = useState('Digital Enterprise');
  const [orgSize, setOrgSize] = useState('11-50 employees');
  const [location, setLocation] = useState('United States (Delaware C-Corp)');
  
  // Step 2: Industry
  const [selectedIndustry, setSelectedIndustry] = useState(
    INDUSTRY_TEMPLATES.find((t) => t.code === initialIndustryCode) || INDUSTRY_TEMPLATES[0]
  );
  const [industryCategoryFilter, setIndustryCategoryFilter] = useState<'ALL' | 'REGULATED' | 'COMMERCE' | 'TECH'>('ALL');

  // Step 3: Mission & Tech
  const [visitedUrls, setVisitedUrls] = useState('https://app.nexushyperion.io, https://api.nexushyperion.io');
  const [storageStack, setStorageStack] = useState(selectedIndustry.defaultStorage);
  const [paymentGateway, setPaymentGateway] = useState(selectedIndustry.defaultPayment);
  const [maturity, setMaturity] = useState<'Low' | 'Medium' | 'High'>('High');
  const [complianceReqs, setComplianceReqs] = useState<string[]>(selectedIndustry.recommendedCompliance);

  // Step 4: Custom Tasks
  const [selectedTasks, setSelectedTasks] = useState<BlueprintTask[]>(selectedIndustry.defaultTasks);

  // Step 5: Security Plan
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>(
    currentUser.plan !== 'free' ? currentUser.plan : 'standard'
  );

  // Step 6: Blueprint JSON
  const [blueprintJson, setBlueprintJson] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update defaults when industry changes
  const handleSelectIndustry = (ind: typeof INDUSTRY_TEMPLATES[0]) => {
    setSelectedIndustry(ind);
    setStorageStack(ind.defaultStorage);
    setPaymentGateway(ind.defaultPayment);
    setComplianceReqs(ind.recommendedCompliance);
    setSelectedTasks(ind.defaultTasks);
  };

  // Toggle compliance tags
  const toggleCompliance = (item: string) => {
    if (complianceReqs.includes(item)) {
      setComplianceReqs(complianceReqs.filter((c) => c !== item));
    } else {
      setComplianceReqs([...complianceReqs, item]);
    }
  };

  // Toggle tasks
  const toggleTask = (task: BlueprintTask) => {
    if (selectedTasks.some((t) => t.id === task.id)) {
      setSelectedTasks(selectedTasks.filter((t) => t.id !== task.id));
    } else {
      setSelectedTasks([...selectedTasks, task]);
    }
  };

  // Generate Blueprint JSON whenever state changes
  useEffect(() => {
    const rawBlueprint = {
      business_id: 'B-2026-PENDING',
      name: businessName,
      type: businessType,
      industry: selectedIndustry.code,
      plan: selectedPlan,
      organization_size: orgSize,
      location,
      infrastructure: {
        api_endpoints: visitedUrls.split(',').map((u) => u.trim()),
        storage_stack: storageStack,
        payment_gateway: paymentGateway,
      },
      risk_profile: {
        maturity_level: maturity,
        compliance_regimes: complianceReqs,
      },
      tasks: selectedTasks.map((t) => ({
        id: t.id,
        name: t.name,
        group: t.group,
        function: t.function,
        type: t.type,
        requiredTier: t.requiredTier,
      })),
      schedule: {
        scanInterval: selectedPlan === 'free' ? 'daily-30min' : 'continuous-hourly',
        deployOn: 'push',
      },
      security_wrapper_active: selectedPlan !== 'free',
    };

    setBlueprintJson(JSON.stringify(rawBlueprint, null, 2));
  }, [
    businessName,
    businessType,
    selectedIndustry,
    selectedPlan,
    orgSize,
    location,
    visitedUrls,
    storageStack,
    paymentGateway,
    maturity,
    complianceReqs,
    selectedTasks,
  ]);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(blueprintJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    try {
      // Validate JSON
      JSON.parse(blueprintJson);
      setJsonError(null);

      // Create in store
      const newBiz = platformStore.createBusiness({
        name: businessName,
        industry: selectedIndustry.name,
        plan: selectedPlan,
        storageStack,
        paymentGateway,
        maturity,
        complianceReqs,
        tasks: selectedTasks,
        schedule: {
          scanInterval: selectedPlan === 'free' ? 'daily-30min' : 'hourly',
          deployOn: 'push',
        },
      });

      setTimeout(() => {
        setIsSubmitting(false);
        onBlueprintCreated(newBiz.id);
      }, 700);
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON syntax');
      setIsSubmitting(false);
    }
  };

  // Helper to determine if a task is locked by current plan selection
  const isTaskLocked = (task: BlueprintTask) => {
    if (selectedPlan === 'free' && task.requiredTier !== 'free') return true;
    if (selectedPlan === 'standard' && task.requiredTier === 'enterprise') return true;
    return false;
  };

  const lockedTasksCount = selectedTasks.filter(isTaskLocked).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Wizard Header & Stepper */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
              Business Wizard (Back-End Engine)
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Create Business Profile & Security Blueprint
            </h1>
          </div>
          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 transition"
          >
            Cancel & Exit
          </button>
        </div>

        {/* 6 Step Progress Indicators */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs font-medium">
          {[
            { num: 1, title: 'Basic Info' },
            { num: 2, title: 'Industry A-Z' },
            { num: 3, title: 'Risk & Stack' },
            { num: 4, title: 'Custom Tasks' },
            { num: 5, title: 'Plan Paywall' },
            { num: 6, title: 'Review & Launch' },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              className={`p-2 rounded-lg border transition text-left sm:text-center ${
                currentStep === s.num
                  ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-semibold'
                  : currentStep > s.num
                  ? 'border-slate-800 bg-slate-900/60 text-emerald-400'
                  : 'border-slate-800/60 bg-slate-950 text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className="text-[10px] text-slate-400">Step {s.num}</div>
              <div className="truncate">{s.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/40 min-h-[440px]">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Step 1: Business Identity & Scale</h2>
              <p className="text-xs text-slate-400">
                Define the core organization details for orchestration isolation and tenancy rules.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Business Entity Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. Acme Media Corp"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Business Type / Structure
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option>Digital Enterprise</option>
                    <option>SaaS Platform</option>
                    <option>E-Commerce Retailer</option>
                    <option>Regulated FinTech</option>
                    <option>Healthcare Provider</option>
                    <option>Agency / Studio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Organization Size
                  </label>
                  <select
                    value={orgSize}
                    onChange={(e) => setOrgSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option>1-10 employees (Seed)</option>
                    <option>11-50 employees (Growth)</option>
                    <option>51-250 employees (Mid-Market)</option>
                    <option>250+ employees (Enterprise)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Legal Jurisdiction & Primary Region
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. US-East (Virginia), EU-Central (Frankfurt)"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Industry Selector (A-to-Z list) */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Step 2: Choose Industry Blueprint (A–Z)</h2>
                <p className="text-xs text-slate-400">
                  Select your sector to auto-configure compliance regimes, on-prem storage policies, and security sentinels.
                </p>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                {[
                  { id: 'ALL', label: 'All Sectors' },
                  { id: 'REGULATED', label: '🔒 Zero-Egress & Defense' },
                  { id: 'COMMERCE', label: 'Commercial & Media' },
                  { id: 'TECH', label: 'Tech & Cloud' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setIndustryCategoryFilter(f.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition cursor-pointer ${
                      industryCategoryFilter === f.id
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zero-Egress & National Security Banner */}
            <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-xs text-emerald-200 flex items-start gap-3">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Zero-Egress On-Premises Isolation Guaranteed:</strong> Engineered specifically for <strong className="text-emerald-300">Commercial Banks, Law Firms, Army Bases, Naval Command, Federal Intelligence, Critical Infrastructure, and the FDA</strong> where business secrets, classified briefs, and proprietary chemical/clinical formulas must <em>never leak or egress to public cloud providers</em>.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {INDUSTRY_TEMPLATES.filter((ind) => {
                if (industryCategoryFilter === 'ALL') return true;
                if (industryCategoryFilter === 'REGULATED') {
                  return [
                    'Banking & Global Finance',
                    'High-Confidentiality Legal',
                    'Defense & Armed Forces',
                    'Federal & Intelligence',
                    'Food, Drug & Clinical Trials',
                    'National Critical Infrastructure',
                    'Finance & Banking',
                    'Life Sciences & Medicine',
                  ].includes(ind.category);
                }
                if (industryCategoryFilter === 'COMMERCE') {
                  return [
                    'Entertainment & Content',
                    'Commerce & Direct-to-Consumer',
                    'Industrial & Freight',
                    'Property & Facilities',
                  ].includes(ind.category);
                }
                if (industryCategoryFilter === 'TECH') {
                  return ['Software & Technology', 'Hardware & Edge', 'Academic & Learning'].includes(ind.category);
                }
                return true;
              }).map((ind) => {
                const isSelected = selectedIndustry.id === ind.id;
                return (
                  <button
                    key={ind.id}
                    onClick={() => handleSelectIndustry(ind)}
                    className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/40 shadow-md shadow-cyan-900/20'
                        : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono text-cyan-400 uppercase">
                          {ind.category}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                      </div>
                      <h3 className="text-sm font-bold text-white">{ind.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {ind.description}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex justify-between">
                      <span>{ind.defaultTasks.length} tasks</span>
                      <span className="font-mono text-emerald-400">{ind.recommendedCompliance[0]}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Mission, Processes & Risk Preferences */}
        {currentStep === 3 && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Step 3: Tech Stack & Regulatory Rigor</h2>
              <p className="text-xs text-slate-400">
                Identify host targets, storage engines, and regulatory compliance standards for automated audit enforcement.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  API Endpoints & Visited URLs (comma separated)
                </label>
                <input
                  type="text"
                  value={visitedUrls}
                  onChange={(e) => setVisitedUrls(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Storage Engine Stack
                  </label>
                  <input
                    type="text"
                    value={storageStack}
                    onChange={(e) => setStorageStack(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Payment / Financial Gateway
                  </label>
                  <input
                    type="text"
                    value={paymentGateway}
                    onChange={(e) => setPaymentGateway(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Security Maturity Assessment
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Low', 'Medium', 'High'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMaturity(m)}
                      className={`p-3 rounded-lg border text-center transition ${
                        maturity === m
                          ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300 font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs">{m} Maturity</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {m === 'Low' ? 'Basic Guardrails' : m === 'Medium' ? 'Standard Audits' : 'Strict Zero-Trust'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Enforced Compliance Frameworks
                </label>
                <div className="flex flex-wrap gap-2">
                  {['SOC 2 Type II', 'ISO 27001', 'PCI-DSS', 'HIPAA', 'GDPR', 'FERPA', 'NIST SP 800-53'].map(
                    (comp) => {
                      const active = complianceReqs.includes(comp);
                      return (
                        <button
                          key={comp}
                          type="button"
                          onClick={() => toggleCompliance(comp)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition flex items-center gap-1.5 ${
                            active
                              ? 'border-cyan-500 bg-cyan-950/50 text-cyan-300'
                              : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {active && <Check className="w-3 h-3 text-cyan-400" />}
                          {comp}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Custom Tasks */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Step 4: Select & Configure Custom Tasks</h2>
                <p className="text-xs text-slate-400">
                  Select which business automation steps and cybersecurity wrappers to chain together into the DAG.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {selectedTasks.length} tasks activated
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TASK_LIBRARY.map((task) => {
                const isSelected = selectedTasks.some((t) => t.id === task.id);
                const isSecurity = task.type === 'security';
                const locked = isTaskLocked(task);

                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task)}
                    className={`p-4 rounded-xl border text-left transition cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? isSecurity
                          ? 'border-emerald-500/60 bg-emerald-950/20'
                          : 'border-cyan-500/60 bg-cyan-950/20'
                        : 'border-slate-800 bg-slate-950/60 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-1 h-4 w-4 rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white truncate">{task.name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-mono font-bold ${
                            isSecurity
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                              : 'bg-cyan-950 text-cyan-400 border border-cyan-800/40'
                          }`}
                        >
                          Group {task.group}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {task.description}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-mono">
                          func: {task.function} · {task.type}
                        </span>
                        {locked && (
                          <span className="text-amber-400 flex items-center gap-1 font-semibold">
                            <Lock className="w-3 h-3" /> Requires {task.requiredTier}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Security Level & Plan Selector */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Step 5: Subscription Tier & Pay-Wall Enforcer</h2>
              <p className="text-xs text-slate-400">
                Free plan grants 30 min daily scans. Standard & Enterprise activate the full 50-agent cybersecurity wrapper.
              </p>
            </div>

            {lockedTasksCount > 0 && selectedPlan === 'free' && (
              <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-950/30 text-amber-300 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Notice: Your blueprint contains {lockedTasksCount} advanced task(s). On the Free Plan, these tasks will be gated with an “Upgrade Required” trigger until upgraded.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map((plan) => {
                const isSelected = selectedPlan === plan.name;
                return (
                  <div
                    key={plan.name}
                    onClick={() => setSelectedPlan(plan.name)}
                    className={`p-6 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/30 shadow-lg shadow-cyan-950'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                          {plan.label}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                      </div>

                      <div className="mt-2 mb-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold text-white font-mono">
                            ${plan.monthlyPrice !== undefined ? plan.monthlyPrice.toLocaleString() : plan.price}
                          </span>
                          <span className="text-xs text-slate-400">
                            {plan.name === 'free' ? '/30-day trial' : '/month'}
                          </span>
                        </div>
                        {plan.annualPrice > 0 && (
                          <span className="text-[11px] font-mono text-emerald-400 block mt-0.5">
                            or ${plan.annualPrice.toLocaleString()} / year
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        {plan.description}
                      </p>

                      <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] font-mono text-cyan-300 flex justify-between">
                      <span>{plan.securityAgentsCount} Security Agents</span>
                      <span>{plan.scanMinutes}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 6: Review & Confirm Blueprint */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Step 6: Review & Final Blueprint JSON</h2>
                <p className="text-xs text-slate-400">
                  Inspect the machine-readable specification that governs the 200-agent swarm.
                </p>
              </div>
              <button
                onClick={handleCopyJson}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:text-white flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied Blueprint' : 'Copy JSON'}
              </button>
            </div>

            {jsonError && (
              <div className="p-3 rounded-lg border border-rose-500/50 bg-rose-950/30 text-rose-300 text-xs">
                JSON Error: {jsonError}
              </div>
            )}

            <div className="relative">
              <textarea
                value={blueprintJson}
                onChange={(e) => setBlueprintJson(e.target.value)}
                rows={14}
                className="w-full font-mono text-xs text-cyan-300 bg-slate-950 border border-slate-800 rounded-xl p-4 focus:outline-none focus:border-cyan-500 leading-relaxed resize-y"
              />
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="text-white font-semibold">
                  Orchestrator Enqueue Target: <span className="font-mono text-cyan-400">POST /api/businesses</span>
                </div>
                <div className="text-slate-400">
                  Plan: <span className="capitalize text-slate-200 font-bold">{selectedPlan}</span> · {selectedTasks.length} active tasks queued into DAG
                </div>
              </div>
              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-lg shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>Auto-Vaccinating Business...</>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Submit & Vaccinate Business
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Wizard Footer Navigation Controls */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        {currentStep < 6 ? (
          <button
            onClick={() => setCurrentStep((prev) => Math.min(6, prev + 1))}
            className="px-5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition flex items-center gap-1.5 shadow-md shadow-cyan-600/20 cursor-pointer"
          >
            Next Step
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 rounded-lg shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            Confirm & Deploy Profile
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
