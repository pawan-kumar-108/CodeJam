'use client';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { Sparkles, Terminal } from 'lucide-react';
import { useRef } from 'react';

export default function InfoSection() {
  return (
    <section className="bg-nav-black min-h-screen flex items-center justify-center py-24 px-4 relative z-10">
      <div className="max-w-6xl mx-auto w-full space-y-40">
        <Paragraph1 />
        <Paragraph2 />
      </div>
    </section>
  );
}

function Paragraph1() {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.8", "start 0.2"]
  });

  const text = "is often boring, passive, and disconnected from the real world. You watch tutorials but never actually build anything that matters.";
  const words = text.split(" ");
  const total = words.length + 1; // +1 for the badge

  return (
    <h2 ref={container} className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight flex flex-wrap gap-x-4 gap-y-3">
       <Word i={0} total={total} progress={scrollYProgress}>
          <span className="inline-flex items-center align-middle">
             <span className="bg-[#ccff00] text-black px-4 py-2 rounded-lg flex items-center gap-2 transform -rotate-2">
                <Terminal size={24} fill="black" className="md:w-8 md:h-8" />
                <span className="font-black text-xl md:text-3xl">Traditional learning</span>
             </span>
          </span>
       </Word>
       {words.map((word, i) => (
         <Word key={i} i={i+1} total={total} progress={scrollYProgress} isText>
           {word}
         </Word>
       ))}
    </h2>
  )
}

function Paragraph2() {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.8", "start 0.2"]
  });

  const text1 = "It's time to level up. With";
  const text2 = "you turn every line of code into a game, every bug fix into a victory, and every project into a career opportunity.";
  
  const words1 = text1.split(" ");
  const words2 = text2.split(" ");
  const total = words1.length + 1 + words2.length;

  return (
    <h2 ref={container} className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight flex flex-wrap gap-x-4 gap-y-3">
       {words1.map((word, i) => (
         <Word key={i} i={i} total={total} progress={scrollYProgress} isText>
           {word}
         </Word>
       ))}
       
       <Word i={words1.length} total={total} progress={scrollYProgress}>
          <span className="inline-flex items-center align-middle">
            <span className="bg-nav-orange text-black px-6 py-2 relative flex items-center justify-center transform rotate-2" style={{ clipPath: 'polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%)' }}>
               <span className="font-black italic text-xl md:text-3xl">CodeJam</span>
            </span>
          </span>
       </Word>

       {words2.map((word, i) => (
         <Word key={i} i={words1.length + 1 + i} total={total} progress={scrollYProgress} isText>
           {word}
         </Word>
       ))}
    </h2>
  )
}

function Word({ children, i, total, progress, isText }: { children: React.ReactNode, i: number, total: number, progress: MotionValue<number>, isText?: boolean }) {
  const duration = 0.25; 
  const stagger = (1 - duration) / Math.max(1, total - 1);
  
  const start = i * stagger;
  const end = start + duration;
  
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const blur = useTransform(progress, [start, end], [10, 0]);
  const skeletonOpacity = useTransform(progress, [start, end], [1, 0]);
  
  return (
    <div className="relative inline-block">
      {/* Actual Content */}
      <motion.span
        style={{ opacity, filter: useTransform(blur, b => `blur(${b}px)`) }}
        className={`relative z-10 inline-block ${isText ? 'text-white' : ''}`}
      >
        {children}
      </motion.span>

      {/* Skeleton Overlay - Solid and on top */}
      <motion.span
        style={{ opacity: skeletonOpacity }}
        className="absolute -inset-2 bg-[#222] rounded-lg z-20 pointer-events-none"
      />
    </div>
  )
}
