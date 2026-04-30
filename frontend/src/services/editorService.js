import api from './api';

export const getOverview = () => api.get('/editor/overview');
export const getReviewers = () => api.get('/editor/reviewers');
export const assignReviewers = (data) => api.post('/editor/assign', data);
export const makeDecision = (paperId, data) => api.put(`/editor/decision/${paperId}`, data);
export const getAnalytics = () => api.get('/analytics');
