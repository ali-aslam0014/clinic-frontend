import axios from 'axios';
import { store } from '../redux/store';
import { logout } from '../redux/features/authSlice';

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api',  // This will be proxied through Vite
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request:', {
      url: config.url,
      method: config.method,
      data: config.data
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor with error logging
api.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401) {
      store.dispatch(logout());
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Patient related API calls
export const patientAPI = {
  fetchPatients: async (page = 1, limit = 10, search = '') => {
    const response = await api.get(`/patients?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
  },

  getPatientById: async (id) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  createPatient: async (data) => {
    try {
      console.log('Creating patient with data:', data);
      const response = await api.post('/patients', data);
      return response.data;
    } catch (error) {
      console.error('Create Patient Error:', error.response?.data || error.message);
      throw error;
    }
  },

  updatePatient: async (id, data) => {
    const response = await api.put(`/patients/${id}`, data);
    return response.data;
  },

  deletePatient: async (id) => {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  },

  getPatients: async (params) => {
    try {
      const response = await api.get('/patients', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getPatientDetails: async (id) => {
    try {
      const response = await api.get(`/patients/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  searchPatients: async (params) => {
    try {
      const response = await api.get('/patients/search', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  generatePatientCard: async (id) => {
    try {
      const response = await api.get(`/patients/${id}/card`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getPatientHistory: async (id) => {
    try {
      const response = await api.get(`/patients/${id}/history`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  uploadDocument: async (id, formData) => {
    try {
      const response = await api.post(`/patients/${id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Appointment related API calls
export const appointmentAPI = {
  fetchAppointments: async (patientId) => {
    if (!patientId) {
      throw new Error('Patient ID is required');
    }
    
    console.log('API call with patientId:', patientId); // Debug log
    return await api.get(`/api/v1/admin/patients/${patientId}/appointments`);
  },

  createAppointment: async (data) => {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  updateAppointment: async (id, data) => {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },

  cancelAppointment: async (id) => {
    const response = await api.put(`/appointments/${id}/cancel`);
    return response.data;
  },

  searchAppointments: async (searchParams) => {
    const response = await api.get('/appointments/search', { params: searchParams });
    return response.data;
  },

  checkInAppointment: async (appointmentId) => {
    const response = await api.put(`/appointments/${appointmentId}/check-in`);
    return response.data;
  },

  getAppointmentsByDateRange: async (params) => {
    const response = await api.get('/appointments/date-range', { params });
    return response.data;
  },

  createEmergencyAppointment: async (data) => {
    try {
      const response = await api.post('/appointments/emergency', data);
      return response.data;
    } catch (error) {
      console.error('Error creating emergency appointment:', error);
      throw error;
    }
  },

  getEmergencyQueue: async () => {
    try {
      const response = await api.get('/appointments/emergency/queue');
      return response.data;
    } catch (error) {
      console.error('Error fetching emergency queue:', error);
      throw error;
    }
  },

  getEmergencyStats: async () => {
    try {
      const response = await api.get('/appointments/emergency/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching emergency stats:', error);
      throw error;
    }
  }
};

// Documents related API calls
export const documentAPI = {
  fetchDocuments: async (patientId) => {
    const response = await api.get(`/patients/${patientId}/documents`);
    return response.data;
  },

  uploadDocument: async (patientId, data) => {
    const response = await api.post(`/patients/${patientId}/documents`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  deleteDocument: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  }
};

// Doctor API
export const doctorAPI = {
  getAvailableDoctors: async () => {
    try {
      const response = await api.get('/doctors/available');
      return response.data;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
  }
};
