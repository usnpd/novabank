import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

const Signup = () => {
  const { signup, setCurrentView } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      await signup(name, email, password);
      setSuccess(true);
      setTimeout(() => {
        setCurrentView('LOGIN');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl relative overflow-hidden">
        
        <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>

        <div className="text-center mb-8">
          <span className="text-3xl">💎</span>
          <h2 className="text-2xl font-black text-white mt-3 font-sans tracking-tight">Open Membership</h2>
          <p className="text-xs text-slate-500 mt-1">Open a premium private banking relationship</p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-950/30 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 p-3 bg-emerald-950/30 border border-emerald-500/20 text-emerald-450 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-500" />
            <span>Registration successful! Redirecting to login...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Full Name</label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
                className="form-input pl-10"
              />
              <User className="absolute left-3.5 top-3 text-slate-600" size={16} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@novabank.com"
                required
                className="form-input pl-10"
              />
              <Mail className="absolute left-3.5 top-3 text-slate-600" size={16} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                className="form-input pl-10"
              />
              <Lock className="absolute left-3.5 top-3 text-slate-600" size={16} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full btn-primary mt-6 text-sm py-2.5"
          >
            {loading ? 'Creating Membership Profile...' : 'Submit Membership Application'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already a member?{' '}
          <button 
            onClick={() => setCurrentView('LOGIN')}
            className="text-blue-400 hover:text-blue-300 font-semibold"
          >
            Sign In
          </button>
        </div>

      </div>
    </div>
  );
};

export default Signup;
