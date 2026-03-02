'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Code, Terminal, Cpu, ArrowRight, Play, Layers, Braces, Hash, Lock } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";

// Static Games List (To be matched with Node Requirements)
const GAMES_CATALOG = [
  {
    id: 'function-fury',
    title: 'Function Fury',
    category: 'JS',
    level: 'Intermediate',
    color: 'bg-yellow-500',
    icon: Code,
    description: 'Master higher-order functions and stubborn closures.',
    progress: 0,
    players: '3.1k',
    requiredNode: 'node-1-html-basics' // The node that must be COMPLETED to unlock this in "Free Play"
  },
  {
    id: 'css-combat',
    title: 'CSS Combat',
    category: 'CSS',
    level: 'Advanced',
    color: 'bg-nav-lime',
    icon: Layers,
    description: 'Master flexbox and grid in a battle arena.',
    progress: 12,
    players: '2.4k',
    requiredNode: 'node-3-css-intro'
  },
  {
    id: 'syntax-smasher',
    title: 'Syntax Smasher',
    category: 'JS',
    level: 'Beginner',
    color: 'bg-nav-orange',
    icon: Terminal,
    description: 'Race against time to fix broken syntax errors.',
    progress: 0,
    players: '1.2k',
    requiredNode: 'node-4-boss-html'
  },
  {
    id: 'logic-labyrinth',
    title: 'Logic Labyrinth',
    category: 'Python',
    level: 'Intermediate',
    color: 'bg-nav-blue',
    icon: Hash,
    description: 'Navigate the maze using boolean logic gates.',
    progress: 45,
    players: '850',
    requiredNode: 'node-5-js-logic'
  },
  {
    id: 'algo-arena',
    title: 'Algo Arena',
    category: 'C++',
    level: 'Expert',
    color: 'bg-green-500',
    icon: Cpu,
    description: 'Optimize memory usage in high-stakes sorting battles.',
    progress: 0,
    players: '420',
    requiredNode: 'node-99-unobtainium'
  }
];

const filters = ['All', 'HTML', 'CSS', 'JS', 'Python', 'C++'];

export default function LibraryPage() {
  const user = useQuery(api.users.viewer);
  const progress = useQuery(api.campaign.getUserProgress) as any;
  const gameStats = useQuery(api.games.getGameStats);
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredGames = activeFilter === 'All' 
    ? GAMES_CATALOG 
    : GAMES_CATALOG.filter(g => g.category === activeFilter);

  return (
    <div className="p-4 md:p-12 max-w-400 mx-auto min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-16 gap-6 md:gap-8">
        <div>
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 md:p-3 bg-nav-orange rounded-2xl">
                    <Gamepad2 size={24} className="text-black md:w-8 md:h-8" />
                </div>
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-nav-orange">Arcade Mode</span>
            </div>
            <h1 className="text-4xl md:text-8xl font-black tracking-tighter uppercase text-white leading-[0.85]">
            Code<br/>Library
            </h1>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
            {filters.map(filter => (
                <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 md:px-6 md:py-3 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wide transition-all ${
                        activeFilter === filter 
                        ? 'bg-white text-black' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                >
                    {filter}
                </button>
            ))}
        </div>
      </div>

      {/* GAME GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
            {filteredGames.map((game, index) => {
                // Lock Logic:
                // If progress is not loaded yet, assume locked or wait? Assume locked for safety, or loading state.
                // If requiredNode is completed, it's unlocked.
                const isLocked = game.requiredNode && !progress?.completedNodes.includes(game.requiredNode);
                
                return (
                <motion.div
                    layout
                    key={game.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="group relative bg-[#111] border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-1 overflow-hidden hover:border-white/20 transition-colors"
                >
                    <div className="bg-[#151515] rounded-[1.8rem] md:rounded-[2.3rem] p-6 md:p-8 h-full flex flex-col relative z-10">
                        
                        {/* Top Row */}
                        <div className="flex justify-between items-start mb-6 md:mb-8">
                            <div className={`w-12 h-12 md:w-16 md:h-16 ${game.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 ${isLocked ? 'grayscale opacity-50' : ''}`}>
                                <game.icon size={24} className="text-black md:hidden" />
                                <game.icon size={32} className="text-black hidden md:block" />
                            </div>
                            <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                {gameStats?.[game.id] ?? 0} Players
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${game.color} text-black bg-opacity-80`}>
                                    {game.category}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                    {game.level}
                                </span>
                            </div>
                            
                            <h3 className="text-2xl md:text-3xl font-black text-white mb-2 md:mb-3 leading-none group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                                {game.title}
                            </h3>
                            <p className="text-gray-400 text-xs md:text-sm leading-relaxed font-medium line-clamp-2 md:line-clamp-none">
                                {game.description}
                            </p>
                        </div>

                        {/* Progress & CTA */}
                        <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/5 relative">
                            <div className="flex justify-between items-center mb-3 md:mb-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                <span>Progress</span>
                                <span>{game.progress}%</span>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full mb-6 overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${game.progress}%` }}
                                    className={`h-full ${game.color}`}
                                />
                            </div>

                            {isLocked ? (
                                <Link href="/dashboard/roadmap" className="w-full">
                                    <button className="w-full py-3 md:py-4 bg-white/5 text-white/30 font-black uppercase tracking-wide rounded-xl hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-2 border border-dashed border-white/10 text-[10px] md:text-xs">
                                        <Lock size={16} /> 
                                        <span className="hidden md:inline">Requires Roadmap Clearance</span>
                                        <span className="md:hidden">Unlock via Roadmap</span>
                                    </button>
                                </Link>
                            ) : (
                                <Link href={`/dashboard/arena/${game.id}`} className="w-full">
                                    <button className="w-full py-3 md:py-4 bg-white text-black font-black uppercase tracking-wide rounded-xl hover:bg-nav-lime transition-colors flex items-center justify-center gap-2 group-hover:-translate-y-0.5 text-xs md:text-sm">
                                        <Play size={16} fill="black" /> Play Now
                                    </button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Locked Overlay */}
                    {isLocked && (
                         <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                            <div className="bg-black/80 px-6 py-3 rounded-full border border-white/20 flex items-center gap-3 shadow-2xl">
                                <Lock size={16} className="text-red-500" />
                                <span className="text-xs font-bold uppercase tracking-widest text-white">Locked via Roadmap</span>
                            </div>
                         </div>
                    )}

                    {/* Hover Glow Effect */}
                    {!isLocked && (
                        <div className={`absolute inset-0 ${game.color} opacity-0 group-hover:opacity-5 blur-2xl transition-opacity pointer-events-none`} />
                    )}
                </motion.div>
                );
            })}
        </AnimatePresence>
      </div>
    </div>
  );
}
