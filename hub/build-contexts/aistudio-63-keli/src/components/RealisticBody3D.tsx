"use client";

import {
  useRef, useState, useMemo, Suspense,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Billboard, Text } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "motion/react";

/* ── Organ definition ────────────────────────────────────── */
export interface Organ3D {
  id:          string;
  name:        string;
  hebrew:      string;
  position:    [number, number, number];
  scale:       [number, number, number];
  color:       string;
  activeColor: string;
  healFreqs:   number[];
  cancerFreqs: number[];
  conditions:  string[];
  function:    string[];
  system:      string;
  shape:       "sphere"|"ellipsoid"|"heart"|"lung"|"kidney"|"liver"|"stomach"|"intestine";
}

export const ORGANS_3D: Organ3D[] = [
  {
    id:"brain", name:"Brain", hebrew:"מֹחַ",
    position:[0,3.15,0], scale:[0.58,0.52,0.58],
    color:"#0f1235", activeColor:"#7c3aed",
    healFreqs:[40,528,963,7.83], cancerFreqs:[2128],
    conditions:["Brain tumor","Glioma","Neurological"],
    function:["Consciousness","Memory","Emotion","Motor control"],
    system:"neurological", shape:"sphere",
  },
  {
    id:"heart", name:"Heart", hebrew:"לֵב",
    position:[-0.28,1.52,0.18], scale:[0.42,0.46,0.4],
    color:"#4a0008", activeColor:"#ef4444",
    healFreqs:[54,432,528,32], cancerFreqs:[2128],
    conditions:["Heart disease","Arrhythmia"],
    function:["Blood pumping","Circulation","Rhythm"],
    system:"cardiovascular", shape:"heart",
  },
  {
    id:"lung-left", name:"Left Lung", hebrew:"רֵאָה שְׂמֹאל",
    position:[-0.88,1.32,0], scale:[0.44,0.78,0.38],
    color:"#0a1e30", activeColor:"#38bdf8",
    healFreqs:[528,285,174,432], cancerFreqs:[728,784,2128],
    conditions:["Lung cancer","COPD"],
    function:["Oxygen intake","CO2 release","Breathing"],
    system:"respiratory", shape:"lung",
  },
  {
    id:"lung-right", name:"Right Lung", hebrew:"רֵאָה יָמִין",
    position:[0.88,1.32,0], scale:[0.44,0.78,0.38],
    color:"#0a1e30", activeColor:"#38bdf8",
    healFreqs:[528,285,174,432], cancerFreqs:[728,784,2128],
    conditions:["Lung cancer","COPD"],
    function:["Oxygen intake","CO2 release"],
    system:"respiratory", shape:"lung",
  },
  {
    id:"liver", name:"Liver", hebrew:"כָּבֵד",
    position:[0.58,0.52,0.08], scale:[0.72,0.42,0.48],
    color:"#3a1200", activeColor:"#f97316",
    healFreqs:[528,741,285,432], cancerFreqs:[2128,728],
    conditions:["Liver cancer","Hepatitis","Cirrhosis"],
    function:["Detoxification","Metabolism"],
    system:"digestive", shape:"liver",
  },
  {
    id:"stomach", name:"Stomach", hebrew:"קֵבָה",
    position:[-0.28,0.42,0.18], scale:[0.42,0.38,0.32],
    color:"#2a2000", activeColor:"#fbbf24",
    healFreqs:[528,285,174], cancerFreqs:[2128,728],
    conditions:["Stomach cancer","Ulcers"],
    function:["Food digestion","Acid secretion"],
    system:"digestive", shape:"stomach",
  },
  {
    id:"kidney-left", name:"Left Kidney", hebrew:"כְּלִיָּה שְׂמֹאל",
    position:[-0.78,-0.08,-0.22], scale:[0.26,0.4,0.24],
    color:"#281200", activeColor:"#fb923c",
    healFreqs:[528,285,741,432], cancerFreqs:[728,2128],
    conditions:["Kidney cancer","Renal failure"],
    function:["Blood filtration","Urine production"],
    system:"urinary", shape:"kidney",
  },
  {
    id:"kidney-right", name:"Right Kidney", hebrew:"כְּלִיָּה יָמִין",
    position:[0.78,-0.08,-0.22], scale:[0.26,0.4,0.24],
    color:"#281200", activeColor:"#fb923c",
    healFreqs:[528,285,741,432], cancerFreqs:[728,2128],
    conditions:["Kidney cancer","Renal failure"],
    function:["Blood filtration","Urine production"],
    system:"urinary", shape:"kidney",
  },
  {
    id:"small-intestine", name:"Small Intestine", hebrew:"מֵעִי דַּק",
    position:[0,-0.48,0.1], scale:[0.58,0.52,0.42],
    color:"#0a1e0a", activeColor:"#10b981",
    healFreqs:[285,528,174,432], cancerFreqs:[728,2128],
    conditions:["Small bowel cancer"],
    function:["Nutrient absorption"],
    system:"digestive", shape:"intestine",
  },
  {
    id:"large-intestine", name:"Large Intestine", hebrew:"מֵעִי גָּדוֹל",
    position:[0,-0.92,0.05], scale:[0.75,0.38,0.52],
    color:"#0a1e08", activeColor:"#34d399",
    healFreqs:[285,528,174], cancerFreqs:[728,2128,2008],
    conditions:["Colon cancer"],
    function:["Water absorption"],
    system:"digestive", shape:"intestine",
  },
];

