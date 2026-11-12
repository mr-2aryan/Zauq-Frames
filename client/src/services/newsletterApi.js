import { apiRequest } from './apiClient.js';

/** @param {string} email */
export const subscribeToNewsletter = (email) => apiRequest('/newsletter', { method: 'POST', body: { email } });
