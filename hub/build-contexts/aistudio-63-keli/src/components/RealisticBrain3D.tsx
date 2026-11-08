"use client";

import {
  useRef, useState, useMemo,
  Suspense,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Billboard, Text } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "motion/react";

/* ── Brain region data ───────────────────────────────────── */
export interface BrainRegion3D {
  id:          string;
  name:        string;
  hebrew:      string;
  position:    [number, number, number];
  rotation:    [number, number, number];
  scale:       [number, number, number];
  color:       string;
  activeColor: string;
  frequencies: number[];
  function:    string[];
  layer:       "cortex" | "limbic" | "subcortical" | "hindbrain";
}

export const BRAIN_REGIONS_3D: BrainRegion3D[] = [
  {
    id: "prefrontal", name: "Prefrontal Cortex", hebrew: "קליפת המוח הקדמית",
    position: [0, 1.2, 1.3], rotation: [-0.4, 0, 0], scale: [1.1, 0.8, 0.6],
    color: "#0a1a2a", activeColor: "#06b6d4",
    frequencies: [40, 10, 7.83, 528], function: ["Executive function","Focus","Logic"],
    layer: "cortex",
  },
  {
    id: "frontal-left", name: "Left Frontal Lobe", hebrew: "אוֹנָה מִצְחִית שְׂמֹאל",
    position: [-0.8, 0.9, 1.1], rotation: [-0.3, 0.3, 0.1], scale: [0.9, 0.7, 0.55],
    color: "#0a1e28", activeColor: "#38bdf8",
    frequencies: [40, 14, 10, 528], function: ["Speech production","Planning"],
    layer: "cortex",
  },
  {
    id: "frontal-right", name: "Right Frontal Lobe", hebrew: "אוֹנָה מִצְחִית יָמִין",
    position: [0.8, 0.9, 1.1], rotation: [-0.3, -0.3, -0.1], scale: [0.9, 0.7, 0.55],
    color: "#1a0a28", activeColor: "#6366f1",
    frequencies: [40, 528, 432, 10], function: ["Emotion regulation","Creativity"],
    layer: "cortex",
  },
  {
    id: "parietal", name: "Parietal Lobe", hebrew: "אוֹנָה קָדְקוֹדִית",
    position: [0, 1.3, -0.4], rotation: [0.2, 0, 0], scale: [1.3, 0.9, 1.1],
    color: "#1a1a0a", activeColor: "#fbbf24",
    frequencies: [40, 10, 7.83], function: ["Sensory integration","Navigation"],
    layer: "cortex",
  },
  {
    id: "temporal-left", name: "Left Temporal", hebrew: "רִקָּה שְׂמֹאל",
    position: [-1.4, -0.1, 0.1], rotation: [0.1, 0.3, 0.15], scale: [0.75, 0.8, 1.1],
    color: "#0a0a2a", activeColor: "#7c3aed",
    frequencies: [40, 528, 639, 741], function: ["Language comprehension","Memory"],
    layer: "cortex",
  },
  {
    id: "temporal-right", name: "Right Temporal", hebrew: "רִקָּה יָמִין",
    position: [1.4, -0.1, 0.1], rotation: [0.1, -0.3, -0.15], scale: [0.75, 0.8, 1.1],
    color: "#1a0a2a", activeColor: "#a855f7",
    frequencies: [40, 111, 432, 528], function: ["Face recognition","Intuition"],
    layer: "cortex",
  },
  {
    id: "occipital", name: "Occipital Lobe", hebrew: "אוֹנָה עוֹרְפִית",
    position: [0, 0.1, -1.5], rotation: [-0.2, 0, 0], scale: [1.2, 0.9, 0.75],
    color: "#0a2a0a", activeColor: "#10b981",
    frequencies: [40, 10, 528], function: ["Visual processing"],
    layer: "cortex",
  },
  {
    id: "hippocampus-l", name: "Left Hippocampus", hebrew: "הִיפּוֹקָמְפּוּס שְׂמֹאל",
    position: [-0.4, -0.3, -0.2], rotation: [0, 0.4, 0], scale: [0.25, 0.25, 0.5],
    color: "#1a2a2a", activeColor: "#34d399",
    frequencies: [4, 6, 7.83, 528], function: ["Memory formation","Learning"],
    layer: "limbic",
  },
  {
    id: "hippocampus-r", name: "Right Hippocampus", hebrew: "הִיפּוֹקָמְפּוּס יָמִין",
    position: [0.4, -0.3, -0.2], rotation: [0, -0.4, 0], scale: [0.25, 0.25, 0.5],
    color: "#1a2a2a", activeColor: "#34d399",
    frequencies: [4, 6, 7.83, 528], function: ["Spatial memory"],
    layer: "limbic",
  },
  {
    id: "amygdala-l", name: "Left Amygdala", hebrew: "אַמִיגְדָלָה שְׂמֹאל",
    position: [-0.6, -0.5, 0.3], rotation: [0, 0, 0], scale: [0.2, 0.2, 0.2],
    color: "#2a0a0a", activeColor: "#f43f5e",
    frequencies: [174, 396, 417, 528], function: ["Emotional processing","Fear"],
    layer: "limbic",
  },
  {
    id: "amygdala-r", name: "Right Amygdala", hebrew: "אַמִיגְדָלָה יָמִין",
    position: [0.6, -0.5, 0.3], rotation: [0, 0, 0], scale: [0.2, 0.2, 0.2],
    color: "#2a0a0a", activeColor: "#f43f5e",
    frequencies: [174, 396, 417, 528], function: ["Stress response"],
    layer: "limbic",
  },
  {
    id: "thalamus", name: "Thalamus", hebrew: "תָּלָמוּס",
    position: [0, -0.1, -0.1], rotation: [0, 0, 0], scale: [0.4, 0.45, 0.4],
    color: "#2a1a0a", activeColor: "#fbbf24",
    frequencies: [40, 10, 7.83, 528], function: ["Relaying sensory signals"],
    layer: "subcortical",
  },
  {
    id: "hypothalamus", name: "Hypothalamus", hebrew: "הִיפּוֹתָלָמוּס",
    position: [0, -0.5, 0.1], rotation: [0, 0, 0], scale: [0.25, 0.2, 0.25],
    color: "#2a2a0a", activeColor: "#84cc16",
    frequencies: [10, 7.83, 528], function: ["Hormone regulation","Homeostasis"],
    layer: "subcortical",
  },
  {
    id: "pineal", name: "Pineal Gland", hebrew: "בַּלּוּטַת הָאִיצְטְרוּבָּל",
    position: [0, -0.2, -0.6], rotation: [0, 0, 0], scale: [0.15, 0.15, 0.15],
    color: "#2a0a2a", activeColor: "#f0abfc",
    frequencies: [963, 852, 528, 40], function: ["Melatonin","Circadian rhythm","DMT"],
    layer: "subcortical",
  },
  {
    id: "corpus-callosum", name: "Corpus Callosum", hebrew: "כְּפִיס הַמֹּחַ",
    position: [0, 0.4, 0.1], rotation: [0.1, 0, 0], scale: [0.2, 0.35, 1.2],
    color: "#2a2a2a", activeColor: "#ffffff",
    frequencies: [40, 528, 7.83], function: ["Inter-hemispheric communication"],
    layer: "subcortical",
  },
  {
    id: "cerebellum", name: "Cerebellum", hebrew: "מוֹחַ קָטָן",
    position: [0, -0.9, -1.2], rotation: [-0.4, 0, 0], scale: [1.1, 0.8, 0.8],
    color: "#0a1a1a", activeColor: "#059669",
    frequencies: [40, 10, 7.83, 528], function: ["Motor control","Balance"],
    layer: "hindbrain",
  },
  {
    id: "brainstem", name: "Brainstem", hebrew: "גֶּזַע הַמֹּחַ",
    position: [0, -1.5, -0.3], rotation: [0.2, 0, 0], scale: [0.4, 1.2, 0.4],
    color: "#1a0a0a", activeColor: "#ef4444",
    frequencies: [0.5, 2, 7.83, 528], function: ["Autonomic functions","Survival"],
    layer: "hindbrain",
  },
  {
    id: "broca", name: "Broca's Area", hebrew: "אֵזוֹר בְּרוֹקָה",
    position: [-1.1, 0.4, 0.9], rotation: [0, 0.5, 0], scale: [0.3, 0.3, 0.3],
    color: "#003366", activeColor: "#00ccff",
    frequencies: [40, 14, 528], function: ["Speech production"],
    layer: "cortex",
  },
  {
    id: "motor-cortex", name: "Motor Cortex", hebrew: "קליפת המוח המוטורית",
    position: [0, 1.2, 0.2], rotation: [0, 0, 0], scale: [1.4, 0.2, 0.3],
    color: "#330033", activeColor: "#ff00ff",
    frequencies: [40, 14, 528], function: ["Muscle control"],
    layer: "cortex",
  },
];

