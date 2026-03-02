'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, X, Info } from 'lucide-react';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export default function Toast({ message, type = 'info', isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={`
            fixed bottom-8 right-8 z-[100] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border backdrop-blur-md min-w-[300px]
            ${type === 'success' ? 'bg-[#0A0A0A]/95 border-nav-lime/30' : ''}
            ${type === 'error' ? 'bg-[#0A0A0A]/95 border-red-500/30' : ''}
            ${type === 'info' ? 'bg-[#0A0A0A]/95 border-white/10' : ''}
          `}
        >
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center shrink-0
            ${type === 'success' ? 'bg-nav-lime/10 text-nav-lime' : ''}
            ${type === 'error' ? 'bg-red-500/10 text-red-500' : ''}
            ${type === 'info' ? 'bg-white/10 text-white' : ''}
          `}>
            {type === 'success' && <Check size={20} strokeWidth={3} />}
            {type === 'error' && <AlertCircle size={20} strokeWidth={3} />}
            {type === 'info' && <Info size={20} strokeWidth={3} />}
          </div>
          
          <div className="flex-1">
            <h4 className={`font-black uppercase tracking-wider text-[10px] mb-0.5
              ${type === 'success' ? 'text-nav-lime' : ''}
              ${type === 'error' ? 'text-red-500' : ''}
              ${type === 'info' ? 'text-white' : ''}
            `}>
              {type === 'success' ? 'Success' : type === 'error' ? 'Action Failed' : 'Info'}
            </h4>
            <p className="text-xs font-bold text-gray-300 leading-tight">{message}</p>
          </div>

          <button 
            onClick={onClose}
            className="text-gray-600 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
