import axios from 'axios';

const communicationAPI = {
  // Reminder endpoints
  getReminders: async () => {
    const response = await axios.get('/api/communication/reminders');
    return response.data;
  },

  createReminder: async (reminderData) => {
    const response = await axios.post('/api/communication/reminders', reminderData);
    return response.data;
  },

  updateReminder: async (id, reminderData) => {
    const response = await axios.put(`/api/communication/reminders/${id}`, reminderData);
    return response.data;
  },

  deleteReminder: async (id) => {
    const response = await axios.delete(`/api/communication/reminders/${id}`);
    return response.data;
  },

  // Template endpoints
  getTemplates: async () => {
    const response = await axios.get('/api/communication/templates');
    return response.data;
  },

  createTemplate: async (templateData) => {
    const response = await axios.post('/api/communication/templates', templateData);
    return response.data;
  },

  updateTemplate: async (id, templateData) => {
    const response = await axios.put(`/api/communication/templates/${id}`, templateData);
    return response.data;
  },

  deleteTemplate: async (id) => {
    const response = await axios.delete(`/api/communication/templates/${id}`);
    return response.data;
  },

  // Process reminders manually (if needed)
  processReminders: async () => {
    const response = await axios.post('/api/communication/process-reminders');
    return response.data;
  }
};

export default communicationAPI; 