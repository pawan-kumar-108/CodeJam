'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function StatsTicker() {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "end start"]
  });

  const x = useTransform(scrollYProgress, [0, 1], [0, -500]);

  return (
    <section ref={container} className="bg-nav-lime py-32 overflow-hidden flex items-center relative">
      <motion.div style={{ x }} className="flex whitespace-nowrap gap-32">
        <StatItem label="Lines of Code" value="50M+" />
        <StatItem label="Bugs Fixed" value="120k+" />
        <StatItem label="Users Hired" value="2,500+" />
        <StatItem label="Challenges" value="150+" />
        <StatItem label="Lines of Code" value="50M+" />
        <StatItem label="Bugs Fixed" value="120k+" />
      </motion.div>
    </section>
  );
}

function StatItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-9xl font-black text-black tracking-tighter">{value}</span>
      <span className="text-3xl font-bold text-black uppercase tracking-widest">{label}</span>
    </div>
  )
}
