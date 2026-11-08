import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subtext?: string;
}

export default function LoadingState({
  message = 'Initializing Secure Enclave Handshake...',
  subtext = 'Validating cryptographic certificates & continuous compliance mesh',
}: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center animate-in fade-in duration-300">
      <div className="relative mb-6">
        {/* Outer glowing pulse ring */}
        <div className="w-16 h-16 rounded-full bg-blue-100 animate-ping opacity-75 absolute inset-0"></div>
        
        {/* Central Icon Container */}
        <div className="relative w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
          <ShieldCheck className="w-8 h-8 animate-pulse" />
        </div>
      </div>

      <h3 className="text-base font-bold text-slate-900 font-sans tracking-tight mb-1">
        {message}
      </h3>
      <p className="text-xs text-slate-500 font-mono max-w-sm">
        {subtext}
      </p>

      {/* Progress ticker bar */}
      <div className="w-48 h-1.5 bg-slate-200 rounded-full mt-6 overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full animate-[shimmer_1.5s_infinite] w-2/3"></div>
      </div>
    </div>
  );
}
