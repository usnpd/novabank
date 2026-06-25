import React from 'react';
import { Sparkles, CheckCircle2, TrendingUp, HelpCircle } from 'lucide-react';

const InsightCard = ({ insight }) => {
  if (!insight) {
    return (
      <div className="glass-panel p-6 rounded-2xl text-center text-xs text-slate-500">
        AI Advisor is analyzing your balances to compile monthly insights...
      </div>
    );
  }

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5';
    if (grade.startsWith('B')) return 'text-blue-400 border-blue-500/30 bg-blue-500/5';
    if (grade.startsWith('C')) return 'text-amber-400 border-amber-500/30 bg-amber-500/5';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/5';
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/10 via-slate-900/40 to-slate-900/60 relative overflow-hidden">
      
      {/* Glow effect */}
      <div className="absolute -right-8 -top-8 w-28 h-28 bg-indigo-500/10 rounded-full blur-3xl"></div>

      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">AI Portfolio Diagnostics</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">Ollama Llama 3 Advisory</span>
          </div>
        </div>

        {/* Portfolio Grade badge */}
        <div className={`h-12 w-12 rounded-full border flex items-center justify-center font-black text-lg font-mono shadow-inner tracking-tight ${getGradeColor(insight.portfolioHealthGrade)}`}>
          {insight.portfolioHealthGrade}
        </div>
      </div>

      {/* Summary section */}
      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900/60 text-slate-350 text-xs leading-relaxed italic mb-6">
        "{insight.portfolioSummary}"
      </div>

      {/* Grid of Scores */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Savings Rate Score</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-extrabold text-white font-mono">{insight.savingsRateScore}</span>
            <span className="text-[10px] text-slate-400">/ 100</span>
          </div>
          <div className="w-full bg-slate-950 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: `${insight.savingsRateScore}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Spending Optim.</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-extrabold text-white font-mono">{insight.spendingOptimizationScore}</span>
            <span className="text-[10px] text-slate-400">/ 100</span>
          </div>
          <div className="w-full bg-slate-950 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-indigo-500 h-full" style={{ width: `${insight.spendingOptimizationScore}%` }}></div>
          </div>
        </div>
      </div>

      {/* Checklist Action Items */}
      {insight.actionChecklist && insight.actionChecklist.length > 0 && (
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">AI Action Checklist</span>
          <div className="space-y-2">
            {insight.actionChecklist.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-350 leading-relaxed bg-slate-900/20 p-2.5 rounded-lg border border-slate-900/40 hover:border-slate-850 hover:bg-slate-900/40 transition-all">
                <CheckCircle2 className="text-indigo-400 shrink-0 mt-0.5" size={14} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default InsightCard;
