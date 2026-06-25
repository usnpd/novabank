import React, { useState, useEffect } from 'react';
import transactionService from '../services/transactionService';
import accountService from '../services/accountService';
import TransactionRow from '../components/TransactionRow';
import PageLoader from '../components/PageLoader';
import { ArrowLeft, Wallet, Calendar, Filter, HelpCircle } from 'lucide-react';

const AccountDetail = ({ accountId, onBack }) => {
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL'); // ALL, CREDIT, DEBIT
  const [filterCategory, setFilterCategory] = useState('ALL'); // ALL, GROCERIES, UTILITIES, etc.

  const fetchDetails = async () => {
    try {
      const [accDetails, txnList] = await Promise.all([
        accountService.getAccountById(accountId),
        transactionService.getTransactionsForAccount(accountId)
      ]);
      setAccount(accDetails);
      setTransactions(txnList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [accountId]);

  if (loading || !account) {
    return <PageLoader message="Fetching account statements..." />;
  }

  // Filter transactions logic
  const filteredTransactions = transactions.filter(t => {
    const typeMatch = filterType === 'ALL' || t.transactionType === filterType;
    const catMatch = filterCategory === 'ALL' || t.category === filterCategory;
    return typeMatch && catMatch;
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Get unique categories present in transactions for dropdown filter
  const categories = ['ALL', ...new Set(transactions.map(t => t.category))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
      
      {/* Back button & title */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">{account.accountName}</h2>
          <span className="text-xs text-slate-500 font-mono">{account.accountNumber}</span>
        </div>
      </div>

      {/* Account Info Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Balance Card */}
        <div className="glass-panel p-6 rounded-2xl md:col-span-2 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Statement Balance</span>
            <div className="text-3xl font-extrabold text-white mt-1.5 font-mono tracking-tight">
              {formatCurrency(account.balance)}
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-4 flex items-center gap-1.5">
            <Wallet size={14} className="text-blue-500" />
            <span>Premium tier: {account.accountType}</span>
          </div>
        </div>

        {/* Quick summary stats */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between min-h-[140px]">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Account Tenure</span>
            <div className="text-lg font-bold text-slate-200 mt-2 flex items-center gap-1.5">
              <Calendar size={16} className="text-slate-500" />
              <span>Active</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 block">Opened on {new Date(account.createdAt).toLocaleDateString()}</span>
        </div>

      </div>

      {/* Transaction List with filter controls */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Statement Transactions</h3>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-800">
              <Filter size={12} className="text-slate-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent border-none text-slate-350 text-xs focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-950">All Types</option>
                <option value="CREDIT" className="bg-slate-950">Credits</option>
                <option value="DEBIT" className="bg-slate-950">Debits</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-transparent border-none text-slate-350 text-xs focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-950">All Categories</option>
                {categories.filter(c => c !== 'ALL').map(cat => (
                  <option key={cat} value={cat} className="bg-slate-950">{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Transactions log list */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500">
            No transactions match the selected filters.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map(t => (
              <TransactionRow key={t.id} transaction={t} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AccountDetail;
