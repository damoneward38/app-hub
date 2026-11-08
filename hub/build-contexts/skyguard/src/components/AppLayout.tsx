import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Shield, 
  Lock, 
  FileCheck2, 
  AlertTriangle, 
  BarChart3, 
  Plug, 
  LogOut, 
  Activity, 
  Menu, 
  X, 
  ExternalLink,
  ChevronDown,
  User,
  Sparkles,
  Server,
  Layers
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import LiveRadarSimulator from './LiveRadarSimulator';

export default function AppLayout() {
  const { user, logout, switchRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard, badge: 'Live' },
    { label: 'Workspaces Topology', path: '/app/workspaces', icon: Layers, badge: 'Enclaves', badgeColor: 'bg-indigo-100 text-indigo-700' },
    { label: '1. Security Center', path: '/app/security', icon: Shield, badge: 'WAF/ZT' },
    { label: '2. Privacy Center', path: '/app/privacy', icon: Lock, badge: 'GDPR' },
    { label: '3. Compliance Center', path: '/app/compliance', icon: FileCheck2, badge: '100%' },
    { label: '4. Identity Center', path: '/app/identity', icon: User, badge: 'IAM' },
    { label: '5. Automation Center', path: '/app/automation', icon: Sparkles, badge: 'SOAR' },
    { label: '6. Platform Center', path: '/app/platform', icon: Server, badge: 'Gov' },
    { label: 'Operations & Labs', path: '/app/operations', icon: Activity, badge: 'E2E/Load', badgeColor: 'bg-purple-100 text-purple-700' },
    { label: 'Alerts & Triage', path: '/app/alerts', icon: AlertTriangle, badge: '1 Open', badgeColor: 'bg-rose-100 text-rose-700' },
    { label: 'Assets & Inventory', path: '/app/assets', icon: Layers },
    { label: 'Audit & Reports', path: '/app/reports', icon: BarChart3 },
    { label: 'Active Sessions', path: '/app/sessions', icon: Server },
    { label: 'Integrations', path: '/app/integrations', icon: Plug },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Left: Mobile menu button + Brand */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden cursor-pointer"
              aria-label="Toggle Navigation Sidebar"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/app/dashboard" className="flex items-center gap-3">
              <span className="text-xl font-bold tracking-tight bg-blue-600 px-2.5 py-0.5 rounded text-white shadow-sm">
                מגן‑רקיע
              </span>
              <div className="hidden sm:flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 font-mono tracking-wider">
                    SkyGuard
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-mono font-bold">
                    ENTERPRISE CONSOLE
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {user?.tenantName || 'Sovereign Defense HQ'}
                </span>
              </div>
            </Link>
          </div>

          {/* Center/Right: Live Defense Radar Button & Global Security Status */}
          <div className="flex items-center gap-3">
            {/* Live Radar Button */}
            <button
              onClick={() => setIsRadarOpen(true)}
              className="hidden md:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer shadow-sm"
            >
              <Activity className="w-3.5 h-3.5 animate-spin text-blue-600" style={{ animationDuration: '4s' }} />
              <span>Live Defense Radar</span>
            </button>

            {/* Public website link */}
            <Link
              to="/"
              className="hidden lg:inline-flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 transition-colors px-2 py-1"
            >
              <span>Public Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            {/* User Profile / Role Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-colors cursor-pointer text-left shadow-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {user?.name ? user.name.charAt(0) : 'U'}
                </div>
                <div className="hidden sm:flex flex-col pr-1">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {user?.name || 'Security Officer'}
                  </span>
                  <span className="text-[10px] font-mono text-blue-600 font-semibold capitalize">
                    {user?.role?.replace('_', ' ') || 'Admin'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in duration-150"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                    <p className="text-[11px] font-mono text-slate-500 truncate">{user?.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-[10px] font-mono text-green-700 font-bold uppercase">
                        Plan: {user?.plan || 'Enterprise'}
                      </span>
                    </div>
                  </div>

                  {/* Switch Role interactive section */}
                  <div className="px-4 py-2 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 font-mono">
                      RBAC Persona Switcher:
                    </span>
                    <div className="flex flex-col gap-1 font-mono text-[10px]">
                      <button
                        onClick={() => { switchRole('owner'); setUserDropdownOpen(false); }}
                        className={`p-1.5 rounded flex items-center justify-between ${user?.role === 'owner' ? 'bg-purple-100 text-purple-900 font-bold' : 'hover:bg-slate-100 text-slate-700'}`}
                      >
                        <span>Owner (Full Root)</span>
                        <span className="text-[9px] bg-purple-200 text-purple-800 px-1 rounded">ROOT</span>
                      </button>
                      <button
                        onClick={() => { switchRole('admin'); setUserDropdownOpen(false); }}
                        className={`p-1.5 rounded flex items-center justify-between ${user?.role === 'admin' ? 'bg-blue-100 text-blue-900 font-bold' : 'hover:bg-slate-100 text-slate-700'}`}
                      >
                        <span>Admin (Sec Config)</span>
                        <span className="text-[9px] bg-blue-200 text-blue-800 px-1 rounded">CONFIG</span>
                      </button>
                      <button
                        onClick={() => { switchRole('security_analyst'); setUserDropdownOpen(false); }}
                        className={`p-1.5 rounded flex items-center justify-between ${user?.role === 'security_analyst' ? 'bg-amber-100 text-amber-900 font-bold' : 'hover:bg-slate-100 text-slate-700'}`}
                      >
                        <span>Security Analyst (Alerts/Incidents)</span>
                        <span className="text-[9px] bg-amber-200 text-amber-800 px-1 rounded">SOC</span>
                      </button>
                      <button
                        onClick={() => { switchRole('privacy_officer'); setUserDropdownOpen(false); }}
                        className={`p-1.5 rounded flex items-center justify-between ${user?.role === 'privacy_officer' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'hover:bg-slate-100 text-slate-700'}`}
                      >
                        <span>Privacy Officer (GDPR/DSAR)</span>
                        <span className="text-[9px] bg-emerald-200 text-emerald-800 px-1 rounded">GRC</span>
                      </button>
                      <button
                        onClick={() => { switchRole('viewer'); setUserDropdownOpen(false); }}
                        className={`p-1.5 rounded flex items-center justify-between ${user?.role === 'viewer' ? 'bg-slate-200 text-slate-900 font-bold' : 'hover:bg-slate-100 text-slate-700'}`}
                      >
                        <span>Viewer (Read-Only)</span>
                        <span className="text-[9px] bg-slate-300 text-slate-800 px-1 rounded">READ</span>
                      </button>
                    </div>
                  </div>

                  <div className="px-4 py-2 border-b border-slate-100 flex flex-col gap-1 text-[11px] font-sans">
                    <Link
                      to="/app/sessions"
                      onClick={() => setUserDropdownOpen(false)}
                      className="text-slate-600 hover:text-blue-600 font-medium py-1"
                    >
                      Active Sessions &amp; Hardware →
                    </Link>
                    <Link
                      to="/mfa"
                      onClick={() => setUserDropdownOpen(false)}
                      className="text-slate-600 hover:text-blue-600 font-medium py-1"
                    >
                      MFA &amp; Security Keys →
                    </Link>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out from Enclave</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Body: Sidebar + Main Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 space-y-6">
          {/* Main Navigation links */}
          <nav className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              SkyGuard Mesh Suite
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${item.badgeColor || 'bg-slate-100 text-slate-600'}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick SLA Status Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-green-600" />
                <span>Multi-Cloud Mesh</span>
              </span>
              <span className="text-[11px] font-mono text-green-600 font-bold">100% OK</span>
            </div>
            
            <div className="space-y-1.5 text-[11px] font-mono text-slate-600">
              <div className="flex justify-between">
                <span>Active Modules:</span>
                <span className="font-bold text-slate-900">78 / 78</span>
              </div>
              <div className="flex justify-between">
                <span>Perimeter Uptime:</span>
                <span className="font-bold text-slate-900">99.999%</span>
              </div>
              <div className="flex justify-between">
                <span>Edge Latency:</span>
                <span className="font-bold text-slate-900">&lt; 1.4ms</span>
              </div>
            </div>

            <Link
              to="/white-label"
              className="mt-2 block text-center py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-blue-600 text-[11px] font-bold transition-colors"
            >
              Enterprise White‑Label →
            </Link>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm lg:hidden animate-in fade-in">
            <div className="fixed inset-y-0 left-0 w-72 bg-white p-6 shadow-2xl flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold bg-blue-600 px-2 py-0.5 rounded text-white">
                      מגן‑רקיע
                    </span>
                    <span className="font-mono font-bold text-xs text-slate-900">SkyGuard App</span>
                  </div>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${item.badgeColor || 'bg-slate-100 text-slate-600'}`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Routed Area */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Global Defense Radar Simulator Modal */}
      <LiveRadarSimulator
        isOpen={isRadarOpen}
        onClose={() => setIsRadarOpen(false)}
      />
    </div>
  );
}
