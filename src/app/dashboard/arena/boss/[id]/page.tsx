'use client';
import { useState, useEffect, use } from 'react';
import { useMutation, useAction, useQuery } from 'convex/react';
import { api } from "../../../../../../convex/_generated/api";
import SwissCodeEditor from '@/components/ui/SwissCodeEditor';
import { Play, Terminal, Cpu, AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock challenges
const BOSS_CHALLENGES: Record<string, { title: string; description: string; starterCode: string }> = {
    'memory-leak': {
        title: 'The Memory Leak',
        description: 'This server is bleeding RAM. Find the leak and plug it before the container crashes.',
        starterCode: `def process_data(data):
    # WARNING: This function is causing a memory leak
    cache = []
    
    for item in data:
        # We need to process items but something is wrong here
        cache.append(item * 1000)
        
    return len(cache)

# Simulate server load
print("Server starting...")
process_data(range(10000))
print("Process complete.")
`
    },
    'cpu-hog': {
        title: 'The CPU Hog',
        description: 'CPU usage is at 100%. Optimize the algorithm.',
        starterCode: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print("Calculating...")
print(fibonacci(35))
`
    }
};

export default function BossArenaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const challenge = BOSS_CHALLENGES[id] || {
        title: 'Unknown Anomaly',
        description: 'System unrecognized.',
        starterCode: 'print("System Error")'
    };

    const [code, setCode] = useState(challenge.starterCode);
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [isPreWarming, setIsPreWarming] = useState(true);
    const [sandboxId, setSandboxId] = useState<string | null>(null);

    const createSandbox = useAction(api.daytona.create);
    const runCode = useAction(api.daytona.run);
    const recordSession = useMutation(api.boss.createSessionRecord);

    // Pre-warming
    useEffect(() => {
        const initSandbox = async () => {
            try {
                // Silently create sandbox
                const { sandboxId } = await createSandbox({ language: 'python' });
                setSandboxId(sandboxId);
                
                // Record session in DB
                // We need to pass userId, but the mutation gets it from auth.
                // We pass sandboxId.
                // Wait, createSessionRecord needs userId arg?
                // Checking convex/boss.ts:
                // args: { sandboxId: v.string(), language: v.string() } -- NO userId in args, it gets from ctx.auth
                // Wait, I wrote: `args: { sandboxId: v.string(), language: v.string() }`.
                // And handler: `userId = await getAuthUserId(ctx)`.
                // Correct.
                await recordSession({ sandboxId, language: 'python' });
                
                setIsPreWarming(false);
                console.log("Boss Arena: Sandbox pre-warmed", sandboxId);
            } catch (e) {
                console.error("Failed to pre-warm sandbox:", e);
                setIsPreWarming(false); // Stop loading even if failed
            }
        };

        initSandbox();
        
        return () => {
            // Cleanup? We leave it running for now or implement cleanup action.
        };
    }, [createSandbox, recordSession]);

    const handleRun = async () => {
        if (!sandboxId) {
            setOutput("Error: Execution Environment not ready.");
            return;
        }

        setIsRunning(true);
        setOutput("Compiling and deploying to Daytona container...\n");

        try {
            const result = await runCode({ sandboxId, code });
            setOutput(prev => prev + "\n> Execution Result:\n" + result);
        } catch (e: any) {
            setOutput(prev => prev + "\n> Error:\n" + e.message);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-red-500/30 selection:text-white pb-20">
            {/* Darker UI Overlay */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900/50 to-black pointer-events-none" />
            
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                
                {/* Header */}
                <header className="mb-12 flex items-end justify-between border-b border-white/10 pb-6">
                    <div>
                        <div className="flex items-center gap-3 text-red-500 mb-2">
                            <AlertTriangle size={20} />
                            <span className="text-xs font-bold uppercase tracking-[0.2em] animate-pulse">Live Incident</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-500">
                            {challenge.title}
                        </h1>
                        <p className="mt-4 text-neutral-400 max-w-xl text-lg font-light">
                            {challenge.description}
                        </p>
                    </div>
                    
                    {/* Status Indicator */}
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#111] rounded-full border border-white/10">
                            <div className={`w-2 h-2 rounded-full ${isPreWarming ? 'bg-yellow-500 animate-bounce' : sandboxId ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-xs font-mono text-neutral-500 uppercase">
                                {isPreWarming ? 'Provisioning Container...' : sandboxId ? 'System Online' : 'System Offline'}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
                    
                    {/* Editor Column */}
                    <div className="flex flex-col gap-4 h-full">
                        <SwissCodeEditor 
                            code={code} 
                            onChange={setCode} 
                            language="python"
                        />
                        <button
                            onClick={handleRun}
                            disabled={isRunning || !sandboxId}
                            className={`
                                py-4 px-8 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all
                                ${isRunning || !sandboxId 
                                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' 
                                    : 'bg-white text-black hover:bg-nav-orange hover:text-white shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,100,0,0.4)]'
                                }
                            `}
                        >
                            {isRunning ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" />}
                            {isRunning ? 'Executing...' : 'Deploy Fix'}
                        </button>
                    </div>

                    {/* Output Column */}
                    <div className="bg-[#0a0a0a] rounded-[1.5rem] border border-white/10 p-6 font-mono text-sm md:text-base overflow-hidden flex flex-col shadow-inner">
                        <div className="flex items-center gap-2 text-neutral-500 mb-4 pb-4 border-b border-white/5">
                            <Terminal size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">System Logs</span>
                        </div>
                        <div className="flex-1 overflow-auto text-neutral-300 whitespace-pre-wrap">
                            {output || <span className="text-neutral-700 italic">Waiting for deployment...</span>}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
