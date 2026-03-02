'use client';
import { motion } from 'framer-motion';
import { Github, Code2, Terminal, Server, Box, Layers, Globe, Cpu } from 'lucide-react';

const sources = [
  { name: 'GitHub', icon: Github },
  { name: 'VS Code', icon: Code2 },
  { name: 'Terminal', icon: Terminal },
  { name: 'Docker', icon: Box },
  { name: 'Vercel', icon: Server },
  { name: 'React', icon: Layers },
  { name: 'StackOverflow', icon: Globe },
  { name: 'WebAssembly', icon: Cpu },
];

export default function DataSources() {
  return (
    <section className="bg-nav-cream py-24 overflow-hidden relative">
      <div className="absolute inset-0 bg-nav-cream z-0"></div>
      
      <div className="relative z-10 rotate-[-2deg] scale-110">
        {/* Row 1 - Left */}
        <Marquee direction="left" speed={30}>
          {sources.map((source, i) => (
            <SourcePill key={i} source={source} color="bg-nav-black" textColor="text-nav-cream" />
          ))}
        </Marquee>

        {/* Row 2 - Right */}
        <div className="mt-8">
          <Marquee direction="right" speed={20}>
             {sources.map((source, i) => (
              <SourcePill key={i} source={source} color="bg-nav-blue" textColor="text-black" />
            ))}
          </Marquee>
        </div>
        
         {/* Row 3 - Left */}
         <div className="mt-8">
          <Marquee direction="left" speed={40}>
             {sources.map((source, i) => (
              <SourcePill key={i} source={source} color="bg-nav-orange" textColor="text-white" />
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}

function Marquee({ children, direction = 'left', speed = 20 }: { children: React.ReactNode, direction?: 'left' | 'right', speed?: number }) {
  return (
    <div className="flex overflow-hidden">
      <motion.div 
        initial={{ x: direction === 'left' ? 0 : -1000 }}
        animate={{ x: direction === 'left' ? -1000 : 0 }}
        transition={{ 
          repeat: Infinity, 
          ease: "linear", 
          duration: speed 
        }}
        className="flex gap-8 flex-shrink-0 px-4"
      >
        {children}
        {children}
        {children}
        {children}
      </motion.div>
    </div>
  )
}

function SourcePill({ source, color, textColor }: any) {
  const Icon = source.icon;
  return (
    <div className={`${color} ${textColor} px-8 py-4 rounded-full flex items-center gap-4 text-2xl font-bold whitespace-nowrap shadow-xl border-2 border-transparent hover:border-black/20 transition-all`}>
      <Icon size={28} />
      {source.name}
    </div>
  )
}
