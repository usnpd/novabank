import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import accountService from '../services/accountService';
import StatCard from '../components/StatCard';
import AccountCard from '../components/AccountCard';
import TransactionRow from '../components/TransactionRow';
import TransactionChart from '../components/TransactionChart';
import FraudAlert from '../components/FraudAlert';
import PageLoader from '../components/PageLoader';
import { Landmark, TrendingUp, CreditCard, PiggyBank, RefreshCw, PlusCircle, AlertCircle } from 'lucide-react';

const Dashboard = ({ onSelectAccount, dashboardData, onRefresh }) => {
  const { setCurrentView } = useAuth();
  
  if (!dashboardData) {
    return <PageLoader message="Compiling your portfolio ledger..." />;
  }

  const {
    accounts = [],
    recentTransactions = [],
    totalSavings = 0,
    totalCurrent = 0,
    totalCredit = 0,
    totalInvestments = 0,
    alerts = []
  } = dashboardData;

  const activeFraudAlerts = alerts.filter(a => a.alertType === 'FRAUD_SUSPECTED' && !a.isRead);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const handleDismissAlert = async (alertId) => {
    try {
      await accountService.markAlertAsRead(alertId);
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
      
      {/* Risk Alert Banners at the top */}
      {activeFraudAlerts.length > 0 && (
        <div className="mb-6 space-y-4">
          {activeFraudAlerts.map(alert => (
            <FraudAlert 
              key={alert.id} 
              alert={alert} 
              onClose={() => handleDismissAlert(alert.id)} 
            />
          ))}
        </div>
      )}

      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Financial Intelligence Control</h2>
          <p className="text-xs text-slate-500 mt-1">Real-time wealth summaries, cash flow forecasts, and fraud auditing</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentView('ACCOUNTS')}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 active:scale-[0.98] shadow-lg shadow-blue-500/20"
          >
            <PlusCircle size={14} />
            Create Account
          </button>
          
          <button
            onClick={onRefresh}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
            title="Refresh Portfolio"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Checking Balance" 
          value={formatCurrency(totalCurrent)} 
          icon={Landmark}
          description="Liquid Cash Reserves"
          trend="+2.4%"
          trendType="positive"
        />
        <StatCard 
          title="Premium Savings" 
          value={formatCurrency(totalSavings)} 
          icon={PiggyBank}
          description="Interest Accruing Balance"
          trend="+0.8%"
          trendType="positive"
        />
        <StatCard 
          title="Wealth Investments" 
          value={formatCurrency(totalInvestments)} 
          icon={TrendingUp}
          description="Equities & Fixed Assets"
          trend="+12.4%"
          trendType="positive"
        />
        <StatCard 
          title="Signature Credit" 
          value={formatCurrency(totalCredit)} 
          icon={CreditCard}
          description="Current Line Utilization"
          trend="-1.5%"
          trendType="negative"
        />
      </div>

      {/* Main split-content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Accounts & Spending distribution */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Accounts section */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">My Private Accounts</h3>
            {accounts.length === 0 ? (
              <div className="glass-panel p-8 text-center rounded-2xl">
                <p className="text-sm text-slate-500">No accounts opened yet.</p>
                <button 
                  onClick={() => setCurrentView('ACCOUNTS')}
                  className="btn-primary mt-4 text-xs"
                >
                  Configure New Account
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {accounts.map(acc => (
                  <AccountCard 
                    key={acc.id} 
                    account={acc} 
                    onSelect={onSelectAccount} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* Spending Distribution chart */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Spending by Category</h3>
            <TransactionChart transactions={recentTransactions} />
          </div>

        </div>

        {/* Right Col: Recent Transactions Log */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-[520px]">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Activity Log</h3>
            <button
              onClick={() => setCurrentView('TRANSACTIONS')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              Log Transaction
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="flex-grow flex items-center justify-center text-xs text-slate-500">
              No transactions recorded yet.
            </div>
          ) : (
            <div className="flex-grow overflow-y-auto space-y-3 pr-1">
              {recentTransactions.map(t => (
                <TransactionRow key={t.id} transaction={t} />
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
