import React from 'react';

const StatCard = ({ title, value, icon: Icon, description, trend, trendType }) => {
  return (
    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[140px] transition-all hover:border-slate-700/80">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</h3>
          <p className="text-2xl font-extrabold text-white mt-2 font-mono tracking-tight">{value}</p>
        </div>
        <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-500">{description}</span>
        {trend && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            trendType === 'positive' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          }`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
