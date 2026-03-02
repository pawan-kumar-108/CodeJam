'use client';
import { useState, useRef, useEffect } from 'react';
import { Code, Copy, Check } from 'lucide-react';

interface SwissCodeEditorProps {
    code: string;
    onChange: (code: string) => void;
    language?: string;
    readOnly?: boolean;
}

export default function SwissCodeEditor({ 
    code, 
    onChange, 
    language = 'python',
    readOnly = false 
}: SwissCodeEditorProps) {
    const [copied, setCopied] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Auto-resize (optional, maybe fixed height is better for "Swiss" feel)
    // We'll stick to fixed height or full container height.

    return (
        <div className="bg-[#151515] rounded-[1.5rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col h-full font-mono">
            {/* Window Bar */}
            <div className="bg-[#1a1a1a] px-5 py-3 flex items-center justify-between border-b border-white/5 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>
                    <div className="text-xs font-bold text-white/30 flex items-center gap-2 uppercase tracking-widest">
                        <Code size={12} /> {language}
                    </div>
                </div>
                <button 
                    onClick={handleCopy}
                    className="text-white/20 hover:text-white/60 transition-colors"
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
            </div>

            {/* Editor Area */}
            <div className="relative flex-1 group">
                <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={(e) => onChange(e.target.value)}
                    readOnly={readOnly}
                    spellCheck={false}
                    className="w-full h-full bg-transparent text-white/80 p-6 resize-none focus:outline-none text-sm md:text-base leading-relaxed font-mono selection:bg-nav-orange/30"
                    placeholder="// Write your fix here..."
                />
                
                {/* Decoration/Glow */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-nav-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
        </div>
    );
}
