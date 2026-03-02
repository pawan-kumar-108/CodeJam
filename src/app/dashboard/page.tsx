'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import ActivityGraph from '@/components/ActivityGraph';
import { Gift, Terminal, Trophy, BookOpen, Code, Zap, Flame, Star, Globe, ArrowUpRight, Bug, Cpu, Palette, Lock, Swords, Skull, Braces } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ICON_MAP: Record<string, any> = {
    'BookOpen': BookOpen,
    'Flame': Flame,
    'Bug': Bug,
    'Cpu': Cpu,
    'Palette': Palette,
    'Lock': Lock
};

export default function DashboardPage() {
    const router = useRouter();
    const setTrack = useMutation(api.campaign.setTrack);
    const [isSelectingPath, setIsSelectingPath] = useState(false);
    const user = useQuery(api.users.viewer);
    const globalRank = useQuery(api.users.getRank);
    const weeklyXP = useQuery(api.activity.getWeeklyXP);
    const recentBadges = useQuery(api.users.getRecentBadges);
    const activeGuide = useQuery(api.guides.getActiveGuide);
    const notifications = useQuery(api.social.getNotifications);
    const createBattle = useMutation(api.social.createBattle);
    const markRead = useMutation(api.social.markRead);

    const revengeNotifs = notifications?.filter((n: any) => n.type === 'revenge') || [];

    const handleRevenge = async (notif: any) => {
        try {
            // 1. Create Ghost Battle
            const result = await createBattle({
                opponentId: notif.data.senderId,
                gameId: notif.data.gameId,
                mode: 'ghost'
            });

            // 2. Mark notification as read
            await markRead({ notificationId: notif._id });

            // 3. Redirect
            if (result.battleId) {
                router.push(`/dashboard/arena/${notif.data.gameId}?mode=ghost&battle=${result.battleId}`);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Helper to determine rank title
    const getRankTitle = (level: number) => {
        if (level < 5) return "Script Kiddie";
        if (level < 10) return "Code Warrior";
        if (level < 20) return "Tech Wizard";
        return "10x Developer";
    };

    const level = user?.level || 1;
    const rank = getRankTitle(level);

    const displayBadges = [...(recentBadges || [])];
    while (displayBadges.length < 3) {
        displayBadges.push({ badgeId: 'locked', meta: { title: 'Locked Achievement', icon: 'Lock' }, unlockedAt: 0 } as any);
    }

    return (
        <div className="p-4 md:p-12 max-w-[1600px] mx-auto min-h-screen">

            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-16 gap-6">
                <div>
                    <h1 className="text-4xl md:text-7xl font-black mb-2 tracking-tighter leading-[0.9]">
                        Hello, <span className="text-nav-orange capitalize">{(user?.name?.split(' ')[0] || 'Coder').toLowerCase()}</span>
                    </h1>
                    <p className="text-gray-400 font-medium text-sm md:text-lg">Your command center is ready.</p>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-3 gap-2 w-full md:w-auto md:flex md:gap-4">
                    <div className="bg-[#111] border border-white/10 px-3 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl flex flex-col items-center justify-center min-w-0 md:min-w-25">
                        <Flame size={16} className="text-nav-orange mb-1 md:mb-2 md:w-5 md:h-5" />
                        <span className="text-lg md:text-2xl font-black text-white">{user?.streak || 0}</span>
                        <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center">Day Streak</span>
                    </div>
                    <div className="bg-[#111] border border-white/10 px-3 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl flex flex-col items-center justify-center min-w-0 md:min-w-25">
                        <Star size={16} className="text-nav-yellow mb-1 md:mb-2 md:w-5 md:h-5" />
                        <span className="text-lg md:text-2xl font-black text-white">{user?.xp || 0}</span>
                        <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center">Total XP</span>
                    </div>
                    <div className="bg-[#111] border border-white/10 px-3 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl flex flex-col items-center justify-center min-w-0 md:min-w-25">
                        <Globe size={16} className="text-nav-blue mb-1 md:mb-2 md:w-5 md:h-5" />
                        <span className="text-lg md:text-2xl font-black text-white">#{globalRank || '-'}</span>
                        <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center">Global</span>
                    </div>
                </div>
            </div>

            {/* MAIN DASHBOARD GRID */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 grid-rows-[auto]">

                {/* COL 1: Main Quest & Progress (Span 8) */}
                <div className="md:col-span-8 flex flex-col gap-6">

                    {/* REVENGE ALERT (Viral Loop) */}
                    {revengeNotifs.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-900/20 border-2 border-red-500 rounded-4xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 opacity-20 pointer-events-none" />
                            <div className="absolute -right-10 -top-10 text-red-500/10 rotate-12">
                                <Skull size={200} />
                            </div>

                            <div className="relative z-10 flex items-center gap-6">
                                <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                                    <Swords size={32} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-red-500 uppercase tracking-tight mb-1">Revenge Available</h3>
                                    <p className="text-gray-300 font-medium">
                                        <span className="text-white font-bold">{revengeNotifs[0].senderName}</span> crushed your score! Battle back now.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleRevenge(revengeNotifs[0])}
                                className="relative z-10 bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-wider transition-all shadow-[0_8px_0_rgb(153,27,27)] active:shadow-none active:translate-y-2 flex items-center gap-2"
                            >
                                Battle <Swords size={18} />
                            </button>
                        </motion.div>
                    )}

                    {/* NEW USER ONBOARDING: Start Journey */}
                    {!activeGuide && level < 2 && revengeNotifs.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-sky-900/20 border-2 border-sky-500 rounded-3xl md:rounded-[2rem] p-5 md:p-8 relative overflow-hidden transition-all duration-500"
                        >
                            <div className="absolute inset-0 opacity-20 pointer-events-none" />
                            
                            {!isSelectingPath ? (
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 w-full text-center md:text-left">
                                    <div className="absolute -right-10 -top-10 text-sky-500/10 rotate-12 pointer-events-none">
                                        <BookOpen size={200} />
                                    </div>
                                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                                        <div className="w-14 h-14 md:w-16 md:h-16 bg-sky-500 rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(14,165,233,0.4)]">
                                            <BookOpen size={28} className="text-white md:w-8 md:h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-black text-sky-500 uppercase tracking-tight mb-1">Start Your Journey</h3>
                                            <p className="text-gray-300 font-medium text-sm md:text-base">
                                                Your adventure begins now. Pick a path to unlock your potential.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsSelectingPath(true)}
                                        className="w-full md:w-auto relative z-10 bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 md:py-4 rounded-xl font-black uppercase tracking-wider transition-all shadow-[0_4px_0_rgb(3,105,161)] md:shadow-[0_8px_0_rgb(3,105,161)] active:shadow-none active:translate-y-[4px] md:active:translate-y-[8px] flex items-center justify-center gap-2"
                                    >
                                        Choose Path <ArrowUpRight size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="relative z-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center"><Code size={16} /></div>
                                            Select Your Primary Weapon
                                        </h3>
                                        <button onClick={() => setIsSelectingPath(false)} className="text-white/40 hover:text-white text-xs font-bold uppercase transition-colors">Cancel</button>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { id: 'js', label: 'JavaScript', color: 'bg-nav-yellow', text: 'text-black', shadow: 'shadow-[0_8px_0_#b38d00]', icon: Braces },
                                            { id: 'python', label: 'Python', color: 'bg-nav-blue', text: 'text-white', shadow: 'shadow-[0_8px_0_#4c51bf]', icon: Terminal },
                                            { id: 'cpp', label: 'C++', color: 'bg-nav-lime', text: 'text-black', shadow: 'shadow-[0_8px_0_#8cae00]', icon: Cpu },
                                            { id: 'html', label: 'HTML', color: 'bg-nav-orange', text: 'text-white', shadow: 'shadow-[0_8px_0_#c03515]', icon: Globe }
                                        ].map((lang) => (
                                            <button
                                                key={lang.id}
                                                onClick={async () => {
                                                    await setTrack({ trackId: lang.id });
                                                    router.push('/dashboard/roadmap');
                                                }}
                                                className={`group relative h-32 ${lang.color} ${lang.text} ${lang.shadow} rounded-xl font-black uppercase tracking-tight transition-all active:shadow-none active:translate-y-2 flex flex-col items-center justify-center gap-3`}
                                            >
                                                <div className="p-2 bg-black/10 rounded-lg group-hover:bg-black/20 transition-colors">
                                                    <lang.icon size={24} />
                                                </div>
                                                <span className="relative z-10">{lang.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* HERO CARD: Current Level */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-nav-lime rounded-3xl md:rounded-[3rem] p-6 md:p-10 relative overflow-hidden group min-h-[300px] md:min-h-85 flex flex-col justify-between"
                    >
                        <div className="absolute -right-5 -top-10 opacity-10 group-hover:opacity-20 transition-opacity transform rotate-12">
                            <Trophy size={200} className="md:w-[300px] md:h-[300px]" fill="black" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="px-3 py-1 md:px-4 bg-black text-white rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest">
                                    Current Rank
                                </div>
                            </div>
                            <div className="text-6xl md:text-9xl font-black text-black tracking-tighter leading-[0.8] mb-2">
                                {level}
                            </div>
                            <div className="text-2xl md:text-5xl font-black text-black/40 uppercase tracking-tight">
                                {rank}
                            </div>
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row gap-3 md:gap-4 mt-6 md:mt-8">
                            <button className="bg-black text-white px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-wide hover:scale-105 transition-transform flex items-center justify-center gap-3 shadow-xl text-sm md:text-base">
                                <Code size={18} className="md:w-5 md:h-5" /> Continue Quest
                            </button>
                            <Link href="/dashboard/roadmap">
                                <button className="bg-black/10 text-black px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-wide hover:bg-black/20 transition-colors text-center text-sm md:text-base w-full md:w-auto">
                                    View Roadmap
                                </button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* SECONDARY ROW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Active Module Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-nav-blue rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden h-full min-h-70"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-20">
                                <Terminal size={100} className="text-black" />
                            </div>

                            <h3 className="text-black/60 font-black uppercase tracking-widest text-xs mb-auto">Active Module</h3>

                            {activeGuide ? (
                                <div>
                                    <h2 className="text-3xl font-black text-black leading-tight mb-2">
                                        {activeGuide.title}
                                    </h2>
                                    <div className="w-full bg-black/10 h-3 rounded-full overflow-hidden mt-4">
                                        <div
                                            className="bg-black h-full"
                                            style={{ width: `${activeGuide.progress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mt-2 text-black font-bold text-xs">
                                        <span>Progress</span>
                                        <span>{activeGuide.progress}%</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col justify-center items-center text-center">
                                    <h2 className="text-2xl font-black text-black leading-tight mb-2 opacity-50">
                                        No Active Module
                                    </h2>
                                    <p className="text-black/50 font-bold text-sm">Start a guide to track progress!</p>
                                </div>
                            )}

                            {activeGuide && (
                                <button className="absolute bottom-8 right-8 w-12 h-12 bg-black rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                                    <ArrowUpRight size={20} />
                                </button>
                            )}
                        </motion.div>

                        {/* Achievements Card - REAL DATA */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-[#111] border border-white/10 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden h-full min-h-70"
                        >
                            <h3 className="text-gray-500 font-black uppercase tracking-widest text-xs mb-6">Recent Badges</h3>

                            <div className="flex-1 flex flex-col gap-4">
                                {displayBadges.map((badge, i) => {
                                    const Icon = ICON_MAP[badge.meta?.icon] || Lock;
                                    const isUnlocked = badge.badgeId !== 'locked';

                                    return (
                                        <div key={i} className="flex items-center gap-4 group cursor-default">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isUnlocked ? 'bg-nav-orange text-black' : 'bg-white/5 text-gray-600'
                                                }`}>
                                                <Icon size={20} />
                                            </div>
                                            <div>
                                                <div className={`font-bold text-sm ${isUnlocked ? 'text-white' : 'text-gray-600'}`}>
                                                    {badge.meta?.title || 'Locked'}
                                                </div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                                                    {isUnlocked ? `Unlocked ${new Date(badge.unlockedAt).toLocaleDateString()}` : '---'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>

                    </div>
                </div>

                {/* COL 2: Sidebar Stats (Span 4) */}
                <div className="md:col-span-4 flex flex-col gap-6">

                    {/* Activity Graph */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-[#111] border border-white/10 rounded-[2.5rem] p-8 h-full min-h-75"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-gray-500 font-black uppercase tracking-widest text-xs">Activity Log</h3>
                            <select className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer">
                                <option>This Week</option>
                                <option>This Month</option>
                            </select>
                        </div>
                        <ActivityGraph data={weeklyXP || []} />
                    </motion.div>

                    {/* Daily Challenge */}
                    {/* <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-br from-[#111] to-nav-blue rounded-[2.5rem] p-8 relative overflow-hidden border border-white/10"
                    >
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <Zap size={20} className="text-white" fill="white" />
                                <span className="text-white font-black uppercase tracking-widest text-xs">Daily Quest</span>
                            </div>
                            <h3 className="text-2xl font-black text-white leading-tight mb-4">
                                Refactor the Login Component
                            </h3>
                            <div className="flex items-center gap-2 mb-6">
                                <span className="px-3 py-1 bg-black/20 rounded-full text-white text-xs font-bold">+50 XP</span>
                                <span className="px-3 py-1 bg-black/20 rounded-full text-white text-xs font-bold">15m</span>
                            </div>
                            <button className="w-full py-3 bg-white text-black font-black uppercase tracking-wide rounded-xl hover:bg-opacity-90 transition-opacity">
                                Start Challenge
                            </button>
                        </div>
                    </motion.div> */}

                </div>

            </div>
        </div>
    );
}
