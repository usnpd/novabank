import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import AccountDetail from './pages/AccountDetail';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Reconciliation from './pages/Reconciliation';
import Navbar from './components/Navbar';
import PageLoader from './components/PageLoader';
import accountService from './services/accountService';

const MainAppContent = () => {
  const { user, loading, currentView, setCurrentView } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  const fetchDashboard = async () => {
    if (!user) return;
    try {
      const data = await accountService.getDashboardData();
      setDashboardData(data);
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center">
        <PageLoader message="Loading NovaBank secure session..." />
      </div>
    );
  }

  // Guest view routing (Authentication views)
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
        <Navbar />
        {currentView === 'SIGNUP' ? <Signup /> : <Login />}
        <footer className="border-t border-slate-900 py-6 bg-slate-950/40 text-center text-[10px] text-slate-600">
          © {new Date().getFullYear()} NovaBank Private Wealth Management. All rights reserved. Encrypted secure portal.
        </footer>
      </div>
    );
  }

  // Authenticated view routing
  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return (
          <Dashboard 
            dashboardData={dashboardData} 
            onRefresh={fetchDashboard} 
            onSelectAccount={(accountId) => {
              setSelectedAccountId(accountId);
              setCurrentView('ACCOUNT_DETAIL');
            }}
          />
        );
      case 'ACCOUNT_DETAIL':
        return (
          <AccountDetail 
            accountId={selectedAccountId} 
            onBack={() => setCurrentView('DASHBOARD')} 
          />
        );
      case 'ACCOUNTS':
        return (
          <Accounts 
            accounts={dashboardData?.accounts} 
            onRefresh={fetchDashboard}
            onSelectAccount={(accountId) => {
              setSelectedAccountId(accountId);
              setCurrentView('ACCOUNT_DETAIL');
            }}
          />
        );
      case 'TRANSACTIONS':
        return (
          <Transactions 
            accounts={dashboardData?.accounts} 
            onRefresh={fetchDashboard} 
          />
        );
      case 'ANALYTICS':
        return <Analytics />;
      case 'RECONCILIATION':
        return <Reconciliation />;
      default:
        return <Dashboard dashboardData={dashboardData} onRefresh={fetchDashboard} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
      <div>
        <Navbar 
          alerts={dashboardData?.alerts} 
          onAlertRead={fetchDashboard} 
        />
        <main className="flex-grow flex flex-col">
          {renderView()}
        </main>
      </div>
      <footer className="border-t border-slate-900 py-6 bg-slate-950/40 text-center text-[10px] text-slate-600">
        © {new Date().getFullYear()} NovaBank Private Wealth Management. All rights reserved. Secured with TLS 1.3 & AES-256.
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
};

export default App;
