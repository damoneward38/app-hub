import React, { useState } from 'react';
import { Feature } from '../types';
import { 
  X, 
  ShieldCheck, 
  Terminal, 
  Play, 
  Check, 
  Copy, 
  FileCode, 
  Lock, 
  Server, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureDetailModalProps {
  feature: Feature | null;
  onClose: () => void;
}

export default function FeatureDetailModal({ feature, onClose }: FeatureDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);

  if (!feature) return null;

  const handleCopy = () => {
    if (feature.apiSample) {
      navigator.clipboard.writeText(feature.apiSample);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRunVerification = () => {
    setIsRunning(true);
    setTestOutput(null);
    setTimeout(() => {
      setIsRunning(false);
      setTestOutput(feature.verificationOutput || 'Verification passed: 0 policy deviations detected.');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-start gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 font-mono text-sm font-bold">
              #{feature.id}
            </span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white text-slate-600 border border-slate-200 font-medium shadow-sm">
                  Set {feature.set} • {feature.category}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-sans">
                {feature.title}
              </h2>
              {feature.titleHe && (
                <p className="text-sm text-blue-600 font-medium mt-0.5" dir="rtl">
                  {feature.titleHe}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shadow-sm"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content (scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          {/* Functional overview */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Functional Description
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {feature.desc}
            </p>
          </div>

          {/* Technical Specs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-blue-600" />
              Technical &amp; Cryptographic Architecture
            </h4>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 leading-relaxed">
              {feature.specs}
            </div>
          </div>

          {/* Compliance Tag Badges */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              Regulatory &amp; Security Compliance Mapping
            </h4>
            <div className="flex flex-wrap gap-2">
              {feature.complianceTags.map((tag, i) => (
                <span 
                  key={i}
                  className="px-3 py-1 rounded-lg bg-green-50 border border-green-200 text-xs font-mono text-green-700 flex items-center gap-1.5 font-medium"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Interactive API/Payload Sandbox */}
          {feature.apiSample && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-600" />
                  Interactive API Endpoint &amp; Verification
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shadow-sm"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={handleRunVerification}
                    disabled={isRunning}
                    className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    {isRunning ? 'Verifying...' : 'Run Simulation'}
                  </button>
                </div>
              </div>

              <pre className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto shadow-inner">
                <code>{feature.apiSample}</code>
              </pre>

              {/* Simulation Result Box */}
              {isRunning && (
                <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs font-mono text-blue-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                  Executing cryptographical verification suite on isolated enclave...
                </div>
              )}

              {testOutput && !isRunning && (
                <div className="mt-3 p-3.5 rounded-lg bg-green-50 border border-green-200 text-xs font-mono text-green-800 flex items-start gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-green-900 block mb-0.5">SIMULATION SUCCESS [HTTP 200 OK]</span>
                    <span>{testOutput}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Feature <span className="font-mono text-slate-900 font-bold">#{feature.id}</span> of <span className="font-mono text-slate-900 font-bold">78</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/pricing"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-sm"
            >
              View Plan Tiers
            </Link>
            <Link
              to="/white-label"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-md"
            >
              <span>License in White‑Label</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
