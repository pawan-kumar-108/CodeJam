'use client';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { ArrowLeft, Clock, BookOpen, Share2, Loader2 } from 'lucide-react';
import 'highlight.js/styles/atom-one-dark.css';
import { useEffect, useState } from 'react';
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

// Fallback Metadata (Legacy)
const GUIDE_META: Record<string, { title: string; category: string }> = {
    'html5-semantic-structure': { title: 'HTML5 Semantic Structure', category: 'HTML' },
    // ... other legacy guides can remain here if needed
};

function GuideSkeleton() {
    return (
      <div className="space-y-8 animate-pulse opacity-50">
        <div className="space-y-3">
          <div className="h-4 bg-white/20 rounded-full w-3/4"></div>
          <div className="h-4 bg-white/20 rounded-full w-full"></div>
          <div className="h-4 bg-white/20 rounded-full w-5/6"></div>
        </div>
        
        <div className="h-8 bg-white/20 rounded-lg w-1/3 mt-8"></div>
        
        <div className="h-64 bg-white/10 rounded-xl border border-white/5 w-full"></div>
        
        <div className="space-y-3">
          <div className="h-4 bg-white/20 rounded-full w-full"></div>
          <div className="h-4 bg-white/20 rounded-full w-5/6"></div>
        </div>
      </div>
    )
}

