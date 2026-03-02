'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Code, Play, RefreshCw, Zap } from 'lucide-react';

const CHALLENGES = [
  {
    id: 1,
    title: 'Variable Vanish',
    code: [
      'const user = "Alex";',
      'let age = 25;',
      'console.log("User: " + usr);', // Error
      'age = age + 1;'
    ],
    bugLine: 2,
    correctCode: 'console.log("User: " + user);'
  },
  {
    id: 2,
    title: 'Loop Loop',
    code: [
      'const items = [1, 2, 3];',
      'for (let i = 0; i <= items.length; i++) {', // Error (<= should be <)
      '  console.log(items[i]);',
      '}'
    ],
    bugLine: 1,
    correctCode: 'for (let i = 0; i < items.length; i++) {'
  },
  {
    id: 3,
    title: 'Return of the Undefined',
    code: [
      'function add(a, b) {',
      '  const sum = a + b;',
      '  retrun sum;', // Error
      '}'
    ],
    bugLine: 2,
    correctCode: '  return sum;'
  }
];

export default function SyntaxSmasher({ onComplete }: { onComplete: (score: number) => void }) {
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'success' | 'failed'>('playing');
  const [selectedLine, setSelectedLine] = useState<number | null>(null);

  const currentChallenge = CHALLENGES[level];

  const handleLineClick = (index: number) => {
    if (gameState !== 'playing') return;
    setSelectedLine(index);

    if (index === currentChallenge.bugLine) {
      // Correct!
      setScore(s => s + 100 + (streak * 20));
      setStreak(s => s + 1);
      setGameState('success');
      
      setTimeout(() => {
        if (level < CHALLENGES.length - 1) {
          setLevel(l => l + 1);
          setGameState('playing');
          setSelectedLine(null);
        } else {
          onComplete(score + 100);
        }
      }, 1500);
    } else {
      // Wrong!
      setStreak(0);
      setGameState('failed');
      setTimeout(() => {
        setGameState('playing');
        setSelectedLine(null);
      }, 800);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      
      {/* HUD */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
            Level {level + 1}<span className="text-white/40">/{CHALLENGES.length}</span>
          </h2>
          <p className="text-nav-orange font-bold text-sm uppercase tracking-widest">{currentChallenge.title}</p>
        </div>
        
        <div className="flex gap-6">
            <div className="bg-[#111] border border-white/10 px-6 py-3 rounded-xl flex flex-col items-end">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Score</span>
                <span className="text-2xl font-black text-nav-lime font-mono">{score}</span>
            </div>
            <div className="bg-[#111] border border-white/10 px-6 py-3 rounded-xl flex flex-col items-end">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Streak</span>
                <div className="flex items-center gap-1 text-nav-orange font-black text-2xl">
                    <Zap size={20} fill="currentColor" /> {streak}
                </div>
            </div>
        </div>
      </div>

      {/* Code Editor Window */}
      <div className="bg-[#151515] rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl relative">
        
        {/* Window Bar */}
        <div className="bg-[#222] px-6 py-4 flex items-center gap-4 border-b border-white/5">
            <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="text-xs font-mono text-gray-500 flex items-center gap-2">
                <Code size={14} /> challenge_{level + 1}.js
            </div>
        </div>

        {/* Code Area */}
        <div className="p-8 font-mono text-lg md:text-xl leading-loose">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentChallenge.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {currentChallenge.code.map((line, index) => {
                        const isCorrectLine = index === currentChallenge.bugLine;
                        const isSelected = selectedLine === index;
                        const showFix = isSelected && isCorrectLine && gameState === 'success';
                        
                        return (
                            <motion.div
                                key={index}
                                onClick={() => handleLineClick(index)}
                                className={`
                                    relative px-4 -mx-4 rounded-lg cursor-pointer transition-all duration-200 group
                                    ${isSelected && gameState === 'failed' ? 'bg-red-500/20 shake-animation' : ''}
                                    ${isSelected && gameState === 'success' ? 'bg-nav-lime/10' : 'hover:bg-white/5'}
                                `}
                                animate={isSelected && gameState === 'failed' ? { x: [-10, 10, -10, 10, 0] } : {}}
                            >
                                {/* Line Number */}
                                <span className="absolute left-[-2rem] text-gray-700 select-none text-sm top-1/2 -translate-y-1/2">{index + 1}</span>
                                
                                {/* Content */}
                                <div className="flex items-center justify-between">
                                    <span className={`${showFix ? 'text-nav-lime' : 'text-gray-300'} transition-colors`}>
                                        {showFix ? currentChallenge.correctCode : line}
                                    </span>
                                    
                                    {/* Feedback Icon */}
                                    {isSelected && (
                                        <motion.div 
                                            initial={{ scale: 0 }} 
                                            animate={{ scale: 1 }}
                                            className="ml-4"
                                        >
                                            {gameState === 'success' && <Check className="text-nav-lime" />}
                                            {gameState === 'failed' && <X className="text-red-500" />}
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Instructions Overlay (Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-8 pointer-events-none">
            <p className="text-white/40 text-center text-sm font-bold uppercase tracking-widest animate-pulse">
                Identify and click the buggy line of code
            </p>
        </div>

      </div>
    </div>
  );
}
