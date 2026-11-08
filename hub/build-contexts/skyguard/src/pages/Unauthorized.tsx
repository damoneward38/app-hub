import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, LogIn, Home } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-widest block mb-1">
          HTTP 401 • Authentication Required
        </span>

        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
          Unauthorized Access
        </h1>

        <p className="text-xs text-slate-600 leading-relaxed mb-6">
          You must authenticate via Zero-Trust single sign-on (SSO) or multi-factor token to access the SkyGuard management console.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Enclave</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Public Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
