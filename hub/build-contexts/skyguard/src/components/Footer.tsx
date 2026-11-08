import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Globe, Shield, Terminal, ArrowUpRight } from 'lucide-react';
import { featureSetsMeta } from '../data/features';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 text-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-900 font-sans">
                  מגן‑רקיע (SkyGuard)
                </span>
                <span className="text-[10px] font-semibold text-blue-600">
                  Enterprise Cyber Defense
                </span>
              </div>
            </Link>
            <p className="text-slate-600 text-xs leading-relaxed">
              הגנה סייבר לכל בית העסק – השמירה על הפרטיות, האבטחה והציות לכל הרגולציה.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-500">
              SLA 99.999% • 78 Certified Modules • Zero Data Breaches
            </div>
          </div>

          {/* 6 Feature Sets Directory */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              78-Feature Catalog (6 Sets)
            </h4>
            <ul className="space-y-2">
              {featureSetsMeta.map((s) => (
                <li key={s.set}>
                  <Link 
                    to={`/features/${s.set}`}
                    className="hover:text-blue-600 transition-colors flex items-center justify-between text-slate-600 font-medium"
                  >
                    <span>Set {s.set}: {s.title}</span>
                    <span className="font-mono text-[10px] text-slate-400">#{s.range}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing & White-Label */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Licensing &amp; Solutions
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/pricing" className="hover:text-blue-600 transition-colors text-slate-600 font-medium">
                  Basic Plan ($49/mo – 30 Features)
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-blue-600 transition-colors text-slate-600 font-medium">
                  Pro Plan ($149/mo – 60 Features + WAF)
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-blue-600 transition-colors text-slate-600 font-medium">
                  Enterprise Tier (Full 78 Modules + 24/7 SOC)
                </Link>
              </li>
              <li>
                <Link to="/white-label" className="text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 font-bold">
                  <span>White‑Label Licensing ($3M–$25M)</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link to="/white-label" className="hover:text-blue-600 transition-colors text-slate-600 font-medium">
                  5-Year Sovereign SLA &amp; Source Code
                </Link>
              </li>
            </ul>
          </div>

          {/* Regulatory & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Regulatory Frameworks
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <span className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                ✓ GDPR (EU)
              </span>
              <span className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                ✓ HIPAA (USA)
              </span>
              <span className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                ✓ ISO/IEC 27001
              </span>
              <span className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                ✓ SOC 2 Type II
              </span>
              <span className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                ✓ PIPEDA (Canada)
              </span>
              <span className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                ✓ CCPA / CPRA
              </span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-sans">
          <div>
            © {new Date().getFullYear()} מגן‑רקיע (SkyGuard) Security Systems Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-green-600 font-medium">● 99.999% Multi-Cloud Mesh Active</span>
            <span>Zero-Trust Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
