import { apiRequest } from './apiClient.js';

/**
 * Places an order. Prices are calculated by the server.
 * @param {{ customer: object, items: Array<{ sizeId: string, orientation: string, quantity: number, photoId: string, crop: { x: number, y: number } }> }} order
 */
export const createOrder = (order) => apiRequest('/orders', { method: 'POST', body: order });

/**
 * Status, history and delivery estimate — needs the phone the order was placed with.
 * @param {string} orderId e.g. `ZQ-4F9A1C7B2E`
 * @param {string} phone
 */
export const trackOrder = (orderId, phone, { signal } = {}) =>
  apiRequest(`/orders/${encodeURIComponent(orderId.trim())}/track?phone=${encodeURIComponent(phone)}`, { signal });

/** @param {string} orderId e.g. `ZQ-4F9A1C7B2E` */
export const getOrder = (orderId, { signal } = {}) =>
  apiRequest(`/orders/${encodeURIComponent(orderId)}`, { signal });