const SYSTEM_COLORS: Record<string, string> = {
  digestive:      "#10b981",
  respiratory:    "#38bdf8",
  cardiovascular: "#ef4444",
  neurological:   "#7c3aed",
  urinary:        "#06b6d4",
  immune:         "#a855f7",
  endocrine:      "#fbbf24",
};

function OrganGeometry({ shape }: { shape: Organ3D["shape"] }) {
  const geo = useMemo(() => {
    if (shape === "kidney") {
      const g = new THREE.SphereGeometry(1, 24, 18);
      const pos = g.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        if (x < -0.3) {
          const indent = Math.exp(-((y * y) / 0.3)) * 0.4;
          pos.setX(i, x + indent);
        }
      }
      g.computeVertexNormals();
      return g;
    }
    if (shape === "heart") {
      const g = new THREE.SphereGeometry(1, 24, 18);
      const pos = g.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        if (y > 0.2) {
          const lobe = Math.abs(Math.sin(x * 2.5)) * 0.2;
          pos.setY(i, y + lobe);
        }
        if (y < -0.5) {
          const taper = (-y - 0.5) * 0.3;
          pos.setX(i, x * (1 - taper));
          pos.setZ(i, z * (1 - taper));
        }
      }
      g.computeVertexNormals();
      return g;
    }
    if (shape === "lung") {
      const g = new THREE.SphereGeometry(1, 24, 18);
      const pos = g.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        const lobe = Math.sin(y * 2.5) * Math.cos(x * 1.5) * 0.15;
        const len = Math.sqrt(x*x + y*y + z*z);
        pos.setXYZ(i, x + (x/len)*lobe, y + (y/len)*lobe, z + z/len);
      }
      g.computeVertexNormals();
      return g;
    }
    if (shape === "intestine") {
      const g = new THREE.SphereGeometry(1, 32, 24);
      const pos = g.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        const folds = Math.sin(x * 8 + y * 6) * 0.12;
        const len = Math.sqrt(x*x + y*y + z*z);
        pos.setXYZ(i, x + (x/len)*folds, y + (y/len)*folds, z + (z/len)*folds);
      }
      g.computeVertexNormals();
      return g;
    }
    return new THREE.SphereGeometry(1, 24, 18);
  }, [shape]);

  return <bufferGeometry attach="geometry" {...geo} />;
}

