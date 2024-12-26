import axios from 'axios';

export const pharmacyService = {
  // Send prescription to pharmacy
  sendToPharmacy: async (prescriptionId) => {
    try {
      const response = await axios.post(`/api/pharmacy/orders/prescription/${prescriptionId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Check medicine availability
  checkMedicineAvailability: async (medicines) => {
    try {
      const response = await axios.post('/api/pharmacy/check-availability', { medicines });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get medicine price
  getMedicinePrice: async (medicineId) => {
    try {
      const response = await axios.get(`/api/pharmacy/medicines/${medicineId}/price`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get order status
  getOrderStatus: async (orderId) => {
    try {
      const response = await axios.get(`/api/pharmacy/orders/${orderId}/status`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create pharmacy order
  createOrder: async (prescriptionId) => {
    try {
      const response = await axios.post('/api/pharmacy/orders', { prescriptionId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await axios.patch(`/api/pharmacy/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get pharmacy statistics
  getPharmacyStats: async () => {
    try {
      const response = await axios.get('/api/pharmacy/statistics');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get low stock medicines
  getLowStockMedicines: async () => {
    try {
      const response = await axios.get('/api/pharmacy/medicines/low-stock');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get expiring medicines
  getExpiringMedicines: async () => {
    try {
      const response = await axios.get('/api/pharmacy/medicines/expiring');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};