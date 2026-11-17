/**
 * Slows down password guessing: too many wrong passwords for one account from
 * one address locks that pair for a while; a great many from anywhere locks the
 * account. Someone guessing from elsewhere can't easily lock the owner out.
 * In memory, so a restart clears it.
 */
const LOCK_AFTER = 10;
const ACCOUNT_LOCK_AFTER = 50;
const LOCK_MINUTES = 15;
const WINDOW_MS = LOCK_MINUTES * 60 * 1000;

export const LOCKED_MESSAGE = `Too many wrong passwords. Please wait ${LOCK_MINUTES} minutes and try again.`;

/** key → { count, firstAt, lockedUntil } */
const counters = new Map();

const pairKey = (email, ip) => `pair:${email}|${ip}`;
const accountKey = (email) => `account:${email}`;

function lockedUntil(key) {
  const entry = counters.get(key);
  return entry?.lockedUntil && entry.lockedUntil > Date.now() ? entry.lockedUntil : 0;
}

function hit(key, limit) {
  const now = Date.now();
  const entry = counters.get(key);
  const fresh = !entry || now - entry.firstAt > WINDOW_MS;
  const next = fresh ? { count: 1, firstAt: now, lockedUntil: 0 } : { ...entry, count: entry.count + 1 };
  if (next.count >= limit) next.lockedUntil = now + WINDOW_MS;
  counters.set(key, next);
}

export const isLockedOut = (email, ip) => Boolean(lockedUntil(pairKey(email, ip)) || lockedUntil(accountKey(email)));

export function noteFailedLogin(email, ip) {
  hit(pairKey(email, ip), LOCK_AFTER);
  hit(accountKey(email), ACCOUNT_LOCK_AFTER);
}

export const clearFailedLogins = (email, ip) => counters.delete(pairKey(email, ip));
