/**
 * Thin fetch wrapper for the Zauq API.
 *
 * Success responses are `{ data }` and resolve to `data`.
 * Error responses are `{ error: { message, details } }` and throw an `ApiError`.
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

const UNREACHABLE_MESSAGE = 'We could not reach the server. Please check your connection and try again.';

export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {{ status?: number, details?: unknown }} [options]
   */
  constructor(message, { status = 0, details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/** Turns an API-relative path such as `/uploads/abc.jpg` into a usable URL. */
export function resolveAssetUrl(path) {
  if (!path || /^(https?:|blob:|data:)/.test(path)) return path;
  return `${API_BASE_URL}${path}`;
}

/**
 * @param {string} path Path under `/api`, e.g. `/frames/catalog`
 * @param {{ method?: string, body?: unknown, signal?: AbortSignal, headers?: Record<string, string> }} [options]
 */
export async function apiRequest(path, { method = 'GET', body, signal, headers } = {}) {
  const isFormData = body instanceof FormData;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api${path}`, {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && !isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body === undefined || isFormData ? body : JSON.stringify(body),
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new ApiError(UNREACHABLE_MESSAGE);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    // No JSON body on a 5xx usually means the API itself is down (e.g. the dev proxy failed).
    const fallback = response.status >= 500 ? UNREACHABLE_MESSAGE : `Request failed (${response.status}).`;
    throw new ApiError(payload?.error?.message ?? fallback, {
      status: response.status,
      details: payload?.error?.details,
    });
  }

  return payload?.data;
}
