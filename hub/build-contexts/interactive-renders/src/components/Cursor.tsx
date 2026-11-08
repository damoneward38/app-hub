import { useEffect, useState } from 'react';
import { motion, useSpring } from 'motion/react';

export default function Cursor() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const ringX = useSpring(0, { damping: 20, stiffness: 150 });
  const ringY = useSpring(0, { damping: 20, stiffness: 150 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      ringX.set(e.clientX);
      ringY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [ringX, ringY]);

  return (
    <>
      <div 
        className="fixed w-2 h-2 bg-white rounded-full pointer-events-none z-[10000] -translate-x-1/2 -translate-y-1/2 mix-blend-difference transition-[width,height] duration-300"
        style={{ left: mousePos.x, top: mousePos.y }}
      />
      <motion.div 
        className="fixed w-10 h-10 border border-v2/50 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{ x: ringX, y: ringY }}
      />
    </>
  );
}
