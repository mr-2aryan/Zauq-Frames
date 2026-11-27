import { HttpError } from '../utils/HttpError.js';

/**
 * A small in-memory rate limit per client address (enough for one server).
 * @param {{ windowMs: number, max: number, message?: string }} options
 */
export function rateLimit({ windowMs, max, message = 'Too many attempts. Please wait a few minutes and try again.' }) {
  const hits = new Map(); // ip -> { count, resetAt }
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of hits) if (entry.resetAt <= now) hits.delete(ip);
  }, windowMs).unref();

  return (req, _res, next) => {
    const now = Date.now();
    const entry = hits.get(req.ip);
    const current = !entry || entry.resetAt <= now ? { count: 0, resetAt: now + windowMs } : entry;
    current.count += 1;
    hits.set(req.ip, current);
    return current.count > max ? next(HttpError.tooManyRequests(message)) : next();
  };
}
