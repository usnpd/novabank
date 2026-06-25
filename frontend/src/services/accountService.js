import api from './api';

const accountService = {
  getDashboardData: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },

  createAccount: async (accountName, accountType, initialBalance) => {
    const response = await api.post('/accounts', { accountName, accountType, initialBalance });
    return response.data;
  },

  getAccounts: async () => {
    const response = await api.get('/accounts');
    return response.data;
  },

  getAccountById: async (accountId) => {
    const response = await api.get(`/accounts/${accountId}`);
    return response.data;
  },

  markAlertAsRead: async (alertId) => {
    const response = await api.post(`/dashboard/alerts/${alertId}/read`);
    return response.data;
  }
};

export default accountService;
