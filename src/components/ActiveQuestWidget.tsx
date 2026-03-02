'use client';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { motion } from 'framer-motion';
import { Play, Lock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function ActiveQuestWidget() {
    const progress = useQuery(api.campaign.getUserProgress);
    const nodes = useQuery(api.campaign.getCampaignTree);

    // Find first unlocked but not completed node
    const activeSlug = progress?.unlockedNodes.find(slug => !progress.completedNodes.includes(slug));
    const activeNode = nodes?.find((n: any) => n.slug === activeSlug);

    if (!activeNode) return (
        <div className="bg-[#111] border border-white/10 rounded-3xl p-6 h-full flex items-center justify-center">
             <div className="text-center">
                 <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                     <Check size={20} className="text-gray-500" />
                 </div>
                 <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">All Systems Normal</p>
             </div>
        </div>
    );

    return (
        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 h-full relative overflow-hidden group">
            {/* Background Pulse */}
            <div className="absolute inset-0 bg-nav-lime/5 animate-pulse" />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-nav-lime animate-ping" />
                        <span className="text-nav-lime font-bold uppercase tracking-widest text-xs">Active Mission</span>
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">
                        {activeNode.title}
                    </h3>
                    <p className="text-gray-400 text-sm font-medium line-clamp-2">
                        {activeNode.data?.description}
                    </p>
                </div>

                <Link href="/dashboard/campaign">
                    <button className="w-full py-4 mt-6 bg-white text-black rounded-xl font-black uppercase tracking-widest hover:bg-nav-lime transition-colors flex items-center justify-center gap-2 group-hover:scale-[1.02] duration-300">
                        <Play fill="currentColor" size={14} /> Resume Campaign
                    </button>
                </Link>
            </div>
        </div>
    );
}

function Check({ size, className }: { size: number, className?: string }) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={className}
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}
