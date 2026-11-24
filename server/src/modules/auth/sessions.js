import { createHash, randomBytes } from 'node:crypto';
import { env } from '../../config/env.js';
import { pool, query } from '../../db/pool.js';

export const SESSION_COOKIE = 'zauq_session';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Sign-in sessions: the browser keeps a random token in a cookie; the API keeps
 * only its SHA-256 hash (so a leaked sessions table can't be used to sign in),
 * in the `sessions` table — or in memory when there's no database.
 */
const hashToken = (token) => createHash('sha256').update(token).digest('hex');

/** hash → { userId, expiresAt }, when there's no database. */
const memory = new Map();

export async function createSession(userId) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = Date.now() + MAX_AGE_MS;
  if (pool) await query('insert into sessions (token_hash, user_id, expires_at) values ($1, $2, $3)', [hashToken(token), userId, new Date(expiresAt)]);
  else memory.set(hashToken(token), { userId, expiresAt });
  return token;
}

/** The session for this token, or null (also when it has expired). */
export async function findSession(token) {
  if (!token) return null;
  const key = hashToken(token);
  let session;
  if (pool) {
    const { rows } = await query('select user_id, expires_at from sessions where token_hash = $1', [key]);
    session = rows[0] ? { userId: rows[0].user_id, expiresAt: rows[0].expires_at.getTime() } : null;
  } else {
    session = memory.get(key) ?? null;
  }
  if (session && session.expiresAt < Date.now()) {
    await deleteSession(token);
    return null;
  }
  return session;
}

export async function deleteSession(token) {
  const key = hashToken(token);
  if (pool) await query('delete from sessions where token_hash = $1', [key]);
  else memory.delete(key);
}

/** Signs the user out everywhere (after a password change, say), except `keep`. */
export async function deleteUserSessions(userId, keep) {
  const kept = keep ? hashToken(keep) : '';
  if (pool) {
    await query('delete from sessions where user_id = $1 and token_hash <> $2', [userId, kept]);
    return;
  }
  for (const [key, session] of memory) {
    if (session.userId === userId && key !== kept) memory.delete(key);
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