function GyrusMesh({
  position, rotation, scale, color, emissive, emissiveInt, opacity, onClick, onHover, onUnhover,
}: any) {
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 32, 24);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const fold = Math.sin(x * 4 + z * 3) * 0.1 + Math.sin(y * 5) * 0.08;
      const len = Math.sqrt(x*x + y*y + z*z);
      pos.setXYZ(i, x + (x/len)*fold, y + (y/len)*fold, z + (z/len)*fold);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh
      geometry={geometry}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={onClick}
      onPointerOver={onHover}
      onPointerOut={onUnhover}
    >
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveInt}
        transparent
        opacity={opacity}
        roughness={0.7}
      />
    </mesh>
  );
}

function BrainCortex({ alpha }: { alpha: number }) {
  const cortexGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(2.1, 64, 48);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const folds = Math.sin(x * 6 + z * 5) * 0.12 + Math.sin(y * 7) * 0.1;
      const len = Math.sqrt(x*x + y*y + z*z);
      pos.setXYZ(i, x + (x/len)*folds, y + (y/len)*folds, z + (z/len)*folds);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group>
      <mesh geometry={cortexGeo} position={[-0.1, 0, 0]} scale={[0.95, 1, 1]}>
        <meshStandardMaterial color="#c4906a" transparent opacity={alpha * 0.2} roughness={0.9} />
      </mesh>
      <mesh geometry={cortexGeo} position={[0.1, 0, 0]} scale={[-0.95, 1, 1]}>
        <meshStandardMaterial color="#c4906a" transparent opacity={alpha * 0.2} roughness={0.9} />
      </mesh>
    </group>
  );
}

