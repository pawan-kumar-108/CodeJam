'use client';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Code, Terminal, Cpu, Layers, Braces, MousePointer2 } from 'lucide-react';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useConvexAuth } from "convex/react";

export default function Hero({
  viewState = 'hero'
}: {
  viewState: 'hero' | 'showcase' | 'hidden';
}) {
  const ref = useRef(null);
  const { isAuthenticated } = useConvexAuth();

  return (
    <section ref={ref} className="relative h-[150vh] bg-transparent">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">

        {/* Background Gradient Spot */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-nav-blue/[0.05] blur-[120px] rounded-full pointer-events-none" />

        {/* Main Content */}
        <motion.div
          className="z-20 flex flex-col items-center text-center px-4 max-w-5xl mx-auto absolute top-[50%] -translate-y-1/2"
          animate={{
            opacity: viewState === 'hero' ? 1 : 0,
            scale: viewState === 'hero' ? 1 : 0.9,
            pointerEvents: viewState === 'hero' ? 'auto' : 'none',
            y: viewState === 'hero' ? 0 : -100
          }}
          transition={{ duration: 0.5 }}
        >
          {/* Heading */}
          <h1 className="font-sans text-7xl md:text-[9rem] font-black tracking-tighter leading-[0.85] mb-12 text-[#FDF9F0]">
            Master The <br />
            Stack
          </h1>

          {/* <p className="text-gray-400 text-xl md:text-2xl font-medium max-w-2xl mb-14">
            Learn by doing. Compete globally. Build your dev career.
          </p> */}

          {/* CTA Button */}
          <Link href={isAuthenticated ? "/dashboard" : "/auth"}>
            <button className="group relative bg-[#FDF9F0] text-black px-10 py-5 rounded-full font-black text-xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3">
              <div className="absolute inset-0 bg-nav-lime translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.87,0,0.13,1)]" />
              <span className="relative z-10">Start Coding</span>
              <MousePointer2
                size={24}
                className="relative z-10 transition-transform duration-300 group-hover:rotate-12 group-hover:translate-x-1"
              />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function Card({ id, color, icon, shape, className = '' }: any) {
  return null;
}
