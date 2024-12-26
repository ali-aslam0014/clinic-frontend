import axios from 'axios';

const documentsAPI = {
  // Get all documents
  getDocuments: async () => {
    const response = await axios.get('/api/documents');
    return response.data;
  },

  // Upload a new document
  uploadDocument: async (formData) => {
    const response = await axios.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Update document details
  updateDocument: async (id, documentData) => {
    const response = await axios.put(`/api/documents/${id}`, documentData);
    return response.data;
  },

  // Delete a document
  deleteDocument: async (id) => {
    const response = await axios.delete(`/api/documents/${id}`);
    return response.data;
  },

  // Get document categories
  getCategories: async () => {
    const response = await axios.get('/api/documents/categories');
    return response.data;
  },

  // Get document by ID
  getDocumentById: async (id) => {
    const response = await axios.get(`/api/documents/${id}`);
    return response.data;
  },

  // Search documents
  searchDocuments: async (query) => {
    const response = await axios.get(`/api/documents/search`, {
      params: { query }
    });
    return response.data;
  },

  // Get documents by category
  getDocumentsByCategory: async (category) => {
    const response = await axios.get(`/api/documents/category/${category}`);
    return response.data;
  },

  // Get documents by patient
  getDocumentsByPatient: async (patientId) => {
    const response = await axios.get(`/api/documents/patient/${patientId}`);
    return response.data;
  },

  // Scan document (if hardware integration is available)
  scanDocument: async () => {
    const response = await axios.post('/api/documents/scan');
    return response.data;
  }
};

export default documentsAPI; 