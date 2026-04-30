import api from './api';

export const getAllPublications  = (params = {}) => api.get('/publications', { params });
export const getPublicationById  = (id)          => api.get(`/publications/${id}`);
export const createPublication   = (data)        => api.post('/publications', data);

// These are editor-only operations
export const updatePublication   = (id, data)    => api.put(`/publications/${id}`, data);
export const deletePublication   = (id)          => api.delete(`/publications/${id}`);

// Search publications by piggybacking on the backend's publications list filter
export const searchPublications  = (q, params)   => api.get('/publications', { params: { q, ...params } });
