"use client";

import {
  useRef, useEffect, useState,
  useCallback, useMemo,
} from "react";
import { motion, AnimatePresence } from "motion/react";

/* ── Body region definition ──────────────────────────────── */
export interface BodyRegion {
  id:            string;
  name:          string;
  hebrew:        string;
  x:             number;
  y:             number;
  width:         number;
  height:        number;
  color:         string;
  activeColor:   string;
  healFreqs:     number[];
  cancerFreqs:   number[];
  conditions:    string[];
  organs:        string[];
  layer:         "surface" | "deep" | "bone";
  side:          "left" | "right" | "center";
}

/* ── All body regions ────────────────────────────────────── */
export const BODY_REGIONS: BodyRegion[] = [
  { id: "brain", name: "Brain", hebrew: "מֹחַ", x: 46, y: 3, width: 8, height: 8, color: "rgba(124,58,237,0.3)", activeColor: "#7c3aed", healFreqs: [40, 528, 963, 7.83], cancerFreqs: [120000, 2128], conditions: ["Brain tumor","Glioma"], organs: ["Cerebrum"], layer: "deep", side: "center" },
  { id: "skull", name: "Skull/Head", hebrew: "גּוּלְגֹּלֶת", x: 44, y: 2, width: 12, height: 10, color: "rgba(148,163,184,0.2)", activeColor: "#94a3b8", healFreqs: [40, 111, 528], cancerFreqs: [2128, 11780], conditions: ["Head cancer"], organs: ["Skull"], layer: "bone", side: "center" },
  { id: "throat", name: "Throat/Neck", hebrew: "גָּרוֹן", x: 47, y: 12, width: 6, height: 5, color: "rgba(6,182,212,0.25)", activeColor: "#06b6d4", healFreqs: [528, 741, 285], cancerFreqs: [728, 2128], conditions: ["Throat cancer","Thyroid"], organs: ["Thyroid"], layer: "surface", side: "center" },
  { id: "lung-left", name: "Left Lung", hebrew: "רֵאָה שְׂמֹאל", x: 37, y: 18, width: 9, height: 12, color: "rgba(56,189,248,0.25)", activeColor: "#38bdf8", healFreqs: [528, 285, 432], cancerFreqs: [728, 784, 2128], conditions: ["Lung cancer"], organs: ["Left lung"], layer: "deep", side: "left" },
  { id: "lung-right", name: "Right Lung", hebrew: "רֵאָה יָמִין", x: 54, y: 18, width: 9, height: 12, color: "rgba(56,189,248,0.25)", activeColor: "#38bdf8", healFreqs: [528, 285, 432], cancerFreqs: [728, 784, 2128], conditions: ["Lung cancer"], organs: ["Right lung"], layer: "deep", side: "right" },
  { id: "heart", name: "Heart", hebrew: "לֵב", x: 44, y: 20, width: 8, height: 7, color: "rgba(239,68,68,0.3)", activeColor: "#ef4444", healFreqs: [54, 432, 528], cancerFreqs: [2128], conditions: ["Arrhythmia"], organs: ["Heart"], layer: "deep", side: "center" },
  { id: "breast-left", name: "Left Breast", hebrew: "שַׁד שְׂמֹאל", x: 36, y: 22, width: 7, height: 6, color: "rgba(236,72,153,0.25)", activeColor: "#ec4899", healFreqs: [528, 285, 174], cancerFreqs: [400, 784], conditions: ["Breast cancer"], organs: ["Breast"], layer: "surface", side: "left" },
  { id: "breast-right", name: "Right Breast", hebrew: "שַׁד יָמִין", x: 57, y: 22, width: 7, height: 6, color: "rgba(236,72,153,0.25)", activeColor: "#ec4899", healFreqs: [528, 285, 174], cancerFreqs: [400, 784], conditions: ["Breast cancer"], organs: ["Breast"], layer: "surface", side: "right" },
  { id: "liver", name: "Liver", hebrew: "כָּבֵד", x: 54, y: 31, width: 9, height: 7, color: "rgba(249,115,22,0.3)", activeColor: "#f97316", healFreqs: [528, 741, 432], cancerFreqs: [2128, 728], conditions: ["Liver cancer"], organs: ["Liver"], layer: "deep", side: "right" },
  { id: "stomach", name: "Stomach", hebrew: "קֵבָה", x: 44, y: 31, width: 8, height: 6, color: "rgba(251,191,36,0.25)", activeColor: "#fbbf24", healFreqs: [528, 285, 174], cancerFreqs: [2128, 728], conditions: ["Stomach cancer"], organs: ["Stomach"], layer: "deep", side: "center" },
  { id: "spleen", name: "Spleen", hebrew: "טְחוֹל", x: 37, y: 31, width: 6, height: 5, color: "rgba(168,85,247,0.25)", activeColor: "#a855f7", healFreqs: [528, 432], cancerFreqs: [728, 2008], conditions: ["Lymphoma"], organs: ["Spleen"], layer: "deep", side: "left" },
  { id: "pancreas", name: "Pancreas", hebrew: "לַבְלָב", x: 43, y: 36, width: 14, height: 4, color: "rgba(6,182,212,0.25)", activeColor: "#06b6d4", healFreqs: [528, 285, 40], cancerFreqs: [2128, 728], conditions: ["Pancreatic cancer"], organs: ["Pancreas"], layer: "deep", side: "center" },
  { id: "intestine-small", name: "Small Intestine", hebrew: "מֵעִי דַּק", x: 42, y: 40, width: 16, height: 8, color: "rgba(16,185,129,0.2)", activeColor: "#10b981", healFreqs: [285, 528], cancerFreqs: [728, 2128], conditions: ["Bowel cancer"], organs: ["Small Intestine"], layer: "deep", side: "center" },
  { id: "intestine-large", name: "Large Intestine", hebrew: "מֵעִי גָּדוֹל", x: 38, y: 47, width: 24, height: 8, color: "rgba(16,185,129,0.25)", activeColor: "#34d399", healFreqs: [285, 528, 174], cancerFreqs: [728, 2128], conditions: ["Colon cancer"], organs: ["Colon"], layer: "deep", side: "center" },
  { id: "prostate", name: "Prostate", hebrew: "עֲרָמֶה", x: 46, y: 56, width: 8, height: 5, color: "rgba(59,130,246,0.3)", activeColor: "#3b82f6", healFreqs: [528, 1550], cancerFreqs: [1550, 728], conditions: ["Prostate cancer"], organs: ["Prostate"], layer: "deep", side: "center" },
  { id: "uterus-ovary", name: "Uterus/Ovaries", hebrew: "רֶחֶם", x: 43, y: 55, width: 14, height: 7, color: "rgba(236,72,153,0.3)", activeColor: "#f472b6", healFreqs: [528, 639], cancerFreqs: [728, 2128], conditions: ["Ovarian cancer"], organs: ["Uterus"], layer: "deep", side: "center" },
  { id: "kidney-left", name: "Left Kidney", hebrew: "כְּלִיָּה שְׂמֹאל", x: 36, y: 35, width: 5, height: 7, color: "rgba(249,115,22,0.25)", activeColor: "#fb923c", healFreqs: [528, 741], cancerFreqs: [728, 2128], conditions: ["Kidney cancer"], organs: ["Left Kidney"], layer: "deep", side: "left" },
  { id: "kidney-right", name: "Right Kidney", hebrew: "כְּלִיָּה יָמִין", x: 59, y: 35, width: 5, height: 7, color: "rgba(249,115,22,0.25)", activeColor: "#fb923c", healFreqs: [528, 741], cancerFreqs: [728, 2128], conditions: ["Kidney cancer"], organs: ["Right Kidney"], layer: "deep", side: "right" },
  { id: "arm-left", name: "Left Arm", hebrew: "זְרוֹעַ שְׂמֹאל", x: 27, y: 20, width: 6, height: 25, color: "rgba(148,163,184,0.15)", activeColor: "#94a3b8", healFreqs: [285, 528], cancerFreqs: [2008, 728], conditions: ["Sarcoma"], organs: ["Arm"], layer: "surface", side: "left" },
  { id: "arm-right", name: "Right Arm", hebrew: "זְרוֹעַ יָמִין", x: 67, y: 20, width: 6, height: 25, color: "rgba(148,163,184,0.15)", activeColor: "#94a3b8", healFreqs: [285, 528], cancerFreqs: [2008, 728], conditions: ["Sarcoma"], organs: ["Arm"], layer: "surface", side: "right" },
  { id: "leg-left", name: "Left Leg", hebrew: "רֶגֶל שְׂמֹאל", x: 40, y: 63, width: 7, height: 30, color: "rgba(148,163,184,0.15)", activeColor: "#94a3b8", healFreqs: [285, 32], cancerFreqs: [2008, 728], conditions: ["Bone cancer"], organs: ["Leg"], layer: "surface", side: "left" },
  { id: "leg-right", name: "Right Leg", hebrew: "רֶגֶל יָמִין", x: 53, y: 63, width: 7, height: 30, color: "rgba(148,163,184,0.15)", activeColor: "#94a3b8", healFreqs: [285, 32], cancerFreqs: [2008, 728], conditions: ["Bone cancer"], organs: ["Leg"], layer: "surface", side: "right" },
  { id: "skin", name: "Skin (Full Body)", hebrew: "עוֹר", x: 25, y: 2, width: 50, height: 93, color: "rgba(253,186,116,0.08)", activeColor: "#fdba74", healFreqs: [285, 528], cancerFreqs: [728, 2128], conditions: ["Melanoma"], organs: ["Epidermis"], layer: "surface", side: "center" },
  { id: "lymph", name: "Lymphatic System", hebrew: "מַעֲרֶכֶת לִימְפָה", x: 33, y: 15, width: 34, height: 55, color: "rgba(34,197,94,0.06)", activeColor: "#22c55e", healFreqs: [528, 40], cancerFreqs: [728, 2008], conditions: ["Lymphoma"], organs: ["Lymph nodes"], layer: "deep", side: "center" },
];

