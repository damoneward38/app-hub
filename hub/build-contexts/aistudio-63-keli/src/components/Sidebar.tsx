"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Brain, Wind, Zap, LayoutDashboard, 
  User as UserIcon, LogIn, LogOut, 
  ShieldCheck, Activity, Info
} from "lucide-react";
import { useFirebase } from "./FirebaseProvider";
import { loginWithGoogle, auth } from "../lib/firebase";

export default function Sidebar() {
  const location = useLocation();
  const { user, loading, isAdmin } = useFirebase();

  const navItems = [
    { path: "/", icon: <LayoutDashboard size={20} />, label: "Home" },
    { path: "/healing", icon: <Brain size={20} />, label: "Healing Chamber" },
    { path: "/oxygen", icon: <Wind size={20} />, label: "Oxygen Space" },
  ];

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 bottom-0 w-64 bg-[#00080c] border-r border-white/5 z-50 flex flex-col p-6"
    >
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-cyan-500/20">
          K
        </div>
        <div>
          <div className="font-bold tracking-tight text-white uppercase text-xs">KELI PLATFORM</div>
          <div className="text-[10px] text-cyan-500/50 font-mono font-bold tracking-widest">BIO-RESONANCE</div>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold mb-4 ml-2">Navigation</div>
        {navItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
              location.pathname === item.path 
                ? "bg-white/10 text-white shadow-inner" 
                : "text-white/40 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className={`${location.pathname === item.path ? "text-cyan-400" : "group-hover:text-cyan-400"} transition-colors`}>
              {item.icon}
            </span>
            <span className="text-sm font-bold">{item.label}</span>
          </Link>
        ))}

        {isAdmin && (
          <div className="mt-8">
            <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-500/40 font-bold mb-4 ml-2">Admin Control</div>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-cyan-400/60 hover:bg-cyan-400/5 hover:text-cyan-400 transition-all border border-cyan-400/10">
              <ShieldCheck size={20} />
              <span className="text-sm font-bold">System Logs</span>
            </button>
          </div>
        )}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5">
        {!loading && user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-2 bg-white/5 rounded-2xl border border-white/10">
              <img 
                src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                alt="Avatar" 
                className="w-10 h-10 rounded-xl ring-1 ring-white/20"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black text-white truncate">{user.displayName || "User"}</div>
                <div className="text-[8px] font-mono text-white/40 uppercase truncate">{isAdmin ? "Administrator" : "Standard Key"}</div>
              </div>
            </div>
            <button 
              onClick={() => auth.signOut()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-all border border-red-500/10"
            >
              <LogOut size={14} /> Close Session
            </button>
          </div>
        ) : (
          <button 
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-cyan-500 text-black font-black text-xs uppercase tracking-widest hover:bg-cyan-400 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-cyan-500/20"
          >
            <LogIn size={16} /> Open Keyhole
          </button>
        )}
      </div>
    </motion.aside>
  );
}
