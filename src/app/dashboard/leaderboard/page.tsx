'use client';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Flame, Star, Shield } from 'lucide-react';
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function LeaderboardPage() {
    const topUsers = useQuery(api.users.getTopUsers, { limit: 50 });
    const currentUser = useQuery(api.users.viewer);

    // Skeleton loader
    if (topUsers === undefined) {
        return (
            <div className="p-6 md:p-12 max-w-[1600px] mx-auto min-h-screen">
                <div className="animate-pulse space-y-8">
                    <div className="h-20 w-64 bg-white/5 rounded-2xl" />
                    <div className="h-64 w-full bg-white/5 rounded-[3rem]" />
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-20 w-full bg-white/5 rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const podiumUsers = topUsers.slice(0, 3);
    const listUsers = topUsers.slice(3);

    return (
        <div className="p-6 md:p-12 max-w-[1600px] mx-auto min-h-screen">
            
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-16"
            >
                <h1 className="text-5xl md:text-7xl font-black mb-2 tracking-tighter uppercase leading-[0.9] text-white">
                    Leader<span className="text-nav-lime">board</span>
                </h1>
                <p className="text-gray-400 font-medium text-lg uppercase tracking-widest">
                    Global Rankings & Champions
                </p>
            </motion.div>

            {/* Podium Section */}
            <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 mb-20 px-4">
                
                {/* 2nd Place */}
                {podiumUsers[1] && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="order-2 md:order-1 w-full md:w-1/3 max-w-[300px]"
                    >
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-gray-300 bg-gray-800 overflow-hidden mb-4 relative z-10 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                {podiumUsers[1].customAvatar || podiumUsers[1].image ? (
                                    <img src={podiumUsers[1].customAvatar || podiumUsers[1].image} alt={podiumUsers[1].name || "User"} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-700 text-2xl font-black text-white">
                                        {(podiumUsers[1].name?.[0] || "?").toUpperCase()}
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 bg-gray-300 text-black w-8 h-8 flex items-center justify-center rounded-full font-black text-sm border-2 border-nav-black">
                                    2
                                </div>
                            </div>
                            <div className="bg-[#111] border border-white/10 w-full p-6 rounded-t-[2.5rem] rounded-b-[1.5rem] flex flex-col items-center pt-10 mt-[-40px] relative">
                                <h3 className="text-white font-black text-xl md:text-2xl text-center line-clamp-1 mb-1">
                                    {podiumUsers[1].name || "Anonymous"}
                                </h3>
                                <p className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-3">Code Warrior</p>
                                <div className="bg-white/5 px-4 py-2 rounded-xl flex items-center gap-2">
                                    <Star size={14} className="text-gray-300 fill-gray-300" />
                                    <span className="text-white font-black text-sm">{podiumUsers[1].xp.toLocaleString()} XP</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 1st Place */}
                {podiumUsers[0] && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                        className="order-1 md:order-2 w-full md:w-1/3 max-w-[340px] z-10"
                    >
                        <div className="flex flex-col items-center">
                            <div className="relative mb-6">
                                <Crown className="absolute -top-12 left-1/2 -translate-x-1/2 text-nav-yellow w-12 h-12 animate-bounce" fill="#FFC900" />
                                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-nav-yellow bg-gray-800 overflow-hidden relative z-10 shadow-[0_0_50px_rgba(255,201,0,0.3)]">
                                    {podiumUsers[0].customAvatar || podiumUsers[0].image ? (
                                        <img src={podiumUsers[0].customAvatar || podiumUsers[0].image} alt={podiumUsers[0].name || "User"} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-700 text-4xl font-black text-white">
                                            {(podiumUsers[0].name?.[0] || "?").toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-nav-yellow text-black w-10 h-10 flex items-center justify-center rounded-full font-black text-lg border-4 border-nav-black">
                                    1
                                </div>
                            </div>
                            
                            <div className="bg-gradient-to-b from-[#222] to-[#111] border border-nav-yellow/30 w-full p-8 rounded-t-[3rem] rounded-b-[2rem] flex flex-col items-center pt-12 mt-[-50px] relative shadow-2xl">
                                <h3 className="text-white font-black text-2xl md:text-3xl text-center line-clamp-1 mb-1">
                                    {podiumUsers[0].name || "Anonymous"}
                                </h3>
                                <p className="text-nav-yellow font-bold uppercase text-xs tracking-widest mb-4">Current Champion</p>
                                <div className="bg-nav-yellow px-6 py-2 rounded-xl flex items-center gap-2 shadow-[0_4px_0px_#cc9a00] active:translate-y-[2px] active:shadow-none transition-all">
                                    <Trophy size={16} className="text-black fill-black" />
                                    <span className="text-black font-black text-lg">{podiumUsers[0].xp.toLocaleString()} XP</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 3rd Place */}
                {podiumUsers[2] && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="order-3 w-full md:w-1/3 max-w-[300px]"
                    >
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-orange-700 bg-gray-800 overflow-hidden mb-4 relative z-10 shadow-[0_0_30px_rgba(194,65,12,0.2)]">
                                {podiumUsers[2].customAvatar || podiumUsers[2].image ? (
                                    <img src={podiumUsers[2].customAvatar || podiumUsers[2].image} alt={podiumUsers[2].name || "User"} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-700 text-2xl font-black text-white">
                                        {(podiumUsers[2].name?.[0] || "?").toUpperCase()}
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 bg-orange-700 text-white w-8 h-8 flex items-center justify-center rounded-full font-black text-sm border-2 border-nav-black">
                                    3
                                </div>
                            </div>
                            <div className="bg-[#111] border border-white/10 w-full p-6 rounded-t-[2.5rem] rounded-b-[1.5rem] flex flex-col items-center pt-10 mt-[-40px] relative">
                                <h3 className="text-white font-black text-xl md:text-2xl text-center line-clamp-1 mb-1">
                                    {podiumUsers[2].name || "Anonymous"}
                                </h3>
                                <p className="text-orange-700 font-bold uppercase text-xs tracking-wider mb-3">Rising Star</p>
                                <div className="bg-white/5 px-4 py-2 rounded-xl flex items-center gap-2">
                                    <Star size={14} className="text-orange-700 fill-orange-700" />
                                    <span className="text-white font-black text-sm">{podiumUsers[2].xp.toLocaleString()} XP</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* List Section */}
            <div className="max-w-5xl mx-auto space-y-3">
                {listUsers.map((user, index) => {
                    const rank = index + 4;
                    const isMe = currentUser?._id === user._id;

                    return (
                        <motion.div
                            key={user._id}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.01] ${
                                isMe 
                                    ? 'bg-white/10 border-nav-lime/50 shadow-[0_0_20px_rgba(204,255,0,0.1)]' 
                                    : 'bg-[#111] border-white/5 hover:bg-white/5 hover:border-white/10'
                            }`}
                        >
                            <div className="w-12 text-center font-black text-gray-500 text-xl">
                                #{rank}
                            </div>
                            
                            <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden shrink-0">
                                {user.customAvatar || user.image ? (
                                    <img src={user.customAvatar || user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white font-bold">
                                        {(user.name?.[0] || "?").toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <h4 className={`font-bold text-lg ${isMe ? 'text-nav-lime' : 'text-white'}`}>
                                    {user.name || "Anonymous"} {isMe && "(You)"}
                                </h4>
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <Shield size={12} /> Level {user.level}
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="font-black text-white text-xl">
                                    {user.xp.toLocaleString()} <span className="text-nav-yellow text-sm">XP</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {listUsers.length === 0 && (
                    <div className="text-center py-20 text-gray-500 font-medium">
                        No other players found yet. Invite your friends!
                    </div>
                )}
            </div>

        </div>
    );
}
