"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import {
  Brain, Radio, Wind, Zap, ChevronDown,
  ArrowRight, Sparkles, Play, Check,
  Activity, Shield, Heart, Eye,
  Volume2, Cpu, Globe, Star,
  AlertTriangle, CheckCircle
} from "lucide-react";
import { lazy, Suspense } from "react";

const MoachToneEngine = lazy(() => import("../components/kol/ToneEngine"));
const GhostTerminal = lazy(() => import("../components/shared/GhostTerminal"));

/* ── Data ────────────────────────────────────────────────── */
const SYSTEMS = [
  {
    name:    "KELI",
    hebrew:  "כְּלִי",
    full:    "כְּלִי הָרְפוּאָה",
    sub:     "Acoustic Body Chamber",
    color:   "#06b6d4",
    icon:    <Radio size={20} />,
    desc:    "20+ organs mapped in 3D. Click any organ. Exact healing frequencies fire from 48 transducers. Cancer cells shatter. Healthy cells untouched.",
    stat:    "FDA Confirmed",
    emoji:   "🔊",
  },
  {
    name:    "REYIAT",
    hebrew:  "רְאִיַּת",
    full:    "רְאִיַּת הַמֹּחַ",
    sub:     "3D Brain Map",
    color:   "#7c3aed",
    icon:    <Brain size={20} />,
    desc:    "19 brain regions in 3D. Pineal gland visible inside. Click any region. Frequencies activate that exact area. Watch coherence build in real time.",
    stat:    "Orch-OR Theory",
    emoji:   "🧠",
  },
  {
    name:    "NESHIMA",
    hebrew:  "נְשִׁימָה",
    full:    "נְשִׁימָה קְדוֹשָׁה",
    sub:     "Hyperbaric O₂ System",
    color:   "#38bdf8",
    icon:    <Wind size={20} />,
    desc:    "Pure oxygen floods the chamber. Cancer cells anaerobic — cannot survive. Telomeres lengthen +20-38%. Combined with sound: maximum cellular effect.",
    stat:    "Tel Aviv 2020",
    emoji:   "💨",
  },
];

const FEATURES = [
  {
    icon:    <Volume2 size={22} />,
    title:   "26 Healing Frequencies",
    desc:    "Complete database. Solfeggio. Schumann. Rife. Binaural. Planetary. Ancient. Every frequency that research has ever confirmed.",
    color:   "#06b6d4",
  },
  {
    icon:    <Brain size={22} />,
    title:   "3D Brain Targeting",
    desc:    "Click the pineal gland. 963Hz fires. See it activate in 3D. Click the hippocampus. Theta waves entrain. Watch memory centers light up.",
    color:   "#7c3aed",
  },
  {
    icon:    <Radio size={22} />,
    title:   "3D Body Organ Map",
    desc:    "Heart beats. Lungs breathe. Click the liver. Healing frequencies load. 48 virtual transducers fire beams toward your target organ.",
    color:   "#10b981",
  },
  {
    icon:    <Wind size={22} />,
    title:   "Oxygen Amplification",
    desc:    "O₂ ramps to 100% during session. Every frequency is amplified inside pressurized oxygen. Effect multiplied exponentially.",
    color:   "#38bdf8",
  },
  {
    icon:    <Cpu size={22} />,
    title:   "RUACH AI Analysis",
    desc:    "AI reads every session. Tells you what each frequency is doing. Which organs are responding. Adapts protocol to your state in real time.",
    color:   "#a855f7",
  },
  {
    icon:    <Activity size={22} />,
    title:   "Live Brain State",
    desc:    "Brain state monitored throughout. Peak Cognition. Deep Meditation. Earth Locked. State updates every 2 seconds based on frequencies playing.",
    color:   "#f59e0b",
  },
  {
    icon:    <Shield size={22} />,
    title:   "8 Complete Protocols",
    desc:    "Full Body Heal. Brain Quantum. Cancer Support. Detox. Cardiovascular. Pain Relief. Deep Sleep. Immune Activation. All pre-built.",
    color:   "#ef4444",
  },
  {
    icon:    <Eye size={22} />,
    title:   "Split View Monitor",
    desc:    "Brain map and body map on one screen simultaneously. Play a frequency. Watch brain AND body respond together. Real time.",
    color:   "#22c55e",
  },
];

const PROOF = [
  {
    title:   "Histotripsy — FDA Approved",
    org:     "HistoSonics / FDA 2023",
    color:   "#22c55e",
    emoji:   "✅",
    desc:    "Focused ultrasound destroys liver tumor cells. No surgery. No radiation. Sound only. First FDA-approved acoustic cancer therapy.",
    confirmed: true,
  },
  {
    title:   "HBOT Telomere +20-38%",
    org:     "Tel Aviv University 2020",
    color:   "#38bdf8",
    emoji:   "🧬",
    desc:    "60 sessions of hyperbaric oxygen. Telomere length increased 20-38%. Senescent cells decreased 37%. Never achieved by any other intervention.",
    confirmed: true,
  },
  {
    title:   "40Hz Immune Activation",
    org:     "MIT Tsai Lab 2016-2024",
    color:   "#f59e0b",
    emoji:   "⚡",
    desc:    "40Hz gamma activates microglia and immune cells. Amyloid plaque reduction confirmed. Multiple peer-reviewed publications.",
    confirmed: true,
  },
  {
    title:   "528Hz DNA Repair",
    org:     "Dr. Glen Rein — JASA",
    color:   "#fbbf24",
    emoji:   "🔬",
    desc:    "528Hz increases UV absorption by DNA 5-9%. DNA repair enzyme activity confirmed. Published in Journal of Acoustical Society.",
    confirmed: true,
  },
  {
    title:   "Rife Frequencies",
    org:     "Dr. Royal Rife 1930s",
    color:   "#a855f7",
    emoji:   "📡",
    desc:    "Mortal Oscillatory Rates identified for specific pathogens. Physics confirmed. Research suppressed 1939. Being re-validated today.",
    confirmed: false,
  },
  {
    title:   "Orch-OR Consciousness",
    org:     "Penrose & Hameroff",
    color:   "#7c3aed",
    emoji:   "🧠",
    desc:    "Microtubules maintain quantum coherence in neurons. 40Hz gamma locks this state. Brain becomes quantum computer.",
    confirmed: true,
  },
];

