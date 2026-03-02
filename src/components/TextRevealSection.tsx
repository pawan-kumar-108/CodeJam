'use client';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import { Code, Terminal, Cpu, Wind, FileCode } from 'lucide-react';

export default function TextRevealSection({ showIcons = false }: { showIcons?: boolean }) {
  const container = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section ref={container} className="bg-nav-cream min-h-screen flex items-center justify-center py-20 px-4 overflow-hidden relative z-20">
      <div className="max-w-7xl mx-auto perspective-[1000px]">
        
        <div className="text-center mb-10">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
             className="inline-block"
          >
             <p className="text-gray-500 font-bold mb-2 uppercase tracking-widest text-sm">Your Roadmap:</p>
             <p className="text-black font-black text-xl">The complete full-stack journey.</p>
          </motion.div>
        </div>

        <motion.div 
          style={{ y }}
          initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-10%" }}
          className="text-5xl md:text-8xl lg:text-9xl font-black text-black leading-[0.9] text-center tracking-tighter"
        >
          
          <div className="flex flex-wrap md:flex-nowrap justify-center items-center gap-x-2 md:gap-x-4 gap-y-2">
            <span className="whitespace-nowrap">Start with</span>
            <div className="flex items-center gap-x-2 md:gap-x-4 h-[1em]">
              <div className="relative w-16 h-16 md:w-24 md:h-24 inline-flex items-center justify-center">
                {showIcons && (
                  <motion.span 
                    layoutId="icon-html"
                    transition={{ 
                      type: "spring",
                      stiffness: 150,
                      damping: 20,
                      mass: 0.8
                    }}
                    className="absolute inset-0 bg-nav-orange rounded-[2.5rem] p-2 md:p-4 flex items-center justify-center"
                  >
                    <FileCode className="w-8 h-8 md:w-16 md:h-16 text-black" strokeWidth={1.5} />
                  </motion.span>
                )}
              </div>
              <span className="whitespace-nowrap">HTML.</span>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-nowrap justify-center items-center gap-x-2 md:gap-x-4 gap-y-2 mt-[-0.5rem] md:mt-[-1rem]">
            <span className="whitespace-nowrap">Style with</span>
            <div className="flex items-center gap-x-2 md:gap-x-4 h-[1em]">
              <div className="relative w-16 h-16 md:w-24 md:h-24 inline-flex items-center justify-center">
                {showIcons && (
                  <motion.span 
                    layoutId="icon-tailwind"
                    transition={{ 
                      type: "spring",
                      stiffness: 150,
                      damping: 20,
                      mass: 0.8
                    }}
                    className="absolute inset-0 bg-[#448AFF] rounded-[2.5rem] p-2 md:p-4 flex items-center justify-center"
                  >
                    <Wind className="w-8 h-8 md:w-16 md:h-16 text-black" strokeWidth={1.5} />
                  </motion.span>
                )}
              </div>
              <span className="whitespace-nowrap">Tailwind.</span>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-nowrap justify-center items-center gap-x-2 md:gap-x-4 gap-y-2 mt-[-0.5rem] md:mt-[-1rem]">
            <span className="whitespace-nowrap">Advance to</span>
            <div className="flex items-center gap-x-2 md:gap-x-4 h-[1em]">
              <div className="relative w-16 h-16 md:w-24 md:h-24 inline-flex items-center justify-center">
                {showIcons && (
                  <motion.span 
                    layoutId="icon-python"
                    transition={{ 
                      type: "spring",
                      stiffness: 150,
                      damping: 20,
                      mass: 0.8
                    }}
                    className="absolute inset-0 bg-nav-yellow rounded-full p-2 md:p-4 flex items-center justify-center"
                  >
                    <Terminal className="w-8 h-8 md:w-16 md:h-16 text-black" strokeWidth={1.5} />
                  </motion.span>
                )}
              </div>
              <span className="whitespace-nowrap">Python.</span>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-nowrap justify-center items-center gap-x-2 md:gap-x-4 gap-y-2 mt-[-0.5rem] md:mt-[-1rem]">
            <span className="whitespace-nowrap">Master</span>
            <div className="flex items-center gap-x-2 md:gap-x-4 h-[1em]">
              <div className="relative w-16 h-16 md:w-24 md:h-24 inline-flex items-center justify-center">
                {showIcons && (
                  <motion.span 
                    layoutId="icon-cpp"
                    transition={{ 
                      type: "spring",
                      stiffness: 150,
                      damping: 20,
                      mass: 0.8
                    }}
                    className="absolute inset-0 bg-[#00C853] rounded-[2rem] rounded-tr-none p-2 md:p-4 flex items-center justify-center"
                    style={{clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 25%, 25% 0%)'}}
                  >
                    <Cpu className="w-8 h-8 md:w-16 md:h-16 text-black" strokeWidth={1.5} />
                  </motion.span>
                )}
              </div>
              <span className="whitespace-nowrap">C++.</span>
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
