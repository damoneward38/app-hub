"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Info, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Shell({ children }: { children: React.ReactNode }) {
  const [showWarning, setShowWarning] = useState(true);

  return (
    <div className="min-h-screen bg-[#000508] flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 min-h-screen relative overflow-hidden">
        {children}

        {/* Global Non-Blocking Warning */}
        <AnimatePresence>
          {showWarning && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-6 right-6 left-70 z-50 pointer-events-none"
            >
              <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-2xl p-4 rounded-3xl flex items-center justify-between gap-6 pointer-events-auto shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                    <AlertTriangle size={18} />
                  </div>
                  <p className="text-[10px] md:text-xs text-white/60 leading-relaxed max-w-2xl">
                    <strong className="text-red-400">RESEARCH NOTICE:</strong> This platform is for bio-resonance research only. 
                    Frequencies, acoustic protocols, and O₂ settings are not clinical medical treatments. Use with informed consent.
                  </p>
                </div>
                <button 
                  onClick={() => setShowWarning(false)}
                  className="p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all shadow-lg"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