export const CANCER_FREQUENCIES: Record<string, { name: string; hz: number[]; color: string; confirmed: boolean; }> = {
  carcinoma: { name: "Carcinoma", hz: [2128, 728, 784, 880], color: "#ef4444", confirmed: false },
  sarcoma: { name: "Sarcoma", hz: [2008, 728, 784], color: "#f97316", confirmed: false },
  leukemia: { name: "Leukemia", hz: [728, 784, 880, 2008], color: "#a855f7", confirmed: false },
  breast: { name: "Breast Cancer", hz: [400, 784, 2128, 728], color: "#ec4899", confirmed: false },
  prostate: { name: "Prostate Cancer", hz: [1550, 728, 2128], color: "#3b82f6", confirmed: false },
  lung: { name: "Lung Cancer", hz: [728, 784, 2128], color: "#38bdf8", confirmed: false },
  colon: { name: "Colon Cancer", hz: [728, 2128, 2008], color: "#10b981", confirmed: false },
  liver: { name: "Liver Cancer", hz: [2128, 728, 784], color: "#f59e0b", confirmed: false },
  melanoma: { name: "Melanoma", hz: [728, 784, 880, 2128], color: "#6366f1", confirmed: false },
  histotripsy: { name: "Histotripsy (FDA Approved)", hz: [100000, 1000000, 3000000], color: "#22c55e", confirmed: true },
};