export default function GuidePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const guideId = params.guideId as string;
    
    // Resolve metadata from URL params OR fallback registry
    const metaTitle = searchParams.get('title');
    const metaCategory = searchParams.get('category');
    const legacyMeta = GUIDE_META[guideId];

    // Decode URI components and format
    const rawTitle = metaTitle || legacyMeta?.title || guideId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const title = decodeURIComponent(rawTitle);
    
    const category = metaCategory || legacyMeta?.category || "General";

    const getOrGenerate = useAction(api.guides.getOrGenerateGuide);
    const startGuide = useMutation(api.guides.startGuide);
    const completeGuide = useMutation(api.guides.completeGuide);
    
    const guide = useQuery(api.guides.getGuide, { slug: guideId });
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    // Fetch progress whenever guide is loaded
    const progress = useQuery(api.guides.getGuideProgress, guide ? { guideId: guide._id } : "skip");

    useEffect(() => {
        if (progress?.completed) {
            setIsCompleted(true);
        }
    }, [progress]);

    useEffect(() => {
        async function load() {
            if (!guideId || guide) return;
            if (isGenerating) return;

            try {
                setIsGenerating(true);
                await getOrGenerate({
                    slug: guideId,
                    title: title,
                    category: category
                });
            } catch (e) {
                console.error(e);
            } finally {
                setIsGenerating(false);
            }
        }
        load();
    }, [guideId, title, category, getOrGenerate, guide, isGenerating]);

    useEffect(() => {
        if (guide?._id) {
             startGuide({ guideId: guide._id as any });
        }
    }, [guide?._id, startGuide]);

    const handleComplete = async () => {
        if (!guide?._id) return;
        try {
            await completeGuide({ guideId: guide._id as any });
            setIsCompleted(true);
            
            // Redirect after delay
            setTimeout(() => {
                router.push('/dashboard/roadmap');
            }, 1500);
        } catch (e) {
            console.error("Failed to complete guide", e);
        }
    };

    if (!guide) {
        return (
            <div className="min-h-screen bg-nav-black flex flex-col items-center justify-center">
                <Loader2 size={48} className="text-nav-lime animate-spin mb-4" />
                <p className="text-white/60 font-mono text-sm animate-pulse">
                    INITIALIZING GUIDE...
                </p>
                <p className="text-white/30 text-xs mt-2">
                    Topic: {title}
                </p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-nav-black text-white p-6 md:p-12 max-w-300 mx-auto">

            {/* HEADER */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-16 border-b border-white/10 pb-8"
            >
                <button
                    onClick={() => router.back()}
                    className="mb-8 w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>

                <div className="flex items-center gap-4 mb-4">
                    <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest text-black ${guide.category === 'HTML' ? 'bg-nav-orange' :
                        guide.category === 'CSS' ? 'bg-nav-blue' :
                            guide.category === 'Python' ? 'bg-nav-yellow' : 'bg-nav-lime'
                        }`}>
                        {guide.category}
                    </span>
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest">
                        <Clock size={14} /> {guide.duration}
                    </div>
                </div>

                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
                    {guide.title}
                </h1>
            </motion.div>

            {/* CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Main Article */}
                <motion.article
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-8 prose prose-invert max-w-none"
                >
                    {(!guide.content || guide.content.length < 20) ? (
                         <GuideSkeleton />
                    ) : (
                        <ReactMarkdown
                            rehypePlugins={[rehypeHighlight]}
                            components={{
                            h1: ({ node, ...props }) => <h1 className="text-4xl font-black uppercase tracking-tight text-white mb-6 mt-12 first:mt-0" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-2xl font-black uppercase tracking-wider text-white mb-4 mt-10 border-l-4 border-nav-lime pl-4" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-white/80 mb-3 mt-8" {...props} />,
                            p: ({ node, ...props }) => <p className="text-gray-400 text-lg leading-relaxed mb-6 font-medium" {...props} />,
                            ul: ({ node, ...props }) => <ul className="space-y-2 mb-6" {...props} />,
                            li: ({ node, ...props }) => (
                                <li className="flex gap-3 text-gray-300">
                                    <span className="text-nav-lime mt-1.5">•</span>
                                    <span className="flex-1">{props.children}</span>
                                </li>
                            ),
                            code: ({ node, className, children, ...props }) => {
                                const match = /language-(\w+)/.exec(className || '')
                                return match ? (
                                    <div className="rounded-2xl overflow-hidden border border-white/10 my-8 shadow-2xl">
                                        <div className="bg-[#222] px-4 py-2 flex items-center gap-2 border-b border-white/5">
                                            <div className="flex gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                                            </div>
                                            <span className="text-xs font-mono text-gray-500 uppercase">{match[1]}</span>
                                        </div>
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    </div>
                                ) : (
                                    <code className="bg-white/10 text-nav-lime px-1.5 py-0.5 rounded font-mono text-sm" {...props}>
                                        {children}
                                    </code>
                                )
                            },
                            blockquote: ({ node, ...props }) => (
                                <blockquote className="bg-nav-blue/10 border-l-4 border-nav-blue p-6 rounded-r-xl my-8 text-nav-blue font-bold italic" {...props} />
                            )
                        }}
                    >
                        {guide.content}
                    </ReactMarkdown>
                    )}
                </motion.article>

                {/* Sidebar */}
                <aside className="lg:col-span-4 space-y-8">
                    <div className="sticky top-24">
                        <div className="bg-[#111] border border-white/10 rounded-4xl p-8">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                                <BookOpen size={16} /> Module Progress
                            </h3>
                            <div className="w-full bg-white/5 h-2 rounded-full mb-4">
                                <div 
                                    className="h-full bg-nav-lime rounded-full transition-all duration-1000" 
                                    style={{ width: isCompleted ? '100%' : '30%' }}
                                />
                            </div>
                            <p className="text-white font-bold text-sm mb-8">{isCompleted ? '100%' : '30%'} Completed</p>

                            <button 
                                onClick={handleComplete}
                                disabled={isCompleted || isGenerating || !guide.content || guide.content.length < 50}
                                className={`w-full py-4 font-black uppercase tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all ${
                                    isCompleted 
                                    ? 'bg-nav-lime text-black cursor-default' 
                                    : (isGenerating || !guide.content || guide.content.length < 50)
                                        ? 'bg-white/10 text-white/20 cursor-not-allowed'
                                        : 'bg-white text-black hover:scale-105'
                                }`}
                            >
                                {isCompleted ? 'Completed' : (isGenerating || !guide.content || guide.content.length < 50) ? 'Generating...' : 'Mark Complete'} <CheckIcon />
                            </button>
                        </div>

                        <div className="mt-8">
                            <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                                <Share2 size={16} /> Share Guide
                            </button>
                        </div>
                    </div>
                </aside>

            </div>
        </div>
    );
}

function CheckIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}
