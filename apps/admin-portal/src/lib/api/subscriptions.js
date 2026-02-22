import api from './http';

export const getSubscriptions = (params) => api.get('/admin/subscriptions', { params });
export const getSubscription = (id) => api.get(`/admin/subscriptions/${id}`);
export const updateSubscriptionStatus = (id, status) => api.patch(`/admin/subscriptions/${id}/status`, { status });
