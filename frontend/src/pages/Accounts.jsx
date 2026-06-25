import React, { useState } from 'react';
import accountService from '../services/accountService';
import AccountCard from '../components/AccountCard';
import { Plus, X, Landmark, PiggyBank, Briefcase, CreditCard, AlertCircle } from 'lucide-react';

const Accounts = ({ accounts = [], onRefresh, onSelectAccount }) => {
  const [showModal, setShowModal] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('CURRENT');
  const [initialBalance, setInitialBalance] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await accountService.createAccount(accountName, accountType, initialBalance || '0.00');
      setAccountName('');
      setAccountType('CURRENT');
      setInitialBalance('');
      setShowModal(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create account. Check your parameters.');
    } finally {
      setLoading(false);
    }
  };

  const getAccountTypeIcon = (type) => {
    switch (type) {
      case 'SAVINGS': return <PiggyBank size={18} />;
      case 'INVESTMENT': return <Briefcase size={18} />;
      case 'CREDIT': return <CreditCard size={18} />;
      default: return <Landmark size={18} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Accounts Ledger</h2>
          <p className="text-xs text-slate-500 mt-1">Configure premium savings, transaction checkings, credit cards, or wealth portfolios</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary text-xs flex items-center gap-1.5"
        >
          <Plus size={14} />
          Create New Account
        </button>
      </div>

      {/* Grid of Accounts */}
      {accounts.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl max-w-lg mx-auto mt-12">
          <Landmark className="mx-auto text-slate-600 mb-4" size={40} />
          <h3 className="text-sm font-bold text-slate-350 uppercase">No active accounts</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            NovaBank requires an active account to process transactions and compute financial diagnostics. Complete your setup now.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary mt-6 text-xs"
          >
            Configure Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc) => (
            <AccountCard 
              key={acc.id} 
              account={acc} 
              onSelect={onSelectAccount} 
            />
          ))}
        </div>
      )}

      {/* Account Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 relative shadow-2xl">
            
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-200"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              💎 Account Configuration
            </h3>
            <p className="text-xs text-slate-500 mb-6">Select your account tier and enter initial capital funding</p>

            {error && (
              <div className="mb-5 p-3 bg-red-950/30 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Account Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. Primary Checkings"
                  required
                  className="form-input"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Account Type</label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="form-input bg-slate-950 border-slate-800 select-chevron"
                >
                  <option value="CURRENT">Checking Account</option>
                  <option value="SAVINGS">Premium Savings</option>
                  <option value="INVESTMENT">Wealth Portfolio</option>
                  <option value="CREDIT">Signature Credit</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Initial Capital Funding (USD)</label>
                <input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  className="form-input font-mono"
                />
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1 text-xs py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 text-xs py-2"
                >
                  {loading ? 'Creating...' : 'Confirm Setup'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Accounts;
