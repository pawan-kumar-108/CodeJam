'use client';
import Link from 'next/link';
import { Menu, X, ArrowUpRight, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.viewer);

  // Lock scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  return (
    <>
      {/* Top Header Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-6 flex justify-between items-center pointer-events-none transition-colors duration-300 ${isOpen ? 'text-black' : 'text-white mix-blend-difference'}`}>

        {/* Logo */}
        <Link href="/" className="pointer-events-auto flex items-center gap-3 group">
          <div className={`p-2 rounded-full transition-colors duration-300 ${isOpen ? 'bg-black text-white' : 'bg-nav-orange text-black'} group-hover:scale-110`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-black text-2xl tracking-tighter uppercase hidden md:block">CODEJAM</span>
        </Link>

        {/* Right Controls */}
        <div className="pointer-events-auto flex items-center gap-4">
          
          {/* Auth State Handling */}
          {user === undefined ? (
             // Loading State
             <div className="h-10 w-24 bg-white/10 rounded-full animate-pulse hidden md:block" />
          ) : user === null ? (
            // Logged Out -> Launch App
            <Link href="/auth" className="hidden md:block">
              <button className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all font-bold uppercase text-sm tracking-wide ${isOpen
                ? 'border-black/20 hover:bg-black hover:text-white'
                : 'border-white/20 hover:bg-white hover:text-black'
                }`}>
                Launch App <ArrowUpRight size={18} />
              </button>
            </Link>
          ) : (
            // Logged In -> User Profile
            <div className="hidden md:block relative group">
                <div 
                  onClick={toggleProfile}
                  className={`flex items-center gap-3 px-6 py-3 rounded-full border backdrop-blur-md transition-all font-bold uppercase text-sm tracking-wide cursor-pointer select-none ${isOpen
                  ? 'border-black/20 bg-black/5 text-black'
                  : 'border-white/20 bg-white/10 text-white'
                  }`}
                >
                  {user.customAvatar || user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.customAvatar || user.image} alt="Profile" className="w-6 h-6 rounded-full bg-white/10" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-nav-lime animate-pulse"></div>
                  )}
                  <span>{user.name || user.email?.split('@')[0] || 'Member'}</span>
                  {!(user.customAvatar || user.image) && <User size={16} className="opacity-50" />}
                </div>

                {/* Click Menu */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-full pt-2 flex flex-col gap-2"
                    >
                        <Link 
                            href="/dashboard"
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-white text-black font-black uppercase text-xs tracking-wider hover:scale-105 transition-transform shadow-xl"
                        >
                            <LayoutDashboard size={14} /> Dashboard
                        </Link>
                        <button 
                            onClick={() => signOut()}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-nav-orange text-black font-black uppercase text-xs tracking-wider hover:scale-105 transition-transform shadow-xl"
                        >
                            <LogOut size={14} /> Log Out
                        </button>
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>
          )}

          <button
            onClick={toggleMenu}
            className={`flex items-center gap-2 px-4 py-3 rounded-full transition-colors group ${isOpen ? 'hover:bg-black/10' : 'hover:bg-white/10'
              }`}
          >
            <span className="font-bold uppercase text-sm tracking-wide hidden md:block">
              {isOpen ? 'Close' : 'Menu'}
            </span>
            <div className="relative w-6 h-6">
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    className="absolute inset-0"
                  >
                    <X size={24} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    className="absolute inset-0"
                  >
                    <Menu size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </button>
        </div>
      </nav>

      {/* Full Screen Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }} // Bezier for snappy slide
            className="fixed inset-0 z-40 bg-nav-orange flex flex-col justify-center items-center px-4"
          >
            <div className="flex flex-col items-center gap-2 md:gap-6">
              {['Challenges', 'Leaderboard', 'Roadmap', 'Contact'].map((item, i) => (
                <div key={item} className="overflow-hidden">
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "100%" }}
                    transition={{ duration: 0.5, delay: 0.3 + (i * 0.1), ease: [0.76, 0, 0.24, 1] }}
                  >
                    <Link
                      href={item === 'Contact' ? '#contact' : '#'}
                      onClick={(e) => {
                        toggleMenu();
                        if (item === 'Contact') {
                          e.preventDefault();
                          const el = document.getElementById('contact');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="block text-[12vw] md:text-[8vw] font-black text-black leading-[0.9] hover:text-[#FDF9F0] transition-colors tracking-tighter uppercase"
                    >
                      {item}
                    </Link>
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Mobile CTA inside menu */}
            <div className="mt-12 md:hidden overflow-hidden">
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                {/* Mobile Auth Button */}
                {user ? (
                    <button 
                        onClick={() => signOut()}
                        className="bg-black text-white px-8 py-4 rounded-full font-black text-xl uppercase tracking-wide flex items-center gap-3"
                    >
                        Log Out <LogOut size={24} />
                    </button>
                ) : (
                    <Link href="/auth">
                    <button className="bg-black text-white px-8 py-4 rounded-full font-black text-xl uppercase tracking-wide flex items-center gap-3">
                        Launch App <ArrowUpRight size={24} />
                    </button>
                    </Link>
                )}
              </motion.div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
