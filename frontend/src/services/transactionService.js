import api from './api';

const transactionService = {
  getTransactions: async () => {
    const response = await api.get('/transactions');
    return response.data;
  },

  getTransactionsForAccount: async (accountId) => {
    const response = await api.get(`/transactions/account/${accountId}`);
    return response.data;
  },

  addTransaction: async (txnData) => {
    const response = await api.post('/transactions', txnData);
    return response.data;
  },

  transferFunds: async (transferData) => {
    const response = await api.post('/transactions/transfer', transferData);
    return response.data;
  }
};

export default transactionService;
