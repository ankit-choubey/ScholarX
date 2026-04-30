import api from './api';

export const getAssignedPapers = () => api.get('/reviews/assigned');
export const submitReview = (data) => api.post('/reviews', data);
export const getReviewsByPaper = (paperId) => api.get(`/reviews/paper/${paperId}`);
export const updateReview = (id, data) => api.put(`/reviews/${id}`, data);
