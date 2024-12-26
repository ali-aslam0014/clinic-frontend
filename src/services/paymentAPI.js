import axios from 'axios';

const api = axios.create({
  baseURL: '/api/payments'
});

const paymentAPI = {
  getBillDetails: async (billNumber) => {
    const response = await api.get(`/bill/${billNumber}`);
    return response.data;
  },

  processPayment: async (paymentData) => {
    const response = await api.post('/process', paymentData);
    return response.data;
  },

  getReceipt: async (paymentId) => {
    const response = await api.get(`/receipt/${paymentId}`);
    return response.data;
  }
};

export default paymentAPI; 