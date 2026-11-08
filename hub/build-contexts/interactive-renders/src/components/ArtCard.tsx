import { useState, useRef, MouseEvent as ReactMouseEvent } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'motion/react';

interface ArtCardProps {
  key?: string | number;
  item: {
    id: number | string;
    name: string;
    src: string;
    date: string;
    type: 'image' | 'video';
  };
  onClick: () => void;
}

export default function ArtCard({ item, onClick }: ArtCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className="relative group cursor-pointer"
    >
      <div 
        style={{
          transform: "translateZ(50px)",
          transformStyle: "preserve-3d",
        }}
        className="bg-bg-secondary/60 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md transition-all duration-500 group-hover:border-v2 group-hover:shadow-[0_20px_60px_rgba(124,58,237,0.2)]"
      >
        <div className="aspect-square overflow-hidden relative bg-black">
          {item.type === 'image' ? (
            <img 
              src={item.src} 
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
          ) : (
            <video 
              src={item.src} 
              muted 
              loop 
              onMouseOver={(e) => e.currentTarget.play()}
              onMouseOut={(e) => e.currentTarget.pause()}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          )}
        </div>
        <div className="p-6 relative">
          <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
          <div className="flex justify-between items-center text-xs text-gray-500 uppercase tracking-widest">
            <span>{item.date}</span>
            <span className="text-v3">Depth Active</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
