import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('DASHBOARD'); // DASHBOARD, ACCOUNTS, TRANSACTIONS, ANALYTICS, RECONCILIATION

  useEffect(() => {
    const cachedUser = authService.getCurrentUser();
    if (cachedUser) {
      setUser(cachedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setUser(data);
      setCurrentView('DASHBOARD');
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const data = await authService.signup(name, email, password);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setCurrentView('LOGIN');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, currentView, setCurrentView }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
