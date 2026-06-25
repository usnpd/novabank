import React from 'react';
import { ArrowUpRight, ArrowDownLeft, AlertOctagon, Repeat, ShieldAlert } from 'lucide-react';

const TransactionRow = ({ transaction }) => {
  const isCredit = transaction.transactionType === 'CREDIT';
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const getCategoryEmoji = (category) => {
    switch (category) {
      case 'SALARY': return '💼';
      case 'RENT': return '🏠';
      case 'GROCERIES': return '🛒';
      case 'UTILITIES': return '🔌';
      case 'ENTERTAINMENT': return '🎬';
      case 'INVESTMENT': return '📈';
      case 'TRAVEL': return '✈️';
      case 'INSURANCE': return '🛡️';
      case 'TAX': return '📝';
      case 'TRANSFER': return '🔄';
      default: return '💸';
    }
  };

  return (
    <div className="flex items-center justify-between p-3.5 bg-slate-900/40 border border-slate-800/80 rounded-xl hover:border-slate-700/60 transition-all duration-200 gap-4">
      {/* Icon & Details */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`p-2.5 rounded-xl border shrink-0 text-lg flex items-center justify-center ${
          isCredit 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
            : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {getCategoryEmoji(transaction.category)}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200 text-sm truncate max-w-[150px] sm:max-w-xs">
              {transaction.description || `${transaction.category} txn`}
            </span>
            {transaction.isRecurring && (
              <span className="p-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md" title="Recurring Payment">
                <Repeat size={10} />
              </span>
            )}
            {transaction.fraudScore > 0.7 && (
              <span 
                className="p-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md cursor-pointer animate-pulse" 
                title={`AI Anomalous Threat: ${transaction.anomalyReason}`}
              >
                <AlertOctagon size={10} />
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-slate-500 block mt-1 tracking-wider uppercase">
            {transaction.referenceNumber} • {new Date(transaction.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Amount & Fraud Warning Indicators */}
      <div className="flex flex-col items-end shrink-0">
        <div className={`font-mono font-bold text-sm ${isCredit ? 'text-emerald-400' : 'text-red-400'}`}>
          {isCredit ? '+' : '-'}{formatCurrency(transaction.amount)}
        </div>
        {transaction.fraudScore > 0.4 && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded mt-1.5 flex items-center gap-1 border ${
            transaction.fraudScore > 0.7 
              ? 'bg-red-950/20 text-red-400 border-red-500/30' 
              : 'bg-amber-950/20 text-amber-400 border-amber-500/30'
          }`}>
            <ShieldAlert size={8} />
            AI Risk: {Math.round(transaction.fraudScore * 100)}%
          </span>
        )}
      </div>

    </div>
  );
};

export default TransactionRow;
