import axios from 'axios';

const fileManagementAPI = {
  // Get all folders
  getFolders: async () => {
    const response = await axios.get('/api/documents/folders');
    return response.data;
  },

  // Create new folder
  createFolder: async (folderData) => {
    const response = await axios.post('/api/documents/folders', folderData);
    return response.data;
  },

  // Get files in folder
  getFiles: async (folderId) => {
    const response = await axios.get(`/api/documents/folders/${folderId}/files`);
    return response.data;
  },

  // Upload file
  uploadFile: async (formData) => {
    const response = await axios.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Delete file
  deleteFile: async (fileId) => {
    const response = await axios.delete(`/api/documents/${fileId}`);
    return response.data;
  },

  // Delete folder
  deleteFolder: async (folderId) => {
    const response = await axios.delete(`/api/documents/folders/${folderId}`);
    return response.data;
  },

  // Download file
  downloadFile: async (fileId) => {
    const response = await axios.get(`/api/documents/${fileId}/download`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'document'); // You can set the filename here
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response.data;
  },

  // Move document
  moveDocument: async (documentId, folderId) => {
    const response = await axios.put(`/api/documents/${documentId}/move`, { folderId });
    return response.data;
  },

  // Search documents
  searchDocuments: async (keyword) => {
    const response = await axios.get(`/api/documents/search`, {
      params: { keyword }
    });
    return response.data;
  },

  // Get document details
  getDocumentDetails: async (documentId) => {
    const response = await axios.get(`/api/documents/${documentId}`);
    return response.data;
  },

  // Update document
  updateDocument: async (documentId, documentData) => {
    const response = await axios.put(`/api/documents/${documentId}`, documentData);
    return response.data;
  }
};

export default fileManagementAPI; 