import axios from 'axios';

const api = axios.create({
  baseURL: '/api/reports'
});

const reportsAPI = {
  // Daily Patient Count
  getDailyPatientCount: async (params) => {
    const response = await api.get('/daily-patient-count', { params });
    return response.data;
  },

  exportDailyPatientCount: async (params) => {
    const response = await api.get('/daily-patient-count/export', {
      params,
      responseType: 'blob'
    });

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `patient_count_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    return response.data;
  },

  // Weekly Stats
  getWeeklyStats: async (params) => {
    const response = await api.get('/weekly-stats', { params });
    return response.data;
  },

  // Monthly Stats
  getMonthlyStats: async (params) => {
    const response = await api.get('/monthly-stats', { params });
    return response.data;
  },

  // Custom Date Range Stats
  getCustomRangeStats: async (params) => {
    const response = await api.get('/custom-range-stats', { params });
    return response.data;
  },

  // Department-wise Stats
  getDepartmentStats: async (params) => {
    const response = await api.get('/department-stats', { params });
    return response.data;
  },

  // Doctor-wise Stats
  getDoctorStats: async (params) => {
    const response = await api.get('/doctor-stats', { params });
    return response.data;
  }
};

export default reportsAPI; 