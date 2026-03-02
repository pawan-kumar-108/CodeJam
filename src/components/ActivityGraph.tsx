'use client';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

export default function ActivityGraph({ data = [0, 0, 0, 0, 0, 0, 0] }: { data?: number[] }) {
  const totalXP = data.reduce((a, b) => a + b, 0);
  const isEmpty = totalXP === 0;

  // Normalize data for graph (0-100 range)
  const maxVal = Math.max(...data, 100); 
  const points = data.map((val, i) => {
    const x = 5 + (i / (data.length - 1)) * 90; // 5-95% width
    const y = 90 - ((val / maxVal) * 80); // 10-90% height
    return `${x},${y}`;
  }).join(' ');

  const areaPath = `M 5,100 L ${points.replace(/,/g, ' ')} L 95,100 Z`;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-gray-400 font-bold text-sm uppercase tracking-wider">Weekly Output</h3>
          <p className={`text-3xl font-black mt-1 ${isEmpty ? 'text-gray-600' : 'text-white'}`}>
            {isEmpty ? 'NO ACTIVITY' : `${totalXP} XP`}
          </p>
        </div>
        <div className="flex gap-2">
          {['1D', '1W', '1M'].map(period => (
            <button key={period} className={`px-3 py-1 rounded-full text-xs font-bold ${period === '1W' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative w-full min-h-[150px] flex items-center justify-center">
        {isEmpty ? (
            <div className="text-center opacity-30">
                <Activity size={48} className="mx-auto mb-2 text-gray-500" />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Complete quests to see data
                </p>
                {/* Flat Line Visual */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
            </div>
        ) : (
            <svg className="w-full h-full overflow-hidden rounded-xl" viewBox="0 0 100 100" preserveAspectRatio="none">
            
            {/* Gradient Defs */}
            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#CCFF00" stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Area Fill */}
            <motion.path
                initial={{ d: `M 5,100 ${data.map((_, i) => `L ${5 + i * (90/(data.length-1))},100`).join(' ')} L 95,100 Z` }}
                animate={{ d: areaPath }}
                transition={{ duration: 1, ease: "easeOut" }}
                fill="url(#gradient)"
                className="opacity-50"
            />

            {/* Line */}
            <motion.polyline
                fill="none"
                stroke="#CCFF00"
                strokeWidth="3"
                points={points}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            
            {/* Points */}
            {data.map((val, i) => {
                const cx = 5 + (i / (data.length - 1)) * 90;
                const cy = 90 - ((val / maxVal) * 80);
                return (
                    <motion.circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r="4"
                    fill="#111"
                    stroke="#CCFF00"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1 + (i * 0.1) }}
                    whileHover={{ scale: 2 }}
                    />
                );
            })}
            </svg>
        )}
      </div>
    </div>
  );
}
