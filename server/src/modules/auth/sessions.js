import { randomBytes } from 'node:crypto';
import { env } from '../../config/env.js';

export const SESSION_COOKIE = 'zauq_session';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/** token → { userId, expiresAt }. In memory, like the rest of the data until a database is chosen. */
const sessions = new Map();

export function createSession(userId) {
  const token = randomBytes(32).toString('base64url');
  sessions.set(token, { userId, expiresAt: Date.now() + MAX_AGE_MS });
  return token;
}

export function findSession(token) {
  const session = token ? sessions.get(token) : null;
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return session;
}

export const deleteSession = (token) => sessions.delete(token);

/** Signs the user out everywhere (after a password change, say), except `keep`. */
export function deleteUserSessions(userId, keep) {
  for (const [token, session] of sessions) {
    if (session.userId === userId && token !== keep) sessions.delete(token);
  }
}

/** Reads one cookie from the request header (no cookie-parser needed). */
export function readCookie(req, name) {
  const header = req.headers.cookie ?? '';
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index > 0 && part.slice(0, index).trim() === name) return decodeURIComponent(part.slice(index + 1).trim());
  }
  return null;
}

const cookieOptions = { httpOnly: true, sameSite: 'lax', secure: env.isProduction, path: '/' };

export const setSessionCookie = (res, token) => res.cookie(SESSION_COOKIE, token, { ...cookieOptions, maxAge: MAX_AGE_MS });
export const clearSessionCookie = (res) => res.clearCookie(SESSION_COOKIE, cookieOptions);
