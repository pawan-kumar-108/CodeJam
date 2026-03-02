'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const logs = [
  { type: 'UPLOAD', msg: 'Batch #492 encrypted' },
  { type: 'SYNC', msg: 'Node 8 connected' },
  { type: 'REWARD', msg: '+50 points mined' },
  { type: 'UPLOAD', msg: 'Packet trace complete' },
  { type: 'SYSTEM', msg: 'Optimizing route...' },
  { type: 'SYNC', msg: 'Spotify API handshake' },
  { type: 'UPLOAD', msg: 'Batch #493 encrypted' },
];

export default function DataStream() {
  const [stream, setStream] = useState(logs);

  useEffect(() => {
    const interval = setInterval(() => {
      setStream(prev => {
        const newLog = logs[Math.floor(Math.random() * logs.length)];
        return [...prev.slice(1), { ...newLog, id: Date.now() }];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col font-mono text-xs md:text-sm">
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
        <span className="text-gray-400 font-bold uppercase tracking-wider">Live Stream</span>
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500"/>
          <span className="w-2 h-2 rounded-full bg-yellow-500"/>
          <span className="w-2 h-2 rounded-full bg-green-500"/>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden relative space-y-3">
        {stream.map((log, i) => (
          <motion.div 
            key={i} // simple key for rotation
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <span className={`
              px-2 py-0.5 rounded text-[10px] font-bold
              ${log.type === 'UPLOAD' ? 'bg-nav-blue text-black' : ''}
              ${log.type === 'REWARD' ? 'bg-nav-lime text-black' : ''}
              ${log.type === 'SYNC' ? 'bg-white/10 text-white' : ''}
              ${log.type === 'SYSTEM' ? 'text-gray-500' : ''}
            `}>
              {log.type}
            </span>
            <span className="text-gray-400 truncate">{log.msg}</span>
          </motion.div>
        ))}
        
        {/* Gradient fade at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#111] to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
