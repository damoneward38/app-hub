import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Cpu, 
  Network, 
  KeyRound, 
  Database, 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Terminal, 
  Globe2, 
  Radio,
  FileText
} from 'lucide-react';
import { featureSetsMeta, features } from '../data/features';
import FeatureCard from '../components/FeatureCard';
import FeatureDetailModal from '../components/FeatureDetailModal';
import { Feature } from '../types';

interface LandingProps {
  onOpenRadar?: () => void;
}

export default function Landing({ onOpenRadar }: LandingProps) {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  // Grab representative highlight features
  const highlightFeatures = [
    features[0],  // GDPR Consent Bundle (#1)
    features[13], // SecureServerHub (#14)
    features[26], // Next-Gen WAF (#27)
    features[39], // FIDO2 Passkeys (#40)
    features[52], // Enterprise DLP (#53)
    features[65], // Autonomous SIEM (#66)
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Hero Section with Professional Polish Slate-800 Theme */}
      <section className="px-4 sm:px-8 py-12 md:py-16 bg-slate-800 text-white border-b border-slate-700">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-700/60 border border-slate-600 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span>מגן‑רקיע • 78 Certified Security Modules</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold mb-3 tracking-tight text-white font-sans">
              Secure Your Enterprise with SkyGuard
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light mb-4" dir="rtl">
              הגנה סייבר לכל בית העסק – השמירה על הפרטיות, האבטחה והציות לכל הרגולציה המודרנית במקום אחד.
            </p>

            <p className="text-sm text-slate-300 mb-8 max-w-xl leading-relaxed">
              Complete sovereign protection, zero-trust infrastructure, cryptographic consent pipelines, and automated multi-standard regulatory compliance across GDPR, HIPAA, and ISO 27001.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/pricing"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded shadow-md transition-colors inline-flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Start Free Trial</span>
              </Link>

              <Link
                to="/features/1"
                className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 text-sm font-semibold px-5 py-2.5 rounded transition-colors inline-flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Explore 78 Features</span>
              </Link>

              <Link
                to="/white-label"
                className="text-blue-300 hover:text-white text-sm font-semibold px-4 py-2.5 rounded border border-slate-600 hover:bg-slate-700/50 transition-colors inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>White‑Label Offer</span>
              </Link>
            </div>
          </div>

          {/* Active Coverage Live Widget */}
          <div className="w-full lg:w-80 bg-slate-700/50 p-6 rounded-xl border border-slate-600 shadow-xl space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-1 font-semibold">
                Active Coverage Status
              </p>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-bold font-mono text-blue-400">99.98%</span>
                <span className="text-green-400 text-xs font-bold mb-1">↑ 0.02% 24h</span>
              </div>
              <div className="w-full bg-slate-600 h-1.5 mt-2 rounded-full overflow-hidden">
                <div className="bg-blue-400 h-full w-[99.98%]"></div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-600 space-y-2 text-xs text-slate-300 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Threat Mitigations:</span>
                <span className="text-white font-bold">12,481 / hr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Defensive Layers:</span>
                <span className="text-green-400 font-bold">All 6 Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Average Latency:</span>
                <span className="text-white font-bold">&lt; 0.4 ms</span>
              </div>
            </div>

            {onOpenRadar && (
              <button
                onClick={onOpenRadar}
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 border border-slate-600 text-blue-400 hover:text-blue-300 text-xs font-semibold rounded flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Launch Live Radar Simulator</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 6 Feature Sets Navigator Section */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
              Architectural Breakdown
            </h2>
            <h3 className="text-3xl font-bold text-slate-900 mb-3">
              The 78-Feature Enterprise Security Matrix
            </h3>
            <p className="text-slate-600 text-sm sm:text-base">
              Organized into 6 specialized defensive sets (13 modules each), providing complete end-to-end sovereignty and compliance automation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureSetsMeta.map((s) => (
              <Link
                key={s.set}
                to={`/features/${s.set}`}
                className="group flex flex-col justify-between p-6 rounded-xl bg-white border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 font-mono font-bold text-sm">
                      0{s.set}
                    </span>
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                      Features #{s.range}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                    {s.title}
                  </h4>
                  <p className="text-xs font-medium text-slate-500 mb-2.5" dir="rtl">
                    {s.titleHe}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {s.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                  <span>Browse Set {s.set} (13 Features)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights / Featured Modules Grid */}
      <section className="py-16 bg-slate-100/70 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-1">
                Compliance &amp; Security Focus
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Featured Security &amp; Compliance Modules
              </h3>
            </div>
            <Link
              to="/features/1"
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              <span>View All 78 Modules</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlightFeatures.map((feat) => (
              <FeatureCard 
                key={feat.id} 
                feature={feat} 
                onInspect={(f) => setSelectedFeature(f)} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Standard Assurance Banner */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-slate-900 text-white border border-slate-800 p-8 sm:p-12 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div className="lg:col-span-2 space-y-4">
                <span className="px-3 py-1 rounded text-xs font-semibold bg-slate-800 text-blue-400 border border-slate-700 uppercase tracking-wider">
                  Global Regulatory Ready
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                  Automated Evidence Generation for External Auditors
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  SkyGuard maps technical telemetry from your servers, firewalls, and cryptographic vaults straight to compliance criteria in real-time, eliminating hundreds of manual audit hours.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 font-mono text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>GDPR Article 7 &amp; 32</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>HIPAA § 164.312</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>ISO/IEC 27001:2022</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>AICPA SOC 2 Type II</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>PIPEDA &amp; CCPA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>FIPS 140-3 Level 4</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:items-end">
                <Link
                  to="/pricing"
                  className="w-full sm:w-auto text-center px-6 py-3 rounded font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors text-sm shadow-md"
                >
                  Start Compliance Audit Trial
                </Link>
                <Link
                  to="/white-label"
                  className="w-full sm:w-auto text-center px-6 py-3 rounded font-semibold text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors text-sm"
                >
                  White‑Label Enterprise Solution
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Detail Inspector Modal */}
      <FeatureDetailModal 
        feature={selectedFeature} 
        onClose={() => setSelectedFeature(null)} 
      />
    </div>
  );
}
