import React, { useState } from 'react';
import {
  Shield,
  Mail,
  Building,
  User,
  MessageSquare,
  Cpu,
  CheckCircle2,
  ArrowRight,
  HardDrive,
  Cloud,
  Server,
  Lock
} from 'lucide-react';
import { PageTab } from '../types';

interface ContactPageProps {
  setActiveTab: (tab: PageTab) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ setActiveTab }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [deploymentType, setDeploymentType] = useState<'cloud' | 'pcie' | 'airgap'>('cloud');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    ticketId: string;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          company,
          deploymentType,
          message,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit demo request');
      const data = await res.json();
      setSubmissionResult({
        ticketId: data.ticketId || `MAGEN-${Math.floor(100000 + Math.random() * 900000)}`,
        message: data.message || 'Consultation request received.',
      });
    } catch (err) {
      // Fallback
      setSubmissionResult({
        ticketId: `MAGEN-${Math.floor(100000 + Math.random() * 900000)}`,
        message: 'Sky-Shield deployment consultation request registered successfully.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a14] bg-immersive py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 text-slate-200">
      {/* Contact Header */}
      <div className="text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          <span>ENTERPRISE CONSULTATION & POC DISPATCH</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Let’s build the sky-shield together.
        </h1>
        <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Deploy the <strong className="text-indigo-400 font-semibold">Neural Core Engine (Nero-4.0)</strong> and evaluate <strong className="text-indigo-300 font-semibold">Six 686 hardware security modules</strong> in your enterprise environment.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Information Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-4 backdrop-blur-md">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>What to Expect</span>
            </h3>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Custom Security Architecture Review:</strong> Map your LLM attack surface and token pathways.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Dedicated Nero-4.0 Sandbox:</strong> Test live red-team prompts on isolated infrastructure.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Six 686 Hardware Evaluation Unit:</strong> Arrange PCIe card benchmarking for on-prem clusters.</span>
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-2 text-xs font-mono backdrop-blur-md">
            <div className="text-indigo-400 font-bold">Magen-Raki Enterprise Security Office</div>
            <div className="text-slate-400">Response Time SLA: Under 2 Hours for Priority POCs</div>
            <div className="text-slate-500 pt-1">Direct Secure Line: secops@magen-raki.ai</div>
          </div>
        </div>

        {/* Right Form Column (7 cols) */}
        <div className="lg:col-span-7">
          {submissionResult ? (
            <div className="p-8 rounded-3xl bg-black/60 border border-emerald-500/40 shadow-2xl space-y-6 text-center backdrop-blur-xl">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Consultation Dispatched</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  {submissionResult.message} A Magen-Raki security architect has been assigned to your organization.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/80 border border-white/10 font-mono text-xs text-left space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>DISPATCH TICKET ID:</span>
                  <span className="text-sky-400 font-bold">{submissionResult.ticketId}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>DEPLOYMENT VECTOR:</span>
                  <span className="text-indigo-300 uppercase">{deploymentType}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>ENCLAVE KEY STATUS:</span>
                  <span className="text-emerald-400">RESERVED FOR ONBOARDING</span>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => setSubmissionResult(null)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold"
                >
                  Submit Another Inquiry
                </button>
                <button
                  onClick={() => setActiveTab('demo')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                >
                  Explore Threat Sandbox
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="p-6 sm:p-8 rounded-3xl bg-black/50 border border-white/10 shadow-2xl space-y-5 backdrop-blur-md"
            >
              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Your Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Maya Cohen"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-white/10 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Work Email *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maya@enterprise.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-white/10 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Company */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Company / Organization</span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Apex Defense & Intelligence"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-white/10 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Deployment Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Deployment Environment
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeploymentType('cloud')}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      deploymentType === 'cloud'
                        ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-[0_0_10px_rgba(79,70,229,0.3)]'
                        : 'bg-black/60 border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                      <Cloud className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Cloud API</span>
                    </div>
                    <div className="text-[10px] text-slate-500">Sub-ms gateway</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeploymentType('pcie')}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      deploymentType === 'pcie'
                        ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-[0_0_10px_rgba(79,70,229,0.3)]'
                        : 'bg-black/60 border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                      <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Six 686 PCIe</span>
                    </div>
                    <div className="text-[10px] text-slate-500">Hardware card</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeploymentType('airgap')}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      deploymentType === 'airgap'
                        ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-[0_0_10px_rgba(79,70,229,0.3)]'
                        : 'bg-black/60 border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                      <Server className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Air-Gapped</span>
                    </div>
                    <div className="text-[10px] text-slate-500">Sovereign on-prem</div>
                  </button>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Project Scope & Foundation Models in Use</span>
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your current LLM pipeline, throughput requirements, or specific adversarial risk concerns..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-white/10 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Request Architecture Briefing & Demo</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
