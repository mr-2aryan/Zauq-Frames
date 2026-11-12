import { apiRequest } from './apiClient.js';

/**
 * @typedef {{
 *   slug: string, name: string, collection: string, collectionName: string, summary: string,
 *   image: string, featured: boolean, badge: string | null,
 *   currency: string, price: number, salePrice: number,
 * }} ProductSummary
 *
 * @typedef {ProductSummary & { description: string, images: string[], related: ProductSummary[] }} Product
 * @typedef {{ slug: string, name: string, shortName: string, description: string, image: string, productCount: number }} Collection
 */

const toQuery = (params) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== false) query.set(key, String(value));
  });
  const text = query.toString();
  return text ? `?${text}` : '';
};

/**
 * @param {{ collection?: string, q?: string, sort?: string, featured?: boolean, limit?: number }} params
 * @returns {Promise<{ items: ProductSummary[], total: number }>}
 */
export const listProducts = (params = {}, { signal } = {}) => apiRequest(`/products${toQuery(params)}`, { signal });

/** @returns {Promise<Product>} */
export const getProduct = (slug, { signal } = {}) => apiRequest(`/products/${encodeURIComponent(slug)}`, { signal });

/** @returns {Promise<Collection[]>} */
export const listCollections = ({ signal } = {}) => apiRequest('/collections', { signal });
