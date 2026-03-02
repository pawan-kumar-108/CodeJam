'use client';
import Link from 'next/link';
import { ArrowUpRight, Twitter, Linkedin, Youtube, Facebook } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer id="contact" className="bg-nav-black text-white relative z-10">
      {/* Grid Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-white/10">
        <FooterLink title="Challenges" href="#" />
        <FooterLink title="Leaderboard" href="#" />
        <FooterLink title="Roadmap" href="#" />
        <FooterLink title="Blog" href="#" />
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 px-6 py-8 md:py-12 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-20 md:mb-12">
          {/* Credit Badge */}
          <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10 hover:bg-nav-lime hover:border-nav-lime group transition-all duration-300">
            <span className="w-2 h-2 bg-nav-lime rounded-full group-hover:bg-black transition-colors animate-pulse" />
            <span className="text-gray-400 font-bold text-xs uppercase tracking-widest group-hover:text-black transition-colors">
              Hackathon Project <span className="opacity-50 mx-1">|</span> Dawn Saju
            </span>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-gray-500">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <p className="text-gray-600 text-xs">© 2026 CodeJam, LLC. All Rights Reserved.</p>

          {/* Center Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-8 md:bottom-12 hidden md:block">
            <div className="text-nav-lime w-12 h-12 opacity-80 hover:opacity-100 transition-opacity">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>

          <div className="flex gap-6">
            {/* X Icon (Custom SVG for X/Twitter) */}
            <Link href="#" className="text-white hover:text-nav-lime transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Link>
            <Link href="#" className="text-white hover:text-nav-lime transition-colors"><Linkedin size={20} /></Link>
            <Link href="#" className="text-white hover:text-nav-lime transition-colors"><Youtube size={20} /></Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ title, href }: { title: string, href: string }) {
  return (
    <Link href={href} className="group relative border-b md:border-b-0 md:border-r border-white/10 h-48 md:h-64 flex flex-col justify-end p-6 md:p-10 hover:bg-[#1a1a1a] transition-colors last:border-r-0">
      <div className="flex justify-between items-end w-full">
        <span className="text-3xl md:text-5xl font-black tracking-tighter text-white group-hover:text-nav-lime transition-colors">{title}</span>
        <ArrowUpRight size={40} className="text-nav-lime transform group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-300" strokeWidth={2.5} />
      </div>
    </Link>
  )
}
