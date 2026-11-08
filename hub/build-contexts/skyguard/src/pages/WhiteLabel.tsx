import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Clock, 
  CheckCircle2, 
  Send, 
  Palette, 
  Globe, 
  Server, 
  FileText, 
  Check, 
  HelpCircle,
  ArrowRight,
  Printer,
  Download,
  Mail,
  Lock,
  Headphones,
  Sliders,
  Eye,
  Settings,
  RefreshCw,
  FolderTree,
  Building2,
  Copy,
  ExternalLink,
  Shield,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { whiteLabelInfo } from '../data/features';
import { WhiteLabelSettings } from '../types';

export const DEFAULT_WHITE_LABEL_SETTINGS: WhiteLabelSettings = {
  companyName: 'SkyGuard Enterprise',
  logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
  favicon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=32&auto=format&fit=crop&q=80',
  primaryColor: '#2563eb', // Royal Blue
  secondaryColor: '#059669', // Emerald
  customDomain: 'security.myenterprise.com',
  emailBranding: {
    senderName: 'SkyGuard Sovereign SecOps',
    senderEmail: 'secops@security.myenterprise.com',
    footerText: 'This is an automated Zero-Trust cryptographic notification. All rights reserved.',
    logoInHeader: true,
  },
  reportBranding: {
    headerTitle: 'CONFIDENTIAL EXECUTIVE SECURITY & POSTURE DOSSIER',
    confidentialityNotice: 'RESTRICTED DISTRIBUTION - AUTHORIZED SOVEREIGN OPERATORS ONLY',
    watermarkText: 'SOVEREIGN ENCLAVE AUDIT',
    showPageNumbers: true,
  },
  loginBranding: {
    heading: 'Enterprise Zero-Trust Authentication Gateway',
    subheading: 'Hardware FIDO2 & Cryptographic Enclave Passkey Enforced',
    backgroundImageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1600&auto=format&fit=crop&q=80',
    customLegalLink: 'https://myenterprise.com/legal/sovereign-policy',
  },
  customSupport: {
    supportEmail: 'soc-support@myenterprise.com',
    helpdeskUrl: 'https://helpdesk.myenterprise.com',
    emergencyHotline: '+1 (800) 555-CYBER',
    tier1SlaHours: 1,
  },
};

