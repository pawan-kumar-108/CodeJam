'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { LayoutGrid, Gamepad2, Settings, LogOut, Zap, BookOpen, ChevronLeft, ChevronRight, Terminal, Trophy, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from 'react';

const menuItems = [
  { icon: LayoutGrid, label: 'Overview', href: '/dashboard' },
  { icon: Trophy, label: 'Leaderboard', href: '/dashboard/leaderboard' },
  { icon: Gamepad2, label: 'Library', href: '/dashboard/library' },
  { icon: BookOpen, label: 'Learn', href: '/dashboard/learn' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

interface DashboardSidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export default function DashboardSidebar({ isMobileOpen, onMobileClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthActions();
  const feed = useQuery(api.activity.getSidebarFeed);
  
  // Initialize from localStorage if available
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored !== null) {
      setIsCollapsed(stored === 'true');
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const isExpanded = isMobileOpen || !isCollapsed;

  return (
    <motion.aside
      initial={false}
      animate={{ 
        x: 0, 
        opacity: 1,
        width: isMobileOpen ? 280 : (isCollapsed ? 80 : 256)
      }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed left-0 top-0 bottom-0 bg-nav-black border-r border-white/10 z-40 flex flex-col justify-between p-4 ${isMobileOpen ? 'translate-x-0 !w-[280px] shadow-2xl' : ''}`}
    >
      {/* Mobile Close */}
      <div className="md:hidden absolute right-2 top-2 z-50">
        <button 
            onClick={onMobileClose}
            className="p-2 text-gray-400 hover:text-white bg-white/10 rounded-full"
        >
            <X size={20} />
        </button>
      </div>

      {/* Toggle Button (Desktop Only) */}
      <button
        onClick={toggleCollapse}
        className="hidden md:flex absolute -right-3 top-8 w-6 h-6 bg-nav-lime rounded-full items-center justify-center text-black hover:scale-110 transition-transform z-50 shadow-lg"
      >
        {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
      </button>

      {/* Logo Area */}
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-nav-orange p-2 rounded-xl shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.span  
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="text-white font-black text-2xl tracking-tight whitespace-nowrap overflow-hidden"
            >
              <Link href="/">Code Jam</Link>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div 
                className={`
                  flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group relative overflow-hidden
                  ${!isExpanded ? 'justify-center' : ''}
                  ${isActive ? 'text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                `}
                title={!isExpanded ? item.label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-nav-lime"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon size={22} className="relative z-10 shrink-0" />
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-bold relative z-10 whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* New Features Feed */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             exit={{ opacity: 0, height: 0 }}
             className="mb-4 overflow-hidden"
          >
             {/* Section Label */}
             <div className="px-2 mb-3 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Radar</span>
                <div className="flex gap-1">
                    <span className="w-1 h-1 rounded-full bg-nav-lime animate-pulse delayed-0" />
                    <span className="w-1 h-1 rounded-full bg-nav-lime animate-pulse delayed-1" />
                    <span className="w-1 h-1 rounded-full bg-nav-lime animate-pulse delayed-2" />
                </div>
             </div>

             <div className="space-y-2">
                {feed?.map((item: any, i: number) => (
                    <div key={i} className="group relative p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all cursor-pointer">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[9px] font-black uppercase tracking-wider text-black px-1.5 py-0.5 rounded-sm ${item.badgeColor || 'bg-gray-400'}`}>
                                        {item.badge}
                                    </span>
                                    <span className={`text-white font-bold text-xs group-hover:text-nav-blue transition-colors line-clamp-1`}>
                                        {item.title}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-[10px] font-medium leading-relaxed line-clamp-2">
                                    {item.subtitle}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
                {!feed && (
                    <div className="p-3 text-center">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-nav-lime rounded-full animate-spin mx-auto" />
                    </div>
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className={`mt-6 flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-red-400 transition-colors ${!isExpanded ? 'justify-center' : 'w-full'}`}
        title={!isExpanded ? 'Logout' : undefined}
      >
        <LogOut size={22} className="shrink-0" />
        <AnimatePresence>
          {isExpanded && (
            <motion.span 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="font-bold whitespace-nowrap overflow-hidden"
            >
              Logout
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </motion.aside>
  );
}
