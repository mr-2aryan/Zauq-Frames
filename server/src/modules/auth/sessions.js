import { createHash, randomBytes } from 'node:crypto';
import { env } from '../../config/env.js';
import { pool, query } from '../../db/pool.js';

/**
 * Sign-in sessions: the browser keeps a random token in a cookie; the API keeps
 * only its SHA-256 hash (so a leaked sessions table can't be used to sign in),
 * in the `sessions` table — or in memory when there's no database.
 *
 * Two kinds, each with its own cookie, and one can never stand in for the other:
 * - shop:  a customer's sign-in, 30 days;
 * - admin: the studio's admin, 12 hours at most and ended after an hour unused.
 */
export const SCOPES = Object.freeze({
  shop: { cookie: 'zauq_session', maxAgeMs: 30 * 24 * 60 * 60 * 1000, idleMs: 0, sameSite: 'lax' },
  admin: { cookie: 'zauq_admin', maxAgeMs: 12 * 60 * 60 * 1000, idleMs: 60 * 60 * 1000, sameSite: 'strict' },
});
export const SESSION_COOKIE = SCOPES.shop.cookie;
export const ADMIN_COOKIE = SCOPES.admin.cookie;

/** Only note activity this often (not on every request). */
const TOUCH_EVERY_MS = 60 * 1000;

const hashToken = (token) => createHash('sha256').update(token).digest('hex');

/** hash → { userId, scope, expiresAt, lastSeenAt }, when there's no database. */
const memory = new Map();

export async function createSession(userId, scope = 'shop') {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = Date.now() + SCOPES[scope].maxAgeMs;
  if (pool) {
    await query('insert into sessions (token_hash, user_id, expires_at, scope) values ($1, $2, $3, $4)', [hashToken(token), userId, new Date(expiresAt), scope]);
  } else {
    memory.set(hashToken(token), { userId, scope, expiresAt, lastSeenAt: Date.now() });
  }
  return token;
}

/** The session for this token and scope, or null (also when it has expired or gone unused too long). */
export async function findSession(token, scope = 'shop') {
  if (!token) return null;
  const key = hashToken(token);
  let session;
  if (pool) {
    const { rows } = await query('select user_id, expires_at, last_seen_at from sessions where token_hash = $1 and scope = $2', [key, scope]);
    session = rows[0] ? { userId: rows[0].user_id, scope, expiresAt: rows[0].expires_at.getTime(), lastSeenAt: rows[0].last_seen_at.getTime() } : null;
  } else {
    const stored = memory.get(key);
    session = stored?.scope === scope ? stored : null;
  }
  if (!session) return null;

  const now = Date.now();
  const { idleMs } = SCOPES[scope];
  if (session.expiresAt < now || (idleMs && now - session.lastSeenAt > idleMs)) {
    await deleteSession(token);
    return null;
  }
  if (now - session.lastSeenAt > TOUCH_EVERY_MS) {
    if (pool) await query('update sessions set last_seen_at = now() where token_hash = $1', [key]);
    else session.lastSeenAt = now;
  }
  return session;
}

export async function deleteSession(token) {
  const key = hashToken(token);
  if (pool) await query('delete from sessions where token_hash = $1', [key]);
  else memory.delete(key);
}

/** Signs the user out everywhere, shop and admin (after a password change, say), except `keep`. */
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

const cookieOptions = (scope) => ({ httpOnly: true, sameSite: SCOPES[scope].sameSite, secure: env.isProduction, path: '/' });

export const setSessionCookie = (res, token, scope = 'shop') =>
  res.cookie(SCOPES[scope].cookie, token, { ...cookieOptions(scope), maxAge: SCOPES[scope].maxAgeMs });
export const clearSessionCookie = (res, scope = 'shop') => res.clearCookie(SCOPES[scope].cookie, cookieOptions(scope));
