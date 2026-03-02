'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Download, Zap, Wallet, UserPlus, Code2, Rocket } from 'lucide-react';

export default function HowItWorks() {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"]
  });

  return (
    <section ref={container} className="bg-nav-black text-white relative">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-6xl md:text-8xl font-black text-center py-12 sticky top-0 bg-nav-black/90 backdrop-blur-lg z-50 border-b border-white/10 shadow-2xl">
          How it works
        </h2>

        <div className="relative pb-32 pt-12">
          <Step 
            number="01" 
            title="Create Profile" 
            desc="Sign up and build your developer identity. Connect your GitHub to showcase your existing work."
            icon={<UserPlus size={64} />}
            color="bg-nav-blue"
          />
          <Step 
            number="02" 
            title="Choose Language" 
            desc="Pick your path. Start from scratch with HTML or dive deep into Rust and WebAssembly."
            icon={<Code2 size={64} />}
            color="bg-nav-yellow"
          />
          <Step 
            number="03" 
            title="Get Hired" 
            desc="Complete quests, earn badges, and top the leaderboard to get noticed by top tech companies."
            icon={<Rocket size={64} />}
            color="bg-nav-lime" // This is now orange in our palette
          />
        </div>
      </div>
    </section>
  );
}

function Step({ number, title, desc, icon, color }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20%" }}
      transition={{ duration: 0.5 }}
      className="flex flex-col md:flex-row items-center gap-12 py-24 border-t border-white/10"
    >
      <div className="flex-1 text-center md:text-right">
        <span className="text-[10rem] md:text-[15rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-transparent">
          {number}
        </span>
      </div>
      
      <div className="flex-1">
        <div className={`${color} w-24 h-24 rounded-2xl flex items-center justify-center mb-8 text-black rotate-3 hover:rotate-12 transition-transform`}>
          {icon}
        </div>
        <h3 className="text-4xl md:text-6xl font-bold mb-6">{title}</h3>
        <p className="text-xl text-gray-400 max-w-lg leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  )
}