const PRICING = [
  {
    name:     "OBSERVER",
    hebrew:   "צוֹפֶה",
    price:    0,
    yearly:   0,
    color:    "#64748b",
    desc:     "Begin exploring",
    features: [
      "3D brain map — view only",
      "3D body map — view only",
      "10 frequencies unlocked",
      "3 basic protocols",
      "Community access",
      "7-day session history",
      "1 user",
    ],
    cta:      "Start Free",
    featured: false,
  },
  {
    name:     "HEALER",
    hebrew:   "מְרַפֵּא",
    price:    197,
    yearly:   1970,
    color:    "#06b6d4",
    desc:     "Full healing platform",
    features: [
      "Full 3D brain — all 19 regions",
      "Full 3D body — all 18 organs",
      "All 26 frequencies",
      "All 8 protocols",
      "O₂ chamber integration",
      "RUACH AI analysis",
      "Live brain state monitoring",
      "Session history unlimited",
      "5 users",
      "Email support",
    ],
    cta:      "Begin Healing",
    featured: true,
  },
  {
    name:     "CLINICAL",
    hebrew:   "קְלִינִי",
    price:    997,
    yearly:   9970,
    color:    "#7c3aed",
    desc:     "Clinical deployment",
    features: [
      "Everything in Healer",
      "Custom frequency protocols",
      "Custom organ protocols",
      "NESHER brain monitoring",
      "Full EMET integration",
      "DAAT pipeline unified",
      "Unlimited patients",
      "HIPAA compliant",
      "IRB-ready data export",
      "Priority 24/7 support",
    ],
    cta:      "Deploy Clinical",
    featured: false,
  },
  {
    name:     "SOVEREIGN",
    hebrew:   "שַׁלִּיט",
    price:    4997,
    yearly:   49970,
    color:    "#10b981",
    desc:     "Hospital & research",
    features: [
      "Everything in Clinical",
      "Hardware SDK — real transducers",
      "Phased array control API",
      "Real hyperbaric integration",
      "White-label available",
      "Pharmaceutical data deals",
      "Government contracts",
      "Dedicated engineering team",
      "Custom SLA",
      "Contact: Damone Ward",
    ],
    cta:      "Contact for Demo",
    featured: false,
  },
];

const WHO_BUYS = [
  { emoji:"🏥", who:"Oncology Clinics",      pays:"$997-$4,997/mo",   color:"#ef4444", why:"Histotripsy complement. Frequency therapy platform. Patient outcome tracking. Non-invasive protocols."     },
  { emoji:"🔬", who:"Cancer Research Labs",  pays:"$4,997/mo+",       color:"#a855f7", why:"Frequency response data across cancer types. NIH grant potential. Rife validation. Clinical trial support."  },
  { emoji:"🧠", who:"Neuroscience Labs",     pays:"$997-$4,997/mo",   color:"#7c3aed", why:"Orch-OR research. 40Hz gamma studies. Quantum coherence measurement. Brain-frequency interaction data."      },
  { emoji:"💎", who:"Longevity Clinics",     pays:"$197-$997/mo",     color:"#38bdf8", why:"HBOT telomere protocols. DNA repair frequencies. Anti-aging combined therapy. Full body optimization."       },
  { emoji:"🏃", who:"Athletic Performance",  pays:"$197/mo",          color:"#10b981", why:"Recovery acceleration. 40Hz cognitive optimization. Muscle repair protocols. Concussion recovery."           },
  { emoji:"🛡️", who:"Military Medicine",     pays:"Government",       color:"#fbbf24", why:"Non-drug pain elimination. Battlefield wound healing. Cognitive protection. Operator performance."            },
  { emoji:"🌿", who:"Integrative Medicine",  pays:"$197/mo",          color:"#06b6d4", why:"Evidence-based frequency protocols. Patient education. Complement to conventional treatment."                },
  { emoji:"💊", who:"Pharma Companies",      pays:"$50K-$500K",       color:"#f97316", why:"Frequency response data for drug development. Clinical trial support. Rife frequency validation."            },
];

