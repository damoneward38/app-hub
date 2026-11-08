import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function LogoutPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto">
          <LogOut className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest block mb-1">
            Zero-Trust Session Terminated
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
            Successfully Signed Out
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Your ephemeral cryptographic session keys have been erased from browser local memory.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <span>Sign Back In</span>
            <ArrowRight className="w-4 h-4" />
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
