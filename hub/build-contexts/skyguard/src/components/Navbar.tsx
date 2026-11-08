import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  ChevronDown, 
  Activity, 
  Lock, 
  Layers, 
  Sparkles, 
  Menu, 
  X, 
  Globe,
  FileCheck2,
  ExternalLink,
  LayoutDashboard,
  User
} from 'lucide-react';
import { featureSetsMeta } from '../data/features';
import { useAuth } from '../hooks/useAuth';

interface NavbarProps {
  onOpenRadar?: () => void;
}

export default function Navbar({ onOpenRadar }: NavbarProps) {
  const [featuresDropdownOpen, setFeaturesDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900 text-white shadow-lg">
      {/* Top micro-bar */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-1.5 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-green-400 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            99.999% SLA Operational
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-300 font-mono text-[11px]">
            ALL 78 CYBERSECURITY MODULES ACTIVE
          </span>
        </div>
        <div className="flex items-center gap-3">
          {onOpenRadar && (
            <button
              onClick={onOpenRadar}
              className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors text-xs font-semibold cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 animate-spin text-blue-400" style={{ animationDuration: '4s' }} />
              Live Defense Radar
            </button>
          )}
          <span className="text-slate-500 font-mono text-[11px]">v2.6.4-SEC</span>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link 
              to="/" 
              className="flex items-center gap-3 group focus:outline-none"
            >
              <span className="text-2xl font-bold tracking-tight bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-white shadow-sm transition-colors">
                מגן‑רקיע
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white font-mono tracking-wider">
                  SkyGuard
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                  Enterprise Cyber Defense
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
              <Link
                to="/"
                className={`hover:text-white transition-colors ${
                  location.pathname === '/' ? 'text-white font-semibold' : ''
                }`}
              >
                Overview
              </Link>

              {/* Feature Sets Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setFeaturesDropdownOpen(true)}
                onMouseLeave={() => setFeaturesDropdownOpen(false)}
              >
                <button
                  onClick={() => setFeaturesDropdownOpen(!featuresDropdownOpen)}
                  className={`flex items-center gap-1.5 py-2 hover:text-white transition-colors cursor-pointer ${
                    location.pathname.startsWith('/features') 
                      ? 'text-blue-400 font-semibold' 
                      : 'text-slate-300'
                  }`}
                >
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>Features (78)</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${featuresDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {featuresDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-96 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-3 z-50 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 px-2 text-xs font-semibold text-slate-400">
                      <span className="uppercase tracking-wider">78 Security Modules (6 Sets)</span>
                      <Link 
                        to="/features/1" 
                        onClick={() => setFeaturesDropdownOpen(false)}
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold"
                      >
                        Browse All 1–6 <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                    <div className="space-y-1">
                      {featureSetsMeta.map((s) => (
                        <Link
                          key={s.set}
                          to={`/features/${s.set}`}
                          onClick={() => setFeaturesDropdownOpen(false)}
                          className="group flex items-start gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded bg-slate-800 border border-slate-700 text-blue-400 font-mono text-xs font-bold mt-0.5">
                            {s.set}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 truncate">
                                {s.title}
                              </p>
                              <span className="text-[10px] font-mono text-slate-400">
                                #{s.range}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {s.titleHe}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/pricing"
                className={`hover:text-white transition-colors ${
                  location.pathname === '/pricing' ? 'text-white font-semibold' : ''
                }`}
              >
                Pricing
              </Link>

              <Link
                to="/white-label"
                className={`hover:text-white transition-colors ${
                  location.pathname === '/white-label' 
                    ? 'text-blue-400 font-semibold' 
                    : 'text-blue-400'
                }`}
              >
                White‑Label
              </Link>

              {/* Console Link if authenticated */}
              {isAuthenticated && (
                <Link
                  to="/app/dashboard"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-500/20 border border-blue-500/40 text-blue-300 hover:text-white transition-colors text-xs font-bold font-mono"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Open Console</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Desktop Right CTAs */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/app/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded shadow-md transition-colors inline-flex items-center gap-2 font-mono"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Console ({user?.role?.replace('_', ' ')})</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded shadow-md transition-colors inline-flex items-center justify-center"
                >
                  Start Free Trial
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-900 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            Overview
          </Link>
          
          <div className="border-t border-slate-800 pt-2">
            <div className="px-3 py-1 text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Feature Sets (1–78)
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-1">
              {featureSetsMeta.map((s) => (
                <Link
                  key={s.set}
                  to={`/features/${s.set}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-xs bg-slate-800 border border-slate-700 text-slate-300 hover:text-blue-400"
                >
                  <span className="font-mono font-bold text-blue-400">Set {s.set}</span> ({s.range})
                </Link>
              ))}
            </div>
          </div>

          <Link
            to="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            Pricing Plans
          </Link>

          <Link
            to="/white-label"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-blue-400 hover:bg-slate-800"
          >
            White‑Label Enterprise ($3M–$25M)
          </Link>

          {isAuthenticated && (
            <Link
              to="/app/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-green-400 hover:bg-slate-800 font-mono"
            >
              Go to SkyGuard Console →
            </Link>
          )}

          <div className="pt-2 flex flex-col gap-2">
            {isAuthenticated ? (
              <Link
                to="/app/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-md text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md font-mono"
              >
                Launch Console ({user?.name})
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-md text-sm font-semibold bg-slate-800 text-white hover:bg-slate-700"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-md text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                >
                  Start Free Trial
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
