import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const AccountCard = ({ account, onSelect }) => {
  const [showBalance, setShowBalance] = useState(true);

  // Recharts requires [{value: ...}] data structure.
  const chartData = account.sparklineData
    ? account.sparklineData.map((val, idx) => ({ id: idx, value: Number(val) }))
    : [{ value: 0 }, { value: 0 }];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const getAccountTypeLabel = (type) => {
    switch (type) {
      case 'SAVINGS': return 'Premium Savings';
      case 'CURRENT': return 'Checking Account';
      case 'INVESTMENT': return 'Wealth Portfolio';
      case 'CREDIT': return 'Signature Credit';
      default: return type;
    }
  };

  return (
    <div 
      className="glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between h-[180px] hover:border-slate-700 hover:shadow-2xl transition-all duration-300 group cursor-pointer"
      onClick={() => onSelect && onSelect(account.id)}
    >
      {/* Background card texture effect */}
      <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full pointer-events-none transition-all group-hover:from-blue-500/10"></div>

      <div className="flex justify-between items-start z-10">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
            {getAccountTypeLabel(account.accountType)}
          </span>
          <h4 className="text-sm font-semibold text-slate-300 mt-0.5">{account.accountName}</h4>
          <span className="text-[11px] font-mono text-slate-500 block mt-1 tracking-wider">{account.accountNumber}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowBalance(!showBalance);
            }}
            className="p-1.5 text-slate-500 hover:text-slate-200 rounded hover:bg-slate-800 transition-colors"
          >
            {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <span className="p-1 text-emerald-450 bg-emerald-950/20 rounded-full border border-emerald-500/20" title="FDIC Insured">
            <ShieldCheck size={14} className="text-emerald-500" />
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between mt-auto z-10">
        {/* Balance Display */}
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Available Balance</span>
          <div className="text-xl font-extrabold text-white mt-1 font-mono tracking-tight transition-all">
            {showBalance ? formatCurrency(account.balance) : '••••••••'}
          </div>
        </div>

        {/* Tiny Recharts Area sparkline */}
        <div className="w-24 h-10 pointer-events-none select-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`sparkline-${account.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                strokeWidth={1.5} 
                fillOpacity={1} 
                fill={`url(#sparkline-${account.id})`} 
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default AccountCard;
