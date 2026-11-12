import { apiRequest } from './apiClient.js';

/**
 * Uploads a customer photo.
 * @param {File} file
 * @returns {Promise<{ id: string, url: string, originalName: string, mimeType: string, size: number }>}
 */
export function uploadPhoto(file, { signal } = {}) {
  const formData = new FormData();
  formData.append('photo', file);
  return apiRequest('/uploads', { method: 'POST', body: formData, signal });
}
