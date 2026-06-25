import React, { useState } from 'react';
import transactionService from '../services/transactionService';
import { Landmark, ArrowLeftRight, CheckCircle2, AlertCircle, Sparkles, Repeat } from 'lucide-react';

const Transactions = ({ accounts = [], onRefresh }) => {
  const [activeTab, setActiveTab] = useState('LOG'); // LOG, TRANSFER
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // LOG Form State
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('DEBIT');
  const [category, setCategory] = useState('GROCERIES');
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  // TRANSFER Form State
  const [sourceAccountNumber, setSourceAccountNumber] = useState(accounts[0]?.accountNumber || '');
  const [targetAccountNumber, setTargetAccountNumber] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDescription, setTransferDescription] = useState('');

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await transactionService.addTransaction({
        accountId: Number(accountId),
        amount: Number(amount),
        transactionType,
        category,
        description,
        isRecurring
      });
      setAmount('');
      setDescription('');
      setIsRecurring(false);
      setSuccess(true);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to record transaction.');
    } finally {
      setLoading(false);
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await transactionService.transferFunds({
        sourceAccountNumber,
        targetAccountNumber,
        amount: Number(transferAmount),
        description: transferDescription
      });
      setTransferAmount('');
      setTransferDescription('');
      setTargetAccountNumber('');
      setSuccess(true);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to complete transfer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 w-full flex-grow">
      
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-white tracking-tight">Ledger Operations</h2>
        <p className="text-xs text-slate-500 mt-1">Submit deposit/debit requests or execute cross-account transfers</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 mb-8 p-1 bg-slate-950 rounded-xl max-w-sm mx-auto">
        <button
          onClick={() => { setActiveTab('LOG'); setError(''); setSuccess(false); }}
          className={`flex-1 text-xs py-2 rounded-lg font-bold transition-all ${
            activeTab === 'LOG' 
              ? 'bg-slate-900 text-blue-400 border border-slate-800 shadow-lg' 
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Transaction Log
        </button>
        <button
          onClick={() => { setActiveTab('TRANSFER'); setError(''); setSuccess(false); }}
          className={`flex-1 text-xs py-2 rounded-lg font-bold transition-all ${
            activeTab === 'TRANSFER' 
              ? 'bg-slate-900 text-blue-400 border border-slate-800 shadow-lg' 
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Internal Transfer
        </button>
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-950/20 border border-emerald-500/20 text-emerald-450 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span>Operation completed successfully! AI ledger updated.</span>
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="glass-panel p-8 text-center rounded-2xl">
          <p className="text-sm text-slate-500">Configure an account before logging ledger operations.</p>
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
          
          {/* AI Sparkle indicator */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-bold">
            <Sparkles size={10} className="animate-spin [animation-duration:15s]" />
            <span>AI Risk Audited</span>
          </div>

          {activeTab === 'LOG' ? (
            <form onSubmit={handleLogSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Select Account</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="form-input"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.accountName} ({acc.accountNumber})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Transaction Type</label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                    className="form-input"
                  >
                    <option value="DEBIT">Withdrawal (DEBIT)</option>
                    <option value="CREDIT">Deposit (CREDIT)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-input"
                  >
                    <option value="GROCERIES">Groceries</option>
                    <option value="SALARY">Salary Paycheck</option>
                    <option value="RENT">Housing Rent</option>
                    <option value="UTILITIES">Utility Bills</option>
                    <option value="ENTERTAINMENT">Entertainment</option>
                    <option value="INVESTMENT">Investment Assets</option>
                    <option value="TRAVEL">Travel / Fuel</option>
                    <option value="INSURANCE">Insurance Payments</option>
                    <option value="TAX">Taxes</option>
                    <option value="OTHER">Other Expenses</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Amount (USD)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                  className="form-input font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Merchant name or transfer reason"
                  className="form-input"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="h-4 w-4 bg-slate-950 border-slate-800 rounded focus:ring-blue-500 text-blue-600 cursor-pointer"
                />
                <label htmlFor="isRecurring" className="text-xs text-slate-400 flex items-center gap-1 cursor-pointer select-none">
                  <Repeat size={12} />
                  Mark as recurring monthly transaction
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary mt-6 text-xs py-2.5"
              >
                {loading ? 'Submitting request...' : 'Commit Transaction'}
              </button>

            </form>
          ) : (
            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Source Account</label>
                <select
                  value={sourceAccountNumber}
                  onChange={(e) => setSourceAccountNumber(e.target.value)}
                  className="form-input"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.accountNumber}>{acc.accountName} ({acc.accountNumber})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Target Account Number</label>
                <input
                  type="text"
                  value={targetAccountNumber}
                  onChange={(e) => setTargetAccountNumber(e.target.value)}
                  placeholder="US1234567890"
                  required
                  className="form-input font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Transfer Amount (USD)</label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                  className="form-input font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Description / Memo</label>
                <input
                  type="text"
                  value={transferDescription}
                  onChange={(e) => setTransferDescription(e.target.value)}
                  placeholder="Memo details"
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary mt-6 text-xs py-2.5"
              >
                {loading ? 'Initiating funds wire...' : 'Confirm Wire Transfer'}
              </button>

            </form>
          )}

        </div>
      )}

    </div>
  );
};

export default Transactions;
