import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Make sure this matches your backend URL
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
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

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message;
    return Promise.reject(new Error(message));
  }
);

const patientAPI = {
  getPatientDetails: async (id) => {
    try {
      console.log('Fetching patient details for ID:', id); // Debug log
      const response = await api.get(`/patients/${id}`);
      console.log('Response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('API Error:', error); // Debug log
      throw error;
    }
  },

  updatePatient: async (id, data) => {
    try {
      const response = await api.put(`/patients/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default patientAPI;