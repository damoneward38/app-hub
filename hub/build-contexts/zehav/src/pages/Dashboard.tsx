import { motion, AnimatePresence } from 'motion/react';
import { DollarSign, Users, Unlock, Package, Shield, Zap, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Alert } from '../types';

export default function Dashboard() {
  const [revenue, setRevenue] = useState(12490);
  const [users, setUsers] = useState(842);
  const [unlocks, setUnlocks] = useState(156);
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: '1', type: 'sale', message: 'VaultX Auth System unlocked', time: 'Just now', amount: '+$49', icon: '💰' },
    { id: '2', type: 'sale', message: 'New Pro subscription started', time: '2 min ago', amount: '+$99', icon: '✓' },
    { id: '3', type: 'error', message: 'Suspicious login blocked', time: '5 min ago', icon: '🛡️' }
  ]);

  const stats = [
    { label: 'Total Revenue', value: `$${revenue.toLocaleString()}`, icon: <DollarSign className="text-gold" />, change: '▲ +12% today', trend: 'up' },
    { label: 'Active Users', value: users.toLocaleString(), icon: <Users className="text-green-neon" />, change: '▲ Live now', trend: 'up' },
    { label: 'Unlocks Today', value: unlocks, icon: <Unlock className="text-purple-neon" />, change: '▲ Growing', trend: 'up' },
    { label: 'Files In Vault', value: 6, icon: <Package className="text-cyan-neon" />, change: '● All Active', trend: 'neutral' },
    { label: 'Threats Blocked', value: 0, icon: <Shield className="text-red-neon" />, change: '▲ All Clear', trend: 'up' },
    { label: 'System Uptime', value: '99.9%', icon: <Zap className="text-gold" />, change: '▲ Optimal', trend: 'up' },
  ];

  const addAlert = () => {
    const newAlert: Alert = {
      id: Math.random().toString(),
      type: 'sale',
      message: 'New digital asset unlock',
      time: 'Just now',
      amount: '+$' + (Math.floor(Math.random() * 150) + 10),
      icon: '💰'
    };
    setAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
    setRevenue(prev => prev + 49);
    setUnlocks(prev => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-5xl font-black mb-4">Your <span className="text-gold">Empire</span> Dashboard</h2>
          <p className="text-slate-400 max-w-lg">Real time sales. Live alerts. Full inventory control. Your vault at a glance.</p>
        </div>
        <button 
          onClick={addAlert}
          className="px-6 py-3 rounded-xl border border-gold/40 text-gold text-xs uppercase font-black tracking-widest hover:bg-gold/10 transition-all flex items-center gap-2"
        >
          <TrendingUp size={16} /> Simulate Sale Alert
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card-dark border border-white/5 rounded-2xl p-6 hover:border-gold/30 transition-all"
          >
            <div className="text-2xl mb-4">{stat.icon}</div>
            <div className="text-3xl font-black text-gradient-gold tracking-tight">{stat.value}</div>
            <div className="text-[9px] uppercase font-bold tracking-widest text-slate-500 mt-1">{stat.label}</div>
            <div className={`text-[10px] mt-2 font-bold ${stat.trend === 'up' ? 'text-green-neon' : stat.trend === 'neutral' ? 'text-gold' : 'text-red-neon'}`}>
              {stat.change}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Feed */}
        <div className="lg:col-span-2 bg-card-dark border border-white/5 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black uppercase tracking-[3px] text-slate-500 flex items-center gap-2">
              ⚡ LIVE SALES ALERTS <span className="bg-red-neon/10 border border-red-neon/40 text-red-neon px-2 py-0.5 rounded-full text-[9px] animate-pulse">LIVE</span>
            </h3>
          </div>
          
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  className="flex items-center gap-4 bg-white/2 p-4 rounded-xl border border-white/5"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                    alert.type === 'sale' ? 'bg-gold/10' : 'bg-red-neon/10'
                  }`}>
                    {alert.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-200">{alert.message}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{alert.time}</div>
                  </div>
                  {alert.amount && (
                    <div className="text-lg font-black text-gradient-gold">{alert.amount}</div>
                  )}
                  {!alert.amount && alert.type === 'error' && (
                    <div className="text-[10px] font-black uppercase tracking-widest text-red-neon">Blocked</div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Vault Inventory & Revenue */}
        <div className="space-y-6">
          <div className="bg-card-dark border border-white/5 rounded-3xl p-8 h-full">
            <h3 className="text-xs font-black uppercase tracking-[3px] text-slate-500 mb-8 flex items-center gap-2">
              💰 REVENUE PER FILE
            </h3>
            <div className="space-y-6">
              {[
                { name: 'SaaS Blueprint PDF', fill: 90, total: 387, color: 'gold' },
                { name: 'VaultX SaaS Tool', fill: 75, total: 1188, color: 'cyan' },
                { name: 'CodePulse App', fill: 60, total: 870, color: 'green' },
                { name: 'Auth Guide PDF', fill: 40, total: 460, color: 'red' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{item.name}</span>
                    <span className="text-xs font-black text-gold">${item.total}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.fill}%` }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                      className={`h-full rounded-full shadow-[0_0_10px_rgba(255,215,0,0.2)] ${
                        item.color === 'gold' ? 'bg-gold' : 
                        item.color === 'cyan' ? 'bg-cyan-neon' : 
                        item.color === 'green' ? 'bg-green-neon' : 'bg-red-neon'
                      }`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card-dark border border-[#635BFF]/30 rounded-3xl p-8">
            <h3 className="text-xs font-black uppercase tracking-[3px] text-[#635BFF] mb-4 flex items-center gap-2">
              💳 STRIPE BILLING
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-black text-white">Pro Plan</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Status: Active</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-gradient-gold">$99/mo</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Next bill: 14 days</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
