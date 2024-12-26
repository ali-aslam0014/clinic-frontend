import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const queueAPI = {
  // Get current queue status
  getCurrentQueue: async () => {
    try {
      const response = await api.get('/queue/current');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add patient to queue
  addToQueue: async (queueData) => {
    try {
      const response = await api.post('/queue', queueData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update patient queue position
  updatePosition: async (tokenNumber, updateData) => {
    try {
      const response = await api.put(`/queue/${tokenNumber}/position`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update queue status
  updateStatus: async (tokenNumber, status) => {
    try {
      const response = await api.put(`/queue/${tokenNumber}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Remove from queue
  removeFromQueue: async (tokenNumber) => {
    try {
      const response = await api.delete(`/queue/${tokenNumber}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get queue statistics
  getQueueStats: async () => {
    try {
      const response = await api.get('/queue/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get estimated wait time
  getWaitTime: async (doctorId) => {
    try {
      const response = await api.get(`/queue/wait-time/${doctorId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get queue history
  getQueueHistory: async (date) => {
    try {
      const response = await api.get('/queue/history', {
        params: { date }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get doctor's queue
  getDoctorQueue: async (doctorId) => {
    try {
      const response = await api.get(`/queue/doctor/${doctorId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mark patient as no-show
  markNoShow: async (tokenNumber) => {
    try {
      const response = await api.put(`/queue/${tokenNumber}/no-show`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get queue by department
  getDepartmentQueue: async (departmentId) => {
    try {
      const response = await api.get(`/queue/department/${departmentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update priority
  updatePriority: async (tokenNumber, priority) => {
    try {
      const response = await api.put(`/queue/${tokenNumber}/priority`, { priority });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default queueAPI;