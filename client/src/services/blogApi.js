import { apiRequest } from './apiClient.js';

/**
 * @typedef {{ slug: string, title: string, excerpt: string, category: string, readingMinutes: number, date: string, cover: string }} PostCard
 */

/** @returns {Promise<{ categories: string[], items: PostCard[] }>} Published posts, newest first. */
export const getPosts = ({ signal } = {}) => apiRequest('/blog', { signal });

/** @returns {Promise<PostCard & { body: object[], related: PostCard[] }>} One post, with related reading. */
export const getPost = (slug, { signal } = {}) => apiRequest(`/blog/${encodeURIComponent(slug)}`, { signal });
