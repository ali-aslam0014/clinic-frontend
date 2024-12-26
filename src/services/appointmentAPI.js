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

const appointmentAPI = {
  // Get today's appointments
  getTodayAppointments: async () => {
    try {
      const response = await api.get('/appointments/today');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update appointment status
  updateAppointmentStatus: async (appointmentId, status) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Send appointment reminder
  sendAppointmentReminder: async (appointmentId) => {
    try {
      const response = await api.post(`/appointments/${appointmentId}/reminder`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get appointment details
  getAppointmentDetails: async (appointmentId) => {
    try {
      const response = await api.get(`/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new appointment
  createAppointment: async (appointmentData) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update appointment
  updateAppointment: async (appointmentId, appointmentData) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}`, appointmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId, reason) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get doctor's schedule
  getDoctorSchedule: async (doctorId, date) => {
    try {
      const response = await api.get(`/doctors/${doctorId}/schedule`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get available time slots
  getAvailableSlots: async (doctorId, date) => {
    try {
      const response = await api.get(`/appointments/available-slots`, {
        params: { doctorId, date }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default appointmentAPI;