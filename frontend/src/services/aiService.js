import api from './api';

const aiService = {
  getInsights: async () => {
    const response = await api.get('/ai/insights');
    return response.data;
  },

  getCashFlow: async () => {
    const response = await api.get('/ai/cashflow');
    return response.data;
  },

  reconcile: async (month1, month2) => {
    const response = await api.post(`/ai/reconcile?month1=${month1}&month2=${month2}`);
    return response.data;
  }
};

export default aiService;
