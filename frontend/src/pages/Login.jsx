import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login, setCurrentView } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to authenticate user. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>

        <div className="text-center mb-8">
          <span className="text-3xl">💎</span>
          <h2 className="text-2xl font-black text-white mt-3 font-sans tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-500 mt-1">Access the NovaBank premium private cockpit</p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-950/30 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="••••••••"
                required
                className="form-input pl-10"
              />
              <Lock className="absolute left-3.5 top-3 text-slate-600" size={16} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary mt-6 text-sm py-2.5"
          >
            {loading ? 'Authenticating Credentials...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Not a client yet?{' '}
          <button 
            onClick={() => setCurrentView('SIGNUP')}
            className="text-blue-400 hover:text-blue-300 font-semibold"
          >
            Apply for Membership
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
