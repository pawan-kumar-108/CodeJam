'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Github, Check, ArrowLeft, Smile, Sparkles, Eye, EyeOff, LayoutDashboard, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
    </svg>
  );
}

function Sticker({
  children,
  className = "",
  color = "bg-white",
  rotation = 0,
  type = "square",
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
  rotation?: number;
  type?: "square" | "arrow-left" | "arrow-right";
  delay?: number;
}) {
  const clipPath = type === 'arrow-left'
    ? 'polygon(20% 0%, 100% 0%, 100% 100%, 20% 100%, 0% 50%)'
    : type === 'arrow-right'
      ? 'polygon(0% 0%, 80% 0%, 100% 50%, 80% 100%, 0% 100%)'
      : undefined;

  const paddingClass = type === 'arrow-left' ? 'pl-8 pr-4' : type === 'arrow-right' ? 'pl-4 pr-8' : 'p-4';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: rotation - 10 }}
      animate={{ opacity: 1, scale: 1, rotate: rotation }}
      transition={{ type: "spring", stiffness: 200, damping: 15, delay: delay }}
      whileHover={{ scale: 1.1, rotate: rotation + 5, zIndex: 50 }}
      drag
      dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
      className={`absolute flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.3)] text-black font-black uppercase tracking-tight cursor-grab active:cursor-grabbing ${color} ${className} ${paddingClass}`}
      style={{ clipPath }}
    >
      {children}
    </motion.div>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const { signIn, signOut } = useAuthActions();
  const user = useQuery(api.users.viewer);

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Auto-redirect if redirect flag is present in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('skip_auth_landing') && user) {
        if (!isRedirecting) setIsRedirecting(true);
        router.push('/dashboard');
        localStorage.removeItem('skip_auth_landing');
    }
  }, [user, router, isRedirecting]);

  const onComplete = () => {
    router.push('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setStatus('loading');
    setError(null);
    try {
      await signIn("password", { email, password, flow: mode === 'signup' ? 'signUp' : 'signIn' });
      setStatus('success');
      setTimeout(onComplete, 1000);
    } catch (err) {
      console.error(err);
      setStatus('idle');
      setError("Failed to authenticate. Please check your credentials.");
    }
  };

  const handleProvider = async (provider: "google" | "github") => {
    try {
      await signIn(provider, { redirectTo: "/dashboard" });
    } catch (err) {
      console.error(err);
      setError(`Failed to sign in with ${provider}`);
    }
  }

  // --- Auth State Rendering Logic ---

  if (user === undefined || isRedirecting) {
    // Loading State
    return (
      <div className="min-h-screen bg-nav-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-nav-lime rounded-full animate-spin" />
      </div>
    );
  }

  // Already Logged In State
  if (user !== null) {
    return (
      <div className="relative min-h-screen bg-nav-black overflow-hidden font-sans text-[#FDF9F0] selection:bg-nav-orange selection:text-white flex flex-col items-center justify-center p-4">
        <div className="relative z-20 w-full max-w-md text-center bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-10 shadow-2xl">
          <div className="w-20 h-20 bg-nav-lime text-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(204,255,0,0.3)]">
            <Check size={40} strokeWidth={4} />
          </div>

          <h3 className="text-3xl font-black uppercase text-white mb-2 tracking-tight">Welcome Back</h3>
          <p className="text-white/60 text-lg font-medium mb-8">
            You are signed in as <span className="text-white font-bold border-b border-nav-lime">{user.name || user.email}</span>
          </p>

          <div className="space-y-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-white h-14 rounded-xl flex items-center justify-center text-black font-black uppercase tracking-wide hover:bg-nav-lime transition-all group shadow-lg hover:scale-[1.02]"
            >
              <span className="flex items-center gap-2">
                Go to Dashboard <LayoutDashboard size={20} />
              </span>
            </button>

            <button
              onClick={() => signOut()}
              className="w-full bg-transparent h-12 rounded-xl flex items-center justify-center text-white/60 font-bold uppercase tracking-wide hover:text-white hover:bg-white/5 transition-all text-xs"
            >
              <span className="flex items-center gap-2">
                Sign Out <LogOut size={16} />
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not Logged In - Show Auth Form
  return (
    <div className="relative min-h-screen bg-nav-black overflow-hidden font-sans text-[#FDF9F0] selection:bg-nav-orange selection:text-white flex flex-col items-center justify-center p-4">
      <Link href="/" className="absolute top-8 left-8 z-30 flex items-center gap-2 group">
        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
          <ArrowLeft size={18} />
        </div>
      </Link>

      {/* CENTERPIECE */}
      <div className="relative z-20 w-full max-w-6xl flex flex-col items-center mb-12">
        <div className="relative text-center leading-[0.9] tracking-tighter uppercase font-black text-[#FDF9F0] select-none">

          {/* Row 1: Start Your */}
          <div className="relative inline-block mb-2">
            <span className="text-[10vw] md:text-[5rem] lg:text-[7rem]">Start Your</span>
            <Sticker color="bg-[#797EF6]" type="square" className="w-12 h-12 md:w-20 md:h-20 rounded-xl absolute -top-2 -right-6 md:-right-16" rotation={12} delay={0.2}>
              <Smile size={40} className="text-black" strokeWidth={2.5} />
            </Sticker>
          </div>

          <br />

          {/* Row 2: Coding */}
          <div className="relative inline-block z-10 mb-2">
            <span className="text-[14vw] md:text-[8rem] lg:text-[10rem]">Coding</span>

            <Sticker color="bg-[#FF552E]" type="square" className="w-10 h-10 md:w-16 md:h-16 rounded-xl absolute -top-4 -left-2 md:-top-8 md:-left-12" rotation={-15} delay={0.3}>
              <Sparkles size={32} className="text-black" strokeWidth={2.5} />
            </Sticker>

            <Sticker color="bg-[#797EF6]" type="arrow-left" className="h-8 md:h-12 w-24 md:w-40 absolute top-1/2 -left-10 md:-left-32 -translate-y-1/2" rotation={-5} delay={0.4}>
              <span className="text-[10px] md:text-sm whitespace-nowrap">Front End</span>
            </Sticker>

            <Sticker color="bg-[#CCFF00]" type="arrow-right" className="h-8 md:h-12 w-28 md:w-48 absolute top-1/2 -right-8 md:-right-40 -translate-y-1/2" rotation={6} delay={0.5}>
              <span className="text-[10px] md:text-sm whitespace-nowrap">Back End</span>
            </Sticker>
          </div>

          <br />

          {/* Row 3: Journey */}
          <div className="relative inline-block">
            <span className="text-[12vw] md:text-[7rem] lg:text-[9rem]">Journey</span>
            <Sticker color="bg-[#FFC900]" type="arrow-right" className="h-10 md:h-14 w-28 md:w-48 absolute -bottom-4 left-1/2 -translate-x-1/2" rotation={-3} delay={0.6}>
              <span className="text-[10px] md:text-sm whitespace-nowrap">Full Stack</span>
            </Sticker>
          </div>

        </div>
      </div>

      {/* AUTH FORM */}
      <AnimatePresence mode="wait">
        {status !== 'success' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="w-full max-w-sm relative z-30"
          >
            {/* Toggle Switch */}
            <div className="flex bg-white/5 rounded-full p-1 mb-6 border border-white/10 relative">
              <motion.div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/10 rounded-full"
                animate={{ left: mode === 'signin' ? '4px' : 'calc(50%)' }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <button onClick={() => setMode('signin')} className={`flex-1 py-2 text-xs font-black uppercase tracking-wider relative z-10 transition-colors ${mode === 'signin' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}>Sign In</button>
              <button onClick={() => setMode('signup')} className={`flex-1 py-2 text-xs font-black uppercase tracking-wider relative z-10 transition-colors ${mode === 'signup' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}>Sign Up</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL ADDRESS"
                  className="w-full bg-nav-black/50 backdrop-blur-md border-2 border-white/20 rounded-2xl py-3 px-5 text-white placeholder:text-white/30 focus:border-nav-lime focus:ring-1 focus:ring-nav-lime transition-all outline-none font-bold uppercase text-sm"
                />

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="PASSWORD"
                    className="w-full bg-nav-black/50 backdrop-blur-md border-2 border-white/20 rounded-2xl py-3 px-5 text-white placeholder:text-white/30 focus:border-nav-lime focus:ring-1 focus:ring-nav-lime transition-all outline-none font-bold uppercase text-sm pr-12"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-xs font-bold uppercase tracking-wide text-center">{error}</p>
              )}

              <button
                disabled={!email || !password || status === 'loading'}
                className="w-full bg-white h-12 rounded-2xl flex items-center justify-center text-black font-black uppercase tracking-wide hover:bg-nav-lime transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg"
              >
                {status === 'loading' ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full" />
                ) : (
                  <span className="flex items-center gap-2">
                    {mode === 'signin' ? 'Enter Studio' : 'Create Account'} <ArrowRight size={18} />
                  </span>
                )}
              </button>
            </form>

            <div className="flex justify-center gap-6 mt-8 border-t border-white/10 pt-6">
              <button type="button" onClick={() => handleProvider("google")} className="text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors">
                <GoogleIcon className="w-4 h-4" /> Google
              </button>
              <button type="button" onClick={() => handleProvider("github")} className="text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors">
                <Github size={16} /> GitHub
              </button>
            </div>

            <button 
              type="button" 
              onClick={async () => {
                setIsRedirecting(true);
                if (typeof window !== 'undefined') localStorage.setItem('skip_auth_landing', 'true');
                await signIn("anonymous");
                router.push('/dashboard');
              }}
              className="w-full mt-6 py-3 text-nav-lime/60 hover:text-nav-lime text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 group"
            >
              Play as Guest <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm text-center bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-8"
          >
            <div className="w-16 h-16 bg-nav-lime text-black rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} strokeWidth={4} />
            </div>
            <h3 className="text-2xl font-black uppercase text-white mb-2">Welcome Aboard</h3>
            <p className="text-white/60 text-sm font-medium">Redirecting to your dashboard...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
