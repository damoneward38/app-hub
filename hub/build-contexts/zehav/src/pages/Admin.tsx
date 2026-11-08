import { motion } from 'motion/react';
import { Users, Shield, Zap, RefreshCw, Lock, Trash2, Search, Filter } from 'lucide-react';

interface AdminProps {
  triggerToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function Admin({ triggerToast }: AdminProps) {
  const users = [
    { id: '1', name: 'John Doe', email: 'john@example.com', plan: 'Pro', status: 'Active', revenue: '$1,240' },
    { id: '2', name: 'Alice Smith', email: 'alice@vault.io', plan: 'Empire', status: 'Active', revenue: '$4,800' },
    { id: '3', name: 'Bob Wilson', email: 'bob@gmail.com', plan: 'Starter', status: 'Inactive', revenue: '$0' },
    { id: '4', name: 'Zoe Vault', email: 'zoe@zehav.com', plan: 'Lifetime', status: 'Active', revenue: '$999' },
    { id: '5', name: 'Elias Gold', email: 'elias@elias.io', plan: 'Pro', status: 'Active', revenue: '$840' },
  ];

  const quickActions = [
    { icon: <RefreshCw size={20} />, label: 'Reset Global Vault', color: 'gold' },
    { icon: <Shield size={20} />, label: 'Rotate Master Key', color: 'purple' },
    { icon: <Zap size={20} />, label: 'Quantum Boost', color: 'green' },
    { icon: <Lock size={20} />, label: 'Emergency Lockdown', color: 'red' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-black mb-4">🔧 Admin <span className="text-gold">Panel</span></h2>
        <p className="text-slate-400 max-w-lg mx-auto italic">
          Master control for the ZEHAV empire. Manage users, rotate keys, and override states.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card-dark border border-white/5 rounded-3xl p-6">
            <h3 className="text-xs font-black uppercase tracking-[3px] text-slate-500 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action, i) => (
                <button 
                  key={i}
                  onClick={() => triggerToast(`${action.label} triggered!`, 'info')}
                  className={`flex items-center gap-3 p-4 rounded-xl border border-white/5 hover:border-white/20 transition-all group ${
                    action.color === 'red' ? 'text-red-neon bg-red-neon/5 hover:bg-red-neon/10' :
                    action.color === 'gold' ? 'text-gold bg-gold/5 hover:bg-gold/10' :
                    action.color === 'green' ? 'text-green-neon bg-green-neon/5 hover:bg-green-neon/10' :
                    'text-purple-neon bg-purple-neon/5 hover:bg-purple-neon/10'
                  }`}
                >
                  <span className="group-hover:scale-110 transition-transform">{action.icon}</span>
                  <span className="text-[11px] font-black uppercase tracking-widest">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card-dark border border-white/5 rounded-3xl p-6">
            <h3 className="text-xs font-black uppercase tracking-[3px] text-slate-500 mb-4">System Health</h3>
            <div className="space-y-4">
              {[
                { label: 'Quantum Core', status: 'Optimal', color: 'text-green-neon' },
                { label: 'Stripe Bridge', status: 'Connected', color: 'text-green-neon' },
                { label: 'Cloud Storage', status: '94% Full', color: 'text-gold' },
              ].map((sys, i) => (
                <div key={i} className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-400 uppercase tracking-widest">{sys.label}</span>
                  <span className={`font-black uppercase tracking-widest ${sys.color}`}>{sys.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-card-dark border border-white/5 rounded-3xl p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h3 className="text-xs font-black uppercase tracking-[3px] text-slate-500 flex items-center gap-2">
                <Users size={16} /> User Management
              </h3>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search empire..." 
                    className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:border-gold/40 transition-all"
                  />
                </div>
                <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-white transition-all">
                  <Filter size={14} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="py-4 text-[10px] font-black uppercase tracking-[3px] text-slate-600">Member</th>
                    <th className="py-4 text-[10px] font-black uppercase tracking-[3px] text-slate-600">Plan</th>
                    <th className="py-4 text-[10px] font-black uppercase tracking-[3px] text-slate-600">Status</th>
                    <th className="py-4 text-[10px] font-black uppercase tracking-[3px] text-slate-600">Total Rev</th>
                    <th className="py-4 text-[10px] font-black uppercase tracking-[3px] text-slate-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/2">
                  {users.map((user) => (
                    <tr key={user.id} className="group hover:bg-white/[0.01] transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-linear-to-br from-gold to-green-neon flex items-center justify-center text-[10px] font-black text-black">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-300">{user.name}</div>
                            <div className="text-[10px] text-slate-600 font-mono">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                          user.plan === 'Empire' ? 'border-purple-neon/40 text-purple-neon bg-purple-neon/5' :
                          user.plan === 'Lifetime' ? 'border-gold/40 text-gold bg-gold/5' :
                          user.plan === 'Pro' ? 'border-green-neon/40 text-green-neon bg-green-neon/5' :
                          'border-slate-500 text-slate-500 bg-slate-500/5'
                        }`}>
                          {user.plan}
                        </span>
                      </td>
                      <td className="py-4 text-[10px] font-bold">
                        <span className={user.status === 'Active' ? 'text-green-neon' : 'text-red-neon'}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-4 text-xs font-black text-gradient-gold">{user.revenue}</td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 rounded-lg bg-white/5 hover:bg-gold/10 hover:text-gold transition-all">
                            <Zap size={14} />
                          </button>
                          <button className="p-1.5 rounded-lg bg-white/5 hover:bg-red-neon/10 hover:text-red-neon transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