/* ── Animated healing pod ────────────────────────────────── */
function HealingPodScene() {
  return (
    <div className="absolute inset-0 flex items-center justify-center
                    pointer-events-none overflow-hidden">

      {/* Nebula */}
      {[
        { x:"65%", y:"20%", c:"rgba(6,182,212,0.07)",  w:700 },
        { x:"20%", y:"65%", c:"rgba(124,58,237,0.05)", w:550 },
        { x:"80%", y:"72%", c:"rgba(16,185,129,0.04)", w:450 },
        { x:"10%", y:"30%", c:"rgba(56,189,248,0.04)", w:380 },
      ].map((b, i) => (
        <div key={i} className="absolute rounded-full" style={{
          width: b.w, height: b.w * 0.65,
          left: b.x, top: b.y,
          background: b.c, filter: "blur(90px)",
          transform: "translate(-50%,-50%)",
        }} />
      ))}

      {/* Outer orbit rings */}
      {[
        { size: 580, color: "rgba(6,182,212,0.06)",  speed: 70, tilt: 68 },
        { size: 460, color: "rgba(124,58,237,0.08)", speed: 55, tilt: 73 },
        { size: 350, color: "rgba(16,185,129,0.09)", speed: 42, tilt: 78 },
        { size: 260, color: "rgba(56,189,248,0.11)", speed: 30, tilt: 65 },
      ].map((ring, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width:     ring.size,
            height:    ring.size,
            border:    `1px solid ${ring.color}`,
            top:       "50%",
            left:      "50%",
            transform: `translate(-50%,-50%) rotateX(${ring.tilt}deg)`,
          }}
          animate={{ rotateZ: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: ring.speed, repeat: Infinity, ease: "linear" }}
        />
      ))}

      {/* Central healing pod */}
      <motion.div
        className="relative"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Pod glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(6,182,212,0.15), transparent 70%)",
            width:       300,
            height:      200,
            top:         "50%",
            left:        "50%",
            transform:   "translate(-50%,-50%)",
            filter:      "blur(30px)",
          }}
          animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.15, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Pod body */}
        <div
          className="relative"
          style={{
            width:        240,
            height:       110,
            borderRadius: "50%",
            background:   "linear-gradient(180deg, rgba(6,182,212,0.14) 0%, rgba(16,185,129,0.07) 100%)",
            border:       "1px solid rgba(6,182,212,0.4)",
            boxShadow:    "0 0 50px rgba(6,182,212,0.3), inset 0 0 30px rgba(6,182,212,0.08)",
          }}
        >
          {/* Scan line */}
          <motion.div
            className="absolute left-0 right-0 h-0.5"
            style={{ background: "rgba(6,182,212,0.6)" }}
            animate={{ top: ["-5%", "110%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />

          {/* Person silhouette */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
               style={{
                 width:        20,
                 height:       68,
                 background:   "rgba(6,182,212,0.18)",
                 borderRadius: "50% 50% 35% 35% / 40% 40% 35% 35%",
               }} />

          {/* Brain glow inside person */}
          <motion.div
            className="absolute"
            style={{
              width:      10,
              height:     10,
              top:        "14%",
              left:       "calc(50% - 5px)",
              borderRadius: "50%",
              background:   "#7c3aed",
              boxShadow:    "0 0 12px #7c3aed",
            }}
            animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />

          {/* Heart glow */}
          <motion.div
            className="absolute"
            style={{
              width:      8,
              height:     8,
              top:        "38%",
              left:       "calc(50% - 6px)",
              borderRadius: "50%",
              background:   "#ef4444",
              boxShadow:    "0 0 10px #ef4444",
            }}
            animate={{ scale: [1, 1.3, 1, 1.15, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />

          {/* Sonic waves */}
          {[0.25, 0.5, 0.75].map((x, i) => (
            <motion.div
              key={i}
              className="absolute top-1/4 bottom-1/4"
              style={{
                left:       `${x * 100}%`,
                width:      1,
                background: `rgba(6,182,212,${0.4 - i * 0.1})`,
              }}
              animate={{ scaleY: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5 + i * 0.3, repeat: Infinity }}
            />
          ))}

          {/* O2 bubbles */}
          {Array.from({ length: 6 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width:     Math.random() * 5 + 2,
                height:    Math.random() * 5 + 2,
                left:      `${30 + i * 8}%`,
                bottom:    "10%",
                background: "rgba(56,189,248,0.6)",
                boxShadow:  "0 0 6px rgba(56,189,248,0.8)",
              }}
              animate={{
                y:       [0, -55],
                opacity: [0.8, 0],
                scale:   [1, 0.3],
              }}
              transition={{
                duration:    1.5 + Math.random(),
                delay:       i * 0.3,
                repeat:      Infinity,
                ease:        "easeOut",
              }}
            />
          ))}
        </div>

        {/* Transducer ring */}
        {Array.from({ length: 16 }, (_, i) => {
          const angle = (i / 16) * Math.PI * 2;
          const rx    = 140;
          const ry    = 70;
          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width:     5,
                height:    5,
                left:      `calc(50% + ${Math.cos(angle) * rx}px)`,
                top:       `calc(50% + ${Math.sin(angle) * ry}px)`,
                transform: "translate(-50%,-50%)",
                background: "#06b6d4",
                boxShadow:  "0 0 8px #06b6d4",
              }}
              animate={{
                opacity:   [0.3, 1, 0.3],
                boxShadow: ["0 0 4px #06b6d4","0 0 14px #06b6d4","0 0 4px #06b6d4"],
              }}
              transition={{
                duration: 1.8,
                delay:    i * 0.11,
                repeat:   Infinity,
              }}
            />
          );
        })}

        {/* Frequency labels */}
        {[
          { hz: "528Hz", x: -105, y: -35, color: "#fbbf24" },
          { hz: "40Hz",  x:  105, y: -25, color: "#f59e0b" },
          { hz: "285Hz", x: -95,  y:  45, color: "#06b6d4" },
          { hz: "963Hz", x:  90,  y:  40, color: "#f0abfc" },
          { hz: "7.83",  x:   0,  y: -62, color: "#10b981" },
        ].map((l, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/5 backdrop-blur-md border border-white/10 rounded-lg px-2 py-1 text-[9px]
                       font-mono font-bold"
            style={{
              left:        `calc(50% + ${l.x}px)`,
              top:         `calc(50% + ${l.y}px)`,
              transform:   "translate(-50%,-50%)",
              color:        l.color,
              borderColor: `${l.color}30`,
            }}
            animate={{ opacity: [0.4, 1, 0.4], y: [0, -4, 0] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity }}
          >
            {l.hz}
          </motion.div>
        ))}
      </motion.div>

      {/* Three system nodes orbiting */}
      {SYSTEMS.map((sys, i) => {
        const orbitR = 280;
        const angle  = (i / SYSTEMS.length) * Math.PI * 2;
        const speed  = 18 + i * 7;
        return (
          <motion.div
            key={sys.name}
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
          >
            <div
              className="absolute bg-white/5 backdrop-blur-md border rounded-xl flex flex-col items-center
                         justify-center px-3 py-2"
              style={{
                top:         `calc(50% - ${orbitR}px)`,
                left:        "50%",
                transform:   "translateX(-50%)",
                borderColor: `${sys.color}35`,
                boxShadow:   `0 0 15px ${sys.color}20`,
              }}
            >
              <motion.div
                className="flex flex-col items-center"
                animate={{ rotate: -360 }}
                transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
              >
                <span style={{ color: sys.color }}>{sys.icon}</span>
                <span className="text-[8px] font-mono font-bold mt-0.5"
                      style={{ color: sys.color }}>
                  {sys.name}
                </span>
              </motion.div>
            </div>
          </motion.div>
        );
      })}

      {/* Data rain */}
      {Array.from({ length: 25 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute font-mono text-[9px] pointer-events-none"
          style={{
            left:    `${Math.random() * 100}%`,
            color:   ["#06b6d4","#7c3aed","#10b981","#fbbf24","#38bdf8"][i % 5],
            opacity: 0.2,
          }}
          animate={{ y: ["-5vh", "105vh"], opacity: [0, 0.35, 0] }}
          transition={{
            duration:    4 + Math.random() * 5,
            delay:       Math.random() * 8,
            repeat:      Infinity,
            ease:        "linear",
          }}
        >
          {["528Hz","40Hz","O₂","DNA","kHz","MOR","Rife","ψ","7.83","111Hz"][i % 10]}
        </motion.div>
      ))}

      {/* Stars */}
      {Array.from({ length: 140 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left:      `${Math.random() * 100}%`,
            top:       `${Math.random() * 100}%`,
            width:     Math.random() * 2.5 + 0.5,
            height:    Math.random() * 2.5 + 0.5,
            background: ["#06b6d4","#7c3aed","#10b981","#fbbf24","#ffffff"][i % 5],
            opacity:   Math.random() * 0.45 + 0.1,
          }}
          animate={{ opacity: [0.1, 0.65, 0.1], scale: [1, 1.5, 1] }}
          transition={{
            duration: 2 + Math.random() * 3,
            delay:    Math.random() * 5,
            repeat:   Infinity,
          }}
        />
      ))}
    </div>
  );
}

