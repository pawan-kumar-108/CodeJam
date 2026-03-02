'use client';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { ArrowLeft, Check, Lock, Star, Code, Terminal, Cpu, Layers, Braces, Hash, ShieldAlert, Play, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

export default function RoadmapPage() {
  const router = useRouter();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Fetch campaign data
  const nodes = useQuery(api.campaign.getCampaignTree) || [];
  const progress = useQuery(api.campaign.getUserProgress) as any;

  const handleNodeClick = (node: any) => {
    // Navigation logic
    if (node.type === 'briefing') {
        // Navigate to Learning Module
        if (node.data.guideId) {
            const params = new URLSearchParams({
                title: node.title,
                category: node.tier
            });
            router.push(`/dashboard/learn/${node.data.guideId}?${params.toString()}`);
        }
    } else if (node.type === 'boss') {
        router.push(`/dashboard/arena/boss/${node.data.bossScenario}`);
    } else if (node.type === 'challenge') {
        if (node.data.gameId) {
            router.push(`/dashboard/arena/${node.data.gameId}`);
        }
    }
  };

  // Auto-seed if empty (dev helper)
  const seed = useMutation(api.campaign.seedCampaign);
  useEffect(() => {
      if (nodes && nodes.length === 0) {
          seed();
      }
  }, [nodes, seed]);

  // Filter nodes by current tier
  const currentTier = progress?.currentTier || 'html';
  const tierNodes = nodes.filter((n: any) => n.tier === currentTier);

  return (
    <div ref={containerRef} className="min-h-screen bg-nav-black text-white p-6 md:p-12 relative overflow-hidden">
      
      {/* Background Noise & Grid */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none z-0" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center justify-between mb-20 max-w-5xl mx-auto"
      >
        <button 
          onClick={() => router.back()}
          className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
            <div className="text-nav-lime font-bold uppercase tracking-widest text-xs mb-2">Current Track</div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
            {currentTier} Roadmap
            </h1>
        </div>
        <div className="w-12" /> {/* Spacer */}
      </motion.div>

      {/* Timeline Container */}
      <div className="relative max-w-4xl mx-auto z-10 pb-40">
        
        {/* Central Line */}
        <div className="absolute left-7 md:left-1/2 top-0 bottom-0 w-1 bg-white/10 md:-translate-x-1/2 rounded-full">
          <motion.div 
            style={{ scaleY: scrollYProgress, transformOrigin: "top" }}
            className="w-full h-full bg-nav-lime shadow-[0_0_15px_#CCFF00]"
          />
        </div>

        {/* Nodes */}
        <div className="space-y-32">
          {tierNodes.map((node: any, index: number) => {
            const isLeft = index % 2 === 0;
            
            // Logic: Unlock if explicitely unlocked OR if the previous node is completed
            const prevNode = index > 0 ? tierNodes[index - 1] : null;
            const isPrevCompleted = prevNode ? progress?.completedNodes.includes(prevNode.slug) : true;
            
            const isUnlocked = progress?.unlockedNodes.includes(node.slug) || (isPrevCompleted && index > 0) || index === 0;
            const isCompleted = progress?.completedNodes.includes(node.slug);
            
            // Icon selection
            let Icon = Code;
            let color = 'bg-nav-blue';
            
            if (node.type === 'briefing') { Icon = Layers; color = 'bg-nav-orange'; }
            if (node.type === 'boss') { Icon = ShieldAlert; color = 'bg-red-600'; }

            return (
              <motion.div 
                key={node.slug}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`relative flex items-center md:justify-between ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                
                {/* Content Card */}
                <div className={`
                  ml-20 md:ml-0 w-full md:w-[42%] 
                  bg-[#111] border border-white/10 p-8 rounded-4xl relative group
                  hover:border-white/30 transition-colors
                  ${!isUnlocked && !isCompleted ? 'opacity-40 grayscale pointer-events-none' : 'cursor-pointer'}
                `}
                onClick={() => handleNodeClick(node)}
                >
                  <div className={`absolute top-0 bottom-0 w-2 ${isLeft ? 'right-0 rounded-r-4xl' : 'left-0 rounded-l-4xl'} ${color}`} />
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      isCompleted ? 'bg-nav-lime text-black' : 
                      isUnlocked ? 'bg-nav-orange text-black animate-pulse' : 
                      'bg-white/10 text-gray-500'
                    }`}>
                      {isCompleted ? 'Completed' : isUnlocked ? 'Available' : 'Locked'}
                    </span>
                    <span className="text-gray-600 font-mono text-xs uppercase">{node.type}</span>
                  </div>

                  <h3 className="text-3xl font-black uppercase tracking-tight mb-2 flex items-center gap-3">
                    {node.title}
                  </h3>
                  <p className="text-gray-400 font-medium leading-relaxed mb-6">
                    {node.data?.description || "Secret Mission"}
                  </p>

                  <button 
                    className={`
                      w-full py-3 rounded-xl font-black uppercase tracking-wide flex items-center justify-center gap-2 transition-transform active:scale-95
                      ${!isUnlocked && !isCompleted
                        ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
                        : 'bg-white text-black hover:bg-nav-lime'
                      }
                    `}
                  >
                    {!isUnlocked && !isCompleted ? <Lock size={16} /> : isCompleted ? 'Replay' : 'Start Mission'}
                  </button>
                </div>

                {/* Center Node Marker */}
                <div className="absolute left-7 md:left-1/2 -translate-x-1/2 w-14 h-14 bg-nav-black border-4 border-[#111] rounded-full flex items-center justify-center z-20">
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    className={`
                      w-full h-full rounded-full flex items-center justify-center border-4
                      ${isCompleted ? 'bg-nav-lime border-nav-lime text-black' : 
                        isUnlocked ? 'bg-nav-black border-nav-orange text-nav-orange shadow-[0_0_20px_#FF552E]' : 
                        'bg-[#222] border-white/10 text-gray-600'}
                    `}
                  >
                    {isCompleted ? <Check size={24} strokeWidth={3} /> : <Icon size={20} />}
                  </motion.div>
                </div>

                {/* Empty Space for Grid Layout */}
                <div className="hidden md:block w-[42%]" />

              </motion.div>
            );
          })}
        </div>

        {/* Bottom "Coming Soon" */}
        <div className="relative flex justify-center mt-32">
           <div className="absolute left-[28px] md:left-1/2 top-[-128px] h-32 w-1 bg-gradient-to-b from-white/10 to-transparent md:-translate-x-1/2" />
           <div className="bg-[#111] border border-white/10 border-dashed px-8 py-4 rounded-full text-gray-500 font-black uppercase tracking-widest text-sm flex items-center gap-3">
             <Star size={16} /> More Tiers Coming Soon
           </div>
        </div>

      </div>
    </div>
  );
}
