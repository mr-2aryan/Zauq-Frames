import { apiRequest } from './apiClient.js';

/**
 * @typedef {{ id: string, width: number, height: number, price: number, salePrice: number, description: string }} FrameSize
 * @typedef {{
 *   currency: string, deliveryFee: number, finish: string, orientations: string[],
 *   promotion: { percentOff: number, label: string }, sizes: FrameSize[],
 *   productPrice: { price: number, salePrice: number },
 * }} FrameCatalog
 */

/** @returns {Promise<FrameCatalog>} */
export const getFrameCatalog = ({ signal } = {}) => apiRequest('/frames/catalog', { signal });