function BrainScene3D({
  activeFrequencies,
  onSelect,
  shellAlpha,
}: {
  activeFrequencies: number[];
  onSelect:          (r: BrainRegion3D | null) => void;
  shellAlpha:        number;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const sel = BRAIN_REGIONS_3D.find(r => r.id === selectedId);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <OrbitControls enablePan={false} minDistance={4} maxDistance={10} autoRotate autoRotateSpeed={0.4} />
      
      <BrainCortex alpha={shellAlpha} />

      {BRAIN_REGIONS_3D.map(region => {
        const isFreqActive = region.frequencies.some(hz => 
          activeFrequencies.some(af => Math.abs(af - hz) < 5)
        );
        const isActive = selectedId === region.id || isFreqActive;
        const highlight = isActive || hoveredId === region.id;

        return (
          <GyrusMesh
            key={region.id}
            position={region.position}
            rotation={region.rotation}
            scale={region.scale}
            color={highlight ? region.activeColor : region.color}
            emissive={highlight ? region.activeColor : "#000000"}
            emissiveInt={selectedId === region.id ? 0.8 : isFreqActive ? 0.6 : 0}
            opacity={region.layer === "subcortical" ? 0.9 : 0.8}
            onClick={() => {
              const next = selectedId === region.id ? null : region.id;
              setSelectedId(next);
              onSelect(next ? region : null);
            }}
            onHover={() => setHoveredId(region.id)}
            onUnhover={() => setHoveredId(null)}
          />
        );
      })}

      {sel && (
        <Billboard position={[sel.position[0], sel.position[1] + 1.2, sel.position[2]]}>
          <Text fontSize={0.25} color="white" anchorX="center" anchorY="bottom" outlineWidth={0.02} outlineColor="#000">
            {sel.name}
          </Text>
        </Billboard>
      )}
    </>
  );
}

export default function RealisticBrain3D({
  activeFrequencies = [],
  onRegionSelect = () => {},
}: {
  activeFrequencies?: number[];
  onRegionSelect?: (r: BrainRegion3D | null) => void;
}) {
  const [shellAlpha, setShellAlpha] = useState(0.6);

  return (
    <div className="relative w-full h-[580px] bg-black/20 rounded-2xl border border-keli-sonic/10 overflow-hidden">
      <Canvas camera={{ position: [0, 0.5, 7.5], fov: 42 }}>
        <Suspense fallback={null}>
          <BrainScene3D
            activeFrequencies={activeFrequencies}
            onSelect={onRegionSelect}
            shellAlpha={shellAlpha}
          />
        </Suspense>
      </Canvas>

      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="glass-card p-3 !bg-black/60">
          <span className="label-mono mb-2">Cortex Transparency</span>
          <input 
            type="range" min="0" max="1" step="0.01" 
            value={shellAlpha} 
            onChange={(e) => setShellAlpha(parseFloat(e.target.value))} 
            className="w-32 accent-keli-sonic"
          />
        </div>
      </div>
    </div>
  );
}
