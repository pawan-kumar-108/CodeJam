'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function DemoVideo() {
  const container = useRef(null);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"]
  });

  const yTop = useTransform(scrollYProgress, [0, 0.5], ["0%", "-100%"]);
  const yBottom = useTransform(scrollYProgress, [0, 0.5], ["0%", "100%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  return (
    <section ref={container} className="relative h-[250vh] bg-nav-black">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">

        {/* Video Player Container */}
        <motion.div
          style={{ scale, opacity }}
          className="absolute inset-0 z-0 flex items-center justify-center p-4 md:p-10"
        >
           <div 
             className="w-full h-full max-w-[1600px] max-h-[85vh] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden border-4 border-white/10 relative bg-[#050505] shadow-2xl group"
           >
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/1jp1BXnDYqw?autoplay=0&mute=1&loop=1&playlist=1jp1BXnDYqw&rel=0&controls=1&showinfo=0" 
                title="CodeJam Demo" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
                className="w-full h-full object-cover"
              />
           </div>
        </motion.div>

        {/* Shutter Text Layers */}
        <motion.div style={{ y: yTop }} className="absolute top-0 left-0 right-0 h-[50vh] bg-nav-cream z-10 flex items-end justify-center pb-4 md:pb-10 border-b border-black/5">
           <h2 className="text-[15vw] font-black text-black leading-[0.75] tracking-tighter mix-blend-overlay opacity-80 select-none">PRODUCT</h2>
        </motion.div>

        <motion.div style={{ y: yBottom }} className="absolute bottom-0 left-0 right-0 h-[50vh] bg-nav-cream z-10 flex items-start justify-center pt-4 md:pt-10 border-t border-black/5">
           <h2 className="text-[15vw] font-black text-black leading-[0.75] tracking-tighter mix-blend-overlay opacity-80 select-none">DEMO</h2>
        </motion.div>

      </div>
    </section>
  )
}
