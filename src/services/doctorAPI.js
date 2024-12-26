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

const doctorAPI = {
  // Get all doctors
  getAllDoctors: async () => {
    try {
      const response = await api.get('/doctors');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get doctor by ID
  getDoctorById: async (id) => {
    try {
      const response = await api.get(`/doctors/${id}`);
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

  // Get doctor's available slots
  getDoctorAvailableSlots: async (doctorId, date) => {
    try {
      const response = await api.get(`/doctors/${doctorId}/available-slots`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get doctor's working hours
  getDoctorWorkingHours: async (doctorId) => {
    try {
      const response = await api.get(`/doctors/${doctorId}/working-hours`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get doctors by specialization
  getDoctorsBySpecialization: async (specialization) => {
    try {
      const response = await api.get('/doctors', {
        params: { specialization }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get doctor's appointments
  getDoctorAppointments: async (doctorId, date) => {
    try {
      const response = await api.get(`/doctors/${doctorId}/appointments`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update doctor's schedule
  updateDoctorSchedule: async (doctorId, scheduleData) => {
    try {
      const response = await api.put(`/doctors/${doctorId}/schedule`, scheduleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get doctor's statistics
  getDoctorStats: async (doctorId) => {
    try {
      const response = await api.get(`/doctors/${doctorId}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default doctorAPI;