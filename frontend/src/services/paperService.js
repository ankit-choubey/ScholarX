import api from './api';

export const submitPaper = (formData) => api.post('/papers', formData);

export const getMyPapers = (params = {}) => api.get('/papers/my', { params });
export const getPaperById = (id) => api.get(`/papers/${id}`);
export const updatePaper = (id, formData) => api.put(`/papers/${id}`, formData);
export const deletePaper = (id) => api.delete(`/papers/${id}`);
export const getAllPapers = (params = {}) => api.get('/papers', { params });
export const checkPlagiarism = (paperId) => api.post('/advanced/plagiarism', { paperId });
export const formatCitation = (paperId, format) => api.post('/advanced/citation', { paperId, format });
