import React, { useState } from 'react';
import aiService from '../services/aiService';
import PageLoader from '../components/PageLoader';
import { CheckCircle2, AlertTriangle, AlertCircle, RefreshCw, Calendar, Sparkles } from 'lucide-react';

const Reconciliation = () => {
  const [month1, setMonth1] = useState('2026-05');
  const [month2, setMonth2] = useState('2026-06');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAudit = async (e) => {
    e.preventDefault();
    setError('');
    setData(null);
    setLoading(true);

    try {
      const response = await aiService.reconcile(month1, month2);
      setData(response);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to complete reconciliation audit. Ensure target month data exists.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'MATCHED':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'NEW':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Statement Reconciliation Cockpit</h2>
          <p className="text-xs text-slate-500 mt-1">Audit category spending discrepancies between consecutive monthly statement logs</p>
        </div>
      </div>

      {/* Selectors card */}
      <div className="glass-panel p-6 rounded-2xl mb-8 max-w-xl mx-auto">
        <form onSubmit={handleAudit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Baseline Month</label>
              <select
                value={month1}
                onChange={(e) => setMonth1(e.target.value)}
                className="form-input bg-slate-950 border-slate-800"
              >
                <option value="2026-05">May 2026</option>
                <option value="2026-06">June 2026</option>
                <option value="2026-04">April 2026</option>
                <option value="2026-03">March 2026</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Comparison Month</label>
              <select
                value={month2}
                onChange={(e) => setMonth2(e.target.value)}
                className="form-input bg-slate-950 border-slate-800"
              >
                <option value="2026-06">June 2026</option>
                <option value="2026-05">May 2026</option>
                <option value="2026-04">April 2026</option>
                <option value="2026-07">July 2026</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary text-xs py-2.5 flex items-center justify-center gap-1.5"
          >
            {loading ? 'Analyzing Transactions...' : 'Initiate AI Reconciliation Audit'}
          </button>
        </form>
      </div>

      {/* Loader */}
      {loading && <PageLoader message="AI is reconciling category logs, comparing variances, and compiling the audit report..." />}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2 max-w-xl mx-auto">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Reconciliation Audit results */}
      {data && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Category Variance list */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Category Spending Variance</h3>
            
            <div className="space-y-3">
              {data.categories.map((cat, idx) => (
                <div key={idx} className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-slate-700/60 transition-all duration-200">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200 text-sm">{cat.category}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${getStatusBadge(cat.status)}`}>
                        {cat.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1 leading-relaxed">{cat.explanation}</span>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 sm:justify-end text-xs">
                    <div>
                      <span className="text-[9px] text-slate-500 block font-bold uppercase tracking-wider">{data.month1}</span>
                      <span className="font-mono text-slate-350">{formatCurrency(cat.month1Amount)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block font-bold uppercase tracking-wider">{data.month2}</span>
                      <span className="font-mono text-slate-350">{formatCurrency(cat.month2Amount)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 block font-bold uppercase tracking-wider">Variance</span>
                      <span className={`font-mono font-bold ${cat.variance >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {cat.variance >= 0 ? '+' : ''}{formatCurrency(cat.variance)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Audit Report */}
          <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-indigo-950/15 via-slate-900/40 to-slate-900/60 border border-indigo-500/20 relative overflow-hidden h-fit">
            <div className="flex items-center gap-2 mb-4 text-indigo-400">
              <Sparkles size={18} />
              <span className="font-extrabold text-sm text-white">AI Auditor Findings</span>
            </div>

            <div className="prose prose-invert max-w-none text-slate-300 text-xs leading-relaxed whitespace-pre-wrap bg-slate-950/40 p-4 rounded-xl border border-slate-900/60 italic">
              {data.aiAuditReport}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Reconciliation;
