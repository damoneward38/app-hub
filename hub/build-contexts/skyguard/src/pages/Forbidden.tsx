import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft, UserCheck, CheckCircle2, Shield, Lock, AlertTriangle, FileText } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

export default function Forbidden() {
  const { user, switchRole } = useAuth();

  const rolesList: { role: UserRole; title: string; scope: string; badge: string }[] = [
    {
      role: 'owner',
      title: 'OWNER',
      scope: 'Full Access (All 78 Modules & Tenant Administration)',
      badge: 'ROOT'
    },
    {
      role: 'admin',
      title: 'ADMIN',
      scope: 'Security Configuration (WAF rules, Zero-Trust, Enclaves)',
      badge: 'CONFIG'
    },
    {
      role: 'security_analyst',
      title: 'SECURITY ANALYST',
      scope: 'Alerts, Incidents, Reports & Threat Triage',
      badge: 'SOC'
    },
    {
      role: 'privacy_officer',
      title: 'PRIVACY OFFICER',
      scope: 'GDPR, Consent Bundle, Data Requests (DSAR), Crypto Shredding',
      badge: 'GRC'
    },
    {
      role: 'viewer',
      title: 'VIEWER',
      scope: 'Read-Only Telemetry & Dashboard Access',
      badge: 'READ'
    }
  ];

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 text-center font-sans">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldX className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-mono font-bold text-rose-600 uppercase tracking-widest block mb-1">
            HTTP 403 • Role Access Forbidden
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
            Insufficient RBAC Privileges
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your authenticated persona <span className="font-mono font-bold text-slate-900 capitalize">({user?.role?.replace('_', ' ') || 'anonymous'})</span> lacks authorization to mutate or access this security compartment.
          </p>
        </div>

        {/* Role Matrix Simulator */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-left space-y-2">
          <div className="flex items-center justify-between text-slate-700 font-semibold font-sans pb-1 border-b border-slate-200">
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Switch RBAC Persona to Test Access:</span>
            </span>
            <span className="text-[10px] font-mono text-blue-600">Simulated Role</span>
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            {rolesList.map((item) => {
              const isActive = user?.role === item.role;
              return (
                <button
                  key={item.role}
                  onClick={() => switchRole(item.role)}
                  className={`w-full p-2 rounded-lg border transition-all text-left flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <span className="font-bold">{item.title}</span>
                    <span className="text-[10px] text-slate-500 font-sans ml-2">• {item.scope}</span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    isActive ? 'bg-blue-200 text-blue-900' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Link
            to="/app/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Allowed Dashboard</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <span>Public Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
