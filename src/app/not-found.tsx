'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Home, Terminal } from 'lucide-react';
import Link from 'next/link';

function Sticker({
  children,
  className = "",
  color = "bg-white",
  rotation = 0,
  type = "square",
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
  rotation?: number;
  type?: "square" | "arrow-left" | "arrow-right";
  delay?: number;
}) {
  const clipPath = type === 'arrow-left'
    ? 'polygon(20% 0%, 100% 0%, 100% 100%, 20% 100%, 0% 50%)'
    : type === 'arrow-right'
      ? 'polygon(0% 0%, 80% 0%, 100% 50%, 80% 100%, 0% 100%)'
      : undefined;

  const paddingClass = type === 'arrow-left' ? 'pl-8 pr-4' : type === 'arrow-right' ? 'pl-4 pr-8' : 'p-4';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: rotation - 10 }}
      animate={{ opacity: 1, scale: 1, rotate: rotation }}
      transition={{ type: "spring", stiffness: 200, damping: 15, delay: delay }}
      whileHover={{ scale: 1.1, rotate: rotation + 5, zIndex: 50 }}
      drag
      dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
      className={`absolute flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.3)] text-black font-black uppercase tracking-tight cursor-grab active:cursor-grabbing ${color} ${className} ${paddingClass}`}
      style={{ clipPath }}
    >
      {children}
    </motion.div>
  );
}

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-nav-black overflow-hidden font-sans text-[#FDF9F0] selection:bg-nav-orange selection:text-white flex flex-col items-center justify-center p-4">
      
      {/* Back Link */}
      <Link href="/" className="absolute top-8 left-8 z-30 flex items-center gap-2 group">
        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
          <ArrowLeft size={18} />
        </div>
      </Link>

      {/* CENTERPIECE */}
       <div className="relative z-20 w-full max-w-6xl flex flex-col items-center mb-12">
        <div className="relative text-center leading-[0.9] tracking-tighter uppercase font-black text-[#FDF9F0] select-none">
            
            {/* Row 1 */}
            <div className="relative inline-block mb-2">
                <span className="text-[14vw] md:text-[8rem] lg:text-[10rem]">PAGE</span>
                <Sticker color="bg-nav-orange" type="square" className="w-12 h-12 md:w-20 md:h-20 rounded-xl absolute -top-2 -right-6 md:-right-16" rotation={12} delay={0.2}>
                    <span className="text-xl md:text-3xl">?</span>
                </Sticker>
            </div>
            
            <br />
            
            {/* Row 2 */}
             <div className="relative inline-block z-10 mb-2">
                <span className="text-[14vw] md:text-[8rem] lg:text-[10rem]">NOT</span>
                 <Sticker color="bg-nav-lime" type="arrow-left" className="h-8 md:h-12 w-24 md:w-40 absolute top-1/2 -left-10 md:-left-32 -translate-y-1/2" rotation={-5} delay={0.4}>
                  <span className="text-[10px] md:text-sm whitespace-nowrap">Error 404</span>
                </Sticker>
                 <Sticker color="bg-nav-blue" type="arrow-right" className="h-8 md:h-12 w-28 md:w-48 absolute top-1/2 -right-12 md:-right-44 -translate-y-1/2" rotation={6} delay={0.5}>
                  <span className="text-[10px] md:text-sm whitespace-nowrap">Unknown</span>
                </Sticker>
             </div>

            <br />
            
            {/* Row 3 */}
            <div className="relative inline-block">
                <span className="text-[14vw] md:text-[8rem] lg:text-[10rem]">FOUND</span>
            </div>
        </div>
       </div>

       {/* Actions */}
       <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="w-full max-w-sm relative z-30 space-y-4"
       >
            <Link href="/dashboard" className="block w-full">
                <button
                    className="w-full bg-white h-12 rounded-2xl flex items-center justify-center text-black font-black uppercase tracking-wide hover:bg-nav-lime transition-all group shadow-lg hover:scale-[1.02]"
                >
                     <span className="flex items-center gap-2">
                        Return to Console <Terminal size={18} />
                     </span>
                </button>
            </Link>
            
             <Link href="/" className="block w-full">
                <button
                    className="w-full bg-transparent h-12 rounded-2xl flex items-center justify-center text-white/50 font-bold uppercase tracking-wide hover:text-white hover:bg-white/5 transition-all text-xs border border-white/10"
                >
                     <span className="flex items-center gap-2">
                        Back to Home <Home size={16} />
                     </span>
                </button>
            </Link>
       </motion.div>
    </div>
  );
}
