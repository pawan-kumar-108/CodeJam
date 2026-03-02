'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function Footer() {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "end end"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  return (
    <footer ref={container} className="bg-nav-black min-h-screen flex items-center justify-center p-4 md:p-8 pt-20">
      <motion.div 
        style={{ scale, opacity }}
        className="bg-nav-cream w-full rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-16 flex flex-col justify-between min-h-[85vh] overflow-hidden relative"
      >
        {/* Top Section - Huge Typography */}
        <div className="flex flex-col gap-0 select-none">
          
          {/* Row 1: The Era ... of */}
          <div className="flex justify-between items-end leading-[0.8] mb-[1vw]">
            <motion.h1 
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-[13vw] md:text-[11vw] font-black text-black tracking-tighter"
            >
              The Era
            </motion.h1>
            <motion.h1 
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className="text-[13vw] md:text-[11vw] font-black text-black tracking-tighter"
            >
              of
            </motion.h1>
          </div>

          {/* Row 2: Gamified */}
          <div className="leading-[0.8] mb-[1vw]">
            <motion.h1 
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="text-[13vw] md:text-[11vw] font-black text-black tracking-tighter text-center"
            >
              Gamified
            </motion.h1>
          </div>

          {/* Row 3: Shapes + Mastery */}
          <div className="flex items-center gap-[2vw] leading-[0.8]">
             {/* Orange Arrow Shape */}
             <motion.div 
               initial={{ scale: 0, rotate: -10 }}
               whileInView={{ scale: 1, rotate: 0 }}
               transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
               className="h-[11vw] w-[14vw] bg-nav-orange rounded-[1rem] md:rounded-[2rem] flex-shrink-0"
               style={{ clipPath: 'polygon(0% 0%, 70% 0%, 100% 50%, 70% 100%, 0% 100%)' }}
             />

             {/* Blue Square Shape */}
             <motion.div 
               initial={{ scale: 0, rotate: 10 }}
               whileInView={{ scale: 1, rotate: 0 }}
               transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
               className="h-[11vw] w-[11vw] bg-nav-blue rounded-[1rem] md:rounded-[2rem] flex-shrink-0"
             />

             {/* Text: Mastery */}
             <motion.h1 
               initial={{ x: 50, opacity: 0 }}
               whileInView={{ x: 0, opacity: 1 }}
               transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
               className="text-[13vw] md:text-[11vw] font-black text-black tracking-tighter"
             >
               Mastery
             </motion.h1>
          </div>
        </div>

        {/* Bottom Section - Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end mt-12 md:mt-24">
           {/* Left Small Text */}
           <div className="lg:col-span-3">
              <p className="text-lg md:text-xl font-medium text-black/80 leading-tight">
                Why is coding <br/> important?
              </p>
           </div>

           {/* Spacer */}
           <div className="hidden lg:block lg:col-span-2"></div>

           {/* Right Large Text */}
           <div className="lg:col-span-7">
              <h3 className="text-3xl md:text-4xl lg:text-6xl font-black text-black leading-[1.05] tracking-tight">
                Coding is the literacy of the future. We believe learning should be immersive, competitive, and rewarding. Join the revolution.
              </h3>
           </div>
        </div>

      </motion.div>
    </footer>
  );
}