interface BodyMap3DProps {
  activeFrequencies:  number[];
  targetedRegions:    string[];
  onRegionClick:      (region: BodyRegion) => void;
  sessionActive:      boolean;
  oxygenLevel:        number;
}

export default function BodyMap3D({
  activeFrequencies,
  targetedRegions,
  onRegionClick,
  sessionActive,
}: BodyMap3DProps) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const animRef     = useRef<number>(0);
  const frameRef    = useRef(0);
  const [selected,  setSelected]  = useState<BodyRegion | null>(null);
  const [hovered,   setHovered]   = useState<BodyRegion | null>(null);

  const activatedRegions = useMemo(() => {
    const set = new Set<string>();
    BODY_REGIONS.forEach(region => {
      const freqMatch = region.healFreqs.some(hz => activeFrequencies.some(af => Math.abs(af - hz) < 5)) || 
                        region.cancerFreqs.some(hz => activeFrequencies.some(af => Math.abs(af - hz) < 50));
      if (freqMatch) set.add(region.id);
    });
    return set;
  }, [activeFrequencies]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const draw = () => {
      frameRef.current++;
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      canvas.width  = W * window.devicePixelRatio;
      canvas.height = H * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      ctx.clearRect(0, 0, W, H);

      ctx.beginPath();
      ctx.ellipse(W * 0.5, H * 0.07, W * 0.065, H * 0.055, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,13,20,0.8)";
      ctx.fill();

      ctx.beginPath();
      ctx.roundRect(W * 0.35, H * 0.16, W * 0.3, H * 0.45, 8);
      ctx.fillStyle = "rgba(0,13,20,0.8)";
      ctx.fill();

      BODY_REGIONS.forEach(region => {
        if (region.id === "skin" || region.id === "lymph") return;
        const rx = (region.x / 100) * W;
        const ry = (region.y / 100) * H;
        const rw = (region.width / 100) * W;
        const rh = (region.height / 100) * H;
        const isFreqActive = activatedRegions.has(region.id);
        const isTargeted = targetedRegions.includes(region.id);
        const isSelected = selected?.id === region.id;
        const isHovered = hovered?.id === region.id;
        const pulse = isFreqActive || isTargeted ? Math.sin(frameRef.current * 0.08) * 0.3 + 0.7 : 0.5;

        ctx.beginPath();
        ctx.roundRect(rx, ry, rw, rh, 4);
        if (isTargeted) {
          ctx.fillStyle = `rgba(239, 68, 68, ${0.4 * pulse})`;
          ctx.shadowBlur = 15;
          ctx.shadowColor = "#ef4444";
        } else if (isFreqActive) {
          ctx.fillStyle = `${region.activeColor}${Math.round(pulse * 60).toString(16).padStart(2, '0')}`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = region.activeColor;
        } else {
          ctx.fillStyle = region.color;
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = isSelected ? region.activeColor : isTargeted ? "#ef4444" : "rgba(6,182,212,0.2)";
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.stroke();

        if (isSelected || isHovered) {
          ctx.font = "bold 10px Space Grotesk";
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "center";
          ctx.fillText(region.name, rx + rw/2, ry - 5);
        }
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [activatedRegions, targetedRegions, selected, hovered, sessionActive, activeFrequencies]);

  return (
    <div className="relative w-full overflow-hidden">
      <canvas ref={canvasRef} className="w-full rounded-2xl cursor-crosshair" style={{ height: 600, background: "rgba(0,5,8,0.95)", border: "1px solid rgba(6,182,212,0.1)" }}
        onClick={(e) => {
          const rect = canvasRef.current!.getBoundingClientRect();
          const mx = ((e.clientX - rect.left) / rect.width) * 100;
          const my = ((e.clientY - rect.top) / rect.height) * 100;
          let f = null;
          BODY_REGIONS.forEach(r => { if (mx >= r.x && mx <= r.x + r.width && my >= r.y && my <= r.y + r.height) f = r; });
          if (f) { setSelected(prev => prev?.id === f?.id ? null : f); onRegionClick(f); }
        }}
        onMouseMove={(e) => {
          const rect = canvasRef.current!.getBoundingClientRect();
          const mx = ((e.clientX - rect.left) / rect.width) * 100;
          const my = ((e.clientY - rect.top) / rect.height) * 100;
          let f = null;
          BODY_REGIONS.forEach(r => { if (mx >= r.x && mx <= r.x + r.width && my >= r.y && my <= r.y + r.height) f = r; });
          setHovered(f);
        }}
        onMouseLeave={() => setHovered(null)}
      />
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="absolute top-4 right-4 w-48 glass p-3 rounded-xl border-keli-sonic/20">
            <div className="text-sm font-bold text-white mb-0.5">{selected.name}</div>
            <div className="text-[10px] font-hebrew text-keli-sonic/60 mb-2">{selected.hebrew}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
