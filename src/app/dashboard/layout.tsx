'use client';
import DashboardSidebar from "@/components/DashboardSidebar";
import FriendsSidebar from "@/components/FriendsSidebar";
import SmoothScroll from "@/components/SmoothScroll";
import { useState, useEffect } from 'react';
import { Menu, X, Users } from 'lucide-react';
import Link from 'next/link';

import { Authenticated } from "../Authenticated";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [friendsSidebarCollapsed, setFriendsSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [friendsMobileOpen, setFriendsMobileOpen] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    const checkCollapsed = () => {
      const storedLeft = localStorage.getItem('sidebar-collapsed');
      setSidebarCollapsed(storedLeft === 'true');

      const storedRight = localStorage.getItem('friends-sidebar-collapsed');
      setFriendsSidebarCollapsed(storedRight === 'true');
    };
    
    checkCollapsed();
    
    // Listen for storage changes (from sidebar toggles)
    window.addEventListener('storage', checkCollapsed);
    
    // Also poll for changes since storage event doesn't fire in same tab
    const interval = setInterval(checkCollapsed, 100);
    
    return () => {
      window.removeEventListener('storage', checkCollapsed);
      clearInterval(interval);
    };
  }, []);

  return (
    <Authenticated>
      <div className="bg-nav-black min-h-screen text-white font-sans selection:bg-nav-orange selection:text-white flex flex-col md:block">
        
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-50 bg-[#0A0A0A] border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 text-gray-400 hover:text-white"
          >
            <Menu size={24} />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <div className="bg-nav-orange p-1.5 rounded-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-black text-lg tracking-tight">CODEJAM</span>
          </Link>
          
          <button 
             onClick={() => setFriendsMobileOpen(true)}
             className="p-2 -mr-2 text-gray-400 hover:text-white"
          >
            <Users size={24} />
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <SmoothScroll>
          <div className={`md:block ${mobileMenuOpen ? 'block fixed inset-0 z-70' : 'hidden'}`}>
             <DashboardSidebar isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
          </div>
          
          <FriendsSidebar isMobileOpen={friendsMobileOpen} onMobileClose={() => setFriendsMobileOpen(false)} />

          <main 
            className="min-h-screen transition-all duration-300 p-4 md:p-8 md:pl-[var(--sidebar-width)] md:pr-[var(--friends-width)]"
            style={{ 
                '--sidebar-width': sidebarCollapsed ? '80px' : '256px',
                '--friends-width': friendsSidebarCollapsed ? '80px' : '280px'
            } as React.CSSProperties}
          >
            {children}
          </main>
        </SmoothScroll>
      </div>
    </Authenticated>
  );
}
