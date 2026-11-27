import { z } from 'zod';
import { env } from '../../config/env.js';
import { HttpError } from '../../utils/HttpError.js';
import { authService, toPublicUser } from '../auth/auth.service.js';
import { clearFailedLogins, isLockedOut, LOCKED_MESSAGE, noteFailedLogin } from '../auth/loginGuard.js';
import { hashPassword, verifyPassword } from '../auth/passwords.js';
import { ADMIN_COOKIE, clearSessionCookie, createSession, deleteSession, deleteUserSessions, findSession, readCookie, setSessionCookie } from '../auth/sessions.js';
import { usersRepository } from '../auth/users.repository.js';
import { logActivity } from './activity.js';

const WRONG_LOGIN = 'Incorrect email or password.';

/** Common passwords people pick; admins may not use them. */
const COMMON = ['password', 'passw0rd', '123456', '12345678', '123456789', '1234567890', 'qwerty', 'qwertyuiop', 'admin', 'administrator', 'letmein', 'welcome', 'iloveyou', 'pakistan', 'zauqframes', 'zauq'];

/** Admin passwords: at least 12 characters, not common, not the email, not one repeated character. */
export function adminPasswordProblem(password, email = '') {
  const lower = password.toLowerCase();
  if (password.length < 12) return 'Use at least 12 characters.';
  if (/^(.)\1+$/.test(password)) return 'Don’t repeat a single character.';
  const letters = lower.replace(/[^a-z]/g, '');
  if (COMMON.some((word) => letters === word || (letters.length <= word.length + 2 && letters.includes(word)))) return 'That password is too common. Use a few unrelated words.';
  if (/^\d+$/.test(password) || /^(?:0123456789|1234567890|9876543210)/.test(password)) return 'That password is too easy to guess. Use a few unrelated words.';
  const local = email.toLowerCase().split('@')[0];
  if (local.length >= 4 && lower.includes(local)) return 'Don’t use your email in your password.';
  return null;
}

const email = z.string().trim().toLowerCase().max(160).pipe(z.email('Please enter a valid email address.'));
export const adminLoginSchema = z.object({ email, password: z.string().min(1, 'Please enter your password.').max(200) });
export const adminPasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Please enter your current password.').max(200),
  newPassword: z.string().min(1).max(200),
});
export const newAdminSchema = z.object({
  name: z.string().trim().min(2, 'Please enter a name.').max(120),
  email,
  password: z.string().min(1).max(200),
});

/** In production the admin API answers only on the admin's own address. */
export function adminHostOnly(req, _res, next) {
  if (env.adminHost && req.hostname.toLowerCase() !== env.adminHost) return next(HttpError.notFound('Not found.'));
  return next();
}

/** Sets `req.admin` from the admin session cookie (null when not signed in as an admin). */
export async function loadAdmin(req, _res, next) {
  const token = readCookie(req, ADMIN_COOKIE);
  const session = await findSession(token, 'admin');
  const user = session ? await usersRepository.findById(session.userId) : null;
  req.admin = user?.role === 'admin' ? toPublicUser(user) : null;
  req.adminToken = req.admin ? token : null;
  next();
}

export function requireAdmin(req, _res, next) {
  if (!req.admin) return next(HttpError.unauthorized('Please sign in to the admin.'));
  return next();
}

export const adminAuth = {
  /** POST /api/admin/auth/login */
  async login(req, res) {
    const { email: address, password } = req.body;
    let user;
    try {
      user = await authService.login({ email: address, password }, req.ip);
    } catch (error) {
      await logActivity(req, { area: 'auth', action: 'sign-in failed', item: address, result: error.status ?? 500, admin: { id: null, email: address } });
      throw error;
    }
    if (user.role !== 'admin') {
      // A customer account: same answer as a wrong password, so admin emails can't be discovered.
      noteFailedLogin(address, req.ip);
      await logActivity(req, { area: 'auth', action: 'sign-in refused (not an admin)', item: address, result: 401, admin: { id: user.id, email: address } });
      throw HttpError.unauthorized(WRONG_LOGIN);
    }
    const token = await createSession(user.id, 'admin');
    setSessionCookie(res, token, 'admin');
    await logActivity(req, { area: 'auth', action: 'signed in', item: user.email, result: 200, admin: user });
    res.json({ data: { admin: user } });
  },

  /** POST /api/admin/auth/logout */
  async logout(req, res) {
    if (req.adminToken) await deleteSession(req.adminToken);
    clearSessionCookie(res, 'admin');
    if (req.admin) await logActivity(req, { area: 'auth', action: 'signed out', item: req.admin.email, result: 200 });
    res.json({ data: { admin: null } });
  },

  /** GET /api/admin/auth/me — `admin` is null when signed out. */
  async me(req, res) {
    res.json({ data: { admin: req.admin } });
  },

  /** POST /api/admin/auth/password — signs out every other session of this admin. */
  async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    const user = await usersRepository.findById(req.admin.id);
    if (isLockedOut(user.email, req.ip)) throw HttpError.tooManyRequests(LOCKED_MESSAGE);
    if (!(await verifyPassword(currentPassword, user.passwordHash))) {
      noteFailedLogin(user.email, req.ip);
      await logActivity(req, { area: 'auth', action: 'password change refused (wrong current password)', item: user.email, result: 400 });
      throw HttpError.badRequest('Please check the highlighted fields.', [{ field: 'currentPassword', message: 'That isn’t your current password.' }]);
    }
    const problem = adminPasswordProblem(newPassword, user.email);
    if (problem) throw HttpError.badRequest('Please check the highlighted fields.', [{ field: 'newPassword', message: problem }]);
    clearFailedLogins(user.email, req.ip);
    await usersRepository.update(user.id, { passwordHash: await hashPassword(newPassword), passwordChangedAt: new Date().toISOString() });
    await deleteUserSessions(user.id, req.adminToken);
    await logActivity(req, { area: 'auth', action: 'changed own password', item: user.email, result: 200 });
    res.json({ data: { changed: true } });
  },
};