/* ── Pricing card ────────────────────────────────────────── */
function PricingCard({
  tier, isYearly, index,
}: {
  tier: typeof PRICING[0]; isYearly: boolean; index: number;
}) {
  const price = isYearly && tier.yearly > 0
    ? Math.floor(tier.yearly / 12) : tier.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -6 }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background:     "rgba(0,5,8,0.85)",
        backdropFilter: "blur(20px)",
        border: tier.featured
          ? `1px solid ${tier.color}50`
          : `1px solid ${tier.color}18`,
        boxShadow: tier.featured
          ? `0 0 60px ${tier.color}18` : "none",
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5"
           style={{ background: tier.color }} />

      {tier.featured && (
        <>
          <div className="absolute top-4 right-4 text-[9px] font-mono
                          font-bold px-2 py-1 rounded"
               style={{
                 background: `${tier.color}20`,
                 color:       tier.color,
                 border:     `1px solid ${tier.color}40`,
               }}>
            MOST POPULAR
          </div>
          <div className="absolute inset-0 pointer-events-none"
               style={{
                 background:
                   `radial-gradient(ellipse at top, ${tier.color}05, transparent 60%)`,
               }} />
        </>
      )}

      <div className="p-7">
        <div className="font-hebrew text-2xl font-bold mb-2 mt-1"
             style={{ color: `${tier.color}65` }}>
          {tier.hebrew}
        </div>
        <div className="font-bold text-white text-xl mb-1">{tier.name}</div>
        <p className="text-xs text-white/30 italic mb-5">{tier.desc}</p>

        <div className="mb-4">
          <span className="text-5xl font-bold font-mono"
                style={{ color: tier.featured ? tier.color : "white" }}>
            ${price}
          </span>
          {price > 0 && (
            <span className="text-sm text-white/30 ml-1">/mo</span>
          )}
        </div>

        {isYearly && tier.yearly > 0 && (
          <div className="text-xs font-mono mb-5"
               style={{ color: `${tier.color}65` }}>
            ${tier.yearly}/yr — 2 months free
          </div>
        )}

        <div className="space-y-2 mb-6 text-left">
          {tier.features.map((f, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <Check size={13} className="flex-shrink-0 mt-0.5"
                     style={{ color: tier.color }} />
              <span style={{ color: "rgba(226,232,240,0.55)" }}>{f}</span>
            </div>
          ))}
        </div>

        <Link to="/healing">
          <button
            className="w-full py-3.5 rounded-xl font-bold text-sm
                       transition-all duration-300 hover:scale-105"
            style={
              tier.featured
                ? {
                    background: `linear-gradient(135deg, ${tier.color}, #7c3aed)`,
                    color:      "white",
                    boxShadow:  `0 0 20px ${tier.color}40`,
                  }
                : {
                    background:  `${tier.color}10`,
                    border:      `1px solid ${tier.color}30`,
                    color:        tier.color,
                  }
            }
          >
            {tier.cta}
          </button>
        </Link>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════ */
