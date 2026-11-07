import React from 'react';
import { CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-300">
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-950 border border-purple-500/50 text-white shadow-2xl shadow-purple-600/30 backdrop-blur-xl">
        <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <p className="text-xs font-semibold text-zinc-200">{message}</p>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors ml-2"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
