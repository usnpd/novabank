import React from 'react';
import { AlertOctagon, X } from 'lucide-react';

const FraudAlert = ({ alert, onClose }) => {
  return (
    <div className="p-4 bg-gradient-to-r from-red-950/80 to-rose-900/60 border border-red-500/30 rounded-xl flex items-start justify-between gap-4 animate-pulse-ring relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
      
      <div className="flex items-start gap-3">
        <AlertOctagon className="text-red-400 shrink-0 mt-0.5" size={20} />
        <div>
          <span className="font-bold text-xs uppercase text-red-200 tracking-wider">Security Anomaly Flagged</span>
          <p className="text-xs text-red-300 mt-1 leading-relaxed">{alert.message}</p>
          <span className="text-[9px] text-slate-500 block mt-2">{new Date(alert.createdAt).toLocaleString()}</span>
        </div>
      </div>
      
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 hover:bg-slate-800/40 rounded transition-all"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default FraudAlert;
