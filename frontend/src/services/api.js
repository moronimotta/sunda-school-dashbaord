import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (username, password) => api.post('/auth/register', { username, password })
};

// Members API
export const membersAPI = {
  getAll: () => api.get('/members'),
  getById: (id) => api.get(`/members/${id}`),
  create: (member) => api.post('/members', member),
  update: (id, member) => api.put(`/members/${id}`, member),
  delete: (id) => api.delete(`/members/${id}`),
  deleteAll: () => api.delete('/members'),
  uploadPDF: (file) => {
    const formData = new FormData();
    formData.append('pdf', file);
    return api.post('/members/upload-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  uploadAI: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/members/ai-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

// Attendance API
export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  getByDate: (date) => api.get(`/attendance/date/${date}`),
  create: (attendance) => api.post('/attendance', attendance),
  bulkCreate: (date, records) => api.post('/attendance/bulk', { date, records }),
  getStats: (startDate, endDate) => api.get('/attendance/stats', { 
    params: { startDate, endDate } 
  }),
  delete: (id) => api.delete(`/attendance/${id}`)
};

// Export API
export const exportAPI = {
  exportAll: (startDate, endDate, spreadsheetId, sheetName) => 
    api.post('/export/export-all', { startDate, endDate, spreadsheetId, sheetName }),
  exportDate: (date, spreadsheetId) => 
    api.post('/export/export-date', { date, spreadsheetId }),
  getStatus: () => api.get('/export/status')
};

export default api;
