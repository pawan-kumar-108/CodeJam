'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Terminal, Cpu, Wind, FileCode } from 'lucide-react';

export default function FloatingIcons({ viewState }: { viewState: 'hero' | 'showcase' | 'hidden' }) {
  if (viewState === 'hidden') return null;

  return (
    <div className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-end pb-10 md:pb-0 md:justify-center">
      <motion.div 
        className="flex flex-nowrap justify-center gap-4 md:gap-8 items-center w-full px-4"
        initial={false}
        animate={{
          y: viewState === 'hero' ? '35vh' : '0vh', // Push down for hero, center for showcase
          scale: viewState === 'hero' ? 0.9 : 1.1
        }}
        transition={{ type: "spring", stiffness: 60, damping: 20 }}
      >
        <Card 
          id="icon-html" 
          color="bg-nav-orange" // HTML Orange
          icon={<FileCode size={viewState === 'showcase' ? 64 : 80} strokeWidth={1.5} />} 
          className="rounded-[2.5rem]" 
        />
        
        <Card 
          id="icon-tailwind" 
          color="bg-[#448AFF]" // Tailwind Blue-ish
          icon={<Wind size={viewState === 'showcase' ? 64 : 80} strokeWidth={1.5} />} 
          className="rounded-[2.5rem]"
        />
        
        <Card 
          id="icon-python" 
          color="bg-nav-yellow" // Python Yellow
          icon={<Terminal size={viewState === 'showcase' ? 64 : 80} strokeWidth={1.5} />} 
          className="rounded-full"
        />
        
        <Card 
          id="icon-cpp" 
          color="bg-[#00C853]" // C++ Green (Matrix vibe)
          icon={<Cpu size={viewState === 'showcase' ? 64 : 80} strokeWidth={1.5} />} 
          shape="arrow"
          className="rounded-[2.5rem]"
        />
      </motion.div>
    </div>
  );
}

function Card({ id, color, icon, shape, className = "" }: any) {
  const clipPath = shape === 'arrow' 
    ? 'polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)' 
    : undefined;

  return (
    <motion.div
      layoutId={id}
      transition={{ 
        type: "spring",
        stiffness: 80,
        damping: 20
      }}
      className={`
        ${color} 
        w-[120px] h-[120px] md:w-[180px] md:h-[180px]
        flex items-center justify-center 
        shadow-2xl
        ${className}
      `}
      style={{ clipPath }}
    >
      <div className="text-black/90 drop-shadow-sm scale-110">
        {icon}
      </div>
    </motion.div>
  )
}
