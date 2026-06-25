import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, LogOut, ShieldAlert, BarChart3, LayoutDashboard, Wallet, ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import accountService from '../services/accountService';

const Navbar = ({ alerts = [], onAlertRead }) => {
  const { user, currentView, setCurrentView, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadAlerts = alerts.filter(a => !a.isRead);

  const handleMarkAsRead = async (alertId) => {
    try {
      await accountService.markAlertAsRead(alertId);
      if (onAlertRead) onAlertRead();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div 
            onClick={() => setCurrentView(user ? 'DASHBOARD' : 'LOGIN')} 
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <span className="text-2xl">💎</span>
            <span className="font-extrabold text-xl tracking-tight text-white font-sans">
              Nova<span className="text-blue-500">Bank</span>
            </span>
          </div>

          {/* Navigation Links */}
          {user && (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setCurrentView('DASHBOARD')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'DASHBOARD'
                    ? 'bg-slate-900 text-blue-400 border border-slate-850'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('ACCOUNTS')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'ACCOUNTS'
                    ? 'bg-slate-900 text-blue-400 border border-slate-850'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wallet size={16} />
                Accounts
              </button>
              <button
                onClick={() => setCurrentView('TRANSACTIONS')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'TRANSACTIONS'
                    ? 'bg-slate-900 text-blue-400 border border-slate-850'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowLeftRight size={16} />
                Transactions
              </button>
              <button
                onClick={() => setCurrentView('ANALYTICS')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'ANALYTICS'
                    ? 'bg-slate-900 text-blue-400 border border-slate-850'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart3 size={16} />
                Analytics
              </button>
              <button
                onClick={() => setCurrentView('RECONCILIATION')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'RECONCILIATION'
                    ? 'bg-slate-900 text-blue-400 border border-slate-850'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 size={16} />
                Reconciliation
              </button>
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Notification Dropdown toggle */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-all relative"
                  >
                    <Bell size={20} />
                    {unreadAlerts.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                    )}
                  </button>

                  {/* Dropdown panel */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 glass-panel rounded-2xl p-4 z-50 max-h-96 overflow-y-auto">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
                        <span className="font-bold text-sm text-white">Risk Notifications</span>
                        <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-bold">
                          {unreadAlerts.length} new
                        </span>
                      </div>

                      {alerts.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-500">
                          🎉 All clean! No alerts detected.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {alerts.map((a) => (
                            <div 
                              key={a.id} 
                              className={`p-3 rounded-xl border text-xs transition-all relative ${
                                a.isRead 
                                  ? 'bg-slate-950/40 border-slate-900/60 text-slate-500' 
                                  : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-1.5 mb-1.5">
                                <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] ${
                                  a.severity === 'CRITICAL' 
                                    ? 'bg-red-500/15 text-red-400 border border-red-500/30' 
                                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                }`}>
                                  {a.alertType}
                                </span>
                                {!a.isRead && (
                                  <button
                                    onClick={() => handleMarkAsRead(a.id)}
                                    className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold"
                                  >
                                    Mark read
                                  </button>
                                )}
                              </div>
                              <p className="leading-relaxed">{a.message}</p>
                              <span className="block mt-2 text-[9px] text-slate-600">
                                {new Date(a.createdAt).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Info & Logout */}
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-semibold text-slate-200">{user.name}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Private Client</span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
                    title="Sign Out"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setCurrentView('LOGIN')} className="text-slate-400 hover:text-white text-sm font-medium px-3 py-2">
                  Sign In
                </button>
                <button onClick={() => setCurrentView('SIGNUP')} className="btn-primary text-sm px-4 py-2">
                  Apply Now
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
