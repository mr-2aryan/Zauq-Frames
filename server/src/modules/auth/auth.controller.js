import { ordersService } from '../orders/orders.service.js';
import { authService } from './auth.service.js';
import { clearSessionCookie, createSession, deleteSession, deleteUserSessions, setSessionCookie } from './sessions.js';

const signIn = (res, user) => setSessionCookie(res, createSession(user.id));

/** POST /api/auth/register */
export const register = async (req, res) => {
  const user = await authService.register(req.body);
  signIn(res, user);
  res.status(201).json({ data: { user } });
};

/** POST /api/auth/login */
export const login = async (req, res) => {
  const user = await authService.login(req.body, req.ip);
  if (req.sessionToken) deleteSession(req.sessionToken);
  signIn(res, user);
  res.json({ data: { user } });
};

/** POST /api/auth/logout */
export const logout = async (req, res) => {
  if (req.sessionToken) deleteSession(req.sessionToken);
  clearSessionCookie(res);
  res.json({ data: { user: null } });
};

/** GET /api/auth/me — `user` is null when signed out (not an error). */
export const me = async (req, res) => {
  res.json({ data: { user: req.user } });
};

/** PATCH /api/account/profile */
export const updateProfile = async (req, res) => {
  res.json({ data: { user: await authService.updateProfile(req.user.id, req.body) } });
};

/** POST /api/account/password — signs out every other device. */
export const changePassword = async (req, res) => {
  await authService.changePassword(req.user.id, req.body, req.ip);
  deleteUserSessions(req.user.id, req.sessionToken);
  res.json({ data: { changed: true } });
};

/** GET /api/account/orders — newest first, with status history. */
export const listOrders = async (req, res) => {
  res.json({ data: { items: await ordersService.listForCustomer(req.user.id) } });
};