function HumanSilhouette({ alpha }: { alpha: number }) {
  const op = alpha * 0.15;
  const skinMat = <meshStandardMaterial color="#d4956a" transparent opacity={op} roughness={0.9} />;
  return (
    <group>
      <mesh position={[0, 3.15, 0]} scale={[0.62, 0.65, 0.68]}><sphereGeometry args={[1, 28, 22]} />{skinMat}</mesh>
      <mesh position={[0, 2.02, 0]} scale={[1, 0.78, 0.88]}><sphereGeometry args={[0.72, 20, 16]} />{skinMat}</mesh>
      <mesh position={[0, 1.42, 0]} scale={[0.88, 1.1, 0.72]}><cylinderGeometry args={[0.68, 0.62, 1.1, 18]} />{skinMat}</mesh>
      <mesh position={[0, 0.45, 0]} scale={[0.82, 0.92, 0.68]}><cylinderGeometry args={[0.62, 0.56, 0.92, 18]} />{skinMat}</mesh>
      <mesh position={[0, -1.2, 0]} scale={[0.8, 1.2, 0.7]}><cylinderGeometry args={[0.5, 0.4, 2.0, 16]} />{skinMat}</mesh>
    </group>
  );
}

function BodyScene({
  activeFrequencies,
  onSelect,
  shellAlpha,
  sessionActive,
}: {
  activeFrequencies: number[];
  onSelect:          (o: Organ3D | null) => void;
  shellAlpha:        number;
  sessionActive:     boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId,  setHoveredId]  = useState<string | null>(null);

  const sel = ORGANS_3D.find(o => o.id === selectedId);

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 6]} intensity={1} color="#ffffff" />
      <OrbitControls enablePan={false} minDistance={5} maxDistance={15} autoRotate autoRotateSpeed={0.3} />
      
      <HumanSilhouette alpha={shellAlpha} />

      {ORGANS_3D.map(organ => {
        const isFreqActive = organ.healFreqs.some(hz => 
          activeFrequencies.some(af => Math.abs(af - hz) < 5)
        );
        const isActive = selectedId === organ.id || isFreqActive;
        const highlight = isActive || hoveredId === organ.id;

        return (
          <mesh 
            key={organ.id}
            position={organ.position}
            scale={organ.scale}
            onClick={() => {
              const next = selectedId === organ.id ? null : organ.id;
              setSelectedId(next);
              onSelect(next ? organ : null);
            }}
            onPointerOver={() => setHoveredId(organ.id)}
            onPointerOut={() => setHoveredId(null)}
          >
            <OrganGeometry shape={organ.shape} />
            <meshStandardMaterial 
              color={highlight ? organ.activeColor : organ.color}
              emissive={highlight ? organ.activeColor : "#000000"}
              emissiveIntensity={selectedId === organ.id ? 0.8 : isFreqActive ? 0.6 : 0}
              transparent opacity={0.9} roughness={0.4}
            />
          </mesh>
        );
      })}

      {sel && (
        <Billboard position={[sel.position[0], sel.position[1] + 1.2, sel.position[2]]}>
          <Text fontSize={0.25} color="white" anchorX="center" anchorY="bottom" outlineWidth={0.02} outlineColor="#000">
            {sel.name}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

export default function RealisticBody3D({
  activeFrequencies = [],
  onOrganSelect     = () => {},
  sessionActive     = false,
}: {
  activeFrequencies?: number[];
  onOrganSelect?:     (o: Organ3D | null) => void;
  sessionActive?:     boolean;
}) {
  const [shellAlpha, setShellAlpha] = useState(0.55);

  return (
    <div className="relative w-full h-[700px] bg-keli-void rounded-2xl border border-keli-sonic/10 overflow-hidden">
      <Canvas camera={{ position: [0, 0.5, 10], fov: 42 }}>
        <Suspense fallback={null}>
          <BodyScene
            activeFrequencies={activeFrequencies}
            onSelect={onOrganSelect}
            shellAlpha={shellAlpha}
            sessionActive={sessionActive}
          />
        </Suspense>
      </Canvas>

      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="glass-card p-3 !bg-black/60">
          <span className="label-mono mb-2">Skin Transparency</span>
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
