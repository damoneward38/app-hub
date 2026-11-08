import React, { useState, useRef, useEffect } from 'react';
import {
  Shield,
  Cpu,
  Activity,
  ArrowUpRight,
  Radio,
  UserCheck,
  ShieldCheck,
  LogIn,
  LogOut,
  ChevronDown,
  User,
  Fingerprint,
  Lock,
} from 'lucide-react';
import { PageTab } from '../types';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeTab: PageTab;
  setActiveTab: (tab: PageTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { user, isAuthenticated, isAdmin, signOut, openSignInModal } = useAuth();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: PageTab; label: string; count?: string; highlight?: boolean; badge?: string }[] = [
    { id: 'landing', label: 'Overview' },
    { id: 'overview', label: 'Neural Core', badge: 'Nero-4.0', highlight: true },
    { id: 'help', label: 'Voice Guide', badge: 'Mic' },
    { id: 'governor', label: 'Six 686 Governor' },
    { id: 'threats', label: 'Threat Radar', badge: 'Live' },
    { id: 'compliance', label: 'Compliance Vault', badge: 'SOC 2' },
    { id: 'marketplace', label: 'Model Hub' },
    { id: 'telemetry', label: 'Telemetry', badge: '0.4μs' },
    { id: 'readiness', label: 'Readiness Gate', badge: '12/12' },
    { id: 'pipeline', label: 'CI/CD' },
    { id: 'demo', label: 'Sandbox' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0a14]/90 backdrop-blur-xl">
      {/* Top Telemetry & Admin Identity Banner */}
      <div className="w-full bg-[#0d0d1e] border-b border-white/5 px-4 sm:px-10 py-1.5 text-center text-xs font-medium text-slate-300 flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-2 text-[11px] font-mono text-indigo-300 hover:text-indigo-200 transition-colors cursor-pointer"
          title="Click to view Neural Core (Nero-4.0) Architecture"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <span className="tracking-wider uppercase font-semibold text-[10px]">Core Engine Active: Nero-4.0 (View Neural Core)</span>
        </button>

        {/* Authenticated Admin / Sign In Banner Action */}
        <div className="flex items-center gap-2 text-[11px] font-mono">
          {isAuthenticated && user ? (
            <button
              onClick={openSignInModal}
              className="px-2.5 py-0.5 rounded-full bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-500/30 text-indigo-200 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Click to manage access session"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400 text-[10px]">Admin:</span>
              <span className="font-semibold text-white">{user.email}</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                {user.role === 'SUPERADMIN' ? 'ROOT' : user.role}
              </span>
            </button>
          ) : (
            <button
              onClick={openSignInModal}
              className="px-2.5 py-0.5 rounded-full bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Lock className="w-3 h-3 text-indigo-400" />
              <span>Sign In to Enclave</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Six 686 HSM: ARMED</span>
        </div>
      </div>

      {/* Main Immersive Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <button
          id="nav-brand-logo-btn"
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-3.5 text-left group transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.35)] group-hover:scale-105 transition-all">
            <Shield className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300" />
          </div>

          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-white flex items-center gap-2 leading-tight">
              <span>MAGEN-RAKIʿ</span>
              <span className="text-indigo-500 font-bold text-base sm:text-lg">מגן-רקיע</span>
            </h1>
            <p className="text-[9px] uppercase tracking-[0.3em] text-indigo-400/80 font-bold leading-none mt-0.5">
              Powered by Neural Core Engine (Nero-4.0)
            </p>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs uppercase tracking-widest font-semibold text-slate-400">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`transition-all py-1 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'text-white border-b-2 border-indigo-500 font-bold'
                    : 'hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {item.count && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/30 font-mono">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          <button
            id="nav-quick-dashboard-cta"
            onClick={() => setActiveTab('demo')}
            className="bg-white text-black px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-indigo-100 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)] cursor-pointer"
          >
            DASHBOARD
          </button>

          {/* User Sign In / Profile Dropdown */}
          <div className="relative ml-1" ref={dropdownRef}>
            {isAuthenticated && user ? (
              <div>
                <button
                  id="nav-user-profile-btn"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-indigo-500/30 text-slate-200 text-xs transition-all cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-[10px] font-bold text-indigo-300">
                    {user.name ? user.name.slice(0, 2).toUpperCase() : 'DW'}
                  </div>
                  <span className="font-semibold text-white max-w-[110px] truncate text-[11px]">
                    {user.name || user.email}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#0d0d1e] border border-indigo-500/30 rounded-2xl shadow-2xl p-3 z-50 animate-fade-in text-left normal-case">
                    <div className="pb-2.5 mb-2.5 border-b border-slate-800">
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{user.name || 'Damon Ward'}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                        {user.email}
                      </div>
                      <div className="mt-1.5 flex items-center gap-1">
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold">
                          {user.role}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-semibold">
                          HSM ARMED
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          setActiveTab('overview');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs text-indigo-300 flex items-center gap-2 transition-all"
                      >
                        <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Neural Core Engine (Nero-4.0)</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          setActiveTab('help');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs text-slate-300 flex items-center gap-2 transition-all"
                      >
                        <Radio className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Voice Guidance Assistant</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          setActiveTab('governor');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs text-slate-300 flex items-center gap-2 transition-all"
                      >
                        <Shield className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Six 686 Governor</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          openSignInModal();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs text-slate-300 flex items-center gap-2 transition-all"
                      >
                        <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Switch Persona / Credentials</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          signOut();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-950/60 text-xs text-rose-300 flex items-center gap-2 transition-all"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="nav-sign-in-btn"
                onClick={openSignInModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </nav>

        {/* Mobile / Tablet Compact Action CTA & Sign In */}
        <div className="flex lg:hidden items-center gap-2">
          {isAuthenticated && user ? (
            <button
              onClick={openSignInModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-indigo-500/30 text-white text-[11px] font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="max-w-[80px] truncate">{user.name || 'Admin'}</span>
            </button>
          ) : (
            <button
              onClick={openSignInModal}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-bold"
            >
              <LogIn className="w-3 h-3" />
              <span>Sign In</span>
            </button>
          )}

          <button
            id="nav-quick-demo-cta-mobile"
            onClick={() => setActiveTab('demo')}
            className="bg-white text-black px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-indigo-100 transition-all"
          >
            DASHBOARD
          </button>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-[#080812] border-t border-white/10 overflow-x-auto gap-3 text-xs uppercase tracking-widest font-semibold">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={`m-${item.id}`}
              id={`m-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`whitespace-nowrap px-2 py-1 transition-colors ${
                isActive
                  ? 'text-white border-b-2 border-indigo-500 pb-0.5 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};


