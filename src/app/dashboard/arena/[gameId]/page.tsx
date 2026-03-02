'use client';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import GameContainer from '@/components/games/GameContainer';
import { ArrowLeft, Target, Zap, Clock, Trophy, Lock, X } from 'lucide-react';
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useEffect } from 'react';
import { useAuthActions } from "@convex-dev/auth/react";
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from "convex/react";
import Toast, { ToastType } from '@/components/ui/Toast';

const GAME_CONFIGS: Record<string, { language: string; difficulty: string; title: string }> = {
    'syntax-smasher': { language: 'JavaScript', difficulty: 'Beginner', title: 'Syntax Smasher' },
    'logic-labyrinth': { language: 'Python', difficulty: 'Intermediate', title: 'Logic Labyrinth' },
    'css-combat': { language: 'CSS', difficulty: 'Advanced', title: 'CSS Combat' },
    'function-fury': { language: 'JavaScript', difficulty: 'Intermediate', title: 'Function Fury' },
    'algo-arena': { language: 'C++', difficulty: 'Expert', title: 'Algo Arena' },
};

export default function ArenaPage() {
    const params = useParams();
    const router = useRouter();
    const gameId = params.gameId as string;
    const config = GAME_CONFIGS[gameId];
    const user = useQuery(api.users.viewer);
    const { signIn } = useAuthActions();
    const finishBattle = useMutation(api.social.finishBattle);
    const updateGameStats = useMutation(api.social.updateGameStats);
    const searchParams = useSearchParams();
    const battleId = searchParams.get('battle');

    const [showSignUpModal, setShowSignUpModal] = useState(false);
    const [scoreToSave, setScoreToSave] = useState(0);
    const [streak, setStreak] = useState(0);

    const metadata = useQuery(api.games.getGameMetadata, { gameId });
    const gameData = metadata || config;

    // Toast State
    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '',
        type: 'info',
        isVisible: false
    });

    const showToast = (message: string, type: ToastType = 'info') => {
        setToast({ message, type, isVisible: true });
    };

    // Timer Logic - Stopwatch
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [currentScore, setCurrentScore] = useState(0); // Track score here
    const [isGenerating, setIsGenerating] = useState(true); // Default to true as it loads on mount

    useEffect(() => {
        if (isGenerating) return;

        const interval = setInterval(() => setTimeElapsed(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, [isGenerating]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleGameComplete = async (score: number) => {
        // Update stats for logged in users
        if (user && !user.isAnonymous) {
            await updateGameStats({ gameId, score });
        }

        // Handle Ghost Battle Completion
        if (battleId) {
            try {
                // @ts-ignore - Validated ID
                const result = await finishBattle({ battleId: battleId as any, score });
                if (result?.success) {
                    // @ts-ignore
                    const oppScore = result.opponentScore ?? 0;

                    let msg = "";
                    let type: ToastType = "info";

                    // Check if strictly a ghost battle result (win is boolean)
                    // @ts-ignore
                    if (typeof result.win === 'boolean') {
                        // @ts-ignore
                        if (result.win) {
                            msg = "Victory! You beat the ghost.";
                            type = "success";
                            // @ts-ignore
                        } else if (score === oppScore) {
                            msg = "It's a draw! You matched the ghost.";
                            type = "info";
                        } else {
                            // Ensure positive difference for message
                            const diff = Math.max(0, oppScore - score);
                            msg = `Defeat! Ghost won by ${diff} pts.`;
                            type = "error";
                        }
                    } else {
                        // Live Battle or Sync Issue
                        msg = "Battle Score Submitted! Waiting for opponent...";
                        type = "success";
                    }

                    showToast(msg, type);
                    // Wait a bit before redirecting so user sees the toast
                    setTimeout(() => router.push('/dashboard'), 2000);
                    return;
                }
            } catch (e) {
                console.error(e);
            }
        }

        if (user?.isAnonymous) {
            setScoreToSave(score);
            setShowSignUpModal(true);
        } else {
            router.push('/dashboard/library');
        }
    };

    const handleProvider = async (provider: "google" | "github") => {
        try {
            await signIn(provider);
            // After sign in, the user might be redirected or session updated.
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-nav-black text-white p-6 md:p-8 flex flex-col relative">

            {/* ARENA HEADER */}
            <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.back()}
                        className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-widest text-red-500">Live Session</span>
                        </div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">
                            {gameData?.title || 'Unknown Module'}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => handleGameComplete(currentScore)}
                        className="bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                    >
                        End Game
                    </button>
                    <div className="flex items-center gap-4 bg-[#111] px-6 py-3 rounded-2xl border border-white/10">
                        <Clock size={18} className="text-nav-blue" />
                        <span className="font-mono font-bold text-xl text-white">
                            {formatTime(timeElapsed)}
                        </span>
                    </div>
                </div>
            </header>

            {/* META INFO BAR (New Position) */}
            <div className="flex flex-col xl:flex-row gap-6 mb-6">

                {/* Mission Goals - Horizontal */}
                <div className="flex-1 bg-[#111] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-max">
                        <Target size={16} className="text-gray-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-gray-500">Mission Goals</span>
                    </div>

                    {metadata ? (
                        <div className="flex flex-wrap gap-3 w-full md:w-auto">
                            {metadata.objectives.map((obj: any, idx: number) => {
                                const isComplete =
                                    (obj.type === 'streak' && streak >= obj.target) ||
                                    (obj.type === 'collection' && currentScore >= obj.target * 10);

                                return (
                                    <div key={idx} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${isComplete ? 'bg-nav-lime/10 border-nav-lime/20' : 'bg-white/5 border-white/5'}`}>
                                        <div className={`w-4 h-4 rounded-full border-2 ${isComplete ? 'border-nav-lime' : 'border-white/20'} flex items-center justify-center`}>
                                            {isComplete && <div className="w-1.5 h-1.5 rounded-full bg-nav-lime" />}
                                        </div>
                                        <span className={`text-xs font-bold ${isComplete ? 'text-gray-200' : 'text-gray-500'}`}>
                                            {obj.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="animate-pulse flex gap-2">
                            <div className="h-8 bg-white/5 rounded w-24"></div>
                            <div className="h-8 bg-white/5 rounded w-24"></div>
                        </div>
                    )}
                </div>

                {/* Rewards - Compact */}
                <div className="xl:w-[400px] bg-gradient-to-r from-nav-blue/10 to-transparent border border-nav-blue/20 rounded-2xl p-4 flex items-center gap-6">
                    <div className="flex items-center gap-2 min-w-max">
                        <Zap size={16} className="text-nav-blue" />
                        <span className="text-xs font-black uppercase tracking-widest text-nav-blue">Rewards</span>
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-4">
                        <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-nav-blue rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((currentScore / 1000) * 100, 100)}%` }}
                                transition={{ type: "spring", stiffness: 100 }}
                            />
                        </div>
                        <span className="text-lg font-black text-white whitespace-nowrap">+{currentScore} XP</span>
                    </div>
                </div>
            </div>

            {/* GAME STAGE (Full Width) */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 bg-[#0a0a0a] rounded-[2.5rem] border border-white/5 relative overflow-hidden flex items-center justify-center p-8">
                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                    {/* Game Component Routing */}
                    {gameData ? (
                        <GameContainer
                            gameType={gameId}
                            language={gameData.language}
                            difficulty={gameData.difficulty}
                            onComplete={handleGameComplete}
                            currentScore={currentScore}
                            setScore={setCurrentScore}
                            onStreakChange={setStreak}
                            onLoadingChange={setIsGenerating}
                        />
                    ) : (
                        <div className="text-center">
                            <Trophy size={64} className="mx-auto mb-4 text-white/20" />
                            <h2 className="text-2xl font-bold text-white/40 uppercase tracking-widest">Module Not Found</h2>
                        </div>
                    )}
                </div>
            </div>

            {/* SIGN UP MODAL */}
            <AnimatePresence>
                {showSignUpModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-[#111] border border-white/10 rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl text-center"
                        >
                            <div className="w-20 h-20 bg-nav-orange text-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-nav-orange/20">
                                <Lock size={40} strokeWidth={3} />
                            </div>

                            <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">
                                Save Your Progress
                            </h2>
                            <p className="text-gray-400 mb-8">
                                You've earned <span className="text-nav-lime font-bold">{scoreToSave} XP</span>! Create a free account to save your stats and unlock more levels.
                            </p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => handleProvider('google')}
                                    className="w-full py-4 bg-white text-black font-black uppercase tracking-wide rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Continue with Google
                                </button>
                                <button
                                    onClick={() => handleProvider('github')}
                                    className="w-full py-4 bg-[#222] text-white font-black uppercase tracking-wide rounded-xl hover:bg-[#333] transition-colors"
                                >
                                    Continue with GitHub
                                </button>
                            </div>

                            <button
                                onClick={() => router.push('/dashboard/library')}
                                className="mt-6 text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-white transition-colors"
                            >
                                Skip & Lose Progress
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />

        </div>
    );
}
