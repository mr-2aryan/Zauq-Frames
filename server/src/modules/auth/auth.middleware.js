import { HttpError } from '../../utils/HttpError.js';
import { authService } from './auth.service.js';
import { findSession, readCookie, SESSION_COOKIE } from './sessions.js';

/** Sets `req.user` (or null) from the session cookie, for every API request. */
export async function loadUser(req, _res, next) {
  const token = readCookie(req, SESSION_COOKIE);
  const session = findSession(token);
  req.sessionToken = session ? token : null;
  req.user = session ? await authService.findById(session.userId) : null;
  next();
}

/** For account-only routes. */
export function requireUser(req, _res, next) {
  if (!req.user) return next(HttpError.unauthorized('Please sign in to continue.'));
  return next();
}
