import { apiRequest } from './apiClient.js';

/** The session lives in an httpOnly cookie the browser sends with every request. */

/** @returns {Promise<{ user: User | null }>} */
export const getCurrentUser = ({ signal } = {}) => apiRequest('/auth/me', { signal });

/** @param {{ email: string, password: string }} credentials */
export const signIn = (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials });

/** @param {{ name: string, email: string, password: string, phone?: string }} details */
export const signUp = (details) => apiRequest('/auth/register', { method: 'POST', body: details });

export const signOut = () => apiRequest('/auth/logout', { method: 'POST' });

/** @param {{ name: string, phone?: string, address?: string, city?: string }} profile */
export const updateProfile = (profile) => apiRequest('/account/profile', { method: 'PATCH', body: profile });

/** @param {{ currentPassword: string, newPassword: string }} passwords */
export const changePassword = (passwords) => apiRequest('/account/password', { method: 'POST', body: passwords });

/** The signed-in customer's orders, newest first. */
export const getMyOrders = ({ signal } = {}) => apiRequest('/account/orders', { signal });

/**
 * @typedef {{ id: string, name: string, email: string, phone?: string, address: string, city: string, createdAt: string }} User
 */
