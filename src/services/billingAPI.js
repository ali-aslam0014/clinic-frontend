import axios from 'axios';

const api = axios.create({
  baseURL: '/api/billing'
});

const billingAPI = {
  // Search patients
  searchPatients: async (query) => {
    const response = await api.get(`/patients/search?q=${query}`);
    return response.data;
  },

  // Get patient details
  getPatientDetails: async (patientId) => {
    const response = await api.get(`/patients/${patientId}`);
    return response.data;
  },

  // Get all services
  getServices: async () => {
    const response = await api.get('/services');
    return response.data;
  },

  // Generate bill
  generateBill: async (billData) => {
    const response = await api.post('/generate', billData);
    return response.data;
  },

  // Get bill by ID
  getBill: async (billId) => {
    const response = await api.get(`/${billId}`);
    return response.data;
  },

  // Update bill
  updateBill: async (billId, billData) => {
    const response = await api.put(`/${billId}`, billData);
    return response.data;
  },

  // Delete bill
  deleteBill: async (billId) => {
    const response = await api.delete(`/${billId}`);
    return response.data;
  },

  // Get patient's billing history
  getPatientBillingHistory: async (patientId) => {
    const response = await api.get(`/history/${patientId}`);
    return response.data;
  },

  // Process payment
  processPayment: async (billId, paymentData) => {
    const response = await api.post(`/${billId}/payment`, paymentData);
    return response.data;
  },

  // Get payment receipt
  getReceipt: async (paymentId) => {
    const response = await api.get(`/receipt/${paymentId}`);
    return response.data;
  },

  // Process refund
  processRefund: async (billId, refundData) => {
    const response = await api.post(`/${billId}/refund`, refundData);
    return response.data;
  },

  // Get bill statistics
  getBillStats: async (filters) => {
    const response = await api.get('/stats', { params: filters });
    return response.data;
  },

  // Get pending bills
  getPendingBills: async () => {
    const response = await api.get('/pending');
    return response.data;
  },

  // Apply discount
  applyDiscount: async (billId, discountData) => {
    const response = await api.post(`/${billId}/discount`, discountData);
    return response.data;
  },

  // Void bill
  voidBill: async (billId, reason) => {
    const response = await api.post(`/${billId}/void`, { reason });
    return response.data;
  },

  // Get daily transactions
  getDailyTransactions: async (date) => {
    const response = await api.get('/transactions/daily', { params: { date } });
    return response.data;
  },

  // Get payment methods
  getPaymentMethods: async () => {
    const response = await api.get('/payment-methods');
    return response.data;
  },

  // Add payment method
  addPaymentMethod: async (methodData) => {
    const response = await api.post('/payment-methods', methodData);
    return response.data;
  },

  // Handle error
  handleError: (error) => {
    if (error.response) {
      // Server responded with error
      return error.response.data;
    } else if (error.request) {
      // Request made but no response
      return { success: false, message: 'No response from server' };
    } else {
      // Request setup error
      return { success: false, message: 'Error setting up request' };
    }
  }
};

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(billingAPI.handleError(error));
  }
);

export default billingAPI; 