export default function WhiteLabel() {
  // Active Main Tab: 'settings' | 'preview' | 'license-quote'
  const [activeTab, setActiveTab] = useState<'settings' | 'preview' | 'license-quote'>('settings');
  
  // Active Settings Sub-Node (matches the exact requested tree)
  const [activeNode, setActiveNode] = useState<
    | 'company-name'
    | 'logo'
    | 'favicon'
    | 'primary-color'
    | 'secondary-color'
    | 'custom-domain'
    | 'email-branding'
    | 'report-branding'
    | 'login-branding'
    | 'custom-support'
  >('company-name');

  // Preview Mode: 'dashboard' | 'login' | 'report' | 'email'
  const [previewMode, setPreviewMode] = useState<'dashboard' | 'login' | 'report' | 'email'>('dashboard');

  // White label state with LocalStorage persistence
  const [settings, setSettings] = useState<WhiteLabelSettings>(() => {
    const saved = localStorage.getItem('skyguard_whitelabel_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_WHITE_LABEL_SETTINGS;
      }
    }
    return DEFAULT_WHITE_LABEL_SETTINGS;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Quote form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [selectedTier, setSelectedTier] = useState<'base' | 'enterprise'>('base');
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['custom_threat_feed', 'sovereign_infra']);
  const [notes, setNotes] = useState('');
  const [submittedProposal, setSubmittedProposal] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    localStorage.setItem('skyguard_whitelabel_settings', JSON.stringify(settings));
  }, [settings]);

  const handleSaveSettings = () => {
    localStorage.setItem('skyguard_whitelabel_settings', JSON.stringify(settings));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    setSettings(DEFAULT_WHITE_LABEL_SETTINGS);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) => 
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedProposal({
        proposalId: `PROP-WL-${Math.floor(100000 + Math.random() * 900000)}`,
        name,
        email,
        company: company || settings.companyName,
        tier: selectedTier === 'base' ? 'Base White‑Label License ($3M–$5M)' : 'Enterprise Sovereign License ($15M–$25M)',
        addons: selectedAddons.map(id => whiteLabelInfo.addons.find(a => a.id === id)?.name).filter(Boolean),
        brandPreview: { 
          brandName: settings.companyName, 
          customDomain: settings.customDomain,
          primaryColor: settings.primaryColor
        },
        timestamp: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        sla: '5-Year 99.999% Guaranteed SLA with Dedicated Level-3 Cyber Response Team'
      });
    }, 800);
  };

  const treeNodes = [
    { id: 'company-name', label: 'Company Name', icon: Building2, desc: 'Global platform display brand and title' },
    { id: 'logo', label: 'Logo', icon: ImageIcon, desc: 'High-res vector SVG or PNG header insignia' },
    { id: 'favicon', label: 'Favicon', icon: Globe, desc: 'Browser tab bookmark icon and PWA asset' },
    { id: 'primary-color', label: 'Primary Color', icon: Palette, desc: 'Main brand theme & interactive accent' },
    { id: 'secondary-color', label: 'Secondary Color', icon: Sliders, desc: 'Complementary status & contrast tint' },
    { id: 'custom-domain', label: 'Custom Domain', icon: Server, desc: 'CNAME apex routing & TLS handshake' },
    { id: 'email-branding', label: 'Email Branding', icon: Mail, desc: 'Outbound SecOps alert notification styling' },
    { id: 'report-branding', label: 'Report Branding', icon: FileText, desc: 'Executive PDF dossier headers & watermarks' },
    { id: 'login-branding', label: 'Login Branding', icon: Lock, desc: 'Zero-Trust single sign-on ingress portal' },
    { id: 'custom-support', label: 'Custom Support', icon: Headphones, desc: 'Dedicated 24/7 SOC escalation channels' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* TOP HEADER */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sovereign OEM Branding Engine</span>
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-900 text-white font-mono text-xs font-bold">
                  SkyGuard White-Label Suite
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-sans">
                WHITE LABEL SETTINGS
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Rebrand the entire 78-feature SkyGuard cybersecurity stack under your enterprise identity. Custom domain CNAMEs, zero-trust SSO login screens, automated executive reports, and dedicated SOC escalation.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start lg:self-auto">
              <button
                id="btn-tab-settings"
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings Console</span>
              </button>
              <button
                id="btn-tab-preview"
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Sandbox Preview</span>
              </button>
              <button
                id="btn-tab-quote"
                onClick={() => setActiveTab('license-quote')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'license-quote'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>License &amp; Quote</span>
              </button>
            </div>
          </div>
        </section>

        {/* NOTIFICATION BANNER */}
        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2 animate-in fade-in shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>White-Label Branding Settings saved and applied across all active enclaves!</span>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────── */}
        {/* VIEW 1: SETTINGS CONSOLE (WITH EXACT 10-NODE TREE HIERARCHY) */}
        {/* ─────────────────────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Exact Visual Tree Header as specified in prompt */}
            <div className="bg-slate-950 text-slate-200 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-blue-400" />
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    White Label Configuration Topology
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Target Apex: <strong className="text-emerald-400">{settings.customDomain}</strong>
                </span>
              </div>

              <div className="bg-black/60 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                <pre className="text-[12px] leading-relaxed">
{`WHITE LABEL SETTINGS
│
├── Company Name (${settings.companyName})
├── Logo (${settings.logo ? 'Configured' : 'Default'})
├── Favicon (${settings.favicon ? 'Configured' : 'Default'})
├── Primary Color (${settings.primaryColor})
├── Secondary Color (${settings.secondaryColor})
├── Custom Domain (${settings.customDomain})
├── Email Branding (${settings.emailBranding.senderEmail})
├── Report Branding (${settings.reportBranding.watermarkText})
├── Login Branding (${settings.loginBranding.heading.substring(0, 24)}...)
└── Custom Support (${settings.customSupport.supportEmail})`}
                </pre>
              </div>
            </div>

            {/* Two-Column Editor Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: 10 Node Sidebar Navigation */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-3 shadow-sm space-y-1">
                <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-100 mb-1">
                  10 Branding Parameters
                </div>

                {treeNodes.map((node) => {
                  const Icon = node.icon;
                  const isActive = activeNode === node.id;
                  return (
                    <button
                      key={node.id}
                      onClick={() => setActiveNode(node.id as any)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'bg-blue-50 border border-blue-200 text-blue-900 shadow-xs'
                          : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold block">{node.label}</span>
                          <span className="text-[10px] text-slate-500 line-clamp-1">{node.desc}</span>
                        </div>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Node Specific Editor Panel */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                
                {/* 1. Company Name */}
                {activeNode === 'company-name' && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-600 uppercase block">Parameter 1 of 10</span>
                      <h3 className="text-xl font-bold text-slate-900">Company Name &amp; Identity</h3>
                      <p className="text-xs text-slate-500">The primary commercial entity name displayed on headers, browser title bars, and notifications.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">Display Enterprise Name *</label>
                      <input
                        type="text"
                        value={settings.companyName}
                        onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                        placeholder="e.g. ApexShield Global"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* 2. Logo */}
                {activeNode === 'logo' && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-600 uppercase block">Parameter 2 of 10</span>
                      <h3 className="text-xl font-bold text-slate-900">Brand Logo Asset</h3>
                      <p className="text-xs text-slate-500">Vector SVG or high-density PNG asset rendered on the top navigation bar and generated executive reports.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">Logo Image URL</label>
                      <input
                        type="text"
                        value={settings.logo}
                        onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                        placeholder="https://yourdomain.com/assets/logo.png"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 overflow-hidden shadow-xs">
                        <img 
                          src={settings.logo} 
                          alt="Logo Preview" 
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80'; }}
                        />
                      </div>
                      <div className="text-xs space-y-1">
                        <span className="font-bold text-slate-900 block">Logo Rendering Preview</span>
                        <span className="text-[11px] text-slate-500">Recommended dimensions: 320x80px transparent background.</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Favicon */}
                {activeNode === 'favicon' && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-600 uppercase block">Parameter 3 of 10</span>
                      <h3 className="text-xl font-bold text-slate-900">Favicon &amp; Browser Shortcut</h3>
                      <p className="text-xs text-slate-500">Browser tab icon, bookmark icon, and Progressive Web App home screen icon.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">Favicon URL (.ico, .png, .svg)</label>
                      <input
                        type="text"
                        value={settings.favicon}
                        onChange={(e) => setSettings({ ...settings, favicon: e.target.value })}
                        placeholder="https://yourdomain.com/favicon.ico"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* 4. Primary Color */}
                {activeNode === 'primary-color' && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-600 uppercase block">Parameter 4 of 10</span>
                      <h3 className="text-xl font-bold text-slate-900">Primary Brand Color</h3>
                      <p className="text-xs text-slate-500">The dominant action color used for primary buttons, active nav elements, and critical highlights.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Color Hex Code</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={settings.primaryColor}
                            onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                            className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-1"
                          />
                          <input
                            type="text"
                            value={settings.primaryColor}
                            onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                            className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs font-bold"
                          />
                        </div>
                      </div>

                      {/* Quick Palette Presets */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-500 block">Sovereign Presets:</span>
                        <div className="flex items-center gap-2">
                          {[
                            { name: 'Royal Blue', hex: '#2563eb' },
                            { name: 'Sovereign Cyan', hex: '#0891b2' },
                            { name: 'Shield Indigo', hex: '#4f46e5' },
                            { name: 'Emerald Sentinel', hex: '#059669' },
                            { name: 'Deep Crimson', hex: '#e11d48' },
                          ].map((p) => (
                            <button
                              key={p.hex}
                              onClick={() => setSettings({ ...settings, primaryColor: p.hex })}
                              className="w-7 h-7 rounded-lg border border-slate-300 shadow-xs hover:scale-110 transition-transform cursor-pointer"
                              style={{ backgroundColor: p.hex }}
                              title={p.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl text-white text-xs font-bold flex items-center justify-between" style={{ backgroundColor: settings.primaryColor }}>
                      <span>Live Primary Button Rendering</span>
                      <span className="px-2 py-1 rounded bg-black/20 font-mono text-[10px]">Active UI Theme</span>
                    </div>
                  </div>
                )}

                {/* 5. Secondary Color */}
                {activeNode === 'secondary-color' && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-600 uppercase block">Parameter 5 of 10</span>
                      <h3 className="text-xl font-bold text-slate-900">Secondary Accent Color</h3>
                      <p className="text-xs text-slate-500">Accent color used for healthy telemetry indicators, compliance badges, and subtle border glows.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Secondary Hex Code</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={settings.secondaryColor}
                            onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                            className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-1"
                          />
                          <input
                            type="text"
                            value={settings.secondaryColor}
                            onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                            className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Custom Domain */}
                {activeNode === 'custom-domain' && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-600 uppercase block">Parameter 6 of 10</span>
                      <h3 className="text-xl font-bold text-slate-900">Custom Domain &amp; CNAME Routing</h3>
                      <p className="text-xs text-slate-500">Route your corporate domain or subdomain directly into the SkyGuard Zero-Trust edge.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">Custom Hostname (Apex / Subdomain)</label>
                      <input
                        type="text"
                        value={settings.customDomain}
                        onChange={(e) => setSettings({ ...settings, customDomain: e.target.value })}
                        placeholder="e.g. security.myenterprise.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">Required DNS CNAME Record:</span>
                        <button
                          onClick={() => handleCopy(`CNAME ${settings.customDomain} -> ingress.skyguard.mesh`, 'cname-copy')}
                          className="text-blue-600 hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedKey === 'cname-copy' ? 'Copied!' : 'Copy DNS Record'}</span>
                        </button>
                      </div>
                      <div className="p-2.5 rounded-lg bg-black text-emerald-400 text-[11px]">
                        CNAME {settings.customDomain} ➔ ingress.skyguard.mesh (TTL 300)
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-bold pt-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Automated Let's Encrypt TLS Certificate Provisioning Active</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. Email Branding */}
                {activeNode === 'email-branding' && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-600 uppercase block">Parameter 7 of 10</span>
                      <h3 className="text-xl font-bold text-slate-900">Email Notification Branding</h3>
                      <p className="text-xs text-slate-500">Configure outbound security alert digests, incident emails, and two-factor challenge notices.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Sender Display Name</label>
                        <input
                          type="text"
                          value={settings.emailBranding.senderName}
                          onChange={(e) => setSettings({
                            ...settings,
                            emailBranding: { ...settings.emailBranding, senderName: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Sender Email Address</label>
                        <input
                          type="email"
                          value={settings.emailBranding.senderEmail}
                          onChange={(e) => setSettings({
                            ...settings,
                            emailBranding: { ...settings.emailBranding, senderEmail: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Footer Compliance Notice</label>
                      <textarea
                        rows={2}
                        value={settings.emailBranding.footerText}
                        onChange={(e) => setSettings({
                          ...settings,
                          emailBranding: { ...settings.emailBranding, footerText: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-sans"
                      />
                    </div>
                  </div>
                )}

                {/* 8. Report Branding */}
                {activeNode === 'report-branding' && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-600 uppercase block">Parameter 8 of 10</span>
                      <h3 className="text-xl font-bold text-slate-900">Executive Report &amp; Dossier Branding</h3>
                      <p className="text-xs text-slate-500">Configure corporate headers, confidentiality notices, and cryptographic watermark stamps on PDF reports.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Executive Report Header Title</label>
                      <input
                        type="text"
                        value={settings.reportBranding.headerTitle}
                        onChange={(e) => setSettings({
                          ...settings,
                          reportBranding: { ...settings.reportBranding, headerTitle: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Confidentiality Notice</label>
                        <input
                          type="text"
                          value={settings.reportBranding.confidentialityNotice}
                          onChange={(e) => setSettings({
                            ...settings,
                            reportBranding: { ...settings.reportBranding, confidentialityNotice: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Watermark Stamp Text</label>
                        <input
                          type="text"
                          value={settings.reportBranding.watermarkText}
                          onChange={(e) => setSettings({
                            ...settings,
                            reportBranding: { ...settings.reportBranding, watermarkText: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-sans"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. Login Branding */}
                {activeNode === 'login-branding' && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-600 uppercase block">Parameter 9 of 10</span>
                      <h3 className="text-xl font-bold text-slate-900">Zero-Trust Login Portal Branding</h3>
                      <p className="text-xs text-slate-500">Design your branded Single Sign-On (SSO) login page with custom hero photography and corporate legal policies.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Login Heading</label>
                      <input
                        type="text"
                        value={settings.loginBranding.heading}
                        onChange={(e) => setSettings({
                          ...settings,
                          loginBranding: { ...settings.loginBranding, heading: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Login Subheading / Security Policy</label>
                      <input
                        type="text"
                        value={settings.loginBranding.subheading}
                        onChange={(e) => setSettings({
                          ...settings,
                          loginBranding: { ...settings.loginBranding, subheading: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Background Image URL</label>
                      <input
                        type="text"
                        value={settings.loginBranding.backgroundImageUrl || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          loginBranding: { ...settings.loginBranding, backgroundImageUrl: e.target.value }
                        })}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* 10. Custom Support */}
                {activeNode === 'custom-support' && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-600 uppercase block">Parameter 10 of 10</span>
                      <h3 className="text-xl font-bold text-slate-900">Custom SOC Support &amp; Helpdesk</h3>
                      <p className="text-xs text-slate-500">Provide direct escalation contacts to your internal security operations center and ticketing portal.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">SOC Support Email</label>
                        <input
                          type="email"
                          value={settings.customSupport.supportEmail}
                          onChange={(e) => setSettings({
                            ...settings,
                            customSupport: { ...settings.customSupport, supportEmail: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Helpdesk URL</label>
                        <input
                          type="text"
                          value={settings.customSupport.helpdeskUrl}
                          onChange={(e) => setSettings({
                            ...settings,
                            customSupport: { ...settings.customSupport, helpdeskUrl: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">24/7 Incident Hotline</label>
                        <input
                          type="text"
                          value={settings.customSupport.emergencyHotline || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            customSupport: { ...settings.customSupport, emergencyHotline: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Target SLA Response (Hours)</label>
                        <input
                          type="number"
                          min={1}
                          max={24}
                          value={settings.customSupport.tier1SlaHours}
                          onChange={(e) => setSettings({
                            ...settings,
                            customSupport: { ...settings.customSupport, tier1SlaHours: parseInt(e.target.value, 10) || 1 }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-sans"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={handleResetDefaults}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Reset Defaults
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveTab('preview')}
                      className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Result</span>
                    </button>
                    <button
                      onClick={handleSaveSettings}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save &amp; Publish Branding</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────── */}
        {/* VIEW 2: LIVE MULTI-SCREEN PREVIEW SANDBOX */}
        {/* ─────────────────────────────────────────────────────────── */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase font-mono">Select Live Surface:</span>
                <div className="flex items-center gap-1.5">
                  {[
                    { id: 'dashboard', label: 'Console Navbar', icon: Server },
                    { id: 'login', label: 'SSO Login Portal', icon: Lock },
                    { id: 'report', label: 'PDF Report Header', icon: FileText },
                    { id: 'email', label: 'Alert Email', icon: Mail },
                  ].map((s) => {
                    const Icon = s.icon;
                    const isSelected = previewMode === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setPreviewMode(s.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <span className="text-xs font-mono text-slate-500">
                Connected Host: <strong className="text-blue-600">{settings.customDomain}</strong>
              </span>
            </div>

            {/* PREVIEW CONTAINER */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-2xl text-slate-100">
              
              {/* Surface 1: Dashboard Header Preview */}
              {previewMode === 'dashboard' && (
                <div className="space-y-6 font-sans">
                  <div className="p-4 rounded-xl bg-white text-slate-900 border border-slate-200 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-xs"
                        style={{ backgroundColor: settings.primaryColor }}
                      >
                        {settings.companyName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-900">{settings.companyName}</h4>
                        <span className="text-[10px] font-mono text-slate-500 block">{settings.customDomain}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-bold">
                      <span className="px-2.5 py-1 rounded-full text-white text-[10px]" style={{ backgroundColor: settings.secondaryColor }}>
                        ✓ 78/78 Modules Active
                      </span>
                      <span className="text-slate-600">{settings.customSupport.supportEmail}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Platform Security Score</span>
                      <div className="text-3xl font-black text-white" style={{ color: settings.secondaryColor }}>99.8%</div>
                      <span className="text-xs text-slate-400">Zero Critical Vulnerabilities</span>
                    </div>
                    <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Enclave SLA Target</span>
                      <div className="text-3xl font-black text-white">{settings.customSupport.tier1SlaHours} Hour</div>
                      <span className="text-xs text-slate-400">SOC Response Guarantee</span>
                    </div>
                    <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Emergency Escalation</span>
                      <div className="text-base font-bold text-white mt-2">{settings.customSupport.emergencyHotline}</div>
                      <span className="text-xs text-slate-400">24/7 Level-3 Red Phone</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Surface 2: SSO Login Portal Preview */}
              {previewMode === 'login' && (
                <div className="max-w-md mx-auto bg-white text-slate-900 rounded-2xl p-8 border border-slate-200 shadow-xl space-y-5">
                  <div className="text-center space-y-2">
                    <div 
                      className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-xl shadow-md mb-2"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      {settings.companyName.substring(0, 1)}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{settings.loginBranding.heading}</h3>
                    <p className="text-xs text-slate-500">{settings.loginBranding.subheading}</p>
                  </div>

                  <div className="space-y-3 font-sans text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Corporate Email</label>
                      <input 
                        disabled 
                        type="text" 
                        value={`operator@${settings.customDomain}`} 
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 font-mono text-slate-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Hardware Passkey</label>
                      <input 
                        disabled 
                        type="password" 
                        value="••••••••••••••••" 
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 font-mono text-slate-600"
                      />
                    </div>
                    <button 
                      className="w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-sm"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      Authenticate via Zero-Trust SSO
                    </button>
                  </div>

                  <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                    Protected by {settings.companyName} • 
                    <a href={settings.loginBranding.customLegalLink} target="_blank" rel="noreferrer" className="text-blue-600 ml-1 hover:underline">
                      Sovereign Policy
                    </a>
                  </div>
                </div>
              )}

              {/* Surface 3: PDF Report Header Preview */}
              {previewMode === 'report' && (
                <div className="max-w-2xl mx-auto bg-white text-slate-900 rounded-2xl p-8 border border-slate-200 shadow-xl space-y-6 font-sans">
                  <div className="border-b-2 pb-4 flex items-start justify-between" style={{ borderColor: settings.primaryColor }}>
                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase block">
                        {settings.reportBranding.watermarkText}
                      </span>
                      <h3 className="text-base font-black text-slate-900 mt-1">
                        {settings.reportBranding.headerTitle}
                      </h3>
                      <span className="text-xs text-slate-500 font-mono">Issued by: {settings.companyName} SecOps</span>
                    </div>

                    <div 
                      className="px-3 py-1.5 rounded-lg text-white font-bold text-xs"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      PASSED (100%)
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono">
                    <strong className="block mb-1">NOTICE:</strong>
                    {settings.reportBranding.confidentialityNotice}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[10px]">EVIDENCE SIGNATURE</span>
                      <strong className="text-slate-800">sha256:9f8a...31b2</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[10px]">SOVEREIGN HOST</span>
                      <strong className="text-slate-800">{settings.customDomain}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Surface 4: Alert Email Preview */}
              {previewMode === 'email' && (
                <div className="max-w-lg mx-auto bg-white text-slate-900 rounded-2xl p-6 border border-slate-200 shadow-xl space-y-4 font-sans text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] space-y-1">
                    <div><strong>From:</strong> {settings.emailBranding.senderName} &lt;{settings.emailBranding.senderEmail}&gt;</div>
                    <div><strong>Subject:</strong> [SECURITY ALERT] Incident Resolved on {settings.customDomain}</div>
                  </div>

                  <div className="space-y-2 py-2">
                    <h4 className="font-bold text-slate-900 text-sm">Automated Threat Mitigation Completed</h4>
                    <p className="text-slate-600 leading-relaxed">
                      This is an automated Zero-Trust security notification from your <strong>{settings.companyName}</strong> console. An unauthorized origin attempt was quarantined and mitigation token revoked.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg text-white font-mono text-center font-bold text-xs" style={{ backgroundColor: settings.primaryColor }}>
                    Open Incident Dossier in {settings.companyName}
                  </div>

                  <div className="text-[10px] text-slate-400 pt-3 border-t border-slate-100">
                    {settings.emailBranding.footerText}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────── */}
        {/* VIEW 3: LICENSE QUOTE & PROPOSAL GENERATOR */}
        {/* ─────────────────────────────────────────────────────────── */}
        {activeTab === 'license-quote' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 uppercase block mb-1">Enterprise Licensing</span>
                <h2 className="text-2xl font-bold text-slate-900">Request Sovereign OEM Deployment</h2>
                <p className="text-xs text-slate-600 mt-1">
                  Obtain a fully licensed 78-feature SkyGuard stack with dedicated infrastructure, SLA guarantees, and source verification.
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Elena Rostova"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Corporate Email *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. elena@company.com"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Apex Corporation"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Licensing Tier</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setSelectedTier('base')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedTier === 'base'
                          ? 'bg-blue-50 border-blue-500 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <strong className="text-slate-900 block font-sans text-sm">Base License</strong>
                      <span className="text-blue-600 font-mono font-bold">$3–$5 Million</span>
                      <p className="text-[11px] text-slate-500 mt-1">Full 78-feature suite, white-label branding, 5-year SLA.</p>
                    </div>

                    <div
                      onClick={() => setSelectedTier('enterprise')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedTier === 'enterprise'
                          ? 'bg-blue-50 border-blue-500 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <strong className="text-slate-900 block font-sans text-sm">Enterprise Sovereign</strong>
                      <span className="text-blue-600 font-mono font-bold">$15–$25 Million</span>
                      <p className="text-[11px] text-slate-500 mt-1">Dedicated enclave clusters, sovereign cryptographic keys, 24/7 hotline.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Additional OEM Add-Ons ($99–$299/yr)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {whiteLabelInfo.addons.map((add) => {
                      const isChecked = selectedAddons.includes(add.id);
                      return (
                        <div
                          key={add.id}
                          onClick={() => toggleAddon(add.id)}
                          className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-all ${
                            isChecked ? 'bg-blue-50/50 border-blue-300' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-slate-800 block">{add.name}</span>
                            <span className="text-[10px] text-slate-500">{add.price}</span>
                          </div>
                          <input type="checkbox" checked={isChecked} onChange={() => {}} className="rounded text-blue-600" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Compiling Sovereign Quote...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Generate &amp; Submit Sovereign Quote</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Quote Summary or Submitted Result */}
            <div className="lg:col-span-5 space-y-6">
              {submittedProposal ? (
                <div className="bg-white rounded-2xl border border-emerald-300 p-6 sm:p-8 shadow-xl space-y-5">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Sovereign License Proposal Issued</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 font-mono text-xs">
                    <div>Proposal ID: <strong className="text-blue-600">{submittedProposal.proposalId}</strong></div>
                    <div>Target Organization: <strong>{submittedProposal.company}</strong></div>
                    <div>Selected Tier: <strong className="text-slate-900">{submittedProposal.tier}</strong></div>
                    <div>Custom Domain: <strong>{submittedProposal.brandPreview.customDomain}</strong></div>
                    <div>Date: <strong>{submittedProposal.timestamp}</strong></div>
                  </div>

                  <div className="text-xs text-slate-600 leading-relaxed font-sans">
                    A dedicated SkyGuard Enterprise Account Executive and Lead Cryptographic Architect have been assigned to your deployment.
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-4 font-mono text-xs">
                  <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-wider text-[11px]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>White-Label Guarantee Stack</span>
                  </div>

                  <ul className="space-y-2.5 text-slate-300 text-[11px]">
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>Complete 78-feature stack unbranded / custom branded</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>5-Year 99.999% SLA backed by automated failover</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>Multi-tenant workspace isolation with audit logs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>SOC 2, ISO 27001, GDPR &amp; HIPAA auto-evidence</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
