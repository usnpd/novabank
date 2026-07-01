import React, { useState, useEffect } from 'react';
import aiService from '../services/aiService';
import InsightCard from '../components/InsightCard';
import CashFlowChart from '../components/CashFlowChart';
import PageLoader from '../components/PageLoader';
import { CalendarRange, Sparkles, RefreshCw, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Analytics = () => {
  const [insight, setInsight] = useState(null);
  const [cashFlow, setCashFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalyticsData = async () => {
    setError('');
    try {
      const [insightData, cashFlowData] = await Promise.all([
        aiService.getInsights(),
        aiService.getCashFlow()
      ]);
      setInsight(insightData);
      setCashFlow(cashFlowData);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch AI analytics. Make sure your Gemini API credentials are set or verify local connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  if (loading) {
    return <PageLoader message="AI is compiling cash flow forecasts and asset diagnostics..." />;
  }

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">AI Wealth Intelligence</h2>
          <p className="text-xs text-slate-500 mt-1">Predictive cash flow modeling and portfolio diagnostics powered by Mistral AI</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchAnalyticsData(); }}
          className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
          title="Refresh Analysis"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Analytics Panels grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Cash Flow Forecast */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Summary Metric Strip */}
          {cashFlow && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="glass-panel p-5 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Projected Inflows (30d)</span>
                <div className="text-xl font-extrabold text-emerald-450 mt-1.5 font-mono flex items-center gap-1.5 text-emerald-400">
                  <ArrowUpRight size={18} />
                  {formatCurrency(cashFlow.netInflow30Days)}
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Projected Outflows (30d)</span>
                <div className="text-xl font-extrabold text-red-450 mt-1.5 font-mono flex items-center gap-1.5 text-red-400">
                  <ArrowDownRight size={18} />
                  {formatCurrency(cashFlow.netOutflow30Days)}
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl bg-gradient-to-br from-blue-950/15 to-transparent">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Net Change</span>
                <div className="text-xl font-extrabold text-blue-400 mt-1.5 font-mono">
                  {formatCurrency(cashFlow.projectedBalanceEnd30Days)}
                </div>
              </div>
            </div>
          )}

          {/* Cash Flow Forecast Chart card */}
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">30-Day Cash Flow Projections</h3>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
                Forecast Active
              </span>
            </div>
            {cashFlow && (
              <CashFlowChart 
                historicalData={cashFlow.historicalData} 
                forecastedData={cashFlow.forecastedData} 
              />
            )}
          </div>

          {/* Forecast Recommendation card */}
          {cashFlow?.AIRecommendation && (
            <div className="glass-panel p-6 rounded-2xl border border-blue-500/25 bg-gradient-to-br from-blue-950/10 to-transparent">
              <div className="flex items-center gap-2 mb-3 text-blue-400">
                <Sparkles size={16} />
                <span className="font-bold text-xs uppercase tracking-wider">AI Forecast Insights</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{cashFlow.AIRecommendation}"
              </p>
            </div>
          )}

        </div>

        {/* Right Col: Diagnostics (InsightCard) */}
        <div>
          <InsightCard insight={insight} />
        </div>

      </div>

    </div>
  );
};

export default Analytics;
