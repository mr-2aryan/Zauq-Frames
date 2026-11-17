import { apiRequest } from './apiClient.js';

/**
 * @param {{ name: string, phone: string, email?: string, topic: string, orderId?: string, message: string }} message
 * @returns {Promise<{ id: string, createdAt: string }>}
 */
export const sendContactMessage = (message) => apiRequest('/contact', { method: 'POST', body: message });
