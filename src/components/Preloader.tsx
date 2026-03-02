'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Code, Terminal, Cpu, Layers, Braces } from 'lucide-react';

const icons = [
  { Component: Terminal, color: 'text-[#00C853]' }, // Python Green
  { Component: Braces, color: 'text-nav-yellow' }, // JS Yellow
  { Component: Code, color: 'text-[#448AFF]' }, // React Blue
  { Component: Cpu, color: 'text-nav-orange' }, // Rust Orange
  { Component: Layers, color: 'text-nav-blue' }, // CSS Blue
];

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const cycleCount = 2;
    const totalSteps = icons.length * cycleCount;
    const speed = 150;

    let step = 0;

    const interval = setInterval(() => {
      step++;

      if (step >= totalSteps) {
        clearInterval(interval);
        setIsFinished(true);
        setTimeout(onComplete, 800);
      } else {
        setCurrentIndex((prev) => (prev + 1) % icons.length);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-nav-black flex items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
    >
      <div className="relative flex items-center justify-center w-32 h-32 md:w-48 md:h-48">

        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div
              key={currentIndex}
              initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 1.5, opacity: 0, rotate: 20 }}
              transition={{ duration: 0.15, ease: "backOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {(() => {
                const Icon = icons[currentIndex].Component;
                return <Icon size={80} className={icons[currentIndex].color} strokeWidth={2} />;
              })()}
            </motion.div>
          ) : (
            <motion.div
              key="logo"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-6"
            >
              {/* The "Navigate" Arrow Logo Shape */}
              <div className="bg-nav-orange w-24 h-24 md:w-32 md:h-32 flex items-center justify-center"
                style={{ clipPath: 'polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-[-10%]">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-white font-black text-3xl md:text-4xl tracking-tighter"
              >
                CODEJAM
              </motion.h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Ring */}
        {!isFinished && (
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none opacity-20">
            <circle
              cx="50%" cy="50%" r="45%"
              fill="none"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        )}
      </div>
    </motion.div>
  );
}
