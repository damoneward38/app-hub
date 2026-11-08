import React, { useState } from 'react';
import {
  Mail,
  Send,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Building,
  User,
} from 'lucide-react';

export const ContactView: React.FC = () => {
  const [name, setName] = useState('Damone Ward');
  const [email, setEmail] = useState('damoneward38@gmail.com');
  const [company, setCompany] = useState('Taḥnīʿ Hâzoo Operations');
  const [message, setMessage] = useState('Inquiring about deploying an autonomous 200-agent swarm for our media and fin-tech pipelines.');
  const [selectedDate, setSelectedDate] = useState('Tomorrow at 2:00 PM EST');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
          Enterprise Demo & Engineering Consultation
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Connect with the Taḥnīʿ Hâzoo Architecture Team
        </h1>
        <p className="text-sm text-slate-400">
          Request a live technical demonstration of the 200-agent consensus swarm or discuss dedicated custom cybersecurity playbooks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
        {/* Contact & Demo Form */}
        <div className="lg:col-span-7 p-8 rounded-2xl border border-slate-800 bg-slate-900/40">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Demo Request Confirmed</h2>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                Thank you, <strong className="text-white">{name}</strong>. An enterprise solution architect will join your live demo at{' '}
                <strong className="text-cyan-400">{selectedDate}</strong>. Confirmation sent to {email}.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Preferred Demo Timeslot
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option>Tomorrow at 10:00 AM EST</option>
                  <option>Tomorrow at 2:00 PM EST</option>
                  <option>Thursday at 11:30 AM EST</option>
                  <option>Friday at 3:00 PM EST</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Specific Requirements or Architecture Inquiries
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Book Architecture Demo
              </button>
            </form>
          )}
        </div>

        {/* Quick Highlights & Guarantee */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              What to Expect in Your Demo
            </h3>
            <ul className="text-xs text-slate-400 space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>Live walk-through of the 200-agent parallel voting quorum.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>Custom A-to-Z template generator configured for your tech stack.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>PCA-grade immutable audit ledger verification walkthrough.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>Gated security wrapper integration with your existing CI/CD.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl border border-indigo-900/40 bg-indigo-950/20 text-xs space-y-2">
            <div className="font-bold text-white">Direct Engineering Support</div>
            <div className="text-slate-300 font-mono">support@tahnic-hazoo.io</div>
            <div className="text-slate-400 text-[11px]">
              Response SLA: &lt; 15 minutes for Enterprise accounts.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
