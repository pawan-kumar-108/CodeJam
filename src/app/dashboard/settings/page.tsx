'use client';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { User, Shield, AlertTriangle, LogOut, Edit2, CreditCard, X, Dice5, Check, Image as ImageIcon } from 'lucide-react';
import { useAuthActions } from "@convex-dev/auth/react";
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

function Sticker({ 
  children, 
  className = "", 
  color = "bg-white", 
  rotation = 0,
  onClick
}: { 
  children: React.ReactNode; 
  className?: string; 
  color?: string; 
  rotation?: number;
  onClick?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, rotate: rotation + 2, cursor: onClick ? 'pointer' : 'default' }}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`flex items-center justify-center shadow-2xl text-black font-black uppercase tracking-tight ${color} ${className}`}
      style={{ rotate: rotation }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

const AVATAR_STYLES = [
  { id: 'notionists', label: 'Sketch' },
  { id: 'dylan', label: 'Dylan' },
  { id: 'shapes', label: 'Abstract' },
  { id: 'lorelei', label: 'Persona' },
  { id: 'avataaars', label: 'Classic' },
];

function TrackSelector() {
    const setTrack = useMutation(api.campaign.setTrack);
    const progress = useQuery(api.campaign.getUserProgress);
    const [selected, setSelected] = useState(progress?.currentTier || 'html');
    const [isOpen, setIsOpen] = useState(false);
    
    // Sync with DB
    useEffect(() => {
        if (progress?.currentTier) setSelected(progress.currentTier);
    }, [progress]);

    const handleSelect = async (trackId: string) => {
        setSelected(trackId);
        await setTrack({ trackId });
        setIsOpen(false);
    };

    const tracks = [
        { id: 'html', label: 'HTML' },
        { id: 'python', label: 'Python' },
        { id: 'cpp', label: 'C++' },
        { id: 'js', label: 'JavaScript' },
        { id: 'tailwindcss', label: 'TailwindCSS' },
    ];

    const currentTrack = tracks.find(t => t.id === selected) || tracks[0];

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-[#111] border border-white/10 rounded-2xl hover:border-white/30 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="font-bold uppercase tracking-wide text-white">{currentTrack.label}</span>
                </div>
                <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 max-h-60 overflow-y-auto"
                    >
                        {tracks.map(track => (
                            <button
                                key={track.id}
                                onClick={() => handleSelect(track.id)}
                                className={`
                                    w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors text-left
                                    ${selected === track.id ? 'bg-white/10 text-nav-lime' : 'text-gray-400'}
                                `}
                            >
                                <span className="font-bold uppercase tracking-wide">{track.label}</span>
                                {selected === track.id && <Check size={16} className="ml-auto" />}
                            </button>
                        ))}
                        <div className="p-4 text-xs font-bold text-gray-600 uppercase tracking-widest text-center border-t border-white/5">
                            More coming soon...
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function SettingsPage() {
  const user = useQuery(api.users.viewer);
  const updateImage = useMutation(api.users.updateImage);
  const updateName = useMutation(api.users.updateName);
  const { signOut } = useAuthActions();
  
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarStyle, setAvatarStyle] = useState('notionists');
  const [avatarSeed, setAvatarSeed] = useState('');
  
  // Name Edit State
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  // Initialize seed from username if empty
  useEffect(() => {
    if (user?.name) {
        if (!avatarSeed) setAvatarSeed(user.name);
        if (!newName) setNewName(user.name);
    }
  }, [user, avatarSeed, newName]); // Added newName default init

  const handleSaveAvatar = async () => {
    const url = `https://api.dicebear.com/9.x/${avatarStyle}/svg?seed=${avatarSeed}`;
    await updateImage({ image: url });
    setIsAvatarModalOpen(false);
  };

  const handleSaveName = async () => {
      if (!newName.trim()) return;
      await updateName({ name: newName });
      setIsEditingName(false);
  };

  const randomize = () => {
    setAvatarSeed(Math.random().toString(36).substring(7));
  };

  if (!user) {
    return (
        <div className="flex items-center justify-center h-[50vh]">
            <div className="w-8 h-8 border-4 border-white/20 border-t-nav-lime rounded-full animate-spin" />
        </div>
    )
  }

  const previewUrl = `https://api.dicebear.com/9.x/${avatarStyle}/svg?seed=${avatarSeed}`;

  return (
    <div className="p-6 md:p-12 max-w-300 mx-auto min-h-screen relative">
      
      {/* HEADER - Balanced */}
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-[#FDF9F0] leading-[0.9]">
          Identity<br/>
          <span className="text-nav-blue">Config.</span>
        </h1>
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full bg-nav-lime animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-white/60">System Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* LEFT COL: Visual Identity */}
        <div className="lg:col-span-1">
            <div className="relative inline-block group">
                <Sticker 
                    color="bg-nav-blue" 
                    className="w-40 h-40 rounded-4xl mb-8 overflow-hidden relative" 
                    rotation={-3}
                    onClick={() => setIsAvatarModalOpen(true)}
                >
                    {user.customAvatar || user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.customAvatar || user.image} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <User size={64} strokeWidth={2} className="text-black" />
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 className="text-white" />
                    </div>
                </Sticker>
                
                {/* Decoration */}
                <div className="absolute -z-10 top-4 -right-4 w-40 h-40 rounded-4xl border-2 border-white/10" />
            </div>

            {/* Sidebar Menu */}
            <nav className="space-y-2 mt-4">
                <button className="w-full flex items-center gap-4 px-4 py-3 bg-white/5 rounded-xl text-white font-bold text-sm hover:bg-white/10 transition-colors">
                    <User size={18} className="text-nav-blue" /> Profile Details
                </button>
                <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 font-bold text-sm hover:text-white hover:bg-white/5 transition-colors">
                    <CreditCard size={18} /> Billing & Plan
                </button>
                <div className="h-px bg-white/10 my-4 mx-4" />
                <button 
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 font-bold text-sm hover:text-white hover:bg-white/5 transition-colors"
                >
                    <LogOut size={18} /> Sign Out
                </button>
                <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400/60 font-bold text-sm hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <AlertTriangle size={18} /> Delete Account
                </button>
            </nav>
        </div>

        {/* RIGHT COL: Form Fields */}
        <div className="lg:col-span-2 space-y-12">
            
            {/* Name Section */}
            <div className="group relative">
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-nav-lime mb-2">
                    Display Name <Edit2 size={12} className="opacity-50" />
                </label>
                
                {isEditingName ? (
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="bg-transparent text-4xl md:text-5xl font-black text-white uppercase tracking-tight border-b border-nav-lime pb-2 hover:border-nav-lime/80 transition-colors cursor-text outline-none w-full"
                            autoFocus
                        />
                        <button 
                            onClick={handleSaveName}
                            className="bg-nav-lime text-black px-4 py-2 rounded-lg font-bold text-sm uppercase hover:bg-white transition-colors"
                        >
                            Save
                        </button>
                        <button 
                            onClick={() => {
                                setIsEditingName(false);
                                setNewName(user.name || '');
                            }}
                            className="bg-white/10 text-white px-4 py-2 rounded-lg font-bold text-sm uppercase hover:bg-white/20 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <div 
                        className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight border-b border-white/10 pb-2 hover:border-white/40 transition-colors cursor-pointer flex items-center justify-between"
                        onClick={() => {
                            setIsEditingName(true);
                            setNewName(user.name || '');
                        }}
                    >
                        {user.name || 'Anonymous'}
                        <Edit2 size={24} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500" />
                    </div>
                )}

                <p className="text-xs text-gray-500 mt-2">Publicly visible on leaderboards.</p>
            </div>

            {/* Track Selector (New) */}
            <div className="group relative pt-4">
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-nav-orange mb-4">
                    Primary Learning Track <Edit2 size={12} className="opacity-50" />
                </label>
                <TrackSelector />
            </div>

            {/* Email Section */}
            <div className="group relative opacity-60 hover:opacity-100 transition-opacity">
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                    Access ID <Shield size={12} />
                </label>
                <div className="text-2xl md:text-3xl font-bold text-white tracking-tight border-b border-white/10 pb-2 cursor-not-allowed">
                    {user.email}
                </div>
                <p className="text-xs text-gray-500 mt-2">Managed via Auth Provider.</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8">
                <div className="bg-[#111] p-6 rounded-2xl border border-white/5">
                    <div className="text-nav-blue font-black text-3xl mb-1">{user.plan || 'FREE'}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Current Plan</div>
                </div>
                <div className="bg-[#111] p-6 rounded-2xl border border-white/5">
                    <div className="text-white font-black text-3xl mb-1">{user.questsCompleted || 0}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Quests</div>
                </div>
                <div className="bg-[#111] p-6 rounded-2xl border border-white/5">
                    <div className="text-white font-black text-3xl mb-1">Lvl {user.level || 1}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Rank</div>
                </div>
            </div>

        </div>

      </div>

      {/* AVATAR MODAL */}
      <AnimatePresence>
        {isAvatarModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsAvatarModalOpen(false)}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />
                
                {/* Modal */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative bg-nav-black border border-white/10 rounded-[2.5rem] p-8 w-full max-w-2xl overflow-hidden shadow-2xl"
                >
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
                            Choose <span className="text-nav-orange">Avatar</span>
                        </h2>
                        <button 
                            onClick={() => setIsAvatarModalOpen(false)}
                            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Preview Area */}
                        <div className="flex flex-col items-center justify-center bg-white/5 rounded-3xl p-8 border border-white/10">
                            <div className="w-48 h-48 bg-white/10 rounded-full overflow-hidden mb-6 shadow-2xl">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={randomize}
                                    className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full font-bold text-xs uppercase tracking-wide hover:scale-105 transition-transform"
                                >
                                    <Dice5 size={16} /> Randomize
                                </button>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="space-y-6 flex flex-col h-full">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Visual Style</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {AVATAR_STYLES.map((style) => (
                                        <button
                                            key={style.id}
                                            onClick={() => setAvatarStyle(style.id)}
                                            className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all border ${
                                                avatarStyle === style.id 
                                                ? 'bg-nav-blue text-black border-nav-blue' 
                                                : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'
                                            }`}
                                        >
                                            {style.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-xl p-4 border border-white/10 mt-auto">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Generated From Seed</label>
                                <div className="text-white font-mono text-sm truncate opacity-50">{avatarSeed}</div>
                            </div>

                            <button 
                                onClick={handleSaveAvatar}
                                className="w-full py-4 bg-nav-lime text-black font-black uppercase tracking-wide rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                <Check size={20} /> Save Changes
                            </button>
                        </div>

                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
