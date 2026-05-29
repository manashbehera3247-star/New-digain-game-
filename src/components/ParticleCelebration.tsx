import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface Particle {
  id: number;
  startX: string;
  startY: string;
  midX: string;
  endX: string;
  peakY: string;
  endY: string;
  size: number;
  color: string;
  rotation: number;
  duration: number;
  delay: number;
  shape: 'circle' | 'square' | 'triangle' | 'star';
}

const COLORS = [
  '#f59e0b', // Amber/Gold
  '#ef4444', // Red/Rose
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#ff7e33', // Orange
];

export function ParticleCelebration() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate left and right cannon particles on mount
    const generated: Particle[] = [];
    const count = 90;

    for (let i = 0; i < count; i++) {
      const isLeft = i % 2 === 0;
      const startX = isLeft ? '-10vw' : '110vw';
      const startY = '105vh';

      // Angle and distance spread
      const spreadX = Math.random() * 65 + 15; // 15% to 80% screen width
      const midX = isLeft ? `${spreadX}vw` : `${100 - spreadX}vw`;
      const drift = (Math.random() * 20 - 10); // slightly drift sideways at the end
      const endX = isLeft ? `${spreadX + drift}vw` : `${100 - spreadX + drift}vw`;

      // Jump peak heights
      const peakY = `${Math.random() * 45 + 5}vh`; // peak between 5% and 50% from screen top
      const endY = '115vh'; // fall down past viewport

      const size = Math.random() * 12 + 6; // 6px to 18px
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const rotation = Math.random() * 720 - 360; // multi-spin rotation
      const duration = Math.random() * 2.2 + 2.3; // 2.3s to 4.5s duration
      const delay = Math.random() * 0.4; // staggered release

      const shapes: Particle['shape'][] = ['circle', 'square', 'triangle', 'star'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];

      generated.push({
        id: i,
        startX,
        startY,
        midX,
        endX,
        peakY,
        endY,
        size,
        color,
        rotation,
        duration,
        delay,
        shape,
      });
    }

    setParticles(generated);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none">
      {/* Floating Trophy & Winner Ribbon overlays */}
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.8 }}
        animate={{ opacity: [0, 1, 1, 0.4], y: [0, 10, 12, 12], scale: [0.95, 1.05, 1.02, 1.02] }}
        transition={{ duration: 5, times: [0, 0.15, 0.8, 1], ease: 'easeOut' }}
        className="absolute top-12 inset-x-0 mx-auto w-fit flex flex-col items-center gap-1 bg-slate-900/90 border border-amber-500/30 px-6 py-2.5 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.25)] backdrop-blur"
      >
        <span className="text-2xl">🏆✨🏆</span>
        <span className="text-xs font-black text-amber-300 tracking-widest uppercase">
          Victory Celebration!
        </span>
      </motion.div>

      {/* Render Particles */}
      {particles.map((p) => {
        return (
          <motion.div
            key={p.id}
            initial={{
              x: p.startX,
              y: p.startY,
              rotate: 0,
              scale: 0.2,
              opacity: 1,
            }}
            animate={{
              x: [p.startX, p.midX, p.endX],
              y: [p.startY, p.peakY, p.endY],
              rotate: p.rotation,
              scale: [0.3, 1.1, 0.8, 0],
              opacity: [1, 1, 0.9, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: ['easeOut', 'easeIn'], // fast launch, gravity fall
              times: [0, 0.4, 1],
            }}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              zIndex: 99,
            }}
          >
            {p.shape === 'circle' && (
              <div
                className="w-full h-full rounded-full shadow-sm"
                style={{ backgroundColor: p.color }}
              />
            )}

            {p.shape === 'square' && (
              <div
                className="w-full h-full rounded-sm shadow-sm"
                style={{ backgroundColor: p.color, borderRadius: '2px' }}
              />
            )}

            {p.shape === 'triangle' && (
              <svg
                viewBox="0 0 24 24"
                width="100%"
                height="100%"
                className="drop-shadow-sm"
                fill={p.color}
              >
                <polygon points="12,2 2,22 22,22" />
              </svg>
            )}

            {p.shape === 'star' && (
              <svg
                viewBox="0 0 24 24"
                width="100%"
                height="100%"
                className="drop-shadow-md animate-pulse"
                fill={p.color}
              >
                <polygon points="12,17.27 18.18,21 16.54,13.97 22,9.24 14.81,8.63 12,2 9.19,8.63 2,9.24 7.46,13.97 5.82,21" />
              </svg>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
