'use client';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Code, FileText, Video, Layers, Braces, Hash, Terminal, ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';

const RESOURCES: Record<string, any[]> = {
  JavaScript: [
    {
       title: 'ES6+ Features',
       description: 'Arrow functions, destructuring, and template literals.',
       type: 'Guide',
       icon: Code,
       color: 'bg-yellow-500',
       textAccent: 'text-yellow-500'
    },
    {
       title: 'Async/Await Mastery',
       description: 'Handling promises and asynchronous operations gracefully.',
       type: 'Video',
       icon: Video,
       color: 'bg-yellow-500', 
       textAccent: 'text-yellow-500'
    }
  ],
  HTML: [
    {
      title: 'HTML5 Semantic Structure',
      description: 'Learn how to build accessible and SEO-friendly layouts using semantic tags.',
      type: 'Guide',
      icon: Braces,
      color: 'bg-nav-orange',
      textAccent: 'text-nav-orange'
    },
    {
      title: 'Forms & Inputs Masterclass',
      description: 'Deep dive into input types, validation, and accessibility attributes.',
      type: 'Cheatsheet',
      icon: FileText,
      color: 'bg-nav-orange',
      textAccent: 'text-nav-orange'
    },
    {
      title: 'DOM Tree Visualization',
      description: 'Understanding parent-child relationships and the document object model.',
      type: 'Interactive',
      icon: Layers,
      color: 'bg-nav-orange',
      textAccent: 'text-nav-orange'
    }
  ],
  CSS: [
    {
      title: 'Flexbox Froggy Guide',
      description: 'Complete breakdown of justify-content, align-items, and flex-direction.',
      type: 'Guide',
      icon: Layers,
      color: 'bg-nav-blue',
      textAccent: 'text-nav-blue'
    },
    {
      title: 'Grid Layout Systems',
      description: 'Build complex 2D layouts with CSS Grid. The ultimate responsive tool.',
      type: 'Video',
      icon: Video,
      color: 'bg-nav-blue',
      textAccent: 'text-nav-blue'
    },
    {
      title: 'Animations & Keyframes',
      description: 'Bring your UI to life with performant CSS transitions and animations.',
      type: 'Cheatsheet',
      icon: Code,
      color: 'bg-nav-blue',
      textAccent: 'text-nav-blue'
    }
  ],
  Python: [
    {
      title: 'Python Data Structures',
      description: 'Lists, Dictionaries, Sets, and Tuples. When to use what.',
      type: 'Guide',
      icon: Hash,
      color: 'bg-nav-yellow',
      textAccent: 'text-nav-yellow'
    },
    {
      title: 'OOP Principles',
      description: 'Classes, Inheritance, and Polymorphism explained simply.',
      type: 'Guide',
      icon: Braces,
      color: 'bg-nav-yellow',
      textAccent: 'text-nav-yellow'
    },
    {
      title: 'NumPy & Pandas Intro',
      description: 'Getting started with data science libraries.',
      type: 'Video',
      icon: Video,
      color: 'bg-nav-yellow',
      textAccent: 'text-nav-yellow'
    }
  ],
  'C++': [
    {
      title: 'Pointers & Memory',
      description: 'The hardest part of C++ explained visually. Stack vs Heap.',
      type: 'Deep Dive',
      icon: Terminal,
      color: 'bg-nav-lime',
      textAccent: 'text-nav-lime'
    },
    {
      title: 'STL Algorithms',
      description: 'Sorting, searching, and manipulating vectors efficiently.',
      type: 'Cheatsheet',
      icon: FileText,
      color: 'bg-nav-lime',
      textAccent: 'text-nav-lime'
    },
    {
      title: 'Modern C++ Features',
      description: 'Auto, Lambdas, and Smart Pointers (C++11 to C++20).',
      type: 'Guide',
      icon: Code,
      color: 'bg-nav-lime',
      textAccent: 'text-nav-lime'
    }
  ]
};

const TABS = ['HTML', 'CSS', 'JavaScript', 'Python', 'C++'];

export default function LearnPage() {
  const user = useQuery(api.users.viewer);
  const updateLanguage = useMutation(api.users.updatePreferredLanguage);
  
  const [activeTab, setActiveTab] = useState('HTML');

  // Sync with user preference once loaded
  useEffect(() => {
    if (user?.preferredLanguage && TABS.includes(user.preferredLanguage)) {
        setActiveTab(user.preferredLanguage);
    }
  }, [user]);

  const handleTabChange = (tab: string) => {
      setActiveTab(tab);
      if (user) {
          updateLanguage({ language: tab }); // Auto-save preference
      }
  };

  return (
    <div className="p-6 md:p-12 max-w-400 mx-auto min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div>
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white rounded-2xl">
                    <BookOpen size={32} className="text-black" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-white">Knowledge Base</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase text-white leading-[0.85]">
            Learn<br/>
            The Stack
            </h1>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
            {TABS.map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-wide transition-all ${
                        activeTab === tab 
                        ? 'bg-white text-black' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
            {RESOURCES[activeTab as keyof typeof RESOURCES].map((resource, index) => (
                <motion.div
                    layout
                    key={resource.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="group relative bg-[#111] border border-white/10 rounded-[2.5rem] p-1 overflow-hidden hover:border-white/20 transition-colors"
                >
                    <div className="bg-[#151515] rounded-[2.3rem] p-8 h-full flex flex-col relative z-10">
                        
                        {/* Top Row */}
                        <div className="flex justify-between items-start mb-8">
                            <div className={`w-16 h-16 ${resource.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <resource.icon size={32} className="text-black" />
                            </div>
                            <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                {resource.type}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${resource.color} text-black bg-opacity-80`}>
                                    {activeTab}
                                </span>
                            </div>
                            
                            <h3 className="text-3xl font-black text-white mb-3 leading-none group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                                {resource.title}
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed font-medium">
                                {resource.description}
                            </p>
                        </div>

                        {/* Progress & CTA */}
                        <div className="mt-8 pt-8 border-t border-white/5">
                            <Link href={`/dashboard/learn/${resource.title.toLowerCase().replace(/ /g, '-')}`} className="w-full">
                                <button className="w-full py-4 bg-white text-black font-black uppercase tracking-wide rounded-xl hover:bg-nav-lime transition-colors flex items-center justify-center gap-2 group-hover:-translate-y-0.5">
                                    <ArrowRight size={18} fill="black" /> Start Reading
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Hover Glow Effect */}
                    <div className={`absolute inset-0 ${resource.color} opacity-0 group-hover:opacity-5 blur-2xl transition-opacity pointer-events-none`} />
                </motion.div>
            ))}
        </AnimatePresence>
        
        {/* Placeholder for "More Coming Soon" */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center p-8 border-2 border-dashed border-white/5 rounded-[2.5rem] hover:border-white/10 transition-colors min-h-75"
        >
            <div className="text-center opacity-40">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Code size={32} />
                </div>
                <p className="text-white font-black uppercase tracking-widest text-lg">More Modules<br/>Coming Soon</p>
            </div>
        </motion.div>

      </div>
    </div>
  );
}
