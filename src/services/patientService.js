import { patientAPI } from './api';

export const patientService = {
  registerPatient: async (patientData) => {
    try {
      const response = await patientAPI.createPatient(patientData);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getPatients: async (page = 1, limit = 10, search = '') => {
    try {
      const response = await patientAPI.fetchPatients(page, limit, search);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getPatientById: async (id) => {
    try {
      const response = await patientAPI.getPatientById(id);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updatePatient: async (id, data) => {
    try {
      const response = await patientAPI.updatePatient(id, data);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};