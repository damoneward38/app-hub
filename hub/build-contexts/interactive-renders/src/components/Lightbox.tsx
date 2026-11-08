import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    src: string;
    type: 'image' | 'video';
  } | null;
}

export default function Lightbox({ isOpen, onClose, item }: LightboxProps) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isOpen) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const x = (window.innerWidth / 2 - e.clientX) / 20;
      const y = (window.innerHeight / 2 - e.clientY) / 20;
      setRotate({ x: y, y: -x });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isOpen]);

  if (!item) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9000] bg-bg/98 backdrop-blur-3xl flex items-center justify-center p-10"
          onClick={onClose}
        >
          <div 
            className="relative max-w-[1200px] w-full"
            style={{ perspective: "1000px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute -top-16 right-0 text-white hover:text-v3 transition-colors"
              onClick={onClose}
            >
              <X size={32} />
            </button>
            
            <motion.div
              animate={{ 
                rotateX: rotate.x, 
                rotateY: rotate.y 
              }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="rounded-[30px] overflow-hidden shadow-[0_0_100px_rgba(124,58,237,0.4)] bg-black"
              style={{ transformStyle: "preserve-3d" }}
            >
              {item.type === 'image' ? (
                <img 
                  src={item.src} 
                  className="w-full max-h-[80vh] object-contain block" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <video 
                  src={item.src} 
                  className="w-full max-h-[80vh] object-contain block" 
                  controls 
                  autoPlay 
                />
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