/*  MAIN PAGE                                                  */
/* ══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [isYearly,     setIsYearly]     = useState(false);
  const [activeSystem, setActiveSystem] = useState(0);
  const [showTones,    setShowTones]    = useState(false);

  const heroRef     = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 700], [1, 0]);
  const heroScale   = useTransform(scrollY, [0, 700], [1, 0.88]);

  useEffect(() => {
    const iv = setInterval(
      () => setActiveSystem(p => (p + 1) % SYSTEMS.length),
      2800,
    );
    return () => clearInterval(iv);
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden"
          style={{ background: "#000508" }}>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div style={{
          position:   "absolute",
          inset:      0,
          background: "radial-gradient(ellipse at 40% 0%, #001a20 0%, #000508 55%, #050520 100%)",
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage:
            "linear-gradient(rgba(6,182,212,0.018) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(6,182,212,0.018) 1px, transparent 1px)",
          backgroundSize: "55px 55px",
        }} />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16
                      flex items-center justify-between px-6"
           style={{
             background:     "rgba(0,5,8,0.92)",
             backdropFilter: "blur(40px)",
             borderBottom:   "1px solid rgba(6,182,212,0.1)",
           }}>
        <Link to="/" className="flex items-center gap-3">
          <motion.div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #06b6d4, #7c3aed, #10b981)" }}
            whileHover={{ scale: 1.1, rotate: 8 }}
            animate={{
              boxShadow: [
                "0 0 12px rgba(6,182,212,0.5)",
                "0 0 30px rgba(6,182,212,0.8)",
                "0 0 12px rgba(6,182,212,0.5)",
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <span className="font-hebrew text-white font-black text-lg">כ</span>
          </motion.div>
          <div>
            <div className="font-bold text-white text-base tracking-wide">
              KELI · REYIAT · NESHIMA
            </div>
            <div className="text-[9px] font-mono"
                 style={{ color: "rgba(6,182,212,0.45)" }}>
              כְּלִי · רְאִיַּת · נְשִׁימָה · UNIFIED HEALING
            </div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {[
            { label: "How It Works", href: "#howit"    },
            { label: "Research",     href: "#research" },
            { label: "Who Buys",     href: "#buyers"   },
            { label: "Pricing",      href: "#pricing"  },
            { label: "Open Platform",href: "/healing"   },
          ].map(item => (
            <a key={item.label} href={item.href}
                  className="px-4 py-2 text-sm rounded-lg transition-all"
                  style={{ color: "rgba(226,232,240,0.4)" }}>
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link to="/healing">
            <motion.button
              className="px-6 py-2 rounded-lg text-sm font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #06b6d4, #7c3aed, #10b981)",
                backgroundSize: "200%",
                boxShadow:  "0 0 20px rgba(6,182,212,0.4)",
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Open Platform
            </motion.button>
          </Link>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════ */}
      {/* HERO                                             */}
      {/* ════════════════════════════════════════════════ */}
      <section ref={heroRef}
               className="relative min-h-screen flex items-center
                          justify-center pt-20">
        <HealingPodScene />

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex justify-center mb-6"
          >
            <div className="flex items-center gap-2 px-8 py-2.5 rounded-full
                            text-sm font-mono tracking-[0.2em] uppercase"
                 style={{
                   background:  "rgba(6,182,212,0.08)",
                   border:      "1px solid rgba(6,182,212,0.2)",
                   color:       "#06b6d4",
                 }}>
              <Sparkles size={12} />
              Body · Brain · Oxygen · Sound · All Unified
              <Sparkles size={12} />
            </div>
          </motion.div>

          {/* Hebrew triple title */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.1, type: "spring" }}
            className="mb-3"
          >
            <h1 className="font-hebrew font-black leading-none"
                style={{
                  fontSize: "clamp(52px, 11vw, 150px)",
                  background:
                    "linear-gradient(135deg, #06b6d4 0%, #ffffff 30%, #7c3aed 60%, #10b981 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 50px rgba(6,182,212,0.3))",
                }}>
              כְּלִי · רְאִיַּת · נְשִׁימָה
            </h1>
          </motion.div>

          {/* Brand */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-bold text-white tracking-[0.12em] uppercase mb-4"
            style={{ fontSize: "clamp(18px, 4vw, 52px)" }}
          >
            KELI · REYIAT · NESHIMA
          </motion.h2>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-2xl mb-3 tracking-[0.1em] uppercase"
            style={{ color: "rgba(226,232,240,0.45)", fontWeight: 300 }}
          >
            The Frequency That Heals Only What Is Broken
          </motion.p>

          {/* Active system */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSystem}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex justify-center mb-10"
            >
              <div className="px-6 py-3 rounded-2xl flex items-center gap-4"
                   style={{
                     background: `${SYSTEMS[activeSystem].color}08`,
                     border:     `1px solid ${SYSTEMS[activeSystem].color}25`,
                   }}>
                <span className="text-2xl">{SYSTEMS[activeSystem].emoji}</span>
                <div className="text-left">
                  <div className="font-bold text-sm"
                       style={{ color: SYSTEMS[activeSystem].color }}>
                    {SYSTEMS[activeSystem].name} — {SYSTEMS[activeSystem].sub}
                  </div>
                  <div className="text-xs"
                       style={{ color: "rgba(226,232,240,0.4)" }}>
                    {SYSTEMS[activeSystem].desc.slice(0, 80)}...
                  </div>
                </div>
                <div className="text-[9px] font-mono px-2 py-0.5 rounded"
                     style={{
                       background: `${SYSTEMS[activeSystem].color}15`,
                       color:       SYSTEMS[activeSystem].color,
                       border:     `1px solid ${SYSTEMS[activeSystem].color}30`,
                     }}>
                  {SYSTEMS[activeSystem].stat}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-14"
          >
            <Link to="/healing">
              <motion.button
                className="flex items-center gap-3 text-lg px-14 py-5
                           rounded-xl font-bold text-white h-full"
                style={{
                  background: "linear-gradient(135deg, #06b6d4, #7c3aed, #10b981)",
                  backgroundSize: "200%",
                  boxShadow:  "0 0 35px rgba(6,182,212,0.5)",
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Play size={22} fill="currentColor" />
                Open Healing Platform
                <ArrowRight size={20} />
              </motion.button>
            </Link>

            <motion.button
              onClick={() => setShowTones(!showTones)}
              className="flex items-center gap-3 text-lg px-14 py-5
                         rounded-xl font-semibold transition-all"
              style={{
                background:  showTones
                  ? "rgba(6,182,212,0.15)"
                  : "rgba(6,182,212,0.08)",
                border:      `1px solid rgba(6,182,212,${showTones ? "0.5" : "0.25"})`,
                color:       "#06b6d4",
              }}
              whileHover={{ borderColor: "rgba(6,182,212,0.5)", scale: 1.02 }}
            >
              <Volume2 size={20} />
              {showTones ? "Hide" : "Play"} Healing Tones
              {showTones && (
                <motion.div
                  className="w-2 h-2 rounded-full bg-cyan-400 ml-1"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-wrap justify-center gap-8 md:gap-14"
          >
            {[
              { v: "3",      l: "Systems Unified",    c: "#06b6d4" },
              { v: "FDA",    l: "Histotripsy Approved",c: "#22c55e" },
              { v: "26",     l: "Healing Frequencies", c: "#7c3aed" },
              { v: "+38%",   l: "Telomere Lengthening",c: "#38bdf8" },
              { v: "40Hz",   l: "Brain Coherence Lock",c: "#f59e0b" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-bold font-mono"
                     style={{ color: s.c, textShadow: `0 0 20px ${s.c}60` }}>
                  {s.v}
                </div>
                <div className="text-xs mt-1 tracking-wider uppercase"
                     style={{ color: "rgba(226,232,240,0.28)" }}>
                  {s.l}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20
                     flex flex-col items-center gap-2"
          style={{ color: "rgba(6,182,212,0.3)" }}
        >
          <span className="text-xs tracking-[0.4em] uppercase font-mono">
            Three Systems
          </span>
          <ChevronDown size={20} />
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════ */}
      {/* THREE SYSTEMS                                    */}
      {/* ════════════════════════════════════════════════ */}
      <section className="relative py-24 px-4" id="howit">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="font-hebrew text-5xl font-black mb-3"
                 style={{ color: "#06b6d4", textShadow: "0 0 20px rgba(6,182,212,0.3)" }}>
              שְׁלֹשָׁה כֵּלִים
            </div>
            <h2 className="font-bold text-white mb-4 lg:text-5xl">
              Three Systems. One Platform.
            </h2>
            <p className="text-white/40 max-w-2xl mx-auto leading-relaxed">
              Each system is complete on its own.
              Together they are exponentially more powerful.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {SYSTEMS.map((sys, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative rounded-2xl p-6 overflow-hidden bg-white/5 border border-white/10"
              >
                <div className="absolute top-0 left-0 right-0 h-px"
                     style={{
                       background:
                         `linear-gradient(90deg, transparent, ${sys.color}, transparent)`,
                     }} />

                {/* System badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                       style={{
                         background: `${sys.color}12`,
                         border:     `1px solid ${sys.color}28`,
                         color:       sys.color,
                       }}>
                    {sys.icon}
                  </div>
                  <div className="text-[10px] font-mono px-2 py-1 rounded"
                       style={{
                         background: `${sys.color}10`,
                         color:       sys.color,
                         border:     `1px solid ${sys.color}25`,
                       }}>
                    {sys.stat}
                  </div>
                </div>

                <div className="font-hebrew text-2xl font-black mb-0.5"
                     style={{ color: sys.color }}>
                  {sys.full}
                </div>
                <div className="font-bold text-white text-xl mb-1">{sys.name}</div>
                <div className="text-xs font-mono mb-4 uppercase tracking-widest"
                     style={{ color: `${sys.color}60` }}>
                  {sys.sub}
                </div>

                <p className="text-sm leading-relaxed text-white/50">
                  {sys.desc}
                </p>

                {/* Mini freq bars */}
                <div className="flex items-end gap-0.5 h-6 mt-4 opacity-30">
                  {Array.from({ length: 20 }, (_, j) => (
                    <motion.div
                      key={j}
                      className="flex-1 rounded-t-sm"
                      style={{ background: sys.color }}
                      animate={{
                        height: [3, 3 + Math.sin(j * 0.6 + i) * 16 + 5, 3],
                      }}
                      transition={{
                        duration: 1.5 + Math.random(),
                        repeat:   Infinity,
                        delay:    j * 0.04,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════ */}
      {/* FEATURES                                         */}
      {/* ════════════════════════════════════════════════ */}
      <section className="relative py-24 px-4 bg-white/5 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-bold text-white mb-4 text-4xl lg:text-5xl tracking-tight">
              Everything In{" "}
              <span className="text-cyan-400">
                One Platform
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="relative rounded-2xl p-6 overflow-hidden bg-white/5 border border-white/10"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                     style={{
                       background: `${f.color}12`,
                       border:     `1px solid ${f.color}25`,
                       color:       f.color,
                     }}>
                  {f.icon}
                </div>

                <div className="font-bold text-white text-sm mb-2 uppercase tracking-wide">{f.title}</div>
                <p className="text-xs leading-relaxed text-white/40">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════ */}
      {/* RESEARCH PROOF                                   */}
      {/* ════════════════════════════════════════════════ */}
      <section className="relative py-24 px-4" id="research">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-bold text-white mb-4 text-5xl tracking-tighter">
              The Science{" "}
              <span className="text-emerald-400">Behind It</span>
            </h2>
            <p className="text-white/40 max-w-2xl mx-auto leading-relaxed">
              Not alternative medicine. Confirmed physics. Published research. Real results.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PROOF.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.02, y: -3 }}
                className="relative rounded-2xl p-5 overflow-hidden bg-white/5 border border-white/10 text-left"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{p.emoji}</span>
                  <div className="text-[9px] font-mono px-2 py-0.5 rounded"
                       style={{
                         background: p.confirmed
                           ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                         color:      p.confirmed ? "#22c55e" : "#f59e0b",
                         border:     `1px solid ${p.confirmed ? "rgba(34,197,94,0.25)" : "rgba(245,158,11,0.25)"}`,
                       }}>
                    {p.confirmed ? "✓ CONFIRMED" : "⚠ HISTORICAL"}
                  </div>
                </div>

                <div className="font-bold text-white mb-1 uppercase tracking-tight">{p.title}</div>
                <div className="text-[10px] font-mono mb-3 uppercase tracking-widest text-white/30">
                  {p.org}
                </div>
                <p className="text-xs leading-relaxed text-white/40">
                  {p.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 p-6 rounded-3xl flex items-start gap-4 bg-red-500/5 border border-red-500/10"
          >
            <AlertTriangle size={24} className="text-red-500 flex-shrink-0" />
            <p className="text-sm leading-relaxed text-white/50 text-left">
              <strong className="text-red-400">Medical Disclaimer: </strong>
              This platform is educational and research-based. The only
              FDA-approved acoustic cancer therapy is Histotripsy for liver cancer.
              Rife frequencies are historical research not approved for medical use.
              Always consult a licensed physician before any therapy.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════ */}
      {/* WHO BUYS                                         */}
      {/* ════════════════════════════════════════════════ */}
      <section className="relative py-24 px-4 bg-white/5" id="buyers">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-bold text-white mb-4 text-5xl tracking-tighter">
              Who Uses{" "}
              <span className="text-cyan-400">This Platform</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHO_BUYS.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.02, y: -3 }}
                className="relative rounded-2xl p-6 overflow-hidden bg-black/40 border border-white/5 text-left"
              >
                <div className="text-3xl mb-3">{b.emoji}</div>
                <div className="font-bold text-white mb-1 uppercase tracking-widest text-xs">{b.who}</div>
                <div className="font-mono font-bold text-xs mb-3"
                     style={{ color: b.color }}>
                  {b.pays}
                </div>
                <p className="text-xs leading-relaxed text-white/40">
                  {b.why}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════ */}
      {/* PRICING                                          */}
      {/* ════════════════════════════════════════════════ */}
      <section className="relative py-24 px-4" id="pricing">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-bold text-white mb-4 text-5xl lg:text-6xl tracking-tighter">
              Choose Your{" "}
              <span className="text-cyan-400">Healing Tier</span>
            </h2>
            <p className="text-white/40 text-lg mb-10">
              Every tier includes the 3D body map, 3D brain map,
              and frequency database.
            </p>

            {/* Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm font-medium uppercase tracking-widest text-white/30">
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className="relative w-16 h-8 rounded-full transition-all bg-white/5 border border-white/10"
              >
                <motion.div
                  animate={{ x: isYearly ? 32 : 4 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="absolute top-1 w-6 h-6 rounded-full bg-cyan-400 shadow-lg"
                />
              </button>
              <span className="text-sm font-medium uppercase tracking-widest text-white/30">
                Yearly
                <span className="ml-2 text-[10px] px-2 py-0.5 rounded font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                  Save 17%
                </span>
              </span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING.map((tier, i) => (
              <PricingCard
                key={tier.name}
                tier={tier}
                isYearly={isYearly}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════ */}
      {/* TONE ENGINE — Play Healing Frequencies           */}
      {/* ════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showTones && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative py-12 px-4"
          >
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <div className="font-hebrew text-3xl font-black mb-2"
                     style={{ color: "#06b6d4", textShadow: "0 0 15px rgba(6,182,212,0.4)" }}>
                  קוֹל הָרְפוּאָה
                </div>
                <h2 className="font-bold text-white text-2xl mb-2">
                  Healing{" "}
                  <span style={{ color: "#06b6d4" }}>Frequency Engine</span>
                </h2>
                <p className="text-sm"
                   style={{ color: "rgba(226,232,240,0.35)" }}>
                  Play any frequency through your speakers or transducer.
                  Watch the body and brain maps respond.
                  Use headphones for binaural beats.
                </p>
              </motion.div>

              <Suspense fallback={
                <div className="w-full h-[300px] bg-black/50 animate-pulse rounded-[32px] flex items-center justify-center">
                  <span className="text-cyan-500 font-mono text-xs">INITIALIZING ENGINE...</span>
                </div>
              }>
                <MoachToneEngine />
              </Suspense>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    hz:    40,
                    name:  "Gamma Brain Lock",
                    color: "#f59e0b",
                    desc:  "MIT confirmed. Microtubule coherence. Immune activation. 40 minutes daily.",
                  },
                  {
                    hz:    528,
                    name:  "DNA Repair",
                    color: "#fbbf24",
                    desc:  "Confirmed by Dr. Glen Rein. UV absorption by DNA increases. Cellular repair.",
                  },
                  {
                    hz:    7.83,
                    name:  "Schumann Earth",
                    color: "#10b981",
                    desc:  "Earth heartbeat. Brain lock frequency. Essential before any session.",
                  },
                ].map((freq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-2xl p-4 text-center"
                    style={{
                      background:     "rgba(0,5,8,0.85)",
                      backdropFilter: "blur(20px)",
                      border:         `1px solid ${freq.color}20`,
                    }}
                  >
                    <div className="font-mono font-black text-3xl mb-1"
                         style={{
                           color:      freq.color,
                           textShadow: `0 0 20px ${freq.color}60`,
                         }}>
                      {freq.hz}Hz
                    </div>
                    <div className="font-bold text-white text-sm mb-2">{freq.name}</div>
                    <p className="text-[10px] leading-relaxed"
                       style={{ color: "rgba(226,232,240,0.4)" }}>
                      {freq.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════ */}
      {/* FINAL CTA                                        */}
      {/* ════════════════════════════════════════════════ */}
      <section className="relative py-32 px-4 bg-white/5 overflow-hidden">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-[40px] p-16 overflow-hidden bg-black/60 backdrop-blur-3xl border border-white/10"
          >
            <div className="relative z-10">
              <div className="font-hebrew text-5xl font-black mb-4 text-cyan-400 drop-shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                רְפוּאָה שְׁלֵמָה
              </div>
              <p className="text-xl mb-4 text-white/30 uppercase tracking-[0.3em]">
                Complete Healing
              </p>

              <h2 className="font-bold text-white mb-6 text-4xl lg:text-5xl tracking-tighter leading-tight">
                Body. Brain. Breath.
                <br />
                <span className="text-cyan-400">
                  All Three. One Platform.
                </span>
              </h2>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/healing">
                  <motion.button
                    className="flex items-center gap-2 px-14 py-5 rounded-2xl
                               font-black text-xs uppercase tracking-widest text-black bg-cyan-400 hover:bg-cyan-300 shadow-2xl shadow-cyan-500/30"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Play size={18} fill="currentColor" />
                    Initiate Chamber
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-20 px-4 text-center bg-black/80 border-t border-white/5">
        <div className="font-hebrew text-4xl font-black mb-3 text-white/20">
          כְּלִי · רְאִיַּת · נְשִׁימָה
        </div>
        <p className="text-xs mb-1 text-white/20 uppercase tracking-[0.2em] font-bold">
          © 2024 KELI REYIAT NESHIMA — UNIFIED HEALING PLATFORM
        </p>
        <p className="text-[10px] text-white/10 font-bold mt-4 max-w-xl mx-auto leading-relaxed">
          רוּחַ · נֶשֶׁר · חַיִּים · דַּעַת · קוֹל · נְשִׁימָה · עַיִן · שַׁעַר · גַּן · רָפָא · אֹרֶךְ · כְּלִי
        </p>
      </footer>

      {/* ── GHOST TERMINAL — floating bottom right ─────────────── */}
      <div className="fixed bottom-6 right-6 z-50 w-[580px] hidden lg:block">
        <Suspense fallback={null}>
          <GhostTerminal />
        </Suspense>
      </div>

      {/* ── Mobile terminal button ───────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        <Suspense fallback={null}>
          <GhostTerminal initialOpen={false} />
        </Suspense>
      </div>
    </main>
  );
}
