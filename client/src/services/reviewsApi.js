import { apiRequest } from './apiClient.js';

/**
 * @typedef {{ id: string, rating: number, name: string, city: string | null, text: string, verified: boolean, createdAt: string }} Review
 * @typedef {{ count: number, average: number | null, breakdown: { stars: number, count: number }[], items: Review[] }} ReviewSummary
 */

/** @returns {Promise<ReviewSummary>} */
export const getReviews = (slug, { signal } = {}) => apiRequest(`/products/${encodeURIComponent(slug)}/reviews`, { signal });

/**
 * @param {string} slug
 * @param {{ rating: number, name: string, city?: string, text: string, orderId?: string }} review
 * @returns {Promise<Review>}
 */
export const postReview = (slug, review) => apiRequest(`/products/${encodeURIComponent(slug)}/reviews`, { method: 'POST', body: review });
