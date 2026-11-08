import { motion } from 'motion/react';
import { Check, X, Flame } from 'lucide-react';

interface PricingProps {
  triggerToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function Pricing({ triggerToast }: PricingProps) {
  const tiers = [
    {
      name: 'Starter',
      price: '0',
      desc: 'Dip your toes in. Access free tools and explore the vault.',
      color: 'gold',
      feats: [
        { name: '1,000 Storage Units', ok: true },
        { name: '3 App Unlocks/mo', ok: true },
        { name: 'Basic Dashboard', ok: true },
        { name: '1 PDF Upload', ok: true },
        { name: 'CodePulse AI', ok: false },
        { name: 'Quantum Storage', ok: false },
        { name: 'Marketplace Upload', ok: false },
      ]
    },
    {
      name: 'Pro',
      price: '99',
      desc: 'Full power. Upload unlimited apps. Sell everything. Keep all your money.',
      color: 'gold',
      hot: true,
      feats: [
        { name: 'Unlimited Storage', ok: true },
        { name: 'Unlimited App Unlocks', ok: true },
        { name: 'Upload Unlimited Apps', ok: true },
        { name: 'CodePulse AI Full Access', ok: true },
        { name: 'Quantum Brain Access', ok: true },
        { name: 'Individual App Pricing', ok: true },
        { name: 'Full Dashboard + Alerts', ok: true },
      ]
    },
    {
      name: 'Empire',
      price: '299',
      desc: 'You are the platform. Sell access to others. Run multiple vaults.',
      color: 'red',
      feats: [
        { name: 'Everything in Pro', ok: true },
        { name: 'Multi Vault Management', ok: true },
        { name: 'Resell App Access', ok: true },
        { name: 'Custom Domain', ok: true },
        { name: 'Priority Quantum Layer', ok: true },
        { name: 'Revenue Analytics', ok: true },
        { name: '24/7 Dedicated Support', ok: true },
      ]
    },
    {
      name: 'Lifetime',
      price: '999',
      period: ' once',
      desc: 'Pay once. Own ZEHAV forever. Every future feature included.',
      color: 'purple',
      feats: [
        { name: 'Everything. Forever.', ok: true },
        { name: 'All Future Updates', ok: true },
        { name: 'Lifetime Quantum Storage', ok: true },
        { name: 'Never Pay Again', ok: true },
        { name: 'Founding Member Badge', ok: true },
        { name: 'Direct Line to Creator', ok: true },
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-black mb-4">One Price. <span className="text-gold">Everything</span> Included.</h2>
        <p className="text-slate-400 max-w-lg mx-auto">
          No hidden fees. No confusion. One set of prices across the entire ZEHAV empire.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
        {tiers.map((tier, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex flex-col p-8 rounded-3xl bg-card-dark border transition-all ${
              tier.hot ? 'border-gold shadow-[0_0_40px_rgba(255,215,0,0.1)] scale-105 z-10' : 'border-white/5 hover:border-white/20'
            }`}
          >
            {tier.hot && (
              <div className="bg-gold text-black text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full w-fit mb-6 flex items-center gap-1.5 self-center">
                <Flame size={12} fill="currentColor" /> Most Popular
              </div>
            )}
            <div className="text-[10px] uppercase font-bold tracking-[3px] text-gold mb-4">{tier.name}</div>
            <div className="flex items-start gap-1 mb-2">
              <span className="text-xl font-bold text-slate-500 mt-2">$</span>
              <span className="text-6xl font-black tracking-tighter text-gradient-gold">{tier.price}</span>
              <span className="text-sm text-slate-500 self-end mb-2">{tier.period || '/mo'}</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-8 min-h-[4rem]">{tier.desc}</p>
            
            <ul className="space-y-4 mb-10 flex-1">
              {tier.feats.map((feat, j) => (
                <li key={j} className={`flex items-center gap-3 text-sm ${feat.ok ? 'text-slate-200' : 'text-slate-600'}`}>
                  {feat.ok ? <Check size={16} className="text-green-neon" /> : <X size={16} className="text-slate-800" />}
                  {feat.name}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => triggerToast(`${tier.name} plan chosen!`, 'success')}
              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all hover:scale-105 active:scale-95 ${
                tier.hot ? 'bg-gold text-black shadow-[0_0_30px_rgba(255,215,0,0.3)]' : 
                tier.name === 'Lifetime' ? 'bg-linear-to-br from-purple-neon to-cyan-neon text-white' : 
                'border border-gold/30 text-gold hover:bg-gold/5'
              }`}
            >
              Choose {tier.name}
            </button>
          </motion.div>
        ))}
      </div>

      {/* White Label Section */}
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-black text-gradient-gold mb-4 uppercase tracking-wider">👑 White Label ZEHAV</h3>
          <p className="text-slate-400">Rent the entire platform under your brand. Your logo. Your domain. ZEHAV power inside.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'White Label Basic', price: '199', desc: 'Your brand on top of ZEHAV. Simple branded experience.' },
            { name: 'White Label Pro', price: '499', desc: 'Full custom domain, colors, and product suite control.', hot: true },
            { name: 'Pipeline License', price: '999', desc: 'Complete ZEHAV pipeline. Build your own empire on ours.' },
          ].map((tier, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -6 }}
              className={`p-8 rounded-2xl bg-card-dark border ${tier.hot ? 'border-cyan-neon/40 shadow-[0_0_30px_rgba(0,245,255,0.05)]' : 'border-purple-neon/20'} transition-all`}
            >
              <div className="text-[10px] uppercase font-bold tracking-widest text-purple-neon mb-3">{tier.name}</div>
              <div className="text-4xl font-black text-gradient-gold mb-3">${tier.price}<span className="text-sm font-normal text-slate-500">/mo</span></div>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">{tier.desc}</p>
              <button 
                onClick={() => triggerToast(`${tier.name} inquiry sent!`, 'success')}
                className="w-full py-3 rounded-lg bg-linear-to-br from-purple-neon to-cyan-neon text-white text-[10px] uppercase font-black tracking-[2px] hover:shadow-[0_0_20px_rgba(157,0,255,0.2)] transition-all"
              >
                Inquire Now
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
