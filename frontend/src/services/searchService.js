import api from './api';

export const searchPapers = (q, params = {}) => api.get('/search', { params: { q, ...params } });
